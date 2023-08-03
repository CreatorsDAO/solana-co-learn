---
sidebar_position: 14
sidebar_label: ✍ 将数据写入区块链
sidebar_class_name: green
---

# ✍ 将数据写入区块链

幼儿园毕业的时间到了。我们了解有关阅读的一切 - 您只需对 JSON RPC 端点进行 API 调用即可。让我们写入区块链吧！

TL;DR

- KeyPair是指公钥和私钥的配对。公钥用作指向 Solana 网络上帐户的“地址”。密钥用于验证身份或权限。顾名思义，您应该始终将密钥保密。 @solana/web3.js 提供了用于创建全新密钥对或使用现有密钥构建密钥对的辅助函数。
- Transactions 实际上是调用 Solana 程序的一组指令。每个事务的结果取决于被调用的程序。对链上数据的所有修改都是通过交易发生的。



## 🔐 密钥对

顾名思义，密钥对是一对密钥：公钥和秘密密钥。

- 公钥用作指向 Solana 网络上帐户的“地址”。
- 密钥用于验证身份或权限。顾名思义，您应该始终将密钥保密。


要将数据写入区块链，需要提交交易。可以将其视为数据写入命令，如果不满足某些条件，则可以拒绝该命令。

为了理解交易及其工作原理，您需要知道什么是密钥对。顾名思义，这是一对密钥 - 一个是公共的，另一个是私有的。公钥指向网络上帐户的地址，每个公钥都有一个相应的私钥/秘密密钥。

Web3.js 库有几个用于处理密钥对的辅助函数。您可以生成密钥对并使用它们来获取公钥或私钥。

```typescript
// Create a new keypair
const ownerKeypair = Keypair.generate()

// Get the public key (address)
const publicKey = ownerKeypair.publicKey

// Get the secret key
const secretKey = ownerKeypair.secretKey
```

密钥可以有几种不同的格式

1. 助记词——这是最常见的

```
pill tomorrow foster begin walnut borrow virtual kick shift mutual shoe scatter
```

2. bs58 字符串 - 钱包有时会导出该字符串

```
5MaiiCavjCmn9Hs1o3eznqDEhRwxo7pXiAYez7keQUviUkauRiTMD8DrESdrNjN8zd9mTmVhRvBJeg5vhyvgrAhG
```

3. 字节 - 编写代码时，我们通常将原始字节作为数字数组处理

```
[ 174, 47, 154, 16, 202, 193, 206, 113, 199, 190, 53, 133, 169, 175, 31, 56, 222, 53, 138, 189, 224, 216, 117,173, 10, 149, 53, 45, 73, 251, 237, 246, 15, 185, 186, 82, 177, 240, 148, 69, 241, 227, 167, 80, 141, 89, 240, 121, 121, 35, 172, 247, 68, 251, 226, 218, 48, 63, 176, 109, 168, 89, 238, 135, ]
```

如果您已经有想要使用的密钥对，则可以使用 `Keypair.fromSecretKey()` 函数从密钥创建 `Keypair` 对象。

当涉及到主网时，您将面临真实的金钱和真实的后果。花时间研究管理秘密的各种方法是值得的。您可能不想使用 `.env` 变量注入密钥。这里有[一篇很好的读物](https://security.stackexchange.com/questions/197784/is-it-unsafe-to-use-environmental-variables-for-secret-data?utm_source=buildspace.so&utm_medium=buildspace_project)。

```typescript
//private key as an array of bytes
const secret = JSON.parse(process.env.PRIVATE_KEY ?? "") as number[]
const secretKey = Uint8Array.from(secret)
const keypairFromSecretKey = Keypair.fromSecretKey(secretKey)
```

我们在这里所做的是以字节格式获取私钥并将其解析为数字数组，然后将其转换为 uint 数组。我们使用这个 uint 数组来创建密钥对。您不需要知道它是如何工作的，但您可以在[此处](https://solanacookbook.com/references/keypairs-and-wallets.html)和[此处](https://mattmazur.com/2021/11/19/splitting-a-solana-keypair-into-a-public-and-private-keys/)阅读更多相关信息。


好吧。现在您对 Solana 密钥对的了解比 98% 的 Solana 开发人员还要多 🕶️

回到交易镇。

Solana 网络上数据的所有修改都是通过交易进行的。所有事务都与网络上的程序交互 - 这些程序可以是系统程序或用户构建的程序。事务告诉程序他们想要用一堆指令做什么，如果它们有效，程序就会执行这些操作！

这些说明是什么样子的？他们包含：

1. 您要调用的程序的标识符
2. 将读取和/或写入的帐户数组
3. 数据结构为字节数组，指定给正在调用的程序

如果感觉很多，别担心，随着我们的进展，一切都会顺利！

## 🚆 进行并发送交易

我们来做一笔交易吧。我们将调用系统程序来传输一些SOL。由于我们正在与系统程序进行交互，因此 web3.js 库中的辅助函数使这变得非常简单！

```typescript
const transaction = new Transaction()

const sendSolInstruction = SystemProgram.transfer({
    fromPubkey: sender,
    toPubkey: recipient,
    lamports: LAMPORTS_PER_SOL * amount
})

transaction.add(sendSolInstruction)
```

这就是创建转账交易所需的全部！您可以向一笔交易添加多条指令，它们将按顺序执行。我们稍后会尝试这个😈

web3.js 库还提供了发送交易的功能。以下是我们发送交易的方式：

```typescript
const signature = sendAndConfirmTransaction(
    connection,
    transaction,
    [senderKeypair]
)
```

您知道这里的一切 - 连接是我们通过 JSON RPC 与网络通信的方式。交易就是我们刚刚通过转账指令进行的事情。最后一个参数是签名者数组。这些是“签署”交易的密钥对，以便 Solana 运行时和您发送的程序知道谁授权了该交易。某些交易需要多方签名，因此这里并不总是一个地址。

签名是必要的，因此我们只能进行授权的更改。由于此交易将 SOL 从一个帐户转移到另一个帐户，因此我们需要证明我们控制着尝试发送的帐户。

现在您已经了解了有关交易的所有信息以及我提到的“条件”是什么:)

## ✍ 指令


我们上次交易采取了简单的路线。当使用非本机程序或未内置到 web3 库中的程序时，我们需要非常具体地了解我们正在创建的指令。这是我们需要传递到构造函数以创建指令的类型。一探究竟 -

```typescript
export type TransactionInstructionCtorFields = {
  keys: Array<AccountMeta>;
  programId: PublicKey;
  data?: Buffer;
};
```

本质上，指令包含：
- `AccountMeta` 类型的键数组
- 您调用的程序的公钥/地址
- 可选 - 包含要传递给程序的数据的 Buffer

从Keys开始-该数组中的每个对象代表一个将在事务执行期间读取或写入的帐户。这样节点就知道哪些账户将参与交易，从而加快速度！这意味着您需要了解正在调用的程序的行为，并确保提供数组中所有必要的帐户。


Keys数组中的每个对象必须包含以下内容：
- `pubkey` - 账户的公钥
- `isSigner` - 一个布尔值，表示该帐户是否是交易的签名者
- `isWritable` - 一个布尔值，表示在交易执行期间是否写入帐户

programId 字段是相当不言自明的：它是与您想要交互的程序关联的公钥。一定要知道你想和谁说话！

我们现在将忽略数据字段，并将在将来重新审视它。

下面是实际操作中的示例：

```typescript
async function callProgram(
    connection: web3.Connection,
    payer: web3.Keypair,
    programId: web3.PublicKey,
    programDataAccount: web3.PublicKey
) {
    const instruction = new web3.TransactionInstruction({
        // We only have one key here
        keys: [
            {
                pubkey: programDataAccount,
                isSigner: false,
                isWritable: true
            },
        ],

        // The program we're interacting with
        programId

        // We don't have any data here!
    })

    const sig = await web3.sendAndConfirmTransaction(
        connection,
        new web3.Transaction().add(instruction),
        [payer]
    )
}
```

没那么难！我们得到了这个：P

## ⛽ 交易费用

我们唯一没有讨论过的事情是：费用。 Solana 费用如此之低，您不妨忽略它们！可悲的是，作为开发者，我们必须关注他们，哈哈。 Solana 上的费用行为与以太坊等 EVM 链类似。每次您提交交易时，网络上的某人都会提供空间和处理能力来实现交易。费用激励人们提供空间和处理能力。

主要需要注意的是，交易签名者数组中的第一个签名者始终是负责支付交易费用的人。如果您没有足够的 SOL 会发生什么？交易被取消！

当您在 devnet 或 localhost 上时，您可以使用 CLI 中的 solana airdrop 来获取 devnet SOL。您还可以使用 [SPL 代币水龙头](https://spl-token-faucet.com/)来获取 SPL 代币（稍后我们将了解它们是什么：P）。


## Demo

我们将创建一个脚本来 ping 一个简单的程序，每次 ping 时都会增加一个计数器。该程序存在于 Solana Devnet 上，地址为 `ChT1B39WKLS8qUrkLvFDXMhEJ4F1XZzwUNHUt4AU9aVa`。该程序将计数数据存储在地址为 `Ah9K7dQ8EHaZqcAsgBW8w37yN2eAy3koFmUn4x3CJtod` 的特定帐户中。

###  1. 基础脚手架

让我们从一些基本的脚手架开始。欢迎您以最合适的方式设置您的项目，但我们将使用一个简单的 Typescript 项目，并依赖于 `@solana/web3.js` 包。如果你想使用我们的脚手架，可以在命令行中使用以下命令：

```bash
mkdir -p solana-ping-client/src && \
	cd solana-ping-client && \
	touch src/index.ts && \
	git init && touch .gitignore && \
	npm init -y && \
	npm install --save-dev typescript && \
npm install --save-dev ts-node && \
	npx tsc --init && \
	npm install @solana/web3.js && \
	npm install dotenv && \
	touch .env
```

这会：
1.为项目创建一个新目录，并包含子目录 src
2.将命令行提示符移动到项目目录中
3.在 src 内创建一个 index.ts 文件
4.使用 .gitignore 文件初始化 git 存储库
5.创建一个新的 npm 包
6.添加开发人员对 typescript 的依赖
7.添加对 ts-node 的开发人员依赖
8.创建 .tsconfig 文件
9.安装 @solana/web3.js 依赖项
10.安装 .dotenv 依赖项
11.创建一个 .env 文件

如果您想完全匹配我们的代码，请将 `tsconfig.json` 的内容替换为以下内容：

```json
{
  "compilerOptions": {
    "target": "es5",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "dist"
  },
  "include": [ "./src/**/*" ]
}
```

将以下内容添加到 `.gitignore`：

```
node_modules/
dist/
.env
```

最后，将以下内容添加到 `package.json` 中的脚本对象中：

```
"start": "ts-node src/index.ts"
```

### 2. 生成新的密钥对

在您执行任何操作之前，您需要一个密钥对。让我们跳转到 `index.ts` 文件并生成一个：

```typescript
import web3 = require('@solana/web3.js')
import Dotenv from 'dotenv'
Dotenv.config()

async function main() {
    const newKeypair = web3.Keypair.generate()
    console.log(newKeypair.secretKey.toString())
}

main().then(() => {
    console.log("Finished successfully")
}).catch((error) => {
    console.error(error)
})
```

大部分代码只是正确运行文件的样板。 main() 函数内部的行生成一个新的密钥对并将密钥记录到控制台。

保存此文件后运行 `npm start`，您应该会看到控制台打印出一组数字。该数组代表新密钥对的秘密密钥。请勿使用此密钥对进行主网操作。仅使用此密钥对进行测试。

从控制台日志复制密钥数组并将其作为名为 `PRIVATE_KEY` 的环境变量粘贴到 `.env` 文件中。这样我们就可以在未来的开发中重用这个密钥对，而不是每次运行某些东西时都生成一个新的密钥对。它应该看起来像这样，但数字不同：

```json
PRIVATE_KEY=[56,83,31,62,66,154,33,74,106,59,111,224,176,237,89,224,10,220,28,222,128,36,138,89,30,252,100,209,206,155,154,65,98,194,97,182,98,162,107,238,61,183,163,215,44,6,10,49,218,156,5,131,125,253,247,190,181,196,0,249,40,149,119,246]
```

### 3.从secret初始化密钥对

现在我们已经成功生成了密钥对并将其复制到 `.env` 文件中，我们可以删除 main() 函数内部的代码。

我们很快就会返回到 main() 函数，但现在让我们在 main() 之外创建一个名为`initializeKeypair()` 的新函数。这个新函数的内部：

1. 将 `PRIVATE_KEY` 环境变量解析为 `number[]`
2. 用它来初始化 `Uint8Array`
3. 使用该 `Uint8Array` 初始化并返回密钥对。

```typescript
function initializeKeypair(): web3.Keypair {
    const secret = JSON.parse(process.env.PRIVATE_KEY ?? "") as number[]
    const secretKey = Uint8Array.from(secret)
    const keypairFromSecretKey = web3.Keypair.fromSecretKey(secretKey)
    return keypairFromSecretKey
}
```


### 4. Ping 程序

现在我们有了初始化密钥对的方法，我们需要与 Solana 的 Devnet 建立连接。在`main()`中，我们调用`initializeKeypair()`并创建一个连接：

```typescript
async function main() {
    const payer = initializeKeypair()
    const connection = new web3.Connection(web3.clusterApiUrl('devnet'))
}
```

现在在 main() 之外创建一个名为 `pingProgram()` 的异步函数，其中有两个需要连接的参数和付款人的密钥对作为参数：

```typescript
async function pingProgram(connection: web3.Connection, payer: web3.Keypair) { }
```

在这个函数中，我们需要：

1.创建交易
2.创建指令
3.将指令添加到交易中
4.发送交易

请记住，这里最具挑战性的部分是在说明中包含正确的信息。我们知道我们正在调用的程序的地址。我们还知道该程序将数据写入一个单独的帐户，我们也知道该帐户的地址。让我们将这两个版本的字符串版本作为常量添加到 `index.ts` 文件的顶部：

```typescript
const PROGRAM_ADDRESS = 'ChT1B39WKLS8qUrkLvFDXMhEJ4F1XZzwUNHUt4AU9aVa'
const PROGRAM_DATA_ADDRESS = 'Ah9K7dQ8EHaZqcAsgBW8w37yN2eAy3koFmUn4x3CJtod'
```

现在，在 `pingProgram()` 函数中，我们创建一个新交易，然后为程序帐户初始化一个 `PublicKey`，为数据帐户初始化另一个 `PublicKey`。

```typescript
async function pingProgram(connection: web3.Connection, payer: web3.Keypair) {
    const transaction = new web3.Transaction()

    const programId = new web3.PublicKey(PROGRAM_ADDRESS)
    const programDataPubkey = new web3.PublicKey(PROGRAM_DATA_ADDRESS)
}
```

接下来，让我们创建指令。请记住，该指令需要包含程序的公钥，还需要包含一个数组，其中包含将读取或写入的所有帐户。在此示例程序中，仅需要上面引用的数据帐户。

```typescript
async function pingProgram(connection: web3.Connection, payer: web3.Keypair) {
    const transaction = new web3.Transaction()

    const programId = new web3.PublicKey(PROGRAM_ADDRESS)
    const programDataPubkey = new web3.PublicKey(PROGRAM_DATA_ADDRESS)

    const instruction = new web3.TransactionInstruction({
        keys: [
            {
                pubkey: programDataPubkey,
                isSigner: false,
                isWritable: true
            },
        ],
        programId
    })
}
```

接下来，让我们将指令添加到我们在函数开始时创建的事务中。然后，通过传入连接、交易和付款人来调用 `sendAndConfirmTransaction()`。最后，让我们记录该函数调用的结果，以便我们可以在 Solana Explorer 上查找它。

```typescript
async function pingProgram(connection: web3.Connection, payer: web3.Keypair) {
    const transaction = new web3.Transaction()

    const programId = new web3.PublicKey(PROGRAM_ADDRESS)
    const programDataPubkey = new web3.PublicKey(PROGRAM_DATA_ADDRESS)

    const instruction = new web3.TransactionInstruction({
        keys: [
            {
                pubkey: programDataPubkey,
                isSigner: false,
                isWritable: true
            },
        ],
        programId
    })

    transaction.add(instruction)

    const signature = await web3.sendAndConfirmTransaction(
        connection,
        transaction,
        [payer]
    )

    console.log(signature)
}
```

最后，让我们使用连接和付款人在 main() 中调用 `pingProgram()`：

```typescript
async function main() {
    const payer = initializeKeypair()
    const connection = new web3.Connection(web3.clusterApiUrl('devnet'))
    await pingProgram(connection, payer)
}
```

### 5. 空投

现在使用 `npm start` 运行代码并查看它是否有效。您最终可能会在控制台中看到以下错误：

> Transaction simulation failed: Attempt to debit an account but found no record of a prior credit.

如果您收到此错误，那是因为您的密钥对是全新的，并且没有任何 SOL 来支付交易费用。让我们通过在 main() 中调用 `pingProgram()` 之前添加以下行来解决此问题：

```typescript
await connection.requestAirdrop(payer.publicKey, web3.LAMPORTS_PER_SOL*1)
```

这会将 1 SOL 存入您的帐户，您可以将其用于测试。这在主网上行不通，因为它实际上具有价值。但对于本地和 Devnet 上的测试来说，它非常方便。

### 6.检查Solana浏览器

现在再次运行代码。这可能需要一两分钟，但现在代码应该可以运行，并且您应该看到一个长字符串打印到控制台，如下所示：

```
55S47uwMJprFMLhRSewkoUuzUs5V6BpNfRx21MpngRUQG3AswCzCSxvQmS3WEPWDJM7bhHm3bYBrqRshj672cUSG
```

复制此确认签名。打开浏览器并访问 `https://explorer.solana.com/?cluster=devnet`（URL 末尾的查询参数将确保您在 Devnet 而不是主网上探索交易）。将签名粘贴到 `Solana Devnet` 浏览器顶部的搜索栏中，然后按 Enter 键。您应该看到有关交易的所有详细信息。如果一直滚动到底部，您将看到程序日志，其中显示程序已被 ping 的次数，包括您的 ping。

如果您希望将来更轻松地查看 Solana Explorer 中的事务，只需将 `pingProgram()` 中的 console.log 更改为以下内容：

```
console.log(`You can view your transaction on the Solana Explorer at:\nhttps://explorer.solana.com/tx/${sig}?cluster=devnet`)
```

就像这样，您可以调用 Solana 网络上的程序并将数据写入链！


在接下来的几节课程中，您将学习如何

1.从浏览器安全地执行此操作，而不是运行脚本
2.将自定义数据添加到您的说明中
3.从链上反序列化数据

## 挑战

继续从头开始创建一个脚本，该脚本将允许您将 SOL 从 Devnet 上的一个帐户转移到另一个帐户。请务必打印出交易签名，以便您可以在 Solana Explorer 上查看它。

这个在仓库的`src/main.ts`其实已经实现，但是还是希望您能跟着这个教程的Demo的操作，自己实现一遍。
