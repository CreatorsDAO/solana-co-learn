---
sidebar_position: 75
sidebar_label: 😳 使用Rust编写测试
sidebar_class_name: green
---

# 😳 使用Rust编写测试

上一节课我们已经为`MINT`账户做好了准备。预热阶段已经结束，现在是正式开始的时候了。让我们为我们心爱的电影评论程序编写测试吧。

设置 - 入门：[https://github.com/buildspace/solana-movie-program/tree/solution-add-tokens](https://github.com/buildspace/solana-movie-program/tree/solution-add-tokens)

- 在 `Cargo.toml` 文件中添加：

```toml
[dev-dependencies]
assert_matches = "1.4.0"
solana-program-test = "~1.10.29"
solana-sdk = "~1.10.29"
```

## 初始化测试框架

- 在 `processor.rs` 文件底部添加：

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

- 创建用于初始化铸币的辅助函数。
- 在测试模块中添加一个函数，这样你可以在需要时调用它。

```rust
// 在测试模块内部
fn create_init_mint_ix(payer: Pubkey, program_id: Pubkey) -> (Pubkey, Pubkey, Instruction) {
  // 导出用于token mint授权的PDA
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

- 测试 `initialize_token_mint` 指令。
- 我们的辅助函数将返回一个元组。
- 我们可以使用解构来获取我们所需的值：
    - `mint pubkey`，
    - `mint_auth pubkey`，
    - 相应的`Instruction`。
- 一旦指令组装完成，我们可以将其添加到 `Transaction` 中，并使用从 `ProgramTest` 构造函数生成的 `banks_client` 来处理它。
- 使用 `assert_matches!` 宏来确认测试是否通过。

```rust
// 第一个单元测试
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

    // 调用辅助函数
    let (_mint, _mint_auth, init_mint_ix) = create_init_mint_ix(payer.pubkey(), program_id);

    // 创建具有指令、帐户和输入数据的交易对象
    let mut transaction = Transaction::new_with_payer(
        &[init_mint_ix,],
        Some(&payer.pubkey()),
    );
    transaction.sign(&[&payer], recent_blockhash);

    // 处理交易并比较结果
    assert_matches!(banks_client.process_transaction(transaction).await, Ok(_));
}
```

## 添加电影评论测试

- 测试 `add_movie_review` 指令设置：

```rust
// 第二个单元测试
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

  // 调用辅助函数
  let (mint, mint_auth, init_mint_ix) = create_init_mint_ix(payer.pubkey(), program_id);

}
```

- 在第二个测试中推导出`PDA`：
    - 导出评论，
    - 评论计数器，
    - 用户关联的令牌账户地址。

```rust
// 创建评论PDA
let title: String = "Captain America".to_owned();
const RATING: u8 = 3;
let review: String = "Liked the movie".to_owned();
let (review_pda, _bump_seed) =
   Pubkey::find_program_address(&[payer.pubkey().as_ref(), title.as_bytes()], &program_id);

// 创建评论计数器PDA
let (comment_pda, _bump_seed) =
   Pubkey::find_program_address(&[review_pda.as_ref(), b"comment"], &program_id);

// 创建与token mint关联的用户令牌账户
let init_ata_ix: Instruction = create_associated_token_account(
   &payer.pubkey(),
   &payer.pubkey(),
   &mint,
);

let user_ata: Pubkey =
   get_associated_token_address(&payer.pubkey(), &mint);
```

- 构建交易（仍在第二次测试中）：

```rust
// 将数据连接到单个缓冲区
let mut data_vec = vec![0];
data_vec.append(&mut (title.len().try_into().unwrap().to_le_bytes().try_into().unwrap()));
data_vec.append(&mut title.into_bytes());
data_vec.push(RATING);
data_vec.append(&mut (review.len().try_into().unwrap().to_le_bytes().try_into().unwrap()));
data_vec.append(&mut review.into_bytes());

// 创建具有指令、帐户和输入数据的交易对象
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

// 处理交易并比较结果
assert_matches!(banks_client.process_transaction(transaction).await, Ok(_));
```

- 使用 `cargo test-sbf` 命令运行这些测试

## 🚢 挑战

既然你已经掌握了如何在`Rust`中编写单元测试，那就不妨继续添加一些你认为对电影评论或学生介绍程序功能至关重要的测试。

如果你想进一步挑战自己，还可以尝试添加一些`TypeScript`的集成测试。虽然我们没有一起走过这些步骤，但尝试一下肯定不会错！

随着你在项目中的进展，一些挑战可能会变得更加开放，从而让你能够根据自己的需求推动自己前进。不要滥用这个机会，而是把它看作提升学习效果的机会。
