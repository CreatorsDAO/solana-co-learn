---
sidebar_position: 83
sidebar_label: 🛣 Anchor中的PDA
sidebar_class_name: green
---

# 🛣 Anchor中的PDA（程序派生地址）

## 🛣 Anchor里的PDAs

你做得很好！让我们继续深入探讨。

本课程中，我们将深入探讨如何使用`#[account(...)]`属性，并深入了解以下限制条件：

- `seeds` 和 `bump` - 初始化和验证`PDA`
- `realloc` - 重新分配账户空间
- `close` - 关闭账户

## 🛣 Anchor里的PDAs

我们再次回顾一下，[PDA](https://github.com/Unboxed-Software/solana-course/blob/main/content/pda.md?utm_source=buildspace.so&utm_medium=buildspace_project)是通过一系列可选的种子、一个`bump seed`和一个 `programId`来衍生的。`Anchor`提供了一种方便的方式来验证带有`seeds`和`bump`限制的`PDA`。

![](./img/pda.png)

在账户验证过程中，`Anchor`会使用`seeds`约束中指定的种子生成一个`PDA`，并确认传入指令的账户是否与找到的`PDA`匹配。

当包含`bump`约束，但未指定具体的`bump`时，`Anchor`将默认使用规范`bump`（即找到有效`PDA`的第一个`bump`）。

![](./img/example-pda.png)

在此示例中，通过`seed`和`bump`约束验证`pda_account`的地址是否是预期的`PDA`。

推导`PDA`的 `seeds`包括：

- `example_seed` - 一个硬编码的字符串值
- `user.key()` - 传入账户的公钥 `user`
- `instruction_data` - 传入指令的数据
    - 你可以通过`#[instruction(...)]`属性来访问这些数据

![](./img/example-instruction.png)

- 使用`#[instruction(...)]`属性时，指令数据必须按照传入指令的顺序排列
- 你可以忽略不需要的最后一个参数及其之后的所有参数

![](./img/example-pda-1.png)

如果输入顺序错误，将会导致错误

![](./img/example-pda-2.png)

你可以将`init`约束与`seeds`和`bump`约束组合，以使用`PDA`初始化账户。

`init`约束必须与以下内容结合使用：

- `payer` - 指定用于支付初始化费用的账户
- `space` - 新账户所分配的空间大小
- `system_program` - 在账户验证结构中必须存在的`system_program`

默认情况下，`init`会将创建账户的所有者设置为当前正在执行的程序。

- 当使用`init`与`seeds`和`bump`初始化`PDA`账户时，所有者必须是正在执行的程序
- 这是因为创建账户需要签名，只有执行程序的`PDA`才能提供
- 如果用于派生`PDA`的`programId`与正在执行的程序的`programId`不匹配，则`PDA`账户初始化的签名验证将失败
- 因为`init`使用`find_program_address`来推导`PDA`，所以不需要指定`bump`值
- 这意味着`PDA`将使用规范的`bump`进行推导
- 在为执行`Anchor`程序所初始化和拥有的账户分配`space`时，请记住前8个字节是保留给唯一账户`discriminator`的，`Anchor`程序使用该`discriminator`来识别程序账户类型

## 🧮 重新分配

在许多情况下，你可能需要更新现有账户而不是创建新账户。`Anchor`提供了出色的`realloc`约束，为现有账户重新分配空间提供了一种简便的方法。

![](./img/realloc.png)

`realloc`约束必须与以下内容结合使用：

- `mut` - 账户必须设置为可变
- `realloc::payer` - 账户空间的增加或减少将相应增加或减少账户的`lamports`
- `realloc::zero` - 一个布尔值，用于指定是否应将新内存初始化为零
- `system_program` - `realloc`约束要求在账户验证结构中存在`system_program`

例如，重新分配用于存储`String`类型字段的账户的空间。

- 使用`String`类型时，除了`String`本身所需的空间外，还需要额外的4个字节来存储`String`的长度
- 如果账户数据长度是增加的，为了保持租金豁免，`Lamport`将从`realloc::payer`转移到程序账户
- 如果长度减少，`Lamport`将从程序账户转回`realloc::payer`
- 需要`realloc::zero`约束来确定重新分配后是否应对新内存进行零初始化
- 在之前减小过空间的账户上增加空间时，应将此约束设置为true

## ❌ `close` 关闭操作

当你用完一个账户并不再需要它时会发生什么呢？你可以将它关闭！

通过这样做，你可以腾出空间，并收回用于支付租金的`SOL`！

执行关闭操作是通过使用 `close` 约束来完成的：

![](./img/close.png)

- `close` 约束会在指令执行结束时将账户标记为已关闭，并通过将其`discriminator`设置为 `CLOSED_ACCOUNT_DISCRIMINATOR`，同时将其 `lamports` 发送到特定的账户。
- 将`discriminator`设置为特定的变量，以阻止账户复活攻击（例如，后续指令重新添加租金豁免的`lamports`）。
- 我们将关闭名为 `data_account` 的账户，并将用于租金的`lamports`发送到名为 `receiver` 的账户。
- 然而，目前任何人都可以调用关闭指令并关闭 `data_account`。

![](./img/close2.png)

- `has_one` 约束可以用来核实传入指令的账户是否与存储在 `data` 账户字段中的账户匹配。
- 你必须在所使用的账户的 `data` 字段上应用特定的命名规则，以便进行 `has_one` 约束检查。
- 使用 `has_one = receiver`时：
    - 账户的 `data` 需要有一个名为 `receiver` 的字段与之匹配。
    - 在 `#[derive(Accounts)]` 结构中，账户名称也必须称为 `receiver`。
- 请注意，虽然使用 `close` 约束只是一个例子，但 `has_one` 约束可以有更广泛的用途。
