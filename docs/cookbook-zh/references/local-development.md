# 本地开发

## 开启本地验证器

在本地测试验证器比在开发网络(devnet)上进行测试更可靠，并且可以帮助你在开发网络上运行之前进行测试。

你可以通过安装 [solana工具套件](/getting-started/installation.md#install-cli)
并运行以下命令来设置本地测试验证器：

```console
solana-test-validator
```

使用本地测试验证器的好处包括：

- 无RPC速率限制
- 无空投限制
- 直接在链上部署程序（`--bpf-program ...`）
- 从公共集群克隆账户，包括程序（`--clone ...`）
- 可配置的事务历史保留（`--limit-ledger-size ...`）
- 可配置的纪元长度（`--slots-per-epoch ...`）
- 跳转到任意槽位（`--warp-slot ...`）

## 连接到不同环境

当你进行Solana开发时，你需要连接到特定的RPC API端点。Solana有三个公共的开发环境：
- mainnet-beta https://api.mainnet-beta.solana.com
- devnet https://api.devnet.solana.com
- testnet https://api.testnet.solana.com

```ts
// typescript
const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");
```

```python
// python
client = Client("https://api.mainnet-beta.solana.com")
```

```cpp
// cpp
Connection connection("https://api.mainnet-beta.solana.com");
```

```rust
// rust
let rpc_url = String::from("https://api.mainnet-beta.solana.com");
let client = RpcClient::new_with_commitment(rpc_url, CommitmentConfig::confirmed());
```

```bash
# bash
solana config set --url https://api.mainnet-beta.solana.com
```

最后，你还可以连接到私有集群，无论是本地的还是远程运行的，使用以下方式：

```ts
// typescript
const connection = new Connection("http://127.0.0.1:8899", "confirmed");
```

```python
// python
client = Client("http://127.0.0.1:8899")
```

```cpp
// cpp
Connection connection("http://127.0.0.1:8899");
```

```rust
// rust
let rpc_url = String::from("http://127.0.0.1:8899");
let client = RpcClient::new_with_commitment(rpc_url, CommitmentConfig::confirmed());
```

```bash
# bash
solana config set --url http://privaterpc.com
```

## 订阅事件

Websockets提供了一种发布/订阅接口，你可以在其中监听特定的事件。与在固定时间间隔内对典型的HTTP端点进行轮询以获取频繁的更新不同，你可以仅在事件发生时才接收这些更新。

Solana的web3[`连接`](https://solana-labs.github.io/solana-web3.js/classes/Connection.html) 在底层生成一个websocket端点，并在创建新的`Connection`实例时注册一个websocket客户端（请参阅 [此处](https://github.com/solana-labs/solana-web3.js/blob/45923ca00e4cc1ed079d8e55ecbee83e5b4dc174/src/connection.ts#L2100)) 的源代码）。

`Connection`类提供了发布/订阅方法，它们都以`on`开头，类似于事件发射器。当您调用这些监听器方法时，它会在该`Connection`实例的websocket客户端中注册一个新的订阅。下面我们使用的示例发布/订阅方法是[`onAccountChange`](https://solana-labs.github.io/solana-web3.js/classes/Connection.html#onAccountChange)。 回调函数将通过参数提供更新的状态数据（例如，查看A[`AccountChangeCallback`](https://solana-labs.github.io/solana-web3.js/modules.html#AccountChangeCallback) 作为示例）。


```ts
// typescript
// Establish new connect to devnet - websocket client connected to devnet will also be registered here
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// Create a test wallet to listen to
const wallet = Keypair.generate();

// Register a callback to listen to the wallet (ws subscription)
connection.onAccountChange(
  wallet.publicKey(),
  (updatedAccountInfo, context) =>
    console.log("Updated account info: ", updatedAccountInfo),
  "confirmed"
);
```

```python
// python
async with connect("wss://api.devnet.solana.com") as websocket:
    # Create a Test Wallet
    wallet = Keypair()
    # Subscribe to the Test wallet to listen for events
    await websocket.account_subscribe(wallet.pubkey())
    # Capture response from account subscription
    first_resp = await websocket.recv()
    print("Subscription successful with id {}, listening for events \n".format(first_resp.result))
    updated_account_info = await websocket.recv()
    print(updated_account_info)
```

```cpp
// cpp
auto key_pair = Keypair::generate();

int subscriptionId = connection.on_account_change(key_pair.public_key, [&](Result<Account> result) {
    Account account = result.unwrap();
    std::cout << "owner = " << account.owner.to_base58() << std::endl;
    std::cout << "lamports = " << account.lamports << std::endl;
    std::cout << "data = " << account.data << std::endl;
    std::cout << "executable = " << (account.executable ? "true" : "false") << std::endl;
});

for (int i = 0; i < 10; i++) {
    connection.poll();
    sleep(1);
}

connection.remove_account_listener(subscriptionId);
```

```rust
// rust
let ws_url = String::from("wss://api.devnet.solana.com/");
let (mut client, receiver) = PubsubClient::account_subscribe(
    &ws_url,
    &pubkey,
    Some(RpcAccountInfoConfig {
        encoding: None,
        data_slice: None,
        commitment: Some(CommitmentConfig::confirmed()),
    }),
).unwrap();
let message = match receiver.recv().unwrap();
println!("{:?}", message)
```

## 获取测试用的SOL

你在本地工作时，为了发送交易，你需要一些 SOL。在非主网环境中，你可以向你的地址空投 SOL，获取SOL。


```ts
// typescript
const airdropSignature = await connection.requestAirdrop(
  keypair.publicKey,
  LAMPORTS_PER_SOL
);

await connection.confirmTransaction(airdropSignature);
```

```python
// python
#Input Airdrop amount in LAMPORTS
client.request_airdrop(wallet.pubkey(), 1000000000)

#Airdrops 1 SOL
```

```cpp
// cpp
connection.request_airdrop(key_pair.public_key).unwrap();
```

```rust
// rust
match client.request_airdrop(&pubkey, LAMPORTS_PER_SOL) {
    Ok(sig) => loop {
        if let Ok(confirmed) = client.confirm_transaction(&sig) {
            if confirmed {
                println!("Transaction: {} Status: {}", sig, confirmed);
                break;
            }
        }
    },
    Err(_) => println!("Error requesting airdrop"),
};
```

```bash
# cli
solana airdrop 1
```

## 使用主网 （Mainnet) 账户和程序

本地测试通常依赖于仅在主网上可用的程序和账户。Solana CLI 提供了以下两个功能：

*下载程序和账户
*将程序和账户加载到本地验证器中


### 如何从主网加载账户

可以将SRM代币的铸造(mint)账户下载到文件中：


```bash
solana account -u m --output json-compact --output-file SRM_token.json SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt
```

然后，通过在启动验证器时传递该账户文件和目标地址（在本地集群上）你可以将其加载到本地网络：


```bash
solana-test-validator --account SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt SRM_token.json --reset
```

### 如何从主网加载程序

同样地，我们可以下载Serum Dex v3程序：


```bash
solana program dump -u m 9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin serum_dex_v3.so
```

然后，在启动验证器时，通过传递程序的文件和目标地址（在本地集群上）来将其加载到本地网络：


```bash
solana-test-validator --bpf-program 9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin serum_dex_v3.so --reset
```
