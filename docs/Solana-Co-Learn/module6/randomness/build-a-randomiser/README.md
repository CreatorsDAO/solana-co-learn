---
sidebar_position: 104
sidebar_label: 👁‍🗨 构建一个随机器
sidebar_class_name: green
---

# 👁‍🗨 构建一个随机器

> Switchboard设置的步骤解析 🚶🏽🔀

## 概述


我们将使用Switchboard构建一个基本的程序来请求随机性。在这个视频中，我们将专注于在我们的测试环境中设置Switchboard的客户端。

我们首先要进行交换机设置，这个设置在[/tests/utils/setupSwitchboard.ts](https://github.com/Unboxed-Software/anchor-nft-staking-program/blob/solution-randomize-loot/tests/utils/setupSwitchboard.ts?utm_source=buildspace.so&utm_medium=buildspace_project)文件中。

这是我们用来运行测试的设置。他们的文档非常简洁，但对于随机化部分，我们应该足够了解。

让我们来回顾一下代码，这里是我们需要的三个导入项。

```ts
import { SwitchboardTestContext } from "@switchboard-xyz/sbv2-utils"
import * as anchor from "@project-serum/anchor"
import * as sbv2 from "@switchboard-xyz/switchboard-v2"
```

对于实际功能，你会注意到我们传入的三个项目是提供者、战利品箱计划和付款人。

我们要做的第一件事是加载devnet队列，这为我们提供了一个在devnet上进行测试的环境。ID是switchboard的程序ID，而100,000,000是switchboard代币，我们需要访问它们的内容。

```ts
export const setupSwitchboard = async (provider, lootboxProgram, payer) => {

    const switchboard = await SwitchboardTestContext.loadDevnetQueue(
      provider,
      "F8ce7MsckeZAbAGmxjJNetxYXQa9mKr9nnrC3qKubyYy",
      100_000_000
    )
```

然后我们有一堆日志来确保一切都准备就绪。

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
`\u2714 Switchboard devnet environment loaded successfully\n`
);
```

上述的const状态是关键组件，它加载了我们需要的交换机队列数据，我们将在函数的其余部分中使用它。

然后我们创建我们的验证随机函数（VRF）账户。这对于我们使用的交换机板的部分非常特殊。正如您所看到的，它会生成一个新的密钥对。



```ts
// CREATE VRF ACCOUNT
// keypair for vrf account
const vrfKeypair = anchor.web3.Keypair.generate()
```

作为创建VRF账户的一部分，我们需要访问一些PDA设备。



```ts
// find PDA used for our client state pubkey
const [userState] = anchor.utils.publicKey.findProgramAddressSync(
[vrfKeypair.publicKey.toBytes(), payer.publicKey.toBytes()],
lootboxProgram.programId
)

// lootboxPointerPda for callback
const [lootboxPointerPda] = anchor.web3.PublicKey.findProgramAddressSync(
[Buffer.from("lootbox"), payer.publicKey.toBuffer()],
lootboxProgram.programId
)
```

你会看到我们正在使用vrf和payer的公钥作为种子。在生产环境中，这些将需要是静态的，只有payer的公钥。这段代码确保我们每次运行测试时都有不同的vrf密钥对和用户状态，这样我们在测试过程中不会遇到尝试重新创建已经创建过的账户的问题。

现在我们可以使用sbv2库创建VRF账户，传入交换机程序、我们想要给VRF账户的密钥对、用户状态PDA作为授权、交换机队列和回调函数。

所以，当我们想要一个新的随机数时，我们将通过与交换机程序进行CPI来获取一个随机数，并且它必须知道我们程序中的一条指令来进行CPI返回，以给我们随机数。与所有指令一样，它有一个程序ID，一个账户列表和指令数据。至于账户，第一个是用来为我们写入数据的地方，然后是vrf账户，我们将在其中写入已选择的mint的lootbox指针PDA，最后是付款人。

```ts
// create new vrf acount
  const vrfAccount = await sbv2.VrfAccount.create(switchboard.program, {
    keypair: vrfKeypair,
    authority: userState, // set vrfAccount authority as PDA
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

接下来我们创建一个所谓的权限账户。

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

权限字段是我们从上面的队列中获取的加载数据。这将在交换机中为我们的vrf账户授予权限。

接下来，我们将更改权限为我们，将权限设置为付款方。

```ts
// If queue requires permissions to use VRF, check the correct authority was provided
  if (!unpermissionedVrfEnabled) {
    if (!payer.publicKey.equals(authority)) {
      throw new Error(
        `queue requires PERMIT_VRF_REQUESTS and wrong queue authority provided`
      )
    }

    await permissionAccount.set({
      authority: payer,
      permission: sbv2.SwitchboardPermission.PERMIT_VRF_REQUESTS,
      enable: true,
    })
  }
```

由于我们稍后需要切换板账户的提升，我们将其提取出来，以及switchboardStateBump，这是切换板的程序账户。

```ts
// GET PERMISSION BUMP AND SWITCHBOARD STATE BUMP
  const [_permissionAccount, permissionBump] = sbv2.PermissionAccount.fromSeed(
    switchboard.program,
    authority,
    switchboard.queue.publicKey,
    vrfAccount.publicKey
  )

  const [switchboardStateAccount, switchboardStateBump] =
    sbv2.ProgramStateAccount.fromSeed(switchboard.program)
```

这是我们进行测试与我们的程序和交换机互动所需的所有数据，我们将在最后返回。

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

我们最终在我们的测试环境设置中调用整个函数，所以我们的before现在看起来是这样的。

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

这是关于客户端交换机所需的基本知识。

## init_user指令的详细步骤 👶

首先，对于我们的战利品箱计划，我们之前把所有东西都放在 lib.rs 里，但是它变得越来越庞大且难以控制，所以现在我们对其进行了拆分，请[查看](https://github.com/Unboxed-Software/anchor-nft-staking-program/tree/solution-randomize-loot/programs/lootbox-program?utm_source=buildspace.so&utm_medium=buildspace_project)文件结构。

现在的lib文件主要只是一堆use语句、declare id宏和我们的四个指令，它们只是调用其他文件而已。

Init_user将创建用户状态账户，我们将在我们的程序和交换机之间共享该账户，它就像一个联络账户。

打开战利品箱与以前一样，它将启动生成随机货币的过程，但不会完成该过程，而是生成一个CPI来呼叫交换机以请求一个随机数。

消耗随机性是由交换机调用的，以返回指令中的号码，以便我们可以使用它，并在设置薄荷时完成该过程。

从战利品箱中获取物品基本上没有改变。

让我们开始吧，首先是init_user。

在顶部，您会找到初始用户上下文，在底部是一个实现，其中有一个名为process instruction的函数，在该函数中执行了之前在lib文件中的逻辑。

在InitUser上下文中有四个账户。状态是我们的用户状态对象，其中包含vrf和payer密钥种子，这是用于测试的版本。对于生产代码，您只需要payer种子。我们这样做是为了节省时间，而不是使用环境变量。然后有vrf账户，switchboard不会自动加载它，因此需要使用.load()调用来加载。可能有其他使用switchboard的方法，但我们目前使用的是最简单/最快的路径来启动和运行，随时可以探索和改进它。最后，我们有payer和system程序来创建一个新账户。

```ts
use crate::*;

#[derive(Accounts)]
#[instruction(params: InitUserParams)]
pub struct InitUser<'info> {
  #[account(
        init,
        // TESTING - Comment out these seeds for testing
        // seeds = [
        //     payer.key().as_ref(),
        // ],
        // TESTING - Uncomment these seeds for testing
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

对于逻辑部分，我们正在获取一个名为state的账户，因为我们设置了bump、switchboard state bump、vrf permission bump、vrf账户以及与之关联的用户。你会注意到有一个结构体，它只包含我们之前提到的这两个bump。

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

让我们快速查看一下用户状态文件，这样我们就知道它是什么。

这里的新东西是结果缓冲区。这是我们提取随机性的地方，他们将其作为一个32字节的随机数据数组发送给我们，我们可以将其转化为我们需要的任何随机性。

请注意，这里添加了两个属性， [account(zero_copy)] 是需要加载的部分，我只是按照交换机示例中的建议使用了它。

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

...这就是对于初始用户的介绍，我们继续前进吧。
