# 简要概述

所有链上数据的修改都是通过交易来实现的。交易主要是一组调用Solana程序的指令。

交易是原子性的，这意味着它们要么成功——如果所有指令都正确执行了；要么失败——就好像交易根本没有运行过一样。

# 正文 

### 交易是原子性的

任何对链上数据的修改都是通过发送到程序的交易来实现的。

Solana上的交易与其他地方的交易类似：它是原子性的。原子性意味着整个交易要么全部成功，要么全部失败。

想象一下在线支付：

1. 你的账户余额会被扣除
2. 银行将资金转给商家

这两件事都需要发生，交易才算成功。如果其中任何一个失败，那么最好是两者都不发生，而不是发生其中一个——支付给商家而不扣除你的账户，或者扣除账户但不支付给商家，这都不是我们希望看到的。

原子性意味着要么交易发生——意味着所有个别步骤都成功——要么整个交易全都失败。

### 交易包含指令

Solana上交易内的步骤被称为指令。

每个指令包含：

- 将要从中读取和/或写入的账户数组。这就是Solana快速处理的原因——影响不同账户的交易可以同时处理
- 要调用的程序的公钥
- 传递给被调用程序的数据，以字节数组的形式结构化

当运行交易时，将调用一个或多个Solana程序，并使用交易中包含的指令。

正如你所期望的，`@solana/web3.js` 提供了创建交易和指令的辅助函数。你可以使用构造函数 `new Transaction()` 创建一个新的交易。一旦创建，你就可以使用 `add()` 方法向交易中添加指令。

其中一个辅助函数是 `SystemProgram.transfer()`，它创建了一个让 `SystemProgram` 转移一些SOL的指令：

```
const transaction = new Transaction()

const sendSolInstruction = SystemProgram.transfer({
  fromPubkey: sender,
  toPubkey: recipient,
  lamports: LAMPORTS_PER_SOL * amount
})

transaction.add(sendSolInstruction)
```

`SystemProgram.transfer()` 函数需要：

- 发送者账户对应的公钥
- 收件人账户对应的公钥
- 以lamports为单位的要发送的SOL数量。

`SystemProgram.transfer()` 返回用于将SOL从发送者发送给接收者的指令。

在这个指令中使用的程序将是系统程序（地址为 `11111111111111111111111111111111`），数据将是要转移的SOL金额（以Lamports为单位），账户将基于发送者和接收者。

然后，指令可以被添加到交易中。

一旦所有指令都被添加，就需要将交易发送到集群并确认：

```
const signature = sendAndConfirmTransaction(
  connection,
  transaction,
  [senderKeypair]
)
```

`sendAndConfirmTransaction()` 函数作为参数接受

- 一个集群连接
- 一个交易
- 将作为交易上签名者的密钥对数组——在这个例子中，我们只有一个签名者：发送者。

### 交易费用

交易费用是内置于Solana经济中的，作为对验证器网络在处理交易时所需的CPU和GPU资源的补偿。Solana的交易费用是确定的。

在交易上的签名者数组中的第一个签名者负责支付交易费用。如果这个签名者的账户中没有足够的SOL来支付交易费用，交易将被丢弃。

在测试时，无论是本地还是在devnet上，你可以使用Solana CLI命令 `solana airdrop 1` 来获取免费的测试SOL，用于支付交易费用。

### Solana Explorer

![Screenshot of Solana Explorer set to Devnet](https://www.soldev.app/assets/solana-explorer-devnet.png)

区块链上的所有交易都可以在[Solana Explorer](https://explorer.solana.com/)上公开查看。例如，你可以取上面示例中 `sendAndConfirmTransaction()` 返回的签名，在Solana Explorer中搜索该签名，然后查看：

- 它发生的时间
- 它包含在哪个区块中
- 交易费用
- 以及更多信息

![Screenshot of Solana Explorer with details about a transaction](https://www.soldev.app/assets/solana-explorer-transaction-overview.png)

# 实验

我们将创建一个脚本，用于向其他学生发送SOL。

1. **基础框架** 我们将开始使用我们之前在“加密学入门”中创建的相同的包和 `.env` 文件。

创建一个名为 `transfer.ts` 的文件：

```
import {
  Connection,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
  PublicKey,
} from "@solana/web3.js";
import "dotenv/config"
import { getKeypairFromEnvironment } from "@solana-developers/node-helpers";

const suppliedToPubkey = process.argv[2] || null;

if (!suppliedToPubkey) {
  console.log(`Please provide a public key to send to`);
  process.exit(1);
}

const senderKeypair = getKeypairFromEnvironment("SECRET_KEY");

console.log(`suppliedToPubkey: ${suppliedToPubkey}`);

const toPubkey = new PublicKey(suppliedToPubkey);

const connection = new Connection("https://api.devnet.solana.com", "confirmed");

console.log(
  `✅ Loaded our own keypair, the destination public key, and connected to Solana`
);
```

运行脚本以确保它连接、加载了你的密钥对，并加载了：

```
npx esrun transfer.ts (目标钱包地址)
```

### 创建交易并运行

添加以下内容以完成交易并发送：

```
console.log(
  `✅ Loaded our own keypair, the destination public key, and connected to Solana`
);

const transaction = new Transaction();

const LAMPORTS_TO_SEND = 5000;

const sendSolInstruction = SystemProgram.transfer({
  fromPubkey: senderKeypair.publicKey,
  toPubkey,
  lamports: LAMPORTS_TO_SEND,
});

transaction.add(sendSolInstruction);

const signature = await sendAndConfirmTransaction(connection, transaction, [
  senderKeypair,
]);

console.log(
  `💸 Finished! Sent ${LAMPORTS_TO_SEND} to the address ${toPubkey}. `
);
console.log(`Transaction signature is ${signature}!`);
```

### 尝试

 向班上其他学生发送SOL。

```
npx esrun transfer.ts (目标钱包地址)
```

# 挑战 

回答以下问题：

* 转账花费了多少Solana？换算成美元是多少钱？

* 你能在 [https://explorer.solana.com](https://explorer.solana.com/) 找到你的交易记录吗？注意，我们正在使用的是 devnet 网络。

* 转账需要多长时间？

* 你认为「confirmed」是什么意思？