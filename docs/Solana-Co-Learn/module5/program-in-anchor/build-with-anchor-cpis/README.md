---
sidebar_position: 86
sidebar_label: 使用Anchor CPIs构建
sidebar_class_name: green
---

# 使用Anchor CPIs构建

回归未来。我们将通过以`CPIs`结尾的电影评论来为这个话题画上完美的句号。

这一次，我们将：

- 添加指令以创建带有元数据的代币铸造
- 添加指令以添加评论
- 在创建评论时铸造薄荷代币
- 在添加评论时铸造薄荷代币

**初始代码**

- 起始代码链接：[这里](https://beta.solpg.io/63184c17bb7e0b5f4ca6dfa5?utm_source=buildspace.so&utm_medium=buildspace_project)
- 我们将在之前的`PDA`演示基础上进行扩展

首先，我们来定义 `create_reward_mint` 指令：

```rust
pub fn create_reward_mint(
        ctx: Context<CreateTokenReward>,
        uri: String,
        name: String,
        symbol: String,
    ) -> Result<()> {
        msg!("Create Reward Token");

        let seeds = &["mint".as_bytes(), &[*ctx.bumps.get("reward_mint").unwrap()]];

        let signer = [&seeds[..]];

        let account_info = vec![
            ctx.accounts.metadata.to_account_info(),
            ctx.accounts.reward_mint.to_account_info(),
            ctx.accounts.user.to_account_info(),
            ctx.accounts.token_metadata_program.to_account_info(),
            ctx.accounts.token_program.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.rent.to_account_info(),
        ];

        invoke_signed(
            &create_metadata_accounts_v2(
                ctx.accounts.token_metadata_program.key(),
                ctx.accounts.metadata.key(),
                ctx.accounts.reward_mint.key(),
                ctx.accounts.reward_mint.key(),
                ctx.accounts.user.key(),
                ctx.accounts.user.key(),
                name,
                symbol,
                uri,
                None,
                0,
                true,
                true,
                None,
                None,
            ),
            account_info.as_slice(),
            &signer,
        )?;

        Ok(())
    }
```

尽管代码很长，但非常直观！我们正在为`Token`元数据程序创建一个`CPI`，用来指向 `create_metadata_account_v2` 指令。

接下来，我们会看到 `CreateTokenReward` 上下文类型。

有关 /// [CHECK](https://book.anchor-lang.com/anchor_in_depth/the_accounts_struct.html#safety-checks?utm_source=buildspace.so&utm_medium=buildspace_project) 的详细信息在这里：安全检查。

```rust
#[derive(Accounts)]
pub struct CreateTokenReward<'info> {
    #[account(
        init,
        seeds = ["mint".as_bytes()],
        bump,
        payer = user,
        mint::decimals = 6,
        mint::authority = reward_mint,

    )]
    pub reward_mint: Account<'info, Mint>,

    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    pub token_program: Program<'info, Token>,

    /// CHECK:
    #[account(mut)]
    pub metadata: AccountInfo<'info>,
    /// CHECK:
    pub token_metadata_program: AccountInfo<'info>,
}
```

## 创建错误代码（ErrorCode）

- 用于检查评级的错误代码
- （`Anchor`已处理我们在原生版本中的其他检查）

```rust
#[error_code]
pub enum ErrorCode {
    #[msg("评分大于5或小于1")]
    InvalidRating,
}
```

## 更新 `add_movie_review`

- 添加对`ErrorCode`的检查
- 设置评论计数器账户
- 通过`CPI`给 `mintTo` 指令，将代币铸造给评论人

```rust
pub fn add_movie_review(
        ctx: Context<AddMovieReview>,
        title: String,
        description: String,
        rating: u8,
    ) -> Result<()> {
        msg!("创建了影评账户");
        msg!("标题：{}", title);
        msg!("描述：{}", description);
        msg!("评分：{}", rating);

        if rating > 5 || rating < 1 {
            msg!("评分不能高于5");
            return err!(ErrorCode::InvalidRating);
        }

        let movie_review = &mut ctx.accounts.movie_review;
        movie_review.reviewer = ctx.accounts.initializer.key();
        movie_review.title = title;
        movie_review.rating = rating;
        movie_review.description = description;

        msg!("创建了影评计数器账户");
        let movie_comment_counter = &mut ctx.accounts.movie_comment_counter;
        movie_comment_counter.counter = 0;
        msg!("计数器：{}", movie_comment_counter.counter);

        let seeds = &["mint".as_bytes(), &[*ctx.bumps.get("reward_mint").unwrap()]];

        let signer = [&seeds[..]];

        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            token::MintTo {
                mint: ctx.accounts.reward_mint.to_account_info(),
                to: ctx.accounts.token_account.to_account_info(),
                authority: ctx.accounts.reward_mint.to_account_info(),
            },
            &signer,
        );

        token::mint_to(cpi_ctx, 10000000)?;
        msg!("已铸币");
        Ok(())
    }
```

## 更新 `AddMovieReview` 上下文

- 初始化 `movie_review`
- 初始化 `movie_comment_counter`
- 使用 `init_if_needed` 来初始化令牌账户

```rust
#[derive(Accounts)]
#[instruction(title: String, description: String)]
pub struct AddMovieReview<'info> {
    #[account(
        init,
        seeds = [title.as_bytes(), initializer.key().as_ref()],
        bump,
        payer = initializer,
        space = 8 + 32 + 1 + 4 + title.len() + 4 + description.len()
    )]
    pub movie_review: Account<'info, MovieAccountState>,
    #[account(
        init,
        seeds = ["counter".as_bytes(), movie_review.key().as_ref()],
        bump,
        payer = initializer,
        space = 8 + 8
    )]
    pub movie_comment_counter: Account<'info, MovieCommentCounter>,
    #[account(mut,
        seeds = ["mint".as_bytes()],
        bump
    )]
    pub reward_mint: Account<'info, Mint>,
    #[account(
        init_if_needed,
        payer = initializer,
        associated_token::mint = reward_mint,
        associated_token::authority = initializer
    )]
    pub token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub initializer: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
}
```

## 将 `ErrorCode` 添加到 `update_movie_review` 中

- 在 `update_movie_review` 指令中添加 `ErrorCode` 检查

```rust
pub fn update_movie_review(
        ctx: Context<UpdateMovieReview>,
        title: String,
        description: String,
        rating: u8,
    ) -> Result<()> {
        msg!("更新了影评账户");
        msg!("标题：{}", title);
        msg!("描述：{}", description);
        msg!("评分：{}", rating);

        if rating > 5 || rating < 1 {
            msg!("评分不能高于5");
            return err!(ErrorCode::InvalidRating);
        }

        let movie_review = &mut ctx.accounts.movie_review;
        movie_review.rating = rating;
        movie_review.description = description;

        Ok(())
    }
```


### 添加 `add_comment`

- 创建 `add_comment` 指令
- 设置 `movie_comment` 数据
- 通过 `CPI` 给 `mintTo` 指令，将代币铸造给审核者

```rust
pub fn add_comment(ctx: Context<AddComment>, comment: String) -> Result<()> {
        msg!("已创建评论账户");
        msg!("评论：{}", comment);

        let movie_comment = &mut ctx.accounts.movie_comment;
        let movie_comment_counter = &mut ctx.accounts.movie_comment_counter;

        movie_comment.review = ctx.accounts.movie_review.key();
        movie_comment.commenter = ctx.accounts.initializer.key();
        movie_comment.comment = comment;
        movie_comment.count = movie_comment_counter.counter;

        movie_comment_counter.counter += 1;

        let seeds = &["mint".as_bytes(), &[*ctx.bumps.get("reward_mint").unwrap()]];

        let signer = [&seeds[..]];

        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            token::MintTo {
                mint: ctx.accounts.reward_mint.to_account_info(),
                to: ctx.accounts.token_account.to_account_info(),
                authority: ctx.accounts.reward_mint.to_account_info(),
            },
            &signer,
        );

        token::mint_to(cpi_ctx, 5000000)?;
        msg!("已铸造代币");

        Ok(())
    }
```

### 添加 `AddComment` 上下文

- 初始化 `movie_comment`
- 使用 `init_if_needed` 来初始化令牌账户

```rust
#[derive(Accounts)]
#[instruction(comment: String)]
pub struct AddComment<'info> {
    #[account(
        init,
        seeds = [movie_review.key().as_ref(), &movie_comment_counter.counter.to_le_bytes()],
        bump,
        payer = initializer,
        space = 8 + 32 + 32 + 4 + comment.len() + 8
    )]
    pub movie_comment: Account<'info, MovieComment>,
    pub movie_review: Account<'info, MovieAccountState>,
    #[account(
        mut,
        seeds = ["counter".as_bytes(), movie_review.key().as_ref()],
        bump,
    )]
    pub movie_comment_counter: Account<'info, MovieCommentCounter>,
    #[account(mut,
        seeds = ["mint".as_bytes()],
        bump
    )]
    pub reward_mint: Account<'info, Mint>,
    #[account(
        init_if_needed,
        payer = initializer,
        associated_token::mint = reward_mint,
        associated_token::authority = initializer
    )]
    pub token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub initializer: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
}
```

## 构建，部署，测试

解决方案：[https://beta.solpg.io/6319c7bf77ea7f12846aee87](https://beta.solpg.io/6319c7bf77ea7f12846aee87)

如果你使用自己的编辑器，你必须在 `mpl-token-metadata` 的 `Cargo.toml` 中添加 `features = ["no-entrypoint"]`。

否则，将会出现以下错误：`the #[global_allocator] in this crate conflicts with global allocator in: mpl_token_metadata`。

- 构建和部署
- 使用 `SolPG` 进行测试
