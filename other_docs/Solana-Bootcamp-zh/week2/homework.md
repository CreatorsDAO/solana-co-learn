---
sidebar_position: 121
sidebar_label: 课后练习
sidebar_class_name: green
---

# 课后练习

通过curl和wscat命令行来模拟一个监视钱包动作

提示：

- 创建一个新账号
- 实时展示余额变化
- 列出已知SPL-Token的余额
- 实时展示SPL-Token余额变化

---

## 创建账号

我们复用前面的账号

- SOL账号： Czorr4y9oFvE3VdfCLVFuKDYxaNUG1iyQomR7kMZUuzi
- SPL-Token(Mint Account): 7vtXvye2ECB1T5Se8E1KebNfmV7t4VkaULDjf2v1xpA9
- Token Account: EZhhUANUMKsRhRMArczio1kLc9axefTUAh5xofGX35AK

## 订阅SOL余额变化

这个其实已经在课上演示过了。详情可以查看视频录像以及教程中的"订阅`Account`变化"章节

## 展示SPL-Token变化

早期的钱包是通过官方的 [token-list](https://github.com/solana-labs/token-list) 来获得 已知的SPL-Token，现在则通过Metaplex的FT标准查询。除此之外还可以通过订阅Token合约管理的账户变化 来判断是否有`Owner`为自己的`Token Account`被创建。

这里我们假设第一种情况，钱包只维护知名`token`或者用户自己添加的`Token`，比如上面的 "`7vtXvye2ECB1T5Se8E1KebNfmV7t4VkaULDjf2v1xpA9`"

我们首先获取这个SPL-Token下我们有多少 `Token Account`:

```bash
$ curl  https://api.devnet.solana.com -X POST -H "Content-Type: application/json" -d '
        {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "getTokenAccountsByOwner",
            "params": [
            "Czorr4y9oFvE3VdfCLVFuKDYxaNUG1iyQomR7kMZUuzi",
            {
                "mint": "7vtXvye2ECB1T5Se8E1KebNfmV7t4VkaULDjf2v1xpA9"
            },
            {
                "encoding": "jsonParsed"
            }
            ]
        }
    '
```

这里根据结果发现只有一个 "`EZhhUANUMKsRhRMArczio1kLc9axefTUAh5xofGX35AK`"

那么我们只需要按照教程里面，订阅这个`Account`的变化就可以了。如果有多个，那么就订阅多个。 在重复对其他 SPL-Token做同样操作，既可以完成SPL-Token钱包的功能。

首先建立websocket链接，并发起对这个`Account`的订阅：

```bash
$ wscat -c wscat -c wss://api.devnet.solana.com  --proxy=http://127.0.0.1:1087
Connected (press CTRL+C to quit)
>  {"jsonrpc":"2.0","id":1,"method":"accountSubscribe","params":["EZhhUANUMKsRhRMArczio1kLc9axefTUAh5xofGX35AK",{"encoding":"jsonParsed","commitment":"finalized"}]}
```

然后再另一个终端，用"spl-token"命令行来进行转账:

```bash
$ spl-token transfer --fund-recipient  7vtXvye2ECB1T5Se8E1KebNfmV7t4VkaULDjf2v1xpA9 1 BBy1K96Y3bohNeiZTHuQyB53LcfZv6NWCSWqQp89TiVu
Transfer 1 tokens
  Sender: EZhhUANUMKsRhRMArczio1kLc9axefTUAh5xofGX35AK
  Recipient: BBy1K96Y3bohNeiZTHuQyB53LcfZv6NWCSWqQp89TiVu
  Recipient associated token account: H1jfKknnnyfFGYPVRd4ZHwUbXLF4PbFSWSH6wMJq6EK9

Signature: 3paamDSKFk5depKufcDjmJ8wc3eXte3qcgtitFu4TyDi8z9GTXMrLGEgPHgQMnAzFBXYoWxyF5JFzA54Fjvi2ZUK
```
接着我们就可以在前面的监听中收到：

```bash
< {"jsonrpc":"2.0","method":"accountNotification","params":{"result":{"context":{"slot":236334118},"value":{"lamports":2039280,"data":{"program":"spl-token","parsed":{"info":{"isNative":false,"mint":"7vtXvye2ECB1T5Se8E1KebNfmV7t4VkaULDjf2v1xpA9","owner":"Czorr4y9oFvE3VdfCLVFuKDYxaNUG1iyQomR7kMZUuzi","state":"initialized","tokenAmount":{"amount":"92000000000","decimals":9,"uiAmount":92.0,"uiAmountString":"92"}},"type":"account"},"space":165},"owner":"TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA","executable":false,"rentEpoch":0,"space":165}},"subscription":18067841}}
```

可以看到当前余额为92了。我们在用"balance"确认下

```bash
$ spl-token balance 7vtXvye2ECB1T5Se8E1KebNfmV7t4VkaULDjf2v1xpA9
92
```
