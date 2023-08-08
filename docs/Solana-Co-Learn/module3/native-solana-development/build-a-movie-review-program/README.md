---
sidebar_position: 56
sidebar_label: 🎥 构建一个电影评论程序
sidebar_class_name: green
---

# 🎥 构建一个电影评论程序


还记得我们在第一节互动的电影评论节目吗？我们要在这里继续开发它。随意评论其他东西，不一定非得是电影，我又不是你爸爸。

回到操场（上一节课的那个，不是中学的那个），并开始一个新项目。我们将从基本结构开始 `lib.rs` ：

```rust
use solana_program::{
    entrypoint,
    entrypoint::ProgramResult,
    pubkey::Pubkey,
    msg,
    account_info::AccountInfo,
};

entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8]
) -> ProgramResult {

    Ok(())
}
```

到目前为止都是一如既往的。与记事程序一样，我们将从定义指令结构和创建反序列化逻辑开始。

## 🔪 反序列化指令数据

我们将在一个名为 `instruction.rs` 的新文件中进行此操作。


```rust
use borsh::{BorshDeserialize};
use solana_program::{program_error::ProgramError};

pub enum MovieInstruction {
    AddMovieReview {
        title: String,
        rating: u8,
        description: String
    }
}

#[derive(BorshDeserialize)]
struct MovieReviewPayload {
    title: String,
    rating: u8,
    description: String
}
```

我们需要引入的只有 `BorshDeserialize` 宏和 `ProgramError` 枚举。

虽然我们只有一种指令类型，但我们仍然会使用枚举。以后我们可能会决定添加更多的指令 :)

你可能会想为什么我们需要在有效载荷中指定类型。这些类型告诉Borsh在哪里分割字节。在切割之前，得先知道香肠有多长，记住了吗？

我们在这里需要的最后一件事情是为 `MovieInstruction` 枚举添加实现。在枚举定义下面添加这个。

```rust
impl MovieInstruction {
    pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {

				let (&variant, rest) = input.split_first().ok_or(ProgramError::InvalidInstructionData)?;

				let payload = MovieReviewPayload::try_from_slice(rest).unwrap();

        Ok(match variant {
            0 => Self::AddMovieReview {
                title: payload.title,
                rating: payload.rating,
                description: payload.description },
            _ => return Err(ProgramError::InvalidInstructionData)
        })
    }
}
```

你已经知道这里发生的一切！我们正在解析指令数据并返回枚举的正确变体。

注意在我们分割第一个字节时的 `?`。

```rust
let (&variant, rest) = input.split_first().ok_or(ProgramError::InvalidInstructionData)?;
```

如果 `unpack` 的结果是错误的，这是一种返回错误并退出 `unpack` 函数的简写方式。就像一个简单的`try/catch`。这是Rust中常见的模式，你会经常看到它。

```rust
let payload = MovieReviewPayload::try_from_slice(rest).unwrap();
```

我也想更深入地探讨一下： `.unwrap();` 在Rust中，“`unwrap`”意味着“给我计算的结果，如果出现错误，就会发生恐慌并停止程序。”你可能会想：“嗯，但为什么我们需要从函数的结果中返回东西呢？难道 `try_from_slice()` 函数不会返回我们想要的吗？”

不是的。Rust有 `Option` 类型：一种使用Rust的类型系统来表示可能的缺失的方式。这与其他语言中的 `null` 不同。 `Option` 是一种类型，可以是 `Some` 或 `None` 。 `Some` 是一个值， `None` 是一个值的缺失。为什么？因为有时候你没有一个值，这是可以接受的。从[文档](https://web.mit.edu/rust-lang_v1.25/arch/amd64_ubuntu1404/share/doc/rust/html/book/first-edition/error-handling.html#unwrapping-explained?utm_source=buildspace.so&utm_medium=buildspace_project)中：

> 将缺席的可能性编码到类型系统中是一个重要的概念，因为它会迫使编译器强制程序员处理这种缺席。

Rust让你成为一个更好的开发者！现在你又了解了Rust蛋糕的另一个小部分🍰

## 👀 添加指令到程序中

这里的最后一部分是将指令引入程序中。我们将在 `lib.rs` 中完成这个步骤。

```rust
pub mod instruction;
use instruction::{MovieInstruction};
```

如果你改变了枚举名称，请确保更新导入

现在我们只需将指令数据记录到控制台。在 `process_instruction` 函数之后添加这段代码。

```rust
pub fn add_movie_review(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    title: String,
    rating: u8,
    description: String
) -> ProgramResult {

    msg!("Adding movie review...");
    msg!("Title: {}", title);
    msg!("Rating: {}", rating);
    msg!("Description: {}", description);

    Ok(())
}
```

现在我们可以更新 `process_instruction` 函数，使用 `unpack` 和 `add_movie_review` 函数：

```rust
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8]
) -> ProgramResult {

    let instruction = MovieInstruction::unpack(instruction_data)?;

    match instruction {
        MovieInstruction::AddMovieReview { title, rating, description } => {
            add_movie_review(program_id, accounts, title, rating, description)
        }
    }
}
```

我们在这里所做的只是解析指令数据，然后使用正确的参数调用 `add_movie_review` 函数。

我们的程序现在已经完成了！确保你点击部署按钮，并从游乐场复制程序ID。

如果你觉得这有点令人失望，那是因为我们在上一课已经讲解了每个部分。让我们尝试使用客户端将电影评论添加到我们的程序中。

## 提交电影评论

我们飞快地前进着，咱们走吧！

不需要从头开始写脚本，我相信你知道怎么做 :)

这是如何设置一个完整的脚本，包括你所需的一切：

```rust
git clone https://github.com/buildspace/solana-movie-client
cd solana-movie-client
npm install
```

打开 `src/index.js` 并将第94行的程序ID更新为从playground复制的ID。如果你对程序进行了任何更改，这里也需要更新客户端。

在终端中输入 `npm start` ，然后你应该会得到一个资源管理器链接。点击那个链接，然后向下滚动到程序指令日志，你应该能看到你的电影评论！


![](./img/movie-logo.png)

轻松愉快，我们能搞定的，出发！

## 🚢 船舶挑战

对于本课程的挑战，尝试复制学生介绍程序。

该程序接收用户的姓名和短信作为指令数据，并创建一个账户来将数据存储在区块链上。

利用你在本课程中学到的知识，构建一个学生介绍程序，使得当程序被调用时，能够将用户提供的姓名和信息打印到程序日志中。

解决方案代码
你可以通过构建这个前端并在Solana Explorer上检查程序日志来测试你的程序。记得用你部署的程序ID替换前端代码中的ID。

如果可以的话，尽量独立完成这个任务！但如果遇到困难，可以[参考解决方案代码](https://beta.solpg.io/62b0ce53f6273245aca4f5b0)。

我相信你。
