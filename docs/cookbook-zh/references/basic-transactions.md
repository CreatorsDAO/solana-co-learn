# 发送交易

## 如何发送SOL

要发送SOL，你需要与[SystemProgram][1] 交互。


```typescript
// typescript
const transferTransaction = new Transaction().add(
  SystemProgram.transfer({
    fromPubkey: fromKeypair.publicKey,
    toPubkey: toKeypair.publicKey,
    lamports: lamportsToSend,
  })
);

await sendAndConfirmTransaction(connection, transferTransaction, [fromKeypair]);

```

```python
// python
transaction = Transaction().add(transfer(TransferParams(
    from_pubkey=sender.pubkey(),
    to_pubkey=receiver.pubkey(),
    lamports=1_000_000)
))

client.send_transaction(transaction, sender)


```

```wallet-adapter
// wallet-adapter
const transaction = new Transaction().add(
  SystemProgram.transfer({
    fromPubkey: publicKey,
    toPubkey: Keypair.generate().publicKey,
    lamports: 1_000_000,
  })
);

const signature = await sendTransaction(transaction, connection);

await connection.confirmTransaction(signature, "processed");

```

```rust
// rust
system_instruction::transfer(&from, &to, lamports_to_send);

```

```bash
// cli
solana transfer --from <KEYPAIR> <RECIPIENT_ACCOUNT_ADDRESS> 0.001 --allow-unfunded-recipient --url https://api.devnet.solana.com --fee-payer <KEYPAIR>

```
[1]: https://docs.solana.com/developing/runtime-facilities/programs#system-program

## 如何发送SPL-代币

使用 [Token Program][1] 来转移SPL代币。为了发送SPL代币，你需要知道它的SPL代币账户地址。你可以使用以下示例来获取地址并发送代币。


```typescript
// typescript
// Add token transfer instructions to transaction
const transaction = new web3.Transaction().add(
  splToken.Token.createTransferInstruction(
    splToken.TOKEN_PROGRAM_ID,
    fromTokenAccount.address,
    toTokenAccount.address,
    fromWallet.publicKey,
    [],
    1
  )
);

// Sign transaction, broadcast, and confirm
await web3.sendAndConfirmTransaction(connection, transaction, [fromWallet]);

```

```ts
// wallet-adapter
const transaction = new Transaction().add(
  Token.createTransferInstruction(
    TOKEN_PROGRAM_ID,
    fromTokenAccount.address,
    toTokenAccount.address,
    fromWallet.publicKey,
    [],
    1
  )
);

const signature = await sendTransaction(transaction, connection);

await connection.confirmTransaction(signature, "processed");

```


```bash
// cli
$ spl-token transfer AQoKYV7tYpTrFZN6P5oUufbQKAUr9mNYGe1TTJC9wajM 50 vines1vzrYbzLMRdu58ou5XTby4qAqVRLmqo36NKPTg
Transfer 50 tokens
  Sender: 7UX2i7SucgLMQcfZ75s3VXmZZY4YRUyJN9X1RgfMoDUi
  Recipient: vines1vzrYbzLMRdu58ou5XTby4qAqVRLmqo36NKPTg
  Recipient associated token account: F59618aQB8r6asXeMcB9jWuY6NEx1VduT9yFo1GTi1ks

Signature: 5a3qbvoJQnTAxGPHCugibZTbSu7xuTgkxvF4EJupRjRXGgZZrnWFmKzfEzcqKF2ogCaF4QKVbAtuFx7xGwrDUcGd

```

[1]: https://spl.solana.com/token

## 如何计算交易成本

交易所需的签名数量用于计算交易成本。只要你不是创建账户，这将是最终的交易成本。如果想了解创建账户的成本，请参考 [计算租金豁免](accounts.md#calculating-rent-exemption)

下面的两个示例展示了目前可用于计算估计交易成本的两种方法。

第一个示例使用了`Transaction`类上的新方法`getEstimatedFee`，而第二个示例使用了`Connection`类上的`getFeeForMessage`来替代`getFeeCalculatorForBlockhash`。

### getEstimatedFee


```typescript
// typescript
const recentBlockhash = await connection.getLatestBlockhash();

const transaction = new Transaction({
  recentBlockhash: recentBlockhash.blockhash,
}).add(
  SystemProgram.transfer({
    fromPubkey: payer.publicKey,
    toPubkey: payee.publicKey,
    lamports: 10,
  })
);

const fees = await transaction.getEstimatedFee(connection);
console.log(`Estimated SOL transfer cost: ${fees} lamports`);
// Estimated SOL transfer cost: 5000 lamports

```


### getFeeForMessage

```typescript
// typescript
const message = new Message(messageParams);

const fees = await connection.getFeeForMessage(message);
console.log(`Estimated SOL transfer cost: ${fees.value} lamports`);
// Estimated SOL transfer cost: 5000 lamports
```


## 如何向交易添加备注

任何交易都可以利用 [备注程序 （memo program）][2].
添加消息。目前，备注程序的`programID`必须手动添加为`MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr`。


```typescript
// typescript
const transferTransaction = new Transaction().add(
  SystemProgram.transfer({
    fromPubkey: fromKeypair.publicKey,
    toPubkey: toKeypair.publicKey,
    lamports: lamportsToSend,
  })
);

await transferTransaction.add(
  new TransactionInstruction({
    keys: [{ pubkey: fromKeypair.publicKey, isSigner: true, isWritable: true }],
    data: Buffer.from("Data to send in transaction", "utf-8"),
    programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
  })
);

await sendAndConfirmTransaction(connection, transferTransaction, [fromKeypair]);

```

```typescript
// wallet-adapter
const transaction = new Transaction().add(
  SystemProgram.transfer({
    fromPubkey: publicKey,
    toPubkey: Keypair.generate().publicKey,
    lamports: 10,
  })
);

await transaction.add(
  new TransactionInstruction({
    keys: [{ pubkey: publicKey, isSigner: true, isWritable: true }],
    data: Buffer.from("Data to send in transaction", "utf-8"),
    programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
  })
);

const signature = await sendTransaction(transaction, connection);

await connection.confirmTransaction(signature, "processed");

```


```bash
// cli
solana transfer --from <KEYPAIR> <RECIPIENT_ACCOUNT_ADDRESS> 0.5 --allow-unfunded-recipient --url https://api.devnet.solana.com --fee-payer <KEYPAIR> --with-memo <MEMO>
```


## 如何更改交易的计算预算、费用和优先级
交易（TX）的优先级是通过支付优先级费用（Prioritization Fee）来实现的，此外还需要支付基本费用（Base Fee）。默认情况下，计算预算是200,000个计算单元（Compute Units，CU）与指令数的乘积，最大为1.4M CU。基本费用是5,000个Lamport。一个微型Lamport等于0.000001个Lamport。

要更改单个交易的总计算预算或优先级费用，可以通过添加ComputeBudgetProgram的指令来实现。

使用`ComputeBudgetProgram.setComputeUnitPrice({ microLamports: number })`可以在基本费用（5,000个Lamport）之上添加优先级费用。microLamports参数提供的值将与计算预算的CU数相乘，以确定优先级费用（以Lamport为单位）。例如，如果您的计算预算为1M CU，然后添加1个microLamport/CU，优先级费用将为1个Lamport（1M * 0.000001）。总费用将为5001个Lamport。

使用`ComputeBudgetProgram.setComputeUnitLimit({ units: number })`来设置新的计算预算。提供的值将替换默认值。交易应该请求执行所需的最小数量的CU，以最大化吞吐量或最小化费用。


```typescript
// typescript
const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
  units: 1000000
});

const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
  microLamports: 1
});

const transaction = new Transaction()
.add(modifyComputeUnits)
.add(addPriorityFee)
.add(
    SystemProgram.transfer({
      fromPubkey: payer.publicKey,
      toPubkey: toAccount,
      lamports: 10000000,
    })
  );

```



```rust
// rust
let txn = submit_transaction(
  &connection,
  &wallet_signer,
  // Array of instructions: 0: Set Compute Unit Limt, 1: Set Prioritization Fee,
  // 2: Do something, 3: Do something else
  [ComputeBudgetInstruction::set_compute_unit_limit(1_000_000u32),
  ComputeBudgetInstruction::set_compute_unit_price(1u32),
  Instruction::new_with_borsh(PROG_KEY, &0u8, accounts.to_vec()),
  Instruction::new_with_borsh(PROG_KEY, &0u8, accounts.to_vec())].to_vec(),
)?;

```


程序日志示例 ( [Explorer](https://explorer.solana.com/tx/2mNPXeoy3kFxo12L8avsEoep65S4Ehvw2sheduDrAXbmmNJwTtXNmUrb5MM3s15eki2MWSQrwyKGAUQFZ9wAGo9K/) ):

```bash
// cli
[ 1] Program ComputeBudget111111111111111111111111111111 invoke [1]
[ 2] Program ComputeBudget111111111111111111111111111111 success
[ 3]
[ 4] Program ComputeBudget111111111111111111111111111111 invoke [1]
[ 5] Program ComputeBudget111111111111111111111111111111 success
```


[2]: https://spl.solana.com/memo
