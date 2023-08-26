---
sidebar_position: 300
sidebar_label:  Writing Program
sidebar_class_name: green
---

# Overview of Writing Programs

开发人员可以编写和部署自己的程序到Solana区块链上。虽然开发这些“链上”程序可能看起来很繁琐，但整个过程可以概括为几个关键步骤。

## Solana 开发生命周期

1. 设置您的开发环境
2. 编写你的程序
3. 编译程序
4. 生成程序的公共地址
5. 部署程序

### 1.设置您的开发环境

开始Solana开发的最可靠方法是在本地计算机上[安装Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools)工具。这将为您提供最强大的开发环境。

一些开发者可能也会选择使用[Solana Playground](https://beta.solpg.io/)，这是一个基于浏览器的集成开发环境。它可以让你在浏览器中编写、构建和部署链上程序，而无需进行任何安装。


### 2. 编写你的程序

编写Solana程序最常用的方法是使用Rust语言。这些Rust程序实际上与创建传统的[Rust库](https://doc.rust-lang.org/rust-by-example/crates/lib.html)相同。

> 您可以在下面了解更多关于其他支持的语言的信息。

### 3. 编译程序

一旦程序编写完成，必须将其编译成Berkley Packet Filter字节码，然后部署到区块链上。

### 4. 生成程序的公共地址

使用[Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools)，开发者将为新程序生成一个新的唯一[Keypair](https://docs.solana.com/terminology#keypair)。来自该Keypair的公共地址（也称为[Pubkey](https://docs.solana.com/terminology#public-key-pubkey)）将在链上用作程序的公共地址（也称为 [programId](https://docs.solana.com/terminology#program-id) ）。

### 5. 部署程序

然后再次使用CLI，编译后的程序可以通过创建包含程序字节码的多个交易来部署到所选的区块链集群中。由于交易内存大小的限制，每个交易实际上以快速连续的方式将程序的小块发送到区块链。

一旦整个程序被发送到区块链，最后一笔交易将被发送以将所有缓冲的字节码写入程序的数据账户。这要么标记新程序为 [executable](https://docs.solana.com/developing/programming-model/accounts#executable) ，要么完成升级现有程序的过程（如果它已经存在）。


## 支持的语言

Solana的程序通常使用Rust语言编写，但也支持C/C++。

还有各种社区驱动的努力，以使用其他编程语言来实现链上编程，包括：

- 通过[Seahorse](https://seahorse-lang.org/)使用Python（它作为基于Rust的Anchor框架的包装器）

## 示例程序

您还可以探索链上程序的示例，以了解更多实例。

## 限制

随着你深入进行程序开发，了解与链上程序相关的一些重要限制是很重要的。

请在“限制”页面上阅读更多详细信息

## 常见问题

了解其他开发者在编写/理解Solana程序方面经常遇到的问题。
