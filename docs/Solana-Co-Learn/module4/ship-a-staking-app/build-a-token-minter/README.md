---
sidebar_position: 78
sidebar_label: 构建一个代币铸造器
sidebar_class_name: green
---

# 构建一个代币铸造器

**铸币、质押等等...**


好的，哇哇哇，我们走了很长的路，让我们回到NFT质押计划。今天，我们将添加所有与代币计划交互所需的功能，以便为质押者铸造奖励代币，并执行质押操作。与以前不同的是，我们将不再使用Solana Playground，所以我们将在本地完成所有这些操作。请随意使用以下代码开始：起始库：[solutions-sans-tokens分支](https://github.com/Unboxed-Software/solana-nft-staking-program/tree/solution-sans-tokens?utm_source=buildspace.so&utm_medium=buildspace_project)。

你会注意到这里有几个不同的地方。现在有一个名为“TS”的文件夹，其中包含我们之前在Solana Playground中的客户端项目中的所有内容。

在你的前端项目中，在根目录下创建一个新的 `utils` 文件夹。然后创建一个名为 `instructions.ts` 的文件，并从NFT质押项目中复制/粘贴整个 `instructions.ts` 文件。由于代码超过200行，我不会在这里粘贴。 😬一个重要的修改是在 `/<project-name>/src/ts/src/utils/constants.ts` 中， `PROGRAM_ID` 是从项目的密钥对中读取的。



```ts
const string = fs.readFileSync(
  "../target/deploy/solana_nft_staking_program-keypair.json",
  "utf8"
)

...

export const PROGRAM_ID = Keypair.fromSecretKey(secretKey).publicKey
```

好的，准备好了！我们开始吧，首先切换到TS目录，然后运行`npm run start` -- 希望你已经完成了`cargo build-sbf`和`solana program deploy`，并且你的集群设置是一样的，如果是的话，它应该能够启动并运行起来。你应该能在控制台上看到`stakes`、`redeems`和`unstakes`的输出。耐心点，年轻的练剑师，这可能需要一两分钟。

假设没有错误🎉，让我们跳转到处理器文件：（`//src/processor.rs`）。

首先，让我们通过以下使用语句来处理一些导入：

```rust
use mpl_token_metadata::ID as mpl_metadata_program_id;
use spl_token::ID as spl_token_program_id;
```
另外，在`solana_program::program::{invoke_signed}`导入中添加 `invoke` 。


快来到 `process_stake` 函数，这里我们将进行第一次修改。

习惯这个吧，这种情况会经常发生，我们会发现自己要在很多地方添加账户，很多账户...所以，是时候添加一些账户了，这样我们才能真正使用令牌程序进行工作。

```rust
let nft_mint = next_account_info(account_info_iter)?;
let nft_edition = next_account_info(account_info_iter)?;
let stake_state = next_account_info(account_info_iter)?;
let program_authority = next_account_info(account_info_iter)?;
let token_program = next_account_info(account_info_iter)?;
let metadata_program = next_account_info(account_info_iter)?;
```

## 委托和冻结——质押

接下来，我们需要将这个程序添加为我们的NFT的代表，委托NFT的权限，以便该程序可以代表我们提交交易。

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

现在我们可以开始实际冻结代币的过程了。我们并不是真正改变代币的所有权，只是将其冻结，以便在质押期间无法对代币进行任何操作。在此之前，我们需要为程序权限派生PDA。简而言之，我们在程序上使用PDA，将其委派为代币铸造的权限机构，以便能够冻结账户。

别忘了检查一下，确保PDA已经被提取出来了。

```rust
let (delegated_auth_pda, delegate_bump) =
        Pubkey::find_program_address(&[b"authority"], program_id);

if delegated_auth_pda != *program_authority.key {
        msg!("Invalid seeds for PDA");
        return Err(StakeError::InvalidPda.into());
}
```

回到冷冻本身，与委托批准不同，这个使用 invoke_signed 作为从我们的程序签署。

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

这是我们程序的PDA，现在具有冻结令牌的权限。🧊

就这样，我们跳到typescript文件（//ts/src/utils/instruction.rs）并添加更多的账户（看吧，我告诉你，添加更多的账户和添加更多的账户和...）到 createStakingInstruction 函数中，让它正常工作。

你想要匹配我们在（//src/processor.rs）文件中的 process_stake 函数中的账户，让我们确保添加：

```ts
nftMint: PublicKey,
nftEdition: PublicKey,
tokenProgram: PublicKey,
metadataProgram: PublicKey,
```

接下来，我们按照正确的顺序将所有这些添加到下面的账户中，在 TransactionInstruction 中。顺序很重要。


...但首先，拉进权威账户：

```ts
const [delegateAuthority] = PublicKey.findProgramAddressSync(
    [Buffer.from("authority")],
    programId
  )
```

总共有5个新账户，你需要再次确保它们的顺序。此外，请检查哪些是可写的，哪些是签署者。

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

接下来，跳转到索引文件（//ts/src/index.rs），在 stakeInstruction 被创建的地方，在 testStaking 函数中添加相同的匹配账户。

这里是四个附加项：

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

是时候测试我们的进展了：

- 1. 使用 `cargo build-sbf` 重新构建您的程序，然后使用 `solana program deploy {path}` 进行更新
- 2. 确保你在 ts 目录下，并执行 npm run start 。

假设没有错误，让我们回到 processor.rs 文件中，并向我们的 process_redeem 函数添加类似的数据。

## 委派和冻结 -- 兑换

首先，猜猜看，我们要添加账户——总共会有4个！！

```rust
let stake_mint = next_account_info(account_info_iter)?;
let stake_authority = next_account_info(account_info_iter)?;
let user_stake_ata = next_account_info(account_info_iter)?;
let token_program = next_account_info(account_info_iter)?;
```

回到对一些新账户的验证。让我们推导出我们的 stake_auth_pda ，然后对带有自定义错误的PDA进行验证。

```rust
let (stake_auth_pda, auth_bump) = Pubkey::find_program_address(&[b"mint"], program_id);

if *stake_authority.key != stake_auth_pda {
        msg!("Invalid stake mint authority!");
        return Err(StakeError::InvalidPda.into());
}
```

向下滚动一点，等我们弄清楚 redeem_amount 之后，我们将调用一个 invoke_signed 来调用令牌程序，以铸造代币。我们需要指令的各种密钥，然后是所需的账户，最后是授权的种子。不要忘记使用 ? 传播错误，否则红色波浪线将不会离开你。

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

这应该处理这个文件中的铸币，但我们必须在客户端上添加新的账户。

我们回到之前的 instruction.ts 文件，向下滚动到 createRedeemInstruction ，添加以下账户。

```ts
mint: PublicKey,
userStakeATA: PublicKey,
tokenProgram: PublicKey,
```

现在记住，一些账户是派生的，在这种情况下，它是权威账户，所以我们不需要手动添加它。

然后跳到 TransactionInstruction 本身，首先我们推导出 mintAuth 。

```ts
const [mintAuth] = PublicKey.findProgramAddressSync(
    [Buffer.from("mint")],
    programId
  )
```

接下来进入 return new TransactionInstruction 以添加相关账户，以及它们是否可写入和/或可签署。以下是我们需要添加的4个账户 - 记住，顺序很重要。

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

这应该是我们兑换所需的一切。我们最后需要回到同一个 index.ts 文件，并确保我们正确调用它，但这有点复杂，所以首先让我们回到 processor.rs 并完成 process_unstake 函数。

## 委托和冻结——解除质押

解除质押的过程基本上就是将我们刚刚进行的质押和赎回的步骤结合起来，因此需要用到我们刚刚操作过的所有账户。

这是我们需要添加的所有账户：

```rust
let nft_mint = next_account_info(account_info_iter)?;
let nft_edition = next_account_info(account_info_iter)?;
... (stake_state should be here from our previous code)
let program_authority = next_account_info(account_info_iter)?;
let stake_mint = next_account_info(account_info_iter)?;
let stake_authority = next_account_info(account_info_iter)?;
let user_stake_ata = next_account_info(account_info_iter)?;
let token_program = next_account_info(account_info_iter)?;
let metadata_program = next_account_info(account_info_iter)?;

```

我们可以向下滚动并添加一些验证，我们只是从 process_stake 和 process_redeem 函数中复制/粘贴：

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

好的，所以这是相当新的，我们要“解冻”NFT代币账户。如果你还记得，我们之前冻结了它，现在我们要解冻它。

这段代码与上面的冻结代码完全相反，我们只需要更改辅助函数并使用 thaw_delegated_account 。

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

接下来，我们需要撤销委托权限。这与批准委托类似，但并非完全相同。我们可以移除 program_authority 字段，因为它不是必需的，并且从批准助手函数中移除 amount 。

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

最后，我们将从赎回函数中复制 invoke_signed ，粘贴到 redeem_amount 下面。

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

哦，还有一件事，我们实际上没有设置 redeem_amount ，之前只是用了 unix_time 。所以，改成 100 * unit_time ，我们以后可以调整。确保在上述两个函数中都进行更改。

这里应该就是了，回到客户端的文件上，添加所有的账户。向下滚动到 createUnstakeInstruction ，将以下内容作为参数添加进去。

```
nftMint: PublicKey,
nftEdition: PublicKey,
stakeMint: PublicKey,
userStakeATA: PublicKey,
tokenProgram: PublicKey,
metadataProgram: PublicKey,
```

再次，有一些是自动派生的，所以我们不需要手动添加。

接下来我们推导出 delegateAuthority 和 mintAuth ，这与上面的代码完全相同。

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

最后，我们将它们全部添加到指令中。这是很多账户，所以我们在这里全部发布，而不仅仅是我们要添加的那些。让你的眼睛少一些在函数和文件之间来回移动。

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

好的，好的，我知道你能感受到，我们快要接近了...让我们最终回到 index.ts 文件中，调用并测试所有的函数。对于 testRedeem 函数，我们需要代币的铸币地址和用户的代币账户，以及 createUnstakeInstruction 。

首先，我们将以下内容添加到 testRedeem 函数的参数中。

```ts
stakeMint: web3.PublicKey,
userStakeATA: web3.PublicKey
```

然后我们将它们添加到下方的 createRedeemInstruction 中。

```
stakeMint,
userStakeATA,
TOKEN_PROGRAM_ID,
PROGRAM_ID
```

对 testUnstaking 函数进行与上述相同的添加。

然后对于 createUnstakingInstruction ，添加以下内容。

```
nft.mintAddress,
nft.masterEditionAddress,
stakeMint,
userStakeATA,
TOKEN_PROGRAM_ID,
METADATA_PROGRAM_ID,
```

现在向下滚动到 main() 函数的调用位置，你会注意到 testRedeem 和 testUnstaking 都是红色的，因为它们需要传入更多的信息。

首先，我们需要声明 stakeMint ，目前我们将硬编码，以及 userStakeATA ，它调用一个函数，如果ATA还不存在，就会创建它。

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

...现在，将调用更改为接受额外的参数：

```ts
await testRedeem(connection, user, nft, stakeMint, userStakeATA.address)
 await testUnstaking(connection, user, nft, stakeMint, userStakeATA.address)
 ```

 ## 前端编辑以测试功能


 我们暂时要切换到前端Buildoors项目中的 index.ts 文件（//tokens/bld/index.ts）。在这里，我们使用 createBldToken 函数创建BLD令牌。

 在该函数内部，我们称 token.CreateMint 第三个参数为铸币授权，它控制着铸币过程。起初，这是一个 payer.publicKey 用于初始调用。很快，我们将会更改铸币授权。

 首先，我们向createBldToken函数添加一个参数。

 `programId: web3.PublicKey`

 然后向下滚动到主函数中的调用位置，并为 await createBldToken 调用添加第三个参数。

 `new web3.PublicKey("USE YOUR PROGRAM ID")`


 如果您找不到您的程序ID，您可以重新部署，控制台将显示您所需的程序ID。

 向上滚动，超过 const tokenMint ，收回 mintAuth 。您可以在锚定NFT质押计划中找到以下内容的授权。

 ```ts
 const [mintAuth] = await web3.PublicKey.findProgramAddress(
     [Buffer.from("mint")],
     programId
   )
   ```

滚动回到下面，在 transactionSignature 创建后，我们将设置新的铸币权限。（这是我们上面提到的更改）

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

现在，我们可以使用新的身份验证重新创建BLD令牌，并将其添加到上面的 stakeMint 中。

```ts
const stakeMint = new web3.PublicKey(
    "EMPTY FOR A MINUTE"
  )
```

## 最后，把它全部测试一下

所以，切换到主目录并运行 npm run create-bld-token 。确保你已经设置为devnet。

检查你的构建脚本，应该是：

`"creat-bld-token": "ts-node tokens/bld/index.ts"`

一旦成功完成，从tokens/bld目录中的cache.json中获取你的新的密钥。

现在，我们终于回到了NFT质押计划，并在 stakeMint 创建中使用这个密钥

```ts
const stakeMint = new web3.PublicKey(
    "MINT KEY FROM CACHE.JSON"
  )
```

现在应该已经设置好并正常工作了，请返回到ts目录，并使用npm run start进行全面测试。如果一切正常，您的控制台应该确认初始化、质押、赎回和解质押。

这真的是很多东西。深呼吸，你正在努力奋斗。这非常具有挑战性，回头再看一遍，复习一下，再做一遍，不管需要多少努力——如果你能掌握这些内容，你就将成为一名优秀的Solana开发者。
