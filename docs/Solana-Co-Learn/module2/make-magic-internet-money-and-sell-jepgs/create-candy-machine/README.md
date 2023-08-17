---
sidebar_position: 42
sidebar_label: 🍬 创造糖果机
sidebar_class_name: green
---

# 🍬 创造糖果机

既然我们已经铸造了一个NFT，现在我们将学习如何铸造一系列的NFT。我们将使用Candy Machine来完成这个任务，它是一个Solana程序，可以让创作者将他们的资产上链。这不是创建系列的唯一方式，但在Solana上它是标准的，因为它具有许多有用的功能，如机器人保护和安全的随机化。准备好将一些东西放入我们在上一课中创建但没有使用的文件夹中了吗？

让我们首先在你的 `candy-machine` 文件夹中创建一个新的资产文件夹。将所有的NFT图像和元数据放入其中。你可以在[这里](https://docs.metaplex.com/developer-tools/sugar/guides/preparing-assets)阅读有关如何准备你的NFT资产的更多信息。


## 使用Sugar CLI

现在你已经成功创建了所有的NFT资产，我们可以通过使用Sugar CLI来开始部署它。如果由于某种原因你尚未安装它，你可以按照[这里](https://docs.metaplex.com/developer-tools/sugar/overview/installation)的指南来安装CLI。

让我们通过运行 `cd tokens/candy-machine/` 来开始导航到`candy-machine`文件夹，并继续通过运行 `sugar launch` 来启动Sugar CLI。它会询问你一系列的问题。随意配置它，以你想要的方式。最重要的是，确保将NFT的价格设置为 `0` ，并将存储方法设置为 `bundlr` 。你可以选择将 `yes` 设置为所有内容。

## ⬆️ 上传你的NFT

现在你已经创建了配置文件。你可以通过在终端中运行 `sugar upload` 来开始上传你的NFT。这将将所有NFT及其元数据上传到你所选择的存储方式中。成功上传NFT后，它应该是这个样子。

![](./img/sugar-upload.png)

你还应该在你的 `cache.json` 文件夹中看到一个生成的文件。这将包含你的NFT和其元数据的所有必要信息。复制 `collectionMint` 地址并粘贴到`https://explorer.solana.com/?cluster=devnet`，你应该能够看到与我的类似的NFT。

![](./img/nft.png)
