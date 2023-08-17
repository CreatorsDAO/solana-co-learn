---
sidebar_position: 43
sidebar_label: 🎨 创建铸币用户界面
sidebar_class_name: green
---

# 🎨 创建铸币用户界面

现在我们已经成功创建了代币和非同质化代币（NFT）。让我们继续创建我们的铸币用户界面，这样我们就可以直观地与智能合约进行交互，并允许其他人在我们的浏览器上铸造我们的NFT！这不是很酷吗？如果你注意到，你的网站目前有一个 `minting` 按钮，但它还没有任何功能。让我们从创建一个函数开始，并添加一些逻辑，以允许我们铸造我们的NFT。如果你没有起始代码，你可以在这里[克隆](https://github.com/buildspace/buildspace-buildoors/tree/solution-core-2-candy-machine)它。

现在，让我们开始将以下代码行添加到你的 `newMint.tsx` 中。注意：不要盲目复制粘贴代码。我只包含了必要的部分，你应该弄清楚这些代码应该放在哪里。提示：应该放在你的 `Container` 元素下方。

```ts
// REST OF YOUR CODE
import { Button, Text, HStack } from "@chakra-ui/react";
import { MouseEventHandler, useCallback } from "react";
import { ArrowForwardIcon } from "@chakra-ui/icons";

const Home: NextPage = () => {
  const handleClick: MouseEventHandler<HTMLButtonElement> = useCallback(
    async (event) => {},
    []
  );

  return (
    <MainLayout>
      {/* REST OF YOUR CODE */}
      <Image src="" alt="" />
      <Button
        bgColor="accent"
        color="white"
        maxWidth="380px"
        onClick={handleClick}
      >
        <HStack>
          <Text>stake my buildoor</Text>
          <ArrowForwardIcon />
        </HStack>
      </Button>
    </MainLayout>
  );
};
```

一旦完成，我们可以转到 `Connected.tsx` 并添加一些代码。就在 `handleClick` 函数的上方，我们可以添加这个 `const router = useRouter()` 。记得在上方导入`useRouter`函数。接下来，在你的 `handleClick` 函数中添加 `router.push("/newMint")` 。现在它应该看起来像这样。

```ts
const handleClick: MouseEventHandler<HTMLButtonElement> = useCallback(
  async (event) => {
    if (event.defaultPrevented) return;
    if (!walletAdapter.connected || !candyMachine) return;

    try {
      setIsMinting(true);
      const nft = await metaplex
        .candyMachinesV2()
        .mint({ candyMachine });

      console.log(nft);
      router.push(`/newMint?mint=${nft.nft.address.toBase58()}`);
    } catch (error) {
      alert(error);
    } finally {
      setIsMinting(false);
    }
  },
  [metaplex, walletAdapter, candyMachine]
);
```

现在你应该能够点击 `stake my buildoor` 按钮，然后会提示你从你的幽灵钱包中批准交易。然而，你可能会注意到一旦你成功批准了交易，页面会刷新并导致你的钱包被登出。不要担心，在下一节中我们会解决这个问题。

请前往 `newMint.tsx` 。我们将创建一个界面来解决这个问题。将此代码添加到你的 `Home` 函数之上。

```ts
import { PublicKey } from "@solana/web3.js";

interface NewMintProps {
  mint: PublicKey;
}
```

一旦完成，它应该看起来像这样


```ts
// REST OF YOUR CODE
import { PublicKey } from "@solana/web3.js";
import { Metaplex, walletAdapterIdentity } from "@metaplex-foundation/js";

interface NewMintProps {
  mint: PublicKey;
}

const Home: NextPage<NewMintProps> = ({ mint }) => {
    const [metadata, setMetadata] = useState<any>()
    const { connection } = useConnection()
    const walletAdapter = useWallet()
    const metaplex = useMemo(() => {
        return Metaplex.make(connection).use(walletAdapterIdentity(walletAdapter))
    }, [connection, walletAdapter])

    useEffect(() => {
        // What this does is to allow us to find the NFT object
        // based on the given mint address
        metaplex.nfts().findByMint({ mintAddress: new PublicKey(mint) })
            .then((nft) => {
                // We then fetch the NFT uri to fetch the NFT metadata
                fetch(nft.uri)
                    .then((res) => res.json())
                    .then((metadata) => {
                        setMetadata(metadata)
                    })
            })
    }, [mint, metaplex, walletAdapter])

  // REST OF YOUR CODE
};
```

注意到我们在上面的函数中如何调用 `setMetadata(metadata)` 了吗？这是为了让我们能够将元数据对象设置到状态中，以便我们可以用它来渲染图片。现在让我们在我们的 `Image` 元素中调用这个对象。

```ts
<Image src={metadata?.image ?? ""} alt="" />
```

我们快到了。如果你现在尝试铸造一个新的NFT，你会注意到网站会抛出一个错误，说它无法读取未定义的属性。我们可以通过在底部添加几行代码来修复这个问题。就在你的 `export default NewMint` 稍微上面。

```ts
NewMint.getInitialProps = async ({ query }) => {
  const { mint } = query;
  if (!mint) throw { error: "No mint" };

  try {
    const mintPubkey = new PublicKey(mint);
    return { mint: mintPubkey };
  } catch {
    throws({ error: "Invalid mint" });
  }
};

```

太棒了！现在你已经添加了所有必要的代码，你应该能够铸造一个NFT，并且能够看到那张图片。这是我的样子。

![](./img/mint-nft-displayt.png)

## 🛠️小修复

请注意网站未能准确显示内容，为了解决这个问题，我们需要前往 `WalletContextProvider.tsx` 并修改一些代码。

改变

```ts
const phantom = new PhantomWalletAdapter();
```

to

```ts
const phantom = useMemo(() => new PhantomWalletAdapter(), []);
```

我们还需要给你的 `autoConnect` 添加一个属性。就像这样。

```ts
<WalletProvider wallets={[phantom]} autoConnect={true}>
  <WalletModalProvider>{children}</WalletModalProvider>
</WalletProvider>
```

我们需要使用 `useMemo` 的原因是为了防止钱包适配器被多次构建。你可以在[这里](https://reactjs.org/docs/hooks-reference.html#usememo?utm_source=buildspace.so&utm_medium=buildspace_project)了解更多关于useMemo的信息。
