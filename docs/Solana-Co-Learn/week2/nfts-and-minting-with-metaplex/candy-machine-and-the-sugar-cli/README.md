---
sidebar_position: 36
sidebar_label: 🍭 糖果机和Sugar CLI
sidebar_class_name: green
---

# 🍭 糖果机和Sugar CLI

有什么比将你的脸做成NFT更好的呢？你可以将自己永恒地成为一个早期的建造者，并告诉你妈妈你在区块链上。既然我们已经铸造了一个单独的NFT，我们将学习如何铸造一系列的NFT。我们将使用Candy Machine来完成这个过程——这是一个Solana程序，让创作者能够将他们的资产上链。这不是创建系列的唯一方式，但在Solana上它是标准的，因为它具有一些有用的功能，如机器人保护和安全随机化。

由于这是一个链上程序，所有的数据都存储在账户中。你首先需要为你的收藏创建一个糖果机的实例。这只是一个账户，它将存储一些重要的所有者信息和糖果机的配置在元数据字段中。

![](./img/candy-machine.png)

注意那个数据字段？那就是元数据所在的地方，它看起来像这样：

![](./img/candy-machine-data.png)

再说一遍 - 这里发生了很多事情，我们会在相关的时候逐个解释。


要与糖果机程序互动，我们将使用[Sugar CLI](https://docs.metaplex.com/developer-tools/sugar/overview/introduction)。这是一个很棒的工具，让你可以直接从命令行与程序进行交互。

## 🛠 安装命令行界面（CLIs）

在我们开始之前，我们需要安装：

- 1. Solana CLI - Sugar CLI 需要这个。您可以在[此处](https://docs.solana.com/cli/install-solana-cli-tools)为您的操作系统安装它。

- 2. Sugar CLI - 您可以在[此处](https://docs.metaplex.com/developer-tools/sugar/overview/installation)安装。

注意 - 如果您想将CLI安装与您的计算机分开，您可以在Docker上设置Solana CLI，然后下载Sugar CLI。Docker镜像在[这里](https://hub.docker.com/r/solanalabs/solana)。如果您不知道Docker是什么，不用担心！

如果安装正确，当您在终端中运行 `solana --version` 和 `sugar --version` 时，您应该看到版本号而不是错误。


如果您还没有本地的Solana钱包，现在是设置开发网络的好时机。在终端中运行以下命令：


```bash
solana config set --url devnet
solana-keygen new --outfile ~/.config/solana/devnet.json
solana airdrop 2
solana balance
```

这正是我们在本地客户端脚本中所做的事情，只不过是在终端中进行。

## 🍬 创建你的收藏品

这将是建立过程中最困难的部分之一：决定你想要制作一个NFT收藏的内容。你至少需要5张图片，每张图片对应收藏中的一个NFT。我选择了一些经典的`pepes`，因为`pepes`总是能引起我的共鸣。

在你的Solana工作空间中创建一个新的项目文件夹，并在其中创建一个 `assets` 文件夹。你需要将每个NFT资产与一个元数据JSON文件配对，从零开始编号每一对。因此，你的文件夹结构应该类似于这样：

```
...
|
|── assets
|   |── 0.png
|   |── 0.json
|   |...
|   |── 5.png
|   |── 5.json
|
|── node_modules
|── src
|── package.json
....
```

这是一个JSON文件的样子：

![](./img/candy-cli.png)

实际操作中，你会编写一个脚本来生成这些文件，但现在我们只能手动完成。你可以从这些[示例资产](https://arweave.net/RhNCVZoqC6iO0xEL0DnsqZGPSG_CK_KeiU4vluOeIoI?utm_source=buildspace.so&utm_medium=buildspace_project)开始，然后用你自己的图片替换它们。确保你也更新了JSON文件！

您还可以选择添加一个与之匹配的 `collection.json` 和 `collection.png` - 这些将被市场用作集合名称、描述和缩略图。

这是一个模板：

```json
{
  "name": "Studious Crabs Collection",
  "symbol": "CRAB",
  "description": "Collection of 10 crabs seeking refuge from overfishing on the blockchain.",
  "image": "collection.png",
  "attributes": [],
  "properties": {
    "files": [
      {
        "uri": "collection.png",
        "type": "image/png"
      }
    ]
  }
}
```

拯救🦀螃蟹，使其免遭🎣渔民的捕捞

现在你应该只有一个包含商品的资产文件夹（如果你使用的是Windows系统，还会有一个~文件夹）。


## 🍭 配置您的糖果机

接下来我们需要创建一个糖果机配置文件。这个文件用于创建链上的糖果机实例。Sugar CLI会引导您完成最低要求，这样您就不必手动操作！以下是它的样子：

![](./img/config-file.png)

你知道他们说吃太多糖对身体不好吗？开发Sugar CLI的人肯定也这么认为。要设置一个糖果机，你只需要运行 `launch` 命令，其他的事情它都会帮你完成。

![](./img/launch.png)

## 🚀 发行你的NFT收藏品

在终端中输入 `sugar launch` ，当它询问是否要创建新的配置文件时，按下`y`键。回答问题后，你的项目文件夹中将会留下一个 `config.json` 文件。

这是我的答案：

```bash
✔ What is the price of each NFT? · 0.3
✔ Found 10 file pairs in "assets". Is this how many NFTs you will have in your candy machine? · ye
✔ Found symbol "CRAB" in your metadata file. Is this value correct? · no
✔ What is the symbol of your collection? Hit [ENTER] for no symbol. · PEPE
✔ What is the seller fee basis points? · 100
? What is your go live date? Many common formats are supported. · now
✔ How many creator wallets do you have? (max limit of 4) · 1
✔ Enter creator wallet address #1 · B1aLAAe4vW8nSQCetXnYqJfRxzTjnbooczwkUJAr7yMS
✔ Enter royalty percentage share for creator #1 (e.g., 70). Total shares must add to 100. · 100
? Which extra features do you want to use?  ·
✔ What is your SOL treasury address? · B1aLAAe4vW8nSQCetXnYqJfRxzTjnbooczwkUJAr7yMS
✔ What upload method do you want to use? · Bundlr
✔ Do you want to retain update authority on your NFTs? We HIGHLY recommend you choose yes. · yes
✔ Do you want your NFTs to remain mutable? We HIGHLY recommend you choose yes. · yes
```

你应该会收到 `MISSING COLLECTION FILES IN ASSETS FOLDER` 的警告，不用担心，这是因为我们在 `assets` 文件夹中没有设置 `collection.png` 和 `collection.json` 文件。继续回答 y 。如果你想了解更多关于这些文件的信息，你可以在[这里](https://docs.metaplex.com/developer-tools/sugar/guides/preparing-assets)阅读更多内容。


现在我们不需要任何特殊功能。如果你感兴趣，你可以在[这里](https://docs.metaplex.com/developer-tools/sugar/learning/settings)阅读更多相关信息。

如果有什么东西坏了，或者你在中途改变主意，你可以直接退出这个过程，然后重新开始。你也可以直接编辑 `config.json` 文件。Sugar CLI会打印出非常有帮助的错误信息，所以如果你遇到困难，只需阅读它们，你很可能就能解决问题。


如果一切顺利，最后你会看到一个绿色的 `Command successful`. 消息。在它的上方，你会看到一个SolanEyes链接。点击那个链接，你就能在Solana网络上看到你的糖果机！从这里复制糖果机的ID，我们以后会用到它。

如果这还不够神奇，那就试试用 `sugar mint` 铸造一个NFT。简直美味至极。

一旦你整理好你的收藏品，然后在巴厘岛放松时，糖也可以帮助你进行各种操作，如果你好奇的话，可以查看一下[命令](https://docs.metaplex.com/developer-tools/sugar/reference/commands)。

## 🌐 为您的NFT收藏创建一个前端界面

希望你已经吃过晚饭了，因为现在是吃更多糖果的时候了。

Metaplex基金会提供了一个时尚的React UI模板，您可以用它来为您的NFT收藏创建前端界面。让我们来设置一下：

```bash
git clone https://github.com/metaplex-foundation/candy-machine-ui
cd candy-machine-ui
npm i
```

这里发生了很多事情，我们不需要担心。将 `.env.example` 重命名为 `.env` ，并粘贴您之前复制的糖果机ID。

```bash
REACT_APP_CANDY_MACHINE_ID=GNfbQEfMA1u1irEFnThTcrzDyefJsoa7sndACShaS5vC
```

这就是你需要做的一切！现在如果你运行 `npm start` ，你会在 `localhost:3000` 上看到一个漂亮的用户界面，你可以用它来铸造你的NFT。

对于Mac用户：如果遇到 `export NODE_OPTIONS=--openssl-legacy-provider` ，请在终端中运行

一旦你铸造完成，就在你的钱包的收藏品部分查看NFT。

![](./img/candy-nft.png)

你会注意到，铸造的NFT不是`1.png`。这是因为糖果机铸造默认是随机的。

我们只是勉强触及到了Candy Machine和Sugar CLI的潜力。以后我们还会涵盖更多内容——本节的目的是为了让你拥有足够的知识广度，让你能够自己深入研究。随着我们不断完善NFT项目，我们将继续深入探索。

## 🚢 船舶挑战

让我们再多玩一会糖果机吧！🍭

通过更新 `config.json` 文件并运行 `sugar update` ，发挥创造力并测试其他糖果机配置。

例子：

- 修改 `goLiveDate`
- 启用 `gatekeeper` （验证码）
- 启用 `whitelistMintSettings`
    - 需要创建令牌
- 使用 `splToken` 而不是本地的sol请求付款
    - 需要创建令牌

提示
文档 :)

[https://docs.metaplex.com/developer-tools/sugar/learning/settings](https://docs.metaplex.com/developer-tools/sugar/learning/settings)
