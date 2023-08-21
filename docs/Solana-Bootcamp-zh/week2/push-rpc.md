---
sidebar_position: 120
sidebar_label: 推送RPC
sidebar_class_name: green
---

# 推送RPC

推送RPC，其实是RPC节点允许连接的一个WebSocket长连接。通过在该长连接上发送订阅请求， RPC节点会将相关事件在长连接上推送过来。当前订阅主要分为：

- `accountSubscribe` : 订阅`Account`的变化，比如`lamports`
- `logsSubscribe` : 订阅交易的日志
- `programSubscribe` ： 订阅合约`Account`的变化
- `signatureSubscribe` : 订阅签名状态变化
- `slotSubscribe` : 订阅`slot`的变化

每个事件，还有对应的`Unsubscribe`动作，取消订阅。将上面的`Subscribe`替换成`Unsubscribe`即可。

这里我们通过`wscat`命令行工具来模拟`wss`客户端。首先安装工具：

```bash
npm install -g ws wscat
```

然后建立连接：

```bash
wscat -c wss://api.devnet.solana.com
```

下面举例说明：

## 订阅Account变化

这里的`Account`就是每个地址的`Account`元数据。主要变化的就是`data`部分和`lamports`部分。 比如我们要订阅我们的账号余额的变化。

```json
{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "accountSubscribe",
    "params": [
        "CnjrCefFBHmWnKcwH5T8DFUQuVEmUJwfBL3Goqj6YhKw",
        {
        "encoding": "jsonParsed",
        "commitment": "finalized"
        }
    ]
}
```

这里订阅对账号的变化的事件，我们通过`wscat`来模拟：

```bash
$ wscat -c wss://api.devnet.solana.com
    Connected (press CTRL+C to quit)
    > {"jsonrpc":"2.0","id":1,"method":"accountSubscribe","params":["EZhhUANUMKsRhRMArczio1kLc9axefTUAh5xofGX35AK",{"encoding":"jsonParsed","commitment":"finalized"}]}
    < {"jsonrpc":"2.0","result":3283925,"id":1}
```

然后我们在另外一个终端里面进行转账：

```bash
$ solana transfer --allow-unfunded-recipient CZmVK1DymrSVWHiQCGXx6VG5zgHVrh5J1P514jHKRDxA 0.01
```

接着我们注意观察上面的`wscat`:

```bash
Connected (press CTRL+C to quit)
    > {"jsonrpc":"2.0","id":1,"method":"accountSubscribe","params":["CnjrCefFBHmWnKcwH5T8DFUQuVEmUJwfBL3Goqj6YhKw",{"encoding":"jsonParsed","commitment":"finalized"}]}
    < {"jsonrpc":"2.0","result":3283925,"id":1}
    < {"jsonrpc":"2.0","method":"accountNotification","params":{"result":{"context":{"slot":209127027},"value":{"lamports":989995000,"data":["","base64"],"owner":"11111111111111111111111111111111","executable":false,"rentEpoch":0,"space":0}},"subscription":3283925}}
```

会发现，一段时间后，也就是到达了 “`finalized`”状态后，就会将修改过后的`Account`信息推送过来：

```json
{
    "lamports": 989995000,
    "data": [
        "",
        "base64"
    ],
    "owner": "11111111111111111111111111111111",
    "executable": false,
    "rentEpoch": 0,
    "space": 0
}
```

可以看到这里余额发生了变化

## 订阅日志

订阅日志可能是做应用最常见到的，任何在`log`里面打印了相关事件的交易都会被通知

```json
{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "logsSubscribe",
    "params": [
        {
            "mentions": [ "CdJp6W7S8muM85UXq7u2P42ryytDacqEo8JgoHENSiUi" ]
        },
        {
            "commitment": "finalized"
        }
    ]
}
```

这里`mentions`来指定，通知了哪个程序或者账号的地址。

比如这里我们订阅我们的一个`ATA`的账号：

```bash
$ wscat -c wss://api.devnet.solana.com
    Connected (press CTRL+C to quit)
    > {"jsonrpc":"2.0","id":1,"method":"logsSubscribe","params":[{"mentions":["CdJp6W7S8muM85UXq7u2P42ryytDacqEo8JgoHENSiUi"]},{"commitment":"finalized"}]}
    < {"jsonrpc":"2.0","result":610540,"id":1}
```

然后我们给这个地址做`mint`增加他的余额：

```bash
$ spl-token mint 7dyTPp6Jd1nWWyz3y7CXqdSG86yFpVF7u45ARKnqDhRF 1000000000
    Minting 1000000000 tokens
    Token: 7dyTPp6Jd1nWWyz3y7CXqdSG86yFpVF7u45ARKnqDhRF
    Recipient: CdJp6W7S8muM85UXq7u2P42ryytDacqEo8JgoHENSiUi

    Signature: 5NVHNccPo4ADxnHZjVSYZzxk3fuZfZvuLP6MwkhSNBbQRNcGfC2gwScz24XYictZuqaMKFEcmsXuHV4WZDiFUD3r
```

可以在事件通知中看到：

```bash
$ wscat -c wss://api.devnet.solana.com
    Connected (press CTRL+C to quit)
    > {"jsonrpc":"2.0","id":1,"method":"logsSubscribe","params":[{"mentions":["CdJp6W7S8muM85UXq7u2P42ryytDacqEo8JgoHENSiUi"]},{"commitment":"finalized"}]}
    < {"jsonrpc":"2.0","result":610540,"id":1}
    < {"jsonrpc":"2.0","method":"logsNotification","params":{"result":{"context":{"slot":209131722},"value":{"signature":"5NVHNccPo4ADxnHZjVSYZzxk3fuZfZvuLP6MwkhSNBbQRNcGfC2gwScz24XYictZuqaMKFEcmsXuHV4WZDiFUD3r","err":null,"logs":["Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA invoke [1]","Program log: Instruction: MintToChecked","Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA consumed 4498 of 200000 compute units","Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA success"]}},"subscription":610540}}
```

这里有个"`MintToChecked`"指令。

## 订阅合约所属于`Account`事件


比如我们希望知道所有`Token`合约管理的账号的余额变化是，我们可以通过订阅合约管理的账号事件来发现：

```json
{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "programSubscribe",
    "params": [
        "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        {
        "encoding": "jsonParsed"
        }
    ]
}
```

对应的命令

```bash
$ wscat -c wss://api.devnet.solana.com
    Connected (press CTRL+C to quit)
    > {"jsonrpc":"2.0","id":1,"method":"programSubscribe","params":["TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",{"encoding":"jsonParsed"}]}
    < {"jsonrpc":"2.0","result":142408,"id":1}
    < {"jsonrpc":"2.0","method":"programNotification","params":{"result":{"context":{"slot":209131042},"value":{"pubkey":"GGUY45VyYy9j7vFdHRP3ecyMYhFCfrCBpVQaUxoEtHfv","account":{"lamports":2039280,"data":{"program":"spl-token","parsed":{"info":{"isNative":false,"mint":"GCBnu9k28isstJjCcYoZZcyTkMh5cXTsk7abpgWJesQT","owner":"AV1JYHgShqNdbza84sLi7Hgbtfgd1hn9mNMgez4twBuG","state":"initialized","tokenAmount":{"amount":"0","decimals":9,"uiAmount":0.0,"uiAmountString":"0"}},"type":"account"},"space":165},"owner":"TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA","executable":false,"rentEpoch":0,"space":165}}},"subscription":142408}}
    < {"jsonrpc":"2.0","method":"programNotification","params":{"result":{"context":{"slot":209131042},"value":{"pubkey":"GGUXUncym8riA1izYZnBWspYL1k4rVBnLuZ3KbUnc6WG","account":{"lamports":2039280,"data":{"program":"spl-token","parsed":{"info":{"isNative":false,"mint":"GCBnu9k28isstJjCcYoZZcyTkMh5cXTsk7abpgWJesQT","owner":"2E7BD9ibbHinwohM4pLFsjdFYq1S2o4wqKmfaQXXg8Dr","state":"initialized","tokenAmount":{"amount":"0","decimals":9,"uiAmount":0.0,"uiAmountString":"0"}},"type":"account"},"space":165},"owner":"TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA","executable":false,"rentEpoch":0,"space":165}}},"subscription":142408}}
    < {"jsonrpc":"2.0","method":"programNotification","params":{"result":{"context":{"slot":209131042},"value":{"pubkey":"GGUZyCzhCKEFZMdf8mDfUU4L1tr4q2xh3FHRWpRM8cPB","account":{"lamports":2039280,"data":{"program":"spl-token","parsed":{"info":{"isNative":false,"mint":"GCBnu9k28isstJjCcYoZZcyTkMh5cXTsk7abpgWJesQT","owner":"7PydWu5QtMcbdj7qgdgn42Rwp247GFf3e2pQ5fQ8LRGY","state":"initialized","tokenAmount":{"amount":"0","decimals":9,"uiAmount":0.0,"uiAmountString":"0"}},"type":"account"},"space":165},"owner":"TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA","executable":false,"rentEpoch":0,"space":165}}},"subscription":142408}}
    < {"jsonrpc":"2.0","method":"programNotification","params":{"result":{"context":{"slot":209131042},"value":{"pubkey":"GGUZzsex1ybU4V1duGetLHqFc7zz74jPbLp6rvNoScrR","account":{"lamports":2039280,"data":{"program":"spl-token","parsed":{"info":{"isNative":false,"mint":"GCBnu9k28isstJjCcYoZZcyTkMh5cXTsk7abpgWJesQT","owner":"2E7BD9ibbHinwohM4pLFsjdFYq1S2o4wqKmfaQXXg8Dr","state":"initialized","tokenAmount":{"amount":"0","decimals":9,"uiAmount":0.0,"uiAmountString":"0"}},"type":"account"},"space":165},"owner":"TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA","executable":false,"rentEpoch":0,"space":165}}},"subscription":142408}}
    < {"jsonrpc":"2.0","method":"programNotification","params":{"result":{"context":{"slot":209131042},"value":{"pubkey":"GGUV4mWenyQGyVVCNV3xPjmioJoMCCYSPFxFzFB3AmBt","account":{"lamports":2039280,"data":{"program":"spl-token","parsed":{"info":{"isNative":false,"mint":"GCBnu9k28isstJjCcYoZZcyTkMh5cXTsk7abpgWJesQT","owner":"2E7BD9ibbHinwohM4pLFsjdFYq1S2o4wqKmfaQXXg8Dr","state":"initialized","tokenAmount":{"amount":"0","decimals":9,"uiAmount":0.0,"uiAmountString":"0"}},"type":"account"},"space":165},"owner":"TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA","executable":false,"rentEpoch":0,"space":165}}},"subscription":142408}}
```

这里里面就可以看到。有很多的SPL Token账号都在变化。并且因为我们加了"`jsonParsed`",所以这里SPL Token的内容也展示出来了。

## 订阅交易状态

比如我们希望在我们发起交易后，第一时间知道交易的确定状态，我们可以通过订阅该事件来实现：


```json
{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "signatureSubscribe",
    "params": [
            "BfQAbgqQZMfsxFHwh6Hve8yGb843QfZcYtD2j2nN3K1hLHZrQjzdwG9uWgNkGXs4tBNVLE3JAzvNLtwJBt3zDsN",
            {
            "commitment": "finalized",
            "enableReceivedNotification": false
            }
        ]
}
```

这里。我们再次发起一笔转账交易：

```bash
$ solana transfer --allow-unfunded-recipient CZmVK1DymrSVWHiQCGXx6VG5zgHVrh5J1P514jHKRDxA 0.01

    Signature: BfQAbgqQZMfsxFHwh6Hve8yGb843QfZcYtD2j2nN3K1hLHZrQjzdwG9uWgNkGXs4tBNVLE3JAzvNLtwJBt3zDsN
```

然后在另外一个终端，迅速建立`wscat`连接，并订阅该事件：

```bash
$ wscat -c wss://api.devnet.solana.com
    Connected (press CTRL+C to quit)
    > {"jsonrpc":"2.0","id":1,"method":"signatureSubscribe","params":["BfQAbgqQZMfsxFHwh6Hve8yGb843QfZcYtD2j2nN3K1hLHZrQjzdwG9uWgNkGXs4tBNVLE3JAzvNLtwJBt3zDsN",{"commitment":"finalized","enableReceivedNotification":false}]}
    < {"jsonrpc":"2.0","result":3285176,"id":1}
    < {"jsonrpc":"2.0","method":"signatureNotification","params":{"result":{"context":{"slot":209127740},"value":{"err":null}},"subscription":3285176}}
```

可以看到。当到达"`finalized`"状态时，通知我们，该交易已经成功，没有出错。
