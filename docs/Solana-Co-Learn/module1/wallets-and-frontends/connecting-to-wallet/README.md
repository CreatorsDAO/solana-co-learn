---
sidebar_position: 17
sidebar_label: 🔌 连接到钱包
sidebar_class_name: green
tags:
  - wallet-and-frontend
  - solana
---

# 🔌 连接到钱包

现在我们已经知道如何使用代码与网络交互，通过直接使用私钥来初始化账户。显然，在正常的去中心化应用（`dapp`）中，这样做是不可行的（永远不要将你的私钥暴露给任何人或任何`dapp`）。

接下来，我们将介绍如何通过`SDK`和钱包进行交互。

“钱包”这个词可能听起来有些奇怪，因为它们不仅仅用来存储东西。钱包的关键功能是使用其中的密钥进行安全的交易签名。钱包有很多形式，最常见的是浏览器扩展，它们为你（作为开发者）提供`API`，以向用户建议交易。钱包让你能够安全地进行操作。

推荐使用 [`BackPack`](https://www.backpack.app/)。

## 🛠 Solana 钱包适配器

在开发过程中，我们使用 [Solana Wallet-Adapter](https://github.com/solana-labs/wallet-adapter) 来适配各种钱包，并实现通用的`Solana API`。支持的钱包列表可以在[这里](https://github.com/solana-labs/wallet-adapter/blob/master/wallets.png)找到。

你需要使用的适配器库包括 `wallet-adapter-base` 和 `wallet-adapter-react`，这两者都是必选的。然后，你可以根据需求选择支持的钱包或使用 `wallet-adapter-wallets`。

下面是一个使用`BackPack🎒`登录的示例代码：

```bash
npm install @solana/wallet-adapter-base \
    @solana/wallet-adapter-react \
    @solana/wallet-adapter-backpack \
    @solana/wallet-adapter-react-ui
```

- `wallet-adapter-react-ui` 为我们处理了整个UI，包括连接、选择钱包、断开连接等，一切都已经安排妥当！
- 可选择使用 `@solana/wallet-adapter-backpack` 钱包。

## 👜 创建一个钱包连接按钮

下面的教程将指导你创建一个钱包连接按钮，并将其集成到你的`Solana`项目中。

### 1. 初始化项目模板

首先，你需要从指定的仓库克隆项目模板并进行必要的初始化操作：

```bash
git clone https://github.com/all-in-one-solana/solana-ping-frontend
cd solana-ping-frontend
git checkout starter
npm i
npm run dev
```

该模板继承了我们上次构建的内容——我们为`ping`客户端提供了一个前端界面，以便将数据写入区块链。

![](./img/upload_2.png)

这是一个初步的系统`UI`。接下来，让我们将其连接到`wallet-adapter-react`库。

### 2. 修改 `_app.tsx`，使其具备以下外观

在此步骤中，你需要修改`_app.tsx`文件，确保其具有正确的结构和内容。你可以根据项目需求，添加或修改代码，使其与你的钱包适配器完美集成。

```ts
import React, { useMemo } from "react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import {
  GlowWalletAdapter,
  PhantomWalletAdapter,
  BackpackWalletAdapter
} from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";

require("@solana/wallet-adapter-react-ui/styles.css");
require("../styles/globals.css");
require ("../styles/Home.module.css");

const App = ({ Component, pageProps }) => {
  // Can be set to 'devnet', 'testnet', or 'mainnet-beta'
  const network = WalletAdapterNetwork.Devnet;

  // You can provide a custom RPC endpoint here
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking and lazy loading --
  // Only the wallets you configure here will be compiled into your application, and only the dependencies
  // of wallets that your users connect to will be loaded
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new GlowWalletAdapter(),
      new BackpackWalletAdapter()
    ],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <Component {...pageProps} />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default App;
```

通过上述步骤，你将成功创建一个钱包连接按钮，并能与`Solana`网络进行交互。现在，用户可以方便地使用这个按钮连接到他们的钱包，并享受无缝的区块链体验。

### 框架介绍

以下是关于如何连接和使用钱包的详细步骤和解释。

1. 这是一个基于`React`的应用框架。通过`useMemo`，它会根据网络连接状态确定与Solana网络交互的`rpc endpoint`。
2. 使用`@solana/wallet-adapter-base`的`WalletAdapterNetwork`来展示可用的网络。
3. `WalletModalProvider`会向用户提示选择钱包。
4. `ConnectionProvider`接受一个RPC端点，并允许我们直接与`Solana`区块链上的节点通信。我们将在整个应用程序中使用它来发送交易。
5. `WalletProvider`为我们提供了连接各种钱包的统一接口。
6. `wallet-adapter-wallets`提供了钱包适配器。我们将使用从中导入的内容来创建我们将提供给`WalletProvider`的钱包列表。在本例中，选择了`Phantom`和`Glow`, `BackPack`🎒。
7. 最后，我们有`clusterApiURL`，这只是一个根据我们提供的网络为我们生成RPC端点的函数。
8. 总结一下：这个文件是我们网页应用程序的核心。其实它是一个由`Vercel`构建的`React`应用程序，使用`_app.tx`来构建应用的基本骨架。

## 🧞 使用连接钱包

我们将通过`React hook`的方式使用钱包，比如在`components/AppBar.tsx`中设置一个`React hook`：

```ts
import { FC } from 'react'
import styles from '../styles/Home.module.css'
import Image from 'next/image'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

export const AppBar: FC = () => {
    return (
        <div className={styles.AppHeader}>
            <Image src="/solanaLogo.png" height={30} width={200} />
            <span>Wallet-Adapter Example</span>
            <WalletMultiButton/>
        </div>
    )
}
```

`WalletMultiButton`为我们处理了许多工作，处理了所有连接的细节。如果你现在强制刷新应用程序，你应该能在右上角看到一个紫色的按钮！
