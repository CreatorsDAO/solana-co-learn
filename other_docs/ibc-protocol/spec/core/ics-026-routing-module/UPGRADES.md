# 应用升级回调

## 概要

这个标准文档规定了 IBC 应用必须实现的接口和状态机逻辑，以便现存通道在初始连接握手后能够升级。

### 动机

随着新功能被添加到 IBC，链可能希望在不放弃现有通道的已积累的状态和网络效应的情况下，同时利用新的应用功能。提议的升级协议将允许应用重新协商现有通道，这样可以使用新的功能而无需创建新通道，从而在升级应用逻辑时可以保留现有的应用状态。

### 所需属性

- 两端的应用都必须认同重新协商后的应用的参数。
- 两条链上的应用的状态和逻辑应该或者使用旧参数或者新参数，而不能是一个中间状态，例如，应用程序不能运行 v2 逻辑，而其对手方仍在运行 v1 逻辑。
- 应用的升级协议是原子性的，即
    - 要么不成功，然后应用必须回退到原始应用的参数；
    - 要么成功，然后两端的应用必须采用新的应用的参数并妥善地处理 数据包。
- 应用程序必须能够维护几个不同的受支持版本。这样的话，如果一个通道在版本`v1`上，另一个通道在版本`v2`上，应用程序可以根据通道的应用程序版本相应地处理通道状态和逻辑。

应用程序升级协议不得修改通道标识符。

## 技术规范

为了支持通道升级，应用程序必须实现以下接口：

```typescript
interface ModuleUpgradeCallbacks {
    onChanUpgradeInit: onChanUpgradeInit,
    onChanUpgradeTry: onChanUpgradeTry,
    onChanUpgradeAck: onChanUpgradeAck,
    onChanUpgradeConfirm: onChanUpgradeConfirm,
    onChanUpgradeRestore: onChanUpgradeRestore
}
```

#### **OnChanUpgradeInit**

`onChanUpgradeInit`将验证升级的参数是否有效并执行任何自定义的`UpgradeInit`逻辑。如果选择的参数无效，则可能会返回错误，在这种情况下握手将被中止。如果提供的版本字符串空， `onChanUpgradeInit`应该返回版本字符串，如果提供的版本无效，则返回错误。如果升级提供了空字符串，这意味着将升级到默认版本，此默认版本可能是一个新的默认版本，与通道创建时的默认版本不一样。如果应用程序没有默认的版本字符串，并且提供的版本为空字符串，它应该返回错误。

如果返回错误，则核心 IBC 将撤销`onChanUpgradeInit`所做的任何更改并中止握手。

`onChanUpgradeInit`还负责确保应用程序可以恢复到其升级前的状态。应用程序可以将任何新的元数据存储在单独的路径中，或者将以前的元数据存储在不同的路径下以便可以恢复。

```typescript
function onChanUpgradeInit(
  order: ChannelOrder,
  connectionHops: [Identifier],
  portIdentifier: Identifier,
  channelIdentifier: Identifier,
  counterpartyPortIdentifier: Identifier,
  counterpartyChannelIdentifier: Identifier,
  version: string) => (version: string, err: Error) {
    // 由此模块定义
}
```

#### **OnChanUpgradeTry**

`onChanUpgradeTry`将验证升级选择的参数并执行自定义`TRY`逻辑。如果升级选择的参数无效，回调必须返回错误以中止握手。如果交易对手选择的版本与此模块支持的版本不兼容，回调必须返回错误以中止握手。如果版本兼容，try 回调必须选择最终版本字符串并将其返回给核心 IBC。 `onChanUpgradeTry`也可以执行自定义初始化逻辑。

如果返回错误，则核心 IBC 将撤销`onChanUpgradeTry`所做的任何更改并中止握手。

`onChanUpgradeTry`还负责确保应用程序可以恢复到其升级前的状态。应用程序可以将任何新的元数据存储在单独的路径中，或者将以前的元数据存储在不同的路径下以便可以恢复。

```typescript
function onChanUpgradeTry(
  order: ChannelOrder,
  connectionHops: [Identifier],
  portIdentifier: Identifier,
  channelIdentifier: Identifier,
  counterpartyPortIdentifier: Identifier,
  counterpartyChannelIdentifier: Identifier,
  counterpartyVersion: string) => (version: string, err: Error) {
    // 由此模块定义
}
```

#### **OnChanUpgradeAck**

如果交易对手选择的版本字符串无效， `onChanUpgradeAck`将出错。如果回调返回错误，核心 IBC 将撤销`onChanUpgradeAck`所做的任何更改并中止握手。

`onChanUpgradeAck`回调也可以执行自定义 ACK 逻辑。

在`onChanUpgradeAck`成功返回后，应用程序升级到此结束，任何为错误恢复而存储的辅助数据都不再需要，可能会被删除。

如果回调成功返回，应用程序必须完全迁移其状态以根据新的应用程序参数开始处理数据包。

```typescript
function onChanUpgradeAck(
  portIdentifier: Identifier,
  channelIdentifier: Identifier,
  counterpartyChannelIdentifier: Identifier,
  counterpartyVersion: string) {
    // 由此模块定义
} => Error
```

#### **OnChanUpgradeConfirm**

`onChanUpgradeConfirm`将执行自定义 CONFIRM 逻辑。此逻辑不能有错误返回， 因为交易对手已经批准了握手，并已经使用新的升级参数。

在`onChanUpgradeConfirm`返回后，应用程序升级到此结束，任何为错误恢复而存储的辅助数据都不再需要，可能会被删除。

应用程序必须完全迁移其状态，以便在回调返回时根据新的应用程序参数开始处理数据包。

```typescript
function onChanUpgradeConfirm(
  portIdentifier: Identifier,
  channelIdentifier: Identifier) {
    // 由此模块定义
}
```

#### **OnChanUpgradeRestore**

`onChanUpgradeRestore`将在`cancelChannelUpgrade`和`timeoutChannelUpgrade`被调用以将应用程序恢复到其升级前状态。

升级恢复的回调被返回后，应用程序必须将任何应用程序元数据恢复到其升级前状态。为升级而存储的任何临时元数据都可以删除。

应用程序必须完全迁移其状态，以便在回调返回时根据初始的应用程序参数开始处理数据包。

```typescript
function onChanUpgradeRestore(
  portIdentifier: Identifier,
  channelIdentifier: Identifier) {
    // 由此模块定义
}
```
