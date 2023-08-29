---
sidebar_position: 62
sidebar_label: 🕒 质押工作机制详解
sidebar_class_name: green
tags:
  - nft-staking
  - solana
  - native-solana-program
  - how-staking-works
---

# 🕒 质押工作机制详解

恭喜你已经接近第三周的完成了！现在让我们将你学到的所有知识运用到你正在进行的`NFT`项目（`buildoors`项目）的相关质押计划中。

我们希望你能完整地构建质押计划的所有内容，除了实际的代币功能部分。这表示在你计划与代币程序交互的任何环节，我们暂时只记录一条消息或跳过它，待下周再进行深入审视。

目前，你的主要目标是开发一个能够跟踪每个用户质押状态的程序。下面是一些基本步骤：

你应该设计`4`个指令：

- **初始化质押账户（InitializeStakeAccount）：** 这将创建一个新账户，用于记录每个用户/非同质化代币组合的质押过程状态信息。该`PDA`的种子应由用户的公钥和非同质化代币的令牌账户组成。
- **质押：** 此指令通常用于实际质押操作。但目前，我们并不进行真正的质押，只是更新“状态”账户，以显示代币已被质押，及质押时间等信息。
- **兑换：** 这里是你会根据用户的抵押时间发放奖励代币的地方。目前，只需记录他们应得的代币数量（可以暂时设定每单位时间`1`个代币），并更新状态以显示上次兑换代币的时间。
- **解除质押：** 此处是你赎回任何多余代币并撤销`NFT`质押的地方。现阶段，这只意味着更新状态，以表明`NFT`未被质押，并记录应得的奖励代币数量。

这确实是一项具有挑战性的任务。在查看参考解决方案或观看视频教程之前，试着自己先设计一些内容。如果没有做得完美，也没关系，挣扎是学习过程的一部分。
**提示：**你可以使用`solana_program::clock::Clock`来获取时间。如果需要，你可以[查看文档](https://docs.rs/solana-program/latest/solana_program/clock/struct.Clock.html?utm_source=buildspace.so&utm_medium=buildspace_project)。
如果你已经尽力尝试了，还可以随时查看[解决方案代码](https://beta.solpg.io/6328f26177ea7f12846aee9b?utm_source=buildspace.so&utm_medium=buildspace_project)。如果你准备继续，欢迎开始为质押功能和与程序交互的用户界面进行开发。
