---
sidebar_position: 59
sidebar_label: ❗ 错误处理和数据验证
sidebar_class_name: green
tags:
  - security-and-validation
  - solana
  - native-solana-program
  - error-handle-and-data-validation
---

# ❗ 错误处理和数据验证

本节课将为你介绍一些程序安全方面的基本注意事项。虽然这并非全面的概述，但它能让你像攻击者那样思考，思索重要的问题：我如何破解这个程序？

## 😡 自定义错误

`Rust`具有非常强大的错误处理机制。你可能已经遇到了一些要求你必须处理异常情况的编译器规则。

下面展示了如何为我们的笔记程序创建自定义错误的方法：


```rust
use solana_program::{program_error::ProgramError};
use thiserror::Error;

#[derive(Error)]
pub enum NoteError {
  #[error("Wrong Note Owner")]
  Forbidden,

  #[error("test is too long")]
  InvalidLength
}
```

通过`derive`宏属性，我们可以使`NoteError`枚举具有默认的错误`Trait`实现。

每种错误类型我们都会通过`#[error("...")]`标记提供相应的错误信息。

### 返回自定义错误

程序返回的错误必须是`ProgramError`类型。通过`impl`，我们可以将自定义错误与`ProgramError`类型进行转换。

![](./img/convert-erorr.png)

```rust
impl From<NoteError> for ProgramError {
    fn from(e: NoteError) -> Self {
        ProgramError::Custom(e as u32)
    }
}
```

然后，当我们需要实际返回错误时，我们使用`into()`方法将错误转换为`ProgramError`的实例。

```rust
if pda != *note_pda.key {
    return Err(NoteError::Forbidden.into());
}
```

## 🔓 基本安全准则

以下几项基本的安全措施可以增强程序的安全性：

- 所有权检查 - 确保账户归该程序所有。
- 签名者检查 - 验证交易的签名者。
- 通用账户验证 - 核实账户是否符合预期。
- 数据验证 - 检查用户输入的有效性。

总的来说，你应该始终验证来自用户的输入。当处理用户提供的数据时，这一点尤为重要。记得 - 程序不会保存状态。它们不知道谁是所有者，也不会检查谁在调用它们，除非你明确告诉它们。

### 所有权检查

所有权检查的目的是核实账户是否归预期的程序所有。务必确保只有你能够访问它。

用户可能会发送结构与账户数据匹配但由不同程序创建的数据。

```rust
if note_pda.owner != program_id {
    return Err(ProgramError::InvalidNoteAccount);
}
```

### 签名者检查

签名者检查是为了验证账户是否已对交易签名。

```rust
if !initializer.is_signer {
    msg!("缺少必要的签名");
    return Err(ProgramError::MissingRequiredSignature)
}
```

### 数据验证

你还应该在适当的情况下验证客户提供的指令数据。

```rust
let (pda, bump_seed) = PubKey::find_program_address(&[initializer.key.as_ref(), title.as_bytes().as_ref(),], program_id);

if pda != *note_pda.key() {
    msg!("Invalid seeds for PDA");
    return Err(ProgramError::InvalidArgument);
}
```

例如，如果你的程序是一个游戏，用户可能会分配角色属性点。你可能需要验证分配的积分加上现有分配是否超出了最大限制。

```rust
if character.agility + new_agility > 100 {
    msg!("属性点数不得超过100");
    return Err(AttributeError::TooHigh.into())
}
```

### 整数溢出和下溢

Rust的整数有固定的大小，所以只能容纳特定范围的数字。如果进行算术运算的结果超出了该范围，那么结果会回绕。

![](./img/1280px-Nuclear_Gandhi.png)

为了避免整数溢出和下溢，你可以：

- 确保逻辑上不会发生溢出或下溢。
- 使用`checked_add`等已检查的数学运算符代替`+`。

```rust
let first_int: u8 = 5;
let second_int: u8 = 255;
let sum = first_int.checked_add(second_int);
```

想象一下，那些没有采取最基本安全措施的程序都有哪些漏洞等待被发现，那些漏洞赏金就在眼前🥵🤑。
