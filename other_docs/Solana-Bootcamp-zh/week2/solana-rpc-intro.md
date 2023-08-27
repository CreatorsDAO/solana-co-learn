---
sidebar_position: 118
sidebar_label: Solana的RPC介绍
sidebar_class_name: green
---

# Solana的RPC介绍

## RPC 介绍

RPC 是什么？

>In distributed computing, a remote procedure call (RPC) is when a computer program causes a procedure (subroutine) to execute in a different address space (commonly on another computer on a shared network)
>
>-- wikipedia

写代码的应该都知道 RPC 是啥，但是 RPC 跟区块链是什么关系呢？

引用 Polkadot 的一个架构图：

![](../img/week2/dot_arch.png)

RPC 作为区块链系统与外界交互的一层接口调用。被普通用户直接使用。

但是为什么普通用户又感知不到 RPC 的存在呢？普通用户只知道钱包，拉起、确定 -> 币没了。

这里是因为我们这帮程序员，帮忙将中间的过程都通过代码来串联起来了。所以 RPC 又是用户界面和区块链之间的桥梁。

Solana 提供的 RPC 分为主动请求的 HTTP 接口和消息推送的 Websocket 接口。只是单次查询一般使用 HTTP 接口，如发送交易，查询用户余额。而对于链上数据的监控则通过 Websocket 接口，如监控合约执行的日志。

## HTTP 接口

HTTP 接口是通过 [JSON RPC](https://www.jsonrpc.org/) 的格式对外提供服务，JSON RPC 是一种以 JSSON 作为序列化工具，HTTP 作为传输协议的 RPC 模式，其有多个版本，当前使用的是 v2 版本。

其请求格式为：

```json
{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "getBalance",
    "params": [
        "83astBRguLMdt2h5U1Tpdq5tjFoJ6noeGwaY3mDLVcri"
    ]
}
```

这里最外层是一个字典，其中各个 `Key` 是固定的，其中 `method` 表示 RPC 的函数方法名。`params` 表示该函数的参数。

对应的请求结果为：

```json
{
    "jsonrpc": "2.0",
    "result": {},
    "id": 1
}
```

同样的，这里的几个字段也是固定的，`result` 表示请求的结果。`id` 和请求里面的 `id` 对应，表示的是哪个请求的结果。

在请求查询的时候，对查询的结果有三种状态选择：

- '`finalized`' - 节点将查询由超过集群中超多数确认为达到最大封锁期的最新区块，表示集群已将此区块确认为已完成。
- '`confirmed`' - 节点将查询由集群的超多数投票的最新区块。
- '`processed`' - 节点将查询最新的区块。注意，该区块可能被集群跳过。
状态参数可以在"`params`"数组的最后，以字典的形式带入进去。

同时 Solana 也对常用的结果做了人为可读的优化。当传递"`encoding`":"`jsonParsed`"会讲结果尽量以 JSON 的方式返回。`encoding` 和上面的状态放在同一个位置。如：

```json
{
    "commitment":"processed",
    "encoding":"jsonParsed"
}
```

## Websocket 接口

Websocket 是 HTTP 为了补充长链接，而增加一个特性，概括来说就可以认为这个是一条 TCP 长链接。Solana 通过这条长连接来给客户端推送消息。

只是这里的消息的内容也是采用了 JSONRPC 的格式，如：

```json
{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "accountSubscribe",
    "params": [
        "CM78CPUeXjn8o3yroDHxUtKsZZgoy4GPkPPXfouKNH12",
        {
        "encoding": "jsonParsed",
        "commitment": "finalized"
        }
    ]
}
```

这样的消息订阅了 `Account("CM78CPUeXjn8o3yroDHxUtKsZZgoy4GPkPPXfouKNH12")`的变化消息。

当有变化时，也是将结果打包成一个 JSONRPC 的格式推送给客户端：

```json
{
    "jsonrpc": "2.0",
    "method": "accountNotification",
    "params": {
        "result": {
        "context": {
            "slot": 5199307
        },
        "value": {
            "data": {
            "program": "nonce",
            "parsed": {
                "type": "initialized",
                "info": {
                "authority": "Bbqg1M4YVVfbhEzwA9SpC9FhsaG83YMTYoR4a8oTDLX",
                "blockhash": "LUaQTmM7WbMRiATdMMHaRGakPtCkc2GHtH57STKXs6k",
                "feeCalculator": {
                    "lamportsPerSignature": 5000
                }
                }
            }
            },
            "executable": false,
            "lamports": 33594,
            "owner": "11111111111111111111111111111111",
            "rentEpoch": 635,
            "space": 80
        }
        },
        "subscription": 23784
    }
}
```

每个 `Subscribe` 方法，都对应的有一个 `Unsubscribe` 方法，当发送改方法时，服务器后续不再推送消息。
