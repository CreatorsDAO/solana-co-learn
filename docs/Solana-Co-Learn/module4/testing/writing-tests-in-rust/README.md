---
sidebar_position: 75
sidebar_label: 😳 使用Rust编写测试
sidebar_class_name: green
---

# 😳 使用Rust编写测试

上一节课都是为了准备好 MINT 账户。预热已经结束，现在是正式表演的时候了。让我们为我们心爱的电影评论程序编写测试吧。

设置 - 入门：[https://github.com/buildspace/solana-movie-program/tree/solution-add-tokens](https://github.com/buildspace/solana-movie-program/tree/solution-add-tokens)

- 添加到 `Cargo.toml`

```toml
[dev-dependencies]
assert_matches = "1.4.0"
solana-program-test = "~1.10.29"
solana-sdk = "~1.10.29"
```

## 初始化测试框架

- 添加到底部 `processor.rs`

```rust
// Inside processor.rs
#[cfg(test)]
mod tests {
  use {
    super::*,
    assert_matches::*,
    solana_program::{
        instruction::{AccountMeta, Instruction},
        system_program::ID as SYSTEM_PROGRAM_ID,
    },
    solana_program_test::*,
    solana_sdk::{
        signature::Signer,
        transaction::Transaction,
        sysvar::rent::ID as SYSVAR_RENT_ID
    },
    spl_associated_token_account::{
        get_associated_token_address,
        instruction::create_associated_token_account,
    },
    spl_token:: ID as TOKEN_PROGRAM_ID,
  };
}
```

## 辅助函数

- 创建初始化铸币指令的辅助函数
- 在测试模块中添加一个函数，以便在需要时可以调用它。

```rust
// Inside the the tests modules
fn create_init_mint_ix(payer: Pubkey, program_id: Pubkey) -> (Pubkey, Pubkey, Instruction) {
  // Derive PDA for token mint authority
  let (mint, _bump_seed) = Pubkey::find_program_address(&[b"token_mint"], &program_id);
  let (mint_auth, _bump_seed) = Pubkey::find_program_address(&[b"token_auth"], &program_id);

  let init_mint_ix = Instruction {
      program_id: program_id,
      accounts: vec![
          AccountMeta::new_readonly(payer, true),
          AccountMeta::new(mint, false),
          AccountMeta::new(mint_auth, false),
          AccountMeta::new_readonly(SYSTEM_PROGRAM_ID, false),
          AccountMeta::new_readonly(TOKEN_PROGRAM_ID, false),
          AccountMeta::new_readonly(SYSVAR_RENT_ID, false)
      ],
      data: vec![3]
  };

  (mint, mint_auth, init_mint_ix)
}
```

## 初始化铸币测试

- 测试 `initialize_token_mint` 指示
- 我们的辅助函数返回一个元组
- 我们可以使用解构来获取我们需要的值
    - mint pubkey,
    - mint_auth pubkey
    - the Instruction
- 一旦指令组装完成，我们可以将其添加到 `Transaction` 中，并使用从 `ProgramTest` 构造函数生成的 `banks_client` 来处理它。
- 使用 `assert_matches!` 宏来确定测试是否通过

```rust
// First unit test
#[tokio::test]
async fn test_initialize_mint_instruction() {
    let program_id = Pubkey::new_unique();
    let (mut banks_client, payer, recent_blockhash) = ProgramTest::new(
        "pda_local",
        program_id,
        processor!(process_instruction),
    )
    .start()
    .await;

    // Call helper function
    let (_mint, _mint_auth, init_mint_ix) = create_init_mint_ix(payer.pubkey(), program_id);

    // Create transaction object with instructions, accounts, and input data
    let mut transaction = Transaction::new_with_payer(
        &[init_mint_ix,],
        Some(&payer.pubkey()),
    );
    transaction.sign(&[&payer], recent_blockhash);

    // Process transaction and compare the result
    assert_matches!(banks_client.process_transaction(transaction).await, Ok(_));
}
```

## 添加电影评论测试

- 测试 `add_movie_review` 指令设置

```rust
// Second unit test
#[tokio::test]
async fn test_add_movie_review_instruction() {
  let program_id = Pubkey::new_unique();
  let (mut banks_client, payer, recent_blockhash) = ProgramTest::new(
      "pda_local",
      program_id,
      processor!(process_instruction),
  )
  .start()
  .await;

  // Call helper function
  let (mint, mint_auth, init_mint_ix) = create_init_mint_ix(payer.pubkey(), program_id);

}
```

- 在第二次测试中推导出`PDA`
    - derive the review,
    - 评论计数器
    - 用户关联的令牌账户地址。

```rust
// Create review PDA
let title: String = "Captain America".to_owned();
const RATING: u8 = 3;
let review: String = "Liked the movie".to_owned();
let (review_pda, _bump_seed) =
   Pubkey::find_program_address(&[payer.pubkey().as_ref(), title.as_bytes()], &program_id);

// Create comment PDA
let (comment_pda, _bump_seed) =
   Pubkey::find_program_address(&[review_pda.as_ref(), b"comment"], &program_id);

// Create user associate token account of token mint
let init_ata_ix: Instruction = create_associated_token_account(
   &payer.pubkey(),
   &payer.pubkey(),
   &mint,
);

let user_ata: Pubkey =
   get_associated_token_address(&payer.pubkey(), &mint);
```

- 构建交易（仍在第二次测试中）

```rust
// Concat data to single buffer
let mut data_vec = vec![0];
data_vec.append(
    &mut (TryInto::<u32>::try_into(title.len()).unwrap().to_le_bytes())
        .try_into()
        .unwrap(),
);
data_vec.append(&mut title.into_bytes());
data_vec.push(RATING);
data_vec.append(
    &mut (TryInto::<u32>::try_into(review.len())
        .unwrap()
        .to_le_bytes())
    .try_into()
    .unwrap(),
);
data_vec.append(&mut review.into_bytes());

// Create transaction object with instructions, accounts, and input data
let mut transaction = Transaction::new_with_payer(
    &[
    init_mint_ix,
    init_ata_ix,
    Instruction {
        program_id: program_id,
        accounts: vec![
            AccountMeta::new_readonly(payer.pubkey(), true),
            AccountMeta::new(review_pda, false),
            AccountMeta::new(comment_pda, false),
            AccountMeta::new(mint, false),
            AccountMeta::new_readonly(mint_auth, false),
            AccountMeta::new(user_ata, false),
            AccountMeta::new_readonly(SYSTEM_PROGRAM_ID, false),
            AccountMeta::new_readonly(TOKEN_PROGRAM_ID, false),
        ],
        data: data_vec,
    },
    ],
    Some(&payer.pubkey()),
);
transaction.sign(&[&payer], recent_blockhash);

// Process transaction and compare the result
assert_matches!(banks_client.process_transaction(transaction).await, Ok(_));
```

- 用 `cargo test-sbf` 运行这些测试

## 🚢 船舶挑战


既然你已经知道如何在Rust中编写单元测试，那就继续添加一些你认为对电影评论或学生介绍程序功能至关重要的测试吧。

如果你想更上一层楼，也可以加一些TypeScript的集成测试。我知道我们没有一起经历过这些，但是值得一试！

随着你在这个项目中的进展，一些挑战会变得更加开放，这样你就可以根据自己的需求来推动自己。不要滥用这个机会，而是将其视为提升学习效果的机会。
