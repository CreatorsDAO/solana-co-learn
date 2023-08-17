---
sidebar_position: 88
sidebar_label:  🐹 Anchor到Typescript
sidebar_class_name: green
---

# 🐹 Anchor到Typescript

要使用前端与程序进行交互，我们需要创建一个 `Anchor` `Program` 对象。

 `Program` 对象提供了一个自定义的`API`，通过结合程序 `IDL` 和 `Provider` 来与特定程序进行交互。

 创建 `Program` 对象，我们需要以下内容：

 - `Connection` - 集群连接
 - `Wallet` - 用于支付和签署交易的默认密钥对
 - `Provider` - 将 `Connection` 封装到一个`Solana`集群和一个 `Wallet` 中
 - `IDL` - 表示程序结构的文件

 接下来，让我们逐项审视，以更好地理解所有事物之间的联系。

 ## IDL（接口描述语言）

 当构建一个Anchor程序时，Anchor会生成一个名为 `IDL` 的JSON文件。

 `IDL`文件包含程序的结构，并由客户端用于了解如何与特定程序进行交互。

 这是使用`IDL`编写计数器程序的示例：

 ```json
 {
   "version": "0.1.0",
   "name": "counter",
   "instructions": [
     {
       "name": "initialize",
       "accounts": [
         { "name": "counter", "isMut": true, "isSigner": true },
         { "name": "user", "isMut": true, "isSigner": true },
         { "name": "systemProgram", "isMut": false, "isSigner": false }
       ],
       "args": []
     },
     {
       "name": "increment",
       "accounts": [
         { "name": "counter", "isMut": true, "isSigner": false },
         { "name": "user", "isMut": false, "isSigner": true }
       ],
       "args": []
     }
   ],
   "accounts": [
     {
       "name": "Counter",
       "type": {
         "kind": "struct",
         "fields": [{ "name": "count", "type": "u64" }]
       }
     }
   ]
 }
 ```

## Provider 供应商

在使用 `IDL` 创建`Program`对象之前，我们首先需要创建一个`Anchor` `Provider` 对象。

`Provider` 对象代表了两个事物的组合：

- `Connection` - 连接到 Solana 集群（即 `localhost`、`devnet`、`mainnet`）
- `Wallet` - 用于支付和签署交易的指定地址

然后， `Provider` 能够代表 `Wallet` 将交易发送到Solana区块链，并在外发交易中包含钱包的签名。

当使用Solana钱包提供商的前端时，所有的外部交易仍然需要通过提示用户来进行批准。


`AnchorProvider` 构造函数接受三个参数：

- `connection` - 连接到Solana集群的 `Connection`
- `wallet` - `Wallet` 对象
- `opts` - 可选参数，用于指定确认选项，如果未提供，则使用默认设置

```ts
/**
 * The network and wallet context used to send transactions paid for and signed
 * by the provider.
 */
export class AnchorProvider implements Provider {
  readonly publicKey: PublicKey;

  /**
   * @param connection The cluster connection where the program is deployed.
   * @param wallet     The wallet used to pay for and sign all transactions.
   * @param opts       Transaction confirmation options to use by default.
   */
  constructor(
    readonly connection: Connection,
    readonly wallet: Wallet,
    readonly opts: ConfirmOptions
  ) {
    this.publicKey = wallet.publicKey;
  }
  ...
}
```

> Note that the `Wallet` object provided by the `useWallet` hook from `@solana/wallet-adapter-react` is not compatible with the `Wallet` object that the Anchor `Provider` expects.

请注意，由 Wallet 钩子提供的对象与`Anchor Provider` 期望的 Wallet 对象不兼容。

那么，让我们来比较一下来自`useAnchorWallet`的`AnchorWallet`和来自`useWallet`的`WalletContextState`。

`WalletContextState`提供了更多的功能，但是需要使用`AnchorWallet`来设置`Provider`对象。

```ts
export interface AnchorWallet {
    publicKey: PublicKey;
    signTransaction(transaction: Transaction): Promise<Transaction>;
    signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>;
}
```

```ts
export interface WalletContextState {
    autoConnect: boolean;
    wallets: Wallet[];
    wallet: Wallet | null;
    publicKey: PublicKey | null;
    connecting: boolean;
    connected: boolean;
    disconnecting: boolean;
    select(walletName: WalletName): void;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    sendTransaction(transaction: Transaction, connection: Connection, options?: SendTransactionOptions): Promise<TransactionSignature>;
    signTransaction: SignerWalletAdapterProps['signTransaction'] | undefined;
    signAllTransactions: SignerWalletAdapterProps['signAllTransactions'] | undefined;
    signMessage: MessageSignerWalletAdapterProps['signMessage'] | undefined;
}
```

此外，使用：

- 提供 `useAnchorWallet` 钩子以获取兼容的 `AnchorWallet`
- 将 `useConnection` 钩子连接到Solana集群。
- 创建 `AnchorProvider` 对象的构造函数是 `Provider`
- `setProvider` 设置客户端的默认提供程序

```ts
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react"
import { AnchorProvider, setProvider } from "@project-serum/anchor"

const { connection } = useConnection()
const wallet = useAnchorWallet()

const provider = new AnchorProvider(connection, wallet, {})
setProvider(provider)
```

## 程序

最后一步是创建一个 `Program` 对象。这个 `Program` 对象代表了两个事物的组合。

- `IDL` - 表示程序的结构
- `Provider` - 建立集群和签署 `Wallet` 的 `Connection`

导入程序 `IDL` 。

请指定程序的`programId`，该`programId`通常包含在`IDL`中。或者，你也可以明确地声明`programId`。

创建程序对象时，如果没有明确指定提供程序，则使用默认提供程序。

最终的设置看起来大致是这样的：

```ts
import idl from "./idl.json"
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react"
import { Program, Idl, AnchorProvider, setProvider } from "@project-serum/anchor"

const { connection } = useConnection()
const wallet = useAnchorWallet()

const provider = new AnchorProvider(connection, wallet, {})
setProvider(provider)

const programId = new PublicKey(idl.metadata.address)
const program = new Program(idl as Idl, programId)
```

## Summary 摘要

所以简单总结一下：

- 导入程序 `IDL`
- 使用 `useConnection` 钩子与集群建立连接
- 使用 `useAnchorWallet` 钩子来获取兼容的 `AnchorWallet`
- 使用 `AnchorProvider` 构造函数创建 `Provider` 对象
- 使用 `setProvider` 来设置默认的 `Provide`
- 请指定 `programId` ，可以从 `IDL` 中选择，也可以直接指定
- 使用 `Program` 构造函数创建 `Program` 对象

## `Anchor MethodsBuilder`

一旦 `Program` 对象设置完成，我们就可以使用Anchor `MethodsBuilder` 根据我们程序中的指令来构建交易。

`MethodsBuilder` 使用 `IDL` 提供了一种简化格式的建筑交易来调用程序指令。

`MethodsBuilder` 基本格式包括以下内容：

- `program` - 由 `programId` 指定的被调用的程序，来自 `Program` 对象
- `methods` - 程序中所有`API`的构建器`API`，包括 `IDL` 的所有指令
- `instructionName` - 从 `IDL` 调用的特定指令的名称
- `args` - 传递给指令的参数
    - `instructionDataInputs` - 在指令名称后的括号中包含指令所需的任何指令数据
- `accounts` - 需要作为输入提供一份指令所需的账户列表
- `signers` - 需要输入指令所需的任何额外签署人信息
- `rpc` - 创建并发送带有指定指令的已签名交易，并返回一个 `TransactionSignature` 。
- 使用 `.rpc` 时， `Provider` 中的 `Wallet` 会自动被包括为签署人，无需明确列出。

请注意，如果除了使用 `Wallet` 指定的 `Provider` 之外，指示中不需要其他签署人，则可以省略 `.signer([])` 行。

```ts
// sends transaction
const transactionSignature = await program.methods
  .instructionName(instructionDataInputs)
  .accounts({})
  .signers([])
  .rpc()
```

你还可以通过将 `.rpc()` 更改为 `.transaction()` 来直接构建交易。

使用指定的指令创建一个 `Transaction` 对象。

```ts
// creates transaction
const transaction = await program.methods
  .instructionName(instructionDataInputs)
  .accounts({})
  .transaction()

// sent transaction
await sendTransaction(transaction, connection)
```

同样，你可以使用相同的格式来构建一个使用 `.instruction` 的指令，然后手动将指令添加到新的交易中。

使用指定的指令创建一个 `TransactionInstruction` 对象。

```ts
// creates first instruction
const instructionOne = await program.methods
  .instructionOneName(instructionOneDataInputs)
  .accounts({})
  .instruction()

// creates second instruction
const instructionTwo = await program.methods
  .instructionTwoName(instructionTwoDataInputs)
  .accounts({})
  .instruction()

// add both instruction to one transaction
const transaction = new Transaction().add(instructionOne, instructionTwo)

// send transaction
await sendTransaction(transaction, connection)
```

总之，`Anchor MethodsBuilder` 提供了一种简化且更灵活的与链上程序交互的方式。你可以构建指令、交易，或者基本上使用相同的格式构建和发送交易，而无需手动序列化或反序列化账户或指令数据。

## Send Transactions

使用由 `@solana/wallet-adapter-react` 提供的 `useWallet()` 钩子中的 `sendTransaction` 方法，通过钱包适配器发送交易。

该 `sendTransaction` 方法在发送之前提示连接的钱包进行交易的批准和签名。

你可以通过包含 `{ signers: [] }` 来添加额外的签名：

```ts
import { useWallet } from "@solana/wallet-adapter-react"

const { sendTransaction } = useWallet()

...

sendTransaction(transaction, connection)
```

```
sendTransaction(transaction, connection, { signers: [] })
```

## 获取程序账户

你还可以使用 `program` 对象来获取程序账户类型。使用 `fetch()` 来获取单个账户。使用 `all()` 来获取指定类型的所有账户。你还可以使用 `memcmp` 来筛选要获取的账户。

```ts
const account = await program.account.accountType.fetch(publickey)

const accounts = (await program.account.accountType.all())

const accounts =
	(await program.account.accountType.all([
	  {
	    memcmp: {
	      offset: 8,
	      bytes: publicKey.toBase58(),
	    },
	  },
	]))
```

### 摘要示例

创建一个计数器账户并在单个事务中递增。此外，获取计数器账户。

```ts
const counter = Keypair.generate()
const transaction = new anchor.web3.Transaction()

const initializeInstruction = await program.methods
  .initialize()
  .accounts({
    counter: counter.publicKey,
  })
  .instruction()

const incrementInstruction = await program.methods
  .increment()
  .accounts({
    counter: counter.publicKey
  })
  .instruction()

transaction.add(initializeInstruction, incrementInstruction )

const transactionSignature = await sendTransaction(
  transaction,
  connection,
  {
    signers: [counter],
  }
).then((transactionSignature) => {
  return transactionSignature
})

const latestBlockHash = await connection.getLatestBlockhash()
await connection.confirmTransaction({
  blockhash: latestBlockHash.blockhash,
  lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
  signature: transactionSignature,
})

const counterAccount = await program.account.counter.fetch(counter.publicKey)
```
