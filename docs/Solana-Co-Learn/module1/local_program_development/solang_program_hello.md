---
sidebar_position: 10
sidebar_label: Solang solidity合约实现 - hello, World
sidebar_class_name: green
tags:
  - solang-program-hello
  - solana
  - program
---

# Solang solidity合约实现 - hello, World

欢迎来到`Solana`入门指南！`Solang`是一个`Solidity`编译器，它允许你使用`Solidity`编程语言编写`Solana`程序，其他区块链中称为“智能合约”。

如果你是一位对`Solana`网络的高速和低费用感兴趣的`EVM`开发者，那么`Solang`是你的完美工具。通过`Solang`，你可以利用你对`Solidity`的现有知识开始在`Solana`上进行构建！

## 安装

在本节中，我们将帮助你设置`Solang`的开发环境。只需按照下面列出的步骤进行操作即可：

1. 检查先决条件：在开始之前，请确保你的系统上已安装了[Rust](https://www.rust-lang.org/tools/install)和[Node.js](https://nodejs.org/en)。Windows用户还需要设置好[Windows子系统](https://solana.com/developers/guides/setup-local-development#windows-users-only)以便运行`Linux`。

2. `Solana`工具套件安装：首先安装[Solana工具套件](https://docs.solana.com/cli/install-solana-cli-tools)，其中包括`Solana`命令行界面（`CLI`）和最新版本的`Solang`。

3. `Anchor`框架安装：接下来，[安装Anchor框架](https://www.anchor-lang.com/docs/installation)。`Anchor`是`Solana`生态系统中广泛使用的框架，可以简化构建`Solana`程序的过程。从`0.28`版本开始，你可以直接通过`Anchor`开始使用`Solang`进行构建。

截至撰写本文时，请使用以下命令安装`Anchor`，以确保与`Solang`版本`0.3.1`兼容：

```bash
cargo install --git https://github.com/coral-xyz/anchor anchor-cli --locked --force
```

4. `Solang`扩展适用于`VSCode`：如果你是`Visual Studio Code（VSCode）`的用户，建议安装[Solang扩展](https://marketplace.visualstudio.com/items?itemName=solang.solang)以辅助语法高亮显示。请记得禁用任何活动的`Solidity`扩展，以确保`Solang`扩展正常工作。


## 创建一个新项目

一旦你安装了`Solana CLI`和`Anchor`，你可以使用以下命令创建一个新项目：

```bash
anchor init project_name --solidity
```

该命令生成一个新项目，其中包含一个基本的`Solang on-chain`程序（相当于`EVM`上的智能合约）和一个测试文件，演示了如何从客户端与该程序进行交互。

## 链上程序概述

接下来，让我们来看一下从链上程序本身开始的初始代码。在你的项目的 `./solidity` 目录中，你将找到下面的合约，其中包括：

- 一个 `constructor` 用于初始化状态变量的函数
- 一个用于将消息打印到程序日志的函数
- 一个用于更新状态变量的函数
- 一个函数，用于返回状态变量的当前值

```solidity
@program_id("F1ipperKF9EfD821ZbbYjS319LXYiBmjhzkkf5a26rC")
contract starter {
    bool private value = true;

    @payer(payer)
    constructor(address payer) {
        print("Hello, World!");
    }

    /// A message that can be called on instantiated contracts.
    /// This one flips the value of the stored `bool` from `true`
    /// to `false` and vice versa.
    function flip() public {
            value = !value;
    }

    /// Simply returns the current value of our `bool`.
    function get() public view returns (bool) {
            return value;
    }
}
```


### 重要的差异

与`EVM`智能合约相比，你可能会注意到两个重要的区别：

1. `@program_id` 注解：
在Solana上，智能合约被称为“程序”。使用 `@program_id` 注释来指定程序的链上地址。

```solidity
@program_id("F1ipperKF9EfD821ZbbYjS319LXYiBmjhzkkf5a26rC") // on-chain program address
```

2. `@payer` 注解：

在链上存储数据时，需要分配一定数量的`SOL`来支付存储成本。注释 `@payer` 指定了将支付所需`SOL`以创建用于存储状态变量的账户的用户。


```solidity
@payer(payer) // payer for the "data account"
constructor(address payer) {
    print("Hello, World!");
}
```


### 状态数据的存储

`EVM`智能合约和`Solana`程序之间的一个重要区别在于它们如何存储“状态”变量/数据：

- `EVM`智能合约可以直接存储状态变量。
- `Solana`的链上程序则会创建单独的账户来存储状态数据。这些账户通常被称为“数据账户”，并且是由程序“拥有”。

在这个例子中，当合约部署时，它被部署到 `@program_id` 中指定的地址。当程序部署后调用 `constructor` 时，会创建一个独立的帐户，用于存储状态变量，而不是存储在合约本身内部。

这可能听起来有点不同于你所习惯的，但别担心！让我们来看一下测试文件，以更好地理解这个概念。


## 测试文件概述

起始测试文件可以在 `./tests` 目录中找到。该文件提供了一个与客户端交互的示例。

`Anchor`设置了 `provider` 和 `program` ，以帮助我们从客户端连接到合约。这是通过使用`IDL`文件来完成的，该文件描述了程序的公共接口，类似于EVM智能合约中使用的ABI文件。如果你运行 `anchor build` ，则会生成`IDL`文件，并且可以在 `./target/idl` 找到。

```ts
import * as anchor from "@coral-xyz/anchor"
import { Program } from "@coral-xyz/anchor"
import { Starter } from "../target/types/starter"

describe("starter", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)

  const dataAccount = anchor.web3.Keypair.generate()
  const wallet = provider.wallet

  const program = anchor.workspace.Starter as Program<Starter>

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods
      .new(wallet.publicKey)
      .accounts({ dataAccount: dataAccount.publicKey })
      .signers([dataAccount])
      .rpc()
    console.log("Your transaction signature", tx)

    const val1 = await program.methods
      .get()
      .accounts({ dataAccount: dataAccount.publicKey })
      .view()

    console.log("state", val1)

    await program.methods
      .flip()
      .accounts({ dataAccount: dataAccount.publicKey })
      .rpc()

    const val2 = await program.methods
      .get()
      .accounts({ dataAccount: dataAccount.publicKey })
      .view()

    console.log("state", val2)
  })
})
```

在测试文件中，我们首先生成一个新的密钥对，用于创建存储合约状态的“数据账户”。


```ts
const dataAccount = anchor.web3.Keypair.generate();
```

接下来，我们使用 `new` 指令来创建一个新的数据账户。这个指令对应于合约的 `constructor` 。新创建的数据账户将被初始化，用于存储合约中定义的状态变量。


在这里， `payer` 被指定为 `wallet.publicKey` ，并提供了我们计划创建的 `dataAccount` 的地址。生成的 `dataAccount` `Keypair`作为交易的附加签名者包含在其中，因为它被用于创建一个新的账户。基本上，这个操作验证了我们持有与我们正在创建的新账户地址相对应的私钥。

```ts
// Client
const tx = await program.methods
  .new(wallet.publicKey)
  .accounts({ dataAccount: dataAccount.publicKey })
  .signers([dataAccount])
  .rpc()

// on-chain program
@payer(payer)
constructor(address payer) {
    print("Hello, World!");
}
```

合约的 `get` 函数被调用以获取存储在指定 `dataAccount` 中的值。

```ts
// Client
const val1 = await program.methods
  .get()
  .accounts({ dataAccount: dataAccount.publicKey })
  .view()

// on-chain program
function get() public view returns (bool) {
        return value;
}
```

接下来，合约的 `flip` 函数被用来修改指定 `dataAccount` 的状态。


```ts
// Client
await program.methods
  .flip()
  .accounts({ dataAccount: dataAccount.publicKey })
  .rpc()

// on-chain program
function flip() public {
        value = !value;
}
```
要运行测试，请在终端中使用 `anchor test` 命令。

`anchor test` 命令执行以下任务：

- 启动本地`Solana`验证节点
- 构建并部署你的链上程序到本地验证节点
- 运行测试文件


接下来应该在控制台中显示以下输出：

```bash
Your transaction signature 2x7jh3yka9LU6ZeJLUZNNDJSzq6vdUAXk3mUKuP1MYwr6ArYMHDGw6i15jJnMtnC7BP7zKactStHhTekjq2vh6hP
state true
state false
    ✔ Is initialized! (782ms)
```


你可以在 `./.anchor/program-logs` 中查看程序日志，那里会找到“`Hello, World!`”的消息

```bash
Program F1ipperKF9EfD821ZbbYjS319LXYiBmjhzkkf5a26rC invoke [1]
Program 11111111111111111111111111111111 invoke [2]
Program 11111111111111111111111111111111 success
Program log: Hello, World!
```

恭喜！你成功地使用 `Solang` 构建了你的第一个 `Solana` 程序！虽然与标准 `Solidity` 智能合约相比可能存在一些差异，但 `Solang` 提供了一个极好的桥梁，帮助你利用现有的 `Solidity` 技能和经验来构建 `Solana` 上的应用。

## 下一步

有兴趣深入了解吗？请查看 [solana-developers/program-examples 存储库](https://github.com/solana-developers/program-examples)。你将在 `basics` 和 `tokens` 部分找到适用于常见`Solana`用例的`Solang`实现。

如果你有问题，请随时在[`Solana Stack exchange`](https://solana.stackexchange.com/)上发布。如果你有关于`Solang`维护者的问题，可以直接在[`Hyperledger Foundation`](https://discord.com/invite/hyperledger)的`discord`上联系他们。

玩得开心，尽情建造吧！
