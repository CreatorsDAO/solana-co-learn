---
sidebar_position: 66
sidebar_label: 👀 本地设置
sidebar_class_name: green
---

# 👀 本地设置

是时候进入专业领域了。Solana游乐场是一个令人惊叹的工具，可以帮助你入门并部署到开发网络。然而，它还不适合本地开发，而这正是专业人士的做法。

本地设置需要几个步骤，但它更加强大 - 你基本上将在你的设备上运行一个本地版本的Solana网络。这带来了许多好处，包括几乎无限的SOL。

这个设置有两个主要部分 -

- Rust编译器
- Solana命令行界面


**Windows用户**

虽然Solana CLI可以在Windows上运行，但在Linux上运行会有更好的体验 - 您不会遇到Windows特定的问题，并且可以使用与MacOS/Linux用户相同的命令。

你在这里想要做的是安装Windows子系统用于Linux。在[这里](https://learn.microsoft.com/en-us/windows/wsl/install?utm_source=buildspace.so&utm_medium=buildspace_project)查看相关文档，它们非常有帮助。

从现在开始，每次我要求你运行Solana命令时，你应该在WSL2中运行它。我强烈推荐安装[Windows终端](https://apps.microsoft.com/store/detail/windows-terminal/9N0DX20HK701?hl=en-nz&gl=nz&utm_source=buildspace.so&utm_medium=buildspace_project)应用程序，它具有漂亮的用户界面，并且可以轻松切换到WSL2。


![](./img/wsl.png)

你要在WSL2中安装Solana CLI和Rust编译器。这是一个与你的Windows安装分开的环境，所以如果你试图在错误的位置运行命令，会出现错误！！！

## 🦀 安装 Rust 编译器

最好的方法是按照官方指南进行操作。在[这里](https://www.rust-lang.org/tools/install?utm_source=buildspace.so&utm_medium=buildspace_project)查看它们。


## 🏄‍♂️ 安装 Solana 命令行界面 (CLI)

我还记得以前启动Solana CLI需要几个小时的时间。如今只需要几个命令！


您可以在[这里](https://docs.solana.com/cli/install-solana-cli-tools?utm_source=buildspace.so&utm_medium=buildspace_project)找到适用于您特定操作系统的版本。


**Windows用户应该按照Linux安装说明进行操作！**

安装完成后，您应该得到一个版本的打印输出，而不是运行时出现错误

```bash
solana --version
```

如果你确定已经安装了所有的东西，但仍然出现错误，请关闭所有的终端窗口，然后在一个新的窗口中再次尝试。


##  ⚙ Solana配置

Solana CLI有一些可以配置的选项，比如你想连接的网络和你的密钥对所在的位置。你可以使用以下命令获取当前配置的报告：

```bash
solana config get
```

这是我看到的：


```bash
Config File: /home/endgame/.config/solana/cli/config.yml
RPC URL: http://localhost:8899
WebSocket URL: ws://localhost:8900/ (computed)
Keypair Path: /home/endgame/.config/solana/id.json
Commitment: confirmed
```

有趣！以下是每个词的意思：

- Config File - Solana CLI 文件位于您的计算机上
- RPC URL - 您正在使用的终端点，将您连接到本地主机、开发网络或主网络
- WebSocket URL - 监听来自目标集群的事件的 WebSocket（在设置 RPC URL 时计算）
- Keypair Path - 运行Solana CLI子命令时使用的密钥对路径
- 提供了网络确认的度量，并描述了一个区块在特定时间点上的最终性程度

您可以使用 config set --url 命令来更改 RPC URL ：


```bash
solana config set --url localhost

solana config set --url devnet

solana config set --url mainnet-beta
```

我们开发人员在生活中需要按键较少，因此可以将它们缩短为：

```bash
solana config set --u l

solana config set --u d

solana config set --u m
```

哇，节省了这么多时间，走起来吧！

**密钥对**


你经常需要使用不同的密钥对来测试交互，所以命令行界面（CLI）提供了一种简单的方式来管理你的密钥对。它将它们存储在你的文件夹中的JSON文件中。以下是你需要了解的所有与密钥对相关的命令

**生成一个新的密钥对**

```bash
solana-keygen new --outfile ~/<FILE_PATH>
```

**设置默认密钥对**

```bash
solana config set --keypair ~/<FILE_PATH>
```
获取当前默认密钥对的 publickey
