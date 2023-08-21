---
sidebar_position: 126
sidebar_label: 课后练习
sidebar_class_name: green
---

# 课后练习


实现一个 DApp 页面，实现代币创建，并按白名单发送空投

提示：

- 通过与 `Token program`交互，创建代币
- 通过与 `Token program` 交互，给白名单中的地址，发送 `SPL Token` 代币
- 建议使用 `SPL-Token` 提供的库来构建 `instruction`

---

## 思路

### 创建代币

首先要构造一个 `MintAccount`:

```ts
mintKeypair = Keypair.generate();
```

然后创建一个创建这个 `MintAccount` 的指令，我们借助系统指令库

```ts
SystemProgram.createAccount({
  fromPubkey: publicKey,
  newAccountPubkey: mintKeypair.publicKey,
  space: MINT_SIZE,
  lamports:lamports,
  programId: TOKEN_PROGRAM_ID,
}),
```

这里 `from` 是付费人，`new` 是要创建的地址，`space` 是 `data` 的大小，因为我们要放 `MintAccount` 其为 `spl-token` 库里的定义

`lamports` 我们通过 库提供的`const lamports = await getMinimumBalanceForRentExemptMint(connection);`来获得一个 `Account` 对应这个大小的存储空间的最小的 `rent` 花费。

接着创建 创建 `token` 的指令：

```ts
createInitializeMint2Instruction(
    mintKeypair.publicKey,
    9,
    publicKey,
    publicKey,
    TOKEN_PROGRAM_ID
)
```

这里依次是创建的 `MintAccount`,精度，`mintAuthority`，`freezeAuthority` 以及 `Token Program`地址。

最后就是按照我们前面课程中的方式构造交易并发送。

这里要注意，因为我们创建了新的 `MintAccount`，其内容修改需要签名，因此在发送交易的时候，带上：

```ts
const signature = await sendTransaction(trx, connection, {
      minContextSlot,
      signers:[mintKeypair],
    });
```

### Mint Token

要 `mint token`，先要生成 `ata` 账号地址，`spl token` 的库里面有函数。

```ts
ataAccount = await getAssociatedTokenAddressSync(
      mintKeypair.publicKey,
      owner,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );
```

依次传入 `MintAccount`，为谁创建，后三个参数固定这样传即可。

然后判断这个 `account` 是否存在，可以用我们前面 rpc 的 `getaccount`,这里库也封装了函数

```ts
await getAccount(connection, ataAccount);
```

没有的时候，会抛异常，我们要创建这个 `ATA` 账号

```ts
txInstructions.push(
    createAssociatedTokenAccountInstruction(
        publicKey,
        ataAccount,
        owner,
        mintKeypair.publicKey,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
    )
);
```


调用库里的 `createAssociatedTokenAccountInstruction` 创建指令，依次传入付费的人，上面的 `ata` 账号，为谁创建以及 `MintAccount`。

如果存在则跳过

最后执行 `Mint`:

```ts
txInstructions.push(
  createMintToInstruction(
    mintKeypair.publicKey,
    ataAccount,
    publicKey,
    BigInt(toCount)
  )
);
```

调用库函数 `createMintToInstruction` 传入 `MintAccount`，`ata` 账号以及 `MintAuthority`，因为只有他才有权限 `mint`，和数量。

然后就是跟前面一样，构造交易并发送。注意这次没有额外的 `singer` 要求了。

## 参考实现

[spl token exercise](https://www.solanazh.com/assets/files/spl-token-exercise.zip)
