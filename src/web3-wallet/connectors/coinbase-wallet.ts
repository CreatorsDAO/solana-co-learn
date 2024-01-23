import type {Chain} from '@wagmi/core/chains';
import {CoinbaseWalletConnector} from '@wagmi/core/connectors/coinbaseWallet';
import {IMAGES} from '@fd/const/images';
import {Wallet} from '@/wallets/utils/Wallet';
import {isIOS} from '@/wallets/utils/isMobile';

export interface CoinbaseWalletOptions {
  appName: string;
  chains: Chain[];
}

export const coinbaseWallet = ({appName, chains, ...options}: CoinbaseWalletOptions): Wallet => {
  const isCoinbaseWalletInjected =
    typeof window !== 'undefined' && typeof window.ethereum !== 'undefined' && (!!window.ethereum.providers?.some((p) => p.isCoinbaseWallet) || !!window.ethereum.isCoinbaseWallet);
  return {
    id: 'coinbase',
    name: 'Coinbase',
    shortName: 'Coinbase',
    installed: isCoinbaseWalletInjected,
    iconUrl: IMAGES.coinbase,
    downloadUrls: {
      android: 'https://play.google.com/store/apps/details?id=org.toshi',
      ios: 'https://apps.apple.com/us/app/coinbase-wallet-store-crypto/id1278383455',
      mobile: 'https://coinbase.com/wallet/downloads',
      qrCode: 'https://coinbase-wallet.onelink.me/q5Sx/fdb9b250',
      chrome: 'https://chrome.google.com/webstore/detail/coinbase-wallet-extension/hnfanknocfeofbddgcijnmhnfnkdnaad',
      browserExtension: 'https://coinbase.com/wallet',
    },
    createConnector() {
      const ios = isIOS();
      const connector = new CoinbaseWalletConnector({
        chains,
        options: {
          appName,
          headlessMode: true,
          ...options,
        },
      });

      const getUri = async () => {
        const provider = await connector.getProvider();
        return provider.qrUrl as string;
      };

      return {
        connector,
        mobile: {
          getUri: ios ? undefined : getUri,
        },
        qrCode: ios ? undefined : {getUri},
      };
    },
  };
};
