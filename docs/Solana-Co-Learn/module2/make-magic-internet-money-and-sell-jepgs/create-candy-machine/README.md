---
sidebar_position: 42
sidebar_label: 🍬 创造糖果机
sidebar_class_name: green
tags:
  - displayings-nfts
  - solana
  - nft
  - metaplex
  - candy-machine
---

# 🍬 创建糖果机

现在我们已经铸造了一个`NFT`，接下来我们要学习如何铸造一系列NFT。我们将使用`Candy Machine`来完成这个任务。`Candy Machine`是一个`Solana`程序，它可以让创作者将他们的艺术品和资产上链。虽然还有其他方式可以创建NFT系列，但`Candy Machine`在`Solana`上已成为一项标准，因为它具备许多实用功能，如防机器人保护和安全随机化。准备好添加一些内容到我们上一课创建但未使用的文件夹中了吗？

首先，让我们在你的 `candy-machine` 文件夹中创建一个新的资产文件夹，并将所有`NFT`图像和元数据放入其中。你可以在[这里](https://docs.metaplex.com/developer-tools/sugar/guides/preparing-assets)找到有关如何准备`NFT`资产的详细信息。

## 使用`Sugar CLI`

现在你已经成功创建了所有`NFT`资产，我们可以开始使用Sugar CLI来部署它们。如果你还没有安装它，可以按照[这个链接](https://docs.metaplex.com/developer-tools/sugar/overview/installation)上的指南进行安装。

首先，让我们通过运行 `cd tokens/candy-machine/` 命令导航到`candy-machine`文件夹。接下来，运行 `sugar launch` 来启动`Sugar CLI`。它会询问你一系列问题，你可以根据自己的需求来进行配置。最关键的是，确保将`NFT`的价格设为 `0`，并将存储方式设为 `bundlr`。你可以选择将 `yes` 设置为所有选项。

## ⬆️ 上传你的`NFT`

现在你已经创建了配置文件，可以通过在终端中运行 `sugar upload` 来开始上传你的`NFT`。这将会把所有的`NFT`和它们的元数据上传到你选择的存储方式中。成功上传`NFT`后，终端中的输出应该如下图所示。

![](./img/sugar-upload.png)

你还会在你的文件夹中看到一个名为 `cache.json` 的生成文件。它包括了你的`NFT`和它们的元数据的所有必要信息。复制 `collectionMint` 地址并粘贴到[`https://explorer.solana.com/?cluster=devnet`](https://explorer.solana.com/?cluster=devnet)，你应该能看到与下图相似的`NFT`。

![](./img/nft.png)

就这样，你已经成功创建了自己的`NFT`系列，并通过`Candy Machine`上链了。你可以继续探索其他`Candy Machine`的功能，并尝试在`Solana`上更广泛地展示和销售你的`NFT`。
