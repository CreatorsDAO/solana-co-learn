---
sidebar_position: 92
sidebar_label: 💸 使用Anchor赎回
sidebar_class_name: green
---

# 💸 使用Anchor赎回

在`lib.rs`文件中找到`Redeem`结构体。由于它与`Stake`非常相似，我们可以直接粘贴该代码，并根据需要进行调整。

我们不需要的是`nft_mint`、`nft_edition`和`program_authority`。我们要更改`nft_token_account`的约束条件，将令牌授权改为'`user`'，因为我们并没有传入`mint`。

对于`stake_state`账户，由于不再需要初始化，所以我们只要设定种子和`bump`，并使其可变化。我们还可以为其增加一些手动约束。

```rust
constraint = *user.key == stake_state.user_pubkey,
constraint = nft_token_account.key() == stake_state.token_account
```

接下来，我们要添加几个账户。其中一个是`stake_mint`，它需要可变。这是奖励铸币的账户。

```rust
#[account(mut)]
pub stake_mint: Account<'info, Mint>,
```

另一个是`stake_authority`，它将是另一个未经检查的账户，所以让我们添加这个检查。

```rust
#[account(seeds = ["mint".as_bytes().as_ref()], bump)]
```

用户的`user_stake_ata`是一个`TokenAccount`，具有以下限制条件。

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

然后，将我们的账户总数增加到`10`个。以下是所有代码的片段。

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

回到测试文件中，编写一个简单的测试以确保函数被触发。

```ts
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

接下来，让我们进行一些检查，确认它是否已初始化，以及确保它已经抵押。我们需要在文件底部为这两种情况增加自定义错误。

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

之后，让我们获取时钟。

```rust
let clock = Clock::get()?;
```

现在，我们可以添加一些消息来跟踪事物的进展，并声明我们的时间和兑换金额。

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

好了，现在我们将实际铸造奖励。首先，我们要使用我们的程序创建`CpiContext`，然后在`MintTo`对象中传递账户信息。最后，添加种子和金额。

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

一切准备就绪后，我们需要设置最后的赎回时间。如果不设置，用户可能会获得比实际应得的更多奖励。

```rust
ctx.accounts.stake_state.last_stake_redeem = clock.unix_timestamp;
msg!(
    "Updated last stake redeem time: {:?}",
    ctx.accounts.stake_state.last_stake_redeem
);
```

重新进入兑换测试，并添加以下内容。

```ts
const account = await program.account.userStakeInfo.fetch(stakeStatePda)
expect(account.stakeState === "Unstaked")
const tokenAccount = await getAccount(provider.connection, tokenAddress)
```

你可以继续添加更多的测试来确保其稳定性。目前我们只想先确保基本功能的实现和测试。假如一切顺利，我们可以继续进行解除质押的指令。
