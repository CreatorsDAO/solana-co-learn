---
sidebar_position: 38
sidebar_label: 📱 在钱包中展示NFTs
sidebar_class_name: green
tags:
  - displayings-nfts
  - solana
  - nft
  - metaplex
  - wallet
---

# 📱 在钱包中展示NFTs

现在我们已经铸造了一个`NFT`，接下来我们要探索如何铸造一系列的`NFT`。我们将使用`Candy Machine`来完成这项任务，这是一款`Solana`程序，能让创作者方便地将他们的资产上链。虽然这不是创建系列的唯一方式，但在`Solana`上它已经成为标准，因为它具有诸如防机器人保护和安全随机化等有用的功能。你懂的，模板时间到了。然而，随着我们构建的项目越来越复杂，我们的模板也会变得更先进。这次我们将基于[Solana dApp脚手架](https://github.com/solana-labs/dapp-scaffold)构建一个模板。与之前的模板一样，它是一个由`create-next-app`创建的`Next.js`应用程序。不过这次，它具有更多功能。不用担心！我们依然会使用相同的工具。

```bash
git clone https://github.com/all-in-one-solana/solana-display-nfts-frontend
cd solana-display-nfts-frontend
git checkout starter
npm install @metaplex-foundation/js@latest
npm i
npm run dev
```

在 `localhost:3000` 上，你应该能看到如下内容：

![](./img/display-from-wallet.png)

“展示`NFT`”页面目前还没有展示任何内容——这就是你的任务所在。

打开`src/components/FetchNFT.tsx`，让我们开始吧。我们会从组件顶部的Metaplex设置开始：

```tsx
export const FetchNft: FC = () => {
  const [nftData, setNftData] = useState(null)

  const { connection } = useConnection()
  const wallet = useWallet()
  const metaplex = Metaplex.make(connection).use(walletAdapterIdentity(wallet))

  const fetchNfts = async () => {}

  return <div></div>
}
```

看上去似曾相识吧。

现在我们来填写`fetchNfts`函数。我们将使用之前看到的`findAllByOwner`方法，并借助`useWallet`钩子来获取钱包地址。

```tsx
const fetchNfts = async () => {
   if (!wallet.connected) {
     return
   }

   // 为连接的钱包获取NFTs
   const nfts = await metaplex
     .nfts()
     .findAllByOwner({ owner: wallet.publicKey })

   // 为每个NFT获取链下元数据
   let nftData = []
   for (let i = 0; i < nfts.length; i++) {
     let fetchResult = await fetch(nfts[i].uri)
     let json = await fetchResult.json()
     nftData.push(json)
   }

   // 设置状态
   setNftData(nftData)
 }
```

由于我们希望在钱包更改时更新展示的`NFTs`，因此我们将在`useEffect`函数下方添加一个钩子来调用`fetchNfts`函数。

```tsx
export const FetchNft: FC = () => {
	...

  const fetchNfts = async () => {
		...
  }

  // 当连接的钱包改变时获取nfts
  useEffect(() => {
    fetchNfts()
  }, [wallet])

  return <div></div>
}
```

最后，我们需要更新`return`语句以展示`NFTs`。我们将使用之前创建的`nftData`状态变量。

```tsx
return (
    <div>
      {nftData && (
        <div className={styles.gridNFT}>
          {nftData.map((nft) => (
            <div>
              <ul>{nft.name}</ul>
              <img src={nft.image} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
```

现在我们可以看到我们的`NFT`了！🎉 这就是我的钱包的样子 😆

![](./img/nfts-wallet.png)

回顾过去的日子，那时我不得不手动完成所有这些工作，并且我一直受到RPC的速率限制，所以请花一些时间感谢`Metaplex`的开发人员为我们带来了这个精彩的`SDK`！

在`nftData`上玩一下。将其记录到控制台，并尝试显示其他值，如符号或描述！也许你还可以添加一个过滤器，让用户只能显示特定收藏的`NFT`？
