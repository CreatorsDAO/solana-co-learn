---
sidebar_position: 23
sidebar_label:  PDA 和 ADA
sidebar_class_name: green
---

# PDA 和 ADA

PDA createProgramAddressSync 和 ADA createWithSeed 是两种账号生成规则

## 地址生成逻辑介绍如下

- PDA 地址生成规则

1. buffer = [seed,programId,"ProgramDerivedAddress"]
2. 对buffer 取 sha256
3. 如果在曲线上，那么抛出error, 如果不在，那么直接返回作为 使用地址

[createProgramAddressSync](https://github.com/solana-labs/solana-web3.js/blob/ae1056366cd75fea784e9146af511302d5a62845/packages/library-legacy/src/publickey.ts#L168)

- ADA 生成

1. buffer=[fromPublicKey,seed,programId]
2. buffer 取 sha256, 直接返回

[createWithSeed](https://github.com/solana-labs/solana-web3.js/blob/ae1056366cd75fea784e9146af511302d5a62845/packages/library-legacy/src/publickey.ts#L150)

区别在于，数据的托管使用逻辑.

- ADA 数据签名权限，在于账户本身。即 我的数据我做主，未经允许(我未签名)不能修改。
- PDA 数据签名权限在于合约。经过程序签名，可以修改 account 的数据和提取其中的sol。

