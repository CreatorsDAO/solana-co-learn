---
ics: '8'
title: Wasm 客户端
stage: 草案
category: IBC/TAO
kind: 实例化
implements: '2'
author: Parth Desai <parth@chorus.one>, Mateusz Kaczanowski <mateusz@chorus.one>
created: '2020-10-13'
modified: '2020-10-13'
---

## 概要

本规范文档描述了客户端（验证算法）的接口，存储为区块链的 Wasm 字节码。

### 动机

目前，添加新的客户端实现或升级已有的客户端都需要进行硬分叉升级，因为客户端的实现是内置在链上静态二进制文件中的。链上任何客户端代码的更改都依赖于链上治理的批准，方可正式部署。

对于增加新客户端类型来说，这是可以接受的，毕竟当前支持的共识算法数量较少。但是对于升级轻客户端来说则是比较麻烦的做法。

对于没有动态升级能力的轻客户端来说， 想要实现共识算法的升级（并暂停已有的轻客户端）需要等待其他链首先完成硬分叉升级（以便能够支持新的客户端）。共识暂停的升级的一个例子包括从Tendermint V1升级到Tendermint V2（更新轻客户端），以及从Tendermint共识切换到Honeybadger。 对内部状态机逻辑的改变不会影响共识，例如，对staking模块的改变不需要进行IBC升级。

这种要求相关联链的二进制文件都添加新的客户端实现的方式无疑会拖慢IBC网络的升级进程。 因为这会导致每一个实验性、快速迭代的链的部署过程由于这个过于保守的机制而停滞不前。

一旦IBC网络广泛采用可动态升级的客户端，一条链可以随时升级其共识算法，中继器可以升级所有对手链的客户端代码，而不需要对手链自己进行升级。这就避免了在升级自己的共识算法时对于对手链的依赖。

### 定义

函数和术语定义见 [ICS 2](../../core/ics-002-client-semantics)。

`currentTimestamp` 定义见 [ICS 24](../../core/ics-024-host-requirements)。

`Wasm Client Code` 指的是存储在client store里的Wasm字节码，它提供了[ICS 2](../../core/ics-002-client-semantics) 目标区块链的具体实现。

`Wasm Client` 指的是定义在元组 `(Wasm Client Code, ClientID)`中`Wasm Client Code`的特定实例。

`Wasm VM` 指的是能够执行有效Wasm字节码的虚拟机。

### 所需属性

该规范必须满足ICS 2中定义的客户端接口。

## 技术规范

该规范取决于 `Wasm client` 的正确实例化，并且和任何目标 `blockchain` 的共识算法的具体实现解耦。

### 客户端状态

Wasm客户端状态通过`codeId`跟踪Wasm字节码的位置。`data`字段表示二进制数据，该数据不透明且仅能通过Wasm Client Code解析。  `type` 代表客户端类型。 `type` 和 `codeId` 都是不可变的。

```typescript
interface ClientState {
  codeId: []byte
  data: []byte
  latestHeight: Height
}
```

### 共识状态

Wasm共识状态跟踪时间戳(区块时间)和`Wasm Client code` 特定字段以及之前已经验证的共识状态的承诺根（commitment root）。 `type` 和 `codeId` 都是不可变的。

```typescript
interface ConsensusState {
  codeId: []byte
  data: []byte
  timestamp: uint64
}
```

### 区块高度

Wasm轻客户端实例的Height由两个`uint64`组成：修订号和修订的区块高度。

```typescript
interface Height {
  revisionNumber: uint64
  revisionHeight: uint64
}
```

高度之间的比较按以下方式实现：

```typescript
function compare(a: Height, b: Height): Ord {
  if (a.revisionNumber < b.revisionNumber)
    return LT
  else if (a.revisionNumber === b.revisionNumber)
    if (a.revisionHeight < b.revisionHeight)
      return LT
    else if (a.revisionHeight === b.revisionHeight)
      return EQ
  return GT
}
```

这旨在允许高度重置为 `0` ，而修订号增加1，以便通过零高度的升级保持超时状态。

### 区块头

Wasm客户端的区块头依赖 `Wasm Client Code`。

```typescript
interface Header {
  data: []byte
  height: Height
}
```

### 不良行为

`Misbehaviour` 类型用于检测不良行为并冻结客户端——并阻止数据包流（如适用）。Wasm 客户端的 `Misbehaviour` 由两个冲突的区块头组成, 且这两个区块头都被轻客户端认可有效。

```typescript
interface Misbehaviour {
  clientId: string
  h1: Header
  h2: Header
}
```

### 客户端初始化

Wasm客户端初始化需要一个主观选择的最新共识状态, 由Wasm客户端代码负责解析。`wasmCodeId` 字段是`Wasm Client Code` 的唯一标识符，`initializationData` 指的是不透明数据，该数据用来初始化由Wasm客户端代码管理的特定客户端。

```typescript
function initialise(
    wasmCodeId: String,
    initializationData: []byte,
    consensusState: []byte,
  ): ClientState {
    codeHandle = getWasmCode(wasmCodeId)
    assert(codeHandle.isInitializationDataValid(initializationData, consensusState))

    store = getStore("clients/{identifier}")
    return codeHandle.initialise(store, initializationData, consensusState)
}
```

`latestClientHeight` 函数返回最新的存储高度，该高度在每次新的高度（最近的）被验证的时候也会随之更新。

```typescript
function latestClientHeight(clientState: ClientState): Height {
  codeHandle = clientState.codeHandle();
  codeHandle.latestClientHeight(clientState)
}
```

### 合法性判定

Wasm客户端合法性检测使用的是底层Wasm客户端代码。在确认所提供的区块头有效之后，会更新客户端状态，同时将刚刚验证的承诺（commitment）写入存储。

```typescript
function checkValidityAndUpdateState(
  clientState: ClientState,
  header: Header) {
    store = getStore("clients/{identifier}")
    codeHandle = clientState.codeHandle()

    // 验证所提供的区块头有效且状态被保存
    assert(codeHandle.validateHeaderAndCreateConsensusState(store, clientState, header))
}
```

### 不良行为判定

Wasm客户端的不良行为检测将决定在同一个高度的冲突区块头哪个将得到轻客户端的认可。

```typescript
function checkMisbehaviourAndUpdateState(
  clientState: ClientState,
  misbehaviour: Misbehaviour) {
    store = getStore("clients/{identifier}")
    codeHandle = clientState.codeHandle()
    assert(codeHandle.handleMisbehaviour(store, clientState, misbehaviour))
}
```

### 升级

该轻客户端所追踪的链可以选择在状态中写入一个特殊的预定密钥，以允许轻客户端在准备升级时更新其客户端状态（例如使用新的链ID或修订版本）。

由于客户端的状态改变会被立即执行，一旦新的客户端状态信息被写入预定密钥，客户端将不再能够跟踪旧链上的区块，所以它必须及时升级。

```typescript
function upgradeClientState(
  clientState: ClientState,
  newClientState: ClientState,
  height: Height,
  proof: CommitmentPrefix) {
    codeHandle = clientState.codeHandle()
    assert(codeHandle.verifyNewClientState(clientState, newClientState, height, proof))

    // 更新客户端状态
    clientState = newClientState
    set("clients/{identifier}", clientState)
}
```

对于 Wasm客户端，也可以通过区块链特定的管理功能升级 Wasm 客户端代码。

### 状态验证函数

Wasm客户端状态验证函数根据先前验证的承诺根来检查Merkle证明。

```typescript
function verifyClientConsensusState(
  clientState: ClientState,
  height: Height,
  prefix: CommitmentPrefix,
  proof: CommitmentProof,
  clientIdentifier: Identifier,
  consensusStateHeight: Height,
  consensusState: ConsensusState) {
    codeHandle = getCodeHandleFromClientID(clientIdentifier)
    assert(codeHandle.verifyClientConsensusState(clientState, height, prefix, clientIdentifier, proof, consensusStateHeight, consensusState))
}

function verifyConnectionState(
  clientState: ClientState,
  height: Height,
  prefix: CommitmentPrefix,
  proof: CommitmentProof,
  connectionIdentifier: Identifier,
  connectionEnd: ConnectionEnd) {
    codeHandle = clientState.codeHandle()
    assert(codeHandle.verifyConnectionState(clientState, height, prefix, proof, connectionIdentifier, connectionEnd))
}

function verifyChannelState(
  clientState: ClientState,
  height: Height,
  prefix: CommitmentPrefix,
  proof: CommitmentProof,
  portIdentifier: Identifier,
  channelIdentifier: Identifier,
  channelEnd: ChannelEnd) {
    codeHandle = clientState.codeHandle()
    assert(codeHandle.verifyChannelState(clientState, height, prefix, proof, portIdentifier, channelIdentifier, channelEnd))
}

function verifyPacketCommitment(
  clientState: ClientState,
  height: Height,
  prefix: CommitmentPrefix,
  proof: CommitmentProof,
  portIdentifier: Identifier,
  channelIdentifier: Identifier,
  sequence: uint64,
  commitment: bytes) {
    codeHandle = clientState.codeHandle()
    assert(codeHandle.verifyPacketCommitment(clientState, height, prefix, proof, portIdentifier, channelIdentifier, sequence, commitment))
}

function verifyPacketAcknowledgement(
  clientState: ClientState,
  height: Height,
  prefix: CommitmentPrefix,
  proof: CommitmentProof,
  portIdentifier: Identifier,
  channelIdentifier: Identifier,
  sequence: uint64,
  acknowledgement: bytes) {
    codeHandle = clientState.codeHandle()
    assert(codeHandle.verifyPacketAcknowledgement(clientState, height, prefix, proof, portportIdentifier, channelIdentifier, sequence, acknowledgement))
}

function verifyPacketReceiptAbsence(
  clientState: ClientState,
  height: Height,
  prefix: CommitmentPrefix,
  proof: CommitmentProof,
  portIdentifier: Identifier,
  channelIdentifier: Identifier,
  sequence: uint64) {
    codeHandle = clientState.codeHandle()
    assert(codeHandle.verifyPacketReceiptAbsence(clientState, height, prefix, proof, portIdentifier, channelIdentifier, sequence))
}

function verifyNextSequenceRecv(
  clientState: ClientState,
  height: Height,
  prefix: CommitmentPrefix,
  proof: CommitmentProof,
  portIdentifier: Identifier,
  channelIdentifier: Identifier,
  nextSequenceRecv: uint64) {
    codeHandle = clientState.codeHandle()
    assert(codeHandle.verifyNextSequenceRecv(clientState, height, prefix, proof, portIdentifier, channelIdentifier, nextSequenceRecv))
}
```

### Wasm 客户端代码接口

#### 什么是代码句柄?

代码句柄是一个对象，能够方便在Wasm代码和Go代码之间进行交互。例如，`isValidClientState` 方法可以通过以下方式实现：

```go
func (c *CodeHandle) isValidClientState(clientState ClientState, height u64) {
    clientStateData := json.Serialize(clientState)
    packedData := pack(clientStateData, height)
    // 调用Wasm合约的特定VM代码

}
```

#### Wasm客户端接口

每个Wasm客户端代码都需要支持以下消息的接收，以便用作轻客户端。

```rust
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub struct MisbehaviourMessage {
    pub client_state: Vec<u8>,
    pub consensus_state: Vec<u8>,
    pub height: Height,
    pub header1: Vec<u8>,
    pub header2: Vec<u8>,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub struct CreateConsensusMessage {
    pub client_state: Vec<u8>,
    pub height: Height
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub struct InitializeClientStateMessage {
    pub initialization_data: Vec<u8>,
    pub consensus_state: Vec<u8>
}


#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum HandleMsg {
    HandleMisbehaviour(MisbehaviourMessage),
    TryCreateConsensusState(CreateConsensusMessage),
    InitializeClientState(InitializeClientStateMessage)
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub struct ValidateClientStateMessage {
    client_state: Vec<u8>,
    height: Height
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub struct ValidateNewClientStateMessage {
    client_state: Vec<u8>,
    new_client_state: Vec<u8>,
    height: Height
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub struct ValidateInitializationDataMessage {
    init_data: Vec<u8>,
    consensus_state: Vec<u8>
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum ValidityPredicate {
    ClientState(ValidateClientStateMessage),
    NewClientState(ValidateNewClientStateMessage),
    InitializationData(ValidateInitializationDataMessage),
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum QueryMsg {
   IsValid(ValidityPredicate),
   LatestClientHeight(Vec<u8>),
}

```

### 属性与不变性

`Wasm Client Code`实现的底层算法提供的正确性保证。

## 向后兼容性

不适用.

## 向前兼容性

只要`Wasm Client Code`与`ICS 02`保持接口一致, 它就是向前兼容的.

## 示例实现

暂无。

## 其他实现

目前暂无。

## 历史

## 版权

本规范所有内容均采用 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可授权。
