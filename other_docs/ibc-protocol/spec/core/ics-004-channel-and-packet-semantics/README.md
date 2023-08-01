---
ics: '4'
title: 通道和数据包语义
stage: 草案
category: IBC/TAO
kind: 实例化
requires: 2, 3, 5, 24
author: Christopher Goes <cwgoes@tendermint.com>
created: '2019-03-07'
modified: '2019-08-25'
---

## 概要

“通道”抽象为区块链间通信协议提供消息传递语义，分为三类：排序、仅一次传递和模块许可。通道充当数据包在一条链上的模块与另一条链上的模块之间传递的通道，从而确保数据包仅被执行一次，按照其发送顺序进行传递（如有必要），并仅传递给拥有目标链上通道的另一端的相应的模块。每个通道都与一个特定的连接关联，并且一个连接可以具有任意数量的关联通道，从而允许使用公共标识符，并利用连接和轻客户端在所有通道上分摊区块头验证的成本。

通道不关心其中传递的内容。发送和接收 IBC 数据包的模块决定如何构造数据包数据，以及如何对传入的数据包数据进行操作，并且必须利用其自身的应用程序逻辑来根据数据包中的数据来确定要应用的状态转换。

### 动机

区块链间通信协议使用跨链消息传递模型。 外部中继器进程将 IBC *数据包*从一条链中继到另一条链。链`A`和链`B`独立的确认新的块，并且从一个链到另一个链的数据包可能会被任意延迟、审查或重新排序。数据包对于中继器是可见的，并且可以被任何中继器进程读取，然后被提交给任何其他链。

IBC 协议必须保证顺序（对于有序通道）和仅有一次传递，以允许应用程序得知两条链上已连接模块的组合状态。

> **例如**: 一个应用程序可能希望允许单个通证化的资产在多个区块链之间转移并保留在多个区块链上，同时保留同质化和供应量。当特定的 IBC 数据包提交到链`B`时，应用程序可以在链`B`上铸造资产凭证，并要求链`A`将等额的资产托管在链`A`上，直到以后以相反的 IBC 数据包将凭证兑换回链`A`为止。这种顺序保证结合正确的应用逻辑，可以确保两个链上的资产总量不变，并且在链`B`上铸造的任何资产凭证都可以之后兑换回链`A`上。

为了向应用层提供所需的排序、仅有一次传递和模块许可语义，区块链间通信协议必须实现一种抽象以强制执行这些语义——通道就是这种抽象。

### 定义

`ConsensusState` 在 [ICS 2](../ics-002-client-semantics) 中被定义.

`Connection` 在 [ICS 3](../ics-003-connection-semantics) 中被定义.

`Port`和`authenticateCapability`在 [ICS 5](../ics-005-port-allocation) 中被定义。

`hash`是一种通用的抗碰撞哈希函数，其细节必须由使用通道的模块商定。 `hash`在不同的链可以有不同的定义。

`Identifier` ， `get` ， `set` ， `delete` ， `getCurrentHeight`和模块系统相关的原语在 [ICS 24](../ics-024-host-requirements) 中被定义。

*通道*是用于在单独的区块链上的特定模块之间进行仅一次数据包传递的管道，该模块至少具备数据包发送端和数据包接收端。

*双向*通道是数据包可以在两个方向上流动的通道：从`A`到`B`和从`B`到`A`

*单向*通道是指数据包只能沿一个方向流动的通道：从`A`到`B` （或从`B`到`A` ，命名的顺序是任意的）。

*有序*通道是指完全按照发送顺序传递数据包的通道。

*无序*通道是指可以以任何顺序传递数据包的通道，该顺序可能与数据包的发送顺序不同。

```typescript
enum ChannelOrder {
  ORDERED,
  UNORDERED,
}
```

方向和顺序是无关的，因此可以说双向无序通道，单向有序通道等。

所有通道均提供有且仅有一次的数据包传递，这意味着在通道的一端发送的数据包最终将不多于且不少于一次的传递到另一端。

该规范仅涉及*双向*通道。*单向*通道可以使用几乎完全相同的协议，并将在以后的 ICS 中进行概述。

通道端是一条链上存储通道元数据的数据结构：

```typescript
interface ChannelEnd {
  state: ChannelState
  ordering: ChannelOrder
  counterpartyPortIdentifier: Identifier
  counterpartyChannelIdentifier: Identifier
  connectionHops: [Identifier]
  version: string
}
```

- `state`是通道端的当前状态。
- `ordering`字段指示通道是有序的还是无序的。
- `counterpartyPortIdentifier`标识通道另一端的对应链上的端口号。
- `counterpartyChannelIdentifier`标识对应链的通道端。
- `nextSequenceSend`是单独存储的，追踪下一个要发送的数据包的序号。
- `nextSequenceRecv`是单独存储的，追踪要接收的下一个数据包的序号。
- `nextSequenceAck`是单独存储的，追踪下一个准备被确认的数据包的序号。
- `connectionHops`按顺序的存储在此通道上发送的数据包将途径的连接标识符列表。目前，此列表的长度必须为 1。将来可能会支持多跳通道。
- `version`字符串存储一个不透明的通道版本，在握手期间达成一致。这可以确定模块级配置，例如通道使用哪种数据包编码。核心 IBC 协议不使用此版本。如果版本字符串包含供应用程序解析和解释的结构化元数据，则最佳做法是在 JSON 结构中编码所有元数据并将编组后的字符串包含在版本字段中。

通道端具有以下*状态* ：

```typescript
enum ChannelState {
  INIT,
  TRYOPEN,
  OPEN,
  CLOSED,
}
```

- 处于`INIT`状态的通道端，表示刚刚开始了握手的建立。
- 处于`TRYOPEN`状态的通道端表示已确认对方链的握手。
- 处于`OPEN`状态的通道端，表示已完成握手，并为发送和接收数据包作好了准备。
- 处于`CLOSED`状态的通道端，表示通道已关闭，不能再用于发送或接收数据包。

区块链间通信协议中的`Packet`是如下定义的特定接口：

```typescript
interface Packet {
  sequence: uint64
  timeoutHeight: uint64
  timeoutTimestamp: uint64
  sourcePort: Identifier
  sourceChannel: Identifier
  destPort: Identifier
  destChannel: Identifier
  data: bytes
}
```

- `sequence`对应于发送和接收的顺序，其中序号靠前的数据包必须比序号靠后的数据包先发送或接收。
- `timeoutHeight`指示目标链上的一个共识高度，此高度后不再处理数据包，而是计为已超时。
- `timeoutTimestamp`指示目标链上的一个时间戳，此后将不再处理数据包，而是记为已超时。
- `sourcePort`标识发送链上的端口。
- `sourceChannel`标识发送链上的通道端。
- `destPort`标识接收链上的端口。
- `destChannel`标识接收链上的通道端。
- `data`是不透明的值，可以由关联模块的应用程序逻辑定义。

请注意，`Packet`绝不会直接序列化。而是在某些函数调用中使用的中间结构，可能需要由调用 IBC 处理程序的模块来创建或处理该中间结构。

`OpaquePacket`是一个数据包，但是被主机状态机掩盖为一种模糊的数据类型，因此，除了将其传递给 IBC 处理程序之外，模块无法对其进行任何操作。IBC 处理程序可以将`Packet`转换为`OpaquePacket` ，或反过来。

```typescript
type OpaquePacket = object
```

### 所需属性

#### 效率

- 数据包传输和确认的速度应仅受底层链速度的限制。证明应尽可能是批量化的。

#### 仅单次传递

- 在通道的一端发送的 IBC 数据包应仅一次的传递到另一端。
- 对于仅一次的安全性，不需要网络同步假设。如果其中一条链或两条链都挂起了，则数据包最多传递不超过一次，并且一旦链恢复，数据包就应该能够再次流转。

#### 排序

- 在有序通道上，应按相同的顺序发送和接收数据包：如果数据包 *x* 在链`A`通道端的数据包 *y* 之前发送，则数据包 *x* 必须在相应的链`B`通道端的数据包 *y* 之前收到。
- 在无序通道上，可以以任何顺序发送和接收数据包。像有序数据包一样，无序数据包具有单独的根据目标链高度指定的超时高度。

#### 许可

- 通道应该在握手期间被通道两端的模块许可，并且此后不可变更（更高级别的逻辑可以通过标记端口的所有权来标记通道所有权）。只有与通道端关联的模块才能在其上发送或接收数据包。

## 技术规范

### 数据流可视化

客户端、连接、通道和数据包的体系结构：

![Dataflow Visualisation](dataflow.png)

### 预备知识

#### 存储路径

通道的结构存储在一个结合了端口标识符和通道标识符的唯一存储路径前缀下：

```typescript
function channelPath(portIdentifier: Identifier, channelIdentifier: Identifier): Path {
    return "ports/{portIdentifier}/channels/{channelIdentifier}"
}
```

与通道关联的能力键存储在`channelCapabilityPath` ：

```typescript
function channelCapabilityPath(portIdentifier: Identifier, channelIdentifier: Identifier): Path {
  return "{channelPath(portIdentifier, channelIdentifier)}/key"
}
```

无符号整数计数器`nextSequenceSend` ， `nextSequenceRecv`和`nextSequenceAck`是分别存储的，因此可以单独证明它们：

```typescript
function nextSequenceSendPath(portIdentifier: Identifier, channelIdentifier: Identifier): Path {
    return "{channelPath(portIdentifier, channelIdentifier)}/nextSequenceSend"
}

function nextSequenceRecvPath(portIdentifier: Identifier, channelIdentifier: Identifier): Path {
    return "{channelPath(portIdentifier, channelIdentifier)}/nextSequenceRecv"
}

function nextSequenceAckPath(portIdentifier: Identifier, channelIdentifier: Identifier): Path {
    return "{channelPath(portIdentifier, channelIdentifier)}/nextSequenceAck"
}
```

固定大小的加密承诺数据包数据字段存储在数据包序号下：

```typescript
function packetCommitmentPath(portIdentifier: Identifier, channelIdentifier: Identifier, sequence: uint64): Path {
    return "{channelPath(portIdentifier, channelIdentifier)}/packets/" + sequence
}
```

存储中缺失的路径相当于占用零位。

数据包接收数据存储在`packetReceiptPath`

```typescript
function packetAcknowledgementPath(portIdentifier: Identifier, channelIdentifier: Identifier, sequence: uint64): Path {
    return "{channelPath(portIdentifier, channelIdentifier)}/acknowledgements/" + sequence
}
```

数据包回执数据存储在`packetAcknowledgementPath`下：

```typescript
function packetAcknowledgementPath(portIdentifier: Identifier, channelIdentifier: Identifier, sequence: uint64): Path {
    return "acks/ports/{portIdentifier}/channels/{channelIdentifier}/sequences/{sequence}"
}
```

### 版本控制

在握手过程中，通道的两端在与该通道关联的版本字节串上达成一致。 此版本字节串的内容对于 IBC 核心协议保持不透明。 状态机主机可以利用版本数据来标示其支持的 IBC/APP 协议，确认数据包编码格式，或在协商与 IBC 协议之上自定义逻辑有关的其他通道元数据。

状态机主机可以安全的忽略版本数据或指定一个空字符串。

### 子协议

> 注意：如果主机状态机正在使用对象能力认证（请参阅 [ICS 005](../ics-005-port-allocation) ），则所有使用端口的功能都将带有附加能力参数。

#### 标识符验证

通道存储在唯一的`(portIdentifier, channelIdentifier)`前缀下。 可以提供验证函数`validatePortIdentifier` 。

```typescript
type validateChannelIdentifier = (portIdentifier: Identifier, channelIdentifier: Identifier) => boolean
```

如果未提供，默认的`validateChannelIdentifier`函数将始终返回`true` 。

#### 通道生命周期管理

![Channel State Machine](channel-state-machine.png)

发起人 | 数据报 | 作用链 | 之前状态 (A, B) | 之后状态 (A, B)
--- | --- | --- | --- | ---
Actor | ChanOpenInit | A | (none, none) | (INIT, none)
中继器 | ChanOpenTry | B | (INIT, none) | (INIT, TRYOPEN)
中继器 | ChanOpenAck | A | (INIT, TRYOPEN) | (OPEN, TRYOPEN)
中继器 | ChanOpenConfirm | B | (OPEN, TRYOPEN) | (OPEN, OPEN)

发起人 | 数据报 | 作用链 | 之前状态 (A, B) | 之后状态 (A, B)
--- | --- | --- | --- | ---
Actor | ChanCloseInit | A | (OPEN, OPEN) | (CLOSED, OPEN)
中继器 | ChanCloseConfirm | B | (CLOSED, OPEN) | (CLOSED, CLOSED)

##### 建立握手

与另一个链上的模块发起通道建立握手的模块调用`chanOpenInit`函数。

建立通道必须提供本地通道标识符、本地端口、远程端口和远程通道的标识符。

当建立握手完成后，发起握手的模块将拥有在账本上已创建通道的一端，而对应的另一条链的模块将拥有通道的另一端。创建通道后，所有权就无法更改（尽管更高级别的抽象可以实现并提供此功能）。

链必须实现一个函数`generateIdentifier`，它选择一个标识符，例如通过增加一个计数器：

```typescript
type generateIdentifier = () -> Identifier
```

```typescript
function chanOpenInit(
  order: ChannelOrder,
  connectionHops: [Identifier],
  portIdentifier: Identifier,
  channelIdentifier: Identifier,
  counterpartyPortIdentifier: Identifier,
  counterpartyChannelIdentifier: Identifier,
  version: string): CapabilityKey {
    abortTransactionUnless(validateChannelIdentifier(portIdentifier, channelIdentifier))

    abortTransactionUnless(connectionHops.length === 1) // 用于 IBC 协议 v1

    abortTransactionUnless(provableStore.get(channelPath(portIdentifier, channelIdentifier)) === null)
    connection = provableStore.get(connectionPath(connectionHops[0]))

    // 允许Optimistic通道握手
    abortTransactionUnless(connection !== null)
    abortTransactionUnless(authenticateCapability(portPath(portIdentifier), portCapability))
    channel = ChannelEnd{INIT, order, counterpartyPortIdentifier,
                         counterpartyChannelIdentifier, connectionHops, version}
    provableStore.set(channelPath(portIdentifier, channelIdentifier), channel)
    channelCapability = newCapability(channelCapabilityPath(portIdentifier, channelIdentifier))
    provableStore.set(nextSequenceSendPath(portIdentifier, channelIdentifier), 1)
    provableStore.set(nextSequenceRecvPath(portIdentifier, channelIdentifier), 1)
    provableStore.set(nextSequenceAckPath(portIdentifier, channelIdentifier), 1)
    return channelCapability
}
```

模块调用`chanOpenTry`函数，以接受由另一条链上的模块发起的通道建立握手的第一步。

```typescript
function chanOpenTry(
  order: ChannelOrder,
  connectionHops: [Identifier],
  portIdentifier: Identifier,
  counterpartyChosenChannelIdentifer: Identifier,
  counterpartyPortIdentifier: Identifier,
  counterpartyChannelIdentifier: Identifier,
  version: string, // 弃用
  counterpartyVersion: string,
  proofInit: CommitmentProof,
  proofHeight: Height): CapabilityKey {
    channelIdentifier = generateIdentifier()

    abortTransactionUnless(validateChannelIdentifier(portIdentifier, channelIdentifier))
    abortTransactionUnless(connectionHops.length === 1) // 用于 IBC 协议的 v1
    abortTransactionUnless(authenticateCapability(portPath(portIdentifier), portCapability))
    connection = provableStore.get(connectionPath(connectionHops[0]))
    abortTransactionUnless(connection !== null)
    abortTransactionUnless(connection.state === OPEN)
    expected = ChannelEnd{INIT, order, portIdentifier,
                          "", [connection.counterpartyConnectionIdentifier], counterpartyVersion}
    abortTransactionUnless(connection.verifyChannelState(
      proofHeight,
      proofInit,
      counterpartyPortIdentifier,
      counterpartyChannelIdentifier,
      expected
    ))
    channel = ChannelEnd{TRYOPEN, order, counterpartyPortIdentifier,
                         counterpartyChannelIdentifier, connectionHops, version}
    provableStore.set(channelPath(portIdentifier, channelIdentifier), channel)
    channelCapability = newCapability(channelCapabilityPath(portIdentifier, channelIdentifier))

    // 初始化通道序列
    provableStore.set(nextSequenceSendPath(portIdentifier, channelIdentifier), 1)
    provableStore.set(nextSequenceRecvPath(portIdentifier, channelIdentifier), 1)
    provableStore.set(nextSequenceAckPath(portIdentifier, channelIdentifier), 1)

    return channelCapability
}
```

握手发起模块调用`chanOpenAck`，以确认收到对方链的模块已接受发起的请求。

```typescript
function chanOpenAck(
  portIdentifier: Identifier,
  channelIdentifier: Identifier,
  counterpartyChannelIdentifier: Identifier,
  counterpartyVersion: string,
  proofTry: CommitmentProof,
  proofHeight: Height) {
    channel = provableStore.get(channelPath(portIdentifier, channelIdentifier))
    abortTransactionUnless(channel.state === INIT || channel.state === TRYOPEN)
    abortTransactionUnless(authenticateCapability(channelCapabilityPath(portIdentifier, channelIdentifier), capability))
    connection = provableStore.get(connectionPath(channel.connectionHops[0]))
    abortTransactionUnless(connection !== null)
    abortTransactionUnless(connection.state === OPEN)
    expected = ChannelEnd{TRYOPEN, channel.order, portIdentifier,
                          channelIdentifier, [connection.counterpartyConnectionIdentifier], counterpartyVersion}
    abortTransactionUnless(connection.verifyChannelState(
      proofHeight,
      proofTry,
      channel.counterpartyPortIdentifier,
      counterpartyChannelIdentifier,
      expected
    ))
    channel.state = OPEN
    channel.version = counterpartyVersion
    channel.counterpartyChannelIdentifier = counterpartyChannelIdentifier
    provableStore.set(channelPath(portIdentifier, channelIdentifier), channel)
}
```

握手接受模块调用 `chanOpenConfirm` 函数以确认收到在另一条链上进行握手发起模块的回执，并完成通道创建握手。

```typescript
function chanOpenConfirm(
  portIdentifier: Identifier,
  channelIdentifier: Identifier,
  proofAck: CommitmentProof,
  proofHeight: Height) {
    channel = provableStore.get(channelPath(portIdentifier, channelIdentifier))
    abortTransactionUnless(channel !== null)
    abortTransactionUnless(channel.state === TRYOPEN)
    abortTransactionUnless(authenticateCapability(channelCapabilityPath(portIdentifier, channelIdentifier), capability))
    connection = provableStore.get(connectionPath(channel.connectionHops[0]))
    abortTransactionUnless(connection !== null)
    abortTransactionUnless(connection.state === OPEN)
    expected = ChannelEnd{OPEN, channel.order, portIdentifier,
                          channelIdentifier, [connection.counterpartyConnectionIdentifier], channel.version}
    abortTransactionUnless(connection.verifyChannelState(
      proofHeight,
      proofAck,
      channel.counterpartyPortIdentifier,
      channel.counterpartyChannelIdentifier,
      expected
    ))
    channel.state = OPEN
    provableStore.set(channelPath(portIdentifier, channelIdentifier), channel)
}
```

##### 关闭握手

两个模块中的任意一个通过调用`chanCloseInit`函数来关闭其通道端。一旦一端关闭，通道将无法重新打开。

调用模块可以在调用`chanCloseInit`时原子性的执行适当的应用程序逻辑。

通道关闭后，任何传递中的数据包都会超时。

```typescript
function chanCloseInit(
  portIdentifier: Identifier,
  channelIdentifier: Identifier) {
    abortTransactionUnless(authenticateCapability(channelCapabilityPath(portIdentifier, channelIdentifier), capability))
    channel = provableStore.get(channelPath(portIdentifier, channelIdentifier))
    abortTransactionUnless(channel !== null)
    abortTransactionUnless(channel.state !== CLOSED)
    connection = provableStore.get(connectionPath(channel.connectionHops[0]))
    abortTransactionUnless(connection !== null)
    abortTransactionUnless(connection.state === OPEN)
    channel.state = CLOSED
    provableStore.set(channelPath(portIdentifier, channelIdentifier), channel)
}
```

一旦一端已经关闭，对方模块调用`chanCloseConfirm`函数以关闭其通道端。

在调用`chanCloseConfirm`的同时，模块可以原子性的执行其他适当的应用逻辑。

关闭通道后，将无法重新打开通道，并且不能重复使用标识符。防止标识符重用是因为我们要防止潜在的重放先前发送的数据包。重放问题类似于直接使用序列号与带签名的消息，而不是用轻客户端算法对消息（IBC 数据包）进行“签名”，防止重放的序列值是端口标识符，通道标识符和数据包序列号的组合-因此我们不允许在序列号重置为零的情况下，再次使用相同的端口标识符和通道标识符，因为这可能允许重放数据包。如果要求并跟踪特定最大高度/时间的超时，则可以安全的重用标识符，将来版本的规范可能包含此功能。

```typescript
function chanCloseConfirm(
  portIdentifier: Identifier,
  channelIdentifier: Identifier,
  proofInit: CommitmentProof,
  proofHeight: uint64) {
    abortTransactionUnless(authenticateCapability(channelCapabilityPath(portIdentifier, channelIdentifier), capability))
    channel = provableStore.get(channelPath(portIdentifier, channelIdentifier))
    abortTransactionUnless(channel !== null)
    abortTransactionUnless(channel.state !== CLOSED)
    connection = provableStore.get(connectionPath(channel.connectionHops[0]))
    abortTransactionUnless(connection !== null)
    abortTransactionUnless(connection.state === OPEN)
    expected = ChannelEnd{CLOSED, channel.order, portIdentifier,
                          channelIdentifier, [connection.counterpartyConnectionIdentifier], channel.version}
    abortTransactionUnless(connection.verifyChannelState(
      proofHeight,
      proofInit,
      channel.counterpartyPortIdentifier,
      channel.counterpartyChannelIdentifier,
      expected
    ))
    channel.state = CLOSED
    provableStore.set(channelPath(portIdentifier, channelIdentifier), channel)
}
```

#### 数据包流和处理

![Packet State Machine](packet-state-machine.png)

##### 一个数据包的日常工作

以下的步骤发生在一个数据包从机器 *A* 上的模块 *1* 发送到机器 *B* 上的模块 *2*，从头开始。

该模块可以通过 [ICS 25](../ics-025-handler-interface) 或 [ICS 26](../ics-026-routing-module) 接入 IBC 处理程序。

1. 以任何顺序初始客户端和端口设置
    1. 在 *A* 上为 *B* 创建客户端（请参阅 [ICS 2](../ics-002-client-semantics) ）
    2. 在 *B* 上为 *A* 创建客户端（请参阅 [ICS 2](../ics-002-client-semantics) ）
    3. 模块 *1* 绑定到端口（请参阅 [ICS 5](../ics-005-port-allocation) ）
    4. 模块 *2* 绑定到端口（请参阅 [ICS 5](../ics-005-port-allocation) ），该端口以带外方式（out-of-band）传输到模块 *1*
2. 建立连接和通道，按顺序以optimistic方式发送（optimistic send）
    1. 模块 *1* 自 *A* 向 *B* 创建连接握手（请参见 [ICS 3](../ics-003-connection-semantics) ）
    2. 使用新创建的连接（此 ICS），自 *1* 向 *2* 开始创建通道握手
    3. 通过新创建的通道自 *1* 向 *2* 发送数据包（此 ICS）
3. 握手成功完成（如果任一握手失败，则连接/通道可以关闭且数据包超时）
    1. 连接握手成功完成（请参阅 [ICS 3](../ics-003-connection-semantics) ）（这需要中继器进程参与）
    2. 通道握手成功完成（此 ICS）（这需要中继器进程的参与）
4. 在状态机 *B* 的模块 *2* 上确认数据包（如果超过超时区块高度，则确认数据包超时）（这将需要中继器进程参与）
5. 回执从状态机 *B* 上的模块 *2* 被中继回状态机 *A* 上的模块 *1*

从空间上表示，两台机器之间的数据包传输可以表示如下：

![Packet Transit](packet-transit.png)

##### 发送数据包

`sendPacket`函数由模块调用，以便在调用模块的通道端将 IBC 数据包发送到另一条链上的相应模块。

在调用 `sendPacket`的同时，调用模块必须同时原子性的执行应用逻辑。

IBC 处理程序按顺序执行以下步骤：

- 检查用于发送数据包的通道和连接是否打开
- 检查调用模块是否拥有发送端口（参见[ICS 5](../ics-005-port-allocation) ）
- 检查目标链尚未达到指定的超时区块高度
- 递增通道关联的发送序号
- 存储对数据包数据和数据包超时信息的固定大小加密承诺

请注意，完整的数据包不会存储在链的状态中——仅仅存储数据和超时信息的短长度的哈希加密承诺。数据包数据可以从交易的执行中计算得出，并可能作为中继器可以索引的日志输出出来。

```typescript
function sendPacket(
  capability: CapabilityKey,
  sourcePort: Identifier,
  sourceChannel: Identifier,
  timeoutHeight: Height,
  timeoutTimestamp: uint64,
  data: bytes) {
    channel = provableStore.get(channelPath(sourcePort, sourceChannel))

    // 检查通道和连接是否打开以发送数据包；
    // 注意：一旦握手开始就允许optimistic发送
    abortTransactionUnless(channel !== null)
    abortTransactionUnless(channel.state !== CLOSED)
    connection = provableStore.get(connectionPath(channel.connectionHops[0]))
    abortTransactionUnless(connection !== null)

    // 检查调用模块是否拥有发送端口
    abortTransactionUnless(authenticateCapability(channelCapabilityPath(sourcePort, sourceChannel), capability))
    
    // 检查超时高度是否超过本地客户端中跟踪的接收链的高度
    latestClientHeight = provableStore.get(clientPath(connection.clientIdentifier)).latestClientHeight()
    abortTransactionUnless(packet.timeoutHeight === 0 || latestClientHeight < packet.timeoutHeight)

    // 递增发送序列计数器的序号
    sequence = provableStore.get(nextSequenceSendPath(packet.sourcePort, packet.sourceChannel))
    provableStore.set(nextSequenceSendPath(packet.sourcePort, packet.sourceChannel), sequence+1)

    // 存储对数据包数据和数据包超时的承诺
    provableStore.set(
      packetCommitmentPath(sourcePort, sourceChannel, sequence),
      hash(data, timeoutHeight, timeoutTimestamp)
    )

    // 记录：一个数据包可以安全发送
    emitLogEntry("sendPacket", {sequence: sequence, data: data, timeoutHeight: timeoutHeight, timeoutTimestamp: timeoutTimestamp})
}
```

#### 接收数据包

模块调用`recvPacket`函数以接收和处理在对应的链的通道端发送的 IBC 数据包。

在调用`recvPacket`函数的同时，调用模块必须原子性的执行应用逻辑，可能需要事先计算出数据包确认消息的值。

IBC 处理程序按顺序执行以下步骤：

- 检查接收数据包的通道和连接是否打开
- 检查调用模块是否拥有接收端口
- 检查数据包元数据与通道及连接信息是否匹配
- 检查数据包序号是通道端期望接收的（对于有序通道而言）
- 检查尚未达到超时高度
- 在传出链的状态下检查数据包数据的加密承诺包含证明
- 在数据包唯一的存储路径上设置一个不透明确认值（如果确认信息为非空或是无序通道）
- 递增与通道端关联的数据包接收序号（仅限有序通道）

我们传递签署和提交数据包的`relayer`者的地址，以使模块能够选择性地提供一些奖励。这为费用支付提供了基础，但也可用于其他技术（如计算一个排行榜）。

```typescript
function recvPacket(
  packet: OpaquePacket,
  proof: CommitmentProof,
  proofHeight: Height,
  relayer: string): Packet {

    channel = provableStore.get(channelPath(packet.destPort, packet.destChannel))
    abortTransactionUnless(channel !== null)
    abortTransactionUnless(channel.state === OPEN)
    abortTransactionUnless(authenticateCapability(channelCapabilityPath(packet.destPort, packet.destChannel), capability))
    abortTransactionUnless(packet.sourcePort === channel.counterpartyPortIdentifier)
    abortTransactionUnless(packet.sourceChannel === channel.counterpartyChannelIdentifier)

    abortTransactionUnless(connection !== null)
    abortTransactionUnless(connection.state === OPEN)

    abortTransactionUnless(packet.timeoutHeight === 0 || getConsensusHeight() < packet.timeoutHeight)
    abortTransactionUnless(packet.timeoutTimestamp === 0 || currentTimestamp() < packet.timeoutTimestamp)

    abortTransactionUnless(connection.verifyPacketData(
      proofHeight,
      proof,
      packet.sourcePort,
      packet.sourceChannel,
      packet.sequence,
      concat(packet.data, packet.timeoutHeight, packet.timeoutTimestamp)
    ))

    // 所有的断言都通过了（除了序列检查），于是我们可以改变状态

    if (channel.order === ORDERED) {
      nextSequenceRecv = provableStore.get(nextSequenceRecvPath(packet.destPort, packet.destChannel))
      abortTransactionUnless(packet.sequence === nextSequenceRecv)
      nextSequenceRecv = nextSequenceRecv + 1
      provableStore.set(nextSequenceRecvPath(packet.destPort, packet.destChannel), nextSequenceRecv)
    } else {
      // 对于无序通道，我们必须设置收据，以便在另一端进行验证
      // 这个收据不包含任何数据，因为数据包还没有被处理
      // 它只是一个单独的存储键，设置为空字符串，表示数据包已被接收
      abortTransactionUnless(provableStore.get(packetReceiptPath(packet.destPort, packet.destChannel, packet.sequence) === null))
      provableStore.set(
        packetReceiptPath(packet.destPort, packet.destChannel, packet.sequence),
        "1"
      )
    }

    // 记录：一个数据包已经被接收
    emitLogEntry("recvPacket", {sequence: packet.sequence, timeoutHeight: packet.timeoutHeight, port: packet.destPort, channel: packet.destChannel,
                                timeoutTimestamp: packet.timeoutTimestamp, data: packet.data})

    // 返回透明的数据包
    return packet
}
```

#### 编写回执

`writeAcknowledgement`函数由模块调用，以写入处理 IBC 数据包产生的数据；此IBC数据包可以由发送链验证，是一种“执行回执”或“RPC 调用响应”。

在调用 `writeAcknowledgement`的同时，调用模块必须同时原子性的执行应用逻辑。

这是一个异步回执，接收到回执数据时不需要确定其内容，仅在处理完成时确定。在同步情况下， `writeAcknowledgement`可以在与`recvPacket`相同的交易中（原子性地）调用。

不需要确认收到数据包；但是，如果有序通道使用回执，则必须确认所有数据包或不确认任何数据包（因为回执是按顺序处理的）。请注意，如果数据包未被确认收到，则无法在源链上删除数据包承诺。 IBC 的未来版本可能包括让模块指定它们是否将确认收到数据包的方法，以允许清理。

`writeAcknowledgement`*不*检查是否确实收到了正在确认的数据包，因为这将导致对已确认数据包的证明进行两次验证。验证这方面的正确性是调用模块的责任。调用模块必须仅使用先前从`recvPacket` 中收到的数据包调用`writeAcknowledgement`。

IBC 处理程序按顺序执行以下步骤：

- 检查此数据包的回执是否尚未写入
- 在数据包唯一的存储路径上写入不透明回执

```typescript
function writeAcknowledgement(
  packet: Packet,
  acknowledgement: bytes) {

    // 如果已经写了回执，流程终止
    abortTransactionUnless(provableStore.get(packetAcknowledgementPath(packet.destPort, packet.destChannel, packet.sequence) === null))

    // 写回执
    provableStore.set(
      packetAcknowledgementPath(packet.destPort, packet.destChannel, packet.sequence),
      hash(acknowledgement)
    )

    // 记录：一个数据包已被确认收到
    emitLogEntry("writeAcknowledgement", {sequence: packet.sequence, timeoutHeight: packet.timeoutHeight, port: packet.destPort, channel: packet.destChannel,
                                timeoutTimestamp: packet.timeoutTimestamp, data: packet.data, acknowledgement})
}
```

#### 处理回执

模块调用`acknowledgePacket`函数来处理先前发送到交易对手链上的数据包的回执。 `acknowledgePacket`还清理了数据包承诺，由于数据包已被接收并采取行动，因此可以清理。

调用模块可以结合调用`acknowledgePacket`以原子性的执行适当的应用程序回执处理逻辑。

我们像在<a>接收数据包</a>中一样传递<code>relayer</code>地址，以便在此处也允许可能的激励。

```typescript
function acknowledgePacket(
  packet: OpaquePacket,
  acknowledgement: bytes,
  proof: CommitmentProof,
  proofHeight: Height,
  relayer: string): Packet {

    // 中止交易，除非：该通道打开；调用模块拥有相关端口，并且数据包字段匹配
    channel = provableStore.get(channelPath(packet.sourcePort, packet.sourceChannel))
    abortTransactionUnless(channel !== null)
    abortTransactionUnless(channel.state === OPEN)
    abortTransactionUnless(authenticateCapability(channelCapabilityPath(packet.sourcePort, packet.sourceChannel), capability))
    abortTransactionUnless(packet.destPort === channel.counterpartyPortIdentifier)
    abortTransactionUnless(packet.destChannel === channel.counterpartyChannelIdentifier)

    connection = provableStore.get(connectionPath(channel.connectionHops[0]))
    abortTransactionUnless(connection !== null)
    abortTransactionUnless(connection.state === OPEN)

    // 验证我们发送了数据包并且还没有清除它
    abortTransactionUnless(provableStore.get(packetCommitmentPath(packet.sourcePort, packet.sourceChannel, packet.sequence))
           === hash(packet.data, packet.timeoutHeight, packet.timeoutTimestamp))

    // 除非交易对手链上有正确回执，否则中止交易
    abortTransactionUnless(connection.verifyPacketAcknowledgement(
      proofHeight,
      proof,
      packet.destPort,
      packet.destChannel,
      packet.sequence,
      acknowledgement
    ))

    // 除非按顺序处理回执，否则中止交易
    if (channel.order === ORDERED) {
      nextSequenceAck = provableStore.get(nextSequenceAckPath(packet.sourcePort, packet.sourceChannel))
      abortTransactionUnless(packet.sequence === nextSequenceAck)
      nextSequenceAck = nextSequenceAck + 1
      provableStore.set(nextSequenceAckPath(packet.sourcePort, packet.sourceChannel), nextSequenceAck)
    }

    // 所有的断言都通过了，于是我们可以改变状态

    // 删除我们的承诺，这样我们就不能再次“确认”
    provableStore.delete(packetCommitmentPath(packet.sourcePort, packet.sourceChannel, packet.sequence))

    // 返回透明数据包
    return packet
}
```

##### 回执数据封包

从远端链返回的回执在IBC 协议中被定义为任意字节。该数据可以编码后成功执行或失败（除了超时之外）。没有通用的方法来区分这两种情况，因为这要求每个客户端数据包可视化程序都了解每个特定应用程序的协议，以便区分中继成功或失败的情况。为了减少这个问题，我们提供了一个额外的回执格式的规范，这个范式[应该](https://www.ietf.org/rfc/rfc2119.txt)由每个应用程序特定的协议使用。

```proto
message Acknowledgement {
  oneof response {
    bytes result = 21;
    string error = 22;
  }
}
```

如果应用程序对回执字节使用不同的格式，它不得反序列化这种格式的有效 protobuf 消息。请注意，所有数据包都包含一个非空字段，它必须是正确的结果或错误。明确选择字段编号 21 和 22 是为了避免与用于回执的其他 protobuf 消息格式发生意外冲突。任何具有这种格式的消息的第一个字节将是非 ASCII 值`0xaa` （正确结果）或`0xb2` （错误）。

#### 超时

应用程序语义可能需要定义超时：超时是链在将一笔交易视作错误之前将等待多长时间的上限。由于这两个链本地时间的不同，因此这是一个明显的双花攻击的方向——攻击者可能延迟发送确认消息或在超时时间后发送数据包——因此应用程序本身无法安全的实现简单的超时逻辑。

请注意，为了避免任何可能的“双花”攻击，超时算法要求目标链正在运行并且是可访问的。一个人不能在一个网络完全分区（network parition）的情况下证明任何事情，并且必须等待连接。必须在接收者链上证明已经超时，而不仅仅是以发送链没有收到响应作为判断。

##### 发送端

`timeoutPacket`函数由最初尝试将数据包发送到对方链的模块在没有提交数据包的情况下对方链达到超时区块高度或超过超时时间戳的情况下调用，以证明该数据包无法再执行，并允许调用模块安全的执行适当的状态转换。

在调用`timeoutPacket`的同时，调用模块可以原子性的执行适当的应用超时处理逻辑。

在有序通道的情况下， `timeoutPacket`检查接收通道端的`recvSequence` ，如果数据包已超时，则关闭通道。

在无序通道的情况下， `timeoutPacket`检查是否存在确认（如果接收到数据包，则该确认将被写入）。面对超时的数据包，无序通道预期会继续工作。

如果连续的数据包的超时高度之间是强制的关系，则可以执行所有数据包的安全批量超时而不是使用超时数据包。该规范暂时省略了细节。

我们像在<a>接收数据包</a>中一样传递<code>relayer</code>地址，以便在此处也允许可能的激励。

```typescript
function timeoutPacket(
  packet: OpaquePacket,
  proof: CommitmentProof,
  proofHeight: Height,
  nextSequenceRecv: Maybe<uint64>,
  relayer: string): Packet {

    channel = provableStore.get(channelPath(packet.sourcePort, packet.sourceChannel))
    abortTransactionUnless(channel !== null)
    abortTransactionUnless(channel.state === OPEN)

    abortTransactionUnless(authenticateCapability(channelCapabilityPath(packet.sourcePort, packet.sourceChannel), capability))
    abortTransactionUnless(packet.destChannel === channel.counterpartyChannelIdentifier)

    connection = provableStore.get(connectionPath(channel.connectionHops[0]))
    // 注意：连接可能已经关闭
    abortTransactionUnless(packet.destPort === channel.counterpartyPortIdentifier)

    // 检查超时高度或超时时间戳是否已传递到另一端
    abortTransactionUnless(
      (packet.timeoutHeight > 0 && proofHeight >= packet.timeoutHeight) ||
      (packet.timeoutTimestamp > 0 && connection.getTimestampAtHeight(proofHeight) > packet.timeoutTimestamp))

    // 验证我们确实发送了这个数据包，检查存储
    abortTransactionUnless(provableStore.get(packetCommitmentPath(packet.sourcePort, packet.sourceChannel, packet.sequence))
           === hash(packet.data, packet.timeoutHeight, packet.timeoutTimestamp))

    if channel.order === ORDERED {
      // 有序通道：检查是否没有收到数据包
      abortTransactionUnless(nextSequenceRecv <= packet.sequence)
      // 有序通道：检查 recv 序列是否如声明的那样
      abortTransactionUnless(connection.verifyNextSequenceRecv(
        proofHeight,
        proof,
        packet.destPort,
        packet.destChannel,
        nextSequenceRecv
      ))
    } else
      // 无序通道：验证在数据包索引处没有收到收据
      abortTransactionUnless(connection.verifyPacketReceiptAbsence(
        proofHeight,
        proof,
        packet.destPort,
        packet.destChannel,
        packet.sequence
      ))

    // 所有的断言都通过了，我们可以改变状态

    // 删除我们的承诺
    provableStore.delete(packetCommitmentPath(packet.sourcePort, packet.sourceChannel, packet.sequence))

    if channel.order === ORDERED {
      // 有序通道：关闭通道
      channel.state = CLOSED
      provableStore.set(channelPath(packet.sourcePort, packet.sourceChannel), channel)
    }

    // 返回透明数据包
    return packet
}
```

##### 关闭时超时

`timeoutOnClose`函数由模块调用，以证明未接收到的数据包所发送到的通道已关闭，因此永远不会接收到数据包（即使尚未达到`timeoutHeight`或`timeoutTimestamp` ）。

在调用`timeoutOnClose`的同时，调用模块可以原子性的执行适当的应用超时处理逻辑。

我们像在<a>接收数据包</a>中一样传递<code>relayer</code>地址，以便在此处也允许可能的激励。

```typescript
function timeoutOnClose(
  packet: Packet,
  proof: CommitmentProof,
  proofClosed: CommitmentProof,
  proofHeight: Height,
  nextSequenceRecv: Maybe<uint64>,
  relayer: string): Packet {

    channel = provableStore.get(channelPath(packet.sourcePort, packet.sourceChannel))
    // 注意：连接可能已经关闭
    abortTransactionUnless(authenticateCapability(channelCapabilityPath(packet.sourcePort, packet.sourceChannel), capability))
    abortTransactionUnless(packet.destChannel === channel.counterpartyChannelIdentifier)

    connection = provableStore.get(connectionPath(channel.connectionHops[0]))
    // 注意：连接可能已经关闭
    abortTransactionUnless(packet.destPort === channel.counterpartyPortIdentifier)

    // 验证我们确实发送了这个数据包，检查存储
    abortTransactionUnless(provableStore.get(packetCommitmentPath(packet.sourcePort, packet.sourceChannel, packet.sequence))
           === hash(packet.data, packet.timeoutHeight, packet.timeoutTimestamp))

    // 检查对面通道端是否已关闭
    expected = ChannelEnd{CLOSED, channel.order, channel.portIdentifier,
                          channel.channelIdentifier, channel.connectionHops.reverse(), channel.version}
    abortTransactionUnless(connection.verifyChannelState(
      proofHeight,
      proofClosed,
      channel.counterpartyPortIdentifier,
      channel.counterpartyChannelIdentifier,
      expected
    ))

    if channel.order === ORDERED {
      // 有序通道：检查 recv 序列是否如声明的那样
      abortTransactionUnless(connection.verifyNextSequenceRecv(
        proofHeight,
        proof,
        packet.destPort,
        packet.destChannel,
        nextSequenceRecv
      ))
      // 有序通道：检查是否没有收到数据包
      abortTransactionUnless(nextSequenceRecv <= packet.sequence)
    } else
      // 无序通道：验证在数据包索引处没有收到收据
      abortTransactionUnless(connection.verifyPacketReceiptAbsence(
        proofHeight,
        proof,
        packet.destPort,
        packet.destChannel,
        packet.sequence
      ))

    // 所有的断言都通过了，我们可以改变状态

    // 删除我们的承诺
    provableStore.delete(packetCommitmentPath(packet.sourcePort, packet.sourceChannel, packet.sequence))

    if channel.order === ORDERED {
      // 有序通道：关闭通道
      channel.state = CLOSED
      provableStore.set(channelPath(packet.sourcePort, packet.sourceChannel), channel)
    }

    // 返回透明数据包
    return packet
}
```

##### 清理状态

必须确认数据包才能进行清理。

#### 关于竞态条件的探讨

##### 同时发生握手尝试

如果两台状态机同时彼此发起通道创建握手，或尝试使用相同的标识符，则两者都会失败，必须使用新的标识符。

##### 标识符分配

在目标链上分配标识符存在不可避免的竞态条件。最好建议模块使用伪随机，无价值的标识符。设法声明另一个模块希望使用的标识符，但是，尽管令人烦恼，中间人却无法在握手期间攻击，因为接收模块必须已经拥有握手用的目标端口。

##### 超时/数据包确认

数据包超时和数据包确认之间没有竞态条件，因为数据包只能在接收之前检查超过或没超过超时区块高度。

##### 握手期间的中间人攻击

跨链状态的验证可防止连接握手和通道握手期间的中间人攻击，因为模块已知道所有信息（源客户端、目标客户端、通道等），该信息将在启动握手之前进行确认完成。

##### 数据包传输过程中的连接/通道关闭

如果在传输数据包时关闭了连接或通道，则数据包将不再被目标链接收，并且在源链上超时。

#### 查询通道

可以使用`queryChannel`查询通道：

```typescript
function queryChannel(connId: Identifier, chanId: Identifier): ChannelEnd | void {
    return provableStore.get(channelPath(connId, chanId))
}
```

### 属性与不变性

- 通道和端口标识符的唯一组合是先到先服务的：分配了一对标示符后，只有拥有相应端口的模块才能在该通道上发送或接收。
- 假设链在超时窗口后依然有活性，则数据包只传递一次，并且在超时的情况下，只在发送链上超时一次。
- 通道握手不能受到区块链上的另一个模块或另一个区块链的 IBC 处理程序的中间人攻击。

## 向后兼容性

不适用。

## 向前兼容性

数据结构和编码可以在连接或通道级别进行版本控制。通道逻辑与数据包数据格式完全无关，模块可以随时以任何他们喜欢的方式更改。

## 示例实现

即将到来。

## 其他实现

即将到来。

## 发布历史

2019年6月5日-提交草案

2019年7月4日-修改无序通道和确认

2019年7月16日-更改“多跳”路由未来的兼容性

2019年7月29日-修改以处理连接关闭后的超时

2019年8月13日-多处修改

2019年8月25日-清理

## 版权

本规范所有内容均采用 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可授权。
