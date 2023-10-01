---
sidebar_position: 4
sidebar_label: 从 Solana 网络读取数据
sidebar_class_name: green
tags:
  - blockchain
  - solana
  - read-data
---

# 从 Solana 网络读取数据

## TL;DR

- SOL 是 Solana 原生代币的名称。每个 Sol 由 10 亿个 Lamports 组成。
- 账户存储代币、NFT、程序和数据。现在我们将重点关注存储 SOL 的帐户。
- 地址指向 Solana 网络上的帐户。任何人都可以读取给定地址中的数据。大多数地址也是公钥

## 概述

### 账户

Solana 上存储的所有数据都存储在帐户中。帐户可以存储：

- SOL
- 其他代币，例如 USDC
- NFT
- Program，比如我们这门课做的影评Program！
- Program 数据，例如对上述节目的特定电影的评论！

#### SOL

SOL 是 Solana 的原生代币 - SOL 用于支付交易费用、支付账户租金等。 SOL 有时用 ◎ 符号显示。每个 SOL 由 10 亿个 Lamports 组成。与金融应用程序通常以美分（美元）、便士（英镑）进行数学计算的方式相同，Solana 应用程序通常使用 Lamports 进行数学计算，并且仅转换为 SOL 来显示数据。

#### 地址

地址唯一标识帐户。地址通常显示为 base-58 编码字符串，例如 `dDCQNnDmNbFVi8cQhKAgXhyhXeJ625tvwsunRyRc7c8`。 Solana 上的大多数地址也是公钥。正如上一章提到的，谁控制了匹配的密钥，谁就控制了该帐户——例如，拥有密钥的人可以从该帐户发送代币。

### 从 Solana 区块链读取

#### 安装

我们使用名为 `@solana/web3.js` 的 npm 包来完成 Solana 的大部分工作。我们还将安装 TypeScript 和 esrun，以便我们可以运行命令行：

```bash
npm install typescript @solana/web3.js @digitak/esrun
```

#### 连接到网络

使用 `@solana/web3.js` 与 Solana 网络的每次交互都将通过 `Connection` 对象进行。 `Connection` 对象与特定 Solana 网络（称为“集群”）建立连接。

现在我们将使用 `Devnet` 集群而不是`Mainnet`。顾名思义，`Devnet` 集群是为开发人员使用和测试而设计的。

```ts
import { Connection, clusterApiUrl } from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("devnet"));
console.log(`✅ Connected!`)
```

运行此 TypeScript (`npx esrun example.ts`) 显示：

```bash
✅ Connected!
```

#### 从网络读取

读取账户余额：

```ts
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("devnet"));
const address = new PublicKey('CenYq6bDRB7p73EjsPEpiYN7uveyPUTdXkDkgUduboaN');
const balance = await connection.getBalance(address);

console.log(`The balance of the account at ${address} is ${balance} lamports`);
console.log(`✅ Finished!`)
```

退回的余额存放在灯箱中。 lamport 是 Sol 的小单位，就像美分对美元或便士对英镑一样。单个 lamport 代表 0.000000001 SOL。大多数时候，我们会将 SOL 作为 Lamport 进行传输、花费、存储和处理，仅转换为完整的 SOL 来显示给用户。 Web3.js 提供了常量 `LAMPORTS_PER_SOL` 来进行快速转换。


```js
import { Connection, PublicKey, clusterApiUrl, LAMPORTS_PER_SOL } from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("devnet"));
const address = new PublicKey('CenYq6bDRB7p73EjsPEpiYN7uveyPUTdXkDkgUduboaN');
const balance = await connection.getBalance(address);
const balanceInSol = balance / LAMPORTS_PER_SOL;

console.log(`The balance of the account at ${address} is ${balanceInSol} SOL`);
console.log(`✅ Finished!`)
```

运行 `npx esrun example.ts` 将显示类似以下内容：

```bash
The balance of the account at CenYq6bDRB7p73EjsPEpiYN7uveyPUTdXkDkgUduboaN is 0.00114144 SOL
✅ Finished!
```

...就像这样，我们正在从 Solana 区块链读取数据！

## 演示

让我们练习所学的内容，并创建一个简单的网站，让用户检查特定地址的余额。

它看起来像这样：

![](./img/intro-frontend-demo.png)

为了紧扣主题，我们不会完全从头开始工作，因此请下载入门代码。入门项目使用 Next.js 和 Typescript。如果您习惯了不同的堆栈，请不要担心！您将在这些课程中学到的 web3 和 Solana 原则适用于您最熟悉的任何前端堆栈。

### 1. 确定方向

获得起始代码后，请四处查看。使用 `npm install` 安装依赖项，然后使用 `npm run dev` 运行应用程序。请注意，无论您在地址字段中输入什么内容，当您单击“检查 SOL 余额”时，余额都将是占位符值 1000。

从结构上讲，该应用程序由`index.tsx`和`AddressForm.tsx`组成。当用户提交表单时，`index.tsx` 中的 `addressSubscribedHandler` 被调用。这就是我们将添加逻辑来更新 UI 其余部分的地方。

### 2.安装依赖

使用 `npm install @solana/web3.js` 安装对 Solana web3 库的依赖项。

### 3.设置地址余额

首先，在`index.tsx`顶部导入`@solana/web3.js`。

现在该库已可用，让我们进入 `addressSubscribedHandler()` 并使用表单输入中的地址值创建 `PublicKey` 的实例。接下来，创建 `Connection` 的实例并使用它来调用 `getBalance()`。传入您刚刚创建的公钥的值。最后，调用`setBalance()`，传入`getBalance`的结果。如果您愿意，请独立尝试，而不是从下面的代码片段中复制。

```ts
import type { NextPage } from 'next'
import { useState } from 'react'
import styles from '../styles/Home.module.css'
import AddressForm from '../components/AddressForm'
import * as web3 from '@solana/web3.js'

const Home: NextPage = () => {
  const [balance, setBalance] = useState(0)
  const [address, setAddress] = useState('')

  const addressSubmittedHandler = async (address: string) => {
    setAddress(address)
    const key = new web3.PublicKey(address)
    const connection = new web3.Connection(web3.clusterApiUrl('devnet'));
    const balance = await connection.getBalance(key);
    setBalance(balance / web3.LAMPORTS_PER_SOL);
  }
  ...
}
```

大多数时候，在处理 SOL 时，系统会使用 lamports 而不是 SOL。由于计算机更擅长处理整数而不是分数，因此我们通常在整数中进行大部分交易，仅转换回 Sol 来向用户显示值。这就是为什么我们将 Solana 返回的余额除以 `LAMPORTS_PER_SOL`。

在将其设置为我们的状态之前，我们还使用 `LAMPORTS_PER_SOL` 常量将其转换为 SOL。

此时，您应该能够在表单字段中输入有效地址，然后单击“检查 SOL 余额”以查看下面填充的地址和余额。

### 4. 处理无效地址

我们即将完成。唯一剩下的问题是，使用无效地址不会显示任何错误消息或更改显示的余额。如果打开开发者控制台，您将看到`错误：无效的公钥输入`。使用 `PublicKey` 构造函数时，需要传入有效的地址，否则会出现此错误。

为了解决这个问题，让我们将所有内容包装在 `try-catch` 块中，并在用户输入无效时提醒用户。

```ts
const addressSubmittedHandler = async (address: string) => {
  try {
    setAddress(address);
    const key = new web3.PublicKey(address);
    const connection = new web3.Connection(web3.clusterApiUrl("devnet"));
    const balance = await connection.getBalance(key)
    setBalance(balance / web3.LAMPORTS_PER_SOL);
  } catch (error) {
    setAddress("");
    setBalance(0);
    alert(error);
  }
};
```

请注意，在 catch 块中，我们还清除了地址和余额以避免混淆。

我们做到了！我们有一个正常运行的站点，可以从 Solana 网络读取 SOL 余额。您正在 Solana 上实现您的宏伟抱负。如果您需要花更多时间[查看此代码](https://github.com/Unboxed-Software/solana-intro-frontend)以更好地理解它，请查看完整的解决方案代码。坚持住，这些课程会很快增加。

## 挑战

由于这是第一个挑战，我们将保持简单。继续添加到我们已经创建的前端，在“余额”之后添加一个行项目。让行项目显示该帐户是否是可执行帐户。提示：有一个 `getAccountInfo()` 方法。

由于这是 DevNet，您的常规主网钱包地址将无法执行，因此如果您想要一个可执行的地址用于测试，请使用 `CenYq6bDRB7p73EjsPEpiYN7uveyPUTdXkDkgUduboaN`。

![](./img/intro-frontend-challenge.png)

如果您遇到困难，请随时查看[解决方案代码](https://github.com/Unboxed-Software/solana-intro-frontend/tree/challenge-solution)。
