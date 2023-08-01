---
ics: '29'
title: 通用性费用支付
stage: 草案
category: IBC/APP
requires: 4, 25, 26, 30
kind: 实例化
author: Aditya Sripal <aditya@interchain.berlin>, Ethan Frey <ethan@confio.tech>
created: '2021-06-01'
modified: '2021-06-18'
---

## 大纲

该标准文档规定了基于 ICS 应用协议处理费用支付的数据包数据结构、状态机处理逻辑和编码细节。规范需要对回执信息（acknowledgement）进行一些更改，但可以被任何应用程序采用，而不会强制其他应用程序使用此实现。

### 动机

关于中继器的通用激励机制已经有很多讨论。此前曾有一个简单提案提议[扩展 ICS20 以激励目标链上的中继器](https://github.com/cosmos/ibc/pull/577)。但是提案只针对 ICS20，不适用于其他协议。随后，该提案扩展为可被任何 ICS 应用协议采用的[更加通用的费用支付设计](https://github.com/cosmos/ibc/issues/578)。

一般来说，除非有明确的方式来激励中继器，否则跨链版图很难扩大。我们寻求定义一个清晰的接口，使任何应用都可以轻松采用，同时不排除不使用通证（token）的链。

### 所需属性

- 对及时传送数据包的行为进行激励（调用`recvPacket` ）
- 对中继数据包回执（acknowledegement）信息的行为进行激励（调用`acknowledgePacket`）
- 对在数据包送达之前已过期的中继超时（timeout）信息的行为进行激励（如当数据包接收费用过低时）（调用`timeoutPacket`）
- 不产生额外的 IBC 数据包
- 即使目标链不支持同质化通证（fungible token）概念，单向传送仍有效
- 需选用（opt-in）实现此规范的每一条链。例如链 A 上支持费用的 ICS27 功能可以连接到链 B 上不支持费用的 ICS27 功能
- 实现此扩展规范的每条链均须具有标准接口
- 需在同一框架内支持自定义费用处理逻辑
- 中继器地址不可伪造
- 启用无需许可或需要许可的中继服务

### 定义

`forward relayer`: 为数据包提交`recvPacket` 消息的中继器

`reverse relayer`: 为数据包提交`acknowledgePacket`消息的中继器

`timeout relayer`: 为数据包提交`timeoutPacket` 或`timeoutOnClose` 消息的中继器

`source address`:  发送数据包的链上中继器地址

`destination address`:  接收数据包的链上中继器地址

## 技术规范

### 总体设计

为避免因应用程序数据包数量顺序产生额外的费用数据包，并提供选用方法，我们仅在源链上存储所有费用支付信息。源链是数据包发送者唯一能够提供通证用以奖励数据包的链。费用分配可能仅针对性的实现，因此不必出现在 IBC 规范中（文档中只需出现高级要求）。

对于所有数据包相关信息，我们要求[中继器地址必须对应用模块可见](https://github.com/cosmos/ibc/pull/579)，以便模块能够激励数据包中继器。由此，`acknowledgePacket`、`timeoutPacket`，和`timeoutOnClose` 消息能够获得中继器地址，并向这些地址发送托管通证（escrowed tokens）. 但是，我们需要一种可靠的方式来获取将`recvPacket`消息从目标链提交至源链的中继器地址。实际上，我们需要的是中继器用以付款的源链地址，而不是为数据包签名的目标链地址。

为赋予应用开发者和区块链团队最大的灵活度，费用机制支付将采用 IBC 中间件的形式实现（见 ICS-30）。

鉴于此，流程如下：

1. 中继器通过目标链上的费用中间件注册其目标链地址到源链地址的映射。
2. 用户/模块在`source`链上提交一个数据包发送命令，并向费用中间件模块提交一条消息以及通证和费用分配信息。费用通证均在费用模块中托管。
3. 中继器 A 在`destination`链上提交 `RecvPacket` 。
4. 目标链费用中间件将获取中继器目标链地址对应的源链地址（此映射已被注册），并将其添加到回执信息中。
5. 中继器 B 提交 `AcknowledgePacket` ，该消息在消息发送方的源链上提供反向（reverse）中继器地址，以及嵌在回执信息中的前向（forward）中继器的源链地址。
6. 源链费用中间件可将（1）中托管的通证分配至前向及反向中继器，并将剩余通证退回至原始费用支付方。

替代流程：

1. 用户/模块在`source`链提交数据包发送命令、通证以及分配信息
2. 中继器提交`OnTimeout`，该消息在源链提供中继器地址。
3. 源链应用可将（1）中托管的通证分配至该中继器，并可能将剩余通证退回至原始支付方。

### 费用细节

以 Cosmos SDK 中的实现举例，我们考虑三种潜在的费用支付方式，并给出定义。每种支付方式使用不同通证进行支付。想象 IRISnet 和 Cosmos Hub 之间的连接。可定义：

- 接收费用（ReceiveFee）：0.003 channel-7/ATOM 凭证（ATOM 已实现通过 ICS20 跨链至 IRISnet ）
- 回执费用（AckFee）：0.001 IRIS
- 超时费用（TimeoutFee）：0.002 IRIS

理想情况下，费用可以通过双方的原生通证兑换，但中继器可能会选择其他通证。在该示例中，中继器拥有相当多的 IRIS，足够覆盖中继费用和其他成本。同时，中继器还从许多数据包中收集了 channel-7/ATOM 凭证，在中继了几千个数据包后，Cosmos Hub 上的账户余额不足，因此中继器将通过 channel-7 将这些channel-7/ATOM 凭证发回其 Hub 帐户，以补充余额。

发送链将托管费用支付方账户中的 0.003 channel-7/ATOM 凭证和 0.002 IRIS。若前向中继器提交`recvPacket`，反向中继器提交`ackPacket`，则前向中继器会获得 0.003 channel-7/ATOM 凭证奖励，反向中继器获得 0.001 IRIS，剩余 0.001 IRIS 将退回至原始费用支付方。当数据包超时时，超时中继器将获得 0.002 IRIS，剩余 0.003 channel-7/ATOM 凭证将退回至原始支付方。

向用户收取费用随后支付给相关中继器的逻辑由单独的费用模块封装，并可能因不同实现而异。但是，所有费用模块都必须实现统一接口，以便 ICS-4 处理程序可以正确支付中继器费用，并便于中继器轻松确定中继数据包的预期费用。

### 费用中间件合约

虽然各个费用模块的详细信息可能有所不同，但所有费用模块都**必须**确保执行以下操作：

- 必须允许中继器注册其在对手链上的地址。
- 必须托管所有未中继的数据包可能支付的最高费用（或必须有能力铸造所需数量的通证）
- 必须为数据包向在`PayFee`回调中指定的前向中继器支付接收费用（如果未指定中继器，则必须将费用退回原始支付方）
- 必须为数据包向在`PayFee`回调中指定的反向中继器支付回执费用
- 必须为数据包向`PayTimeoutFee`回调中指定的超时中继器支付超时费用
- 如有费用剩余，则必须将托管中的所有剩余费用退回原始支付方

```typescript
// RegisterCounterpartyAddress 由每个 channelEnd 上的中继器调用，并允许中继器在中继之前指定其对手链上的地址。
// 这确保了它们将因前向中继得到适当补偿，因为目标链必须在回执信息中发回中继器的源地址（对手链地址）。
// 此函数可能被中继器多次调用，此时一般使用最新的对手链地址。
function RegisterCounterpartyAddress(address: string, counterPartyAddress: string) {
     // 设置源地址和对手链地址之间的映射
}

// EscrowPacketFee 是一个开放回调，任何希望托管资金的模块/用户都可以调用它，以便
// 激励中继数据包。
// 注意：这些费用是在之前为数据包托管的任何金额之外托管的。在之前的金额为零的情况下，
// 提供的费用是初始托管金额。
// 可以设置单独的 receiveFee、ackFee 和 timeoutFee
// 为数据包流中的每个环节进行支付。调用方必须将 max(receiveFee+ackFee, timeoutFee) 发送到费用模块
// 随后这些费用将被托管，以便支付潜在数据包流程费用。
// 调用方可选择指定一个中继地址数组。费用模块可以使用它并根据最终中继器地址来修改费用支付逻辑。
// 例如，费用模块可能选择仅在 `EscrowPacketFee`中指定中继器地址时支付费用。
function EscrowPacketFee(packet: Packet, receiveFee: Fee, ackFee: Fee, timeoutFee: Fee, relayers: []string) {
    // 为此数据包托管 max(receiveFee+ackFee, timeoutFee)
    // 如有必要，使用提供的中继器地址执行自定义逻辑
}

// PayFee 是由 ICS-4 AcknowledgePacket 处理程序调用的费用模块实现的回调。
function PayFee(packet: Packet, forward_relayer: string, reverse_relayer: string) {
    // 向前向中继地址支付前向中继费用
    // 向反向中继地址支付反向中继费用
    // 将剩余通证退还至原始费用支付方
    // 注意：若前向中继地址为空，则将前向中继费用退还给原始费用支付方。
}

// PayFee 是由 ICS-4 TimeoutPacket 处理程序调用的费用模块实现的回调。
function PayTimeoutFee(packet: Packet, timeout_relayer: string) {
    // 向超时中继地址支付超时中继费用
    // 将剩余通证退还给原始费用支付方
}
```

费用模块应公开以下信息，以便中继器查询预期费用：

```typescript
// 获取为数据包提交 ReceivePacket msg 的预期费用
// 若费用取决于特定的中继器，调用方应提供预期的中继器地址。
function GetReceiveFee(portID, channelID, sequence, relayer) Fee

// 获取为数据包提交 AcknowledgePacket msg 的预期费用
// 若费用取决于特定的中继器，调用方应提供预期的中继器地址。
function GetAckFee(portID, channelID, sequence, relayer) Fee

// 获取为数据包提交 TimeoutPacket msg 的预期费用
// 若费用取决于特定的中继器，调用方应提供预期的中继器地址。
function GetTimeoutFee(portID, channelID, sequence, relayer) Fee
```

由于不同链对同质化通证（fungible tokens）有不同的表示方法，且该信息不会发送至其他链，因此本规范对`Fee`表示方法不作特别指定。每条链都可以选择自己的表示方法，中继器有责任正确解释费用。

默认表示方法将具有以下结构：

```typescript
interface Fee {
  denom: string,
  amount: uint256,
}
```

### IBC 模块包装类（Wrapper）

费用中间件将实现其自己的 ICS-26 回调，用于打包特定应用模块的回调以及被底层应用调用的 ICS-4 处理程序函数。这一费用中间件将确保对手模块支持激励，并将实现所有费用相关逻辑。随后该中间件将请求传递给嵌入式应用模块，用于进一步回调处理。

通过这种方式，自定义费用处理逻辑可以连接到 IBC 数据包流程逻辑，而无需将代码放置在 ICS-4 处理程序或应用程序代码中。这是有价值的，因为 ICS-4 处理程序应只关心核心 IBC 功能（传输、认证和排序）的正确性，且应用处理程序不应处理在所有其他被激励应用中通用的费用逻辑。事实上，一个给定的应用程序模块应该能够连接到任何费用模块，而无需对应用程序本身作进一步更改。

#### 费用协议协商

费用中间件将通过把自己的版本附加到应用程序版本来与对手模块协商其费用协议版本。

通道版本：`fee_v{fee_protocol_version}:{application_version}`

前一版本：`fee_v1:ics20-1`

费用中间件的握手回调确保了两个模块就兼容费用协议版本达成一致，并随后向嵌入式应用程序的握手回调发送特定应用版本字符串。

#### 握手回调

```typescript
function onChanOpenInit(
  order: ChannelOrder,
  connectionHops: [Identifier],
  portIdentifier: Identifier,
  channelIdentifier: Identifier,
  counterpartyPortIdentifier: Identifier,
  counterpartyChannelIdentifier: Identifier,
  version: string) {
    // 移除前缀并将应用特定版本传给应用回调。
    // 否则，直接将版本传给应用回调。
    feeVersion, appVersion = splitFeeVersion(version)
    // 检查是否支持 feeVersion
    if !isSupported(feeVersion) {
        return error
    }
    app.OnChanOpenInit(
        order,
        connectionHops,
        portIdentifier,
        channelIdentifier,
        counterpartyPortIdentifier,
        counterpartyChannelIdentifier,
        appVersion,
    )
}

function OnChanOpenTry(
  order: ChannelOrder,
  connectionHops: [Identifier],
  portIdentifier: Identifier,
  channelIdentifier: Identifier,
  counterpartyPortIdentifier: Identifier,
  counterpartyChannelIdentifier: Identifier,
  version: string,
  counterpartyVersion: string) {
      // 选择相互兼容的收费版本
      cpFeeVersion, cpAppVersion = splitFeeVersion(counterpartyVersion)
      feeVersion, appVersion = splitFeeVersion(version)
      if !isCompatible(cpFeeVersion, feeVersion) {
          return error
      }
      selectFeeVersion(cpFeeVersion, feeVersion)

      // 调用底层应用的 OnChanOpenTry 回调
      app.OnChanOpenTry(
          order,
          connectionHops,
          portIdentifier,
          channelIdentifier,
          counterpartyPortIdentifier,
          counterpartyChannelIdentifier,
          cpAppVersion,
          appVersion,
      )
}

function onChanOpenAck(
  portIdentifier: Identifier,
  channelIdentifier: Identifier,
  counterpartyChannelIdentifier: Identifier,
  counterpartyVersion: string) {
      feeVersion, appVersion = splitFeeVersion(counterpartyVersion)
      if !isSupported(feeVersion) {
          return error
      }

      // 调用底层应用程序 OnChanOpenAck 回调
      app.OnChanOpenAck(portIdentifier, channelIdentifier, appVersion)
}

function onChanOpenConfirm(
  portIdentifier: Identifier,
  channelIdentifier: Identifier) {
      // 费用中间件对 ChanOpenConfirm 不执行操作，
      // 只调用底层回调
      app.onChanOpenConfirm(portIdentifier, channelIdentifier)
  }

function splitFeeVersion(version: string): []string {
    if hasPrefix(version, "fee") {
        splitVersions = split(version,  ":")
        feeVersion = version[0]
        appVersion = join(version[1:], ":")
        // 若版本有费用前缀
        // 则将第一个拆分部分作为费用版本返回，将字符串的其余部分作为应用版本返回
        return []string{feeVersion, appVersion}
    }
    // 否则返回空费用版本和完整版本作为应用程序版本
    return []string{"", version}
}
```

#### 数据包回调

```typescript
function onRecvPacket(packet: Packet, relayer: string): bytes {
    app_acknowledgement = app.onRecvPacket(packet, relayer)

    // 通过检索存储在费用中间件中的此中继器的对手链地址来获取源地址。
    // 注意：源地址可能为空或无效，
    // 此时对手链必须退回费用
    sourceAddress = getCounterpartyAddress(relayer)

    // 在异步回执的情况下，必须存储中继器地址，以便稍后检索并写入回执。
    if app_acknowledgement == nil {
        privateStore.set(forwardRelayerPath(packet), sourceAddress)
    }

    // 用前向中继器包装回执信息并返回编组的字节
    //constructIncentivizedAck 接受应用程序特定的回执和接收数据包中继器（前向中继器）
    // 并构造激励回执结构，其中嵌入了前向中继器和应用程序特定的回执信息。
    ack = constructIncentivizedAck(app_acknowledgment, sourceAddress)
    return marshal(ack)
}

function onAcknowledgePacket(packet: Packet, acknowledgement: bytes, relayer: string) {
    // 回执是一个编组结构，其中包含作为字符串的前向中继器地址（forward_relayer），
    // 以及对手链上的应用程序模块（app_ack）返回的原始回执字节。

    // 从回执消息中获取前向中继器
    // 并向前向和反向中继器支付费用。
    // reverse_relayer 是函数参数中提供的
    // 回执信息的提交者
    // 注意：费用可能为 0
    ack = unmarshal(acknowledgement)
    forward_relayer = getForwardRelayer(ack)
    PayFee(packet, forward_relayer, relayer)

    // 展开对手链上应用程序发送的原始回执字节并将其传递给应用程序回调。
    app_ack = getAppAcknowledgement(acknowledgement)

    app.OnAcknowledgePacket(packet, app_ack, relayer)
}

function onTimeoutPacket(packet: Packet, relayer: string) {
    // 从函数参数中获取超时中继器
    // 并支付超时费用。
    // 注意：费用可能为 0
    PayTimeoutFee(packet, relayer)
    app.OnTimeoutPacket(packet, relayer)
}

function onTimeoutPacketClose(packet: Packet, relayer: string) {
    // 从函数参数中获取超时中继器
    // 并支付超时费用。
    // 注意：费用可能为 0
    PayTimeoutFee(packet, relayer)
    app.onTimeoutPacketClose(packet, relayer)
}

function constructIncentivizedAck(app_ack: bytes, forward_relayer: string): Acknowledgement {
    // TODO：见 https://github.com/cosmos/ibc/pull/582
}

function getForwardRelayer(ack: Acknowledgement): string {
    // TODO：见 https://github.com/cosmos/ibc/pull/582
}

function getAppAcknowledgement(ack: Acknowledgement): bytes {
    // TODO：见 https://github.com/cosmos/ibc/pull/582
}
```

#### ICS-4 调用 ICS-4 的嵌入式应用程序

注意，如果嵌入式应用程序使用异步回执，则应用程序中的`WriteAcknowledgement`调用必须调用费用中间件的`WriteAcknowledgement`，而非直接调用 ICS-4 处理程序的`WriteAcknowledgement`函数。

```typescript
// 费用中间件 writeAcknowledgement 函数
function writeAcknowledgement(
  packet: Packet,
  acknowledgement: bytes) {
    // 检索存储在 onRecvPacket 中的前向中继器
    relayer = privateStore.get(forwardRelayerPath(packet))
    ack = constructIncentivizedAck(acknowledgment, relayer)
    ack_bytes marshal(ack)
    // ics4Wrapper 可能是核心 IBC 或更高级的中间件
    return ics4Wrapper.writeAcknowledgement(packet, ack_bytes)
}

// 费用中间件 sendPacket 函数只将数据转发给 ics-4 处理程序
function sendPacket(
  capability: CapabilityKey,
  sourcePort: Identifier,
  sourceChannel: Identifier,
  timeoutHeight: Height,
  timeoutTimestamp: uint64,
  data: bytes) {
    // ics4Wrapper 可能是核心 IBC 或更高级的中间件
    return ics4Wrapper.sendPacket(
      capability,
      sourcePort,
      sourceChannel,
      timeoutHeight,
      timeoutTimestamp,
      data)
}
```

### 用户与费用中间件的交互

**用户发送数据包**

用户可以在数据包提交期间原子提交费用支付消息和应用程序特定的“发送数据包”消息（如 ICS-20 MsgTransfer）来指定用于激励中继的费用。费用中间件将托管原子创建的数据包费用。本文档未指定费用支付消息本身，因为费用支付消息可能因实现方式不同而有很大差异。在某些中间件中，如果费用是从利他池（altruisic pool）中支付的，则可能根本没有费用支付消息。

由于费用中间件不需要修改传出数据包，所以费用支付消息可以放在发送包消息之前或之后。但是，为保持与其他中间件消息的一致性，建议费用中间件要求将其消息放在数据包消息之前，并为给定通道上的下一个序列托管费用。这样，当消息被原子提交时，通道的下一个序列是用户发送的发送数据包消息，并且用户会对所创建数据包的费用进行托管。

如果用户想要在创建数据包后为其支付费用，费用中间件应该提供一条消息，允许用户为具有指定序列、通道和端口标识符的数据包支付费用。这允许用户对已经创建的数据包进行唯一标识，以便费用中间件在事件后托管该数据包的费用。

**中继器发送 RecvPacket**

中继器在一条通道上开始中继之前，应使用下列标准消息注册其对手链消息：

```typescript
interface RegisterCounterpartyAddressMsg {
    channelID: string
    portID: string
    counterpartyAddress: string
    address: string
}
```

数据包接收链应负责认证消息来源是`address`的所有者。接收链必须存储给定通道上`address -> counterpartyAddress`的映射。随后，目标链费用中间件中的`onRecvPacket`可以查询`recvPacket`消息发送者的对手地址，以获取前向中继器的源地址。该源地址将被嵌入回执信息。

如果中继器没有注册其对手地址，或注册了一个无效的地址，并不会影响回执信息的接收和处理，但中继费用将退还给原始费用支付方。

#### 向后兼容性

直接在费用模块中保持与无激励链的向后兼容性，要求顶层费用模块协商不包含费用版本的版本，并与激励和非激励模块进行通信。随着嵌套应用的增加，这种模式会导致不必要的复杂性。

相反，费用模块将只连接到其对手费用模块，由此简化了费用模块逻辑，并且不需要模仿底层的嵌套应用。

为保持与非激励链特定应用（如 ICS-20）的向后兼容性，被激励的链应同时运行一个顶层 ICS-20 模块和一个顶层费用模块，其中，费用模块应嵌套一个 ICS-20 应用程序，每个应用程序都应绑定到唯一的端口。

#### 推论

提案满足所需属性。数据包流程中的所有部分（接收/回执/超时）都可以得到适当的激励和奖励。协议没有预先指定中继器，因此激励可采用无需许可或需要许可的形式。资金的托管和分配完全在源链上处理，因此不需要额外的 IBC 数据包或在费用协议中使用 ICS-20。费用协议仅假设源链上存在同质化通证。通过为相同的基础应用程序创建应用程序堆栈（一个带有费用中间件，一个没有），我们可以获得向后兼容性。

##### 正确性

费用模块负责将资金正确托管和分配给相应的中继器。回执和超时信息的中继器很容易检索，因为它们是回执和超时消息的发送者。前向中继器负责在发送`recvPacket`消息之前注册其源地址，以便目标费用中间件可以将此地址嵌入到回执信息中。然后，源链上的费用中间件将使用回执信息中的地址向源链上的前向中继器付款。

对于前向中继地址，源链将使用“最大努力（best efforts）”方法。由于该地址不是由对手链直接验证，而是作为一个字符串在回执信息中传回，因此前向中继器注册的地址可能不是有效的源链地址。在这种情况下，将舍弃无效地址，退回接收费用，并继续处理回执信息。中继器有责任将其源地址正确注册到对手链。如果对手链发送的前向中继器地址错误，将导致中继器无法在源链上收取中继数据包的费用。缺乏激励驱动的中继器将停止中继服务，直到回执信息逻辑修复，但通道仍会正常工作。

源地址无效时无法返回错误信息，因为这将永久阻止源链处理在对手链上正确接收、处理和回执的数据包的回执信息。IBC 协议规定未正确工作或恶意的中继器所产生的影响仅限于用户数据包的活跃度。在这种情况下，数据包回执不成功将使数据包流程处于永久不完整状态，这对于某些 IBC 应用程序（如 ICS-20）可能会产生重大影响。

因此，前向中继器的奖励取决于发送`receive_packet`消息时提供正确的`payOnSender`地址。即使费用支付不成功 ，数据包流程也会继续成功处理。

当前向中继器正确嵌入回执信息，且反向中继器和超时中继器在消息中直接可用时，费用中间件将为相关的中继器准确托管并分配费用。

#### 可选附录

## 向前兼容性

不适用。

## 示例实现

即将到来。

## 其他实现

即将到来

## 历史

2021 年 6 月 8 日 - 从直接在 ICS-4 中实现回调切换到中间件解决方案。
2021 年 6 月 1 日 - 完成草案

## 版权

本规范所有内容均采用 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可授权。
