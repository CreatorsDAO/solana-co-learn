---
sidebar_position: 18
sidebar_label: 🦺 与程序进行交互
sidebar_class_name: green
---

# 🦺 与程序进行交互

既然我们已经完成了钱包连接的设置，那么让我们让我们的ping按钮真正有所作为吧！

这是 `PingButton.tsx` 应该看起来的样子：

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
			alert("Please connect your wallet first lol")
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
			console.log(`Explorer URL: https://explorer.solana.com/tx/${sig}?cluster=devnet`)
		})
	}

	return (
		<div className={styles.buttonContainer} onClick={onClick}>
			<button className={styles.button}>Ping!</button>
		</div>
	)
}
```

这一堆东西对你来说应该很熟悉 - 我们正在做的事情与我们在本地客户端上做的完全一样，只是使用了React hooks！

是时候来测试一下了。确保你的钱包在开发网络上 - 设置 -> 开发者设置 -> 更改网络。连接你的钱包并点击那个ping按钮，你将会看到以下内容：

![](./img/upload_1.png)

如果您点击确认，您的控制台将打印出交易链接。就像之前一样，向下滚动，您会看到数字已经增加了🚀

现在你可以让用户与应用程序互动了！你在上一节中制作的那个价值1万美元的产品？现在它已经成为了一个价值百万美元的产品。想象一下所有的程序 - Metaplex、Serum、Solana程序库中的任何程序 - 你现在有能力将它们与用户界面连接起来，让人们使用。我的朋友，你可以构建未来。


## 🚢 Ship挑战 - SOL 发送者

是时候锻炼一下肌肉了。

在此挑战中，使用[此起始代码](https://github.com/RustyCab/solana-send-sol-frontend)创建一个应用程序，让用户连接其 Phantom 钱包并将 SOL 发送到另一个帐户。确保克隆后使用 `git checkout starter` 切换到起始分支。

通过两个关键步骤来做到这一点：
- 将启动应用程序包装在适当的上下文提供程序中。
- 在表单组件中，设置交易并将其发送到用户的钱包以供批准。

最后它应该看起来像这样！

![](./img/upload_2.png)

不要忘记验证地址！

完成后，将您的解决方案与此处的[解决方案代码](https://github.com/RustyCab/solana-send-sol-frontend)进行比较。
