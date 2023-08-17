---
sidebar_position: 70
sidebar_label: ⚔ 跨项目的Boss战
sidebar_class_name: green
---

# ⚔ 跨项目的Boss战

如果你是一个玩家，你可能玩过一个有着巨大Boss战的游戏。这种类型的Boss是一个人无法击败的，所以你必须与朋友们联手并围攻它们。想想灭霸对阵复仇者联盟。

战胜他们的秘诀就是合作。每个人都共同努力，发挥自己的力量。Solana赋予你合作的超能力：[可组合性](https://en.wikipedia.org/wiki/Composability?utm_source=buildspace.so&utm_medium=buildspace_project)是其架构的关键设计原则。

![](./img/giphy.gif)


什么能释放这种力量？跨程序调用 - 或者称为`CPIs`。

想象一下你的最终NFT质押项目。在那里，我们正在进行许多与代币相关的操作（质押、赎回、解质押），我们不需要自己构建 - 我们只需调用代币程序，它会为我们处理这些操作。

## 🔀 跨程序调用

跨程序调用是一个程序直接调用另一个程序的方式。就像任何客户端都可以使用JSON RPC调用任何程序一样，任何程序都可以直接调用其他程序。

`CPIs`本质上将整个Solana生态系统转化为一个巨大的API，作为开发者，你可以随意使用。

## 🤔 如何制作一个CPI

你之前已经做过几次CPI了，所以这应该看起来很熟悉！

CPIs是使用 `solana_program` 库中的[`invoke`](https://docs.rs/solana-program/1.10.19/solana_program/program/fn.invoke.html?utm_source=buildspace.so&utm_medium=buildspace_project)或[`invoke_signed`](https://docs.rs/solana-program/1.10.19/solana_program/program/fn.invoke_signed.html?utm_source=buildspace.so&utm_medium=buildspace_project)函数创建的。

`CPIs`将调用者的签名权限扩展给被调用者。

-  `invoke`将原始交易签名传递给你调用的程序。
- `invoke_signed`使用（`PDA`）来让你的程序“签署”指令

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

![](./img/invoke-.png)

`Instruction` 类型的定义如下：

- `program_id` - 要调用的程序的公钥
- `account` - 一个包含账户元数据的向量列表。你需要包括每个被调用程序将要读取或写入的账户。
- `data` - 一个字节缓冲区，表示作为向被调用程序传递的数据的向量

根据你所调用的程序，可能会有一个可用的包含辅助函数来创建 `Instruction` 对象的 `crate`。 `accounts` 和 `data` 字段都是 `Vec` 类型，或者是向量。你可以使用 [vec](https://doc.rust-lang.org/std/macro.vec.html?utm_source=buildspace.so&utm_medium=buildspace_project#) 宏来使用数组表示法构建一个向量。

```rust
pub struct Instruction {
    pub program_id: Pubkey,
    pub accounts: Vec<AccountMeta>,
    pub data: Vec<u8>,
}
```

![](./img/instruction.png)

`accounts` 字段期望一个类型为`AccountMeta`的向量。 `Instruction` 结构的字段如下所示： `AccountMeta` 。

```rust
pub struct AccountMeta {
    pub pubkey: Pubkey,
    pub is_signer: bool,
    pub is_writable: bool,
}
```

例如：

- `AccountMeta::new` - 表示可写
- `AccountMeta::read_only` - 表示不可写入
- `(account1_pubkey, true)` - 表示账户是签署人
- `(account2_pubkey, false)` - 表示账户不是签署人

```rust
use solana_program::instruction::AccountMeta;

let accounts = vec![
    AccountMeta::new(account1_pubkey, true),
    AccountMeta::new(account2_pubkey, false),
		AccountMeta::read_only(account3_pubkey, false),
    AccountMeta::read_only(account4_pubkey, true),
]
```

这是一个创建 `Instruction` 的示例

- `accounts` - 指令所需的 `AccountMeta` 的向量
- `data` - 指令所需的序列化指令数据
- `programId` - 被调用的程序
- 使用 `solana_program::instruction::Instruction` 来创建新的 `Instruction`

```rust
use solana_program::instruction::{AccountMeta, Instruction},

let accounts = vec![
    AccountMeta::new(account1_pubkey, true),
    AccountMeta::new(account2_pubkey, false),
		AccountMeta::read_only(account3_pubkey, false),
    AccountMeta::read_only(account4_pubkey, true),
];

struct InstructionData {
    amount: u8,
}

let data = BorshSerialize.try_to_vec(InstructionData { amount: 1 });

let instruction = Instruction {
    program_id: *program_id,
    accounts,
    data,
};
```

## 📜 传递一个账户列表

在底层， `invoke` 和 `invoke_signed` 都只是交易，所以我们需要传入一个 `account_info` 对象的列表。

将需要传递到CPI的每个 `account_info` 对象使用在 `solana_program` 包中的 `account_info` 结构体上实现的`Clon Trait`进行复制。


![](./img/call-invoke.png)

这个`Clone trait`返回一个 `account_info` 实例的副本。

```rust
&[first_account.clone(), second_account.clone(), third_account.clone()]
```

## 🏒 `CPI`与 `invoke`


![](./img/cpi-with-invoke.png)

记住 - 调用就像传递一个交易，执行此操作的程序根本不会触及它。这意味着不需要包含签名，因为Solana运行时会将原始签名传递给你的程序。

## 🏑 `CPI`与 `invoke_signed`

![](./img/cpi-with-invoke-signed.png)

每当我们使用PDA时，我们会使用 `invoke_signed` 并传入种子。

Solana运行时将使用提供的种子和调用程序的 `program_id` 内部调用[`create_program_address`](https://docs.rs/solana-program/1.4.4/solana_program/pubkey/struct.Pubkey.html#method.create_program_address?utm_source=buildspace.so&utm_medium=buildspace_project)。然后，它将结果与指令中提供的地址进行比较。如果任何帐户地址与PDA匹配，则将该帐户上的 `is_signer` 标志设置为`true`。

就像一个效率的捷径！

## 😲 最佳实践和常见陷阱

![](./img/cpi-1.png)

在执行`CPI`时，你可能会遇到一些常见的错误，通常意味着你正在使用错误的信息构建`CPI`。

“签名者权限升级”意味着你在指示中错误地代签地址。

如果你正在使用 `invoke_signed` 并收到此错误，则很可能是你提供的种子不正确。

```bash
EF1M4SPfKcchb6scq297y8FPCaLvj5kGjwMzjTM68wjA's signer privilege escalated
Program returned error: "Cross-program invocation with unauthorized signer or writable account"
```


当写入的帐户在结构体中没有标记为 `writable` 时，会抛出另一个类似的错误。



这里有一堆其他可能导致问题的情况：

- 任何在程序执行期间可能被程序修改的账户必须被指定为可写入的。
- 写入一个未指定为可写的账户将导致交易失败。
- 写入一个不属于该程序的账户将导致交易失败。
- 任何在程序执行期间可能被修改的`Lamport`余额的账户必须被指定为可写入的。
- 在执行过程中，对未指定为可写的账户进行`lamports`的变更将导致交易失败。
- 将`Lamport`从程序未拥有的账户中减去将导致交易失败，但只要账户是可变的，向任何账户添加`Lamport`是允许的。

```bash
2qoeXa9fo8xVHzd2h9mVcueh6oK3zmAiJxCTySM5rbLZ's writable privilege escalated
Program returned error: "Cross-program invocation with unauthorized signer or writable account"
```

这里的意思是，如果你不在交易中明确声明你要操作这些账户，那么你就不能随意对其进行操作。你不需要记住所有这些情况，只需记住第一节中关于交易的基本原则 - 你必须声明你要读取或写入的所有账户。

## 🤔 有什么意义

`CPI`是Solana生态系统的一个非常重要的特性，它使得所有部署的程序之间可以互操作。这为在已有基础上构建新的协议和应用提供了机会，就像搭积木或乐高积木一样。

可组合性是加密货币如此独特的重要组成部分，而`CPI`则使其在Solana上成为可能。

`CPI`的另一个重要方面是它们允许程序为其`PDAs`签名。正如你可能已经注意到的那样，`PDAs`在Solana开发中被广泛使用，因为它们允许程序以一种特定的方式控制特定地址，以便没有外部用户能够为这些地址生成有效签名的交易。
