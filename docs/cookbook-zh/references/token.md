# 代币

## 我需要什么才能开始使用SPL代币？

每当你在Solana上与代币进行交互时，实际上你正在与Solana程序库代币（SPL-Token）或SPL代币标准交互。SPL代币标准需要使用特定的库，你可以根据你使用的编程语言在下面找到相应的库。

```typescript
// typescript
"@solana/spl-token": "^0.2.0"
```


## 如何创建一个新的代币

创建代币是通过创建所谓的“铸币账户”来完成的。这个铸币账户随后用于向用户的代币账户铸造代币。


```typescript
// typescript
// 1) use build-in function
let mintPubkey = await createMint(
  connection, // conneciton
  feePayer, // fee payer
  alice.publicKey, // mint authority
  alice.publicKey, // freeze authority (you can use `null` to disable it. when you disable it, you can't turn it on again)
  8 // decimals
);

// or

// 2) compose by yourself
let tx = new Transaction().add(
  // create mint account
  SystemProgram.createAccount({
    fromPubkey: feePayer.publicKey,
    newAccountPubkey: mint.publicKey,
    space: MINT_SIZE,
    lamports: await getMinimumBalanceForRentExemptMint(connection),
    programId: TOKEN_PROGRAM_ID,
  }),
  // init mint account
  createInitializeMintInstruction(
    mint.publicKey, // mint pubkey
    8, // decimals
    alice.publicKey, // mint authority
    alice.publicKey // freeze authority (you can use `null` to disable it. when you disable it, you can't turn it on again)
  )
);

```

## 如何获得一个代币铸币账户

为了获得代币的当前供应量、授权信息或小数位数，你需要获取代币铸币账户的账户信息。

```typescript
// typescript
let mintAccount = await getMint(connection, mintAccountPublicKey);

```

## 如何创建一个代币账户

用户需要一个代币账户来持有代币。

对于用户所拥有的每种类型的代币，他们将至少拥有一个代币账户。

关联代币账户(Associated Token Accounts, ATA) 是根据每个密钥对确定性地创建的账户。关联代币账户是管理代币账户的推荐方法。


```typescript
// typescript
// 1) use build-in function
{
  let ata = await createAssociatedTokenAccount(
    connection, // connection
    feePayer, // fee payer
    mintPubkey, // mint
    alice.publicKey // owner,
  );
}

// or

// 2) composed by yourself
{
  let tx = new Transaction().add(
    createAssociatedTokenAccountInstruction(
      feePayer.publicKey, // payer
      ata, // ata
      alice.publicKey, // owner
      mintPubkey // mint
    )
  );
}

```


## 如何获得一个代币账户

每个代币账户都包含有关代币的信息，例如所有者、铸币账户、数量（余额）和小数位数。


```typescript
// typescript
let tokenAccount = await getAccount(connection, tokenAccountPubkey);

```


## 如何获得一个代币账户的余额

每个代币账户都包含有关代币的信息，例如所有者、铸币账户、数量（余额）和小数位数。


```typescript
// typescript
let tokenAmount = await connection.getTokenAccountBalance(tokenAccount);

```


> **贴士**
>
> 一个代币账户只能持有一种铸币。当您指定一个代币账户时，您也需要指定一个铸币。

## 如何铸造(mint)代币

当你铸造代币时，你会增加供应量并将新代币转移到特定的代币账户。


```typescript
// typescript
// 1) use build-in function
{
  let txhash = await mintToChecked(
    connection, // connection
    feePayer, // fee payer
    mintPubkey, // mint
    tokenAccountPubkey, // receiver (sholud be a token account)
    alice, // mint authority
    1e8, // amount. if your decimals is 8, you mint 10^8 for 1 token.
    8 // decimals
  );
}

// or

// 2) compose by yourself
{
  let tx = new Transaction().add(
    createMintToCheckedInstruction(
      mintPubkey, // mint
      tokenAccountPubkey, // receiver (sholud be a token account)
      alice.publicKey, // mint authority
      1e8, // amount. if your decimals is 8, you mint 10^8 for 1 token.
      8 // decimals
      // [signer1, signer2 ...], // only multisig account will use
    )
  );
}

```

## 如何转移代币

你可以将代币从一个代币账户转移到另一个代币账户。


```typescript
// typescript
// 1) use build-in function
{
  let txhash = await transferChecked(
    connection, // connection
    feePayer, // payer
    tokenAccountXPubkey, // from (should be a token account)
    mintPubkey, // mint
    tokenAccountYPubkey, // to (should be a token account)
    alice, // from's owner
    1e8, // amount, if your deciamls is 8, send 10^8 for 1 token
    8 // decimals
  );
}

// or

// 2) compose by yourself
{
  let tx = new Transaction().add(
    createTransferCheckedInstruction(
      tokenAccountXPubkey, // from (should be a token account)
      mintPubkey, // mint
      tokenAccountYPubkey, // to (should be a token account)
      alice.publicKey, // from's owner
      1e8, // amount, if your deciamls is 8, send 10^8 for 1 token
      8 // decimals
    )
  );
}

```

## 如何销代币

如果你是代币的所有者，你可以销毁代币。

```typescript
// typescript
// 1) use build-in function
{
  let txhash = await burnChecked(
    connection, // connection
    feePayer, // payer
    tokenAccountPubkey, // token account
    mintPubkey, // mint
    alice, // owner
    1e8, // amount, if your deciamls is 8, 10^8 for 1 token
    8
  );
}

// or

// 2) compose by yourself
{
  let tx = new Transaction().add(
    createBurnCheckedInstruction(
      tokenAccountPubkey, // token account
      mintPubkey, // mint
      alice.publicKey, // owner of token account
      1e8, // amount, if your deciamls is 8, 10^8 for 1 token
      8 // decimals
    )
  );
}

```


## 如何关闭代币账户

如果你不再需要使用某个代币账户，你可以关闭它。有两种情况：

1. 包装的 SOL（Wrapped SOL）- 关闭操作会将包装的 SOL 转换为 SOL。
2. 其他代币（Other Tokens）- 只有当代币账户的余额为0时，你才能关闭它。

```typescript
// typescript
// 1) use build-in function
{
  let txhash = await closeAccount(
    connection, // connection
    feePayer, // payer
    tokenAccountPubkey, // token account which you want to close
    alice.publicKey, // destination
    alice // owner of token account
  );
}

// or

// 2) compose by yourself
{
  let tx = new Transaction().add(
    createCloseAccountInstruction(
      tokenAccountPubkey, // token account which you want to close
      alice.publicKey, // destination
      alice.publicKey // owner of token account
    )
  );
}

```

## 如何在代币账户或铸币账户上设置权限

你可以设置/更新权限。有四种类型：

1. MintTokens（铸币账户）：用于控制在铸币账户上铸造代币的权限。
2. FreezeAccount（铸币账户）：用于冻结或解冻铸币账户的权限。
3. AccountOwner（代币账户）：用于控制代币账户所有权的权限。
4. CloseAccount（代币账户）：用于关闭代币账户的权限。


```typescript
// typescript
// 1) use build-in function
{
  let txhash = await setAuthority(
    connection, // connection
    feePayer, // payer
    mintPubkey, // mint account || token account
    alice, // current authority
    AuthorityType.MintTokens, // authority type
    randomGuy.publicKey // new authority (you can pass `null` to close it)
  );
}

// or

// 2) compose by yourself
{
  let tx = new Transaction().add(
    createSetAuthorityInstruction(
      mintPubkey, // mint acocunt || token account
      alice.publicKey, // current auth
      AuthorityType.MintTokens, // authority type
      randomGuy.publicKey // new auth (you can pass `null` to close it)
    )
  );
}

```


## 如何批准代币委托

你可以设置一个委托代理，并指定一个允许的代币数量。设置后，委托代理就像代币账户的另一个所有者。一个代币账户在同一时间只能委托给一个账户。


```typescript
// typescript
// 1) use build-in function
{
  let txhash = await approveChecked(
    connection, // connection
    feePayer, // fee payer
    mintPubkey, // mint
    tokenAccountPubkey, // token account
    randomGuy.publicKey, // delegate
    alice, // owner of token account
    1e8, // amount, if your deciamls is 8, 10^8 for 1 token
    8 // decimals
  );
}
// or

// 2) compose by yourself
{
  let tx = new Transaction().add(
    createApproveCheckedInstruction(
      tokenAccountPubkey, // token account
      mintPubkey, // mint
      randomGuy.publicKey, // delegate
      alice.publicKey, // owner of token account
      1e8, // amount, if your deciamls is 8, 10^8 for 1 token
      8 // decimals
    )
  );
}

```
## 如何撤销代币委托

撤销操作将把代币委托设置为空，并将委托的代币数量设置为0。


```typescript
// typescript
// 1) use build-in function
{
  let txhash = await revoke(
    connection, // connection
    feePayer, // payer
    tokenAccountPubkey, // token account
    alice // owner of token account
  );
}

// or

// 2) compose by yourself
{
  let tx = new Transaction().add(
    createRevokeInstruction(
      tokenAccountPubkey, // token account
      alice.publicKey // owner of token account
    )
  );
}

```


## 如何管理包装的SOL

包装的 SOL与其他代币铸币类似，区别在于使用 `syncNative` 并在 `NATIVE_MINT` 地址上专门创建代币账户。

### 创建代币账户

与 [创建代币账户](#create-token-account) 但将mint替换为`NATIVE_MINT`。

```js
import { NATIVE_MINT } from "@solana/spl-token";
```

### 增加余额

有两种方法可以增加包装的 SOL 的余额：

#### 1. 通过 SOL 转账方式

```typescript
// typescript
let tx = new Transaction().add(
  // trasnfer SOL
  SystemProgram.transfer({
    fromPubkey: alice.publicKey,
    toPubkey: ata,
    lamports: amount,
  }),
  // sync wrapped SOL balance
  createSyncNativeInstruction(ata)
);

```


#### 2. 通过代币转账方式


```typescript
// typescript
let tx = new Transaction().add(
  // create token account
  SystemProgram.createAccount({
    fromPubkey: alice.publicKey,
    newAccountPubkey: auxAccount.publicKey,
    space: ACCOUNT_SIZE,
    lamports:
      (await getMinimumBalanceForRentExemptAccount(connection)) + amount, // rent + amount
    programId: TOKEN_PROGRAM_ID,
  }),
  // init token account
  createInitializeAccountInstruction(
    auxAccount.publicKey,
    NATIVE_MINT,
    alice.publicKey
  ),
  // transfer WSOL
  createTransferInstruction(auxAccount.publicKey, ata, alice.publicKey, amount),
  // close aux account
  createCloseAccountInstruction(
    auxAccount.publicKey,
    alice.publicKey,
    alice.publicKey
  )
);

```

## 如何通过所有者获取所有代币账户

你可以通过所有者获取代币账户。有两种方法可以实现。

1. 获取所有代币账户

```typescript
// typescript
let response = await connection.getParsedTokenAccountsByOwner(owner, {
  programId: TOKEN_PROGRAM_ID,
});

```


2. 按照铸币进行过滤

```typescript
// typescript
let response = await connection.getParsedTokenAccountsByOwner(owner, {
  mint: mint,
});
```
