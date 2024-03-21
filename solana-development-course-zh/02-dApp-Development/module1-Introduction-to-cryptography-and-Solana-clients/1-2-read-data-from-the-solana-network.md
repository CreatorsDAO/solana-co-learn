# 简介

Solana 的原生代币名称为 SOL。每个 SOL 由 10 亿 Lamports 组成。 

账户用于存储代币、NFT、程序和数据。目前我们将重点关注存储 SOL 的账户。 

地址指向 Solana 网络上的账户。任何人都可以读取给定地址中的数据。大多数地址也是公钥。

# 正文 

### 帐户

Solana上存储的所有数据都存储在账户中。账户可以存储：

- SOL
- 其他代币，如 USDC
- NFT
- 程序，比如我们在本课程中制作的电影评论程序
- 程序数据，比如上述程序的电影评论

### SOL

SOL 是 Solana 的原生代币 - SOL 用于支付交易费用、支付账户租金等。SOL 有时用符号 `◎` 表示。每个 SOL 由 10 亿 Lamports 组成。

就像金融应用程序通常用美分（基于美元）、便士（基于英镑）进行计算一样，Solana 应用程序通常以 Lamports 的形式转移、支付、存储和处理 SOL，只在向用户显示时才显示为完整的 SOL。

### 地址

地址用于唯一标识账户。地址通常显示为类似 `dDCQNnDmNbFVi8cQhKAgXhyhXeJ625tvwsunRyRc7c8` 的 base-58 编码字符串。

Solana 上的大多数地址也是公钥。如前一章所述，谁控制了地址相对应的私钥，谁就控制了账户 - 例如，拥有私钥的人可以从账户转走代币。

### 从 Solana 区块链读取数据

#### 安装 

我们使用一个名为 `@solana/web3.js` 的 npm 包来处理大部分与 Solana 的交互。我们还会安装 `TypeScript` 和 `esrun`，以便在命令行上运行 `.ts` 文件：

```
npm install typescript @solana/web3.js esrun
```

#### 连接到网络

使用 `@solana/web3.js` 与 Solana 网络的每次交互都将通过一个 `Connection` 对象进行。`Connection` 对象建立与特定 Solana 网络（称为「集群」）的连接。

目前我们将使用 Devnet 集群而非 Mainnet。Devnet 旨在供开发者使用和测试，Devnet 代币没有实际价值，仅作为开发测试使用。

```
import { Connection, clusterApiUrl } from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("devnet"));
console.log(`✅ Connected!`)
```

运行此 TypeScript ，在命令行运行 `npx esrun example.ts` 你可以看到以下内容：

```
✅ Connected!
```

#### 从网络读取

要读取账户的余额：

```
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("devnet"));
const address = new PublicKey('CenYq6bDRB7p73EjsPEpiYN7uveyPUTdXkDkgUduboaN');
const balance = await connection.getBalance(address);

console.log(`The balance of the account at ${address} is ${balance} lamports`); 
console.log(`✅ Finished!`)
```

返回的余额以 Lamports 作为单位，如前所述。`Web3.js` 提供了一个常量 `LAMPORTS_PER_SOL` 用于将 Lamports 显示为 SOL：

```
import { Connection, PublicKey, clusterApiUrl, LAMPORTS_PER_SOL } from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("devnet"));
const address = new PublicKey('CenYq6bDRB7p73EjsPEpiYN7uveyPUTdXkDkgUduboaN');
const balance = await connection.getBalance(address);
const balanceInSol = balance / LAMPORTS_PER_SOL;

console.log(`The balance of the account at ${address} is ${balanceInSol} SOL`); 
```

运行 `npx esrun example.ts` 将显示类似以下内容：

```
The balance of the account at CenYq6bDRB7p73EjsPEpiYN7uveyPUTdXkDkgUduboaN is 0.00114144 SOL
✅ Finished!
```

就这样，我们从 Solana 区块链读取了数据！

# 实验

让我们实践所学内容，并检查特定地址的余额。

### 加载密钥对

记住前一章节中的公钥。

创建一个名为 check-balance.ts 的新文件，并用你的公钥替换 `<your public key>`。

脚本加载公钥，连接到 DevNet，并检查余额：

```
import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

const publicKey = new PublicKey("<your public key>");

const connection = new Connection("https://api.devnet.solana.com", "confirmed");

const balanceInLamports = await connection.getBalance(publicKey);

const balanceInSOL = balanceInLamports / LAMPORTS_PER_SOL;

console.log(
  `💰 Finished! The balance for the wallet at address ${publicKey} is ${balanceInSOL}!`
);
```

将此保存到一个文件中，并运行 npx esrun check-balance.ts。你应该看到类似以下内容：

```
💰 Finished! The balance for the wallet at address 31ZdXAvhRQyzLC2L97PC6Lnf2yWgHhQUKKYoUo9MLQF5 is 0!
```

### 获取 Devnet Sol

在 Devnet 中，你可以获取免费的 SOL 进行开发。可以将 Devnet SOL 视为棋盘游戏货币 - 它看起来有价值，但实际上没有价值。

[获取一些 Devnet SOL](https://faucet.solana.com/)，并使用你的密钥对的公钥作为地址。

你可以选择任意数量的 SOL。

### 检查你的余额

重新运行脚本。你应该看到你的余额已更新：

```
💰 Finished! The balance for the wallet at address 31ZdXAvhRQyzLC2L97PC6Lnf2yWgHhQUKKYoUo9MLQF5 is 0.5!
```

### 检查其他学生的余额

你可以修改脚本以检查任何钱包的余额。

```
import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

const suppliedPublicKey = process.argv[2];
if (!suppliedPublicKey) {
  throw new Error("Provide a public key to check the balance of!");
}

const connection = new Connection("https://api.devnet.solana.com", "confirmed");

const publicKey = new PublicKey(suppliedPublicKey);

const balanceInLamports = await connection.getBalance(publicKey);

const balanceInSOL = balanceInLamports / LAMPORTS_PER_SOL;

console.log(
  `✅ Finished! The balance for the wallet at address ${publicKey} is ${balanceInSOL}!`
);
```

与同学们在聊天中交换钱包地址，并检查他们的余额。

```
% npx esrun check-balance.ts (some wallet address)
✅ Finished! The balance for the wallet at address 31ZdXAvhRQyzLC2L97PC6Lnf2yWgHhQUKKYoUo9MLQF5 is 3!
```

并检查几个同学的余额。

# 挑战

按照以下方式修改脚本：

* 添加处理无效钱包地址的指令。 

* 修改脚本以连接到 mainNet，并查找一些著名的 Solana 钱包。尝试 `toly.sol`、`shaq.sol` 或 `mccann.sol`。 

我们将在下一课中学习转移 SOL！