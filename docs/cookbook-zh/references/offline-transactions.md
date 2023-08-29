
# 发送离线交易

## 签署交易

要创建离线交易，你需要签署交易，然后任何人都可以在网络上广播它。


```typescript
// typescript
// there are two ways you can recover the tx
// 3.a Recover Tranasction (use populate then addSignauture)
{
  let recoverTx = Transaction.populate(Message.from(realDataNeedToSign));
  recoverTx.addSignature(feePayer.publicKey, Buffer.from(feePayerSignature));
  recoverTx.addSignature(alice.publicKey, Buffer.from(aliceSignature));

  // 4. Send transaction
  console.log(
    `txhash: ${await connection.sendRawTransaction(recoverTx.serialize())}`
  );
}

// or

// 3.b. Recover Tranasction (use populate with signature)
{
  let recoverTx = Transaction.populate(Message.from(realDataNeedToSign), [
    bs58.encode(feePayerSignature),
    bs58.encode(aliceSignature),
  ]);

  // 4. Send transaction
  console.log(
    `txhash: ${await connection.sendRawTransaction(recoverTx.serialize())}`
  );
}

```

## 部分签署交易

当一个交易需要多个签名时，你可以部分签署它。其他签署者随后可以签署并在网络上广播该交易。

以下是一些有用的情况示例：

- 用支付作为交换发送 SPL 代币
- 签署交易以便以后验证其真实性
- 在需要你签名的自定义程序中调用交易

在这个例子中，Bob给Alice发送了一个 SPL 代币，回报Alice的付款：


```typescript
// typescript
// 1. Add an instruction to send the token from Bob to Alice
transaction.add(
  createTransferCheckedInstruction(
    bobTokenAddress, // source
    tokenAddress, // mint
    aliceTokenAccount.address, // destination
    bobKeypair.publicKey, // owner of source account
    1 * 10 ** tokenMint.decimals, // amount to transfer
    tokenMint.decimals // decimals of token
  )
);

// 2. Bob partially signs the transaction
transaction.partialSign(bobKeypair);

// 3. Serialize the transaction without requiring all signatures
const serializedTransaction = transaction.serialize({
  requireAllSignatures: false,
});

// 4. Alice can deserialize the transaction
const recoveredTransaction = Transaction.from(
  Buffer.from(transactionBase64, "base64")
);

```


## 耐久性的 Nonce

`RecentBlockhash`对于交易非常重要。如果你使用一个过期的最近区块哈希（在150个区块后），你的交易将被拒绝。你可以使用耐久性Nonce来获取一个永不过期的最近区块哈希。要触发这种机制，你的交易必须：

1. 使用存储在`nonce`账户中的`nonce`作为最近的区块哈希。
2. 将`nonce advance`操作放在第一个指令中。

### 创建Nonce账户


```typescript
// typescript
let tx = new Transaction().add(
  // create nonce account
  SystemProgram.createAccount({
    fromPubkey: feePayer.publicKey,
    newAccountPubkey: nonceAccount.publicKey,
    lamports: await connection.getMinimumBalanceForRentExemption(
      NONCE_ACCOUNT_LENGTH
    ),
    space: NONCE_ACCOUNT_LENGTH,
    programId: SystemProgram.programId,
  }),
  // init nonce account
  SystemProgram.nonceInitialize({
    noncePubkey: nonceAccount.publicKey, // nonce account pubkey
    authorizedPubkey: nonceAccountAuth.publicKey, // nonce account authority (for advance and close)
  })
);

console.log(
  `txhash: ${await connection.sendTransaction(tx, [feePayer, nonceAccount])}`
);

```


### 获取Nonce账户


```typescript
// typescript
let accountInfo = await connection.getAccountInfo(nonceAccountPubkey);
let nonceAccount = NonceAccount.fromAccountData(accountInfo.data);

```


### 使用Nonce账户

```typescript
// typescript
let tx = new Transaction().add(
  // nonce advance must be the first insturction
  SystemProgram.nonceAdvance({
    noncePubkey: nonceAccountPubkey,
    authorizedPubkey: nonceAccountAuth.publicKey,
  }),
  // after that, you do what you really want to do, here we append a transfer instruction as an example.
  SystemProgram.transfer({
    fromPubkey: feePayer.publicKey,
    toPubkey: nonceAccountAuth.publicKey,
    lamports: 1,
  })
);
// assign `nonce` as recentBlockhash
tx.recentBlockhash = nonceAccount.nonce;
tx.feePayer = feePayer.publicKey;
tx.sign(
  feePayer,
  nonceAccountAuth
); /* fee payer + nonce account authority + ... */

console.log(`txhash: ${await connection.sendRawTransaction(tx.serialize())}`);

```
