---
sidebar_position: 13
sidebar_label: 从Solana 🤓 区块链中读取数据
sidebar_class_name: green
---

# 从 Solana 🤓 区块链读取数据

是时候回到过去了。回到幼儿园的时光。还记得你学到的第一件事是什么吗？字母表。一旦你征服了全部26个字母，你就学会了阅读。这是你成为Solana开发者之旅的起点。阅读英语的独特技能使你成为了现在这个能够咀嚼知识的超级大脑。

时候再次行动了。我们将从你的幼儿园老师应该教授的地方开始——从区块链中读取数据。

## 👜 Solana上的账户

从Solana字母表开始，我们有A代表账户。我们从账户开始，因为Solana上的智能合约，也被称为“程序”，是无状态的——意味着它们除了代码之外不存储任何东西。一切都发生在账户中，所以它们对Solana来说至关重要，它们用于存储、合约和本地区块链程序。

Solana 上有三种类型的账户
- 数据帐户 - 这些存储数据, LOL
- 程序帐户 - 这些存储可执行程序（又称智能合约）
- 原生账户 - 这些用于核心区块链功能，例如权益、投票

本地账户（`native account`）是区块链运行所需的，我们稍后会详细介绍。现在，我们只需要处理数据和程序账户。

在数据账户中，您还有两种进一步的类型

- 系统拥有的帐户
- `PDA`（程序派生地址）帐户

我们很快就会介绍这些到底是什么™️，现在就跟着一起走吧。

每个账户都有一些你应该了解的字段：

| FIELD | 描述 |
| --- | --- |
| `lamports` |  该账户拥有的lamports数量 |
| `owner` |  这个账户的所有者程序 |
| `executable` | 这个账户成是否可以处理指令 |
| `data`	|  这个账户存储的数据的字节码 |
| `rent_epoch` | 下一个需要付租金的`epoch`（代） |

我们现在只关注我们需要了解的事情，所以如果有些东西不太明白，就继续前进吧 - 我们会边进行下去边填补空白。

`Lamport`是Solana的最小单位。如果你熟悉以太坊生态系统，这有点像Gwei。一个`Lamport`等于0.000000001 SOL，所以这个字段告诉我们账户拥有多少SOL。

每个账户都有一个公钥 - 它就像账户的地址。你知道你的钱包有一个地址，用来接收那些辣辣的NFT吗？同样的道理！Solana地址只是`base58`编码的字符串。


`executable` 是一个布尔字段，告诉我们该帐户是否包含可执行数据。数据是存储在帐户中的内容，租金我们稍后会支付！


现在让我们先从简单的事情开始吧 :)

## 📫 从网络中读取

好的，我们知道什么是账户，那么我们如何读取它们呢？我们将使用一个叫做 JSON RPC 终端点的东西！看看这个图表，你将扮演客户端的角色，在 Solana 网络中尝试读取信息。

![](./img/json-rpc-illustration.png)

您可以通过API调用JSON RPC来获取您想要的内容，它会与网络进行通信并返回给您所需的数据。

如果我们想要获取账户的余额，API调用将如下所示

```ts
async function getBalanceUsingJSONRPC(address: string): Promise<number> {
    const url = clusterApiUrl('devnet')
    console.log(url);
    return fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            "jsonrpc": "2.0",
            "id": 1,
            "method": "getBalance",
            "params": [
                address
            ]
        })
    }).then(response => response.json())
    .then(json => {
        if (json.error) {
            throw json.error
        }

        return json['result']['value'] as number;
    })
    .catch(error => {
        throw error
    })
}
```

这里发生了一堆事情。我们正在进行一个POST请求，请求体中有特定的参数告诉RPC要做什么。我们需要指定RPC的版本、id、方法，本例中是`getBalance`，以及该方法所需的参数，本例中只有`address`。

我们有一堆针对一个非常简单的方法的样板代码，所以我们可以使用Solana的`Web3.js SDK`。以下是所需的内容：

```ts
async function getBalanceUsingWeb3(address: PublicKey): Promise<number> {
    const connection = new Connection(clusterApiUrl('devnet'));
    return connection.getBalance(address);
}
```

这不是很漂亮吗？我们只需要这三行代码就能获取到某人的Solana余额。想象一下，如果获取任何人的银行余额也是这么简单的话。

现在你知道如何从Solana上的账户读取数据了！我知道这可能看起来微不足道，但只要使用这个函数，你就可以获取Solana上任何账户的余额。想象一下，能够获取地球上任何银行账户的余额，这就是它的强大之处

## 🤑 构建一个余额获取器

是时候构建一个通用的余额获取器了（假设整个宇宙都在Solana上）。这将是一个简单但功能强大的应用程序，可以获取Solana上任何账户的余额。

在你的工作区域创建一个文件夹。我将我的放在桌面上。[克隆起始库](https://github.com/RustyCab/solana-intro-frontend.git)并进行设置：

```bash
git clone https://github.com/CreatorsDAO/solana-intro-frontend
cd solana-intro-frontend
git checkout starter
npm i
```

这是一个简单的 Next.js 应用程序，因此一旦安装了所有依赖项，您就可以在终端中使用 `npm run dev` 启动它。您应该在`localhost`上看到此内容：

![](./img/intro-frontend-demo.png)

我们为您提供了一个简单的Next.js应用程序，并添加了一些样式。如果您在地址栏中输入内容并点击“检查SOL余额”按钮，您将看到1,000 SOL的余额。是时候让它正常工作了。

首先，你想要安装`Solana/web3.js`库：

```bash
npm install @solana/web3.js
```

这将为我们提供一个非常简单的函数来获取余额。转到 `index.tsx` 并将其导入到顶部：

```ts
import * as web3 from '@solana/web3.js'
```

接下来，我们将着手处理 `addressSubmittedHandler` 函数。在这里，我们首先要做的是将地址从 `string` 转换为公钥。记住 - 地址实际上并不是一个字符串，在JS中我们只是将其表示为一个字符串。

```ts
const addressSubmittedHandler = (address: string) => {
    const key = new web3.PublicKey(address);
    setAddress(address)
    setBalance(1000)
}
```

这将验证您传入的内容是否实际上是一个 Solana 地址。现在，如果您在地址字段中输入的内容不是一个密钥，您将会看到应用程序崩溃。不错！

现在我们要使用密钥，我们将建立一个新的连接到JSON RPC。通过这个连接，我们将使用 `getBalance` 函数，并使用 `setBalance` 设置结果！这是完成的函数：

```ts
const addressSubmittedHandler = (address: string) => {
   const key = new web3.PublicKey(address);
   setAddress(key.toBase58())

   const connection = new web3.Connection(web3.clusterApiUrl('devnet'))

   connection.getBalance(key).then(balance => {
     setBalance(balance / web3.LAMPORTS_PER_SOL)
   })
}
```

这里有一些新东西

- 我们正在使用 `key.toBase58` 设置地址。这是Solana地址的字符串编码。
- 我们正在连接到 `devnet` 网络。有三个网络 - 主网、测试网和开发网。我们将在开发网上进行所有操作。
- 我们正在将余额从`Lamports`转换为SOL - 余额以`Lamports`返回，而不是SOL。


我们完成了！如果你在这里粘贴一个地址，你就会看到余额。确保你的账户上有开发网络的 SOL！如果没有，你可以使用我的账户来测试你的应用 - `B1aLAAe4vW8nSQCetXnYqJfRxzTjnbooczwkUJAr7yMS` 。

这个还不错，但是如果地址搞错了，就会出现一个很糟糕的错误。我们来添加一些错误处理来解决这个问题。

```ts
const addressSubmittedHandler = (address: string) => {
  try {
    setAddress(address)
    const key = new web3.PublicKey(address)
    const connection = new web3.Connection(web3.clusterApiUrl('devnet'))
    connection.getBalance(key).then(balance => {
      setBalance(balance / web3.LAMPORTS_PER_SOL)
    })
  } catch (error) {
    setAddress('')
    setBalance(0)
    alert(error)
  }
}
```

现在你应该会收到一个提示了 :D

哇，你刚刚发布了你的第一个Solana应用。加油！


## 🚢 Ship 挑战

让我们通过一个小挑战来考验一下你的知识。从你刚刚完成的应用开始，向用户界面添加另一行项目，显示输入的地址是否为可执行账户。

![](./img/intro-frontend-challenge.png)

要确定一个账户是否可执行，您需要：

1. 使用方法 `getAccountInfo` 获取包含账户信息的JSON对象
2. 检查其属性以确定是否可执行
3. 在 `useState` 中添加另一个调用，它允许您从账户信息中设置 `executable` 属性值，并在用户界面中显示它

这是一个可用于测试的账户地址 - `ComputeBudget111111111111111111111111111111` 。


在你自己努力尝试之前，不要看答案！这个很简单！

完成后，请[查看](https://github.com/CreatorsDAO/solana-intro-frontend/tree/challenge-solution)此处的挑战解决分支的参考资料。
