---
sidebar_position: 24
sidebar_label: 💻 构建一个NFT铸造器前端
sidebar_class_name: green
---


# 💻 构建 NFT 铸造者前端

欢迎来到第一周的SHIPPING环节。每周，你都会有一个特定的部分，用来将你所学的内容应用到自定义的NFT质押应用程序上，并且还有战利品箱子等你拿！

这些部分的核心目的是鼓励你走出本地开发环境，构建真实的、可以供他人使用的项目。许多成功的构建者都是通过在公众面前展示和开发他们的作品而获得成功的。这是你一直在准备的时刻——让我们开始吧🤘。

今天，我们要开始从前端制作那些炫酷的登录和铸造页面。

![](./img/upload_1.png)

在第一个屏幕上，唯一的功能是连接到用户的钱包。你可以通过屏幕顶部的按钮或中间的按钮来实现。

![](./img/upload_2.png)

第二个屏幕的功能将在下一个核心项目中实现，所以不必为“mint buildoor”按钮实现任何功能。

## 🕸 项目设置

我们将从零开始，没有模板！设置一个新的 Next.js 应用程序，并向其中添加 Chakra UI：

```bash
npx create-next-app --typescript
cd <you-project-name>
npm i @chakra-ui/react @emotion/react@^11 @emotion/styled@^11 framer-motion@^6 @chakra-ui/icons
npm i @solana/wallet-adapter-base @solana/wallet-adapter-react @solana/wallet-adapter-react-ui @solana/wallet-adapter-wallets @solana/web3.js
```

注意：在整个项目中，我们将使用Typescript！当然，如果你更喜欢，完全可以使用普通的Javascript :)。

如果系统要求安装 `create-next-app`，请确认安装。你可以为你的应用程序取任何你想要的名字，比如我就给我的应用程序命名为“构建器”，哈哈。

下一步，你可能想添加一些视觉素材。你可以在[这里](https://cdn.disco.co/media%2FAssets_a68f5cab-20c9-45c7-b25c-43bc9dcd9e7d.zip)找到资源包，也可以自己创建。包里有五个“头像”文件和一个背景的svg文件。请将它们放入项目的公共文件夹中。

现在，一切准备就绪，让我们开始构建吧！🚀

## ✨ 设置 Chakra UI

第一个任务是设置 Chakra UI，这样我们就不必手动编写大量 CSS。我们将在 `pages/_app.tsx` 中执行此操作：

```ts
import type { AppProps } from "next/app"
import { ChakraProvider } from "@chakra-ui/react"

import { extendTheme } from "@chakra-ui/react"

const colors = {
  background: "#1F1F1F",
  accent: "#833BBE",
  bodyText: "rgba(255, 255, 255, 0.75)",
}

const theme = extendTheme({ colors })

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
        <Component {...pageProps} />
    </ChakraProvider>
  )
}

export default MyApp
```

我要为我的一些定制颜色，请确保您按照自己的喜好来调味！

## 🌶 添加一些样式

打开 `styles/Home.module.css` 并使其看起来像这样：

```css
.container {
  background: #1F1F1F;
}
.wallet-adapter-button-trigger {
  background-color: #833BBE;
}
```

如果样式文件夹中有 `globals.css` 文件，请将其删除。我们不会需要它！

接下来我们有 `index.tsx` ，我们将更新导入以使用 Chakra UI 并渲染（单个 `<div className={styles.container}` 除外）。然后将导入更新为：

```ts
import { Box, Center, Spacer, Stack } from "@chakra-ui/react"
import type { NextPage } from "next"
import Head from "next/head"
import styles from "../styles/Home.module.css"

const Home: NextPage = () => {

  return (
    <div className={styles.container}>
      <Head>
        <title>Buildoors</title>
        <meta name="The NFT Collection for Buildoors" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Box
        w="full"
        h="calc(100vh)"
        bgImage={"url(/home-background.svg)"}
        backgroundPosition="center"
      >
        <Stack w="full" h="calc(100vh)" justify="center">
					{ /* NavBar */ }

          <Spacer />
          <Center>
						{ /* If connected, the second view, otherwise the first */ }
                </Center>
          <Spacer />

          <Center>
            <Box marginBottom={4} color="white">
              <a
                href="https://twitter.com/_buildspace"
                target="_blank"
                rel="noopener noreferrer"
              >
                built with @_buildspace
              </a>
            </Box>
          </Center>
        </Stack>
      </Box>
    </div>
  )
}

export default Home
```

## 🎫 添加导航栏

现在让我们来构建 `NavBar` 。创建一个 `components` 文件夹并添加一个新文件 `NavBar.tsx` 。我们将其构建为一个水平堆栈，其中包括一个间隔器和一个用于连接钱包的按钮：

```ts
import { HStack, Spacer } from "@chakra-ui/react"
import { FC } from "react"
import styles from "../styles/Home.module.css"
import dynamic from "next/dynamic";

const WalletMultiButtonDynamic = dynamic(
	async () =>
		(await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
	{ ssr: false }
);

const NavBar: FC = () => {
  return (
    <HStack width="full" padding={4}>
      <Spacer />
			<WalletMultiButtonDynamic className={styles["wallet-adapter-button-trigger"]}/>
    </HStack>
  )
}

export default NavBar
```

我们有 `import dynamic from "next/dynamic"` 从 `@solana/wallet-adapter-react-ui` 动态导入 `WalletMultiButton` 并将其分配给 `WalletMultiButtonDynamic` ，如下所示：

```ts
const WalletMultiButtonDynamic = dynamic(
	async () =>
		(await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
	{ ssr: false }
);
```

这是因为 NextJS 是服务器端渲染，在加载到客户端之前无法访问依赖于浏览器 API（如 window ）的外部依赖项或组件。这意味着 NextJS 无法与只能在浏览器上使用的钱包进行交互。 `{ ssr: false }` 禁用导入的服务器渲染。如果您的模块不使用动态导入，您很可能会遇到 `Hydration failed because the initial UI does not match what was rendered on the server `。您可以在[这里](https://nextjs.org/docs/advanced-features/dynamic-import?utm_source=buildspace.so&utm_medium=buildspace_project)阅读有关动态导入的更多信息！

返回到 `index.tsx` ，导入 `NavBar` 并将其放在堆栈顶部（我留下了关于它应该在哪里的评论）：

```ts
// Existing imports
import NavBar from "../components/NavBar"

const Home: NextPage = () => {

  return (
    <div className={styles.container}>
      <Head>

      <Box
        w="full"
        h="calc(100vh)"
        bgImage={"url(/home-background.svg)"}
        backgroundPosition="center"
      >
        <Stack w="full" h="calc(100vh)" justify="center">
         { /* NavBar */ }
          <NavBar />

// Rest of the file remains the same
```

此时，除了“`Connect Wallet`”之外，您在 `localhost:3000` 上仍然没有任何内容。让我们解决这个问题。

## 🏠 创建登陆页面

在 `components` 文件夹中创建 `Disconnected.tsx` 文件并添加以下内容：

```ts
import { FC, MouseEventHandler, useCallback } from "react"
import {
  Button,
  Container,
  Heading,
  HStack,
  Text,
  VStack,
} from "@chakra-ui/react"
import { ArrowForwardIcon } from "@chakra-ui/icons"

const Disconnected: FC = () => {

  const handleClick: MouseEventHandler<HTMLButtonElement> = useCallback(
    (event) => {
      if (event.defaultPrevented) {
        return
      }
    },
    []
  )

  return (
    <Container>
      <VStack spacing={20}>
        <Heading
          color="white"
          as="h1"
          size="3xl"
          noOfLines={2}
          textAlign="center"
        >
          Mint your buildoor. Earn $BLD. Level up.
        </Heading>
        <Button
          bgColor="accent"
          color="white"
          maxW="380px"
          onClick={handleClick}
        >
          <HStack>
            <Text>become a buildoor</Text>
            <ArrowForwardIcon />
          </HStack>
        </Button>
      </VStack>
    </Container>
  )
}

export default Disconnected
```

这将是我们的登陆页面 - 用户访问网站时首先看到的视图。您需要将其导入到 `index.tsx` 中，并将其放置在渲染组件的中间（再次查找注释）。

```ts
// Existing imports
import Disconnected from '../components/Disconnected'

const Home: NextPage = () => {

  return (
    <div className={styles.container}>
      <Head>

      <Box
        w="full"
        h="calc(100vh)"
        bgImage={"url(/home-background.svg)"}
        backgroundPosition="center"
      >
        <Stack w="full" h="calc(100vh)" justify="center">
         { /* NavBar */ }
          <NavBar />

          <Spacer />
          <Center>
            <Disconnected />
          </Center>
          <Spacer />

// Rest of the file remains the same
```

现在，如果您查看 `localhost:3000` ，您应该会看到带有“成为 buildoor”按钮的登录页面。如果你点击它，什么也不会发生。我们不喜欢什么都没有发生，让我们解决这个问题！

## 🔌 连接到用户的钱包

我们这里需要很多钩子。让我们把它们带进来：

```bash
npm i @solana/wallet-adapter-base @solana/wallet-adapter-react @solana/wallet-adapter-react-ui @solana/wallet-adapter-wallets @solana/web3.js
```

如果您正在为特定的钱包进行构建，那么您可以在此处进行更改，我只是坚持使用默认值：D

在 `components` 中创建一个 `WalletContextProvider.tsx` ，这样我们就可以将所有这些样板文件放入其中：

```ts
import { FC, ReactNode } from "react"
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react"
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui"
import { clusterApiUrl } from "@solana/web3.js"
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets"
import { useMemo } from "react"
require("@solana/wallet-adapter-react-ui/styles.css")

const WalletContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const url = useMemo(() => clusterApiUrl("devnet"), [])
  const phantom = new PhantomWalletAdapter()

  return (
    <ConnectionProvider endpoint={url}>
      <WalletProvider wallets={[phantom]}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

export default WalletContextProvider
```

我们需要将其导入 `_app.tsx` ：

```ts
import WalletContextProvider from '../components/WalletContextProvider'

<ChakraProvider theme={theme}>
	<WalletContextProvider>
		<Component {...pageProps} />
	</WalletContextProvider>
</ChakraProvider>
```

现在我们还希望“成为建造者”按钮也能与您联系。在 `Disconnected.tsx` 中，添加这些导入

```ts
import { useWalletModal } from "@solana/wallet-adapter-react-ui"
import { useWallet } from "@solana/wallet-adapter-react"
```

然后在渲染之前将 `Disconnected` 的主体更新为以下内容：

```ts
const modalState = useWalletModal()
  const { wallet, connect } = useWallet()

  const handleClick: MouseEventHandler<HTMLButtonElement> = useCallback(
    (event) => {
      if (event.defaultPrevented) {
        return
      }

      if (!wallet) {
        modalState.setVisible(true)
      } else {
        connect().catch(() => {})
      }
    },
    [wallet, connect, modalState]
  )
```

瞧，您应该能够连接了！

## 🎇 创建连接视图

现在我们可以连接了，我们需要更新视图以显示连接时的样子。让我们在 `components` 目录中创建一个 `Connected.tsx` 文件

```ts
import { FC } from "react"
import {
  Button,
  Container,
  Heading,
  HStack,
  Text,
  VStack,
  Image,
} from "@chakra-ui/react"
import { ArrowForwardIcon } from "@chakra-ui/icons"

const Connected: FC = () => {
  return (
    <VStack spacing={20}>
      <Container>
        <VStack spacing={8}>
          <Heading
            color="white"
            as="h1"
            size="2xl"
            noOfLines={1}
            textAlign="center"
          >
            Welcome Buildoor.
          </Heading>

          <Text color="bodyText" fontSize="xl" textAlign="center">
            Each buildoor is randomly generated and can be staked to receive
            <Text as="b"> $BLD</Text> Use your <Text as="b"> $BLD</Text> to
            upgrade your buildoor and receive perks within the community!
          </Text>
        </VStack>
      </Container>

      <HStack spacing={10}>
        <Image src="avatar1.png" alt="" />
        <Image src="avatar2.png" alt="" />
        <Image src="avatar3.png" alt="" />
        <Image src="avatar4.png" alt="" />
        <Image src="avatar5.png" alt="" />
      </HStack>

      <Button bgColor="accent" color="white" maxW="380px">
        <HStack>
          <Text>mint buildoor</Text>
          <ArrowForwardIcon />
        </HStack>
      </Button>
    </VStack>
  )
}

export default Connected
```

现在我们必须找到一种方法将其显示在屏幕上。回到 `index.tsx` ，让我们添加两个导入：

```ts
import { useWallet } from "@solana/wallet-adapter-react"
import Connected from "../components/Connected"
```

现在我们可以使用 `useWallet` hooks来访问一个变量，告诉我们是否已连接。我们可以使用它来有条件地渲染 `Connected` 与 `Disconnected` 视图。


```ts
const Home: NextPage = () => {
  const { connected } = useWallet()

  return (
    <div className={styles.container}>
      <Head>
        <title>Buildoors</title>
        <meta name="The NFT Collection for Buildoors" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Box
        w="full"
        h="calc(100vh)"
        bgImage={connected ? "" : "url(/home-background.svg)"}
        backgroundPosition="center"
      >
        <Stack w="full" h="calc(100vh)" justify="center">
          <NavBar />

          <Spacer />
          <Center>{connected ? <Connected /> : <Disconnected />}</Center>
          <Spacer />
```


好了，我们搞定了！我们已经设置好了前端，并且正在顺利地进行buildoors的铸造。
