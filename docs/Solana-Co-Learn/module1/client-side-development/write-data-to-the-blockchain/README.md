---
sidebar_position: 14
sidebar_label: ✍将数据写入区块链
sidebar_class_name: green
---

# ✍将数据写入区块链

是时候毕业了幼儿园。我们对阅读了如指掌 - 你只需对JSON RPC端点进行API调用。让我们来写入区块链吧！

## 🔐 密钥对

要将数据写入区块链，需要提交交易。可以将其视为数据写入命令，如果不满足某些条件，则可以拒绝该命令。

为了理解交易及其工作原理，您需要知道什么是密钥对。顾名思义，这是一对密钥 - 一个是公共的，另一个是私有的。公钥指向网络上帐户的地址，每个公钥都有一个相应的私钥/秘密密钥。

`Web3.js` 库有几个用于处理密钥对的辅助函数。您可以生成密钥对并使用它们来获取公钥或私钥。

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

```bash
pill tomorrow foster begin walnut borrow virtual kick shift mutual shoe scatter
```

2. bs58 字符串 - 钱包有时会导出该字符串

```bash
5MaiiCavjCmn9Hs1o3eznqDEhRwxo7pXiAYez7keQUviUkauRiTMD8DrESdrNjN8zd9mTmVhRvBJeg5vhyvgrAhG
```

3. `Bytes` - 编写代码时，我们通常将原始字节作为数字数组处理

```bash
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

我们在这里所做的是以字节格式获取私钥并将其解析为数字数组，然后将其转换为 uint 数组。我们使用这个 uint 数组来创建密钥对。**您不需要知道它是如何工作的**，但您可以在[此处](https://solanacookbook.com/references/keypairs-and-wallets.html)和[此处](https://mattmazur.com/2021/11/19/splitting-a-solana-keypair-into-a-public-and-private-keys/)阅读更多相关信息。


好吧。现在您对 Solana 密钥对的了解比 98% 的 Solana 开发人员还要多 🕶️

回到交易城。

所有对Solana网络上的数据的修改都是通过交易进行的。所有交易都与网络上的程序进行交互 - 这些程序可以是系统程序或用户构建的程序。交易告诉程序它们想要通过一系列指令做什么，如果它们是有效的，程序就会执行这些操作！

这些指示看起来像什么鬼东西？它们包括：

1. 您打算调用的程序的标识符
2. 将要读取和/或写入的账户数组
3. 以字节数组形式结构化的数据，根据被调用的程序进行指定

如果这感觉很多，别担心，随着我们开始，一切都会明朗起来的！

## 🚆 创建并发送一笔交易

让我们进行一笔交易。我们将调用系统程序来转移一些SOL。由于我们正在与系统程序进行交互，`web3.js`库中有一些辅助函数，使这变得非常简单！

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

`web3.js` 库还提供了发送交易的功能。以下是我们发送交易的方式：

```typescript
const signature = sendAndConfirmTransaction(
    connection,
    transaction,
    [senderKeypair]
)
```

你在这里了解一切 - 连接是我们通过 JSON RPC 与网络进行通信的方式。交易是我们刚刚使用转账指令创建的事务。最后一个参数是签名者的数组。这些是“签署”事务的密钥对，以便 Solana 运行时和你发送事务的程序知道谁授权了该事务。某些交易需要多方签名，所以这里不总是一个地址。

签名是必要的，这样我们才能进行授权的更改。由于此交易将SOL从一个账户转移到另一个账户，我们需要证明我们控制着要发送的账户。

现在你已经了解了所有关于交易的内容，以及我提到的“条件”是什么 :)


## ✍ 指令


我们在上次的交易中有点走捷径。当与非本地程序或不在web3库中构建的程序一起工作时，我们需要非常明确我们所创建的指令。这是我们需要传递给构造函数以创建指令的类型。看一下吧

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
- 可选 - 包含要传递给程序的数据的 `Buffer`

从`Keys`开始-该数组中的每个对象代表一个将在事务执行期间读取或写入的帐户。这样节点就知道哪些账户将参与交易，从而加快速度！这意味着您需要了解正在调用的程序的行为，并确保提供数组中所有必要的帐户。


`Keys`数组中的每个对象必须包含以下内容：
- `pubkey` - 账户的公钥
- `isSigner` - 一个布尔值，表示该帐户是否是交易的签名者
- `isWritable` - 一个布尔值，表示在交易执行期间是否写入帐户

`programId` 字段是相当不言自明的：它是与您想要交互的程序关联的公钥。得知您想要与谁交谈！

我们暂时不会考虑数据字段，将来会重新审视它。

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

唯一我们还没有讨论的事情：费用。Solana的费用非常低，你可以忽略它们！可惜作为开发者，我们必须关注它们哈哈。Solana的费用行为类似于以太坊等EVM链。每次你提交一笔交易，网络上的某个人提供空间和处理能力来实现它。费用激励人们提供这些空间和处理能力。


需要注意的主要事项是，在交易的签名者数组中，第一个签名者始终负责支付交易费用。如果你没有足够的SOL会怎么样？交易将被取消！


当你在`devnet`或`LocalHost`上时，你可以使用CLI中的 Solana airdrop 来获取`devnet SOL`。你还可以使用[SPL代币水龙头](https://spl-token-faucet.com/)来获取`SPL`代币（我们稍后会了解这些是什么:P）。
