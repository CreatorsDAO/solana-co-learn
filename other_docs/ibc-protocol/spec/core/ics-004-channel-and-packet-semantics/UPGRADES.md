# 升级通道

### 概要

这个标准文档规定了 IBC 实现必须实现的接口和状态机逻辑，以便现存通道在初始连接握手后能够升级。

### 动机

随着新功能被添加到 IBC，链可能希望在不放弃现有通道的已积累的状态和网络效应的情况下，同时利用新的通道功能。提议的升级协议将允许链重新协商现有通道，这样可以使用新的功能而无需创建新通道，从而保留当前通道之上的所有的数据包状态。

### 所需属性

- 两条链都必须认同重新协商后的通道参数。
- 两条链上的通道状态和逻辑应该或者使用旧参数或者新参数，而不能是一个中间状态，例如，应用程序不能运行 v2 逻辑，而其对手方仍在运行 v1 逻辑。
- 通道升级协议是原子性的，即
    - 要么不成功，然后通道必须回退到原始通道参数；
    - 要么成功，然后通道两端必须采用新的通道参数并妥善地处理数据包。
- 通道升级协议应该具有改变所有通道相关参数的能力；但是通道升级协议不能改变下层的`ConnectionEnd` 。通道升级协议不得修改通道标识符。

## 技术规范

### 数据结构

`ChannelState`和`ChannelEnd`在[ICS-4](./README.md)中定义。为方便读者，在此转载。 `UPGRADE_INIT` ， `UPGRADE_TRY`是新增的附加状态，以启用升级功能。

```typescript
enum ChannelState {
  INIT,
  TRYOPEN,
  OPEN,
  UPGRADE_INIT,
  UPGRADE_TRY,
}
```

- 提议升级的链应该将通道状态从`OPEN`修改置为`UPGRADE_INIT`
- 接受升级的对方链应将通道状态从`OPEN`修改置为`UPGRADE_TRY`

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

通道升级协议不能修改下层客户端或通道标识符。这个所需要的属性意味着只有`ChannelEnd`的某些字段可以被升级协议升级。

- `state` ：状态由升级协议的握手步骤指定。

可被修改的：

- `version` ：版本可以被升级协议修改。在初始通道握手中发生的相同版本协商可用于升级的握手中。
- `ordering` ：升级协议可以修改排序规则。但是，必须满足先前排序是新排序的有效子集。因此，唯一支持的更改是从更严格的排序规则到不太严格的排序。例如，支持从 ORDERED 切换到 UNORDERED，**不支持**从 UNORDERED 切换到 ORDERED。
- `connectionHops`: connectionHops 可被升级协议修改.

不能修改的：

- `counterpartyChannelIdentifier`: 升级协议不能修改对方链的通道标识符
- `counterpartyPortIdentifier`端口标识符：升级协议不得修改交易对手端口标识符

注意：如果升级将任何字段添加到`ChannelEnd` ，这些是默认可修改的，并且可以被有权限发起升级的 Actor（例如链上治理）所任意选择。

```typescript
interface UpgradeTimeout {
    timeoutHeight: Height
    timeoutTimestamp: uint64
}
```

- `timeoutHeight` ：超时高度表示在此区块高度上，对方链不能再进行升级握手。此后，两条链将保留其原始通道，而升级握手被中止。
- `timeoutTimestamp` ：超时时间戳表示对方链不能再进行升级握手的时间。此后，两条链将保留其原始通道，而升级握手被中止。

timeoutHeight 或 timeoutTimestamp，至少其中之一必须非零。

### 储存路径

#### 恢复通道路径

链必须存储之前的通道端，以便在升级握手失败时可以恢复它。该数据可以存储在私有存储中。

```typescript
function restorePath(portIdentifier: Identifier, channelIdentifier: Identifier): Path {
    return "channelUpgrade/ports/{portIdentifier}/channels/{channelIdentifier}/restore"
}
```

#### 升级错误路径

升级错误路径是可以向对方链发出升级错误信号的公共路径。在成功的情况下它不存储任何内容，但在链不接受提议的升级的情况下，它将存储一个哨兵中止值。

```typescript
function errorPath(portIdentifier: Identifier, channelIdentifier: Identifier): Path {
    return "channelUpgrade/ports/{portIdentifier}/channels/{channelIdentifier}/upgradeError"

}
```

UpgradeError 必须有一个关联的验证成员和非成员函数添加到连接接口，以便对方链可以验证本链是否在 UpgradeError 路径中存储了该错误。

```typescript
// 连接的VerifyChannelUpgradeError的方法
function verifyChannelUpgradeError(
  connection: ConnectionEnd,
  height: Height,
  proof: CommitmentProof,
  counterpartyPortIdentifier: Identifier,
  counterpartyChannelIdentifier: Identifier,
  upgradeErrorReceipt: []byte,
) {
    client = queryClient(connection.clientIdentifier)
    path = applyPrefix(connection.counterpartyPrefix, channelErrorPath(counterpartyPortIdentifier, counterpartyChannelIdentifier))
    client.verifyMembership(height, 0, 0, proof, path, upgradeErrorReceipt)
}
```

```typescript
// 连接的VerifyChannelUpgradeErrorAbsence的方法
function verifyChannelUpgradeErrorAbsence(
  connection: ConnectionEnd,
  height: Height,
  proof: CommitmentProof,
  counterpartyPortIdentifier: Identifier,
  counterpartyChannelIdentifier: Identifier,
) {
    client = queryClient(connection.clientIdentifier)
    path = applyPrefix(connection.counterpartyPrefix, channelErrorPath(counterpartyPortIdentifier, counterpartyChannelIdentifier))
    client.verifyNonMembership(height, 0, 0, proof, path)
}
```

#### 超时路径

超时路径是升级发起者设置的公共路径，用于确定 TRY 步骤何时超时。它存储了`timeoutHeight`和`timeoutTimestamp` ，此时对方链必须已进入 TRY 步骤。TRY步骤将证明初始链设置的超时数值并确保没有超时。在超时的情况下，对方链证明已经超过了超时时间，并已经在其链上恢复通道。

```typescript
function timeoutPath(portIdentifier: Identifier, channelIdentifier: Identifier) Path {
    return "channelUpgrade/ports/{portIdentifier}/channelIdentifier/{channelIdentifier}/upgradeTimeout"
}
```

超时路径必须在连接接口上具有关联的验证方法，以便对方链证明该链存储了特定的`UpgradeTimeout` 。

```typescript
// 连接的VerifyChannelUpgradeTimeout的方法
function verifyChannelUpgradeTimeout(
  connection: ConnectionEnd,
  height: Height,
  proof: CommitmentProof,
  counterpartyPortIdentifier: Identifier,
  counterpartyChannelIdentifier: Identifier,
  upgradeTimeout: UpgradeTimeout,
) {
    client = queryClient(connection.clientIdentifier)
    path = applyPrefix(connection.counterpartyPrefix, channelTimeoutPath(counterpartyPortIdentifier, counterpartyChannelIdentifier))
    client.verifyMembership(height, 0, 0, proof, path, upgradeTimeout)
}
```

## 子协议

通道升级过程由三个子协议组成： `UpgradeChannelHandshake` 、 `CancelChannelUpgrade`和`TimeoutChannelUpgrade` 。在两条链都同意提议的升级的情况下，升级握手协议应该成功完成并且<code>ChannelEnd</code>应该成功升级。

### 实用函数

`restoreChannel()`是一个实用函数，它允许链中止正在进行的升级握手，并将`channelEnd`返回到其原始升级前状态，同时还设置`errorReceipt` 。然后，中继器可以向对方链发送`ChanUpgradeCancelMsg` ，以便它也可以将其`channelEnd`恢复到其升级前状态。一旦两个通道端都恢复到升级前的状态，数据包将继续按照其原始连接参数进行处理。

```typescript
function restoreChannel() {
    // 取消升级
    // 将错误收据写入错误路径并恢复原始通道
    errorReceipt = []byte{1}
    provableStore.set(errorPath(portIdentifier, channelIdentifier), errorReceipt)
    originalChannel = privateStore.get(restorePath(portIdentifier, channelIdentifier))
    provableStore.set(channelPath(portIdentifier, channelIdentifier), originalChannel)
    provableStore.delete(timeoutPath(portIdentifier, channelIdentifier))
    privateStore.delete(restorePath(portIdentifier, channelIdentifier))

    // 调用模块 onChanUpgradeRestore的回调
    module = lookupModule(portIdentifier)
    // 恢复回调不能返回错误，它必须成功恢复应用到升级前的状态
    module.onChanUpgradeRestore(
        portIdentifier,
        channelIdentifier
    )
    // 调用者也应该返回
}
```

### 升级握手

升级握手定义了四个数据报文： *ChanUpgradeInit* 、 *ChanUpgradeTry* 、 *ChanUpgradeAck*和*ChanUpgradeConfirm*

一个成功的协议执行流程如下（注意，所有调用都是通过 ICS 25 的模块进行的）：

发起者 | 数据报文 | 操作的链 | 先前状态（A，B） | 其后状态（A，B）
--- | --- | --- | --- | ---
Actor | `ChanUpgradeInit` | A | (OPEN, OPEN) | (UPGRADE_INIT, OPEN)
Actor | `ChanUpgradeTry` | B | (UPGRADE_INIT, OPEN) | (UPGRADE_INIT, UPGRADE_TRY)
中继器 | `ChanUpgradeAck` | A | (UPGRADE_INIT, UPGRADE_TRY) | (OPEN, UPGRADE_TRY)
中继器 | `ChanUpgradeConfirm` | B | (OPEN, UPGRADE_TRY) | (OPEN, OPEN)

在两个实现子协议的链之间的升级握手结束时，以下属性成立：

- 每条链都在运行它们新升级后的通道端，并根据升级后的参数处理升级后的逻辑和状态。
- 每条链都知道并同意对方升级的通道参数。

如果一个链不同意提议的对方链`UpgradedChannel` ，它可以通过将错误收据写入`errorPath`并恢复原始通道来中止升级握手。错误收据可以有任意字节但必须是非空的。

`errorPath(id) => error_receipt`

之后中继器可以向对方链提交`ChanUpgradeCancelMsg` 。收到此消息后，链必须验证对方链是否在其`UpgradeError`中写入了非空错误收据，如果成功，它将恢复其原始通道，从而取消升级。

如果一个升级消息在指定的超时后到达，则消息不能成功执行。中继器可以再次在`ChanUpgradeTimeoutMsg`中提交证明，以便对方链取消升级并恢复其原始通道。

```typescript
function chanUpgradeInit(
    portIdentifier: Identifier,
    channelIdentifier: Identifier,
    proposedUpgradeChannel: ChannelEnd,
    counterpartyTimeoutHeight: Height,
    counterpartyTimeoutTimestamp: uint64,
) {
    // 当前通道必须是 OPEN
    currentChannel = provableStore.get(channelPath(portIdentifier, channelIdentifier))
    abortTransactionUnless(channel.state == OPEN)

    // 如果修改了不可修改的字段，则中止交易
    // 升级后的通道状态必须是 `UPGRADE_INIT`
    // 注意：默认情况下，任何添加的字段都是可修改的。
    abortTransactionUnless(
        proposedUpgradeChannel.state == UPGRADE_INIT &&
        proposedUpgradeChannel.counterpartyPortIdentier == currentChannel.counterpartyPortIdentifier &&
        proposedUpgradeChannel.counterpartyChannelIdentifier == currentChannel.counterpartyChannelIdentifier
    )

    // 当前排序必须是数据包按照建议的合法排序
    // 例如 ORDERED -> UNORDERED, ORDERED -> DAG
    abortTransactionUnless(
        currentChannel.ordering.subsetOf(proposedUpgradeChannel.ordering)
    )

    // 超时高度或时间戳必须非零
    abortTransactionUnless(counterpartyTimeoutHeight != 0 || counterpartyTimeoutTimestamp != 0)

    upgradeTimeout = UpgradeTimeout{
        timeoutHeight: counterpartyTimeoutHeight,
        timeoutTimestamp: counterpartyTimeoutTimestamp,
    }

    // 调用模块 onChanUpgradeInit的回调
    module = lookupModule(portIdentifier)
    version, err = module.onChanUpgradeInit(
        proposedUpgradeChannel.ordering,
        proposedUpgradeChannel.connectionHops,
        portIdentifier,
        channelIdentifer,
        proposedUpgradeChannel.counterpartyPortIdentifer,
        proposedUpgradeChannel.counterpartyChannelIdentifier,
        proposedUpgradeChannel.version
    )
    // 如果回调返回错误，则中止交易
    abortTransactionUnless(err != nil)

    // 如果通道版本被修改，将通道版本替换为应用程序返回的版本
    proposedUpgradeChannel.version = version

    provableStore.set(timeoutPath(portIdentifier, channelIdentifier), upgradeTimeout)
    provableStore.set(channelPath(portIdentifier, channelIdentifier), proposedUpgradeChannel)
    privateStore.set(restorePath(portIdentifier, channelIdentifier), currentChannel)
}
```

注意：如何为`ChanUpgradeInit`函数提供访问控制取决于各个实现。例如链上治理、获得许可的 actor、DAO 等。对方链的访问控制应提供超时值的选择，即如果对方链的`UpgradeTry`由链上治理所把关，则超时值应该很大。

```typescript
function chanUpgradeTry(
    portIdentifier: Identifier,
    channelIdentifier: Identifier,
    counterpartyChannel: ChannelEnd,
    proposedUpgradeChannel: ChannelEnd,
    timeoutHeight: Height,
    timeoutTimestamp: uint64,
    proofChannel: CommitmentProof,
    proofUpgradeTimeout: CommitmentProof,
    proofHeight: Height
) {
    // 当前通道必须是 OPEN 或 UPGRADE_INIT (crossing hellos)
    currentChannel = provableStore.get(channelPath(portIdentifier, channelIdentifier))
    abortTransactionUnless(currentChannel.state == OPEN || currentChannel.state == UPGRADE_INIT)

    // 如果修改了不可修改的字段，则中止交易
    // 升级后的通道状态必须是 `UPGRADE_TRY`
    // 注意：默认情况下，任何添加的字段都是可修改的。
    abortTransactionUnless(
        proposedUpgradeChannel.state == UPGRADE_TRY &&
        proposedUpgradeChannel.counterpartyPortIdentifier == currentChannel.counterpartyPortIdentifier &&
        proposedUpgradeChannel.counterpartyChannelIdentifier == currentChannel.counterpartyChannelIdentifier
    )

    // 当前排序必须是有效数据包按照建议的排序
    // 例如 ORDERED -> UNORDERED, ORDERED -> DAG
    abortTransactionUnless(
        currentChannel.ordering.subsetOf(proposedUpgradeChannel.ordering)
    )

    // 构造 upgradeTimeout 以便可以针对交易对手状态进行验证
    upgradeTimeout = UpgradeTimeout{
        timeoutHeight: timeoutHeight,
        timeoutTimestamp: timeoutTimestamp,
    }

    // 获取底层连接以进行证明验证
    connection = getConnection(currentChannel.connectionIdentifier)

    // 验证交易对手状态的证明
    abortTransactionUnless(verifyChannelState(connection, proofHeight, proofChannel, currentChannel.counterpartyPortIdentifier, currentChannel.counterpartyChannelIdentifier, counterpartyChannel))
    abortTransactionUnless(verifyChannelUpgradeTimeout(connection, proofHeight, proofUpgradeTimeout, currentChannel.counterpartyPortIdentifier, currentChannel.counterpartyChannelIdentifier, upgradeTimeout))

    if currentChannel.state == UPGRADE_INIT {
    // 如果有交叉 hello，即在两个 channelEnds 上都调用了 UpgradeInit，
    // 那么我们要保证对方提出的Upgrade和currentChannel一致
    // 除通道状态外（升级通道将处于 UPGRADE_TRY，当前通道将处于 UPGRADE_INIT）
    // 如果双方提议的升级不兼容，那么我们将恢复通道并取消升级。
        currentChannel.state = UPGRADE_TRY
        if !currentChannel.IsEqual(proposedUpgradeChannel) {
            restoreChannel()
            return
        }
    } else if currentChannel.state == OPEN {
        // 这是此链上升级握手的第一条消息，因此我们必须将原始通道存储在恢复路径中
        // 以防我们稍后需要恢复通道。
        privateStore.set(restorePath(portIdentifier, channelIdentifier), currentChannel)
    } else {
        // 如果当前通道的状态不是：UPGRADE_INIT 或 OPEN，则中止交易
        abortTransactionUnless(false)
    }

    // 超时高度或时间戳必须非零
    // 如果升级功能是在 TRY 链上实现的，那么中继器可能会在超时后提交一个 TRY 交易。
    // 这将恢复执行链上的通道，并允许交易对手使用 ChanUpgradeCancelMsg 恢复他们的通道。
    if timeoutHeight == 0 && timeoutTimestamp == 0 {
        restoreChannel()
        return
    }
    

    // 不能超过交易对手指定的超时时间
    if (currentHeight() > timeoutHeight && timeoutHeight != 0) ||
        (currentTimestamp() > timeoutTimestamp && timeoutTimestamp != 0) {
        restoreChannel()
        return
    }

    // 两个通道端必须相互兼容。
    // 此函数未指定，因为它将取决于新通道的特定结构。
    // 实现的责任是确保验证提议两边的新通道都根据选择的新版本正确构造。
    if !IsCompatible(counterpartyChannel, proposedUpgradeChannel) {
        restoreChannel()
        return
    }

    // 调用模块 onChanUpgradeTry的回调
    module = lookupModule(portIdentifier)
    version, err = module.onChanUpgradeTry(
        proposedUpgradeChannel.ordering,
        proposedUpgradeChannel.connectionHops,
        portIdentifier,
        channelIdentifer,
        proposedUpgradeChannel.counterpartyPortIdentifer,
        proposedUpgradeChannel.counterpartyChannelIdentifier,
        proposedUpgradeChannel.version
    )
    // 如果回调返回错误，则恢复通道
    if err != nil {
        restoreChannel()
        return
    }

    // 如果通道版本被修改，将通道版本替换为应用程序返回的版本
    proposedUpgradeChannel.version = version
 
    provableStore.set(channelPath(portIdentifier, channelIdentifier), proposedUpgradeChannel)
}
```

注意：如何为`ChanUpgradeTry`函数提供访问控制取决于各个实现。例如链上治理、许可的 actor、DAO 等。链可以决定是否有许可**或**无许可的`UpgradeTry` 。在许可的情况下，两个链都必须明确同意升级；在无许可的情况下，一条链发起升级，另一条链默认同意升级。在无许可的情况下，中继器可以提交`ChanUpgradeTry`数据报文。

```typescript
function chanUpgradeAck(
    portIdentifier: Identifier,
    channelIdentifier: Identifier,
    counterpartyChannel: ChannelEnd,
    proofChannel: CommitmentProof,
    proofHeight: Height
) {
    // 当前通道在 UPGRADE_INIT 或 UPGRADE_TRY 中 (crossing hellos)
    currentChannel = provableStore.get(channelPath(portIdentifier, channelIdentifier))
    abortTransactionUnless(currentChannel.state == UPGRADE_INIT || currentChannel.state == UPGRADE_TRY)

    // 获取底层连接以进行证明验证
    connection = getConnection(currentChannel.connectionIdentifier)

    // 验证交易对手状态的证明
    abortTransactionUnless(verifyChannelState(connection, proofHeight, proofChannel, currentChannel.counterpartyPortIdentifier, currentChannel.counterpartyChannelIdentifier, counterpartyChannel))

    // 交易对手必须处于 TRY 状态
    if counterpartyChannel.State != UPGRADE_TRY {
        restoreChannel()
        return
    }

    // 验证通道是否相互兼容
    // 这也将检查交易对手选择的版本是否有效
    // 此函数未指定，因为它将取决于新通道的特定结构。
    // 实现的责任是确保验证提议两边的新通道都根据选择的新版本正确构造。
    if !IsCompatible(counterpartyChannel, channel) {
        restoreChannel()
        return
    }

    // 调用模块 onChanUpgradeAck的回调
    module = lookupModule(portIdentifier)
    err = module.onChanUpgradeAck(
        portIdentifier,
        channelIdentifier,
        counterpartyChannel.channelIdentifier,
        counterpartyChannel.version
    )
    // 如果回调返回错误，则恢复通道
    if err != nil {
        restoreChannel()
        return
    }

    // 升级完成
    // 将通道设置为 OPEN 并删除不必要的状态
    currentChannel.state = OPEN
    provableStore.set(channelPath(portIdentifier, channelIdentifier), currentChannel)
    provableStore.delete(timeoutPath(portIdentifier, channelIdentifier))
    privateStore.delete(restorePath(portIdentifier, channelIdentifier))
}
```

```typescript
function chanUpgradeConfirm(
    portIdentifier: Identifier,
    channelIdentifier: Identifier,
    counterpartyChannel: ChannelEnd,
    proofChannel: CommitmentProof,
    proofUpgradeError: CommitmentProof,
    proofHeight: Height,
) {
    // 当前通道在 UPGRADE_TRY
    currentChannel = provableStore.get(channelPath(portIdentifier, channelIdentifier))
    abortTransactionUnless(channel.state == UPGRADE_TRY)

    // 交易对手必须处于 OPEN 状态
    abortTransactionUnless(counterpartyChannel.State == OPEN)

    // 获取底层连接以进行证明验证
    connection = getConnection(currentChannel.connectionIdentifier)

    // 验证交易对手状态的证明
    abortTransactionUnless(verifyChannelState(connection, proofHeight, proofChannel, currentChannel.counterpartyPortIdentifier, currentChannel.counterpartyChannelIdentifier, counterpartyChannel))
    // 验证交易对手没有通过写入升级错误来中止升级握手
    // upgradeError 路径必须有缺失值
    abortTransactionUnless(verifyUpgradeChannelErrorAbsence(connection, proofHeight, proofUpgradeError, currentChannel.counterpartyPortIdentifier, currentChannel.counterpartyChannelIdentifier))

    // 调用模块 onChanUpgradeConfirm的回调
    module = lookupModule(portIdentifier)
    // 由于交易对手升级成功，确认回调不能返回错误
    module.onChanUpgradeConfirm(
        portIdentifer,
        channelIdentifier
    )
    
    // 升级完成
    // 将通道设置为 OPEN 并删除不必要的状态
    currentChannel.state = OPEN
    provableStore.set(channelPath(portIdentifier, channelIdentifier), currentChannel)
    provableStore.delete(timeoutPath(portIdentifier, channelIdentifier))
    privateStore.delete(restorePath(portIdentifier, channelIdentifier))
}
```

### 取消升级过程

在升级握手期间，链可以通过将错误收据写入错误路径并将原始通道恢复到`OPEN`来取消升级。然后，对方链也必须恢复其与`OPEN`的通道。

```typescript
function cancelChannelUpgrade(
    portIdentifier: Identifier,
    channelIdentifier: Identifier,
    errorReceipt: []byte,
    proofUpgradeError: CommitmentProof,
    proofHeight: Height,
) {
    // 当前通道在 UPGRADE_INIT 或 UPGRADE_TRY
    currentChannel = provableStore.get(channelPath(portIdentifier, channelIdentifier))
    abortTransactionUnless(channel.state == UPGRADE_INIT || channel.state == UPGRADE_TRY)

    abortTransactionUnless(!isEmpty(errorReceipt))

    // 获取底层连接以进行证明验证
    connection = getConnection(currentChannel.connectionIdentifier)
    // 验证非空错误回执写入 upgradeError 路径
    abortTransactionUnless(verifyChannelUpgradeError(connection, proofHeight, proofUpgradeError, currentChannel.counterpartyPortIdentifier, currentChannel.counterpartyChannelIdentifier, errorReceipt))

    // 取消升级
    // 并恢复原始连接
    // 删除不必要的状态
    originalChannel = privateStore.get(restorePath(portIdentifier, channelIdentifier))
    provableStore.set(channelPath(portIdentifier, channelIdentifier), originalChannel)

    // 删除辅助升级状态
    provableStore.delete(timeoutPath(portIdentifier, channelIdentifier))
    privateStore.delete(restorePath(portIdentifier, channelIdentifier))

    // 调用模块 onChanUpgradeRestore的回调
    module = lookupModule(portIdentifier)
    // 由于交易对手升级成功，恢复回调不能返回错误
    module.onChanUpgradeRestore(
        portIdentifer,
        channelIdentifier
    )
}
```

### 超时升级过程

如果 UPGRADE_TRY 交易根本无法传递给对方链，则通道升级过程可能会在 UPGRADE_TRY 上无限期停止；例如，对方链上可能未启用升级功能。

在这种情况下，我们不希望发起链无限期地停留在`UPGRADE_INIT`步骤中。因此， `UpgradeInit`消息将包含`TimeoutHeight`和`TimeoutTimestamp` 。如果指定的超时时间已经过去，则对方链应拒绝`UpgradeTry`消息。

此后，中继器必须向发起链提交`UpgradeTimeout`消息，证明对方链仍处于其原始状态。如果证明成功，则发起链也应恢复其原始通道并取消升级。

```typescript
function timeoutChannelUpgrade(
    portIdentifier: Identifier,
    channelIdentifier: Identifier,
    counterpartyChannel: ChannelEnd,
    proofChannel: CommitmentProof,
    proofHeight: Height,
) {
    // 当前通道必须在 UPGRADE_INIT
    currentChannel = provableStore.get(channelPath(portIdentifier, channelIdentifier))
    abortTransactionUnles(currentChannel.state == UPGRADE_INIT)

    upgradeTimeout = provableStore.get(timeoutPath(portIdentifier, channelIdentifier))

    // 证明必须在超时后从某一高度进行。必须定义 timeoutHeight 或 timeoutTimestamp。
    // 如果定义了 timeoutHeight 并且证明来自于 timeout 高度之前，则中止交易
    abortTransactionUnless(upgradeTimeout.timeoutHeight.IsZero() || proofHeight >= upgradeTimeout.timeoutHeight)
    // 如果定义了 timeoutTimestamp，那么从证明高度开始的共识时间必须大于 timeout 时间戳
    connection = queryConnection(currentChannel.connectionIdentifier)
    abortTransactionUnless(upgradeTimeout.timeoutTimestamp.IsZero() || getTimestampAtHeight(connection, proofHeight) >= upgradeTimeout.timestamp)

    // 获取底层连接以进行证明验证
    connection = getConnection(currentChannel.connectionIdentifier)

    // 必须证明交易对手通道仍处于 OPEN 状态或 UPGRADE_INIT 状态 (crossing hellos)
    abortTransactionUnless(counterpartyChannel.State === OPEN || counterpartyChannel.State == UPGRADE_INIT)
    abortTransactionUnless(verifyChannelState(connection, proofHeight, proofChannel, currentChannel.counterpartyPortIdentifier, currentChannel.counterpartyChannelIdentifier, counterpartyChannel))

    if counterpartyChannel.State == UPGRADE_INIT {
    // 如果对方在 UPGRADE_INIT 并且我们已经超时，那么我们应该写错误回执
    // 确保交易对手也中止握手并返回原始状态
    // 将错误收据写入错误路径
        errorReceipt = []byte{1}
        provableStore.set(errorPath(portIdentifier, channelIdentifier), errorReceipt)
    }

    // 我们必须恢复通道，因为超时验证已经通过
    originalChannel = privateStore.get(restorePath(portIdentifier, channelIdentifier))
    provableStore.set(channelPath(portIdentifier, channelIdentifier), originalChannel)

    // 删除辅助升级状态
    provableStore.delete(timeoutPath(portIdentifier, channelIdentifier))
    privateStore.delete(restorePath(portIdentifier, channelIdentifier))

    // 调用模块 onChanUpgradeRestore的回调
    module = lookupModule(portIdentifier)
    // 由于交易对手升级成功，恢复回调不能返回错误
    module.onChanUpgradeRestore(
        portIdentifer,
        channelIdentifier
    )
}
```

注意，超时逻辑仅适用于 INIT 步骤。这是为了防止升级链在交易对手无法成功执行 TRY 时卡在非 OPEN 状态。一旦 TRY 步骤成功，则保证双方都启用了升级功能。活性不再是一个问题，因为我们可以等到活性恢复后再执行 ACK 步骤，这必将会使通道进入 OPEN 状态（成功升级或回滚）。

TRY 链将接收对方链在 INIT 上选择的超时参数，以便它可以拒绝在指定的超时时间后收到的任何 TRY 消息。这可以防止握手进入无效状态，在这种状态下，INIT 链成功处理超时并恢复其与`OPEN`的通道，而 TRY 链将在之后的一个时间点成功写入`TRY`状态。

### 迁移

链可能必须要去更新其内部状态以与新升级的通道保持一致。在这种情况下，迁移的处理程序应该是升级过程之前链二进制文件的一部分，以便升级成功后链可以正确迁移其状态。如果一个升级需要迁移处理程序但该程序不可用，则执行链必须拒绝升级，以免进入无效状态。这种状态迁移不会被对方链验证，因为它只是假设如果通道升级到特定的通道版本，那么对方链的辅助状态也将被更新以匹配给定通道版本的规范。迁移只能在升级成功完成并且新通道`OPEN` （即在`ACK`和`CONFIRM`上）后运行。
