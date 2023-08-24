---
sidebar_position: 105
sidebar_label: 🎁 开启战利品箱
sidebar_class_name: green
---

# 🎁 开启战利品箱

现在我们来深入探讨开启战利品箱的指南。首先你会注意到的是，这个过程涉及许多账号，总共有`19`个！

直到`stake_state`为止，这些信息都是我们之前已经了解的。

我们正在添加与总线相关的内容，包括我们在初始化用户中刚刚设置的用户状态。然后还有一系列总线账户，包括`vrf`账户、`oracle`队列账户、队列权限账户（这只是权限的`PDA`）、数据缓冲区账户、权限账户、托管账户、程序状态账户和总线程序账户本身。

你会发现还有一些我们尚未讨论过的类型，它们来自`switchboard-v2 crate`。以下是你需要添加到`Cargo.toml`中的两个依赖项，以确保所有这些类型都能正常工作。

```toml
switchboard-v2 = { version = "^0.1.14", features = ["devnet"] }
bytemuck = "1.7.2"
```

最后两个账户是付款人钱包，它与你的`switchboard`代币关联，用于支付随机性和最近的区块哈希。

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

在我们的账户配置之后，下面的代码片段是我们在开放式战利品箱实现中真正进行的操作，需要注意的是，这正是我们逻辑所在的地方。

起初，我们加载状态的部分与以前完全相同。一旦我们加载了状态，我们就从状态中获取了我们的 `bump`（译者注：bump通常用于校验或确保唯一性），还有我们在初始化用户时添加的另外两个 `bump`。我们还从内存中删除了状态。

```rust
let state = ctx.accounts.state.load()?;
let bump = state.bump.clone();
let switchboard_state_bump = state.switchboard_state_bump;
let vrf_permission_bump = state.vrf_permission_bump;
drop(state);
```

接下来，我们从账户列表中获取了交换机程序本身。然后，我们构建了`VRF`请求的随机性，这实际上是我们用于`CPI`（跨程序调用）的上下文，在我们几行后调用`vrf_request_randomness`时会用到。

再次，你会看到一些被注释掉的代码，用来区分生产环境和测试环境。我们仅在测试目的下使用`vrf`账户。

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

最后，我们将随机请求更改为已初始化为`true`。

```rust
ctx.accounts.lootbox_pointer.randomness_requested = true;
ctx.accounts.lootbox_pointer.is_initialized = true;
ctx.accounts.lootbox_pointer.available_lootbox = box_number * 2;

Ok(())
```

我们再来探讨战利品盒指针结构体，注意到其中有一个名为 `redeemable` 的属性。这个属性让客户端可以观察战利品盒指针账户，一旦它从`false`变为`true`，我们便能知道随机性已经恢复，可以开始进行铸造。此变化是在消耗随机性函数中发生的。

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

下面我们来看一下这个函数，并对它进行解读。该函数由交换机调用，并且内容在 `callback` 文件中提供。回调中的四个账户与`ConsumeRandomness`中的账户匹配，`loobox`指针和状态是可变的。

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

在实际执行上，我们在流程指令功能中首先加载`vrf`和状态账户。随后，我们从`vrf`账户获取结果缓冲区，并检查确保其不为空。

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
    }
```

接下来，我们将对可用的装备进行映射。此时，我们仅使用下方定义的常量，方便在构建程序时进行必要的修改。这将给我们一个公钥向量。

```rust
let available_gear: Vec<Pubkey> = Self::AVAILABLE_GEAR
           .into_iter()
           .map(|key| key.parse::<Pubkey>().unwrap())
           .collect();
```

在 `value` 变量中，我们将结果缓冲区转换为无符号`8`位整数，这是`switchboard`推荐的实现方式，采用了 `bytemuck crate`。最后，我们通过取模运算和可用的最大薄荷数量来随机选择一个。

```rust
// maximum value to convert randomness buffer
let max_result = available_gear.len();
let value: &[u8] = bytemuck::cast_slice(&result_buffer[..]);
let i = (value[0] as usize) % max_result;
msg!("The chosen mint index is {} out of {}", i, max_result);
```

最后，我们会选中第`i`个索引处的值，并分配给`lootbox`指针的`mint`，然后将`redeemable`的值更改为`true`。这样一来，客户端便可观察到这一变化，一旦`redeemable`为`true`，用户就能开始铸造他们的装备。

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

正如之前所提及的，从战利品箱中获取物品的指令基本保持不变。如果您更细致地观察，就会发现它并没有与交换机进行任何交互，因此无需进行任何更新。

## 客户端交互与测试

最后，我们要来探讨与交换机相关的测试环节。我们已经审视了`setupSwitchboard`函数，以便准备测试。前三个测试主要用于质押、赎回和解质押。紧随其后的是`init_user`测试，非常直接明了。我们只需传入交换机状态的增量和权限增量，再加上四个账户即可。

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
      .rpc();
})
```

随后的选择性随机测试则相对复杂一些。前半部分与其他测试相似。我们首先创建一个虚拟的铸币机，用以铸造这些物品。然后获取或创建一个所谓的`ATA`，并将物品铸造到其中。除此之外，还有我们的质押账户，负责实际质押我们的NFT。

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

我们首先从`vrf`账户中加载数据，并从交换机队列中获取我们的权限和数据缓冲区。随后，我们调用了`openLootbox`函数，这个函数需要许多合适的账户，数量相当多。其中大部分来自`setupSwitchboard`函数，还有一些则来自我们刚刚从交换机队列中获取的内容。

```ts
const vrfState = await vrfAccount.loadData();
const { authority, dataBuffer } = await switchboard.queue.loadData();

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
  .rpc();
```

接下来，我们使用了`awaitCallback`函数，在其中我们传递了`lootbox`程序、指针`PDA`，并设置了20秒的等待时间。在这段时间内，我们将观察`lootbox`指针是否更新为新的`mint`。

```ts
await awaitCallback(
  lootboxProgram,
  lootboxPointerPda,
  20_000,
  "Didn't get random mint"
);
```

下面是等待回调函数的部分，您可以随意引用。在这里，您会看到它实际上只是静静地等待。它会观察战利品盒指针上的账户变化，一旦有变化，它就会检查战利品盒指针，看看是否已设置为“可兑换”为真。如果是这样，它就会解决并完成回调，一切都将顺利进行。如果在`20`秒内没有发生任何变化，它将报告"未获得随机铸币"的错误。


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

最后，我们来测试选定齿轮的铸造过程。首先，我们获取战利品箱指针，从中找到铸币，并获取我们需要的`ATA`以使其工作。然后，我们将检查是否之前已经有了相同的齿轮，以防止我们重复运行。随后，我们调用从战利品箱中检索物品的函数，并再次确认新的齿轮数量是之前的数量加一。

```ts
it("Mints the selected gear", async () => {
  const [pointerAddress] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("lootbox"), wallet.publicKey.toBuffer()],
    lootboxProgram.programId
  );

  const pointer = await lootboxProgram.account.lootboxPointer.fetch(
    pointerAddress
  );

  let previousGearCount = 0;
  const gearAta = await getAssociatedTokenAddress(
    pointer.mint,
    wallet.publicKey
  );
  try {
    let gearAccount = await getAccount(provider.connection, gearAta);
    previousGearCount = Number(gearAccount.amount);
  } catch (error) {}

  await lootboxProgram.methods
    .retrieveItemFromLootbox()
    .accounts({
      mint: pointer.mint,
      userGearAta: gearAta,
    })
    .rpc();

  const gearAccount = await getAccount(provider.connection, gearAta);
  expect(Number(gearAccount.amount)).to.equal(previousGearCount + 1);
})
```

现在您可以运行上述代码，希望一切能正常工作。如果刚开始不成功，请不要气馁。我们自己也花了好几天的时间进行调试。
