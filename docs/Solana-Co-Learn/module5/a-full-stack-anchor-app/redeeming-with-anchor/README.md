---
sidebar_position: 92
sidebar_label: 💸 Redeeming with Anchor
sidebar_class_name: green
---

# 💸 Redeeming with Anchor

回到 `lib.rs` 文件，找到`Redeem`结构体。它与`Stake`非常相似，所以我们将粘贴该代码并根据需要进行编辑。

我们不需要的是`nft_mint`、`nft_edition`和`program_authority`。我们需要更改`nft_token_account`上的约束条件，使令牌授权变为'`user`'，因为我们没有传入`mint`。

对于`stake_state`账户，它不再需要初始化，所以我们只需要种子和`bump`，并使其可变。我们还可以为其添加一些手动约束。

```rust
constraint = *user.key == stake_state.user_pubkey,
constraint = nft_token_account.key() == stake_state.token_account
```

让我们再添加几个账户，其中一个是 `stake_mint`，需要是可变的。这是奖励铸币账户。

```rust
#[account(mut)]
pub stake_mint: Account<'info, Mint>,
```

另一个是`stake_authority`，它将是另一个未经检查的账户，所以让我们添加这个检查。

```rust
#[account(seeds = ["mint".as_bytes().as_ref()], bump)]
```

用户的 `user_stake_ata` 是一个 `TokenAccount`，具有以下限制条件。

```rust
#[account(
        init_if_needed,
        payer=user,
        associated_token::mint=stake_mint,
        associated_token::authority=user
    )]
pub user_stake_ata: Account<'info, TokenAccount>,
```

关联的 `associated_token_program` 是一个 `AssociatedToken`。

```rust
pub associated_token_program: Program<'info, AssociatedToken>,
```

最后，将`metadata_program`替换为`rent`。

```rust
pub rent: Sysvar<'info, Rent>,
```

将我们的账户总数增加到10个。这是所有代码的一个片段。

```rust
#[derive(Accounts)]
pub struct Redeem<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        mut,
        token::authority=user
    )]
    pub nft_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        seeds = [user.key().as_ref(), nft_token_account.key().as_ref()],
        bump,
        constraint = *user.key == stake_state.user_pubkey,
        constraint = nft_token_account.key() == stake_state.token_account
    )]
    pub stake_state: Account<'info, UserStakeInfo>,
    #[account(mut)]
    pub stake_mint: Account<'info, Mint>,
    /// CHECK: manual check
    #[account(seeds = ["mint".as_bytes().as_ref()], bump)]
    pub stake_authority: UncheckedAccount<'info>,
    #[account(
        init_if_needed,
        payer=user,
        associated_token::mint=stake_mint,
        associated_token::authority=user
    )]
    pub user_stake_ata: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}
```

回到测试文件，编写一个简单的测试来确保函数触发。

这应该与我们的股份测试非常相似，只是传入了不同的账户。记住，一堆账户只是为了测试而推断出来的，所以我们不必全部传入。

```rust
it("Redeems", async () => {
    await program.methods
      .redeem()
      .accounts({
        nftTokenAccount: nft.tokenAddress,
        stakeMint: mint,
        userStakeAta: tokenAddress,
      })
      .rpc()
```

...然后运行 `anchor test` ，如果一切正常并且两个测试通过，我们就进入函数并编写赎回逻辑。

首先，让我们进行一些检查，一个是看它是否已初始化，另一个是确保它已经抵押。我们需要在文件底部为这两个情况添加自定义错误。

```rust
require!(
    ctx.accounts.stake_state.is_initialized,
    StakeError::UninitializedAccount
);

require!(
    ctx.accounts.stake_state.stake_state == StakeState::Staked,
    StakeError::InvalidStakeState
);

...

#[msg("State account is uninitialized")]
    UninitializedAccount,

#[msg("Stake state is invalid")]
    InvalidStakeState,

```

接下来，让我们拿到我们的时钟。


```rust
let clock = Clock::get()?;
```

现在我们可以添加一些消息来跟踪事物，并声明我们的时间和兑换金额。

```rust
msg!(
    "Stake last redeem: {:?}",
    ctx.accounts.stake_state.last_stake_redeem
);

msg!("Current time: {:?}", clock.unix_timestamp);
let unix_time = clock.unix_timestamp - ctx.accounts.stake_state.last_stake_redeem;
msg!("Seconds since last redeem: {}", unix_time);
let redeem_amount = (10 * i64::pow(10, 2) * unix_time) / (24 * 60 * 60);
msg!("Elligible redeem amount: {}", redeem_amount);
```

好的，现在我们将实际铸造奖励。首先，我们需要使用我们的程序创建`CpiContext`。然后，我们在`MintTo`对象中传递账户信息，包括铸币对象、接收者和授权机构。最后，我们添加种子和金额。


```rust
msg!("Minting staking rewards");
token::mint_to(
    CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        MintTo {
            mint: ctx.accounts.stake_mint.to_account_info(),
            to: ctx.accounts.user_stake_ata.to_account_info(),
            authority: ctx.accounts.stake_authority.to_account_info(),
        },
        &[&[
            b"mint".as_ref(),
            &[*ctx.bumps.get("stake_authority").unwrap()],
        ]],
    ),
    redeem_amount.try_into().unwrap(),
)?;
```

一切都准备好了，现在我们需要设定最后的赎回时间，如果我们不设定的话，他们会得到比应得的更多奖励。

```rust
ctx.accounts.stake_state.last_stake_redeem = clock.unix_timestamp;
msg!(
    "Updated last stake redeem time: {:?}",
    ctx.accounts.stake_state.last_stake_redeem
);
```

重新进入兑换测试，并添加这个。

```ts
const account = await program.account.userStakeInfo.fetch(stakeStatePda)
expect(account.stakeState === "Unstaked")
const tokenAccount = await getAccount(provider.connection, tokenAddress)
```

你可以继续添加更多的测试来增强其稳定性，目前我们只想先确保基本功能的实现和测试。假设一切顺利，我们可以继续进行解除质押的指令。
