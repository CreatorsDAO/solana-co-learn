---
sidebar_position: 83
sidebar_label: 🧱 使用Solana Anchor框架进行建设
sidebar_class_name: green
---

# 🧱 使用Solana Anchor框架进行建设

我们从零开始。我们与Solana互动的第一个程序是`Ping`程序。让我们使用`Anchor`从头开始构建它。你可以在playground上做这个，但我会在本地设置，因为测试更容易。我们从零开始。我们与Solana互动的第一个程序是Ping程序。让我们使用`Anchor`从头开始构建它。你可以在playground上做这个，但我会在本地设置，因为测试更容易。

我们想要做的是一个相当简单的程序：

- 有一个账户
- 记录某个指令被调用的次数。

这意味着我们需要两个指令，一个用于初始化该账户及其数据结构，另一个用于增加计数。

`Anchor`使用一些 Rust 魔法来处理所有这些问题 ✨，它被设计用于处理许多常见的安全问题，因此您可以构建更安全的程序！添加 `initialize` 指令

- 在 `#[program]` 内实施 `initialize` 指令
- `initialize` 需要一个类型为 `Initialize` 的 `Context` ，并且不需要额外的指令数据
- 在指令逻辑中，将 `counter` 账户的 `count` 字段设置为 `0`

```rust
pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
    let counter = &mut ctx.accounts.counter;
    counter.count = 0;
    msg!("Counter Account Created");
    msg!("Current Count: { }", counter.count);
    Ok(())
}
```

## 实施 `Context` 类型 `Initialize`

- 使用 `#[derive(Accounts)]` 宏来实现 `Initialize Context` 类型
- 该`initialize`指令需要：
    - `counter` - 指令中初始化的计数器账户
    - `user` - 初始化的付款人
    - `system_program` - 系统程序需要用于初始化任何新账户
- 指定账户类型以进行账户验证
- 使用 `#[account(..)]` 属性来定义额外的约束条件

```rust
#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = user, space = 8 + 8)]
    pub counter: Account<'info, Counter>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}
```

## Implement Counter

使用`#[account]`属性来定义一个新的计数器账户类型

```rust
#[account]
pub struct Counter {
    pub count: u64,
}
```

## 添加 `increment` 指令

- 在 `#[program]` 内，实施一个 `increment` 指令，以增加现有 `counter` 账户上的 `count`
- 需要一个类型为 `Context` 的 `Update` 的 `increment` ，并且不需要额外的指令数据
- 在指令逻辑中，将现有计数器账户的计数字段增加`1`

```rust
pub fn increment(ctx: Context<Update>) -> Result<()> {
    let counter = &mut ctx.accounts.counter;
    msg!("Previous Count: { }", counter.count);
    counter.count = counter.count.checked_add(1).unwrap();
    msg!("Counter Incremented");
    msg!("Current Count: { }", counter.count);
    Ok(())
}
```

## 实施 `Context` 类型 `Update`

- 使用 `#[derive(Accounts)]` 宏来实现 `Update Context` 类型
- 该`increment`指令需要：
    - `counter` - 一个已存在的计数器账户来递增
    - `user` - 付款人支付交易手续费
- 指定账户类型以进行账户验证
- 使用 `#[account(..)]` 属性来定义额外的约束条件

```rust
#[derive(Accounts)]
pub struct Update<'info> {
    #[account(mut)]
    pub counter: Account<'info, Counter>,
    pub user: Signer<'info>,
}
```

## 构建，部署，测试*

解决方案：[https://beta.solpg.io/631b39c677ea7f12846aee8c](https://beta.solpg.io/631b39c677ea7f12846aee8c)

- 构建和部署
- 使用SolPG进行测试（支持锚点测试）

## 🚢 船舶挑战

好了，是时候发挥你的技能，独立地建造一些东西了。

### 概述


因为我们从非常简单的程序开始，所以你的程序看起来几乎和我们刚刚创建的一样。尽量达到能够从头开始编写代码而不参考之前的代码，这样会很有帮助，所以请尽量不要在这里复制粘贴。

### 行动步骤

- 1. 编写一个新程序，初始化一个 `counter` 账户，并使用传入指令数据参数设置 `count` 字段。
- 2. 执行 `initialize` ， `increment` 和 `decrement` 指令
- 3. 按照我们在演示中所做的，为每个指令编写测试
- 4. 使用 `anchor deploy` 来部署你的程序。如果你愿意，可以像之前一样编写一个脚本来发送交易到你新部署的程序，然后使用Solana Explorer查看程序日志。

像往常一样，对这些挑战充满创意，超越基本指示，如果你愿意的话，尽情享受吧！

> **提示**
> 如果可以的话，尽量独立完成这个任务！但如果遇到困难，可以参考这个仓库的解决方案-[递减分支](https://github.com/buildspace/anchor-counter-program/tree/solution-decrement?utm_source=buildspace.so&utm_medium=buildspace_project)。
