---
sidebar_position: 8
sidebar_label: 原始Solana合约实现 <hello, World>
sidebar_class_name: green
---

# 原始Solana合约实现 <hello, World>

让我们通过构建和部署 `Hello World!` 程序来进行练习。

我们将在本地完成所有操作，包括部署到本地测试验证器。在开始之前，请确保您已经安装了Rust和Solana CLI。如果您还没有安装，请参考概述中的说明进行设置。

## 1. 创建一个新的Rust项目

让我们从创建一个新的Rust项目开始。运行下面的`cargo new --lib`命令。随意用你自己的目录名替换它。

```bash
cargo new --lib solana-hello-world-local
```

记得更新 `Cargo.toml` 文件，将 `solana-program` 添加为依赖项，并检查 `crate-type` 是否已经存在。

```toml
[package]
name = "solana-hello-world-local"
version = "0.1.0"
edition = "2021"

[dependencies]
solana-program = "~1.8.14"

[lib]
crate-type = ["cdylib", "lib"]
```

## 2. 编写你的程序

接下来，使用下面的`Hello World!` 程序更新`lib.rs`。当程序被调用时，该程序会简单地将`Hello, world!` 打印到程序日志中。

```rust
use solana_program::{
    account_info::AccountInfo,
    entrypoint,
    entrypoint::ProgramResult,
    pubkey::Pubkey,
    msg
};

entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8]
) -> ProgramResult{
    msg!("Hello, world!");

    Ok(())
}
```

## 3. 运行本地测试验证器

在编写好你的程序之后，让我们确保我们的Solana CLI配置指向本地主机，使用`solana config set --url`命令。

```bash
solana config set --url localhost
```

接下来，使用`solana config get`命令检查Solana CLI配置是否已更新。

```bash
solana config get
```

最后，运行本地测试验证器。在一个单独的终端窗口中运行`solana-test-validator`命令。只有当我们的`RPC URL`设置为`localhost`时才需要这样做。

```bash
solana-test-validator
```

## 4. 构建和部署

我们现在准备好构建和部署我们的程序了。通过运行 `cargo build-sbf` 命令来构建程序。

```bash
cargo build-sbf
```

现在让我们部署我们的程序。运行从`cargo build-sbf`命令输出的`solana program deploy`命令。

```bash
solana program deploy <PATH>
```

solana程序部署将输出您的程序的程序ID。您现在可以在[Solana Explorer](https://explorer.solana.com/?cluster=custom)上查找已部署的程序（对于本地主机，请选择“自定义RPC URL”作为集群）。


## 5. 查看程序日志

在我们调用程序之前，打开一个单独的终端并运行`solana logs`命令。这将允许我们在终端中查看程序日志。

```bash
solana logs <PROGRAM_ID>
```

在测试验证器仍在运行时，尝试使用[此处](https://github.com/Unboxed-Software/solana-hello-world-client)的客户端脚本调用您的程序。

在`index.ts`中用刚刚部署的`PROGRAM ID`替换掉原来的`PROGRAM ID`，然后运行`npm install`，接着运行`npm start`。这将返回一个Solana Explorer的`URL`。将URL复制到浏览器中，在Solana Explorer上查找该交易，并检查程序日志中是否打印了`Hello, world!`。或者，您可以在运行`solana logs`命令的终端中查看程序日志。

就是这样！您刚刚在本地开发环境中创建并部署了您的第一个程序。
