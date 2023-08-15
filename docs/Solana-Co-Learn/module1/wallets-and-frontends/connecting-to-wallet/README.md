---
sidebar_position: 17
sidebar_label: 🔌 连接到钱包
sidebar_class_name: green
---

# 🔌 连接到钱包

我们现在已经知道如何使用代码与网络进行交互有了。交互过程中直接使用私钥来初始化账户。很明显，这在正常的dapp中行不通。
(永远不要把你的私钥暴露给任何人，任何dapp)。

接下来我们介绍，如何通过sdk 和 wallet 进行交互。

“钱包”这个名字有点奇怪，因为它们不仅仅是用来存放东西的。钱包的关键部分是使用其包含的秘钥进行安全的交易签名。
它们有很多形式，最常见的是浏览器扩展，它们为你（开发者）提供API，以向用户建议交易。钱包使你能够安全地进操作。

推荐使用 [Phantom](https://phantom.app/)

## 🛠 Solana 钱包适配器

开发过程中，我们使用 [Solana Wallet-Adapter](https://github.com/solana-labs/wallet-adapter?utm_source=buildspace.so&utm_medium=buildspace_project) 适配多种多样的钱包，实现通用的 solana API。
支持钱包如下： [https://github.com/solana-labs/wallet-adapter/blob/master/wallets.png](https://github.com/solana-labs/wallet-adapter/blob/master/wallets.png)

使用适配器: `wallet-adapter-base` 和 `wallet-adapter-react` 为必选的库。
然后，你可以根据需求，选择支持的钱包, 或者 `wallet-adapter-wallets`。

给出一个使用 phantom 登录的实例代码:

```bash
npm install @solana/wallet-adapter-base \
    @solana/wallet-adapter-react \
    @solana/wallet-adapter-phantom \
    @solana/wallet-adapter-react-ui
```

- `wallet-adapter-react-ui` 为我们处理整个 UI - 连接
- 选择 @solana/wallet-adapter-phantom 钱包。

## 👜 创建一个钱包连接按钮

### 1.初始化项目模版

```bash
git clone https://github.com/CreatorsDAO/solana-ping-frontend
cd solana-ping-frontend
git checkout starter
npm i
npm run dev 
```

该模板继承了我们上次构建的内容 - 我们为 `ping` 客户端提供了一个前端，用于将数据写入区块链。

![](./img/upload_2.png)

这是一个准系统 UI - 让我们将其连接到 `wallet-adapter-react` 库。

### 2. 修改 `_app.tsx` 并使其看起来像这样：

```ts
import React, { useMemo } from "react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import {
  GlowWalletAdapter,
  PhantomWalletAdapter
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
      new GlowWalletAdapter()
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

### 框架介绍


1. 这是一个`React` 应用框架，`useMemo` 根据网络连接状态，确认 rpc 网关的交互URL
2. 使用 `@solana/wallet-adapter-base`  的  `wallet-adapter-network`  展示可用的网络。
3. WalletModalProvider 会提示用户选择钱包。
4. `ConnectionProvider` 接收一个RPC端点，并让我们直接与Solana区块链上的节点进行通信。我们将在整个应用程序中使用它来发送交易。
5. `WalletProvider` 为我们提供了一个连接各种钱包的标准接口
6. `wallet-adapter-wallets` 提供钱包适配器。我们将使用从中导入的内容来创建我们将提供给 `WalletProvider` 的钱包列表。我刚刚选择了 Phantom 和 Glow。
7. 最后，我们有 `clusterApiURL` ，它只是一个根据我们提供的网络为我们生成 RPC 端点的函数。
8. 总结一下：这个文件是我们网页应用程序的核心。其实，他是一个vercel 构建的 React应用程序，使用_app.tx 构建应用的基本骨架。

## 🧞‍♂️ 使用连接钱包

我们将通过React hook 的方式使用钱包，比如 `components/AppBar.tsx` 中设置一个 `React hook`：

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

 `WalletMultiButton` 为我们做了很多魔法，处理了所有的连接细节。
 如果你现在强制刷新应用程序，你应该能看到一个右上角的紫色按钮！
