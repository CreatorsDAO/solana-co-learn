# 非同质化代币 (NFTs)

## 如何创建一个NFT

要创建一个 NFT，你需要：

1. 将图像上传到像 Arweave 这样的 IPFS 网络上。
2. 将 JSON 元数据上传到像 Arweave 这样的 IPFS 网络上。
3. 调用 Metaplex 创建一个用于该 NFT 的账户。

### 上传到 Arweave


```typescript
// typescript
// 1. Upload image to Arweave
const data = fs.readFileSync("./code/nfts/arweave-upload/lowres-dog.png");

const transaction = await arweave.createTransaction({
  data: data,
});

transaction.addTag("Content-Type", "image/png");

const wallet = JSON.parse(fs.readFileSync("wallet.json", "utf-8"))
await arweave.transactions.sign(transaction, wallet);

const response = await arweave.transactions.post(transaction);
console.log(response);

const id = transaction.id;
const imageUrl = id ? `https://arweave.net/${id}` : undefined;

// 2. Upload metadata to Arweave

const metadataRequest = JSON.stringify(metadata);

const metadataTransaction = await arweave.createTransaction({
  data: metadataRequest,
});

metadataTransaction.addTag("Content-Type", "application/json");

await arweave.transactions.sign(metadataTransaction, wallet);

await arweave.transactions.post(metadataTransaction);

```

```python
// python
#  1. Load your arweave wallet
your_ar_wallet = Wallet('wallet.json')

#  2. Upload image to Arweave
with open('./code/nfts/arweave-upload/lowres-dog.png', 'rb') as f:
    img_in_bytes = f.read()

transaction = Transaction(your_ar_wallet, data=img_in_bytes)
transaction.add_tag('Content-Type', 'image/png')
transaction.sign()
transaction.send()

image_url = API_URL+"/"+transaction.id

#  3. Upload metadata to Arweave
meta_transaction = Transaction(your_ar_wallet, data=json.dumps(metadata))
meta_transaction.add_tag('Content-Type', 'text/html')
meta_transaction.sign()
meta_transaction.send()

metadata_url = API_URL+"/"+meta_transaction.id

```

### 铸造（Mint）该 NFT

如果你已经上传了图像和元数据，您可以使用以下代码铸造（Mint）该 NFT。


```typescript
// typescript
const mintNFTResponse = await metaplex.nfts().create({
  uri: "https://ffaaqinzhkt4ukhbohixfliubnvpjgyedi3f2iccrq4efh3s.arweave.net/KUAIIbk6p8oo4XHRcq0U__C2r0mwQaNl0gQow4Qp9yk",
  maxSupply: 1,
});

```
> **tip 注意**
>
> 你不能使用与你钱包不同的创作者信息来铸造（Mint） NFT。如果遇到创作者的问题，请确保你的元数据中将你列为创作者。


## 如何获取 NFT 元数据

Metaplex 的 NFT 元数据存储在 Arweave 上。为了获取 Arweave 的元数据，您需要获取 Metaplex PDA（程序派生账户）并对账户数据进行解码。

```typescript
// typescript
const connection = new Connection(clusterApiUrl("mainnet-beta"));
const keypair = Keypair.generate();

const metaplex = new Metaplex(connection);
metaplex.use(keypairIdentity(keypair));

const mintAddress = new PublicKey(
  "Ay1U9DWphDgc7hq58Yj1yHabt91zTzvV2YJbAWkPNbaK"
);

const nft = await metaplex.nfts().findByMint({ mintAddress });

console.log(nft.json);

```

## 如何获取NFT的所有者

如果你拥有 NFT 的铸币密钥，你可以通过查看该铸币密钥对应的最大代币账户来找到其当前所有者。

请记住，NFT 的供应量为 1，它们是不可分割的，这意味着在任何时刻只有一个代币账户持有该代币，而其他所有与该铸币密钥相关的代币账户的余额都为 0。

一旦确定了最大代币账户，我们可以获取它的所有者。

```typescript
// typescript
const connection = new Connection("https://api.mainnet-beta.solana.com");
const tokenMint = "9ARngHhVaCtH5JFieRdSS5Y8cdZk2TMF4tfGSWFB9iSK";
const largestAccounts = await connection.getTokenLargestAccounts(
  new PublicKey(tokenMint)
);
const largestAccountInfo = await connection.getParsedAccountInfo(
  largestAccounts.value[0].address
);
console.log(largestAccountInfo.value.data.parsed.info.owner);

```

## 如何获取 NFT 的铸币地址

如果你知道Candy Machine的公钥，你可以使用以下代码获取从该Candy Machine生成的所有 NFT 铸币地址的列表。请注意，我们可以使用以下的 `memcmp` 过滤器，因为在 v1 版本中，第一个创作者的地址总是Candy Machine的地址。

### Candy Machine V1


```typescript
// typescript
const getMintAddresses = async (firstCreatorAddress: PublicKey) => {
  const metadataAccounts = await connection.getProgramAccounts(
    TOKEN_METADATA_PROGRAM,
    {
      // The mint address is located at byte 33 and lasts for 32 bytes.
      dataSlice: { offset: 33, length: 32 },

      filters: [
        // Only get Metadata accounts.
        { dataSize: MAX_METADATA_LEN },

        // Filter using the first creator.
        {
          memcmp: {
            offset: CREATOR_ARRAY_START,
            bytes: firstCreatorAddress.toBase58(),
          },
        },
      ],
    }
  );

  return metadataAccounts.map((metadataAccountInfo) =>
    bs58.encode(metadataAccountInfo.account.data)
  );
};

getMintAddresses(candyMachineId);

```

### Candy Machine V2

如果你正在使用Candy Machine v2，你首先需要访问其 "Candy Machine Creator" 地址，该地址是一个简单的 PDA，使用`candy_machine`和Candy Machine v2 地址作为种子生成。一旦你获得了创建者地址，你可以像对待 v1 版本一样使用它。


```typescript
// typescript
const getCandyMachineCreator = async (
  candyMachine: PublicKey
): Promise<[PublicKey, number]> =>
  PublicKey.findProgramAddress(
    [Buffer.from("candy_machine"), candyMachine.toBuffer()],
    CANDY_MACHINE_V2_PROGRAM
  );

const candyMachineCreator = await getCandyMachineCreator(candyMachineId);
getMintAddresses(candyMachineCreator[0]);

```

## 如何从钱包获取所有 NFT？

当从钱包获取所有 NFT 时，你需要获取所有的代币账户，然后解析出其中的 NFT。你可以使用 Metaplex JS 库中的 [`findDataByOwner`](https://github.com/metaplex-foundation/js/blob/248b61baf89a69b88f9a461e32b1cbd54a9b0a18/src/programs/metadata/accounts/Metadata.ts#L220-L236) 方法来完成这个过程。


```typescript
// typescript
const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");
const keypair = Keypair.generate();

const metaplex = new Metaplex(connection);
metaplex.use(keypairIdentity(keypair));

const owner = new PublicKey("2R4bHmSBHkHAskerTHE6GE1Fxbn31kaD5gHqpsPySVd7");
const allNFTs = await metaplex.nfts().findAllByOwner({ owner });

console.log(allNFTs);

```


## Candy Machine v2

Metaplex JS SDK 现在支持通过代码创建和更新Candy Machine v2。它使开发者能够与糖果机v2 程序进行交互，创建、更新和删除Candy Machine，并从中铸造（Mint） NFT。

### 如何创建Candy Machine


```typescript
// typescript
const { candyMachine } = await metaplex.candyMachinesV2().create({
  sellerFeeBasisPoints: 5, // 0.05% royalties
  price: sol(0.0001), // 0.0001 SOL
  itemsAvailable: toBigNumber(5), // 5 items available
});

/**
 * #1 Candy Machine ID - HSZxtWx6vgGWGsWu9SouXkHA2bAKCMtMZyMKzF2dvhrR
 */

```


### 如何删除Candy Machine


```typescript
// typescript
// creating a candy machine
const { candyMachine } = await metaplex.candyMachinesV2().create({
  sellerFeeBasisPoints: 5, // 0.05% royalties
  price: sol(0.0001), // 0.0001 SOL
  itemsAvailable: toBigNumber(5), // 5 items available
});

console.log(`Candy Machine ID - ${candyMachine.address.toString()}`);

// deleting the candy machine
const { response } = await metaplex.candyMachinesV2().delete({
  candyMachine,
});

```


### 如何通过权限查找Candy Machine

要查找所有权限为特定公钥的 Candy Machine，我们需要使用  [`findAllBy`](https://metaplex-foundation.github.io/js/classes/js.CandyMachinesV2Client.html#findAllBy) 函数，并将 `type` 参数设置为 `authority`。


```typescript
// typescript
const candyMachines = await metaplex.candyMachinesV2().findAllBy({
  type: "authority",
  publicKey: authority,
});

candyMachines.map((candyMachine, index) => {
  console.log(`#${index + 1} Candy Machine ID - ${candyMachine.address}`);
});

/**
 * #1 Candy Machine ID - HSZxtWx6vgGWGsWu9SouXkHA2bAKCMtMZyMKzF2dvhrR
 */

```

### 如何通过钱包地址查找Candy Machine

要通过钱包地址获取 Candy Machine 对象，我们需要使用 [`findAllBy`](https://metaplex-foundation.github.io/js/classes/js.CandyMachinesV2Client.html#findAllBy) 函数，并将 `type` 参数设置为 `wallet`。你可以从浏览器的 "Anchor data" 选项卡中获取 Candy Machine 的钱包地址。


```typescript
// typescript
const candyMachines = await metaplex.candyMachinesV2().findAllBy({
  type: "wallet",
  publicKey: wallet,
});

candyMachines.map((candyMachine, index) => {
  console.log(`#${index + 1} Candy Machine ID - ${candyMachine.address}`);
});

```

### 如何通过Candy Machine的地址查找它

要通过Candy Machine的地址查找Candy Machine，我们需要使用[`findByAddress`](https://metaplex-foundation.github.io/js/classes/js.CandyMachinesV2Client.html#findByAddress) 函数。


```typescript
// typescript
const candyMachine = await metaplex.candyMachinesV2().findByAddress({
  address: candyMachineId,
});

```

### 如何从Candy Machine找到铸造(mint)的 NFT


```typescript
// typescript
const candyMachine = await metaplex.candyMachinesV2().findMintedNfts({
  candyMachine: candyMachineId,
});

```

### 如何将物品插入到Candy Machine

```typescript
// typescript
await metaplex.candyMachines().insertItems({
  candyMachineId,
  items: [
    { name: "My NFT #1", uri: "https://example.com/nft1" },
    { name: "My NFT #2", uri: "https://example.com/nft2" },
    { name: "My NFT #3", uri: "https://example.com/nft3" },
  ],
});
```

### 如何从Candy Machine铸造(Mint)一个 NFT

默认情况下，铸造的 NFT 的所有者是`metaplex.identity().publicKey`。如果你希望将 NFT 铸造到其他钱包中，可以将新的钱包公钥与`newOwner`参数一起传递。


```typescript
// typescript
// by default, the owner of the minted nft would be `metaplex.identity().publicKey`. if you want to mint the nft to some other wallet, pass that public key along with the `newOwner` parameter
const candyMachine = await metaplex.candyMachinesV2().mint({
  candyMachine: candyMachineId,
  // newOwner: new PublicKey("some-other-public-key");
});
```
