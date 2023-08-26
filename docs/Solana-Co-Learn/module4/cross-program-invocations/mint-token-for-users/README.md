---
sidebar_position: 71
sidebar_label: 🥇 为用户铸造代币
sidebar_class_name: green
---

# 🥇 为用户铸造代币

我们的电影评论项目进展得不错，但还没有充分体现Web3的特性。目前我们主要将`Solana`用作数据库。让我们通过奖励用户增加一些趣味性吧！每当用户评论一部电影或留下评论时，我们将为其铸造代币。这可以想象成`StackOverflow`，只不过是用代币来代替点赞。

你可以在上一次的本地环境上继续开发，或者通过复制[这个环境](https://beta.solpg.io/6313104b88a7fca897ad7d19?utm_source=buildspace.so&utm_medium=buildspace_project)来创建一个新的环境。

```bash
git clone https://github.com/buildspace/solana-movie-program/
cd solana-movie-program
git checkout solution-add-comments
```

我们将使用SPL代币程序来实现所有这些神奇的功能，所以请更新 `Cargo.toml` 文件中的依赖项：

```toml
[dependencies]
solana-program = "~1.10.29"
borsh = "0.9.3"
thiserror = "1.0.31"
spl-token = { version="3.2.0", features = [ "no-entrypoint" ] }
spl-associated-token-account = { version="=1.0.5", features = [ "no-entrypoint" ] }
```

让我们快速测试一下，看看是否能够使用这些新的依赖项正常构建：`cargo  build-sbf`。

一切就绪，我们现在可以开始构建了！

## 🤖 设置代币铸造

我们首先要创建一个代币铸造。提醒一下：代币铸造是一个特殊的账户，用于存储我们的代币数据。

这是一条新的指令，所以我们将按照添加评论支持时的相同步骤来操作：

- 更新指令枚举
- 更新`unpack`函数
- 更新 `process_instruction` 函数

从`instruction.rs`开始，我们先更新枚举：

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
    InitializeMint, // 这里新增了初始化铸币的操作
}
```

这里我们不需要任何字段——调用该函数时只需提供地址！

接下来，我们将更新解包函数：

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
            // 这里新增了初始化铸币的操作
            3 => Self::InitializeMint,
            _ => return Err(ProgramError::InvalidInstructionData),
        })
    }
}
```

你会立即注意到 `process_instruction` 的匹配语句中存在错误，因为我们没有处理所有情况。让我们通过引入新的`SPL`导入并添加到匹配语句中来修复这个问题，继续往下开发。

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

在高层次上，这里的操作过程可概括为以下几个步骤：

1. 遍历账户列表，提取必要的信息。
2. 派生代币的`mint PDA`（程序派生地址）。
3. 对传入的重要账户进行验证：
    - `Token mint account` - 代币铸币账户。
    - `Mint authority account` - 铸币权限账户。
    - `System program` - 系统程序。
    - `Token program` - 代币程序。
    - `Sysvar rent` - 用于计算租金的系统变量账户。
4. 计算`mint account`所需的租金。
5. 创建`token mint PDA`。
6. 初始化`mint account`。

由于我们调用了一个未声明的新错误类型，你会收到一个错误提示。解决方法是打开`error.rs`文件，并将`IncorrectAccountError`添加到`ReviewError`枚举中。

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

    // 新增的错误类型
    #[error("Accounts do not match")]
    IncorrectAccountError,
}
```

这个错误信息非常直观。

然后，在文件浏览器中打开目标文件夹，并在部署文件夹中删除密钥对。

回到你的控制台，运行：

```bash
cargo build-sbf
```

然后复制并粘贴控制台打印的部署命令。

如果你遇到`insufficient funds`的问题，请直接运行`solana airdrop 2`。

一旦在本地部署完成，你就可以开始进行测试了！我们将使用本地客户端脚本来测试账户初始化。以下是你需要做的设置步骤：

```bash
git clone https://github.com/buildspace/solana-movie-token-client
cd solana-movie-token-client
npm install
```

在运行脚本之前，请：

1. 更新`index.ts`中的`PROGRAM_ID`。
2. 将第`67`行的连接更改为你的本地连接：

```ts
const connection = new web3.Connection("http://localhost:8899");
```

3. 在第二个控制台窗口中运行`solana logs PROGRAM_ID_HERE`。

现在，你应该有一个控制台正在记录此程序的所有输出，并且已准备好运行脚本。

如果你运行`npm start`，你应该能够看到有关创建铸币账户的日志信息。

:D
