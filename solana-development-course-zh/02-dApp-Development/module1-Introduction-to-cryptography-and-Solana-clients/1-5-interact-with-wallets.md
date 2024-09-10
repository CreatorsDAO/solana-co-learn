# 简介

钱包用于存储您的秘密密钥，并处理安全的交易签名。硬件钱包将您的秘密密钥存储在独立设备上。软件钱包使用您的计算机进行安全存储，并且通常是浏览器扩展程序，方便连接到网站。Solana的Wallet-Adapter库简化了对钱包浏览器扩展的支持，允许您构建可以请求用户钱包地址并为他们提出签名交易的网站。

# 正文

### 钱包

在前两课中，我们讨论了密钥对。密钥对用于定位账户和签署交易。虽然密钥对的公钥是完全安全共享的，但秘密密钥应始终保持在安全的地方。如果用户的秘密密钥暴露，则恶意行为者可以清空其账户中的所有资产，并以该用户的身份执行交易。

“钱包”指的是存储秘密密钥以保持其安全的任何东西。这些安全存储选项通常可以描述为“硬件”或“软件”钱包。硬件钱包是与您的计算机分开的存储设备。软件钱包是您可以在现有设备上安装的应用程序。

软件钱包通常以浏览器扩展的形式出现。这使得网站可以轻松与钱包互动。此类互动通常限于：

- 查看钱包的公钥（地址）
- 提交用户批准的交易
- 将批准的交易发送到网络 一旦提交了交易，最终用户可以“确认”交易并用他们的“签名”发送到网络。

签署交易需要使用您的秘密密钥。通过让网站提交交易到您的钱包，并让钱包处理签名，您确保永远不会将您的秘密密钥暴露给网站。相反，您只与钱包应用程序共享秘密密钥。

除非您自己正在创建一个钱包应用程序，否则您的代码永远不需要请求用户的秘密密钥。相反，您可以要求用户使用声誉良好的钱包连接到您的网站。

### Phantom Wallet

在Solana生态系统中最广泛使用的软件钱包之一是Phantom。Phantom支持几个最受欢迎的浏览器，并有一个移动应用程序，用于在外出时连接。您可能希望您的去中心化应用支持多个钱包，但本课程将专注于Phantom。

### Solana的Wallet-Adapter

Solana的Wallet-Adapter是一套您可以用来简化支持钱包浏览器扩展的过程的库。

Solana的Wallet-Adapter包含多个模块化包。核心功能在@solana/wallet-adapter-base和@solana/wallet-adapter-react中找到。

还有一些包提供了常用UI框架的组件。在本课程和整个课程中，我们将使用@solana/wallet-adapter-react-ui中的组件。

最后，还有一些适配特定钱包的包，包括Phantom。您可以使用@solana/wallet-adapter-wallets来包含所有支持的钱包，或者您可以选择像@solana/wallet-adapter-phantom这样的特定钱包包。

#### 安装Wallet-Adapter库

当向现有的react应用添加钱包支持时，您首先需要安装适当的包。您将需要@solana/wallet-adapter-base、@solana/wallet-adapter-react。如果您计划使用提供的react组件，您还需要添加@solana/wallet-adapter-react-ui。

所有支持钱包标准的钱包都默认受支持，几乎所有当前的Solana钱包都支持钱包标准。然而，如果您希望添加对不支持标准的任何钱包的支持，请添加它们的包。

```
npm install @solana/wallet-adapter-base \
    @solana/wallet-adapter-react \
    @solana/wallet-adapter-react-ui
```

#### 连接到钱包

`@solana/wallet-adapter-react`允许我们通过钩子（hooks）和上下文提供者（context providers）持久化和访问钱包连接状态，主要包括：

- `useWallet`
- `WalletProvider`
- `useConnection`
- `ConnectionProvider`

为了确保这些功能正常工作，任何使用`useWallet`和`useConnection`的地方都应该被`WalletProvider`和`ConnectionProvider`包裹。确保这一点的最佳方式之一是将您的整个应用程序包裹在`ConnectionProvider`和`WalletProvider`中：

```
import { NextPage } from "next";
import { FC, ReactNode } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import * as web3 from "@solana/web3.js";

export const Home: NextPage = (props) => {
  const endpoint = web3.clusterApiUrl("devnet");
  const wallet = new PhantomWalletAdapter();

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={[wallet]}>
        <p>Put the rest of your app here</p>
      </WalletProvider>
    </ConnectionProvider>
  );
};
```

请注意，`ConnectionProvider`需要一个`endpoint`属性，而`WalletProvider`需要一个`wallets`属性。我们继续使用Devnet集群的`endpoint`，现在我们只使用`PhantomWalletAdapter`作为钱包。

此时，您可以使用`wallet.connect()`来连接，这将指示钱包提示用户授权查看他们的公钥并请求交易批准。

![Screenshot of wallet connection prompt](https://www.soldev.app/assets/wallet-connect-prompt.png)

虽然您可以在`useEffect`钩子中执行此操作，但通常您会想提供更复杂的功能。例如，您可能希望用户能够从支持的钱包列表中选择，或在他们已经连接后断开连接。

### @solana/wallet-adapter-react-ui

您可以为此创建自定义组件，或者利用`@solana/wallet-adapter-react-ui`提供的组件。提供广泛选项的最简单方式是使用`WalletModalProvider`和`WalletMultiButton`：

```
import { NextPage } from "next";
import { FC, ReactNode } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import * as web3 from "@solana/web3.js";

const Home: NextPage = (props) => {
  const endpoint = web3.clusterApiUrl("devnet");
  const wallet = new PhantomWalletAdapter();

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={[wallet]}>
        <WalletModalProvider>
          <WalletMultiButton />
          <p>Put the rest of your app here</p>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default Home;
```

`WalletModalProvider`为用户提供了一个模态屏幕，用于选择他们想使用的钱包。`WalletMultiButton`的行为会根据连接状态发生变化：

![Screenshot of multi button select wallet option](https://www.soldev.app/assets/multi-button-select-wallet.png)

![Screenshot of connect wallet modal](https://www.soldev.app/assets/connect-wallet-modal.png)

![Screenshot of multi button connect options](https://www.soldev.app/assets/multi-button-connect.png)

![Screenshot of multi button connected state](https://www.soldev.app/assets/multi-button-connected.png)

如果您需要更具体的功能，也可以使用更细粒度的组件：

- `WalletConnectButton`
- `WalletModal`
- `WalletModalButton`
- `WalletDisconnectButton`
- `WalletIcon`

### 访问账户信息

一旦您的网站连接到一个钱包，`useConnection`将检索一个`Connection`对象，而`useWallet`将获取`WalletContextState`。`WalletContextState`有一个`publicKey`属性，当未连接到钱包时为null，当钱包连接时则有用户账户的公钥。拥有公钥和连接后，您可以获取账户信息等。

```
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { FC, useEffect, useState } from "react";

export const BalanceDisplay: FC = () => {
  const [balance, setBalance] = useState(0);
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  useEffect(() => {
    if (!connection || !publicKey) {
      return;
    }

    connection.onAccountChange(
      publicKey,
      (updatedAccountInfo) => {
        setBalance(updatedAccountInfo.lamports / LAMPORTS_PER_SOL);
      },
      "confirmed",
    );

    connection.getAccountInfo(publicKey).then((info) => {
      setBalance(info.lamports);
    });
  }, [connection, publicKey]);

  return (
    <div>
      <p>{publicKey ? `Balance: ${balance / LAMPORTS_PER_SOL} SOL` : ""}</p>
    </div>
  );
};
```

注意调用`connection.onAccountChange()`，它在网络确认交易后更新显示的账户余额。

### 发送交易

`WalletContextState`还提供了一个`sendTransaction`函数，您可以用它来提交交易以供审批。

```
const { publicKey, sendTransaction } = useWallet();
const { connection } = useConnection();

const sendSol = (event) => {
  event.preventDefault();

  const transaction = new web3.Transaction();
  const recipientPubKey = new web3.PublicKey(event.target.recipient.value);

  const sendSolInstruction = web3.SystemProgram.transfer({
    fromPubkey: publicKey,
    toPubkey: recipientPubKey,
    lamports: LAMPORTS_PER_SOL * 0.1,
  });

  transaction.add(sendSolInstruction);
  sendTransaction(transaction, connection).then((sig) => {
    console.log(sig);
  });
};
```

当调用此函数时，已连接的钱包将显示交易以供用户批准。如果获得批准，那么交易将被发送。

![Screenshot of wallet transaction approval prompt](https://www.soldev.app/assets/wallet-transaction-approval-prompt.png)



# 实验

让我们从上一课的Ping程序开始，并构建一个前端，让用户批准一个向该程序发送ping的交易。作为提醒，程序的公钥是 `ChT1B39WKLS8qUrkLvFDXMhEJ4F1XZzwUNHUt4AU9aVa`，数据账户的公钥是 `Ah9K7dQ8EHaZqcAsgBW8w37yN2eAy3koFmUn4x3CJtod`。

![Screenshot of Solana Ping App](https://www.soldev.app/assets/solana-ping-app.png)

### 1.下载Phantom浏览器扩展并将其设置为Devnet 

如果您还没有，下载Phantom浏览器扩展。在撰写本文时，它支持Chrome、Brave、Firefox和Edge浏览器，因此您还需要安装其中一个浏览器。按照Phantom的指示创建一个新账户和一个新钱包。

一旦您有了一个钱包，在Phantom UI的右下角点击设置齿轮。向下滚动并点击“更改网络”这一行项目，然后选择“Devnet”。这确保Phantom将连接到我们在这个实验室中将要使用的同一个网络。

### 2.下载起始代码 

下载这个项目的起始代码。这个项目是一个简单的Next.js应用程序。除了AppBar组件外，它几乎是空的。我们将在本实验室中构建其余部分。

您可以在控制台中使用命令`npm run dev`查看其当前状态。

### 3.用上下文提供者包裹应用 

首先，我们将创建一个新组件来包含我们将使用的各种Wallet-Adapter提供者。在components文件夹内创建一个名为 `WalletContextProvider.tsx` 的新文件。

让我们从一个功能组件的样板开始：

```
import { FC, ReactNode } from "react";

const WalletContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  return (

  ));
};

export default WalletContextProvider;
```

为了正确连接到用户的钱包，我们需要一个`ConnectionProvider`、`WalletProvider`和`WalletModalProvider`。首先从`@solana/wallet-adapter-react`和`@solana/wallet-adapter-react-ui`中导入这些组件。然后将它们添加到`WalletContextProvider`组件中。请注意，`ConnectionProvider`需要一个`endpoint`参数，而`WalletProvider`需要一个钱包数组。现在，分别使用一个空字符串和一个空数组即可。

```
import { FC, ReactNode } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";

const WalletContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <ConnectionProvider endpoint={""}>
      <WalletProvider wallets={[]}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default WalletContextProvider;
```

我们还需要的最后两件事是`ConnectionProvider`的实际端点和`WalletProvider`的支持钱包。

对于端点，我们将使用与之前相同的`@solana/web3.js`库中的`clusterApiUrl`函数，因此您需要导入它。对于钱包数组，您还需要导入`@solana/wallet-adapter-wallets`库。

在导入这些库之后，创建一个使用`clusterApiUrl`函数获取Devnet的url的常量`endpoint`。然后创建一个常量`wallets`，并将其设置为包含新构造的`PhantomWalletAdapter`的数组。最后，分别替换`ConnectionProvider`和`WalletProvider`中的空字符串和空数组。

要完成此组件，请在导入下面添加`require('@solana/wallet-adapter-react-ui/styles.css')`，以确保`Wallet Adapter`库组件的正确样式和行为。

```
import { FC, ReactNode } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import * as web3 from "@solana/web3.js";
import * as walletAdapterWallets from "@solana/wallet-adapter-wallets";
require("@solana/wallet-adapter-react-ui/styles.css");

const WalletContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const endpoint = web3.clusterApiUrl("devnet");
  const wallets = [new walletAdapterWallets.PhantomWalletAdapter()];

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default WalletContextProvider;
```

### 4. 添加钱包多按钮

接下来，让我们设置“连接”按钮。当前的按钮只是一个占位符，因为我们不是使用标准按钮或创建自定义组件，而是将使用`Wallet-Adapter`的“多按钮”。这个按钮与我们在`WalletContextProvider`中设置的提供者进行交互，并允许用户选择钱包、连接到钱包以及从钱包断开连接。如果您需要更多自定义功能，可以创建自定义组件来处理这个。

在我们添加“多按钮”之前，我们需要在`index.tsx`中导入`WalletContextProvider`并在`</Head>`标签的关闭标签后添加它：

```
import { NextPage } from "next";
import styles from "../styles/Home.module.css";
import WalletContextProvider from "../components/WalletContextProvider";
import { AppBar } from "../components/AppBar";
import Head from "next/head";
import { PingButton } from "../components/PingButton";

const Home: NextPage = (props) => {
  return (
    <div className={styles.App}>
      <Head>
        <title>Wallet-Adapter Example</title>
        <meta name="description" content="Wallet-Adapter Example" />
      </Head>
      <WalletContextProvider>
        <AppBar />
        <div className={styles.AppBody}>
          <PingButton />
        </div>
      </WalletContextProvider>
    </div>
  );
};

export default Home;
```

如果您运行应用程序，一切看起来应该还是一样的，因为当前右上角的按钮仍然只是一个占位符。为了解决这个问题，请打开`AppBar.tsx`并用`<WalletMultiButton/>`替换`<button>Connect</button>`。您需要从`@solana/wallet-adapter-react-ui`导入`WalletMultiButton`。

```
import { FC } from "react";
import styles from "../styles/Home.module.css";
import Image from "next/image";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export const AppBar: FC = () => {
  return (
    <div className={styles.AppHeader}>
      <Image src="/solanaLogo.png" height={30} width={200} />
      <span>Wallet-Adapter Example</span>
      <WalletMultiButton />
    </div>
  );
};
```

此时，您应该能够运行应用程序并与屏幕右上角的多按钮互动。它现在应该显示为“选择钱包”。如果您安装了Phantom扩展并已登录，您应该能够使用这个新按钮将您的Phantom钱包连接到该网站。

### 5. 创建按钮以ping程序

既然我们的应用程序可以连接到Phantom钱包，让我们让“Ping!”按钮实际做些事情。

首先打开`PingButton.tsx`文件。我们将替换`onClick`内的`console.log`，用创建交易并提交到Phantom扩展以供最终用户批准的代码。

首先，我们需要一个连接、钱包的公钥和`Wallet-Adapter`的`sendTransaction`函数。要获得这些，我们需要从`@solana/wallet-adapter-react`导入`useConnection`和`useWallet`。在这里，我们还将导入`@solana/web3.js`，因为我们需要它来创建我们的交易。

```
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import * as web3 from '@solana/web3.js'
import { FC, useState } from 'react'
import styles from '../styles/PingButton.module.css'

export const PingButton: FC = () => {

  const onClick = () => {
    console.log('Ping!')
  }

  return (
    <div className={styles.buttonContainer} onClick={onClick}>
      <button className={styles.button}>Ping!</button>
    </div>
  )
}
```

现在使用`useConnection`钩子创建一个`connection`常量，并使用`useWallet`钩子创建`publicKey`和`sendTransaction`常量。

```
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import * as web3 from "@solana/web3.js";
import { FC, useState } from "react";
import styles from "../styles/PingButton.module.css";

export const PingButton: FC = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const onClick = () => {
    console.log("Ping!");
  };

  return (
    <div className={styles.buttonContainer} onClick={onClick}>
      <button className={styles.button}>Ping!</button>
    </div>
  );
};
```

有了这些，我们可以填写`onClick`的主体。

首先，检查`connection`和`publicKey`是否存在（如果其中任何一个不存在，则意味着用户的钱包尚未连接）。

接下来，构造两个`PublicKey`实例，一个用于程序ID `ChT1B39WKLS8qUrkLvFDXMhEJ4F1XZzwUNHUt4AU9aVa`，另一个用于数据账户`Ah9K7dQ8EHaZqcAsgBW8w37yN2eAy3koFmUn4x3CJtod`。

接下来，构造一个`Transaction`，然后是一个包含数据账户作为可写密钥的新`TransactionInstruction`。

接下来，将指令添加到交易中。

最后，调用 `sendTransaction`。

```
const onClick = () => {
  if (!connection || !publicKey) {
    return;
  }

  const programId = new web3.PublicKey(PROGRAM_ID);
  const programDataAccount = new web3.PublicKey(DATA_ACCOUNT_PUBKEY);
  const transaction = new web3.Transaction();

  const instruction = new web3.TransactionInstruction({
    keys: [
      {
        pubkey: programDataAccount,
        isSigner: false,
        isWritable: true,
      },
    ],
    programId,
  });

  transaction.add(instruction);
  sendTransaction(transaction, connection).then((sig) => {
    console.log(sig);
  });
};
```

就这样！如果您刷新页面，连接您的钱包，并点击ping按钮，Phantom应该会弹出一个窗口，用于确认交易。

### 6. 对边缘进行一些润色

您可以做很多事情来改善这里的用户体验。例如，您可以更改UI，只在连接了钱包时显示Ping按钮，否则显示其他提示。用户确认交易后，您可以链接到Solana Explorer上的交易，以便他们轻松查看交易详情。您越多地尝试，就越熟悉它，所以发挥创意！

您还可以下载本实验的[完整源代码](https://github.com/Unboxed-Software/solana-ping-frontend)，以了解所有这些的上下文。

# 挑战

现在轮到您独立构建一些东西了。

创建一个应用程序，允许用户连接他们的Phantom钱包并向另一个账户发送SOL。

![Screenshot of Send SOL App](https://www.soldev.app/assets/solana-send-sol-app.png)

* 您可以从头开始构建，也可以下载[起始代码](https://github.com/Unboxed-Software/solana-send-sol-frontend/tree/starter)。 

* 用适当的上下文提供者包裹起始应用程序。 

* 在表单组件中，设置交易并将其发送到用户的钱包以供批准。 

* 对用户体验发挥创意。添加一个链接，让用户在Solana Explorer上查看交易，或者添加一些您觉得很酷的其他内容！ 

如果您真的感到困惑，随时可以查看[解决方案代码](https://github.com/Unboxed-Software/solana-send-sol-frontend/tree/main)。