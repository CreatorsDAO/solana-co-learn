---
title: 质押
sidebar_position: 21
tags:
  - solana-cook-book
  - staking
---

# 质押

## 获取当前验证器

我们可以质押 SOL 并通过帮助保护网络来获得奖励。要进行质押，我们将 SOL 委托给验证器，而验证器则处理交易。


```typescript
// typescript
import { clusterApiUrl, Connection } from "@solana/web3.js";

(async () => {
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  // Get all validators, categorized by current (i.e. active) and deliquent (i.e. inactive)
  const { current, delinquent } = await connection.getVoteAccounts();
  console.log("current validators: ", current);
  console.log("all validators: ", current.concat(delinquent));
})();
```


```bash
// cli
solana validators
```

## 创建质押账户

所有的质押指令由[质押程序 (Stake Program)](https://docs.solana.com/developing/runtime-facilities/programs#stake-program) 处理。首先，我们创建一个[质押账户](https://docs.solana.com/staking/stake-accounts)， 该账户与标准[系统账户](./accounts.mdx#create-a-system-account)创建和管理方式不同。特别是，我们需要设置账户的`Stake Authority`和`Withdrawal Authority`。


```typescript
// typescript
// Setup a transaction to create our stake account
// Note: `StakeProgram.createAccount` returns a `Transaction` preconfigured with the necessary `TransactionInstruction`s
const createStakeAccountTx = StakeProgram.createAccount({
  authorized: new Authorized(wallet.publicKey, wallet.publicKey), // Here we set two authorities: Stake Authority and Withdrawal Authority. Both are set to our wallet.
  fromPubkey: wallet.publicKey,
  lamports: amountToStake,
  lockup: new Lockup(0, 0, wallet.publicKey), // Optional. We'll set this to 0 for demonstration purposes.
  stakePubkey: stakeAccount.publicKey,
});

const createStakeAccountTxId = await sendAndConfirmTransaction(
  connection,
  createStakeAccountTx,
  [
    wallet,
    stakeAccount, // Since we're creating a new stake account, we have that account sign as well
  ]
);
console.log(`Stake account created. Tx Id: ${createStakeAccountTxId}`);

// Check our newly created stake account balance. This should be 0.5 SOL.
let stakeBalance = await connection.getBalance(stakeAccount.publicKey);
console.log(`Stake account balance: ${stakeBalance / LAMPORTS_PER_SOL} SOL`);

// Verify the status of our stake account. This will start as inactive and will take some time to activate.
let stakeStatus = await connection.getStakeActivation(stakeAccount.publicKey);
console.log(`Stake account status: ${stakeStatus.state}`);

```


## 委托质押

一旦质押账户得到资金支持，`Stake Authority`可以将其委托给一个验证者。每个质押账户一次只能委托给一个验证者。此外，账户中的所有代币必须要么被委托，要么取消委托。一旦委托成功，质押账户需要经过几个时期才能变为活跃状态。


```typescript
// typescript
// With a validator selected, we can now setup a transaction that delegates our stake to their vote account.
const delegateTx = StakeProgram.delegate({
  stakePubkey: stakeAccount.publicKey,
  authorizedPubkey: wallet.publicKey,
  votePubkey: selectedValidatorPubkey,
});

const delegateTxId = await sendAndConfirmTransaction(connection, delegateTx, [
  wallet,
]);
console.log(
  `Stake account delegated to ${selectedValidatorPubkey}. Tx Id: ${delegateTxId}`
);

// Check in on our stake account. It should now be activating.
stakeStatus = await connection.getStakeActivation(stakeAccount.publicKey);
console.log(`Stake account status: ${stakeStatus.state}`);

```

## 通过验证器获取委托人

多个账户可能已经质押给了特定的验证账户。为了获取所有的质押人，我们可以使用 `getProgramAccounts` 或 `getParsedProgramAccounts` API。请参考[指南部分](../guides/get-program-accounts.md) 获取更多信息。质押账户长度为200字节，选民公钥从第124字节开始。[参考资料](https://github.com/solana-labs/solana/blob/e960634909a9617fb98d5d836c9c4c5e0d9d59cc/sdk/program/src/stake/state.rs)。


```typescript
// typescript
const STAKE_PROGRAM_ID = new PublicKey(
  "Stake11111111111111111111111111111111111111"
);
const VOTE_PUB_KEY = "27MtjMSAQ2BGkXNuJEJkxFyCJT8dugGAaHJ9T7Gc6x4x";

const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");
const accounts = await connection.getParsedProgramAccounts(STAKE_PROGRAM_ID, {
  filters: [
    {
      dataSize: 200, // number of bytes
    },
    {
      memcmp: {
        offset: 124, // number of bytes
        bytes: VOTE_PUB_KEY, // base58 encoded string
      },
    },
  ],
});

console.log(`Accounts for program ${STAKE_PROGRAM_ID}: `);
console.log(
  `Total number of delegators found for ${VOTE_PUB_KEY} is: ${accounts.length}`
);
if (accounts.length)
  console.log(`Sample delegator:`, JSON.stringify(accounts[0]));

/*
// Output

  Accounts for program Stake11111111111111111111111111111111111111:
  Total number of delegators found for 27MtjMSAQ2BGkXNuJEJkxFyCJT8dugGAaHJ9T7Gc6x4x is: 184
  Sample delegator:
  {
    "account": {
      "data": {
        "parsed": {
          "info": {
            "meta": {
              "authorized": {
                "staker": "3VDVh3rHTLkNJp6FVYbuFcaihYBFCQX5VSBZk23ckDGV",
                "withdrawer": "EhYXq3ANp5nAerUpbSgd7VK2RRcxK1zNuSQ755G5Mtxx"
              },
              "lockup": {
                "custodian": "3XdBZcURF5nKg3oTZAcfQZg8XEc5eKsx6vK8r3BdGGxg",
                "epoch": 0,
                "unixTimestamp": 1822867200
              },
              "rentExemptReserve": "2282880"
            },
            "stake": {
              "creditsObserved": 58685367,
              "delegation": {
                "activationEpoch": "208",
                "deactivationEpoch": "18446744073709551615",
                "stake": "433005300621",
                "voter": "27MtjMSAQ2BGkXNuJEJkxFyCJT8dugGAaHJ9T7Gc6x4x",
                "warmupCooldownRate": 0.25
              }
            }
          },
          "type": "delegated"
        },
        "program": "stake",
        "space": 200
      },
      "executable": false,
      "lamports": 433012149261,
      "owner": {
        "_bn": "06a1d8179137542a983437bdfe2a7ab2557f535c8a78722b68a49dc000000000"
      },
      "rentEpoch": 264
    },
    "pubkey": {
      "_bn": "0dc8b506f95e52c9ac725e714c7078799dd3268df562161411fe0916a4dc0a43"
    }
  }

*/

```

## 停用质押

在质押账户委托后的任何时候，`Stake Authority`可以选择停用该账户。停用过程可能需要多个时期才能完成，并且在提取任何 SOL 之前必须完成停用操作。


```typescript
// typescript
// At anytime we can choose to deactivate our stake. Our stake account must be inactive before we can withdraw funds.
const deactivateTx = StakeProgram.deactivate({
  stakePubkey: stakeAccount.publicKey,
  authorizedPubkey: wallet.publicKey,
});
const deactivateTxId = await sendAndConfirmTransaction(
  connection,
  deactivateTx,
  [wallet]
);
console.log(`Stake account deactivated. Tx Id: ${deactivateTxId}`);

// Check in on our stake account. It should now be inactive.
stakeStatus = await connection.getStakeActivation(stakeAccount.publicKey);
console.log(`Stake account status: ${stakeStatus.state}`);

```



## 提取质押

一旦停用了，`Withdrawal Authority`可以将 SOL 提取回系统账户。一旦质押账户不再委托并且余额为 0 SOL，它将被销毁了。


```typescript
// typescript
// Once deactivated, we can withdraw our SOL back to our main wallet
const withdrawTx = StakeProgram.withdraw({
  stakePubkey: stakeAccount.publicKey,
  authorizedPubkey: wallet.publicKey,
  toPubkey: wallet.publicKey,
  lamports: stakeBalance, // Withdraw the full balance at the time of the transaction
});

const withdrawTxId = await sendAndConfirmTransaction(connection, withdrawTx, [
  wallet,
]);
console.log(`Stake account withdrawn. Tx Id: ${withdrawTxId}`);

// Confirm that our stake account balance is now 0
stakeBalance = await connection.getBalance(stakeAccount.publicKey);
console.log(`Stake account balance: ${stakeBalance / LAMPORTS_PER_SOL} SOL`);

```
