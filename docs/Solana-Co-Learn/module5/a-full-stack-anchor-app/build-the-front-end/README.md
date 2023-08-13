---
sidebar_position: 94
sidebar_label:  🏬 前端开发
sidebar_class_name: green
---

# 🏬 前端开发

既然你已经让程序运行起来了，我们来进入前端代码，为Anchor进行调整。这个设置只需要一分钟，稍等一下，我们会修改一些东西。

首先，让我们从我们的程序中引入我们的`IDL`。只需将整个文件复制并粘贴到 `utils` 文件夹中，包括JSON和TypeScript格式。

接下来，创建一个名为 `WorkspaceProvider.ts` 的新组件文件。为了节省一些时间，我们将从我们构建的电影评论前端中粘贴这段代码，然后将所有的"电影评论"实例更改为"Anchor NFT质押"。你会注意到我们正在从常量文件夹中导入 `PROGRAM_ID`s ，进入那里并确保程序`ID`是我们锚定NFT质押程序的新`ID`（而不是我们Solana原生程序的`ID`）。

```typescript
import { createContext, useContext } from "react"
import {
  Program,
  AnchorProvider,
  Idl,
  setProvider,
} from "@project-serum/anchor"
import { AnchorNftStaking, IDL } from "../utils/anchor_nft_staking"
import { Connection } from "@solana/web3.js"
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react"
import { PROGRAM_ID } from "../utils/constants"

const WorkspaceContext = createContext({})
const programId = PROGRAM_ID

interface Workspace {
  connection?: Connection
  provider?: AnchorProvider
  program?: Program<AnchorNftStaking>
}

const WorkspaceProvider = ({ children }: any) => {
  const wallet = useAnchorWallet() || MockWallet
  const { connection } = useConnection()

  const provider = new AnchorProvider(connection, wallet, {})
  setProvider(provider)

  const program = new Program(IDL as Idl, programId)
  const workspace = {
    connection,
    provider,
    program,
  }

  return (
    <WorkspaceContext.Provider value={workspace}>
      {children}
    </WorkspaceContext.Provider>
  )
}

const useWorkspace = (): Workspace => {
  return useContext(WorkspaceContext)
}

import { Keypair } from "@solana/web3.js"

const MockWallet = {
  publicKey: Keypair.generate().publicKey,
  signTransaction: () => Promise.reject(),
  signAllTransactions: () => Promise.reject(),
}

export { WorkspaceProvider, useWorkspace }
```

还要从电影评论中复制模拟钱包文件，或者创建一个名为 `MockWallet.ts` 的新组件，并粘贴这段代码。

```typescript
import { Keypair } from "@solana/web3.js"

const MockWallet = {
  publicKey: Keypair.generate().publicKey,
  signTransaction: () => Promise.reject(),
  signAllTransactions: () => Promise.reject(),
}

export default MockWallet
```

确保安装项目`serum`， `npm install @project-serum/anchor` 。

现在打开 `npm run dev` ，看看本地主机上是否一切正常...如果是的话，我们继续。

既然我们已经准备好了进口和额外的组件，让我们仔细检查文件，看看我们可以在使用Anchor时简化事情的地方。

跳转到(`/pages/_app.tsx`)并添加我们的新`WorkspaceProvider`，确保它被导入。

```typescript
function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <WalletContextProvider>
        <WorkspaceProvider>
          <Component {...pageProps} />
        </WorkspaceProvider>
      </WalletContextProvider>
    </ChakraProvider>
  )
}
```

跳转到组件文件夹中的` StakeOptionsDisplay.ts` 。

让我们导入Anchor。

```typescript
import * as anchor from @project-serum/anchor
```

在两个状态变量的声明下，让我们定义工作空间。

```typescript
let workspace = useWorkspace()
```

然后在 `checkStakingStatus` 里面添加这个额外的检查，连同我们的其他检查一起，确保我们有 `!workspace.program` 。

```typescript
if (
  !walletAdapter.connected ||
  !walletAdapter.publicKey ||
  !nftTokenAccount ||
  !workspace.program
    )
```

现在跳转到 `/utils/accounts.ts` 。您可以删除所有的`borsh`代码，并将 `getStakeAccount` 代码替换为此代码。这是使用Anchor工作的美妙之处之一，我们不需要担心序列化和反序列化。

```typescript
export async function getStakeAccount(
  program: any,
  user: PublicKey,
  tokenAccount: PublicKey
): Promise<StakeAccount> {
  const [pda] = PublicKey.findProgramAddressSync(
    [user.toBuffer(), tokenAccount.toBuffer()],
    program.programId
  )

  const account = await program.account.userStakeInfo.fetch(pda)
  return account
}
```

现在已经比以前简单多了，对吧？！？

回到 `checkStakingStatus` 在 `StakeOptionsDisplay` ，这里被称为 `getStakeAccount` ，将第一个参数从 `connection` 更改为 `workspace.program` 。

打开你的浏览器，确保本地主机上的一切功能正常。

回到`StakeOptionsDisplay`，向下滚动到 `handleStake` 函数。

再次，首先添加一个检查 `!workspace.program` 的步骤。我们很快就会想要将其添加到我们的 `handleUnstake` 和 `handleClaim` 函数中。

你可以立即从我们之前的工作中删除所有这些代码。

```typescript
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
```

... 简单地用以下内容替换它：

```typescript
transaction.add(
  await workspace.program.methods
    .stake()
    .accounts({
      nftTokenAccount: nftTokenAccount,
      nftMint: nftData.mint.address,
      nftEdition: nftData.edition.address,
      metadataProgram: METADATA_PROGRAM_ID,
    })
    .instruction()
)
```

这也意味着我们在`instructions.ts`文件中创建的一堆代码不再需要了。再次跳转到浏览器上测试一下。

假设一切正常运作，让我们来解决 `handleUnstake` 代码。

我们抛弃这段代码，因为现在程序已经处理了这一切。

```typescript
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

然后在 `transaction.add` 里面去掉 `createUnstakeInstruction` 并用这个替换：

```typescript
transaction.add(
  await workspace.program.methods
    .unstake()
    .accounts({
      nftTokenAccount: nftTokenAccount,
      nftMint: nftData.mint.address,
      nftEdition: nftData.edition.address,
      metadataProgram: METADATA_PROGRAM_ID,
      stakeMint: STAKE_MINT,
      userStakeAta: userStakeATA,
    })
    .instruction()
)
```

你会注意到这些账户与 `handleStake` 相同，再加上一些用于股份铸币和用户`ATA`的账户。

最后，到 `handleClaim` ，按照相同的模式进行删除，新的`transaction.add`应该是这样的：

```typescript
transaction.add(
  await workspace.program.methods
    .redeem()
    .accounts({
      nftTokenAccount: nftTokenAccount,
      stakeMint: STAKE_MINT,
      userStakeAta: userStakeATA,
    })
    .instruction()
)
```

现在你可以直接删除所有的 `instructions.ts` 文件。快点！！！ :)

随意清理掉未使用的导入以整理你的文件。

还有一件事情我们需要做，在令牌目录中，我们已经创建了奖励令牌，现在需要用新的程序`ID`重新初始化它。在 `bld/index.ts` 文件中，当调用 `await createBldToken` 时，需要替换为新的程序`ID`。然后重新运行 `npm run create-bld-token` 脚本。如果我们不这样做，我们的兑换将无法正常工作。

这将创建一个新的`Mint`程序`ID`，您需要将其添加到您的环境变量中。

就是这样，我们在前端有一些功能正在运作。下周，我们将使用Anchor进行更多的发货，目前我们只是想展示它有多么容易，并让基本功能开始运行。
