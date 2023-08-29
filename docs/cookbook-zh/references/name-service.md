# 命名服务

## 名称注册表

名称注册表存储与域名有关的信息。它由两部分组成：

- 头部 (Header)
- 数据 (Data)

域名的数据始终以头部为前缀。以下是头部在 JavaScript 中的结构：


```typescript
// typescript
export class NameRegistryState {
  parentName: PublicKey;
  owner: PublicKey;
  class: PublicKey;
  data: Buffer | undefined;

  static HEADER_LEN = 96;

  static schema: Schema = new Map([
    [
      NameRegistryState,
      {
        kind: "struct",
        fields: [
          ["parentName", [32]],
          ["owner", [32]],
          ["class", [32]],
        ],
      },
    ],
  ]);
  constructor(obj: {
    parentName: Uint8Array;
    owner: Uint8Array;
    class: Uint8Array;
  }) {
    this.parentName = new PublicKey(obj.parentName);
    this.owner = new PublicKey(obj.owner);
    this.class = new PublicKey(obj.class);
  }
}

```

## 解析SOL域名

.SOL 域名是独特的、易于理解的域名，可以转换为公钥。许多钱包使用它们作为发送代币或 SOL 的另一种选项。你可以使用以下方法将 .SOL 域名转换为对应的公钥：


```typescript
// typescript
const domain = "levi.sol";
const hashedName = await getHashedName(domain.replace(".sol", ""));
const nameAccountKey = await getNameAccountKey(
  hashedName,
  undefined,
  new PublicKey("58PwtjSDuFHuUkYjH9BYnnQKHfwo9reZhC2zMJv9JPkx") // SOL TLD Authority
);
const owner = await NameRegistryState.retrieve(
  new Connection(clusterApiUrl("mainnet-beta")),
  nameAccountKey
);
console.log(owner.registry.owner.toBase58());
// JUskoxS2PTiaBpxfGaAPgf3cUNhdeYFGMKdL6mZKKfR

```


## 反向查找

这可以用于从公钥解析域名。


```typescript
// typescript
// Public key of bonfida.sol
const domainKey = new PublicKey("Crf8hzfthWGbGbLTVCiqRqV5MVnbpHB1L9KQMd6gsinb");

const domainName = await performReverseLookup(connection, domainKey); // bonfida

```


## 子域名查找

为了解析一个子域名，你需要：

1. 域名的密钥
2. 域名的密钥
3. 检索账户信息

```typescript
// typescript
const parentDomain = "bonfida";
const subDomain = "demo";

// Step 1
const hashedParentDomain = await getHashedName(parentDomain);
const parentDomainKey = await getNameAccountKey(
  hashedParentDomain,
  undefined,
  SOL_TLD_AUTHORITY
);

// Step 2
const subDomainKey = await getDNSRecordAddress(parentDomainKey, subDomain);

// Step 3
const registry = await NameRegistryState.retrieve(connection, subDomainKey);

```

## 查找由公钥拥有的所有域名

你可以通过使用带有`memcmp`过滤器的`getProgramAccounts`请求来检索钱包的所有域名。

```typescript
// typescript
export async function findOwnedNameAccountsForUser(
  connection: Connection,
  userAccount: PublicKey
): Promise<PublicKey[]> {
  const filters = [
    {
      memcmp: {
        offset: 32,
        bytes: userAccount.toBase58(),
      },
    },
  ];
  const accounts = await connection.getProgramAccounts(NAME_PROGRAM_ID, {
    filters,
  });
  return accounts.map((a) => a.publicKey);
}

```


## 解析一个Twitter用户名

Twitter用户名可以在 [Solana名称服务上注册](https://naming.bonfida.org/#/twitter-registration 并可以像.SOL域名一样使用。

```typescript
// typescript
// Pubkey of the wallet you want to retrieve the Twitter handle
const pubkey = new PublicKey("FidaeBkZkvDqi1GXNEwB8uWmj9Ngx2HXSS5nyGRuVFcZ");

const [handle, registryKey] = await getHandleAndRegistryKey(connection, pubkey);

```

## Twitter用户名的反向查找

为了找到与Twitter用户名相关联的SOL地址，你可以进行反向查找。

```typescript
// typescript
const handle = "bonfida";

const registry = await getTwitterRegistry(connection, handle);

```
