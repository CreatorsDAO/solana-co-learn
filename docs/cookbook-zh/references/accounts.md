# 账户

## 如何创建系统账户

创建一个由[系统程序](https://docs.solana.com/developing/clients/javascript-reference#systemprogram) 拥有的账户。Solana运行时将授予账户的所有者对其数据的写入权限或转移Lamports的访问权限。在创建账户时，我们需要预先分配一定大小的存储空间（space）和足够的Lamports来支付租金。 [租金（Rent）](https://docs.solana.com/developing/programming-model/accounts#rent) 是在Solana上保持账户活跃所需支付的费用。


```typescript
// typescript
const createAccountParams = {
  fromPubkey: fromPubkey.publicKey,
  newAccountPubkey: newAccountPubkey.publicKey,
  lamports: rentExemptionAmount,
  space,
  programId: SystemProgram.programId,
};

const createAccountTransaction = new Transaction().add(
  SystemProgram.createAccount(createAccountParams)
);

await sendAndConfirmTransaction(connection, createAccountTransaction, [
  fromPubkey,
  newAccountPubkey,
]);

```

```rust
// rust
let create_account_ix = system_instruction::create_account(
    &from_pubkey,
    &new_account_pubkey,
    rent_exemption_amount,
    space as u64,
    &from_pubkey,
);

let (recent_blockhash, _) = connection.get_recent_blockhash().unwrap();

let create_account_tx = solana_sdk::transaction::Transaction::new_signed_with_payer(
    &[create_account_ix],
    Some(&from_pubkey),
    &[&from_keypair, &new_account_keypair],
    recent_blockhash,
);

match connection.send_and_confirm_transaction(&create_account_tx) {
    Ok(sig) => loop {
        if let Ok(confirmed) = connection.confirm_transaction(&sig) {
            if confirmed {
                println!("Transaction: {} Status: {}", sig, confirmed);
                break;
            }
        }
    },
    Err(_) => println!("Error creating system account"),
};

```

## 如何计算账户费用

在Solana上保持账户活跃会产生一项存储费用，称为 [租金/rent](https://docs.solana.com/developing/programming-model/accounts#rent)。通过存入至少两年租金的金额，你可以使账户完全免除租金收取。对于费用的计算，你需要考虑你打算在账户中存储的数据量。


```typescript
// typescript
import { Connection, clusterApiUrl } from "@solana/web3.js";

(async () => {
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  // length of data in the account to calculate rent for
  const dataLength = 1500;
  const rentExemptionAmount =
    await connection.getMinimumBalanceForRentExemption(dataLength);
  console.log({
    rentExemptionAmount,
  });
})();
```


```rust
// rust
use solana_client::rpc_client::RpcClient;
use solana_sdk::commitment_config::CommitmentConfig;

fn main() {
    let rpc_url = String::from("https://api.devnet.solana.com");
    let connection = RpcClient::new_with_commitment(rpc_url, CommitmentConfig::confirmed());
    let data_length = 1500;

    let rent_exemption_amount = connection
        .get_minimum_balance_for_rent_exemption(data_length)
        .unwrap();

    println!("rent exemption amount: {}", rent_exemption_amount);
}
```


## 如何使用种子创建账户

你可以使用 `createAccountWithSeed` 方法来管理您的账户，而无需创建大量不同的密钥对。

### 生成


```typescript
// typescript
PublicKey.createWithSeed(basePubkey, seed, programId);
```


```rust
// rust
use solana_program::pubkey::Pubkey;
use solana_sdk::signature::{Keypair, Signer};

fn main() {
    let base_pubkey = Keypair::new().pubkey();
    let seed = "robot001";
    let program_id = solana_program::system_program::id();

    let derived_pubkey = Pubkey::create_with_seed(&base_pubkey, seed, &program_id).unwrap();

    println!("account pubkey: {:?}", derived_pubkey);
}
```

### 创建


```typescript
// typescript
const tx = new Transaction().add(
  SystemProgram.createAccountWithSeed({
    fromPubkey: feePayer.publicKey, // funder
    newAccountPubkey: derived,
    basePubkey: basePubkey,
    seed: seed,
    lamports: 1e8, // 0.1 SOL
    space: 0,
    programId: owner,
  })
);

console.log(
  `txhash: ${await sendAndConfirmTransaction(connection, tx, [feePayer, base])}`
);

```


```rust
// rust
let derived_pubkey = Pubkey::create_with_seed(&base_pubkey, seed, &program_id).unwrap();

let ix = system_instruction::create_account_with_seed(
  &fee_payer_pubkey,
  &derived_pubkey,
  &base_pubkey,
  seed,
  LAMPORTS_PER_SOL / 10,
  0,
  &program_id,
);

let tx = solana_sdk::transaction::Transaction::new_signed_with_payer(
  &[ix],
  Some(&fee_payer_pubkey),
  &[&fee_payer_keypair, &base_keypair],
  recent_blockhash,
);

```

### 转账

```typescript
// typescript
const tx = new Transaction().add(
  SystemProgram.transfer({
    fromPubkey: derived,
    basePubkey: basePubkey,
    toPubkey: Keypair.generate().publicKey, // create a random receiver
    lamports: 0.01 * LAMPORTS_PER_SOL,
    seed: seed,
    programId: programId,
  })
);
console.log(
  `txhash: ${await sendAndConfirmTransaction(connection, tx, [feePayer, base])}`
);

```

:::info
Only an account owned by system program can transfer via system program.

**贴士**
只有由系统程序拥有的账户才能通过系统程序进行转账。
:::

## 如何创建PDA

[程序派生地址/Program derived address(PDA)](https://docs.solana.com/developing/programming-model/calling-between-programs#program-derived-addresses) 与普通地址相比具有以下区别：

1. 不在ed25519曲线上
2. 使用程序进行签名，而不是使用私钥



:::info
**注意**: PDA账户只能在程序上创建，地址可以在客户端创建。

**贴士**
尽管PDA是由程序ID派生的，但这并不意味着PDA归属于相同的程序。（举个例子，你可以将PDA初始化为代币账户，这是一个由代币程序拥有的账户）
:::

### 生成一个PDA

`findProgramAddress`会在你的种子末尾添加一个额外的字节。它从255递减到0，并返回第一个不在ed25519曲线上的公钥。如果您传入相同的程序ID和种子，您将始终获得相同的结果。


```typescript
// typescript
import { PublicKey } from "@solana/web3.js";

(async () => {
  const programId = new PublicKey(
    "G1DCNUQTSGHehwdLCAmRyAG8hf51eCHrLNUqkgGKYASj"
  );

  let [pda, bump] = await PublicKey.findProgramAddress(
    [Buffer.from("test")],
    programId
  );
  console.log(`bump: ${bump}, pubkey: ${pda.toBase58()}`);
  // you will find the result is different from `createProgramAddress`.
  // It is expected because the real seed we used to calculate is ["test" + bump]
})();
```

```rust
// rust
use solana_program::pubkey::Pubkey;
use std::str::FromStr;

fn main() {
    let program_id = Pubkey::from_str("G1DCNUQTSGHehwdLCAmRyAG8hf51eCHrLNUqkgGKYASj").unwrap();

    let (pda, bump_seed) = Pubkey::find_program_address(&[b"test"], &program_id);
    println!("pda: {}, bump: {}", pda, bump_seed);
}
```


### 创建一个PDA

以下是一个创建由程序拥有的PDA账户的示例程序，以及一个使用客户端调用该程序的示例。

#### 程序

下面是一个示例，展示了使用`system_instruction::create_account`创建一个具有预分配数据大小为`space`、预支付`rent_lamports`数量的lamports的PDA账户的单条指令。该指令使用PDA进行签名，并使用`invoke_signed`进行调用，与前面讨论的类似。



```rust
// rust
invoke_signed(
    &system_instruction::create_account(
        &payer_account_info.key,
        &pda_account_info.key,
        rent_lamports,
        space.into(),
        program_id
    ),
    &[
        payer_account_info.clone(),
        pda_account_info.clone()
    ],
    &[&[&payer_account_info.key.as_ref(), &[bump]]]
)?;

```


#### 客户端

```typescript
// typescript
let tx = new Transaction().add(
  new TransactionInstruction({
    keys: [
      {
        pubkey: feePayer.publicKey,
        isSigner: true,
        isWritable: true,
      },
      {
        pubkey: pda,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: SYSVAR_RENT_PUBKEY,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: SystemProgram.programId,
        isSigner: false,
        isWritable: false,
      },
    ],
    data: Buffer.from(new Uint8Array([data_size, bump])),
    programId: programId,
  })
);

console.log(`txhash: ${await connection.sendTransaction(tx, [feePayer])}`);

```


## 如何使用PDA签名

PDAs只能在程序内部进行签名。以下是使用PDA进行签名的程序示例，并使用客户端调用该程序的示例。

### 程序

以下示例展示了一个单个指令，用于从由种子`escrow`派生的 PDA 转账 SOL 到指定的账户。使用 `invoke_signed` 函数来使用 PDA 签名。


```rust
// rust
invoke_signed(
    &system_instruction::transfer(
        &pda_account_info.key,
        &to_account_info.key,
        100_000_000, // 0.1 SOL
    ),
    &[
        pda_account_info.clone(),
        to_account_info.clone(),
        system_program_account_info.clone(),
    ],
    &[&[b"escrow", &[bump_seed]]],
)?;

```


### 客户端


```typescript
// typescript
let tx = new Transaction().add(
  new TransactionInstruction({
    keys: [
      {
        pubkey: pda,
        // Leave `false` here although we need a pda as a signer.
        // It will be escalated on program if we use invoke_signed.
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: to.publicKey,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: SystemProgram.programId,
        isSigner: false,
        isWritable: false,
      },
    ],
    data: Buffer.from(new Uint8Array([bump])),
    programId: programId,
  })
);

console.log(`txhash: ${await connection.sendTransaction(tx, [feePayer])}`);

```


## 如何获取程序账户

返回所有由程序拥有的账户。请参考 [指南部分](../guides/get-program-accounts.md) ，获取有关`getProgramAccounts`及其配置的更多信息。


```typescript
// typescript
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";

(async () => {
  const MY_PROGRAM_ID = new PublicKey(
    "6a2GdmttJdanBkoHt7f4Kon4hfadx4UTUgJeRkCaiL3U"
  );
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  const accounts = await connection.getProgramAccounts(MY_PROGRAM_ID);

  console.log(`Accounts for program ${MY_PROGRAM_ID}: `);
  console.log(accounts);

  /*
  // Output

  Accounts for program 6a2GdmttJdanBkoHt7f4Kon4hfadx4UTUgJeRkCaiL3U:
  [
    {
      account: {
        data: <Buffer 60 06 66 ca 2c 1d c7 85 04 00 00 00 00 00 00 00 05 00 00 00 00 00 00 00 fc>,
        executable: false,
        lamports: 1064880,
        owner: [PublicKey],
        rentEpoch: 228
      },
      pubkey: PublicKey {
        _bn: <BN: 82fc5b91154dc5c840cb464ba6a89212d0fd789367c0a1488fb1941d78f9727a>
      }
    },
    {
      account: {
        data: <Buffer 60 06 66 ca 2c 1d c7 85 03 00 00 00 00 00 00 00 04 00 00 00 00 00 00 00 fd>,
        executable: false,
        lamports: 1064880,
        owner: [PublicKey],
        rentEpoch: 229
      },
      pubkey: PublicKey {
        _bn: <BN: 404dc1fe368cf194f20cf3c681a071c61893ced98f65cda12ba5a147e984e669>
      }
    }
  ]
  */
})();
```


```rust
use solana_client::rpc_client::RpcClient;
use solana_program::pubkey::Pubkey;
use solana_sdk::commitment_config::CommitmentConfig;
use std::str::FromStr;

fn main() {
    let rpc_url = String::from("https://api.devnet.solana.com");
    let connection = RpcClient::new_with_commitment(rpc_url, CommitmentConfig::confirmed());

    let program_id = Pubkey::from_str("6a2GdmttJdanBkoHt7f4Kon4hfadx4UTUgJeRkCaiL3U").unwrap();
    let accounts = connection.get_program_accounts(&program_id).unwrap();

    println!("accounts for {}, {:?}", program_id, accounts);
}
```

```bash
curl https://api.devnet.solana.com -X POST -H "Content-Type: application/json" -d '
 {"jsonrpc":"2.0", "id":1, "method":"getProgramAccounts", "params":["6a2GdmttJdanBkoHt7f4Kon4hfadx4UTUgJeRkCaiL3U"]}
'

# Output
# {"jsonrpc":"2.0","result":[{"account":{"data":"fe2kiXpgfrjWQjCPX3n5MB339Ayqav75ej","executable":false,"lamports":1064880,"owner":"6a2GdmttJdanBkoHt7f4Kon4hfadx4UTUgJeRkCaiL3U","rentEpoch":228},"pubkey":"9pKBrUtJU9GNmct6T2BQtiKqvubtjS9D2if2bm1P8TQd"},{"account":{"data":"fe2kiXpgfrjVs7hiZJNVFsbJUuhXhFx3pQ","executable":false,"lamports":1064880,"owner":"6a2GdmttJdanBkoHt7f4Kon4hfadx4UTUgJeRkCaiL3U","rentEpoch":229},"pubkey":"5L1rztbopmgGMWPKb2efoGyhGnrBJm6K53Hf9S4nxdHr"}],"id":1}
```

## 如何关闭账户

你可以通过移除账户中的所有 SOL（以擦除所有存储数据的方式）来关闭一个账户。（你可以参考[rent](https://docs.solana.com/developing/programming-model/accounts#rent)来了解更多信息。）

#### 程序


```rust
// rust
let dest_starting_lamports = dest_account_info.lamports();
**dest_account_info.lamports.borrow_mut() = dest_starting_lamports
    .checked_add(source_account_info.lamports())
    .unwrap();
**source_account_info.lamports.borrow_mut() = 0;

let mut source_data = source_account_info.data.borrow_mut();
source_data.fill(0);

```

#### 客户端


```typescript
// typescript
// 1. create an account to your program
let createNewAccountTx = new Transaction().add(
  SystemProgram.createAccount({
    fromPubkey: feePayer.publicKey,
    newAccountPubkey: newAccount.publicKey,
    lamports: 1e8, // 0.1 SOL
    space: 10, // a random value
    programId: programId,
  })
);

// 2. close your account
let closeAccountTx = new Transaction().add(
  new TransactionInstruction({
    keys: [
      {
        pubkey: newAccount.publicKey,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: feePayer.publicKey,
        isSigner: false,
        isWritable: true,
      },
    ],
    programId: programId,
  })
);

```


## 如何获取账户余额


```typescript
console.log(`${(await connection.getBalance(wallet)) / LAMPORTS_PER_SOL} SOL`);
```

```python
client = Client("https://api.devnet.solana.com")

key_pair = Keypair()
public_key = key_pair.pubkey()

client.get_balance(public_key)
```

```cpp
Connection connection("https://api.devnet.solana.com");

auto key_pair = Keypair::generate();
auto public_key = key_pair.public_key;

uint64_t balance = connection.get_balance(public_key).unwrap();
```

```rust
connection.get_balance(&wallet).unwrap();
```

:::info
如果你想获取代币余额，你需要知道代币账户的地址。如果像了解更多信息，请参考Token References。
:::
