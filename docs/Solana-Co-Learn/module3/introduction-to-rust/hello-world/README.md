---
sidebar_position: 52
sidebar_label: 📝 你好，世界
sidebar_class_name: green
---

# 📝 你好，世界

我们将在游乐场上制作一个简单的`Hello World`程序。它只会在交易日志中记录一条消息，哈哈。我们将在游乐场上制作一个简单的`Hello World`程序。它只会在交易日志中记录一条消息，哈哈。

## 📦 Rust模块系统

就像我们对待客户一样，我们将使用一系列的库，这样我们就不必写大量的样板代码。Rust使用被统称为“模块系统”的方式来组织代码。这与`Node.js`中的模块或`C++`中的命名空间非常相似。

下面是一个方便的可视化：

![](./img/rust-modules.png)

[srouce](https://www.reddit.com/r/learnrust/comments/wb0gdt/visual_to_understandremember_packages_crates/)

这是一个方便的可视化工具：

这个系统的三个部分是：

- `package` - 一个包含一组木箱以及用于指定元数据和包之间依赖关系的清单文件的包。将其视为Node.js中的 `package.json` 。
- `Crate（板条箱）`- 一个`crate`（板条箱）可以是一个库（library）或一个可执行程序（executable program）。一个`crate`（板条箱）的源代码通常被细分为多个模块（modules）。这就像一个节点模块（node module）。
- `module` - 模块将代码分割成逻辑单元，为组织、作用域和路径的隐私提供了独立的命名空间。这些基本上是单独的文件和文件夹。

## 🛣 路径和范围

就像你可以在React中重用组件和在Node中重用模块一样，`Crate`模块可以在项目中被重复使用。模块内部的项目比较棘手的地方在于我们需要知道它们的路径才能引用它们。

将箱子结构看作一棵树，其中箱子是树的基础，模块是树枝，每个模块可以有子模块或者额外的分支。

我们需要的其中一件事是 `AccountInfo` 子模块中的 `account_info` 结构体，以下是它的样子：

![](./img/solana-module.png)

`struct`是一种自定义的数据类型，顺便说一下。把它想象成一种自定义的原始数据类型，就像字符串或整数一样。与仅存储单个值不同，`struct`可以包含多个值。

在Rust中， `::` 就像 `.` 或 `/` 一样。因此，要引用 `AccountInfo` 结构体，我们可以这样写： :: 。

```rust
use solana_program::account_info::AccountInfo;
```


- 基础箱子是 `solana_program`
- `solana_program` 包含一个名为 `account_info` 的模块
- `account_info` 包含一个名为 `AccountInfo` 的结构体

在Rust文件的顶部经常会看到一系列的 `use` 命令，就像 `import` 或 `require` 语句一样。

我们还需要一些其他的项目。我们可以使用花括号从单个模块中引入多个项目，有点像JS中的解构。

```rust
use solana_program::{
    account_info::AccountInfo,
    entrypoint,
    entrypoint::ProgramResult,
    pubkey::Pubkey,
    msg
};
```


到目前为止，非常直接了当。 `AccountInfo` 结构体是 Solana 账户数据的通用描述符 - 它定义了账户应具备的所有属性。


如果你以前从未使用过像TypeScript或Java这样的静态类型语言，你可能会想知道为什么我们要导入像 `PubKey` 或 `AccountInfo` 这样的“数据类型”。简而言之，在Rust中，我们需要在声明变量时定义其类型。这有助于我们在编译或运行代码之前捕捉错误。因此，当你的程序在区块链上执行交易时，它不会崩溃，而是在开发过程中崩溃，这样你就可以更快地准备好可运行的代码 :)

![](./img/error-compare.png)

我会在需要的时候处理剩下的这些项目。现在继续前进！

## 🏁 Solana程序入口


回想一下我们的TypeScript客户端。我们在 `index.ts` 的 `main` 中有一个函数，它是我们脚本的入口点。同样的方法也适用于Rust脚本！只不过我们不仅仅是编写任何Rust脚本，我们正在编写一个将在Solana上运行的脚本。

这就是我们的第二个 `use` 语句的作用 - 它引入了 `entrypoint!` 宏：一种特殊类型的 main 函数，Solana将用它来执行我们的指令。

宏就像代码的快捷方式 - 它们是一种编写代码的方式，可以编写代码。在编译时， `entrypoint!(process_instruction)`; 会展开为一堆样板代码，有点像模板。你不需要知道宏的工作原理，但你可以在[这里](https://doc.rust-lang.org/book/ch19-06-macros.html)阅读更多相关信息。

我们的入口函数将调用 `process_instruction` ，所以这是我们的 `lib.rs` 文件目前应该是这样的：

```rust
use solana_program::{
    account_info::AccountInfo,
    entrypoint,
    entrypoint::ProgramResult,
    pubkey::Pubkey,
    msg
};

entrypoint!(process_instruction);
```


现在是关于 `process_instruction` 函数的部分。

## 🔨 Rust中的函数

`function`与Typescript中的function非常相似 - 只需要参数、类型和返回类型。将此添加到 `entrypoint!` 宏下面：

```rust
pub fn process_instruction(
    //Arguments and their types
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8]
    // The return type (i.e. what data type the function returns)
) -> ProgramResult{
  // Leave the body empty for now :)
}
```

我们的 `process_instruction` 函数需要以下参数：

- `program_id` ：程序账户的公钥。用于验证程序是否由正确的账户调用。类型为 `&Pubkey` 。
- `accounts` ：指令所涉及的账户。必须为类型 `&[AccountInfo]` 。
- `instruction_data` ：我们交易中的8位指令数据。必须为 `&[u8]` 类型。

`[]` 的意思是 `AccountInfo` 和 `u8` 是“切片”类型 - 它们类似于长度未知的数组。我们不称它们为数组，因为它们更低级 - 在Rust中，切片是指向一块内存块的指针 🤯

我们稍后会处理 `&` :)

## 📜 Result 枚举

是时候来介绍我们的第三个 `use` 语句 - `ProgramResult` 了。这是一个Rust枚举，代表了Solana程序执行的结果。

现在尝试通过点击左侧栏上的“构建”按钮来编译脚本。你应该会得到一个警告和一个错误。这是错误信息：

```bash
error[E0308]: mismatched types
  --> /src/lib.rs:12:6
   |
7  | pub fn process_instruction(
   |        ------------------- implicitly returns `()` as its body has no tail or `return` expression
...
12 | ) -> ProgramResult {
   |      ^^^^^^^^^^^^^ expected enum `Result`, found `()`
   |
   = note:   expected enum `Result<(), ProgramError>`
           found unit type `()`
```

我想花点时间赞赏一下Rust错误信息有多么美丽。它准确地告诉你出了什么问题，问题出在哪里以及如何修复。我想知道如果JavaScript也能这么友好，我会少掉多少头发呢 😢


由于我们的函数体为空，它会隐式地返回 `()` - 空元组。错误消息表示它期望 `Result` ，但我们声明的返回类型是 `ProgramResult` 。嗯，这里发生了什么呢🤔？



这是因为Solana的 `ProgramResult` 类型使用了Rust的 `Result` 类型：


```rust
pub type ProgramResult = Result<(), ProgramError>;
```

`Result` 是一个标准库类型，表示两个离散的结果：

- 成功（ `Ok` ）或
- 失败 ( `Err` )

```rust
pub enum Result<T, E> {
    Ok(T),
    Err(E),
}
```

把它想象成HTTP错误代码——200是 `Ok` ，404是 `Err` 。所以当我们返回 `ProgramResult` 时，我们是在说我们的函数可以返回 `()` （一个空值）表示成功，或者使用自定义的 `ProgramError` 枚举告诉我们出了什么问题。非常有用！

这是我们需要做的全部事情：


```rust
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8]
) -> ProgramResult{
  // Return Ok() for success
  Ok(())
}
```

## 🚀 部署你的第一个程序

我们的程序几乎完成了！唯一缺少的就是实际上说出“Hello World”，我们可以使用 `msg!` 宏来实现。我们暂时不会对指令数据做任何操作，为了避免“未使用的变量”警告，只需在变量名前加下划线即可。


这是完整的 `process_instruction` 函数的样子：


```rust
pub fn process_instruction(
    _program_id: &Pubkey,
    _accounts: &[AccountInfo],
    _instruction_data: &[u8]
) -> ProgramResult{
  msg!("Hello World!");
  Ok(())
}
```

如果你点击构建，你应该在控制台上看到一个绿色的“构建成功”消息。恭喜！你已经编写了你的第一个Solana程序🎉

在这个游乐场上部署非常简单。切换到左上角的“构建和部署”选项卡，在“资源管理器”图标下方，点击“部署”按钮。
