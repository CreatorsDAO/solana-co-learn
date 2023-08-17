---
sidebar_position: 107
sidebar_label:  🚀 准备起飞
sidebar_class_name: green
---

# 🚀 准备起飞

好的，让我们开始吧。在深入逻辑`/components/Lootbox.tsx`之前，让我们先快速浏览一下布局。

我们将一切都集中在一起，只需进行三个检查：是否有可用的战利品箱、是否有押注账户，以及总收益是否大于战利品箱。如果是，它会呈现一个带有各种选项的盒子；否则，它会提示继续押注。我们很快会看一下 `handleRedeemLoot` 或 `handleOpenLootbox` 。

```tsx
return (
    <Center
      height="120px"
      width="120px"
      bgColor={"containerBg"}
      borderRadius="10px"
    >
      {availableLootbox &&
      stakeAccount &&
      stakeAccount.totalEarned.toNumber() >= availableLootbox ? (
        <Button
          borderRadius="25"
          onClick={mint ? handleRedeemLoot : handleOpenLootbox}
          isLoading={isConfirmingTransaction}
        >
          {mint
            ? "Redeem"
            : userAccountExists
            ? `${availableLootbox} $BLD`
            : "Enable"}
        </Button>
      ) : (
        <Text color="bodyText">Keep Staking</Text>
      )}
    </Center>
  )
```

在这个函数中，首先我们有大量的设置和状态。有一个`useEffect`来确保我们有一个公钥、一个战利品箱程序和一个质押程序，如果这些都存在，它调用 `handleStateRefresh` 。

```tsx
export const Lootbox = ({
  stakeAccount,
  nftTokenAccount,
  fetchUpstreamState,
}: {
  stakeAccount?: StakeAccount
  nftTokenAccount: PublicKey
  fetchUpstreamState: () => void
}) => {
  const [isConfirmingTransaction, setIsConfirmingTransaction] = useState(false)
  const [availableLootbox, setAvailableLootbox] = useState(0)
  const walletAdapter = useWallet()
  const { stakingProgram, lootboxProgram, switchboardProgram } = useWorkspace()
  const { connection } = useConnection()

  const [userAccountExists, setUserAccountExist] = useState(false)
  const [mint, setMint] = useState<PublicKey>()

  useEffect(() => {
    if (!walletAdapter.publicKey || !lootboxProgram || !stakingProgram) return

    handleStateRefresh(lootboxProgram, walletAdapter.publicKey)
  }, [walletAdapter, lootboxProgram])
```

状态刷新被封装为一个独立的函数，因为它在每次交易之后被调用。这只是简单地调用了两个函数。

```tsx
const handleStateRefresh = async (
    lootboxProgram: Program<LootboxProgram>,
    publicKey: PublicKey
  ) => {
    checkUserAccount(lootboxProgram, publicKey)
    fetchLootboxPointer(lootboxProgram, publicKey)
  }
```

 `checkUserAccount` 将获取用户状态`PDA`，如果存在，则调用 `setUserAccountExist` 并将其设置为`true`。

 ```tsx
 // check if UserState account exists
   // if UserState account exists also check if there is a redeemable item from lootbox
   const checkUserAccount = async (
     lootboxProgram: Program<LootboxProgram>,
     publicKey: PublicKey
   ) => {
     try {
       const [userStatePda] = PublicKey.findProgramAddressSync(
         [publicKey.toBytes()],
         lootboxProgram.programId
       )
       const account = await lootboxProgram.account.userState.fetch(userStatePda)
       if (account) {
         setUserAccountExist(true)
       } else {
         setMint(undefined)
         setUserAccountExist(false)
       }
     } catch {}
   }

```

`fetchLootboxPointer` 基本上是获取战利品盒指针，设置可用的战利品盒和可兑换的货币。

```tsx
const fetchLootboxPointer = async (
    lootboxProgram: Program<LootboxProgram>,
    publicKey: PublicKey
  ) => {
    try {
      const [lootboxPointerPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("lootbox"), publicKey.toBytes()],
        LOOTBOX_PROGRAM_ID
      )

      const lootboxPointer = await lootboxProgram.account.lootboxPointer.fetch(
        lootboxPointerPda
      )

      setAvailableLootbox(lootboxPointer.availableLootbox.toNumber())
      setMint(lootboxPointer.redeemable ? lootboxPointer.mint : undefined)
    } catch (error) {
      console.log(error)
      setAvailableLootbox(10)
      setMint(undefined)
    }
  }
```

回到两个主要的逻辑部分，一个是 `handleOpenLootbox` 。它首先检查我们是否拥有传递给函数所需的所有必要项目，然后调用 `openLootbox`。

```tsx
const handleOpenLootbox: MouseEventHandler<HTMLButtonElement> = useCallback(
    async (event) => {
      if (
        event.defaultPrevented ||
        !walletAdapter.publicKey ||
        !lootboxProgram ||
        !switchboardProgram ||
        !stakingProgram
      )
        return

      openLootbox(
        connection,
        userAccountExists,
        walletAdapter.publicKey,
        lootboxProgram,
        switchboardProgram,
        stakingProgram
      )
    },
    [
      lootboxProgram,
      connection,
      walletAdapter,
      userAccountExists,
      walletAdapter,
      switchboardProgram,
      stakingProgram,
    ]
  )
```

`openLootbox` 从检查用户账户是否存在开始，如果不存在，则调用指令文件中的 `createInitSwitchboardInstructions` ，该文件会返回给我们`指令`和`vrfKeypair`。如果该账户不存在，我们尚未初始化交换机

```tsx
const openLootbox = async (
    connection: Connection,
    userAccountExists: boolean,
    publicKey: PublicKey,
    lootboxProgram: Program<LootboxProgram>,
    switchboardProgram: SwitchboardProgram,
    stakingProgram: Program<AnchorNftStaking>
  ) => {
    if (!userAccountExists) {
      const { instructions, vrfKeypair } =
        await createInitSwitchboardInstructions(
          switchboardProgram,
          lootboxProgram,
          publicKey
        )

```

然后我们创建一个新的交易，添加指令并调用我们创建的 `sendAndConfirmTransaction` 。它以一个对象作为`vrfKeypair`的签名者。

```tsx
const transaction = new Transaction()
      transaction.add(...instructions)
      sendAndConfirmTransaction(connection, walletAdapter, transaction, {
        signers: [vrfKeypair],
      })
    }
```

让我们跳出逻辑，看看 `sendAndConfirmTransaction` 。首先，我们设定我们正在加载 `setIsConfirmingTransaction(true)` 。

然后我们调用发送交易，但我们传递了选项，这是可选的，因为我们并不总是需要它。这是我们如何发送`vrfKeypair`的签名者，但我们并不总是这样做。


一旦确认，我们使用 `await Promise.all` 在我们调用 `handleStateRefresh` 和 `fetchUpstreamState` 的地方。后者作为一个属性传入，基本上是在`stake`组件上的`fetch`状态函数。

```tsx
const sendAndConfirmTransaction = async (
    connection: Connection,
    walletAdapter: WalletContextState,
    transaction: Transaction,
    options?: SendTransactionOptions
  ) => {
    setIsConfirmingTransaction(true)

    try {
      const signature = await walletAdapter.sendTransaction(
        transaction,
        connection,
        options
      )
      const latestBlockhash = await connection.getLatestBlockhash()
      await connection.confirmTransaction(
        {
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
          signature: signature,
        },
        "finalized"
      )

      console.log("Transaction complete")
      await Promise.all([
        handleStateRefresh(lootboxProgram!, walletAdapter.publicKey!),
        fetchUpstreamState(),
      ])
    } catch (error) {
      console.log(error)
      throw error
    } finally {
      setIsConfirmingTransaction(false)
    }
  }
```

现在回到 `handleOpenLootbox` 的`else`语句，这是处理账户存在的逻辑。所以我们设置了打开战利品箱指令并发送它们。然后调用 `sendAndConfirmTransaction` 。一旦确认，该函数将把`is confirming`设置为`false`，然后我们再次将其设置为`true`。

```tsx
...
    else {
      const instructions = await createOpenLootboxInstructions(
        connection,
        stakingProgram,
        switchboardProgram,
        lootboxProgram,
        publicKey,
        nftTokenAccount,
        availableLootbox
      )

      const transaction = new Transaction()
      transaction.add(...instructions)
      try {
        await sendAndConfirmTransaction(connection, walletAdapter, transaction)
        setIsConfirmingTransaction(true)
```
最后，这是等待看到`mint`被存入战利品箱指针的逻辑，这样我们就可以兑换它。（这段代码只能偶尔工作，不要依赖它，如果可以的话请修复它）。

```tsx
    const [lootboxPointerPda] = PublicKey.findProgramAddressSync(
          [Buffer.from("lootbox"), publicKey.toBytes()],
          lootboxProgram.programId
        )

        const id = await connection.onAccountChange(
          lootboxPointerPda,
          async (_) => {
            try {
              const account = await lootboxProgram.account.lootboxPointer.fetch(
                lootboxPointerPda
              )
              if (account.redeemable) {
                setMint(account.mint)
                connection.removeAccountChangeListener(id)
                setIsConfirmingTransaction(false)
              }
            } catch (error) {
              console.log("Error in waiter:", error)
            }
          }
        )
      } catch (error) {
        console.log(error)
      }
    }
    }
```

快速跳转到 `/pages/stake.tsx` 。我们做一个小修改，如果有 `nftData` 和 `nftTokenAccount` ，则显示战利品箱，并传入赌注账户、NFT代币账户，并调用`fetchstate`，将`mint address`作为上游属性传递。

```ts
<HStack>
  {nftData && nftTokenAccount && (
    <Lootbox
      stakeAccount={stakeAccount}
      nftTokenAccount={nftTokenAccount}
      fetchUpstreamState={() => {
        fetchstate(nftData.mint.address)
      }}
    />
  )}
</HStack>
```

现在希望回顾一下 `handleRedeemLoot` ，这个过程更加简单明了。我们首先获取相关的令牌。然后使用我们的 `retrieveItemFromLootbox` 函数创建一个新的交易，然后发送并确认该交易。

```tsx
onst handleRedeemLoot: MouseEventHandler<HTMLButtonElement> = useCallback(
    async (event) => {
      if (
        event.defaultPrevented ||
        !walletAdapter.publicKey ||
        !lootboxProgram ||
        !mint
      )
        return

      const userGearAta = await getAssociatedTokenAddress(
        mint,
        walletAdapter.publicKey
      )

      const transaction = new Transaction()
      transaction.add(
        await lootboxProgram.methods
          .retrieveItemFromLootbox()
          .accounts({
            mint: mint,
            userGearAta: userGearAta,
          })
          .instruction()
      )

      sendAndConfirmTransaction(connection, walletAdapter, transaction)
    },
    [walletAdapter, lootboxProgram, mint]
  )
```

那是很多的内容，我们跳来跳去的，所以如果你需要参考整个文件的代码，请看[这里](https://github.com/jamesrp13/buildspace-buildoors/blob/solution-lootboxes/components/Lootbox.tsx)。

唉，让我们来看看 `GearItem` 组件。这个组件相对简单一些，也要短得多。

```ts
import { Center, Image, VStack, Text } from "@chakra-ui/react"
import { Metaplex, walletAdapterIdentity } from "@metaplex-foundation/js"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { PublicKey } from "@solana/web3.js"
import { useEffect, useState } from "react"

export const GearItem = ({
  item,
  balance,
}: {
  item: string
  balance: number
}) => {
  const [metadata, setMetadata] = useState<any>()
  const { connection } = useConnection()
  const walletAdapter = useWallet()

  useEffect(() => {
    const metaplex = Metaplex.make(connection).use(
      walletAdapterIdentity(walletAdapter)
    )

    const mint = new PublicKey(item)

    try {
      metaplex
        .nfts()
        .findByMint({ mintAddress: mint })
        .run()
        .then((nft) => fetch(nft.uri))
        .then((response) => response.json())
        .then((nftData) => setMetadata(nftData))
    } catch (error) {
      console.log("error getting gear token:", error)
    }
  }, [item, connection, walletAdapter])

  return (
    <VStack>
      <Center
        height="120px"
        width="120px"
        bgColor={"containerBg"}
        borderRadius="10px"
      >
        <Image src={metadata?.image ?? ""} alt="gear token" padding={4} />
      </Center>
      <Text color="white" as="b" fontSize="md" width="100%" textAlign="center">
        {`x${balance}`}
      </Text>
    </VStack>
  )
}
```

布局与上一个相当相似，但现在我们展示一张图片，以齿轮代币上的元数据作为来源。在其下方，我们展示你拥有的每个齿轮代币的数量。

关于逻辑，我们传入该项作为代表代币铸币的`base58`编码字符串，以及你拥有的数量。

在`useEffect`中，我们创建了一个`metaplex`对象。我们将 `item` 的字符串转换为公钥。然后调用`metaplex`来通过`mint`查找物品。我们得到了`nft`，调用`nft`的`uri`上的`fetch`方法，这样我们就可以获取到链下的元数据。我们将该响应转换为`json`s，并将其设置为元数据，这样我们就可以在返回调用中显示一个图像属性。

回到 `stake.tsx` 文件。首先，我们为齿轮平衡添加一行状态。

```tsx
const [gearBalances, setGearBalances] = useState<any>({})
```

我们在`fetchState`内部调用它。

在获取状态中，我们将余额设置为空对象。然后循环遍历不同的齿轮选项，并获取与该铸币相关联的当前用户的`ATA`。这给了我们一个地址，我们用它来获取账户，并将特定齿轮铸币的余额设置为我们拥有的数字。在循环结束后，我们调用 `setGearBalances(balances)` 。

所以在用户界面中，我们检查齿轮平衡的长度是否大于零，然后显示所有的齿轮相关内容，或者根本不显示。

```tsx
<HStack spacing={10} align="start">
  {Object.keys(gearBalances).length > 0 && (
    <VStack alignItems="flex-start">
      <Text color="white" as="b" fontSize="2xl">
        Gear
      </Text>
      <SimpleGrid
        columns={Math.min(2, Object.keys(gearBalances).length)}
        spacing={3}
      >
        {Object.keys(gearBalances).map((key, _) => {
          return (
            <GearItem
              item={key}
              balance={gearBalances[key]}
              key={key}
            />
          )
        })}
      </SimpleGrid>
    </VStack>
  )}
  <VStack alignItems="flex-start">
    <Text color="white" as="b" fontSize="2xl">
      Loot Box
    </Text>
    <HStack>
      {nftData && nftTokenAccount && (
        <Lootbox
          stakeAccount={stakeAccount}
          nftTokenAccount={nftTokenAccount}
          fetchUpstreamState={() => {
            fetchstate(nftData.mint.address)
          }}
        />
      )}
    </HStack>
  </VStack>
</HStack>
```

这就是检查和显示装备的全部内容。这是[存储库](https://github.com/jamesrp13/buildspace-buildoors/blob/solution-lootboxes/components/GearItem.tsx)中的代码，供你参考。

接下来发生的事情取决于你。你可以决定要修复哪些错误，哪些你可以接受。将所有内容从本地主机移出并进行发布，这样你就可以分享一个公共链接。

...如果你有兴趣的话，将其准备好并部署到主网。在上线主网之前，显然还有许多改进可以和应该进行，例如修复错误、添加更多检查、拥有更多的NFT等等——如果你有兴趣，就将其发布出去吧！
