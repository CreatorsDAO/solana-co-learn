---
ics: '721'
title: 非同质化通证转移
stage: 草案
category: IBC/APP
requires: 25, 26
kind: 实例化
author: Haifeng Xi <haifeng@bianjie.ai>
created: '2021-11-10'
modified: '2022-05-18'
---

> 该标准文档遵循与[ICS 20](../ics-020-fungible-token-transfer)相同的设计原则，并从中继承了大部分内容，同时使用`nft`模块替换基于`bank`模块的资产跟踪逻辑。

## 概览

本标准文档规定了通过 IBC 通道在各自链上的两个模块之间进行非同质化通证转移的数据包的数据结构、状态机处理逻辑以及编码细节。本文所描述的状态机逻辑允许在无需许可通道打开的情况下安全的处理多个链的`classId`。该逻辑通过在主链状态机上的 IBC 路由模块和一个现存的资产跟踪模块之间建立实现了一个非同质化通证转移的桥接模块。该模块既可以是 Cosmos 式的原生模块，也可以是在虚拟机中运行的智能合约。

### 动机

基于 IBC 协议连接的一组链上的用户可能希望在通证发行原始链以外的区块链上使用非同质化通证，以使用该链上的附加功能，例如交易、版税支付或隐私保护。该应用层标准描述了一个在基于 IBC 连接的区块链之间转移非同质化通证的协议，该协议保留了资产的非同质性和资产所有权，限制了拜占庭错误（Byzantine faults）的影响，并且无需额外许可。

### 定义

[ICS 25](../../core/ics-025-handler-interface) 和 [ICS 26](../../core/ics-026-routing-module) 分别定义了 IBC 处理程序接口和 IBC 路由模块接口。

### 所需属性

- 保持非同质性（即在所有基于 IBC 连接的区块链中，任何通证只有一个 *活跃* 实例）。
- 无需许可的通证转移，无需将连接、模块或 `classId` 加入白名单。
- 对称性（即所有链实现相同的逻辑，hubs 和 zones 无协议差别）。
- 容错：防止由于链 `B` 的拜占庭行为造成源自链 `A` 的通证的拜占庭式通货膨胀。

## 技术规范

### 数据结构

仅需要一个数据包数据类型： `NonFungibleTokenPacketData` ，该类型指定了类别 id，类别 uri，通证 id，通证 uri，发送地址和接收地址。

```typescript
interface NonFungibleTokenPacketData {
  classId: string
  classUri: string
  tokenIds: []string
  tokenUris: []string
  sender: string
  receiver: string
}
```

`classId` 唯一标识了正被转移的通证在发送链中所属的类别/系列集合。例如，对于兼容 ERC-1155 的智能合约，这可能是通证 ID 的高 128 位字符串表示形式。

`classUri` 是可选的，但这对于和 OpenSea 等 NFT 市场的跨链互操作性是非常有益的，在这些 NFT 市场中可以添加 [ 类别/系列集合元数据](https://docs.opensea.io/docs/contract-level-metadata) 以提供更好的用户体验。

`tokenIds` 唯一标识了正被转移的特定类别的一些通证。例如，对于兼容 ERC-1155 的智能合约，`tokenId` 可以是通证 ID 的低 128 位字符串表示形式。

每个 `tokenId` 在 `tokenUris` 中都有一个对应的条目，它指的是链外资源，通常是包含通证元数据的不可变 JSON 文件。

当通证使用 ICS-721 协议进行跨链传送时，会开始累积通证已传输的通道记录。这些记录信息会被编码到`classId` 字段中。

ICS-721 通证类别以 `{ics721Port}/{ics721Channel}/{classId}` 的形式表示，其中 `ics721Port` 和 `ics721Channel` 标识了通证到达的当前链上的通道。如果 `{classId}` 包含 `/`，那么它也必须采用 ICS-721 形式，以表明通证具有多跳记录。需要注意的是，这要求在非 IBC 通证的 `classId` 中禁止使用 `/`（斜杠字符）。

发送链可以充当源 zone 或目标 zone。当一条链不是通过最后一个前缀端口和通道对发送通证时，它充当了源 zone。当通证从源 zone 被发出，目标端口和通道将作为 `classId` 的前缀，（收到通证后） 将另一个跃点添加到通证记录中。当一条链通过最后一个前缀端口和通道发送通证时，它就充当了目标 zone。当通证从目标 zone 被发出， `classId` 上的最后一个前缀端口和通道对会被移除，（收到通证后）将撤消通证记录中的最后一个跃点。

例如，假设发生以下转移步骤：

A -&gt; B -&gt; C -&gt; A -&gt; C -&gt; B -&gt; A

1. A(p1,c1) -&gt; (p2,c2)B : A 是源 zone。B 中的 `classId` : 'p2/c2/nftClass'
2. B(p3,c3) -&gt; (p4,c4)C : B 是源 zone。C 中的 `classId` : 'p4/c4/p2/c2/nftClass'
3. C(p5,c5) -&gt; (p6,c6)A : C 是源 zone。A 中的 `classId` : 'p6/c6/p4/c4/p2/c2/nftClass'
4. A(p6,c6) -&gt; (p5,c5)C : A 是目标 zone。C 中的 `classId` : 'p4/c4/p2/c2/nftClass'
5. C(p4,c4) -&gt; (p3,c3)B : C 是目标 zone。B 中的 `classId` : 'p2/c2/nftClass'
6. B(p2,c2) -&gt; (p1,c1)A : B 是目标 zone。A 中的 `classId` : 'nftClass'

回执数据类型描述了转移是成功还是失败，以及失败的原因（如果有的话）。

```typescript
type NonFungibleTokenPacketAcknowledgement = NonFungibleTokenPacketSuccess | NonFungibleTokenPacketError;

interface NonFungibleTokenPacketSuccess {
  // 这是使用二进制 0x01 base64 进行编码的
  success: "AQ=="
}

interface NonFungibleTokenPacketError {
  error: string
}
```

需要注意的是，当 `NonFungibleTokenPacketData` 和 `NonFungibleTokenPacketAcknowledgement` 序列化到数据包中，两者都必须是 JSON 编码（而非 Protobuf 编码的）。

非同质化通证转移桥接模块为每个 NFT 通道维护一个单独的托管地址。

```typescript
interface ModuleState {
  channelEscrowAddresses: Map<Identifier, string>
}
```

### 子协议

此处描述的子协议应在“非同质化通证转移桥接”模块中实现，并具有对 NFT 资产跟踪模块和 IBC 路由模块的访问权限。

NFT 资产跟踪模块应实现以下功能：

```typescript
function SaveClass(
  classId: string,
  classUri: string) {
  // 创建一个由 classId 标识的新 NFT 类别
}
```

```typescript
function Mint(
  classId: string,
  tokenId: string,
  tokenUri: string,
  receiver: string) {
  // 创建一个由 <classId,tokenId> 标识的新 NFT
  // 接收方成为新铸造的 NFT 的所有者
}
```

```typescript
function Transfer(
  classId: string,
  tokenId: string,
  receiver: string) {
  // 将由 <classId,tokenId> 标识的 NFT 传输给接收方
  // 接收方成为 NFT 的新所有者
}
```

```typescript
function Burn(
  classId: string,
  tokenId: string) {
  // 销毁由 <classId,tokenId> 标识的 NFT
}
```

```typescript
function GetOwner(
  classId: string,
  tokenId: string) {
  // 返回由 <classId,tokenId> 标识的 NFT 现任所有者
}
```

```typescript
function GetNFT(
  classId: string,
  tokenId: string) {
  // 返回由 <classId,tokenId> 标识的 NFT
}
```

```typescript
function HasClass(classId: string) {
  // 如果由 classId 标识的 NFT 类别已存在，则返回 true;
  // 否则返回 false
}
```

```typescript
function GetClass(classId: string) {
  // 返回由 classId 标识的 NFT 类别
}
```

#### 端口及通道设置

`setup` 功能必须在创建模块时（可能是在初始化区块链本身时）恰好只调用一次，以绑定到适当的（由模块拥有的）端口。

```typescript
function setup() {
  capability = routingModule.bindPort("nft", ModuleCallbacks{
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

一旦 `setup` 功能已被调用，可以通过 IBC 路由模块在各自链上的非同质化通证转移模块实例之间创建通道。

此规范仅定义数据包处理语义，并以“模块本身无需担心在任何时间点，哪些 connection 或通道可能不存在”的方式对其进行定义。

#### 路由模块回调

##### 通道生命周期管理

当且仅当满足以下条件时，机器 A 和 B 都能接受来自另一台机器上任何模块的新通道：

- 创建的通道是无序的。
- 版本字符串为 `ics721-1`.

```typescript
function onChanOpenInit(
  order: ChannelOrder,
  connectionHops: [Identifier],
  portIdentifier: Identifier,
  channelIdentifier: Identifier,
  counterpartyPortIdentifier: Identifier,
  counterpartyChannelIdentifier: Identifier,
  version: string) {
  // 仅允许无序通道
  abortTransactionUnless(order === UNORDERED)
  // 版本为 "ics721-1"
  abortTransactionUnless(version === "ics721-1")
}
```

```typescript
function onChanOpenTry(
  order: ChannelOrder,
  connectionHops: [Identifier],
  portIdentifier: Identifier,
  channelIdentifier: Identifier,
  counterpartyPortIdentifier: Identifier,
  counterpartyChannelIdentifier: Identifier,
  counterpartyVersion: string) {
  // 仅允许无序通道
  abortTransactionUnless(order === UNORDERED)
  // 版本为 "ics721-1"
  abortTransactionUnless(counterpartyVersion === "ics721-1")
}
```

```typescript
function onChanOpenAck(
  portIdentifier: Identifier,
  channelIdentifier: Identifier,
  counterpartyChannelIdentifier: Identifier,
  counterpartyVersion: string) {
  // 端口已被验证
  // 版本为 "ics721-1"
  abortTransactionUnless(counterpartyVersion === "ics721-1")
  // 分配托管地址
  channelEscrowAddresses[channelIdentifier] = newAddress()
}
```

```typescript
function onChanOpenConfirm(
  portIdentifier: Identifier,
  channelIdentifier: Identifier) {
  // 接收通道确认信息，端口和版本都已被验证
  // 分配托管地址
  channelEscrowAddresses[channelIdentifier] = newAddress()
}
```

```typescript
function onChanCloseInit(
  portIdentifier: Identifier,
  channelIdentifier: Identifier) {
  // 中止并返回错误，以防止用户关闭通道
  abortTransactionUnless(FALSE)
}
```

```typescript
function onChanCloseConfirm(
  portIdentifier: Identifier,
  channelIdentifier: Identifier) {
  // 无需执行任何操作
}
```

##### 数据包中继

- 当一个非同质化通证从其源链转出时，桥接模块会在发送链上托管该通证，并在接收链上铸造相应的凭证。
- 当一个非同质化通证被转回其源链时，桥接模块会在发送链上销毁该通证，并在接收链上取消对相应锁定通证的托管。
- 当数据包超时时，其中所表示的通证会被取消托管或适当地铸造回发送方 - 具体取决于通证是从其源链转出还是转回。
- 回执数据用于处理失败，例如无效的目标帐户。返回失败回执比终止交易更可取，因为这更容易使发送链根据失败的性质采取适当的操作。

模块中对主链状态机上的账户所有者进行签名验证的交易处理程序必须调用 `createOutgoingPacket` 。

```typescript
function createOutgoingPacket(
  classId: string,
  tokenIds: []string,
  sender: string,
  receiver: string,
  source: boolean,
  destPort: string,
  destChannel: string,
  sourcePort: string,
  sourceChannel: string,
  timeoutHeight: Height,
  timeoutTimestamp: uint64) {
  prefix = "{sourcePort}/{sourceChannel}/"
  // 如果 classId 不以 sourcePort 和 sourceChannel 为前缀，则我们是源链
  source = classId.slice(0, len(prefix)) !== prefix
  tokenUris = []
  for (let tokenId in tokenIds) {
    // 确保发送者为通证持有者
    abortTransactionUnless(sender === nft.GetOwner(classId, tokenId))
    if source {
      // 托管通证
      nft.Transfer(classId, tokenId, channelEscrowAddresses[sourceChannel])
    } else {
      // 我们是接收链, 销毁凭证
      nft.Burn(classId, tokenId)
    }
    tokenUris.push(nft.GetNFT(classId, tokenId).GetUri())
  }
  NonFungibleTokenPacketData data = NonFungibleTokenPacketData{classId, nft.GetClass(classId).GetUri(), tokenIds, tokenUris, sender, receiver}
  ics4Handler.sendPacket(Packet{timeoutHeight, timeoutTimestamp, destPort, destChannel, sourcePort, sourceChannel, data}, getCapability("port"))
}
```

路由模块收到数据包后调用`onRecvPacket` 。

```typescript
function onRecvPacket(packet: Packet) {
  NonFungibleTokenPacketData data = packet.data
  // 建立默认的成功回执
  NonFungibleTokenPacketAcknowledgement ack = NonFungibleTokenPacketAcknowledgement{true, null}
  err = ProcessReceivedPacketData(data)
  if (err !== null) {
    ack = NonFungibleTokenPacketAcknowledgement{false, err.Error()}
  }
  return ack
}

function ProcessReceivedPacketData(data: NonFungibleTokenPacketData) {
  prefix = "{packet.sourcePort}/{packet.sourceChannel}/"
  // 如果 classId 以数据包的 sourcePort 和 sourceChannel 为前缀，则我们是源链
  source = data.classId.slice(0, len(prefix)) === prefix
  for (var i in data.tokenIds) {
    if source {
      // 取消接收方通证托管
      nft.Transfer(data.classId.slice(len(prefix)), data.tokenIds[i], data.receiver)
    } else { // we are sink chain
      prefixedClassId = "{packet.destPort}/{packet.destChannel}/" + data.classId
      // 如果尚不存在，则创建 NFT 类别
      if (nft.HasClass(prefixedClassId) === false) {
        nft.SaveClass(data.classId, data.classUri)
      }
      // 铸造凭证给接收方
      nft.Mint(prefixedClassId, data.tokenIds[i], data.tokenUris[i], data.receiver)
    }
  }
}
```

在路由模块发送的数据包被确认后，该模块将调用`onAcknowledgePacket`。

```typescript
function onAcknowledgePacket(
  packet: Packet,
  acknowledgement: bytes) {
  // 若转移失败，则退回通证
  if (!ack.success)
    refundToken(packet)
}
```

当路由模块发出的数据包超时（使得数据包没有被目标链接收），路由模块会调用 `onTimeoutPacket` 。

```typescript
function onTimeoutPacket(packet: Packet) {
  // 数据包超时，因此退回通证
  refundToken(packet)
}
```

`refundToken` 会在两种情况下被调用，`onAcknowledgePacket` 失败时和 `onTimeoutPacket` 时，用以将托管的通证退还给原始发送者。

```typescript
function refundToken(packet: Packet) {
  NonFungibleTokenPacketData data = packet.data
  prefix = "{packet.sourcePort}/{packet.sourceChannel}/"
  // 如果 classId 不以数据包的 sourcePort 和 sourceChannel 为前缀，则我们是源链
  source = data.classId.slice(0, len(prefix)) !== prefix
  for (var i in data.tokenIds) { {
    if source {
      // 取消通证托管给发送方
      nft.Transfer(data.classId, data.tokenIds[i], data.sender)
    } else {
      // 我们是目标链，铸造凭证给发送方
      nft.Mint(data.classId, data.tokenIds[i], data.tokenUris[i], data.sender)
    }
  }
}
```

```typescript
function onTimeoutPacketClose(packet: Packet) {
  // 不会发生，只允许无序通道
}
```

#### 推论

##### 正确性

该实现保留了通证的非同质性和可兑换性。

- 非同质性：在所有基于 IBC 连接的区块链中，任何通证只有一个 *活跃* 实例）。
- 可兑换性：如果通证已被发送到交易对手链上，仍可以在源链上的同一 `classId` 和 `tokenId` 中将其兑换回去。

#### 可选附录

- 每条本地链都可以选择保留一个查询表，以在状态中使用简短的、用户友好的本地 `classId`，在发送和接收数据包时，会与较长的 `classId` 进行相互转换。
- 可能会对可与哪些其他状态机连接，以及建立哪些通道施加额外限制。

## 进一步讨论

在此规范的基础上，可以支持扩展和复杂的用例，例如版税，市场或许可转移。解决方案可以是模块、钩子、[IBC 中间件](../ics-030-middleware) 等。与此相关的指南不在本标准讨论范围内。

假设主链状态机中的应用逻辑将负责确保根据此规范所铸造的 IBC 通证的元数据是不可变的。对于任何 IBC 通证，强烈建议 NFT 应用检查上游区块链（直到其源头），以确保其元数据在此过程中未被修改。如果决定在未来的某个时候，通过 IBC 适应 NFT 元数据的可变性，我们也许将通过使用进阶 DID 功能来更新此规范或创建一个全新的规范。

## 向后兼容性

不适用。

## 向前兼容性

此初始标准在通道握手中使用版本 “ics721-1”。

此标准的未来版块可以在通道握手中使用其他版本，并安全地更改数据包数据格式和数据包处理程序的语义。

## 示例实现

即将到来。

## 其他实现

即将到来。

## 历史

日期 | 描述
--- | ---
2021 年 11 月 10 日 | 初始草案 - 改编自 ICS 20 规范
2021 年 11 月 17 日 | 进行修订，以更好地适应智能合约
2021 年 11 月 17 日 | 从 ICS 21 更名为 ICS 721
2021 年 11 月 18 日 | 进行修订，以允许一个数据包中包含多种通证
2022 年 2 月 10 日 | 进行修订，以纳入 IBC 团队的反馈
2022 年 3 月 3 日 | 进行修订，使 TRY 回调与 PR#629 保持一致
2022 年 3 月 11 日 | 添加示例，以说明前缀概念
2022 年 3 月 30 日 | 添加 NFT 模块定义，并修复伪代码错误
2022 年 5 月 18 日 | 添加了有关 NFT 元数据可变性的段落

## 版权

本规范所有内容均采用 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可授权。
