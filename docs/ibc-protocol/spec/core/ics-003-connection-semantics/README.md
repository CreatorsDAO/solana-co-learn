---
ics: '3'
title: 连接语义
stage: 草案
category: IBC/TAO
kind: 实例化
requires: 2, 24
required-by: 4, 25
author: Christopher Goes <cwgoes@tendermint.com>, Juwoon Yun <joon@tendermint.com>
created: '2019-03-07'
modified: '2019-08-25'
---

## 概要

本标准文档对 IBC *连接*的抽象进行描述：即两条独立链上的两个有状态的对象（*连接端* ），彼此与另一条链上的轻客户端关联，并共同利于跨链子状态的验证和数据包的关联（通过通道）。本规范描述了用于在两条链上安全建立连接的协议。

### 动机

核心 IBC 协议对数据包提供了*身份认证*和*排序*语义：确保对各自来说，数据包在发送链上被提交（根据状态转换的执行，例如通证托管），并且数据包被有且仅有一次的按特定的顺序提交和有且仅有一次的被传递到接收链。本标准中的*连接*抽象与 [ICS 2](../ics-002-client-semantics) 中定义的*客户端*抽象一同定义了 IBC 的*身份认证*语义。排序语义在 [ICS 4](../ics-004-channel-and-packet-semantics) 中进行了描述。

### 定义

客户端相关的类型和函数的定义见 [ICS 2](../ics-002-client-semantics) 。

加密承诺证明相关的类型和函数的定义见[ICS 23](../ics-023-vector-commitments) 。

`Identifier`和其他主机状态机的要求如 [ICS 24](../ics-024-host-requirements) 所示。标识符不一定需要是人类可读的名称（基本上也不应该是，来防止对标识符的抢注或争夺）。

开放式握手协议允许每条链验证用于引用另一条链上连接的标识符，从而使每条链上的模块能够得知另一条链上的引用。

本规范中提到的*参与者*是能够执行数据报的实体，并为计算/存储付费（通过 gas 或类似的机制），但是是不被信任的。 可能的参与者包括：

- 使用帐户密钥签名的最终用户
- 自主或响应另一笔交易的链上智能合约
- 响应其他交易或按计划方式运行的链上模块

### 所需属性

- 区块链实现应该安全的允许不受信的参与者建立或更新连接。

#### 连接建立前阶段

在建立连接之前：

- 连接阶段之后的 IBC 子协议不应该能被操作，因为跨链子状态还没被验证。
- 发起方（创建连接方）必须能够为被连接的链和连接的链指定初始共识状态（隐式的，例如通过发送交易）。

#### 握手期间

一旦握手协商开始：

- 只有相关的握手数据报才可以按顺序被执行。
- 没有第三条链可以伪装成正在发生握手的两条链中的一条

#### 完成握手后阶段

一旦握手协商完成：

- 在两个链上创建的连接对象均包含发起方指定的共识状态。
- 其他连接对象不能通过重放数据报的方式在其他链上恶意的被创建。

## 技术规范

### 数据结构

此 ICS 定义了`ConnectionState`和`ConnectionEnd`类型：

```typescript
enum ConnectionState {
  INIT,
  TRYOPEN,
  OPEN,
}
```

```typescript
interface ConnectionEnd {
  state: ConnectionState
  counterpartyConnectionIdentifier: Identifier
  counterpartyPrefix: CommitmentPrefix
  clientIdentifier: Identifier
  counterpartyClientIdentifier: Identifier
  version: string | []string
  delayPeriodTime: uint64
  delayPeriodBlocks: uint64
}
```

- `state`字段描述连接端的当前状态。
- `counterpartyConnectionIdentifier`字段标识与此连接关联的对方链上的连接端。
- `counterpartyPrefix`字段包含用于与此连接关联的对方链上的状态验证的前缀。链应该公开一个端点，以允许中继器查询连接前缀。如果没有指定，默认`counterpartyPrefix`的`"ibc"`应该被使用。
- `clientIdentifier`字段标识与此连接关联的客户端。
- `counterpartyClientIdentifier`字段标识与此连接关联的对方链上的客户端。
- `version`字段是不透明的字符串，可用于确定使用此连接的通道或数据包的编码或协议。如果未指定，则应使用 `""`的默认`version`。
- `delayPeriodTime`指示在验证区块头之后必须等待的时间，然后才能处理数据包、回执、接收证明或超时。
- `delayPeriodBlocks`指示在验证区块头之后必须等待的以块为单位的时间段的数值，然后才能处理数据包、回执、接收证明或超时。

### 储存路径

连接路径存储在唯一标识符下。

```typescript
function connectionPath(id: Identifier): Path {
    return "connections/{id}"
}
```

从客户端到一组连接（用于使用客户端查找所有连接）的反向映射存储在每个客户端的唯一前缀下：

```typescript
function clientConnectionsPath(clientIdentifier: Identifier): Path {
    return "clients/{clientIdentifier}/connections"
}
```

### 辅助函数

`addConnectionToClient`用于将连接标识符添加到与客户端关联的连接集合。

```typescript
function addConnectionToClient(
  clientIdentifier: Identifier,
  connectionIdentifier: Identifier) {
    conns = privateStore.get(clientConnectionsPath(clientIdentifier))
    conns.add(connectionIdentifier)
    privateStore.set(clientConnectionsPath(clientIdentifier), conns)
}
```

帮助函数由连接定义，将与连接关联的`CommitmentPrefix`传递给客户端提供的验证函数。在规范的其他部分，这些函数必须用于检查其他链的状态，而不是直接调用客户端上的验证函数。

```typescript
function verifyClientConsensusState(
  connection: ConnectionEnd,
  height: Height,
  proof: CommitmentProof,
  clientIdentifier: Identifier,
  consensusStateHeight: Height,
  consensusState: ConsensusState) {
    client = queryClient(connection.clientIdentifier)
    return client.verifyClientConsensusState(connection, height, connection.counterpartyPrefix, proof, clientIdentifier, consensusStateHeight, consensusState)
}

function verifyConnectionState(
  connection: ConnectionEnd,
  height: Height,
  proof: CommitmentProof,
  connectionIdentifier: Identifier,
  connectionEnd: ConnectionEnd) {
    client = queryClient(connection.clientIdentifier)
    return client.verifyConnectionState(connection, height, connection.counterpartyPrefix, proof, connectionIdentifier, connectionEnd)
}

function verifyChannelState(
  connection: ConnectionEnd,
  height: Height,
  proof: CommitmentProof,
  portIdentifier: Identifier,
  channelIdentifier: Identifier,
  channelEnd: ChannelEnd) {
    client = queryClient(connection.clientIdentifier)
    return client.verifyChannelState(connection, height, connection.counterpartyPrefix, proof, portIdentifier, channelIdentifier, channelEnd)
}

function verifyPacketData(
  connection: ConnectionEnd,
  height: Height,
  proof: CommitmentProof,
  portIdentifier: Identifier,
  channelIdentifier: Identifier,
  sequence: uint64,
  data: bytes) {
    client = queryClient(connection.clientIdentifier)
    return client.verifyPacketData(connection, height, connection.delayPeriodTime, connection.delayPeriodBlocks, connection.counterpartyPrefix, proof, portIdentifier, channelIdentifier, sequence, data)
}

function verifyPacketAcknowledgement(
  connection: ConnectionEnd,
  height: Height,
  proof: CommitmentProof,
  portIdentifier: Identifier,
  channelIdentifier: Identifier,
  sequence: uint64,
  acknowledgement: bytes) {
    client = queryClient(connection.clientIdentifier)
    return client.verifyPacketAcknowledgement(connection, height, connection.delayPeriodTime, connection.delayPeriodBlocks, connection.counterpartyPrefix, proof, portIdentifier, channelIdentifier, sequence, acknowledgement)
}

function verifyPacketReceiptAbsence(
  connection: ConnectionEnd,
  height: Height,
  proof: CommitmentProof,
  portIdentifier: Identifier,
  channelIdentifier: Identifier,
  sequence: uint64) {
    client = queryClient(connection.clientIdentifier)
    return client.verifyPacketReceiptAbsence(connection, height, connection.delayPeriodTime, connection.delayPeriodBlocks, connection.counterpartyPrefix, proof, portIdentifier, channelIdentifier, sequence)
}

// 可选：verifyPacketReceipt 仅需要支持 ORDERED 和 UNORDERED 之外的新通道类型。
function verifyPacketReceipt(
  connection: ConnectionEnd,
  height: Height,
  proof: CommitmentProof,
  portIdentifier: Identifier,
  channelIdentifier: Identifier,
  sequence: uint64,
  receipt: bytes) {
    client = queryClient(connection.clientIdentifier)
    return client.verifyPacketReceipt(connection, height, connection.delayPeriodTime, connection.delayPeriodBlocks, connection.counterpartyPrefix, proof, portIdentifier, channelIdentifier, sequence, receipt)
}

function verifyNextSequenceRecv(
  connection: ConnectionEnd,
  height: Height,
  proof: CommitmentProof,
  portIdentifier: Identifier,
  channelIdentifier: Identifier,
  sequence: uint64,
  nextSequenceRecv: uint64) {
    client = queryClient(connection.clientIdentifier)
    return client.verifyNextSequenceRecv(connection, height, connection.delayPeriodTime, connection.delayPeriodBlocks, connection.counterpartyPrefix, proof, portIdentifier, channelIdentifier, sequence, nextSequenceRecv)
}

function getTimestampAtHeight(
  connection: ConnectionEnd,
  height: Height) {
    client = queryClient(connection.clientIdentifier)
    return client.queryConsensusState(height).getTimestamp()
}
```

### 子协议

本 ICS 定义了建立握手子协议。一旦握手建立，连接将不能被关闭，标识符也无法被重新分配（这防止了数据包重放或者身份认证混乱）。

区块头追踪和不良行为检测定义见 [ICS 2](../ics-002-client-semantics) 。

![State Machine Diagram](https://github.com/octopus-network/ibc/blob/zh-cn-2022/spec/core/ics-003-connection-semantics/state.png?raw=true)

#### 标识符验证

连接存储在唯一的`Identifier`前缀下。 可以提供验证函数`validateConnectionIdentifier`。

```typescript
type validateConnectionIdentifier = (id: Identifier) => boolean
```

如果未提供，默认的`validateConnectionIdentifier`函数将始终返回`true`。

#### 版本控制

在握手过程中，连接的两端需要对连接关联的版本字节串达成一致。目前，版本字节串的内容对于 IBC 核心协议是不透明的。将来，它可能被用于指示哪些类型的通道可以使用特定的连接，或者通道相关的数据报将使用哪种编码格式。目前，主机状态机可以利用版本数据来协商与 IBC 之上的自定义逻辑有关的编码、优先级或特定与连接的元数据。

主机状态机也可以安全地忽略版本数据或指定一个空字符串。假设运行开放握手的两条链至少有一个共同的兼容版本（即两条链的兼容版本必须有一个非空的交集）。如果两条链没有任何可以被双方都接受的版本，握手将失败。

该标准的一个实现必须定义一个函数`getCompatibleVersions` ，该函数返回它支持的版本列表，按优先级降序排列。

```typescript
type getCompatibleVersions = () => []string
```

实现必须定义一个函数`pickVersion`，该函数能从版本列表中选择一个版本。请注意，如果执行握手的两条链实现了不同的`pickVersion`函数，则（可能有不良行为的）中继器可能能够通过在两条链上执行`INIT`和`OPENTRY`来停止握手，此时它们将选择不同的版本并且无法继续。

```typescript
type pickVersion = ([]string) => string
```

#### 建立握手

建立握手子协议用于在两条链上初始化彼此的共识状态。

建立握手定义了四种数据报： *ConnOpenInit* ， *ConnOpenTry* ， *ConnOpenAck*和*ConnOpenConfirm* 。

一个正确的协议执行流程如下：（注意所有的请求都是按照 ICS 25 来制定的）

发起人 | 数据报 | 作用链 | 之前状态（A，B） | 之后状态（A，B）
--- | --- | --- | --- | ---
Actor | `ConnOpenInit` | A | (none, none) | （INIT，none）
中继器 | `ConnOpenTry` | B | （INIT，none） | （INIT，TRYOPEN）
中继器 | `ConnOpenAck` | A | （INIT，TRYOPEN） | (OPEN, TRYOPEN)
中继器 | `ConnOpenConfirm` | B | (OPEN, TRYOPEN) | (OPEN, OPEN)

在实现子协议的两个链之间的建立握手结束时，应具有以下属性：

- 每条链都具有源自发起方所指定的对方链正确共识状态。
- 每条链都知道且认同另一链上的标识符。

该子协议不需要经过许可，除了考虑反垃圾信息。

链必须实现一个函数`generateIdentifier` ，它选择一个标识符，例如通过增加一个计数器：

```typescript
type generateIdentifier = () -> Identifier
```

可以选择将特定版本作为`version`传递，以确保握手或者携带版本信息一起成功或失败。

*ConnOpenInit* 初始化链 A 上的连接尝试。

```typescript
function connOpenInit(
  counterpartyPrefix: CommitmentPrefix,
  clientIdentifier: Identifier,
  counterpartyClientIdentifier: Identifier,
  version: string,
  delayPeriodTime: uint64,
  delayPeriodBlocks: uint64) {
    identifier = generateIdentifier()
    abortTransactionUnless(provableStore.get(connectionPath(identifier)) == null)
    state = INIT
    if version != "" {
      // 手动选择的版本必须是我们可以支持的版本
      abortTransactionUnless(getCompatibleVersions().indexOf(version) > -1)
      versions = [version]
    } else {
      versions = getCompatibleVersions()
    }
    connection = ConnectionEnd{state, "", counterpartyPrefix,
      clientIdentifier, counterpartyClientIdentifier, versions, delayPeriodTime, delayPeriodBlocks}
    provableStore.set(connectionPath(identifier), connection)
    addConnectionToClient(clientIdentifier, identifier)
}
```

*ConnOpenTry*中继链 A 到链 B 的连接尝试的通知（此代码在链 B 上执行）。

```typescript
function connOpenTry(
  previousIdentifier: Identifier,
  counterpartyConnectionIdentifier: Identifier,
  counterpartyPrefix: CommitmentPrefix,
  counterpartyClientIdentifier: Identifier,
  clientIdentifier: Identifier,
  counterpartyVersions: string[],
  delayPeriodTime: uint64,
  delayPeriodBlocks: uint64,
  proofInit: CommitmentProof,
  proofConsensus: CommitmentProof,
  proofHeight: Height,
  consensusHeight: Height) {
    if (previousIdentifier !== "") {
      previous = provableStore.get(connectionPath(identifier))
      abortTransactionUnless(
        (previous !== null) &&
        (previous.state === INIT &&
         previous.counterpartyConnectionIdentifier === "" &&
         previous.counterpartyPrefix === counterpartyPrefix &&
         previous.clientIdentifier === clientIdentifier &&
         previous.counterpartyClientIdentifier === counterpartyClientIdentifier &&
         previous.delayPeriodTime === delayPeriodTime
         previous.delayPeriodBlocks === delayPeriodBlocks))
      identifier = previousIdentifier
    } else {
      // 如果传递的标识符是哨兵空字符串，则生成一个新的标识符
      identifier = generateIdentifier()
    }
    abortTransactionUnless(consensusHeight < getCurrentHeight())
    expectedConsensusState = getConsensusState(consensusHeight)
    expected = ConnectionEnd{INIT, "", getCommitmentPrefix(), counterpartyClientIdentifier,
                             clientIdentifier, counterpartyVersions, delayPeriodTime, delayPeriodBlocks}
    versionsIntersection = intersection(counterpartyVersions, previous !== null ? previous.version : getCompatibleVersions())
    version = pickVersion(versionsIntersection) // 如果没有交集则抛出错误
    connection = ConnectionEnd{TRYOPEN, counterpartyConnectionIdentifier, counterpartyPrefix,
                               clientIdentifier, counterpartyClientIdentifier, version, delayPeriodTime, delayPeriodBlocks}
    abortTransactionUnless(connection.verifyConnectionState(proofHeight, proofInit, counterpartyConnectionIdentifier, expected))
    abortTransactionUnless(connection.verifyClientConsensusState(
      proofHeight, proofConsensus, counterpartyClientIdentifier, consensusHeight, expectedConsensusState))
    provableStore.set(connectionPath(identifier), connection)
    addConnectionToClient(clientIdentifier, identifier)
}
```

*ConnOpenAck* 对从链 B 返回链 A 的连接建立尝试的确认消息进行中继（此代码在链 A 上执行）。

```typescript
function connOpenAck(
  identifier: Identifier,
  version: string,
  counterpartyIdentifier: Identifier,
  proofTry: CommitmentProof,
  proofConsensus: CommitmentProof,
  proofHeight: Height,
  consensusHeight: Height) {
    abortTransactionUnless(consensusHeight < getCurrentHeight())
    connection = provableStore.get(connectionPath(identifier))
    abortTransactionUnless(
        (connection.state === INIT && connection.version.indexOf(version) !== -1)
        || (connection.state === TRYOPEN && connection.version === version))
    expectedConsensusState = getConsensusState(consensusHeight)
    expected = ConnectionEnd{TRYOPEN, identifier, getCommitmentPrefix(),
                             connection.counterpartyClientIdentifier, connection.clientIdentifier,
                             version, connection.delayPeriodTime, connection.delayPeriodBlocks}
    abortTransactionUnless(connection.verifyConnectionState(proofHeight, proofTry, counterpartyIdentifier, expected))
    abortTransactionUnless(connection.verifyClientConsensusState(
      proofHeight, proofConsensus, connection.counterpartyClientIdentifier, consensusHeight, expectedConsensusState))
    connection.state = OPEN
    connection.version = version
    connection.counterpartyConnectionIdentifier = counterpartyIdentifier
    provableStore.set(connectionPath(identifier), connection)
}
```

*ConnOpenConfirm*在两条链上都建立连接后确认链 A 与链 B 的连接的建立（此代码在链 B 上执行）。

```typescript
function connOpenConfirm(
  identifier: Identifier,
  proofAck: CommitmentProof,
  proofHeight: uint64) {
    connection = provableStore.get(connectionPath(identifier))
    abortTransactionUnless(connection.state === TRYOPEN)
    expected = ConnectionEnd{OPEN, identifier, getCommitmentPrefix(), connection.counterpartyClientIdentifier,
                             connection.clientIdentifier, connection.version}
    abortTransactionUnless(connection.verifyConnectionState(proofHeight, proofAck, connection.counterpartyConnectionIdentifier, expected))
    connection.state = OPEN
    provableStore.set(connectionPath(identifier), connection)
}
```

#### 查询

可以使用标识符和`queryConnection`来查询连接。

```typescript
function queryConnection(id: Identifier): ConnectionEnd | void {
    return provableStore.get(connectionPath(id))
}
```

可以使用客户端标识符和`queryClientConnections`来查询与特定客户端关联的连接。

```typescript
function queryClientConnections(id: Identifier): Set<Identifier> {
    return privateStore.get(clientConnectionsPath(id))
}
```

### 属性与不变性

- 连接标识符是“先到先得”的：一旦连接被商定，两个链之间就会存在一对唯一的标识符。
- 连接握手不能被另一条链的 IBC 处理程序作为中间人来进行干预。

## 向后兼容性

不适用。

## 向前兼容性

此 ICS 的未来版本将在建立握手中包括版本协商。建立连接并协商版本后，可以根据 ICS 6 协商将来的版本更新。

只能在建立连接时选择的共识协议定义的`updateConsensusState`函数允许的情况下更新共识状态。

## 示例实现

即将到来。

## 其他实现

即将到来。

## 历史

本文档的部分内容受到[先前 IBC 规范](../../../archive)的启发。

2019年3月29日-提交初稿

2019年5月17日-草稿定稿

2019年7月29日-修订版本以跟踪与客户端关联的连接集

## 版权

本规范所有内容均采用 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可授权。
