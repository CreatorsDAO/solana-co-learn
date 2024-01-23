import type {WalletConnectConnectorOptions} from '@/wallets/utils/getWalletConnectConnector';
import type {InjectedConnectorOptions} from '@wagmi/core';
import {Wallet} from '@/wallets/utils/Wallet';
import {IMAGES} from '@fd/const/images';
import {getWalletConnectUri} from '@/wallets/utils/getWalletConnectUri';
import {getWalletConnectConnector} from '@/wallets/utils/getWalletConnectConnector';
import {InjectedConnector} from '@wagmi/core/connectors';

export interface BitGetWalletOptions {
  projectId: string;
  chains: Chain[];
  walletConnectVersion?: '2';
  walletConnectOptions?: WalletConnectConnectorOptions;
}

export const bitGetWallet = ({chains, projectId, walletConnectOptions, walletConnectVersion = '2', ...options}: BitGetWalletOptions & InjectedConnectorOptions): Wallet => {
  const isBitKeepInjected =
    typeof window !== 'undefined' &&
    // @ts-expect-error
    window.bitkeep !== undefined &&
    // @ts-expect-error
    window.bitkeep.ethereum !== undefined &&
    // @ts-expect-error
    window.bitkeep.ethereum.isBitKeep === true;

  const shouldUseWalletConnect = !isBitKeepInjected;
  return {
    id: 'bitGet',
    name: 'Bitget Wallet',
    iconUrl: IMAGES.bitGet,
    installed: !shouldUseWalletConnect ? isBitKeepInjected : undefined,
    downloadUrls: {
      android: 'https://bitkeep.com/en/download?type=2',
      ios: 'https://apps.apple.com/app/bitkeep/id1395301115',
      mobile: 'https://bitkeep.com/en/download?type=2',
      qrCode: 'https://bitkeep.com/en/download',
      chrome: 'https://chrome.google.com/webstore/detail/bitkeep-crypto-nft-wallet/jiidiaalihmmhddjgbnbgdfflelocpak',
      browserExtension: 'https://bitkeep.com/en/download',
    },
    createConnector: () => {
      const connector = new InjectedConnector({
        chains,
        options: {
          // @ts-expect-error
          getProvider: () => window?.bitkeep?.ethereum,
          ...options,
        },
      } as any);

      const getUri = async () => {
        const uri = await getWalletConnectUri(connector, walletConnectVersion);

        return isAndroid() ? uri : `bitkeep://wc?uri=${encodeURIComponent(uri)}`;
      };

      return {
        connector,
        mobile: {
          getUri: shouldUseWalletConnect ? getUri : undefined,
        },
        qrCode: shouldUseWalletConnect
          ? {
              getUri: async () => getWalletConnectUri(connector, walletConnectVersion),
            }
          : undefined,
      };
    },
  };
};
