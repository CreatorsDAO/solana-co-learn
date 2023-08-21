---
sidebar_position: 115
sidebar_label:  Solana命令行
sidebar_class_name: green
---

# Solana命令行

接下来我们来开始体验Solana，Solana为我们提供了一套命令行工具来实现对Solana的操作。 这里注意，这个命令行工具，是除了节点外，官方提供的唯一工具。什么钱包，scan浏览器等还 都是第三方的，所以我们从这里开始。

这里建议开发工具平台使用Mac/Linux(Ubuntu),Windows不建议折腾，虽然Solana也是支持 的，下面我们以Mac作为演示平台进行讲演。

## 安装

打开命令行，输入：

```bash
$ sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
```

输出：

```bash
downloading stable installer
✨ stable commit cd1c6d0 initialized
Adding
export PATH="/Users/you/.local/share/solana/install/active_release/bin:$PATH" to /Users/you/.profile

Close and reopen your terminal to apply the PATH changes or run the following in your existing shell:

export PATH="/Users/you/.local/share/solana/install/active_release/bin:$PATH"
```

这里需要科学上网，大家自行处理。

按照提示设置好`Path`，就可以验证是否安装成功了：

```bash
$ solana --version
solana-cli 1.14.20 (src:cd1c6d0d; feat:1879391783)
```

这里打印出来cli的版本号。

更新到1.16.x版本

```bash
$ solana-install init 1.16.8
```

## 设置网络环境

Solana的网络环境分成开发网、测试网、主网三类，开发网为Solana节点开发使用，更新频繁，测试网主要 给到DApp开发者使用，相对稳定。主网则是正式环境，里面的是真金白银。

官方RPC地址分别是：

- DevNet: https://api.devnet.solana.com
- TestNet: https://api.testnet.solana.com
- MainNet: https://api.mainnet-beta.solana.com

这里我们使用开发网，开发网可以申请空投测试币。

```bash
$ solana config set --url https://api.devnet.solana.com
```

`solana config get` 输出:

```bash
Config File: /Users/you/.config/solana/cli/config.yml
RPC URL: https://api.devnet.solana.com
WebSocket URL: wss://api.devnet.solana.com/ (computed)
Keypair Path: /Users/you/.config/solana/id.json
Commitment: confirmed
```

## 创建账号

执行：

```bash
$ solana-keygen new --force
```

输出

```bash
Generating a new keypair

For added security, enter a BIP39 passphrase

NOTE! This passphrase improves security of the recovery seed phrase NOT the
keypair file itself, which is stored as insecure plain text

BIP39 Passphrase (empty for none):

Wrote new keypair to /Users/you/.config/solana/id.json
========================================================================
pubkey: 5pWae6RxD3zrYzBmPTMYo1LZ5vef3vfWH6iV3s8n6ZRG
========================================================================
Save this seed phrase and your BIP39 passphrase to recover your new keypair:
pistol note gym mesh public endless salt maximum ...
========================================================================
```

这里设置好密码后，提示`keypair`被加密存在存在"`/Users/you/.config/solana/id.json`"。 同时其对应的`BIP39`的助记词为：

```bash
pistol note gym mesh public endless salt maximum ...
```

对应的地址：`5pWae6RxD3zrYzBmPTMYo1LZ5vef3vfWH6iV3s8n6ZRG`

这里助记词要记住，后续使用钱包的时候，可以通过助记词来恢复账号。

通过如下命令可以查看当前账号的地址，也就是上面的`Keypair`文件的中的公钥：

```bash
$ solana-keygen pubkey
```

输出:
```bash
5pWae6RxD3zrYzBmPTMYo1LZ5vef3vfWH6iV3s8n6ZRG
```

## 申请水龙头

只有开发网和测试网可以申请水龙头币，这里可以通过命令行：

```bash
$ solana airdrop 1
```

输出:

```bash
Requesting airdrop of 1 SOL

Signature: 4xYKfGjWcLir8F6puSzVWafbqYhjSyESNKygPygia6RgomSJACy5MhoKXhiePtz6VQ5W8DxYF5baeB4Cf9oKnkqy

1 SOL
```

提示申请1个SOL成功。通过命令

```bash
$ solana balance
```

输出`1 SOL`的打印。

可以查看当前账号的余额。当前账号也就是"`/Users/you/.config/solana/id.json`"中存储的`keypair`对应的账号。

## 转账

这里通过命令行给另一个账号转账：

```bash
$ solana transfer --allow-unfunded-recipient CZmVK1DymrSVWHiQCGXx6VG5zgHVrh5J1P514jHKRDxA 0.01
```

输出：

```bash
Signature: 3wDKwR1GFiKoUzmNJSdTYaoKp5n5fYxNCD712V9Vpj15M6UyK2A2Gtvb8GaiaGHoA8GJki8rqTuCuHnsWiGej7rV
```

如果这个账号之前不存在，需要使用`--allow-unfunded-recipient`来进行创建。这里输出的交易`hash`，我们可以 在浏览器中看到结果。

![](../img/week1/transfer.png)

需要注意的是，这里要把环境选择为`Testnet`环境，才能看到我们的这个执行结果。
