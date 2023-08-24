---
sidebar_position: 79
sidebar_label: 将所有部分整合到一起
sidebar_class_name: green
---

# 将所有部分整合到一起

**前端质押部分**

你能感受到吗？终点线就在眼前了...至少对于这个核心部分来说是这样的。😆

我们将集中精力使程序前端的质押和解质押指令正常运行。

首先，在你的前端项目的根目录下创建一个名为 `utils` 的新文件夹。然后，创建一个名为 `instructions.ts` 的文件，并从NFT质押项目中复制/粘贴整个 `instructions.ts` 文件。由于代码超过`200`行，所以我不会在这里粘贴。😬

下一步我们将进入 `StakeOptionsDisplay` 文件（`//components/StakeOptionsDisplay.rs`）。你会注意到我们有三个空函数：`handleStake`、`handleUnstake` 和 `handleClaim`。这将是本节的重点。

和往常一样，先让我们准备好钱包和网络连接。

```js
const walletAdapter = useWallet()
const { connection } = useConnection()
```

我们先确认下钱包是否已连接。

```js
if (!walletAdapter.connected || !walletAdapter.publicKey) {
  alert("Please connect your wallet")
  return
}
```

如果一切正常，我们可以开始创建质押指示。

```js
const stakeInstruction = createStakingInstruction(
      walletAdapter.publicKey,
      nftTokenAccount,
      nftData.mint.address,
      nftData.edition.address,
      TOKEN_PROGRAM_ID, // 需要导入
      METADATA_PROGRAM_ID, // 需要导入
      PROGRAM_ID // 需要从constants.ts导入
    )
```

因此，进入 `utils` 文件夹，添加一个名为 `constants.ts` 的文件，并加入以下内容：

```js
import { PublicKey } from "@solana/web3.js"

export const PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_STAKE_PROGRAM_ID ?? ""
)
```

这是我们在上述指示中使用的程序`ID`。确保你的`env.local`文件中有正确的程序`ID`。

`stake` 指令应该准备就绪了，接下来我们要创建一笔交易，添加指令，然后发送。

```js
const transaction = new Transaction().add(stakeInstruction)

const signature = await walletAdapter.sendTransaction(transaction, connection)
```

由于这是一个等待操作，确保在 `handleStake` 回调中添加 `async` 关键字。实际上，这三个函数都应该是异步回调函数。

我们可以进行检查以确认是否已完成，因此让我们获取最新的区块哈希并确认交易。

```js
const latestBlockhash = await connection.getLatestBlockhash()

await connection.confirmTransaction(
          {
            blockhash: latestBlockhash.blockhash,
            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
            signature: signature,
          },
          "finalized"
        )
      } catch (error) {
        console.log(error)
      }

await checkStakingStatus()
```

确认交易后，我们可以检查是否仍在质押，因此让我们将此功能添加到 `handleStake` 代码块的顶部。

```js
const checkStakingStatus = useCallback(async () => {
    if (!walletAdapter.publicKey || !nftTokenAccount) {
      return
    }
```

我们还需要将 `walletAdapter` 和 `connection` 添加为 `handleStake` 回调的依赖项。

我们需要添加一些状态字段，所以向上滚动并添加质押状态的相关字段。

```js
const [isStaking, setIsStaking] = useState(isStaked)
```

我们还要将参数 `StakeOptionsDisplay` 从 `isStaking` 改为 `isStaked`，否则我们的状态无法正常工作。

同时，我们还需要在 `utils` 中创建一个名为 `accounts.ts` 的新文件，并从我们的`NFT`质押程序`utils`文件夹中复制文件过来。可能还需要安装我们的`borsh`库。

我们之所以要复制这些内容，是因为每次检查状态时，我们都要查看抵押账户的状态，并确认抵押的价值。

接下来，在 `checkStakingStatus` 的回调函数中，我们要调用 `getStakeAccount`。

```js
const account = await getStakeAccount(
        connection,
        walletAdapter.publicKey,
        nftTokenAccount
      )

setIsStaking(account.state === 0)
    } catch (e) {
      console.log("error:", e)
    }
```

既然我们要发送多个交易，请继续设置一个辅助函数来确认我们的交易。我们可以将上述代码粘贴进去。

```js
const sendAndConfirmTransaction = useCallback(
    async (transaction: Transaction) => {
      try {
            const signature = await walletAdapter.sendTransaction(
              transaction,
              connection
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
          } catch (error) {
            console.log(error)
          }

          await checkStakingStatus()
    },
    [walletAdapter, connection]
  )
```

现在，在 `handleStake` 函数中只需调用 `sendAndConfirmTransaction` 即可。

**前端索赔/兑换**

现在就可以进行解除质押和领取奖励了。这两者实际上是相同的操作，不过增加了一个复杂的环节：我们是否需要为用户创建代币账户，用于存放他们即将获得的奖励代币。

下面我们将解决 `handleClaim` 函数。

首先，使用与之前相同的警报检查钱包适配器是否已连接并具有公钥。

接着我们要检查奖励的关联令牌账户是否存在：

```js
const userStakeATA = await getAssociatedTokenAddress(
      STAKE_MINT,
      walletAdapter.publicKey
    )
```

请快速查看我们创建的 `constants.ts` 文件，并为薄荷地址添加以下代码，因为我们需要 `STAKE_MINT` 的值：

```js
export const STAKE_MINT = new PublicKey(
  process.env.NEXT_PUBLIC_STAKE_MINT_ADDRESS ?? ""
)
```

当我们拥有了`ATA`后，我们需要调用 `getAccountInfo` 函数，它会返回一个账户或`null`：

`const account = await connection.getAccountInfo(userStakeATA)`

随后，我们创建交易并检查是否存在一个账户，如果没有，我们调用 `createAssociatedTokenAccountInstruction` 函数；否则，我们调用 `createRedeemInstruction` 函数。

```js
const transaction = new Transaction()

    if (!account) {
      transaction.add(
        createAssociatedTokenAccountInstruction(
          walletAdapter.publicKey,
          userStakeATA,
          walletAdapter.publicKey,
          STAKE_MINT
        )
      )
    }

    transaction.add(
      createRedeemInstruction(
        walletAdapter.publicKey,
        nftTokenAccount,
        nftData.mint.address,
        userStakeATA,
        TOKEN_PROGRAM_ID,
        PROGRAM_ID
      )
    )
```

现在我们可以调用上面创建的辅助事务确认函数。

```js
await sendAndConfirmTransaction(transaction)
  }, [walletAdapter, connection, nftData, nftTokenAccount])
```

最后，别忘了将依赖项 `walletAdapter` 和 `connection` 添加到回调函数中。

**前端解除质押操作**

对于 `handleUnstake` 函数，我们要确保与其他函数一样使用异步处理。你可以直接从 `handleClaim` 复制以下内容：

```js
if (
      !walletAdapter.connected ||
      !walletAdapter.publicKey ||
      !nftTokenAccount
    ) {
      alert("请连接您的钱包")
      return
    }

    const userStakeATA = await getAssociatedTokenAddress(
      STAKE_MINT,
      walletAdapter.publicKey
    )

    const account = await connection.getAccountInfo(userStakeATA)

    const transaction = new Transaction()

    if (!account) {
      transaction.add(
        createAssociatedTokenAccountInstruction(
          walletAdapter.publicKey,
          userStakeATA,
          walletAdapter.publicKey,
          STAKE_MINT
        )
      )
    }
```

接下来，我们将向交易中添加指令，并再次调用辅助函数：

```js
transaction.add(
      createUnstakeInstruction(
        walletAdapter.publicKey,
        nftTokenAccount,
        nftData.address,
        nftData.edition.address,
        STAKE_MINT,
        userStakeATA,
        TOKEN_PROGRAM_ID,
        METADATA_PROGRAM_ID,
        PROGRAM_ID
      )
    )

    await sendAndConfirmTransaction(transaction)
  }
```

**页面编辑的股份部分**

我们继续转到 `stake.tsx` 文件（位于 `//pages/stake.tsx`）并进行一些与上述内容相关的修改。

首先，根据我们之前的编辑，我们需要将 `isStaking` 的使用更改为 `isStaked`。这项修改应在 `<StakeOptionsDisplay>` 组件中进行。我们还需要添加一个名为 `nftData` 的字段，并将其赋值为 `nftData`，我们还需要一个状态来存储这个值。

```ts
const [nftData, setNftData] = useState<any>()`
```

目前，我们还没有实际的数据。我们将使用一个 `useEffect` 钩子，在其中调用 `metaplex`，并通过铸币地址找到 `NFT` 数据。

```js
useEffect(() => {
    const metaplex = Metaplex.make(connection).use(
      walletAdapterIdentity(walletAdapter)
    )

    try {
      metaplex
        .nfts()
        .findByMint({ mintAddress: mint })
        .then((nft) => {
          console.log("在质押页面上的 NFT 数据:", nft)
          setNftData(nft)
        })
    } catch (e) {
      console.log("获取 NFT 时发生错误:", e)
    }
  }, [connection, walletAdapter])
```

不要忘了像我们之前所做的那样，获取一个连接和钱包适配器。

现在一切准备就绪，可以进行测试了。运行 `npm run dev`，然后在浏览器中打开本地主机。赶快试试，点击按钮吧！🔘 ⏏️ 🆒

**还需要进行一些编辑**

似乎还有几个方面可能需要改进。让我们回到 `StakeOptionsDisplay` 文件，并在 `handleStake` 函数之前添加以下的 `useEffect` 钩子。

```js
useEffect(() => {
    checkStakingStatus()

    if (nftData) {
      connection
        .getTokenLargestAccounts(nftData.mint.address)
        .then((accounts) => setNftTokenAccount(accounts.value[0].address))
    }
  }, [nftData, walletAdapter, connection])
```

这是一个快速检查，确认我们是否有 `NFT` 数据，如果有的话，就为 `NFT` 代币账户设置值。这是一个 `NFT`，只有一个，所以它会是第一个地址，因此索引值为 `'0'`。

此外，在所有三个回调函数中，我们还需要将 `nftData` 添加为依赖项。

最后，在 `handleStake` 中，在创建交易之前添加以下代码：

```js
const [stakeAccount] = PublicKey.findProgramAddressSync(
      [walletAdapter.publicKey.toBuffer(), nftTokenAccount.toBuffer()],
      PROGRAM_ID
    )

const transaction = new Transaction()

const account = await connection.getAccountInfo(stakeAccount)
    if (!account) {
      transaction.add(
        createInitializeStakeAccountInstruction(
          walletAdapter.publicKey,
          nftTokenAccount,
          PROGRAM_ID
        )
      )
    }
```

我们需要一个质押账户，也就是一个程序驱动的账户（`PDA`），用于在程序中存储有关你的质押状态的数据。如果我们没有这样的账户，上述代码会为我们初始化它。

终于，我们完成了核心部分 `4`。这最后的部分有些杂乱，为确保没有遗漏任何东西，可以将整个 `StakeOptionsDisplay` 文件粘贴下来进行仔细检查。

如果你想进一步改进代码或有任何其他问题，请随时提出。

```js
import { VStack, Text, Button } from "@chakra-ui/react"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { PublicKey, Transaction } from "@solana/web3.js"
import { useCallback, useEffect, useState } from "react"
import {
  createInitializeStakeAccountInstruction,
  createRedeemInstruction,
  createStakingInstruction,
  createUnstakeInstruction,
} from "../utils/instructions"
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token"
import { PROGRAM_ID as METADATA_PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata"
import { PROGRAM_ID, STAKE_MINT } from "../utils/constants"
import { getStakeAccount } from "../utils/accounts"

export const StakeOptionsDisplay = ({
  nftData,
  isStaked,
  daysStaked,
  totalEarned,
  claimable,
}: {
  nftData: any
  isStaked: boolean
  daysStaked: number
  totalEarned: number
  claimable: number
}) => {
  const walletAdapter = useWallet()
  const { connection } = useConnection()

  const [isStaking, setIsStaking] = useState(isStaked)
  const [nftTokenAccount, setNftTokenAccount] = useState<PublicKey>()

  const checkStakingStatus = useCallback(async () => {
    if (!walletAdapter.publicKey || !nftTokenAccount) {
      return
    }

    try {
      const account = await getStakeAccount(
        connection,
        walletAdapter.publicKey,
        nftTokenAccount
      )

      console.log("stake account:", account)

      setIsStaking(account.state === 0)
    } catch (e) {
      console.log("error:", e)
    }
  }, [walletAdapter, connection, nftTokenAccount])

  useEffect(() => {
    checkStakingStatus()

    if (nftData) {
      connection
        .getTokenLargestAccounts(nftData.mint.address)
        .then((accounts) => setNftTokenAccount(accounts.value[0].address))
    }
  }, [nftData, walletAdapter, connection])

  const handleStake = useCallback(async () => {
    if (
      !walletAdapter.connected ||
      !walletAdapter.publicKey ||
      !nftTokenAccount
    ) {
      alert("Please connect your wallet")
      return
    }

    const [stakeAccount] = PublicKey.findProgramAddressSync(
      [walletAdapter.publicKey.toBuffer(), nftTokenAccount.toBuffer()],
      PROGRAM_ID
    )

    const transaction = new Transaction()

    const account = await connection.getAccountInfo(stakeAccount)
    if (!account) {
      transaction.add(
        createInitializeStakeAccountInstruction(
          walletAdapter.publicKey,
          nftTokenAccount,
          PROGRAM_ID
        )
      )
    }

    const stakeInstruction = createStakingInstruction(
      walletAdapter.publicKey,
      nftTokenAccount,
      nftData.mint.address,
      nftData.edition.address,
      TOKEN_PROGRAM_ID,
      METADATA_PROGRAM_ID,
      PROGRAM_ID
    )

    transaction.add(stakeInstruction)

    await sendAndConfirmTransaction(transaction)
  }, [walletAdapter, connection, nftData, nftTokenAccount])

  const sendAndConfirmTransaction = useCallback(
    async (transaction: Transaction) => {
      try {
        const signature = await walletAdapter.sendTransaction(
          transaction,
          connection
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
      } catch (error) {
        console.log(error)
      }

      await checkStakingStatus()
    },
    [walletAdapter, connection]
  )

  const handleUnstake = useCallback(async () => {
    if (
      !walletAdapter.connected ||
      !walletAdapter.publicKey ||
      !nftTokenAccount
    ) {
      alert("Please connect your wallet")
      return
    }

    const userStakeATA = await getAssociatedTokenAddress(
      STAKE_MINT,
      walletAdapter.publicKey
    )

    const account = await connection.getAccountInfo(userStakeATA)

    const transaction = new Transaction()

    if (!account) {
      transaction.add(
        createAssociatedTokenAccountInstruction(
          walletAdapter.publicKey,
          userStakeATA,
          walletAdapter.publicKey,
          STAKE_MINT
        )
      )
    }

    transaction.add(
      createUnstakeInstruction(
        walletAdapter.publicKey,
        nftTokenAccount,
        nftData.address,
        nftData.edition.address,
        STAKE_MINT,
        userStakeATA,
        TOKEN_PROGRAM_ID,
        METADATA_PROGRAM_ID,
        PROGRAM_ID
      )
    )

    await sendAndConfirmTransaction(transaction)
  }, [walletAdapter, connection, nftData, nftTokenAccount])

  const handleClaim = useCallback(async () => {
    if (
      !walletAdapter.connected ||
      !walletAdapter.publicKey ||
      !nftTokenAccount
    ) {
      alert("Please connect your wallet")
      return
    }

    const userStakeATA = await getAssociatedTokenAddress(
      STAKE_MINT,
      walletAdapter.publicKey
    )

    const account = await connection.getAccountInfo(userStakeATA)

    const transaction = new Transaction()

    if (!account) {
      transaction.add(
        createAssociatedTokenAccountInstruction(
          walletAdapter.publicKey,
          userStakeATA,
          walletAdapter.publicKey,
          STAKE_MINT
        )
      )
    }

    transaction.add(
      createRedeemInstruction(
        walletAdapter.publicKey,
        nftTokenAccount,
        nftData.mint.address,
        userStakeATA,
        TOKEN_PROGRAM_ID,
        PROGRAM_ID
      )
    )

    await sendAndConfirmTransaction(transaction)
  }, [walletAdapter, connection, nftData, nftTokenAccount])

  return (
    <VStack
      bgColor="containerBg"
      borderRadius="20px"
      padding="20px 40px"
      spacing={5}
    >
      <Text
        bgColor="containerBgSecondary"
        padding="4px 8px"
        borderRadius="20px"
        color="bodyText"
        as="b"
        fontSize="sm"
      >
        {isStaking
          ? `STAKING ${daysStaked} DAY${daysStaked === 1 ? "" : "S"}`
          : "READY TO STAKE"}
      </Text>
      <VStack spacing={-1}>
        <Text color="white" as="b" fontSize="4xl">
          {isStaking ? `${totalEarned} $BLD` : "0 $BLD"}
        </Text>
        <Text color="bodyText">
          {isStaking ? `${claimable} $BLD earned` : "earn $BLD by staking"}
        </Text>
      </VStack>
      <Button
        onClick={isStaking ? handleClaim : handleStake}
        bgColor="buttonGreen"
        width="200px"
      >
        <Text as="b">{isStaking ? "claim $BLD" : "stake buildoor"}</Text>
      </Button>
      {isStaking ? <Button onClick={handleUnstake}>unstake</Button> : null}
    </VStack>
  )
}
```
