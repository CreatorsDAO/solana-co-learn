---
sidebar_position: 81
sidebar_label: 🛳 设置Anchor
sidebar_class_name: green
---

# 🛳 设置 Anchor

你好，朋友。欢迎你。你已经来到了应许之地。

你已经像先驱者一样原生地构建了Solana程序。虽然你可以继续原生地构建，但使用一个框架会让事情变得更加简单和快速。

想想在前端开发中，`React`所处理的所有事情 - 你只需写很少的代码就能做更多的事情。`Anchor`也是类似的 - 它将程序组织成不同的部分，将指令逻辑与账户验证和安全检查分离开来。就像`React`处理状态更新一样，`Anchor`处理很多基本的事情，比如账户解析和验证、序列化/反序列化，让你能更快地构建！

通过将各种样板代码捆绑成宏，它能够实现这一点，让你专注于程序的业务逻辑。此外，`Anchor`还设计了处理许多常见安全检查的功能，同时允许你轻松定义额外的检查，以帮助你构建更安全的程序。

简而言之 - `Anchor`可以通过减少按键次数来让你快速前进！

## 🗂 Anchor 应用程序结构

以下是具体步骤。

我希望你已经安装了Rust和Solana CLI（除非你跳过了某些部分哈哈）。你还需要[安装`Yarn`](https://yarnpkg.com/getting-started/install)。

完成后，只需转到官方的[`Anchor`文档](https://www.anchor-lang.com/docs/installation)并进行设置。如果一切顺利，当您运行 `anchor --version` 时，您应该会看到一个版本被打印出来。

```bash
anchor --version
anchor-cli 0.28.0
```

好的！让我们使用`Anchor`来设置一个空白的`Solana`程序：

```bash
anchor init <new-workspace-name>
```

这将建立以下结构：

- `Anchor.toml` ：`Anchor`配置文件。
- `Cargo.toml` ：Rust工作区配置文件。
- `package.json` ：JavaScript 依赖文件。
- `programs/` ：Solana程序包的目录。
- `app/`: 你的应用前端在这里。
- `tests/` ：这里是您的TypeScript集成测试。
- `migrations/deploy.js`: 部署脚本以迁移到不同版本的程序。
- `.anchor` 文件夹：其中包含最新的程序日志和用于测试的本地账本

你现在可以基本上忽略这些。打开 `programs/workspace-name/src/lib.rs` 。这看起来与我们的`native`程序略有不同。`Anchor`将为我们定义入口点，并且我们将使用Rust属性告诉`Anchor`我们的所有内容，以便它可以自动化我们的大部分工作。

当我们使用 `#[program]` 时，实际上是声明了一个Rust宏，`Anchor`将使用它为我们生成所有必要的本地Solana样板代码。

`Anchor CLI`的美妙之处在于它还集成了TypeScript测试。只需编写测试并使用`Anchor`命令即可！

构建/部署设置与本地程序相同，只是需要使用不同的命令。以下是我们的构建方式：

```bash
anchor build
```

这将花费几秒钟，在工作区中构建针对Solana的`BPF`运行时的程序，并在 `target/idl` 目录中生成“`IDLs`”。您还应该在终端中运行 `cargo build-sbf` 时看到类似的输出，其中包含一个部署命令。

顺便说一下，这是关于目标文件夹的一些需要了解的信息 -

- `target/deploy` ：用于部署程序的生成密钥对
- `target/idl` ：程序的`IDL`文件，`.json`格式
- `target/types` ：`Typescript` 的 `IDL` - 我们需要的所有类型

什么是`IDL`？[`IDL`（接口描述语言）](https://en.wikipedia.org/wiki/Interface_description_language)文件是一个JSON文件，用于描述程序的接口 - 它告诉你有哪些函数可用以及它们接受的参数。可以将其视为程序的`API`文档。

我们使用`IDL`程序来确定如何与客户端进行通信（可用的函数、参数等），并使用TypeScript `IDL`来定义类型。这些非常重要，因为要使您的程序开源，您需要发布经过验证的构建版本和`IDL`到`Anchor Programs Registry`。

现在我们想要部署。但是我们还不能立即开始！我们需要做两件事情 - 获取程序地址并设置网络。

### declare id

首先，在之前的 `lib.rs` 文件中，有一个 `declare_id!` 宏，其中包含一个默认值，你会注意到每次启动新的`Anchor`程序时，它的值都是相同的。因此，通过运行 `anchor keys list` 来获取你实际`PROGRAM_ID`，然后将该值粘贴到--此`PROGRAM_ID`是在运行构建命令后生成的。它还需要粘贴到 `Anchor.toml` 文件中。

这里的流程有点奇怪 - 你编写一个程序，用 `anchor build` 构建它，用 `anchor keys list` 获取地址，将其替换在程序顶部的声明宏中 `Anchor.toml` ，然后部署。

运行此命令以获取程序的实际地址：

```bash
anchor keys list
```

### 网络

我们需要解决的第二个问题是：程序部署的默认网络是本地主机。我们可以启动一个本地验证器，或者切换到开发网络。

我是一个专业的人，打算直接推向开发网络，所以我要打开 `Anchor.toml` 并将 cluster 更改为 `devnet` ，如果我有足够的`dev`网络的SOL，我可以直接部署。

```bash
anchor deploy
```

我们完成了！希望你在终端上能看到一个带有`Program Id`的“部署成功”消息。

现在将您的集群更改为`localnet`，这样我们就可以进行测试了。在测试期间，`Anchor`将自动设置一个本地验证器！我喜欢机器人 🤖

测试很简单：

```bash
anchor test
```

这将针对配置的集群运行一个集成测试套件，在运行之前部署所有工作区程序的新版本。

就是这样！你刚刚构建、部署并测试了你的第一个`Anchor`程序 :D

接下来，我们将编写一个自定义的`Anchor`程序来体验真正的力量！
