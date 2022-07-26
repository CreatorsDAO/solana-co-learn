---
ics: '2'
title: 客户端语义
stage: 草案
category: IBC/TAO
kind: 接口
requires: 23, 24
required-by: '3'
author: Juwoon Yun <joon@tendermint.com>, Christopher Goes <cwgoes@tendermint.com>
created: '2019-02-25'
modified: '2020-01-13'
---

## 概要

该标准规定了实现跨链通信（IBC）协议的状态机的共识算法必须满足的属性。这些属性对更高层协议抽象中的有效安全的验证而言是必需的。IBC 中用于验证远程状态机的状态更新的算法称为“合法性判定”。将合法性判定与一个可信的状态（例如：一种被验证者认可的状态）组合在一起，即实现了远程状态机基于本地状态机的“轻客户端”（“轻客户端”经常简称为“客户端”）功能。 除了验证状态的更新，每个轻客户端也有能力通过“不良行为判定”来检测不良行为。

除了上述属性，IBC 未规定其它对于状态机与共识算法的内部操作。一个状态机可能是一个使用密钥进行签名的独立的进程（称为单机客户端），可能是一组协同签名的进程，可能是达成的拜占廷容错共识算法（如 Tendermint）的相互独立的多个进程，或将来 IBC 规定的其他方式的状态机；一个状态机是由它的轻客户端验证功能和不良行为检测逻辑定义的。

该标准还规定了如何注册轻客户端功能，如何存储和更新轻客户端的数据。 所存储的客户端实例允许第三方参与者进行检视，例如，用户检查状态机的状态并确定是否发送 IBC 数据包。

### 动机

在 IBC 协议中，参与者（可能是终端用户、链下进程或状态机的一个模块）需要能够对另一台状态机（例如：远程状态机）的状态更新进行验证。这要求参与者只能接收与远程状态机共识算法一致的状态更新。远程状态机的轻客户端是能够让参与者验证该状态机状态更新的算法。需要注意的是，轻客户端的验证通常不会覆盖完整的状态转换逻辑（因为这就等同于重新完整实现了一台状态机），但在特定情况下，客户端可以选择验证部分状态转换。该标准正式规定了轻客户端模型和需求。因此，只要提供能满足上述需求的轻客户端算法，IBC 协议就易于被集成到运行不同共识算法的新状态机中。

IBC 协议可用于与概率最终性共识算法进行交互。在这种情况下，不同的应用程序可能需要不同的合法性判定。对于概率最终性共识，合法性判定由最终性阈值定义（例如，阈值定义了在某个区块之后需要产生多少区块才具有最终性）。因此，客户端可以充当其他客户端的*阈值视图*：一个*只写*客户端可用于存储状态更新（但无法验证它们），而许多具有不同最终性阈值(状态更新能被认定为达到最终性的确认深度值)的*只读*客户端则用于验证状态更新。

客户端协议还应该支持第三方引荐。例如：A，B和C是三台不同的状态机；Alice是A的一个模块，Bob是B的一个模块，Carol是C的一个模块。如果Alice认识Bob和Carol，但Bob只认识Alice而不认识Carol。这样，Alice 可以利用现有的通道传送给 Bob 用于和 Carol 通信的标准序列化的合法性判定，然后 Bob 可以通过合法性判定与 Carol 建立连接和通道并直接通信。 如有必要，在 Bob 进行连接尝试之前，Alice 还可以向 Carol 传送 Bob 的合法性判定，使得 Carol 获悉并接受传入的请求。

也应当提供构建客户端的接口，这样就可以安全的提供自定义验证逻辑并在运行时定义定制的客户端，只要基础状态机可以提供适当的 gas 计量机制来为计算和存储收费。例如，在支持 WASM 执行的主机状态机上，可以在创建客户端实例时将合法性判定和不良行为判定作为可执行的 WASM 函数提供。

### 定义

- `get`, `set`, `Path`, 和 `Identifier` 在 [ICS 24](../ics-024-host-requirements) 中定义。

- `CommitmentRoot` 与 [ICS 23](../ics-023-vector-commitments) 中的定义相同，它必须为下游逻辑提供一种低成本的方式，以验证键值对是否包含在特定高度的状态中。

- `ConsensusState` 是表示合法性判定状态的不透明类型。`ConsensusState` 必须能够验证相关共识算法所达成一致的状态更新，同时必须以标准方式实现可序列化，以便第三方（例如远程状态机）检查状态机是否存储了特定的共识状态。它最终必须能被使用它的状态机检视，比如状态机可以查看某个过去高度的共识状态。

- `ClientState` 是表示一个客户端状态的不透明类型。 `ClientState` 必须公开查询函数，以验证处于特定高度的状态下是否包含键值对，并且能够获取当前的共识状态。

### 所需属性

轻客户端必须提供安全的算法，使用现有的`ConsensusState`来验证其他链的标准区块头 。然后，更高级别的抽象将能够验证存储在`ConsensusState`中的`CommitmentRoot`的状态的子组件，并确定是由其他链的共识算法提交的。

合法性判定应反映正在运行相应的共识算法的全节点的行为。给定`ConsensusState`和消息列表，如果一个全节点接受由`Commit`生成的新`Header` ，那么轻客户端也必须接受它，如果一个全节点拒绝它，那么轻客户端也必须拒绝它。

由于轻客户端不是重新执行整个消息记录，因此在出现共识不良行为的情况下有可能轻客户端的行为和全节点不同。在这种情况下，可生成一个用来证明合法性判定和全节点之间的差异的不良行为证明，并提交给链，以便链可以安全的停用轻客户端，使过去的状态根无效，并等待更高级别的干预。

## 技术规范

本规范概述了每种*客户端类型*必须定义的内容。客户端类型是操作轻客户端所需的数据结构、初始化逻辑、合法性判定和不良行为判定的一组定义。实现 IBC 协议的状态机可以支持任意数量的客户端类型，并且每种客户端类型都可以用不同的初始共识状态进行实例化，以跟踪不同的共识实例。为了在两个状态机之间建立连接（参见[ICS 3](../ics-003-connection-semantics) ），每个状态机都必须支持对应于另一个状态机的共识算法的客户端类型。

特定的客户端类型应在本规范之后的版本中定义，且该仓库中应存在一个标准客户端类型列表。实现了 IBC 协议的状态机应遵守这些客户端类型，但他们也可以选择仅支持一个子集。

### 数据结构

#### 共识状态

`ConsensusState` 是一个客户端类型定义的不透明数据结构，合法性判定用其验证新的提交和状态根。该结构可能包含共识过程产生的最后一次提交，包括签名和验证人集合元数据。

`ConsensusState` 必须由一个 `Consensus`实例生成，该实例为每个 `ConsensusState`分配唯一的高度（这样，每个高度恰好具有一个关联的共识状态）。如果没有一样的加密承诺根，则同一链上的两个`ConsensusState`不应具有相同的高度。此类事件称为“矛盾行为”，必须归类为不良行为。 如果发生这种情况，则应生成并提交证明，以便可以冻结客户端，并根据需要使先前的状态根无效。

区块链的 `ConsensusState` 必须具有标准序列化，以便其他链可以检查存储的共识状态是否与另一个共识状态相等（请参见 [ICS 24](../ics-024-host-requirements) 键表）。

```typescript
type ConsensusState = bytes
```

`ConsensusState` 必须存储在下面定义的指定的键下，这样其他链可以验证一个特定的共识状态是否已存储。

`ConsensusState` 必须定义一个 `getTimestamp()` 方法，该方法返回与该共识状态关联的时间戳：

```typescript
type getTimestamp = ConsensusState => uint64
```

#### 区块头

`Header` 是由客户端类型定义的不透明数据结构，它提供用来更新`ConsensusState`的信息。可以将区块头提交给关联的客户端以更新存储的`ConsensusState` 。区块头可能包含一个高度、一个证明、一个加密承诺根，还有可能的合法性判定更新。

```typescript
type Header = bytes
```

#### 共识

`Consensus` 是一个生成 `Header` 的函数，负责接受之前的 `ConsensusState` 和消息并返回结果。

```typescript
type Consensus = (ConsensusState, [Message]) => Header
```

### 区块链

区块链是一个生成有效`Header`的共识算法。它从创世`ConsensusState`开始通过各种消息生成一个唯一的区块头列表。

`Blockchain` 被定义为

```typescript
interface Blockchain {
  genesis: ConsensusState
  consensus: Consensus
}
```

其中

- `Genesis`是一个创世`ConsensusState`
- `Consensus`是一个生成区块头的函数

从`Blockchain`生成的区块头应满足以下条件：

1. 每个`Header`对应的直接子区块不能超过一个

- 满足条件：最终性和安全性
- 可能违反的场景：验证人双重签名，链重组（中本聪共识）

1. 每个`Header`最终必须至少有一个直接子区块

- 满足条件：活跃性，轻客户端验证程序连续性
- 可能的违规场景：同步暂停，不兼容的硬分叉

1. 每个`Header`必须由`Consensus`生成，以确保有效的状态转换

- 满足条件：正确生成区块；状态机状态正确
- 可能的违规场景：不变性被破坏，超过多数验证人共谋

除非区块链满足以上所有条件，否则 IBC 协议可能无法按预期工作：链可能会收到多个冲突数据包、可能无法从超时事件中恢复，或可能会窃取用户的资产等。

合法性判定的合法性取决于`Consensus` 的安全模型。例如， `Consensus`也可以是受一个被信任的运营者管理的 PoA（proof of authority）共识，或质押价值不足的 PoS（proof of stake）共识。在这种情况下，安全假设可能被破坏， `Consensus`与合法性判定的关联就不复存在，并且合法性判定的行为变得不可定义。此外， `Blockchain`可能不再满足上述要求，这将导致区块链与 IBC 协议不再兼容。在这些导致故障的情况下，可生成一个不良行为证明并提交给包含客户端的区块链，以安全的冻结轻客户端，并防止之后的 IBC 数据包被中继。

#### 合法性判定

合法性判定是由一种客户端类型定义的一个不透明函数，用来根据当前`ConsensusState`验证 `Header` 。使用合法性判定应该比通过`Header` 和一系列网络消息进行完全共识算法重放的计算效率高很多。

合法性判定和客户端状态更新逻辑是合并在一个单独的 `checkValidityAndUpdateState`类型中的，它的定义如下：

```typescript
type checkValidityAndUpdateState = (Header) => Void
```

`checkValidityAndUpdateState` 在输入区块头无效的情况下必须抛出异常。

如果给定的区块头有效，客户端必须改变内部状态来存储当前确认的共识根，以及更新必要的签名权威跟踪（例如对验证人集合的更新）以供后续的合法性判定调用。

客户端的合法性判定可能具有时效敏感性，因此，如果一段时间内（例如三周的解除绑定时间）都未提供区块头，将无法再更新客户端。在这种情况下，可以允许一个被许可的实体，例如链治理系统或可信多重签名介入，以解冻冻结的客户端并提供新的正确区块头。

#### 不良行为判定

一个不良行为判定是由一种客户端类型定义的不透明函数，用于检查数据是否对共识协议构成违规。可能是出现两个拥有不同状态根但在同一个区块高度的签名的区块头、一个包含无效状态转换的签名的区块头或其他由共识算法定义的不良行为的证据。

不良行为判定和客户端状态更新逻辑是合并在一个单独的`checkMisbehaviourAndUpdateState`类型中的，它的定义如下：

```typescript
type checkMisbehaviourAndUpdateState = (bytes) => Void
```

`checkMisbehaviourAndUpdateState` 在给定不良行为证据无效的情况下必须抛出异常。

如果一个不良行为是有效的，客户端还必须根据不良行为的性质去更改内部状态，来标记先前认为有效的区块高度为无效。

一旦检测到不良行为，客户端应该被冻结，之后未来的任何更新都不能被提交。诸如链治理系统或可信多重签名之类的被许可的实体可能被允许干预，以解冻冻结的客户端并提供新的正确的区块头。

#### 高度

`Height`是一种由客户端定义的不透明的数据结构。 它必须是一种部分排序的集合，并提供对比的功能接口。

```typescript
type Height
```

```typescript
enum Ord {
  LT
  EQ
  GT
}

type compare = (h1: Height, h2: Height) => Ord
```

一个高度小于（`LT`），等于（`EQ`），或者大于（`GT`）另一个高度。

在本规范中，`>=`, `>`, `===`, `<`, `<=` 被定义为`compare`的别名。

高度类型必须有一个零高度，被称为`0`， 此高度小与所有其它的高度。

#### 客户端状态

`ClientState`是由一种客户端类型定义的不透明数据结构。它可以保留任意的内部状态去追踪已经被验证过的状态根和发生过的不良行为。

轻客户端是表现为不透明的——不同的共识算法可以定义不同的轻客户端更新算法，但是轻客户端必须对 IBC 处理程序公开一组通用的查询函数。

```typescript
type ClientState = bytes
```

客户类型必须定义一个方法用提供的共识状态初始化一个客户端状态，并根据情况写入到内部状态中。

```typescript
type initialise = (consensusState: ConsensusState) => ClientState
```

客户端类型必须定义一种方法来获取当前高度（最近验证的区块头的高度）。

```typescript
type latestClientHeight = (
  clientState: ClientState)
  => Height
```

#### 承诺证明

`CommitmentProof` 是根据 [ICS 23](../ics-023-vector-commitments) 由一种客户端类型定义的不透明数据结构。它用于验证处于特定最终高度（必须与特定承诺根相关联）的状态中是否包含特定键值对。

#### 状态验证

客户端类型必须定义一系列函数去对客户端追踪的状态机的内部状态进行验证。内部实现细节可能存在差异（例如，一个回环客户端可以直接读取状态信息且不需要提供证明）。

- `delayPeriodTime`：该变量表示一个区块头被验证之后与数据包被处理前必须间隔的最短时间；该变量随着数据包被传给数据包相关的验证方法。
- `delayPeriodBlocks`： 该变量是一个区块头被验证之后与数据包被处理前必须间隔的以区块为单位的时间段的数值；该变量随着数据包被传给数据包相关的验证方法。

##### 所需函数：

`verifyClientConsensusState` 验证存储在目标状态机上的特定客户端的共识状态的证明。

```typescript
type verifyClientConsensusState = (
  clientState: ClientState,
  height: Height,
  proof: CommitmentProof,
  clientIdentifier: Identifier,
  consensusStateHeight: Height,
  consensusState: ConsensusState)
  => boolean
```

`verifyConnectionState` 验证存储在目标状态机上的特定连接端的连接状态的证明。

```typescript
type verifyConnectionState = (
  clientState: ClientState,
  height: Height,
  prefix: CommitmentPrefix,
  proof: CommitmentProof,
  connectionIdentifier: Identifier,
  connectionEnd: ConnectionEnd)
  => boolean
```

`verifyChannelState` 验证在存储在目标状态机上的指定通道端，特定端口下的的通道状态的证明。

```typescript
type verifyChannelState = (
  clientState: ClientState,
  height: Height,
  delayPeriodTime: uint64,
  delayPeriodBlocks: uint64,
  prefix: CommitmentPrefix,
  proof: CommitmentProof,
  portIdentifier: Identifier,
  channelIdentifier: Identifier,
  channelEnd: ChannelEnd)
  => boolean
```

`verifyPacketData`验证在指定的端口，指定的通道和指定的序号的传出数据包承诺的证明。

```typescript
type verifyPacketData = (
  clientState: ClientState,
  height: Height,
  delayPeriodTime: uint64,
  delayPeriodBlocks: uint64,
  prefix: CommitmentPrefix,
  proof: CommitmentProof,
  portIdentifier: Identifier,
  channelIdentifier: Identifier,
  sequence: uint64,
  data: bytes)
  => boolean
```

`verifyPacketAcknowledgement` 在指定的端口，指定的通道和指定的序号的传入数据包的回执的证明。

```typescript
type verifyPacketAcknowledgement = (
  clientState: ClientState,
  height: Height,
  delayPeriodTime: uint64,
  delayPeriodBlocks: uint64,
  prefix: CommitmentPrefix,
  proof: CommitmentProof,
  portIdentifier: Identifier,
  channelIdentifier: Identifier,
  sequence: uint64,
  acknowledgement: bytes)
  => boolean
```

`verifyPacketAcknowledgementAbsence` 验证在指定的端口、指定的通道和指定的序号的未收到传入数据包回执的证明。

```typescript
type verifyPacketAcknowledgementAbsence = (
  clientState: ClientState,
  height: Height,
  delayPeriodTime: uint64,
  delayPeriodBlocks: uint64,
  prefix: CommitmentPrefix,
  proof: CommitmentProof,
  portIdentifier: Identifier,
  channelIdentifier: Identifier,
  sequence: uint64)
  => boolean
```

`verifyNextSequenceRecv` 验证在指定端口上和指定通道接收的下一个序号的证明。

```typescript
type verifyNextSequenceRecv = (
  clientState: ClientState,
  height: Height,
  delayPeriodTime: uint64,
  delayPeriodBlocks: uint64,
  prefix: CommitmentPrefix,
  proof: CommitmentProof,
  portIdentifier: Identifier,
  channelIdentifier: Identifier,
  nextSequenceRecv: uint64)
  => boolean
```

`verifyMembership`是一个通用的验证方法，可以验证一个给定 `CommitmentPath`在某个高度的存在性。 该方法的调用者必须通过一个`CommitmentPrefix`和一个标准化的路径 ([ICS 24](../ics-024-host-requirements/README.md#path-space))构建一个完整的`CommitmentPath`。如果调用者要求延时处理，他可以传入一个非零的`delayPeriodTime` 或者 `delayPeriodBlocks`。如果延时不是必须的，调用者传入的`delayPeriodTime` 和 `delayPeriodBlocks`的值都必须是0,这使得客户端可以不强制延时验证。

```typescript
type verifyMembership = (
  clientState: ClientState,
  height: Height,
  delayPeriodTime: uint64,
  delayPeriodBlocks: uint64,
  proof: CommitmentProof,
  path: CommitmentPath,
  value: bytes)
  => boolean
```

`verifyNonMembership`是一个通用的验证方法，可以验证一个给定 `CommitmentPath`在某个高度的缺失。 该方法的调用者必须通过一个`CommitmentPrefix`和一个标准化的路径 ([ICS 24](../ics-024-host-requirements/README.md#path-space))构建一个完整的`CommitmentPath`。如果调用者要求延时处理，他可以传入一个非零的`delayPeriodTime` 或者 `delayPeriodBlocks`。如果延时不是必须的，调用者传入的`delayPeriodTime` 和 `delayPeriodBlocks`的值都必须是0,这使得客户端可以不强制延时验证。

```typescript
type verifyNonMembership = (
  clientState: ClientState,
  height: Height,
  delayPeriodTime: uint64,
  delayPeriodBlocks: uint64,
  proof: CommitmentProof,
  path: CommitmentPath)
  => boolean
```

#### 查询接口

##### 链信息查询

假定这些查询端点是由与特定客户端关联的链的节点通过 HTTP 或等效的 RPC API 公开的。

链必须定义 `queryHeader`，并由特定客户端验证，而且应允许按高度检索区块头。假定此端点是不受信任的。

```typescript
type queryHeader = (height: Height) => Header
```

链必须定义 `queryChainConsensusState`，并由特定客户端验证，以允许检索当前共识状态，该状态可用于构建新客户端。以这种方式使用时，返回的 `ConsensusState` 必须由查询实体手动确认，因为它是主观的。假定此端点是不受信任的。 `ConsensusState` 的确切性质可能因客户端类型而异。

```typescript
type queryChainConsensusState = (height: Height) => ConsensusState
```

请注意，按高度检索过去的共识状态（而不仅仅是当前的共识状态）会很方便，但不是必需的。

`queryChainConsensusState` 还可以返回创建客户端所需的其他数据，例如某些权益证明安全模型的“解除绑定期”。该数据也必须由查询实体进行验证。

##### 链上状态查询

该规范定义了一个通过标识符查询客户端状态的函数。

```typescript
function queryClientState(identifier: Identifier): ClientState {
  return privateStore.get(clientStatePath(identifier))
}
```

`ClientState` 类型应该公开其最新的已验证高度（如果需要，可以再使用 `queryConsensusState` 获取其共识状态）。

```typescript
type latestHeight = (state: ClientState) => Height
```

客户端类型应该定义以下标准化查询函数，以允许中继器和其他链下实体以标准API和链上状态进行对接。

`queryConsensusState` 允许按高度检索存储的共识状态。

```typescript
type queryConsensusState = (
  identifier: Identifier,
  height: Height
) => ConsensusState
```

##### 证明的构造

每个客户端类型都应该定义一些函数，以允许中继器构造客户端状态验证算法所需的证明。构造方法可能采用不同的形式，具体取决于客户端类型。例如，Tendermint 客户端的证明可能与存储查询的键值数据一起返回，而单机客户端证明可能需要在单机上以交互式询问的方式构造（因为需要用户签名消息）。这些函数可以由通过 RPC 到全节点的外部查询以及本地计算或验证构成。

```typescript
type queryAndProveClientConsensusState = (
  clientIdentifier: Identifier,
  height: Height,
  prefix: CommitmentPrefix,
  consensusStateHeight: Height) => ConsensusState, Proof

type queryAndProveConnectionState = (
  connectionIdentifier: Identifier,
  height: Height,
  prefix: CommitmentPrefix) => ConnectionEnd, Proof

type queryAndProveChannelState = (
  portIdentifier: Identifier,
  channelIdentifier: Identifier,
  height: Height,
  prefix: CommitmentPrefix) => ChannelEnd, Proof

type queryAndProvePacketData = (
  portIdentifier: Identifier,
  channelIdentifier: Identifier,
  height: Height,
  prefix: CommitmentPrefix,
  sequence: uint64) => []byte, Proof

type queryAndProvePacketAcknowledgement = (
  portIdentifier: Identifier,
  channelIdentifier: Identifier,
  height: Height,
  prefix: CommitmentPrefix,
  sequence: uint64) => []byte, Proof

type queryAndProvePacketAcknowledgementAbsence = (
  portIdentifier: Identifier,
  channelIdentifier: Identifier,
  height: Height,
  prefix: CommitmentPrefix,
  sequence: uint64) => Proof

type queryAndProveNextSequenceRecv = (
  portIdentifier: Identifier,
  channelIdentifier: Identifier,
  height: Height,
  prefix: CommitmentPrefix) => uint64, Proof
```

##### 实现策略

###### 回环

一个本地状态机的回环客户端仅需要读取本地状态，其必须具有访问权限。

###### 简单签名

具有已知公钥的单机状态机的客户端检查由该本地状态机发送的消息的签名，这些消息作为`Proof`参数提供。 `height`参数可以用作重放保护随机数。

这种方式里也可以使用多重签名或门限签名方案。

###### 代理客户端

代理客户端验证的是目标状态机的代理状态机的证明。通过包含首先是一个代理状态机上客户端状态的证明，然后是目标状态机的子状态相对于代理计算机上的客户端状态的证明。这使代理客户端可以避免存储和跟踪目标状态机本身的共识状态，但是要以代理状态机正确性的安全假设为代价。

###### 默克尔状态树

对于具有默克尔状态树的状态机的客户端，可以通过调用the [ICS-23](../ics-023-vector-commitments/README.md)`verifyMembership`或`verifyNonMembership`来实现这些功能。使用经过验证的存储在`ClientState`中的默克尔根，按照 [ICS 23](../ics-023-vector-commitments) 验证处于特定高度的状态中特定键/值对是否存在。

```typescript
type verifyMembership = (ClientState, Height, CommitmentProof, Path, Value) => boolean
```

```typescript
type verifyNonMembership = (ClientState, Height, CommitmentProof, Path) => boolean
```

### 子协议

IBC 处理程序必须实现以下定义的函数。

#### 标识符验证

客户端存储在唯一的`Identifier`前缀下。 本ICS不要求以特定方式生成客户端标识符，仅要求它们是唯一的即可。但是，如果需要，可以限制`Identifier`的空间。可能需要提供下面的验证函数`validateClientIdentifier` 。

```typescript
type validateClientIdentifier = (id: Identifier) => boolean
```

如果没有提供以上函数，默认的`validateClientIdentifier`会永远返回`true` 。

##### 利用过去的状态根

为了避免客户端更新（更改状态根）与握手中携带证明的交易或数据包收据之间的竞态条件，许多 IBC 处理程序允许调用方指定一个之前的状态根作为参考，这类 IBC 处理程序必须确保它们对调用者传入的区块高度执行任何必要的检查，以确保逻辑上的正确性。

#### 创建

通过调用`createClient`附带特定的标识符和初始化共识状态来创建一个客户端。

```typescript
function createClient(
  id: Identifier,
  clientType: ClientType,
  consensusState: ConsensusState) {
    abortTransactionUnless(validateClientIdentifier(id))
    abortTransactionUnless(privateStore.get(clientStatePath(id)) === null)
    abortSystemUnless(provableStore.get(clientTypePath(id)) === null)
    clientType.initialise(consensusState)
    provableStore.set(clientTypePath(id), clientType)
}
```

#### 查询

可以通过标识符查询客户端共识状态和客户端内部状态，但是必须被查询的特定路径应由每种客户端类型定义。

#### 更新

客户端的更新是通过提交新的`Header`来完成的。`Identifier`用于指向逻辑将被更新的客户端状态。 当使用`ClientState`的合法性判定和`ConsensusState`验证新的`Header`时，客户端必须相应的更新其内部状态，还可能更新最终性承诺根和`ConsensusState`中的签名权威逻辑。

如果一个客户端无法继续更新（例如，如果超过了信任期），则将不能通过与该客户端关联的连接和通道再发送任何数据包，或者使在传输过程中的任何数据包超时（因为无法再验证目标链上的高度和时间戳）。必须进行手动干预才能重置客户端状态或将连接和通道迁移到另一个客户端。无法安全的完全自动完成此操作，但是实施 IBC 的链可以选择允许治理机制执行这些操作（甚至可能操作多签或合约中的单个客户端/连接/通道）。

```typescript
function updateClient(
  id: Identifier,
  header: Header) {
    clientType = provableStore.get(clientTypePath(id))
    abortTransactionUnless(clientType !== null)
    clientState = privateStore.get(clientStatePath(id))
    abortTransactionUnless(clientState !== null)
    clientType.checkValidityAndUpdateState(clientState, header)
}
```

#### 不良行为

如果客户端检测到不良行为的证据，则会发出警报，比如说可以使先前有效的状态根变为无效并阻止其未来的更新。

```typescript
function submitMisbehaviourToClient(
  id: Identifier,
  misbehaviour: bytes) {
    clientType = provableStore.get(clientTypePath(id))
    abortTransactionUnless(clientType !== null)
    clientState = privateStore.get(clientStatePath(id))
    abortTransactionUnless(clientState !== null)
    clientType.checkMisbehaviourAndUpdateState(clientState, misbehaviour)
}
```

### 示例实现

一个合法性判定示例是构建在运行单一运营者的共识算法的区块链上的，其中有效区块由这个运营者进行签名。区块链运行过程中运营者的签名密钥可以被改变。

客户端特定的类型定义如下：

- `ConsensusState` 存储最新的区块高度和最新的公钥
- `Header`包含一个区块高度、一个新的承诺根、一个运营者的签名以及可能还包括一个新的公钥
- `checkValidityAndUpdateState` 检查已经提交的区块高度是否是单调递增的以及签名是否正确，并更改内部状态
- `checkMisbehaviourAndUpdateState` 被用于检查两个相同区块高度但承诺根不同的区块头，并更改内部状态

```typescript
type Height = uint64

function compare(h1: Height, h2: Height): Ord {
  if h1 < h2
    return LT
  else if h1 === h2
    return EQ
  else
    return GT
}

interface ClientState {
  frozen: boolean
  pastPublicKeys: Set<PublicKey>
  verifiedRoots: Map<uint64, CommitmentRoot>
}

interface ConsensusState {
  sequence: uint64
  publicKey: PublicKey
}

interface Header {
  sequence: uint64
  commitmentRoot: CommitmentRoot
  signature: Signature
  newPublicKey: Maybe<PublicKey>
}

interface Misbehaviour {
  h1: Header
  h2: Header
}

// 操作员运行的用来提交一个新块的算法
function commit(
  commitmentRoot: CommitmentRoot,
  sequence: uint64,
  newPublicKey: Maybe<PublicKey>): Header {
    signature = privateKey.sign(commitmentRoot, sequence, newPublicKey)
    header = {sequence, commitmentRoot, signature, newPublicKey}
    return header
}

// 由客户端类型定义的初始化函数
function initialise(consensusState: ConsensusState): () {
  clientState = {
    frozen: false,
    pastPublicKeys: Set.singleton(consensusState.publicKey),
    verifiedRoots: Map.empty()
  }
  privateStore.set(identifier, clientState)
}

// 客户端类型定义的有效性判定函数
function checkValidityAndUpdateState(
  clientState: ClientState,
  header: Header) {
    abortTransactionUnless(consensusState.sequence + 1 === header.sequence)
    abortTransactionUnless(consensusState.publicKey.verify(header.signature))
    if (header.newPublicKey !== null) {
      consensusState.publicKey = header.newPublicKey
      clientState.pastPublicKeys.add(header.newPublicKey)
    }
    consensusState.sequence = header.sequence
    clientState.verifiedRoots[sequence] = header.commitmentRoot
}

function verifyClientConsensusState(
  clientState: ClientState,
  height: Height,
  prefix: CommitmentPrefix,
  proof: CommitmentProof,
  clientIdentifier: Identifier,
  consensusState: ConsensusState) {
    path = applyPrefix(prefix, "clients/{clientIdentifier}/consensusStates/{height}")
    abortTransactionUnless(!clientState.frozen)
    return clientState.verifiedRoots[sequence].verifyMembership(path, consensusState, proof)
}

function verifyConnectionState(
  clientState: ClientState,
  height: Height,
  prefix: CommitmentPrefix,
  proof: CommitmentProof,
  connectionIdentifier: Identifier,
  connectionEnd: ConnectionEnd) {
    path = applyPrefix(prefix, "connections/{connectionIdentifier}")
    abortTransactionUnless(!clientState.frozen)
    return clientState.verifiedRoots[sequence].verifyMembership(path, connectionEnd, proof)
}

function verifyChannelState(
  clientState: ClientState,
  height: Height,
  prefix: CommitmentPrefix,
  proof: CommitmentProof,
  portIdentifier: Identifier,
  channelIdentifier: Identifier,
  channelEnd: ChannelEnd) {
    path = applyPrefix(prefix, "ports/{portIdentifier}/channels/{channelIdentifier}")
    abortTransactionUnless(!clientState.frozen)
    return clientState.verifiedRoots[sequence].verifyMembership(path, channelEnd, proof)
}

function verifyPacketData(
  clientState: ClientState,
  height: Height,
  delayPeriodTime: uint64,
  delayPeriodBlocks: uint64,
  prefix: CommitmentPrefix,
  proof: CommitmentProof,
  portIdentifier: Identifier,
  channelIdentifier: Identifier,
  sequence: uint64,
  data: bytes) {
    path = applyPrefix(prefix, "ports/{portIdentifier}/channels/{channelIdentifier}/packets/{sequence}")
    abortTransactionUnless(!clientState.frozen)
    return clientState.verifiedRoots[sequence].verifyMembership(path, hash(data), proof)
}

function verifyPacketAcknowledgement(
  clientState: ClientState,
  height: Height,
  delayPeriodTime: uint64,
  delayPeriodBlocks: uint64,
  prefix: CommitmentPrefix,
  proof: CommitmentProof,
  portIdentifier: Identifier,
  channelIdentifier: Identifier,
  sequence: uint64,
  acknowledgement: bytes) {
    path = applyPrefix(prefix, "ports/{portIdentifier}/channels/{channelIdentifier}/acknowledgements/{sequence}")
    abortTransactionUnless(!clientState.frozen)
    return clientState.verifiedRoots[sequence].verifyMembership(path, hash(acknowledgement), proof)
}

function verifyPacketReceiptAbsence(
  clientState: ClientState,
  height: Height,
  prefix: CommitmentPrefix,
  delayPeriodTime: uint64,
  delayPeriodBlocks: uint64,
  proof: CommitmentProof,
  portIdentifier: Identifier,
  channelIdentifier: Identifier,
  sequence: uint64) {
    path = applyPrefix(prefix, "ports/{portIdentifier}/channels/{channelIdentifier}/receipts/{sequence}")
    abortTransactionUnless(!clientState.frozen)
    return clientState.verifiedRoots[sequence].verifyNonMembership(path, proof)
}

function verifyNextSequenceRecv(
  clientState: ClientState,
  height: Height,
  delayPeriodTime: uint64,
  delayPeriodBlocks: uint64,
  prefix: CommitmentPrefix,
  proof: CommitmentProof,
  portIdentifier: Identifier,
  channelIdentifier: Identifier,
  nextSequenceRecv: uint64) {
    path = applyPrefix(prefix, "ports/{portIdentifier}/channels/{channelIdentifier}/nextSequenceRecv")
    abortTransactionUnless(!clientState.frozen)
    return clientState.verifiedRoots[sequence].verifyMembership(path, nextSequenceRecv, proof)
}

// 客户端类型定义的不良行为验证函数
// 过去或当前密钥的任何重复签名都会冻结客户端
function checkMisbehaviourAndUpdateState(
  clientState: ClientState,
  misbehaviour: Misbehaviour) {
    h1 = misbehaviour.h1
    h2 = misbehaviour.h2
    abortTransactionUnless(clientState.pastPublicKeys.contains(h1.publicKey))
    abortTransactionUnless(h1.sequence === h2.sequence)
    abortTransactionUnless(h1.commitmentRoot !== h2.commitmentRoot || h1.publicKey !== h2.publicKey)
    abortTransactionUnless(h1.publicKey.verify(h1.signature))
    abortTransactionUnless(h2.publicKey.verify(h2.signature))
    clientState.frozen = true
}
```

### 属性与不变性

- 客户标识符是不可变的，遵循「先到先得」原则。客户端无法删除（允许删除意味着如果使用之前用过的标识符，则可以之后重放过去的数据包）。

## 向后兼容性

不适用。

## 向前兼容性

只要新客户端类型符合该接口，就可以任意添加到 IBC 实现中。

## 示例实现

即将到来。

## 其他实现

即将到来。

## 历史

2019年3月5日-初稿已完成并提交 PR

2019年5月29日-进行了多处修订，主要是多个承诺根

2019年8月15日-为使客户端接口内容更加清晰而进行了大量润色

2020年1月13日-客户端类型分离和路径更改的修订

2020年1月26日-添加查询接口

## 版权

本规范所有内容均采用 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可授权。
