---
sidebar_position: 85
sidebar_label: 🔀 Anchor的CPIs
sidebar_class_name: green
---

# 🔀 Anchor的CPIs

现在我们可以通过添加`CPI`（跨程序调用）来提升我们的代码水平。

首先回顾一下，`CPI`是通过使用`invoke`和`invoke_signed`方法来制作的。

`Anchor`框架还提供了一种特殊的`CPI`制作格式。要使用这种格式，你需要访问所调用程序的`CPI`模块。一些常见的程序可能会有现成的包供你使用，例如`anchor_spl`，这可以用于令牌程序。否则，你将需要使用所调用程序的源代码或已发布的`IDL`（接口定义语言）来生成CPI模块。

如果没有现成的CPI模块，你仍然可以直接在指令中使用`invoke`和`invoke_signed`方法。正如`Anchor`指令需要`Context`类型一样，`Anchor CPI`则使用`CpiContext`类型。

`CpiContext`提供了执行指令所需的所有账户和种子信息。当不需要`PDA`（程序衍生账户）签名者时，使用`CpiContext::new`：

```rust
CpiContext::new(cpi_program, cpi_accounts)
```

当需要一个PDA作为签名者时，使用`CpiContext::new_with_signer`：

```rust
CpiContext::new_with_signer(cpi_program, cpi_accounts, seeds)
```

- `accounts` - 账户列表
- `remaining_accounts` - 如果有的话
- `program` - 正在调用CPI的程序
- `signer_seeds` - 如果需要使用PDA签署CPI

```rust
pub struct CpiContext<'a, 'b, 'c, 'info, T>
where
    T: ToAccountMetas + ToAccountInfos<'info>,
{
    pub accounts: T,
    pub remaining_accounts: Vec<AccountInfo<'info>>,
    pub program: AccountInfo<'info>,
    pub signer_seeds: &'a [&'b [&'c [u8]]],
}
```

当不需要`signer_seeds`时使用`CpiContext::new`（不使用PDA签名）。

```rust
pub fn new(
	program: AccountInfo<'info>,
	accounts: T
    ) -> Self {
        Self {
            accounts,
            program,
            remaining_accounts: Vec::new(),
            signer_seeds: &[],
        }
    }
```

`CpiContext::new_with_signer`用于在`PDA`上用种子签名。

```rust
pub fn new_with_signer(
        program: AccountInfo<'info>,
        accounts: T,
        signer_seeds: &'a [&'b [&'c [u8]]],
    ) -> Self {
        Self {
            accounts,
            program,
            signer_seeds,
            remaining_accounts: Vec::new(),
        }
    }
```

`anchor_spl`包还包括了一个`token`模块，用于简化创建到令牌程序的CPI的过程。

在这里，“`Structs`”指的是每个相应的令牌程序指令所需的账户列表。“`Functions`”指的是每个相应指令的`CPI`。

例如，下面的`MintTo`就是所需的账户：

```rust
#[derive(Accounts)]
pub struct MintTo<'info> {
    pub mint: AccountInfo<'info>,
    pub to: AccountInfo<'info>,
    pub authority: AccountInfo<'info>,
}
```

我们也可以深入了解一下`mint_to`方法的内部工作原理。

它使用`CpiContext`来构建一个到`mint_to`指令的`CPI`，并使用`invoke_signed`来执行`CPI`。

```rust
pub fn mint_to<'a, 'b, 'c, 'info>(
    ctx: CpiContext<'a, 'b, 'c, 'info, MintTo<'info>>,
    amount: u64,
) -> Result<()> {
    let ix = spl_token::instruction::mint_to(
        &spl_token::ID,
        ctx.accounts.mint.key,
        ctx.accounts.to.key,
        ctx.accounts.authority.key,
        &[],
        amount,
    )?;
    solana_program::program::invoke_signed(
        &ix,
        &[
            ctx.accounts.to.clone(),
            ctx.accounts.mint.clone(),
            ctx.accounts.authority.clone(),
        ],
        ctx.signer_seeds,
    )
    .map_err(Into::into)
}
```

例如：

- 使用 `mint_to CPI` 来铸造代币

```rust
let auth_bump = *ctx.bumps.get("mint_authority").unwrap();
let seeds = &[
    b"mint".as_ref(),
    &[auth_bump],
];
let signer = &[&seeds[..]];

let cpi_program = ctx.accounts.token_program.to_account_info();

let cpi_accounts = MintTo {
    mint: ctx.accounts.token_mint.to_account_info(),
    to: ctx.accounts.token_account.to_account_info(),
    authority: ctx.accounts.mint_authority.to_account_info()
};

let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);

token::mint_to(cpi_ctx, amount)?;
```

我们可以重构这个代码段，得到：

```rust
token::mint_to(
    CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        token::MintTo {
            mint: ctx.accounts.mint_account.to_account_info(),
            to: ctx.accounts.token_account.to_account_info(),
            authority: ctx.accounts.mint_authority.to_account_info(),
        },
        &[&[
            b"mint",
            &[*ctx.bumps.get("mint_authority").unwrap()],
        ]]
    ),
    amount,
)?;
```

## ❌ Anchor 错误处理

错误可以分为以下几种类型：

- 来自 `Anchor` 框架自身代码的内部错误
- 用户（也就是你！）定义的自定义错误

`AnchorErrors` 能提供许多有关错误的信息，例如：

- 错误的名称和编号
- 错误在代码中的位置
- 违反的约束条件和相关账户

最后，所有程序会返回一个通用的错误：[ProgramError](https://docs.rs/solana-program/latest/solana_program/program_error/enum.ProgramError.html?utm_source=buildspace.so&utm_medium=buildspace_project)。

`Anchor` 有许多不同的内部错误代码。虽然这些代码不是为用户所设计，但通过研究可以了解代码和其背后原因的关联，这对理解很有帮助。

自定义错误代码的编号将从自定义错误偏移量开始。

你可以使用 `error_code` 属性为你的程序定义独特的错误。只需将其添加到所选枚举中即可。然后，你可以在程序中将枚举的变体用作错误。

此外，你还可以使用 `msg` 为各个变体定义消息。如果发生错误，客户端将显示此错误消息。要实际触发错误，请使用 `err!` 或 `error!` 宏。这些宏会将文件和行信息添加到错误中，然后由 `anchor` 记录。

```rust
#[program]
mod hello_anchor {
    use super::*;
    pub fn set_data(ctx: Context<SetData>, data: MyAccount) -> Result<()> {
        if data.data >= 100 {
            return err!(MyError::DataTooLarge);
        }
        ctx.accounts.my_account.set_inner(data);
        Ok(())
    }
}

#[error_code]
pub enum MyError {
    #[msg("MyAccount 的数据只能小于 100")]
    DataTooLarge
}
```

你还可以使用 `require` 宏来简化错误的编写。上面的代码可以简化为下面的样子（注意 `>=` 翻转为 `<` ）。

```rust
#[program]
mod hello_anchor {
    use super::*;
    pub fn set_data(ctx: Context<SetData>, data: MyAccount) -> Result<()> {
        require!(data.data < 100, MyError::DataTooLarge);
        ctx.accounts.my_account.set_inner(data);
        Ok(())
    }
}

#[error_code]
pub enum MyError {
    #[msg("MyAccount 的数据只能小于 100")]
    DataTooLarge
}
```

### `constraint` 约束条件

如果账户不存在，系统将初始化一个账户。如果账户已存在，仍需检查其他的限制条件。

如果你在使用自定义的编辑器，请确保在 `anchor-lang` 的 `Cargo.toml` 文件中添加了 `features = ["init-if-needed"]` 特性。

例如：`anchor-lang = {version = "0.26.0", features = ["init-if-needed"]}`。

下面是一个关联令牌账户的示例代码：

```rust
#[program]
mod example {
    use super::*;
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init_if_needed,
        payer = payer,
        associated_token::mint = mint,
        associated_token::authority = payer
    )]
    pub token_account: Account<'info, TokenAccount>,
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
}
```

以下是 `init_if_needed` 生成的代码（这段代码片段来自 `anchor expand` 命令）：

```rust
let token_account: anchor_lang::accounts::account::Account<TokenAccount> = {
    if !true
    || AsRef::<AccountInfo>::as_ref(&token_account).owner
    == &anchor_lang::solana_program::system_program::ID
    {
        let payer = payer.to_account_info();
        let cpi_program = associated_token_program.to_account_info();
        let cpi_accounts = anchor_spl::associated_token::Create {
            payer: payer.to_account_info(),
            associated_token: token_account.to_account_info(),
            authority: payer.to_account_info(),
            mint: mint.to_account_info(),
            system_program: system_program.to_account_info(),
            token_program: token_program.to_account_info(),
            rent: rent.to_account_info(),
        };
        let cpi_ctx = anchor_lang::context::CpiContext::new(
            cpi_program,
            cpi_accounts,
        );
        anchor_spl::associated_token::create(cpi_ctx)?;
    }
  ...
}
```

通过这个约束条件，可以确保在初始化时根据需要创建关联的令牌账户，使得整个流程更加自动化和智能。
