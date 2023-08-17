---
sidebar_position: 91
sidebar_label:  🥩 使用Anchor进行质押
sidebar_class_name: green
---

# 🥩 使用Anchor进行质押

是时候将NFT质押计划和用户界面转换为`Anchor`了！你一直在努力开发的buildoor项目已经很棒了，但是如果将其转移到Anchor上，以后的工作会更简单。继续运用你所学的知识，完成以下任务：

- 使用`Anchor`从头开始重写程序。
- 增加一些可靠的测试覆盖率，以确保你不会让安全风险从中溜走
- 用`Anchor`方法构建器替换复杂的UI代码

你应该花一些时间独立尝试做这件事。这不是一项简单的任务，但你能行。如果几个小时后你感到困惑，可以随时观看我们解决方案的视频演示。

让我们来完成这个任务并检查已发货的产品。我们将完善我们一直在努力开发的质押计划，但不是添加新功能，而是将其全部替换为`Anchor`。

让我们通过运行 `anchor init anchor-nft-staking` 来创建一个新项目，或者选择一个你自己的名字。进入 `Anchor.toml` 文件，并将种子设置为 `true` ，集群设置为 `devnet` 。

然后跳转到 `/programs/anchor-nft-staking/Cargo.toml` ，添加以下依赖项。

```toml
anchor-lang = { version="0.25.0", features = ["init-if-needed"] }
anchor-spl = "0.25.0"
mpl-token-metadata = { version="1.4.1", features=["no-entrypoint"] }
```

好的，打开 `lib.rs` 文件，让我们构建基本的脚手架。

让我们添加以下导入，随着我们的进行，每个导入的必要性将变得清晰明了。

```rust
use anchor_lang::solana_program::program::invoke_signed;
use anchor_spl::token;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Approve, Mint, MintTo, Revoke, Token, TokenAccount},
};
use mpl_token_metadata::{
    instruction::{freeze_delegated_account, thaw_delegated_account},
    ID as MetadataTokenId,
};
```

让我们将默认函数的名称更改为 `stake` ，并将其相关上下文更改为类型 `Stake` 。

然后添加一个名为 `redeem` 的函数，其上下文类型为 `Redeem` 。

最后，对于 `unstake` ，使用 `Unstake` 的上下文类型进行相同操作。

这些是我们要构建的项目，我们首先要处理的是`Stake`的结构。

我们需要一个`PDA`来存储`UserStakeInfo`，并且需要一个`StakeState`枚举来表示`PDA`的其中一个字段。

```rust
#[account]
pub struct UserStakeInfo {
    pub token_account: Pubkey,
    pub stake_start_time: i64,
    pub last_stake_redeem: i64,
    pub user_pubkey: Pubkey,
    pub stake_state: StakeState,
    pub is_initialized: bool,
}

#[derive(Debug, PartialEq, AnchorDeserialize, AnchorSerialize, Clone)]
pub enum StakeState {
    Unstaked,
    Staked,
}
```

我们还可以为`StakeState`添加一个默认值，将其设置为未抵押。

我们将使用元数据程序。由于这是相对较新的，锚定程序中没有相应的类型。为了像我们的其他程序（例如系统程序、令牌程序等）一样使用它，我们将为其创建一个结构体，并添加一个名为 `id` 的实现，返回一个 `Pubkey` ，它是 `MetadataTokenId` 。


```rust
#[derive(Clone)]
pub struct Metadata;

impl anchor_lang::Id for Metadata {
    fn id() -> Pubkey {
        MetadataTokenId
    }
}
```

好的，我们现在可以开始处理质押部分了。下面是结构体需要的总共九个账户。需要注意的几个事项。

你会注意到 `nft_edition` 是一个 `Unchecked` 账户，这是因为系统中还没有为这种类型的账户创建。所有未核对的账户都需要有一个备注，以便系统知道你将添加手动安全检查，你会在下面看到 `CHECK: Manual validation` 。

作为提醒，每个账户上的属性是安全检查，以确保账户是正确类型并能执行特定功能。由于用户需要支付，并且 NFT 代币账户将进行更改，两者都具有 `mut` 属性。一些账户还需要种子，如下所示。

所有其他没有任何属性的账户在Anchor中都有自己必需的安全检查，所以我们不需要添加任何属性。

```rust
#[derive(Accounts)]
pub struct Stake<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        mut,
        associated_token::mint=nft_mint,
        associated_token::authority=user
    )]
    pub nft_token_account: Account<'info, TokenAccount>,
    pub nft_mint: Account<'info, Mint>,
    /// CHECK: Manual validation
    #[account(owner=MetadataTokenId)]
    pub nft_edition: UncheckedAccount<'info>,
    #[account(
        init_if_needed,
        payer=user,
        space = std::mem::size_of::<UserStakeInfo>() + 8,
        seeds = [user.key().as_ref(), nft_token_account.key().as_ref()],
        bump
    )]
    pub stake_state: Account<'info, UserStakeInfo>,
    /// CHECK: Manual validation
    #[account(mut, seeds=["authority".as_bytes().as_ref()], bump)]
    pub program_authority: UncheckedAccount<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub metadata_program: Program<'info, Metadata>,
}
```

在我们继续之前，让我们运行 `anchor build`，这样我们的第一个构建就可以开始了。记住，这是我们的第一个构建，它将生成我们的程序ID。

在运行的同时，在 `tests` 目录中创建一个名为 `utils` 的新文件夹。在其中创建一个名为 `setupNft.ts` 的文件。将下面的代码粘贴进去。

```ts
import {
  bundlrStorage,
  keypairIdentity,
  Metaplex,
} from "@metaplex-foundation/js"
import { createMint, getAssociatedTokenAddress } from "@solana/spl-token"
import * as anchor from "@project-serum/anchor"

export const setupNft = async (program, payer) => {
  const metaplex = Metaplex.make(program.provider.connection)
    .use(keypairIdentity(payer))
    .use(bundlrStorage())

  const nft = await metaplex
    .nfts()
    .create({
      uri: "",
      name: "Test nft",
      sellerFeeBasisPoints: 0,
    })

  console.log("nft metadata pubkey: ", nft.metadataAddress.toBase58())
  console.log("nft token address: ", nft.tokenAddress.toBase58())
  const [delegatedAuthPda] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from("authority")],
    program.programId
  )
  const [stakeStatePda] = await anchor.web3.PublicKey.findProgramAddress(
    [payer.publicKey.toBuffer(), nft.tokenAddress.toBuffer()],
    program.programId
  )

  console.log("delegated authority pda: ", delegatedAuthPda.toBase58())
  console.log("stake state pda: ", stakeStatePda.toBase58())
  const [mintAuth] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from("mint")],
    program.programId
  )

  const mint = await createMint(
    program.provider.connection,
    payer,
    mintAuth,
    null,
    2
  )
  console.log("Mint pubkey: ", mint.toBase58())

  const tokenAddress = await getAssociatedTokenAddress(mint, payer.publicKey)

  return {
    nft: nft,
    delegatedAuthPda: delegatedAuthPda,
    stakeStatePda: stakeStatePda,
    mint: mint,
    mintAuth: mintAuth,
    tokenAddress: tokenAddress,
  }
}

```

下一次运行 `npm install @metaplex-foundation/js` 。

然后跳转到 `anchor-nft-staking.ts` 目录中。这是Anchor创建的默认文件。

将提供者的默认行更改为两部分，这样我们以后需要时就可以访问提供者。

```ts
const provider = anchor.AnchorProvider.env()
anchor.setProvider(provider)
```

让我们添加钱包，这将允许我们为我们的交易公开一个付款人。

```ts
const wallet = anchor.workspace.AnchorNftStaking.provider.wallet
```

检查你的构建情况，如果已完成，请运行 `anchor deploy` ，如果失败，你可能需要向自己空投一些SOL。

构建完成后，运行 `anchor keys list` 并获取程序`ID`，然后放入 `lib.rs` 和 `Anchor.toml` 文件中。如果构建需要一段时间，你可能需要回到这一步。

回到测试文件。

让我们声明一些在测试中需要的变量类型。

```ts
let delegatedAuthPda: anchor.web3.PublicKey
let stakeStatePda: anchor.web3.PublicKey
let nft: any
let mintAuth: anchor.web3.PublicKey
let mint: anchor.web3.PublicKey
let tokenAddress: anchor.web3.PublicKey
```

现在让我们添加一个 `before` 函数，在测试运行之前调用。你会注意到"`;`"语法，它将解构返回值并设置所有这些值。

```ts
before(async () => {
    ;({ nft, delegatedAuthPda, stakeStatePda, mint, mintAuth, tokenAddress } =
      await setupNft(program, wallet.payer))
  })
```

跳转到默认测试，将其更改为 `it("Stakes"`,  。首先，我们只是确保函数被调用。我们还没有构建出实际的股权函数，所以这里没有进行任何逻辑测试。

```ts
it("Stakes", async () => {
    // Add your test here.
    await program.methods
      .stake()
      .accounts({
        nftTokenAccount: nft.tokenAddress,
        nftMint: nft.mintAddress,
        nftEdition: nft.masterEditionAddress,
        metadataProgram: METADATA_PROGRAM_ID,
      })
      .rpc()

  })
```

现在，运行 `anchor test` 。假设它通过了，这意味着我们通过了在`Stake`结构中创建的账户的验证。

回到我们的逻辑，以下是抵押工作所需的逐步操作。我们需要获取时钟的访问权限，确保抵押状态已经初始化，并确保它尚未被抵押。

在`stake`函数中，让我们首先获取时钟。

```rust
let clock = Clock::get().unwrap();
```

接下来，我们创建一个`CPI`来委托该程序作为冻结或解冻我们的NFT的权限。首先，我们设置`CPI`，然后确定我们要使用的账户，最后设置权限。

```rust
msg!("Approving delegate");

let cpi_approve_program = ctx.accounts.token_program.to_account_info();
let cpi_approve_accounts = Approve {
    to: ctx.accounts.nft_token_account.to_account_info(),
    delegate: ctx.accounts.program_authority.to_account_info(),
    authority: ctx.accounts.user.to_account_info(),
};

let cpi_approve_ctx = CpiContext::new(cpi_approve_program,cpi_approve_accounts);
token::approve(cpi_approve_ctx, 1)?;
```

接下来我们开始冻结代币。首先我们设置权限提升，然后调用`invoke_signed`函数，并传入所有必要的账户和账户信息数组，最后是种子和提升值。

```rust
msg!("Freezing token account");
let authority_bump = *ctx.bumps.get("program_authority").unwrap();
invoke_signed(
    &freeze_delegated_account(
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

现在，我们在我们的股权账户上设置数据。

```rust
ctx.accounts.stake_state.token_account = ctx.accounts.nft_token_account.key();
ctx.accounts.stake_state.user_pubkey = ctx.accounts.user.key();
ctx.accounts.stake_state.stake_state = StakeState::Staked;
ctx.accounts.stake_state.stake_start_time = clock.unix_timestamp;
ctx.accounts.stake_state.last_stake_redeem = clock.unix_timestamp;
ctx.accounts.stake_state.is_initialized = true;
```

啊，让我们跳到顶部并添加一个安全检查，还需要一个自定义错误。下面是两段代码，但是将自定义错误代码放在文件底部，不影响逻辑和结构。

```rust
require!(
    ctx.accounts.stake_state.stake_state == StakeState::Unstaked,
    StakeError::AlreadyStaked
);
```

```rust
#[error_code]
pub enum StakeError {
    #[msg("NFT already staked")]
    AlreadyStaked,
}
```

在再次进行测试之前，不要忘记补充你的SOL库存。

好的，就这样，让我们回到测试中，为我们的质押测试添加一些功能，以查看质押状态是否正确。

```ts
const account = await program.account.userStakeInfo.fetch(stakeStatePda)
expect(account.stakeState === "Staked")
```

再运行一次测试，希望一切顺利！🤞

就这样，我们的第一个指令已经生效了。在接下来的部分，我们将处理另外两个指令，然后最终开始处理客户端的事务。
