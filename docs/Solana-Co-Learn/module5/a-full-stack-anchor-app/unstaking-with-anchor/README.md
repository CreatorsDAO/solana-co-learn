---
sidebar_position: 93
sidebar_label:  🍖 解除与Anchor的质押
sidebar_class_name: green
---

# 🍖 解除与Anchor的质押

现在赎回和质押已经完成，让我们开始解除质押。解除质押账户结构将包含14个总账户，这是赎回和质押的组合，所以它如下所示。请确保顺序相同。

```rust
#[derive(Accounts)]
pub struct Unstake<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        mut,
        token::authority=user
    )]
    pub nft_token_account: Account<'info, TokenAccount>,
    pub nft_mint: Account<'info, Mint>,
    /// CHECK: Manual validation
    #[account(owner=MetadataTokenId)]
    pub nft_edition: UncheckedAccount<'info>,
    #[account(
        mut,
        seeds = [user.key().as_ref(), nft_token_account.key().as_ref()],
        bump,
        constraint = *user.key == stake_state.user_pubkey,
        constraint = nft_token_account.key() == stake_state.token_account
    )]
    pub stake_state: Account<'info, UserStakeInfo>,
    /// CHECK: manual check
    #[account(mut, seeds=["authority".as_bytes().as_ref()], bump)]
    pub program_authority: UncheckedAccount<'info>,
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
    pub metadata_program: Program<'info, Metadata>,
}
```

这个很简单，让我们编写基本测试来确保它能正常工作。我们需要添加那六个不被推断的账户。

```rust
it("Unstakes", async () => {
    await program.methods
      .unstake()
      .accounts({
        nftTokenAccount: nft.tokenAddress,
        nftMint: nft.mintAddress,
        nftEdition: nft.masterEditionAddress,
        metadataProgram: METADATA_PROGRAM_ID,
        stakeMint: mint,
        userStakeAta: tokenAddress,
      })
      .rpc()
});
```
```

运行 `anchor test` 以确保我们的账户验证设置正确。

回到实际的功能本身，这个功能比前两个要大一些。它与兑换非常相似，首先你可以粘贴那个代码，以节省一些打字。

我们从相同的两个`require`语句开始。在这两个语句之后，我们需要“解冻”我们的账户。这段代码与冻结账户的`invoke_signed`非常相似，我们只需要反转几个步骤。

假设你已经粘贴了兑换码，在声明时钟之前，添加这个。你会注意到它几乎完全相同，但我们显然是在调用解冻函数。

```rust
msg!("Thawing token account");
let authority_bump = *ctx.bumps.get("program_authority").unwrap();
invoke_signed(
    &thaw_delegated_account(
        ctx.accounts.metadata_program.key(),
        ctx.accounts.program_authority.key(),
        ctx.accounts.nft_token_account.key(),
        ctx.accounts.nft_edition.key(),
        ctx.accounts.nft_mint.key(),
    ),
    &[
        ctx.accounts.program_authority.to_account_info(),
        ctx.accounts.nft_token_account.to_account_info(),
        ctx.accounts.nft_edition.to_account_info(),
        ctx.accounts.nft_mint.to_account_info(),
        ctx.accounts.metadata_program.to_account_info(),
    ],
    &[&[b"authority", &[authority_bump]]],
)?;
```

接下来我们需要撤销委托，同样，我们可以复制之前批准委托时的代码。将方法从`approve`改为`revoke`，并更改对象。只需要源代码和权限。确保还要更改变量名。最好在下面看一下，基本上我们只是将`approve`改为`revoke`。

```rust
msg!("Revoking delegate");

let cpi_revoke_program = ctx.accounts.token_program.to_account_info();
let cpi_revoke_accounts = Revoke {
    source: ctx.accounts.nft_token_account.to_account_info(),
    authority: ctx.accounts.user.to_account_info(),
};

let cpi_revoke_ctx = CpiContext::new(cpi_revoke_program, cpi_revoke_accounts);
token::revoke(cpi_revoke_ctx)?;
```

剩下的代码与兑换函数（刚刚粘贴的）保持一致，所以所有的兑换都会发生。接下来，我们需要更改抵押状态，在底部添加这行代码。

```rust
ctx.accounts.stake_state.stake_state = StakeState::Unstaked;
```

测试结束了，我们通过添加这个检查来确保它的功能正常。

```ts
const account = await program.account.userStakeInfo.fetch(stakeStatePda)
expect(account.stakeState === "Unstaked")
```

再次，我们可以增加更多的测试来确保一切按照我们的意图进行。我会把这个交给你处理。

我们的节目就到这里了。希望现在很清楚为什么与Anchor合作更简单，节省了很多时间。接下来是前端！
