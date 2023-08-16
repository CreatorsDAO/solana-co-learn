---
sidebar_position: 28
sidebar_label: 💵 The token Program
sidebar_class_name: green
---

# 💵 The Token Program

是时候让代币与它们的创造者（你）相遇了。我们将在之前的构建部分中继续进行。如果需要，你可以从[这里获取起始代码](https://github.com/buildspace/solana-token-client/tree/solution-without-burn)（确保你在 `solution-without-burn` 分支上）。作为区块链最初的承诺，也可能是你安装钱包的主要原因，这些谦逊的代币是对区块链上资产的最纯粹的表达，从合成股票到数百种狗币。

这节课主要讲解Solana上的代币工作原理。如果你对其他区块链有所了解，可能会发现这里有一些不同之处，所以尽量不要将当前对代币的理解与之联系起来。

谈论Solana中令牌的工作原理也是一个了解不同程序如何使用账户的绝佳机会。你越深入了解Solana，就越能意识到账户的重要性。它们像文件系统中的文件一样抽象和灵活，但这也意味着任何给定程序上的账户可能变得复杂！刚开始可能会感到困惑，但给它一些时间，它会变得更加清晰。

Solana上的代币是通过`Solana Token Program`进行创建和管理的，它是`Solana Program Library（SPL）`中的几个程序之一。常规代币和非同质化代币（NFTs）都是Solana程序库中的代币。今天我们不会涉及NFTs，但不用担心，我们很快会介绍。


## 🗃 账户关系

我们首先要了解一下情况。`The token program`需要三个必要的账户:

![](./img/account-relationships.png)

- `Wallet Account` - 这是你的钱包！
- `Mint Account` - 存储有关代币Mint的元数据
- `Token Account` - 这与钱包绑定，并存储有关该特定钱包的信息，例如它拥有多少令牌。

让我们深入了解每个账户，并看看它们内部的情况。

## 🌌 Mint Account

![](./img/mint-account.png)


Mint账户存储有关代币本身的元数据，而不是您对代币的所有权，而是更广泛地涉及代币。它具有以下属性：

- `mint authority` - 只有一个账户可以从Mint账户签名并Mint代币。当您创建Mint账户时，必须指定Mint权限，可以是您的个人钱包或其他程序。
- `supply` - 有多少总代币存在。供应基本上是在说，“码农大神，你好！这是发行的总代币数量。”
- `decimals` - 小数位数是我们允许令牌被分割成的小数位数 - 我们令牌的精度。这可能会变得棘手，因为实际上链上没有小数。什么？总供应量表示为整数，所以你必须进行数学计算来在小数之间进行转换。例如，如果你将小数位数设置为两位，而你的供应量是一百，那么实际上你只有一个令牌。供应中只有一个令牌，但你允许它被分割成该令牌的较小面额。
- `Is Initialized`  - 基本上是指该账户是否准备就绪。这与账户本身有关，而不是`token program`。
- `Freeze authority ` - 冻结权限类似于`Mint权限`，意味着一个人或程序拥有冻结（或Mint）的权限。


将Mint权限设置给你的钱包是相当标准的做法，你可以Mint任何你想要的东西，然后取消Mint权限，基本上意味着未来不会再发行更多的供应量。或者，如果你有某种动态发行代币的方式，常见的做法是将其放入权限中，作为一个程序来管理代币的Mint。

冻结权限的工作方式相同。


##  👛 Token Accounts

你可能已经看到了大量在生态系统中流通的不同代币。你的钱包现在可能装满了各种不同的代币。那么，网络是如何知道你持有某些代币的呢？一个账户存储着这些数据！最好的方式是通过一个关联的代币账户来实现。看看吧

![](./img/token-account.png)


这是数据关系和账户属性的样子。

Token账户必须与用户或钱包关联。一个简单的方法是创建一个PDA，其地址链接了Mint账户和钱包。令牌账户PDA的种子是铸币账户的地址和钱包地址（令牌程序ID默认存在）。

有很多不同的信息包含在内，但现在只需要知道你的钱包实际上并不持有具体的代币。它与你拥有的另一个账户相关联，该账户存储了代币的数量。另外，还有一个铸币账户，存储了关于所有代币和铸币的更广泛信息。

花点时间盯着这个图表，然后搜索一下那些不明白的部分（比如关联的令牌程序到底是什么鬼？）。在处理完所有的繁琐事情之后，这就很简单了！

## 🤑 代币Mint过程

别再看图表了，让我们来看一些代码，看看这一切是如何发生的。

要创建一个新的SPL-Token，首先必须创建一个Token Mint（保存有关该特定代币的数据的账户）。

把它想象成烤比萨饼。你需要一个食谱（关于代币的数据），食材（铸币账户和钱包地址），以及有人把它们组合在一起（派生一个新的PDA）。就像制作比萨饼一样，如果你拥有所有正确的食材并按照食谱操作，最终你将得到一枚美味的新代币！

由于令牌计划是SPL的一部分，您可以使用 [`@solana/spl-token`](https://www.npmjs.com/package/@solana/spl-token) TypeScript SDK相当容易地创建交易。

这是一个`createMint`的样子：

```ts
const tokenMint = await createMint(
  connection,
  payer,
  mintAuthority,
  freezeAuthority,
  decimals,
)
```

你需要这些参数：
- `connection` - 与集群的JSON-RPC连接
- `payer` - 付款方交易的公钥
- `mintAuthority` - 被授权Mint新代币的账户
- `freezeAuthority` - 一个被授权冻结代币的账户。如果您不想冻结代币，请将其设置为null！
- `decimals` - 指定令牌的所需小数精度

一旦完成这个步骤，你就可以继续下一步了：

- 创建关联的Token账户
- 将代币Mint到一个账户中
- 如果你想要使用转账功能进行空投到多个账户，

你需要的一切都在 `@solana/spl-token` SDK中。如果你对某个具体部分感兴趣，可以在这里[查看文档](https://spl.solana.com/token)。

大多数情况下，您不需要自己创建原始交易，SDK就足够了。

关于这个很酷的附注——如果出于某种原因，你想要在创建Mint指令的同时创建另一个指令，你会希望自己创建这些指令，并将它们打包成一个事务，以确保所有操作都是原子性的。也许你正在构建一个超级机密的代币程序，你希望在铸币后立即锁定所有代币，而没有人能够转移它们。

不用说，这些代币周围发生了很多疯狂的事情。您可以在[这里](https://www.soldev.app/course/token-program)查看每个功能在幕后发生的情况，甚至可以查看一些关于销毁代币之类的说明。:)


## Reference

- [Create Tokens With The Token Program](https://www.soldev.app/course/token-program)
