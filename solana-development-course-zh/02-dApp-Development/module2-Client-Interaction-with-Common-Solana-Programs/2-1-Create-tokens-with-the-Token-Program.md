# 简介

SPL-Token代表了Solana网络上所有非本地（即非SOL）代币。Solana上的可替代和非可替代代币（NFT）都是SPL-Token。 

Token程序包含了创建和互动SPL-Token的指令。 

TokenMint是一种账户，它保存有关特定Token的数据，但不持有Token。

Token账户用于持有特定TokenMint的Token。 

创建TokenMint和Token账户需要用SOL支付租金。关闭账户时，可以退还Token账户的租金，但目前无法关闭TokenMint。

# 概述 

Token程序是Solana程序库（SPL）提供的众多程序之一。它包含了创建和互动SPL-Token的指令。这些代币代表了Solana网络上所有非本地代币。

这节课将集中在使用Token程序创建和管理新的SPL-Token的基础上：

- 创建新的TokenMint
- 创建Token账户
- 铸造 Mint
- 将代币从一个持有者转移到另一个持有者
- 销毁代币 Burn

我们将使用Javascript库`@solana/spl-token` 来进行客户端开发过程。

## Token Mint 代币铸造

要创建一个新的SPL-Token，您首先需要创建一个TokenMint。TokenMint是保存有关特定代币数据的账户。

举个例子，让我们看看Solana Explorer上的美元币（USDC）。USDC的TokenMint地址是`EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`。通过Explorer，我们可以看到USDC的TokenMint的特定细节，如代币的当前供应量、铸造方Mint和冻结权限帐户的地址，以及代币的精度：

![Screenshot of USDC Token Mint](https://www.soldev.app/assets/token-program-usdc-mint.png)

要创建一个新的TokenMint，您需要向Token程序发送正确的交易指令。为此，我们将使用@solana/spl-token的createMint函数。

```
const tokenMint = await createMint(
    connection,
    payer,
    mintAuthority,
    freezeAuthority,
    decimals
);
```

createMint函数返回新Token铸币厂的publicKey。此函数需要以下参数：

- connection - 连接到集群的JSON-RPC连接
- payer - 交易支付方的公钥
- mintAuthority - 授权从TokenMint实际铸造代币的账户。
- freezeAuthority - 授权冻结Token账户中代币的账户。如果不需要冻结功能，此参数可以设置为null
- decimals - 指定代币的期望小数精度（小数点后几位）

如果您创建新Mint的脚本可以访问您的秘钥，您可以简单地使用createMint函数。但是，如果您要构建一个网站，允许用户创建新的TokenMint，您需要用用户的秘钥来做，而不需要让他们将其暴露给浏览器。在这种情况下，您需要构建并提交一个包含正确指令的交易。

在底层，createMint函数实际上是创建一个包含两条指令的交易：

1. 创建一个新账户
2. 初始化一个新铸币厂

就像这样：

```
import * as web3 from '@solana/web3'
import * as token from '@solana/spl-token'

async function buildCreateMintTransaction(
    connection: web3.Connection,
    payer: web3.PublicKey,
    decimals: number
): Promise<web3.Transaction> {
    const lamports = await token.getMinimumBalanceForRentExemptMint(connection);
    const accountKeypair = web3.Keypair.generate();
    const programId = token.TOKEN_PROGRAM_ID

    const transaction = new web3.Transaction().add(
        web3.SystemProgram.createAccount({
            fromPubkey: payer,
            newAccountPubkey: accountKeypair.publicKey,
            space: token.MINT_SIZE,
            lamports,
            programId,
        }),
        token.createInitializeMintInstruction(
            accountKeypair.publicKey,
            decimals,
            payer,
            payer,
            programId
        )
    );

    return transaction
}
```

当手动构建创建新TokenMint的指令时，确保将创建账户和初始化铸币厂的指令添加到同一笔交易中。如果您分别在不同的交易中执行每个步骤，理论上其他人可能会占用您创建的账户并为他们自己的铸币厂初始化它。

## 租金和租金豁免 Rent and Rent Exemption

请注意，在之前代码片段中函数体的第一行调用了`getMinimumBalanceForRentExemptMint`，其结果被传递到`createAccount`函数中。这是账户初始化的一部分，称为租金豁免。

直到最近，Solana上的所有账户都需要做以下事情之一，以避免被取消分配：

- 定期支付租金
- 在初始化时存入足够的SOL，被视为免租金

最近，第一个选项被取消，初始化新账户时存入足够的SOL以免租金成为了要求。

在这种情况下，我们正在为Token铸币厂创建一个新账户，所以我们使用来自`@solana/spl-token`库的`getMinimumBalanceForRentExemptMint`。

其实，这个概念适用于所有账户，您可以使用`Connection`上的更通用的`getMinimumBalanceForRentExemption`方法来创建您可能需要的其他账户。

## Token Account

在您铸造代币（发行）之前，您需要一个Token账户来持有新发行的代币。

Token账户持有由特定“TokenMint”铸造的代币，并指定账户的“所有者”。只有所有者被授权以转账、销毁等方式减少Token账户余额，而任何人都可以向Token账户发送代币以增加其余额。这是显然的，别人可以给你转钱，但只有你有权限花钱。

您可以使用`spl-token`库的`createAccount`函数来创建新的Token账户：

```
javascriptCopy code
const tokenAccount = await createAccount(
    connection,
    payer,
    mint,
    owner,
    keypair
);
```

`createAccount`函数返回新Token账户的`publicKey`。此函数需要以下参数：

- connection - 连接到集群的JSON-RPC连接
- payer - 交易支付方的账户
- mint - 新Token账户关联的Token铸币厂
- owner - 新Token账户的所有者账户
- keypair - 这是一个可选参数，用于指定新Token账户的地址。如果未提供keypair，`createAccount`函数默认从相关的铸币厂和所有者账户中派生。

请注意，这里的`createAccount`函数与我们在查看`createMint`函数时显示的`createAccount`函数不同。之前我们使用`SystemProgram`上的`createAccount`函数返回创建所有账户的指令。这里的`createAccount`函数是spl-token库中的一个辅助函数，它提交一个包含两条指令的交易。第一个创建账户，第二个将账户初始化为Token账户。

就像创建Token铸币厂一样，如果我们需要手动构建`createAccount`的交易，我们可以复制该函数在底层所做的操作：

1. 使用`getMint`检索与铸币厂关联的数据。
2. 使用`getAccountLenForMint`计算Token账户所需的空间。
3. 使用`getMinimumBalanceForRentExemption`计算免租金所需的lamports。
4. 使用`SystemProgram.createAccount`和`createInitializeAccountInstruction`创建一个新交易。请注意，这里的`createAccount`来自@solana/web3.js，用于创建一个通用的新账户。`createInitializeAccountInstruction`使用这个新账户来初始化新的Token账户。

```
javascriptCopy code
import * as web3 from '@solana/web3'
import * as token from '@solana/spl-token'

async function buildCreateTokenAccountTransaction(
    connection: web3.Connection,
    payer: web3.PublicKey,
    mint: web3.PublicKey
): Promise<web3.Transaction> {
    const mintState = await token.getMint(connection, mint)
    const accountKeypair = await web3.Keypair.generate()
    const space = token.getAccountLenForMint(mintState);
    const lamports = await connection.getMinimumBalanceForRentExemption(space);
    const programId = token.TOKEN_PROGRAM_ID

    const transaction = new web3.Transaction().add(
        web3.SystemProgram.createAccount({
            fromPubkey: payer,
            newAccountPubkey: accountKeypair.publicKey,
            space,
            lamports,
            programId,
        }),
        token.createInitializeAccountInstruction(
            accountKeypair.publicKey,
            mint,
            payer,
            programId
        )
    );

    return transaction
}
```

## 关联 Token 账户

关联Token账户是一种Token账户，其地址通过所有者的公钥和TokenMint派生而来。关联Token账户为特定TokenMint的特定公钥所有者提供了一种确定性的方式来找到其Token账户。

大多数情况下，当您创建Token账户时，您会希望它是一个关联Token账户。

如果没有关联Token账户，一个用户可能拥有属于同一TokenMint的多个Token账户，这会导致混淆，不清楚应该向哪里发送代币。 

关联Token账户允许用户向另一个用户发送代币，即使接收方还没有该TokenMint的Token账户。

![ATAs are PDAs](https://www.soldev.app/assets/atas-are-pdas.svg)

与上面类似，您可以使用`spl-token`库的`createAssociatedTokenAccount`函数来创建关联Token账户。

```
javascriptCopy code
const associatedTokenAccount = await createAssociatedTokenAccount(
    connection,
    payer,
    mint,
    owner,
);
```

此函数返回新关联Token账户的publicKey，并需要以下参数：

- connection - 连接到集群的JSON-RPC连接
- payer - 交易支付方的账户
- mint - 新Token账户关联的Token铸币厂
- owner - 新Token账户的所有者账户

您还可以使用`getOrCreateAssociatedTokenAccount`来获取与给定地址关联的Token账户，或在它不存在时创建它。例如，如果您正在编写向给定用户空投代币的代码，您可能会使用此函数以确保在不存在时创建与给定用户关联的Token账户。

在底层，`createAssociatedTokenAccount`正在做两件事：

1. 使用`getAssociatedTokenAddress`从铸币厂和所有者派生关联Token账户地址。
2. 使用`createAssociatedTokenAccountInstruction`的指令构建交易。

```
javascriptCopy code
import * as web3 from '@solana/web3'
import * as token from '@solana/spl-token'

async function buildCreateAssociatedTokenAccountTransaction(
    payer: web3.PublicKey,
    mint: web3.PublicKey
): Promise<web3.Transaction> {
    const associatedTokenAddress = await token.getAssociatedTokenAddress(mint, payer, false);

    const transaction = new web3.Transaction().add(
        token.createAssociatedTokenAccountInstruction(
            payer,
            associatedTokenAddress,
            payer,
            mint
        )
    )

    return transaction
}
```

## 铸造代币

铸造代币是指将新代币发行到流通中的过程。当您铸造代币时，您增加了Token铸币厂的供应量，并将新铸造的代币存入Token账户。只有Token铸币厂的铸币权限账户被允许铸造新代币。

要使用`spl-token`库铸造代币，您可以使用`mintTo`函数。

```
javascriptCopy code
const transactionSignature = await mintTo(
    connection,
    payer,
    mint,
    destination,
    authority,
    amount
);
```

`mintTo`函数返回一个`TransactionSignature`，可以复制该签名，在 [Solana Explorer](https://explorer.solana.com/?cluster=custom)对应的网络上进行查看。

`mintTo`函数需要以下参数：

- connection - 连接到集群的JSON-RPC连接
- payer - 交易支付方的账户
- mint - 与新Token账户关联的TokenMint
- destination - 将被铸造代币的Token账户
- authority - 授权铸造代币的账户
- amount - 铸造的代币数量，不包括小数点，例如，如果Scrooge Coin铸币厂的decimals属性设为2，那么要获得1个完整的Scrooge Coin，您需要将此属性设置为100

在代币铸造后，将TokenMint的铸币权限设置为null并不罕见。这将设定最大供应量，并确保未来不会铸造更多代币。相反，铸币权限也可以授予一个程序，这样代币就可以按照固定间隔或可编程条件自动铸造。

在底层，`mintTo`函数只是创建了一个包含从`createMintToInstruction`函数获取的指令的交易。

```
javascriptCopy code
import * as web3 from '@solana/web3'
import * as token from '@solana/spl-token'

async function buildMintToTransaction(
    authority: web3.PublicKey,
    mint: web3.PublicKey,
    amount: number,
    destination: web3.PublicKey
): Promise<web3.Transaction> {
    const transaction = new web3.Transaction().add(
        token.createMintToInstruction(
            mint,
            destination,
            authority,
            amount
        )
    )

    return transaction
}
```

## 转移代币

`SPL-Token`转移要求发送方和接收方都必须有代币铸币厂所发行的代币账户。代币从发送方的Token账户转移到接收方的Token账户。

在获取接收方的关联Token账户时，您可以使用`getOrCreateAssociatedTokenAccount`来确保在转移之前他们的Token账户已经存在。请记住，如果账户尚未存在，这个函数将创建它，并且交易的支付方将被扣除用于账户创建的lamports。

一旦您知道了接收方的Token账户地址，就可以使用`spl-token`库的`transfer`函数来转移代币。

```
javascriptCopy code
const transactionSignature = await transfer(
    connection,
    payer,
    source,
    destination,
    owner,
    amount
)
```

`transfer`函数返回一个可以在Solana Explorer上查看的`TransactionSignature`。`transfer`函数需要以下参数：

- connection - 连接到集群的JSON-RPC连接
- payer - 交易支付方的账户
- source - 发送代币的Token账户
- destination - 接收代币的Token账户
- owner - 源Token账户所有者的账户
- amount - 要转移的代币数量

在底层，`transfer`函数只是创建了一个包含从`createTransferInstruction`函数获取的指令的交易。

```
javascriptCopy code
import * as web3 from '@solana/web3'
import * as token from '@solana/spl-token'

async function buildTransferTransaction(
    source: web3.PublicKey,
    destination: web3.PublicKey,
    owner: web3.PublicKey,
    amount: number
): Promise<web3.Transaction> {
    const transaction = new web3.Transaction().add(
        token.createTransferInstruction(
            source,
            destination,
            owner,
            amount,
        )
    )

    return transaction
}
```

## 销毁代币

销毁代币是指减少特定TokenMint的代币供应量的过程。销毁代币将其从指定的Token账户和更广泛的流通中移除。

要使用`spl-token`库销毁代币，您可以使用`burn`函数。

```
javascriptCopy code
const transactionSignature = await burn(
    connection,
    payer,
    account,
    mint,
    owner,
    amount
)
```

`burn`函数返回一个可以在Solana Explorer上查看的`TransactionSignature`。`burn`函数需要以下参数：

- connection - 连接到集群的JSON-RPC连接
- payer - 交易支付方的账户
- account - 将要从中销毁代币的Token账户
- mint - 与Token账户关联的Token铸币厂
- owner - Token账户所有者的账户
- amount - 要销毁的代币数量

在底层，`burn`函数创建了一个包含从`createBurnInstruction`函数获取的指令的交易。

```
javascriptCopy code
import * as web3 from '@solana/web3'
import * as token from '@solana/spl-token'

async function buildBurnTransaction(
    account: web3.PublicKey,
    mint: web3.PublicKey,
    owner: web3.PublicKey,
    amount: number
): Promise<web3.Transaction> {
    const transaction = new web3.Transaction().add(
        token.createBurnInstruction(
            account,
            mint,
            owner,
            amount
        )
    )

    return transaction
}
```

## 批准代理

批准代理是指授权另一个账户从Token账户转移或销毁代币的过程。使用代理时，Token账户的控制权仍然在原始所有者手中。代理可以转移或销毁的最大代币量在Token账户的所有者批准代理时指定。请注意，任何时候一个Token账户只能关联一个代理账户。

要使用`spl-token`库批准代理，您可以使用`approve`函数。

```
javascriptCopy code
const transactionSignature = await approve(
    connection,
    payer,
    account,
    delegate,
    owner,
    amount
)
```

`approve`函数返回一个可以在Solana Explorer上查看的TransactionSignature。`approve`函数需要以下参数：

- connection - 连接到集群的JSON-RPC连接
- payer - 交易支付方的账户
- account - 将要从中委托代币的Token账户
- delegate - 所有者授权转移或销毁代币的账户
- owner - Token账户所有者的账户
- amount - 代理可以转移或销毁的最大代币数量

在底层，`approve`函数创建了一个包含从`createApproveInstruction`函数获取的指令的交易。

```
javascriptCopy code
import * as web3 from '@solana/web3'
import * as token from '@solana/spl-token'

async function buildApproveTransaction(
    account: web3.PublicKey,
    delegate: web3.PublicKey,
    owner: web3.PublicKey,
    amount: number
): Promise<web3.Transaction> {
    const transaction = new web3.Transaction().add(
        token.createApproveInstruction(
            account,
            delegate,
            owner,
            amount
        )
    )

    return transaction
}
```

## 撤销代理

之前批准的Token账户代理可以被撤销。一旦代理被撤销，代理将无法再从所有者的Token账户转移代币。之前批准的剩余未转移的金额将无法再由代理转移。

要使用`spl-token`库撤销代理，您可以使用`revoke`函数。

```
javascriptCopy code
const transactionSignature = await revoke(
    connection,
    payer,
    account,
    owner,
)
```

`revoke`函数返回一个可以在Solana Explorer上查看的`TransactionSignature`。`revoke`函数需要以下参数：

- connection - 连接到集群的JSON-RPC连接
- payer - 交易支付方的账户
- account - 将要撤销代理权限的Token账户
- owner - Token账户所有者的账户

在底层，`revoke`函数创建了一个包含从`createRevokeInstruction`函数获取的指令的交易。

```
javascriptCopy code
import * as web3 from '@solana/web3'
import * as token from '@solana/spl-token'

async function buildRevokeTransaction(
    account: web3.PublicKey,
    owner: web3.PublicKey,
): Promise<web3.Transaction> {
    const transaction = new web3.Transaction().add(
        token.createRevokeInstruction(
            account,
            owner,
        )
    )

    return transaction
}
```