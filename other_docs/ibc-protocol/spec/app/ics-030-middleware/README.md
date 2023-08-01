---
ics: '30'
title: IBC 中间件
stage: 草案
category: IBC/APP
requires: 4, 25, 26
kind: 实例化
author: Aditya Sripal <aditya@interchain.berlin>, Ethan Frey <ethan@confio.tech>
created: '2021-06-01'
modified: '2021-06-18'
---

## 概要

该标准文档规定了一个模块必须实现的接口和状态机逻辑，以便充当核心 IBC 和下层应用程序之间的中间件。 IBC 中间件可实现对应用程序功能的任意扩展，而无需更改应用程序或核心 IBC。

### 动机

IBC 应用程序设计为自成一体的模块，通过一组与核心 IBC 处理程序的接口来实现自己的应用程序特定逻辑。反过来，这些核心 IBC 处理程序设计为确保 IBC 的正确性属性（传输、身份验证、排序），同时将所有应用所专有的处理委托给 IBC 应用程序模块。但是，在某些情况下，许多应用程序可能需要某些功能，但不适合放在核心 IBC 中。最可预见的例子是通用性费用支付协议。大多数应用都希望选用一种协议来激励中继器在其通道上中继数据包。但是，有些应用可能不希望启用此功能，而另一些应用则希望实现自己的自定义费用处理程序。

如果没有中间件方案，开发人员必须选择是将此扩展置于每个相关应用的内部逻辑中或将这段应用逻辑放在核心 IBC 中。将它放在每个应用程序中是冗余的并且容易出错；将逻辑放置在核心 IBC 中需要所有应用程序都选用，而且违反了核心 IBC (TAO) 和应用程序之间的抽象隔离。随着扩展数量的增加，这两种情况都不可扩展，因为这都必然会使应用程序或核心 IBC 处理程序中的代码膨胀。

中间件允许开发人员将扩展定义为可以包裹基础应用程序的单独模块。因此，该中间件可以执行自己的自定义逻辑，并将数据传递给应用程序，以便它可以在不知道中间件存在的情况下运行其逻辑。这允许应用程序和中间件实现自己隔离的逻辑，同时仍然能够作为一个数据包流程的一个环节来运行。

### 定义

`Middleware` ：在数据包执行期间，位于核心 IBC 和下层 IBC 应用程序之间的自成一体的模块。核心 IBC 和下层应用程序之间的所有消息都必须流经中间件，中间件可以执行自己的自定义逻辑。 

`Underlying Application` ：下层应用程序是直接连接到相关中间件的应用程序。该下层应用程序自身可能是链接到基础应用程序的中间件。

`Base Application` ：基础应用程序是不包含任何中间件的 IBC 应用程序。它可以被 0 个或多个中间件嵌套，形成一个应用栈。

`Application Stack (or stack)` ：栈是连接到核心 IBC 的一整套应用程序逻辑（一个或多个中间件 + 基础应用程序）。栈可能只是一个基础应用程序，也可能是一系列嵌套了基础应用程序的中间件。

### 所需属性

- 中间件支持应用程序逻辑的任意扩展
- 中间件可以任意嵌套，以形成一个由应用扩展组成的链条
- 核心 IBC 无需更改
- 基本应用程序逻辑不需要改变

## 技术规范

### 总体设计

为了实现 IBC 中间件的功能，模块必须实现 IBC 应用程序回调并将预处理数据传递给嵌套的应用程序。模块还必须实现`WriteAcknowledgement`和`SendPacket` 。它们将由终端应用程序调用，以便模块可以在将数据传递到核心 IBC 之前对信息进行后处理。

当嵌套应用程序时，模块必须确保它处于核心 IBC 与应用程序双向通信的中间位置。开发人员应该通过直接向 IBC 路由器（而不是任何嵌套应用程序）注册顶级模块来做到这一点。反过来，嵌套应用程序必须只能访问中间件的`WriteAcknowledgement`和`SendPacket` ，而不是直接访问核心 IBC 处理程序。

此外，中间件必须注意确保应用程序逻辑可以执行自己的版本协商，而不会受到嵌套中间件的干扰。为了做到这一点，中间件将使用自己的中间件版本字符串预先添加版本。在应用回调中，中间件必须对前缀进行自己的版本协商，然后在将数据交给嵌套应用的回调之前去掉前缀。该要求仅限于中间件期望在交易对手栈上的同一级别上具有兼容的交易对手中间件时的情况。只在通道的单侧执行的中间件，不得修改通道版本。

版本： `{middleware_version}:{app_version}`

每个应用程序栈都必须为核心 IBC 保留自己的唯一端口。因此，具有相同基础应用程序的两个栈必须绑定到不同的端口。

#### 接口

```typescript
// 中间件实现 ICS26 模块接口
interface Middleware extends ICS26Module {
    app: ICS26Module // 中间件可以访问可能被更多中间件包装的底层应用程序
    ics4Wrapper: ICS4Wrapper // 中间件可以访问 ICS4Wrapper，它可能是核心 IBC 通道处理程序或包装此中间件的更高级别的中间件。
}
```

```typescript
// 由 ICS4 和所有包装基础应用程序的中间件实现。
// 基础应用程序将调用它们直接上层的中间件的 `sendPacket` 或 `writeAcknowledgement`
// 这些方法将调用下一个中间件，直到调用到核心 IBC 处理程序。
interface ICS4Wrapper {
    sendPacket(
      capability: CapabilityKey,
      sourcePort: Identifier,
      sourceChannel: Identifier,
      timeoutHeight: Height,
      timeoutTimestamp: uint64,
      data: bytes)
    writeAcknowledgement(packet: Packet, ack: Acknowledgement)
}
```

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
    middlewareVersion, appVersion = splitMiddlewareVersion(version)
    doCustomLogic()
    app.OnChanOpenInit(
        order,
        connectionHops,
        portIdentifier,
        channelIdentifier,
        counterpartyPortIdentifier,
        counterpartyChannelIdentifier,
        appVersion, // 注意这里我们只传递应用版本
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
      cpMiddlewareVersion, cpAppVersion = splitMiddlewareVersion(counterpartyVersion)
      middlewareVersion, appVersion = splitMiddlewareVersion(version)
      if !isCompatible(cpMiddlewareVersion, middlewareVersion) {
          return error
      }
      doCustomLogic()

      // 调用底层应用的 OnChanOpenTry 回调
      app.OnChanOpenTry(
          order,
          connectionHops,
          portIdentifier,
          channelIdentifier,
          counterpartyPortIdentifier,
          counterpartyChannelIdentifier,
          cpAppVersion, // 注意这里我们只传递交易对手的应用版本
          appVersion, // 只传递应用版本
      )
}

function onChanOpenAck(
  portIdentifier: Identifier,
  channelIdentifier: Identifier,
  counterpartyChannelIdentifier: Identifier,
  counterpartyVersion: string) {
      middlewareVersion, appVersion = splitMiddlewareVersion(counterpartyVersion)
      if !isCompatible(middlewareVersion) {
          return error
      }
      doCustomLogic()
      
      // 调用底层应用的 OnChanOpenTry 回调
      app.OnChanOpenAck(portIdentifier, channelIdentifier, appVersion)
}

function OnChanOpenConfirm(
    portIdentifier: Identifier,
    channelIdentifier: Identifier) {
    doCustomLogic()

    app.OnChanOpenConfirm(portIdentifier, channelIdentifier)
}

function splitMiddlewareVersion(version: string): []string {
    splitVersions = split(version,  ":")
    middlewareVersion = version[0]
    appVersion = join(version[1:], ":")
    return []string{middlewareVersion, appVersion}
}
```

注意：不需要与远程栈上的交易对手中间件协商的中间件，将不会实现版本拆分和协商，而将简单地在回调上执行自己的自定义逻辑，并不依赖于交易对手也有类似行为。

#### 数据包回调

```typescript
function onRecvPacket(packet: Packet, relayer: string): bytes {
    doCustomLogic()

    app_acknowledgement = app.onRecvPacket(packet, relayer)

    // 中间件可以修改回执
    ack = doCustomLogic(app_acknowledgement)
   
    return marshal(ack)
}

function onAcknowledgePacket(packet: Packet, acknowledgement: bytes, relayer: string) {
    doCustomLogic()

    // 中间件可以修改回执
    app_ack = getAppAcknowledgement(acknowledgement)

    app.OnAcknowledgePacket(packet, app_ack, relayer)

    doCustomLogic()
}

function onTimeoutPacket(packet: Packet, relayer: string) {
    doCustomLogic()

    app.OnTimeoutPacket(packet, relayer)

    doCustomLogic()
}

function onTimeoutPacketClose(packet: Packet, relayer: string) {
    doCustomLogic()

    app.onTimeoutPacketClose(packet, relayer)

    doCustomLogic()
}
```

注意：中间件可以对 ICS-26 中定义的所有 IBC 模块回调的底层应用程序数据进行预处理和后处理。

#### ICS-4 包装类

```typescript
function writeAcknowledgement(
  packet: Packet,
  acknowledgement: bytes) {
    // 中间件可以修改回执
    ack_bytes = doCustomLogic(acknowledgement)

    return ics4.writeAcknowledgement(packet, ack_bytes)
}
```

```typescript
function sendPacket(
  capability: CapabilityKey,
  sourcePort: Identifier,
  sourceChannel: Identifier,
  timeoutHeight: Height,
  timeoutTimestamp: uint64,
  app_data: bytes) {
    // 中间件可以修改数据包
    data = doCustomLogic(app_data)

    return ics4.sendPacket(
      capability,
      sourcePort,
      sourceChannel,
      timeoutHeight,
      timeoutTimestamp,
      data)
}
```

### 用户交互

在中间件需要一些用户输入以修改来自底层应用程序的传出数据包消息时，中间件必须在从底层应用程序接收数据包消息之前从用户那里获取此输入信息。随后中间件必须自行对用户输入信息进行验证，并确保提供给中间件的用户输入与正确的传出数据包消息相匹配。为实现以上功能，中间件可以要求用户对中间件的输入和发送到底层应用程序的数据包消息采用原子发送，并按照从最外层的中间件到基础应用程序的顺序排序。

### 安全模型

如上所示，IBC 中间件可以任意修改来自底层应用程序的任何传入或传出数据。因此，开发人员不应在其应用程序栈中使用任何不受信任的中间件。

## 向后兼容性

中间件设计方案是当前 IBC 已经启用的设计模式。该 ICS 旨在标准化对 IBC 中间件的特定设计模式。核心 IBC 或任何现有应用程序无需更改。

## 向前兼容性

不适用。

## 示例实现

即将到来。

## 其他实现

即将到来。

## 历史

2021 年 6 月 22 日 - 提交草案

## 版权

本文中的所有内容均根据 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 获得许可。
