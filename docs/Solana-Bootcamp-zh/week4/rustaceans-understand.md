---
sidebar_position: 131
sidebar_label: Rustaceans的理解
sidebar_class_name: green
---

# Rustaceans的理解

如果没有其他语言为基础。那么不建议首先学习 Rust。但是有了其他语言的基础，又会对 Rust 的语言中的一些不那么常见的语法所难倒。

这里 Rustaceans 是对 Rust 程序员的一种昵称，我们在写代码的时候，也需要尽量的用 Rust 的思维来写，而不是对其他语言的翻译。比如将已有的 Solidity 翻译成 Rust。

这里标题为 Rustaceans，其实内容是 Rust 的陷阱与缺陷。主要讲一些 Rust 里面比较难理解的语法。

## 内存管理

rust 不是说不需要像 C++一样 new/delete，自己开辟/释放内存么？怎么还需要说内存管理。

所有权和借用
智能指针
rust 的智能指针，主要提供了

- `Box<T>` 在堆上分配空间
- `Rc<T>` 引用计数，可以使得一个对象有多个 `owner`
- `Ref<T>` and `RefMut<T>`, `RefCell<T>` 强制要求在运行时检查借用关系，而不是编译期间，就有点动态检查的意思

### Box<T>

box 顾名思义，就是装箱，在 Objective-C 中有相关概念。本质就类似 C 里面 alloc 一段内存，然后将值 copy 过去。

```rust
fn main() {
        let b = Box::new(5);
        println!("b = {}", b);
    }
```

这个时候，`b` 实际上存储的是一个指针，指向一段放了数字 5 的内存，这段内存在堆上面。

类似这样的定义：

```rust
enum List {
    Cons(i32, Box<List>),
    Nil,
}

use crate::List::{Cons, Nil};

fn main() {
    let list = Cons(1, Box::new(Cons(2, Box::new(Cons(3, Box::new(Nil))))));
}
```
就好比是 C++里面的前向类声明，然后存一个该类的指针。如果这里不用 `Box`，就会导致，这里在推测使用了多少空间的时候，陷入了循环。而 `Box` 只需要放一个指针大小就可以了。具体的内容在里面指向。

![](../img/week3/coins.png)

### Rc<T>

Rc：Reference Count，也就是 C++里面智能指针最常见的方式，当某个空间需要使用时，就对其计数加一。当不需要的时候，就减一。当引用技术的值为 0 的时候，就对其进行销毁。

比如这样的代码：

```rust
enum List {
    Cons(i32, Box<List>),
    Nil,
}

use crate::List::{Cons, Nil};

fn main() {
    let a = Cons(5, Box::new(Cons(10, Box::new(Nil))));
    let b = Cons(3, Box::new(a));
    let c = Cons(4, Box::new(a));
}
```

会出错：

```bash
error[E0382]: use of moved value: `a`
    --> src/main.rs:11:30
    |
    9  |     let a = Cons(5, Box::new(Cons(10, Box::new(Nil))));
    |         - move occurs because `a` has type `List`, which does not implement the `Copy` trait
    10 |     let b = Cons(3, Box::new(a));
    |                              - value moved here
    11 |     let c = Cons(4, Box::new(a));
    |                              ^ value used here after move
```

因为这里在用 `Box` 创建 `b` 的时候，已经将 `a` 借用了。接着又在创建 `c` 的时候，借用了 `a`，此时 `a` 所表达的空间的 `owner` 已经不再是 `a`。因此报错。

这里可以修改成：

```rust
enum List {
    Cons(i32, Rc<List>),
    Nil,
}

use crate::List::{Cons, Nil};
use std::rc::Rc;

fn main() {
    let a = Rc::new(Cons(5, Rc::new(Cons(10, Rc::new(Nil)))));
    let b = Cons(3, Rc::clone(&a));
    let c = Cons(4, Rc::clone(&a));
}
```

首先将 `a` 定义为 `Rc`，是一个引用计数智能指针，它包含了空间内容，和空间计数。 每次 `Rc::clone` 的时候，都会将计数器`+1`,同时返回一个 `Rc`，其中内容指向的是同一个地方，但是引用计数`+1`。

因此就可以同时创建 `b` 和 `c` 了。

### RefCell<T>

前面借用有介绍到,不可以在 `mut` 借用后，继续可读借用。

比如代码：

```rust
fn main() {
    let x =String::from("hello, world");

    let y = x.borrow_mut();
    let z = x.borrow();

    print!("y:{}, z:{}", y,z);
}
```
报错：

```bash
--> src/main.rs:1:5
    |
    1 | use std::cell::RefCell;
    |     ^^^^^^^^^^^^^^^^^^
    |
    = note: `#[warn(unused_imports)]` on by default

    error[E0599]: no method named `borrow_mut` found for struct `String` in the current scope
    --> src/main.rs:6:15
        |
    6   |     let y = x.borrow_mut();
        |               ^^^^^^^^^^ method not found in `String`
        |
    ::: /Users/changzeng/.rustup/toolchains/stable-x86_64-apple-darwin/lib/rustlib/src/rust/library/core/src/borrow.rs:206:8
        |
    206 |     fn borrow_mut(&mut self) -> &mut Borrowed;
        |        ---------- the method is available for `String` here
        |
        = help: items from traits can only be used if the trait is in scope
    help: the following trait is implemented but not in scope; perhaps add a `use` for it:
        |
    1   + use std::borrow::BorrowMut;
        |

    error[E0599]: no method named `borrow` found for struct `String` in the current scope
    --> src/main.rs:7:15
        |
    7   |     let z = x.borrow();
        |               ^^^^^^ method not found in `String`
        |
    ::: /Users/changzeng/.rustup/toolchains/stable-x86_64-apple-darwin/lib/rustlib/src/rust/library/core/src/borrow.rs:179:8
        |
    179 |     fn borrow(&self) -> &Borrowed;
        |        ------ the method is available for `String` here
        |
        = help: items from traits can only be used if the trait is in scope
    help: the following trait is implemented but not in scope; perhaps add a `use` for it:
        |
    1   + use std::borrow::Borrow;
        |
```

现在修改成 `RefCell`:

```rust
use std::cell::RefCell;

    fn main() {
        let x = RefCell::new(String::from("hello, world"));

        let y = x.borrow_mut();
        let z = x.borrow();

        print!("y:{}, z:{}", y,z);
    }
```

虽然不可以运行，但是却可以通过编译。因为在运行的时候，还是会检查借用关系：

```bash
Running `target/debug/helloworld`
    thread 'main' panicked at 'already mutably borrowed: BorrowError', src/main.rs:7:15
    note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace
```

那这个有啥用呢？还不如在编译期间检查。那比如如下代码呢？

```rust
let x = RefCell::new(String::from("hello, world"));

if your_x_switch {
    let y = x.borrow_mut();
}
if (your_z_switch) {
    let z = x.borrow();
}
```

仅通过编译是没法区分 `if` 分支的，但是再运行时，可以保证只走一个分支。

### 生命周期

首先生命周期修饰是一个泛型修饰，也就是意味他是针对类型的。生命周期主要用来解决悬垂指针问题。也就是引用了一个已经被释放的空间。

那么如何保证被引用的空间一定没有被释放呢？就需要通过生命周期修饰，使得 rust 知道某个空间还在被引用中，不可以自动释放。

比如：

```rust
fn main() {
        let r;                  // ---------+-- 'a
                                //          |
        {                       //          |
            let x = 5;          // -+-- 'b  |
            r = &x;             //  |       |
        }                       // -+       |
                                //          |
        println!("r: {}", r);   //          |
    }    // ---------+
```

这里，编译会报错：

```bash
--> src/main.rs:6:13
    |
    6 |         r = &x;
    |             ^^ borrowed value does not live long enough
    7 |     }
    |     - `x` dropped here while still borrowed
    8 |
    9 |     println!("r: {}", r);
    |                       - borrow later used here
```

在上面的代码部分，已经用注释吧生命周期范围罗列出来了，因为 `r` 借用超过了`'b` 的空间，所以报错，因为超过`'b` 后，`x` 不再存在。

所以一般我们在描述生命周期的是，也采用`'a` `'b` 的形式。

再来看一个编译错误的例子：

```rust
fn longest(x: &str, y: &str) -> &str {
        if x.len() > y.len() {
            x
        } else {
            y
        }
    }

    fn main() {
        let string1 = String::from("abcd");
        let string2 = "xyz";

        let result = longest(string1.as_str(), string2);
        println!("The longest string is {}", result);
    }
```

报错为：

```bash
--> src/main.rs:9:33
    |
    9 | fn longest(x: &str, y: &str) -> &str {
    |               ----     ----     ^ expected named lifetime parameter
    |
    = help: this function's return type contains a borrowed value, but the signature does not say whether it is borrowed from `x` or `y`
    help: consider introducing a named lifetime parameter
    |
    9 | fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    |           ++++     ++          ++          ++
```

修改方式，编译器也给出来了：

```rust
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str
```

这里`<'a>`是一个泛型修饰符，在原有的`&str` 中间增加 `'a` 来修饰这个参数的生命周期。

上面的修改，要求传入的参数生命周期，`x`、`y`、`z `三者的最小范围要一致。

## 错误处理

在类似 java/c++中，对错误处理，有抛异常的方式， 而类似 go 这样的，一般会通过多返回值的方式，返回一个错误。而在 rust 中，一般通过 `Enum` 的形式，返回一直结果返回值。

首先来看这里说的结果返回值，`Result` 的定义。这个定义是标准库中，可以在不用做特别 `use` 的情况下直接使用：

```rust
enum Result<T, E> {
    Ok(T),
    Err(E),
}
```

本质上他就是个枚举。包含两种可能，要么是一个 `T`,要么是一个 `E`。`T` 就是成功时应该正确返回的值类型，而 `E` 就是错误时，返回的错误类型。

来看一段使用案例：

```rust
use std::fs::File;

fn main() {
    let greeting_file_result = File::open("hello.txt");

    let greeting_file = match greeting_file_result {
        Ok(file) => file,
        Err(error) => panic!("Problem opening the file: {:?}", error),
    };
}
```

因为 `Result` 是个 `enum`，因此，这里可以通过 `match` 语法，来对其进行类型匹配。

`open` 的原型为：

```rust
pub fn open<P: AsRef<Path>>(path: P) -> io::Result<File>
```

这里 `io::Result` 定义为：

```rust
pub type Result<T> = result::Result<T, Error>;
```

而 `Error` 是 `std::io::error` 定义的：

```rust
pub struct Error {
    repr: Repr,
}
```

所以 Rust 可以推导出如果文件打开失败，这里 `greeting_file_result`，返回的是 `std::io::error::Error`，并放在枚举 `Err(error)`中包裹。通过 `match` 可以解出来进行打印。

## 测试代码

测试代码主要分为单元测试和集成测试。类似 go 语言特性，go 语言在标准库和工具层面提供了单元测试的方法。 rust 也在工具和标准库层面提供了类似地方方法。除此之外，rust 还提供了集成测试框架模板。

### 单元测试

在代码所在文件中，添加一个 `test` 的 `mod` 并用`#[cfg(test)]` 特性控制，然后在要执行 `test` 的函数上增加修饰 `[test]` 即可：

```rust
#[cfg(test)]
    mod tests {
        #[test]
        fn it_works() {
            let result = 2 + 2;
            assert_eq!(result, 4);
        }
    }
```

这样当我们执行

```bash
cargo test
    Compiling testcase v0.1.0 (Solana-Asia-Summer-2023/s101/Solana-Rust/demo/testcase)
        Finished test [unoptimized + debuginfo] target(s) in 0.23s
        Running unittests src/lib.rs (target/debug/deps/testcase-4146fa835bb26be8)

    running 1 test
    test tests::test_fun ... ok

    test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

    Doc-tests testcase

    running 0 tests

    test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
```

就会执行 `test mod` 里面的 `it_works` 函数了。

在上面的测试代码中，我们用 `assert_eq!` 宏判断了是否相等，如果失败的话，测试结果就是失败。我们还可以用 `panic`强行失败，这里我们增加测试代码：

```rust
#[test]
fn test_panic() {
    panic!("got panic");
}
```

失败 的时候表现为：

```bash
cargo test
    Compiling testcase v0.1.0 (Solana-Asia-Summer-2023/s101/Solana-Rust/demo/testcase)
        Finished test [unoptimized + debuginfo] target(s) in 0.30s
        Running unittests src/lib.rs (target/debug/deps/testcase-4146fa835bb26be8)

    running 2 tests
    test tests::test_fun ... ok
    test tests::test_panic ... FAILED

    failures:

    ---- tests::test_panic stdout ----
    thread 'tests::test_panic' panicked at 'got panic', src/lib.rs:12:9
    note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace


    failures:
        tests::test_panic

    test result: FAILED. 1 passed; 1 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

    error: test failed, to rerun pass `--lib`
```

## 集成测试

如果某个测试，需要涉及到多个模块的代码，并且还有一些初始化或者条件的设置。

我们可以在工程目录下新增一个 "`tests`" 目录，然后在在 `tests` 目录下增加文件或者目录。

在 `tests` 目录下的单个文件中，此时可以不用使用 `test` 模块。直接写要测试的逻辑。只需要在要测试的逻辑函数的上面用 `#[tset]`进行修饰即可。

比如：

```bash
.
    ├── Cargo.lock
    ├── Cargo.toml
    ├── src
    │   └── lib.rs
    └── tests
        ├── test01.rs
        └── test_files
            ├── func.rs
            └── main.rs
```

指定执行测试：

```bash
cargo test --test test01
    Finished test [unoptimized + debuginfo] target(s) in 0.00s
    Running tests/test01.rs (target/debug/deps/test01-0c980e86b9bfdada)

running 1 test
test test_main ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
```
