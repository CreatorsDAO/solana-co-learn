---
sidebar_position: 94
sidebar_label:  🏬 前端开发
sidebar_class_name: green
---

# 🏬 前端开发

既然程序已经运行起来了，现在我们来进入前端代码的部分，为`Anchor`做适当的调整。整个设置过程只需一分钟，稍作等待，我们还会有一些修改要做。

首先，我们需要从程序中引入`IDL`文件。你可以直接将整个文件复制并粘贴到`utils`文件夹中，包括`JSON`和`TypeScript`格式。

然后，创建一个名为`WorkspaceProvider.ts`的新组件文件。为了节省时间，我们可以直接从我们之前构建的电影评论前端中复制粘贴这段代码，然后将所有的"电影评论"实例替换为"`Anchor NFT`质押"。你会注意到我们正在从常量文件夹中导入`PROGRAM_ID`s，所以请进入该文件夹并确保程序`ID`是我们`Anchor NFT`质押程序的新`ID`（而非我们Solana原生程序的`ID`）。

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

export { WorkspaceProvider, useWorkspace }）
```

另外，请从电影评论项目中复制模拟钱包文件，或者创建一个名为`MockWallet.ts`的新组件，并粘贴下面的代码。

```typescript
import { Keypair } from "@solana/web3.js"

const MockWallet = {
  publicKey: Keypair.generate().publicKey,
  signTransaction: () => Promise.reject(),
  signAllTransactions: () => Promise.reject(),
}

export default MockWallet
```

确保已经安装了项目`serum`，可以通过运行`npm install @project-serum/anchor`来安装。

现在执行`npm run dev`，打开本地主机看看是否一切正常。如果没问题，我们就继续进行下去。

既然进口和额外组件已经准备好了，我们来仔细检查文件，找出我们在使用`Anchor`时可以进一步简化的地方。

请跳转到文件（`/pages/_app.tsx`），并添加我们的新`WorkspaceProvider`组件，同时确保已经正确导入。

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

跳转到组件文件夹中的`StakeOptionsDisplay.ts`文件。

首先，我们导入`Anchor`。

```typescript
import * as anchor from '@project-serum/anchor'
```

在声明两个状态变量之后，我们来定义工作空间。

```typescript
let workspace = useWorkspace()
```

接下来，在`checkStakingStatus`函数里添加一个额外的检查，连同我们的其他检查一起，确保`!workspace.program`的存在。

```typescript
if (
  !walletAdapter.connected ||
  !walletAdapter.publicKey ||
  !nftTokenAccount ||
  !workspace.program
)
```

现在，跳转到`/utils/accounts.ts`文件。你可以删除所有的`borsh`代码，并将`getStakeAccount`代码替换为以下代码。这就是使用`Anchor`工作的美妙之处之一，我们不需要担心序列化和反序列化的问题。

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

现在，一切都已经比以前简单得多了，不是吗？

回到`StakeOptionsDisplay`文件中的`checkStakingStatus`函数，在被称为`getStakeAccount`的地方，将第一个参数从`connection`更改为`workspace.program`。

打开浏览器，确保本地主机上的所有功能正常运行。

再回到`StakeOptionsDisplay`文件，向下滚动到`handleStake`函数。

再次，首先添加一个检查`!workspace.program`的步骤。很快，我们也将其添加到`handleUnstake`和`handleClaim`函数中。

你现在可以放心地从我们之前的工作中删除所有这些代码。

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

这也意味着我们在`instructions.ts`文件中创建的一大堆代码现在已经不再需要了。再次返回浏览器进行测试。

假如一切都运行正常，我们接下来将处理`handleUnstake`代码部分。

由于现在程序已经处理了所有的事情，我们将放弃下面这段代码：

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

然后在`transaction.add`内部去掉`createUnstakeInstruction`，并用以下代码替换：

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

你会注意到这些账户与`handleStake`中的相同，只是多了一些用于股份铸币和用户`ATA`的账户。

最后，转到`handleClaim`，按照相同的模式进行删除，新的`transaction.add`应该如下所示：

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

现在你可以直接删除整个`instructions.ts`文件。太棒了！！！ :)

你可以自由地清理未使用的导入，整理你的文件。

还有一件事需要我们注意，在令牌目录中，我们已经创建了奖励令牌，现在需要使用新的程序`ID`对其进行重新初始化。在`bld/index.ts`文件中，当调用`await createBldToken`时，需要将其替换为新的程序`ID`。然后重新运行`npm run create-bld-token`脚本。如果我们不这样做，我们的兑换将无法正常工作。

这将创建一个新的`Mint`程序`ID`，你需要将其添加到你的环境变量中。

就这样，我们的前端功能已经有一些正在运作了。下周，我们将更深入地使用`Anchor`进行开发，目前我们只是想展示一下使用`Anchor`有多么容易，并让基本功能开始运行。
