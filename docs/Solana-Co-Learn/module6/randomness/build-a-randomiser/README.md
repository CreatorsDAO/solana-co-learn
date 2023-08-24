---
sidebar_position: 104
sidebar_label: 👁‍🗨 构建一个随机器
sidebar_class_name: green
---

# 👁‍🗨 构造随机器

> Switchboard设置的详细步骤 🚶🏽🔀

## 概览

我们将通过`Switchboard`来构建一个基础程序，以实现随机数的请求。在此视频中，我们将重点关注如何在测试环境中配置`Switchboard`客户端。

首先，我们要进行交换机的初始化设置，你可以在[/tests/utils/setupSwitchboard.ts](https://github.com/Unboxed-Software/anchor-nft-staking-program/blob/solution-randomize-loot/tests/utils/setupSwitchboard.ts?utm_source=buildspace.so&utm_medium=buildspace_project)文件中找到相关代码。

这个设置是用于运行测试的。虽然他们的文档非常精简，但对于随机化部分，我们应该已经了解得足够清楚了。

让我们一起回顾一下代码。首先，我们需要导入以下三个库：

```ts
import { SwitchboardTestContext } from "@switchboard-xyz/sbv2-utils"
import * as anchor from "@project-serum/anchor"
import * as sbv2 from "@switchboard-xyz/switchboard-v2"
```

在实际功能方面，你会注意到我们传入的三个项目分别是提供者、战利品箱计划和付款人。

我们要做的第一件事是加载`devne`t队列，这样我们就可以在`devnet`上进行测试了。`ID`是Switchboard的程序`ID`，`100,000,000`则是`switchboard`代币数量，我们需要访问它们。

```ts
export const setupSwitchboard = async (provider, lootboxProgram, payer) => {

    const switchboard = await SwitchboardTestContext.loadDevnetQueue(
      provider,
      "F8ce7MsckeZAbAGmxjJNetxYXQa9mKr9nnrC3qKubyYy",
      100_000_000
    )
```

接下来，我们会看到一些日志，确保一切都准备就绪。

```ts
console.log(switchboard.mint.address.toString())

await switchboard.oracleHeartbeat();

const { queue, unpermissionedVrfEnabled, authority } =
await switchboard.queue.loadData();

console.log(`oracleQueue: ${switchboard.queue.publicKey}`);
console.log(`unpermissionedVrfEnabled: ${unpermissionedVrfEnabled}`);
console.log(`# of oracles heartbeating: ${queue.length}`);
console.log(
"\x1b[32m%s\x1b[0m",
`\u2714 Switchboard devnet环境成功加载\n`
);
```

以上的`const`语句加载了我们所需的交换机队列数据，在函数的后续部分我们将用到这些数据。

接下来，我们创建验证随机函数（`VRF`）账户，这一部分对于我们使用的交换板非常特殊。你会看到，它会生成一个新的密钥对。

```ts
// 创建VRF账户
// VRF账户的密钥对
const vrfKeypair = anchor.web3.Keypair.generate()
```

在创建`VRF`账户的过程中，我们需要访问一些`PDA`设备。

```ts
// 寻找用于客户端状态公钥的PDA
const [userState] = anchor.utils.publicKey.findProgramAddressSync(
[vrfKeypair.publicKey.toBytes(), payer.publicKey.toBytes()],
lootboxProgram.programId
)

// 用于回调的lootboxPointerPda
const [lootboxPointerPda] = anchor.web3.PublicKey.findProgramAddressSync(
[Buffer.from("lootbox"), payer.publicKey.toBuffer()],
lootboxProgram.programId
)
```

你会注意到我们使用了`vrf`和`payer`的公钥作为种子。在生产环境中，它们需要是静态的，只有`payer`的公钥会变化。这段代码确保我们在每次测试运行时都有不同的`vrf`密钥对和用户状态，这样我们在测试过程中不会遇到试图重新创建已经存在的账户的问题。

现在，我们可以使用`sbv2`库创建`VRF`账户，并传入交换程序、我们为`VRF`账户提供的密钥对、作为授权的用户状态`PDA`、交换机队列和回调函数。

因此，当我们需要一个新的随机数时，我们将通过与交换机程序进行`CPI`交互来获取随机数。它必须知道我们程序中的一条特定指令来执行`CPI`回调，以便为我们提供随机数。像所有的指令一样，它具有一个程序`ID`、一个账户列表和指令数据。关于账户，第一个是用于写入数据的位置，然后是`vrf`账户，我们将在其中写入已选的`mint`的`lootbox`指针`PDA`，最后是付款人。

```ts
// 创建新的vrf账户
  const vrfAccount = await sbv2.VrfAccount.create(switchboard.program, {
    keypair: vrfKeypair,
    authority: userState, // 将PDA设为vrf账户的授权
    queue: switchboard.queue,
    callback: {
      programId: lootboxProgram.programId,
      accounts: [
        { pubkey: userState, isSigner: false, isWritable: true },
        { pubkey: vrfKeypair.publicKey, isSigner: false, isWritable: false },
        { pubkey: lootboxPointerPda, isSigner: false, isWritable: true },
        { pubkey: payer.publicKey, isSigner: false, isWritable: false },
      ],
      ixData: new anchor.BorshInstructionCoder(lootboxProgram.idl).encode(
        "consumeRandomness",
        ""
      ),
    },
  })
```

接下来我们要创建一个所谓的权限账户。

```ts
// CREATE PERMISSION ACCOUNT
  const permissionAccount = await sbv2.PermissionAccount.create(
    switchboard.program,
    {
      authority,
      granter: switchboard.queue.publicKey,
      grantee: vrfAccount.publicKey,
    }
  )
```

权限字段是从上文的队列中获取的加载数据。这将在交换机中给我们的 `vrf` 账户授权。

下一步，我们会将权限更改为我们自己，并将其设置为付款方。

```ts
// 如果队列需要权限来使用 VRF，请检查是否提供了正确的授权
  if (!unpermissionedVrfEnabled) {
    if (!payer.publicKey.equals(authority)) {
      throw new Error(
        `队列需要 PERMIT_VRF_REQUESTS 权限，而提供的队列授权错误`
      )
    }

    await permissionAccount.set({
      authority: payer,
      permission: sbv2.SwitchboardPermission.PERMIT_VRF_REQUESTS,
      enable: true,
    })
  }
```

由于稍后我们需要切换板账户的提升，因此我们将其提取出来，还有 `switchboardStateBump`，这是切换板的程序账户。

```ts
// 获取权限提升和切换板状态提升
  const [_permissionAccount, permissionBump] = sbv2.PermissionAccount.fromSeed(
    switchboard.program,
    authority,
    switchboard.queue.publicKey,
    vrfAccount.publicKey
  )

  const [switchboardStateAccount, switchboardStateBump] =
    sbv2.ProgramStateAccount.fromSeed(switchboard.program)
```

这就是我们进行测试与程序和交换机互动所需的所有数据，我们将在最后返回这些数据。

```ts
return {
    switchboard: switchboard,
    lootboxPointerPda: lootboxPointerPda,
    permissionBump: permissionBump,
    permissionAccount: permissionAccount,
    switchboardStateBump: switchboardStateBump,
    switchboardStateAccount: switchboardStateAccount,
    vrfAccount: vrfAccount,
  }
```

我们最终会在测试环境设置中调用整个函数，所以现在的 `before` 代码块是这样的。

```ts
before(async () => {
    ;({ nft, stakeStatePda, mint, tokenAddress } = await setupNft(
      program,
      wallet.payer
    ))
    ;({
      switchboard,
      lootboxPointerPda,
      permissionBump,
      switchboardStateBump,
      vrfAccount,
      switchboardStateAccount,
      permissionAccount,
    } = await setupSwitchboard(provider, lootboxProgram, wallet.payer))
  })
```

下面是关于客户端交换机所需的基本知识。

## `init_user` 指令的详细步骤 👶

首先，对于我们的战利品箱计划，我们以前把所有东西都放在 `lib.rs` 里，但随着项目变得越来越庞大，也变得难以管理，所以现在我们对其进行了拆分，你可以在此[链接](https://github.com/Unboxed-Software/anchor-nft-staking-program/tree/solution-randomize-loot/programs/lootbox-program?utm_source=buildspace.so&utm_medium=buildspace_project)查看文件结构。

现在的 `lib` 文件主要只是一堆 `use` 语句、`declare_id!` 宏和我们的四个指令，它们只是调用其他文件。

`Init_user` 将创建用户状态账户，我们将在程序和交换机之间共享该账户，它就像一个联络账户。

打开战利品箱的过程与之前相同，它将开始生成随机货币的过程，但不会完成该过程，而是生成一个 `CPI` 来呼叫交换机以请求一个随机数。

交换机将调用消耗随机性，以返回指令中的号码，以便我们可以使用它，并在设置薄荷时完成该过程。

从战利品箱中获取物品基本上没有改变。

让我们开始吧，首先是 `init_user`。

在文件的顶部，你会找到初始用户上下文，在底部有一个实现，其中有一个名为 `process instruction` 的函数，在该函数中执行了之前在 `lib`s 文件中的逻辑。

在 `InitUser` 上下文中有四个账户。状态是我们的用户状态对象，其中包含 `vrf` 和 `payer` 密钥种子，这是用于测试的版本。对于生产代码，你只需要 `payer` 种子。我们这样做是为了节省时间，而不是使用环境变量。然后有 `vrf` 账户，switchboard 不会自动加载它，因此需要使用 `.load()` 调用来加载。可能有其他使用 switchboard 的方法，但我们目前采用的是最简单/最快的路径来启动和运行，随时可以对其进行探索和改进。最后，我们有 `payer` 和 `system` 程序来创建一个新账户。

```ts
use crate::*;

#[derive(Accounts)]
#[instruction(params: InitUserParams)]
pub struct InitUser<'info> {
  #[account(
        init,
        // 测试 - 注释掉这些种子用于测试
        // seeds = [
        //     payer.key().as_ref(),
        // ],
        // 测试 - 取消注释这些种子用于测试
        seeds = [
            vrf.key().as_ref(),
            payer.key().as_ref()
        ],
        payer = payer,
        space = 8 + std::mem::size_of::<UserState>(),
        bump,
    )]
  pub state: AccountLoader<'info, UserState>,
  #[account(
        constraint = vrf.load()?.authority == state.key() @ LootboxError::InvalidVrfAuthorityError
    )]
  pub vrf: AccountLoader<'info, VrfAccountData>,
  #[account(mut)]
  pub payer: Signer<'info>,
  pub system_program: Program<'info, System>,
}
```

在逻辑部分，我们正在操作名为`state`的账户，该账户设置了`bump`、`switchboard state bump`、`vrf permission bump`、`vrf`账户以及与之关联的用户。你会注意到存在一个结构体，其中只包括了我们前面提到的两个`bump`。

```rust
#[derive(Clone, AnchorSerialize, AnchorDeserialize)]
pub struct InitUserParams {
  pub switchboard_state_bump: u8,
  pub vrf_permission_bump: u8,
}

impl InitUser<'_> {
  pub fn process_instruction(ctx: &Context<Self>, params: &InitUserParams) -> Result<()> {
    let mut state = ctx.accounts.state.load_init()?;
    *state = UserState::default();
    state.bump = ctx.bumps.get("state").unwrap().clone();
    state.switchboard_state_bump = params.switchboard_state_bump;
    state.vrf_permission_bump = params.vrf_permission_bump;
    state.vrf = ctx.accounts.vrf.key();
    state.user = ctx.accounts.payer.key();

    Ok(())
  }
}
```

让我们快速了解一下用户状态文件，从而更好地理解其中的内容。

其中新引入的部分是结果缓冲区。这是我们获取随机性的地方。系统会将随机数据作为一个32字节的数组发送给我们，我们可以将其转换为任何所需的随机性。

请注意，这里还添加了两个属性。`#[account(zero_copy)]` 是一个需要加载的部分，我只是按照交换机示例中的建议进行操作的。

```rust
#[repr(packed)]
#[account(zero_copy)]
#[derive(Default)]
pub struct UserState {
  pub bump: u8,
  pub switchboard_state_bump: u8,
  pub vrf_permission_bump: u8,
  pub result_buffer: [u8; 32],
  pub vrf: Pubkey,
  pub user: Pubkey,
}
```

以上就是初始用户介绍的全部内容，我们可以继续深入了解了。
