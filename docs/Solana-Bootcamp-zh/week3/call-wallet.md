---
sidebar_position: 124
sidebar_label: 与钱包交互
sidebar_class_name: green
---

# 与钱包交互

## 通过 `WalletAdatper` 与钱包交互

为了给 DApp 提供一套统一的兼容钱包的接口。Solana 设计了一套 `Wallet Adapter`。 Solana 要求，钱包方需要按照该套接口设计，提供实现。这样 DApp 使用方，只需要按照一套接口，就可以轻松支持多个钱包。接口包含了

- 网络选择
- 账号选择
- 账号签名
- 等

除了统一的接口，Adapter 还设计了一套基础 UI，其包括了弹出钱包的选择列表，以及链接钱包后的的账号地址显示。

![](../img/week3/wallets_select_ui.png)

## 安装

在你的工程总安装 `Wallet_Adapter` 依赖

```bash
npm install --save \
    @solana/wallet-adapter-base \
    @solana/wallet-adapter-react \
    @solana/wallet-adapter-react-ui \
    @solana/wallet-adapter-wallets \
    @solana/web3.js
```

这里我们还会用到一些 `web3.js` 里面的变量，所以也将其 `install` 上。

在使用地方先 `import` 相关 SDK

```ts
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

import {
    WalletModalProvider,
    WalletDisconnectButton,
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
```

这里因为我们的示例 demo 是 react 的，所以使用了 react-ui，Wallet-adapter 同时也提供了 Material UI 和 Ant Design 的组件。

已经实现了 Adapter 的钱包参见[列表](https://github.com/solana-labs/wallet-adapter/tree/master/packages/wallets)。

这里我们使用：

```ts
import {SolongWalletAdapter} from '@solana/wallet-adapter-solong'
import {PhantomWalletAdapter} from '@solana/wallet-adapter-phantom';
```

## 链接钱包

链接钱包的步骤，是在用户界面设置一个"`Connect`"的按钮，当点击时，弹出一个钱包选择 list 界面。可使用钱包，通过数组参数参数。

```ts
this.network = WalletAdapterNetwork.Testnet;

// You can also provide a custom RPC endpoint.
this.endpoint =  clusterApiUrl(this.network);

this.wallets =[
    new SolongWalletAdapter(),
    new PhantomWalletAdapter(),
];
```

然后再弹出 UI 将钱包罗列出来

```ts
<ConnectionProvider endpoint={endpoint}>
    <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
            <WalletMultiButton />
            <WalletDisconnectButton />
        </WalletModalProvider>
    </WalletProvider>
</ConnectionProvider>
```

这里主要使用了 `ConnectionProvider` 来指定相应的网络。`endpoint` 参数为使用的 RPC 环境。通过 `WalletProvider` 来选择实现了 `Adapter` 的插件钱包，示例中我们设置了 `Phantom`。

最后在 `WalletModalProvider` 通过相应的按钮触发对钱包的选择。也就是我们上面传递的 `Solong` 和 `Phantom`。

![](../img/week3/wallet_connect.png)

当用户点击 `WalletMultiButton` 的时候，会自动弹出钱包选择界面。选择钱包后，会弹出钱包的链接界面。当用户点击链接后，这里的 `ModalProvider` 会得到选择的账号的信息，并将地址显示在按钮上。

当点击 `WalletDisconnectButton` 后，会断开链接。

## 发送请求

前面介绍了 web3.js 的使用，在发送请求的时候，我们需要用账号的私钥对交易内容做签名。那么在使用钱包的情况下该如何操作呢？

首先 import 相关库

```ts
import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Keypair, SystemProgram, Transaction } from '@solana/web3.js';
import React, { FC, useCallback } from 'react';
```

然后先取出链接和公钥：

```ts
const { connection } = useConnection();
const { publicKey, sendTransaction } = useWallet();
```

这里通过 `useConnection` 可以得到我们前面钱包里面选择的 RPC 链接，`useWallet` 返回的结果为选中的钱包的地址，以及使用该钱包发送交易的方法。

```ts
const {
    context: { slot: minContextSlot },
    value: { blockhash, lastValidBlockHeight }
} = await connection.getLatestBlockhashAndContext();

const signature = await sendTransaction(transaction, connection, { minContextSlot });
```

通过 `connection.getLatestBlockhashAndContext` 可以得到 `minContextSlot` 信息，然后再调用 `sendTransaction` 方法，就可以出发钱包弹出 UI，并提示用户确认，当用户点击确认后，既完成请求的发送。

## 切换账号


如果用户需要切换账号，那么通过 UI 提供的 `Disconnect` 入口，先取消当前账号的链接。然后再通过链接界面，选择其他的钱包账号。所以切换账号就是先断开，再重新链接的过程。

取消链接，只需要删除当前记录的用户即刻。

而切换账号则可以直接在此使用"连接" 的流程。

## Demo

[wallet adapter demo](https://www.solanazh.com/assets/files/wallet-adapter-demo.zip)
