---
title: 贡献
sidebar_position: 3
tags:
  - solana-cook-book
  - contribute
---

# 贡献

欢迎任何人对这本食谱进行贡献。在贡献新的代码片段时，请参考项目的风格。

## 结构

目前我们在 `/docs` 下有"`cookbook-zh`"，所有的内容都在这个文件中。

## 参考文献

参考资料是一个总体主题，其中列出了关于如何在该主题下进行操作的参考资料。一般的结构如下：

```md
Code Reference Title

Short Summary

Code Snippet
```

## 指南

指南是关于各种主题的长篇信息文档。撰写指南的一般结构如下：

```md
Brief Summary/TLDR

Fact Sheet

Deep Dive

Other Resources
```

## 建筑

我们使用 [Docusaurus](https://docusaurus.io/) 来构建这个网站。请参考它的文档来了解如何在本地运行它。

一般是这样的：

```bash
npm install
```

```bash
npm run build
npm run start
```

## Committing

我们在这个仓库中使用[传统的提交](https://www.conventionalcommits.org/en/v1.0.0/)方式。

选择一个任务或者自己创建一个，按照以下步骤进行：

1. 为[任务添加一个问题](https://github.com/CreatorsDAO/all-in-one-solana/issues/new)，并将其分配给自己或在问题上进行评论
2. 制作一份涉及该问题的初稿公关文件。

做出贡献的一般流程：

1. 在GitHub上fork这个仓库
2. 将项目克隆到您自己的机器上
3. 提交更改到你自己的分支
4. 将你的工作推回到你的分支
5. 提交一个Pull请求，以便我们可以审查您的更改

:::caution
注意：在发起拉取请求之前，请确保将最新的更改合并到“上游”！
:::

您可以在项目[看板](https://github.com/CreatorsDAO/all-in-one-solana/issues)上找到任务，或者创建一个问题并将其分配给自己。

快乐烹饪！
