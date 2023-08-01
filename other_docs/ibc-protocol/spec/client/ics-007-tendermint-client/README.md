---
ics: '7'
title: Tendermint 客户端
stage: 草案
category: IBC/TAO
kind: 实例化
implements: '2'
author: Christopher Goes <cwgoes@tendermint.com>
created: '2019-12-10'
modified: '2019-12-19'
---

## 概要

本标准描述了使用 Tendermint 共识的区块链客户端（验证算法）。

### 动机

使用 Tendermint 共识算法的各种状态机可能希望与其他使用 IBC 的状态机或单机进行交互。

### 定义

函数和术语定义见 [ICS 2](../../core/ics-002-client-semantics)。

`currentTimestamp`定义见 [ICS 24](../../core/ics-024-host-requirements)。

Tendermint 轻客户端使用 ICS 8 中定义的通用Merkle证明格式。

`hash`是一种通用的抗碰撞哈希函数，可以轻松配置。

### 所需属性

该规范必须满足 ICS 2 中定义的客户端接口。

#### 关于“可能被欺骗了”逻辑的注释

“可能被欺骗了”检测的基本思想是，它允许我们更加保守，当我们知道网络上其他地方的另一个轻客户端使用了略有不同的更新模式时，会冻结我们的轻客户端。因为可能已经被欺骗了，即使我们实际没有被欺骗。

现在假设有三个链`A` 、`B`和`C`的拓扑，以及`A_1`和`A_2`两个链`A`的客户端，它们分别在链`B`和`C`上运行。依次发生以下事件：

- 链`A`在高度`h_0` 处生成一个块（正确）。
- 客户端`A_1`和`A_2`被更新到高度为`h_0`的块。
- 链`A`在高度`h_0 + n` 生成一个块（正确）。
- 客户端`A_1`已更新到高度为`h_0 + n`的块（客户端`A_2`尚未更新）。
- 链`A`生成了第二个 （矛盾的） 高度为`h_0 + k`的区块，并且`k <= n`。

*如果没有* “可能被欺骗了”，则客户端`A_2`会冻结（因为在高度`h_0 + k`处有两个有效块，它们比`A_2`的最新的区块头要新），但是*无法*冻结`A_1` ，因为`A_1`已经超过了`h_0 + k` 。

可以说，这是不利的，因为`A_1`只是“幸运”的被更新了，而`A_2`没有，并且明显一些拜占庭式的错误已经发生，应该由人或治理体系来干预处理。 “可能被欺骗了”的想法是通过让`A_1`从可配置的过去区块头开始以检测不良行为来侦测此类错误（因此，在这种情况下， `A_1`若能够从`h_0`开始检测，那么也将被冻结 ）。

这有一个灵活的参数，即`A_1`希望从多久前开始检查（当已更新到`h_0 + n`，`n`会是多大时，`A_1`仍然会愿意查找`h_0` ）？还存在一个反作用的担忧，即在解除绑定期之后，双签被认为是无成本的，我们并不想为 IBC 客户开放一个拒绝服务的媒介。

因此，必要条件是`A_1`应该查找已存储的最早的区块头，但还应对证据进行“解除期限”检查，如果证据早于解除期限，则应避免冻结客户端（相对于客户端的本地时间戳）。如果担心“时钟偏差”，可以添加一个轻微的增量。

## 技术指标

该规范依赖于[Tendermint 共识算法](https://github.com/tendermint/spec/blob/master/spec/consensus/consensus.md)和[轻客户端算法](https://github.com/tendermint/spec/blob/master/spec/consensus/light-client.md)的正确实例化。

### 客户端状态

Tendermint 客户端状态会跟踪当前的验证人集合、信任期、解除绑定期、最新区块高度、最新时间戳（区块时间）以及可能的冻结区块高度。

```typescript
interface ClientState {
  chainID: string
  validatorSet: List<Pair<Address, uint64>>
  trustLevel: Rational
  trustingPeriod: uint64
  unbondingPeriod: uint64
  latestHeight: Height
  latestTimestamp: uint64
  frozenHeight: Maybe<uint64>
  upgradeCommitmentPrefix: CommitmentPrefix
  upgradeKey: []byte
  maxClockDrift: uint64
  proofSpecs: []ProofSpec
}
```

### 共识状态

Tendermint 客户端会跟踪所有先前已验证的共识状态的时间戳（区块时间）、验证人集合和承诺根（在取消绑定期之后可以将其清除，但不应该在此之前清除）。

```typescript
interface ConsensusState {
  timestamp: uint64
  validatorSet: List<Pair<Address, uint64>>
  commitmentRoot: []byte
}
```

### 区块高度

Tendermint 客户端的区块高度由两个`uint64`组成：即修订号和修订的高度。

```typescript
interface Height {
  revisionNumber: uint64
  revisionHeight: uint64
}
```

高度之间的比较如下：

```typescript
function compare(a: TendermintHeight, b: TendermintHeight): Ord {
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

在这样的设计下，当修订号增加 1时高度仍然允许被重置为`0` ，进而使得在升级时即使高度为零，超时机制仍然有效。

### 区块头

Tendermint 客户端头包括区块高度、时间戳、承诺根、完整的验证人集合以及提交该块的验证人的签名。

```typescript
interface Header {
  height: uint64
  timestamp: uint64
  commitmentRoot: []byte
  validatorSet: List<Pair<Address, uint64>>
  signatures: []Signature
}
```

### 不良行为判定

`Misbehaviour`类型用于检测不良行为并冻结客户端 （如果适用）- 以防止进一步的数据流动。 Tendermint `Misbehaviour`客户端的不良行为检查决定于在相同高度的两个冲突区块头是否都会通过轻客户端的验证。

```typescript
function latestClientHeight(clientState: ClientState): uint64 {
  return clientState.latestHeight
}
```

### 客户端初始化

Tendermint 客户端初始化要求（主观选择的）最新的共识状态，包括完整的验证人集合。

```typescript
function initialise(
  chainID: string, consensusState: ConsensusState,
  validatorSet: List<Pair<Address, uint64>>, trustLevel: Fraction,
  height: Height, trustingPeriod: uint64, unbondingPeriod: uint64,
  upgradeCommitmentPrefix: CommitmentPrefix, upgradeKey: []byte,
  maxClockDrift: uint64, proofSpecs: []ProofSpec): ClientState {
    assert(trustingPeriod < unbondingPeriod)
    assert(height > 0)
    assert(trustLevel > 0 && trustLevel < 1)
    set("clients/{identifier}/consensusStates/{height}", consensusState)
    return ClientState{
      chainID,
      validatorSet,
      trustLevel,
      latestHeight: height,
      latestTimestamp: consensusState.timestamp,
      trustingPeriod,
      unbondingPeriod,
      frozenHeight: null,
      upgradeCommitmentPrefix,
      upgradeKey,
      maxClockDrift,
      proofSpecs
    }
}
```

Tendermint 客户端`latestClientHeight`函数返回最新存储的高度，该高度在每次验证了新的（较新的）区块头时都会更新。

```typescript
function latestClientHeight(clientState: ClientState): uint64 {
  return clientState.latestHeight
}
```

### 合法性判定式

Tendermint 客户端有效性检查使用[Tendermint 规范](https://github.com/tendermint/spec/tree/master/spec/consensus/light-client)中描述的二分算法。如果提供的区块头有效，那么会将更新客户端状态并将新验证的承诺写入存储。

```typescript
function checkValidityAndUpdateState(
  clientState: ClientState,
  revision: uint64,
  header: Header) {
    // 断言：修订版本是正确的
    assert(revision === clientState.currentHeight.revision)
    // 检查修订版本是否正确编码
    assert(revision === clientState.chainID.regex('[a-z]*-(0)'))
    // 断言：信任期尚未过去
    assert(currentTimestamp() - clientState.latestTimestamp < clientState.trustingPeriod)
    // 断言：区块头时间戳小于未来的信任期。这应该使用中间区块头
来解决。
    assert(header.timestamp - clientState.latestTimeStamp < trustingPeriod)
    // 断言：区块头时间戳曾经是当前时间戳
    assert(header.timestamp > clientState.latestTimestamp)
    // 断言：区块头高度比我们所知道的要新
    assert(header.height > clientState.latestHeight)
    // 调用 `verify` 函数
    assert(verify(clientState.validatorSet, clientState.latestHeight, clientState.trustingPeriod, maxClockDrift, header))
    // 更新验证人集合
    clientState.validatorSet = header.validatorSet
    // 更新最新高度
    clientState.latestHeight = header.height
    // 更新最新的时间戳
    clientState.latestTimestamp = header.timestamp
    // 创建记录的共识状态，保存
    consensusState = ConsensusState{header.timestamp, header.validatorSet, header.commitmentRoot}
    set("clients/{identifier}/consensusStates/{header.height}", consensusState)
    set("clients/{identifier}/processedTimes/{header.height}", currentTimestamp())
    set("clients/{identifier}/processedHeights/{header.height}", currentHeight())
    // 保存客户端
    set("clients/{identifier}", clientState)
}
```

### 不良行为判定

Tendermint 客户端的不良行为检查决定于在相同高度的两个冲突区块头是否都会通过轻客户端的验证。

```typescript
function checkMisbehaviourAndUpdateState(
  clientState: ClientState,
  misbehaviour: Misbehaviour) {
    // 断言：高度相同
    assert(misbehaviour.h1.height === misbehaviour.h2.height)
    // 断言：承诺是不同的
    assert(misbehaviour.h1.commitmentRoot !== misbehaviour.h2.commitmentRoot)
    // 获取先前验证的承诺根和验证人集合
    consensusState = get("clients/{identifier}/consensusStates/{misbehaviour.fromHeight}")
    // 断言：时间戳不早于一个信任期之前
    assert(currentTimestamp() - misbehaviour.timestamp < clientState.trustingPeriod)
    // 检查轻客户端是否“会被愚弄”
    assert(
      verify(consensusState.validatorSet, misbehaviour.fromHeight, misbehaviour.h1) &&
      verify(consensusState.validatorSet, misbehaviour.fromHeight, misbehaviour.h2)
      )
    // 设置冻结高度
    clientState.frozenHeight = min(clientState.frozenHeight, misbehaviour.h1.height) // which is same as h2.height
    // 保存客户端
    set("clients/{identifier}", clientState)
}
```

### 升级

这个轻客户端所追踪的链可以选择在状态中写入一个特殊的预定密钥, 以允许轻客户端在准备升级时更新其客户端状态(例如，使用新的链ID或修订版本).

由于客户端状态的改变将立即进行, 一旦新的客户端状态信息被写入预定密钥, 客户端将不再能够跟踪旧链上的区块, 所以它必须及时升级.

```typescript
function upgradeClientState(
  clientState: ClientState,
  newClientState: ClientState,
  height: Height,
  proof: CommitmentPrefix) {
    // 断言：信任期尚未过去
    assert(currentTimestamp() - clientState.latestTimestamp < clientState.trustingPeriod)
    // 检查修订版本是否已增加
    assert(newClientState.latestHeight.revisionNumber > clientState.latestHeight.revisionNumber)
    // 根据预定的承诺前缀和密钥检查更新客户端状态的证明
    path = applyPrefix(clientState.upgradeCommitmentPrefix, clientState.upgradeKey)
    // 检查客户端的高度是否足够
    assert(clientState.latestHeight >= height)
    // 检查客户端是否解冻或冻结在更高的高度
    assert(clientState.frozenHeight === null || clientState.frozenHeight > height)
    // 获取先前验证的承诺根并验证成员资格
    root = get("clients/{identifier}/consensusStates/{height}")
    // 验证提供的共识状态是否已存储
    assert(root.verifyMembership(path, newClientState, proof))
    // 更新客户端状态
    clientState = newClientState
    set("clients/{identifier}", clientState)
}
```

### 状态验证函数

Tendermint 客户端状态验证函数对照先前已验证的承诺根检查Merkle证明。

这些函数使用初始化客户端的`proofSpecs` 。

```typescript
function verifyClientConsensusState(
  clientState: ClientState,
  height: Height,
  prefix: CommitmentPrefix,
  proof: CommitmentProof,
  clientIdentifier: Identifier,
  consensusStateHeight: Height,
  consensusState: ConsensusState) {
    path = applyPrefix(prefix, "clients/{clientIdentifier}/consensusState/{consensusStateHeight}")
    // 检查客户端是否处于足够的高度
    assert(clientState.latestHeight >= height)
    // 检查客户端是否解冻或冻结在更高的高度
    assert(clientState.frozenHeight === null || clientState.frozenHeight > height)
    // 获取先前验证的承诺根并验证成员资格
    root = get("clients/{identifier}/consensusStates/{height}")
    // 验证提供的共识状态是否已存储
    assert(root.verifyMembership(path, consensusState, proof))
}

function verifyConnectionState(
  clientState: ClientState,
  height: Height,
  prefix: CommitmentPrefix,
  proof: CommitmentProof,
  connectionIdentifier: Identifier,
  connectionEnd: ConnectionEnd) {
    path = applyPrefix(prefix, "connections/{connectionIdentifier}")
    // 检查客户端是否处于足够的高度
    assert(clientState.latestHeight >= height)
    // 检查客户端是否解冻或冻结在更高的高度
    assert(clientState.frozenHeight === null || clientState.frozenHeight > height)
    // 获取先前验证的承诺根并验证成员资格
    root = get("clients/{identifier}/consensusStates/{height}")
    // 验证提供的连接端是否已存储
    assert(root.verifyMembership(path, connectionEnd, proof))
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
    // 检查客户端是否处于足够的高度
    assert(clientState.latestHeight >= height)
    // 检查客户端是否解冻或冻结在更高的高度
    assert(clientState.frozenHeight === null || clientState.frozenHeight > height)
    // 获取先前验证的承诺根并验证成员资格
    root = get("clients/{identifier}/consensusStates/{height}")
    // 验证提供的通道端是否已存储
    assert(root.verifyMembership(clientState.proofSpecs, path, channelEnd, proof))
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
    // 检查客户端是否处于足够的高度
    assert(clientState.latestHeight >= height)
    // 检查客户端是否解冻或冻结在更高的高度
    assert(clientState.frozenHeight === null || clientState.frozenHeight > height)
    // 获取处理时间
    processedTime = get("clients/{identifier}/processedTimes/{height}")
    // 获取处理后的高度
    processedHeight = get("clients/{identifier}/processedHeights/{height}")
    // 断言：足够的时间已经过去
    assert(currentTimestamp() >= processedTime + delayPeriodTime)
    // 断言：已经过去了足够多的块
    assert(currentHeight() >= processedHeight + delayPeriodBlocks)
    // 获取先前验证的承诺根并验证成员资格
    root = get("clients/{identifier}/consensusStates/{height}")
    // 验证提供的承诺是否已被存储
    assert(root.verifyMembership(clientState.proofSpecs, path, hash(data), proof))
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
    // 检查客户端是否处于足够的高度
    assert(clientState.latestHeight >= height)
    // 检查客户端是否解冻或冻结在更高的高度
    assert(clientState.frozenHeight === null || clientState.frozenHeight > height)
    // 获取处理时间
    processedTime = get("clients/{identifier}/processedTimes/{height}")
    // 获取处理后的高度
    processedHeight = get("clients/{identifier}/processedHeights/{height}")
    // 断言足够的时间已经过去
    assert(currentTimestamp() >= processedTime + delayPeriodTime)
    // 断言已经过去了足够多的块
    assert(currentHeight() >= processedHeight + delayPeriodBlocks)
    // 获取先前验证的承诺根并验证成员资格
    root = get("clients/{identifier}/consensusStates/{height}")
    // 验证提供的确认是否已存储
    assert(root.verifyMembership(clientState.proofSpecs, path, hash(acknowledgement), proof))
}

function verifyPacketReceiptAbsence(
  clientState: ClientState,
  height: Height,
  delayPeriodTime: uint64,
  delayPeriodBlocks: uint64,
  prefix: CommitmentPrefix,
  proof: CommitmentProof,
  portIdentifier: Identifier,
  channelIdentifier: Identifier,
  sequence: uint64) {
    path = applyPrefix(prefix, "ports/{portIdentifier}/channels/{channelIdentifier}/receipts/{sequence}")
    // 检查客户端是否处于足够的高度
    assert(clientState.latestHeight >= height)
    // 检查客户端是否解冻或冻结在更高的高度
    assert(clientState.frozenHeight === null || clientState.frozenHeight > height)
    // 获取处理时间
    processedTime = get("clients/{identifier}/processedTimes/{height}")
    // 获取处理后的高度
    processedHeight = get("clients/{identifier}/processedHeights/{height}")
    // 断言：足够的时间已经过去
    assert(currentTimestamp() >= processedTime + delayPeriodTime)
    // 断言已经过去了足够多的块
    assert(currentHeight() >= processedHeight + delayPeriodBlocks)
    // 获取先前验证的承诺根并验证成员资格
    root = get("clients/{identifier}/consensusStates/{height}")
    // 验证没有回执被存储
    assert(root.verifyNonMembership(clientState.proofSpecs, path, proof))
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
    // 检查客户端是否处于足够的高度
    assert(clientState.latestHeight >= height)
    // 检查客户端是否解冻或冻结在更高的高度
    assert(clientState.frozenHeight === null || clientState.frozenHeight > height)
    // 获取处理时间
    processedTime = get("clients/{identifier}/processedTimes/{height}")
    // 获取处理后的高度
    processedHeight = get("clients/{identifier}/processedHeights/{height}")
    // 断言足够的时间已经过去
    assert(currentTimestamp() >= processedTime + delayPeriodTime)
    // 断言已经过去了足够多的块
    assert(currentHeight() >= processedHeight + delayPeriodBlocks)
    // 获取先前验证的承诺根并验证成员资格
    root = get("clients/{identifier}/consensusStates/{height}")
    // 验证 nextSequenceRecv 是否如声明的那样
    assert(root.verifyMembership(clientState.proofSpecs, path, nextSequenceRecv, proof))
}
```

### 属性与不变性

正确性保证和 Tendermint 轻客户端算法相同。

## 向后兼容性

不适用。

## 向前兼容性

不适用。更改客户端验证算法将需要新的客户端标准。

## 示例实现

暂无。

## 其他实现

目前暂无。

## 历史

2019年12月10日-2019年12月19日初始版本-最后初稿

## 版权

本规范所有内容均采用 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可授权。
