---
sidebar_position: 72
sidebar_label: 💸 使用CPI构建支付系统
sidebar_class_name: green
---

# 💸 使用CPI构建支付系统

上一堂课我们已经完成了`Mint`账户的准备工作，热身环节到此结束，现在正式开始主要表演。

我们将深入到审查和评论的工作流程中，并添加必要的逻辑来铸造代币。

我们首先从电影评论开始。请转到 `processor.rs` 文件，并更新 `add_movie_review` 函数，以便接收额外的账户。

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

新增的部分包括：

- `token_mint` - 代币的铸币地址。
- `mint_auth` - 代币铸造机构的地址。
- `user_ata` - 用户与此代币发行机构关联的令牌账户（用于代币铸造）。
- `token_program` - 代币程序的地址。

这里并没有太多特殊之处，这些只是处理代币时所期望的账户。

还记得我们的编程习惯吗？每次添加一个账户后，立即添加验证！以下是我们需要在 `add_movie_review` 函数中添加的内容：

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

你现在已经反复实践过这样的流程，所以这些操作应该感觉得相当熟悉了 :)

现在我们可以开始铸币了！就在程序结束之前，我们会添加如下代码： `Ok(())`

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
    )?,
    // Account_infos
    &[token_mint.clone(), user_ata.clone(), mint_auth.clone()],
    // Seeds
    &[&[b"token_auth", &[mint_auth_bump]]],
)?;

Ok(())
```

`mint_to` 是来自`SPL`令牌库的指令，所以我们还需更新顶部的导入内容：

```rust
// Existing imports
use spl_token::{instruction::{initialize_mint, mint_to}, ID as TOKEN_PROGRAM_ID};
```

我们的评论功能已经完成了！现在每当有人留下评论时，我们就会给他们发送10个代币。

我们将在 `add_comment` 函数中执行完全相同的操作： `processor.rs`

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

注意，不要重复 `Ok(())` ，因为那会导致错误。

希望你现在能够看出这些模式的共通性了。虽然在进行本地开发时，我们需要写很多代码，但整个工作流程相当简单，并且感觉很“纯粹”。

## 🚀 构建、部署和测试

是时候赚取一些爆米花代币了 🍿

首先，让我们开始构建和部署项目。

```bash
cargo build-sbf
solana program deploy <PATH>
```

接下来，我们将测试初始化代币铸造流程。

```bash
git clone https://github.com/buildspace/solana-movie-token-client
cd solana-movie-token-client
npm install
```

和以前一样，需要进行以下操作：

1. 在 `index.ts` 中更新 `PROGRAM_ID` 的值。
2. 修改第`67`行的连接为在线连接。

```ts
const connection = new web3.Connection("http://localhost:8899");
```

运行 `npm start` 后，你的 `Mint` 账户将会被初始化。

最后，我们可以使用前端来发送电影评论，并因此获得一些代币。

像往常一样，你可以继续使用之前停下的前端，或者从正确的分支创建一个新的实例。

```bash
git clone https://github.com/buildspace/solana-movie-frontend/
cd solana-movie-frontend
git checkout solution-add-tokens
npm install
```

更新 `PROGRAM_ID`，提交评论，发表评论后，你现在应该能在 `Phantom` 钱包中看到你的代币了！

## 🚢 挑战

为了运用你在本课程中学到的有关 `CPI` 的知识，不妨考虑如何将其整合到学生介绍方案中。你可以做些类似我们演示中的事情，比如在用户自我介绍时铸造一些代币给他们。或者，如果你感到更有挑战性，思考如何将课程中学到的所有内容整合在一起，从零开始创建全新的项目。

如果你选择做类似的演示，可以自由使用相同的[脚本](https://github.com/buildspace/solana-movie-token-client?utm_source=buildspace.so&utm_medium=buildspace_project)来调用 `initialize_mint` 指令，或者你可以展现创造力，从客户端初始化铸币过程，然后将铸币权限转移到程序 PDA。如果你需要查看可能的解决方案，请查看这个[游乐场链接](https://beta.solpg.io/631f631a77ea7f12846aee8d?utm_source=buildspace.so&utm_medium=buildspace_project)。

享受编程的乐趣，并将此视为自我提升的机会！
