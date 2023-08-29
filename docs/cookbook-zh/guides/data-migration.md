# 迁移程序的数据账户

## 你如何迁移一个程序的数据账户？

当你创建一个程序时，与该程序关联的每个数据账户都将具有特定的数据结构。如果你需要升级一个程序派生账户，那么你将得到一堆具有旧结构的剩余程序派生账户。

通过账户版本控制，您可以将旧账户升级到新的结构。

> **tip 注意**
> 这只是在程序拥有的账户（POA）中迁移数据的众多方法之一。

## 场景

为了对账户数据进行版本控制和迁移，我们将为每个账户提供一个ID。该ID允许我们在将其传递给程序时识别账户的版本，从而正确处理账户。

假设有以下账户状态和程序：

*Account*
```rust
#[derive(BorshDeserialize, BorshSerialize, Debug, Default, PartialEq)]
pub struct AccountContentCurrent {
    pub somevalue: u64,
}

#[derive(BorshDeserialize, BorshSerialize, Debug, Default, PartialEq)]
pub struct ProgramAccountState {
    is_initialized: bool,
    data_version: u8,
    account_data: AccountContentCurrent,
}
```

*instruction*

```rust
impl ProgramInstruction {
    /// Unpack inbound buffer to associated Instruction
    /// The expected format for input is a Borsh serialized vector
    pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {
        let payload = ProgramInstruction::try_from_slice(input).unwrap();
        match payload {
            ProgramInstruction::InitializeAccount => Ok(payload),
            ProgramInstruction::SetU64Value(_) => Ok(payload),
            _ => Err(DataVersionError::InvalidInstruction.into()),
        }
    }
}
```

*processor*

```rust
fn check_account_ownership(program_id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult {
    // Accounts must be owned by the program.
    for account in accounts.iter().take(accounts.len() - 1) {
        if account.owner != program_id {
            msg!(
                "Fail: The tracking account owner is {} and it should be {}.",
                account.owner,
                program_id
            );
            return Err(ProgramError::IncorrectProgramId);
        }
    }
    Ok(())
}

/// Initialize the programs account, which is the first in accounts
fn initialize_account(accounts: &[AccountInfo]) -> ProgramResult {
    msg!("Initialize account");
    let account_info_iter = &mut accounts.iter();
    let program_account = next_account_info(account_info_iter)?;
    let mut account_data = program_account.data.borrow_mut();
    // Just using unpack will check to see if initialized and will
    // fail if not
    let mut account_state = ProgramAccountState::unpack_unchecked(&account_data)?;
    // Where this is a logic error in trying to initialize the same account more than once
    if account_state.is_initialized() {
        return Err(DataVersionError::AlreadyInitializedState.into());
    } else {
        account_state.set_initialized();
        account_state.content_mut().somevalue = 1;
    }
    msg!("Account Initialized");
    // Serialize
    ProgramAccountState::pack(account_state, &mut account_data)
}

/// Sets the u64 in the content structure
fn set_u64_value(accounts: &[AccountInfo], value: u64) -> ProgramResult {
    msg!("Set new value {}", value);
    let account_info_iter = &mut accounts.iter();
    let program_account = next_account_info(account_info_iter)?;
    let mut account_data = program_account.data.borrow_mut();
    let mut account_state = ProgramAccountState::unpack(&account_data)?;
    account_state.content_mut().somevalue = value;
    // Serialize
    ProgramAccountState::pack(account_state, &mut account_data)
}
/// Main processing entry point dispatches to specific
/// instruction handlers
pub fn process(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    msg!("Received process request");
    // Check the account for program relationship
    if let Err(error) = check_account_ownership(program_id, accounts) {
        return Err(error);
    };
    // Unpack the inbound data, mapping instruction to appropriate structure
    let instruction = ProgramInstruction::unpack(instruction_data)?;
    match instruction {
        ProgramInstruction::InitializeAccount => initialize_account(accounts),
        ProgramInstruction::SetU64Value(value) => set_u64_value(accounts, value),
        _ => {
            msg!("Received unknown instruction");
            Err(DataVersionError::InvalidInstruction.into())
        }
    }
}
```

在我们账户的第一个版本中，我们执行以下操作：

| ID | Action |
| - | - |
|1| Include a 'data version' field in your data. It can be a simple incrementing ordinal (e.g. u8) or something more sophisticated
|2| Allocating enough space for data growth
|3| Initializing a number of constants to be used across program versions
|4| Add an update account function under `fn conversion_logic` for future upgrades

假设我们现在希望升级程序的账户，包括一个新的必需字段：`somestring`字段。

如果我们之前没有为账户分配额外的空间，我们将无法升级该账户，而被卡住。

## 升级账户

在我们的新程序中，我们希望为内容状态添加一个新属性。下面的变化展示了我们如何利用初始的程序结构，并在现在使用时进行修改。

### 1. 添加账户转换逻辑

```rust
/// Current state (DATA_VERSION 1). If version changes occur, this
/// should be copied to another (see AccountContentOld below)
/// We've added a new field: 'somestring'
#[derive(BorshDeserialize, BorshSerialize, Debug, Default, PartialEq)]
pub struct AccountContentCurrent {
    pub somevalue: u64,
    pub somestring: String,
}

/// Old content state (DATA_VERSION 0).
#[derive(BorshDeserialize, BorshSerialize, Debug, Default, PartialEq)]
pub struct AccountContentOld {
    pub somevalue: u64,
}

/// Maintains account data
#[derive(BorshDeserialize, BorshSerialize, Debug, Default, PartialEq)]
pub struct ProgramAccountState {
    is_initialized: bool,
    data_version: u8,
    account_data: AccountContentCurrent,
}

```


| Line(s) | Note |
| ------- | - |
| 6 | We've added Solana's `solana_program::borsh::try_from_slice_unchecked` to simplify reading subsets of data from the larger data block
| 13-26| Here we've preserved the old content structure, `AccountContentOld` line 24, before extending the `AccountContentCurrent` starting in line 17.
| 60 | We bump the `DATA_VERSION` constant
| 71 | We now have a 'previous' version and we want to know it's size
| 86 | The Coup de grâce is adding the plumbing to upgrade the previous content state to the new (current) content state

然后，我们更新指令，添加一个新的指令来更新`somestring`，并更新处理器来处理新的指令。请注意，"升级"数据结构是通过`pack/unpack`封装起来的。

*instruction*

```rust
//! instruction Contains the main VersionProgramInstruction enum

use {
    crate::error::DataVersionError,
    borsh::{BorshDeserialize, BorshSerialize},
    solana_program::{borsh::try_from_slice_unchecked, msg, program_error::ProgramError},
};

#[derive(BorshDeserialize, BorshSerialize, Debug, PartialEq)]
/// All custom program instructions
pub enum VersionProgramInstruction {
    InitializeAccount,
    SetU64Value(u64),
    SetString(String), // Added with data version change
    FailInstruction,
}

impl VersionProgramInstruction {
    /// Unpack inbound buffer to associated Instruction
    /// The expected format for input is a Borsh serialized vector
    pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {
        let payload = try_from_slice_unchecked::<VersionProgramInstruction>(input).unwrap();
        // let payload = VersionProgramInstruction::try_from_slice(input).unwrap();
        match payload {
            VersionProgramInstruction::InitializeAccount => Ok(payload),
            VersionProgramInstruction::SetU64Value(_) => Ok(payload),
            VersionProgramInstruction::SetString(_) => Ok(payload), // Added with data version change
            _ => Err(DataVersionError::InvalidInstruction.into()),
        }
    }
}
```

*process*

```rust
//! Resolve instruction and execute

use crate::{
    account_state::ProgramAccountState, error::DataVersionError,
    instruction::VersionProgramInstruction,
};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    program_pack::{IsInitialized, Pack},
    pubkey::Pubkey,
};

/// Checks each tracking account to confirm it is owned by our program
/// This function assumes that the program account is always the last
/// in the array
fn check_account_ownership(program_id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult {
    // Accounts must be owned by the program.
    for account in accounts.iter().take(accounts.len() - 1) {
        if account.owner != program_id {
            msg!(
                "Fail: The tracking account owner is {} and it should be {}.",
                account.owner,
                program_id
            );
            return Err(ProgramError::IncorrectProgramId);
        }
    }
    Ok(())
}

/// Initialize the programs account, which is the first in accounts
fn initialize_account(accounts: &[AccountInfo]) -> ProgramResult {
    msg!("Initialize account");
    let account_info_iter = &mut accounts.iter();
    let program_account = next_account_info(account_info_iter)?;
    let mut account_data = program_account.data.borrow_mut();
    // Just using unpack will check to see if initialized and will
    // fail if not
    let mut account_state = ProgramAccountState::unpack_unchecked(&account_data)?;
    // Where this is a logic error in trying to initialize the same account more than once
    if account_state.is_initialized() {
        return Err(DataVersionError::AlreadyInitializedState.into());
    } else {
        account_state.set_initialized();
        account_state.content_mut().somevalue = 1;
    }
    msg!("Account Initialized");
    // Serialize
    ProgramAccountState::pack(account_state, &mut account_data)
}

/// Sets the u64 in the content structure
fn set_u64_value(accounts: &[AccountInfo], value: u64) -> ProgramResult {
    msg!("Set new value {}", value);
    let account_info_iter = &mut accounts.iter();
    let program_account = next_account_info(account_info_iter)?;
    let mut account_data = program_account.data.borrow_mut();
    let mut account_state = ProgramAccountState::unpack(&account_data)?;
    account_state.content_mut().somevalue = value;
    // Serialize
    ProgramAccountState::pack(account_state, &mut account_data)
}

/// Sets the string in the content structure
fn set_string_value(accounts: &[AccountInfo], value: String) -> ProgramResult {
    msg!("Set new string {}", value);
    let account_info_iter = &mut accounts.iter();
    let program_account = next_account_info(account_info_iter)?;
    let mut account_data = program_account.data.borrow_mut();
    let mut account_state = ProgramAccountState::unpack(&account_data)?;
    account_state.content_mut().somestring = value;
    // Serialize
    ProgramAccountState::pack(account_state, &mut account_data)
}
/// Main processing entry point dispatches to specific
/// instruction handlers
pub fn process(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    msg!("Received process request 0.2.0");
    // Check the account for program relationship
    if let Err(error) = check_account_ownership(program_id, accounts) {
        return Err(error);
    };
    // Unpack the inbound data, mapping instruction to appropriate structure
    msg!("Attempting to unpack");
    let instruction = VersionProgramInstruction::unpack(instruction_data)?;
    match instruction {
        VersionProgramInstruction::InitializeAccount => initialize_account(accounts),
        VersionProgramInstruction::SetU64Value(value) => set_u64_value(accounts, value),
        VersionProgramInstruction::SetString(value) => set_string_value(accounts, value),
        _ => {
            msg!("Received unknown instruction");
            Err(DataVersionError::InvalidInstruction.into())
        }
    }
}
```

## 资料

* [Borsh Specification](https://borsh.io/)
* [Solana `try_from_slice_unchecked`](https://github.com/solana-labs/solana/blob/master/sdk/program/src/borsh.rs#L67)
* [Reference Implementation](https://github.com/FrankC01/versioning-solana)
