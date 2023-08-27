---
sidebar_position: 114
sidebar_label:  SPL 代币
sidebar_class_name: green
---

# SPL 代币

在以太坊中，普通代币被一个叫ERC20的提案定了规范，可以认为普通代币合约统一叫做ERC20代币。

那么Solana世界里的ERC20代币是什么呢？答案就是SPL代币。

> The Solana Program Library (SPL) is a collection of on-chain programs targeting the Sealevel parallel runtime.

SPL Token是 " Solana Program Library"中的一个组成部分，叫做"Token Program"，简称为SPL Token。

所有的代币都有这个合约来管理，该合约代码在 https://github.com/solana-labs/solana-program-library/tree/master/token

## 代币信息

不同于以太坊中，一个代币就是一个合约。

SPL Token中，一个代币，仅仅是一个归`Token`合约管理的普通的`Account`对象，这个对象里面的二进制数据定义了 这个代币的基本属性。其结构为：

```rust
// ref: https://github.com/solana-labs/solana-program-library/blob/30d0e1b654414b5a2aca6c6d3a90cd66c820c31e/token/program/src/state.rs#L16
pub struct Mint {
    /// Optional authority used to mint new tokens. The mint authority may only be provided during
    /// mint creation. If no mint authority is present then the mint has a fixed supply and no
    /// further tokens may be minted.
    pub mint_authority: COption<Pubkey>,
    /// Total supply of tokens.
    pub supply: u64,
    /// Number of base 10 digits to the right of the decimal place.
    pub decimals: u8,
    /// Is `true` if this structure has been initialized
    pub is_initialized: bool,
    /// Optional authority to freeze token accounts.
    pub freeze_authority: COption<Pubkey>,
}
```

相对有意义的就是`supply`表示总共的供应量，`decimals`表示代币的精度信息。

![](../img/week1/mint_wallet_account.png)

## SPL Token Account

那么每个用户的拥有的代币数量信息存在哪里呢？

这个合约又定义了一个账号结构，来表示某个地址含有某个代币的数量。

```rust
pub struct Account {
    /// The mint associated with this account
    pub mint: Pubkey,
    /// The owner of this account.
    pub owner: Pubkey,
    /// The amount of tokens this account holds.
    pub amount: u64,
    /// If `delegate` is `Some` then `delegated_amount` represents
    /// the amount authorized by the delegate
    pub delegate: COption<Pubkey>,
    /// The account's state
    pub state: AccountState,
    /// If is_native.is_some, this is a native token, and the value logs the rent-exempt reserve. An
    /// Account is required to be rent-exempt, so the value is used by the Processor to ensure that
    /// wrapped SOL accounts do not drop below this threshold.
    pub is_native: COption<u64>,
    /// The amount delegated
    pub delegated_amount: u64,
    /// Optional authority to close the account.
    pub close_authority: COption<Pubkey>,
}
```

这里`owner`表示谁的代币，`amount`表示代币的数量。

![](../img/week1/spl_account_1.png)

## Account关系

所以整体结构是这样的：

![](../img/week1/spl_pda_account.png)

这两个结构体都是SPL Token Program管理的`Account`对象，其自身所携带的数据，分别为代币信息，和 存储哪个代币的信息。

这样当需要进行代币的交易时，只需要相应用户的相应代币账号里面的`amount`即可。
