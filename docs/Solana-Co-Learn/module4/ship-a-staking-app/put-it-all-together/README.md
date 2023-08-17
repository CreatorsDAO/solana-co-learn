---
sidebar_position: 79
sidebar_label: 把它们都放在一起
sidebar_class_name: green
---

# 把它们都放在一起

**前端质押**

你能感受到吗，终点线就在眼前...至少对于这个核心来说是这样。 😆

我们的重点将是使程序前端的质押和解质押指令正常运行。

在你的前端项目中，在根目录下创建一个新的 `utils` 文件夹。然后创建一个名为 `instructions.ts` 的文件，并从NFT质押项目中复制/粘贴整个 `instructions.ts` 文件。由于代码超过200行，我不会在这里粘贴。😬在你的前端项目中，在根目录下创建一个新的 `utils` 文件夹。然后创建一个名为 `instructions.ts` 的文件，并从NFT质押项目中复制/粘贴整个 `instructions.ts` 文件。由于代码超过200行，我不会在这里粘贴。😬

接下来我们将进入 `StakeOptionsDisplay` 文件（`//components/StakeOptionsDisplay.rs`）。你会注意到我们有三个空函数 handleStake ， `handleUnstake` 和 `handleClaim` 。这是我们本节的重点。

一如既往，让我们准备好钱包和网络连接。

```js
const walletAdapter = useWallet()
const { connection } = useConnection()
```

我们先找找钱包。

```js
if (!walletAdapter.connected || !walletAdapter.publicKey) {
  alert("Please connect your wallet")
  return
}
```

如果那个通过了，我们就可以开始制定我们的指示了。

```js
const stakeInstruction = createStakingInstruction(
      walletAdapter.publicKey,
      nftTokenAccount,
      nftData.mint.address,
      nftData.edition.address,
      TOKEN_PROGRAM_ID, -- needs to be imported
      METADATA_PROGRAM_ID, -- needs to be imported
      PROGRAM_ID -- needs to be imported from constants.ts
    )
```

所以，进入 `utils` 文件夹，添加一个 `constants.ts` 文件，添加以下内容。

```js
import { PublicKey } from "@solana/web3.js"

export const PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_STAKE_PROGRAM_ID ?? ""
)
```

这是我们在上面的指示中使用的程序ID。确保你的`env.local`文件中有正确的程序ID。

`stake`指令应该已经准备好了，接下来我们将创建一笔交易，添加指令，然后发送。

```js
const transaction = new Transaction().add(stakeInstruction)

const signature = await walletAdapter.sendTransaction(transaction, connection)
```

由于这是一个等待操作，请确保向上滚动并进行 `handleStake` 回调 `async` 。实际上，这三个函数都应该是异步回调函数。

我们可以进行一次检查，以确保它已经完成，所以让我们获取最新的区块哈希并确认交易。


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

我们还需要将 `walletAdapter` 和 `connection` 作为 `handleStake` 回调的依赖项添加进去。

我们需要一些状态字段，所以向上滚动并添加用于质押的状态。

```js
const [isStaking, setIsStaking] = useState(isStaked)
```

我们还要将参数 `StakeOptionsDisplay` 从 `isStaking` 改为 `isStaked` ，否则我们的状态无法正常工作。

我们还需要在 `utils` 中创建一个名为 `accounts.ts` 的新文件，并从我们的nft质押程序`utils`文件夹中复制文件过来。这可能需要安装我们的borsh库。

我们之所以要带过来是因为每次我们检查状态时，我们都会检查抵押账户，并查看抵押的价值是多少。

然后在 `checkStakingStatus` 的回调函数中，我们调用 `getStakeAccount` 。

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

既然我们将发送多个交易，请继续设置一个辅助函数来确认我们的交易，我们可以将上面的代码粘贴进去。

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

现在，只需在 `handleStake` 函数中调用 `sendAndConfirmTransaction` 。

**前端索赔/兑换**

这就可以了。对于解除质押和领取奖励来说，实际上是一回事，只是增加了一个复杂性，即我们是否需要创建用户的代币账户，用于存放他们将要获得的奖励代币。

我们可以接下来解决 `handleClaim` 。

使用与上面相同的警报，检查钱包适配器是否已连接并具有公钥。

接下来我们将检查奖励的关联令牌账户是否存在。

```js
const userStakeATA = await getAssociatedTokenAddress(
      STAKE_MINT,
      walletAdapter.publicKey
    )
```

快速跳过我们创建的 `constants.ts` 文件，并为我们的薄荷添加这个，因为我们需要 `STAKE_MINT` 。

```js
export const STAKE_MINT = new PublicKey(
  process.env.NEXT_PUBLIC_STAKE_MINT_ADDRESS ?? ""
)
```

一旦我们有了`ATA`，我们需要调用 `getAccountInfo` ，它要么返回一个账户，要么返回`null`。

`const account = await connection.getAccountInfo(userStakeATA)`

然后我们创建我们的交易并检查是否有一个账户，如果没有，我们调用 `createAssociatedTokenAccountInstruction` ，否则我们只是调用 `createRedeemInstruction` 。

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

最后，将我们的依赖项 `walletAdapter` 和 `connection` 添加到回调函数中。

**前端解除质押**

现在，关于 `handleUnstake` ，确保像其他的一样使用异步。以下内容可以直接从 `handleClaim` 复制过来。

```js
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
```

现在我们给我们的交易添加指令，并再次调用我们的辅助函数。

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

**页面编辑的股份**

让我们跳转到 `stake.tsx` （`//pages/stake.tsx`）并进行一些与上述相关的更改。

首先，根据我们上面的编辑，我们需要将 `isStaking` 的使用更改为 `isStaked` 。这是在 `<StakeOptionsDisplay>` 组件中。我们还需要添加一个字段 `nftData` ，并给它赋值 `nftData` ，我们需要一个状态来存储这个值。

`const [nftData, setNftData] = useState<any>()`

现在，我们没有实际的数据。我们将使用一个`useEffect`，在其中调用`metaplex`，并通过铸造地址找到NFT数据。

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
          console.log("nft data on stake page:", nft)
          setNftData(nft)
        })
    } catch (e) {
      console.log("error getting nft:", e)
    }
  }, [connection, walletAdapter])
```

别忘了像我们之前做过的那样，获取一个连接和钱包适配器。

好的，我们现在可以进行测试了，运行`npm run dev`，并在浏览器中打开本地主机。试试吧，点击按钮。🔘 ⏏️ 🆒

**还需要进行一些编辑**

所以，有几件事可能需要改进...简要地回到 `StakeOptionsDispla`y 文件，在 `handleStake` 函数之前添加以下`useEffect`。

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

这是一个快速检查，以确保我们有NFT数据，如果是的话，为NFT代币账户设置一个值。这是一个NFT，只有一个，所以它将是第一个地址，因此索引值为`'0'`。

此外，在所有三个回调函数中，还要将 `nftData` 添加为一个依赖项。

最后，在 `handleStake` 内，在创建交易之前添加此代码。

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


我们需要一个质押账户，一个在程序中存储有关你的质押状态数据的`PDA`。如果我们没有这样的账户，上面的代码将为我们初始化它。

唉，我们终于完成了核心4。最后这一部分有点乱七八糟的，为了确保没有遗漏任何东西，我们将整个 `StakeOptionsDisplay` 文件粘贴如下。

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
