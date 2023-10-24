---
sidebar_position: 18
sidebar_label: 🦺 与程序进行交互
sidebar_class_name: green
tags:
  - wallet-and-frontend
  - solana
---

# 🦺 与程序进行交互

在成功设置了钱包连接后，我们可以让`ping`按钮真正执行操作了。以下是如何实现的详细说明。

这是`PingButton.tsx`的代码示例，你可以根据下面的解释理解每个部分的功能：

```ts
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import * as Web3 from '@solana/web3.js'
import { FC } from 'react'
import styles from '../styles/PingButton.module.css'

const PROGRAM_ID = new Web3.PublicKey("ChT1B39WKLS8qUrkLvFDXMhEJ4F1XZzwUNHUt4AU9aVa")
const PROGRAM_DATA_PUBLIC_KEY = new Web3.PublicKey("Ah9K7dQ8EHaZqcAsgBW8w37yN2eAy3koFmUn4x3CJtod")

export const PingButton: FC = () => {
	const { connection } = useConnection();
	const { publicKey, sendTransaction } = useWallet();

	const onClick = () => {
		if (!connection || !publicKey) {
			alert("请先连接你的钱包！")
			return
		}

		const transaction = new Web3.Transaction()

		const instruction = new Web3.TransactionInstruction({
			keys: [
				{
					pubkey: PROGRAM_DATA_PUBLIC_KEY,
					isSigner: false,
					isWritable: true
				},
			],
			programId: PROGRAM_ID,
		});

		transaction.add(instruction)
		sendTransaction(transaction, connection).then(sig => {
			console.log(`浏览器URL: https://explorer.solana.com/tx/${sig}?cluster=devnet`)
		})
	}

	return (
		<div className={styles.buttonContainer} onClick={onClick}>
			<button className={styles.button}>Ping!</button>
		</div>
	)
}
```

你应该对这一块代码比较熟悉，它与我们在本地客户端上做的事情完全一样，但是使用了`React hooks`。

接下来就是测试时间了。

可以查看这里的[Solana钱包使用 - Backpack 🎒](../../wallet-usage/README.md)钱包使用教程切换到开发测试网。

连接你的钱包并点击那个`ping`按钮，你将会看到交互反馈。

![](./img/new-backpack.png)

点击确认后，控制台将打印出交易链接。向下滚动，你会发现数字已经增加了🚀。

现在你可以让用户与应用程序互动了！你之前所创建价值1万美元的产品？现在它已经升级成了一个价值百万美元的产品。想象一下所有的程序，比如`Metaplex`、`Solana`程序库中的任何程序，你现在可以将它们与用户界面连接起来，让人们使用。

## 🚢 挑战 - SOL 发送者

是时候挑战自己了。

在此挑战中，你将使用[此起始代码](https://github.com/all-in-one-solana/solana-send-sol-frontend.git)创建一个应用程序，允许用户连接其`Backpack🎒`钱包并将`SOL`发送到另一个账户。确保克隆后使用`git checkout starter`切换到起始分支。

你需要通过以下两个关键步骤来完成这个挑战：
- 使用适当的上下文提供程序包装启动应用程序。
- 在表单组件中，设置交易并将其发送到用户的钱包以供批准。

完成后，应用程序应该看起来像这样：

![](./img/upload_2.png)

别忘了验证地址！

完成后，你可以将你的解决方案与[解决方案代码](https://github.com/all-in-one-solana/solana-send-sol-frontend.git)进行比较。
