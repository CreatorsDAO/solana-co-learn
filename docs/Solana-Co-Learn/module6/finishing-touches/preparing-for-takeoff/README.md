---
sidebar_position: 107
sidebar_label:  🚀 准备起飞
sidebar_class_name: green
---

# 🚀 准备起飞

好的，让我们一起启动项目吧。在深入探讨`/components/Lootbox.tsx`文件的逻辑之前，我们先来快速预览一下布局的构造。

我们将所有相关的组件集中在一起，只需进行三个主要检查：是否有可用的战利品箱、是否存在押注账户，以及总收益是否超过战利品箱的值。如果检查结果为真，则会渲染一个带有各种选项的按钮；否则，用户将会收到一个提示，建议他们继续押注。接下来，我们将深入了解如何处理`handleRedeemLoot` 或 `handleOpenLootbox` 函数的逻辑。

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

在这个函数体内，首先我们进行了大量的设置和状态定义。其中有一个`useEffect`钩子用来确保我们拥有公钥、战利品箱程序和质押程序。一旦这些都到位，它就会调用`handleStateRefresh`方法来刷新状态。

通过这样的组织，我们可以确保逻辑清晰，并且易于理解和维护。

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
状态的刷新是通过一个独立的函数来完成的，因为在每次交易后都需要调用它。这部分只是通过调用两个函数来实现。

```tsx
const handleStateRefresh = async (
  lootboxProgram: Program<LootboxProgram>,
  publicKey: PublicKey
) => {
  checkUserAccount(lootboxProgram, publicKey);
  fetchLootboxPointer(lootboxProgram, publicKey);
}
```

`checkUserAccount`将检查用户状态的`PDA`，如果存在，则通过调用`setUserAccountExist`将其设置为`true`。

```tsx
// 检查UserState账户是否存在
// 如果UserState账户存在，还要检查是否有可从战利品箱兑换的物品
const checkUserAccount = async (
  lootboxProgram: Program<LootboxProgram>,
  publicKey: PublicKey
) => {
  try {
    const [userStatePda] = PublicKey.findProgramAddressSync(
      [publicKey.toBytes()],
      lootboxProgram.programId
    );
    const account = await lootboxProgram.account.userState.fetch(userStatePda);
    if (account) {
      setUserAccountExist(true);
    } else {
      setMint(undefined);
      setUserAccountExist(false);
    }
  } catch {}
}
```

`fetchLootboxPointer` 主要用于获取战利品盒的指针，并设置可用的战利品盒和可兑换的物品。

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

快速跳转到 `/pages/stake.tsx` 。我们做一个小修改，如果有 `nftData` 和 `nftTokenAccount` ，则显示战利品箱，并传入赌注账户、`NFT`代币账户，并调用`fetchstate`，将`mint address`作为上游属性传递。

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

布局与之前相似，不同的是，现在我们以一张图片来展示齿轮代币，使用代币上的元数据作为来源。在图片下方，我们会显示你拥有的每个齿轮代币的数量。

关于逻辑部分，我们会传入代表代币铸造的`base58`编码字符串和你拥有的数量。

在`useEffect`中，我们创建了一个`metaplex`对象，并将`item`字符串转换为公钥。然后我们通过`mint`调用`metaplex`来查找物品。一旦得到`nft`，我们便在`nft`的`uri`上调用`fetch`方法，从而可以访问到链下的元数据。我们将响应转换为`json`格式，并设置为元数据，这样就可以在返回调用中显示一个图像属性。

切换回`stake.tsx`文件。首先，我们为齿轮平衡添加了一个状态行。

```tsx
const [gearBalances, setGearBalances] = useState<any>({})
```

我们在`fetchState`函数内调用它。

在获取状态的过程中，我们首先将余额设置为空对象。然后，我们循环遍历不同的齿轮选项，并获取与该铸币相关联的当前用户的`ATA`。这为我们提供了一个地址，我们用它来获取账户，并将特定齿轮铸币的余额设置为我们所拥有的数字。在循环结束后，我们调用`setGearBalances(balances)`。

所以，在用户界面中，我们会检查齿轮平衡的长度是否大于零。如果是，就显示所有与齿轮相关的内容；否则，就不显示任何内容。

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

这部分描述了如何完成检查和显示装备的操作，并提供了[存储库](https://github.com/jamesrp13/buildspace-buildoors/blob/solution-lootboxes/components/GearItem.tsx)中的代码作为参考。

接下来的步骤由你来决定。你可以权衡要修复哪些错误，以及哪些错误可以接受。然后将所有内容从本地主机迁移出去并发布，这样你就可以分享一个公共链接。

如果你有兴趣，甚至可以准备并部署到主网。当然，在上线主网之前，还有许多地方可以改进和优化，例如修复错误、添加更多检查、拥有更多的NFT等等。如果这些让你感兴趣，那么就放手一搏吧！
