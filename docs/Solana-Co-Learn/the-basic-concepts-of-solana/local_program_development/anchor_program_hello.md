---
sidebar_position: 8
sidebar_label: Anchor 合约框架实现《hello, World》
sidebar_class_name: green
---

# Anchor 合约框架实现《hello, World》

让我们通过构建和部署“Hello World！”程序来进行练习。

我们将在本地完成所有操作，包括部署到本地测试验证器。在开始之前，请确保您已经安装了Rust和Solana CLI。如果您还没有安装，请参考概述中的说明进行设置。

## Anchor 安装

这里是anchor的[安装官方指南](https://www.anchor-lang.com/docs/installation).

需要你按照步骤安装好anchor。

安装完成后我们可以通过执行下面的命令,检测anchor是否安装完成✅。

```bash
anchor --version
```

```
anchor --version
anchor-cli 0.28.0
```

## 1. 创建一个新的Rust项目

让我们从创建一个新的Rust项目开始。运行下面的`anchor init <you-project-name>`命令。随意用你自己的目录名替换它。

```bash
anchor init hello_world
```

#### 2. 编写你的程序

接下来，使用下面的“Hello World！”程序更新hello_world/program/src/lib.rs。当程序被调用时，该程序会简单地将“Hello, world！”打印到程序日志中。

```rust
use anchor_lang::prelude::*;

declare_id!("Eo7uunKkgdRe8JtgmDimLkUEuT1oYbua4zWRCysWpv45");

#[program]
pub mod hello_world {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Hello,World!");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
```

#### 3. 运行本地测试验证器

在编写好你的程序之后，让我们确保我们的Solana CLI配置指向本地主机，使用`solana config set --url`命令。

```bash
solana config set --url localhost
```

接下来，使用`solana config get`命令检查Solana CLI配置是否已更新。

```bash
solana config get
```

最后，运行本地测试验证器。在一个单独的终端窗口中运行`solana-test-validator`命令。只有当我们的RPC URL设置为localhost时才需要这样做。

```bash
solana-test-validator
```

#### 4. 构建和部署

我们现在准备好构建和部署我们的程序了。通过运行 `anchor build` 命令来构建程序。

```bash
anchor build
```

现在让我们部署我们的程序。

```bash
anchor deploy
```

solana程序部署将输出您的程序的程序ID。您现在可以在[Solana Explorer](https://explorer.solana.com/?cluster=custom)上查找已部署的程序（对于本地主机，请选择“自定义RPC URL”作为集群）。


#### 5. 查看程序日志

在我们调用程序之前，打开一个单独的终端并运行`solana logs`命令。这将允许我们在终端中查看程序日志。

```bash
solana logs <PROGRAM_ID>
```

或者也可以通过(Solana Exporer)[https://explorer.solana.com/?cluster=custom]，查看产生的日志📔。

在测试验证器仍在运行时，尝试使用[此处](https://github.com/DaviRain-Su/all-in-one-solana/tree/main/code/contract/hello_world/app/hello-frontend)的客户端脚本调用您的程序。

这将返回一个Solana Explorer的URL(Transaction https://explorer.solana.com/tx/${transactionSignature}?cluster=custom)。将URL复制到浏览器中，在Solana Explorer上查找该交易，并检查程序日志中是否打印了“Hello, world!”。或者，您可以在运行`solana logs`命令的终端中查看程序日志。

就是这样！您刚刚在本地开发环境中创建并部署了您的第一个程序。
