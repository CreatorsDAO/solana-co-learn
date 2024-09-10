# 简介

* 密钥对是一对相匹配的公钥和私钥。

- 公钥用作指向Solana网络上账户的“地址”。公钥可以与任何人共享。
- 私钥用于验证对账户的控制权。顾名思义，您应该始终保密私钥。

* `@solana/web3.js` 提供了用于创建全新密钥对的辅助函数，或者使用现有的私钥构建密钥对。

# 正文

### 对称加密和非对称加密

「密码学」字面上是指隐藏信息的研究。我们常常会遇到两种主要类型的密码学：

#### 对称加密

对称加密中，加密和解密使用同一个密钥。它有几百年的历史，从古埃及人到伊丽莎白一世女王都曾使用。

对称加密算法有很多种，目前常见的对称加密算法有AES和Chacha20。

#### 非对称加密

非对称加密，也称为「公钥密码学」，发展于20世纪70年代。在非对称加密中，参与者拥有一对密钥（或密钥对）。每个密钥对包括一个私钥和一个公钥。

非对称加密与对称加密的工作方式不同，用处也不同：

- 加密：如果用公钥加密，只有同一密钥对的私钥才能读取它。
- 签名：如果用私钥加密，可以使用同一密钥对的公钥证明私钥持有者进行了签名。

* 您甚至可以使用非对称密码学来确定用于对称密码学的好密钥！这被称为密钥交换，您可以使用您的公钥和收件人的公钥来想出一个'会话'密钥。

对称加密算法也有很多种，目前最常见的非对称加密算法是ECC或RSA的变种。

非对称加密非常流行：

- 您的银行卡内部有一个私钥，用于签署交易。
- 您的银行可以通过匹配的公钥确认您进行了交易。
- 网站在其证书中包含一个公钥，您的浏览器将使用此公钥加密发送到网页的数据（如个人信息、登录详情和信用卡号）。
- 网站拥有匹配的私钥，因此网站可以读取数据。
- 您的电子护照由发行国签署，以确保护照不被伪造。
- 电子护照闸门可以使用您的发行国的公钥来确认这一点。
- 您手机上的消息应用使用密钥交换来生成会话密钥。

总之，密码学无处不在。Solana以及其他区块链只是密码学的一种用途。

### Solana使用公钥作为地址。

![Solana wallet addresses](https://www.soldev.app/assets/wallet-addresses.svg)

### 在Solana网络中的参与者

参与Solana网络的人至少拥有一个密钥对。在Solana中：

- 公钥用作指向Solana网络上账户的“地址”。即使是人们易读的文件名 - 如`example.sol` - 也指向像`dDCQNnDmNbFVi8cQhKAgXhyhXeJ625tvwsunRyRc7c8`这样的地址。
- 私钥用于验证对该密钥对的控制权。如果您拥有某个地址的私钥，您就控制该地址内的代币。因此，正如「私钥」这个名字所提示的，您应该始终将私钥保密。

### 使用@solana/web3.js创建密钥对

您可以通过npm模块 `@solana/web3.js` 在浏览器或node.js中使用Solana区块链。按照您通常的方式设置项目，然后使用npm安装 `@solana/web3.js`：

```
npm i @solana/web3.js
```

我们将在本课程中逐步介绍 `web3.js` 的很多内容，但您也可以查看官方的[web3.js文档](https://docs.solana.com/developing/clients/javascript-reference)。

要发送代币、发送NFT或在Solana上读写数据，您需要自己的密钥对。要创建一个新的密钥对，请使用 `@solana/web3.js` 中的 `Keypair.generate()` 函数：

```
import { Keypair } from "@solana/web3.js";

const keypair = Keypair.generate();

console.log(`公钥是: `, keypair.publicKey.toBase58());
console.log(`私钥是: `, keypair.secretKey);
```

### ⚠️ 不要在源代码中包含私钥 

由于可以从私钥重新生成密钥对，我们通常只存储私钥，并从私钥恢复密钥对。

此外，由于私钥对地址有控制权，我们不会在源代码中存储私钥。相反，我们：

- 将私钥放在 `.env` 文件中
- 将 `.env` 添加到` .gitignore` 中，以便上传代码的时候可以不上传` .env` 文件。

### 加载现有的密钥对

如果您已经有一个想要使用的密钥对，您可以从文件系统或 ` .env` 文件中加载现有的私钥来创建Keypair。在node.js中，npm包 ` @solana-developers/node-helpers`  包括一些额外的函数：

- 要使用 `.env` 文件，请使用 `getKeypairFromEnvironment()`
- 要使用Solana CLI文件，请使用 `getKeypairFromFile()`

```
import "dotenv/config";
import { getKeypairFromEnvironment } from "@solana-developers/node-helpers";

const keypair = getKeypairFromEnvironment("SECRET_KEY");
```

您现在知道如何制作和加载密钥对了！让我们做一些练习，实践一下我们刚才所学到的。

# 实验

### 安装

创建一个新目录，安装TypeScript, Solana web3.js 和 esrun：

```
mkdir generate-keypair
cd generate-keypair
npm init -y
npm install typescript @solana/web3.js esrun @solana-developers/node-helpers
```

创建一个名为 `generate-keypair.ts` 的新文件：

```
import { Keypair } from "@solana/web3.js";
const keypair = Keypair.generate();
console.log(`✅ Generated keypair!`)
```

运行 `npx esrun generate-keypair.ts`。你应该会看到文本：

```
✅ Generated keypair!
```

每个Keypair都有一个publicKey和secretKey属性。更新文件：

```
import { Keypair } from "@solana/web3.js";

const keypair = Keypair.generate();

console.log(`The public key is: `, keypair.publicKey.toBase58());
console.log(`The secret key is: `, keypair.secretKey);
console.log(`✅ Finished!`);
```

运行 `npx esrun generate-keypair.ts`。你应该会看到文本：

```
The public key is:  764CksEAZvm7C1mg2uFmpeFvifxwgjqxj2bH6Ps7La4F
The secret key is:  Uint8Array(64) [
  (a long series of numbers) 
]
✅ Finished!
```

### 从 .env 文件加载现有的密钥对

为了确保你的秘密密钥安全，我们推荐使用 .env 文件来注入秘密密钥：

创建一个名为 `.env` 的新文件，内容为你之前制作的密钥：

```
SECRET_KEY="[(a series of numbers)]"
```

我们可以从环境中加载密钥对。更新 `generate-keypair.ts` 文件：

```
import "dotenv/config"
import { getKeypairFromEnvironment } from "@solana-developers/node-helpers";

const keypair = getKeypairFromEnvironment("SECRET_KEY");

console.log(
  `✅ Finished! We've loaded our secret key securely, using an env file!`
);
```

运行 `npx esrun generate-keypair.ts`。你应该会看到以下结果：

```
✅ Finished! We've loaded our secret key securely, using an env file!
```

我们已经学习了关于密钥对的知识，以及如何在Solana上安全地存储秘密密钥。在下一章节，我们将使用它们！