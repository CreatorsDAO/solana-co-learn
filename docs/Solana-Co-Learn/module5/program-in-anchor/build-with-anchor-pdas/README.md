---
sidebar_position: 84
sidebar_label: 使用Anchor PDA构建
sidebar_class_name: green
---

# 使用Anchor PDA进行构建

在深入讨论`CPI`之前，让我们展示一下这些`PDA`的魅力吧！🎸

我们将利用`Anchor`框架创建一个电影评论程序。

该程序将让用户能够：
- 使用`PDA`初始化一个新的电影评论账户，用于存放评论
- 更新现有电影评论账户中的内容
- 关闭现有的电影评论账户

## 设置流程

请访问[https://beta.solpg.io/](https://beta.solpg.io/?utm_source=buildspace.so&utm_medium=buildspace_project)，如果你还没有SolPG钱包，请按照提示创建一个。然后，将[lib.rs](https://lib.rs/?utm_source=buildspace.so&utm_medium=buildspace_project)中的默认代码替换为以下内容：

```rust
use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod movie_review {
    use super::*;

}
```

## 🎥 电影账户状态（MovieAccountState）

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
    pub reviewer: Pubkey,    // 评论者
    pub rating: u8,          // 评分
    pub title: String,       // 标题
    pub description: String, // 描述
}
```

每个电影评论账户将包含以下信息：

- `reviewer` - 进行评论的用户
- `rating` - 对电影的评分
- `title` - 电影的标题
- `description` - 评论的具体内容

到现在为止，一切都相当简洁明了！

## 🎬 添加电影评论

感谢 `Anchor` 的便利性，我们可以轻松跳过所有的验证和安全检查，直接添加`add_movie_review`功能：

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
        msg!("创建了电影评论账户");
        msg!("标题：{}", title);
        msg!("描述：{}", description);
        msg!("评分：{}", rating);

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

这些操作对你应该不陌生——这只是我们构建的本地电影评论程序的精简版。

现在，让我们为此添加`Context`：

```rust
#[program]
pub mod movie_review {
    use super::*;

		...
}

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
    #[account(mut)]
    pub initializer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

...
```

再次强调，我们正以与本地操作完全相同的方式进行操作，但这次我们可以借助`Anchor`的力量。

我们正在使用两个`seeds`来初始化一个新的`movie_review`账户：

- `title` - 指令数据中的电影标题
- `initializer.key()` - 创建电影评论的`initializer`的公钥

此外，我们还根据`space`账户类型的结构将资金分配到新账户中。

## 🎞 更新电影评论

没有必要对这个小程序进行测试，我们可以直接完成它！下面是更新函数的代码示例：

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
        msg!("正在更新电影评论账户");
        msg!("标题：{}", title);
        msg!("描述：{}", description);
        msg!("评分：{}", rating);

        let movie_review = &mut ctx.accounts.movie_review;
        movie_review.rating = rating;
        movie_review.description = description;

        return Ok(());
    }

}

...
```

数据参数与`add_movie_review`相同，主要区别在于我们传入的`Context`。现在我们来定义它：

```rust
#[program]
pub mod movie_review {
    use super::*;

		...
}

#[derive(Accounts)]
#[instruction(title: String, description: String)]
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

我们使用`seeds`和`bump`约束来验证`movie_review`账户。由于可能会有空间的变化，所以我们使用了`realloc`约束，让`Anchor`根据更新后的描述长度来自动处理账户空间和租金的重新分配。

`realloc::payer`约束规定了所需的额外`lamports`将来自或发送到初始化账户。

`realloc::zero`约束被设置为`true`，这是因为`movie_review`账户可能会多次更新，无论是缩小还是扩大分配给该账户的空间都可以灵活应对。


## ❌ 关闭电影评论

最后一部分是实现`close`指令，用以关闭已存在的`movie_review`账户。我们只需要`Context`类型的`Close`，不需要其他任何数据！

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

关于这个的`Context`定义：

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

我们使用`close`约束来指明我们要关闭的是`movie_review`账户，并且租金应退还到`reviewer`账户。

`has_one`约束用于限制关闭账户操作 - `reviewer`账户必须与电影评论账户上的`reviewer`相匹配。

我们完成了！试一下，它应该会像之前的本地电影评论程序一样运行。如果有任何问题，你可以与[此处](https://beta.solpg.io/631b39c677ea7f12846aee8c?utm_source=buildspace.so&utm_medium=buildspace_project)的解决方案代码进行对比 :)

## 🚢 挑战（这部分内容和build with solana Framework的内容重复了）

现在轮到你亲自构建一些内容了。由于我们从一个非常简单的程序开始，你所创建的程序将与我们刚刚创建的程序几乎完全相同。请尽量不要在这里复制粘贴，努力达到能够独立编写代码的程度。

- 编写一个新程序，初始化一个`counter`账户，并使用传入指令数据参数来设置`count`字段。
- 执行`initialize`、`increment`和`decrement`指令。
- 按照我们在演示中的做法，为每个指令编写测试。
- 使用`anchor deploy`来部署你的程序。如果你愿意，你可以像之前那样编写一个脚本来发送交易到你新部署的程序，然后使用`Solana Explorer`来查看程序日志。

像往常一样，对这些挑战充满创意，超越基本指示，如果你愿意，可以发挥你的想象力！

如果可能的话，请尽量独立完成这个任务！但如果遇到困难，你可以参考[这个存储库](https://github.com/Unboxed-Software/anchor-counter-program/tree/solution-decrement?utm_source=buildspace.so&utm_medium=buildspace_project)的`solution-decrement`分支。
