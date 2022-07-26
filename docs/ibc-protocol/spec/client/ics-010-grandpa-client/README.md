---
ics: '10'
title: GRANDPA 客户端
stage: 草案
category: IBC/TAO
kind: 实例化
author: Yuanchao Sun <ys@cdot.network>, John Wu <john@cdot.network>
created: '2020-03-15'
implements: '2'
---

## 概要

本规范描述了使用 GRANDPA 最终性小工具的区块链客户端（验证算法）。

GRANDPA（GHOST-based Recursive Ancestor Deriving Prefix Agreement）是 Polkadot 中继链将会使用的一个最终性小工具。它现在有一个 Rust 语言实现，并且是 Substrate 框架的一部分，因此使用 Substrate 构建的区块链很可能会使用 GRANDPA 作为其最终性小工具。

### 动机

使用 GRANDPA 最终性小工具的区块链可能希望通过 IBC 与其他状态机或单机进行交互。

### 定义

函数和术语定义见 [ICS 2](../../core/ics-002-client-semantics) 。

### 所需属性

该规范必须满足 ICS 2 中定义的客户端接口。

## 技术指标

该规范依赖于 [GRANDPA 最终性小工具](https://github.com/w3f/consensus/blob/master/pdf/grandpa.pdf)及其轻客户端算法的正确实例化。

### 客户端状态

GRANDPA 客户端状态会跟踪最新区块高度和可能的冻结区块高度。

```typescript
interface ClientState {
  latestHeight: uint64
  frozenHeight: Maybe<uint64>
}
```

### 权威集合

GRANDPA 的一组权威账户。

```typescript
interface AuthoritySet {
  // 每次集合更改时都会递增
  setId: uint64
  authorities: List<Pair<AuthorityId, AuthorityWeight>>
}
```

### 共识状态

GRANDPA 客户端跟踪所有先前已验证的共识状态的权威集合和承诺根。

```typescript
interface ConsensusState {
  authoritySet: AuthoritySet
  commitmentRoot: []byte
}
```

### 区块头

GRANDPA 客户端区块头包括区块高度、承诺根、区块的确定性证明和权威集合。（实际上，区块头中包含的是一个权威集合的证明，而不是权威集合本身，但是我们可以使用一个固定的键来验证证明并提取出真实集合，本规范不包含相关细节）

```typescript
interface Header {
  height: uint64
  commitmentRoot: []byte
  justification: Justification
  authoritySet: AuthoritySet
}
```

### 确定性证明

一个 GRANDPA 的区块确定性证明包括一个commit信息和一个祖先证明（ancestry proof），其中包括所有预提交目标块到提交目标块之间的所有区块头。例如，最新的块是 A-B-C-D-E-F，其中 A 是最后敲定的块，F 是可以收集到多数投票的位置（投票可能在 B，C，D，E，F 上）。那么证明需要包括从 F 到 A 的所有区块头。

```typescript
interface Justification {
  round: uint64
  commit: Commit
  votesAncestries: []Header
}
```

### Commit 信息

Commit消息是已签名的预提交的汇总。

```typescript
interface Commit {
  precommits: []SignedPrecommit
}

interface SignedPrecommit {
  targetHash: Hash
  signature: Signature
  id: AuthorityId
}
```

### 不良行为

`Evidence`类型用于检测不良行为并冻结客户端-以防止进一步的数据包流（如果适用）。 GRANDPA 客户端`Evidence`由两个高度相同的、且由轻客户端判定有效的区块头组成。

```typescript
interface Evidence {
  fromHeight: uint64
  h1: Header
  h2: Header
}
```

### 客户初始化

GRANDPA 客户端初始化要求（主观选择）一个最新的共识状态，包括完整的权威集合。

```typescript
function initialise(identifier: Identifier, height: uint64, consensusState: ConsensusState): ClientState {
    set("clients/{identifier}/consensusStates/{height}", consensusState)
    return ClientState{
      latestHeight: height,
      frozenHeight: null,
    }
}
```

GRANDPA 客户端的`latestClientHeight`函数返回最新存储的区块高度，该高度在每次验证一个新的（更接近现在的）区块头时都会更新。

```typescript
function latestClientHeight(clientState: ClientState): uint64 {
  return clientState.latestHeight
}
```

### 合法性判定式

GRANDPA 客户端合法性检查将验证区块头是否由当前权威集合签名，并验证权威集合证明以确定是否存在对权威集合的更改。如果所提供的区块头有效，那么将更新客户端状态并将新验证的承诺写入存储。

```typescript
function checkValidityAndUpdateState(
  clientState: ClientState,
  header: Header) {
    // 断言：区块头高度比我们所知道的要新
    assert(header.height > clientState.latestHeight)
    consensusState = get("clients/{identifier}/consensusStates/{clientState.latestHeight}")
    // 验证提供的区块头是否有效
    assert(verify(consensusState.authoritySet, header))
    // 更新最新高度
    clientState.latestHeight = header.height
    // 创建记录的共识状态，并保存
    consensusState = ConsensusState{header.authoritySet, header.commitmentRoot}
    set("clients/{identifier}/consensusStates/{header.height}", consensusState)
    // 保存客户端
    set("clients/{identifier}", clientState)
}

function verify(
  authoritySet: AuthoritySet,
  header: Header): boolean {
  let visitedHashes: Hash[]
  for (const signedPrecommit of Header.justification.commit.precommits) {
    if (checkSignature(authoritySet, signedPrecommit)) {
      visitedHashes.push(signedPrecommit.targetHash)
    }
  }
  return visitedHashes.equals(Header.justification.votesAncestries.map(hash))
}
```

### 不良行为判定

GRANDPA 客户端的不良行为检测将确定在相同高度的两个冲突的区块头是否都被轻客户端认定有效。

```typescript
function checkMisbehaviourAndUpdateState(
  clientState: ClientState,
  evidence: Evidence) {
    // 断言：高度相同
    assert(evidence.h1.height === evidence.h2.height)
    // 断言：承诺是不同的
    assert(evidence.h1.commitmentRoot !== evidence.h2.commitmentRoot)
    // 获取先前验证的承诺根和权威集合
    consensusState = get("clients/{identifier}/consensusStates/{evidence.fromHeight}")
    // 检查轻客户端是否“会被愚弄”
    assert(
      verify(consensusState.authoritySet, evidence.h1) &&
      verify(consensusState.authoritySet, evidence.h2)
      )
    // 设置冻结高度
    clientState.frozenHeight = min(clientState.frozenHeight, evidence.h1.height) // which is same as h2.height
    //保存客户端
    set("clients/{identifier}", clientState)
}
```

### 状态验证函数

GRANDPA 客户端状态验证函数对照先前已验证的承诺根检查Merkle证明。

```typescript
function verifyClientConsensusState(
  clientState: ClientState,
  height: uint64,
  prefix: CommitmentPrefix,
  proof: CommitmentProof,
  clientIdentifier: Identifier,
  consensusStateHeight: uint64,
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
  height: uint64,
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
  height: uint64,
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
    assert(root.verifyMembership(path, channelEnd, proof))
}

function verifyPacketData(
  clientState: ClientState,
  height: uint64,
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
    // 获取先前验证的承诺根并验证成员资格
    root = get("clients/{identifier}/consensusStates/{height}")
    // 验证提供的承诺是否已被存储
    assert(root.verifyMembership(path, hash(data), proof))
}

function verifyPacketAcknowledgement(
  clientState: ClientState,
  height: uint64,
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
    // 获取先前验证的承诺根并验证成员资格
    root = get("clients/{identifier}/consensusStates/{height}")
    // 验证提供的回执是否已存储
    assert(root.verifyMembership(path, hash(acknowledgement), proof))
}

function verifyPacketAcknowledgementAbsence(
  clientState: ClientState,
  height: uint64,
  prefix: CommitmentPrefix,
  proof: CommitmentProof,
  portIdentifier: Identifier,
  channelIdentifier: Identifier,
  sequence: uint64) {
    path = applyPrefix(prefix, "ports/{portIdentifier}/channels/{channelIdentifier}/acknowledgements/{sequence}")
    // 检查客户端是否处于足够的高度
    assert(clientState.latestHeight >= height)
    // 检查客户端是否解冻或冻结在更高的高度
    assert(clientState.frozenHeight === null || clientState.frozenHeight > height)
    // 获取先前验证的承诺根并验证成员资格
    root = get("clients/{identifier}/consensusStates/{height}")
    // 验证没有承诺被存储
    assert(root.verifyNonMembership(path, proof))
}

function verifyNextSequenceRecv(
  clientState: ClientState,
  height: uint64,
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
    // 获取先前验证的承诺根并验证成员资格
    root = get("clients/{identifier}/consensusStates/{height}")
    // 验证 nextSequenceRecv 是否如声明的那样
    assert(root.verifyMembership(path, nextSequenceRecv, proof))
}
```

### 属性与不变性

正确性保证和 GRANDPA 轻客户端算法相同。

## 向后兼容性

不适用。

## 向前兼容性

不适用。更改客户端验证算法将需要新的客户端标准。

## 示例实现

暂无。

## 其他实现

目前暂无。

## 历史

2020年3月15日-初始版本

## 版权

本规范所有内容均采用 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可授权。
