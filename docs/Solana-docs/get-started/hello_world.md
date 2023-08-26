---
sidebar_position: 202
sidebar_label:  🔜 hello world 快速入门指南
sidebar_class_name: green
---

# 🔜 hello world 快速入门指南

对于这个“`Hello World`”快速入门指南，我们将使用[`Solana Playground`](https://beta.solpg.io/)，一个基于浏览器的`IDE`来开发和部署我们的`Solana`程序。要使用它，您无需在计算机上安装任何软件。只需在您选择的浏览器中打开`Solana Playground`，您就可以开始编写和部署`Solana`程序了。

## 你将学到什么

- 如何开始使用`Solana Playground`
- 如何在`Playground`上创建`Solana`钱包
- 如何使用`Rust`编写基本的`Solana`程序
- 如何构建和部署`Solana Rust`程序
- 如何使用`JavaScript`与您的链上程序进行交互

## 使用Solana Playground

[`Solana Playground`](https://beta.solpg.io/)是一个基于浏览器的应用程序，可以让您在链上编写、构建和部署`Solana`程序，而无需安装任何软件。

这是一个非常好的开发者资源，特别适合在`Windows`上开始`Solana`开发。

### 导入我们的示例项目

在浏览器的新标签页中，打开我们在`Solana Playground`上的示例项目“`Hello World`”：https://beta.solpg.io/6314a69688a7fca897ad7d1d

接下来，通过点击“导入”图标并为您的项目命名 `hello_world` ，将项目导入到您的本地工作空间中。

![](./img/solana-get-started-import-on-playground.png)

> 如果您不将程序导入到`Solana Playground`中，那么您将无法对代码进行更改。但您仍然可以构建并部署代码到`Solana`集群。

### 创建一个Playground钱包

通常在本地开发中，您需要创建一个文件系统钱包，以便与`Solana CLI`一起使用。但是在`Solana Playground`中，您只需要点击几个按钮就可以创建一个基于浏览器的钱包。

> 注意⚠️：
>
> 您的 `Playground` 钱包将保存在浏览器的本地存储中。清除浏览器缓存将删除您保存的钱包。创建新钱包时，您可以选择保存钱包的密钥对文件的本地副本。

点击屏幕左下角的红色状态指示按钮，（可选）将您的钱包密钥文件保存到计算机备份，然后点击“继续”。

创建了`Playground`钱包后，您会注意到窗口底部显示了您的钱包地址、`SOL`余额以及您连接的`Solana`集群（通常默认/推荐为`Devnet`，但也可以接受“`localhost`”测试验证器）。



## 创建一个Solana程序

您的基于`Rust`的`Solana`程序的代码将存放在您的 `src/lib.rs` 文件中。在 `src/lib.rs` 中，您可以导入`Rust`的`crate`并定义您的逻辑。在`Solana Playground`中打开您的 `src/lib.rs` 文件。

### 导入 solana_program crate

在 `lib.rs` 的顶部，我们导入 `solana-program` 包并将所需的项目引入本地命名空间：

```rust
use solana_program::{
    account_info::AccountInfo,
    entrypoint,
    entrypoint::ProgramResult,
    pubkey::Pubkey,
    msg,
};
```

### 编写你的程序逻辑

每个 `Solana` 程序都必须定义一个 `entrypoint` ，告诉 `Solana` 运行时从哪里开始执行你的链上代码。你的**程序入口**应该提供一个名为 `process_instruction` 的公共函数：

```rust
// declare and export the program's entrypoint
entrypoint!(process_instruction);

// program entrypoint's implementation
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8]
) -> ProgramResult {
    // log a message to the blockchain
    msg!("Hello, world!");

    // gracefully exit the program
    Ok(())
}
```

每个链上程序都应该返回一个值为 `()` 的[结果枚举](https://doc.rust-lang.org/std/result/)。这告诉`Solana`运行时，你的程序成功执行且没有错误。

我们上面的程序将简单地将一条消息“`Hello, world!`”记录到区块链集群中，然后以 `Ok(())` 优雅地退出。

### 构建你的程序

在左侧边栏中，选择“构建和部署”选项卡。接下来，点击“构建”按钮。

如果你查看`Playground`的终端，你应该能看到你的`Solana`程序开始编译。一旦完成，你将会看到一个成功的消息。

![](./img/solana-get-started-successful-build.png)

> 注意⚠️：
>
>当您的程序编译时，可能会收到有关未使用变量的警告。不用担心，这些警告不会影响您的构建。这是因为我们的非常简单的程序没有使用在 `process_instruction` 函数中声明的所有变量。

### 部署你的程序

您可以点击“部署”按钮将您的第一个程序部署到`Solana`区块链上。具体来说，是部署到您选择的集群（例如`Devnet`、`Testnet`等）。

每次部署后，您会看到您的Playground钱包余额发生变化。默认情况下，`Solana Playground`会自动代表您请求`SOL`空投，以确保您的钱包有足够的`SOL`来支付部署的费用。

> 注意：如果你需要更多的`SOL`，你可以在游乐场终端中输入`airdrop`命令来进行空投

```bash
solana airdrop 2
```

![](./img/solana-get-started-import-on-playground.png)

### 找到你的程序ID

当使用[`web3.js`](https://docs.solana.com/developing/clients/javascript-reference)或从另一个`Solana`程序执行程序时，您需要提供 `program id` （也称为您的程序的公共地址）。

在`Solana Playground`的`Build & Deploy`侧边栏中，您可以在`Program Credentials`下拉菜单中找到您的 `program id` 。

#### 恭喜！

您已成功在浏览器中使用Rust语言设置、构建和部署了一个`Solana`程序。接下来，我们将演示如何与您的链上程序进行交互。

## 与您的链上程序互动

一旦您成功将`Solana`程序部署到区块链上，您将希望能够与该程序进行交互。

和大多数开发者一样，我们在创建`dApps`和网站时会使用`JavaScript`与我们的链上程序进行交互。具体来说，我们将使用开源的`NPM`包 [`@solana/web3.js`](https://www.npmjs.com/package/@solana/web3.js) 来帮助我们的客户端应用程序。

> 信息：
>
> 这个`web3.js`包是在[`JSON RPC API`](https://docs.solana.com/api)之上的一个抽象层，它减少了重写常见样板代码的需求，有助于简化客户端应用程序代码。

### 初始化客户端

我们将使用`Solana Playground`进行客户端生成。在`playground`终端中运行 `run` 命令来创建一个客户端文件夹：

```bash
run
```

我们已经创建了一个 `client` 文件夹和一个默认的 `client.ts` 。这是我们接下来的 `hello world` 程序的工作目录。

### 游乐场全球

在游乐场上，有许多全球可用的实用工具，我们可以直接使用，无需安装或设置任何东西。对于我们的 `hello world` 程序来说，最重要的是 `web3` 用于 `@solana/web3.js` 和 `pg` 用于`Solana`游乐场实用工具。

> 信息
>
> 您可以在编辑器中按下 `CTRL+SPACE` （或在 `macOS` 上按下 `CMD+SPACE` ）来查看所有可用的全局变量。

### 调用该程序

要执行您的链上程序，您必须向其发送一笔交易。提交到`Solana`区块链的每笔交易都包含一系列指令（以及该指令将与之交互的程序）。

在这里我们创建一个新的交易并向其添加一个单独的 `instruction`。

```typescript
// create an empty transaction
const transaction = new web3.Transaction();

// add a hello world program instruction to the transaction
transaction.add(
  new web3.TransactionInstruction({
    keys: [],
    programId: new web3.PublicKey(pg.PROGRAM_ID),
  }),
);
```

每个 ·instruction· 必须包含操作所涉及的所有键和我们要执行的程序`ID`。在这个例子中， `keys` 是空的，因为我们的程序只记录 `hello world` ，不需要任何账户。

完成我们的交易后，我们可以将其提交到集群中

```typescript
// send the transaction to the Solana cluster
console.log("Sending transaction...");
const txHash = await web3.sendAndConfirmTransaction(
  pg.connection,
  transaction,
  [pg.wallet.keypair],
);
console.log("Transaction sent with hash:", txHash);
```

> 信息：
>
> 签名者数组中的第一个签名者默认为交易手续费支付者。我们将使用我们的密钥对 `pg.wallet.keypair` 进行签名。

### 运行应用程序

客户端应用程序编写完成后，您可以通过相同的 `run` 命令来运行代码。

一旦您的申请完成，您将看到类似于以下的输出：

```bash
Running client...
  client.ts:
    My address: GkxZRRNPfaUfL9XdYVfKF3rWjMcj5md6b6mpRoWpURwP
    My balance: 5.7254472 SOL
    Sending transaction...
    Transaction sent with hash: 2Ra7D9JoqeNsax9HmNq6MB4qWtKPGcLwoqQ27mPYsPFh3h8wignvKB2mWZVvdzCyTnp7CEZhfg2cEpbavib9mCcq
```

### 获取交易日志

我们将直接在游乐场中使用 `solana-cli` 来获取有关任何交易的信息：

```bash
solana confirm -v <TRANSACTION_HASH>
```

用从调用 `hello world` 程序获得的哈希值替换 `<TRANSACTION_HASH>` 。

你应该在输出的日志消息部分看到 `Hello, world!` 。🎉

#### 恭喜！！！

你现在已经为你的链上程序编写了一个客户端应用程序。你现在是一个`Solana`开发者了！

PS：尝试更新您的程序消息，然后重新构建、重新部署和重新执行您的程序。

## 下一步

请查看下面的链接，了解有关编写`Solana`程序的更多信息：

- 设置本地开发环境
- `Solana`程序编写概述
- 了解如何使用`Rust`开发`Solana`程序
- 链上程序调试
