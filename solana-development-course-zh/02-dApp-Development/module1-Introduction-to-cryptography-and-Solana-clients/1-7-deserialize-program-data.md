# 简介

程序将数据存储在PDA中，即Program Derived Address（程序派生地址）。 PDA没有对应的秘密密钥。 为了存储和定位数据，使用 `findProgramAddress(seeds, programid)` 方法来派生一个PDA。 你可以使用 `getProgramAccounts(programId)` 方法获取属于某个程序的账户。 账户数据需要使用最初存储它们时相同的布局来进行反序列化。

你可以使用 `@coral-xyz/borsh` 来创建一个模式。

# 正文

在上一节中，我们序列化了程序数据，随后这些数据被Solana程序存储在链上。在本课中，我们将更详细地介绍程序如何在链上存储数据、如何检索数据以及如何反序列化它们存储的数据。

### 程序 

正如俗话所说，Solana中的一切都是账户。甚至包括程序。程序是存储代码的账户，并被标记为可执行。这些代码可以在Solana运行时接到指令时执行。程序地址是基于Ed25519椭圆曲线的公钥。就像所有公钥一样，它们有对应的秘密密钥。

程序将数据与代码分开存储。程序在PDA中存储数据，即Program Derived Address（程序派生地址）。PDA是Solana特有的一个概念，但这种模式很熟悉：

* 你可以将PDA看作是一个键值存储，其中地址是键，账户内的数据是值。 

* 你也可以将PDA视为数据库中的记录，地址作为用于查找内部值的主键。 

PDA结合了程序地址和开发者选择的种子，以创建存储各个数据片段的地址。由于PDA是位于Ed25519椭圆曲线之外的地址，PDA没有秘密密钥。相反，PDA可以由用来创建它们的程序地址进行签名。

基于程序地址、bump和种子，可以一致地找到PDA及其内部的数据。要找到一个PDA，需要通过findProgramAddress()函数传入程序ID和开发者选择的种子（如一串文本）。

让我们看一些例子...

#### 示例：具有全局状态的程序 

一个具有全局状态的简单程序 - 像我们的ping计数器 - 可能希望只使用一个基于简单种子短语（如"GLOBAL_STATE"）的PDA。如果客户端想要从这个PDA读取数据，它可以使用程序ID和这个相同的种子来派生地址。

```
const [pda, bump] = await findProgramAddress(Buffer.from("GLOBAL_STATE"), programId)
```

![Global state using a PDA](https://www.soldev.app/assets/pdas-global-state.svg)

#### 示例：具有用户特定数据的程序

在存储用户特定数据的程序中，通常使用用户的公钥作为种子。这样将每个用户的数据分离到各自的PDA中。这种分离使得客户端能够通过使用程序ID和用户的公钥来找到每个用户的数据地址。

```
const [pda, bump] = await web3.PublicKey.findProgramAddress(
  [
    publicKey.toBuffer()
  ],
  programId
)
```

![Per user state](https://www.soldev.app/assets/pdas-per-user-state.svg)

#### 示例：每个用户有多个数据项的程序 

当每个用户有多个数据项时，程序可能会使用更多种子来创建和识别账户。例如，在一个记事本应用中，可能每个笔记都有一个账户，每个PDA都是用用户的公钥和笔记标题派生的。

```
const [pda, bump] = await web3.PublicKey.findProgramAddress(
  [
    publicKey.toBuffer(), 
    Buffer.from("Shopping list")
  ],
  programId,
);
```

![Global state using a PDA](https://www.soldev.app/assets/pdas-note-taking-program.svg)

在这个例子中，我们可以看到Alice和Bob都有一个名为'购物清单'的笔记，但由于我们使用了他们的钱包地址作为其中一个种子，这两个笔记可以同时存在。

### 获取多个程序账户 

除了派生地址外，你还可以使用connection.getProgramAccounts(programId)获取程序创建的所有账户。这将返回一个对象数组，每个对象都有一个pubkey属性，代表账户的公钥，以及一个类型为AccountInfo的account属性。你可以使用account属性来获取账户数据。

```
const accounts = connection.getProgramAccounts(programId).then(accounts => {
  accounts.map(({ pubkey, account }) => {
    console.log('Account:', pubkey)
    console.log('Data buffer:', account.data)
  })
})
```

### 反序列化程序数据 

AccountInfo对象上的data属性是一个缓冲区。为了有效地使用它，你需要编写代码将其反序列化为更易用的形式。这类似于我们在上一课中涵盖的序列化过程。和之前一样，我们将使用Borsh和@coral-xyz/borsh。如果你需要复习这些内容，请查看上一课。

反序列化需要提前了解账户布局。当创建自己的程序时，你将定义如何完成这一过程。许多程序也有关于如何反序列化账户数据的文档。否则，如果程序代码可用，你可以查看源代码以确定结构。

为了正确地从链上程序反序列化数据，你将必须创建一个客户端模式，以反映数据在账户中的存储方式。例如，以下可能是一个存储链上游戏中玩家元数据的账户的模式。

```
import * as borsh from "@coral-xyz/borsh";

borshAccountSchema = borsh.struct([
  borsh.bool("initialized"),
  borsh.u16("playerId"),
  borsh.str("name"),
]);
```

一旦你定义了布局，只需在模式上调用.decode(buffer)即可。

```
import * as borsh from "@coral-xyz/borsh";

borshAccountSchema = borsh.struct([
  borsh.bool("initialized"),
  borsh.u16("playerId"),
  borsh.str("name"),
]);

const { playerId, name } = borshAccountSchema.decode(buffer);
```

实验室 让我们继续从上一课的电影评论应用实践开始。如果你是新加入的，不用担心——无论如何，你都应该能够跟上。

作为回顾，这个项目使用了一个部署在Devnet的Solana程序，让用户可以评论电影。在上一课中，我们为前端框架添加了让用户提交电影评论的功能，但目前评论列表仍显示模拟数据。现在，我们来通过获取程序存储的账户并对存储的数据进行反序列化来解决这个问题。

1. 下载起始代码 如果你没有完成上一课的实验室活动，或者只是想确认你没有错过任何内容，你可以下载起始代码。

该项目是一个相对简单的Next.js应用程序。它包括了我们在钱包课程中创建的WalletContextProvider，一个用于展示电影评论的Card组件，一个显示评论列表的MovieList组件，一个用于提交新评论的Form组件，以及一个包含Movie对象类定义的Movie.ts文件。

请注意，当你运行npm run dev时，页面上展示的评论是模拟数据。我们接下来会用真实数据替换它们。

1. 创建缓冲区布局 要正确与Solana程序交互，你需要了解其数据结构。再次提醒一下：

程序的可执行数据存储在程序账户中，但单独的评论存储在PDA中。我们使用findProgramAddress()来为每个钱包和每个电影标题创建独特的PDA。在PDA的数据中，我们将存储以下信息：

- initialized作为布尔值，表示账户是否已初始化。
- rating作为无符号的8位整数，表示评审者给电影的评分（最高5分）。
- title作为字符串，表示被评论的电影标题。
- description作为字符串，表示评论的书面部分。

让我们在Movie类中配置一个borsh布局，来表示电影账户数据的布局。首先导入@coral-xyz/borsh。接着，创建一个borshAccountSchema静态属性，并将其设置为包含上述属性的适当borsh结构。

记住，这里的顺序很重要。它需要与账户数据的结构相匹配。

1. 创建一个反序列化数据的方法 既然我们已经设置了缓冲区布局，现在让我们在Movie中创建一个名为deserialize的静态方法，这个方法将接受一个可选的Buffer，并返回一个Movie对象或null。

该方法首先检查缓冲区是否存在，如果不存在则返回null。接着，它使用我们创建的布局来解码缓冲区，然后使用这些数据来构建并返回一个Movie实例。如果解码失败，该方法将记录错误并返回null。

1. 获取电影评论账户 现在我们有了反序列化账户数据的方法，接下来我们需要实际获取这些账户。打开MovieList.tsx并导入@solana/web3.js。然后，在MovieList组件中创建一个新的Connection。最后，用connection.getProgramAccounts的调用替换useEffect中的setMovies(Movie.mocks)这一行。将得到的数组转换成电影数组，然后调用setMovies。

此时，你应该能够运行应用并看到从程序中检索到的电影评论列表！

根据提交的评论数量，这可能需要一段时间来加载，或可能完全卡住你的浏览器。但不用担心——在下一课中，我们将学习如何对账户进行分页和过滤，以便你可以更精确地加载所需内容。

如果你需要更多时间来熟悉这个项目和这些概念，请在继续之前查看解决方案代码。

挑战 现在轮到你独立构建一些东西了。在上一课中，你在学生自我介绍应用上工作，对指令数据进行序列化并向网络发送了一条新的介绍。现在，是时候获取并反序列化程序的账户数据了。请记住，支持这个Solana程序的地址是HdE95RSVsdb315jfJtaykXhXY478h53X6okDupVfY9yf。

你可以从头开始构建，也可以下载起始代码。

- 在StudentIntro.ts中创建账户缓冲区布局。账户数据包括：
  - initialized作为无符号的8位整数，表示要运行的指令（应为1）。
  - name作为字符串，表示学生的姓名。
  - message作为字符串，表示学生分享的关于他们的Solana之旅的信息。
- 在StudentIntro.ts中创建一个静态方法，使用缓冲区布局将账户数据缓冲区反序列化为StudentIntro对象。
- 在StudentIntroList组件的useEffect中，获取程序的账户并将其数据反序列化为StudentIntro对象列表。
- 现在，你应该能看到从网络上获取的学生自我介绍，而不是模拟数据！

如果你感到非常困难，可以查看解决方案代码。

一如既往，对这些挑战发挥创意，并根据需要超出指令进行拓展！