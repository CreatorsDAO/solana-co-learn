---
sidebar_position: 15
sidebar_label: 📝 构建一个交互脚本
sidebar_class_name: green
---

# 📝 构建一个互动脚本

准备好戳一下Solana网络了吗？我们将编写一个脚本，生成一个密钥对，用devnet SOL资金进行充值，并与Solana网络上的现有程序进行交互。

这个程序是一个简单的“ping”计数器：我们击中它，它记录我们对它的ping，并增加一个计数器。我们以后会介绍Rust和我们自己的程序，现在我们将使用JS/TS。

## 🚧 在本地设置 Solana 客户端

让我们改变一下方式 - 我们将离开React/Next.js，在这里使用纯TypeScript构建一个本地客户端。这比搭建前端并构建大量的用户界面要快得多。你可以在一个单独的TS文件中工作，并异步运行它与网络进行交互。


在您的Solana工作区中创建一个新文件夹，并使用这个方便的命令来设置本地客户端：

```bash
npx create-solana-client solana-intro-client
```

如果它询问您是否要安装 `create-solana-client` 软件包，请说“是”。


现在只需导航到目录并在 VS Code 中启动它

```bash
cd solana-intro-client
code .
```

## ⚙ 设置客户端脚本

`create-solana-client` 的美妙之处在于我们可以立即开始编写客户端代码！跳转到 `index.ts` 并导入我们的依赖项并添加此 `initializeKeypair` 函数：

```ts
// We're adding these
import * as Web3 from '@solana/web3.js';
import * as fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
}

main()
  .then(() => {
    console.log('Finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
```

如果您在终端中运行 `npm start` ，您将看到脚本已运行！只需一个命令即可设置 Solana 客户端。

让我们添加一个 `initializeKeypair` 函数，如果我们没有密钥对，它将自动为我们创建一个密钥对。在导入之后添加以下内容：

```ts
async function initializeKeypair(connection: Web3.Connection): Promise<Web3.Keypair> {
  if (!process.env.PRIVATE_KEY) {
    console.log('Generating new keypair... 🗝️');
    const signer = Web3.Keypair.generate();

    console.log('Creating .env file');
    fs.writeFileSync('.env', `PRIVATE_KEY=[${signer.secretKey.toString()}]`);

    return signer;
  }

  const secret = JSON.parse(process.env.PRIVATE_KEY ?? '') as number[];
  const secretKey = Uint8Array.from(secret);
  const keypairFromSecret = Web3.Keypair.fromSecretKey(secretKey);
  return keypairFromSecret;
}
```

这是一个非常智能的函数 - 它会检查您的 `.env` 文件中是否有私钥，如果没有，它就会创建一个！

您已经熟悉这里发生的一切 - 我们调用 `Web3.Keypair.generate()` 函数并将结果写入本地 [`dotenv`](https://www.npmjs.com/package/dotenv) 文件。创建后，我们将返回密钥对，以便我们可以在脚本的其余部分中使用它。

更新您的 main 函数并使用 `npm start` 运行脚本来测试它：

```ts
async function main() {
  const connection = new Web3.Connection(Web3.clusterApiUrl('devnet'));
  const signer = await initializeKeypair(connection);

  console.log("Public key:", signer.publicKey.toBase58());
}
```

您应该在终端中看到类似这样的内容:

```bash
> solana-course-client@1.0.0 start
> ts-node src/index.ts

Generating new keypair... 🗝️
Creating .env file
Public key: jTAsqBrjsYp4uEJNmED5R66gHPnFW4wvQrbmFG3c4QS
Finished successfully
```

好的！如果您检查 `.env` 文件，您将看到一个字节格式的私钥！该密钥与文件一样保密。如果您将此文件推送到公共 GitHub 存储库，任何人都可以访问其中的资金，因此请确保您不要将其用于真正的货币用途，哈哈。

再次运行 `npm start` 将使用它而不是创建一个新的。

保持测试帐户独立非常重要，这就是为什么这个脚本特别酷的原因 - 它消除了创建和管理测试钱包的麻烦。

现在，如果我们也能自动获取 devnet SOL 就好了。哦等等，我们可以！

快来看看这个超酷的空投功能-

```ts
async function airdropSolIfNeeded(
  signer: Web3.Keypair,
  connection: Web3.Connection
) {
  const balance = await connection.getBalance(signer.publicKey);
  console.log('Current balance is', balance / Web3.LAMPORTS_PER_SOL, 'SOL');

  // 1 SOL should be enough for almost anything you wanna do
  if (balance / Web3.LAMPORTS_PER_SOL < 1) {
    // You can only get up to 2 SOL per request
    console.log('Airdropping 1 SOL');
    const airdropSignature = await connection.requestAirdrop(
      signer.publicKey,
      Web3.LAMPORTS_PER_SOL
    );

    const latestBlockhash = await connection.getLatestBlockhash();

    await connection.confirmTransaction({
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      signature: airdropSignature,
    });

    const newBalance = await connection.getBalance(signer.publicKey);
    console.log('New balance is', newBalance / Web3.LAMPORTS_PER_SOL, 'SOL');
  }
}
```

这可能看起来有点压力山大，但实际上你对这里发生的一切都了如指掌！我们正在利用我们的老朋友 `getBalance` 来检查我们是否破产，如果是的话，我们就会使用 `requestAidrop` 函数让钱滚滚而来。

区块哈希和区块高度是区块标识符，用于向网络传达我们是最新的并且不会发送过时的交易。

不过，不要尝试循环运行它 - 水龙头有一个冷却时间，如果你继续向它发送垃圾邮件，请求将会失败，哈哈。

确保在创建/获取密钥对后更新 `initializeKeypair` 函数以调用空投。

```ts
// When generating a keypair
 await airdropSolIfNeeded(signer, connection);

 // When creating it from the secret key
 await airdropSolIfNeeded(keypairFromSecret, connection);
```


现在，如果您 `npm run start` ，您将看到空投：

```bash
Current balance is 0 SOL
Airdropping 1 SOL
New balance is 1 SOL
Public key: 7Fw3bXskk5eonycvET6BSufxAsuNudvuxF7MMnS8KMqX
```

我们准备好了 rrrrrrrrrrrrumble 🥊

## 🖱 调用链上程序

是时候让我们的客户发挥作用了。我们将向Solana网络上的现有程序写入数据。人们认为Solana的开发只是关于用Rust编写程序。不对！大部分区块链开发是与现有程序进行交互。

你可以构建数百个只与已有程序进行交互的应用。这就是乐趣开始的地方！我们会保持简单 - 我们的客户端会发送一个计数器程序，该程序会递增一个计数器。你将告诉网络上的每个人你是一个开发者。

我们需要告诉客户它将与哪些程序进行交互。从顶部开始，将这些地址添加在导入语句的下方：

```ts
const PROGRAM_ID = new Web3.PublicKey("ChT1B39WKLS8qUrkLvFDXMhEJ4F1XZzwUNHUt4AU9aVa")
const PROGRAM_DATA_PUBLIC_KEY = new Web3.PublicKey("Ah9K7dQ8EHaZqcAsgBW8w37yN2eAy3koFmUn4x3CJtod")
```


`PROGRAM_ID` 是ping程序本身的地址。 `PROGRAM_DATA_PUBLIC_KEY` 是存储程序数据的帐户的地址。请记住 - 可执行代码和状态数据单独存储在 Solana 上！

然后添加此函数以在任何地方 ping 程序：

```ts
async function pingProgram(connection: Web3.Connection, payer: Web3.Keypair) {
  const transaction = new Web3.Transaction()
  const instruction = new Web3.TransactionInstruction({
    // Instructions need 3 things

    // 1. The public keys of all the accounts the instruction will read/write
    keys: [
      {
        pubkey: PROGRAM_DATA_PUBLIC_KEY,
        isSigner: false,
        isWritable: true
      }
    ],

    // 2. The ID of the program this instruction will be sent to
    programId: PROGRAM_ID

    // 3. Data - in this case, there's none!
  })

  transaction.add(instruction)
  const transactionSignature = await Web3.sendAndConfirmTransaction(connection, transaction, [payer])

  console.log(
    `Transaction https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`
    )
}
```

这并不像看起来那么复杂！你已经知道了这一部分

- 我们进行一笔交易
- 我们制作一份指令
- 我们将指令添加到交易中
- 我们将交易发送到网络！

查看上面的代码注释 - 我回顾一下指令的三个部分。

这里的重点是 `keys` 值 - 它是一个包含每个账户元数据的数组，这个指令将从中读取或写入。在我们的情况下，我告诉你这个指令将处理哪些账户。

你需要知道这将是什么 - 你可以通过阅读程序本身或其文档来了解。如果你不知道这一点，就无法与程序进行交互，因为指令将无效。你将发送一个会触及数据账户的交易，但你不会告诉运行时是哪个账户，所以它将被丢弃。

可以将其想象为尝试开车前往没有 GPS 的地址。您知道自己想去哪里，但不知道到达那里的路线。

由于此写入不需要数据帐户的签名，因此我们将  `isSigner` 设置为 `false`。 `isWritable` 为 `true`，因为该帐户正在被写入！

通过告诉网络我们需要与哪些帐户交互以及我们是否正在向它们写入数据，Solana 运行时就知道可以并行运行哪些事务。这就是 Solana 如此之快的部分原因！

将此函数调用 `await pingProgram(connection, signer)` 添加到 `main()` 并使用 `npm start` 运行脚本。访问记录的资源管理器链接，您将在页面底部看到您编写的数据（您可以忽略其他所有内容）-

![](./img/ping-solana.png)

您刚刚将数据写入区块链。那有多容易？

这可能看起来很简单，但您确实已经取得了成功。当推特上的每个人都在大喊猴子图片时，你正在建造GGGGGGGGGGGGGGGGGG。您在本节中学到的内容 - 从 Solana 网络读取和写入数据，足以制作价值 1 万美元的产品。想象一下在这个项目结束时你能做什么 🤘

## 🚢 Ship 挑战 - 一种SOL转账脚本

既然我们已经一起学习了如何将交易发送到网络，现在轮到你独立尝试了。

按照上一步骤的类似流程，从头开始创建一个脚本，使您能够在Devnet上将SOL从一个账户转移到另一个账户。确保打印出交易签名，以便您可以在Solana Explorer上查看。

想想到目前为止你学到了什么 -

- 将数据写入网络是通过事务进行的
- 交易需要指令
- 指令告诉网络它们触及哪些程序以及它们的功能
- 通过系统程序进行SOL的转移（嗯，我想知道它叫什么。🤔 转移？）

您在这里所需要做的就是找出确切的函数名称是什么以及指令应该是什么样子。我会从谷歌开始：P

附：如果您确定已经弄清楚了，但转账仍然失败，则可能是您转账太少 - 尝试至少转账 0.1 SOL。

像往常一样，在引用解决方案代码之前尝试自己执行此操作。当您确实需要参考解决方案时，[请查看此处](https://github.com/RustyCab/solana-send-sol-client)。 👀
