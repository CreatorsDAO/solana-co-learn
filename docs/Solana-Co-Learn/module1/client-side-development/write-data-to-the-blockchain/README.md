---
sidebar_position: 14
sidebar_label: ✍将数据写入区块链
sidebar_class_name: green
tags:
  - client-side-development
  - solana
  - rpc
---

# ✍将数据写入区块链

我们已经熟练掌握了区块链的阅读操作，现在开始学习如何将数据写入`Solana`区块链。

## 🔐 密钥对

要将数据写入区块链，我们需要提交一笔交易，这就像是一条写入命令。如果不满足某些条件，该命令就会被拒绝。

要深入理解交易及其工作原理，你需要先了解密钥对。

密钥对包括一对密钥:

- 一个公钥，公钥代表网络上的账户地址。
- 一个私钥，每个公钥都与一个相应的私钥/秘密密钥配对。

`Web3.js` 库提供了几个用于处理密钥对的辅助函数。你可以使用它们生成密钥对，并获取公钥或私钥。

```typescript
// 创建一个新的密钥对
const ownerKeypair = Keypair.generate()

// 获取公钥（地址）
const publicKey = ownerKeypair.publicKey

// 获取私钥
const secretKey = ownerKeypair.secretKey
```

密钥可以有以下几种格式：

1. 助记词——这是最常用的格式：

```bash
pill tomorrow foster begin walnut borrow virtual kick shift mutual shoe scatter
```

2. `bs58` 字符串 - 有时钱包会导出此格式的字符串：

```bash
5MaiiCavjCmn9Hs1o3eznqDEhRwxo7pXiAYez7keQUviUkauRiTMD8DrESdrNjN8zd9mTmVhRvBJeg5vhyvgrAhG
```

3. `Bytes` - 在编程时，我们通常将原始字节作为数字数组处理：

```bash
// 字节数组示例
[ 174, 47, 154, 16, 202, 193, 206, 113, 199, 190, 53, 133, 169, 175, 31, 56, 222, 53, 138, 189, 224, 216, 117,173, 10, 149, 53, 45, 73, 251, 237, 246, 15, 185, 186, 82, 177, 240, 148, 69, 241, 227, 167, 80, 141, 89, 240, 121, 121, 35, 172, 247, 68, 251, 226, 218, 48, 63, 176, 109, 168, 89, 238, 135, ]
```

如果你已经有了要使用的密钥对，你可以使用 `Keypair.fromSecretKey()` 函数从密钥创建 `Keypair` 对象。

当涉及到主网时，你需要面对真实的金钱和后果。因此，投入时间研究秘密管理的各种方法是值得的。你可能不想使用 `.env` 变量来注入密钥。[这里](https://security.stackexchange.com/questions/197784/is-it-unsafe-to-use-environmental-variables-for-secret-data?utm_source=buildspace.so&utm_medium=buildspace_project)有一篇关于这方面的好文章。

```typescript
// 以字节数组的形式私钥
const secret = JSON.parse(process.env.PRIVATE_KEY ?? "") as number[]
const secretKey = Uint8Array.from(secret)
const keypairFromSecretKey = Keypair.fromSecretKey(secretKey)
```

我们在这里所做的是将私钥的字节格式解析为数字数组，然后转换为`Uint`数组。我们使用这个`Uint`数组来创建密钥对。**你不需要深入了解它是如何工作的**，但你可以在[这里](https://solanacookbook.com/references/keypairs-and-wallets.html)和[这里](https://mattmazur.com/2021/11/19/splitting-a-solana-keypair-into-a-public-and-private-keys/)阅读更多相关信息。

好了，现在你对`Solana`密钥对的了解已经超过了98%的`Solana`开发人员 🕶️

让我们回到交易的话题。

在`Solana`网络上，所有对数据的修改都是通过交易来完成的。所有交易都与网络上的程序交互，这些程序可以是系统程序或用户构建的程序。交易向程序表达你想要执行的一系列指令，如果它们有效，程序就会执行这些操作！

这些指令到底是什么样子的呢？它们包括：

1. 你打算调用的程序的标识符。
2. 将要读取和/或写入的账户数组。
3. 以字节数组形式结构化的数据，根据被调用的程序进行指定。

如果这听起来很复杂，不要担心，随着我们的深入学习，一切都会变得明朗的！

## 🚆 创建并发送一笔交易

我们来进行一笔交易吧！我们要调用系统程序来转移一些`SOL`代币。幸好，`web3.js`库中提供了一些辅助函数，使得这个过程变得非常便捷！

```typescript
const transaction = new Transaction()

const sendSolInstruction = SystemProgram.transfer({
    fromPubkey: sender,
    toPubkey: recipient,
    lamports: LAMPORTS_PER_SOL * amount
})

transaction.add(sendSolInstruction)
```

以上代码便是创建转账交易所需的全部内容。你还可以向交易中添加多个指令，系统会按顺序执行它们。稍后我们会试试这个功能😈。

`web3.js`库还能帮助我们发送交易。下面是我们发送交易的方法：

```typescript
const signature = sendAndConfirmTransaction(
    connection,
    transaction,
    [senderKeypair]
)
```

这里的内容涵盖了所有你需要了解的事项。
- `connection`是我们通过`JSON RPC`与网络通信的方式；
- `transaction`是我们刚刚使用转账指令创建的任务；
- 最后一个参数是签名者的数组。这些密钥对就是“签署”事务的凭证，这样`Solana`的运行时环境和你的程序就知道谁授权了该事务。某些交易可能需要多个地址签名。

签名是授权更改的必要步骤。因为这笔交易会将`SOL`从一个账户转移到另一个账户，我们需要证明我们确实掌控着要发送的账户。

现在，你已经了解了所有关于交易的知识，还知道了我提到的“条件”是什么含义了 :)

## ✍ 指令

我们在之前的交易中有所简化。当我们与非本地程序或不在`web3`库中构建的程序协同工作时，我们需要明确指定我们所创建的指令。以下是创建指令所需传递给构造函数的类型。我们来看一下：

```typescript
export type TransactionInstructionCtorFields = {
  keys: Array<AccountMeta>;
  programId: PublicKey;
  data?: Buffer;
};
```

本质上，一个指令包括：
- 一个`AccountMeta`类型的键数组
- 要调用的程序的公钥/地址
- 可选项 - 一个包含要传递给程序的数据的`Buffer`

从`keys`开始，这个数组中的每个对象都代表着在事务执行期间将被读取或写入的一个账户。这样，节点就能了解哪些账户将参与交易，进而提高处理速度！这意味着你需要清楚了解你调用的程序的操作，并确保在数组中提供所有必要的账户。

`Keys`数组中的每个对象必须包括以下内容：
- `pubkey` - 账户的公钥
- `isSigner` - 一个布尔值，表示该账户是否是交易的签名者
- `isWritable` - 一个布尔值，表示该账户在交易执行期间是否可写

`programId`字段则相对直观：它是与你想要交互的程序关联的公钥。它就是告诉系统你想要与谁沟通！

关于数据字段，我们暂时不去深究，将来会重新审查它。

下面是实际操作中的示例：

```typescript
async function callProgram(
    connection: web3.Connection,
    payer: web3.Keypair,
    programId: web3.PublicKey,
    programDataAccount: web3.PublicKey
) {
    const instruction = new web3.TransactionInstruction({
        // 这里我们只有一个键
        keys: [
            {
                pubkey: programDataAccount,
                isSigner: false,
                isWritable: true
            },
        ],

        // 我们要互动的程序
        programId

        // 这里我们没有任何数据！
    })

    const sig = await web3.sendAndConfirmTransaction(
        connection,
        new web3.Transaction().add(instruction),
        [payer]
    )
}
```

看，没那么难吧！我们搞定了：P

## ⛽ 交易费用

有一件事我们还没有讨论，那就是费用。`Solana`的交易费用非常低，以至于你几乎可以忽略它们！但可惜的是，作为开发者，我们还是必须关心这些费用的。`Solana`的费用机制与以太坊等EVM链相似。每当你提交一笔交易时，网络上总有人为其提供存储空间和处理能力。费用的存在就是为了激励人们提供这些资源。

主要需要注意的一点是，在交易的签名者数组中，第一个签名者总是负责支付交易费用。如果你没有足够的`SOL`怎么办呢？交易将会被取消！

当你在`devnet`或`LocalHost`上进行开发时，你可以通过`Solana`的命令行界面（`CLI`）使用`airdrop`功能来获取`devnet SOL`。此外，你还可以通过[SPL代币水龙头](https://spl-token-faucet.com/)来获取`SPL`代币（稍后我们会了解这些是什么东西:P）。
