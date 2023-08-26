---
sidebar_position: 77
sidebar_label: 构建一个质押用户界面
sidebar_class_name: green
---

# 构建一个质押用户界面

让我们开始吧，我们要在我们的`buildoors NFT`项目上取得一些进展。在这个核心环节，我们希望完成三件事情：

1. 为质押页面构建用户界面

这就是我们的目标：

请在前端项目的根目录下创建一个新的 `utils` 文件夹。然后创建一个名为 `instructions.ts` 的文件，并从`NFT`质押项目中复制/粘贴整个 `instructions.ts` 文件。由于代码较长超过`200`行，所以在这里就不粘贴了。😬

![](./img/j75QTYE.png)

请注意，“`STAKING 4 DAYS`”和“`READY TO STAKE`”这两个方块不会同时显示，只会显示与当前`NFT`质押状态相关的方块。

如果需要，可以使用模拟数据来使界面大致符合你的要求。不过请注意，你的界面无需完全复制这个样子，可以根据需要进行个性化定制。

2. 将实际质押功能添加到程序中

别忘了，我们已经做了一些工作来存储状态，但程序还没有实际进行`NFT`质押或铸造`BLD`代币。我们将解决这个问题！

3. 一旦程序完全准备就绪，就可以回到用户界面并使其工作起来。

具体而言，“`claim $BLD`”，“`stake buildoor`”和“`unstake buildoor`”按钮应调用质押程序的相关指令。

---

像往常一样，你可以独立尝试。请注意，这不是一项简单的任务，可能需要几个小时甚至更长时间。

一旦你完成了，或者感觉快要困顿了，可以随时观看接下来的视频教程。在下一课中，我们将展示一种可能的解决方案。

## 添加样式

当我们回到用户界面构建时，首先要做的是在应用文件（`//pages/_app.tsx`）中为主题添加一些颜色。代码如下：

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

## 新建薄荷路由

我们将要在`NewMint`文件（`//pages/newMint.tsx`）中实现`handleClick`函数，这个函数将在质押后路由到新页面。

首先，我们来初始化路由，命名为`useRouter`，并且别忘了检查那些可能遗漏的导入。

`const router = useRouter()`

接下来我们来实现这个异步事件处理函数，并路由到我们新命名为`stake`的页面。我们还将传递图片，因为我们已经从图片源获取了它，所以不需要再次加载。

```tsx
const handleClick: MouseEventHandler<HTMLButtonElement> = useCallback(
    async (event) => {
      router.push(`/stake?mint=${mint}&imageSrc=${metadata?.image}`)
    },
    [router, mint, metadata]
  )
```

呀，当前这是一条无效的路径，会导致一个错误，所以让我们创建这个实际的页面。这将是一个新的文件，位于页面目录下（`//pages/stake.tsx`）。

## 质押着陆页面，左半部分

让我们为`Stake`创建一个`NextPage`，并确保已经导入了`'next'`库。

```tsx
const Stake: NextPage<StakeProps> = ({ mint, imageSrc }) => {
    return(
    <div></div>
    )
}
```

现在，让我们定义一些重要的属性。

```tsx
interface StakeProps {
  mint: PublicKey
  imageSrc: string
}
```

好的，我们继续前进。不妨快速检查一下`npm run dev`，确保前端正常渲染。

如果你一直在忙着制造糖果，你可能会想要重置你的糖果机。🍬📠

一切进展顺利。

稍事休息，我们来谈谈前端的最佳实践。在顶级目录下创建一个`env.local`文件，并使用格式`NEXT_PUBLIC_<变量名>`来命名你的变量。这样它就会被注入到浏览器端的代码中，你就可以在文件中使用它。然后可以继续替换代码中的硬编码键值。

回到质押页面，让我们开始构建我们实际想要在页面上显示的内容。我们将使用一些来自`Chakra`的组件，请确保你的导入正在自动完成，或者手动添加它们。如果你是前端专家，可以自由设计，否则可以跟随我的精美像素设计。👾👾👾

有一些与我们之前为其他页面做的事情相似的部分，以下是需要注意的几点：

1. 这里有一个与`isStaking`相关的押注检查，它会决定页面上显示"`STAKING`"还是"`UNSTAKED`"。你需要一个`useState`，并初始设置为`false`。

`const [isStaking, setIsStaking] = useState(false)`

2. 我们想要显示抵押者的等级，所以需要另一个`useState`。

`const [level, setLevel] = useState(1)`

再次运行`npm run dev`…哦对，我们需要一些属性，这样在我们首次访问时页面就可以显示一张图片。所以，让我们确保在文件底部调用了`getInitialProps`函数：

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

好的，左半部分的工作已经完成，现在我们来专注于右侧。我们需要一个名为 `VStack` 的容器，在其中包括一些用于展示所需内容的独立逻辑。因此，让我们创建一个独立组件，命名为 `StakeOptionsDisplay`（`//components/StakeOptionsDisplay.tsx`）。

首先，我们从一个明显的检查开始，检查是否正在抵押，并在`VStack`中构建起来。

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

在你遵循设计规范的同时，我们将在各个部分检查以下属性：

1. `isStaking`会显示抵押的天数，或者显示"准备抵押"
2. 已质押的天数，作为数字
3. 总收入，作为数字
4. 可申领的，作为数字

以下是渲染的最终产品，适合那些喜欢粘贴前端代码的人 :P

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
         ? `正在质押 ${daysStaked} 天${daysStaked === 1 ? "" : "S"}`
         : "准备质押"}
     </Text>
     <VStack spacing={-1}>
       <Text color="white" as="b" fontSize="4xl">
         {isStaking ? `${totalEarned} $BLD` : "0 $BLD"}
       </Text>
       <Text color="bodyText">
         {isStaking ? `${claimable} $BLD 已赚取` : "通过质押赚取 $BLD"}
       </Text>
     </VStack>
     <Button
       onClick={isStaking ? handleClaim : handleStake}
       bgColor="buttonGreen"
       width="200px"
     >
       <Text as="b">{isStaking ? "申领 $BLD" : "质押buildoor"}</Text>
     </Button>
     {isStaking ? <Button onClick={handleUnstake}>取消质押</Button> : null}
   </VStack>
 )
```

如你所见，我们需要构建`handleStake`、`handleClaim`和`handleUnstake`的功能，稍后我们将回到这些。

...接着回到质押文件（`//pages/stake.tsx`）导入该组件和所需的属性。

## 装备和战利品箱组件

最后，我们来为装备和战利品箱构建另一个组件，可以称之为 `ItemBox`（`//components/ItemBox.tsx`）。

这是一个相对简单的案例，你只需按照视频操作，并可以随时与此代码进行比较。

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

就这样，随意调整，根据你的喜好进行设计。接下来，我们将深入质押计划，并添加与代币相关的内容。

做得很好，我们知道事情变得更复杂了，还有许多细致的工作要做——慢慢来，检查代码，如果有什么不明白的地方，在`Discord`上与我们联系。
