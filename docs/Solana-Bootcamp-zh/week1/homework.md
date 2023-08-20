---
sidebar_position: 116
sidebar_label:  课后练习
sidebar_class_name: green
---

# 课后练习

通过命令行，发行一个代币。并给自己账号`mint`一定数量的代币。 并通过插件钱包或者命令行的方式给其他同学空投该代币

提示：

- 命令行操作，查看`spl-token`命令的帮助文档
- `solana config set --url https://api.devnet.solana.com`

## 示例

设置环境为开发环境：

创建账号：

```bash
$ solana-keygen new --force
Generating a new keypair

For added security, enter a BIP39 passphrase

NOTE! This passphrase improves security of the recovery seed phrase NOT the
keypair file itself, which is stored as insecure plain text

BIP39 Passphrase (empty for none):

Wrote new keypair to /Users/you/.config/solana/id.json
===========================================================================
pubkey: Czorr4y9oFvE3VdfCLVFuKDYxaNUG1iyQomR7kMZUuzi
===========================================================================
Save this seed phrase and your BIP39 passphrase to recover your new keypair:
tail ... despair
===========================================================================
```

申请水龙头：

```bash
$ solana airdrop 1
Requesting airdrop of 1 SOL

Signature: 3pDfybgjsP8oS4pX32f24SmTE4sTjPAsuJd43jqz6qAXu7vXBwaxmoAZQL3QquxXYxXChtiWuQWv79odj9XndG4A

1 SOL
```

对应浏览器 [3pDfybgjsP8oS4pX32f24SmTE4sTjPAsuJd43jqz6qAXu7vXBwaxmoAZQL3QquxXYxXChtiWuQWv79odj9XndG4A](https://solscan.io/tx/3pDfybgjsP8oS4pX32f24SmTE4sTjPAsuJd43jqz6qAXu7vXBwaxmoAZQL3QquxXYxXChtiWuQWv79odj9XndG4A?cluster=devnet)

创建`Token`：

```bash
$ spl-token create-token
Creating token 7vtXvye2ECB1T5Se8E1KebNfmV7t4VkaULDjf2v1xpA9 under program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA

Address:  7vtXvye2ECB1T5Se8E1KebNfmV7t4VkaULDjf2v1xpA9
Decimals:  9

Signature: 5QRdzn59ig3j3qjEazteDR2zoCLUWoCWdbFc7iQTd68esfdV9je3fE2We3Ms7NUGfBt6kapCj7oBAr1kbiTskSmz
```

`Token`地址：`7vtXvye2ECB1T5Se8E1KebNfmV7t4VkaULDjf2v1xpA9` 精度： 9

交易浏览器[5QRdzn59ig3j3qjEazteDR2zoCLUWoCWdbFc7iQTd68esfdV9je3fE2We3Ms7NUGfBt6kapCj7oBAr1kbiTskSmz](https://solscan.io/tx/5QRdzn59ig3j3qjEazteDR2zoCLUWoCWdbFc7iQTd68esfdV9je3fE2We3Ms7NUGfBt6kapCj7oBAr1kbiTskSmz?cluster=devnet)

创建`Token Account`:

```bash
$ spl-token create-account 7vtXvye2ECB1T5Se8E1KebNfmV7t4VkaULDjf2v1xpA9
Creating account EZhhUANUMKsRhRMArczio1kLc9axefTUAh5xofGX35AK

Signature: 59yBhJzC2HDkF61AhgaXcvVGiw5CjdnNpFyxvCzbqQrCjGCVKotNvCMaRQooJkxmu6ypJ9P7AZDiKxYex7pvBZKq
```

这里实际上调用了`ATA`合约，并创建了ATA账号：`EZhhUANUMKsRhRMArczio1kLc9axefTUAh5xofGX35AK`

交易浏览器[59yBhJzC2HDkF61AhgaXcvVGiw5CjdnNpFyxvCzbqQrCjGCVKotNvCMaRQooJkxmu6ypJ9P7AZDiKxYex7pvBZKq](https://solscan.io/tx/59yBhJzC2HDkF61AhgaXcvVGiw5CjdnNpFyxvCzbqQrCjGCVKotNvCMaRQooJkxmu6ypJ9P7AZDiKxYex7pvBZKq?cluster=devnet)

给自己的这个`Token Account`发送（`mint`）

```bash
$ spl-token mint  7vtXvye2ECB1T5Se8E1KebNfmV7t4VkaULDjf2v1xpA9 100 EZhhUANUMKsRhRMArczio1kLc9axefTUAh5xofGX35AK
Minting 100 tokens
  Token: 7vtXvye2ECB1T5Se8E1KebNfmV7t4VkaULDjf2v1xpA9
  Recipient: EZhhUANUMKsRhRMArczio1kLc9axefTUAh5xofGX35AK

Signature: 5eE21U9ukZLP7Uvck5mzBbKRcXjxEYZYxCTnJX6qoS9kdXzfhPuN8k2Ko6BBekBdP2mhLmPMHAWNJW6bqyo6mqQe
```

交易记录 [5eE21U9ukZLP7Uvck5mzBbKRcXjxEYZYxCTnJX6qoS9kdXzfhPuN8k2Ko6BBekBdP2mhLmPMHAWNJW6bqyo6mqQe](https://solscan.io/tx/5eE21U9ukZLP7Uvck5mzBbKRcXjxEYZYxCTnJX6qoS9kdXzfhPuN8k2Ko6BBekBdP2mhLmPMHAWNJW6bqyo6mqQe?cluster=devnet)

查询余额：

```bash
$ spl-token balance 7vtXvye2ECB1T5Se8E1KebNfmV7t4VkaULDjf2v1xpA9
100
```

因为这里是求取`ATA`账号，所以只需要提供`Token Mint`地址即刻。

去浏览器找一个其他地址，如`BBy1K96Y3bohNeiZTHuQyB53LcfZv6NWCSWqQp89TiVu`,这个是个SOL地址

```bash
$ spl-token transfer --fund-recipient  7vtXvye2ECB1T5Se8E1KebNfmV7t4VkaULDjf2v1xpA9 1 BBy1K96Y3bohNeiZTHuQyB53LcfZv6NWCSWqQp89TiVu
Transfer 1 tokens
  Sender: EZhhUANUMKsRhRMArczio1kLc9axefTUAh5xofGX35AK
  Recipient: BBy1K96Y3bohNeiZTHuQyB53LcfZv6NWCSWqQp89TiVu
  Recipient associated token account: H1jfKknnnyfFGYPVRd4ZHwUbXLF4PbFSWSH6wMJq6EK9
  Funding recipient: H1jfKknnnyfFGYPVRd4ZHwUbXLF4PbFSWSH6wMJq6EK9

Signature: 5VqeT7ctVtGdcJDvTmLzL4Pbti8PzM3mSrRpdE8GNG4ghF3svSJMkTn4AfNRQDSeYqCotEQuzDY9KLgdSJbKEjXt
```

这里帮这个用户创建了`ATA`账号 `H1jfKknnnyfFGYPVRd4ZHwUbXLF4PbFSWSH6wMJq6EK9`

交易为[5VqeT7ctVtGdcJDvTmLzL4Pbti8PzM3mSrRpdE8GNG4ghF3svSJMkTn4AfNRQDSeYqCotEQuzDY9KLgdSJbKEjXt](https://solscan.io/tx/5VqeT7ctVtGdcJDvTmLzL4Pbti8PzM3mSrRpdE8GNG4ghF3svSJMkTn4AfNRQDSeYqCotEQuzDY9KLgdSJbKEjXt?cluster=devnet)

查询下这个[账号](https://solscan.io/account/H1jfKknnnyfFGYPVRd4ZHwUbXLF4PbFSWSH6wMJq6EK9?cluster=devnet)

余额为1.
