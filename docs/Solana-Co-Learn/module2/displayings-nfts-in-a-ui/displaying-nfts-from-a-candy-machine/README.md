---
sidebar_position: 39
sidebar_label: 🖼 从糖果机展示NFTs
sidebar_class_name: green
tags:
  - displayings-nfts
  - solana
  - nft
  - metaplex
  - candy
---

# 🖼 从糖果机展示NFTs

现在我们已经铸造了一个`NFT`，接下来我们将学习如何铸造一系列的`NFT`。为此，我们将利用Candy Machine来实现——这是`Solana`的一个程序，使创作者能够将他们的资产上链。虽然这并非创建系列的唯一方式，但在`Solana`上它却成了标准，因为它具备了许多有用的功能，例如机器人保护和安全随机化。你是否感受到过看到闪亮的新iPhone时的那股兴奋感？稀有的`NFT`有点儿类似于此。对于优秀的艺术家而言，仅仅是观看这些`NFT`也极富乐趣。毕竟，艺术的本质就是用来欣赏的！接下来，我们将探讨如果我们只有`Candy Machine`的地址，应该如何展示`NFTs`。

你能猜到这里有何不同之处吗？没错，我们仅在`SDK`上采用了一种不同的方法！

![](./img/candy-machine-nft.png)

由于这里并没有钱包，我们不需要使用 `walletAdapterIdentity`，只需使用`metaplex`对象即可。

![](./img/find-nf.png)

我们在此有几个选择 - `findByAddress` 就是我们所需的。

![](./img/find-by-address.png)

与我们为单个`NFT`所获取的相似，我们将会得到整个糖果机实例的元数据。`items` 字段是糖果机内所有`NFT`的数组。每个项目都不会直接包含我们想要的内容，而是会引向一个我们可以从中提取资产的URI。

![](./img/find-by-address-result.png)

鉴于收藏品可能会相当庞大，我们不会一次性获取所有的`NFT`。相反，我们将基于分页系统，只获取我们想要展示的`NFT`。

那么，让我们一起来绘制一些像素吧！

## 🥁 请准备一个糖果机

你可以从上一节的进度继续，或者使用我们上次使用的相同模板（从起始分支开始即可）。

赶紧跳入 `FetchCandyMachine.tsx` 文件吧。你会发现一些设置已经为你准备好了。我们将使用 `getPage` 函数从糖果机上获取某“页面”上的物品。在此之前，我们需要获取糖果机的元数据账户。

在空的 `fetchCandyMachine` 函数上方设置 `metaplex` 对象的连接。

```js
export const FetchCandyMachine: FC = () => {
  // 占位符 CMv2 地址
  const [candyMachineAddress, setCandyMachineAddress] = useState("")
  const [candyMachineData, setCandyMachineData] = useState(null)
  const [pageItems, setPageItems] = useState(null)
  const [page, setPage] = useState(1)

  const { connection } = useConnection()
  const metaplex = Metaplex.make(connection)
  ```

在创建有状态变量时，请确保添加你的`Candy Machine`地址。

```js
export const FetchCandyMachine: FC = () => {
  const [candyMachineAddress, setCandyMachineAddress] = useState("CM_ADDRESS_HERE")
  ...
```

接下来，我们将完善 `fetchCandyMachine` 函数。我们将使用之前看到的 `findByAddress` 方法。

```js
export const FetchCandyMachine: FC = () => {
  ...

  // 通过地址获取糖果机
  const fetchCandyMachine = async () => {

    // 设置页面为1 - 我们想要在获取新糖果机时始终位于第一页
    setPage(1)

    // 获取糖果机数据
    try {
      const candyMachine = await metaplex
        .candyMachinesV2()
        .findByAddress({ address: new PublicKey(candyMachineAddress) })

      setCandyMachineData(candyMachine)
    } catch (e) {
      alert("请输入有效的CMv2地址。")
    }
  }
  ...
}
```

注意：`Metaplex CLI`的最新版本在函数调用的末尾不需要 `run()`。

现在来到重要的部分 - 浏览我们将获取的CM数据。以下是 `getPage` 函数的样子：

```js
export const FetchCandyMachine: FC = () => {
  ...

  // 分页
  const getPage = async (page, perPage) => {
    const pageItems = candyMachineData.items.slice(
      (page - 1) * perPage,
      page * perPage
    )

    // 获取页面中NFT的元数据
    let nftData = []
    for (let i = 0; i < pageItems.length; i++) {
      let fetchResult = await fetch(pageItems[i].uri)
      let json = await fetchResult.json()
      nftData.push(json)
    }

    // 设置状态
    setPageItems(nftData)
  }
  ...
}

```

我们在这里做的是将 `items` 数组切割成大小为`10`的部分。然后我们获取页面上每个`NFT`的元数据，并将其存储在 `nftData` 中。最后，我们将 `pageItems` 状态变量设置为刚刚获取的 `nftData`。

这意味着我们的应用程序在任何时候只会渲染当前页面的`NFT`。相当棒！

让我们填写 `prev` 和 `next` 函数：

```js
// 上一页
const prev = async () => {
  if (page - 1 < 1) {
    setPage(1)
  } else {
    setPage(page - 1)
  }
}

// 下一页
const next = async () => {
  setPage(page + 1)
}
```

当用户点击“上一页”和“下一页”按钮时，这些功能将运行。这些按钮只会在 `pageItems` 不为空时显示（即当我们获取了CM的`NFT`时）。

现在我们需要一些 `useEffects` 来开始。整个过程一开始可能有点复杂，所以让我们一步一步解释。

- 1. 在页面加载时运行 `fetchCandyMachine` 函数（如果 `candyMachineAddress` 不为空）。
- 2. 每当使用 `fetchCandyMachine` 获取糖果机时，将 `page` 设置为`1`，这样你就可以从第一页开始。
- 3. 每当 `candyMachineData` 或 `page` 发生变化时（即输入新的CM地址或点击下一个/上一个按钮），重新加载页面。

以下是代码示例：

```js
export const FetchCandyMachine: FC = () => {
  ...

  // 页面加载时获取占位符糖果机
  useEffect(() => {
    fetchCandyMachine()
  }, [])

  // 当页面或糖果机发生变化时获取NFT的元数据
  useEffect(() => {
    if (!candyMachineData) {
      return
    }
    getPage(page, 9)
  }, [candyMachineData, page])

}
```

快到 `localhost:3000` 上试试吧！你应该能够看到你的糖果机上`NFT`的第一页。
