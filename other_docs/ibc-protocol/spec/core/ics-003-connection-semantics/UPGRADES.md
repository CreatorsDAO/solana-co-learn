# 升级连接

### 概要

本规范规定了 IBC 必须实现的接口和状态机逻辑，以便现存连接在初始连接握手后能够升级。

### 动机

随着新功能被添加到 IBC，链可能希望在不放弃现有连接的已积累的状态和网络效应的情况下，同时利用新的连接功能。提议的升级协议将允许链重新协商现有连接，这样可以使用新的功能而无需创建新连接，从而保留当前连接之上的所有当前已建立的通道。

### 所需属性

- 两条链都必须认同重新协商后的连接参数。
- 两条链上的连接状态和逻辑应该或者使用旧参数或者新参数，而不能是一个中间状态，例如，当一个链的对方链期望新的证明路径时，这个链就绝不能将状态写入旧的证明路径。
- 连接升级协议是原子性的，即
    - 要么不成功，然后连接必须回退到原始连接参数；
    - 要么成功，然后连接两端必须采用新的连接参数并妥善地处理 IBC 数据。
- 连接升级协议应该具有改变所有连接相关参数的能力；但是连接升级协议不能改变下层的`ClientState` 。连接升级协议不得修改连接标识符。

## 技术规范

### 数据结构

`ConnectionState`和`ConnectionEnd`定义见[ICS-3](./README.md)。为方便读者，在此重述。 `UPGRADE_INIT` ， `UPGRADE_TRY`是新增的附加状态，以启用升级功能。

#### **ConnectionState（摘自[ICS-3](README.md) ）**

```typescript
enum ConnectionState {
  INIT,
  TRYOPEN,
  OPEN,
  UPGRADE_INIT,
  UPGRADE_TRY,
}
```

- 提议升级的链应该将连接状态从`OPEN`修改置为`UPGRADE_INIT`
- 接受升级的对方链应将连接状态从`OPEN`修改置为`UPGRADE_TRY`

#### **ConnectionEnd（摘自[ICS-3](README.md) ）**

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

连接升级协议不能修改下层客户端或连接标识符。这个所需要的属性意味着只有`ConnectionEnd`的某些字段可以被升级协议升级。

- `state` ：状态由升级协议的握手步骤指定。

可修改项目：

- `counterpartyPrefix`：这一前缀可以在升级协议中修改。对方链必须要么接受新提议的前缀值，要么在升级握手期间返回错误。
- `version` ：版本可以被升级协议修改。在初始连接握手中发生的相同版本协商可用于升级的握手中。
- `delayPeriodTime` ：延迟时间可以被升级协议修改。对方链必须要么接受新的提议值，要么在升级握手期间返回错误。
- `delayPeriodBlocks` ：延迟时间可以被升级协议修改。对方链必须要么接受新的提议值，要么在升级握手期间返回错误。

不可修改项目：

- `counterpartyConnectionIdentifier`：对方链连接标识符不能被升级协议修改。
- `clientIdentifier` ：客户端标识符不能被升级协议修改
- `counterpartyClientIdentifier`：升级协议不能修改对方链的客户端标识符

注意：如果升级将任何字段添加到`ConnectionEnd` ，这些是默认可修改的，并且可以被有权限发起升级的 Actor（例如链上治理）所任意选择。

可修改的字段也可以被完全删除。

#### **UpgradeTimeout**

```typescript
interface UpgradeTimeout {
    timeoutHeight: Height
    timeoutTimestamp: uint64
}
```

- `timeoutHeight` ：超时高度表示在此区块高度上，对方链不能再进行升级握手。此后，两条链将保留其原始连接，而升级握手被中止。
- `timeoutTimestamp` ：超时时间戳表示对方链不能再进行升级握手的时间。此后，两条链将保留其原始连接，而升级握手被中止。

timeoutHeight 或 timeoutTimestamp，至少其中之一必须非零。

### 储存路径

#### 恢复连接路径

链必须存储之前的连接端，以便在升级握手失败时可以恢复它。该数据可以存储在私有存储中。

```typescript
function connectionRestorePath(id: Identifier): Path {
    return "connections/{id}/restore"
}
```

#### 升级错误路径

升级错误路径是可以向对方链发出升级错误信号的公共路径。在成功的情况下它不存储任何内容，但在链不接受提议的升级的情况下，它将存储一个哨兵中止值。

```typescript
function connectionErrorPath(id: Identifier): Path {
    return "connections/{id}/upgradeError"

}
```

UpgradeError 必须有一个关联的验证成员和非成员函数添加到连接接口，以便对方链可以验证本链是否在 UpgradeError 路径中存储了该错误。

```typescript
// 连接端验证连接升级错误的方法
function verifyConnectionUpgradeError(
  connection: ConnectionEnd,
  height: Height,
  proof: CommitmentProof,
  upgradeErrorReceipt: []byte,
) {
    client = queryClient(connection.clientIdentifier)
    // 构造 CommitmentPath
    path = applyPrefix(connection.counterpartyPrefix, connectionErrorPath(connection.counterpartyConnectionIdentifier))
    // 验证 upgradeErrorReceipt 是否存储在构造好的 path
    // 延迟时间对非数据包的验证不是必需的，因此对延迟时间的字段传入 0
    return client.verifyMembership(height, 0, 0, proof, path, upgradeErrorReceipt)
}
```

```typescript
// 连接端验证升级错误不存在的方法
function verifyConnectionUpgradeErrorAbsence(
  connection: ConnectionEnd,
  height: Height,
  proof: CommitmentProof,
) {
    client = queryClient(connection.clientIdentifier)
    // 构造 CommitmentPath
    path = applyPrefix(connection.counterpartyPrefix, connectionErrorPath(connection.counterpartyConnectionIdentifier))
    // 验证升级错误的路径是否为空
    // 延迟时间对非数据包的验证不是必需的，因此对延迟时间的字段传入 0
    return client.verifyNonMembership(height, 0, 0, proof, path)
}
```

#### 超时路径

超时路径是升级发起者设置的公共路径，用于确定 TRY 步骤何时超时。它存储了`timeoutHeight`和`timeoutTimestamp` ，此时对方链必须已进入 TRY 步骤。在 TRY 成功的情况下，该路径将在对方链上得到证明，以确保没有超时。在超时的情况下，对方链证明已经超过了超时时间，并已经在其链上恢复连接。

```typescript
function timeoutPath(id: Identifier) Path {
    return "connections/{id}/upgradeTimeout"
}
```

超时路径必须在连接接口上具有关联的验证方法，以便对方链证明该链存储了特定的`UpgradeTimeout` 。

```typescript
// 连接端验证连接升级超时的方法
function verifyConnectionUpgradeTimeout(
  connection: ConnectionEnd,
  height: Height,
  proof: CommitmentProof,
  upgradeTimeout: UpgradeTimeout,
) {
    client = queryClient(connection.clientIdentifier)
    // 构造 CommitmentPath
    path = applyPrefix(connection.counterpartyPrefix, connectionTimeoutPath(connection.counterpartyConnectionIdentifier))
    // 按照标准 protobuf 编码，将 upgradeTimeout 序列化为字节数组
    timeoutBytes = protobuf.marshal(upgradeTimeout)
    client.verifyMembership(height, 0, 0, proof, path, timeoutBytes)
}
```

## 实用函数

`restoreConnection()`是一个实用函数，它允许链中止正在进行的升级握手，并将`connectionEnd`返回到其原始升级前状态，同时还设置`errorReceipt` 。然后，中继器可以向对方链发送`cancelUpgradeMsg` ，以便它也可以将其`connectionEnd`恢复到其升级前状态。一旦两个连接端都恢复到升级前的状态，连接将继续按照其原始连接参数进行处理。

```typescript
function restoreConnection() {
    // 取消升级
    // 将一个错误收据写入错误路径中
    // 并且恢复原始连接
    errorReceipt = []byte{1}
    provableStore.set(errorPath(identifier), errorReceipt)
    originalConnection = privateStore.get(restorePath(identifier))
    provableStore.set(connectionPath(identifier), originalConnection)
    provableStore.delete(timeoutPath(identifier))
    privateStore.delete(restorePath(identifier))
    // 调用者也应当返回
}
```

## 子协议

连接升级过程由三个子协议组成： `UpgradeConnectionHandshake` 、 `CancelConnectionUpgrade`和`TimeoutConnectionUpgrade` 。在两条链都同意提议的升级的情况下，升级握手协议应该成功完成并且`ConnectionEnd`应该成功升级。

### 升级握手

升级握手定义了四个数据报文： *ConnUpgradeInit* 、 *ConnUpgradeTry* 、 *ConnUpgradeAck*和*ConnUpgradeConfirm*

一个成功的协议执行流程如下（注意，所有调用都是通过 ICS 25 的模块进行的）：

发起者 | 数据报文 | 操作的链 | 先前状态（A，B） | 其后状态（A，B）
--- | --- | --- | --- | ---
Actor | `ConnUpgradeInit` | A | (OPEN, OPEN) | (UPGRADE_INIT, OPEN)
Actor | `ConnUpgradeTry` | B | (UPGRADE_INIT, OPEN) | (UPGRADE_INIT, UPGRADE_TRY)
Relayer | `ConnUpgradeAck` | A | (UPGRADE_INIT, UPGRADE_TRY) | (OPEN, UPGRADE_TRY)
Relayer | `ConnUpgradeConfirm` | B | (OPEN, UPGRADE_TRY) | (OPEN, OPEN)

在两个实现子协议的链之间的升级握手结束时，以下属性成立：

- 每条链都在运行它们新升级后的连接端，并根据升级后的参数处理升级后的逻辑和状态。
- 每条链都知道并同意对方升级的连接参数。

如果一个链不同意提议的对方链`UpgradedConnection` ，它可以通过将错误收据写入`errorPath`并恢复原始连接来中止升级握手。错误收据可以有任意字节并且必须是非空的。

`errorPath(id) => error_receipt`

之后中继器可以向对方链提交`CancelConnectionUpgradeMsg` 。收到此消息后，链必须验证对方链是否在其`UpgradeError`中写入了非空错误收据，如果成功，它将恢复其原始连接，从而取消升级。

如果一个升级消息在指定的超时后到达，则消息不能成功执行。中继器可以再次在`CancelConnectionUpgradeTimeoutMsg`中提交证明，以便对方链取消升级并恢复其原始连接。

```typescript
function connUpgradeInit(
    identifier: Identifier,
    proposedUpgradeConnection: ConnectionEnd,
    counterpartyTimeoutHeight: Height,
    counterpartyTimeoutTimestamp: uint64,
) {
    // 当前连接必须为 OPEN
    currentConnection = provableStore.get(connectionPath(identifier))
    abortTransactionUnless(currentConnection.state == OPEN)

    // 一个不可修改的字段被修改了，则中止交易
    // 升级后的连接状态必须为 `UPGRADE_INIT`
    // 注意：任何新添加的字段默认为可修改的。
    abortTransactionUnless(
        proposedUpgradeConnection.state == UPGRADE_INIT &&
        proposedUpgradeConnection.counterpartyConnectionIdentifier == currentConnection.counterpartyConnectionIdentifier &&
        proposedUpgradeConnection.clientIdentifier == currentConnection.clientIdentifier &&
        proposedUpgradeConnection.counterpartyClientIdentifier == currentConnection.counterpartyClientIdentifier
    )

    // 超时高度或超时时间戳必须为非零值
    abortTransactionUnless(counterpartyTimeoutHeight != 0 || counterpartyTimeoutTimestamp != 0)

    upgradeTimeout = UpgradeTimeout{
        timeoutHeight: counterpartyTimeoutHeight,
        timeoutTimestamp: counterpartyTimeoutTimestamp,
    }

    provableStore.set(timeoutPath(identifier), upgradeTimeout)
    provableStore.set(connectionPath(identifier), proposedUpgradeConnection)
    privateStore.set(restorePath(identifier), currentConnection)
}
```

注意：如何为`ConnUpgradeInit`函数提供访问控制取决于各个实现。例如链治理、许可参与者、DAO 等。对交易对手的访问控制应提供超时值的选择，即如果交易对手的`UpgradeTry`由链治理把控，则超时值应该很大。

```typescript
function connUpgradeTry(
    identifier: Identifier,
    proposedUpgradeConnection: ConnectionEnd,
    counterpartyConnection: ConnectionEnd,
    timeoutHeight: Height,
    timeoutTimestamp: uint64,
    proofConnection: CommitmentProof,
    proofUpgradeTimeout: CommitmentProof,
    proofHeight: Height
) {
    // 当前连接必须为 OPEN 或 UPGRADE_INIT （交叉打招呼）
    currentConnection = provableStore.get(connectionPath(identifier))
    abortTransactionUnless(currentConnection.state == OPEN || currentConnection.state == UPGRADE_INIT)

    // 如果一个不可修改的字段被修改了，则中止交易
    // 升级后的连接状态必须为 `UPGRADE_TRY`
    // 注意：任何新添加的字段默认为可修改的。
    abortTransactionUnless(
        proposedUpgradeConnection.state == UPGRADE_TRY &&
        proposedUpgradeConnection.counterpartyConnectionIdentifier == currentConnection.counterpartyConnectionIdentifier &&
        proposedUpgradeConnection.clientIdentifier == currentConnection.clientIdentifier &&
        proposedUpgradeConnection.counterpartyClientIdentifier == currentConnection.counterpartyClientIdentifier
    )

    // 从超时高度和超时时间戳构造出超时时间
    // 这样，我们可以证明他们是被对方链所设置的
    upgradeTimeout = UpgradeTimeout{
        timeoutHeight: timeoutHeight,
        timeoutTimestamp: timeoutTimestamp,
    }

    // 验证对方链状态的证明
    abortTransactionUnless(verifyConnectionState(currentConnection, proofHeight, proofConnection, currentConnection.counterpartyConnectionIdentifier, proposedUpgradeConnection))
    abortTransactionUnless(verifyConnectionUpgradeTimeout(currentConnection, proofHeight, proofUpgradeTimeout,  upgradeTimeout))

    // 验证对方链连接的不可修改的字段没有被修改，并且对方链的状态为 UPGRADE_INIT
    abortTransactionUnless(
        counterpartyConnection.state == UPGRADE_INIT &&
        counterpartyConnection.counterpartyConnectionIdentifier == identifier &&
        counterpartyConnection.clientIdentifier == currentConnection.counterpartyClientIdentifier &&
        counterpartyConnection.counterpartyClientIdentifier == currentConnection.clientIdentifier
    )

    if currentConnection.state == UPGRADE_INIT {
        // 如果存在交叉打招呼的情况，即 UpgradeInit 被两个 connectionEnds 所调用，
        // 则除连接状态之外（升级连接将会是 UPGRADE_TRY 而当前连接将会是 UPGRADE_INIT）
        // 我们必须确保对方链的 proposedUpgrade 与 currentConnection 相同
        // 如果提议升级在任意一方是不兼容的，则我们要恢复连接并取消升级。
        currentConnection.state = UPGRADE_TRY
        if !currentConnection.IsEqual(proposedUpgradeConnection) {
            restoreConnection()
            return
        }
    } else if currentConnection.state == OPEN {
        // 这是在该链上升级握手中的第一条消息，所以我们必须在恢复路径中存储原始连接
        // 以备我们将来需要恢复连接。
        privateStore.set(restorePath(identifier), currentConnection)
    } else {
        // 如果当前连接不为 INIT 或 OPEN，则中止交易
        abortTransactionUnless(false)
    }
    
    // 超时高度或超时时间戳必须为非零值
    // 如果升级功能在 TRY 的链上实现，则一个中继器可以在超时之后提交一个 TRY 交易。
    // 这会在执行链上恢复连接，并允许对方链来使用 CancelUpgradeMsg 来恢复他们的连接。
    if timeoutHeight == 0 && timeoutTimestamp == 0 {
        restoreConnection()
        return
    }
    
    // 必须没有超过对方链指定的超时时间
    if (currentHeight() > timeoutHeight && timeoutHeight != 0) ||
        (currentTimestamp() > timeoutTimestamp && timeoutTimestamp != 0) {
        restoreConnection()
        return
    }

    // 验证所选的版本是兼容的
    versionsIntersection = intersection(counterpartyConnection.version, proposedUpgradeConnection.version)
    version = pickVersion(versionsIntersection) // aborts transaction if there is no intersection

    // 两个连接端必须相互兼容。
    // 该函数未被指定，因为它会取决于新连接的特定结构。
    // 实现时有责任来确保验证
    // 提议新连接在任何一方都按照所选的新版本被正确构造。
    if !IsCompatible(counterpartyConnection, proposedUpgradeConnection) {
        restoreConnection()
        return
    }

    provableStore.set(connectionPath(identifier), proposedUpgradeConnection)
}
```

注意：如何为`ConnUpgradeTry`函数提供访问控制取决于各个实现。例如链上治理、许可的 actor、DAO 等。链可以决定是否有许可**或**无许可的`UpgradeTry` 。在许可的情况下，两个链都必须明确同意升级；在无许可的情况下，一条链发起升级，另一条链默认同意升级。在无许可的情况下，中继器可以提交`ConnUpgradeTry`数据报。

```typescript
function connUpgradeAck(
    identifier: Identifier,
    counterpartyConnection: ConnectionEnd,
    proofConnection: CommitmentProof,
    proofHeight: Height
) {
    // 当前连接是 UPGRADE_INIT 或 UPGRADE_TRY （交叉打招呼）
    currentConnection = provableStore.get(connectionPath(identifier))
    abortTransactionUnless(currentConnection.state == UPGRADE_INIT || currentConnection.state == UPGRADE_TRY)

    // 验证对方链状态的证明
    abortTransactionUnless(verifyConnectionState(currentConnection, proofHeight, proofConnection, currentConnection.counterpartyConnectionIdentifier, counterpartyConnection))

    // 对方链必须是 TRY 状态
    if counterpartyConnection.State != UPGRADE_TRY {
        restoreConnection()
        return
    }

    // 验证连接是互相兼容的
    // 这也会检查对方链所选的版本是有效的
    // 该函数未被指定，因为它会取决于新连接的特定结构。
    // 实现时有责任来确保验证
    // 提议新连接在任何一方都按照所选的新版本被正确构造。
    if !IsCompatible(counterpartyConnection, connection) {
        restoreConnection()
        return
    }

    // 升级完成
    // 设置连接为 OPEN 并且删除不需要的状态
    currentConnection.state = OPEN
    provableStore.set(connectionPath(identifier), currentConnection)
    provableStore.delete(timeoutPath(identifier))
    privateStore.delete(restorePath(identifier))
}
```

```typescript
function connUpgradeConfirm(
    identifier: Identifier,
    counterpartyConnection: ConnectionEnd,
    proofConnection: CommitmentProof,
    proofUpgradeError: CommitmentProof,
    proofHeight: Height,
) {
    // 当前连接是 UPGRADE_TRY
    currentConnection = provableStore.get(connectionPath(identifier))
    abortTransactionUnless(currentConnection.state == UPGRADE_TRY)

    // 对方链必须是 OPEN 状态
    abortTransactionUnless(counterpartyConnection.State == OPEN)

    // 验证对方链状态的证明
    abortTransactionUnless(verifyConnectionState(currentConnection, proofHeight, proofConnection, currentConnection.counterpartyConnectionIdentifier, counterpartyConnection))

    // 验证对方链没有恢复连接
    // 并在连接 upgradeError 路径中存储了一个升级错误
    abortTransactionUnless(verifyConnectionUpgradeErrorAbsence(currentConnection, proofHeight, proofUpgradeError))
    
    // 升级完成
    // 设置连接为 OPEN 并且删除不必要的状态
    currentConnection.state = OPEN
    provableStore.set(connectionPath(identifier), currentConnection)
    provableStore.delete(timeoutPath(identifier))
    privateStore.delete(restorePath(identifier))
}
```

注意：由于对方链已经升级成功并在`ACK`步骤中移动到`OPEN` ，我们无法在此处恢复连接。我们只用验证对方链升级成功，然后自己再升级。

### 取消升级过程

在升级握手期间，链可以通过将错误收据写入错误路径并将原始连接恢复到`OPEN`来取消升级。然后，对方链也必须恢复其与`OPEN`的连接。

连接端只能在升级协商过程（TRY，ACK）中取消升级。一旦另一条链已经完成升级并移至`OPEN` ，则不能在一端取消升级，因为这将导致连接处于无效状态。

中继器可以通过调用`CancelConnectionUpgrade`来推进该过程：

```typescript
function cancelConnectionUpgrade(
    identifier: Identifer,
    errorReceipt: []byte,
    proofUpgradeError: CommitmentProof,
    proofHeight: Height,
) {
    // 当前连接是 UPGRADE_INIT 或 UPGRADE_TRY
    currentConnection = provableStore.get(connectionPath(identifier))
    abortTransactionUnless(currentConnection.state == UPGRADE_INIT || currentConnection.state == UPGRADE_TRY)

    abortTransactionUnless(!isEmpty(errorReceipt))

    abortTransactionUnless(verifyConnectionUpgradeError(currentConnection, proofHeight, proofUpgradeError, errorReceipt))

    // 取消升级
    // 并且恢复原始连接
    // 删除不必要的状态
    originalConnection = privateStore.get(restorePath(identifier))
    provableStore.set(connectionPath(identifier), originalConnection)

    // 删除辅助升级状态
    provableStore.delete(timeoutPath(identifier))
    privateStore.delete(restorePath(identifier))
}
```

### 超时升级过程

如果 UPGRADE_TRY 交易根本无法传递给对方链，则连接升级过程可能会在 UPGRADE_TRY 上无限期停止；例如，对方链上可能未启用升级功能。

在这种情况下，我们不希望初始化链无限期地停留在`UPGRADE_INIT`步骤中。因此， `UpgradeInit`消息将包含`TimeoutHeight`和`TimeoutTimestamp` 。如果指定的超时时间已经过去，则对方链应拒绝`UpgradeTry`消息。

此后，中继器必须向发起链提交`UpgradeTimeout`消息，证明对方链仍处于其原始状态。如果证明成功，则发起链也应恢复其原始连接并取消升级。

```typescript
function timeoutConnectionUpgrade(
    identifier: Identifier,
    counterpartyConnection: ConnectionEnd,
    proofConnection: CommitmentProof,
    proofHeight: Height,
) {
    // 当前连接必须为 UPGRADE_INIT
    currentConnection = provableStore.get(connectionPath(identifier))
    abortTransactionUnles(currentConnection.state == UPGRADE_INIT)

    upgradeTimeout = provableStore.get(timeoutPath(identifier))

    // 证明必须是来自一个超过超时时间的高度。超时高度或超时时间戳必须已定义。
    // 如果超时高度已定义，证明来自超时高度之前，
    // 那么中止交易
    abortTransactionUnless(upgradeTimeout.timeoutHeight.IsZero() || proofHeight >= upgradeTimeout.timeoutHeight)
    // 如果超时时间戳已定义，那么来自证明高度的共识时间必须大于超时时间戳
    abortTransactionUnless(upgradeTimeout.timeoutTimestamp.IsZero() || getTimestampAtHeight(currentConnection, proofHeight) >= upgradeTimeout.timestamp)

    // 对方链的连接必须被证明为仍处于 OPEN 或 UPGRADE_INIT 状态（交叉打招呼）
    abortTransactionUnless(counterpartyConnection.State === OPEN || counterpartyConnection.State == UPGRADE_INIT)
    abortTransactionUnless(verifyConnectionState(currentConnection, proofHeight, proofConnection, currentConnection.counterpartyConnectionIdentifier, counterpartyConnection))

    // 因为超时验证已通过，我们必须恢复连接
    originalConnection = privateStore.get(restorePath(identifier))
    provableStore.set(connectionPath(identifier), originalConnection)

    // 删除辅助升级状态
    provableStore.delete(timeoutPath(identifier))
    privateStore.delete(restorePath(identifier))
}
```

注意，超时逻辑仅适用于 INIT 步骤。这是为了防止升级链在交易对手无法成功执行 TRY 时卡在非 OPEN 状态。一旦 TRY 步骤成功，则保证双方都启用了升级功能。活性不再是一个问题，因为我们可以等到活性恢复后再执行 ACK 步骤，这必将会使连接进入 OPEN 状态（成功升级或回滚）。

TRY 的链将接收对方链在 INIT 上选择的超时参数，以便它可以拒绝在指定的超时时间后收到的任何 TRY 消息。这可以防止握手进入无效状态，在这种状态下，INIT 链成功处理超时并恢复其与`OPEN`的连接，而 TRY 的链将在之后的一个时间点成功写入`TRY`状态。

### 迁移

链可能必须要去更新其内部状态以与新升级的连接保持一致。在这种情况下，迁移的处理程序应该是升级过程之前链二进制文件的一部分，以便升级成功后链可以正确迁移其状态。如果一个升级需要迁移处理程序但该程序不可用，则执行链必须拒绝升级，以免进入无效状态。这种状态迁移不会被对方链验证，因为它只是假设如果连接升级到特定的连接版本，那么对方链的辅助状态也将被更新以匹配给定连接版本的规范。迁移只能在升级成功完成并且新连接`OPEN` （即在`ACK`和`CONFIRM`上）后运行。
