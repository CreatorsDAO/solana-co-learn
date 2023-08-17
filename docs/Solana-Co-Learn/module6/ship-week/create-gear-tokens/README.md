---
sidebar_position: 101
sidebar_label: ⚙ 创建齿轮代币
sidebar_class_name: green
---

# ⚙ 创建齿轮代币

让我们来看一种可能的齿轮代币解决方案。

我们正在讲解的解决方案代码位于[Buildoors前端代码库](https://github.com/jamesrp13/buildspace-buildoors/tree/solution-simple-gear?utm_source=buildspace.so&utm_medium=buildspace_project)的` solution-simple-gear` 分支上。如果你还没有尝试自己构建，请尽量避免从解决方案代码中复制粘贴。

我们将查看两个不同的代码库。如果你还记得，我们在客户端项目中创建了`BLD`代币和NFT。恰好我们在那里完成了这项工作，如果我们愿意，我们可以将其转移到程序项目中。

你可以在 `/tokens/gear/assets` 文件夹中找到齿轮的图像。我们选择将其制作为可替代资产，或者带有关联元数据和0位小数的SPL代币，而不是NFT，这样它们就不仅限于一个单位。

`/tokens/gear/index.ts `内的脚本负责生成与这些资产相关的货币，并将其存储在同一文件夹中的 `cache.json` 文件中。

在脚本内部，向下滚动你会看到我们的主要函数。

```ts
async function main() {
  const connection = new web3.Connection(web3.clusterApiUrl("devnet"))
  const payer = await initializeKeypair(connection)

  await createGear(
    connection,
    payer,
    new web3.PublicKey("6GE3ki2igpw2ZTAt6BV4pTjF5qvtCbFVQP7SGPJaEuoa"),
    ["Bow", "Glasses", "Hat", "Keyboard", "Mustache"]
  )
}
```

我们传入的公钥是为了我们的程序，以及铸币厂的名称列表，这些名称需要与资产文件夹中的内容相对应。

如果你在函数中向上滚动，你会看到它首先用一个空对象开始，其中将放置薄荷糖。

```ts
let collection: any = {}
```

然后我们创建我们的`metaplex`对象，接着是一个循环，该循环为每个铸币执行脚本的功能。

它从一个空的薄荷数组开始，这样我们就可以为每个资产添加多个薄荷。

```ts
let mints: Array<string> = []
```

然后我们获取图像缓冲区并将其上传到Arweave。

```ts
const imageBuffer = fs.readFileSync(`tokens/gear/assets/${assets[i]}.png`)
const file = toMetaplexFile(imageBuffer, `${assets[i]}.png`)
const imageUri = await metaplex.storage().upload(file)
```

在那之后，只要你想要不同的经验等级，我们就循环执行相应的次数，对于这个装备来说。我们的示例只执行一次，因为我们的经验等级从10开始并结束。如果你想要每个等级的五个装备，只需将上限增加到`50`， `xp <= 50 `。

```ts
for (let xp = 10; xp <= 10; xp += 10)...
```

一旦进入循环，我们获取将在后续分配的`Mint Auth`，这是我们想要进行铸币的程序中的`PDA` - 用于战利品箱程序的`PDA`。

```ts
const [mintAuth] = await web3.PublicKey.findProgramAddress(
    [Buffer.from("mint")],
    programId
  )
```

我们随后创建了一个全新的代币，并将其小数位设置为0，因为它是一种不可分割的资产。

```ts
const tokenMint = await token.createMint(
    connection,
    payer,
    payer.publicKey,
    payer.publicKey,
    0
  )

```

一旦创建了该薄荷，我们将其推入薄荷数组中。

```ts
mints.push(tokenMint.toBase58())
```

接下来，我们会上传我们的链下元数据，其中包括名称、描述、图像链接和两个属性。

```ts
const { uri } = await metaplex
    .nfts()
    .uploadMetadata({
      name: assets[i],
      description: "Gear that levels up your buildoor",
      image: imageUri,
      attributes: [
        {
          trait_type: "xp",
          value: `${xp}`,
        },
      ],
    })
    .run()
```

然后我们获取该薄荷的元数据`PDA`。

```ts
const metadataPda = await findMetadataPda(tokenMint)
```

接下来，我们创建元数据的链上版本。

```ts
const tokenMetadata = {
    name: assets[i],
    symbol: "BLDRGEAR",
    uri: uri,
    sellerFeeBasisPoints: 0,
    creators: null,
    collection: null,
    uses: null,
  } as DataV2
```

按照之前的做法，继续创建我们的`V2`指令。

```ts
const instruction = createCreateMetadataAccountV2Instruction(
    {
      metadata: metadataPda,
      mint: tokenMint,
      mintAuthority: payer.publicKey,
      payer: payer.publicKey,
      updateAuthority: payer.publicKey,
    },
    {
      createMetadataAccountArgsV2: {
        data: tokenMetadata,
        isMutable: true,
      },
    }
  )
```

你会注意到我们的付款人是我们的薄荷权威，我们很快会进行更改。

我们随后创建一个交易，添加指令并发送。

```ts
const transaction = new web3.Transaction()
transaction.add(instruction)

const transactionSignature = await web3.sendAndConfirmTransaction(
  connection,
  transaction,
  [payer]
)
```

现在我们将权限更改为`mintAuth`，它是在战利品箱程序上的`PDA`。

```ts
await token.setAuthority(
    connection,
    payer,
    tokenMint,
    payer.publicKey,
    token.AuthorityType.MintTokens,
    mintAuth
  )
}
```

最后，在那个内循环之外，我们将薄荷糖放入数组中，所以第一个是“`Bow`”（作为我们的例子）。

```ts
collection[assets[i]] = mints
```

最后，在所有的循环之外，我们将整个集合写入文件，对于我们的实现来说，这个集合只有五个项目。

```ts
fs.writeFileSync("tokens/gear/cache.json", JSON.stringify(collection))
```

这只是一种方法，它是一个相当简单的解决方案。如果你还没有编写代码，并且你看了这个视频，请尝试自己完成，然后再回来使用解决方案代码（如果需要的话）。
