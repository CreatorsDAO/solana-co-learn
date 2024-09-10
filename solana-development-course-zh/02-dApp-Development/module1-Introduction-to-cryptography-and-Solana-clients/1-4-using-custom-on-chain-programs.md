# 太长不看版

Solana有多个链上程序供您使用。

使用这些程序的指令需要有程序确定的自定义格式数据。

# 概览

指令 在前几章中，我们使用了 `SystemProgram.transfer()` 函数来创建指令并发送Solana。

但是，当处理非原生程序时，您需要更具体地创建与相应程序匹配的指令。

使用 `@solana/web3.js` ，您可以使用 `TransactionInstruction` 构造函数创建非原生指令。这个构造函数接受一个 `TransactionInstructionCtorFields` 数据类型的单一参数。

```
export type TransactionInstructionCtorFields = {
  keys: Array<AccountMeta>;
  programId: PublicKey;
  data?: Buffer;
};
```

根据上述定义，传递给TransactionInstruction构造函数的对象需要：

一个类型为AccountMeta的键数组 被调用程序的公钥 一个可选的Buffer，包含传递给程序的数据。 我们现在将忽略数据字段，并将在未来的课程中重新讨论。

programId字段相当直接：它是与程序关联的公钥。在调用程序之前，您需要提前知道这个，就像您需要提前知道要向其发送SOL的人的公钥一样。

keys数组需要更多的解释。数组中的每个对象代表一个在交易执行期间将被读取或写入的账户。这意味着您需要了解所调用程序的行为，并确保在数组中提供所有必要的账户。

keys数组中的每个对象都必须包括以下内容：

pubkey - 账户的公钥 isSigner - 一个布尔值，表示账户是否为交易的签名者 isWritable - 一个布尔值，表示在交易执行期间账户是否会被写入 将这一切综合起来，我们可能最终会得到类似以下的内容：

```
async function callProgram(
  connection: web3.Connection,
  payer: web3.Keypair,
  programId: web3.PublicKey,
  programDataAccount: web3.PublicKey,
) {
  const instruction = new web3.TransactionInstruction({
    keys: [
      {
        pubkey: programDataAccount,
        isSigner: false,
        isWritable: true,
      },
    ],
    programId,
  });

  const transaction = new web3.Transaction().add(instruction)

  const signature = await web3.sendAndConfirmTransaction(
    connection,
    transaction,
    [payer],
  );

  console.log(`✅ Success! Transaction signature is: ${signature}`);
}
```

**交易费用** 

交易费用是Solana经济体系的一部分，作为对验证器网络在处理交易时所需的CPU和GPU资源的补偿。Solana的交易费用是确定的。

在交易的签名者数组中，第一个包含的签名者负责支付交易费用。如果这个签名者的账户中没有足够的SOL来支付交易费用，交易将被丢弃。

在测试时，无论是本地还是在devnet上，您可以使用Solana CLI命令solana airdrop 1来获取免费的测试SOL以支付交易费用。

**Solana浏览器**

![Screenshot of Solana Explorer set to Devnet](https://www.soldev.app/assets/solana-explorer-devnet.png)

区块链上的所有交易都可以在Solana浏览器上公开查看。例如，您可以拿上面例子中sendAndConfirmTransaction()返回的签名，在Solana浏览器中搜索该签名，然后查看：

- 它发生的时间
- 它被包含在哪个区块中
- 交易费用
- 以及更多！

![Screenshot of Solana Explorer with details about a transaction](https://www.soldev.app/assets/solana-explorer-transaction-overview.png)

# 实验室 - 为ping计数器程序编写交易

我们将创建一个脚本来ping一个链上程序，该程序每次被ping时都会增加一个计数器。这个程序存在于Solana Devnet上，地址为 `ChT1B39WKLS8qUrkLvFDXMhEJ4F1XZzwUNHUt4AU9aVa`。该程序将其数据存储在 `Ah9K7dQ8EHaZqcAsgBW8w37yN2eAy3koFmUn4x3CJtod` 地址的特定账户中。

![Solana stores programs and data in seperate accounts](https://www.soldev.app/assets/pdas-note-taking-program.svg)

### 1.基础框架

我们将从使用我们在“入门到密码学”中制作的相同包和.env文件开始：

```
import { Keypair } from "@solana/web3.js";
import "dotenv/config"
import base58 from "bs58";
import { getKeypairFromEnvironment } from "@solana-developers/node-helpers"

const payer = getKeypairFromEnvironment('SECRET_KEY')
const connection = new web3.Connection(web3.clusterApiUrl('devnet'))
```

### 2.Ping程序

现在我们已经加载了我们的密钥对，我们需要连接到Solana的Devnet。让我们创建一个连接：

```
const connection = new web3.Connection(web3.clusterApiUrl('devnet'))
```

现在创建一个名为sendPingTransaction()的异步函数，它有两个参数，分别需要一个连接和付款者的密钥对作为参数：

```
async function sendPingTransaction(connection: web3.Connection, payer: web3.Keypair) { }
```

在这个函数中，我们需要：

- 创建一个交易
- 创建一个指令
- 将指令添加到交易中
- 发送交易。

记住，这里最具挑战性的部分是在指令中包含正确的信息。我们知道我们正在调用的程序的地址。我们也知道该程序将数据写入到另一个我们也有地址的单独账户中。让我们在index.ts文件的顶部添加两个作为常量的字符串版本：

```
const PING_PROGRAM_ADDRESS = new web3.PublicKey('ChT1B39WKLS8qUrkLvFDXMhEJ4F1XZzwUNHUt4AU9aVa')
const PING_PROGRAM_DATA_ADDRESS =  new web3.PublicKey('Ah9K7dQ8EHaZqcAsgBW8w37yN2eAy3koFmUn4x3CJtod')
```

现在，在sendPingTransaction()函数中，让我们创建一个新的交易，然后为程序账户初始化一个PublicKey，以及另一个用于数据账户的PublicKey。

```
const transaction = new web3.Transaction()
const programId = new web3.PublicKey(PING_PROGRAM_ADDRESS)
const pingProgramDataId = new web3.PublicKey(PING_PROGRAM_DATA_ADDRESS)
```

接下来，让我们创建指令。记住，指令需要包括Ping程序的公钥，还需要包括一个包含所有将被读取或写入的账户的数组。在这个示例程序中，只需要上面提到的数据账户。

```
const transaction = new web3.Transaction()

const programId = new web3.PublicKey(PING_PROGRAM_ADDRESS)
const pingProgramDataId = new web3.PublicKey(PING_PROGRAM_DATA_ADDRESS)

const instruction = new web3.TransactionInstruction({
  keys: [
    {
      pubkey: pingProgramDataId,
      isSigner: false,
      isWritable: true
    },
  ],
  programId
})
```

接下来，让我们将指令添加到我们创建的交易中。然后，通过传入连接、交易和付款者，调用sendAndConfirmTransaction()。最后，让我们记录该函数调用的结果，这样我们就可以在Solana Explorer上查找它。

```
const transaction = new web3.Transaction()

const programId = new web3.PublicKey(PING_PROGRAM_ADDRESS)
const pingProgramDataId = new web3.PublicKey(PING_PROGRAM_DATA_ADDRESS)

const instruction = new web3.TransactionInstruction({
  keys: [
    {
      pubkey: pingProgramDataId,
      isSigner: false,
      isWritable: true
    },
  ],
  programId
})

transaction.add(instruction)

const signature = await web3.sendAndConfirmTransaction(
  connection,
  transaction,
  [payer]
)

console.log(`✅ Transaction completed! Signature is ${signature}`)
```

### 3.Airdrop

现在使用 `npx esrun send-ping-instruction.ts` 运行代码，看看是否有效。您可能会在控制台中遇到以下错误：

```
> Transaction simulation failed: Attempt to debit an account but found no record of a prior credit.
```

如果您遇到这个错误，那是因为您的密钥对是全新的，没有SOL来支付交易费用。让我们通过在调用 `sendPingTransaction()` 之前添加以下行来解决这个问题：

```
await connection.requestAirdrop(payer.publicKey, web3.LAMPORTS_PER_SOL*1)
```

这将在您的账户中存入1 SOL，您可以用它来进行测试。这在Mainnet上是不行的，因为它实际上有价值。但是在本地和Devnet上测试时非常方便。

### 4. 查看Solana浏览器

现在再次运行代码。可能需要一两分钟，但现在代码应该可以工作了，您应该会看到控制台打印出一个长字符串，如下所示：

```
✅ Transaction completed! Signature is 55S47uwMJprFMLhRSewkoUuzUs5V6BpNfRx21MpngRUQG3AswCzCSxvQmS3WEPWDJM7bhHm3bYBrqRshj672cUSG
```

复制交易签名。打开浏览器，前往 https://explorer.solana.com/?cluster=devnet（URL末尾的查询参数将确保您在Devnet而不是Mainnet上探索交易）。将签名粘贴到Solana的Devnet浏览器顶部的搜索栏中，然后按回车。您应该会看到有关交易的所有细节。如果您滚动到底部，那么您将看到程序日志，显示程序被ping的次数，包括您的ping。

![Screenshot of Solana Explorer with logs from calling the Ping program](https://www.soldev.app/assets/solana-explorer-ping-result.png)

在浏览器中四处浏览，看看您正在看的内容：

账户输入将包括：

- 您的付款者地址 - 为交易被扣除5000 lamports
- ping程序的程序地址
- ping程序的数据地址

指令部分将包含一个没有数据的单一指令 - ping程序是一个非常简单的程序，所以它不需要任何数据。

程序指令日志显示了来自ping程序的日志。

如果您希望将来更容易地在Solana浏览器上查看交易，只需将 `sendPingTransaction()` 中的 `console.log` 更改为以下内容：

```
console.log(`You can view your transaction on the Solana Explorer at:\nhttps://explorer.solana.com/tx/${signature}?cluster=devnet`)
```

就这样，您正在Solana网络上调用程序并将数据写入链上！

### 接下来

在接下来的几节课中，您将学习如何

- 从浏览器而不是从运行脚本中安全地发送交易
- 向您的指令中添加自定义数据
- 从链上反序列化数据

# 挑战

继续创建一个从头开始的脚本，使您能够在Devnet上将SOL从一个账户转移到另一个账户。确保打印出交易签名，这样您就可以在Solana Explorer上查看它。

如果您遇到困难，可以参考[解决方案代码](https://github.com/Unboxed-Software/solana-ping-client)。