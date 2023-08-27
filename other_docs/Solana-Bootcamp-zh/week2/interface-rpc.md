---
sidebar_position: 119
sidebar_label: 接口RPC
sidebar_class_name: green
---

# 接口RPC

## 节点相关接口

### 获取集群节点信息

通过`getClusterNodes`方法可以获得当前网络内，集群节点的相关信息，比如验证者的`key`，节点IP，节点版本等。

```bash
$ curl https://api.devnet.solana.com -X POST -H "Content-Type: application/json" -d '
        {
        "jsonrpc": "2.0", "id": 1,
        "method": "getClusterNodes"
    }'
```

得到的输出类似这样：

```json
{
    "jsonrpc": "2.0",
    "result": [
        {
        "featureSet": 2891131721,
        "gossip": "67.209.54.46:8001",
        "pubkey": "8pgVP32abaxodvpJx3iXo4o9FUWzarudQ7RHZAkkqEKi",
        "pubsub": null,
        "rpc": null,
        "shredVersion": 28353,
        "tpu": "67.209.54.46:8004",
        "tpuQuic": "67.209.54.46:8010",
        "version": "1.16.2"
        }
    ...
    ]
}
```

从结果字段名，也可以比较直观的推出这些字段的意义

## 区块相关接口

### 获取当前区块高度

通过`getBlockHeight`可以获取当前的区块高度

```bash
$ curl https://api.devnet.solana.com -X POST -H "Content-Type: application/json" -d '
    {
        "jsonrpc":"2.0","id":1,
        "method":"getBlockHeight"
    }
    '
```

得到输出：

```json
{
    "jsonrpc": "2.0",
    "result": 174302040,
    "id": 1
}
```

可以看到，当前测试网的高度到了`174302040`。

### 获取最近的`Block Hash`

通过`getLatestBlockhash`可以获得连上最近的一个`Block`的`Hash`值和高度

```bash
$ curl https://api.devnet.solana.com -X POST -H "Content-Type: application/json" -d '
    {
        "id":1,
        "jsonrpc":"2.0",
        "method":"getLatestBlockhash",
        "params":[
        {
            "commitment":"processed"
        }
        ]
    }
    '
```

得到结果：

```json
{
    "jsonrpc": "2.0",
    "result": {
        "context": {
            "apiVersion": "1.16.2",
            "slot": 207172864
        },
        "value": {
        "blockhash": "2rSgjtXjKDcMYZTdSErwSz9bPXota73uecdJXUxEz2a5",
        "lastValidBlockHeight": 174481567
        }
    },
    "id": 1
}
```

这里根据字面意思，可以看到最近的一个区块的`slot`,`hash`以及`block height`。

### 获取指定高度`block`的信息

获取指定高度`block`的信息，通过`getBlock`方法。如

```bash
$ curl https://api.devnet.solana.com -X POST -H "Content-Type: application/json" -d '
    {
        "jsonrpc": "2.0","id":1,
        "method":"getBlock",
        "params": [
            174302734,
            {
                "encoding": "jsonParsed",
                "maxSupportedTransactionVersion":0,
                "transactionDetails":"full",
                "rewards":false
            }
        ]
    }
    '
```

这里结果太多，不再罗列。在请求中，我们加入了 `"encoding": "jsonParsed"`，将结果按照json的格式 进行展示。`transactionDetails` 设置返回的交易信息的内容复杂等级，设置有`"full","accounts","signatures","none",` 默认是`"full"`。`maxSupportedTransactionVersion`这个参数和后面介绍的带版本号的交易有关，表示返回最大的版本号，当前 可以传`0`即可，默认也是`0`。布尔值`rewards`表示是否携带`rewards`信息。

### 获取指定`block`的确认状态

有时候在上面获得当前最高区块，但是查询区块信息的时候却又查询不到，这里可以通过`getBlockCommitment`查看下对应区块的状态。

```bash
$ curl https://api.devnet.solana.com -X POST -H "Content-Type: application/json" -d '
    {
        "jsonrpc": "2.0", "id": 1,
        "method": "getBlockCommitment",
        "params":[174302734]
    }
    '
```

得到结果：

```json
{
    "jsonrpc": "2.0",
    "result": {
        "commitment": null,
        "totalStake": 144333782793465543
    },
    "id": 1
}
```

这里`totalStake`表示提交确认的节点总共`Stake`的SOL数目，也就是POS的权重。如果`commitment`不为`null`的时候，将是一个数组 表示各个集群中Stake的数量分布。

### 一次性获取多个`Block`的信息

前面的`getBlock`获得了单个`Block`的信息，还可以通过`getBlocks`一次性获得多个`Block`的信息。

```bash
$ curl https://api.devnet.solana.com -X POST -H "Content-Type: application/json" -d '
    {
        "jsonrpc": "2.0", "id": 1,
        "method": "getBlocks",
        "params": [
            174302734, 174302735
        ]
    }
    '
```

其余参数都是一样的，这里参数中，前面的部分是`block number`的数组

### 分页获取`Block`

前面两个获取`Block`信息的方法，分别可以获得单个`Block`和多个指定`Block`号的信息。因为`Block Number`是递增且不一定连续的，因此 还Solana还提供了一个分页查询的方式`getBlocksWithLimit`，从起始号查询多少个。

```bash
$ curl https://api.devnet.solana.com -X POST -H "Content-Type: application/json" -d '
  {
    "jsonrpc": "2.0",
    "id":1,
    "method":"getBlocksWithLimit",
    "params":[174302734, 3]
  }
'
```

得到：

```json
{
    "jsonrpc": "2.0",
    "result": [
        174302734,
        174302735,
        174302736
    ],
    "id": 1
}
```
三个`BlockNumber`，接着我们可以前面的`GetBlocks`来获得这三个`Block`的详细信息。


## `Slot`和`Epoch`相关接口

### 获取当前`Epoch`信息

首先`Epoch`是什么，在前面也有介绍到，`epoch`在一般POS中比较常见，表示这个周期内，一些参与验证的节点信息是固定的，如果有新节点或者节点权重变更，将在下一个`epoch`中生效。

```bash
$ curl https://api.devnet.solana.com -X POST -H "Content-Type: application/json" -d '
    {"jsonrpc":"2.0","id":1, "method":"getEpochInfo"}
    '
```

输出类似：

```json
{
    "jsonrpc": "2.0",
    "result": {
        "absoluteSlot": 207170348,
        "blockHeight": 174478875,
        "epoch": 492,
        "slotIndex": 150092,
        "slotsInEpoch": 432000,
        "transactionCount": 258177341740
    },
    "id": 1
}
```

里面有当前周期的区块高度，`slot`数目，以及`transaction`的数目。

而`getEpochSchedule`方法则是获取`Epoch`的调度信息，

```bash
$ curl https://api.devnet.solana.com -X POST -H "Content-Type: application/json" -d '
    {
        "jsonrpc":"2.0","id":1,
        "method":"getEpochSchedule"
    }
    '
```

可以看到输出中：

```json
{
    "jsonrpc": "2.0",
    "result": {
        "firstNormalEpoch": 14,
        "firstNormalSlot": 524256,
        "leaderScheduleSlotOffset": 432000,
        "slotsPerEpoch": 432000,
        "warmup": true
    },
    "id": 1
}
```

从字面意思也能看到，这里有`Epoch`中`slot`的数目，起始值等信息。

### 获取最新`Slot`

和`Epoch`类似，可以获得当前的`Slot`:

```bash
$ curl https://api.devnet.solana.com -X POST -H "Content-Type: application/json" -d '
        {"jsonrpc":"2.0","id":1, "method":"getSlot"}
    '
```

直接得到`slot`值：


```json
{
    "jsonrpc":"2.0",
    "result":209119756,
    "id":1
}
```

## 账号相关接口

### 获取`Account`信息

第一章有介绍，`Solana`上存储的内容，都是一个`Account`对象，有基础的元数据信息：

```rust
pub struct Account {
    /// lamports in the account
    pub lamports: u64,
    /// data held in this account
    #[serde(with = "serde_bytes")]
    pub data: Vec<u8>,
    /// the program that owns this account. If executable, the program that loads this account.
    pub owner: Pubkey,
    /// this account's data contains a loaded program (and is now read-only)
    pub executable: bool,
    /// the epoch at which this account will next owe rent
    pub rent_epoch: Epoch,
}
```

我们可以通过`getAccountInfo` RPC请求来查看,比如查看我们前面的测试账号：

```bash
$ curl https://api.devnet.solana.com -X POST -H "Content-Type: application/json" -d '
    {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "getAccountInfo",
        "params": [
            "5pWae6RxD3zrYzBmPTMYo1LZ5vef3vfWH6iV3s8n6ZRG",
            {
                "encoding": "base58",
                "commitment": "finalized"
            }
        ]
    }
    '
```

这里我们通过curl来直接发起HTTP请求，最直观的看发生什么。请求中我们指定了测试网的RPC地址。 `https://api.devnet.solana.com` 得到

```json
{
    "jsonrpc": "2.0",
    "result": {
        "context": {
            "apiVersion": "1.16.1",
            "slot": 206885329
        },
        "value": {
            "data": [
                "",
                "base58"
            ],
            "executable": false,
            "lamports": 59597675320,
            "owner": "11111111111111111111111111111111",
            "rentEpoch": 349,
            "space": 0
        }
    },
    "id": 1
}
```

在`result`里面可以看到`value`里面的值项目，和Rust的结构体是一一对应的，其中`data`表示数据内容， 这里我们的普通账号不是合约账号，因此其为空，后面的`"base58"`表示如果这里有值，那么他将是二进制 内容的`base58`格式编码。这个编码格式是我们在请求里面的`"encoding"`来指定的。`"executable"`表示 是否为可执行合约，`"lamports"`表示余额，这里精度`*10^9`。所有普通账号的`Owner`都是系统根账号： `"11111111111111111111111111111111"`。

### 获取账号余额

在上面的`Account`信息里面，我们已经可以知道账号余额`lamports`了，同时RPC还提供了`getBalance`可以更 简洁的得到余额信息：

```bash
$ curl https://api.devnet.solana.com -X POST -H "Content-Type: application/json" -d '
    {
        "jsonrpc": "2.0", "id": 1,
        "method": "getBalance",
        "params": [
            "5pWae6RxD3zrYzBmPTMYo1LZ5vef3vfWH6iV3s8n6ZRG"
        ]
    }
    '
```

得到：

```json
{
    "jsonrpc": "2.0",
    "result": {
        "context": {
            "apiVersion": "1.16.1",
            "slot": 206886725
        },
        "value": 989995000
    },
    "id": 1
}
```
可以看到是989995000,因为SOL的精度是`10^9`.所以也就是0.989995个SOL。

### 获取某个合约管理的所有`Account`

类似Linux查询某个用户所有的文件。Solana提供了一个查询`owener`为某个合约的RPC方法。该方法的作用就是罗列出 某个合约管理的`Account`，比如SPL Token合约记录的所有用户的余额信息。

```bash
$ curl  https://api.devnet.solana.com  -X POST -H "Content-Type: application/json" -d '
        {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "getProgramAccounts",
            "params": [
            "namesLPneVptA9Z5rqUDD9tMTWEJwofgaYwp8cawRkX",
            {
                "encoding": "jsonParsed",
                "filters": [
                {
                    "dataSize": 128
                }
                ]
            }
            ]
        }
    '
```
获取所有`NameService`服务管理的名字且记录空间大小为128字节的记录：

```bash
{"jsonrpc":"2.0","result":[{"account":{"data":["AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADHgMUi7LJb6+YQzBNlYJYu4QoAPOPzOY6F9NasCG9howAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAaGVsbG8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","base64"],"executable":false,"lamports":1781761,"owner":"namesLPneVptA9Z5rqUDD9tMTWEJwofgaYwp8cawRkX","rentEpoch":349,"space":128},"pubkey":"5mBDoMGJvQTQhgAK2LtjKmG3TGV8J1m3LoEHRMXqits9"},{"account":{"data":
    ...
{"account":{"data":["AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADHgMUi7LJb6+YQzBNlYJYu4QoAPOPzOY6F9NasCG9howAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAaGVsbG8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=","base64"],"executable":false,"lamports":1781761,"owner":"namesLPneVptA9Z5rqUDD9tMTWEJwofgaYwp8cawRkX","rentEpoch":349,"space":128},"pubkey":"8worhyBqrHu1MYYQdQ3zpg5ByuhUge4rYHHhN8E8Vc3j"}],"id":1}
```

这里的`data`还需要用相应的序列化方法进行解析才能知道具体的记录是什么。

## `SPL-Token`相关接口

### 按照需求查询账号

我们知道`SPL Token`的结构为：

```rust
pub struct Account {
    /// The mint associated with this account
    pub mint: Pubkey,
    /// The owner of this account.
    pub owner: Pubkey,
    /// The amount of tokens this account holds.
    pub amount: u64,
    /// If `delegate` is `Some` then `delegated_amount` represents
    /// the amount authorized by the delegate
    pub delegate: COption<Pubkey>,
    /// The account's state
    pub state: AccountState,
    /// If is_native.is_some, this is a native token, and the value logs the rent-exempt reserve. An
    /// Account is required to be rent-exempt, so the value is used by the Processor to ensure that
    /// wrapped SOL accounts do not drop below this threshold.
    pub is_native: COption<u64>,
    /// The amount delegated
    pub delegated_amount: u64,
    /// Optional authority to close the account.
    pub close_authority: COption<Pubkey>,
}
```

我们可以查询某个`Token`下，所有`owner`为某人的`Token`账号，或者`delegate`为某人的所有账号。

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

这里查询到这个`token：7vtXvye2ECB1T5Se8E1KebNfmV7t4VkaULDjf2v1xpA9 ower为CnjrCefFBHmWnKcwH5T8DFUQuVEmUJwfBL3Goqj6YhKw`所有账号。

```json
{
  "jsonrpc": "2.0",
  "result": {
    "context": {
      "apiVersion": "1.16.5",
      "slot": 234689258
    },
    "value": [
      {
        "account": {
          "data": {
            "parsed": {
              "info": {
                "isNative": false,
                "mint": "7vtXvye2ECB1T5Se8E1KebNfmV7t4VkaULDjf2v1xpA9",
                "owner": "Czorr4y9oFvE3VdfCLVFuKDYxaNUG1iyQomR7kMZUuzi",
                "state": "initialized",
                "tokenAmount": {
                  "amount": "99000000000",
                  "decimals": 9,
                  "uiAmount": 99.0,
                  "uiAmountString": "99"
                }
              },
              "type": "account"
            },
            "program": "spl-token",
            "space": 165
          },
          "executable": false,
          "lamports": 2039280,
          "owner": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
          "rentEpoch": 0,
          "space": 165
        },
        "pubkey": "EZhhUANUMKsRhRMArczio1kLc9axefTUAh5xofGX35AK"
      }
    ]
  },
  "id": 1
}
```

而通过：

```bash
$ curl https://api.devnet.solana.com -X POST -H "Content-Type: application/json" -d '
    {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "getTokenAccountsByDelegate",
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

因为我们没有设置代理操作。所以这里得到的结果为空。

### 获取某个`Token Account`账号的余额

查询`SPL Token`的余额，有个`ATA`账号需要了解。本质上就是对应`Token`的账号：

```bash
$ curl  https://api.devnet.solana.com  -X POST -H "Content-Type: application/json" -d '
        {
            "jsonrpc": "2.0", "id": 1,
            "method": "getTokenAccountBalance",
            "params": [
                "EZhhUANUMKsRhRMArczio1kLc9axefTUAh5xofGX35AK"
            ]
        }
    '
```

返回的值，会列出数量：

```json
{
    "jsonrpc": "2.0",
    "result": {
        "context": {
        "apiVersion": "1.16.3",
        "slot": 209132550
        },
        "value": {
        "amount": "99000000000",
        "decimals": 9,
        "uiAmount": 99.0,
        "uiAmountString": "99"
        }
    },
    "id": 1
}
```

这里可以看到，`uiAmount`是可以显示的数量，做了精度转换的。精度和真实`amount`都有列出来。

## 交易相关接口

### 获取交易手续费

针对某个交易，需要预估其手续费时，可以借助节点的预计算：

```bash
$ curl https://api.devnet.solana.com -X POST -H "Content-Type: application/json" -d '
    {
        "id":1,
        "jsonrpc":"2.0",
        "method":"getFeeForMessage",
        "params":[
            "AQABAgIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBAQAA",
            {
                "commitment":"processed"
            }
        ]
    }
    '
```

得到：

```json
{
    "jsonrpc": "2.0",
    "result": {
        "context": {
        "apiVersion": "1.16.3",
        "slot": 209111155
        },
        "value": null
    },
    "id": 1
}
```

这里参数中的字符串，是`Transaction`打包后的结果。也就是`RawTransaction`的序列化结果。

### 获取交易详细信息

查询某个交易的详细信息：

```bash
$ curl  https://api.devnet.solana.com  -X POST -H "Content-Type: application/json" -d '
        {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "getTransaction",
            "params": [
                "2o9qCEhwKi8w7hTFQJTLwMBZPFH8qM3iNd9rprtdY6XShyrpsqkWt4Df3Zgsxv6y4nbRe4SDgU8KMvuMfs7HxVhp",
                "jsonParsed"
            ]
        }
    '
```

可以看到，结果跟浏览器中的结果基本是对应的：

```json
{
  "jsonrpc": "2.0",
  "result": {
    "blockTime": 1674954447,
    "meta": {
      "computeUnitsConsumed": 12481,
      "err": null,
      "fee": 5000,
      "innerInstructions": [],
      "logMessages": [
        "Program gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s invoke [1]",
        "Program gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s consumed 2633 of 600000 compute units",
        "Program gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s success",
        "Program gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s invoke [1]",
        "Program gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s consumed 5562 of 597367 compute units",
        "Program gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s success",
        "Program gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s invoke [1]",
        "Program gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s consumed 4286 of 591805 compute units",
        "Program gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s success"
      ],
      "postBalances": [
        420164575000,
        23942400,
        23942400,
        23942400,
        1169280,
        1141440
      ],
      "postTokenBalances": [],
      "preBalances": [
        420164580000,
        23942400,
        23942400,
        23942400,
        1169280,
        1141440
      ],
      "preTokenBalances": [],
      "rewards": [],
      "status": {
        "Ok": null
      }
    },
    "slot": 192074782,
    "transaction": {
      "message": {
        "accountKeys": [
          {
            "pubkey": "vir55LvSEGcY55ny876GycLmFCxMXTkoRg7RxDvKiw5",
            "signer": true,
            "source": "transaction",
            "writable": true
          },
          {
            "pubkey": "8PugCXTAHLM9kfLSQWe2njE5pzAgUdpPk3Nx5zSm7BD3",
            "signer": false,
            "source": "transaction",
            "writable": true
          },
          {
            "pubkey": "EfnLcrwxCgwALc5vXr4cwPZMVcmotZAuqmHa8afG8zJe",
            "signer": false,
            "source": "transaction",
            "writable": true
          },
          {
            "pubkey": "6Ukmvns6Uyf3nRVj3ErDBgx7BiZRNJrLyXe1nGQ7CUHA",
            "signer": false,
            "source": "transaction",
            "writable": true
          },
          {
            "pubkey": "SysvarC1ock11111111111111111111111111111111",
            "signer": false,
            "source": "transaction",
            "writable": false
          },
          {
            "pubkey": "gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s",
            "signer": false,
            "source": "transaction",
            "writable": false
          }
        ],
        "instructions": [
          {
            "accounts": [
              "vir55LvSEGcY55ny876GycLmFCxMXTkoRg7RxDvKiw5",
              "8PugCXTAHLM9kfLSQWe2njE5pzAgUdpPk3Nx5zSm7BD3",
              "SysvarC1ock11111111111111111111111111111111"
            ],
            "data": "6mJFQCt94hG4CKNYKgVcwiF4v7AWo54Dz3XinKUG6Qm1DDhhmspAST",
            "programId": "gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s",
            "stackHeight": null
          },
          {
            "accounts": [
              "vir55LvSEGcY55ny876GycLmFCxMXTkoRg7RxDvKiw5",
              "EfnLcrwxCgwALc5vXr4cwPZMVcmotZAuqmHa8afG8zJe",
              "SysvarC1ock11111111111111111111111111111111"
            ],
            "data": "6mJFQCt94hG4CKNYKgVcwigC7XswHjekyj7J1dQmjsHsoqHjydqXoV",
            "programId": "gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s",
            "stackHeight": null
          },
          {
            "accounts": [
              "vir55LvSEGcY55ny876GycLmFCxMXTkoRg7RxDvKiw5",
              "6Ukmvns6Uyf3nRVj3ErDBgx7BiZRNJrLyXe1nGQ7CUHA",
              "SysvarC1ock11111111111111111111111111111111"
            ],
            "data": "6mJFQCt94hG4CKNYKgVcwcojsn834cy7vrPD6ksi4ri42uvkGeVMkb",
            "programId": "gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s",
            "stackHeight": null
          }
        ],
        "recentBlockhash": "sS5jHAvxaXfowtGCvg4dWc9QjzeZ1dJS5GonshyDsEq"
      },
      "signatures": [
        "2o9qCEhwKi8w7hTFQJTLwMBZPFH8qM3iNd9rprtdY6XShyrpsqkWt4Df3Zgsxv6y4nbRe4SDgU8KMvuMfs7HxVhp"
      ]
    }
  },
  "id": 1
}
```

我们可以通过这个代替去查看浏览器。

### 发送交易

发送交易通过 `sendTransaction` 接口。这个接口里面需要对`Transaction`对象做编码，所以不做演示。在Javascript/rust的SDK中操作会比较直观。

除了发送请求外，还可以通过模拟请求来判断是否可能执行成功，接口为`simulateTransaction`。

在发送交易的时候，还可以通过`getFeeForMessage`来预估手续费
