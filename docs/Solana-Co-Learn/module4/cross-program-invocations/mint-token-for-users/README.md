---
sidebar_position: 71
sidebar_label: 🥇 为用户Mint代币
sidebar_class_name: green
---

# 🥇 为用户Mint代币

我们的电影评论节目还不错，但它并不是非常符合Web3的特点。目前我们所做的只是将Solana用作数据库。让我们通过给用户使用我们的应用程序来增加一些趣味吧！每当他们评论一部电影或留下评论时，我们将为某人铸造代币。可以将其想象成StackOverflow，但使用代币而不是点赞。

你可以从上次的本地环境继续进行，或者通过复制[这个环境](https://beta.solpg.io/6313104b88a7fca897ad7d19?utm_source=buildspace.so&utm_medium=buildspace_project)来设置一个新的

```bash
git clone https://github.com/buildspace/solana-movie-program/
cd solana-movie-program
git checkout solution-add-comments
```

我们将使用SPL令牌程序来实现所有这些神奇的事情，所以请继续更新 `Cargo.toml` 中的依赖项：

```toml
[dependencies]
solana-program = "~1.10.29"
borsh = "0.9.3"
thiserror = "1.0.31"
spl-token = { version="3.2.0", features = [ "no-entrypoint" ] }
spl-associated-token-account = { version="=1.0.5", features = [ "no-entrypoint" ] }
```

让我们快速测试一下，使用这些新的依赖项构建一切是否正常 `cargo  build-sbf`。

我们准备好开始建设了！

## 🤖 设置代币铸造

我们将首先创建一个代币铸造。提醒：代币铸造是一个特殊的账户，用于保存我们代币的数据。

这是一条新的指示，所以我们将按照我们添加评论支持时所采取的相同步骤进行操作：

- 更新指令枚举
- 更新`unpack`函数
- 更新 `process_instruction` 功能

从上面`instruction.rs `开始，我们有枚举更新：

```rust
pub enum MovieInstruction {
    AddMovieReview {
        title: String,
        rating: u8,
        description: String,
    },
    UpdateMovieReview {
        title: String,
        rating: u8,
        description: String,
    },
    AddComment {
        comment: String,
    },
    InitializeMint,
}
```

我们这里不需要任何字段 - 调用该函数只需要地址！

接下来，我们将更新解压函数：

```rust
impl MovieInstruction {
    pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {
        let (&variant, rest) = input
            .split_first()
            .ok_or(ProgramError::InvalidInstructionData)?;
        Ok(match variant {
            0 => {
                let payload = MovieReviewPayload::try_from_slice(rest).unwrap();
                Self::AddMovieReview {
                    title: payload.title,
                    rating: payload.rating,
                    description: payload.description,
                }
            }
            1 => {
                let payload = MovieReviewPayload::try_from_slice(rest).unwrap();
                Self::UpdateMovieReview {
                    title: payload.title,
                    rating: payload.rating,
                    description: payload.description,
                }
            }
            2 => {
                let payload = CommentPayload::try_from_slice(rest).unwrap();
                Self::AddComment {
                    comment: payload.comment,
                }
            }
            // New variant added here
            3 => Self::InitializeMint,
            _ => return Err(ProgramError::InvalidInstructionData),
        })
    }
}
```

你会立即注意到 `process_instruction` 中的匹配语句中存在一个错误，因为我们没有处理所有的情况。让我们通过引入新的SPL导入并添加到匹配语句中来修复这个问题：

```rust
// Update imports at the top
use solana_program::{
    //Existing imports within solana_program

    sysvar::{rent::Rent, Sysvar, rent::ID as RENT_PROGRAM_ID},
    native_token::LAMPORTS_PER_SOL,
    system_program::ID as SYSTEM_PROGRAM_ID
}
use spl_associated_token_account::get_associated_token_address;
use spl_token::{instruction::initialize_mint, ID as TOKEN_PROGRAM_ID};

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let instruction = MovieInstruction::unpack(instruction_data)?;
    match instruction {
        MovieInstruction::AddMovieReview {
            title,
            rating,
            description,
        } => add_movie_review(program_id, accounts, title, rating, description),
        MovieInstruction::UpdateMovieReview {
            title,
            rating,
            description,
        } => update_movie_review(program_id, accounts, title, rating, description),
        MovieInstruction::AddComment { comment } => add_comment(program_id, accounts, comment),
        // New instruction handled here to initialize the mint account
        MovieInstruction::InitializeMint => initialize_token_mint(program_id, accounts),
    }
}
// Rest of the file remains the same
```

最后，在 `initialize_token_mint` 功能之后，我们可以在 `processor.rs` 底部实施 `add_comment` 账户

```rust
pub fn initialize_token_mint(program_id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();

    // The order of accounts is not arbitrary, the client will send them in this order
    // Whoever sent in the transaction
    let initializer = next_account_info(account_info_iter)?;
    // Token mint PDA - derived on the client
    let token_mint = next_account_info(account_info_iter)?;
    // Token mint authority
    let mint_auth = next_account_info(account_info_iter)?;
    // System program to create a new account
    let system_program = next_account_info(account_info_iter)?;
    // Solana Token program address
    let token_program = next_account_info(account_info_iter)?;
    // System account to calcuate the rent
    let sysvar_rent = next_account_info(account_info_iter)?;

    // Derive the mint PDA again so we can validate it
    // The seed is just "token_mint"
    let (mint_pda, mint_bump) = Pubkey::find_program_address(&[b"token_mint"], program_id);
    // Derive the mint authority so we can validate it
    // The seed is just "token_auth"
    let (mint_auth_pda, _mint_auth_bump) =
        Pubkey::find_program_address(&[b"token_auth"], program_id);

    msg!("Token mint: {:?}", mint_pda);
    msg!("Mint authority: {:?}", mint_auth_pda);

    // Validate the important accounts passed in
    if mint_pda != *token_mint.key {
        msg!("Incorrect token mint account");
        return Err(ReviewError::IncorrectAccountError.into());
    }

    if *token_program.key != TOKEN_PROGRAM_ID {
        msg!("Incorrect token program");
        return Err(ReviewError::IncorrectAccountError.into());
    }

    if *mint_auth.key != mint_auth_pda {
        msg!("Incorrect mint auth account");
        return Err(ReviewError::IncorrectAccountError.into());
    }

    if *system_program.key != SYSTEM_PROGRAM_ID {
        msg!("Incorrect system program");
        return Err(ReviewError::IncorrectAccountError.into());
    }

    if *sysvar_rent.key != RENT_PROGRAM_ID {
        msg!("Incorrect rent program");
        return Err(ReviewError::IncorrectAccountError.into());
    }

    // Calculate the rent
    let rent = Rent::get()?;
    // We know the size of a mint account is 82 (remember it lol)
    let rent_lamports = rent.minimum_balance(82);

    // Create the token mint PDA
    invoke_signed(
        &system_instruction::create_account(
            initializer.key,
            token_mint.key,
            rent_lamports,
            82, // Size of the token mint account
            token_program.key,
        ),
        // Accounts we're reading from or writing to
        &[
            initializer.clone(),
            token_mint.clone(),
            system_program.clone(),
        ],
        // Seeds for our token mint account
        &[&[b"token_mint", &[mint_bump]]],
    )?;

    msg!("Created token mint account");

    // Initialize the mint account
    invoke_signed(
        &initialize_mint(
            token_program.key,
            token_mint.key,
            mint_auth.key,
            Option::None, // Freeze authority - we don't want anyone to be able to freeze!
            9, // Number of decimals
        )?,
        // Which accounts we're reading from or writing to
        &[token_mint.clone(), sysvar_rent.clone(), mint_auth.clone()],
        // The seeds for our token mint PDA
        &[&[b"token_mint", &[mint_bump]]],
    )?;

    msg!("Initialized token mint");

    Ok(())
}
```

在一个高层次上，这里发生的事情是这样的：

- 1. 遍历账户列表以提取它们
- 2. 派生代币 `mint PDA`
- 3. 验证传入的所有重要账户：
    - `Token mint account`
    - `Mint authority account`
    - `System program`
    - `Token program`
    - `Sysvar rent` - 租金计算账户
- 4. 计算`mint account`的租金
- 5. 创建`token mint PDA`
- 6. 初始化`mint account`

请查看代码注释，我尽可能地添加了上下文！

由于我们在调用一个未声明的新错误，你现在会收到一个错误。打开 `error.rs` 并将 `IncorrectAccountError` 添加到 `ReviewError` 枚举中。

```rust
#[derive(Debug, Error)]
pub enum ReviewError {
    #[error("Account not initialized yet")]
    UninitializedAccount,

    #[error("PDA derived does not equal PDA passed in")]
    InvalidPDA,

    #[error("Input data exceeds max length")]
    InvalidDataLength,

    #[error("Rating greater than 5 or less than 1")]
    InvalidRating,

    // New error added
    #[error("Accounts do not match")]
    IncorrectAccountError,
}
```

相当明显 :)

在文件浏览器中打开目标文件夹，并删除部署文件夹中的密钥对。

在你的控制台中：

```bash
cargo build-sbf
```

复制并粘贴打印出的部署命令。

如果你遇到 `insufficient funds` ，就直接运行 `solana airdrop 2` 。

一旦你在本地部署完成，就该进行测试了！我们将使用本地客户端脚本来测试账户初始化。以下是你需要设置的内容：

```bash
git clone https://github.com/buildspace/solana-movie-token-client
cd solana-movie-token-client
npm install
```

在运行脚本之前，你需要：

- 1. 更新 `PROGRAM_ID` 在 `index.ts` 中
- 2. 将第67行的连接更改为在线连接

```ts
const connection = new web3.Connection("http://localhost:8899");
```

- 在第二个控制台窗口中运行 `solana logs PROGRAM_ID_HERE`

现在你应该有一个控制台记录了这个程序的所有输出，并且准备好运行脚本了！

如果你运行 `npm start` ，你应该能看到有关铸币账户创建的日志 :D
