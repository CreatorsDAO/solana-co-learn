---
sidebar_position: 9
sidebar_label: Anchor 合约框架实现 - hello, World 🌍 With PDA
sidebar_class_name: green
tags:
  - anchor-program-hello
  - solana
  - program
---

# Anchor 合约框架实现 - hello, World 🌍 With PDA

让我们通过构建和部署 `Hello World!` 程序来进行练习。

我们将在本地完成所有操作，包括部署到本地测试验证器。在开始之前，请确保你已经安装了`Rust`和`Solana CLI`。如果你还没有安装，请参考概述中的说明进行设置。

## 0. Anchor 安装

这里是`Anchor`的[安装官方指南](https://www.anchor-lang.com/docs/installation).

需要你按照步骤安装好 `Anchor`。

安装完成后我们可以通过执行下面的命令,检测 `Anchor` 是否安装完成✅。

```bash
anchor --version
```

```
anchor --version
anchor-cli 0.28.0
```

## 1. 创建一个新的Rust项目

让我们从创建一个新的`Rust`项目开始。运行下面的`anchor init <you-project-name>`命令。随意用你自己的目录名替换它。

```bash
anchor init hello_world
```

## 2. 编写你的程序

接下来，使用下面的`Hello World!`程序更新`hello_world/program/src/lib.rs`。当程序被调用时，该程序会将传入的数据保存到数据存储账户中去也就是下面的`HelloWorld`账户。

```rust
use anchor_lang::prelude::*;

declare_id!("22sSSi7GtQgwXFcjJmGNNKSCLEsiJxyYLFfP3CMWeMLj");

#[program]
pub mod hello_world {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, data: String) -> Result<()> {

        msg!("{}", data);

        *ctx.accounts.hello_world = HelloWorld {
            authority: *ctx.accounts.authority.key,
            data,
        };

        Ok(())
    }

    pub fn update(ctx: Context<UpdateHelloWorld>, data: String) -> Result<()> {
        ctx.accounts.hello_world.data = data;
        msg!("{}", ctx.accounts.hello_world.data);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + HelloWorld::INIT_SPACE,
        seeds = [b"hello-world"],
        bump
    )]
    pub hello_world: Account<'info, HelloWorld>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateHelloWorld<'info> {
    #[account(
            mut,
            seeds = [b"hello-world"],
            bump
    )]
    pub hello_world: Account<'info, HelloWorld>,
    #[account(mut)]
    pub authority: Signer<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct HelloWorld {
    pub authority: Pubkey,
    #[max_len(100)]
    pub data: String,
}

#[error_code]
pub enum ErrorCode {
    #[msg("You are not authorized to perform this action.")]
    Unauthorized,
    #[msg("Cannot get the bump.")]
    CannotGetBump,
}
```

下面这是一个本地的测试脚本文件，用来调用上面的合约程序。


```ts
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { HelloWorld } from "../target/types/hello_world";

describe("hello-world", () => {
  let provider = anchor.AnchorProvider.env();
  // Configure the client to use the local cluster.
  anchor.setProvider(provider);

  const program = anchor.workspace.HelloWorld as Program<HelloWorld>;

  const authority = provider.wallet.publicKey;

  let [helloWorld] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("hello-world")],
    program.programId
  );

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize("Hello World!").accounts({
      helloWorld,
      authority,
      systemProgram: anchor.web3.SystemProgram.programId,
    }).rpc();

    console.log("tx signature: ", tx);

    // Fetch the state struct from the network.
    const accountState = await program.account.helloWorld.fetch(helloWorld);
    console.log("account state: ", accountState);

  });

  it("get hello world!", async () => {

    // Add your test here.
    const tx = await program.methods.update("Davirain").accounts({
      helloWorld,
    }).rpc();

    console.log("tx signature: ", tx);


    // Fetch the state struct from the network.
    const accountState = await program.account.helloWorld.fetch(helloWorld);
    console.log("account state: ", accountState);
  });


  it("read account name", async () => {

    // Fetch the state struct from the network.
    const accountState = await program.account.helloWorld.fetch(helloWorld);
    console.log("account state: ", accountState);
  });
});
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

我们现在准备好构建和部署我们的程序了。通过运行 `anchor build` 命令来构建程序。

```bash
anchor build
```

现在让我们部署我们的程序。

```bash
anchor deploy
```

Solana程序部署将输出你的程序的程序`ID`。你现在可以在[Solana Explorer](https://explorer.solana.com/?cluster=custom)上查找已部署的程序（对于`localhost`，请选择“自定义`RPC URL`”作为集群）。


## 5. 查看程序日志

在我们调用程序之前，打开一个单独的终端并运行`solana logs`命令。这将允许我们在终端中查看程序日志。

```bash
solana logs <PROGRAM_ID>
```

或者也可以通过[Solana Exporer](https://explorer.solana.com/?cluster=custom)，查看产生的日志📔。

在测试验证器仍在运行时，尝试使用[此处](https://github.com/all-in-one-solana/hello-world-with-pda/tree/main/app)的客户端脚本调用你的程序。

这将返回一个[Solana Explorer](https://explorer.solana.com)的URL(`Transaction https://explorer.solana.com/tx/${transactionSignature}?cluster=custom`)。将URL复制到浏览器中，在`Solana Explorer`上查找该交易，并检查程序日志中是否打印了`Hello, world!`。或者，你可以在运行`solana logs`命令的终端中查看程序日志。

就是这样！你刚刚在本地开发环境中创建并部署了你的第一个程序。
