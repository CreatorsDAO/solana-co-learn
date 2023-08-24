---
sidebar_position: 103
sidebar_label: 使用Switchboard进行随机化战利品
sidebar_class_name: green
---

# 使用Switchboard进行随机化战利品

现在我们将深入探讨简单战利品箱的实现解决方案。我们会创建一个新程序，用于创建战利品箱并从中获取物品。

我们将审查的解决方案代码位于`Anchor NFT Staking`存储库的`solution-naive-loot-boxes`分支之一。

我再次强调，建议你自行尝试操作，而不是直接复制粘贴解决方案代码。

在programs目录中，你可以使用命令`anchor new <program-name>`来创建一个新程序，我们将其称为`lootbox-program`。

如果你仔细观察，`Anchor.toml`文件中`nft-staking`程序的ID已经变化了，我们还新增了一个loot box程序的ID。你需要在自己的端更新这两个ID。

首先，让我们回顾一下对[原始质押计划](https://github.com/Unboxed-Software/anchor-nft-staking-program/blob/solution-naive-loot-boxes/programs/anchor-nft-staking/src/lib.rs?utm_source=buildspace.so&utm_medium=buildspace_project)所作的修改。

如果你向下滚动到`UserStakeInfo`对象，你会发现我们添加了`total_earned`字段。它会跟踪用户的质押旅程，随着时间的推移，他们将赚取更多的奖励，并且在达到新的里程碑时，将获得更多的战利品箱物品。

同样相关的是`redeem_amount`。

首先，你会注意到有些注释被注释掉了，这仅是为了确保我们有足够的令牌进行测试。在测试时，请确保正确地注释/取消注释代码。

往下滚动一点，你会看到这一行新添加的内容。

```rust
ctx.accounts.stake_state.total_earned += redeem_amount as u64;
```

这是一种跟踪总收益的方法，从`0`开始，然后你添加已兑换的金额，这将成为新的总收益。

在下面的解除质押功能中，你还会发现测试说明和赎回金额都发生了变化。

最后，在这个文件中还有一个最后的更改。如果你的程序与我的完全相同，当我们运行它时，由于添加了这个新字段，我们可能会在堆栈中耗尽空间。我选择了一个随机账户，并在其周围放置了一个盒子，确保它被分配到堆中而不是栈中，以解决这个空间问题。你可以在用户的`stake ATA`上进行操作，或者选择任何其他账户。

```rust
pub user_stake_ata: Box<Account<'info, TokenAccount>>,
```

好的，让我们进入新的战利品箱计划的文件。

在`Cargo.toml`中，你会注意到我们为我们原始的锚定NFT质押程序添加了一个新的依赖项。

```toml
[dependencies]
anchor-lang = { version="0.25.0", features=["init-if-needed"] }
anchor-spl = "0.25.0"
anchor-nft-staking = { path = "../anchor-nft-staking", features = ["cpi"] }
```

现在让我们进入主要的[战利品箱程序文件](https://github.com/Unboxed-Software/anchor-nft-staking-program/blob/solution-naive-loot-boxes/programs/lootbox-program/src/lib.rs?utm_source=buildspace.so&utm_medium=buildspace_project)。

在使用语句中，你会注意到我们现在导入了锚定NFT质押，这样我们就可以检查总收益字段了。

```rust
use anchor_lang::prelude::*;
use anchor_nft_staking::UserStakeInfo;
use anchor_spl::token;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Burn, Mint, MintTo, Token, TokenAccount},
};
```

这里，我们只有两个指令，`open_lootbox`和`retrieve_item_from_lootbox`。有两个指令的原因是，当你请求“给我一个随机的战利品”时，程序必须决定要铸造和赠送的所有可能物品，客户端必须传入所有可能的铸造账户。这使程序变得不那么灵活，并增加了检查一堆不同账户以确保有选项的开销，对客户端来说也非常麻烦。因此，我们创建了一个用于打开战利品箱的指令，基本上是在所有可能的铸造选项中给我一个。我们还选择了这个地方作为支付的地方，这是我们将烧毁`BLD`代币的地方。至于第二个指令，在这一点上，客户端知道他们将获得哪个铸造物品，并可以传入该信息，然后我们可以从中铸造。

首先，让我们打开战利品箱，看看我们需要的账号。

```rust
#[derive(Accounts)]
pub struct OpenLootbox<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        init_if_needed,
        payer = user,
        space = std::mem::size_of::<LootboxPointer>() + 8,
        seeds=["lootbox".as_bytes(), user.key().as_ref()],
        bump
    )]
    pub lootbox_pointer: Account<'info, LootboxPointer>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    // Swap the next two lines out between prod/testing
    // #[account(mut)]
    #[account(
        mut,
        address="6YR1nuLqkk8VC1v42xJaPKvE9X9pnuqVAvthFUSDsMUL".parse::<Pubkey>().unwrap()
    )]
    pub stake_mint: Account<'info, Mint>,
    #[account(
        mut,
        associated_token::mint=stake_mint,
        associated_token::authority=user
    )]
    pub stake_mint_ata: Account<'info, TokenAccount>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    #[account(
        constraint=stake_state.user_pubkey==user.key(),
    )]
    pub stake_state: Account<'info, UserStakeInfo>,
}
```

你会发现一个名为`lootbox_pointer`的新元素，这是一种全新的类型。它包括一个薄荷属性、一个布尔值用来表示是否已被领取，以及一个`is_initialized`属性。

这是一个与用户关联的`PDA（Program-derived address）`，因此其种子是“战利品箱”和用户。通过这样做，当我们选中一个薄荷时，我们不将数据返回给客户端，而是存储在某个账户中。因此，这是一个用户可以查询并检索物品的`PDA`。

此外，需要注意的是，在某行代码的开头有一个“`Swap`”注释行。为了使测试正常运行，需要取消这些行的注释，并注释掉其他包含心智地址的`stake_mint`属性行。

下面的`Rust`代码展示了`LootboxPointer`结构：

```rust
#[account]
pub struct LootboxPointer {
    mint: Pubkey,
    claimed: bool,
    is_initialized: bool,
}
```

接下来，我们来详细了解这个功能。首先，我们要验证它是否是一个有效的战利品箱。

用户输入一个盒子号码，然后程序会运行一个无限循环。在每次迭代中，如果`BLD`令牌的数量过低，我们会返回错误。其他两种可能的路径是：要么将`loot_box`号码加倍，要么如果在`loot_box`号码和`box_number`之间找到匹配，我们要求`stake_state` `PDAs`的总收益不少于传入的`box_number`。简而言之，你必须赚得比盒子号码更多。

以下是打开战利品箱的函数：

```rust
pub fn open_lootbox(ctx: Context<OpenLootbox>, box_number: u64) -> Result<()> {
    let mut loot_box = 10;
    loop {
        if loot_box > box_number {
            return err!(LootboxError::InvalidLootbox);
        }

        if loot_box == box_number {
            require!(
                ctx.accounts.stake_state.total_earned >= box_number,
                LootboxError::InvalidLootbox
            );
            break;
        } else {
            loot_box = loot_box * 2;
        }
    }

    require!(
        !ctx.accounts.lootbox_pointer.is_initialized || ctx.accounts.lootbox_pointer.claimed,
        LootboxError::InvalidLootbox
    );
}
```

然后我们继续进行代币销毁，销毁与盒子编号所需数量相对应的代币。

```rust
token::burn(
    CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        Burn {
            mint: ctx.accounts.stake_mint.to_account_info(),
            from: ctx.accounts.stake_mint_ata.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        },
    ),
    box_number * u64::pow(10, 2),
)?;
```


该函数还涉及代币销毁操作，即销毁与盒子编号所需数量相匹配的代币。之后，我们将描述可用装备。当前是硬编码的，这是客户端代码中`cache.json`文件的数据，但有更灵活的方式来实现。


```rust
let available_gear: Vec<Pubkey> = vec![
        "DQmrQJkErmfe6a1fD2hPwdLSnawzkdyrKfSUmd6vkC89"
            .parse::<Pubkey>()
            .unwrap(),
        "A26dg2NBfGgU6gpFPfsiLpxwsV13ZKiD58zgjeQvuad"
            .parse::<Pubkey>()
            .unwrap(),
        "GxR5UVvQDRwB19bCsB1wJh6RtLRZUbEAigtgeAsm6J7N"
            .parse::<Pubkey>()
            .unwrap(),
        "3rL2p6LsGyHVn3iwQQYV9bBmchxMHYPice6ntp7Qw8Pa"
            .parse::<Pubkey>()
            .unwrap(),
        "73JnegAtAWHmBYL7pipcSTpQkkAx77pqCQaEys2Qmrb2"
            .parse::<Pubkey>()
            .unwrap(),
    ];
```

随后的代码片段展示了一种非安全的伪随机方法，获取当前时间（以秒为单位），然后对5取模，以确定我们应该选择这`5`个物品中的哪一个。一旦选择，我们将其分配给战利品盒指针。

```rust
let clock = Clock::get()?;
    let i: usize = (clock.unix_timestamp % 5).try_into().unwrap();
    // Add in randomness later for selecting mint
    let mint = available_gear[i];
    ctx.accounts.lootbox_pointer.mint = mint;
    ctx.accounts.lootbox_pointer.claimed = false;
    ctx.accounts.lootbox_pointer.is_initialized = true;

    Ok(())
}
```

我们将在后续版本中处理真正的随机性，但目前这个版本已经足够。我们还将添加一个检查，以确保用户不能反复打开战利品箱，以获取他们想要的物品。现在，只要用户打开战利品箱，他们就可以看到其中的物品。我们可以检查战利品箱指针是否已初始化，如果没有，则无问题，可以继续进行。虽然每次尝试都需要付费，但是否将其作为功能由你决定。

好了，现在让我们转到检索指令并查看所需的账户。

```rust
#[derive(Accounts)]
pub struct RetrieveItem<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        seeds=["lootbox".as_bytes(), user.key().as_ref()],
        bump,
        constraint=lootbox_pointer.is_initialized
    )]
    pub lootbox_pointer: Account<'info, LootboxPointer>,
    #[account(
        mut,
        constraint=lootbox_pointer.mint==mint.key()
    )]
    pub mint: Account<'info, Mint>,
    #[account(
        init_if_needed,
        payer=user,
        associated_token::mint=mint,
        associated_token::authority=user
    )]
    pub user_gear_ata: Account<'info, TokenAccount>,
    /// CHECK: Mint authority - not used as account
    #[account(
        seeds=["mint".as_bytes()],
        bump
    )]
    pub mint_authority: UncheckedAccount<'info>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}
```

有几件事情我们需要明确。"`mint account`" 可以理解为他们所要求的装备的存储账户。"`mint authority`" 是我们在客户端脚本中分配的用于控制铸币的程序派生账户（`PDA`）。

关于这部分的逻辑，首先，我们需要确保战利品箱指针还未被认领。

```rust
pub fn retrieve_item_from_lootbox(ctx: Context<RetrieveItem>) -> Result<()> {
    require!(
        !ctx.accounts.lootbox_pointer.claimed,
        LootboxError::AlreadyClaimed
    );
```

接下来，我们将战利品铸造给你。

```rust
token::mint_to(
       CpiContext::new_with_signer(
           ctx.accounts.token_program.to_account_info(),
           MintTo {
               mint: ctx.accounts.mint.to_account_info(),
               to: ctx.accounts.user_gear_ata.to_account_info(),
               authority: ctx.accounts.mint_authority.to_account_info(),
           },
           &[&[
               b"mint".as_ref(),
               &[*ctx.bumps.get("mint_authority").unwrap()],
           ]],
       ),
       1,
   )?;
```

最后，我们将认领标记设为真实。

```rust
    ctx.accounts.lootbox_pointer.claimed = true;

   Ok(())
}
```

别忘了查看我们在文件底部创建的自定义错误代码。

```rust
#[error_code]
enum LootboxError {
    #[msg("Mint already claimed")]
    AlreadyClaimed,

    #[msg("Haven't staked long enough for this loot box or invalid loot box number")]
    InvalidLootbox,
}
```

这便是流程。如果你还没尝试实施这个，那么尝试一下，并进行一些测试。尽量自己独立完成。

在这个[文件](https://github.com/Unboxed-Software/anchor-nft-staking-program/blob/solution-naive-loot-boxes/tests/anchor-nft-staking.ts?utm_source=buildspace.so&utm_medium=buildspace_project)中，你可以找到相关测试。你会注意到我们添加了两个测试，分别是“随机选择一种铸币口味”和“制造所选装备”。请注意在我们标注“`Swap`”的地方，更改代码行以使测试正常工作。然后运行测试，它们应该都会按预期运行。

## 利用Switchboard的验证功能来随机分配战利品🔀

### 任务

既然你已经成功实现了简单的战利品箱，现在我们可以考虑通过`Switchboard`````````````````````来增强随机性的真实性（虽然从技术上说仍是伪随机，但比之前的随机性要好几个数量级）。

`Switchboard`是建立在`Solana`上的分散式预言机网络。预言机是区块链与现实世界之间的连接桥梁，提供了在多个来源中数据达成共识的机制。在随机性方面，这意味着提供了一个可验证的伪随机结果，没有预言机则无法获得。这对于实现不能“作弊”的战利品箱至关重要。

与`Oracle`交互是一项涵盖我们在整个课程中所学的所有内容的综合练习。通常包括以下几个步骤：

- 与`Oracle`程序进行客户端设置
- 使用你自己的程序初始化与`Oracle`特定的账户（通常是`PDAs`）
- 你的程序向`Oracle`程序发出`CPI`调用，请求特定数据，例如，可验证的随机缓冲区
- `Oracle`可以调用你的程序以提供所请求信息的指令
- 执行你的程序对所请求数据进行操作的指令

### 文档

首先，`Switchboard`的文档在`Web3`上仍然相对稀缺，但你可以在[此处](https://switchboard.xyz/)阅读关于`Switchboard`可验证随机性的简要概述。然后你应该深入他们的集成文档。

你可能还会有很多疑问。这没关系，不要感到气馁。这是一个培养自主解决问题能力的好机会。

接下来你可以查看他们的逐步指南，了解获取随机性的过程。这会引导你了解如何设置`Switchboard`环境、初始化请求客户端、发出`CPI`指令、在你的程序中添加`Switchboard`可以调用的指令来提供随机性等步骤。

**最后的备注**

这个任务可能具有挑战性。这是故意设计的，是对过去六周努力理解`Solana`的工作的总结。我们还提供了一些关于如何在战利品箱计划中使用`Switchboard`的视频概览。

你可以随时观看这些视频。通常，我会建议你先完成一些独立工作，但由于`Switchboard`的文档相对稀缺，所以尽早查看步骤说明可能会有所帮助。然而，我想提醒你，不要仅仅复制粘贴我的解决方案。相反，观看步骤说明后，尽量自己重新创建类似的内容。如果你准备在我们发布步骤说明之前参考解决方案代码，你可以随时查看[这里](https://github.com/Unboxed-Software/anchor-nft-staking-program/tree/solution-randomize-loot?utm_source=buildspace.so&utm_medium=buildspace_project)的 `solution-randomize-loot branch`。

你可能需要超过本周结束前的时间来完成这项任务。这是正常的，也可能需要更多的时间来解决问题。没有关系
