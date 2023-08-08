---
sidebar_position: 38
sidebar_label: 📱 在钱包中展示NFTs
sidebar_class_name: green
---

# 📱 在钱包中展示NFTs

现在我们已经铸造了一个NFT，我们将学习如何铸造一系列的NFT。我们将使用Candy Machine来完成这个任务，它是一个Solana程序，让创作者能够将他们的资产上链。这不是创建系列的唯一方式，但在Solana上它是标准的，因为它具有许多有用的功能，如机器人保护和安全随机化。你知道怎么回事。模板时间。然而，随着我们构建的东西变得更好，我们的模板也会变得更好。这次我们将在[Solana dApp脚手架](https://github.com/solana-labs/dapp-scaffold)的基础上构建一个模板。和之前的模板一样，它是一个使用 `create-next-app` 制作的Next.js应用程序。不同的是，它有更多的功能。不用担心！我们仍然会使用相同的东西。

```bash
git clone https://github.com/buildspace/solana-display-nfts-frontend
cd solana-display-nfts-frontend
git checkout starter
npm install @metaplex-foundation/js@latest
npm i
npm run dev
```

你应该在 `localhost:3000` 上看到这个:

![](./img/display-from-wallet.png)

“显示NFT”页面目前还没有显示任何内容 - 这就是你的任务所在。

打开 `src/components/FetchNFT.tsx` ，我们开始吧。我们将从组件顶部的Metaplex设置开始：

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

看起来很熟悉。

现在让我们来填写 `fetchNfts` 函数。我们将使用之前看到的 `findAllByOwner` 方法。我们还需要使用 `useWallet` 钩子来获取钱包地址。

```tsx
const fetchNfts = async () => {
   if (!wallet.connected) {
     return
   }

   // fetch NFTs for connected wallet
   const nfts = await metaplex
     .nfts()
     .findAllByOwner({ owner: wallet.publicKey })

   // fetch off chain metadata for each NFT
   let nftData = []
   for (let i = 0; i < nfts.length; i++) {
     let fetchResult = await fetch(nfts[i].uri)
     let json = await fetchResult.json()
     nftData.push(json)
   }

   // set state
   setNftData(nftData)
 }
```

我们想要在钱包更改时更新显示的NFTs，所以我们将在 `useEffect` 函数下方添加一个 `fetchNfts` 钩子来调用 `fetchNfts` 函数。

```tsx
export const FetchNft: FC = () => {
	...

  const fetchNfts = async () => {
		...
  }

  // fetch nfts when connected wallet changes
  useEffect(() => {
    fetchNfts()
  }, [wallet])

  return <div></div>
}
```

最后，我们需要更新 `return` 语句以显示NFTs。我们将使用之前创建的 `nftData` 状态变量。

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

我们现在可以看到我们的NFT了！🎉 这是我的钱包长什么样子 😆

![](./img/nfts-wallet.png)

回到过去的日子（大约在2021年10月），我不得不手动完成所有这些工作，而且我一直受到RPC的速率限制，所以请花点时间感激Metaplex开发人员为我们带来这个精彩的SDK！

在`nftData`这里玩一下。将其记录到控制台并尝试显示其他值，如符号或描述！也许添加一个过滤器，以便用户只能显示特定收藏的NFT？
