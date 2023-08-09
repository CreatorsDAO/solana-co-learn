
---
sidebar_position: 85
sidebar_label: 🔀 Anchor的CPIs
sidebar_class_name: green
---

# 🔀 Anchor的CPIs

现在我们可以通过添加CPI来提升等级。

回想一下，CPI是使用 invoke 和 invoke_signed 制作的。

Anchor还提供了一种制作CPI的格式。使用这种格式需要访问所调用程序的CPI模块。常见的程序有一个你可以使用的包，例如 anchor_spl 用于令牌程序。否则，你将需要使用所调用程序的源代码或已发布的IDL来生成CPI模块。

如果没有可用的CPI模块，您仍然可以直接在指令中使用 invoke 和 invoke_signed 。就像锚定指令需要 Context 类型一样，锚定CPI使用 CpiContext 。

CpiContext提供了指令所需的所有账户和种子。当没有PDA签名者时，使用CpiContext::new。

```rust
CpiContext::new(cpi_program, cpi_accounts)
```

当需要一个PDA作为签名者时，使用 CpiContext::new_with_signer 。

```rust
CpiContext::new_with_signer(cpi_program, cpi_accounts, seeds)
```

- accounts - 账户列表
- remaining_accounts - 如果有的话
- program - 程序正在调用CPI
- signer_seeds - 如果需要使用PDA签署CPI

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

当不需要 signer_seeds 时使用 CpiContext::new （不使用PDA签名）。

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

CpiContext::new_with_signer 用于种子在PDA上签名。

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

anchor_spl 包含一个 token 模块，用于简化创建CPI到令牌程序的过程。

Structs 这是每个相应的令牌程序指令所需的账户列表。Functions 这是每个相应指令的CPI。

例如，这里MintTo是所需的账户：

```rust
#[derive(Accounts)]
pub struct MintTo<'info> {
    pub mint: AccountInfo<'info>,
    pub to: AccountInfo<'info>,
    pub authority: AccountInfo<'info>,
}
```

让我们也来看看`mint_to`引擎的内部。

它使用 CpiContext 来构建一个CPI到 mint_to 指令。它使用 invoke_signed 来制作CPI。

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

- mint_to CPI

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

重构这个我们得到：

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

## ❌ 锚点错误

错误可以分为以下几种类型：

- anchor框架从其自身代码内部返回的内部错误
- 用户（你！）可以返回的自定义错误

AnchorErrors提供了各种信息，例如：

- 错误名称和编号
- 代码中抛出锚的位置
- 违反约束条件的账户

最终，所有的程序都会返回相同的错误：[ProgramError](https://docs.rs/solana-program/latest/solana_program/program_error/enum.ProgramError.html?utm_source=buildspace.so&utm_medium=buildspace_project)。

Anchor有许多不同的内部错误代码。这些代码不是为用户使用的，但研究参考资料以了解代码和其原因之间的映射是很有用的。

自定义错误代码编号从自定义错误偏移量开始。

您可以使用 error_code 属性为您的程序添加独特的错误。只需将其添加到一个您选择的枚举中即可。然后，您可以将枚举的变体用作程序中的错误。

此外，您可以使用 msg 为各个变体添加消息。如果发生错误，客户端将显示此错误消息。要实际抛出错误，请使用 err! 或 error! 宏。这些宏会将文件和行信息添加到错误中，然后由anchor记录。

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
    #[msg("MyAccount may only hold data below 100")]
    DataTooLarge
}
```

您可以使用 require 宏来简化编写错误。上面的代码可以简化为这样（请注意 >= 翻转为 < ）。

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
    #[msg("MyAccount may only hold data below 100")]
    DataTooLarge
}
```

### constraint 约束

如果账户不存在，则初始化一个账户。如果账户已存在，则仍需检查其他限制条件。

如果您使用自己的编辑器，您必须在 anchor-lang 的 Cargo.toml 中添加 features = ["init-if-needed"] 。


e.g. anchor-lang = {version = "0.26.0", features = ["init-if-needed"]} .

例如，一个关联的令牌账户：

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

这是 init_if_needed 生成的代码（来自 anchor expand 命令的代码片段）：

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
