---
sidebar_position: 67
sidebar_label: 🧐 PDA 深入探究
sidebar_class_name: green
---

# 🧐 PDA深入探究

程序派生地址（`Program Derived Address，PDA`）, 让我们一起深入了解它们的工作原理。

`PDA`主要具有两个核心功能：

- 提供一种[确定性](https://www.google.com.hk/search?q=define+deterministic)的方法来查找程序拥有的账户地址。
- 授权派生自`PDA`的程序代表其签署，就像用户使用私钥签署一样。

换言之，它们是`Solana`网络上用于存储的安全键值存储解决方案。

## 🔎 寻找 PDAs (程序派生地址)

到现在为止，每次我们需要派生一个地址时，都使用了一个方便的函数。那么，这个函数到底做了什么呢？要了解答案，我们需要理解`Solana`密钥对是如何生成的。

回想一下密钥对的作用。它是一种证明你是你声称的人的方式。我们通过数字签名系统实现了这一点。`Solana`的密钥对基于所谓的`Ed25519`椭圆曲线（你不必担心这是什么）。

![](./img/pda.png)

由于`PDAs`由程序控制，所以它们不需要私钥。因此，我们使用不在`Ed25519`曲线上的地址来创建`PDAs`。这实际上意味着它们是没有相应私钥的公钥。

就是这样。你不需要理解`Ed25519`，甚至不需要知道数字签名算法是什么。你只需要知道`PDA`看起来像普通的`Solana`地址，并且由程序控制。如果你想进一步了解，可以观看`Computerphile`关于[数字签名](https://www.youtube.com/watch?v=s22eJ1eVLTU)的精彩视频。

要在`Solana`程序中找到一个`PDA`，我们将使用 `find_program_address` 函数。

“`seeds`”是用于派生`PDA`的 `find_program_address` 函数的可选输入。例如，`seeds`可以是任意组合：

- 指令数据
- 硬编码的值
- 其他账户的公钥

`find_program_address` 函数提供了一个额外的`seeds`，称为“`bump seed`”，以确保结果不在`Ed25519`曲线上。

一旦找到有效的`PDA`，该函数将返回两个值：

- `PDA`
- 用于派生`PDA`的`Bump`


```rust
let (pda, bump_seed) = Pubkey::find_program_address(&[user.key.as_ref(), user_input.as_bytes().as_ref(), "SEED".as_bytes()], program_id);
```

## 🍳 `find_program_address`函数内部解析

`find_program_address` 是一个冒牌货 - 它实际上将输入 `seeds` 和 `program_id` 传递给 `try_find_program_address` 函数。

```rust
pub fn find_program_address(seeds: &[&[u8]], program_id: &Pubkey) -> (Pubkey, u8) {
    Self::try_find_program_address(seeds, program_id)
        .unwrap_or_else(|| panic!("Unable to find a viable program address bump seed"));
}
```

然后， `try_find_program_address` 函数引入了 `bump_seed`。

`bump_seed` 是一个 `u8` 变量，其值范围在`0`到`255`之间。它被附加到可选的输入`seeds`中，然后传递给 `create_program_address` 函数。

```rust
pub fn try_find_program_address(seeds: &[&[u8]], program_id: &Pubkey) -> Option<(Pubkey, u8)> {

    let mut bump_seed = [std::u8::MAX];
    for _ in 0..std::u8::MAX {
        {
            let mut seeds_with_bump = seeds.to_vec();
            seeds_with_bump.push(&bump_seed);
            match Self::create_program_address(&seeds_with_bump, program_id) {
                Ok(address) => return Some((address, bump_seed[0])),
                Err(PubkeyError::InvalidSeeds) => (),
                _ => break,
            }
        }
        bump_seed[0] -= 1;
    }
    None

}
```

`create_program_address` 函数对`seeds`和 `program_id` 执行一系列哈希操作。这些操作计算出一个密钥，然后验证计算出的密钥是否位于`Ed25519`椭圆曲线上。

如果找到一个有效的`PDA`（即一个不在曲线上的地址），则返回该`PDA`。否则，返回一个错误。

```rust
pub fn create_program_address(
    seeds: &[&[u8]],
    program_id: &Pubkey,
) -> Result<Pubkey, PubkeyError> {

    let mut hasher = crate::hash::Hasher::default();
    for seed in seeds.iter() {
        hasher.hash(seed);
    }
    hasher.hashv(&[program_id.as_ref(), PDA_MARKER]);
    let hash = hasher.result();

    if bytes_are_curve_point(hash) {
        return Err(PubkeyError::InvalidSeeds);
    }

    Ok(Pubkey::new(hash.as_ref()))

}
```

总结一下：

- 该函数会将输入`seeds`与 `program_id` 一并交给 `try_find_program_address` 函数处理。
- `try_find_program_address` 函数在输入`seeds`中添加一个从`255`开始的 `bump_seed`，然后连续调用 `create_program_address` 函数，直到找到有效的`PDA`。
- 一旦找到了，就会返回找到的 `PDA` 和用于派生 `PDA` 的 `bump_seed`。

无需深究所有细节！关键在于理解调用 `find_program_address` 函数时在高层次上到底发生了什么。

## 🤔 有关程序派生地址（PDA）的一些说明

- 对于相同的输入`seeds`，不同的凸起值会生成不同的有效`PDA`。
- `find_program_address` 返回的 `bump_seed` 总是找到的第一个有效的`PDA`。
- 这个 `bump_seed` 通常被称作“标准`Bump`”（`canonical bump`）。
- 该函数只返回一个程序派生地址和用于派生该地址的增量`seeds`，不会做其他事情。
- 该函数不会初始化新的账户，也不会返回与存储数据相关的`PDA`。

## 🗺 PDA账户中数据的组织和存储

由于程序本质上没有状态，所有程序状态都由外部账户来管理。这意味着我们必须通过一系列映射来保持事务的联系。

你如何将`seeds`与`PDA`账户相映射，将高度取决于你的具体程序设计。虽然这不是一门关于系统设计或架构的课程，但以下几个指导方针值得注意：

- 要使用在`PDA`派生过程中可知的`seeds`。
- 请细心思考如何将数据分组到一个账户中。
- 要谨慎地考虑每个账户中数据结构的使用。
- 通常来说，简单就是最好的。

这些内容确实很多！不过再次强调，你不必记住此处解释的所有内容。下一步我们将构建一个链上评论系统，让我们一起探索这些理论如何在实际操作中发挥作用！
