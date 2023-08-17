---
sidebar_position: 84
sidebar_label: 使用Anchor PDA构建
sidebar_class_name: green
---

# 使用Anchor PDA构建

在我们继续讨论`CPI`之前，让我们向世界展示一下这些`PDA`的功能。🎸

我们将使用`Anchor`框架创建一个电影评论程序。

该程序将允许用户：
- 使用`PDA`初始化一个新的电影评论账户，以存储评论
- 更新现有的电影评论账户的内容
- 关闭现有的电影评论账户

## 设置

请访问[https://beta.solpg.io/](https://beta.solpg.io/?utm_source=buildspace.so&utm_medium=buildspace_project)，如果你还没有SolPG钱包，请创建一个，并将[lib.rs](https://lib.rs/?utm_source=buildspace.so&utm_medium=buildspace_project)中的默认代码替换为：

```rust
use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod movie_review {
    use super::*;

}
```

## 🎥 MovieAccountState

我们首先要做的是定义`State`账户。

```rust
use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod movie_review {
    use super::*;

}

#[account]
pub struct MovieAccountState {
    pub reviewer: Pubkey,    // 32
    pub rating: u8,          // 1
    pub title: String,       // 4 + len()
    pub description: String, // 4 + len()
}
```

每个电影评论账户将存储：

- `reviewer` - 用户创建评论
- `rating` - 电影评分
- `title` - 电影标题
- `description` - 评论的内容

到目前为止非常简单明了！

## 🎬 添加电影评论

感谢 `Anchor`，可以跳过所有验证和安全性，直接添加 `add_move_review` 功能：

```rust
#[program]
pub mod movie_review{
    use super::*;

    pub fn add_movie_review(
        ctx: Context<AddMovieReview>,
        title: String,
        description: String,
        rating: u8,
    ) -> Result<()> {
        msg!("Movie Review Account Created");
        msg!("Title: {}", title);
        msg!("Description: {}", description);
        msg!("Rating: {}", rating);

        let movie_review = &mut ctx.accounts.movie_review;
        movie_review.reviewer = ctx.accounts.initializer.key();
        movie_review.title = title;
        movie_review.rating = rating;
        movie_review.description = description;
        Ok(())
    }
}

...
```

这一切应该都很熟悉——这是我们构建的本地电影评论程序的简洁版本。

让我们为此添加 `Context` ：

```rust
#[program]
pub mod movie_review {
    use super::*;

		...
}

#[derive(Accounts)]
#[instruction(title:String, description:String)]
pub struct AddMovieReview<'info> {
    #[account(
        init,
        seeds = [title.as_bytes(), initializer.key().as_ref()],
        bump,
        payer = initializer,
        space = 8 + 32 + 1 + 4 + title.len() + 4 + description.len()
    )]
    pub movie_review: Account<'info, MovieAccountState>,
    #[account(mut)]
    pub initializer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

...
```

再次，我们正在以与本地相同的方式进行操作，但借助`Anchor`的魔力。

我们正在使用两个 `seeds` 初始化一个新的 `movie_review` 账户

- `title` - 指令数据中的电影标题
- `initializer.key()` - 创建电影评论的 `initializer` 的公钥


我们也正在根据 `space` 账户类型的结构，将资金分配到新账户中。

## 🎞 更新电影评论

不必测试这个小程序，我们可以直接完成它！下面是更新函数的样子：

```rust
#[program]
pub mod movie_review {
    use super::*;

		...

    pub fn update_movie_review(
        ctx: Context<UpdateMovieReview>,
        title: String,
        description: String,
        rating: u8,
    ) -> Result<()> {
        msg!("Updating Movie Review Account");
        msg!("Title: {}", title);
        msg!("Description: {}", description);
        msg!("Rating: {}", rating);

        let movie_review = &mut ctx.accounts.movie_review;
        movie_review.rating = rating;
        movie_review.description = description;

        Ok(())
    }

}

...
```

数据参数与 `add_movie_review` 相同。这里改变的主要是我们传入的 `Context` 。让我们来定义它：

```rust
#[program]
pub mod movie_review {
    use super::*;

		...
}

#[derive(Accounts)]
#[instruction(title:String, description:String)]
pub struct UpdateMovieReview<'info> {
    #[account(
        mut,
        seeds = [title.as_bytes(), initializer.key().as_ref()],
        bump,
        realloc = 8 + 32 + 1 + 4 + title.len() + 4 + description.len(),
        realloc::payer = initializer,
        realloc::zero = true,
    )]
    pub movie_review: Account<'info, MovieAccountState>,
    #[account(mut)]
    pub initializer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

...
```

我们使用 `seeds` 和 `bump` 约束来验证 `movie_review` 账户。由于占用的空间可能会发生变化，我们使用 `realloc` 约束让`Anchor`根据更新的描述长度来处理账户空间和租金的重新分配。

`realloc::payer` 约束规定了所需的额外`lamports`将来自或发送到初始化账户。

`realloc::zero` 约束被设置为 `true` ，因为 `movie_review` 账户可能会多次更新，无论是缩小还是扩大分配给该账户的空间。

## ❌ 电影评论关闭

这里的最后一部分是实现 `close` 指令来关闭一个已存在的 `movie_review` 账户。我们只需要一个 `Context` 类型的 `Close` ，不需要任何数据！

```rust
#[program]
pub mod movie_review {
    use super::*;

		...

    pub fn close(_ctx: Context<Close>) -> Result<()> {
        Ok(())
    }

}

...
```

And the `Context` for this:

```rust
#[program]
pub mod movie_review {
    use super::*;

		...
}

#[derive(Accounts)]
pub struct Close<'info> {
    #[account(mut, close = reviewer, has_one = reviewer)]
    movie_review: Account<'info, MovieAccountState>,
    #[account(mut)]
    reviewer: Signer<'info>,
}

...
```
我们使用 `close` 约束来指定我们正在关闭 `movie_review` 账户，并且租金应退还到 `reviewer` 账户。

`has_one` 约束用于限制关闭账户 - `reviewer` 账户必须与电影评论账户上的 `reviewer` 匹配。

我们都完成了！试一下，它会像旧的本地电影评论程序一样运行。如果出现问题，你可以与[这里](https://beta.solpg.io/631b39c677ea7f12846aee8c?utm_source=buildspace.so&utm_medium=buildspace_project)的解决方案代码进行比较 :)

## 🚢 Ship 挑战 (这个和build with solana Framework的内容重复了)

现在轮到你独立构建一些东西了。由于我们从非常简单的程序开始，你的程序将几乎与我们刚刚创建的程序完全相同。尽量达到能够独立编写代码而不参考之前的代码的程度，所以请尽量不要在这里复制粘贴。

- 编写一个新程序，初始化一个 `counter` 账户，并使用传入指令数据参数设置 `count` 字段
- 执行 `initialize` ， `increment` 和 `decrement` 指令
- 按照我们在演示中所做的，为每个指令编写测试
- 使用 `anchor deploy` 来部署你的程序。如果你愿意，可以像之前一样编写一个脚本来发送交易到你新部署的程序，然后使用Solana Explorer查看程序日志。

像往常一样，对这些挑战充满创意，超越基本指示，如果你愿意的话，尽情享受吧！

如果可以的话，尽量独立完成这个任务！但如果遇到困难，可以参考[这个存储库](https://github.com/Unboxed-Software/anchor-counter-program/tree/solution-decrement?utm_source=buildspace.so&utm_medium=buildspace_project)的 `solution-decrement` 分支。
