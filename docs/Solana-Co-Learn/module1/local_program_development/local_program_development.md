---
sidebar_position: 7
sidebar_label: 本地开发环境配置
sidebar_class_name: green
---

# Local Program Development

## 概述

本地开发的基本流程如下

1. 安装 [Rust](https://www.rust-lang.org/tools/install) 和 [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools)
2. 使用Solana CLI，您可以使用**solana-test-validator**命令运行本地测试验证器，初始化账户等基本操作
3. 使用 `cargo build-sbf` 和 `solana program deploy` 命令在本地构建和部署程序
4. 使用 `solana logs` 命令查看程序日志

## 本地环境配置

Solana 程序使用Rust 编写，调试运行。建议使用Unix 系列系统: Mac , Linux 等。
如果很不幸你使用的是Windows,建议使用 WSL 下载Ubuntu ,并在其中完成运行。

### 在Windows上设置（带有Linux）

#### 下载Windows子系统Linux（WSL）

如果你使用的是Windows电脑，建议使用Windows子系统Linux（WSL）来构建你的Solana程序。

打开**管理员**权限的PowerShell或Windows命令提示符，检查Windows版本

```bash
winver
```

如果您使用的是Windows 10版本2004及更高版本（Build 19041及更高版本）或Windows 11，请运行以下命令。

```bash
wsl --install
```

如果您正在使用较旧版本的Windows，请按照[这里](https://docs.microsoft.com/en-us/windows/wsl/install-manual)的说明进行操作。

您可以在[这里](https://learn.microsoft.com/en-us/windows/wsl/install)阅读更多关于安装WSL的信息。

#### 下载Ubuntu

接下来，在这里[下载Ubuntu](https://apps.microsoft.com/store/detail/ubuntu-2004/9N6SVWS3RX71?hl=en-us&gl=US)。Ubuntu提供了一个终端，可以让你在Windows电脑上运行Linux。这就是你将运行Solana CLI命令的地方。

#### 下载 Rust（适用于 WSL）

接下来，打开Ubuntu终端并使用以下命令下载适用于WSL的Rust。您可以在[此处](https://www.rust-lang.org/learn/get-started)阅读有关下载Rust的更多信息。

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

#### 下载 Solana CLI

现在我们准备下载适用于Linux的Solana CLI。请在Ubuntu终端中运行以下命令。您可以[在此处阅读](https://docs.solana.com/cli/install-solana-cli-tools)有关下载Solana CLI的更多信息。

```bash
sh -c "$(curl -sSfL https://release.solana.com/v1.16.6/install)"
```

### 在 macOS 上进行设置

#### 下载 Rust

首先，按照[这里](https://www.rust-lang.org/tools/install)的说明下载Rust

#### 下载Solana CLI

接下来，在终端中运行以下命令下载Solana CLI。

```bash
sh -c "$(curl -sSfL https://release.solana.com/v1.16.6/install)"
```

您可以在[这里](https://docs.solana.com/cli/install-solana-cli-tools)了解更多关于下载Solana CLI的信息。

## Solana CLI基础

Solana CLI是一个命令行界面工具，提供了一系列命令，用于与Solana集群进行交互。

在本课程中，我们将介绍一些最常见的命令，但您始终可以通过运行`solana --help`来查看所有可能的Solana CLI命令列表。

### Solana CLI 配置

Solana CLI存储了一些配置设置，这些设置会影响某些命令的行为。您可以使用以下命令查看当前的配置：

```bash
solana config get
```

`solana config get`命令将返回以下内容：
- 配置文件 - Solana CLI所在的文件位于您的计算机上
- RPC URL - 您正在使用的端点，将您连接到本地主机、开发网络或主网络
- WebSocket URL - 监听来自目标集群的事件的WebSocket（在设置RPC URL时计算）
- 密钥对路径 - 在运行Solana CLI子命令时使用的密钥对路径
- Commitment - 提供了网络确认的度量，并描述了一个区块在特定时间点上的最终性程度

您可以随时使用`solana config set`命令更改您的Solana CLI配置，然后跟上您想要更新的设置。

最常见的更改将是您要定位的集群。使用`solana config set --url`命令更改RPC URL。

```bash
# localhost
solana config set --url localhost

# devnet
solana config set --url devnet


# mainnet-beta
solana config set --url mainnet-beta
```

同样地，您可以使用`solana config set --keypair`命令来更改密钥对路径。当运行命令时，Solana CLI将使用指定路径下的密钥对。

```bash
solana config set --keypair ~/<FILE_PATH>
```

### 测试验证器

你会发现在测试和调试时运行本地验证器比部署到开发网络更有帮助。

您可以使用`solana-test-validator`命令运行本地测试验证器。该命令会创建一个持续运行的进程，需要单独的命令行窗口。

### Stream program logs

通常在打开一个新的控制台并在测试验证器旁边运行`solana logs`命令会很有帮助。这将创建另一个持续进行的进程，用于流式传输与您配置的集群相关的日志。

如果您的CLI配置指向本地主机，则日志将始终与您创建的测试验证器相关联，但您也可以从其他集群（如Devnet和Mainnet Beta）流式传输日志。当从其他集群流式传输日志时，您需要在命令中包含一个程序ID，以限制您所看到的日志仅针对您的特定程序。


### 密钥相关

您可以使用`solana-keygen new --outfile`命令生成一个新的密钥对，并指定文件路径以存储该密钥对。

```bash
solana-keygen new --outfile ~/<FILE_PATH>
```

有时候你可能需要检查你的配置指向哪个密钥对。要查看当前在`solana config`中设置的密钥对的公钥，请使用`solana address`命令。

```bash
solana address
```

要查看在solana配置中设置的当前密钥对的SOL余额，请使用`solana balance`命令。

```bash
solana balance
```

要在Devnet或本地主机上进行SOL的空投，请使用`solana airdrop`命令。请注意，在Devnet上，每次空投限制为2个SOL。

```bash
solana airdrop 2
```

在您开发和测试本地环境中的程序时，很可能会遇到由以下原因引起的错误：

- 使用错误的密钥对
- 没有足够的SOL来部署您的程序或执行交易
- 指向错误的集群

到目前为止，我们已经介绍了一些CLI命令，这些命令应该能帮助您快速解决那些问题。

## 在您的本地环境中开发Solana程序

### 创建一个新项目

要创建一个新的Rust包来编写Solana程序，您可以使用`cargo new --lib`命令，并指定您想要创建的新目录的名称。

```bash
cargo new --lib <PROJECT_DIRECTORY_NAME>
```

这个命令将在命令的末尾创建一个以您指定的名称命名的新目录。这个新目录将包含一个描述包的`Cargo.toml`清单文件。

清单文件包含元数据，如名称、版本和依赖项（包）。要编写Solana程序，您需要更新`Cargo.toml`文件，将`solana-program`作为依赖项包括进去。您可能还需要添加下面显示的`[lib]`和`crate-type`行。

```toml
[package]
name = "<PROJECT_DIRECTORY_NAME>"
version = "0.1.0"
edition = "2021"

[features]
no-entrypoint = []

[dependencies]
solana-program = "~1.8.14"

[lib]
crate-type = ["cdylib", "lib"]
```

在那个时候，你可以开始在src文件夹中编写你的程序。


### 构建和部署

当你准备构建你的Solana程序时，你可以使用`cargo build-sbf`命令。

```bash
cargo build-sbf
```

这个命令的输出将包含部署程序的指令，大致如下：

```bash
To deploy this program:
  $ solana program deploy /Users/James/Dev/Work/solana-hello-world-local/target/deploy/solana_hello_world_local.so
The program address will default to this keypair (override with --program-id):
  /Users/James/Dev/Work/solana-hello-world-local/target/deploy/solana_hello_world_local-keypair.json
```

当您准备部署程序时，请使用从`cargo build-sbf`命令输出的`solana program deploy`命令。这将把您的程序部署到CLI配置中指定的集群。

```bash
solana program deploy <PATH>
```

### 挑战

现在轮到你独立构建一些东西了。尝试创建一个新的程序，将你自己的消息打印到程序日志中。这次将你的程序部署到Devnet而不是本地主机。

记得使用`solana config set --url`命令将你的RPC URL更新为Devnet。

只要你将连接和Solana Explorer的URL更新为指向Devnet而不是localhost，你就可以使用与演示中相同的客户端脚本来调用该程序。

```ts
let connection = new web3.Connection(web3.clusterApiUrl("devnet"));
```

```ts
console.log(
    `Transaction: https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`
);
```

您还可以打开一个单独的命令行窗口，并使用`solana logs | grep " invoke" -A` 。在Devnet上使用`solana logs`时，您必须指定程序ID。否则，`solana logs`命令将返回来自Devnet的持续日志流。例如，您可以按照以下步骤监视对Token程序的调用，并显示每个调用的前5行日志：

```bash
solana logs | grep "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA invoke" -A 5
```

## 官方参考文档

- [安装Rust](https://www.rust-lang.org/tools/install)
- [安装Solana工具套件](https://docs.solana.com/cli/install-solana-cli-tools)