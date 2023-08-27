---
sidebar_position: 128
sidebar_label: Hello World
sidebar_class_name: green
---

# HelloWorld

Rust没隔6个星期，就会发布一个小版本。在Rust历史中又有三个大版本的差别。这里不是传统的x.y.z里面的版本号。

Rust以3年为一个界限，发布一个大版本，新特性可能不兼容之前版本。每个版本叫做一个edition。有点类似C98/C11/C14/C17 的感觉。目前Rust主要有2015/2018/2021三个Edition。

## Rust环境安装

通过`rustup`工具，可以帮助我们一键安装rust开发环境：

```bash
$ curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

Current installation options:


default host triple: x86_64-apple-darwin
    default toolchain: stable (default)
            profile: default
modify PATH variable: yes

1) Proceed with installation (default)
2) Customize installation
3) Cancel installation

直接Enter采用默认方式

Rust is installed now. Great!

To get started you may need to restart your current shell.
This would reload your PATH environment variable to include
Cargo's bin directory ($HOME/.cargo/bin).

To configure your current shell, run:
source "$HOME/.cargo/env"
```

这里执行下环境导入

```bash
$ source "$HOME/.cargo/env"
```

然后查看rust版本：

```bash
$ rustc --version
rustc 1.70.0 (90c541806 2023-05-31)
```

为当前最新的1.70.0。

Rust官方针对不同的IDE都有开发相关插件。比如Vim/Emacs，这里比较推荐实用VS Code。在VS Code界面安装 rust-analyzer插件。

这样即可舒服的写rust代码了。

这里对于使用mac的用户来说我推荐使用zed编辑器，这里打开zed编辑器，他会自动下载rust-analyzer。

## 创建工程

创建一个demo目录，用于放工程文件，然后在这个目录中：

```bash
$ cargo new --bin helloworld
     Created binary (application) `helloworld` package
```

即可创建好项目。项目目录为：

```bash
.
└── helloworld
    ├── Cargo.toml
    └── src
        └── main.rs
```

然后用VScode打开工程，并打开这里的`main.rs`。

```rust
fn main() {
    println!("Hello, world!");
}
```

创建工程到时候，已经默认生成了打印"Hello, world!"。我们修改成:

```rust
use std::env;

fn main() {
    let name = env::args().skip(1).next();
    match name {
        Some(n) => println!("Hello {}", n),
        None => println!("Please use ./hellowolrd name.")
    }
}
```

通过`cargo`可以构建：

```bash
$ cargo build
Compiling helloworld v0.1.0 (Solana-Asia-Summer-2023/s101/Solana-Rust/demo/helloworld)
    Finished dev [unoptimized + debuginfo] target(s) in 0.99s
```

构建完成后，可执行二进制在：

```bash
$ ./target/debug/helloworld abc
Hello abc
```

输入后可以直接执行，得到结果。

也可以直接通过cargo 来执行：

```bash
$ cargo run  abc
Finished dev [unoptimized + debuginfo] target(s) in 0.00s
Running `target/debug/helloworld`
Hello abc
```

到这里就完成了HelloWorld过程了。

## Rust代码结构

上面我们对模板代码做了简单修改。模板代码过于简单。所以我们加入了命令行参数并增加了一个其他语言中没有的关键字 `match`。

来看代码开头：

```rust
use std::env;
```

当要使用其他库的时候，首先用`use`来进行导入。这个有点类似其他语言的`import/include`等。

然后是main函数:

```rust
fn main() {
    ...
}
```

函数的定义是`fn` 开头，然后跟函数名，以及用`()`括起来的参数列表，最后是返回值类型，这里因为没有返回值，所以是空。再来看个函数定义：

```rust
// Function that returns a boolean value
fn is_divisible_by(lhs: u32, rhs: u32) -> bool {
    // Corner case, early return
    if rhs == 0 {
        return false;
    }

    // This is an expression, the `return` keyword is not necessary here
    lhs % rhs == 0
}
```

首先用fn表示函数定义。然后函数名为"`is_divisible_by`"，参数为：`lhs: u32`, `rhs: u32` 这里又和一些语言不一样了。 格式为 参数名 ： 类型 。最后通过 -> 分割返回值类型。

这里在函数定义逻辑为：

```rust
// Corner case, early return
if rhs == 0 {
    return false;
}

// This is an expression, the `return` keyword is not necessary here
lhs % rhs == 0
```

这里和普通语言又有点不一样。 对于返回值，可以显示的调用`reutrn : return false;`

也可以通过表达式来实现，表达式不要以"`;`"结尾： `lhs % rhs == 0` 表达式的结果，作为返回值，不需要加"`return`"。
