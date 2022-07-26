---
ics: '27'
title: 链间账户
stage: 草案
category: IBC/APP
requires: 25, 26
kind: 实例化
author: Tony Yun <yunjh1994@everett.zone>, Dogemos <josh@tendermint.com>, Sean King <sean@interchain.io>
created: '2019-08-01'
modified: '2020-07-14'
---

## 概要

该标准指定了不同链之间 IBC 通道之上的帐户管理系统的数据包数据结构，状态机处理逻辑和编码详细信息。

### 动机

ICS-27链间帐户标准规定了基于IBC的跨链账户管理协议。具备ICS-27功能的区块链可以通过交易（而不是用私钥签名）在其他具备ICS-27功能的区块链上创建并管理账户。链间账户保留了普通账户的所有功能（例如：质押，投票，转帐，发交易），但这是由另外一条链通过IBC的方式管理的，这使得在控制链上的所有者账户能够完全操控它在主链上注册的链间账户。

### 定义

- 主链：链间账户在主链上注册。主链监听来自控制链的 IBC 数据包，数据包内含有链间账户可执行的控制指令（例如：Cosmos SDK信息）。
- 控制链：控制链在主链上注册并管理账户。控制链通过向主链发送 IBC 数据包来控制主链上的账户。
- 链间账户：链间账户是主链上的账户。链间账户拥有普通账户的所有功能。但控制链并不通过私钥签发交易，而是通过向主链发送 IBC 数据包，指示链间账户处理交易。
- 链间账户所有者：控制链上的账户。主链上的每个链间账户在控制链上都有一个对应的所有者账户。

IBC 处理程序接口和 IBC 中继模块接口分别在 [ICS 25](../../core/ics-025-handler-interface) 和 [ICS 26](../../core/ics-026-routing-module) 中定义。

### 所需属性

- 无需许可：链间账户可以由任意的参与者创建，并且无需第三方的许可（如链上治理）。需要注意的是：不同的创建方法可能有不同的许可方案，IBC 协议对于这些方案的安全性未作规定。
- 故障隔离：一条控制链无法管理其它控制链注册的控制账户。比如，如果一条控制链受到了分叉攻击，只有分叉链注册的链间账户会受到影响。
- 发送至主链链间账户的交易顺序必须保持不变。链间账户执行交易的顺序必须和控制链发送交易顺序一致。
- 如果一条通道关闭，控制链必须有能力通过创建一条新通道来重新访问已注册的链间账户。
- 每个链间账户都隶属于控制链上的一个所有者账户。只有所有者账户有权控制隶属于自己的链间账户。相应的权限控制由控制链施行。
- 控制链必须存储所有隶属于自己的链间账户地址。
- 主链必须有能力限制链上的链间账户的功能（例如，主链可以决定链上的链间账户能不能参与质押）。

## 技术规范

### 总体设计

一条链可以同时使用链间账户协议的两部分（控制链协议和主链协议）或其中任意一部分。在其它主链上注册链间账户的控制链不一定要允许其他控制链在本链注册链间账户，反之亦然。

该标准定义了注册链间账户和发送交易数据的总体方法，其中的交易数据将会代表所有者账户被链间账户执行。主链负责反序列化并执行交易数据；控制链在发送交易数据之前必须知道主链会如何处理交易数据，这是在创建通道的过程中控制链和主链通过握手达成的。

### 控制链合约

#### **RegisterInterchainAccount**

`RegisterInterchainAccount` 是注册链间账户的切入点。它可以用所有者账户地址生成新的控制者portID。它将绑定一个控制者portID并且调用04-channel的`ChanOpenInit`。控制者portID如果已经被占用，`RegisterInterchainAccount`会返回错误。 `ChannelOpenInit`事件将被触发并被链下进程（如中继器）检测到。链间账户通过`OnChanOpenTry`步骤在主链上注册。这一方法必须在`OPEN`的连接被创建之后才能使用给定的connectionID来调用。调用者必须提供完整的通道版本，其中必须包括带有完整元数据的 ICA 版本并且可能包括其他中间件的版本，其中中间件的作用是在通道两端包装  ICA。这将会需要通道两端的中间件信息。所以，建议 ICA 认证的应用自动构建 ICA 版本并且允许用户启用额外的中间件版本号更新。

```typescript
function RegisterInterchainAccount(connectionId: Identifier, owner: string, version: string) returns (error) {
}
```

#### **SendTx**

`SendTx` 用于发送IBC数据包，数据包中包含链间账户所有者发给链间账户的指令（消息）。

```typescript
function SendTx(
  capability: CapabilityKey,
  connectionId: Identifier,
  portId: Identifier,
  icaPacketData: InterchainAccountPacketData,
  timeoutTimestamp uint64) {
    // 检查该 portId 与 connectionId当前是否有活动通道
    // 如有，则意味着已通过该 portId 与 connectionId注册过跨链账户
    activeChannelID, found = GetActiveChannelID(portId, connectionId)
    abortTransactionUnless(found)

    // 验证 timeoutTimestamp
    abortTransactionUnless(timeoutTimestamp <= currentTimestamp())

    // 验证 icaPacketData
    abortTransactionUnless(icaPacketData.type == EXECUTE_TX)
    abortTransactionUnless(icaPacketData.data != nil)

    // 将 icaPacketData 通过活动通道处理程序发送至主链
      sendPacket(
      capability,
      portId, // 源端口 ID
      activeChannelID, // 源通道 ID
      0,
      timeoutTimestamp,
      icaPacketData
    )
}
```

### 主链合约

#### **RegisterInterchainAccount**

在通过握手创建通道的过程中，`RegisterInterchainAccount`在执行`OnChanOpenTry`时被调用。

```typescript
function RegisterInterchainAccount(counterpartyPortId: Identifier, connectionID: Identifier) returns (nil) {
// 检查以确保帐户尚未注册
// 在给定交易对手端口 ID 和底层连接 ID 的情况下，在链上创建一个新地址
// 调用 SetInterchainAccountAddress()
}
```

#### **AuthenticateTx**

`AuthenticateTx` 在执行`ExecuteTx`之前被调用。 `AuthenticateTx` 核实特定消息的签名者为链间账户，并且该链间账户与发送IBC数据包的对端通道portID相关联。

```typescript
function AuthenticateTx(msgs []Any, connectionId string, portId string) returns (error) {
    // GetInterchainAccountAddress(portId, connectionId)
    // if interchainAccountAddress != msgSigner return error
}
```

#### **ExecuteTx**

执行所有者账户在控制链上发送的每则消息。

```typescript
function ExecuteTx(sourcePort: Identifier, channel Channel, msgs []Any) returns (resultString, error) {
// 验证每条消息
// 通过传入的源端口和通道的 connectionID 检索给定通道的链间帐户
// 验证跨链账户是每条消息的授权签名者
// 执行每条消息
// 返回交易结果
}
```

### 实用函数

```typescript
// 为给定的 portID 和 connectionID 设置活动通道。
function SetActiveChannelID(portId: Identifier, connectionId: Identifier, channelId: Identifier) returns (error){
}

// 根据 portID 和 connectionID，返回活动通道的 ID（如果存在）。
function GetActiveChannelID(portId: Identifier, connectionId: Identifier) returns (Identifier, boolean){
}

// 在状态中存储链间账户的地址。
function SetInterchainAccountAddress(portId: Identifier, connectionId: Identifier, address: string) returns (string) {
}

// 从状态中检索链间帐户。
function GetInterchainAccountAddress(portId: Identifier, connectionId: Identifier) returns (string, bool){
}
```

### 注册与控制流程

#### 注册链间账户的流程

要注册链间账户，我们需要一个链下进程（中继器）来监听`ChannelOpenInit`事件，并且有能力根据给定的连接来握手，从而创建通道。

1. 控制器链将新的 IBC 端口与给定链间*帐户所有者地址*的控制器端口 ID 绑定。

这个端口将被用来在控制链和主链之间为一对特定的所有者账户/链间账户创建通道。只有链间账户的`{owner-account-address}`与绑定的端口相匹配才会被授权使用相应的通道（该通道是根据控制链的portID创建的）发送IBC数据包。由每个控制链在链上施行此端口注册和访问。

1. 在给定连接的情况下，控制链会发出一个事件信号，在此端口上打开一个新通道。
2. 监听`ChannelOpenInit`事件的中继器将继续为创建通道而进行握手。
3. 在主链的`OnChanOpenTry`回调过程中，一个链间账户将被注册，并将链间账户地址到所有者帐户地址的映射存储在账户状态中（用于在执行时验证主链上的交易）。
4. 在控制链的`OnChanOpenAck`回调过程中，一个链间账户之前在主链上的`OnChanOpenTry`注册的记录会被写入到所有者的状态中，记录中包含从 portID -&gt; 链间账户地址的映射。实现细节请参见以下的[元数据协商](#Metadata-negotiation)部分。
5. 在控制链和主链上分别进行`OnChanOpenAck`和`OnChanOpenConfirm`回调期间，此链间帐户/所有者对的[活动通道](#Active-channels)将被写进链间账户/所有者的状态。

#### 活动通道

控制链和主链必须跟踪每个注册的链间帐户的`active-channel` 。 `active-channel`是在为创建通道而握手的过程中设置的。这是一种安全机制，允许控制链在通道关闭的情况下重新获得对主链上链间帐户的访问权限。

控制链上的活动通道的数据结果示例：

```typescript
{
 // 控制链
 SourcePortId: `icacontroller-<owner-account-address>`,
 SourceChannelId: `<channel-id>`,
 // 主链
 CounterpartyPortId: `icahost`,
 CounterpartyChannelId: `<channel-id>`,
}
```

如果一条通道关闭，控制链可以使用和之前的通道同样的端口和底层连接，通过握手创建一条新通道， 来取代现有的活动通道。ICS-27通道只能在两种情况下被关闭：即超时（如果通道是有序通道）或者轻客户端受到攻击（可能性很小）时。因此控制链必须具有以下两种功能： 创建新的ICS-27通道；重置某一对端口号（包含`{owner-account-address}`）和连接对应的活动通道。

控制链和主链必须验证任何新通道与之前的活动通道保持相同的元数据，以确保链间帐户的参数即使在更换活动通道后也保持不变。不应验证元数据的`Address`，因为其在 INIT 阶段应为空，且主链将在 TRY 上重新生成完全相同的地址，因为它会从控制链端口 ID 确定性地生成链间帐户地址和connectionID（两者均须保持不变）。

#### **元数据协商**

ICS-27 利用[ICS-04 通道版本协商](../../core/ics-004-channel-and-packet-semantics/README.md#versioning)在通道握手期间协商元数据和通道参数。元数据将包含编码格式以及交易类型，以便交易对手可以就跨链交易的结构和编码达成一致。在 TRY 步骤从主链发送的元数据也将包含链间帐户地址，以便可以将其中继到控制链。在通道握手结束时，控制链和主链都会存储控制链 portID 到新注册的链间账户地址的映射（[账户注册流程](#Register-account-flow)）。

ICS-04 允许每个应用程序通道有特定版本协商协议。对于链间账户来说，通道版本将是一个 JSON 结构的字符串，其中包含所有相关元数据，这些元数据旨在在通道握手期间转发给交易对手（[参见下文摘要](#Metadata-negotiation-summary)）。

结合每个跨链帐户绑定一个通道的规定，这种元数据协商方法允许我们将链间帐户的地址传递回控制链，并在`OnChanOpenAck`回调期间创建从控制链端口 ID 到链间帐户地址的映射。如[控制流程](#Controlling-flow)中所述，控制链需要知道已注册链间帐户的地址，以便将交易发送到主链上的链间帐户。

#### **元数据协商总结**

`interchain-account-address`是控制链在主链上注册的链间账户地址。

- **INIT**

发起者：控制链

数据报：ChanOpenInit

作用于链：控制链

版本：

```json
{
  "Version": "ics27-1",
  "ControllerConnectionId": "self_connection_id",
  "HostConnectionId": "counterparty_connection_id",
  "Address": "",
  "Encoding": "requested_encoding_type",
  "TxType": "requested_tx_type",
}
```

注释：地址留空，因为地址将由主链生成并传回。数据报必须包含连接标识符，以便在需要打开新通道（以防活动通道超时）时确保使用同一连接。这将确保链间账户始终连接到同一个交易对手链。

- **TRY**

发起者：中继者

数据报：ChanOpenTry

被作用链：主链

版本：

```json
{
  "Version": "ics27-1",
  "ControllerConnectionId": "counterparty_connection_id",
  "HostConnectionId": "self_connection_id",
  "Address": "interchain_account_address",
  "Encoding": "negotiated_encoding_type",
  "TxType": "negotiated_tx_type",
}
```

注释：如果控制链在 INIT 中设置了交易对手版本，则主链上的 ICS-27 应用程序负责返回此版本。主链必须同意控制链请求的单一编码类型和单一交易类型（例如包含在交易对手版本中）。如果不支持请求的编码或交易类型，则主链必须返回错误并中止握手。主链还必须生成链间账户地址，并使用链间账户地址字符串填充版本中的地址字段。

- **ACK**

发起者：中继者

数据报：ChanOpenAck

被作用链：控制链

交易对手版本：

```json
{
  "Version": "ics27-1",
  "ControllerConnectionId": "self_connection_id",
  "HostConnectionId": "counterparty_connection_id",
  "Address": "interchain_account_address",
  "Encoding": "negotiated_encoding_type",
  "TxType": "negotiated_tx_type",
}
```

注释：在 ChanOpenAck 步骤中，控制链上的 ICS27 应用程序必须验证主链在 ChanOpenTry 中选择的版本字符串。控制链必须验证该字符串可支持主链选择的协商编码和 tx 类型。如果其中任何一个不受支持，则必须返回错误并中止握手。如果两者都支持，则控制链必须存储从通道的 portID 到所提供的链间帐户地址的映射，并返回成功。

#### 控制流程

一旦在主链上注册了链间帐户，控制链就可以开始向主链发送指令（消息）以控制该帐户。

1. 控制链调用`SendTx`并传递将由关联的链间帐户在主链执行的消息（由控制链端的端口标识符确定）

Cosmos SDK 伪代码示例：

```golang
interchainAccountAddress := GetInterchainAccountAddress(portId)
msg := &banktypes.MsgSend{FromAddress: interchainAccountAddress, ToAddress: ToAddress, Amount: amount}
icaPacketData = InterchainAccountPacketData{
   Type: types.EXECUTE_TX,
   Data: serialize(msg),
   Memo: "memo",
}

// 发送信息到主链，信息将最终在主链被执行
SendTx(ownerAddress, connectionId, portID, data, timeout)
```

1. 主链收到 IBC 数据包后会调用`DeserializeTx` 。

2. 然后主链将为每条消息调用`AuthenticateTx`和`ExecuteTx`，并返回包含成功或错误的回执。

通过获取控制链端口标识符，并调用`GetInterchainAccountAddress(controllerPortId)`以获取当前控制链端口的预期链间帐户地址，在主链上对消息进行身份验证。如果此消息的签名者与预期的帐户地址不匹配，则身份验证失败。

### 数据包数据

`InterchainAccountPacketData`包含一个链间帐户可以执行的消息数组和一个发送到主链的备忘录字符串以及数据包`type` 。 ICS-27 版本1只有一种类型的`EXECUTE_TX` 。

```proto
message InterchainAccountPacketData  {
    enum type
    bytes data = 1;
    string memo = 2;
}
```

回执包结构在[ics4](https://github.com/cosmos/ibc-go/blob/main/proto/ibc/core/channel/v1/channel.proto#L135-L148)中定义。如果主链上发生错误，则回执包含错误消息。

```proto
message Acknowledgement {
  // 响应包含结果或错误，并且必须为非空
  oneof response {
    bytes  result = 21;
    string error  = 22;
  }
}
```

### 自定义逻辑

ICS-27 通过[ICS-30 中间件架构](../ics-030-middleware)允许应用程序开发人员自定义 ICS-27 数据包执行成功或失败的处理逻辑。

控制链将包装`OnAcknowledgementPacket`和`OnTimeoutPacket`以处理 ICS-27 数据包执行成功或失败的情况。

### 端口和通道设置

主链上的链间帐户模块必须始终绑定到 id 为 `icahost`的端口。控制链将动态绑定端口，如标识符格式[部分](#identifer-formats)中所指定。

下方示例假设一个模块正在实现整个`InterchainAccountModule`接口。 `setup`函数必须在创建模块时（可能是在区块链本身在初始化时）仅调用一次以绑定到对应端口。

```typescript
function setup() {
  capability = routingModule.bindPort("icahost", ModuleCallbacks{
      onChanOpenInit,
      onChanOpenTry,
      onChanOpenAck,
      onChanOpenConfirm,
      onChanCloseInit,
      onChanCloseConfirm,
      onRecvPacket,
      onTimeoutPacket,
      onAcknowledgePacket,
      onTimeoutPacketClose
    })
    claimCapability("port", capability)
}
```

一旦调用了`setup`函数，就可以通过 IBC 路由模块创建通道。

### 通道生命周期管理

链间帐户模块将接受来自另一台机器上任何模块的新通道，当且仅当：

- 正在创建的通道是有序的。
- 控制链正在进行通道初始化。

```typescript
//  在控制链上被InitInterchainAccount调用
function onChanOpenInit(
  order: ChannelOrder,
  connectionHops: [Identifier],
  portIdentifier: Identifier,
  channelIdentifier: Identifier,
  counterpartyPortIdentifier: Identifier,
  counterpartyChannelIdentifier: Identifier,
  version: string) {
  // 只允许有序通道
  abortTransactionUnless(order === ORDERED)
  // 验证端口格式
  abortTransactionUnless(validateControllerPortParams(portIdentifier))
  // 只允许在交易对手链上的“icahost”端口上创建通道
  abortTransactionUnless(counterpartyPortIdentifier === "icahost")
  // 只有在没有设置活动通道（状态为 OPEN）时才打开通道
  abortTransactionUnless(activeChannel === nil)

  // 验证元数据
  metadata = UnmarshalJSON(version)
  abortTransactionUnless(metadata.Version === "ics27-1")
  // 必须支持编码列表和 tx 类型列表中的所有元素
  abortTransactionUnless(IsSupportedEncoding(metadata.Encoding))
  abortTransactionUnless(IsSupportedTxType(metadata.TxType))

  // connectionID和交易对手connectionID在通道中是可获取的
  abortTransactionUnless(metadata.ControllerConnectionId === connectionId)
  abortTransactionUnless(metadata.HostConnectionId === counterpartyConnectionId)
}
```

```typescript
// 在主链上由中继器调用
function onChanOpenTry(
  order: ChannelOrder,
  connectionHops: [Identifier],
  portIdentifier: Identifier,
  channelIdentifier: Identifier,
  counterpartyPortIdentifier: Identifier,
  counterpartyChannelIdentifier: Identifier,
  counterpartyVersion: string) (version: string) {
  // 只允许有序通道
  abortTransactionUnless(order === ORDERED)
  // 验证端口ID
  abortTransactionUnless(portIdentifier === "icahost")
  // 只有当对方端口ID采用预期的控制链端口ID 格式时才允许在主链上创建通道
  abortTransactionUnless(validateControllerPortParams(counterpartyPortIdentifier))
  // 使用交易对手端口标识符以及主链上的底层connectionID创建链间账户
  address = RegisterInterchainAccount(counterpartyPortIdentifier, connectionID)

  cpMetadata = UnmarshalJSON(counterpartyVersion)
  abortTransactionUnless(cpMetadata.Version === "ics27-1")
  // 如果主链不支持初始化链请求的编码或 txType，则握手失败并中止交易
  abortTransactionUnless(IsSupportedEncoding(cpMetadata.Encoding))
  abortTransactionUnless(IsSupportedTxType(cpMetadata.TxType))

  // connectionID和交易对手connectionID在通道中是可获取的
  abortTransactionUnless(cpMetadata.ControllerConnectionId === counterpartyConnectionId)
  abortTransactionUnless(cpMetadata.HostConnectionId === connectionId)
  
  metadata = {
    "Version": "ics27-1",
    "ControllerConnectionId": cpMetadata.ControllerConnectionId,
    "HostConnectionId": cpMetadata.HostConnectionId,
    "Address": address,
    "Encoding": cpMetadata.Encoding,
    "TxType": cpMetadata.TxType,
  }

  return string(MarshalJSON(metadata))
}
```

```typescript
// 由中继器在控制链上调用
function onChanOpenAck(
  portIdentifier: Identifier,
  channelIdentifier: Identifier,
  counterpartyChannelIdentifier,
  counterpartyVersion: string) {

  // 验证主链的交易对手元数据
  metadata = UnmarshalJSON(version)
  abortTransactionUnless(metadata.Version === "ics27-1")
  abortTransactionUnless(IsSupportedEncoding(metadata.Encoding))
  abortTransactionUnless(IsSupportedTxType(metadata.TxType))
  abortTransactionUnless(metadata.ControllerConnectionId === connectionId)
  abortTransactionUnless(metadata.HostConnectionId === counterpartyConnectionId)

  
  // 状态更改以记录成功注册的跨链帐户
  SetInterchainAccountAddress(portID, metadata.Address)
  // 设置此所有者/链间帐户对的活动通道
  setActiveChannel(SourcePortId)
}
```

```typescript
// 由中继器在主链上调用
function onChanOpenConfirm(
  portIdentifier: Identifier,
  channelIdentifier: Identifier) {
  // 设置此所有者/链间帐户对的活动通道
  setActiveChannel(portIdentifier)
}
```

```typescript
// 控制器端口 ID 必须具有以下格式：`icacontroller-{ownerAddress}`
function validateControllerPortParams(portIdentifier: Identifier) {
  split(portIdentifier, "-")
  abortTransactionUnless(portIdentifier[0] === "icacontroller")
  abortTransactionUnless(IsValidAddress(portIdentifier[1]))
}
```

### 结束握手

```typescript
function onChanCloseInit(
  portIdentifier: Identifier,
  channelIdentifier: Identifier) {
 	// 不允许用户发起的通道关闭链间账户通道
  return err
}
```

```typescript
function onChanCloseConfirm(
  portIdentifier: Identifier,
  channelIdentifier: Identifier) {
}
```

### 数据包中继

路由模块收到数据包后调用`onRecvPacket` 。

```typescript
function OnRecvPacket(packet Packet) {
  ack = NewResultAcknowledgement([]byte{byte(1)})

	// 仅在数据包数据成功解码时尝试应用程序逻辑
  switch data.Type {
  case types.EXECUTE_TX:
  msgs, err = types.DeserializeTx(data.Data)
  if err != nil {
    return NewErrorAcknowledgement(err)
  }

  // ExecuteTx 调用上面定义的 AuthenticateTx 函数
  result, err = ExecuteTx(ctx, packet.SourcePort, packet.DestinationPort, packet.DestinationChannel, msgs)
  if err != nil {
    // 注意：网络中的节点放置在确认中的错误字符串必须在所有内容中保持一致
    // ，否则状态机中会有一个分叉。
    return NewErrorAcknowledgement(err)
  }

  // 在主链上执行后返回包含交易结果的确认
  return NewAcknowledgement(result)

  default:
    return NewErrorAcknowledgement(ErrUnknownDataType)
  }
}
```

在路由模块发送的数据包被确认后，该模块将调用`onAcknowledgePacket`。

```typescript
function onAcknowledgePacket(
  packet: Packet,
  acknowledgement: bytes) {
    // 调用底层应用的 OnAcknowledgementPacket 回调
    // 更多信息请参见 ICS-30 中间件
}
```

```typescript
function onTimeoutPacket(packet: Packet) {
    // 调用底层应用的 OnTimeoutPacket 回调
    // 更多信息请参见 ICS-30 中间件
}
```

### 标识符格式

链间账户通道两侧的端口标识符必须遵循的这些格式，才能被正确的链间账户模块接受。

控制链端口标识符： `icacontroller-{owner-account-address}`

主链端口标识符： `icahost`

## 示例实现

ICS-27 的 Cosmos-SDK 实现的代码库：https://github.com/cosmos/ibc-go

## 未来的改进

未来的链间账户可能会通过引入一种 IBC 通道类型来大大简化，该通道类型是有序通道，但不会在超时时关闭通道，而是继续接收下一个数据包。如果核心 IBC 提供了这种通道类型，链间账户可能请求使用这种通道类型并删除与“活动通道”相关的所有逻辑和状态。元数据格式中的底层连接标识符的引用也可以被删除，由此元数据格式可以得到简化。

设置和取消“活动通道”在当前是必要的，旨在允许链间帐户所有者创建一个新通道，防止当前活动通道在通道超时情况下被关闭。连接标识符是元数据的一部分，旨在确保被启用的新通道均建立在原始连接上。如果要让通道有序**且**不可关闭，只能通过向核心 IBC 引入新的通道类型来实现，新通道类型实现后，这些逻辑就变得不必要了。

## 历史

2019年8月1日-讨论概念

2019年9月24日-建议草案

2019年11月8日-重大修订

2019年12月2日-较小修订（在以太坊上添加更多具体描述并添加链间账户）

2020年7月14日-主要修订

2021年4月27日-重新设计ics27规范

2021年11月11日-根据代码实现的最新变化更新翻译

2021年12月14日-根据审计和维护人员的审查对规范进行修订

## 版权

本文中的所有内容均根据[Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)获得许可。
