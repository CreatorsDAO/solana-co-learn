---
sidebar_position: 72
sidebar_label: 💸 使用CPI构建支付系统
sidebar_class_name: green
---

# 💸 使用CPI构建支付系统

上一堂课都是为了准备好Mint账户。预热已经结束，现在是正式表演的时候了。上一堂课都是为了准备好Mint账户。预热已经结束，现在是正式表演的时候了。

我们将进入我们的审查和评论工作流程，并添加必要的逻辑来铸造代币。

我们将从电影评论开始。请转到 `processor.rs` 并更新 `add_movie_review` 以要求传入额外的账户。

```rust
// Inside add_movie_review
msg!("Adding movie review...");
msg!("Title: {}", title);
msg!("Rating: {}", rating);
msg!("Description: {}", description);

let account_info_iter = &mut accounts.iter();

let initializer = next_account_info(account_info_iter)?;
let pda_account = next_account_info(account_info_iter)?;
let pda_counter = next_account_info(account_info_iter)?;
let token_mint = next_account_info(account_info_iter)?;
let mint_auth = next_account_info(account_info_iter)?;
let user_ata = next_account_info(account_info_iter)?;
let system_program = next_account_info(account_info_iter)?;
let token_program = next_account_info(account_info_iter)?;
```

新的是：

- `token_mint` - 代币的铸币地址
- `mint_auth` - 代币铸造机构的地址
- `user_ata` - 用户与此代币发行机构关联的令牌账户（用于代币铸造）
- `token_program` - 代币程序的地址

这里没有什么特别的，这些只是在处理代币时你所期望的账户。

记得建立习惯了吗？每次添加一个账户后，立即添加验证！以下是我们需要在 `add_movie_review` 函数中添加的内容：

```rust
msg!("deriving mint authority");
let (mint_pda, _mint_bump) = Pubkey::find_program_address(&[b"token_mint"], program_id);
let (mint_auth_pda, mint_auth_bump) =
    Pubkey::find_program_address(&[b"token_auth"], program_id);

if *token_mint.key != mint_pda {
    msg!("Incorrect token mint");
    return Err(ReviewError::IncorrectAccountError.into());
}

if *mint_auth.key != mint_auth_pda {
    msg!("Mint passed in and mint derived do not match");
    return Err(ReviewError::InvalidPDA.into());
}

if *user_ata.key != get_associated_token_address(initializer.key, token_mint.key) {
    msg!("Incorrect token mint");
    return Err(ReviewError::IncorrectAccountError.into());
}

if *token_program.key != TOKEN_PROGRAM_ID {
    msg!("Incorrect token program");
    return Err(ReviewError::IncorrectAccountError.into());
}
```

你现在已经做过几次了，所以这应该感觉很熟悉 :)

现在我们可以开始铸币了！就在程序结束之前，我们会添加这个： `Ok(())`

```rust
msg!("Minting 10 tokens to User associated token account");
invoke_signed(
    // Instruction
    &spl_token::instruction::mint_to(
        token_program.key,
        token_mint.key,
        user_ata.key,
        mint_auth.key,
        &[],
        10*LAMPORTS_PER_SOL,
    )?, // ? unwraps and returns the error if there is one
    // Account_infos
    &[token_mint.clone(), user_ata.clone(), mint_auth.clone()],
    // Seeds
    &[&[b"token_auth", &[mint_auth_bump]]],
)?;

Ok(())
```

`mint_to` 是来自SPL令牌库的指令，因此我们还需要更新顶部的导入内容：

```rust
// Existing imports
use spl_token::{instruction::{initialize_mint, mint_to}, ID as TOKEN_PROGRAM_ID};
```

我们的评论工作完成了！现在每当有人留下评论，我们就会给他们发送10个代币。

我们将在 `add_comment` 中做完全相同的事情：  `processor.rs`

```rust
// Inside add_comment
let account_info_iter = &mut accounts.iter();

let commenter = next_account_info(account_info_iter)?;
let pda_review = next_account_info(account_info_iter)?;
let pda_counter = next_account_info(account_info_iter)?;
let pda_comment = next_account_info(account_info_iter)?;
let token_mint = next_account_info(account_info_iter)?;
let mint_auth = next_account_info(account_info_iter)?;
let user_ata = next_account_info(account_info_iter)?;
let system_program = next_account_info(account_info_iter)?;
let token_program = next_account_info(account_info_iter)?;

// Mint tokens here
msg!("deriving mint authority");
let (mint_pda, _mint_bump) = Pubkey::find_program_address(&[b"token_mint"], program_id);
let (mint_auth_pda, mint_auth_bump) =
    Pubkey::find_program_address(&[b"token_auth"], program_id);

if *token_mint.key != mint_pda {
    msg!("Incorrect token mint");
    return Err(ReviewError::IncorrectAccountError.into());
}

if *mint_auth.key != mint_auth_pda {
    msg!("Mint passed in and mint derived do not match");
    return Err(ReviewError::InvalidPDA.into());
}

if *user_ata.key != get_associated_token_address(commenter.key, token_mint.key) {
    msg!("Incorrect token mint");
    return Err(ReviewError::IncorrectAccountError.into());
}

if *token_program.key != TOKEN_PROGRAM_ID {
    msg!("Incorrect token program");
    return Err(ReviewError::IncorrectAccountError.into());
}

msg!("Minting 5 tokens to User associated token account");
invoke_signed(
    // Instruction
    &spl_token::instruction::mint_to(
        token_program.key,
        token_mint.key,
        user_ata.key,
        mint_auth.key,
        &[],
        5 * LAMPORTS_PER_SOL,
    )?,
    // Account_infos
    &[token_mint.clone(), user_ata.clone(), mint_auth.clone()],
    // Seeds
    &[&[b"token_auth", &[mint_auth_bump]]],
)?;

Ok(())
```

确保不要重复 `Ok(())` ，因为那会导致错误，哈哈

希望你现在开始能看到这些模式了。在进行本地开发时，我们需要写很多代码，但整体的工作流程相当简单，感觉很“纯粹”。

## 🚀 构建、部署和测试

是时候赚取一些爆米花代币了 🍿

首先，我们将构建和部署。

```bash
cargo build-sbf
solana program deploy <PATH>
```

然后我们将测试初始化代币铸造

```bash
git clone https://github.com/buildspace/solana-movie-token-client
cd solana-movie-token-client
npm install
```

就像以前一样，

1. 更新 `PROGRAM_ID` 在 `index.ts` 中
2. 将第67行的连接更改为在线连接

```ts
const connection = new web3.Connection("http://localhost:8899");
```

运行 `npm start` ，你的`Mint`账户将被初始化。

最后，我们将使用前端发送电影评论并获取一些令牌。

一如既往，你可以继续使用上次停下的前端，或者从正确的分支创建一个新的实例

```bash
git clone https://github.com/buildspace/solana-movie-frontend/
cd solana-movie-frontend
git checkout solution-add-tokens
npm install
```

更新 `PROGRAM_ID`，提交评论，留下评论。你现在应该在Phantom中拥有令牌！

## 🚢 船舶挑战

为了应用你在本课程中学到的有关CPI的知识，思考一下如何将其融入到学生介绍计划中。你可以做类似于我们在演示中所做的事情，并为用户添加一些功能，当他们介绍自己时，可以铸造代币给他们。或者，如果你感到非常有雄心壮志，思考一下如何将你在课程中学到的一切，从头开始创造出全新的东西。

如果你决定做类似的演示，可以随意使用相同的[脚本](https://github.com/buildspace/solana-movie-token-client?utm_source=buildspace.so&utm_medium=buildspace_project)来调用 `initialize_mint` 指令，或者你可以发挥创意，从客户端初始化铸币，然后将铸币权限转移到程序PDA。如果你需要查看潜在的解决方案，请看一下这个[游乐场](https://beta.solpg.io/631f631a77ea7f12846aee8d?utm_source=buildspace.so&utm_medium=buildspace_project)。

玩得开心，并将其视为一个推动自己的机会！
