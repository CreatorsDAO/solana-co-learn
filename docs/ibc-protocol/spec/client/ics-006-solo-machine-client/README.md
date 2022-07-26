---
ics: '6'
title: 单机客户端
stage: 草案
category: IBC/TAO
kind: 实例化
implements: '2'
author: Christopher Goes <cwgoes@tendermint.com>
created: '2019-12-09'
modified: '2019-12-09'
---

## 概要

本标准描述了具有单个可更新公钥的单机客户端（验证算法），该客户端实现了 [ICS 2](../../core/ics-002-client-semantics) 接口。

### 动机

单机——可能是诸如手机，浏览器或笔记本电脑之类的设备，它们希望与使用 IBC 的其他机器和多副本帐本进行交互，并且可以通过统一的客户端接口来实现。

单机客户端大致类似于”隐式帐户”，可以用来代替账本上的“常规交易”，从而允许所有交易通过 IBC 的统一接口进行。

### 定义

函数和术语定义见 [ICS 2](../../core/ics-002-client-semantics) 。

### 所需属性

该规范必须满足 [ICS 2](../../core/ics-002-client-semantics) 中定义的客户端接口。

从概念上讲，我们假设有一个“全局的大签名表”（生成的签名是公开的）并相应的包含了重放保护。

## 技术指标

该规范包含 [ICS 2](../../core/ics-002-client-semantics) 定义的所有函数的实现。

### 客户端状态

单机的`ClientState`就是简单的指客户端是否被冻结。

```typescript
interface ClientState {
  frozen: boolean
  consensusState: ConsensusState
}
```

### 共识状态

单机的`ConsensusState`由当前公钥、当前区分符、序列号和时间戳组成。

区分符是一个任意字符串，在创建客户端时被选定，旨在允许相同的公钥在不同的单机客户端（可能在不同的链上）重复使用，而不会被视为不当行为。

```typescript
interface ConsensusState {
  sequence: uint64
  publicKey: PublicKey
  diversifier: string
  timestamp: uint64
}
```

### 区块高度

单机的`Height`只是一个`uint64` ，可以用来做普通的比较操作。

### 区块头

当机器希望更新公钥或区分符时， `Header` 必须由单机提供。

```typescript
interface Header {
  sequence: uint64
  timestamp: uint64
  signature: Signature
  newPublicKey: PublicKey
  newDiversifier: string
}
```

### 不良行为

单机器的`不良行为`包括一个序号和该序号上不同消息的两个签名。

```typescript
interface SignatureAndData {
  sig: Signature
  data: []byte
}

interface Misbehaviour {
  sequence: uint64
  signatureOne: SignatureAndData
  signatureTwo: SignatureAndData
}
```

### 签名

签名在客户端状态验证功能的`Proof`字段中提供。其中的数据和时间戳也必须签名。

```typescript
interface Signature {
  data: []byte
  timestamp: uint64
}
```

### 客户端初始化

单机客户端`initialise`函数以初始共识状态启动一个未冻结的客户端。

```typescript
function initialise(consensusState: ConsensusState): ClientState {
  return {
    frozen: false,
    consensusState
  }
}
```

单机客户端`latestClientHeight`函数返回最新的序号。

```typescript
function latestClientHeight(clientState: ClientState): uint64 {
  return clientState.consensusState.sequence
}
```

### 合法性判定

单机客户端的`checkValidityAndUpdateState`函数检查当前注册的公共密钥是否对新的公共密钥和正确的序号进行了签名。

```typescript
function checkValidityAndUpdateState(
  clientState: ClientState,
  header: Header) {
  assert(header.sequence === clientState.consensusState.sequence)
  assert(header.timestamp >= clientstate.consensusState.timestamp)
  assert(checkSignature(header.newPublicKey, header.sequence, header.diversifier, header.signature))
  clientState.consensusState.publicKey = header.newPublicKey
  clientState.consensusState.diversifier = header.newDiversifier
  clientState.consensusState.timestamp = header.timestamp
  clientState.consensusState.sequence++
}
```

### 不良行为判定

任何当前公钥在不同消息上的重复签名都会冻结单机客户端。

```typescript
function checkMisbehaviourAndUpdateState(
  clientState: ClientState,
  misbehaviour: Misbehaviour) {
    h1 = misbehaviour.h1
    h2 = misbehaviour.h2
    pubkey = clientState.consensusState.publicKey
    diversifier = clientState.consensusState.diversifier
    timestamp = clientState.consensusState.timestamp
    // 断言：时间戳可能已经欺骗了轻客户端
    assert(misbehaviour.h1.signature.timestamp >= timestamp)
    assert(misbehaviour.h2.signature.timestamp >= timestamp)
    // 断言：签名数据不同
    assert(misbehaviour.h1.signature.data !== misbehaviour.h2.signature.data)
    // 断言：签名有效
    assert(checkSignature(pubkey, misbehaviour.sequence, diversifier, misbehaviour.h1.signature.data))
    assert(checkSignature(pubkey, misbehaviour.sequence, diversifier, misbehaviour.h2.signature.data))
    // 冻结客户端
    clientState.frozen = true
}
```

### 状态验证函数

所有单机客户端状态验证函数都仅检查签名，该签名必须由单机提供。

请注意，值的拼接应该以特定的状态机的转义方式实现。

```typescript
function verifyClientState(
  clientState: ClientState,
  height: uint64,
  prefix: CommitmentPrefix,
  proof: CommitmentProof,
  clientIdentifier: Identifier,
  counterpartyClientState: ClientState) {
    path = applyPrefix(prefix, "clients/{clientIdentifier}/clientState")
    // ICS 003 在连接验证后不会增加证明高度
    // 单机客户端必须增加证明高度以确保匹配签名中使用的预期序列
    abortTransactionUnless(height + 1 == clientState.consensusState.sequence)
    abortTransactionUnless(!clientState.frozen)
    abortTransactionUnless(proof.timestamp >= clientState.consensusState.timestamp)
    value = clientState.consensusState.sequence + clientState.consensusState.diversifier + proof.timestamp + path + counterpartyClientState
    assert(checkSignature(clientState.consensusState.pubKey, value, proof.sig))
    clientState.consensusState.sequence++
    clientState.consensusState.timestamp = proof.timestamp
}

function verifyClientConsensusState(
  clientState: ClientState,
  height: uint64,
  prefix: CommitmentPrefix,
  proof: CommitmentProof,
  clientIdentifier: Identifier,
  consensusStateHeight: uint64,
  consensusState: ConsensusState) {
    path = applyPrefix(prefix, "clients/{clientIdentifier}/consensusState/{consensusStateHeight}")
    // ICS 003 在连接或客户端状态验证后不会增加证明高度
    // 单机客户端必须将证明高度增加 2 以确保匹配签名中使用的预期序列
    abortTransactionUnless(height + 2 == clientState.consensusState.sequence)
    abortTransactionUnless(!clientState.frozen)
    abortTransactionUnless(proof.timestamp >= clientState.consensusState.timestamp)
    value = clientState.consensusState.sequence + clientState.consensusState.diversifier + proof.timestamp + path + consensusState
    assert(checkSignature(clientState.consensusState.pubKey, value, proof.sig))
    clientState.consensusState.sequence++
    clientState.consensusState.timestamp = proof.timestamp
}

function verifyConnectionState(
  clientState: ClientState,
  height: uint64,
  prefix: CommitmentPrefix,
  proof: CommitmentProof,
  connectionIdentifier: Identifier,
  connectionEnd: ConnectionEnd) {
    path = applyPrefix(prefix, "connection/{connectionIdentifier}")
    abortTransactionUnless(height == clientState.consensusState.sequence)
    abortTransactionUnless(!clientState.frozen)
    abortTransactionUnless(proof.timestamp >= clientState.consensusState.timestamp)
    value = clientState.consensusState.sequence + clientState.consensusState.diversifier + proof.timestamp + path + connectionEnd
    assert(checkSignature(clientState.consensusState.pubKey, value, proof.sig))
    clientState.consensusState.sequence++
    clientState.consensusState.timestamp = proof.timestamp
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
    abortTransactionUnless(height == clientState.consensusState.sequence)
    abortTransactionUnless(!clientState.frozen)
    abortTransactionUnless(proof.timestamp >= clientState.consensusState.timestamp)
    value = clientState.consensusState.sequence + clientState.consensusState.diversifier + proof.timestamp + path + channelEnd
    assert(checkSignature(clientState.consensusState.pubKey, value, proof.sig))
    clientState.consensusState.sequence++
    clientState.consensusState.timestamp = proof.timestamp
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
    abortTransactionUnless(height == clientState.consensusState.sequence)
    abortTransactionUnless(!clientState.frozen)
    abortTransactionUnless(proof.timestamp >= clientState.consensusState.timestamp)
    value = clientState.consensusState.sequence + clientState.consensusState.diversifier + proof.timestamp + path + data
    assert(checkSignature(clientState.consensusState.pubKey, value, proof.sig))
    clientState.consensusState.sequence++
    clientState.consensusState.timestamp = proof.timestamp
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
    abortTransactionUnless(height == clientState.consensusState.sequence)
    abortTransactionUnless(!clientState.frozen)
    abortTransactionUnless(proof.timestamp >= clientState.consensusState.timestamp)
    value = clientState.consensusState.sequence + clientState.consensusState.diversifier + proof.timestamp + path + acknowledgement
    assert(checkSignature(clientState.consensusState.pubKey, value, proof.sig))
    clientState.consensusState.sequence++
    clientState.consensusState.timestamp = proof.timestamp
}

function verifyPacketReceiptAbsence(
  clientState: ClientState,
  height: uint64,
  prefix: CommitmentPrefix,
  proof: CommitmentProof,
  portIdentifier: Identifier,
  channelIdentifier: Identifier,
  sequence: uint64) {
    path = applyPrefix(prefix, "ports/{portIdentifier}/channels/{channelIdentifier}/receipts/{sequence}")
    abortTransactionUnless(height == clientState.consensusState.sequence)
    abortTransactionUnless(!clientState.frozen)
    abortTransactionUnless(proof.timestamp >= clientState.consensusState.timestamp)
    value = clientState.consensusState.sequence + clientState.consensusState.diversifier + proof.timestamp + path
    assert(checkSignature(clientState.consensusState.pubKey, value, proof.sig))
    clientState.consensusState.sequence++
    clientState.consensusState.timestamp = proof.timestamp
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
    abortTransactionUnless(height == clientState.consensusState.sequence)
    abortTransactionUnless(!clientState.frozen)
    abortTransactionUnless(proof.timestamp >= clientState.consensusState.timestamp)
    value = clientState.consensusState.sequence + clientState.consensusState.diversifier + proof.timestamp + path + nextSequenceRecv
    assert(checkSignature(clientState.consensusState.pubKey, value, proof.sig))
    clientState.consensusState.sequence++
    clientState.consensusState.timestamp = proof.timestamp
}
```

### 属性与不变性

实例化[ICS 2](../../core/ics-002-client-semantics)中定义的接口。

## 向后兼容性

不适用。

## 向前兼容性

不适用。更改客户端验证算法将需要新的客户端标准。

## 示例实现

暂无。

## 其他实现

目前暂无。

## 历史

2019年12月9日-2019年12月17日初始版本-最后一份初稿

## 版权

本规范所有内容均采用 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可授权。
