---
sidebar_position: 78
sidebar_label: 构建一个代币铸造器
sidebar_class_name: green
---

# 构建一个代币铸造器

## 铸币、质押等等

很好，我们已经走了很长的路，现在让我们重新关注`NFT`质押计划。今天，我们将为质押者添加铸造奖励代币和执行质押操作所需的所有功能。有别于以前使用`Solana Playground`的方式，我们将在本地完成所有操作。可以从以下起始库开始：[solutions-sans-tokens分支](https://github.com/Unboxed-Software/solana-nft-staking-program/tree/solution-sans-tokens?utm_source=buildspace.so&utm_medium=buildspace_project)。

你会注意到这里有些不同。现在有一个名为“`TS`”的文件夹，其中包含了我们之前在`Solana Playground`的客户端项目中的全部内容。

在你的前端项目中，需要在根目录下创建一个新的 `utils` 文件夹。接着创建一个名为 `instructions.ts` 的文件，并从`NFT`质押项目中复制/粘贴整个 `instructions.ts` 文件。由于代码超过`200`行，我在此不做展示。😬唯一重要的修改是在 `/<project-name>/src/ts/src/utils/constants.ts` 中，`PROGRAM_ID` 从项目的密钥对中读取。

```ts
const string = fs.readFileSync(
  "../target/deploy/solana_nft_staking_program-keypair.json",
  "utf8"
)

...

export const PROGRAM_ID = Keypair.fromSecretKey(secretKey).publicKey
```

准备好了！我们可以开始了。首先切换到`TS`目录，然后运行 `npm run start`。确保你已经完成了 `cargo build-sbf` 和 `solana program deploy`，并且你的集群设置是正确的。如果一切正常，它应该能够启动并运行。在控制台上，你应该能看到 `stakes`、`redeems` 和 `unstakes` 的输出。请耐心等待，年轻的练剑师，这可能需要一两分钟的时间。

假设一切顺利🎉，我们可以跳转到处理器文件（`//src/processor.rs`）。

首先，我们需要处理一些导入：

```rust
use mpl_token_metadata::ID as mpl_metadata_program_id;
use spl_token::ID as spl_token_program_id;
```
此外，在 `solana_program::program::{invoke_signed}` 的导入中添加 `invoke`。

现在，转到 `process_stake` 函数，我们将在这里进行第一次修改。

习惯于此吧，我们经常会发现自己需要在许多地方添加账户。所以，现在是时候添加一些账户，以便我们能够真正借助令牌程序工作了。

```rust
let nft_mint = next_account_info(account_info_iter)?;
let nft_edition = next_account_info(account_info_iter)?;
let stake_state = next_account_info(account_info_iter)?;
let program_authority = next_account_info(account_info_iter)?;
let token_program = next_account_info(account_info_iter)?;
let metadata_program = next_account_info(account_info_iter)?;
```

## 委托和冻结 —— 质押

下一步，我们需要将程序设置为`NFT`的代理，委托`NFT`的权限，以便程序能够代表我们发起交易。

```rust
msg!("Approving delegation");
invoke(
    &spl_token::instruction::approve(
        &spl_token_program_id,
        nft_token_account.key,
        program_authority.key,
        user.key,
        &[user.key],
        1,
    )?,
    &[
        nft_token_account.clone(),
        program_authority.clone(),
        user.clone(),
        token_program.clone(),
    ],
)?;
```

现在，我们可以开始实际冻结代币的过程。我们不是真正改变代币的所有权，而是将其冻结，使在质押期间无法对代币进行任何操作。首先，我们需要为程序权限派生`PDA`（程序派生地址）。简单来说，我们会使用`PDA`作为代币铸造的授权实体，从而能够冻结账户。

别忘了检查并确保`PDA`已经被提取。

```rust
let (delegated_auth_pda, delegate_bump) =
    Pubkey::find_program_address(&[b"authority"], program_id);

if delegated_auth_pda != *program_authority.key {
    msg!("Invalid seeds for PDA");
    return Err(StakeError::InvalidPda.into());
}
```

回到冻结操作本身，与委托批准不同，这里使用`invoke_signed`以从我们的程序进行签名。

```rust
msg!("freezing NFT token account");
invoke_signed(
    &mpl_token_metadata::instruction::freeze_delegated_account(
        mpl_metadata_program_id,
        *program_authority.key,
        *nft_token_account.key,
        *nft_edition.key,
        *nft_mint.key,
    ),
    &[
        program_authority.clone(),
        nft_token_account.clone(),
        nft_edition.clone(),
        nft_mint.clone(),
        metadata_program.clone(),
    ],
    &[&[b"authority", &[delegate_bump]]],
)?;
```

我们的程序的`PDA`现在具备了冻结令牌的权限。🧊

接下来，我们将转到`TypeScript`文件（`//ts/src/utils/instruction.rs`），并向`createStakingInstruction`函数中添加更多的账户，确保其正常工作。

我们需要确保新添加的账户与`//src/processor.rs`文件中`process_stake`函数的账户相匹配：

```ts
nftMint: PublicKey,
nftEdition: PublicKey,
tokenProgram: PublicKey,
metadataProgram: PublicKey,
```

然后，我们将所有这些按照正确的顺序添加到`TransactionInstruction`中的账户列表。顺序非常重要。

首先，取得授权账户：

```ts
const [delegateAuthority] = PublicKey.findProgramAddressSync(
    [Buffer.from("authority")],
    programId
)
```

总共有`5`个新账户，你需要再次确保它们的顺序，并检查哪些是可写的，哪些是签名者。

```ts
...
{
    pubkey: nftMint,
    isWritable: false,
    isSigner: false,
},
{
    pubkey: nftEdition,
    isWritable: false,
    isSigner: false,
},
...
{
    pubkey: delegateAuthority,
    isWritable: true,
    isSigner: false,
},
{
    pubkey: tokenProgram,
    isWritable: false,
    isSigner: false,
},
{
    pubkey: metadataProgram,
    isWritable: false,
    isSigner: false,
},
```

## 测试我们的质押功能

接下来，进入索引文件（`//ts/src/index.rs`），在创建`stakeInstruction`的地方，在`testStaking`函数中添加与之匹配的相同账户。

下面是四个附加项：

```ts
nft.mintAddress,
nft.masterEditionAddress,
TOKEN_PROGRAM_ID,
METADATA_PROGRAM_ID,
```

```ts
import { TOKEN_PROGRAM_ID } from "@solana/spl-token"
import { PROGRAM_ID as METADATA_PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata"
```

现在是时候测试我们的进展了：

1. 使用`cargo build-sbf`重新构建程序，然后使用`solana program deploy {path}`进行更新。
2. 确保你处于`ts`目录下，并执行`npm run start`。

假设没有出错，那我们就回到`processor.rs`文件，并向`process_redeem`函数添加相似的代码。

## 委派和冻结 -- 兑换

首先，你猜对了，我们要添加账户——一共有4个！

```rust
let stake_mint = next_account_info(account_info_iter)?;
let stake_authority = next_account_info(account_info_iter)?;
let user_stake_ata = next_account_info(account_info_iter)?;
let token_program = next_account_info(account_info_iter)?;
```

接下来，我们将验证一些新账户。首先，我们要推导出`stake_auth_pda`，然后用自定义错误验证`PDA`。

```rust
let (stake_auth_pda, auth_bump) = Pubkey::find_program_address(&[b"mint"], program_id);

if *stake_authority.key != stake_auth_pda {
        msg!("Invalid stake mint authority!");
        return Err(StakeError::InvalidPda.into());
}
```

向下滚动一些，我们要调用一个`invoke_signed`来调用令牌程序，以铸造代币，等我们了解了`redeem_amount`之后。我们需要指令的各种键，然后是所需的账户，最后是授权的种子。别忘了使用`?`来传播错误，否则红色波浪线将始终困扰你。

```rust
invoke_signed(
    &spl_token::instruction::mint_to(
        token_program.key,
        stake_mint.key,
        user_stake_ata.key,
        stake_authority.key,
        &[stake_authority.key],
        redeem_amount.try_into().unwrap(),
    )?,
    &[
        stake_mint.clone(),
        user_stake_ata.clone(),
        stake_authority.clone(),
        token_program.clone(),
    ],
    &[&[b"mint", &[auth_bump]]],
)?;
```

这应该在此文件中处理铸币操作，但我们必须在客户端上添加新账户。

我们回到之前的`instruction.ts`文件，向下滚动到`createRedeemInstruction`，并添加以下账户。

```ts
mint: PublicKey,
userStakeATA: PublicKey,
tokenProgram: PublicKey,
```

现在请记住，一些账户是派生的，如权威账户，所以我们不需要手动添加它。

然后跳到`TransactionInstruction`本身，首先推导出`mintAuth`。

```ts
const [mintAuth] = PublicKey.findProgramAddressSync(
    [Buffer.from("mint")],
    programId
  )
```

接下来进入`return new TransactionInstruction`，添加相关账户，并标明它们是否可写和`/`或可签。以下是我们需要添加的`4`个账户 - 请记住，顺序很重要。

```ts
{
  pubkey: mint,
  isWritable: true,
  isSigner: false,
},
{
  pubkey: mintAuth,
  isWritable: false,
  isSigner: false,
},
{
  pubkey: userStakeATA,
  isWritable: true,
  isSigner: false,
},
{
  pubkey: tokenProgram,
  isSigner: false,
  isWritable: false,
},
```

这应该包括了我们兑换所需的所有内容。我们最后需要回到同一个`index.ts`文件，并确保我们正确调用它，但这部分有些复杂，所以让我们先回到`processor.rs`并完成`process_unstake`函数。

## 委托和冻结——解除质押

解除质押过程基本上是将我们刚刚进行的质押和赎回步骤结合在一起，因此需要用到我们刚才操作过的所有账户。

以下是我们需要添加的所有账户：

```rust
let nft_mint = next_account_info(account_info_iter)?;
let nft_edition = next_account_info(account_info_iter)?;
... (stake_state 应该在我们之前的代码中)
let program_authority = next_account_info(account_info_iter)?;
let stake_mint = next_account_info(account_info_iter)?;
let stake_authority = next_account_info(account_info_iter)?;
let user_stake_ata = next_account_info(account_info_iter)?;
let token_program = next_account_info(account_info_iter)?;
let metadata_program = next_account_info(account_info_iter)?;
```

我们可以向下滚动，并复制粘贴 `process_stake` 和 `process_redeem` 函数中的一些验证：

```rust
let (delegated_auth_pda, delegate_bump) =
        Pubkey::find_program_address(&[b"authority"], program_id);
if delegated_auth_pda != *program_authority.key {
        msg!("Invalid seeds for PDA");
        return Err(StakeError::InvalidPda.into());
}

let (stake_auth_pda, auth_bump) = Pubkey::find_program_address(&[b"mint"], program_id);
if *stake_authority.key != stake_auth_pda {
        msg!("Invalid stake mint authority!");
        return Err(StakeError::InvalidPda.into());
}
```

好的，这是相当新的部分，我们要“解冻”`NFT`代币账户。如果你还记得，我们之前冻结了它，现在我们要解冻它。这段代码与上面的冻结代码完全相反，我们只需更改辅助函数，使用 `thaw_delegated_account`。

```rust
msg!("thawing NFT token account");
invoke_signed(
    &mpl_token_metadata::instruction::thaw_delegated_account(
        mpl_metadata_program_id,
        *program_authority.key,
        *nft_token_account.key,
        *nft_edition.key,
        *nft_mint.key,
    ),
    &[
        program_authority.clone(),
        nft_token_account.clone(),
        nft_edition.clone(),
        nft_mint.clone(),
        metadata_program.clone(),
    ],
    &[&[b"authority", &[delegate_bump]]],
)?;
```

接下来，我们需要撤销委托权限。与授权委托类似，但并不完全相同。我们可以移除 `program_authority` 字段，因为它不是必需的，并从批准助手函数中移除 `amount`。

```rust
msg!("Revoke delegation");
invoke(
    &spl_token::instruction::revoke(
        &spl_token_program_id,
        nft_token_account.key,
        user.key,
        &[user.key],
    )?,
    &[
        nft_token_account.clone(),
        user.clone(),
        token_program.clone(),
    ],
)?;
```

最后，我们将从赎回函数中复制 `invoke_signed`，粘贴到 `redeem_amount` 下面。

```rust
invoke_signed(
        &spl_token::instruction::mint_to(
            token_program.key,
            stake_mint.key,
            user_stake_ata.key,
            stake_authority.key,
            &[stake_authority.key],
            redeem_amount.try_into().unwrap(),
        )?,
        &[
            stake_mint.clone(),
            user_stake_ata.clone(),
            stake_authority.clone(),
            token_program.clone(),
        ],
        &[&[b"mint", &[auth_bump]]],
    )?;
```

哦，还有一件事，我们实际上没有设置 `redeem_amount`，之前只是用了 `unix_time`。所以，改成 `100 * unit_time`，我们以后可以调整。确保在上述两个函数中都进行更改。

这里应该就是了，回到客户端的文件上，添加所有的账户。向下滚动到 `createUnstakeInstruction`，将以下内容作为参数添加进去。

```
nftMint: PublicKey,
nftEdition: PublicKey,
stakeMint: PublicKey,
userStakeATA: PublicKey,
tokenProgram: PublicKey,
metadataProgram: PublicKey,
```

再次提醒，有一些账户是自动派生的，所以我们不需要手动添加。

接下来我们推导出 `delegateAuthority` 和 `mintAuth`，这与上面的代码完全相同。

```ts
const [delegateAuthority] = PublicKey.findProgramAddressSync(
    [Buffer.from("authority")],
    programId
  )

const [mintAuth] = PublicKey.findProgramAddressSync(
    [Buffer.from("mint")],
    programId
  )
```

最后，我们将它们全部添加到指令中。这是很多账户，所以我们在这里全部发布，而不仅仅是我们要添加的那些。让你的眼睛不再在函数和文件之间来回移动。

```json
{
    pubkey: nftHolder,
    isWritable: false,
    isSigner: true,
  },
  {
    pubkey: nftTokenAccount,
    isWritable: true,
    isSigner: false,
  },
  {
    pubkey: nftMint,
    isWritable: false,
    isSigner: false,
  },
  {
    pubkey: nftEdition,
    isWritable: false,
    isSigner: false,
  },
  {
    pubkey: stakeAccount,
    isWritable: true,
    isSigner: false,
  },
  {
    pubkey: delegateAuthority,
    isWritable: true,
    isSigner: false,
  },
  {
    pubkey: stakeMint,
    isWritable: true,
    isSigner: false,
  },
  {
    pubkey: mintAuth,
    isWritable: false,
    isSigner: false,
  },
  {
    pubkey: userStakeATA,
    isWritable: true,
    isSigner: false,
  },
  {
    pubkey: tokenProgram,
    isWritable: false,
    isSigner: false,
  },
  {
    pubkey: metadataProgram,
    isWritable: false,
    isSigner: false,
  },
```

## 测试我们的功能

好的，好的，我知道你已经迫不及待了，我们快到终点了。现在让我们回到`index.ts`文件中，调用并测试所有的函数。对于`testRedeem`函数，我们需要代币的铸币地址和用户的代币账户，以及`createUnstakeInstruction`。

首先，在`testRedeem`函数的参数中添加以下内容：

```ts
stakeMint: web3.PublicKey,
userStakeATA: web3.PublicKey
```

然后，将它们添加到下方的`createRedeemInstruction`中：

```ts
stakeMint,
userStakeATA,
TOKEN_PROGRAM_ID,
PROGRAM_ID
```

对`testUnstaking`函数也进行上述相同的操作。

接着，在`createUnstakingInstruction`中添加以下内容：

```ts
nft.mintAddress,
nft.masterEditionAddress,
stakeMint,
userStakeATA,
TOKEN_PROGRAM_ID,
METADATA_PROGRAM_ID,
```

现在向下滚动到`main()`函数的调用位置，你会注意到`testRedeem`和`testUnstaking`都是红色的，因为它们缺少一些参数。

首先，我们要声明`stakeMint`，目前我们将其硬编码，以及`userStakeATA`，该函数会创建`ATA`（如果`ATA`还不存在的话）。

```ts
const stakeMint = new web3.PublicKey(
    "EMPTY FOR A MINUTE"
  )

const userStakeATA = await getOrCreateAssociatedTokenAccount(
    connection,
    user,
    stakeMint,
    user.publicKey
)
```

...现在，将调用更改为接收额外的参数：

```ts
await testRedeem(connection, user, nft, stakeMint, userStakeATA.address)
await testUnstaking(connection, user, nft, stakeMint, userStakeATA.address)
```

## 前端编辑以测试功能

我们暂时要切换到前端`Buildoors`项目中的`index.ts`文件（`//tokens/bld/index.ts`）。在这里，我们使用`createBldToken`函数创建`BLD`令牌。

在该函数内部，我们称`token.CreateMint`的第三个参数为铸币授权，它掌管着铸币过程。最初，它是一个`payer.publicKey`，用于初始调用。我们很快就会更改铸币授权。

首先，我们要向`createBldToken`函数添加一个参数：

`programId: web3.PublicKey`

然后向下滚动到主函数中的调用位置，并为`await createBldToken`调用添加第三个参数。

`new web3.PublicKey("USE YOUR PROGRAM ID")`

如果你找不到程序`ID`，你可以重新部署，控制台会显示你所需的程序`ID`。

向上滚动，超过`const tokenMint`，找到`mintAuth`。你可以在`Anchor NFT`质押计划中找到授权的具体信息。

```ts
const [mintAuth] = await web3.PublicKey.findProgramAddress(
    [Buffer.from("mint")],
    programId
  )
```

滚动回到下面，在`transactionSignature`创建后，我们将设置新的铸币权限（这是我们上面提到的更改）。

```ts
await token.setAuthority(
    connection,
    payer,
    tokenMint,
    payer.publicKey,
    token.AuthorityType.MintTokens,
    mintAuth
  )
```

现在，我们可以使用新的认证重新创建`BLD`令牌，并将其添加到上面的`stakeMint`中。

```ts
const stakeMint = new web3.PublicKey(
    "EMPTY FOR A MINUTE"
  )
```

## 最后，全面测试一切

现在，请切换到主目录并运行 `npm run create-bld-token`。确保你已经将环境设置为`devnet`。

核实你的构建脚本，它应该如下所示：

`"creat-bld-token": "ts-node tokens/bld/index.ts"`

一旦成功执行完毕，你可以从`tokens/bld`目录中的`cache.json`文件中获取新的密钥。

现在我们终于回到了`NFT`质押计划，并且可以在`stakeMint`创建中使用这个密钥：

```ts
const stakeMint = new web3.PublicKey(
    "MINT KEY FROM CACHE.JSON"
  )
```

现在应该一切准备就绪，并可以正常工作。返回到`ts`目录，并使用`npm run start`进行全面测试。如果一切顺利，你的控制台将确认初始化、质押、赎回和解质押都已成功完成。

确实涉及了许多细节。深呼吸，给自己一些喘息的空间。这是一项充满挑战性的任务，不妨再回头看一遍，复习一下，甚至再次实践，不管需要付出多少努力。只要你能掌握这些内容，你就将成为一名出色的`Solana`开发者。
