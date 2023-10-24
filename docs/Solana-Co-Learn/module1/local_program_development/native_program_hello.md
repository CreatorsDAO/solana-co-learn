---
sidebar_position: 8
sidebar_label: Native Solana合约实现 - hello, World
sidebar_class_name: green
tags:
  - native-program-hello
  - solana
  - program
---

# Native Solana合约实现 - hello, World

让我们通过构建和部署 `Hello World!` 程序来进行练习。

我们将在本地完成所有操作，包括部署到本地测试验证器。在开始之前，请确保你已经安装了`Rust`和`Solana CLI`。如果你还没有安装，请参考概述中的说明进行设置。

## 1. 创建一个新的Rust项目

让我们从创建一个新的`Rust`项目开始。运行下面的`cargo new --lib`命令。随意用你自己的目录名替换它。

```bash
cargo new --lib solana-hello-world-local
```

记得更新 `Cargo.toml` 文件，将 `solana-program` 添加为依赖项，并检查 `crate-type` 是否已经存在。

这里的`solana-program` 可以通过在命令行执行`cargo add solana-program`添加到依赖管理的配置文件中。

```toml
[package]
name = "solana-hello-world-local"
version = "0.1.0"
edition = "2021"

[dependencies]
solana-program = "1.16.10"

[lib]
crate-type = ["cdylib", "lib"]
```

:::caution
需要注意这里的`solana-program`的版本，不要直接`copy`这个`Cargo.toml`的配置，因为`solana-program`的版本也是在更新的，可能以后直接使用这里的会出问题。建议使用`cargo add solana-program`添加。
:::

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

在编写好你的程序之后，让我们确保我们的`Solana CLI`配置指向本地主机，使用`solana config set --url`命令。

```bash
solana config set --url localhost
```

接下来，使用`solana config get`命令检查`Solana CLI`配置是否已更新。

```bash
solana config get
```

最后，运行本地测试验证器。在一个单独的终端窗口中运行`solana-test-validator`命令。只有当我们的`RPC URL`设置为`localhost`时才需要这样做。

```bash
solana-test-validator
```

:::caution
这里一定要注意⚠️，`solana-test-validator` 这个命令启动的是solana的本地测试验证器。
:::

## 4. 构建和部署

我们现在准备好构建和部署我们的程序了。通过运行 `cargo build-sbf` 命令来构建程序。

```bash
cargo build-sbf
```

现在让我们部署我们的程序。部署从`cargo build-sbf`命令的输出`target/deploy/*.so`文件。

```bash
ls --tree target/ --depth 2
 target
├──  .rustc_info.json
├──  CACHEDIR.TAG
├──  debug
│   ├──  .cargo-lock
│   ├──  .fingerprint
│   ├──  build
│   ├──  deps
│   ├──  examples
│   └──  incremental
├──  deploy
│   ├──  solana_hello_world_local-keypair.json
│   └──  solana_hello_world_local.so
├──  release
│   ├──  .cargo-lock
│   ├──  .fingerprint
│   ├──  build
│   ├──  deps
│   ├──  examples
│   └──  incremental
└──  sbf-solana-solana
    ├──  CACHEDIR.TAG
    └──  release
```

这里的`Path` 是上面的`target/deploy/*.so`文件的路径。运行`solana program deploy`命令来部署你的程序。

```bash
solana program deploy <PATH>
```

`Solana`程序部署将输出你的程序的程序`ID`。你现在可以在[Solana Explorer](https://explorer.solana.com/?cluster=custom)上查找已部署的程序（对于`Localhost`，请选择“自定义`RPC URL`”作为集群）。


## 5. 查看程序日志

在我们调用程序之前，打开一个单独的终端并运行`solana logs`命令。这将允许我们在终端中查看程序日志。

```bash
solana logs <PROGRAM_ID>
```

在测试验证器仍在运行时，尝试使用[此处](https://github.com/all-in-one-solana/native-hello/tree/main/hello-frontend)的客户端脚本调用你的程序。

在`index.ts`中用刚刚部署的`PROGRAM ID`替换掉原来的`PROGRAM ID`，然后运行`npm install`，接着运行`npm start`。这将返回一个`Solana Explorer`的`URL`。将URL复制到浏览器中，在`Solana Explorer`上查找该交易，并检查程序日志中是否打印了`Hello, world!`。或者，你可以在运行`solana logs`命令的终端中查看程序日志。

就是这样！你刚刚在本地开发环境中创建并部署了你的第一个程序。
