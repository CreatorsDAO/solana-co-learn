---
sidebar_position: 81
sidebar_label: 🛳 设置Anchor
sidebar_class_name: green
---

# 🛳 设置 Anchor


你已经像一位先驱者一样原生地构建了 `Solana` 程序。当然，你可以继续原生地构建，但有了框架的帮助，事情将变得更加轻松迅捷。

试想一下前端开发中的 `React` —— 你只需用很少的代码就能做很多事情。`Anchor` 也与之类似，它将程序划分为不同的部分，使指令逻辑与账户验证和安全检查分开。就像 `React` 处理状态更新一样，`Anchor` 能够处理许多基本任务，如账户解析、验证、序列化/反序列化等，让你能够更快速地构建程序。

通过使用宏捆绑各种样板代码，`Anchor` 让你能够专注于程序的核心业务逻辑。此外，`Anchor` 还设计了许多常见的安全检查功能，并允许你轻松定义额外的检查，从而帮助你构建更加安全的程序。

:::info
简单来说，`Anchor` 可以通过减少你按键的次数，让你快速前进！
:::

## 🗂 Anchor 应用程序结构

以下是具体的操作步骤。

首先，确保你已经安装了 `Rust` 和 `Solana CLI`（除非你跳过了某些部分）。此外，你还需要[安装 `Yarn`](https://yarnpkg.com/getting-started/install)。

完成这些后，只需根据官方的 [`Anchor` 文档](https://www.anchor-lang.com/docs/installation) 进行设置。一切顺利的话，运行 `anchor --version` 时，你会看到一个版本号被打印出来。

下面是我执行后得到的 `Anchor` 的具体版本信息：

```bash
anchor --version
anchor-cli 0.28.0
```

现在我们用 `Anchor` 来设置一个空白的 `Solana` 程序：

```bash
anchor init <new-workspace-name>
```

这将建立以下结构：

- `Anchor.toml` ：`Anchor` 配置文件。
- `Cargo.toml` ：`Rust` 工作区配置文件。
- `package.json` ：`JavaScript` 依赖文件。
- `programs/` ：`Solana` 程序包的目录。
- `app/`：你的应用前端所在地。
- `tests/` ：`TypeScript` 集成测试的位置。
- `migrations/deploy.js`：用于部署迁移到不同版本的程序的脚本。
- `.anchor` 文件夹：包含最新程序日志和本地测试账本。

你现在基本上可以忽略这些文件。打开 `programs/<new-workspace-name>/src/lib.rs`，你会发现它与我们的原生程序有所不同。`Anchor` 将定义入口点，我们将使用 `Rust` 属性告诉 `Anchor` 我们所有的需求，这样它就能自动化大部分工作。

当我们使用 `#[program]` 时，我们实际上是在声明一个 `Rust `宏。`Anchor` 将使用它为我们生成所有必要的本地 `Solana` 样板代码。

`Anchor CLI` 的美妙之处还在于它集成了 `TypeScript` 测试。只需编写测试，然后使用 `Anchor` 命令就可以了！

构建/部署的设置与本地程序相同，只不过使用的命令有所不同。以下是我们的构建方式：

```bash
anchor build
```

这将花费几秒钟时间，在工作区中构建适用于 `Solana` 的 `BPF` 运行时程序，并在 `target/idl` 目录中生成“`IDLs`”。运行 `cargo build-sbf` 时，你还应该在终端中看到类似的输出，其中包含一个部署命令。

这里有一些关于目标文件夹你需要了解的信息：

- `target/deploy` ：存放部署程序的生成密钥对。
- `target/idl` ：程序的 `IDL` 文件，`.json` 格式。
- `target/types` ：`TypeScript` 的 `IDL` —— 所有我们需要的类型。

:::info
什么是 `IDL`？

[`IDL`（接口描述语言）](https://en.wikipedia.org/wiki/Interface_description_language)文件是一个 `JSON` 文件，用于描述程序的接口，它告诉你有哪些函数可用以及它们接受的参数。你可以将其看作程序的 `API` 文档。
:::

我们使用 `IDL` 程序来确定如何与客户端通信（可用的函数、参数等），并使用 `TypeScript` 的 `IDL` 来定义类型。这些是非常重要的，因为要让你的程序开源，你需要发布经过验证的构建版本和 `IDL` 到 `Anchor Programs Registry`。

现在，我们想要部署程序。但我们还不能立即开始！我们需要做两件事情 - 获取程序地址并设置网络。

### 声明程序ID

首先，在先前的 `lib.rs` 文件中，有一个宏 `declare_id!` ，其中包含一个默认值。现在得版本`anchor`,在你使用`anchor init`生成一个新的项目的时候`declare_id!`中的值是每次都不一样的，为你生成一个新的值。你也可以通过运行 `anchor keys list` 来查看你的`PROGRAM_ID`。

使用下面的命令来获取程序的地址：

```bash
anchor keys list
```

### 选择网络

我们需要解决的第二个问题是：程序默认会部署到本地主机网络。我们可以启动一个本地验证器，或者切换到开发网络。

作为一个专业人士，我计划直接推送到开发网络，因此我将打开 `Anchor.toml` 文件，并将 `cluster` 改为 `devnet`。只要我拥有足够的开发网络的 `SOL`，我就可以直接部署。

```bash
anchor deploy
```

太好了！希望你能在终端上看到带有 `Program Id` 的“部署成功”的消息。

现在，将你的集群更改为 `localnet`，这样我们就可以进行测试了。在测试过程中，`Anchor` 会自动设置一个本地验证器！机器人真是太棒了 🤖。

测试过程相当简单：

```bash
anchor test
```

这将在配置的集群上运行一组集成测试套件，在运行之前部署工作区所有程序的新版本。

就这样！你刚刚成功构建、部署，并测试了你的第一个 `Anchor` 程序 :D。

下一步，我们将编写一个定制的 `Anchor` 程序，以此来体验它的真正威力！
