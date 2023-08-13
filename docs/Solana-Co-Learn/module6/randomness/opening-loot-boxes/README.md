---
sidebar_position: 105
sidebar_label: 🎁 开启战利品箱
sidebar_class_name: green
---

# 🎁 开启战利品箱

我们要进入开放的战利品箱指南，第一件你会注意到的事情是，它需要很多账号，总共19个！

直到`stake_state`，这些都是我们之前拥有的所有信息。

与总机相关的内容我们正在添加的有：我们的用户状态，这是我们在初始化用户中刚刚初始化的。然后还有一堆总机账户，包括`vrf`账户、`oracle`队列账户、队列权限账户（这只是该权限的`PDA`）、数据缓冲区账户、权限账户、托管账户、程序状态账户和总机程序账户本身。

你会注意到我们还没有讨论过一些类型，它们来自于 `switchboard-v2 crate`。以下是你需要添加到 `Cargo.toml` 中的两个依赖项，以使所有这些类型正常工作。

```toml
switchboard-v2 = { version = "^0.1.14", features = ["devnet"] }
bytemuck = "1.7.2"
```

最后两个账户是付款人钱包，它是与您的`swithboard`代币关联的代币账户，用于支付随机性和最近的区块哈希。

```ts
use crate::*;
use anchor_lang::solana_program;

#[derive(Accounts)]
pub struct OpenLootbox<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        init_if_needed,
        payer = user,
        space = std::mem::size_of::<LootboxPointer>() + 8,
        seeds=["lootbox".as_bytes(), user.key().as_ref()],
        bump
    )]
    pub lootbox_pointer: Box<Account<'info, LootboxPointer>>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    // TESTING - Uncomment the next line during testing
    // #[account(mut)]
    // TESTING - Comment out the next three lines during testing
    #[account(
          mut,
          address="D7F9JnGcjxQwz9zEQmasksX1VrwFcfRKu8Vdqrk2enHR".parse::<Pubkey>().unwrap()
      )]
    pub stake_mint: Account<'info, Mint>,
    #[account(
        mut,
        associated_token::mint=stake_mint,
        associated_token::authority=user
    )]
    pub stake_mint_ata: Box<Account<'info, TokenAccount>>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    #[account(
        constraint=stake_state.user_pubkey==user.key(),
    )]
    pub stake_state: Box<Account<'info, UserStakeInfo>>,
    #[account(
        mut,
        // TESTING - Comment out these seeds for testing
        seeds = [
            user.key().as_ref(),
        ],
        // TESTING - Uncomment these seeds for testing
        // seeds = [
        //     vrf.key().as_ref(),
        //     user.key().as_ref()
        // ],
        bump = state.load()?.bump,
        has_one = vrf @ LootboxError::InvalidVrfAccount
    )]
    pub state: AccountLoader<'info, UserState>,

    // SWITCHBOARD ACCOUNTS
    #[account(mut,
        has_one = escrow
    )]
    pub vrf: AccountLoader<'info, VrfAccountData>,
    #[account(mut,
        has_one = data_buffer
    )]
    pub oracle_queue: AccountLoader<'info, OracleQueueAccountData>,
    /// CHECK:
    #[account(mut,
        constraint =
            oracle_queue.load()?.authority == queue_authority.key()
    )]
    pub queue_authority: UncheckedAccount<'info>,
    /// CHECK
    #[account(mut)]
    pub data_buffer: AccountInfo<'info>,
    #[account(mut)]
    pub permission: AccountLoader<'info, PermissionAccountData>,
    #[account(mut,
        constraint =
            escrow.owner == program_state.key()
            && escrow.mint == program_state.load()?.token_mint
    )]
    pub escrow: Account<'info, TokenAccount>,
    #[account(mut)]
    pub program_state: AccountLoader<'info, SbState>,
    /// CHECK:
    #[account(
        address = *vrf.to_account_info().owner,
        constraint = switchboard_program.executable == true
    )]
    pub switchboard_program: AccountInfo<'info>,

    // PAYER ACCOUNTS
    #[account(mut,
        constraint =
            payer_wallet.owner == user.key()
            && escrow.mint == program_state.load()?.token_mint
    )]
    pub payer_wallet: Account<'info, TokenAccount>,
    // SYSTEM ACCOUNTS
    /// CHECK:
    #[account(address = solana_program::sysvar::recent_blockhashes::ID)]
    pub recent_blockhashes: AccountInfo<'info>,
}
```

在我们的账户背后，这就是我们在开放式战利品箱实施中实际做的事情，记住这是我们的逻辑所在的地方

直到我们加载我们的状态，一切都和以前一样。一旦我们加载我们的状态，我们从状态中获得我们的提升，然后是我们在初始化用户中添加的另外两个提升。我们还从内存中删除状态。

```rust
let state = ctx.accounts.state.load()?;
let bump = state.bump.clone();
let switchboard_state_bump = state.switchboard_state_bump;
let vrf_permission_bump = state.vrf_permission_bump;
drop(state);
```

接下来，我们从账户列表中获取交换机程序本身。然后，我们构建`VRF`请求的随机性，这基本上是我们用于`CPI`的上下文，在我们几行后调用`vrf_request_randomness`时发生。

再次，你会注意到一些需要注释掉的代码，用于区分生产环境和测试环境。我们只在测试目的下使用`vrf`账户。

```rust
let switchboard_program = ctx.accounts.switchboard_program.to_account_info();

let vrf_request_randomness = VrfRequestRandomness {
    authority: ctx.accounts.state.to_account_info(),
    vrf: ctx.accounts.vrf.to_account_info(),
    oracle_queue: ctx.accounts.oracle_queue.to_account_info(),
    queue_authority: ctx.accounts.queue_authority.to_account_info(),
    data_buffer: ctx.accounts.data_buffer.to_account_info(),
    permission: ctx.accounts.permission.to_account_info(),
    escrow: ctx.accounts.escrow.clone(),
    payer_wallet: ctx.accounts.payer_wallet.clone(),
    payer_authority: ctx.accounts.user.to_account_info(),
    recent_blockhashes: ctx.accounts.recent_blockhashes.to_account_info(),
    program_state: ctx.accounts.program_state.to_account_info(),
    token_program: ctx.accounts.token_program.to_account_info(),
};

let payer = ctx.accounts.user.key();
// TESTING - uncomment the following during tests
let vrf = ctx.accounts.vrf.key();
let state_seeds: &[&[&[u8]]] = &[&[vrf.as_ref(), payer.as_ref(), &[bump]]];
// TESTING - comment out the next line during tests
// let state_seeds: &[&[&[u8]]] = &[&[payer.as_ref(), &[bump]]];
```

这是对`switchboard`的呼叫。

```rust
msg!("requesting randomness");
vrf_request_randomness.invoke_signed(
    switchboard_program,
    switchboard_state_bump,
    vrf_permission_bump,
    state_seeds,
)?;

msg!("randomness requested successfully");
```

最后，我们将随机请求更改为已初始化为true。

```rust
ctx.accounts.lootbox_pointer.randomness_requested = true;
ctx.accounts.lootbox_pointer.is_initialized = true;
ctx.accounts.lootbox_pointer.available_lootbox = box_number * 2;

Ok(())
```

让我们回到战利品盒指针结构体，这里有一个 `redeemable` 属性。这个属性允许我们的客户端观察战利品盒指针账户，一旦它从`false`变为`true`，我们就知道随机性已经恢复，可以开始铸造。这个变化发生在消耗随机性函数中。

```rust
#[account]
pub struct LootboxPointer {
  pub mint: Pubkey,
  pub redeemable: bool,
  pub randomness_requested: bool,
  pub available_lootbox: u64,
  pub is_initialized: bool,
}
```

让我们跳转到那个函数并进行回顾。这是由交换机调用的函数，它是我们在 `callback` 文件中提供的内容。回调中的四个账户与`ConsumeRandomness`中的账户匹配，其中`loobox`指针和状态都是可变的。

```rust
use crate::state::*;
use crate::*;

#[derive(Accounts)]
pub struct ConsumeRandomness<'info> {
    #[account(
        mut,
        // TESTING - Comment out these seeds for testing
        seeds = [
            payer.key().as_ref(),
        ],
        // TESTING - Uncomment these seeds for testing
        // seeds = [
        //     vrf.key().as_ref(),
        //     payer.key().as_ref()
        // ],
        bump = state.load()?.bump,
        has_one = vrf @ LootboxError::InvalidVrfAccount
    )]
    pub state: AccountLoader<'info, UserState>,
    pub vrf: AccountLoader<'info, VrfAccountData>,
    #[account(
        mut,
        seeds=["lootbox".as_bytes(), payer.key().as_ref()],
        bump
      )]
    pub lootbox_pointer: Account<'info, LootboxPointer>,
    /// CHECK: ...
    pub payer: AccountInfo<'info>,
}
```

关于实际的实施，在过程指令功能中，我们首先加载vrf和状态账户。然后我们从`vrf`账户获取结果缓冲区，并检查确保其不为空。



```rust
impl ConsumeRandomness<'_> {
    pub fn process_instruction(ctx: &mut Context<Self>) -> Result<()> {
        let vrf = ctx.accounts.vrf.load()?;
        let state = &mut ctx.accounts.state.load_mut()?;

        let result_buffer = vrf.get_result()?;
        if result_buffer == [0u8; 32] {
            msg!("vrf buffer empty");
            return Ok(());
        }

        if result_buffer == state.result_buffer {
            msg!("result_buffer unchanged");
            return Ok(());
        }
```

然后我们对可用的装备进行映射。目前，我们只是使用下面定义的常量，以便在构建程序时可以必要地进行更改。这给我们一个公钥向量。

```rust
let available_gear: Vec<Pubkey> = Self::AVAILABLE_GEAR
           .into_iter()
           .map(|key| key.parse::<Pubkey>().unwrap())
           .collect();
```

value 变量是我们将结果缓冲区转换为无符号8位整数的地方，这是switchboard推荐的实现方式，使用 bytemuck crate。最后，我们使用取模运算符和可用的最大薄荷数量来随机选择一个。

```rust
// maximum value to convert randomness buffer
let max_result = available_gear.len();
let value: &[u8] = bytemuck::cast_slice(&result_buffer[..]);
let i = (value[0] as usize) % max_result;
msg!("The chosen mint index is {} out of {}", i, max_result);
```

我们最终将第i个索引处的值分配给mint，然后将其分配给lootbox指针mint，并将redeemable的值更改为true。这样可以在客户端上观察到它，一旦为true，用户就可以铸造他们的装备。

```rust
let mint = available_gear[i];
        msg!("Next mint is {:?}", mint);
        ctx.accounts.lootbox_pointer.mint = mint;
        ctx.accounts.lootbox_pointer.redeemable = true;

        Ok(())
    }

    const AVAILABLE_GEAR: [&'static str; 5] = [
        "87QkviUPcxNqjdo1N6C4FrQe3ZiYdAyxGoT44ioDUG8m",
        "EypLPq3xBRREfpsdbyXfFjobVAnHsNerP892NMHWzrKj",
        "Ds1txTXZadjsjKtt2ybH56GQ2do4nbGc8nrSH3Ln8G9p",
        "EHPo4mSNCfYzX3Dtr832boZAiR8vy39eTsUfKprXbFus",
        "HzUvbXymUCBtubKQD9yiwWdivAbTiyKhpzVBcgD9DhrV",
    ];
}
```

如前所述，从战利品箱中获取物品的指令几乎没有改变。如果你再仔细看一下，你会发现它与交换机没有任何交互，因此不需要进行任何更新。

## 客户端交互/测试

最后，我们将要讨论与交换机相关的测试。我们已经回顾了setupSwitchboard函数以准备测试。我们的前三个测试仍然是用于质押、赎回和解质押。下一个测试是init_user，非常简单明了，我们只需要传入交换机状态的增加和权限的增加，以及四个账户。

```rust
it("init user", async () => {
    const tx = await lootboxProgram.methods
      .initUser({
        switchboardStateBump: switchboardStateBump,
        vrfPermissionBump: permissionBump,
      })
      .accounts({
        state: userState,
        vrf: vrfAccount.publicKey,
        payer: wallet.pubkey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc()
  })
```

接下来是选择性随机测试，这个比较棘手。前半部分与其他测试类似。首先，我们创建一个虚假的铸币机来铸造这些物品。然后获取或创建一个ATA，并将其铸造到其中。还有我们的质押账户，用于实际质押我们的NFT。

```ts
it("Chooses a mint pseudorandomly", async () => {
    const mint = await createMint(
      provider.connection,
      wallet.payer,
      wallet.publicKey,
      wallet.publicKey,
      2
    )
    const ata = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      wallet.payer,
      mint,
      wallet.publicKey
    )

    await mintToChecked(
      provider.connection,
      wallet.payer,
      mint,
      ata.address,
      wallet.payer,
      1000,
      2
    )

    const [stakeAccount] = anchor.web3.PublicKey.findProgramAddressSync(
      [wallet.publicKey.toBuffer(), nft.tokenAddress.toBuffer()],
      program.programId
    )
```

我们从vrf账户加载数据，从交换机队列中获取我们的权限和数据缓冲区。然后我们调用open lootbox函数，它需要所有适当的账户...有相当多。大部分来自setupSwitchboard函数，还有一些来自我们刚刚获取的交换机队列。

```ts
const vrfState = await vrfAccount.loadData()
    const { authority, dataBuffer } = await switchboard.queue.loadData()

    await lootboxProgram.methods
      .openLootbox(new BN(10))
      .accounts({
        user: wallet.publicKey,
        stakeMint: mint,
        stakeMintAta: ata.address,
        stakeState: stakeAccount,
        state: userState,
        vrf: vrfAccount.publicKey,
        oracleQueue: switchboard.queue.publicKey,
        queueAuthority: authority,
        dataBuffer: dataBuffer,
        permission: permissionAccount.publicKey,
        escrow: vrfState.escrow,
        programState: switchboardStateAccount.publicKey,
        switchboardProgram: switchboard.program.programId,
        payerWallet: switchboard.payerTokenWallet,
        recentBlockhashes: anchor.web3.SYSVAR_RECENT_BLOCKHASHES_PUBKEY,
      })
      .rpc()
```

然后我们有这个awaitCallback函数，在其中我们传入lootbox程序、指针PDA，并选择一个20秒的时间，在这段时间内，我们将等待看看lootbox指针是否更新为新的mint。

```ts
await awaitCallback(
      lootboxProgram,
      lootboxPointerPda,
      20_000,
      "Didn't get random mint"
    )
  })
```

以下是等待回调函数，随意粘贴。在这里，你会看到它只是静静地等待。它会查找战利品盒指针上的账户变化，如果有变化，它会检查战利品盒指针，看看是否已经设置为可兑换为真，如果是，它会解决它并完成回调，一切都很好。如果在20秒内没有发生，它将报错为"未获得随机铸币"错误。

```ts
async function awaitCallback(
  program: Program<LootboxProgram>,
  lootboxPointerAddress: anchor.web3.PublicKey,
  timeoutInterval: number,
  errorMsg = "Timed out waiting for VRF Client callback"
) {
  let ws: number | undefined = undefined
  const result: boolean = await promiseWithTimeout(
    timeoutInterval,
    new Promise((resolve: (result: boolean) => void) => {
      ws = program.provider.connection.onAccountChange(
        lootboxPointerAddress,
        async (
          accountInfo: anchor.web3.AccountInfo<Buffer>,
          context: anchor.web3.Context
        ) => {
          const lootboxPointer = await program.account.lootboxPointer.fetch(
            lootboxPointerAddress
          )

          if (lootboxPointer.redeemable) {
            resolve(true)
          }
        }
      )
    }).finally(async () => {
      if (ws) {
        await program.provider.connection.removeAccountChangeListener(ws)
      }
      ws = undefined
    }),
    new Error(errorMsg)
  ).finally(async () => {
    if (ws) {
      await program.provider.connection.removeAccountChangeListener(ws)
    }
    ws = undefined
  })

  return result
}
```

最后，测试选定齿轮的铸造。它获取战利品箱指针，从中获取铸币，并获取我们需要的ATA以使其工作。然后我们检查是否之前已经有了相同的齿轮，以防我们运行多次。然后我们调用从战利品箱中检索物品，并再次确认新的齿轮数量是之前的数量加一。



```ts
it("Mints the selected gear", async () => {
    const [pointerAddress] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("lootbox"), wallet.publicKey.toBuffer()],
      lootboxProgram.programId
    )

    const pointer = await lootboxProgram.account.lootboxPointer.fetch(
      pointerAddress
    )

    let previousGearCount = 0
    const gearAta = await getAssociatedTokenAddress(
      pointer.mint,
      wallet.publicKey
    )
    try {
      let gearAccount = await getAccount(provider.connection, gearAta)
      previousGearCount = Number(gearAccount.amount)
    } catch (error) {}

    await lootboxProgram.methods
      .retrieveItemFromLootbox()
      .accounts({
        mint: pointer.mint,
        userGearAta: gearAta,
      })
      .rpc()

    const gearAccount = await getAccount(provider.connection, gearAta)
    expect(Number(gearAccount.amount)).to.equal(previousGearCount + 1)
  })
})
```

现在运行它，希望它能正常工作。如果它不能立即工作，请不要灰心。我们花了几天时间在我们这边进行调试。
