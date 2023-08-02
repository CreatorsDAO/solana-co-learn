// We're adding these
import * as Web3 from '@solana/web3.js';
import * as fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  const connection = new Web3.Connection("http://localhost:8899", "confirmed");
  const signer = await initializeKeypair(connection);

  console.log("Public key:", signer.publicKey.toBase58());

  // When generating a keypair
  await airdropSolIfNeeded(signer, connection);

  await SystemCall(connection, signer);

  let programId = Web3.Keypair.generate();

  await createAccountWithSeed(signer.publicKey, "ibc", programId.publicKey);
}

main()
  .then(() => {
    console.log("Finished successfully")
    process.exit(0)
  })
  .catch((error) => {
    console.log(error)
    process.exit(1)
  })


async function initializeKeypair(_connection: Web3.Connection): Promise<Web3.Keypair> {
  if (!process.env.PRIVATE_KEY) {
    console.log('Generating new keypair... 🗝️');
    const signer = Web3.Keypair.generate();

    console.log('Creating .env file');
    fs.writeFileSync('.env', `PRIVATE_KEY=[${signer.secretKey.toString()}]`);

    return signer;
  }

  const secret = JSON.parse(process.env.PRIVATE_KEY ?? '') as number[];
  const secretKey = Uint8Array.from(secret);
  const keypairFromSecret = Web3.Keypair.fromSecretKey(secretKey);
  return keypairFromSecret;
}

async function airdropSolIfNeeded(
  signer: Web3.Keypair,
  connection: Web3.Connection
) {
  const balance = await connection.getBalance(signer.publicKey);
  console.log('Current balance is', balance / Web3.LAMPORTS_PER_SOL, 'SOL');

  // 1 SOL should be enough for almost anything you wanna do
  if (balance / Web3.LAMPORTS_PER_SOL < 1) {
    // You can only get up to 2 SOL per request
    console.log('Airdropping 1 SOL');
    const airdropSignature = await connection.requestAirdrop(
      signer.publicKey,
      Web3.LAMPORTS_PER_SOL
    );

    const latestBlockhash = await connection.getLatestBlockhash();

    await connection.confirmTransaction({
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      signature: airdropSignature,
    });

    const newBalance = await connection.getBalance(signer.publicKey);
    console.log('New balance is', newBalance / Web3.LAMPORTS_PER_SOL, 'SOL');
  }
}

async function SystemCall(connection: Web3.Connection, payer: Web3.Keypair) {
  // 在Solana中，space变量是用来定义新创建账户中所需存储空间的大小。
  // 这个值应该根据您打算存储在账户中的数据量来设置。如果您正在与特定的智能合约或程序进行交互，
  // 您可能需要根据该程序的文档或代码来确定合适的空间大小。
  //
  // 设置存储空间：space变量定义了新创建的Solana账户所需的存储空间大小。在此例中，它被设置为80字节（10个u64字段，每个字段8字节）。
  const space = 10 * 8; // 10个u64字段，每个字段8字节
  //
  // 如何计算账户费用
  // 在Solana上保持账户活跃会产生一项存储费用，称为 租金/rent。
  // 通过存入至少两年租金的金额，你可以使账户完全免除租金收取。对于费用的计算，你需要考虑你打算在账户中存储的数据量。
  //
  // 获取租金豁免金额：通过调用connection.getMinimumBalanceForRentExemption(space)，
  // 计算了新账户所需的租金豁免金额。如果账户持有的余额至少为此金额，该账户将被视为租金豁免，从而免除了存储费用。
  const rentExemptionAmount = await connection.getMinimumBalanceForRentExemption(space);
  // 生成新的密钥对：创建一个新的密钥对newAccountPubkey，代表新的账户的公钥和私钥。
  const newAccountPubkey = Web3.Keypair.generate();
  const fromPubkey = payer;

  // 置创建账户的参数：定义了一个名为createAccountParams的对象，其中包含创建新账户所需的所有参数，
  // 例如发件人公钥、新账户公钥、豁免租金的lamports数量、存储空间大小以及关联的系统程序ID。
  const createAccountParams = {
    fromPubkey: fromPubkey.publicKey,
    newAccountPubkey: newAccountPubkey.publicKey,
    lamports: rentExemptionAmount,
    space,
    programId: Web3.SystemProgram.programId,
  };

  // 创建和添加事务：创建一个新的事务对象，并通过add方法添加一个创建新账户的指令。
  const createAccountTransaction = new Web3.Transaction().add(
    Web3.SystemProgram.createAccount(createAccountParams)
  );

  // 发送并确认事务：使用Web3.sendAndConfirmTransaction函数发送并确认事务。
  // 该函数接受连接对象、事务对象以及包括付款者和新账户密钥对在内的签名者数组。
  await Web3.sendAndConfirmTransaction(connection, createAccountTransaction, [
    fromPubkey,
    newAccountPubkey,
  ]);

  // 日志输出：最后，该函数使用console.log打印一条消息，其中包含新创建的账户的链接，可以在Solana的区块链浏览器上查看。
  console.log(
    `Account created: https://explorer.solana.com/address/${newAccountPubkey.publicKey.toString()}`
  );
}


async function createAccountWithSeed(basePubkey: Web3.PublicKey, seed: string, programId: Web3.PublicKey) {
  let account = await Web3.PublicKey.createWithSeed(basePubkey, seed, programId);
  console.log("Create with seed account is ", account.toString());
}
