# 导言：使用Metaplex在Solana上创建和分发NFTs

1. **SPL代币与元数据账户**：Solana上的NFTs表现为SPL代币，每个代币都有一个关联的元数据账户，0小数位，最大供应量为1。
2. **Metaplex工具集**：Metaplex提供了一系列工具，简化了在Solana区块链上创建和分发NFTs的过程。
3. **代币元数据程序**：代币元数据程序标准化了将元数据附加到SPL代币的过程。
4. **Metaplex SDK**：Metaplex SDK是一个工具，提供了用户友好的API，帮助开发者利用Metaplex提供的链上工具。
5. **Candy Machine程序**：Candy Machine是一个NFT分发工具，用于从一个集合中创建和铸造NFTs。
6. **Sugar CLI工具**：Sugar CLI是一个工具，简化了上传媒体/元数据文件和为一个集合创建Candy Machine的过程。

**Solana上的非同质化代币（NFTs）简介**

Solana上的非同质化代币（NFTs）是使用Token程序创建的SPL代币。但这些代币还有一个额外的元数据账户与每个代币铸造账户相关联。这允许代币有多种用途，比如可以代表游戏库存或艺术品。

在本课程中，我们将介绍Solana上NFTs的基础知识，如何使用Metaplex SDK创建和更新它们，并简要介绍一些可以帮助你在Solana上大规模创建和分发NFTs的工具。

**Solana上的NFTs**

Solana上的NFT是一个带有关联元数据的不可分割代币。此外，该代币的铸造最大供应量为1。

换句话说，NFT是来自Token程序的标准代币，但与你可能认为的“标准代币”不同，它：

- 有0个小数位，因此不能被分割成部分。
- 来自供应量为1的代币铸造，这意味着只存在这样一个代币。
- 来自一个铸币权限被设置为null的代币铸造（以确保供应量永远不会改变）。
- 拥有一个存储元数据的关联账户。

虽然前三点是可以通过SPL代币程序实现的特性，但关联的元数据需要一些额外的功能。

通常，NFT的元数据包含链上和链下两部分。请看下面的图表：

![Screenshot of Metadata](https://www.soldev.app/assets/solana-nft-metaplex-metadata.png)

- 链上元数据存储在与代币铸造账户关联的账户中。链上元数据包含一个指向链下.json文件的URI字段。
- 链下元数据的JSON文件存储了指向NFT媒体（图像、视频、3D文件）的链接、NFT可能具有的特征以及额外的元数据（请参见此示例JSON文件）。像Arweave这样的永久数据存储系统通常用于存储NFT元数据的链下组件。

**Metaplex简介**

Metaplex是一个提供一系列工具的组织，如Metaplex SDK，这些工具简化了在Solana区块链上创建和分发NFTs的过程。这些工具适用于广泛的使用场景，使您可以轻松管理创建和铸造NFT集合的整个过程。

更具体地说，Metaplex SDK旨在帮助开发者利用Metaplex提供的链上工具。它提供了一个用户友好的API，专注于流行的使用场景，并允许轻松与第三方插件集成。要了解更多关于Metaplex SDK的功能，您可以参考其README文件。

Metaplex提供的一个基本程序是代币元数据程序。代币元数据程序标准化了将元数据附加到SPL代币的过程。使用Metaplex创建NFT时，代币元数据程序会使用代币铸造作为种子，通过程序派生地址（PDA）创建一个元数据账户。这使得任何NFT的元数据账户都可以使用代币铸造的地址确定性地定位。要了解更多关于代币元数据程序的信息，您可以参考Metaplex文档。

在接下来的章节中，我们将介绍使用Metaplex SDK准备资产、创建NFTs、更新NFTs以及将NFT与更广泛的集合关联的基础知识。

**Metaplex实例**

Metaplex实例作为访问Metaplex SDK API的入口点。这个实例接受一个用于与集群通信的连接。此外，开发者可以通过指定“身份驱动”和“存储驱动”来定制SDK的交互。

身份驱动实质上是一个可以用来签署交易的密钥对，创建NFT时需要此操作。存储驱动用于指定您希望用于上传资产的存储服务。默认选项是bundlrStorage驱动，它将资产上传到Arweave，这是一个永久且去中心化的存储服务。

下面是一个如何为devnet设置Metaplex实例的示例。

```
import {
    Metaplex,
    keypairIdentity,
    bundlrStorage,
} from "@metaplex-foundation/js";
import { Connection, clusterApiUrl, Keypair } from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("devnet"));
const wallet = Keypair.generate();

const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(wallet))
    .use(
        bundlrStorage({
            address: "https://devnet.bundlr.network",
            providerUrl: "https://api.devnet.solana.com",
            timeout: 60000,
        }),
    );
```

**上传资产**

在创建NFT之前，您需要准备并上传计划与NFT关联的任何资产。虽然这不必是一张图片，但大多数NFT都有一张关联的图片。

准备和上传图片包括将图片转换为缓冲区，使用toMetaplexFile函数将其转换为Metaplex格式，最后将其上传到指定的存储驱动。

Metaplex SDK支持从您本地计算机上存在的文件或通过浏览器上传的用户文件创建新的Metaplex文件。您可以通过使用fs.readFileSync读取图片文件，然后使用toMetaplexFile将其转换为Metaplex文件来完成前者。最后，使用您的Metaplex实例调用storage().upload(file)来上传文件。该函数的返回值将是存储图像的URI。

```
const buffer = fs.readFileSync("/path/to/image.png");
const file = toMetaplexFile(buffer, "image.png");

const imageUri = await metaplex.storage().upload(file);
```

**上传元数据**

上传图片后，是时候使用nfts().uploadMetadata函数上传链下JSON元数据了。这将返回一个存储JSON元数据的URI。

记住，元数据的链下部分包括诸如图像URI以及额外信息，如NFT的名称和描述。虽然您在理论上可以在此JSON对象中包含您想要的任何内容，但在大多数情况下，您应该遵循NFT标准，以确保与钱包、程序和应用程序的兼容性。

要创建元数据，请使用SDK提供的uploadMetadata方法。此方法接受一个元数据对象，并返回指向上传元数据的URI。

```
const { uri } = await metaplex.nfts().uploadMetadata({
    name: "My NFT",
    description: "My description",
    image: imageUri,
});
```

**创建NFT**

上传了NFT的元数据后，您终于可以在网络上创建NFT了。Metaplex SDK的create方法允许您使用最少的配置创建一个新的NFT。此方法将为您处理铸币账户、代币账户、元数据账户和主版账户的创建。提供给此方法的数据将代表NFT元数据的链上部分。您可以探索SDK，查看可以选择性地提供给此方法的所有其他输入。

```
const { nft } = await metaplex.nfts().create(
    {
        uri: uri,
        name: "My NFT",
        sellerFeeBasisPoints: 0,
    },
    { commitment: "finalized" },
);
```

此方法返回一个包含新创建的NFT信息的对象。默认情况下，SDK将isMutable属性设置为true，允许对NFT的元数据进行更新。然而，您可以选择将isMutable设置为false，使NFT的元数据不可变。

**更新NFT**

如果您将isMutable保留为true，您可能最终会有理由更新NFT的元数据。SDK的update方法允许您更新NFT元数据的链上和链下部分。要更新链下元数据，您需要重复前面步骤中概述的上传新图像和元数据URI的步骤，然后将新的元数据URI提供给此方法。这将改变链上元数据指向的URI，有效地更新链下元数据。

```
const nft = await metaplex.nfts().findByMint({ mintAddress });

const { response } = await metaplex.nfts().update(
    {
        nftOrSft: nft,
        name: "Updated Name",
        uri: uri,
        sellerFeeBasisPoints: 100,
    },
    { commitment: "finalized" },
);
```

请注意，您在调用update时未包含的任何字段都将保持不变，这是设计如此。

**将NFT添加到集合**

认证集合是个别NFT可以属于的NFT。想想像Solana Monkey Business这样的大型NFT集合。如果您查看个别NFT的元数据，您会看到一个collection字段，其中的键指向认证集合NFT。简单地说，属于集合的NFT与代表该集合本身的另一个NFT相关联。

为了将NFT添加到集合，首先必须创建集合NFT。过程与之前相同，除了您将在NFT元数据中包含一个额外字段：isCollection。这个字段告诉代币程序，这个NFT是一个集合NFT。

```
const { collectionNft } = await metaplex.nfts().create(
    {
        uri: uri,
        name: "My NFT Collection",
        sellerFeeBasisPoints: 0,
        isCollection: true
    },
    { commitment: "finalized" },
);
```

然后，您将集合的铸币地址列为新Nft的collection字段中的引用。

```
const { nft } = await metaplex.nfts().create(
    {
        uri: uri,
        name: "My NFT",
        sellerFeeBasisPoints: 0,
        collection: collectionNft.mintAddress
    },
    { commitment: "finalized" },
);
```

当您查看新创建的NFT的元数据时，您现在应该看到一个collection字段，如下所示：

```
"collection":{
    "verified": false,
    "key": "SMBH3wF6baUj6JWtzYvqcKuj2XCKWDqQxzspY12xPND"
}
```

您需要做的最后一件事是验证NFT。这实际上只是将上面的verified字段切换为true，但这非常重要。这是让消费程序和应用知道您的NFT实际上是集合的一部分的方法。您可以使用verifyCollection函数来做到这一点：

```
await metaplex.nfts().verifyCollection({
    mintAddress: nft.address,
    collectionMintAddress: collectionNft.address,
    isSizedCollection: true,
})
```

**Candy Machine**

当创建和分发大量NFT时，Metaplex通过他们的Candy Machine程序和Sugar CLI使其变得容易。

Candy Machine实际上是一个铸造和分发程序，帮助推出NFT集合。Sugar是一个命令行界面，帮助您创建candy machine、准备资产，并大规模创建NFTs。上面为创建一个NFT所覆盖的步骤，如果要一次性执行数千个NFT，将会非常繁琐。Candy Machine和Sugar通过提供许多保障措施，解决了这个问题，并帮助确保公平启动。

我们不会深入介绍这些工具，但一定要查看Metaplex文档中Candy Machine和Sugar是如何协同工作的。

要探索Metaplex提供的全部工具范围，您可以在GitHub上查看Metaplex仓库。

**实验**

在这个实验室中，我们将通过使用Metaplex SDK创建一个NFT的步骤，之后更新NFT的元数据，然后将NFT与一个集合关联。到最后，您将基本了解如何使用Metaplex SDK与Solana上的NFT进行交互。

**1.开始**

首先，从这个仓库的starter分支下载起始代码。

该项目包含src目录中的两张图片，我们将用它们来创建NFTs。

此外，在index.ts文件中，您会找到以下代码片段，其中包含了我们将要创建和更新的NFT的样本数据。

```
interface NftData {
    name: string;
    symbol: string;
    description: string;
    sellerFeeBasisPoints: number;
    imageFile: string;
}

interface CollectionNftData {
    name: string
    symbol: string
    description: string
    sellerFeeBasisPoints: number
    imageFile: string
    isCollection: boolean
    collectionAuthority: Signer
}

// example data for a new NFT
const nftData = {
    name: "Name",
    symbol: "SYMBOL",
    description: "Description",
    sellerFeeBasisPoints: 0,
    imageFile: "solana.png",
}

// example data for updating an existing NFT
const updateNftData = {
    name: "Update",
    symbol: "UPDATE",
    description: "Update Description",
    sellerFeeBasisPoints: 100,
    imageFile: "success.png",
}

async function main() {
    // create a new connection to the cluster's API
    const connection = new Connection(clusterApiUrl("devnet"));

    // initialize a keypair for the user
    const user = await initializeKeypair(connection);

    console.log("PublicKey:", user.publicKey.toBase58());
}
```

要安装必要的依赖项，请在命令行中运行npm install。

接下来，通过运行npm start来执行代码。这将创建一个新的密钥对，将其写入.env文件，并向密钥对空投devnet SOL。

```
Current balance is 0
Airdropping 1 SOL...
New balance is 1
PublicKey: GdLEz23xEonLtbmXdoWGStMst6C9o3kBhb7nf7A1Fp6F
Finished successfully
```

**2.设置Metaplex** 

在我们开始创建和更新NFT之前，我们需要设置Metaplex实例。用以下内容更新main()函数：

```
async function main() {
    // create a new connection to the cluster's API
    const connection = new Connection(clusterApiUrl("devnet"));

    // initialize a keypair for the user
    const user = await initializeKeypair(connection);

    console.log("PublicKey:", user.publicKey.toBase58());

    // metaplex set up
    const metaplex = Metaplex.make(connection)
        .use(keypairIdentity(user))
        .use(
            bundlrStorage({
                address: "https://devnet.bundlr.network",
                providerUrl: "https://api.devnet.solana.com",
                timeout: 60000,
            }),
        );
}
```

**3.uploadMetadata助手函数** 

接下来，让我们创建一个助手函数来处理上传图像和元数据的过程，并返回元数据URI。该函数将以Metaplex实例和NFT数据作为输入，并返回元数据URI作为输出。

```
// helper function to upload image and metadata
async function uploadMetadata(
    metaplex: Metaplex,
    nftData: NftData,
): Promise<string> {
    // file to buffer
    const buffer = fs.readFileSync("src/" + nftData.imageFile);

    // buffer to metaplex file
    const file = toMetaplexFile(buffer, nftData.imageFile);

    // upload image and get image uri
    const imageUri = await metaplex.storage().upload(file);
    console.log("image uri:", imageUri);

    // upload metadata and get metadata uri (off chain metadata)
    const { uri } = await metaplex.nfts().uploadMetadata({
        name: nftData.name,
        symbol: nftData.symbol,
        description: nftData.description,
        image: imageUri,
    });

    console.log("metadata uri:", uri);
    return uri;
}
```

该函数将读取图像文件，将其转换为缓冲区，然后上传以获取图像URI。然后它将上传包括名称、符号、描述和图像URI在内的NFT元数据，并获取元数据URI。这个URI是链下元数据。该函数还会记录图像URI和元数据URI以供参考。

**4.createNft助手函数** 

接下来，让我们创建一个助手函数来处理创建NFT。该函数接受Metaplex实例、元数据URI和NFT数据作为输入。它使用SDK的create方法创建NFT，传入元数据URI、名称、卖方费用和符号作为参数。

```
// helper function create NFT
async function createNft(
    metaplex: Metaplex,
    uri: string,
    nftData: NftData,
): Promise<NftWithToken> {
    const { nft } = await metaplex.nfts().create(
        {
            uri: uri, // metadata URI
            name: nftData.name,
            sellerFeeBasisPoints: nftData.sellerFeeBasisPoints,
            symbol: nftData.symbol,
        },
        { commitment: "finalized" },
    );

    console.log(
        `Token Mint: https://explorer.solana.com/address/${nft.address.toString()}?cluster=devnet`,
    );

    return nft;
}
```

createNft函数记录代币铸造URL并返回一个包含新创建的NFT信息的nft对象。NFT将铸造到用作设置Metaplex实例时身份驱动的用户对应的公钥。

**5. 创建NFT** 

现在我们已经设置了Metaplex实例，并创建了上传元数据和创建NFT的助手函数，我们可以通过创建一个NFT来测试这些函数。在main()函数中，调用uploadMetadata函数上传NFT数据并获取元数据的URI。然后，使用createNft函数和元数据URI创建一个NFT。

```
async function main() {
	...

  // upload the NFT data and get the URI for the metadata
  const uri = await uploadMetadata(metaplex, nftData)

  // create an NFT using the helper function and the URI from the metadata
  const nft = await createNft(metaplex, uri, nftData)
}
```

在命令行中运行npm start来执行main函数。您应该看到类似以下的输出：

```
Current balance is 1.770520342
PublicKey: GdLEz23xEonLtbmXdoWGStMst6C9o3kBhb7nf7A1Fp6F
image uri: https://arweave.net/j5HcSX8qttSgJ_ZDLmbuKA7VGUo7ZLX-xODFU4LFYew
metadata uri: https://arweave.net/ac5fwNfRckuVMXiQW_EAHc-xKFCv_9zXJ-1caY08GFE
Token Mint: https://explorer.solana.com/address/QdK4oCUZ1zMroCd4vqndnTH7aPAsr8ApFkVeGYbvsFj?cluster=devnet
Finished successfully
```

请随意检查图像和元数据生成的URI，以及通过访问输出中提供的URL在Solana浏览器上查看NFT。

**6. updateNftUri 助手函数** 接下来，让我们创建一个助手函数来处理更新现有NFT的URI。该函数将接受Metaplex实例、元数据URI和NFT的铸币地址。它使用SDK的findByMint方法使用铸币地址获取现有的NFT数据，然后使用update方法更新新URI的元数据。最后，它将记录代币铸造URL和交易签名以供参考。

```
// helper function update NFT
async function updateNftUri(
    metaplex: Metaplex,
    uri: string,
    mintAddress: PublicKey,
) {
    // fetch NFT data using mint address
    const nft = await metaplex.nfts().findByMint({ mintAddress });

    // update the NFT metadata
    const { response } = await metaplex.nfts().update(
        {
            nftOrSft: nft,
            uri: uri,
        },
        { commitment: "finalized" },
    );

    console.log(
        `Token Mint: https://explorer.solana.com/address/${nft.address.toString()}?cluster=devnet`,
    );

    console.log(
        `Transaction: https://explorer.solana.com/tx/${response.signature}?cluster=devnet`,
    );
}
```

**7. 更新NFT** 

要更新现有的NFT，我们首先需要为NFT上传新的元数据并获取新的URI。在main()函数中，再次调用uploadMetadata函数上传更新后的NFT数据并获取元数据的新URI。然后，我们可以使用updateNftUri助手函数，传入Metaplex实例、元数据的新URI和NFT的铸币地址。nft.address来自createNft函数的输出。

```
async function main() {
	...

  // upload updated NFT data and get the new URI for the metadata
  const updatedUri = await uploadMetadata(metaplex, updateNftData)

  // update the NFT using the helper function and the new URI from the metadata
  await updateNftUri(metaplex, updatedUri, nft.address)
}
```



在命令行中运行`npm start`来执行`main`函数。您应该看到类似以下的附加输出：

您还可以通过从`.env`文件导入`PRIVATE_KEY`，在Phantom钱包中查看NFTs。

**8. 创建NFT集合** 

太棒了，现在您知道如何在Solana区块链上创建和更新单个NFT！但是，如何将其添加到集合中呢？

首先，让我们创建一个名为`createCollectionNft`的助手函数。请注意，它与`createNft`非常相似，但确保`isCollection`设置为true，并且数据符合集合的要求。

```
async function createCollectionNft(
    metaplex: Metaplex,
    uri: string,
    data: CollectionNftData
): Promise<NftWithToken> {
    const { nft } = await metaplex.nfts().create(
        {
            uri: uri,
            name: data.name,
            sellerFeeBasisPoints: data.sellerFeeBasisPoints,
            symbol: data.symbol,
            isCollection: true,
        },
        { commitment: "finalized" }
    )

    console.log(
        `Collection Mint: https://explorer.solana.com/address/${nft.address.toString()}?cluster=devnet`
    )

    return nft
}
```

接下来，我们需要为集合创建链下数据。在现有的`createNft`调用之前，在`main`中添加以下`collectionNftData`：

```
const collectionNftData = {
    name: "TestCollectionNFT",
    symbol: "TEST",
    description: "Test Description Collection",
    sellerFeeBasisPoints: 100,
    imageFile: "success.png",
    isCollection: true,
    collectionAuthority: user,
}
```

现在，让我们调用uploadMetadata与collectionNftData，然后调用createCollectionNft。同样，在创建NFT的代码之前执行此操作。

```
async function main() {
    ...

    // upload data for the collection NFT and get the URI for the metadata
    const collectionUri = await uploadMetadata(metaplex, collectionNftData)

    // create a collection NFT using the helper function and the URI from the metadata
    const collectionNft = await createCollectionNft(
        metaplex,
        collectionUri,
        collectionNftData
    )
}
```

这将返回我们集合的铸币地址，以便我们使用它将NFT分配到集合中。

**9. 将NFT分配到集合** 

现在我们有了一个集合，让我们更改现有的代码，以便新创建的NFT被添加到集合中。首先，让我们修改createNft函数，以便nfts().create调用包括collection字段。然后，添加调用verifyCollection的代码，使链上元数据中的verified字段设置为true。这是消费程序和应用程序可以确信NFT实际上属于该集合的方式。

```
async function createNft(
  metaplex: Metaplex,
  uri: string,
  nftData: NftData
): Promise<NftWithToken> {
    const { nft } = await metaplex.nfts().create(
        {
            uri: uri, // metadata URI
            name: nftData.name,
            sellerFeeBasisPoints: nftData.sellerFeeBasisPoints,
            symbol: nftData.symbol,
        },
        { commitment: "finalized" }
    )

    console.log(
        `Token Mint: https://explorer.solana.com/address/${nft.address.toString()}? cluster=devnet`
    )

    //this is what verifies our collection as a Certified Collection
    await metaplex.nfts().verifyCollection({    
        mintAddress: nft.mint.address,
        collectionMintAddress: collectionMint,
        isSizedCollection: true,
    })

    return nft
}
```

现在，运行`npm start`，瞧！如果您按照新的nft链接并查看元数据选项卡，您将看到一个带有您集合铸币地址的`collection`字段。

祝贺您！您已经成功学会了如何使用Metaplex SDK创建、更新和验证作为集合一部分的NFT。这是您需要的一切，以便为几乎任何用例构建自己的集合。您可以构建一个TicketMaster竞争者，重塑Costco的会员计划，甚至数字化您学校的学生ID系统。可能性是无限的！

如果您想查看最终解决方案代码，可以在同一仓库的[解决方案](https://github.com/Unboxed-Software/solana-metaplex/tree/solution)分支上找到。

# 挑战

为了加深您对 Metaplex 工具的理解，请深入研究 Metaplex 文档并熟悉 Metaplex 提供的各种程序和工具。例如，您可以深入了解 Candy Machine 程序以了解其功能。

一旦您了解了糖果机程序的工作原理，就可以使用 Sugar CLI 来测试您的知识，为您自己的收藏创建糖果机。这种实践经验不仅会增强您对这些工具的理解，还会增强您对未来有效使用它们的能力的信心。

玩得开心！这将是您第一个独立创作的NFT收藏！至此，您将完成第 2 单元。希望您能感受到这个过程！请随时分享一些即时反馈，以便我们继续改进课程！



