# 编写程序

## 如何在程序中转移 SOL

你的Solana程序可以在不"调用"系统程序的情况下将lamports从一个账户转移给另一个账户。基本规则是，你的程序可以将lamports从你的程序所拥有的任何账户转移到任何账户。

接收方账户不一定要是你的程序所拥有的账户。

```rust
// rust
/// Transfers lamports from one account (must be program owned)
/// to another account. The recipient can by any account
fn transfer_service_fee_lamports(
    from_account: &AccountInfo,
    to_account: &AccountInfo,
    amount_of_lamports: u64,
) -> ProgramResult {
    // Does the from account have enough lamports to transfer?
    if **from_account.try_borrow_lamports()? < amount_of_lamports {
        return Err(CustomError::InsufficientFundsForTransaction.into());
    }
    // Debit from_account and credit to_account
    **from_account.try_borrow_mut_lamports()? -= amount_of_lamports;
    **to_account.try_borrow_mut_lamports()? += amount_of_lamports;
    Ok(())
}

/// Primary function handler associated with instruction sent
/// to your program
fn instruction_handler(accounts: &[AccountInfo]) -> ProgramResult {
    // Get the 'from' and 'to' accounts
    let account_info_iter = &mut accounts.iter();
    let from_account = next_account_info(account_info_iter)?;
    let to_service_account = next_account_info(account_info_iter)?;

    // Extract a service 'fee' of 5 lamports for performing this instruction
    transfer_service_fee_lamports(from_account, to_service_account, 5u64)?;

    // Perform the primary instruction
    // ... etc.

    Ok(())
}
```


## 如何在程序中获取时钟

获取时钟的方法有两种：

1. 将`SYSVAR_CLOCK_PUBKEY`作为指令的参数传入。
2. 在指令内部直接访问时钟。

了解这两种方法会对你有好处，因为一些传统的程序仍然将SYSVAR_CLOCK_PUBKEY作为一个账户来使用。

### 在指令中将时钟作为一个账户传递

让我们创建一个指令，该指令接收一个账户用于初始化，并接收 SYSVAR 的公钥。


```rust
// rust
let clock = Clock::from_account_info(&sysvar_clock_pubkey)?;
let current_timestamp = clock.unix_timestamp;

```


现在，我们通过客户端传递时钟的 SYSVAR 公共地址:

```typescript
// typescript
(async () => {
  const programId = new PublicKey(
    "77ezihTV6mTh2Uf3ggwbYF2NyGJJ5HHah1GrdowWJVD3"
  );

  // Passing Clock Sys Var
  const passClockIx = new TransactionInstruction({
    programId: programId,
    keys: [
      {
        isSigner: false,
        isWritable: true,
        pubkey: helloAccount.publicKey,
      },
      {
        is_signer: false,
        is_writable: false,
        pubkey: SYSVAR_CLOCK_PUBKEY,
      },
    ],
  });

  const transaction = new Transaction();
  transaction.add(passClockIx);

  const txHash = await connection.sendTransaction(transaction, [
    feePayer,
    helloAccount,
  ]);

  console.log(`Transaction succeeded. TxHash: ${txHash}`);
})();

```


### 在指令内部直接访问时钟

让我们创建同样的指令，但这次我们不需要从客户端传递`SYSVAR_CLOCK_PUBKEY`。


```rust
// rust
let clock = Clock::get()?;
let current_timestamp = clock.unix_timestamp;

```

现在，客户端只需要传递状态和支付账户的指令:


```typescript
// typescript
(async () => {
  const programId = new PublicKey(
    "4ZEdbCtb5UyCSiAMHV5eSHfyjq3QwbG3yXb6oHD7RYjk"
  );

  // No more requirement to pass clock sys var key
  const initAccountIx = new TransactionInstruction({
    programId: programId,
    keys: [
      {
        isSigner: false,
        isWritable: true,
        pubkey: helloAccount.publicKey,
      },
    ],
  });

  const transaction = new Transaction();
  transaction.add(initAccountIx);

  const txHash = await connection.sendTransaction(transaction, [
    feePayer,
    helloAccount,
  ]);

  console.log(`Transaction succeeded. TxHash: ${txHash}`);
})();

```


## 如何更改账户大小

你可以使用`realloc`函数来更改程序拥有的账户的大小。`realloc`函数可以将账户的大小调整到最大10KB。当你使用`realloc`增加账户的大小时，你需要转移lamports以保持该账户的租金免除状态。


```rust
// rust
// adding a publickey to the account
let new_size = pda_account.data.borrow().len() + 32;

let rent = Rent::get()?;
let new_minimum_balance = rent.minimum_balance(new_size);

let lamports_diff = new_minimum_balance.saturating_sub(pda_account.lamports());
invoke(
    &system_instruction::transfer(funding_account.key, pda_account.key, lamports_diff),
    &[
        funding_account.clone(),
        pda_account.clone(),
        system_program.clone(),
    ],
)?;

pda_account.realloc(new_size, false)?;

```


## 跨程序调用的方法

跨程序调用，简单来说，就是在我们的程序中调用另一个程序的指令。一个很好的例子是`Uniswap`的`swap`功能。`UniswapV2Router`合约调用必要的逻辑进行交换，并调用`ERC20`合约的transfer函数将代币从一个人转移到另一个人。同样的方式，我们可以调用程序的指令来实现多种目的。

让我们来看看我们的第一个例子，即`SPL Token Program`的`transfer`指令。进行转账所需的账户包括：

1. 源代币账户（我们持有代币的账户）
2. 目标代币账户（我们要将代币转移至的账户）
3. 源代币账户的持有者（我们将为其签名的钱包地址）



```rust
// rust
let token_transfer_amount = instruction_data
    .get(..8)
    .and_then(|slice| slice.try_into().ok())
    .map(u64::from_le_bytes)
    .ok_or(ProgramError::InvalidAccountData)?;

let transfer_tokens_instruction = transfer(
    &token_program.key,
    &source_token_account.key,
    &destination_token_account.key,
    &source_token_account_holder.key,
    &[&source_token_account_holder.key],
    token_transfer_amount,
)?;

let required_accounts_for_transfer = [
    source_token_account.clone(),
    destination_token_account.clone(),
    source_token_account_holder.clone(),
];

invoke(
    &transfer_tokens_instruction,
    &required_accounts_for_transfer,
)?;


```

相应的客户端指令如下所示。有关了解铸币和代币创建指令，请参考附近的完整代码。

```typescript
// typescript
(async () => {
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  const programId = new PublicKey(
    "EfYK91eN3AqTwY1C34W6a33qGAtQ8HJYVhNv7cV4uMZj"
  );

  const transferTokensIx = new TransactionInstruction({
    programId: programId,
    data: TOKEN_TRANSFER_AMOUNT_BUFFER,
    keys: [
      {
        isSigner: false,
        isWritable: true,
        pubkey: SOURCE_TOKEN_ACCOUNT.publicKey,
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: DESTINATION_TOKEN_ACCOUNT.publicKey,
      },
      {
        isSigner: true,
        isWritable: true,
        pubkey: PAYER_KEYPAIR.publicKey,
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: TOKEN_PROGRAM_ID,
      },
    ],
  });

  const transaction = new Transaction();
  transaction.add(transferTokensIx);

  const txHash = await connection.sendTransaction(transaction, [
    PAYER_KEYPAIR,
    TOKEN_MINT_ACCOUNT,
    SOURCE_TOKEN_ACCOUNT,
    DESTINATION_TOKEN_ACCOUNT,
  ]);

  console.log(`Token transfer CPI success: ${txHash}`);
})();

```


现在让我们来看另一个例子，即`System Program`的`create_account`指令。这里与上面提到的指令有一点不同。在上述例子中，我们不需要在`invoke`函数中将`token_program`作为账户之一传递。然而，在某些情况下，您需要传递调用指令的`program_id`。在我们的例子中，它将是`System Program`的`program_id`（"11111111111111111111111111111111"）。所以现在所需的账户包括：

```rust
// rust
let account_span = instruction_data
    .get(..8)
    .and_then(|slice| slice.try_into().ok())
    .map(u64::from_le_bytes)
    .ok_or(ProgramError::InvalidAccountData)?;

let lamports_required = (Rent::get()?).minimum_balance(account_span as usize);

let create_account_instruction = create_account(
    &payer_account.key,
    &general_state_account.key,
    lamports_required,
    account_span,
    program_id,
);

let required_accounts_for_create = [
    payer_account.clone(),
    general_state_account.clone(),
    system_program.clone(),
];

invoke(&create_account_instruction, &required_accounts_for_create)?;

```


对应的客户端代码如下所示：


```typescript
// typescript
(async () => {
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  const programId = new PublicKey(
    "DkuQ5wsndkzXfgqDB6Lgf4sDjBi4gkLSak1dM5Mn2RuQ"
  );

  // Airdropping some SOL
  await connection.confirmTransaction(
    await connection.requestAirdrop(PAYER_KEYPAIR.publicKey, LAMPORTS_PER_SOL)
  );

  // Our program's CPI instruction (create_account)
  const creataAccountIx = new TransactionInstruction({
    programId: programId,
    data: ACCOUNT_SPACE_BUFFER,
    keys: [
      {
        isSigner: true,
        isWritable: true,
        pubkey: PAYER_KEYPAIR.publicKey,
      },
      {
        isSigner: true,
        isWritable: true,
        pubkey: GENERAL_STATE_KEYPAIR.publicKey,
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: SystemProgram.programId,
      },
    ],
  });

  const transaction = new Transaction();
  // Adding up all the above instructions
  transaction.add(creataAccountIx);

  const txHash = await connection.sendTransaction(transaction, [
    PAYER_KEYPAIR,
    GENERAL_STATE_KEYPAIR,
  ]);

  console.log(`Create Account CPI Success: ${txHash}`);
})();

```


## 如何创建PDA

程序派生地址（Program Derived Address，PDA）是程序拥有的账户，但没有私钥。相反，它的签名是通过一组种子和一个阻碍值（一个确保其不在曲线上的随机数）获取的。"生成"程序地址与"创建"它是不同的。可以使用`Pubkey::find_program_address`来生成PDA。创建PDA实质上意味着初始化该地址的空间并将其状态设置为初始状态。普通的密钥对账户可以在我们的程序之外创建，然后将其用于初始化PDA的状态。不幸的是，对于PDA来说，它必须在链上创建，因为它本身无法代表自己进行签名。因此，我们使用`invoke_signed`来传递PDA的种子，以及资金账户的签名，从而实现了PDA的账户创建。


```rust
// rust
let create_pda_account_ix = system_instruction::create_account(
    &funding_account.key,
    &pda_account.key,
    lamports_required,
    ACCOUNT_DATA_LEN.try_into().unwrap(),
    &program_id,
);

invoke_signed(
    &create_pda_account_ix,
    &[funding_account.clone(), pda_account.clone()],
    &[signers_seeds],
)?;

```


可以通过客户端按如下方式发送所需的账户：


```typescript
// typescript
const PAYER_KEYPAIR = Keypair.generate();

(async () => {
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  const programId = new PublicKey(
    "6eW5nnSosr2LpkUGCdznsjRGDhVb26tLmiM1P8RV1QQp"
  );

  const [pda, bump] = await PublicKey.findProgramAddress(
    [Buffer.from("customaddress"), PAYER_KEYPAIR.publicKey.toBuffer()],
    programId
  );

  const createPDAIx = new TransactionInstruction({
    programId: programId,
    data: Buffer.from(Uint8Array.of(bump)),
    keys: [
      {
        isSigner: true,
        isWritable: true,
        pubkey: PAYER_KEYPAIR.publicKey,
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: pda,
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: SystemProgram.programId,
      },
    ],
  });

  const transaction = new Transaction();
  transaction.add(createPDAIx);

  const txHash = await connection.sendTransaction(transaction, [PAYER_KEYPAIR]);
})();

```
## 如何读取账户

在Solana中，几乎所有的指令都至少需要2-3个账户，并且在指令处理程序中会说明它期望的账户顺序。如果我们利用Rust中的`iter()`方法，而不是手动索引账户，那么这将非常简单。`next_account_info`方法基本上是对可迭代对象的第一个索引进行切片，并返回账户数组中存在的账户。让我们看一个简单的指令，它期望一堆账户并需要解析每个账户。



```rust
// rust
pub fn process_instruction(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    _instruction_data: &[u8],
) -> ProgramResult {
    // Fetching all the accounts as a iterator (facilitating for loops and iterations)
    let accounts_iter = &mut accounts.iter();
    // Payer account
    let payer_account = next_account_info(accounts_iter)?;
    // Hello state account
    let hello_state_account = next_account_info(accounts_iter)?;
    // Rent account
    let rent_account = next_account_info(accounts_iter)?;
    // System Program
    let system_program = next_account_info(accounts_iter)?;

    Ok(())
}

```


## 如何验证账户

由于Solana中的程序是无状态的，作为程序创建者，我们必须尽可能验证传递的账户，以避免任何恶意账户的进入。可以进行的基本检查包括：

1. 检查预期的签名账户是否已签名。
2. 检查预期的状态账户是否已标记为可写。
3. 检查预期的状态账户的所有者是否为调用程序的程序ID。
4. 如果首次初始化状态，请检查账户是否已经初始化。
5. 检查是否按预期传递了任何跨程序的ID（在需要时）。

下面是一个基本的指令，它使用上述检查初始化英雄状态账户的示例：


```rust
// rust
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    _instruction_data: &[u8],
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    let payer_account = next_account_info(accounts_iter)?;
    let hello_state_account = next_account_info(accounts_iter)?;
    let system_program = next_account_info(accounts_iter)?;

    let rent = Rent::get()?;

    // Checking if payer account is the signer
    if !payer_account.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    // Checking if hello state account is rent exempt
    if !rent.is_exempt(hello_state_account.lamports(), 1) {
        return Err(ProgramError::AccountNotRentExempt);
    }

    // Checking if hello state account is writable
    if !hello_state_account.is_writable {
        return Err(ProgramError::InvalidAccountData);
    }

    // Checking if hello state account's owner is the current program
    if hello_state_account.owner.ne(&program_id) {
        return Err(ProgramError::IllegalOwner);
    }

    // Checking if the system program is valid
    if system_program.key.ne(&SYSTEM_PROGRAM_ID) {
        return Err(ProgramError::IncorrectProgramId);
    }

    let mut hello_state = HelloState::try_from_slice(&hello_state_account.data.borrow())?;

    // Checking if the state has already been initialized
    if hello_state.is_initialized {
        return Err(ProgramError::AccountAlreadyInitialized);
    }

    hello_state.is_initialized = true;
    hello_state.serialize(&mut &mut hello_state_account.data.borrow_mut()[..])?;
    msg!("Account initialized :)");

    Ok(())
}

```

## 如何从一个交易中读取多个指令

Solana允许我们查看当前交易中的所有指令。我们可以将它们存储在一个变量中，并对其进行迭代。我们可以利用这一点做许多事情，比如检查可疑的交易。


```rust
// rust
let mut idx = 0;
let num_instructions = read_u16(&mut idx, &instruction_sysvar)
.map_err(|_| MyError::NoInstructionFound)?;


for index in 0..num_instructions {

    let mut current = 2 + (index * 2) as usize;
    let start = read_u16(&mut current, &instruction_sysvar).unwrap();

    current = start as usize;
    let num_accounts = read_u16(&mut current, &instruction_sysvar).unwrap();
    current += (num_accounts as usize) * (1 + 32);

}

```
