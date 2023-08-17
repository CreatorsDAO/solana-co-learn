---
sidebar_position: 68
sidebar_label: 💬 在链上构建评论功能
sidebar_class_name: green
---

# 💬 在链上构建评论功能

是时候发掘`PDA`的全部功能了。我们将为我们的旧电影评论程序添加评论支持。

在本地环境中开始设置一个新项目。

```bash
cargo new --lib movie-review-comments
cd movie-review-comments
```

打开 `Cargo.toml` ，这样我们就可以添加我们需要的依赖项并指定其他配置：

```toml
[package]
name = "movie-review-comments"
version = "0.1.0"
edition = "2021"

# See more keys and their definitions at https://doc.rust-lang.org/cargo/reference/manifest.html

[features]
no-entrypoint = []

[dependencies]
solana-program = "1.10.29"
borsh = "0.9.3"
thiserror = "1.0.31"

[lib]
crate-type = ["cdylib", "lib"]
```

你还需要将我们之前使用的[所有文件和代码带过来](https://beta.solpg.io/6312eaf988a7fca897ad7d15?utm_source=buildspace.so&utm_medium=buildspace_project)。这是我们上次离开时的电影评论程序，请将文件结构和内容复制到你的本地项目中。

完成后，你可以通过构建程序来检查一切是否就位：

```bash
cargo build-sbf
```

第一次运行可能需要几分钟时间。如果一切顺利，你应该会看到一个绿色的“完成”消息。

我们准备好开始拼凑东西了！

**开始之前的一点说明**

这是一堂艰深的课程。我们将会写很多代码，可能会让你感到压力山大。但是当你写一个真正的程序时，你不需要做这么多的工作，速度会快很多。下周我们将学习如何使用锚点，这将使事情变得更容易。我们选择原生方式来深入理解这些概念，并建立你的基础。

## 🤓 数据结构化

在存储数据时，最重要的部分是决定物品放在哪里以及它们如何连接在一起。我们想要为每个电影评论存储评论。这在链上是什么样子？在客户端阅读时，我们如何找到特定评论的评论？这就是映射的全部内容。

这些东西没有硬性的“规则”，你得动动你的计算机工程师脑筋来弄清楚在这里该做什么，就像一个数据库模式一样。一般来说，我们希望有以下结构：

- 不是过于复杂的
- 使数据易于检索


具体的实施方法会因情况而异，但有一些常见的模式你会看到。一旦你了解了如何组织和连接存储数据的选项，你就能够推理出最佳解决方案来适应你的情况。

想象一下，就像做晚餐一样 - 一旦你学会了如何烹饪某些食材，你就能根据手头的材料来创造出各种菜肴。这就是你学会了往方便面里扔个鸡蛋然后称之为美食拉面的方式。我发誓我并没有事先计划好用鸡蛋的比喻来解释个人数码助理，这只是碰巧而已。


**存储评论**

我们需要决定的第一件事是我们将把评论存储在哪里。正如你（希望）从 `add_movie_review` 中记得的那样 - 我们为每个电影评论创建一个新的`PDA`。所以我们可以简单地将一个大的评论数组添加到`PDA`中，然后就完成了，对吗？不对。账户有限的空间，所以我们很快就会用完空间。

让我们按照电影评论的方式来进行。我们将为每条评论创建一个新的`PDA`。这样我们就可以存储尽可能多的评论！我们需要将评论与它们所属的评论链接起来，所以我们将使用电影评论的`PDA`地址作为评论账户的种子。

**阅读评论**

我们的结构将为每个电影评论提供理论上无限数量的评论。然而，对于每个电影评论，没有任何区分评论之间的特征。我们应该如何知道每个电影评论有多少条评论？

我们创建另一个账户来存储这个！而且我们可以使用一个编号系统来跟踪评论账户。

困惑了吗？我当时确实很困惑。这里有一个方便的图表，可以帮助你形象地理解结构：

![](./img/movie-comments.png)

对于每一篇电影评论，我们将拥有一个评论计数器`PDA`和许多评论`PDA`。我还包含了每个`PDA`的种子 - 这是我们获取账户的方式。

这样，如果我想要获取评论`#5`，我知道可以在从电影评论PDA和`5`派生的账户中找到它。

## 📦 构建基本组件

我们想要创建两个新账户来存储物品。以下是我们在程序中需要完成的所有步骤：


- 定义结构体来表示评论计数器和评论账户
- 更新现有的 `MovieAccountState` 以包含一个鉴别器（稍后详细介绍）
- 添加一个指令变体来表示 `add_comment` 指令
- 更新现有的 `add_movie_review` 指令，包括创建评论计数器账户
- 创建一个新的 `add_comment` 指令

让我们从为我们的新账户创建结构体开始。我们需要定义每个账户中存储的数据。打开 `state.rs` 并将其更新为以下内容：

```rust
use borsh::{BorshSerialize, BorshDeserialize};
use solana_program::{
    // We're bringing in Pubkey
    pubkey::Pubkey,
    program_pack::{IsInitialized, Sealed},
};

#[derive(BorshSerialize, BorshDeserialize)]
pub struct MovieAccountState {
    // Two new fields added - discriminator and reviewer
    pub discriminator: String,
    pub is_initialized: bool,
    pub reviewer: Pubkey,
    pub rating: u8,
    pub title: String,
    pub description: String,
}

// New struct for recording how many comments total
#[derive(BorshSerialize, BorshDeserialize)]
pub struct MovieCommentCounter {
    pub discriminator: String,
    pub is_initialized: bool,
    pub counter: u64,
}

// New struct for storing individual comments
#[derive(BorshSerialize, BorshDeserialize)]
pub struct MovieComment {
    pub discriminator: String,
    pub is_initialized: bool,
    pub review: Pubkey,
    pub commenter: Pubkey,
    pub comment: String,
    pub count: u64,
}

impl Sealed for MovieAccountState {}

impl IsInitialized for MovieAccountState {
    fn is_initialized(&self) -> bool {
        self.is_initialized
    }
}
```


这些新的结构体中的每一个都需要可序列化，所以我们在这里使用了`Borsh`派生宏。我们还有一个 `is_initialized` 字段来确认该账户是否已准备好使用。

现在我们在这个程序中有多种类型的账户，我们需要一种方法来区分这些不同的账户。当我们在客户端上运行时，我们将获取我们电影评论程序的所有账户。这就是 `getProgramAccounts` 的作用。我们可以通过指定账户数据的前`8`个字节来过滤账户列表。

我们可以使用字符串，因为我们事先会决定鉴别器应该是什么，这样在过滤时我们就知道要在客户端上寻找什么。

接下来，我们需要为这些新的结构体实现 `IsInitialized` 。我只是从 `MovieAccountState` 中复制/粘贴了实现代码，并将其放在了旁边：

```rust
impl IsInitialized for MovieCommentCounter {
    fn is_initialized(&self) -> bool {
        self.is_initialized
    }
}

impl IsInitialized for MovieComment {
    fn is_initialized(&self) -> bool {
        self.is_initialized
    }
}
```

## 📏 定义account size

如果你去 `add_movie_review` 在 `processor.rs` 你会看到我们在创建账户时计算账户的大小。这并不是很有用，因为这个计算是不可重用的，所以我们将在这里对这些账户进行实现：


```rust
impl MovieAccountState {
    pub const DISCRIMINATOR: &'static str = "review";

    pub fn get_account_size(title: String, description: String) -> usize {
                // 4 bytes to store the size of the subsequent dynamic data (string)
        return (4 + MovieAccountState::DISCRIMINATOR.len())
            + 1 // 1 byte for is_initialized (boolean)
            + 1 // 1 byte for rating
            + (4 + title.len()) // 4 bytes to store the size of the subsequent dynamic data (string)
            + (4 + description.len()); // Same as above
    }
}

impl MovieComment {
    pub const DISCRIMINATOR: &'static str = "comment";

    pub fn get_account_size(comment: String) -> usize {
        return (4 + MovieComment::DISCRIMINATOR.len())
        + 1  // 1 byte for is_initialized (boolean)
        + 32 // 32 bytes for the movie review account key
        + 32 // 32 bytes for the commenter key size
        + (4 + comment.len()) // 4 bytes to store the size of the subsequent dynamic data (string)
        + 8; // 8 bytes for the count (u64)
    }
}

impl MovieCommentCounter {
    pub const DISCRIMINATOR: &'static str = "counter";
    pub const SIZE: usize = (4 + MovieCommentCounter::DISCRIMINATOR.len()) + 1 + 8;
}

impl Sealed for MovieCommentCounter{}
```

由于电影评论账户和电影评论账户具有动态内容，我们需要功能来获取它们的大小。请查看代码中的注释，解释每个字节的用途！

`MovieCommentCounter` 的大小将始终保持不变，因此我们可以声明一个常量来代替函数。

顺便说一下，我们这里还有我们的鉴别器！由于这个不会改变，我们使用 'static 来创建一个[静态常量](https://doc.rust-lang.org/rust-by-example/scope/lifetime/static_lifetime.html?utm_source=buildspace.so&utm_medium=buildspace_project)，在整个程序运行期间保持不变。请查看代码注释以了解每个字节的用途 :)

最后，由于我们正在进行实现，我还包括了 `Sealed` 用于 `MovieCommentCounter` 。提醒一下 - 当结构体的大小已知时， `Sealed` 特性可以进行一些编译器优化。由于 `MovieCommentCounter` 具有已知的固定大小，所以我们需要实现它！

现在你完成了， `state.rs` 的大纲应该是这样的：

![](./img/states.png)


总结一下，对于每个账户状态，我们有：

- 一个用来表示账户数据的结构体
- 一个函数实现，告诉我们账户是否准备好
- 一个用于计算每个账户内容大小的函数实现
- 一个静态常量，用于区分账户
- 如果账户规模不是动态的，可以选择一个 `Sealed` 实施方案。


## 👨‍🏫 更新我们的 instructions

现在我们已经处理完所有的状态，可以开始升级我们的指令处理程序并实现实际的评论逻辑了。

从指令处理程序开始，我们需要更新我们的指令枚举，以支持 `instruction.rs` 中的注释：

```rust
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
    },
    AddComment {
        comment: String
    }
}
```

用来表示指令数据的结构将会非常简单：

```rust
#[derive(BorshDeserialize)]
struct CommentPayload {
    comment: String
}
```

我们需要稍微重构 `unpack` 的实现。由于之前的指令（添加和更新）的有效载荷是相同的，我们可以在匹配语句之前对其进行反序列化。现在我们有了一个带有不同类型有效载荷的评论，我们将把反序列化操作移到匹配语句中。看一下：

```rust
impl MovieInstruction {
    pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {
        let (&variant, rest) = input.split_first().ok_or(ProgramError::InvalidInstructionData)?;
        Ok(match variant {
            0 => {
                // Payload moved into the match statement for each payload
                let payload = MovieReviewPayload::try_from_slice(rest).unwrap();
                Self::AddMovieReview {
                title: payload.title,
                rating: payload.rating,
                description: payload.description }
            },
            1 => {
                let payload = MovieReviewPayload::try_from_slice(rest).unwrap();
                Self::UpdateMovieReview {
                    title: payload.title,
                    rating: payload.rating,
                    description: payload.description
                }
            },
            2 => {
                // Comment payload uses its own deserializer cause of the different data type
                let payload = CommentPayload::try_from_slice(rest).unwrap();
                Self::AddComment {
                    comment: payload.comment
                }
            }
            _ => return Err(ProgramError::InvalidInstructionData)
        })
    }
}
```

你现在应该已经习惯了这个了 :)

最后一部分是更新 `match` 语句在 `process_instruction` 中：

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
        },

        MovieInstruction::UpdateMovieReview { title, rating, description } => {
            update_movie_review(program_id, accounts, title, rating, description)
        },

        MovieInstruction::AddComment { comment } => {
            add_comment(program_id, accounts, comment)
        }
    }
}
```

回顾一下我们为了增加对新指令的支持所做的工作：

- 更新指令枚举以包含新指令
- 添加指令负载结构体以便我们对其进行反序列化
- 更新我们的 `unpack` 功能，以包括指令类型
- 更新我们的 `match` 语句，以处理 `process_instruction` 函数中的处理工作


你可能会在这里遇到一个错误，因为 add_comment 还不存在，现在先添加一个空函数来暂时解决这个问题：

```rust
pub fn add_comment(
  program_id: &Pubkey,
  accounts: &[AccountInfo],
  comment: String
) -> ProgramResult {
    Ok(())
}
```


## 🎬 更新 add_movie_review 以创建评论计数器账户

由于现在所有的电影评论都需要一个计数器账户，我们需要更新 `add_movie_review` 函数来处理该账户的创建。

在 `processor.rs` 中，在 `add_movie_review` 函数内，让我们添加一个 `pda_counter` 来表示我们将要初始化的新计数器账户，以及电影评论账户。

```rust
let account_info_iter = &mut accounts.iter();

let initializer = next_account_info(account_info_iter)?;
let pda_account = next_account_info(account_info_iter)?;
let system_program = next_account_info(account_info_iter)?;
// New account to store comment count
let pda_counter = next_account_info(account_info_iter)?;
```

养成一个好习惯就是在创建`PDA`时，同时写下验证步骤。这样你就永远不会忘记了！

将此内容放在 `pda_account` 验证之后

```rust
let (counter_pda, counter_bump_seed) = Pubkey::find_program_address(
  &[pda.as_ref(), "comment".as_ref()],
  program_id
)

if counter_pda != *pda_counter.key {
    msg!("Invalid seeds for counter PDA");
    return Err(ProgramError::InvalidArgument)
}
```

记得我们是如何将账户大小移动到 `state.rs` 的吗？好的，我们需要在这里使用它来计算对应账户的大小。

用 `MovieAccountState::get_account_size` 来替换 `total_len` 的调用：

```rust
let account_len: usize = 1000;

if MovieAccountState::get_account_size(title.clone(), description.clone()) > account_len {
    msg!("Data length is larger than 1000 bytes");
    return Err(ReviewError::InvalidDataLength.into());
}
```

我们还添加了一个 `discriminator` 字段，所以我们需要更新我们的 `account_data` 人口部分从 `MovieAccountState` 结构体：

```rust
account_data.discriminator = MovieAccountState::DISCRIMINATOR.to_string();
account_data.reviewer = *initializer.key;
account_data.title = title;
account_data.rating = rating;
account_data.description = description;
account_data.is_initialized = true;
```

最后，在 `add_movie_review` 函数内部添加逻辑来初始化计数器账户

```rust
msg!("Creating comment counter");
let rent = Rent::get()?;
let counter_rent_lamports = rent.minimum_balance(MovieCommentCounter::SIZE);

// Deriving the address and validating that the correct seeds were passed in
let (counter, counter_bump) =
    Pubkey::find_program_address(&[pda.as_ref(), "comment".as_ref()], program_id);
if counter != *pda_counter.key {
    msg!("Invalid seeds for PDA");
    return Err(ProgramError::InvalidArgument);
}

// Creating the comment counter account
invoke_signed(
    &system_instruction::create_account(
        initializer.key, // Rent payer
        pda_counter.key, // Address who we're creating the account for
        counter_rent_lamports, // Amount of rent to put into the account
        MovieCommentCounter::SIZE.try_into().unwrap(), // Size of the account
        program_id,
    ),
    &[
        // List of accounts that will be read from/written to
        initializer.clone(),
        pda_counter.clone(),
        system_program.clone(),
    ],
    // Seeds for the PDA
    // PDA account
    // The string "comment"
    &[&[pda.as_ref(), "comment".as_ref(), &[counter_bump]]],
)?;
msg!("Comment counter created");

// Deserialize the newly created counter account
let mut counter_data =
    try_from_slice_unchecked::<MovieCommentCounter>(&pda_counter.data.borrow()).unwrap();

msg!("checking if counter account is already initialized");
if counter_data.is_initialized() {
    msg!("Account already initialized");
    return Err(ProgramError::AccountAlreadyInitialized);
}

counter_data.discriminator = MovieCommentCounter::DISCRIMINATOR.to_string();
counter_data.counter = 0;
counter_data.is_initialized = true;
msg!("comment count: {}", counter_data.counter);
counter_data.serialize(&mut &mut pda_counter.data.borrow_mut()[..])?;

msg!("Comment counter initialized");
Ok(())
```

简单回顾一下这个臃肿的代码块在做什么：

- 计算评论计数器账户所需的租金
- 验证传入`PDA`的种子是否正确
- 使用 `invoke_signed` 创建评论计数器账户
- 从新创建的账户中反序列化数据
- 检查账户是否已经初始化
- 设置数据，初始化账
- 序列化数据

请务必查看评论，我已为每一行代码添加了上下文！

哎呀，如果这感觉很多，那是因为确实如此！如果你感觉累了，可以休息一下，当你让大脑在新概念上休息时，它会进行一些潜意识的魔法。

现在当创建一个新的评论时，会初始化两个账户：

- 第一个是存储评论内容的审核账户。这与我们开始使用的程序版本没有变化。
- 第二个账户存储评论计数器

## 💬 添加评论支持

最后一块拼图是在 `processor.rs` 底部实现 `add_comment` 函数

这是我们在这个函数中要采取的步骤：

- 遍历传入程序的账户。
- 计算新评论账户的租金免税金额
- 使用评论地址和当前评论计数作为种子来推导评论账户的PDA
- 调用系统程序创建新的评论账户
- 为新创建的账户设置适当的值
- 将账户数据序列化并从函数中返回

```rust
pub fn add_comment(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    comment: String
) -> ProgramResult {
    msg!("Adding Comment...");
    msg!("Comment: {}", comment);

    let account_info_iter = &mut accounts.iter();

    let commenter = next_account_info(account_info_iter)?;
    let pda_review = next_account_info(account_info_iter)?;
    let pda_counter = next_account_info(account_info_iter)?;
    let pda_comment = next_account_info(account_info_iter)?;
    let system_program = next_account_info(account_info_iter)?;

    let mut counter_data = try_from_slice_unchecked::<MovieCommentCounter>(&pda_counter.data.borrow()).unwrap();

    let account_len = MovieComment::get_account_size(comment.clone());

    let rent = Rent::get()?;
    let rent_lamports = rent.minimum_balance(account_len);

    let (pda, bump_seed) = Pubkey::find_program_address(&[pda_review.key.as_ref(), counter_data.counter.to_be_bytes().as_ref(),], program_id);
    if pda != *pda_comment.key {
        msg!("Invalid seeds for PDA");
        return Err(ReviewError::InvalidPDA.into())
    }

    invoke_signed(
        &system_instruction::create_account(
        commenter.key,
        pda_comment.key,
        rent_lamports,
        account_len.try_into().unwrap(),
        program_id,
        ),
        &[commenter.clone(), pda_comment.clone(), system_program.clone()],
        &[&[pda_review.key.as_ref(), counter_data.counter.to_be_bytes().as_ref(), &[bump_seed]]],
    )?;

    msg!("Created Comment Account");

    let mut comment_data = try_from_slice_unchecked::<MovieComment>(&pda_comment.data.borrow()).unwrap();

    msg!("checking if comment account is already initialized");
    if comment_data.is_initialized() {
        msg!("Account already initialized");
        return Err(ProgramError::AccountAlreadyInitialized);
    }

    comment_data.discriminator = MovieComment::DISCRIMINATOR.to_string();
    comment_data.review = *pda_review.key;
    comment_data.commenter = *commenter.key;
    comment_data.comment = comment;
    comment_data.is_initialized = true;
    comment_data.serialize(&mut &mut pda_comment.data.borrow_mut()[..])?;

    msg!("Comment Count: {}", counter_data.counter);
    counter_data.counter += 1;
    counter_data.serialize(&mut &mut pda_counter.data.borrow_mut()[..])?;

    Ok(())
}
```

这是一段很多代码在做我们已经知道的事情，所以我不会再重复一遍。

我们经历了很多变化。[这是](https://beta.solpg.io/6313104b88a7fca897ad7d19?utm_source=buildspace.so&utm_medium=buildspace_project)最终版本的样子，你可以用它来比较一下，看看你那边有没有出现问题！

## 🚀 部署程序

我们准备好部署了！

本地部署比在游乐场上点击部署按钮多了一步。

首先，你需要构建程序：

```bash
cargo build-sbf
```

接下来，我们可以部署。确保 `target/deploy/pda_local.so` 被替换为你的路径：

```bash
solana program deploy <PATH>
```

测试很简单，只需设置这个前端：

```bash
git clone https://github.com/buildspace/solana-movie-frontend/
cd solana-movie-frontend
git checkout solution-add-comments
```

在你能够发布一些高质量的电影评论之前，你需要：

- 在 `utils/constants.ts` 中更新程序地址
- 将端点设置为 `WalletContextProvider.tsx` 到 `http://127.0.0.1:8899`
- 将幻影网络更改为本地主机
- 使用 `solana airdrop 2 PHANTOM_WALLET_ADDRESS` 获取本地主机SOL


你将会看到在 `localhost:3000` 上，通过 `npm run dev` ，评论的魔力开始发生！

> 热门提示 - 本地程序日志
> 有错误吗？有什么不正常的情况吗？你可以在本地主机上查看程序日志
>
> ```bash
> solana logs PROGRAM_ID
> ```

## 🚢 船舶挑战

现在轮到你独立构建一些东西了，你可以在之前课程中使用过的学生介绍程序的基础上进行构建。

利用你在本课程中学到的知识，尝试将所学应用到学生介绍计划中。你的补充应该使其他用户能够回复一个介绍。

要进行测试，你需要获取此前端的 `solution-paging-account-data` 分支，并添加一个用于显示和提交评论的组件，或者你可以编写一个发送交易到程序的脚本。

**起始代码：**

如果你没有保存之前的`starter`代码，请随意使用[此存储库](https://github.com/buildspace/solana-student-intro-program?utm_source=buildspace.so&utm_medium=buildspace_project)的
starter 分支。

**解决方案代码：**

如果可以的话，尽量独立完成这个任务！但如果遇到困难，可以参考 `solution-add-replies` 分支。
