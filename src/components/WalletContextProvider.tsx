// import { FC, ReactNode, useMemo } from "react"
// import {
//   ConnectionProvider,
//   WalletProvider,
// } from "@solana/wallet-adapter-react"
// import { WalletModalProvider } from "@solana/wallet-adapter-react-ui"
// import { clusterApiUrl } from "@solana/web3.js"
// import { BackPackWalletAdapter } from "@solana/wallet-adapter-wallets"
// require("@solana/wallet-adapter-react-ui/styles.css")

// const WalletContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
//   const url = useMemo(() => clusterApiUrl("devnet"), [])
//   const backpack = new BackPackWalletAdapter()

//   return (
//     <ConnectionProvider endpoint={url}>
//       <WalletProvider wallets={[backpack]}>
//         <WalletModalProvider>{children}</WalletModalProvider>
//       </WalletProvider>
//     </ConnectionProvider>
//   )
// }

// export default WalletContextProvider
