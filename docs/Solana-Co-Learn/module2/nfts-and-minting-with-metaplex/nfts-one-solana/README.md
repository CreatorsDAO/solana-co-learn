---
sidebar_position: 34
sidebar_label: 🎨 Solana上的NFT
sidebar_class_name: green
tags:
  - nfts-and-minting-with-metaplex
  - solana
  - nft
---

# 🎨 Solana上的NFT

我们来了，不过花了不了多长时间。猴子画像、猩猩、岩石，以及其他一些看起来丑陋却能卖到`10`万美元的动物主题头像。这就是`NFT`。

与以太坊不同，`Solana`上铸造`NFT`非常便宜，这使得它们更加有趣。即使在熊市的时候，在以太坊上铸造一个`NFT`可能只需要`5`美元，这感觉有些乏味。为什么我要花5美元来永久保留我的梗图呢？

## 🫣 NFT就是代币

Solana上`NFT`价格便宜的一个重要原因是它们并不是一些特殊的代码，它们只是普通的代币，附加了一些额外的数据。

![](./img/nft-metadata.png)

第一个主要的区别在于铸造账户。对于`NFT`来说，铸造账户:

- **供应量为1**，意味着只有一枚代币在流通。
- **没有小数点**，意味着你不能拥有`0.5`个代币这样的东西。
- **没有铸造权限**，意味着没有人可以铸造更多的代币。

正如你可能猜到的，额外的数据存储在程序派生的账户中。让我们一起来认识一下这些新账户吧 :D

## 🐙 主版本（Master Edition）账户

![](./img/master-edition-account.png)

`Token Metadata`程序为`NFT`提供了另一个特殊的账户类型，称为`Master Edition`账户。它不会废除铸币权，而是将铸币和冻结权限转移到`Master Edition PDA`。

换句话说，铸币权被转移到了`Token Metadata`程序的`PDA`上。这确保了在没有通过`Token Metadata`程序的情况下，任何人都不能铸造或冻结代币。

只有程序提供的指令可以使用它，并且程序中并没有这样的指令。这样做的原因是为了让Metaplex能够部署`Token Metadata`程序的升级，并将现有的`NFT`迁移到新版本。

## 🪰 版本（Editions）账户

![](./img/edition-account.png)

除了证明不可替代性，`Master Edition`账户还允许用户打印一个或多个`NFT`的副本。这使得创作者可以提供多个`1/1 NFT`的复制品。

`Master Edition`账户包括一个可选的`Max Supply`属性：

- 如果设置为`0`，则禁用打印功能；
- 如果设置为`None`，则可以打印无限数量的副本。

## 🧰 Metaplex SDK

通过我们的新朋友`Metaplex SDK`，所有这些都变得简单容易。它让你能够轻松创建和更新`NFT`，只需提供最基本的信息，它就会自动填充其余的默认值。

和令牌元数据一样，我们将使用相同的流程来：

- 上传一张图片；
- 上传元数据；
- 然后使用元数据URI创建一个`NFT`。

你能想象代码会是什么样子吗？在我们开始之前，试着在脑海中描绘它，然后我们一起来编写实现吧 :)
