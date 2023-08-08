---
sidebar_position: 31
sidebar_label: 🧮 令牌元数据
sidebar_class_name: green
---

# 🧮 令牌元数据

是时候让令牌与它们的创造者（你）相遇了。我们将从之前的构建部分继续进行。如果需要，你可以从[这里](https://github.com/buildspace/solana-token-client/tree/solution-without-burn?utm_source=buildspace.so&utm_medium=buildspace_project)获取起始代码（确保你在 `solution-without-burn` 分支上）。

![](./img/metadata.png)

Token元数据是一个代币的信息，比如名称、符号和标志。注意一下，你钱包里的各种代币都有这些东西，除了你自己创建的代币。

![](./img/token-metadata.png)

这就是所有的元数据！这适用于所有的代币，不仅仅是可替代货币。在Solana上，NFT就像任何其他代币一样，只是元数据通过属性（如小数位）将它们定义为NFT。

这一切都是通过[Token Metadata Program](https://docs.metaplex.com/programs/token-metadata/overview)完成的 - 这是处理Solana区块链上的Token和NFT时最重要的程序之一。它的主要目标是将附加数据附加到Solana上的可替代或不可替代Token上。它使用从Mint账户地址派生出来的程序派生地址（PDAs）来实现这一目标。

## 🎭 令牌元数据账户

一旦我们制作了一个闪亮的新代币，我们需要让它变得华丽起来。我们将使用`Token Metadata Program`来实现这一点，以下是生成的账户的样子：

![](./img/token-metada-program.png)

这被称为元数据账户。它可以存储关于特定代币铸造账户的各种信息。你会注意到有一个 `URI` （统一资源标识符）属性 - 这指向一个链外的 JSON 文件，主要用于非同质化代币（NFT）。由于链外部分不受链上费用的限制，你可以存储高质量的图形和其他大型数据对象。

元数据账户有很多值，你不需要了解其中大部分。我们将在需要时深入了解相关部分。现在，我们只关心离链部分，这是我们制作`Pizzacoin`所需的第一件事。

## 🖼 代币标准

`off-chain`部分遵循[Metaplex代币](https://docs.metaplex.com/programs/token-metadata/token-standard)标准，基本上是一种格式，你需要按照这种格式来实现不同类型代币的元数据。我们在元数据账户的链上部分的 `Token Standard` 字段中告诉网络上的所有应用程序我们的代币类型。我们的选项有：

- `NonFungible` ：一种带有主版本的非同质化代币（NFTs）。
- `FungibleAsset` ：具有元数据和属性的令牌，有时也被称为半可替代令牌（例如游戏物品）。
- `Fungible` ：具有简单元数据的代币。（像USDC或SOL这样的常规代币）
- `NonFungibleEdition` ：一个具有`Edition`账户的非同质化代币（从Master版中打印出来的，类似于100个中的1个）。

`Metaplex Token`标准在整个行业中被广泛接受。各种应用程序、交易所和钱包都希望令牌符合该标准。Token标准由Token元数据程序自动设置，无法手动更新。以下是它如何确定如何应用正确的标准：

- 如果令牌拥有主版本账户，则为 `NonFungible` 。
- 如果令牌具有Edition账户，则为 `NonFungibleEdition` 。
- 如果代币没有（主）版账户（确保其供应量可以大于1）并且使用零位小数，那么它是一个 `FungibleAsset` 。
- 如果代币没有（主）版账户（确保其供应量可以大于1）并且使用至少一位小数，那么它是一个 `Fungible` 。

你现在可以忽略“Master Edition”是什么意思，`Pizzacoin`是完全可替代的，所以我们将专注于 Fungible 代币。

![](./img/fungible-token.png)

## 🧰 Metaplex SDK

欢迎来到Solana上最实用的SDK之一。如果你曾经在Solana上铸造过NFT，那么你很可能在不知情的情况下使用了Metaplex SDK。我们将使用 `@metaplex-foundation/js` 和 `@metaplex-foundation/mpl-token-metadata` 库来创建与我们的代币铸造相关联的元数据账户。是时候给Pizzacoin一个身份了。

我们将从链下部分开始，只有在准备就绪后，我们才会继续创建代币元数据账户。

一般的工作流程将是：

- 1. 安装Metaplex SDK - 你可能会使用现有的密钥对
- 2. 上传一个图像作为标志 - 我们将使用本地文件，但SDK也支持从浏览器上传
- 3. 上传链下元数据（以及您上传的图像的URI），您现在可以开始进行链上操作了。
- 4. 派生元数据账户PDA（蛋）
- 5. 创建链上的Token元数据账户 - 指令、交易等。

感觉不确定？让我们用一些代码来战胜这些感觉吧 🤺
