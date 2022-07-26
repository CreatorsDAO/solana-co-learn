---
ics: '1'
title: ICS 规范标准
stage: 草案
category: 元标准
kind: 元标准
author: Christopher Goes <cwgoes@tendermint.com>
created: '2019-02-12'
modified: '2019-08-25'
---

## 什么是 ICS？

链间标准（ICS）是一份描述适用于 Cosmos 生态的特定协议、标准或期望特性的设计文档。ICS 应列出标准所需的属性、解释设计原理，并提供简明、全面的技术规范。ICS 的主要作者负责通过标准化流程推动提案，征求社区的投入和支持，并与利益相关者进行沟通，以确保（社会层面的）共识。

链间标准化过程应当是提出生态范围协议、变更与特性的主要载体， 且 ICS 文档应在达成共识后持久保留，以作为设计决策的记录和未来实施者的信息存储库。

链间标准*不应*作为针对特定区块链的修改建议（如 Cosmos Hub），指定实现细节（例如特定编程语言的数据结构），或讨论有关现有 Cosmos 区块链的治理建议（尽管 Cosmos 生态中的各个区块链可能会利用其治理流程决定采用或拒绝链间标准）。

## 组件

ICS 由标题、概要、规范、历史记录和版权声明组成。需包含所有顶层章节。参考文献应作为链接包含在正文中，或在必要时以表格形式列在章节末尾。

### 标题

ICS 标题应包含与 ICS 相关的元数据。

#### 必选项

`ics: #` - ICS 编号（顺序分配）

`题目` - ICS 题目（确保简短）

`阶段` - 当前 ICS 阶段，请参见 [PROCESS.md](../../../../meta/PROCESS.md) 获取可能的阶段列表。

有关 ICS 可接受阶段的说明，请参见 [README.md](../../../../README.md)。

`类别` - ICS 类别，应为以下之一：

- `元标准` - 有关 ICS 流程的标准
- `IBC/TAO` - 有关区块链间通信系统核心传输、身份认证和排序层协议的标准。
- `IBC/APP` - 关于区块链间通信系统应用层协议的标准。

`作者` - ICS 作者和联系信息（优先顺序：电子邮件、GitHub、Twitter、其他可能得到回应的联系方法）。第一作者是 ICS 的主要“所有者”，并负责通过标准化过程进行推进。随后的作者应按贡献度排序。

`创建` - 首次创建 ICS 的日期（YYYY-MM-DD）

`修改` - ICS 上次修改日期（YYYY-MM-DD ）

#### 可选项

`依赖` - 此标准依赖的其他 ICS 标准（使用编号引用）。

`依赖于` - 依赖此标准的其他 ICS 标准（使用编号引用）。

`替换` - 被此标准替代的另一个 ICS 标准（如果适用）。

`替换为` - 替代此标准的另一个 ICS 标准（如果适用）。

### 概要

ICS 应在标题之后编写简短的概要（约 200 字），提供规范的高级描述和基本原理。

### 规范

「规范」是 ICS 的主要组成部分，应包含协议文档、设计原理、必需的参考以及适当的技术细节。

#### 子组件

规范可以包含任何或所有以下子组件，具体根据特定 ICS 类型确定。包含的子组件应按此处指定的顺序列出。

- *动机* - 提议特性或对现有特性的修改的根本依据。
- *定义* - 此 ICS 中使用的或理解该 ICS 所需的新术语或概念的列表。未在顶级“ docs”文件夹中定义的术语必须在此处定义。
- *所需属性* - 此协议所需的属性或特性，以及违反这些属性时的预期结果或错误的列表。
- *技术规范* - 所提议协议的所有技术细节，包括语法、语义、子协议、数据结构、算法和相应的伪代码。技术规范应足够详细，使独立的正确实现可以在不参阅其他规范的情况下彼此兼容。
- *向后兼容性* - 讨论与以前的功能或协议版本的兼容性（或缺乏兼容性）。
- *向前兼容性* - 讨论与未来可能或预期的功能或协议版本的兼容性（或缺乏兼容性）。
- *示例实现* - 具体的示例实现或对预期实现的描述，是实现者的主要参考。
- *其他实现* - 候选或最终实现的列表（外部引用，无需以正文形式出现）。

### 历史

ICS 应该包括一个“历史记录”部分，列出所有启发性的文档以及重大更改的纯文本日志。

请参见[下方](#history-1)的示例历史记录 。

### 版权

ICS 应该包含版权部分，按照 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 的要求放弃权利。

## 格式

### 总体格式

ICS 规范必须使用符合 GitHub 风格的 Markdown 格式编写。

有关 GitHub 风格的 Markdown 速查表，请参见[此处](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet)。有关本地 Markdown 渲染器，请参见[此处](https://github.com/joeyespo/grip)。

### 用语

ICS 规范应使用简单英语编写，避免使用晦涩的术语和不必要的行话。有关简单英语的最佳示例，请参见 [Simple English Wikipedia](https://simple.wikipedia.org/wiki/Main_Page)。

规范中的关键词“必须”、“禁止”、“必选”、“应该”、“不应该”、“应当”、“不应当”、“建议”、“可”，以及“可选”需遵照 [RFC 2119](https://tools.ietf.org/html/rfc2119) 中的说明进行解释。

### 伪代码

规范中的伪代码应与语言无关，并以简单的命令式标准进行格式化，并带有行号、变量、简单的条件块，for 循环和需要解释更多功能的英语片段，如调度超时。应避免使用 LaTeX 图片，因为这类图片很难以 diff 形式进行查看。

用于结构体的伪代码应以简单的 Typescript 作为接口编写。

伪代码结构示例：

```typescript
interface Connection {
  state: ConnectionState
  version: Version
  counterpartyIdentifier: Identifier
  consensusState: ConsensusState
}
```

用于算法的伪代码应以简单的 Typescript 作为函数编写。

伪代码算法示例：

```typescript
function startRound(round) {
  round_p = round
  step_p = PROPOSE
  if (proposer(h_p, round_p) === p) {
    if (validValue_p !== nil)
      proposal = validValue_p
    else
      proposal = getValue()
    broadcast( {PROPOSAL, h_p, round_p, proposal, validRound} )
  } else
    schedule(onTimeoutPropose(h_p, round_p), timeoutPropose(round_p))
}
```

## 历史

该规范的灵感来自以太坊的 [EIP 1](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1.md)，分别源自比特币的 BIP 流程和 Python 的 PEP 流程。前任作者不对本 ICS 规范或 ICS 流程的不足负责。请将所有评论定向到 ICS 仓库维护者。

2019年3月4日 - 初稿已完成并提交 PR

2019年3月7日 - 草案合并

2019年4月11日 - 更新伪代码格式，添加定义小节

2019年8月17日 - 类别澄清

## 版权

本规范所有内容均采用 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可授权。
