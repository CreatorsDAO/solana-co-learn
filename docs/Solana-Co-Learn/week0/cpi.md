---
sidebar_position: 6
sidebar_label: 跨程序调用（CPIs）
sidebar_class_name: green
---

# 跨程序调用（CPIs）

跨程序调用（CPI）是一个程序直接调用另一个程序的方式，允许Solana程序的可组合性。就像任何客户端都可以使用JSON RPC调用任何程序一样，任何程序都可以通过CPI调用任何其他程序。CPI实质上将整个Solana生态系统转变为一个巨大的API，作为开发者，您可以随意使用。

本节的目的是提供对CPI的高级概述。有关更详细的解释、示例和演示，请参考下面的链接资源。

## Summary

- 跨程序调用（CPI）是一个程序对另一个程序的调用，目标是调用的程序上的特定指令
- CPI允许调用程序将其签名者特权扩展到被调用程序
- 程序可以使用其指令中的 `invoke` 或 `invoke_signed` 来执行CPI
- 当所有必需的签名在调用之前都是可访问的，而无需PDA充当签署者时，使用 `invoke`
- 当需要来自调用程序的PDA作为CPI的签署者时，使用 `invoke_signed`
- 在将一个CPI发送给另一个程序后，被调用程序可以向其他程序发起进一步的CPI，最多可以达到4层深度


## 深入挖掘

跨程序调用（CPI）使得Solana程序的可组合性成为可能，开发者可以利用和构建现有程序的指令。

要执行CPIs，请使用在 solana_program 包中找到的[invoke](https://docs.rs/solana-program/latest/solana_program/program/fn.invoke.html)或[invoke_signed](https://docs.rs/solana-program/latest/solana_program/program/fn.invoke_signed.html)函数。

```rust
// Used when there are not signatures for PDAs needed
pub fn invoke(
    instruction: &Instruction,
    account_infos: &[AccountInfo<'_>]
) -> ProgramResult

// Used when a program must provide a 'signature' for a PDA, hence the signer_seeds parameter
pub fn invoke_signed(
    instruction: &Instruction,
    account_infos: &[AccountInfo<'_>],
    signers_seeds: &[&[&[u8]]]
) -> ProgramResult
```

要创建一个CPI，您必须指定并构建一个关于被调用程序的指令，并提供该指令所需的账户列表。如果需要PDA作为签署者，在使用 `invoke_signed` 时还必须提供 `signers_seeds` 。

## CPI与 `invoke`

`invoke` 函数用于创建不需要任何PDA作为签名者的CPI。在创建CPI时，Solana运行时将原始签名传递给被调用程序。

```rust
invoke(
    &some_instruction,                           // instruction to invoke
    &[account_one.clone(), account_two.clone()], // accounts required by instruction
)?;
```

## CPI与 `invoke_signed`

要创建一个需要PDA作为签名者的CPI，请使用 `invoke_signed`
函数，并提供必要的种子来派生调用程序所需的PDA。


```rust
invoke_signed(
    &some_instruction,                   // instruction to invoke
    &[account_one.clone(), pda.clone()], // accounts required by instruction, where one is a pda required as signer
    &[signers_seeds],                    // seeds to derive pda
)?;
```

虽然PDA本身没有私钥，但它仍然可以通过CPI充当指令的签名者。为了验证PDA是否属于调用程序，生成PDA所需的种子必须包含在 signers_seeds 中。

Solana运行时将使用提供的种子和调用程序的 create_program_address 内部调用。然后将生成的PDA与指令中提供的地址进行比较。如果匹配成功，则认为PDA是有效的签名者。


## CPI Instruction

根据您所调用的程序，可能会有一个可用的包含辅助函数的包，用于创建 Instruction 。许多个人和组织在其程序旁边创建公开可用的包，以简化调用其程序的过程，并提供这些类型的函数。

CPI所需的 Instruction 类型的定义包括：

- program_id - 执行指令的程序的公钥
- accounts - 在执行指令期间可能被读取或写入的所有账户列表
- data - 指令所需的指令数据

```rust
pub struct Instruction {
    pub program_id: Pubkey,
    pub accounts: Vec<AccountMeta>,
    pub data: Vec<u8>,
}
```

AccountMeta 结构体的定义如下：

```rust
pub struct AccountMeta {
    pub pubkey: Pubkey,
    pub is_signer: bool,
    pub is_writable: bool,
}
```


创建CPI时，请使用以下语法来指定每个账户的 AccountMeta ：

- AccountMeta::new - 表示可写
- AccountMeta::new_readonly - 表示不可写入
- (pubkey, true) - 表示账户是签署人
- (pubkey, false) - 表示账户不是签署人

```rust
use solana_program::instruction::AccountMeta;

let account_metas = vec![
    AccountMeta::new(account1_pubkey, true),
    AccountMeta::new(account2_pubkey, false),
    AccountMeta::new_readonly(account3_pubkey, false),
    AccountMeta::new_readonly(account4_pubkey, true),
]
```


## CPI AccountInfo

要使用 invoke 和 invoke_signed ，还需要一个 account_infos 的列表。与指令中的 AccountMeta 列表类似，您需要包含程序调用时将从中读取或写入的每个账户的 AccountInfo 。


参考一下， AccountInfo 结构体的定义如下：

```rust
/// Account information
#[derive(Clone)]
pub struct AccountInfo<'a> {
    /// Public key of the account
    pub key: &'a Pubkey,
    /// Was the transaction signed by this account's public key?
    pub is_signer: bool,
    /// Is the account writable?
    pub is_writable: bool,
    /// The lamports in the account.  Modifiable by programs.
    pub lamports: Rc<RefCell<&'a mut u64>>,
    /// The data held in this account.  Modifiable by programs.
    pub data: Rc<RefCell<&'a mut [u8]>>,
    /// Program that owns this account
    pub owner: &'a Pubkey,
    /// This account's data contains a loaded program (and is now read-only)
    pub executable: bool,
    /// The epoch at which this account will next owe rent
    pub rent_epoch: Epoch,
}
```

您可以使用[Clone trait](https://docs.rs/solana-program/latest/solana_program/account_info/struct.AccountInfo.html#impl-Clone-for-AccountInfo%3C'a%3E)为每个所需的账户创建 [AccountInfo](https://docs.rs/solana-program/latest/solana_program/account_info/struct.AccountInfo.html)的副本，该特性在 solana_program 包中的AccountInfo结构体中实现。


```rust
let accounts_infos = [
    account_one.clone(),
    account_two.clone(),
    account_three.clone(),
];
```

虽然本节提供了CPI的高级概述，但更详细的解释、示例和演示可以在下面的链接资源中找到。


## 其他资源

- [Official Documentation](https://docs.solana.com/developing/programming-model/calling-between-programs#cross-program-invocations)
- [Solana Cookbook Reference](https://solanacookbook.com/references/programs.html#how-to-do-cross-program-invocation)
- [Solana Course Native CPI Lesson](https://www.soldev.app/course/cpi)
- [Solana Course Anchor CPI Lesson](https://www.soldev.app/course/anchor-cpi)
- [Solana Developers Program Examples](https://github.com/solana-developers/program-examples/tree/main/basics/cross-program-invocation)
