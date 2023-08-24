---
sidebar_position: 93
sidebar_label:  🍖 解除与Anchor的质押
sidebar_class_name: green
---

# 🍖 解除与Anchor的质押

现在赎回和质押都已完成，让我们开始解除质押。解除质押账户结构包括了总共`14`个账户，这些是赎回和质押组合在一起的结果，具体如下所示。请确保顺序相同。

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

这个过程相当简单，我们来编写一些基础测试，以确保其正常工作。我们需要添加那六个不会自动推断的账户。

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

运行 `anchor test` 来确保我们的账户验证设置正确。

回到实际功能本身，这个功能会比前两个稍微复杂一些。它与兑换过程非常相似，您可以先粘贴兑换的代码，从而节省一些敲键的时间。

我们将从相同的两个`require`语句开始。在这两个语句之后，我们需要“解冻”我们的账户。这段代码与冻结账户的`invoke_signed`非常相似，我们只需要反向执行几个步骤。

假如您已经粘贴了兑换的代码，在声明时钟之前，可以加入以下内容。您会注意到它几乎完全相同，但我们显然是在调用解冻函数。

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

接下来我们需要撤销委托。这里同样可以复制之前批准委托时的代码，只需将方法从`approve`改为`revoke`，并更改对象。确保还要更改变量名。看一下下方的代码，基本上我们只是将`approve`替换为`revoke`。

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

剩下的代码与兑换函数保持一致（即刚刚粘贴的部分），所以所有的兑换都将执行。接下来，我们需要更改质押状态，在底部添加以下代码行。

```rust
ctx.accounts.stake_state.stake_state = StakeState::Unstaked;
```

测试部分已经完成，我们可以通过添加以下检查来确认功能正常运行。

```ts
const account = await program.account.userStakeInfo.fetch(stakeStatePda)
expect(account.stakeState === "Unstaked")
```

再次提醒，我们可以增加更多测试以确保一切按照预期进行。这部分我会留给您来处理。

至此，我们的教程就到此为止了。希望您现在能明白为什么与`Anchor`合作会更加方便，也能节省许多时间。下一步是进入前端开发阶段！
