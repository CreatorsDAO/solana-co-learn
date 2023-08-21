---
sidebar_position: 125
sidebar_label: Program 调用
sidebar_class_name: green
---

# `Program` 调用

在前面的例子中，我们通过 `web3.js` 提供的 `SystemProgram` 来帮助我们实现了转账的功能。

但是对于一个陌生的`Program`，我们要怎么来发起调用请求呢？

## Program的入口

这里我们以 `SPL Token Program`来举例。`SPL Token Program`类似 web3.js 一样，其实已经封装好了一套 JS 库给我们来直接使用。这里我们不使用库，而以一个前端的身份，来看这样的一个`Program`，我们要怎么来交互。

我们以 `transfer` 函数作为例子。

首先要理解`Program`的作用和参数，这个可以跟`Program`开发去沟通。比如我们从注释了解到 `transfer` 为

```rs
/// Transfers tokens from one account to another either directly or via a
/// delegate.  If this account is associated with the native mint then equal
/// amounts of SOL and Tokens will be transferred to the destination
/// account.
///
/// Accounts expected by this instruction:
///
///   * Single owner/delegate
///   0. `[writable]` The source account.
///   1. `[writable]` The destination account.
///   2. `[signer]` The source account's owner/delegate.
///
///   * Multisignature owner/delegate
///   0. `[writable]` The source account.
///   1. `[writable]` The destination account.
///   2. `[]` The source account's multisignature owner/delegate.
///   3. ..3+M `[signer]` M signer accounts.
Transfer {
    /// The amount of tokens to transfer.
    amount: u64,
},
```

总共需要 3 个`key`，分别是，发送方，接收方以及发送方的 `ower/delegate`。然后有一个类型 `u64`的参数。

知道了这些我们才可以构造我们的 `Instruction`。`Instruction` 的定义为：


```ts
/**
* Transaction Instruction class
*/
export class TransactionInstruction {
    /**
    * Public keys to include in this transaction
    * Boolean represents whether this pubkey needs to sign the transaction
    */
    keys: Array<AccountMeta>;
    /**
    * Program Id to execute
    */
    programId: PublicKey;
    /**
    * Program input
    */
    data: Buffer;
    constructor(opts: TransactionInstructionCtorFields);
}
```

所以我们主要就是要从`Program`的定义中知道这里的 `keys` 是什么， `data` 是什么，`programId` 自然就是`Program`的地址。

## 构造 `Instruction`

在上面，我们知道了 `Instruction` 的定义。那么要如何来构造呢？

如果你是用 TypeScript,那么比较醒目。`keys` 是 `AccountMeta` 的数组，`AccountMeta` 的定义为：

```ts
/**
* Account metadata used to define instructions
*/
type AccountMeta = {
    /** An account's public key */
    pubkey: PublicKey;
    /** True if an instruction requires a transaction signature matching `pubkey` */
    isSigner: boolean;
    /** True if the `pubkey` can be loaded as a read-write account. */
    isWritable: boolean;
};
```

总共就三个成员，一个 `PublicKey` 表示 `Account` 的地址， 一个 `isSigner` 表示是否为签名者，说白了就是是不是你自己。以及 `isWritable`，表示这个 `Account` 的 `Data` 部分是否可以修改。

这里 `PublicKey` 的定义为：

```ts
export class PublicKey extends Struct {
    /**
    * Create a new PublicKey object
    * @param value ed25519 public key as buffer or base-58 encoded string
    */
    constructor(value: PublicKeyInitData);

    ...
}

/**
* Value to be converted into public key
*/
type PublicKeyInitData = number | string | Uint8Array | Array<number> | PublicKeyData;
```

其实就是用公钥的字符串就可以进行构造了。

所以如果是用 TypeScript。就严格按照类型来定义就好了。

如果是 Javascript，可以用字典来进行显式初始化：

而 `data` 部分是一个 `Buffer`，其实本质是一段二进制，其格式是根据`Program`来定义的，也可以参考标准，比如"Anchor"。而 `SPL Token` 的二进制定义为：

![](../img/week3/data_bin.png)

这里我们可以借助 `web.js` 提供的"`encodeData`"方法来进行序列化。而 `web3.js` 的指令定义依赖了 solana 提供的 `buffer-layout`，因此需要这样来定义：

这样实际上就是定义了上面的这个序列化的图。当调用`encodeData`方法时，就可以按照这里定义的格式进行序列化了。

## 构造 `Transaction`

有了 `TransactionInstruction` 之后，就可以构造 `Transaction` 了。前面已经说过，现在用的是 `VersionedTransaction`。他的定义为：

```ts
export class VersionedTransaction {
    signatures: Array<Uint8Array>;
    message: VersionedMessage;
    get version(): TransactionVersion;
    constructor(message: VersionedMessage, signatures?: Array<Uint8Array>);
    serialize(): Uint8Array;
    static deserialize(serializedTransaction: Uint8Array): VersionedTransaction;
    sign(signers: Array<Signer>): void;
    addSignature(publicKey: PublicKey, signature: Uint8Array): void;
}
```

可以通过一个 `VesionedMessage` 来构建，定义为：

```ts
type VersionedMessage = Message | MessageV0;
export const VersionedMessage: {
    deserializeMessageVersion(serializedMessage: Uint8Array): 'legacy' | number;
    deserialize: (serializedMessage: Uint8Array) => VersionedMessage;
};
```

`Message` 是为了兼容以前的 `Message`，现在的都是用 `MessageV0`：

```ts
export class MessageV0 {
    header: MessageHeader;
    staticAccountKeys: Array<PublicKey>;
    recentBlockhash: Blockhash;
    compiledInstructions: Array<MessageCompiledInstruction>;
    addressTableLookups: Array<MessageAddressTableLookup>;
    constructor(args: MessageV0Args);
    get version(): 0;
    get numAccountKeysFromLookups(): number;
    getAccountKeys(args?: GetAccountKeysArgs): MessageAccountKeys;
    isAccountSigner(index: number): boolean;
    isAccountWritable(index: number): boolean;
    resolveAddressTableLookups(addressLookupTableAccounts: AddressLookupTableAccount[]): AccountKeysFromLookups;
    static compile(args: CompileV0Args): MessageV0;
    serialize(): Uint8Array;
    private serializeInstructions;
    private serializeAddressTableLookups;
    static deserialize(serializedMessage: Uint8Array): MessageV0;
}
```

看上去超级复杂。因此 `web3.js` 给我们提供了一个简单的方法，通过`TransactionMessage`来构造：

```ts
export class TransactionMessage {
    payerKey: PublicKey;
    instructions: Array<TransactionInstruction>;
    recentBlockhash: Blockhash;
    constructor(args: TransactionMessageArgs);
    static decompile(message: VersionedMessage, args?: DecompileArgs): TransactionMessage;
    compileToLegacyMessage(): Message;
    compileToV0Message(addressLookupTableAccounts?: AddressLookupTableAccount[]): MessageV0;
}
```

其`compileToV0Message`可以转换道得到对应的 `MessageV0`。

因此只需要提供 `TransactionMessageArgs` 即可，其定义为：

```ts
type TransactionMessageArgs = {
    payerKey: PublicKey;
    instructions: Array<TransactionInstruction>;
    recentBlockhash: Blockhash;
};

/**
* Blockhash as Base58 string.
*/
type Blockhash = string;
```
终于到正主了，这里我们看到 `payerKey` 是付 `gas` 人的地址。`instructions` 是我们前面介绍的 `Instruction`。 `recentBlockhash` 是最近的 `Blockhash` 这个不能太久远。可以通过 RPC 进行请求。

这样我们连起来就是：

```ts
const txInstructions =

const message = new TransactionMessage({
  payerKey: this.keypair.publicKey,
  recentBlockhash: latestBlockhash.blockhash,
  instructions: txInstructions
}).compileToV0Message();

const trx = new VersionedTransaction(messageV0);
```

## 构造 `SPL Token` 的 转账交易

前面我们已经搞清楚了 `SPL Token` `Program`转账指令的结构，3 个账号一个数目。账号比较容易。我们自己账号对应的 `SPL Token` 的 `ATA` 账号，对方接收的账号。这两个都是不需要前面的，并且需要修改的。还有个我们自己的 SOL 账号，这个需要签名。

先看下 `Token Program`的 `Transfer` 定义：

```rs
/// Transfers tokens from one account to another either directly or via a
/// delegate.  If this account is associated with the native mint then equal
/// amounts of SOL and Tokens will be transferred to the destination
/// account.
///
/// Accounts expected by this instruction:
///
///   * Single owner/delegate
///   0. `[writable]` The source account.
///   1. `[writable]` The destination account.
///   2. `[signer]` The source account's owner/delegate.
///
///   * Multisignature owner/delegate
///   0. `[writable]` The source account.
///   1. `[writable]` The destination account.
///   2. `[]` The source account's multisignature owner/delegate.
///   3. ..3+M `[signer]` M signer accounts.
Transfer {
    /// The amount of tokens to transfer.
    amount: u64,
},
```

按照上面说的，我们依靠 `web3.js` 提供的 `buffer-layout` 我们来定义这个 `transfer` 的指令。

```ts
export interface TransferInstructionData {
    instruction: TokenInstruction.Transfer;
    amount: bigint;
}

/** TODO: docs */
export const transferInstructionData = struct<TransferInstructionData>([u8('instruction'), u64('amount')]);
```

这里比 Rust 的定义，多了个"`instruction`"，这个是因为 `Token` 的序列化规则，使用一个 `u8` 来表示是那个指令。

定义好指令，我们就可以开始构建了。

按照上面说先构建指令:

```ts
function createTransferInstruction(
    source,
    destination,
    owner,
    amount,
    programId
) {
    const keys = [
            { pubkey: source, isSigner: false, isWritable: true },
            { pubkey: destination, isSigner: false, isWritable: true },
            { pubkey: owner, isSigner:true, isWritable: false}
    ];

    const data = Buffer.alloc(9);
    data.writeUInt8(3);
    const bigAmount = BigInt(amount);
    data.writeBigInt64LE(bigAmount,1)


    return new TransactionInstruction({ keys, programId, data });
}
```

这里的第一个 `byte` 为 3 表示 `transfer` 指令。

然后构建交易：

```ts
const txInstructions = [
  createTransferInstruction(
    ATA_PUBKEY_KEY,
    TO_PUBLIC_KEY,
    publicKey,
    toCount,
    TOKEN_PROGRAM_ID
  ),
];

const {
  context: { slot: minContextSlot },
  value: { blockhash, lastValidBlockHeight },
} = await connection.getLatestBlockhashAndContext();
const messageV0 = new TransactionMessage({
  payerKey: publicKey,
  recentBlockhash: blockhash,
  instructions: txInstructions,
}).compileToV0Message();

const trx = new VersionedTransaction(messageV0);
```

最后利用前面学的通过钱包来发送交易：

```ts
const signature = await sendTransaction(trx, connection, {
  minContextSlot,
});
console.log("signature:", signature);
```

这样我们就完成了通过前端来和特定的`Program`进行交互。

## Demo

[spl token demo](https://www.solanazh.com/assets/files/spl-token-demo.zip)
