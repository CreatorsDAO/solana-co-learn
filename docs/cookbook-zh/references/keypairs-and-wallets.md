# 密钥对和钱包

## 如何生成新的密钥对

对于使用Solana库执行各种操作，许多操作都需要一个密钥对或钱包。如果你正在连接到一个钱包，那么你不必担心。然而，如果你需要一个密钥对，你会需要生成一个。


```ts
// typescript
let keypair = Keypair.generate();
```

```python
// python
keypair = Keypair()
```

```cpp
// cpp
auto key_pair = Keypair::generate();
```

```rust
// rust
let wallet = Keypair::new();
```

```bash
// cli
solana-keygen new
```

## 如何从密钥恢复密钥对

如果你已经有了密钥，你可以通过这个密钥获取密钥对，以测试你的dApp。

1. 从字节中：


```typescript
// typescript
const keypair = Keypair.fromSecretKey(
  Uint8Array.from([
    174, 47, 154, 16, 202, 193, 206, 113, 199, 190, 53, 133, 169, 175, 31, 56,
    222, 53, 138, 189, 224, 216, 117, 173, 10, 149, 53, 45, 73, 251, 237, 246,
    15, 185, 186, 82, 177, 240, 148, 69, 241, 227, 167, 80, 141, 89, 240, 121,
    121, 35, 172, 247, 68, 251, 226, 218, 48, 63, 176, 109, 168, 89, 238, 135,
  ])
);

```

```python
// python
secret_key= [
        174, 47, 154, 16, 202, 193, 206, 113, 199, 190, 53, 133, 169, 175, 31, 56, 222, 53, 138,
        189, 224, 216, 117, 173, 10, 149, 53, 45, 73, 251, 237, 246, 15, 185, 186, 82, 177, 240,
        148, 69, 241, 227, 167, 80, 141, 89, 240, 121, 121, 35, 172, 247, 68, 251, 226, 218, 48,
        63, 176, 109, 168, 89, 238, 135,
    ]

keypair = Keypair.from_bytes(secret_key)

```

```cpp
// cpp
const uint8_t secret_key[] = {
174, 47, 154, 16, 202, 193, 206, 113, 199, 190, 53, 133, 169, 175, 31, 56, 222, 53, 138,
189, 224, 216, 117, 173, 10, 149, 53, 45, 73, 251, 237, 246, 15, 185, 186, 82, 177, 240,
148, 69, 241, 227, 167, 80, 141, 89, 240, 121, 121, 35, 172, 247, 68, 251, 226, 218, 48,
63, 176, 109, 168, 89, 238, 135,
};
Keypair key_pair = Keypair::from_seed(secret_key);

```

```rust
// rust
let secret_key: [u8; 64] = [
    174, 47, 154, 16, 202, 193, 206, 113, 199, 190, 53, 133, 169, 175, 31, 56, 222, 53, 138,
    189, 224, 216, 117, 173, 10, 149, 53, 45, 73, 251, 237, 246, 15, 185, 186, 82, 177, 240,
    148, 69, 241, 227, 167, 80, 141, 89, 240, 121, 121, 35, 172, 247, 68, 251, 226, 218, 48,
    63, 176, 109, 168, 89, 238, 135,
];

let wallet = Keypair::from_bytes(&secret_key)?;

```

```bash
// cli
# input your secret into the Keypath listed under solana config get

```

2. 从Base58字符串：


```typescript
// typescript
const keypair = Keypair.fromSecretKey(
  bs58.decode(
    "5MaiiCavjCmn9Hs1o3eznqDEhRwxo7pXiAYez7keQUviUkauRiTMD8DrESdrNjN8zd9mTmVhRvBJeg5vhyvgrAhG"
  )
);

```

```python
// python
b58_string = "5MaiiCavjCmn9Hs1o3eznqDEhRwxo7pXiAYez7keQUviUkauRiTMD8DrESdrNjN8zd9mTmVhRvBJeg5vhyvgrAhG"
keypair = Keypair.from_string(b58_string)

```


```rust
// rust
let wallet = Keypair::from_base58_string(
    "5MaiiCavjCmn9Hs1o3eznqDEhRwxo7pXiAYez7keQUviUkauRiTMD8DrESdrNjN8zd9mTmVhRvBJeg5vhyvgrAhG",
);

```


## 如何验证密钥对

如果你有了个密钥对，你可以验证密钥对的私钥是否与给定的公钥匹配。


```typescript
// typescript
const publicKey = new PublicKey("24PNhTaNtomHhoy3fTRaMhAFCRj4uHqhZEEoWrKDbR5p");
const keypair = Keypair.fromSecretKey(
  Uint8Array.from([
    174, 47, 154, 16, 202, 193, 206, 113, 199, 190, 53, 133, 169, 175, 31, 56,
    222, 53, 138, 189, 224, 216, 117, 173, 10, 149, 53, 45, 73, 251, 237, 246,
    15, 185, 186, 82, 177, 240, 148, 69, 241, 227, 167, 80, 141, 89, 240, 121,
    121, 35, 172, 247, 68, 251, 226, 218, 48, 63, 176, 109, 168, 89, 238, 135,
  ])
);
console.log(keypair.publicKey.toBase58() === publicKey.toBase58());
// true

```

```python
// python
public_key = Pubkey.from_string("24PNhTaNtomHhoy3fTRaMhAFCRj4uHqhZEEoWrKDbR5p")

keys = [
        174, 47, 154, 16, 202, 193, 206, 113, 199, 190, 53, 133, 169, 175, 31, 56, 222, 53, 138,
        189, 224, 216, 117, 173, 10, 149, 53, 45, 73, 251, 237, 246, 15, 185, 186, 82, 177, 240,
        148, 69, 241, 227, 167, 80, 141, 89, 240, 121, 121, 35, 172, 247, 68, 251, 226, 218, 48,
        63, 176, 109, 168, 89, 238, 135,
    ]
keypair = Keypair.from_bytes(keys)

print(keypair.pubkey() == public_key)
# True

```

```cpp
// cpp
PublicKey public_key = PublicKey("24PNhTaNtomHhoy3fTRaMhAFCRj4uHqhZEEoWrKDbR5p");

const uint8_t bytes[] = {
174, 47, 154, 16, 202, 193, 206, 113, 199, 190, 53, 133, 169, 175, 31, 56, 222, 53, 138,
189, 224, 216, 117, 173, 10, 149, 53, 45, 73, 251, 237, 246, 15, 185, 186, 82, 177, 240,
148, 69, 241, 227, 167, 80, 141, 89, 240, 121, 121, 35, 172, 247, 68, 251, 226, 218, 48,
63, 176, 109, 168, 89, 238, 135,
};
Keypair key_pair = Keypair::from_seed(bytes);

std::cout << (public_key.to_base58() == key_pair.public_key.to_base58()) << std::endl;
// 1

```


```bash
// cli
solana-keygen verify <PUBKEY> prompt://

```

## 如何检查一个公钥是否有关联的私钥

在某些特殊情况下（例如，派生自程序的地址(PDA)），公钥可能没有关联的私钥。你可以通过查看公钥是否位于ed25519曲线上来检查这一点。只有位于曲线上的公钥才可以由具有钱包的用户控制。

```typescript
// typescript
const key = new PublicKey("5oNDL3swdJJF1g9DzJiZ4ynHXgszjAEpUkxVYejchzrY");
console.log(PublicKey.isOnCurve(key.toBytes()));

```

```python
// python
key = Pubkey.from_string('5oNDL3swdJJF1g9DzJiZ4ynHXgszjAEpUkxVYejchzrY')
print(key.is_on_curve())

```

```cpp
// cpp
auto public_key = PublicKey("5oNDL3swdJJF1g9DzJiZ4ynHXgszjAEpUkxVYejchzrY");
std::cout << public_key.is_on_curve() << std::endl;

```

```rust
// rust
let pubkey = Pubkey::from_str("5oNDL3swdJJF1g9DzJiZ4ynHXgszjAEpUkxVYejchzrY").unwrap();
println!("{:?}", pubkey.is_on_curve())

```


## 如何生成助记词

如果你正在创建一个钱包，你需要生成一个助记词，以便用户可以将其保存为备份。


```typescript
// typescript
const mnemonic = bip39.generateMnemonic();

```

```python
// python
mnemo = Mnemonic("english")
words = mnemo.generate(strength=256)

```


```bash
// cli
solana-keygen new

```

## 如何通过助记词恢复密钥对

许多钱包扩展使用助记词来表示其密钥。你可以将助记词转换为密钥对以进行本地测试。

1. BIP39 - 创建单个钱包的步骤如下：


```typescript
// typescript
const mnemonic =
  "pill tomorrow foster begin walnut borrow virtual kick shift mutual shoe scatter";
const seed = bip39.mnemonicToSeedSync(mnemonic, ""); // (mnemonic, password)
const keypair = Keypair.fromSeed(seed.slice(0, 32));

```

```python
// python
mnemo = Mnemonic("english")
seed = mnemo.to_seed("pill tomorrow foster begin walnut borrow virtual kick shift mutual shoe scatter")
keypair = Keypair.from_bytes(seed)

```


```bash
// cli
solana-keygen recover

```

2. BIP44 （多个钱包，也叫HD钱包）

你可以从一个单一种子生成多个钱包，也被称为“分层确定性钱包”或HD钱包。

```typescript
// typescript
const mnemonic =
  "neither lonely flavor argue grass remind eye tag avocado spot unusual intact";
const seed = bip39.mnemonicToSeedSync(mnemonic, ""); // (mnemonic, password)
for (let i = 0; i < 10; i++) {
  const path = `m/44'/501'/${i}'/0'`;
  const keypair = Keypair.fromSeed(derivePath(path, seed.toString("hex")).key);
  console.log(`${path} => ${keypair.publicKey.toBase58()}`);
}

```

```bash
// cli
solana-keygen recover 'prompt:?key=0/0'

```

## 如何生成自定义地址(vanity address)

自定义公钥或地址（Vanity Address）是以特定字符开头的密钥。例如，一个人可能希望公钥以 "elv1s" 或 "cook" 开头，这样可以帮助他人记住密钥所属的人，使密钥更容易识别。

注意: 自定义地址中字符的数量越多，生成时间将会更长。

> **警告**
> 在此任务中，您应该使用命令行界面（CLI）。Python和TypeScript的示例仅用于说明，速度比CLI慢得多。


```typescript
// typescript
let keypair = Keypair.generate();
while (!keypair.publicKey.toBase58().startsWith("elv1s")) {
  keypair = Keypair.generate();
}

```

```python
// python
keypair = Keypair()
while(str(keypair.pubkey())[:5]!="elv1s") :
    keypair = Keypair()

```

```cpp
// cpp
auto key_pair = Keypair::generate();
while (key_pair.public_key.to_base58().substr(0, 5) != "elv1s") {
    key_pair = Keypair::generate();
}

```

```bash
// cli
solana-keygen grind --starts-with e1v1s:1

```

## 如何使用钱包来签名和验证消息

密钥对的主要功能是对消息进行签名并验证签名的有效性。通过验证签名，接收方可以确保数据是由特定私钥的所有者签名的。

为此，我们将导入[TweetNaCl][1] 密码库，并按照以下步骤进行操作：


```typescript
// typescript
const message = "The quick brown fox jumps over the lazy dog";
const messageBytes = decodeUTF8(message);

const signature = nacl.sign.detached(messageBytes, keypair.secretKey);
const result = nacl.sign.detached.verify(
  messageBytes,
  signature,
  keypair.publicKey.toBytes()
);

console.log(result);

```

```python
// python
message = b"The quick brown fox jumps over the lazy dog"
signature = keypair.sign_message(message)
verify_sign = signature.verify(keypair.pubkey(), message)

print(verify_sign) # bool

```


[1]: https://www.npmjs.com/package/tweetnacl

## 如何连接到钱包

Solana的[钱包适配器](https://github.com/solana-labs/wallet-adapter) 库使客户端管理钱包连接变得简单。

### 反应

运行以下命令来安装所需的依赖项：

```/bin/bash
yarn add @solana/wallet-adapter-react @solana/wallet-adapter-react-ui @solana/wallet-adapter-base @solana/wallet-adapter-wallets
```

React的钱包适配器库允许我们通过钩子和上下文提供程序来持久化和访问钱包连接状态，主要包括`useWallet、WalletProvider`、`useConnection和ConnectionProvider`。`WalletProvider`和`ConnectionProvider`必须包装React应用程。

此外，我们可以使用`useWalletModal`来提示用户进行连接，通过切换连接模态框的可见性，并将应用程序包装在`@solana/wallet-adapter-react-ui`中的`WalletModalProvider`中。连接模态框将处理连接流程，因此我们只需监听钱包连接的状态。当`useWallet`的响应具有非空的`wallet`属性时，我们知道钱包已连接。反之，如果该属性为空，我们知道钱包已断开连接。

```typescript
// typescript
const { wallet } = useWallet();
const { setVisible } = useWalletModal();

const onRequestConnectWallet = () => {
  setVisible(true);
};

// Prompt the user to connect their wallet
if (!wallet) {
  return <button onClick={onRequestConnectWallet}>Connect Wallet</button>;
}

// Displays the connected wallet address
return (
  <main>
    <p>Wallet successfully connected!</p>
    <p>{wallet.publicKey.toBase58()}</p>
  </main>
);

```


### Vue

运行以下命令来安装所需的依赖项：

```/bin/bash
npm install solana-wallets-vue @solana/wallet-adapter-wallets
```

[Solana的Vue钱包](https://github.com/lorisleiva/solana-wallets-vue) 插件允许我们初始化钱包存储，并创建一个名为`$wallet`的全局属性，可以在任何组件中访问。你可以在[此处](https://github.com/lorisleiva/solana-wallets-vue#usewallet-references) 查看可以从`useWallet()`获取的所有属性和方法。我们还导入并渲染WalletMultiButton组件，以允许用户选择钱包并连接到它。


```typescript
// typescript
<script setup>
import { WalletMultiButton } from "solana-wallets-vue";
</script>

<template>
  <wallet-multi-button></wallet-multi-button>
</template>

```

### Svelte

运行以下命令来安装所需的依赖项：

```/bin/bash
npm install @svelte-on-solana/wallet-adapter-core @svelte-on-solana/wallet-adapter-ui @solana/wallet-adapter-base @solana/wallet-adapter-wallets @solana/web3.js
```

[Svelte Wallet Adapter](https://github.com/svelte-on-solana/wallet-adapter) 包允许我们在使用Svelte模板或SvelteKit创建的项目中，在所有JS、TS或/和Svelte文件之间添加一个可访问的Svelte Store（`$walletStore`）。使用 [此处](https://github.com/svelte-on-solana/wallet-adapter/blob/master/packages/core/README.md/) 的存储库引用，您可以在SSR或SPA中使用适配器。UI包含一个`<WalletMultiButton />`组件，允许用户选择一个钱包并连接到它。


```typescript
// typescript
<script>
  import { walletStore } from "@svelte-on-solana/wallet-adapter-core";
  import { WalletMultiButton } from "@svelte-on-solana/wallet-adapter-ui";
</script>

{#if $walletStore?.connected} Wallet with public key {$walletStore.publicKey}
successfully connected! {:else}
<WalletMultiButton />
{/if}

```
