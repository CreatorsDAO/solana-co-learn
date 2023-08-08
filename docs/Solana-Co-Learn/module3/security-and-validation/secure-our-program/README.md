---
sidebar_position: 60
sidebar_label: 🔑 保护我们的程序
sidebar_class_name: green
---

# 🔑 保护我们的程序

是时候确保没有人能够对我们的Solana电影数据库（SMDB）程序进行干扰了。我们将添加一些基本的安全措施，进行一些输入验证，并添加一条 `update_movie_review` 指令。

我会在一个点击中帮你开始，看看这个[Playground设置](https://beta.solpg.io/6322684077ea7f12846aee91?utm_source=buildspace.so&utm_medium=buildspace_project)。

完整的文件结构如下：

- `lib.rs` - 注册模块
- `entrypoint.rs` - 程序的入口点
- `instruction.rs` - 序列化和反序列化指令数据
- `processor.rs` - 处理指令的程序逻辑
- `state.rs` - 序列化和反序列化状态
- `error.rs` - 自定义程序错误

请注意与“状态管理”结束时的起始代码的变化


在 `processor.rs` 中：

- 在 `account_len` 函数中， `add_movie_review` 被更改为固定大小的 1000

- 这样，当用户更新他们的电影评论时，我们就不必担心重新分配大小或重新计算租金。

```rust
// from this
let account_len: usize = 1 + 1 + (4 + title.len()) + (4 + description.len());

// to this
let account_len: usize = 1000;
```

在 `state.rs` 中

- 实现一个函数，检查 `is_initialized` 结构体上的 `is_initialized` 字段。
- 为 `Sealed` 实现了 `MovieAccountState` ，它指定 `MovieAccountState` 具有已知大小并提供了一些编译器优化。


```rust
// inside state.rs
impl Sealed for MovieAccountState {}

impl IsInitialized for MovieAccountState {
    fn is_initialized(&self) -> bool {
        self.is_initialized
    }
}
```

让我们从一些自定义错误开始！

我们需要一些可以在以下情况下使用的错误

- 更新指令已在尚未初始化的帐户上调用
- 提供的`PDA`与预期或派生的`PDA`不匹配
- 输入数据大于程序允许的范围
- 所提供的评级不在`1-5`范围内


在 `error.rs` 中：

- 创建枚举类型 `ReviewError`
- 实现转换为 `ProgramError`

```rust
// inside error.rs
use solana_program::{program_error::ProgramError};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum ReviewError{
    // Error 0
    #[error("Account not initialized yet")]
    UninitializedAccount,
    // Error 1
    #[error("PDA derived does not equal PDA passed in")]
    InvalidPDA,
    // Error 2
    #[error("Input data exceeds max length")]
    InvalidDataLength,
    // Error 3
    #[error("Rating greater than 5 or less than 1")]
    InvalidRating,
}

impl From<ReviewError> for ProgramError {
    fn from(e: ReviewError) -> Self {
        ProgramError::Custom(e as u32)
    }
}
```

请前往 `processor.rs` 并将 `ReviewError` 纳入范围。

```rust
// inside processor.rs
use crate::error::ReviewError;
```

接下来，我们将为 `add_movie_review` 函数添加安全检查。

### 签署人检查

- 确保评论的 `initializer` 也是交易的签署人。

```rust
let account_info_iter = &mut accounts.iter();

let initializer = next_account_info(account_info_iter)?;
let pda_account = next_account_info(account_info_iter)?;
let system_program = next_account_info(account_info_iter)?;

// add check here
if !initializer.is_signer {
    msg!("Missing required signature");
    return Err(ProgramError::MissingRequiredSignature)
}
```

### 账户验证

- 确保用户传入的 `pda_account` 是我们期望的 `pda`

```rust
let (pda, bump_seed) = Pubkey::find_program_address(&[initializer.key.as_ref(), title.as_bytes().as_ref(),], program_id);
if pda != *pda_account.key {
    msg!("Invalid seeds for PDA");
    return Err(ProgramError::InvalidArgument)
}
```

### 数据验证

- 确保 `rating` 在`1`到`5`的评分范围内。我们不希望有`0`或`69`星的评价，哈哈。

```rust
if rating > 5 || rating < 1 {
    msg!("Rating cannot be higher than 5");
    return Err(ReviewError::InvalidRating.into())
}
```

- 让我们还要检查一下评论的内容是否超出了分配的空间

```rust
let total_len: usize = 1 + 1 + (4 + title.len()) + (4 + description.len());
if total_len > 1000 {
    msg!("Data length is larger than 1000 bytes");
    return Err(ReviewError::InvalidDataLength.into())
}
```

## ⬆ 更新电影评论

现在是有趣的部分！让我们添加 `update_movie_review` 指令。

我们将从更新 `MovieInstruction` 枚举在 `instruction.rs` 文件开始：


```rust
// inside instruction.rs
pub enum MovieInstruction {
    AddMovieReview {
        title: String,
        rating: u8,
        description: String
    },
    UpdateMovieReview {
        title: String,
        rating: u8,
        description: String
    }
}
```

`Payload`结构体可以保持不变，因为除了变体类型之外，指令数据与我们用于 `AddMovieReview` 的相同。

我们还需要将这个新的变体添加到同一文件中的 `unpack` 函数中


```rust
// inside instruction.rs
impl MovieInstruction {
    pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {
        let (&variant, rest) = input.split_first().ok_or(ProgramError::InvalidInstructionData)?;
        let payload = MovieReviewPayload::try_from_slice(rest).unwrap();
        Ok(match variant {
            0 => Self::AddMovieReview {
                title: payload.title,
                rating: payload.rating,
                description: payload.description },
            1 => Self::UpdateMovieReview {
                title: payload.title,
                rating: payload.rating,
                description: payload.description },
            _ => return Err(ProgramError::InvalidInstructionData)
        })
    }
}
```

最后，在 `process_instruction` 函数的匹配语句中添加 `update_movie_review`

```rust
// inside processor.rs
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8]
) -> ProgramResult {
    // unpack instruction data
    let instruction = MovieInstruction::unpack(instruction_data)?;
    match instruction {
        MovieInstruction::AddMovieReview { title, rating, description } => {
            add_movie_review(program_id, accounts, title, rating, description)
        },
        // add UpdateMovieReview to match against our new data structure
        MovieInstruction::UpdateMovieReview { title, rating, description } => {
            // make call to update function that we'll define next
            update_movie_review(program_id, accounts, title, rating, description)
        }
    }
}
```


我们需要更新的所有地方的快速回顾，以添加新的指示：

1. `instruction.rs`:
- 在 `MovieInstruction` 枚举中添加新的变量
- 添加新的变体到 `unpack` 函数
- （可选）- 添加新的负载结构体

2. `processor.rs`
- 在 `process_instruction` 匹配语句中添加新的变体

现在我们准备好编写实际的 `update_movie_review` 函数了！

我们将从账户开始迭代：

```rust
pub fn update_movie_review(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    _title: String,
    rating: u8,
    description: String
) -> ProgramResult {
    msg!("Updating movie review...");

    // Get Account iterator
    let account_info_iter = &mut accounts.iter();

    // Get accounts
    let initializer = next_account_info(account_info_iter)?;
    let pda_account = next_account_info(account_info_iter)?;

    Ok(())
}
```

现在是一个好时机，检查一下 `pda_account.owner` 是否与 `program_id` 相同：

```rust
if pda_account.owner != program_id {
    return Err(ProgramError::IllegalOwner)
}
```

接下来我们将检查签署者是否与初始化者相同：

```rust
if !initializer.is_signer {
    msg!("Missing required signature");
    return Err(ProgramError::MissingRequiredSignature)
}
```

现在我们可以从 `pda_account` 中解压数据：

```rust
msg!("unpacking state account");
let mut account_data = try_from_slice_unchecked::<MovieAccountState>(&pda_account.data.borrow()).unwrap();
msg!("borrowed account data");
```

对这些全新数据的最后一次验证：

```rust
// Derive PDA and check that it matches client
let (pda, _bump_seed) = Pubkey::find_program_address(&[initializer.key.as_ref(), account_data.title.as_bytes().as_ref(),], program_id);

if pda != *pda_account.key {
    msg!("Invalid seeds for PDA");
    return Err(ReviewError::InvalidPDA.into())
}

if !account_data.is_initialized() {
    msg!("Account is not initialized");
    return Err(ReviewError::UninitializedAccount.into());
}

if rating > 5 || rating < 1 {
    msg!("Rating cannot be higher than 5");
    return Err(ReviewError::InvalidRating.into())
}

let total_len: usize = 1 + 1 + (4 + account_data.title.len()) + (4 + description.len());
if total_len > 1000 {
    msg!("Data length is larger than 1000 bytes");
    return Err(ReviewError::InvalidDataLength.into())
}
```

哇，这是一大堆支票啊。让我感觉自己像个银行出纳员，哈哈。

最后一步是更新账户信息并将其序列化为账户

```rust
account_data.rating = rating;
account_data.description = description;

account_data.serialize(&mut &mut pda_account.data.borrow_mut()[..])?;
```

我们做到了！我们在我们的程序中添加了一条新的指令，并使其非常安全。让我们来测试一下吧！

构建 -> 升级 -> 复制地址 -> 粘贴到前端

```rust
git clone https://github.com/buildspace/solana-movie-frontend/
cd solana-movie-frontend
git checkout solution-update-reviews
npm install
```

你的前端现在应该显示评论了！你可以添加评论并更新你的旧评论！

## 🚢 船舶挑战

现在轮到你独立构建一些东西了，你可以在之前课程中使用过的学生介绍程序的基础上进行构建。

学生介绍计划是Solana的一个项目，让学生们可以介绍自己。该计划会接收用户的姓名和简短留言作为 `instruction_data` ，并创建一个账户将这些数据存储在链上。

使用你在本课程中学到的知识，尝试将所学应用于学生介绍计划。该计划应该：

1. 添加一条指示，允许学生更新他们的留言

2. 在这节课中，实施我们所学的基本安全检查

请随意使用这个[起始代码](https://beta.solpg.io/62b11ce4f6273245aca4f5b2?utm_source=buildspace.so&utm_medium=buildspace_project)。

如果可以的话，尽量独立完成这个任务！但如果遇到困难，可以参考[解决方案代码](https://beta.solpg.io/62c9120df6273245aca4f5e8?utm_source=buildspace.so&utm_medium=buildspace_project)。请注意，根据你实现的检查和错误编写，你的代码可能与解决方案代码略有不同。
