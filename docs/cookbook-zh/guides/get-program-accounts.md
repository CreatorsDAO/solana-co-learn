# 获取程序帐户

一个返回程序所拥有的账户的RPC方法。目前不支持分页。请求`getProgramAccounts`应该包括`dataSlice`和/或`filters`参数，以提高响应时间并返回只有预期结果的内容。


> **tip 参数**
>
> - `programId`: `string` - 要查询的程序的公钥，以base58编码的字符串形式提供。
> - (可选) `configOrCommitment`: `object` - 包含以下可选字段的配置参数：
>     - (可选) `commitment`: `string` - [状态承诺/State commitment](https://docs.solana.com/developing/clients/jsonrpc-api#configuring-state-commitment)
>     - (可选) `encoding`: `string` - 账户数据的编码方式，可以是： `base58`, `base64`, 或 `jsonParsed`. 请注意 web3js 用户应改用 [getParsedProgramAccounts](https://solana-labs.github.io/solana-web3.js/classes/Connection.html#getParsedProgramAccounts)
>     - (可选) `dataSlice`: `object` - 根据以下内容限制返回的账户数据：
>         - `offset`: `number` - 开始返回账户数据的字节数
>         - `length`: `number` - 要返回的账户数据的字节数
>     - (可选) `filters`: `array` - 使用以下过滤器对象对结果进行过滤：
>         - `memcmp`: `object` - 将一系列字节与账户数据匹配：
>             - `offset`: `number` - 开始比较的账户数据字节偏移量
>             - `bytes`: `string` - 要匹配的数据，以base58编码的字符串形式，限制为129个字节
>         - `dataSize`: `number` - 将账户数据的长度与提供的数据大小进行比较
>     - (可选) `withContext`: `boolean` - 将结果包装在一个 [RpcResponse JSON object](https://docs.solana.com/developing/clients/jsonrpc-api#rpcresponse-structure)
>
> ##### 响应
>
> 默认情况下，`getProgramAccounts`将返回一个具有以下结构的 JSON 对象数组：
>
> - `pubkey`: `string` - 账户公钥，以 base58 编码的字符串形式
> - `account`: `object` - 一个包含以下子字段的 JSON 对象：
>     - `lamports`: `number`, 分配给账户的 lamports 数量
>     - `owner`: `string`, 账户所分配的程序的 base58 编码的公钥
>     - `data`: `string` | `object` - 与账户关联的数据，根据提供的编码参数，可以是编码的二进制数据或 JSON 格式 parameter
>     - `executable`: `boolean`, 指示账户是否包含着程序
>     - `rentEpoch`: `number`, 该账户下次需要支付租金的纪元（epoch）


## 深入

`getProgramAccounts` 是一个多功能的RPC方法，用于返回由程序拥有的所有账户。我们可以利用`getProgramAccounts`进行许多有用的查询，例如查找：

- 特定钱包的所有代币账户
- 特定代币发行的所有代币账户（即所有[SRM](https://www.projectserum.com/)持有人)
- 特定程序的所有自定义账户（即所有[Mango](https://mango.markets/)用户)

尽管`getProgramAccounts`非常有用，但由于目前的限制，它经常被误解。许多由`getProgramAccounts`支持的查询需要RPC节点扫描大量数据。这些扫描需要大量的内存和资源。因此，调用过于频繁或范围过大可能导致连接超时。此外，在撰写本文时，`getProgramAccounts`端点不支持分页。如果查询结果太大，响应将被截断。

为了解决当前的限制，`getProgramAccounts`提供了一些有用的参数，包括`dataSlice`和`filters`选项的`memcmp`和`dataSize`。通过提供这些参数的组合，我们可以将查询范围缩小到可管理和可预测的大小。

`getProgramAccounts`的一个常见示例涉及与[SPL-Token Program](https://spl.solana.com/token) 程序交互。仅使用基本调用请求由Token程序拥有的所有账户将涉及大量的数据。然而，通过提供参数，我们可以高效地请求我们要使用的数据。

### `filters`
与`getProgramAccounts`一起使用的最常见参数是`filters`数组。该数组接受两种类型的过滤器，即`dataSize`和`memcmp`。在使用这些过滤器之前，我们应该熟悉我们请求的数据的布局和序列化方式。

#### `dataSize`
在Token程序的情况下，我们可以看到[代币账户的长度为165个字节](https://github.com/solana-labs/solana-program-library/blob/08d9999f997a8bf38719679be9d572f119d0d960/token/program/src/state.rs#L86-L106)。 具体而言，一个代币账户有八个不同的字段，每个字段需要一定数量的字节。我们可以使用下面的示例图来可视化这些数据的布局。

![Account Size](./get-program-accounts/account-size.png)

如果我们想找到由我们的钱包地址拥有的所有代币账户，我们可以在`filters`数组中添加`{ dataSize: 165 }`来将查询范围缩小为仅限长度为165个字节的账户。然而，仅此还不够。我们还需要添加一个过滤器来查找由我们的地址拥有的账户。我们可以使用`memcmp`过滤器实现这一点。

#### `memcmp`
`memcmp`过滤器，也叫"内存比较"过滤器，允许我们比较存储在账户上的任何字段的数据。具体而言，我们可以查询仅与特定位置上的特定一组字节匹配的账户。`memcmp`需要两个参数：

- `offset`: 开始比较数据的位置。这个位置以字节为单位，表示为一个整数。
- `bytes`: 数据应该与账户的数据匹配。这表示为一个base58编码的字符串，应该限制在129个字节以下。

需要注意的是，`memcmp`只会返回与提供的`bytes`完全匹配的结果。目前，它不支持与提供的`bytes`相比小于或大于的比较。

继续使用我们的Token程序示例，我们可以修改查询，只返回由我们的钱包地址拥有的代币账户。观察代币账户时，我们可以看到存储在代币账户上的前两个字段都是公钥，而且每个公钥的长度为32个字节。鉴于`owner`是第二个字段，我们应该从`offset`为32字节的位置开始进行`memcmp`。从这里开始，我们将寻找owner字段与我们的钱包地址匹配的账户。

![Account Size](./get-program-accounts/memcmp.png)

我们可以通过以下实例来调用此查询：

#### Rust

```rust
use solana_client::{
  rpc_client::RpcClient,
  rpc_filter::{RpcFilterType, Memcmp, MemcmpEncodedBytes, MemcmpEncoding},
  rpc_config::{RpcProgramAccountsConfig, RpcAccountInfoConfig},
};
use solana_sdk::{commitment_config::CommitmentConfig, program_pack::Pack};
use spl_token::{state::{Mint, Account}};
use solana_account_decoder::{UiAccountEncoding};

fn main() {
  const MY_WALLET_ADDRESS: &str = "FriELggez2Dy3phZeHHAdpcoEXkKQVkv6tx3zDtCVP8T";

  let rpc_url = String::from("http://api.devnet.solana.com");
  let connection = RpcClient::new_with_commitment(rpc_url, CommitmentConfig::confirmed());

  let filters = Some(vec![
      RpcFilterType::Memcmp(Memcmp {
          offset: 32,
          bytes: MemcmpEncodedBytes::Base58(MY_WALLET_ADDRESS.to_string()),
          encoding: Some(MemcmpEncoding::Binary),
      }),
      RpcFilterType::DataSize(165),
  ]);

  let accounts = connection.get_program_accounts_with_config(
      &spl_token::ID,
      RpcProgramAccountsConfig {
          filters,
          account_config: RpcAccountInfoConfig {
              encoding: Some(UiAccountEncoding::Base64),
              commitment: Some(connection.commitment()),
              ..RpcAccountInfoConfig::default()
          },
          ..RpcProgramAccountsConfig::default()
      },
  ).unwrap();

  println!("Found {:?} token account(s) for wallet {MY_WALLET_ADDRESS}: ", accounts.len());

  for (i, account) in accounts.iter().enumerate() {
      println!("-- Token Account Address {:?}:  {:?} --", i, account.0);

      let mint_token_account = Account::unpack_from_slice(account.1.data.as_slice()).unwrap();
      println!("Mint: {:?}", mint_token_account.mint);

      let mint_account_data = connection.get_account_data(&mint_token_account.mint).unwrap();
      let mint = Mint::unpack_from_slice(mint_account_data.as_slice()).unwrap();
      println!("Amount: {:?}", mint_token_account.amount as f64 /10usize.pow(mint.decimals as u32) as f64);
  }
}

/*
// Output

Found 2 token account(s) for wallet FriELggez2Dy3phZeHHAdpcoEXkKQVkv6tx3zDtCVP8T:
-- Token Account Address 0:  H12yCcKLHFJFfohkeKiN8v3zgaLnUMwRcnJTyB4igAsy --
Mint: CKKDsBT6KiT4GDKs3e39Ue9tDkhuGUKM3cC2a7pmV9YK
Amount: 1.0
-- Token Account Address 1:  Et3bNDxe2wP1yE5ao6mMvUByQUHg8nZTndpJNvfKLdCb --
Mint: BUGuuhPsHpk8YZrL2GctsCtXGneL1gmT5zYb7eMHZDWf
Amount: 3.0
*/
```

#### typescript

```typescript
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { clusterApiUrl, Connection } from "@solana/web3.js";

(async () => {
  const MY_WALLET_ADDRESS = "FriELggez2Dy3phZeHHAdpcoEXkKQVkv6tx3zDtCVP8T";
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  const accounts = await connection.getParsedProgramAccounts(
    TOKEN_PROGRAM_ID, // new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
    {
      filters: [
        {
          dataSize: 165, // number of bytes
        },
        {
          memcmp: {
            offset: 32, // number of bytes
            bytes: MY_WALLET_ADDRESS, // base58 encoded string
          },
        },
      ],
    }
  );

  console.log(
    `Found ${accounts.length} token account(s) for wallet ${MY_WALLET_ADDRESS}: `
  );
  accounts.forEach((account, i) => {
    console.log(
      `-- Token Account Address ${i + 1}: ${account.pubkey.toString()} --`
    );
    console.log(`Mint: ${account.account.data["parsed"]["info"]["mint"]}`);
    console.log(
      `Amount: ${account.account.data["parsed"]["info"]["tokenAmount"]["uiAmount"]}`
    );
  });
  /*
    // Output

    Found 2 token account(s) for wallet FriELggez2Dy3phZeHHAdpcoEXkKQVkv6tx3zDtCVP8T:
    -- Token Account Address 0:  H12yCcKLHFJFfohkeKiN8v3zgaLnUMwRcnJTyB4igAsy --
    Mint: CKKDsBT6KiT4GDKs3e39Ue9tDkhuGUKM3cC2a7pmV9YK
    Amount: 1
    -- Token Account Address 1:  Et3bNDxe2wP1yE5ao6mMvUByQUHg8nZTndpJNvfKLdCb --
    Mint: BUGuuhPsHpk8YZrL2GctsCtXGneL1gmT5zYb7eMHZDWf
    Amount: 3
  */
})();
```

#### curl

```bash
curl http://api.mainnet-beta.solana.com -X POST -H "Content-Type: application/json" -d '
  {
    "jsonrpc": "2.0",
    "id": 1,
    "method": "getProgramAccounts",
    "params": [
      "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
      {
        "encoding": "jsonParsed",
        "filters": [
          {
            "dataSize": 165
          },
          {
            "memcmp": {
              "offset": 32,
              "bytes": "FriELggez2Dy3phZeHHAdpcoEXkKQVkv6tx3zDtCVP8T"
            }
          }
        ]
      }
    ]
  }
'

# Output:
# {
#   "jsonrpc": "2.0",
#   "result": [
#     {
#       "account": {
#         "data": {
#           "parsed": {
#             "info": {
#               "isNative": false,
#               "mint": "BUGuuhPsHpk8YZrL2GctsCtXGneL1gmT5zYb7eMHZDWf",
#               "owner": "FriELggez2Dy3phZeHHAdpcoEXkKQVkv6tx3zDtCVP8T",
#               "state": "initialized",
#               "tokenAmount": {
#                 "amount": "998999999000000000",
#                 "decimals": 9,
#                 "uiAmount": 998999999,
#                 "uiAmountString": "998999999"
#               }
#             },
#             "type": "account"
#           },
#           "program": "spl-token",
#           "space": 165
#         },
#         "executable": false,
#         "lamports": 2039280,
#         "owner": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
#         "rentEpoch": 313
#       },
#       "pubkey": "Et3bNDxe2wP1yE5ao6mMvUByQUHg8nZTndpJNvfKLdCb"
#     }
#   ],
#   "id": 1
# }
```

### `dataSlice`

除了上面提到的两个过滤器参数以外，`getProgramAccounts`的第三个最常见参数是`dataSlice`。与`filters`参数不同，`dataSlice`不会减少查询返回的账户数量。`dataSlice`将限制的是每个账户的数据量。

与`memcmp`类似，`dataSlice`接受两个参数：

- `offset`: 开始返回账户数据的位置（以字节为单位）
- `length`: 应该返回的字节数

在处理大型数据集但实际上不关心账户数据本身时，`dataSlice`特别有用。例如，如果我们想找到特定代币发行的代币账户数量（即代币持有者数量），就可以使用`dataSlice`。

#### JavaScript

```typescript
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { clusterApiUrl, Connection } from "@solana/web3.js";

(async () => {
  const MY_TOKEN_MINT_ADDRESS = "BUGuuhPsHpk8YZrL2GctsCtXGneL1gmT5zYb7eMHZDWf";
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  const accounts = await connection.getProgramAccounts(
    TOKEN_PROGRAM_ID, // new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
    {
      dataSlice: {
        offset: 0, // number of bytes
        length: 0, // number of bytes
      },
      filters: [
        {
          dataSize: 165, // number of bytes
        },
        {
          memcmp: {
            offset: 0, // number of bytes
            bytes: MY_TOKEN_MINT_ADDRESS, // base58 encoded string
          },
        },
      ],
    }
  );
  console.log(
    `Found ${accounts.length} token account(s) for mint ${MY_TOKEN_MINT_ADDRESS}`
  );
  console.log(accounts);

  /*
  // Output (notice the empty <Buffer > at acccount.data)

  Found 3 token account(s) for mint BUGuuhPsHpk8YZrL2GctsCtXGneL1gmT5zYb7eMHZDWf
  [
    {
      account: {
        data: <Buffer >,
        executable: false,
        lamports: 2039280,
        owner: [PublicKey],
        rentEpoch: 228
      },
      pubkey: PublicKey {
        _bn: <BN: a8aca7a3132e74db2ca37bfcd66f4450f4631a5464b62fffbd83c48ef814d8d7>
      }
    },
    {
      account: {
        data: <Buffer >,
        executable: false,
        lamports: 2039280,
        owner: [PublicKey],
        rentEpoch: 228
      },
      pubkey: PublicKey {
        _bn: <BN: ce3b7b906c2ff6c6b62dc4798136ec017611078443918b2fad1cadff3c2e0448>
      }
    },
    {
      account: {
        data: <Buffer >,
        executable: false,
        lamports: 2039280,
        owner: [PublicKey],
        rentEpoch: 228
      },
      pubkey: PublicKey {
        _bn: <BN: d4560e42cb24472b0e1203ff4b0079d6452b19367b701643fa4ac33e0501cb1>
      }
    }
  ]
  */
})();
```

#### rust

```rust
use solana_client::{
  rpc_client::RpcClient,
  rpc_filter::{RpcFilterType, Memcmp, MemcmpEncodedBytes, MemcmpEncoding},
  rpc_config::{RpcProgramAccountsConfig, RpcAccountInfoConfig},
};
use solana_sdk::{commitment_config::CommitmentConfig};
use solana_account_decoder::{UiAccountEncoding, UiDataSliceConfig};

pub fn main() {
  const MY_TOKEN_MINT_ADDRESS: &str = "BUGuuhPsHpk8YZrL2GctsCtXGneL1gmT5zYb7eMHZDWf";

  let rpc_url = String::from("http://api.devnet.solana.com");
  let connection = RpcClient::new_with_commitment(rpc_url, CommitmentConfig::confirmed());

  let filters = Some(vec![
      RpcFilterType::Memcmp(Memcmp {
          offset: 0, // number of bytes
          bytes: MemcmpEncodedBytes::Base58(MY_TOKEN_MINT_ADDRESS.to_string()),
          encoding: Some(MemcmpEncoding::Binary),
      }),
      RpcFilterType::DataSize(165), // number of bytes
  ]);

  let accounts = connection.get_program_accounts_with_config(
      &spl_token::ID,
      RpcProgramAccountsConfig {
          filters,
          account_config: RpcAccountInfoConfig {
              data_slice: Some(UiDataSliceConfig {
                  offset: 0, // number of bytes
                  length: 0, // number of bytes
              }),
              encoding: Some(UiAccountEncoding::Base64),
              commitment: Some(connection.commitment()),
              ..RpcAccountInfoConfig::default()
          },
          ..RpcProgramAccountsConfig::default()
      },
  ).unwrap();

  println!("Found {:?} token account(s) for mint {MY_TOKEN_MINT_ADDRESS}: ", accounts.len());
  println!("{:#?}", accounts);
}

/*
// Output (notice the empty <Buffer > at acccount.data)

Found 3 token account(s) for mint BUGuuhPsHpk8YZrL2GctsCtXGneL1gmT5zYb7eMHZDWf:
[
  (
      tofD3NzLfZ5pWG91JcnbfsAbfMcFF2SRRp3ChnjeTcL,
      Account {
          lamports: 2039280,
          data.len: 0,
          owner: TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA,
          executable: false,
          rent_epoch: 319,
      },
  ),
  (
      CMSC2GeWDsTPjfnhzCZHEqGRjKseBhrWaC2zNcfQQuGS,
      Account {
          lamports: 2039280,
          data.len: 0,
          owner: TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA,
          executable: false,
          rent_epoch: 318,
      },
  ),
  (
      Et3bNDxe2wP1yE5ao6mMvUByQUHg8nZTndpJNvfKLdCb,
      Account {
          lamports: 2039280,
          data.len: 0,
          owner: TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA,
          executable: false,
          rent_epoch: 318,
      },
  ),
]
*/
```

### curl

```bash
# Note: encoding only available for "base58", "base64" or "base64+zstd"
curl http://api.mainnet-beta.solana.com -X POST -H "Content-Type: application/json" -d '
  {
    "jsonrpc": "2.0",
    "id": 1,
    "method": "getProgramAccounts",
    "params": [
      "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
      {
        "encoding": "base64",
        "dataSlice": {
          "offset": 0,
          "length": 0
        },
        "filters": [
          {
            "dataSize": 165
          },
          {
            "memcmp": {
              "offset": 0,
              "bytes": "BUGuuhPsHpk8YZrL2GctsCtXGneL1gmT5zYb7eMHZDWf"
            }
          }
        ]
      }
    ]
  }
'

# Output:
# {
#   "jsonrpc": "2.0",
#   "result": [
#     {
#       "account": {
#         "data": [
#           "",
#           "base64"
#         ],
#         "executable": false,
#         "lamports": 2039280,
#         "owner": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
#         "rentEpoch": 313
#       },
#       "pubkey": "FqWyVSLQgyRWyG1FuUGtHdTQHrEaBzXh1y9K6uPVTRZ4"
#     },
#     {
#       "account": {
#         "data": [
#           "",
#           "base64"
#         ],
#         "executable": false,
#         "lamports": 2039280,
#         "owner": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
#         "rentEpoch": 314
#       },
#       "pubkey": "CMSC2GeWDsTPjfnhzCZHEqGRjKseBhrWaC2zNcfQQuGS"
#     },
#     {
#       "account": {
#         "data": [
#           "",
#           "base64"
#         ],
#         "executable": false,
#         "lamports": 2039280,
#         "owner": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
#         "rentEpoch": 314
#       },
#       "pubkey": "61NfACb21WvuEzxyiJoxBrivpiLQ79gLBxzFo85BiJ2U"
#     },
#     {
#       "account": {
#         "data": [
#           "",
#           "base64"
#         ],
#         "executable": false,
#         "lamports": 2039280,
#         "owner": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
#         "rentEpoch": 313
#       },
#       "pubkey": "Et3bNDxe2wP1yE5ao6mMvUByQUHg8nZTndpJNvfKLdCb"
#     }
#   ],
#   "id": 1
# }
```

通过组合这三个参数（`dataSlice`、`dataSize`和`memcmp`），我们可以限制查询的范围，并高效地返回我们想要的数据。

## 其他资料

- [RPC API Documentation](https://docs.solana.com/developing/clients/jsonrpc-api#getprogramaccounts)
- [Web3js Documentation](https://solana-labs.github.io/solana-web3.js/classes/Connection.html#getProgramAccounts)
- [JSON-parsed Web3js Documentation](https://solana-labs.github.io/solana-web3.js/classes/Connection.html#getParsedProgramAccounts)
