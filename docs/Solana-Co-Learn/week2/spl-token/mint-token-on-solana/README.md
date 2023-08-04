---
sidebar_position: 29
sidebar_label: 🏧 在Solana上铸造代币
sidebar_class_name: green
---

# 🏧 在Solana上铸造代币

是时候让代币与它们的创造者（你）相遇了。我们将从上一节的构建部分继续进行。如果需要，你可以从[这里](https://github.com/buildspace/solana-token-client/tree/solution-without-burn)获取起始代码（确保你在 `solution-without-burn` 分支上）。说了这么多，让我们来创造一些神奇的互联网货币吧。在我们的最终项目中，我们将创建一个代币，你将随着抵押你的社区NFT而逐渐获得它。在那之前，让我们先玩一下实际构建这个铸币过程的过程。现在是发挥你的想象力，尽情享受的好时机。也许你一直想创建自己的模因币 - 现在是你的机会了 🚀

我们将从一个新的Solana客户端开始，转到您的Solana工作区并运行以下命令：

```bash
npx create-solana-client [name] --initialize-keypair
cd [name]
npm i
```

以你的代币来命名你的客户。我要创建`Pizzacoin`，因为我昨天吃了一些非常好吃的披萨。现在是你发挥创意的时候了。也许你想将时间本身进行代币化？你可以创建`HokageCoin`，甚至是`TwitterThreadCoin`。无限的可能性！

 `--initialize-keypair` 标志位完成了我们上次使用 `initalizeKeypair` 进行的所有魔法。运行 `npm run start` ，您将获得一对新的密钥，并获得一些SOL空投。让我们打开货币打印机，让它嗡嗡作响。

 ![](./img/giphy.gif)

 图片：美国联邦储备银行行长杰罗姆·鲍威尔让打印机嗡嗡作响。


 ## 🎁 构建一个代币铸造器


 记住这些步骤：

 - 1. 创建一个`Token Mint`s账户
 - 2. 为特定的钱包创建一个关联的token账户
 - 3. 将Mint代币发送到该钱包中

 这是 `src/index.ts` 中的第一步，在导入之后、在 `main()` 之前放置这个

 ```ts
 // Add the spl-token import at the top
 import * as token from "@solana/spl-token"

 async function createNewMint(
     connection: web3.Connection,
     payer: web3.Keypair,
     mintAuthority: web3.PublicKey,
     freezeAuthority: web3.PublicKey,
     decimals: number
 ): Promise<web3.PublicKey> {

     const tokenMint = await token.createMint(
         connection,
         payer,
         mintAuthority,
         freezeAuthority,
         decimals
     );

     console.log(`The token mint account address is ${tokenMint}`)
     console.log(
         `Token Mint: https://explorer.solana.com/address/${tokenMint}?cluster=devnet`
     );

     return tokenMint;
 }
 ```

这应该看起来很熟悉。如果不是的话，请回到上一节再读一遍 😠

再次 - 这个 `@solana/spl-token` 程序使得这一切变得简单。 `tokenMint` 是`TokenMint`账户的地址。

接下来，我们需要创建关联的令牌账户，在 `createNewMint` 函数之后添加以下内容：

```ts
async function createTokenAccount(
    connection: web3.Connection,
    payer: web3.Keypair,
    mint: web3.PublicKey,
    owner: web3.PublicKey
) {
    const tokenAccount = await token.getOrCreateAssociatedTokenAccount(
        connection,
        payer,
        mint,
        owner
    )

    console.log(
        `Token Account: https://explorer.solana.com/address/${tokenAccount.address}?cluster=devnet`
    )

    return tokenAccount
}
```

这里没有什么新鲜事。需要注意的一点是， `payer` 和 `owner` 可能是不同的 - 你可以付费创建某人的账户。这可能会很昂贵，因为你将为他们的账户支付“租金”，所以确保在进行这项操作之前先做好计算。


最后，mint function：

```ts
async function mintTokens(
  connection: web3.Connection,
  payer: web3.Keypair,
  mint: web3.PublicKey,
  destination: web3.PublicKey,
  authority: web3.Keypair,
  amount: number
) {
  const mintInfo = await token.getMint(connection, mint)

  const transactionSignature = await token.mintTo(
    connection,
    payer,
    mint,
    destination,
    authority,
    amount * 10 ** mintInfo.decimals
  )

  console.log(
    `Mint Token Transaction: https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`
  )
}
```

让我们在主函数中调用这些函数，这是我得到的：

```ts
async function main() {
  const connection = new web3.Connection(web3.clusterApiUrl("devnet"))
  const user = await initializeKeypair(connection)

  console.log("PublicKey:", user.publicKey.toBase58())

  const mint = await createNewMint(
    connection,
    user,           // We'll pay the fees
    user.publicKey, // We're the mint authority
    user.publicKey, // And the freeze authority >:)
    2               // Only two decimals!
  )

  const tokenAccount = await createTokenAccount(
    connection,
    user,
    mint,
    user.publicKey   // Associating our address with the token account
  )

  // Mint 100 tokens to our address
  await mintTokens(connection, user, mint, tokenAccount.address, user, 100)
}
```

运行 `npm run start` - 你应该在终端中看到三个浏览器链接被记录下来。（注意：确保你已经 `@solana/spl-token` ，否则会显示错误。要安装，请在终端中输入 `npm uninstall @solana/spl-token` 和 `npm install @solana/spl-token` 。保存代币Mint账户地址，稍后会用到。打开最后一个链接并向下滚动到代币余额部分：


![](./img/mint-token.png)

你刚刚铸造了一些代币！这些代币可以代表你想要的任何东西。每个代币价值100美元？100分钟的时间？100张猫咪表情包？100片12英寸黄油鸡薄底夹心披萨？这是你的现实。你是唯一控制铸币账户的人，所以代币供应的价值取决于你的决定，可以是毫无价值或者珍贵无比。

在你开始在Solana区块链上重新定义现代金融之前，让我们来看看如何转移和销毁代币：

```ts
async function transferTokens(
  connection: web3.Connection,
  payer: web3.Keypair,
  source: web3.PublicKey,
  destination: web3.PublicKey,
  owner: web3.PublicKey,
  amount: number,
  mint: web3.PublicKey
) {
  const mintInfo = await token.getMint(connection, mint)

  const transactionSignature = await token.transfer(
    connection,
    payer,
    source,
    destination,
    owner,
    amount * 10 ** mintInfo.decimals
  )

  console.log(
    `Transfer Transaction: https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`
  )
}

async function burnTokens(
    connection: web3.Connection,
    payer: web3.Keypair,
    account: web3.PublicKey,
    mint: web3.PublicKey,
    owner: web3.Keypair,
    amount: number
) {

    const mintInfo = await token.getMint(connection, mint)

    const transactionSignature = await token.burn(
        connection,
        payer,
        account,
        mint,
        owner,
        amount * 10 ** mintInfo.decimals
    )

    console.log(
        `Burn Transaction: https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`
    )
}
```

这些函数看起来很长，因为我给每个参数都单独占了一行，实际上它们只有3行而已，哈哈。

使用它们同样简单：

```ts
async function main() {
		...

    const receiver = web3.Keypair.generate().publicKey

    const receiverTokenAccount = await createTokenAccount(
        connection,
        user,
        mint,
        receiver
    )

    await transferTokens(
        connection,
        user,
        tokenAccount.address,
        receiverTokenAccount.address,
        user.publicKey,
        50,
        mint
    )

   await burnTokens(connection, user, tokenAccount.address, mint, user, 25)
}
```

玩弄转账功能，向您的钱包地址发送一些代币，看看它是什么样子。这是我看到的：

![](./img/mint-token-wallet.png)

嗯...为什么显示未知？让我们来修复一下！
