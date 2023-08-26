---
sidebar_position: 301
sidebar_label:  使用Rust开发
sidebar_class_name: green
---

# 使用Rust开发

Solana支持使用Rust编程语言编写链上程序。

## 项目布局

Solana的Rust程序遵循典型的Rust项目布局：

```bash
/inc/
/src/
/Cargo.toml
```

Solana的Rust程序可以直接依赖彼此，以便在进行跨程序调用时获得指令助手的访问权限。在这样做时，重要的是不要引入依赖程序的入口符号，因为它们可能与程序自身的符号冲突。为了避免这种情况，程序应该在 Cargo.toml 中定义一个 no-entrypoint 功能，并使用它来排除入口点。

- 定义特征
- 排除入口点

然后，当其他程序将此程序作为依赖项时，应使用 no-entrypoint 功能进行操作。

- 包含无入口点

## 项目依赖

至少，Solana Rust程序必须引入solana-program crate。

Solana SBF程序有一些限制，可能会阻止某些crate作为依赖项的包含，或者需要特殊处理。

例如：

- 需要的架构是官方工具链支持的子集。除非对该 crate 进行分叉并添加 SBF 到那些架构检查中，否则没有其他解决办法。
- 创建箱子可能依赖于 rand ，而Solana的确定性程序环境不支持它。要包含一个依赖于 rand 的箱子，请参考依赖于Rand。
- 即使程序本身没有包含堆栈溢出的代码，堆栈仍可能溢出。有关更多信息，请参考堆栈。

## 如何建造

首先设置环境：
- 从https://rustup.rs/安装最新的稳定版Rust。
- 安装最新的Solana命令行工具

可以使用正常的货物构建来构建针对您的主机机器的程序，这些程序可用于单元测试

```bash
$ cargo build
```

为Solana SBF目标构建一个特定的程序，比如SPL Token，可以部署到集群中

```bash
$ cd <the program directory>
$ cargo build-bpf
```

## 如何进行测试

Solana程序可以通过直接调用程序函数来进行传统的单元测试。

为了帮助开发人员在更接近实际集群的环境中进行测试，他们可以使用 program-test crate。该 program-test crate会启动一个本地运行时实例，并允许测试发送多个事务，同时在测试期间保持状态。

有关更多信息，请参阅sysvar示例中的测试，该测试显示了包含sysvar账户的指令如何被程序发送和处理。

## 程序入口点

程序导出一个已知的入口符号，Solana运行时在调用程序时查找并调用该符号。Solana支持多个版本的BPF加载器，入口点可能会因此而有所不同。程序必须为相同的加载器编写并部署。有关更多详细信息，请参阅加载器的常见问题解答部分。



目前有两个支持的加载器BPF Loader和BPF加载器已弃用

它们两个都有相同的原始入口点定义，下面是运行时查找并调用的原始符号：

```rust
#[no_mangle]
pub unsafe extern "C" fn entrypoint(input: *mut u8) -> u64;
```

这个入口点接受一个通用的字节数组，其中包含序列化的程序参数（程序ID、账户、指令数据等）。为了反序列化参数，每个加载器都包含自己的包装宏，导出原始入口点，反序列化参数，调用用户定义的指令处理函数，并返回结果。

您可以在这里找到入口点宏：
- BPF加载器的入口宏
- BPF Loader废弃的入口宏

程序定义的指令处理函数，入口点宏调用的函数必须符合以下形式：

```rust
pub type ProcessInstruction =
    fn(program_id: &Pubkey, accounts: &[AccountInfo], instruction_data: &[u8]) -> ProgramResult;
```

### 参数反序列化

每个加载器都提供了一个辅助函数，用于将程序的输入参数反序列化为Rust类型。入口点宏会自动调用反序列化辅助函数：

- BPF加载器反序列化
- BPF加载器已弃用反序列化

一些程序可能希望自行执行反序列化操作，可以通过提供自己的原始入口点实现。请注意，提供的反序列化函数会保留对序列化字节数组的引用，以便程序可以修改（lamports、账户数据）。这样做的原因是，加载器在返回时会读取这些修改，以便进行提交。如果程序实现了自己的反序列化函数，需要确保将程序希望提交的任何修改写回输入字节数组中。

有关加载程序如何序列化程序输入的详细信息，请参阅输入参数序列化文档。

### 数据类型

加载器的入口点宏使用以下参数调用程序定义的指令处理函数：

```rust
program_id: &Pubkey,
accounts: &[AccountInfo],
instruction_data: &[u8]
```

程序ID是当前正在执行的程序的公钥。

账户是指令引用的账户的有序切片，并以AccountInfo结构表示。数组中账户的位置表示其含义，例如，在转移lamports时，指令可以将第一个账户定义为源账户，第二个账户定义为目标账户。

AccountInfo 结构的成员是只读的，除了 lamports 和 data 。根据运行时执行策略，程序可以修改这两个成员。这两个成员都受到 Rust 的 RefCell 构造的保护，因此在读取或写入它们时必须进行借用。原因是它们都指向原始输入字节数组，但是在 accounts 切片中可能有多个条目指向同一个账户。使用 RefCell 可以确保程序不会意外地通过多个 AccountInfo 结构对同一底层数据执行重叠的读取/写入操作。如果程序实现了自己的反序列化函数，应该注意适当处理重复的账户。

指令数据是正在处理的指令的通用字节数组。

## 堆

Rust程序通过定义自定义的堆直接实现

根据具体需求，程序可以根据自己的需要实现自定义堆。有关更多信息，请参考自定义堆示例。

## 限制

链上的Rust程序支持大部分Rust的libstd、libcore和liballoc，以及许多第三方的crate。

由于这些程序在资源受限、单线程环境下运行，并且具有确定性，因此存在一些限制

- 无法访问
    - `rand`
    - `std::fs`
    - `std::net`
    - `std::future`
    - `std::process`
    - `std::sync`
    - `std::task`
    - `std::thread`
    - `std::time`
- 有限访问：
    - `std::hash`
    - `std::os`
- `Bincode`在计算上非常昂贵，无论是在循环还是调用深度方面，都应该避免使用
- 应避免使用字符串格式化，因为它也会消耗计算资源。
- 不支持 `println!` ， `print!` ，应使用 `Solana` 日志助手。
- 运行时在处理一条指令时对程序执行的指令数量施加了限制。有关更多信息，请参阅[计算预算](https://docs.solana.com/developing/programming-model/runtime#compute-budget)。

## 根据`rand`的情况而定

程序受限于确定性运行，因此无法使用随机数。有时，一个程序可能依赖于一个依赖于 `rand` 的包，即使该程序并未使用任何随机数功能。如果一个程序依赖于 `rand` ，编译将失败，因为`Solana`不支持 `get-random` 。错误通常会显示如下：

```bash
error: target is not supported, for more information see: https://docs.rs/getrandom/#unsupported-targets
   --> /Users/jack/.cargo/registry/src/github.com-1ecc6299db9ec823/getrandom-0.1.14/src/lib.rs:257:9
    |
257 | /         compile_error!("\
258 | |             target is not supported, for more information see: \
259 | |             https://docs.rs/getrandom/#unsupported-targets\
260 | |         ");
    | |___________^
```

为了解决这个依赖问题，请将以下依赖项添加到程序的 `Cargo.toml` 中：

```toml
getrandom = { version = "0.1.14", features = ["dummy"] }
```

如果依赖于 `getrandom v0.2`，请添加：

```toml
getrandom = { version = "0.2.2", features = ["custom"] }
```

## 记录

`Rust`的 `println!` 宏在计算上是昂贵的且不受支持。相反，提供了辅助宏 msg! 。

`msg!` 有两种形式：

```rust
msg!("Hello, world!");
```
或者
```rust
msg!(0_64, 1_64, 2_64, 3_64, 4_64);
```

两种形式都将结果输出到程序日志中。如果程序希望，它们可以通过使用 `format!` 来模拟 `println!` 。

```rust
msg!("Some variable: {:?}", variable);
```

**调试部分**包含有关使用程序日志的更多信息，**Rust示例**中包含了一个日志示例。

## 惊慌失措

`Rust`的 `panic!` 、 `assert!` 和内部`panic`结果默认会打印到程序日志中。

```bash
INFO  solana_runtime::message_processor] Finalized account CGLhHSuWsp1gT4B7MY2KACqp9RUwQRhcUFfVSuxpSajZ
INFO  solana_runtime::message_processor] Call SBF program CGLhHSuWsp1gT4B7MY2KACqp9RUwQRhcUFfVSuxpSajZ
INFO  solana_runtime::message_processor] Program log: Panicked at: 'assertion failed: `(left == right)`
      left: `1`,
     right: `2`', rust/panic/src/lib.rs:22:5
INFO  solana_runtime::message_processor] SBF program consumed 5453 of 200000 units
INFO  solana_runtime::message_processor] SBF program CGLhHSuWsp1gT4B7MY2KACqp9RUwQRhcUFfVSuxpSajZ failed: BPF program panicked
```

### 自定义恐慌处理程序

程序可以通过提供自己的实现来覆盖默认的`panic`处理程序。

首先在程序的 `Cargo.toml` 中定义 `custom-panic` 功能

```toml
[features]
default = ["custom-panic"]
custom-panic = []
```

然后提供一个自定义的`panic`处理程序的实现：

```rust
#[cfg(all(feature = "custom-panic", target_os = "solana"))]
#[no_mangle]
fn custom_panic(info: &core::panic::PanicInfo<'_>) {
    solana_program::msg!("program custom panic enabled");
    solana_program::msg!("{}", info);
}
```

在上面的片段中，展示了默认的实现，但开发人员可以用更适合自己需求的内容来替换它。

默认支持完整的恐慌消息的副作用之一是程序会承担将更多的Rust实现引入程序共享对象的成本。典型的程序已经引入了相当数量的 `libstd` ，可能不会注意到共享对象大小的增加。但是，那些明确试图通过避免 `libstd` 来保持非常小的程序可能会受到显著影响（约`25kb`）。为了消除这种影响，程序可以提供自己的自定义恐慌处理程序，并进行空实现。

```rust
#[cfg(all(feature = "custom-panic", target_os = "solana"))]
#[no_mangle]
fn custom_panic(info: &core::panic::PanicInfo<'_>) {
    // Do nothing to save space
}
```

## 计算预算

使用系统调用 [`sol_log_compute_units()`](https://github.com/solana-labs/solana/blob/d9b0fc0e3eec67dfe4a97d9298b15969b2804fab/sdk/program/src/log.rs#L141) 记录一个包含程序在执行停止之前可以消耗的剩余计算单元数量的消息

请查看[计算预算](https://docs.solana.com/developing/programming-model/runtime#compute-budget)以获取更多信息。

## ELF Dump

`SBF`共享对象的内部可以`dump`到文本文件中，以更深入地了解程序的组成和运行时的操作。转储文件将包含ELF信息以及所有符号和实现它们的指令的列表。`BPF`加载器的一些错误日志消息将引用错误发生的特定指令编号。可以在`ELF`转储中查找这些引用，以确定有问题的指令及其上下文。

创建一个`dump`文件：

```bash
$ cd <program directory>
$ cargo build-bpf --dump
```

## 例子

[Solana程序库](https://github.com/solana-labs/solana-program-library/tree/master/examples/rust)的github仓库包含了一系列的Rust示例。
