---
sidebar_label: Solana钱包使用 - Backpack 🎒
sidebar_class_name: green
tags:
  - wallet-usage
  - solana
  - backpack
---

# Solana钱包使用 - Backpack 🎒

Solana的钱包种类繁多，如众所周知的`Phantom`钱包。然而，在此我并不推荐使用`Phantom`，因为对于开发者来说，它并不够友好。

在本地开发时，`Phantom`不支持本地`RPC`地址，只能使用`Solana`官方的测试网络。这样一来，开发者在本地开发时就会受限制。正因如此，我推荐使用`Backpack`钱包。

## 下载Backpack钱包

下载地址：[`https://www.backpack.app/`](https://www.backpack.app/)。点击页面上的“`Download`”按钮，然后选择适合自己浏览器的插件。

目前`Backpack`钱包只支持`Chrome`、`Brave`和`Arc`浏览器。移动端版本还在开发中。

## 创建账户

下载安装完毕后，你将看到登录界面。点击`Create Account`创建账户。

![](./backpack-create-account.png)

接下来是Claim账户名字的步骤，输入你想要的账户名字，然后点击`Claim Name`。

![](./backpack-cliam-name.png)

此后，系统将引导你选择创建新的钱包或导入私钥。在此我们选择创建新的钱包。

![](./backpack-create-new-wallet.png)

接下来将展示助记词界面，你可以将助记词保存到本地，然后继续下一步。

![](./backpack-mnemonic.png)

由于`Backpack`是一个多链钱包，在此我们选择`Solana`链，然后继续下一步。

![](./backpack-chose-solana.png)

## 设置自定义的RPC Endpoint

账户创建完毕后，我们来设置自定义的`RPC Endpoint`。点击右上角的设置按钮，然后选择`Preference`。

![](./backpack-setting.png)

![](./backpack-setting1.png)

然后点击`Preference`选项。

![](./backpack-perference.png)

你将看到有两个网络选项，分别是`Solana`和以太坊。我们在这里选择`Solana`。

![](./backpack-custom-rpc.png)

接下来就是设置自定义`RPC`的环节，我们在此选择了`localnet`。

在`Custom`选项下，你可以自定义`RPC`地址。除了官方提供的`testnet`或`mainbeta`地址，你还可以通过`Quicknode`或`Helius`申请自己的`RPC`地址。

## 参考资料

- [Quicknode](https://dashboard.quicknode.com/)
- [helius](https://www.helius.dev/)
- [helloMoon](https://www.hellomoon.io/dashboard)

总而言之，`Backpack`钱包由于其对开发者友好的特性，以及灵活的自定义`RPC`设置功能，成为了一款值得推荐的钱包选项。它使得开发者能够更便捷、灵活地进行`Solana`开发和测试工作。
