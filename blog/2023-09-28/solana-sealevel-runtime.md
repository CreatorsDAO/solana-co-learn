---
slug: solana-sealevel-runtime
title: SeaLevel Parallel Processing Thousands of Smart Contracts
authors: [davirain]
tags: [blog, blockchain, solana, sealevel, runtime]
---

在这篇博文中，我们将探讨 Solana 的并行智能合约运行时 Sealevel。在开始之前，需要考虑的一件事是 EVM 和 EOS 基于 WASM 的运行时都是单线程的。这意味着一次一个合约会修改区块链状态。我们在 Solana 中构建的是一个运行时，可以使用验证器可用的尽可能多的内核并行处理数万个合约。

Solana 之所以能够并行处理事务，是因为 Solana 事务描述了事务在执行时将读取或写入的所有状态。这不仅允许非重叠事务并发执行，还允许仅读取相同状态的事务并发执行。

## 程序和帐户

Cloudbreak，我们的帐户数据库，是公钥到帐户的映射。账户维护余额和数据，其中数据是字节向量。帐户有一个“所有者”字段。所有者是管理帐户状态转换的程序的公钥。程序是代码，没有状态。他们依赖分配给他们的账户中的数据向量来进行状态转换。

1. 程序只能更改其拥有的帐户的数据。

2. 程序只能借记其拥有的账户。

3. 任何程序都可以存入任何帐户。

4. 任何程序都可以读取任何帐户。

默认情况下，所有帐户一开始均由系统程序拥有。

1. 系统程序是唯一可以分配帐户所有权的程序。

2. 系统程序是唯一可以分配零初始化数据的程序。

3. 帐户所有权的分配在帐户的生命周期内只能发生一次。

用户定义的程序由加载程序加载。加载程序能够将帐户中的数据标记为可执行。用户执行以下事务来加载自定义程序：

1. 创建一个新的公钥。

2. 将硬币转移到钥匙上。

3. 告诉系统程序分配内存。

4. 告诉系统程序将帐户分配给加载程序。

5. 将字节码分块上传到内存中。

6. 告诉 Loader 程序将内存标记为可执行文件。

此时，加载器对字节码进行验证，字节码加载到的账户就可以作为可执行程序了。新帐户可以标记为由用户定义的程序拥有。

这里的关键见解是程序是代码，并且在我们的键值存储中，存在程序的某些键子集，并且只有该程序具有写访问权限。

## 交易

事务指定一个指令向量。每条指令都包含程序、程序指令以及交易想要读写的账户列表。该接口的灵感来自于设备的低级操作系统接口：

```c
size_t readv(int d, const struct iovec *iov, int iovcnt);

struct iovec {
    char *iov_base; /* Base address. */
    size_t iov_len; /* Length. */
};
```

readv 或 writev 等接口提前告诉内核用户想要读取或写入的所有内存。这允许操作系统预取、准备设备，并在设备允许的情况下并发执行操作。


在 Solana 上，每条指令都会提前告诉虚拟机要读取和写入哪些帐户。这就是我们对VM进行优化的根源。

1. 对数以百万计的待处理交易进行排序。

2. 并行安排所有非重叠事务。

更重要的是，我们可以利用 CPU 和 GPU 硬件的设计方式。


![](https://miro.medium.com/v2/resize:fit:4800/format:webp/1*5CwncUtV3FwS3Gp91RGmSA.png)


SIMD 指令允许在多个数据流上执行一段代码。这意味着 Sealevel 可以执行额外的优化，这是 Solana 设计所独有的：

1. 按程序 ID 对所有指令进行排序。

2. 同时在所有帐户上运行相同的程序。

要了解为什么这是一个如此强大的优化，请查看 [CUDA 开发人员指南](https://docs.nvidia.com/cuda/)：

:::info
CUDA 架构是围绕可扩展的多线程流多处理器 (SM) 阵列构建的。当主机 CPU 上的 CUDA 程序调用内核网格时，网格的块将被枚举并分配给具有可用执行能力的多处理器。
:::

现代 Nvidia GPU 拥有 4000 个 CUDA 核心，但大约有 50 个多处理器。虽然多处理器一次只能执行一条程序指令，但它可以并行执行超过 80 个不同输入的指令。因此，如果 Sealvel 加载的传入事务都调用相同的程序指令（例如 CryptoKitties::BreedCats），Solana 可以在所有可用的 CUDA 核心上同时执行所有事务。

性能方面没有免费的午餐，因此为了使 [SIMD](https://en.wikipedia.org/wiki/SIMD) 优化可行，执行的指令应该包含少量分支，并且都应该采用相同的分支。多处理器受到批处理中执行速度最慢的路径的限制。即使考虑到这一点，与单线程运行时相比，通过 Sealevel 进行的并行处理在区块链网络的运行方式方面呈现出基础性的发展，从而实现了极高的吞吐量和可用性。
