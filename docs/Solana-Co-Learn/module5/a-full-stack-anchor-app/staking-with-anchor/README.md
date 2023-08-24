---
sidebar_position: 91
sidebar_label:  🥩 使用Anchor进行NFT的质押
sidebar_class_name: green
---

# 🥩 使用Anchor进行NFT的质押

现在是时候将你的`NFT`质押计划及用户界面迁移到`Anchor`上了！你一直辛苦开发的`buildoor`项目已经相当出色，但将其迁移到`Anchor`上将使未来的工作变得更加简洁。请利用你所掌握的知识，完成下述任务：

- 使用`Anchor`从头开始重新编写代码。
- 增加一些可靠的测试覆盖，以确保你能够严密捕捉任何安全风险。
- 用`Anchor`的方法构建器来替换复杂的`UI`代码。

这项任务可能有些复杂，需要你投入一些时间独立进行尝试。如果几个小时后你感到困惑，随时可以观看我们提供的视频演示解决方案。

我们来共同完成这个任务，并查看我们的成果。我们不是在增加新功能，而是要完全用`Anchor`替换我们一直在努力开发的质押计划。

首先，通过运行 `anchor init anchor-nft-staking` 创建一个新项目，或者可以选择自己的名字。然后打开 `Anchor.toml` 文件，将种子设置为 `true`，集群设置为 `devnet`。

接下来，跳转到 `/programs/anchor-nft-staking/Cargo.toml`，并添加以下依赖项。

```toml
anchor-lang = { version="0.25.0", features = ["init-if-needed"] }
anchor-spl = "0.25.0"
mpl-token-metadata = { version="1.4.1", features=["no-entrypoint"] }
```

好的，打开 `lib.rs` 文件，我们来构建基本的框架。

我们需要添加以下导入。随着我们的工作进展，每个导入的必要性将逐渐显现。

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

首先，我们将默认函数的名称更改为 `stake`，并更改其相关上下文为类型`Stake`。

然后添加名为 `redeem` 的函数，上下文类型为 `Redeem`。

最后，对于 `unstake`，使用上下文类型 `Unstake` 进行相同操作。

接下来我们要构建的是`Stake`的结构。我们需要一个`PDA`来存储`UserStakeInfo`，并且需要一个`StakeState`枚举来表示`PDA`的其中一个字段。

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

为`StakeState`添加一个默认值，设为未抵押状态。

由于我们将使用的元数据程序相对较新，锚定程序中还没有相应的类型。为了像其他程序（例如系统程序、令牌程序等）一样使用它，我们将为其创建一个结构体，并添加一个名为 `id` 的实现，返回一个 `Pubkey`，它对应于 `MetadataTokenId`。

```rust
#[derive(Clone)]
pub struct Metadata;

impl anchor_lang::Id for Metadata {
    fn id() -> Pubkey {
        MetadataTokenId
    }
}
```

好的，现在我们可以开始处理质押部分。下面是结构体所需的九个账户，以及一些值得注意的事项。

首先，你会看到 `nft_edition` 是一个 `Unchecked` 账户，这是因为系统中还未为这种类型的账户创建。所有未经核实的账户都需附带一条备注，以便系统知道你将进行手动安全检查。你会在下方看到 `CHECK: Manual validation`。

需要提醒的是，每个账户上的属性都是一种安全检查，以确保账户是正确的类型并能执行特定功能。由于用户需要付费，并且`NFT`代币账户将被修改，所以两者都具有`mut`属性。某些账户还需要种子，如下所示。

至于其他没有任何属性的账户，它们在`Anchor`中都有自己必需的安全检查，所以我们不需要添加任何属性。

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

在继续操作之前，先运行`anchor build`，这样我们的第一个构建就可以开始了。请记住，这是我们的第一次构建，它会生成我们的程序`ID`。

在构建的同时，在`tests`目录中创建一个名为`utils`的新文件夹。在其中创建一个名为`setupNft.ts`的文件，并将下面的代码粘贴进去。

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

然后，运行`npm install @metaplex-foundation/js`。

最后，转到`anchor-nft-staking.ts`目录。这是`Anchor`创建的默认文件。

你需要将提供者的默认行分为两部分，以便在以后需要时能够访问提供者。

```ts
const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);
```

让我们引入钱包，这将使我们能够公开付款人为交易签名。

```ts
const wallet = anchor.workspace.AnchorNftStaking.provider.wallet;
```

检查你的编译情况，如果一切顺利，请运行 `anchor deploy`。如果出现问题，你可能需要为自己空投一些SOL。

编译完成后，运行 `anchor keys list` 并获取程序`ID`，然后将其放入 `lib.rs` 和 `Anchor.toml` 文件中。如果编译花费一些时间，你可能需要回到这一步。

回到测试文件。

让我们定义一些测试中需要使用的变量类型。

```ts
let delegatedAuthPda: anchor.web3.PublicKey;
let stakeStatePda: anchor.web3.PublicKey;
let nft: any;
let mintAuth: anchor.web3.PublicKey;
let mint: anchor.web3.PublicKey;
let tokenAddress: anchor.web3.PublicKey;
```

现在，我们添加一个 `before` 函数，该函数会在测试运行之前被调用。注意"`;`"语法，它会解构返回值并为所有这些值进行设置。

```ts
before(async () => {
    ;({ nft, delegatedAuthPda, stakeStatePda, mint, mintAuth, tokenAddress } =
      await setupNft(program, wallet.payer));
  });
```

转到默认测试，将其更改为 `it("Stakes"`。首先，我们只是确认函数被成功调用。我们还没有构建实际的抵押函数，所以暂时不会进行任何逻辑测试。

```ts
it("Stakes", async () => {
    // 在此添加你的测试。
    await program.methods
      .stake()
      .accounts({
        nftTokenAccount: nft.tokenAddress,
        nftMint: nft.mintAddress,
        nftEdition: nft.masterEditionAddress,
        metadataProgram: METADATA_PROGRAM_ID,
      })
      .rpc();
  });
```

现在，运行 `anchor test`。如果它通过了，这意味着我们通过了在`Stake`结构中创建账户的验证。

回到逻辑部分，下面是抵押工作所需的逐步操作。我们需要获取时钟访问权限，确保抵押状态已初始化，并确认尚未抵押。

在`stake`函数中，我们首先获取时钟。

```rust
let clock = Clock::get().unwrap();
```

接下来，我们创建一个`CPI`来委托该程序作为冻结或解冻我们的`NFT`的权限。首先，我们设置`CPI`，然后确定我们要使用的账户，最后设定权限。

```rust
msg!("Approving delegate");

let cpi_approve_program = ctx.accounts.token_program.to_account_info();
let cpi_approve_accounts = Approve {
    to: ctx.accounts.nft_token_account.to_account_info(),
    delegate: ctx.accounts.program_authority.to_account_info(),
    authority: ctx.accounts.user.to_account_info(),
};

let cpi_approve_ctx = CpiContext::new(cpi_approve_program, cpi_approve_accounts);
token::approve(cpi_approve_ctx, 1)?;
```

然后我们开始冻结代币。首先设置权限提升，然后调用`invoke_signed`函数，传入所有必要的账户和账户信息数组，最后是种子和提升值。

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

现在，我们在股权账户上设置数据。

```rust
ctx.accounts.stake_state.token_account = ctx.accounts.nft_token_account.key();
ctx.accounts.stake_state.user_pubkey = ctx.accounts.user.key();
ctx.accounts.stake_state.stake_state = StakeState::Staked;
ctx.accounts.stake_state.stake_start_time = clock.unix_timestamp;
ctx.accounts.stake_state.last_stake_redeem = clock.unix_timestamp;
ctx.accounts.stake_state.is_initialized = true;
```

哎呀，让我们跳到文件开始部分并添加一个安全检查，我们还需要一个自定义错误。下面是两段代码，但是将自定义错误代码放在文件底部，这样不会影响逻辑和结构的阅读。

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

在再次测试之前，不要忘记充实你的`SOL`余额。

好的，就这样，让我们回到测试中，为我们的质押测试添加一些功能，以检查质押状态是否正确。

```ts
const account = await program.account.userStakeInfo.fetch(stakeStatePda);
expect(account.stakeState === "Staked");
```

再次运行测试，希望一切都顺利！🤞

就这样，我们的第一个指令已经落地生效。在接下来的部分，我们将处理其余两个指令，然后终于开始处理客户端交易的事宜。
