---
sidebar_position: 60
sidebar_label: 🔑 保障我们程序的安全
sidebar_class_name: green
tags:
  - security-and-validation
  - solana
  - native-solana-program
  - srcure-our-program
---

# 🔑 保障我们程序的安全

是时候保障我们的`Solana`电影数据库程序不受到干扰了。我们将加入一些基础的安全防护，进行输入验证，并增添一个 `update_movie_review` 指令。

我会为你在一个点击之下就开始，你可以看一下这个[Playground设置链接](https://beta.solpg.io/6322684077ea7f12846aee91?utm_source=buildspace.so&utm_medium=buildspace_project)。

完整的文件结构如下所示：

- `lib.rs` - 注册模块
- `entrypoint.rs` - 程序的入口点
- `instruction.rs` - 指令数据的序列化与反序列化
- `processor.rs` - 处理指令的程序逻辑
- `state.rs` - 状态的序列化与反序列化
- `error.rs` - 自定义程序错误

请注意与“状态管理”结束时的初始代码所存在的不同。

在 `processor.rs` 中：

- 在 `account_len` 函数里，将 `add_movie_review` 更改为固定大小的1000。

- 通过这样做，当用户更新电影评论时，我们就无需担心重新分配大小或重新计算租金。

```rust
// 从这里
let account_len: usize = 1 + 1 + (4 + title.len()) + (4 + description.len());

// 变为这里
let account_len: usize = 1000;
```

在 `state.rs` 中：

- 实现了一个检查结构体上的 `is_initialized` 字段的函数。
- 为 `Sealed` 接口实现了 `MovieAccountState` ，这样就能指定 `MovieAccountState` 具有已知大小，并为其提供了一些编译器优化。

```rust
// 在 state.rs 内
impl Sealed for MovieAccountState {}

impl IsInitialized for MovieAccountState {
    fn is_initialized(&self) -> bool {
        self.is_initialized
    }
}
```

我们从定义一些自定义错误开始吧！

我们在以下情况下需要一些错误定义：

- 在尚未初始化的账户上调用更新指令
- 提供的 `PDA` 与预期或派生的 `PDA` 不匹配
- 输入数据超出程序允许的范围
- 所提供的评级不在 `1-5` 范围内

在 `error.rs` 中：

- 创建 `ReviewError` 的枚举类型
- 实现转换为 `ProgramError` 的方法

```rust
// 在 error.rs 内
use solana_program::program_error::ProgramError;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum ReviewError{
    // error 0
    #[error("uninitialized account")]
    UninitializedAccount,
    // error 1
    #[error("Derived PDA did not match the given PDA")]
    InvalidPDA,
    // error 2
    #[error("input data length is too long")]
    InvalidDataLength,
    // error 3
    #[error("rating is out of range 5 or less than 1")]
}

impl From<ReviewError> for ProgramError {
    fn from(e: ReviewError) -> Self {
        ProgramError::Custom(e as u32)
    }
}
```

请前往 `processor.rs` 并将 `ReviewError` 纳入使用范围。

```rust
// 在 processor.rs 内
use crate::error::ReviewError;
```

接下来，我们将对 `add_movie_review` 函数增加安全检查。

### 签署人检查

- 验证交易的评论的 `initializer` 是否同时也是交易的签署人。

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

- 确认用户输入的 `pda_account` 是否与我们期望的 `pda` 匹配。

```rust
let (pda, bump_seed) = Pubkey::find_program_address(&[initializer.key.as_ref(), title.as_bytes().as_ref(),], program_id);
if pda != *pda_account.key {
    msg!("Invalid seeds for PDA");
    return Err(ProgramError::InvalidArgument)
}
```

### 数据验证

- 确保 `rating` 落在 `1` 到 `5` 的评分范围内。我们不想看到 `0` 或 `69` 星的评级，真有趣呢。

```rust
if rating > 5 || rating < 1 {
    msg!("Rating cannot be higher than 5");
    return Err(ReviewError::InvalidRating.into())
}
```

- 此外，我们还需检查评论内容的长度是否超出了分配的空间。

```rust
let total_len: usize = 1 + 1 + (4 + title.len()) + (4 + description.len());
if total_len > 1000 {
    msg!("Data length is larger than 1000 bytes");
    return Err(ReviewError::InvalidDataLength.into())
}
```

## ⬆ 更新电影评论

现在来到了有趣的部分！我们要添加 `update_movie_review` 指令。

首先，在 `instruction.rs` 文件中，我们将从更新 `MovieInstruction` 枚举开始：

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

`Payload` 结构体不需要更改，因为除了变体类型，指令数据与我们用于 `AddMovieReview` 的相同。

然后我们要在同一个文件的 `unpack` 函数中添加这个新的变体。

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

最后，在 `process_instruction` 函数的匹配语句中添加 `update_movie_review`。

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

以下是我们要更新的所有部分的概述，以添加新的指令：

1. `instruction.rs` 文件中：
   - 在 `MovieInstruction` 枚举中添加新变体
   - 在 `unpack` 函数中添加新变体
   - （可选）添加新的负载结构体

2. `processor.rs` 文件中：
   - 在 `process_instruction` 匹配语句中添加新变体

我们现在准备好编写实际的 `update_movie_review` 函数了！

从账户迭代开始：

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

现在是检查 `pda_account.owner` 是否与 `program_id` 匹配的好时机。

```rust
if pda_account.owner != program_id {
    return Err(ProgramError::IllegalOwner)
}
```

接下来，我们将检查签署人是否与初始化者匹配。

```rust
if !initializer.is_signer {
    msg!("Missing required signature");
    return Err(ProgramError::MissingRequiredSignature)
}
```

现在，我们可以从 `pda_account` 中解压数据：

```rust
msg!("unpacking state account");
let mut account_data = try_from_slice_unchecked::<MovieAccountState>(&pda_account.data.borrow()).unwrap();
msg!("borrowed account data");
```

对这些全新数据的最后一轮验证：

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

哇哦，这一大堆的检查让我觉得自己像个银行出纳员似的，真有趣。

最后一步是更新账户信息并将其序列化到账户中。

```rust
account_data.rating = rating;
account_data.description = description;

account_data.serialize(&mut &mut pda_account.data.borrow_mut()[..])?;
```

太棒了！我们在程序中添加了新的指令，并确保了其安全性。现在让我们来测试一下吧！

构建 -> 升级 -> 复制地址 -> 粘贴到前端

```bash
git clone https://github.com/all-in-one-solana/solana-movie-frontend
cd solana-movie-frontend
git checkout solution-update-reviews
npm install
```

你的前端现在应该能显示评论了！你可以添加评论，也可以更新你之前的评论！


## 🚢 挑战

现在，是时候让你亲自动手构建一些内容了。你可以以之前课程中用到的学生自我介绍项目为基础进行构建。

学生自我介绍项目是`Solana`上的一个有趣项目，允许学生们在线上展示自己的身份。该项目会获取用户的姓名和简短留言作为`instruction_data`，并创建一个专门的账户来将这些信息储存在链上。

结合你在本课程中学到的知识，尝试对学生自我介绍项目进行扩展。你应该完成以下任务：

1. **新增指令：**允许学生更新自己的留言。

2. **安全实现：**按照本节课所学，确保项目的基本安全性。

你可以从[这里](https://beta.solpg.io/62b11ce4f6273245aca4f5b2?utm_source=buildspace.so&utm_medium=buildspace_project)获取起始代码。

尽量自主完成这个挑战！如果遇到任何困难，你可以参考[解决方案代码](https://beta.solpg.io/62c9120df6273245aca4f5e8?utm_source=buildspace.so&utm_medium=buildspace_project)。不过请注意，根据你自己实施的检查和错误处理方式，你的代码可能会与解决方案略有不同。

祝你挑战成功，玩得开心！
