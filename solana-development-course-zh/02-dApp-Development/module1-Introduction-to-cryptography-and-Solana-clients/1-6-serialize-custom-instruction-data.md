# 简介

交易由一系列指令组成，一个交易可以包含任意数量的指令，每个指令针对其自己的程序。当提交交易时，Solana运行时将按顺序并且原子性地处理其指令，这意味着如果任何指令由于任何原因失败，整个交易将无法处理。 每个指令由3个部分组成：目标程序的ID、涉及的所有账户的数组和指令数据的字节缓冲区。 每个交易包含：打算读取或写入的所有账户的数组、一个或多个指令、一个最近的区块哈希和一个或多个签名。 为了从客户端传递指令数据，必须将其序列化成字节缓冲区。为了促进序列化过程，我们将使用Borsh。 交易可能因为任何原因而无法由区块链处理，我们将在这里讨论一些最常见的原因。

# 正文

### 交易 

交易是我们向区块链发送信息以便处理的方式。到目前为止，我们已经学会了如何创建具有有限功能的非常基本的交易。但是，交易和它们发送到的程序可以设计得更加灵活，处理的复杂性远超我们到目前为止所处理的。

### 交易内容

每个交易包含：

* 一个包括其打算读取或写入的每个账户的数组 
* 一个或多个指令 
* 一个最近的区块哈希 
* 一个或多个签名 

`@solana/web3.js` 简化了这个过程，所以你真正需要关注的只是添加指令和签名。这个库根据这些信息构建账户数组，并处理包含最近区块哈希的逻辑。

### 指令

每个指令包含：

目标程序的程序ID（公钥） 列出在执行期间将被读取或写入的每个账户的数组 指令数据的字节缓冲区 通过其公钥确定程序可以确保指令由正确的程序执行。

包含一个将被读取或写入的每个账户的数组，允许网络执行许多优化，从而允许高交易负载和更快的执行。

字节缓冲区让你可以向程序传递外部数据。

你可以在单个交易中包含多个指令。Solana运行时将按顺序并且原子性地处理这些指令。换句话说，如果每个指令都成功，那么整个交易将会成功，但如果单个指令失败，那么整个交易将立即失败，且没有副作用。

账户数组不仅仅是账户公钥的数组。数组中的每个对象都包括账户的公钥、它是否是交易上的签名者、以及它是否可写。在指令执行期间包含账户是否可写，允许运行时促进智能合约的并行处理。因为你必须定义哪些账户是只读的，哪些你将写入，运行时可以确定哪些交易是非重叠的或只读的，并允许它们并发执行。要了解更多关于Solana运行时的信息，请查看这篇博客文章。

**指令数据** 

能够向指令添加任意数据确保了程序可以为广泛的用例动态灵活地使用，就像HTTP请求的主体让你构建动态灵活的REST API一样。

就像HTTP请求的主体结构取决于你打算调用的端点一样，用作指令数据的字节缓冲区的结构完全取决于接收程序。如果你正在独立构建一个全栈dApp，那么你需要将你在构建程序时使用的相同结构复制到客户端代码中。如果你正在与处理程序开发的其他开发人员合作，你可以协调以确保匹配的缓冲区布局。

让我们考虑一个具体的例子。想象一下在一个Web3游戏上工作，负责编写与玩家库存程序交互的客户端代码。这个程序被设计为允许客户端：

根据玩家的游戏结果添加库存 将库存从一个玩家转移到另一个玩家 装备玩家选择的库存物品 这个程序将被设计成这样，每个功能都封装在自己的函数中。

然而，每个程序只有一个入口点。你会通过指令数据指导程序运行其中哪个函数。

你还会在指令数据中包含函数执行所需的任何信息，例如库存物品的ID、要转移库存的玩家等。

这些数据的确切结构取决于程序的编写方式，但通常情况下，指令数据中的第一个字段是一个数字，程序可以将其映射到一个函数，之后的附加字段充当函数参数。

**序列化** 

除了知道要在指令数据缓冲区中包含哪些信息外，您还需要正确地序列化它。在Solana中最常用的序列化器是Borsh。根据其网站：

Borsh代表二进制对象表示哈希序列化器。它旨在用于安全关键的项目，因为它优先考虑一致性、安全性、速度，并且有严格的规范。

Borsh维护了一个JS库，该库处理将常见类型序列化为缓冲区。还有一些基于borsh构建的其他包试图使这个过程更加简单。我们将使用可以通过npm安装的@coral-xyz/borsh库。

基于之前的游戏库存示例，让我们来看一个假设的场景，我们指示程序为玩家装备一个给定的物品。假设程序被设计为接受代表具有以下属性的结构的缓冲区：

- `variant` 作为一个无符号的8位整数，指示程序执行哪个指令或功能。
- `playerId` 作为一个无符号的16位整数，代表将装备给定物品的玩家的玩家ID。
- `itemId` 作为一个无符号的256位整数，代表将被装备给给定玩家的物品ID。

所有这些都将作为一个字节缓冲区传递，将按顺序读取，因此确保正确的缓冲区布局顺序是至关重要的。你可以按照以下方式为上述创建缓冲区布局模式或模板：

```
import * as borsh from '@coral-xyz/borsh'

const equipPlayerSchema = borsh.struct([
  borsh.u8('variant'),
  borsh.u16('playerId'),
  borsh.u256('itemId')
])
```

然后，你可以使用这个模式和`encode`方法对数据进行编码。这个方法接受代表要序列化的数据的对象和一个缓冲区作为参数。在下面的例子中，我们分配了一个比需要的大得多的新缓冲区，然后将数据编码到该缓冲区中，并将原始缓冲区切割成一个只有所需大小的新缓冲区。

```
import * as borsh from '@coral-xyz/borsh'

const equipPlayerSchema = borsh.struct([
  borsh.u8('variant'),
  borsh.u16('playerId'),
  borsh.u256('itemId')
])

const buffer = Buffer.alloc(1000)
equipPlayerSchema.encode({ variant: 2, playerId: 1435, itemId: 737498 }, buffer)

const instructionBuffer = buffer.slice(0, equipPlayerSchema.getSpan(buffer))
```

一旦缓冲区被正确创建并且数据被序列化，剩下的就是构建交易。这类似于您在之前的课程中所做的。下面的例子假设：

- `player`、`playerInfoAccount` 和 `PROGRAM_ID` 已经在代码片段之外的某处定义
- `player` 是用户的公钥
- `playerInfoAccount` 是将编写库存更改的账户的公钥
- `SystemProgram` 将在执行指令的过程中使用。

```
import * as borsh from '@coral-xyz/borsh'
import * as web3 from '@solana/web3.js'

const equipPlayerSchema = borsh.struct([
  borsh.u8('variant'),
  borsh.u16('playerId'),
  borsh.u256('itemId')
])

const buffer = Buffer.alloc(1000)
equipPlayerSchema.encode({ variant: 2, playerId: 1435, itemId: 737498 }, buffer)

const instructionBuffer = buffer.slice(0, equipPlayerSchema.getSpan(buffer))

const endpoint = web3.clusterApiUrl('devnet')
const connection = new web3.Connection(endpoint)

const transaction = new web3.Transaction()
const instruction = new web3.TransactionInstruction({
  keys: [
    {
      pubkey: player.publicKey,
      isSigner: true,
      isWritable: false,
    },
    {
      pubkey: playerInfoAccount,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: web3.SystemProgram.programId,
      isSigner: false,
      isWritable: false,
    }
  ],
  data: instructionBuffer,
  programId: PROGRAM_ID
})

transaction.add(instruction)

web3.sendAndConfirmTransaction(connection, transaction, [player]).then((txid) => {
  console.log(`Transaction submitted: https://explorer.solana.com/tx/${txid}?cluster=devnet`)
})
```

# 实验室

让我们一起实践，通过构建一个电影评论应用，该应用允许用户提交电影评论并将其存储在Solana网络上。在接下来的几课中，我们会逐步构建这个应用，每节课增加新功能。

这是我们将要构建的程序的简要图示：

我们将用于此应用程序的Solana程序的公钥是 `CenYq6bDRB7p73EjsPEpiYN7uveyPUTdXkDkgUduboaN`。

1. **下载起始代码** 在我们开始之前，先下载起始代码。

   该项目是一个相当简单的Next.js应用程序。它包括我们在“钱包”课程中创建的WalletContextProvider，用于显示电影评论的Card组件，用于以列表形式显示评论的MovieList组件，用于提交新评论的Form组件，以及包含Movie对象类定义的Movie.ts文件。

   注意，目前当你运行npm run dev时，页面上显示的电影是模拟的。在这节课中，我们将重点放在添加新评论上，但实际上我们将无法看到该评论显示。下一节课，我们将重点放在从链上账户反序列化自定义数据上。

2. **创建缓冲区布局** 记住，要正确与Solana程序交互，您需要知道它期望数据如何结构化。我们的电影评论程序期望指令数据包含：

   - `variant` 作为无符号的8位整数，表示应执行哪个指令（换句话说，哪个程序上的函数应该被调用）。
   - `title` 作为字符串，代表您正在评论的电影的标题。
   - `rating` 作为无符号的8位整数，表示您给正在评论的电影的评分（满分为5）。
   - `description` 作为字符串，代表您为电影留下的书面评论部分。

   让我们在Movie类中配置一个borsh布局。首先导入@coral-xyz/borsh。接下来，创建一个borshInstructionSchema属性，并将其设置为包含上述属性的适当borsh结构。

   请记住，顺序很重要。如果这里的属性顺序与程序的结构不同，交易将会失败。

3. **创建序列化数据的方法** 现在我们已经设置好了缓冲区布局，让我们在Movie中创建一个名为serialize()的方法，该方法将返回一个Buffer，其中包含Movie对象属性编码成适当布局的数据。

   上面显示的方法首先为我们的对象创建一个足够大的缓冲区，然后将`{ ...this, variant: 0 }`编码到缓冲区中。因为Movie类定义包含了缓冲区布局所需的4个属性中的3个，并使用相同的命名，我们可以直接使用展开运算符并只添加variant属性。最后，该方法返回一个新的缓冲区，省略了原始缓冲区的未使用部分。

4. **用户提交表单时发送交易** 

   现在我们有了指令数据的构建块，当用户提交表单时，我们可以创建并发送交易。打开Form.tsx并找到handleTransactionSubmit函数。每次用户提交电影评论表单时，都会调用此函数。

   在此函数中，我们将创建并发送包含通过表单提交的数据的交易。

   首先导入@solana/web3.js，并从@solana/wallet-adapter-react中导入useConnection和useWallet。

   接下来，在handleSubmit函数之前，调用useConnection()获取连接对象，并调用useWallet()获取publicKey和sendTransaction。

   在我们实现handleTransactionSubmit之前，让我们谈谈需要做什么。我们需要：

   - 检查publicKey是否存在，以确保用户已连接他们的钱包。
   - 调用movie上的serialize()以获取代表指令数据的缓冲区。
   - 创建一个新的Transaction对象。
   - 获取交易将读取或写入的所有账户。
   - 创建一个新的Instruction对象，该对象在keys参数中包含所有这些账户，在data参数中包含缓冲区，并在programId参数中包含程序的公钥。
   - 将最后一步中的指令添加到交易中。
   - 调用sendTransaction，传入组装好的交易。

   这是一个相当多的过程！但别担心，做得越多就越容易。让我们从上面的前3个步骤开始：

接下来的步骤是获取交易将读取或写入的所有账户。在过去的课程中，已经给您提供了将存储数据的账户。这次，账户的地址更为动态，因此需要计算。我们将在下一课中深入讨论这一点，但现在您可以使用以下方法，其中pda是将存储数据的账户的地址：

接下来的步骤是获取交易将读取或写入的所有账户。在过去的课程中，已经给您提供了将存储数据的账户。这次，账户的地址更为动态，因此需要计算。我们将在下一课中深入讨论这一点，但现在您可以使用以下方法，其中pda是将存储数据的账户的地址：

就这样！您现在应该能够使用网站上的表单提交电影评论。虽然您不会看到UI更新以反映新的评论，但您可以在Solana Explorer上查看交易的程序日志，以确认它是否成功。

如果您需要更多时间来完成这个项目以便感到舒适，可以查看完整的解决方案代码。

# 挑战

现在轮到你独立构建一些东西了。创建一个应用程序，让这门课程的学生介绍自己！支持此应用程序的Solana程序位于 `HdE95RSVsdb315jfJtaykXhXY478h53X6okDupVfY9yf`。

![Screenshot of Student Intros frontend](https://www.soldev.app/assets/student-intros-frontend.png)

1. 您可以从头开始构建，也可以下载起始代码。 
2. 在 `StudentIntro.ts` 中创建指令缓冲区布局。
   1. 程序期望指令数据包含： variant作为无符号的8位整数，代表要运行的指令（应为0）。 
   2. name作为字符串，代表学生的名字。 
   3. message作为字符串，代表学生分享他们的Solana之旅的信息。 

3. 在StudentIntro.ts中创建一个方法，将使用缓冲区布局来序列化StudentIntro对象。 
4. 在Form组件中，实现handleTransactionSubmit函数，使其序列化StudentIntro，构建适当的交易和交易指令，并将交易提交给用户的钱包。 
5. 您现在应该能够提交介绍，并将信息存储在链上！一定要记录交易ID，并在Solana Explorer中查看以验证它是否有效。 

如果您感觉很困惑，可以查看解决方案代码。

请随意发挥这些挑战的创造力，将它们进一步发展。这些指令并不是为了阻止你！