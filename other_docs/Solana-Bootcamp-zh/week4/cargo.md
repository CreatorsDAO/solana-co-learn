---
sidebar_position: 130
sidebar_label: 通过Cargo管理工程
sidebar_class_name: green
---

# 通过Cargo管理工程

cargo作为rust的工程管理工具。类似go语言的gomod。其主要通过 `Cargo.toml`作为配置文件， 配合cargo 二进制工具来管理依赖。

cargo在通过`rustup`安装rust的过程中已经安装好了。`Cargo.toml`在通过`cargo new` 创建工程的时候，自动生成。

在构建的时候，cargo 会根据`Cargo.toml`中的依赖，自动拉取依赖的代码，并将相应的版本信息，资源签名，记录在 `Cargo.lock`文件中，该文件类似`go.sum`文件，记录了各个依赖的`meta`信息。

## cargo命令

### 创建工程

首先通过cargo命令，可以创建工程。创建的工程分成两类，一类是库，一类是二进制可执行程序。

通过`cargo new project_name` 命令可以创建`project_name`的工程。默认工程是一个可执行程序。

通过指定`--lib`可以指定其为库项目。一个工程，只能包含一个库目标，但是可以包含多个二进制程序。

### 添加依赖

当需要依赖外部库的时候，首先要将其加入到工程中：

```bash
$ cargo add [options] crate…
$ cargo add [options] --path path
$ cargo add [options] --git url [crate…]
```

三种不同的参数，可以针对三种情况的依赖。

- 直接跟库名，会去`cargo.io`上索引，找到最新的版本
- `--path`指定库在本地的路径，可以对本地目录进行依赖
- `--git` 则指定的git仓库的路径，比如是私有的git仓库

通过 `cargo remove` 可以移除相关的依赖。

### 构建 & 执行

前面已经接触了构建。直接用`build`就可以了:

```bash
$ cargo build [options]
```

这里有几个参数

- `--workspace`： 构建整个`workspace`里面的目标
- `--lib`： 构建库目标
- `--bin name…`： 只构建指定的可执行文件
- `--example name…`： 只构建指定的`example`
- `--test name…`： 构建指定的`test`
- `--release`: 采用`relase`构建

而通过：

```bash
$ cargo clean [options]
```

则可以清除构建结果

执行通过`run`命令来发起：

```bash
$ cargo run [options] [-- args]
```

其中如果是传递给cargo的`flag`直接传入。如果要传递给被执行的程序。则需要使用 "`--`" 做分割。其后的 `flag`才是传递给要运行的程序的。

- `--bin name…`： 只执行指定的可执行文件
- `--example name…`： 只执行指定的`example`

```bash
$ cargo run --bin helloworld
Finished dev [unoptimized + debuginfo] target(s) in 0.04s
Running `target/debug/helloworld`
Please use ./hellowolrd name.
```

没有携带参数。

如果是这样：

```bash
$ cargo run --bin helloworld -l
error: unexpected argument '-l' found

tip: to pass '-l' as a value, use '-- -l'

Usage: cargo run [OPTIONS] [args]...

For more information, try '--help'.
```

这里实际上是把`-l`传递给了`cargo run` ，但是`cargo run`本身是不接受"`-l`"的`flag`的。所以这里报错了。

```bash
cargo run --bin helloworld -- -l
    Finished dev [unoptimized + debuginfo] target(s) in 0.00s
    Running `target/debug/helloworld -l`
Hello -l
```

通过"`--`"的分割，我们将`flag`参数跳过`cargo run`传递给可执行程序。

更多其他参数可以参考 [The Cargo Book](https://doc.rust-lang.org/cargo/)

## Cargo.toml结构

每个`Cargo.toml`包含如下内容：

- `[cargo-features]` --- Unstable, nightly-only features.
- `[[package]]` --- Defines a package.
    - `[name]` --- The name of the package.
    - `[version]` --- The version of the package.
    - `[authors]` --- The authors of the package.
    - `[edition]` --- The Rust edition.
    - `[rust-version]` --- The minimal supported Rust version.
    - `[description]` --- A description of the package.
    - `[documentation]` --- URL of the package documentation.
    - `[readme]` --- Path to the package's README file.
    - `[homepage]` --- URL of the package homepage.
    - `[repository]` --- URL of the package source repository.
    - `[license]` --- The package license.
    - `[license-file]` --- Path to the text of the license.
    - `[keywords]` --- Keywords for the package.
    - `[categories]` --- Categories of the package.
    - `[workspace]` --- Path to the workspace for the package.
    - `[build]` --- Path to the package build script.
    - `[links]` --- Name of the native library the package links with.
    - `[exclude]` --- Files to exclude when publishing.
    - `[include]` --- Files to include when publishing.
    - `[publish]` --- Can be used to prevent publishing the package.
    - `[metadata]` --- Extra settings for external tools.
    - `[default-run]` --- The default binary to run by [cargo run].
    - `[autobins]` --- Disables binary auto discovery.
    - `[autoexamples]` --- Disables example auto discovery.
    - `[autotests]` --- Disables test auto discovery.
    - `[autobenches]` --- Disables bench auto discovery.
    - `[resolver]` --- Sets the dependency resolver to use.
- Target tables:
    - `[[lib]]` --- Library target settings.
    - `[[[bin]]]` --- Binary target settings.
    - `[[[example]]]` --- Example target settings.
    - `[[[test]]]` --- Test target settings.
    - `[[[bench]]]` --- Benchmark target settings.
- Dependency tables:
    - `[[dependencies]]` --- Package library dependencies.
    - `[[dev-dependencies]]` --- Dependencies for examples, tests, and benchmarks.
- `[[build-dependencies]]` --- Dependencies for build scripts.
- `[[target]]` --- Platform-specific dependencies.
- `[[badges]]` --- Badges to display on a registry.
- `[[features]]` --- Conditional compilation features.
- `[[patch]]` --- Override dependencies.
- `[[replace]]` --- Override dependencies .
- `[[profile]]` --- Compiler settings and optimizations.
- `[[workspace]]` --- The workspace definition.

整个的完整的内容会比较多，普通情况下只需要使用默认生成的文件，然后在里面填充dependence即可。

作为实践，一般将`Cargo.toml`分成两类。对于一个大repo，会将所有的代码放在一个目录下面，通过一个包含`workspace` 的`Cargo.toml`来管理其他自`Cargo.toml`。类似Makefile的嵌套管理。

比如solana工程的：

```toml
[workspace]
    members = [
        "account-decoder",
        "accounts-bench",
        ...
    ]


    exclude = [
        "programs/sbf",
    ]

    # This prevents a Travis CI error when building for Windows.
    resolver = "2"

    [workspace.package]
    version = "1.17.0"
    authors = ["Solana Labs Maintainers <maintainers@solanalabs.com>"]
    repository = "https://github.com/solana-labs/solana"
    homepage = "https://solanalabs.com/"
    license = "Apache-2.0"
    edition = "2021"

    [workspace.dependencies]
    aes-gcm-siv = "0.10.3"
    ahash = "0.8.3"

    ...
```
这里能看到，主要结构就是通过`workspace.members`来指定了子目录。 `exclude`指定不要的目录。`workspace.dependencies`指定了整个工作 区要依赖的库。

另外一种就是具体的执行程序或者库的目录，也就是`workspace`管理的具体子目录，这里比如solana cli的目录：

```toml
[package]
    name = "solana-cli"
    description = "Blockchain, Rebuilt for Scale"
    documentation = "https://docs.rs/solana-cli"
    version = { workspace = true }
    authors = { workspace = true }
    repository = { workspace = true }
    homepage = { workspace = true }
    license = { workspace = true }
    edition = { workspace = true }

    [dependencies]
    bincode = { workspace = true }
    bs58 = { workspace = true }
    ...

    [dev-dependencies]
    solana-streamer = { workspace = true }
    solana-test-validator = { workspace = true }
    tempfile = { workspace = true }

    [[bin]]
    name = "solana"
    path = "src/main.rs"

    [package.metadata.docs.rs]
    targets = ["x86_64-unknown-linux-gnu"]
```

这里`package`下面的键指定了库的属性，比如名字，描述。而`dependencies`指定了依赖， 其中 `{ workspace = true } `表示其继承`workspace`父目录中的 相关位置版本的信息。

最后这通过`[[bin]]`定义了这里有个可执行程序叫: "solana"

## 工程目录结构

我们来看一个相对复杂的cargo工程目录：

```bash
├── Cargo.lock
├── Cargo.toml
├── examples
│   ├── example01.rs
│   └── example_files
│       ├── func.rs
│       └── main.rs
├── src
│   ├── bin
│   │   ├── bin1.rs
│   │   └── bin2.rs
│   └── lib.rs
└── tests
    ├── test01.rs
    └── test_files
        ├── func.rs
        └── main.rs
```

在这个`demo`里面，我们主要包含了 三个目录：

- `src`: 库和二进制文件
- `example`: 例子
- `tests`: 集成测试

## 可执行程序

可执行程序，可以将其放入`src/bin`目录下。每个文件可以有自己单独的`main`函数。比如这里：

```rust
// bin1.rs:
use cargodir::lib_func;


fn main() {
    lib_func();
    println!("it is bin1");
}
```

使用到的库函数在`lib.rs`中定义：

```rust
pub fn lib_func() {
    println!("lib_func");
}
```

但是在可执行程序文件中，通过`use`来包含，然后在`main`函数中调用。

如果不是按照`src/bin`目录来组织代码的，需要在`Cargo.toml`中进行指定，比如用cli目录：

```toml
[[bin]]
    name = "bin1"
    path = "src/cli/bin1.rs"

    [[bin]]
    name = "bin2"
    path = "src/cli/bin2.rs"
```

这样就可以通过--bin来指定要执行哪个name的可执行程序了：

```bash
cargo run --bin bin1
    Finished dev [unoptimized + debuginfo] target(s) in 0.00s
    Running `target/debug/bin1`
lib_func
it is bin1
```

##  例子程序
示例程序可以通`examples`目录来管理。其中可以是单个文件，也可以用一个目录来组织多个文件。单个文件和目录中都可以实现 `main`函数作为示例程序的入口：

比如`example01.rs`:

```rust
fn main() {
    println!("it is example 01 ");
}
```

这样只要执行：

```bash
cargo run --example example01
Compiling cargodir v0.1.0 (Solana-Asia-Summer-2023/s101/Solana-Rust/demo/cargodir)
    Finished dev [unoptimized + debuginfo] target(s) in 0.20s
    Running `target/debug/examples/example01`
it is example 01
```

## 集成测试程序

单元测试是放在实现文件中的，如果有集成测试，则可以类似例子一样，组织在`tests`目录中。一样可以单个文件或者多个文件放在一个目录中。

比如：`test01.rs`:

```rust
#[test]
    fn test_main() {
        println!("it is test 01");
    }
```

运行：

```bash
cargo test --test test01
    Compiling cargodir v0.1.0 (Solana-Asia-Summer-2023/s101/Solana-Rust/demo/cargodir)
        Finished test [unoptimized + debuginfo] target(s) in 0.22s
        Running tests/test01.rs (target/debug/deps/test01-de791c18df3f4346)

    running 1 test
    test test_main ... ok

    test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
```

## 参考

[The Cargo Book](https://doc.rust-lang.org/cargo/)
