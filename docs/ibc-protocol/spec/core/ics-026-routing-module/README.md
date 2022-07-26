---
ics: '26'
title: 路由模块
stage: 草案
category: IBC/TAO
kind: 实例化
author: Christopher Goes <cwgoes@tendermint.com>
created: '2019-06-09'
modified: '2019-08-25'
---

## 概要

路由模块是一个辅助模块的默认实现，该模块将接受外部数据报并调用区块链间通信协议处理程序来处理握手和数据包中继。 路由模块维护一个模块的查找表，当收到数据包时，该表可用于查找和调用模块，因此外部中继器仅需要将数据包中继到路由模块。

### 动机

默认的 IBC 处理程序使用接收方调用模式，其中模块必须单独调用 IBC 处理程序才能绑定到端口，开始握手，接受握手，发送和接收数据包等。这是灵活而简单的。 但是理解起来有些棘手，中继器进程可能需要额外的工作，中继器进程必须跟踪多个模块的状态。该标准描述了一个 IBC“路由模块”，以自动执行大部分常用功能，路由数据包并简化中继器的任务。

路由模块还可以扮演 [ICS 5](../ics-005-port-allocation) 中讨论的模块管理器的角色，并实现确定何时允许模块绑定到端口以及可以命名哪些端口的逻辑。

### 定义

IBC 处理程序接口提供的所有函数均在 [ICS 25](../ics-025-handler-interface) 中定义。

函数 `newCapability` 和 `authenticateCapability` 在 [ICS 5](../ics-005-port-allocation) 中定义。

### 所需属性

- 模块应该能够通过路由模块绑定到端口和自己的通道。
- 除了调用中间层外，不应为数据包发送和接收增加任何开销。
- 当路由模块需要对数据包操作时，路由模块应在模块上调用指定的处理程序函数。

## 技术规范

> 注意：如果主机状态机正在使用对象能力认证（请参阅 [ICS 005](../ics-005-port-allocation) ），则所有使用端口的函数都需要带有一个附加的能力参数。

### 模块回调接口

模块必须向路由模块暴露以下函数签名，这些签名在收到各种数据报后即被调用：

#### **ChanOpenInit**

`onChanOpenInit`将验证中继器选择的参数是否有效并执行任何自定义的`INIT`逻辑。如果选择的参数无效，则可能会返回错误，在这种情况下握手将被中止。如果提供的版本字符串非空， `onChanOpenInit`应该返回版本字符串，如果提供的版本无效，则返回错误。如果版本字符串为空， `onChanOpenInit`应返回一个默认版本字符串，表示它支持的版本。如果应用程序没有默认的版本字符串，并且提供的版本为空字符串，它应该返回错误。

```typescript
function onChanOpenInit(
  order: ChannelOrder,
  connectionHops: [Identifier],
  portIdentifier: Identifier,
  channelIdentifier: Identifier,
  counterpartyPortIdentifier: Identifier,
  counterpartyChannelIdentifier: Identifier,
  version: string) => (version: string, err: Error) {
    // 由模块定义
}
```

#### **ChanOpenTry**

`onChanOpenTry`将验证 INIT 选择的参数以及交易对手选择的版本字符串并执行自定义`TRY`逻辑。如果 INIT 选择的参数无效，回调必须返回错误以中止握手。如果交易对手选择的版本与此模块支持的版本不兼容，回调必须返回错误以中止握手。如果版本兼容，try 回调必须选择最终版本字符串并将其返回给核心 IBC。 `onChanOpenTry`也可以执行自定义初始化逻辑。

```typescript
function onChanOpenTry(
  order: ChannelOrder,
  connectionHops: [Identifier],
  portIdentifier: Identifier,
  channelIdentifier: Identifier,
  counterpartyPortIdentifier: Identifier,
  counterpartyChannelIdentifier: Identifier,
  counterpartyVersion: string) => (version: string, err: Error) {
    // 由模块定义
}
```

#### **OnChanOpenAck**

如果交易对手选择的版本字符串无效以中止握手， `onChanOpenAck`将出错。它还可以执行自定义 ACK 逻辑。

```typescript
function onChanOpenAck(
  portIdentifier: Identifier,
  channelIdentifier: Identifier,
  counterpartyChannelIdentifier: Identifier,
  counterpartyVersion: string) {
    // 由模块定义
}
```

#### **OnChanOpenConfirm**

`onChanOpenConfirm`将执行自定义 CONFIRM 逻辑，并且可能会出错以中止握手。

```typescript
function onChanOpenConfirm(
  portIdentifier: Identifier,
  channelIdentifier: Identifier) {
    // 由模块定义
}
```

```typescript
function onChanCloseInit(
  portIdentifier: Identifier,
  channelIdentifier: Identifier) {
    // 由模块定义
}

function onChanCloseConfirm(
  portIdentifier: Identifier,
  channelIdentifier: Identifier): void {
    // 由模块定义
}

function onRecvPacket(packet: Packet, relayer: string): bytes {
    // 由模块定义， 返回回执
}

function onTimeoutPacket(packet: Packet, relayer: string) {
    // 由模块定义
}

function onAcknowledgePacket(packet: Packet, acknowledgement: bytes, relayer: string) {
    // 由模块定义
}

function onTimeoutPacketClose(packet: Packet, relayer: string) {
    // 由模块定义
}
```

如果出现失败，必须抛出异常以拒绝握手和传入的数据包等。

它们在`ModuleCallbacks`接口中组合在一起：

```typescript
interface ModuleCallbacks {
  onChanOpenInit: onChanOpenInit,
  onChanOpenTry: onChanOpenTry,
  onChanOpenAck: onChanOpenAck,
  onChanOpenConfirm: onChanOpenConfirm,
  onChanCloseConfirm: onChanCloseConfirm
  onRecvPacket: onRecvPacket
  onTimeoutPacket: onTimeoutPacket
  onAcknowledgePacket: onAcknowledgePacket,
  onTimeoutPacketClose: onTimeoutPacketClose
}
```

当模块绑定到端口时，将提供回调。

```typescript
function callbackPath(portIdentifier: Identifier): Path {
    return "callbacks/{portIdentifier}"
}
```

还将存储调用模块标识符以供将来更改回调时进行身份认证。

```typescript
function authenticationPath(portIdentifier: Identifier): Path {
    return "authentication/{portIdentifier}"
}
```

### 端口绑定作为模块管理器

IBC 路由模块位于处理程序模块（ [ICS 25](../ics-025-handler-interface) ）与主机状态机上的各个模块之间。

充当模块管理器的路由模块区分两种端口：

- “现有名称”端口：例如具有标准化优先含义的“bank”，不应以先到先得的方式使用
- “新名称”端口：没有先前关系的新身份（可能是智能合约）、新的随机数端口、生成后的端口名称可以通过另一个通道进行通信

当主机状态机实例化路由模块时，会分配一组现有名称以及相应的模块。 然后，路由模块允许模块随时分配新端口，但是它们必须使用特定的标准化前缀。

模块可以调用函数`bindPort`以便通过路由模块绑定到端口并设置回调。

```typescript
function bindPort(
  id: Identifier,
  callbacks: Callbacks): CapabilityKey {
    abortTransactionUnless(privateStore.get(callbackPath(id)) === null)
    privateStore.set(callbackPath(id), callbacks)
    capability = handler.bindPort(id)
    claimCapability(authenticationPath(id), capability)
    return capability
}
```

模块可以调用函数`updatePort`来更改回调。

```typescript
function updatePort(
  id: Identifier,
  capability: CapabilityKey,
  newCallbacks: Callbacks) {
    abortTransactionUnless(authenticateCapability(authenticationPath(id), capability))
    privateStore.set(callbackPath(id), newCallbacks)
}
```

模块可以调用函数`releasePort`来释放以前使用的端口。

> 警告：释放端口将允许其他模块绑定到该端口，并可能拦截传入的通道创建握手请求。只有在安全的情况下，模块才应释放端口。

```typescript
function releasePort(
  id: Identifier,
  capability: CapabilityKey) {
    abortTransactionUnless(authenticateCapability(authenticationPath(id), capability))
    handler.releasePort(id)
    privateStore.delete(callbackPath(id))
    privateStore.delete(authenticationPath(id))
}
```

路由模块可以使用函数`lookupModule`查找绑定到特定端口的回调。

```typescript
function lookupModule(portId: Identifier) {
    return privateStore.get(callbackPath(portId))
}
```

### 数据报处理程序（写入）

*数据报*是路由模块做为交易接受的外部数据 Blob。本部分为每个数据报定义一个*处理函数* ， 当关联的数据报在交易中提交给路由模块时执行。

所有数据报也可以由其他模块安全的提交给路由模块。

除了明确指出，不假定任何消息签名或数据有效性检查。

#### 客户端生命周期管理

`ClientCreate`使用指定的标识符和共识状态创建一个新的轻客户端。

```typescript
interface ClientCreate {
  identifier: Identifier
  type: ClientType
  consensusState: ConsensusState
}
```

```typescript
function handleClientCreate(datagram: ClientCreate) {
    handler.createClient(datagram.identifier, datagram.type, datagram.consensusState)
}
```

`ClientUpdate`使用指定的标识符和新区块头更新现有的轻客户端。

```typescript
interface ClientUpdate {
  identifier: Identifier
  header: Header
}
```

```typescript
function handleClientUpdate(datagram: ClientUpdate) {
    handler.updateClient(datagram.identifier, datagram.header)
}
```

`ClientSubmitMisbehaviour`使用指定的标识符向现有的轻客户端提交不良行为证明。

```typescript
interface ClientMisbehaviour {
  identifier: Identifier
  evidence: bytes
}
```

```typescript
function handleClientMisbehaviour(datagram: ClientUpdate) {
    handler.submitMisbehaviourToClient(datagram.identifier, datagram.evidence)
}
```

#### 连接生命周期管理

`ConnOpenInit`数据报开始与另一个链上的 IBC 模块的连接的握手过程。

```typescript
interface ConnOpenInit {
  identifier: Identifier
  desiredCounterpartyIdentifier: Identifier
  clientIdentifier: Identifier
  counterpartyClientIdentifier: Identifier
  version: string
}
```

```typescript
function handleConnOpenInit(datagram: ConnOpenInit) {
    handler.connOpenInit(
      datagram.identifier,
      datagram.desiredCounterpartyIdentifier,
      datagram.clientIdentifier,
      datagram.counterpartyClientIdentifier,
      datagram.version
    )
}
```

`ConnOpenTry`数据报接受从另一个链上的 IBC 模块发来的握手请求。

```typescript
interface ConnOpenTry {
  desiredIdentifier: Identifier
  counterpartyConnectionIdentifier: Identifier
  counterpartyClientIdentifier: Identifier
  clientIdentifier: Identifier
  version: string
  counterpartyVersion: string
  proofInit: CommitmentProof
  proofConsensus: CommitmentProof
  proofHeight: uint64
  consensusHeight: uint64
}
```

```typescript
function handleConnOpenTry(datagram: ConnOpenTry) {
    handler.connOpenTry(
      datagram.desiredIdentifier,
      datagram.counterpartyConnectionIdentifier,
      datagram.counterpartyClientIdentifier,
      datagram.clientIdentifier,
      datagram.version,
      datagram.counterpartyVersion,
      datagram.proofInit,
      datagram.proofConsensus,
      datagram.proofHeight,
      datagram.consensusHeight
    )
}
```

`ConnOpenAck`数据报确认另一条链上的 IBC 模块接受了握手。

```typescript
interface ConnOpenAck {
  identifier: Identifier
  version: string
  proofTry: CommitmentProof
  proofConsensus: CommitmentProof
  proofHeight: uint64
  consensusHeight: uint64
}
```

```typescript
function handleConnOpenAck(datagram: ConnOpenAck) {
    handler.connOpenAck(
      datagram.identifier,
      datagram.version,
      datagram.proofTry,
      datagram.proofConsensus,
      datagram.proofHeight,
      datagram.consensusHeight
    )
}
```

`ConnOpenConfirm`数据报确认另一个链上的 IBC 模块的握手回执并完成连接。

```typescript
interface ConnOpenConfirm {
  identifier: Identifier
  proofAck: CommitmentProof
  proofHeight: uint64
}
```

```typescript
function handleConnOpenConfirm(datagram: ConnOpenConfirm) {
    handler.connOpenConfirm(
      datagram.identifier,
      datagram.proofAck,
      datagram.proofHeight
    )
}
```

#### 通道生命周期管理

```typescript
interface ChanOpenInit {
  order: ChannelOrder
  connectionHops: [Identifier]
  portIdentifier: Identifier
  channelIdentifier: Identifier
  counterpartyPortIdentifier: Identifier
  counterpartyChannelIdentifier: Identifier
  version: string
}
```

```typescript
function handleChanOpenInit(datagram: ChanOpenInit) {
    module = lookupModule(datagram.portIdentifier)
    version, err = module.onChanOpenInit(
      datagram.order,
      datagram.connectionHops,
      datagram.portIdentifier,
      datagram.channelIdentifier,
      datagram.counterpartyPortIdentifier,
      datagram.counterpartyChannelIdentifier,
      datagram.version
    )
    abortTransactionUnless(err === nil)
    handler.chanOpenInit(
      datagram.order,
      datagram.connectionHops,
      datagram.portIdentifier,
      datagram.channelIdentifier,
      datagram.counterpartyPortIdentifier,
      datagram.counterpartyChannelIdentifier,
      version // pass in version returned from callback
    )
}
```

```typescript
interface ChanOpenTry {
  order: ChannelOrder
  connectionHops: [Identifier]
  portIdentifier: Identifier
  channelIdentifier: Identifier
  counterpartyPortIdentifier: Identifier
  counterpartyChannelIdentifier: Identifier
  version: string // 弃用
  counterpartyVersion: string
  proofInit: CommitmentProof
  proofHeight: Height
}
```

```typescript
function handleChanOpenTry(datagram: ChanOpenTry) {
    module = lookupModule(datagram.portIdentifier)
    version, err = module.onChanOpenTry(
      datagram.order,
      datagram.connectionHops,
      datagram.portIdentifier,
      datagram.channelIdentifier,
      datagram.counterpartyPortIdentifier,
      datagram.counterpartyChannelIdentifier,
      datagram.counterpartyVersion
    )
    abortTransactionUnless(err === nil)
    handler.chanOpenTry(
      datagram.order,
      datagram.connectionHops,
      datagram.portIdentifier,
      datagram.channelIdentifier,
      datagram.counterpartyPortIdentifier,
      datagram.counterpartyChannelIdentifier,
      version, // 由回调返回的版本号
      datagram.counterpartyVersion,
      datagram.proofInit,
      datagram.proofHeight
    )
}
```

```typescript
interface ChanOpenAck {
  portIdentifier: Identifier
  channelIdentifier: Identifier
  version: string
  proofTry: CommitmentProof
  proofHeight: uint64
}
```

```typescript
function handleChanOpenAck(datagram: ChanOpenAck) {
    module = lookupModule(datagram.portIdentifier)
    err = module.onChanOpenAck(
      datagram.portIdentifier,
      datagram.channelIdentifier,
      datagram.counterpartyChannelIdentifier,
      datagram.counterpartyVersion
    )
    abortTransactionUnless(err === nil)
    handler.chanOpenAck(
      datagram.portIdentifier,
      datagram.channelIdentifier,
      datagram.counterpartyChannelIdentifier,
      datagram.counterpartyVersion,
      datagram.proofTry,
      datagram.proofHeight
    )
}
```

```typescript
interface ChanOpenConfirm {
  portIdentifier: Identifier
  channelIdentifier: Identifier
  proofAck: CommitmentProof
  proofHeight: uint64
}
```

```typescript
function handleChanOpenConfirm(datagram: ChanOpenConfirm) {
    module = lookupModule(datagram.portIdentifier)
    err = module.onChanOpenConfirm(
      datagram.portIdentifier,
      datagram.channelIdentifier
    )
    abortTransactionUnless(err === nil)
    handler.chanOpenConfirm(
      datagram.portIdentifier,
      datagram.channelIdentifier,
      datagram.proofAck,
      datagram.proofHeight
    )
}
```

```typescript
interface ChanCloseInit {
  portIdentifier: Identifier
  channelIdentifier: Identifier
}
```

```typescript
function handleChanCloseInit(datagram: ChanCloseInit) {
    module = lookupModule(datagram.portIdentifier)
    err = module.onChanCloseInit(
      datagram.portIdentifier,
      datagram.channelIdentifier
    )
    abortTransactionUnless(err === nil)
    handler.chanCloseInit(
      datagram.portIdentifier,
      datagram.channelIdentifier
    )
}
```

```typescript
interface ChanCloseConfirm {
  portIdentifier: Identifier
  channelIdentifier: Identifier
  proofInit: CommitmentProof
  proofHeight: uint64
}
```

```typescript
function handleChanCloseConfirm(datagram: ChanCloseConfirm) {
    module = lookupModule(datagram.portIdentifier)
    err = module.onChanCloseConfirm(
      datagram.portIdentifier,
      datagram.channelIdentifier
    )
    abortTransactionUnless(err === nil)
    handler.chanCloseConfirm(
      datagram.portIdentifier,
      datagram.channelIdentifier,
      datagram.proofInit,
      datagram.proofHeight
    )
}
```

#### 数据包中继

数据包直接由模块发送（由模块调用 IBC 处理程序）。

```typescript
interface PacketRecv {
  packet: Packet
  proof: CommitmentProof
  proofHeight: uint64
}
```

```typescript
function handlePacketRecv(datagram: PacketRecv) {
    module = lookupModule(datagram.packet.sourcePort)
    acknowledgement = module.onRecvPacket(datagram.packet)
    handler.recvPacket(
      datagram.packet,
      datagram.proof,
      datagram.proofHeight,
      acknowledgement
    )
}
```

```typescript
interface PacketAcknowledgement {
  packet: Packet
  acknowledgement: string
  proof: CommitmentProof
  proofHeight: uint64
}
```

```typescript
function handlePacketAcknowledgement(datagram: PacketAcknowledgement) {
    module = lookupModule(datagram.packet.sourcePort)
    module.onAcknowledgePacket(
      datagram.packet,
      datagram.acknowledgement
    )
    handler.acknowledgePacket(
      datagram.packet,
      datagram.acknowledgement,
      datagram.proof,
      datagram.proofHeight
    )
}
```

#### 数据包超时

```typescript
interface PacketTimeout {
  packet: Packet
  proof: CommitmentProof
  proofHeight: uint64
  nextSequenceRecv: Maybe<uint64>
}
```

```typescript
function handlePacketTimeout(datagram: PacketTimeout) {
    module = lookupModule(datagram.packet.sourcePort)
    module.onTimeoutPacket(datagram.packet)
    handler.timeoutPacket(
      datagram.packet,
      datagram.proof,
      datagram.proofHeight,
      datagram.nextSequenceRecv
    )
}
```

```typescript
interface PacketTimeoutOnClose {
  packet: Packet
  proof: CommitmentProof
  proofHeight: uint64
}
```

```typescript
function handlePacketTimeoutOnClose(datagram: PacketTimeoutOnClose) {
    module = lookupModule(datagram.packet.sourcePort)
    module.onTimeoutPacket(datagram.packet)
    handler.timeoutOnClose(
      datagram.packet,
      datagram.proof,
      datagram.proofHeight
    )
}
```

#### 超时关闭和数据包清理

```typescript
interface PacketCleanup {
  packet: Packet
  proof: CommitmentProof
  proofHeight: uint64
  nextSequenceRecvOrAcknowledgement: Either<uint64, bytes>
}
```

### 查询（只读）函数

客户端，连接和通道的所有查询函数应直接由 IBC 处理程序模块暴露出来（只读）。

### 接口用法示例

有关用法示例，请参见 [ICS 20](../../app/ics-020-fungible-token-transfer) 。

### 属性与不变性

- 代理端口绑定是先到先服务：模块通过  IBC路由模块绑定到端口后，只有该模块才能使用该端口，直到模块释放它为止。

## 向后兼容性

不适用。

## 向前兼容性

路由模块与 IBC 处理程序接口紧密相关。

## 示例实现

即将到来。

## 其他实现

即将到来。

## 历史

2019年6月9日-提交的草案

2019年7月28日-重大修订

2019年8月25日-重大修订

## 版权

本规范所有内容均采用 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可授权。
