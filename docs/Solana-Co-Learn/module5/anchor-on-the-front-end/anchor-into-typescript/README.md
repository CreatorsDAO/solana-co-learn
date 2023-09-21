---
sidebar_position: 88
sidebar_label:  🐹 Anchor到Typescript
sidebar_class_name: green
---

# 🐹 Anchor 到 Typescript

要使用前端与程序进行交互，我们需要创建一个 `Anchor` `Program` 对象。

`Program` 对象提供了一个自定义的 `API`，通过结合程序 `IDL` 和 `Provider` 来与特定程序进行交互。

创建 `Program` 对象，我们需要以下内容：

- `Connection` - 集群连接
- `Wallet` - 用于支付和签署交易的默认密钥对
- `Provider` - 将 `Connection` 和 `Wallet` 封装到一个 `Solana` 集群中
- `IDL` - 表示程序结构的文件

接下来，让我们逐项审视，以更好地理解所有事物之间的联系。

## IDL（接口描述语言）

当构建一个 `Anchor` 程序时，`Anchor` 会生成一个名为 `IDL` 的 JSON 文件。

`IDL` 文件包含程序的结构，并由客户端用于了解如何与特定程序进行交互。

以下是使用 `IDL` 编写计数器程序的示例：

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

在使用 `IDL` 创建 `Program` 对象之前，我们首先需要创建一个 `Anchor` 的 `Provider` 对象。

`Provider` 对象代表了两个主要部分的结合：

- `Connection` - 连接到 `Solana` 集群（例如 `localhost`、`devnet`、`mainnet`）
- `Wallet` - 用于支付和签署交易的指定地址

接着，`Provider` 就能够代表 `Wallet` 向 `Solana` 区块链发送交易，并在发送的交易中加入钱包的签名。

当使用 `Solana` 钱包提供商的前端时，所有的外部交易仍然需要通过提示用户进行批准。

`AnchorProvider` 构造函数接受三个参数：

- `connection` - 连接到 `Solana` 集群的 `Connection`
- `wallet` - `Wallet` 对象
- `opts` - 可选参数，用于指定确认选项，如果未提供，则使用默认设置

```ts
/**
 * 用于发送由供应商支付和签署的交易的网络和钱包上下文。
 */
export class AnchorProvider implements Provider {
  readonly publicKey: PublicKey;

  /**
   * @param connection 程序部署的集群连接。
   * @param wallet 用于支付和签署所有交易的钱包。
   * @param opts 默认使用的交易确认选项。
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

:::caution
请注意，来自 `@solana/wallet-adapter-react` 的 `useWallet` 钩子提供的 `Wallet` 对象与 `Anchor Provider` 期望的 `Wallet` 对象不兼容。
:::

因此，让我们来比较一下来自 `useAnchorWallet` 的 `AnchorWallet` 和来自 `useWallet` 的 `WalletContextState`。

`WalletContextState` 提供了更多的功能，但是我们需要使用 `AnchorWallet` 来设置 `Provider` 对象。

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

此外，您可以使用以下方式：

- 使用 `useAnchorWallet` 钩子来获取兼容的 `AnchorWallet`
- 使用 `useConnection` 钩子连接到 `Solana` 集群
- 通过 `AnchorProvider` 对象的构造函数创建 `Provider`
- 使用 `setProvider` 来设置客户端的默认提供程序

```ts
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react"
import { AnchorProvider, setProvider } from "@project-serum/anchor"

const { connection } = useConnection()
const wallet = useAnchorWallet()

const provider = new AnchorProvider(connection, wallet, {})
setProvider(provider)
```

## 程序

最后一步是创建一个 `Program` 对象，代表了以下两个事物的组合：

- **`IDL`**：展示了程序的结构。
- **`Provider`**：负责与集群建立连接并签署 `Wallet` 的 `Connection`。

首先，你需要导入程序的 `IDL`，并明确指定`programId`，这个`programId`通常会包含在`IDL`中，当然也可以单独声明。

在创建程序对象时，如果没有特定地指定提供程序，系统将会使用默认提供程序。

程序的最终设置应该如下：

```ts
import idl from "./idl.json";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { Program, Idl, AnchorProvider, setProvider } from "@project-serum/anchor";

const { connection } = useConnection();
const wallet = useAnchorWallet();

const provider = new AnchorProvider(connection, wallet, {});
setProvider(provider);

const programId = new PublicKey(idl.metadata.address);
const program = new Program(idl as Idl, programId);
```

## 摘要

让我们简要总结一下步骤：

- 导入程序的 `IDL`。
- 使用 `useConnection` 钩子与集群建立连接。
- 使用 `useAnchorWallet` 钩子获取兼容的 `AnchorWallet`。
- 通过 `AnchorProvider` 构造函数创建 `Provider` 对象。
- 使用 `setProvider` 设置默认的 `Provider`。
- 指定 `programId`，可以从 `IDL` 中选择，也可以直接指定。
- 使用 `Program` 构造函数创建 `Program` 对象。

## `Anchor MethodsBuilder` 使用

一旦 `Program` 对象设置完成，我们就可以利用 `Anchor` 的 `MethodsBuilder` 来根据程序中的指令构建交易。

`MethodsBuilder` 利用 `IDL`，为调用程序指令提供了一种简化格式，基本格式如下：

- **`program`**：由 `programId` 指定的被调用程序，来自 `Program` 对象。
- **`methods`**：包括 `IDL` 的所有指令，用于构建程序中所有的 `API`。
- **`instructionName`**：从 `IDL` 中调用的特定指令的名称。
- **`args`**：传递给指令的参数，包括在指令名称后的括号中所需的任何指令数据。
- **`accounts`**：需要作为输入提供的一份指令所需的账户列表。
- **`signers`**：任何需要输入的额外签署人信息。
- **`rpc`**：创建并发送带有指定指令的已签名交易，并返回一个 `TransactionSignature`。

如果指示中没有除使用 `Wallet` 指定的 `Provider` 之外的其他签署人，你可以省略 `.signers([])` 行。

```ts
// 发送交易
const transactionSignature = await program.methods
  .instructionName(instructionDataInputs)
  .accounts({})
  .signers([])
  .rpc();
```

你还可以通过将 `.rpc()` 更改为 `.transaction()` 来直接构建交易，以及通过以下方式创建 `Transaction` 对象：

```ts
// 创建交易
const transaction = await program.methods
  .instructionName(instructionDataInputs)
  .accounts({})
  .transaction();

// 发送交易
await sendTransaction(transaction, connection);
```

同样，你还可以使用相同的格式来构建一个使用 `.instruction` 的指令，然后手动将指令添加到新的交易中。

```ts
// 创建第一条指令
const instructionOne = await program.methods
  .instructionOneName(instructionOneDataInputs)
  .accounts({})
  .instruction();

// 创建第二条指令
const instructionTwo = await program.methods
  .instructionTwoName(instructionTwoDataInputs)
  .accounts({})
  .instruction();

// 将两个指令添加到一个交易中
const transaction = new Transaction().add(instructionOne, instructionTwo);

// 发送交易
await sendTransaction(transaction, connection);
```

总的来说，`Anchor MethodsBuilder` 为与链上程序交互提供了一种更简洁且灵活的方式。你可以构建指令、交易，或者使用相同的格式构建和发送交易，无需手动序列化或反序列化账户或指令数据。

## 发送交易

可以使用由 `@solana/wallet-adapter-react` 提供的 `useWallet()` 钩子中的 `sendTransaction` 方法，通过钱包适配器发送交易。

`sendTransaction` 方法会在发送之前提示连接的钱包批准和签署交易。你还可以通过包括 `{ signers: [] }` 来添加额外的签名：

```ts
import { useWallet } from "@solana/wallet-adapter-react";

const { sendTransaction } = useWallet();

...

sendTransaction(transaction, connection);
```

或者：

```
sendTransaction(transaction, connection, { signers: [] });
```

## 获取程序账户

你还可以使用 `program` 对象来获取程序账户类型。通过 `fetch()` 来获取单个账户，通过 `all()` 来获取指定类型的所有账户，或者使用 `memcmp` 来筛选要获取的账户。

```ts
const account = await program.account.accountType.fetch(publickey);

const accounts = (await program.account.accountType.all());

const accounts =
	(await program.account.accountType.all([
	  {
	    memcmp: {
	      offset: 8,
	      bytes: publicKey.toBase58(),
	    },
	  },
	]));
```

### 示例摘要

创建一个计数器账户，并在单个事务中递增它。此外，还可以获取计数器账户。

```ts
const counter = Keypair.generate();
const transaction = new anchor.web3.Transaction();

const initializeInstruction = await program.methods
  .initialize()
  .accounts({
    counter: counter.publicKey,
  })
  .instruction();

const incrementInstruction = await program.methods
  .increment()
  .accounts({
    counter: counter.publicKey
  })
  .instruction();

transaction.add(initializeInstruction, incrementInstruction);

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
