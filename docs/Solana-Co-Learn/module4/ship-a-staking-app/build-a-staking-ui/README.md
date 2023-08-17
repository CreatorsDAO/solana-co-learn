---
sidebar_position: 77
sidebar_label: 构建一个质押用户界面
sidebar_class_name: green
---

# 构建一个质押用户界面

我们开始吧，让我们在我们的buildoors NFT项目上取得一些进展。在这个核心部分，我们有三件事情想要完成：

**1. 为我们的质押页面构建用户界面**

这就是我们的目标：

在你的前端项目中，在根目录下创建一个新的 `utils` 文件夹。然后创建一个名为 `instructions.ts` 的文件，并从NFT质押项目中复制/粘贴整个 `instructions.ts` 文件。由于代码超过200行，我就不在这里粘贴了。 😬

![](./img/j75QTYE.png)

请注意，“`STAKING 4 DAYS`”和“`READY TO STAKE`”这两个方块不会同时显示。只显示与当前NFT质押状态相关的方块。

如有必要，请使用模拟数据，并使界面大致符合你的要求。请注意，你的界面不需要完全像这样。请个性化定制。

**1.将实际的质押添加到我们的程序中**

记住，我们已经做了一些工作来存储状态，但程序实际上还没有抵押NFT或铸造BLD代币。我们会解决这个问题！

1. 一旦程序完全准备就绪，就是时候回到用户界面并让它开始工作了。

具体来说，“`claim $BLD`”，“`stake buildoor`”和“`unstake buildoor`”按钮应调用质押程序的相关指令。

---

像往常一样，独立尝试一下。这不是一项琐碎的任务，可能需要几个小时甚至更长时间。

一旦你完成了或者感觉到自己快要崩溃了，随时可以观看接下来的视频，这些视频将在下一课中展示一种可能的解决方案。

## 样式添加

回到构建更多的用户界面，首先我们将在我们的应用文件（`//pages/_app.tsx`）中为主题添加一些颜色。

```tsx
const colors = {
  background: "#1F1F1F",
  accent: "#833BBE",
  bodyText: "rgba(255, 255, 255, 0.75)",
  secondaryPurple: "#CB8CFF",
  containerBg: "rgba(255, 255, 255, 0.1)",
  containerBgSecondary: "rgba(255, 255, 255, 0.05)",
  buttonGreen: "#7EFFA7",
}
```

## 新薄荷路由

我们将导航到`NewMint`文件（`//pages/newMint.tsx`），以实现 `handleClick` 函数，该函数将在质押后路由到新页面。

首先，让我们称之为 `useRouter` ，不要忘记检查那些讨厌的导入。

`const router = useRouter()`

现在跳转到这个异步函数的事件，并路由到我们的新页面，我们将其称为 `stake` 。我们还将传递图片，因为我们已经从图片源获取到了，所以不需要再次加载。

```tsx
const handleClick: MouseEventHandler<HTMLButtonElement> = useCallback(
    async (event) => {
      router.push(`/stake?mint=${mint}&imageSrc=${metadata?.image}`)
    },
    [router, mint, metadata]
  )
```

唉，目前这是一条无效的路径，会给我们一个错误，所以让我们去创建实际的页面。这将是一个新的文件，位于页面目录下（`//pages/stake.tsx`）。

## 质押着陆页，左半部分

让我们为 `Stake` 创建一个`NextPage`，并确保导入了`'next'`库。

```tsx
const Stake: NextPage<StakeProps> = ({ mint, imageSrc }) => {
    return(
    <div></div>
    )
}
```

让我们来制作那些非常重要的道具。

```tsx
interface StakeProps {
  mint: PublicKey
  imageSrc: string
}
```

好的，我们在这里继续前进，所以...快速检查一下 `npm run dev` ，确保前端正常渲染。

如果你一直在大量制造糖果，你可能想要重置你的糖果机。🍬📠

事情正在变得不错。

从前端简短的休息...最佳实践是创建环境变量，你可以在前端中使用。在顶级目录下创建一个 `env.local` 文件，并使用以下格式
使用 `NEXT_PUBLIC_<name of what you want>` 来命名你的变量，然后它将被注入到浏览器端的代码中，这样你就可以在你的文件中使用它。然后继续替换你代码中的硬编码键。

回到赌注页面...让我们来解决我们实际想要在页面上呈现的内容。我们将使用一些来自 Chakra 的项目，请确保你的导入正在自动完成，或手动添加它们。如果你是前端大师，随意在这里进行设计演进，否则只需跟随我的精美像素技巧。👾👾👾

很多内容与我们之前为其他页面所做的类似，以下是需要注意的几个项目：

- 1. 有一个与 `isStaking` 相关的押注检查，它决定页面上显示"`STAKING`"还是"`UNSTAKED`"。这需要一个 `useState` ，初始设置为 `false` 。

`const [isStaking, setIsStaking] = useState(false)`

- 2. 我们想要显示抵押者的等级，所以需要另一个`useState`。

`const [level, setLevel] = useState(1)`


让我们再做一个 `npm run dev` ……嗯，是的，我们需要一些道具，这样页面在我们首次访问时可以显示一张图片，所以让我们确保在文件底部调用`getInitialProps`函数：

```ts
Stake.getInitialProps = async ({ query }: any) => {
  const { mint, imageSrc } = query

  if (!mint || !imageSrc) throw { error: "no mint" }

  try {
    const mintPubkey = new PublicKey(mint)
    return { mint: mintPubkey, imageSrc: imageSrc }
  } catch {
    throw { error: "invalid mint" }
  }
}
```

## 质押页面，右半部分 && 质押选项展示组件

好的，我们已经完成了页面左半部分的大部分工作，现在让我们专注于右侧。我们需要另一个 VStack，在其中包含一些独立的逻辑，用于显示所需内容。所以，让我们创建一个名为 `StakeOptionsDisplay` 的独立组件（`//components/StakeOptionsDisplay.tsx`）。

这里一个明显的检查是看看buildoor是否正在进行中，我们可以从这个检查开始，并构建出`VStack`。

```tsx
export const StakeOptionsDisplay = ({
  isStaking,

}: {
  isStaking: boolean

}) => {
    return(
    )
}
```

在你按照设计规范进行操作的同时，我们将会在各个部分检查以下道具：

- 1. `isStaking`将显示抵押的天数，或者显示"准备抵押"
- 2. 已质押的天数，作为一个数字
- 3. 总收入，作为一个数字
- 4. 可申领的，作为一个数字

这是需要渲染的最终产品，适用于那些喜欢粘贴前端代码的人 :P

```tsx
return (
   <VStack
     bgColor="containerBg"
     borderRadius="20px"
     padding="20px 40px"
     spacing={5}
   >
     <Text
       bgColor="containerBgSecondary"
       padding="4px 8px"
       borderRadius="20px"
       color="bodyText"
       as="b"
       fontSize="sm"
     >
       {isStaking
         ? `STAKING ${daysStaked} DAY${daysStaked === 1 ? "" : "S"}`
         : "READY TO STAKE"}
     </Text>
     <VStack spacing={-1}>
       <Text color="white" as="b" fontSize="4xl">
         {isStaking ? `${totalEarned} $BLD` : "0 $BLD"}
       </Text>
       <Text color="bodyText">
         {isStaking ? `${claimable} $BLD earned` : "earn $BLD by staking"}
       </Text>
     </VStack>
     <Button
       onClick={isStaking ? handleClaim : handleStake}
       bgColor="buttonGreen"
       width="200px"
     >
       <Text as="b">{isStaking ? "claim $BLD" : "stake buildoor"}</Text>
     </Button>
     {isStaking ? <Button onClick={handleUnstake}>unstake</Button> : null}
   </VStack>
 )
```

正如你注意到的，我们需要为 `handleStake` 和 `handleClaim` 以及 `handleUnstake` 构建功能 - 我们将在本核心中稍后回到这些。

...然后回到桩文件（`//pages/stake.tsx`）导入这个组件和它所需的属性。



## 装备和战利品箱组件

最后，让我们为装备和战利品箱子构建另一个组件，我们可以称之为`ItemBox`（`//components/ItemBox.tsx`）。

这是一个相对简单的例子，只需跟随视频操作，随时可以与这个代码进行比较。

```tsx
import { Center } from "@chakra-ui/react"
import { ReactNode } from "react"

export const ItemBox = ({
  children,
  bgColor,
}: {
  children: ReactNode
  bgColor?: string
}) => {
  return (
    <Center
      height="120px"
      width="120px"
      bgColor={bgColor || "containerBg"}
      borderRadius="10px"
    >
      {children}
    </Center>
  )
}
```

就这样，随意调整，按照你的喜好设计。接下来我们将进入质押计划并添加代币相关内容。

干得不错，我们知道这变得更加复杂，还有很多详细的工作——慢慢来，检查代码，如果有什么不明白的地方，在`Discord上`联系我们。
