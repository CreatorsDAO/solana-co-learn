---
sidebar_position: 32
sidebar_label: 🧬 给你的代币赋予一个身份
sidebar_class_name: green
---

# 🧬 给你的代币赋予一个身份

是时候让令牌与它们的创造者（你）相遇了。我们将从之前的构建部分继续进行。如果需要，你可以从[这里获取起始代码](https://github.com/buildspace/solana-token-client/tree/solution-without-burn)（确保你在 `solution-without-burn` 分支上）。


首先添加新的依赖项：

```bash
npm install @metaplex-foundation/js fs
npm install @metaplex-foundation/mpl-token-metadata
```

我们将使用Metaplex SDK来添加元数据和 `fs` 库，以便我们可以读取代币的标志图片。创建一个名为 `assets` 的新文件夹，并添加您的标志。这将在测试网络上进行，所以尽情享受吧！我选择了一个比萨饼表情符号，所以我把我的文件命名为pizza.png，哈哈。

Metaplex将为我们承担所有繁重的工作，所以请在顶部添加以下导入： `index.ts` ：

```ts
import {
  Metaplex,
  keypairIdentity,
  bundlrStorage,
  toMetaplexFile,
} from "@metaplex-foundation/js"
import {
  DataV2,
  createCreateMetadataAccountV2Instruction,
  createUpdateMetadataAccountV2Instruction,
} from "@metaplex-foundation/mpl-token-metadata"
import * as fs from "fs"
```

现在我们已经准备好了一切，我们将开始处理元数据部分。我们将先进行链下部分，然后创建代币元数据账户。

在高层次上，这是需要发生的事情：

- 1. 使用 `toMetaplexFile()` 将图像文件转换为metaplex文件
- 2. 使用 `metaplex.storage().upload` 上传图片
- 3. 使用 `metaplex.uploadMetadata()` 上传链下元数据
- 4. 使用 `findMetadataPda()` 来推导元数据账户PDA
- 5. 构建类型为 `DataV2` 的链上数据格式
- 6. 使用 `createCreateMetadataAccountV2Instruction` 创建元数据账户的构建指令（不是拼写错误哈哈）
- 7. 发送带有指令的交易以创建令牌元数据账户

这里发生了很多事情，但都是基础的东西。花点时间看一下，你会知道发生了什么！

我们将创建一个单一的函数来完成所有这些操作：

```ts
async function createTokenMetadata(
  connection: web3.Connection,
  metaplex: Metaplex,
  mint: web3.PublicKey,
  user: web3.Keypair,
  name: string,
  symbol: string,
  description: string
) {
  // file to buffer
  const buffer = fs.readFileSync("assets/pizza.png")

  // buffer to metaplex file
  const file = toMetaplexFile(buffer, "pizza.png")

  // upload image and get image uri
  const imageUri = await metaplex.storage().upload(file)
  console.log("image uri:", imageUri)

  // upload metadata and get metadata uri (off chain metadata)
  const { uri } = await metaplex
    .nfts()
    .uploadMetadata({
      name: name,
      description: description,
      image: imageUri,
    })

  console.log("metadata uri:", uri)

  // get metadata account address
  const metadataPDA = metaplex.nfts().pdas().metadata({mint})

  // onchain metadata format
  const tokenMetadata = {
    name: name,
    symbol: symbol,
    uri: uri,
    sellerFeeBasisPoints: 0,
    creators: null,
    collection: null,
    uses: null,
  } as DataV2

  // transaction to create metadata account
  const transaction = new web3.Transaction().add(
    createCreateMetadataAccountV2Instruction(
      {
        metadata: metadataPDA,
        mint: mint,
        mintAuthority: user.publicKey,
        payer: user.publicKey,
        updateAuthority: user.publicKey,
      },
      {
        createMetadataAccountArgsV2: {
          data: tokenMetadata,
          isMutable: true,
        },
      }
    )
  )

  // send transaction
  const transactionSignature = await web3.sendAndConfirmTransaction(
    connection,
    transaction,
    [user]
  )

  console.log(
    `Create Metadata Account: https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`
  )
}
```

确保您更新文件名！此外，不用担心 `nfts()` 的调用 - Metaplex最初是为NFT构建的，最近扩展到了可替代代币的工作。


你会注意到我们在这里留了一堆空的东西 - 那是因为在创建可替代代币时不需要设置这些东西。非可替代代币有更具体的行为需要定义。


我可以逐个解释这个函数，但我只会重复自己哈哈。比起了解它的工作原理，更重要的是知道如何使用它。你需要阅读文档来使用API，以创建类似这样的函数。



我在谈论学会钓鱼，而不仅仅是拿到这条鱼。


你的首要资源应该始终是文档。但是当代码刚刚被编写时，文档可能还不存在。所以你就是这样做 - 在代码被编写时查看它。如果你在Metaplex存储库中查看，你会看到这些内容：

- [Function definition docs for createMetadataAccountV2 instruction](https://metaplex-foundation.github.io/metaplex-program-library/docs/token-metadata/index.html#createCreateMetadataAccountV2Instruction?utm_source=buildspace.so&utm_medium=buildspace_project)
- [Actual function definition for the createCreateMetadataAccountV2Instruction instruction](https://github.com/metaplex-foundation/metaplex-program-library/blob/caeab0f7/token-metadata/js/src/generated/instructions/CreateMetadataAccountV2.ts#L73?utm_source=buildspace.so&utm_medium=buildspace_project)
- [The test for createMetadataAccountV2 instruction](https://github.com/metaplex-foundation/js/blob/c171e1e31d9fe12852afb39e449123339848180e/packages/js/test/plugins/nftModule/createNft.test.ts#L465?utm_source=buildspace.so&utm_medium=buildspace_project)


这并不是什么高深的科学，你需要深入代码并找到你需要的东西。你必须理解代码所构建的基本元素（在这种情况下是Solana指令），这可能需要几次尝试，但回报将是巨大的。


通常我尝试做的是:

- 在Discord中搜索/询问（Metaplex，Anchor等）
- 在Stack Exchange上搜索/提问
- 浏览项目/程序存储库，如果你想弄清楚如何为一个程序设置指令，请参考测试
- 或者，如果没有测试可以参考，可以复制/粘贴GitHub，并希望能在某个地方找到参考资料


希望这能给你一个关于先驱者是如何做到的想法 :)


回到我们按计划进行的建设！

记得之前保存的代币铸造地址吗？在调用这个新函数时，我们将使用它。如果你忘记了代币铸造账户地址，你可以随时通过[浏览器](https://explorer.solana.com/?cluster=devnet)查找钱包地址并检查代币选项卡。


![](./img/token-spl.png)

这是我们更新后的 `main()` 函数在调用 `createTokenMetadata` 函数时的样子


```ts
async function main() {
  const connection = new web3.Connection(web3.clusterApiUrl("devnet"))
  const user = await initializeKeypair(connection)

  console.log("PublicKey:", user.publicKey.toBase58())

  // MAKE SURE YOU REPLACE THIS ADDRESS WITH YOURS!
  const MINT_ADDRESS = "87MGWR6EbAqegYXr3LoZmKKC9fSFXQx4EwJEAczcMpMF"

  // metaplex setup
  const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(user))
    .use(
      bundlrStorage({
        address: "https://devnet.bundlr.network",
        providerUrl: "https://api.devnet.solana.com",
        timeout: 60000,
      })
    )

  // Calling the token
  await createTokenMetadata(
    connection,
    metaplex,
    new web3.PublicKey(MINT_ADDRESS),
    user,
    "Pizza", // Token name - REPLACE THIS WITH YOURS
    "PZA",     // Token symbol - REPLACE THIS WITH YOURS
    "Whoever holds this token is invited to my pizza party" // Token description - REPLACE THIS WITH YOURS
  )
}
```

更新薄荷地址和代币详情并粉碎 `npm run start` ，你会看到类似这样的东西：

```bash
> solana-course-client@1.0.0 start
> ts-node src/index.ts

Current balance is 1.996472479
PublicKey: 5y3G3Rz5vgK9rKRxu3BaC3PvhsMKGyAmtcizgrxojYAA
image uri: https://arweave.net/7sDCnvGRJAqfgEuGOYWhIshfgTC-hNfG4NSjwsKunQs
metadata uri: https://arweave.net/-2vGrM69PNtb2YaHnOErh1_006D28JJa825CIcEGIok
Create Metadata Account: https://explorer.solana.com/tx/4w8XEGCJY82MnBnErW9F5r1i5UL5ffJCCujcgFeXS8TTdZ6tHBEMznWnPoQXVcsPY3WoPbL2Nb1ubXCUJWWt2GWi?cluster=devnet
Finished successfully
```

一切必要的事情都已经一次性完成！随意点击Arweave链接 - 它就像是去中心化和永久的AWS S3/Google Cloud存储，会展示给你上传的资产是什么样子。

如果你回到浏览器上的代币铸造账户，你会看到一个漂亮的新图标和名称。这是我的：

![](./img/pizaer.png)

正如一位智者曾经说过，

![](./img/spider-man-pizza-time.gif)

令牌元数据程序最酷的部分之一是更新起来非常简单。你只需要将交易从 `createCreateMetadataAccountV2Instruction` 更改为 `createUpdateMetadataAccountV2Instruction` 即可：

```ts
async function updateTokenMetadata(
  connection: web3.Connection,
  metaplex: Metaplex,
  mint: web3.PublicKey,
  user: web3.Keypair,
  name: string,
  symbol: string,
  description: string
) {

  ...

  // transaction to update metadata account
  const transaction = new web3.Transaction().add(
    createUpdateMetadataAccountV2Instruction(
      {
        metadata: metadataPDA,
        updateAuthority: user.publicKey,
      },
      {
        updateMetadataAccountArgsV2: {
          data: tokenMetadata,
          updateAuthority: user.publicKey,
          primarySaleHappened: true,
          isMutable: true,
        },
      }
    )
  )

  // Everything else remains the same
  ...
}
```

你的代币已经准备就绪！记得要传播爱心哦。也许可以给你的朋友或者Discord服务器中的其他建设者发送一些代币。在 #progress 频道分享你的地址，这样别人就可以给你空投他们的代币啦 :D



## 🚢 船舶挑战


年轻的玻璃咀嚼者，是时候从头开始重新实施课程概念了。

尝试构建一个包含以下指令的单个交易：

- 创建一个新的代币铸造
- 为代币铸造创建一个元数据账户
- 创建一个令牌账户
    - 如果可以的话，尝试有条件地添加这个指令
    - 请参考 `getOrCreateAssociatedTokenAccount` 的实施方案
    - Hint: [https://github.com/solana-labs/solana-program-library/blob/48fbb5b7c49ea35848442bba470b89331dea2b2b/token/js/src/actions/getOrCreateAssociatedTokenAccount.ts#L35](https://github.com/solana-labs/solana-program-library/blob/48fbb5b7c49ea35848442bba470b89331dea2b2b/token/js/src/actions/getOrCreateAssociatedTokenAccount.ts#L35)
- Mint tokens

这基本上就是你在生产中要做的事情 - 一切都一次性地一起完成。


> Note
> 这比平常更加自由。挑战自己。尝试一下。真正努力去理解每个拼图的部分。

要按照我们设想的方式进行操作，您需要逐步构建每个指令，然后将它们全部添加到一个事务中。在您自己尝试解决这个问题后，您可以在[该存储库](https://github.com/Unboxed-Software/solana-token-metadata?utm_source=buildspace.so&utm_medium=buildspace_project)的挑战分支中查看一个可能的实现。

![](./img/program-log.png)

额外提示：[https://solana-labs.github.io/solana-program-library/token/js/modules.html](https://solana-labs.github.io/solana-program-library/token/js/modules.html) - 查看源代码，不要使用辅助函数。

## Reference

- [How to Create a Fungible SPL token with the New Metaplex Token Standard
](https://www.quicknode.com/guides/solana-development/spl-tokens/how-to-create-a-fungible-spl-token-with-the-new-metaplex-token-standard)
- [Token Program](https://spl.solana.com/token)
- [与代币交互](https://davirain-su.github.io/solana-cookbook-zh/references/token.html)
