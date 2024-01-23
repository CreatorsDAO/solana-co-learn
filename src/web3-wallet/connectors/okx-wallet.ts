import type {InjectedConnectorOptions} from '@wagmi/core';
import type {Chain} from '@wagmi/core/chains';
import {InjectedConnector} from '@wagmi/core/connectors';
import {Wallet} from '@/wallets/utils/Wallet';
import type {WalletConnectConnectorOptions, WalletConnectLegacyConnectorOptions} from '@/wallets/utils/getWalletConnectConnector';
import {getWalletConnectConnector} from '@/wallets/utils/getWalletConnectConnector';
import {getWalletConnectUri} from '@/wallets/utils/getWalletConnectUri';
import {isAndroid} from '@/wallets/utils/isMobile';
import {IMAGES} from '@fd/const/images';

export interface OKXWalletLegacyOptions {
  projectId?: string;
  chains: Chain[];
  walletConnectVersion: '1';
  walletConnectOptions?: WalletConnectLegacyConnectorOptions;
}

export interface OKXWalletOptions {
  projectId: string;
  chains: Chain[];
  walletConnectVersion?: '2';
  walletConnectOptions?: WalletConnectConnectorOptions;
}

export const okxWallet = ({chains, projectId, walletConnectOptions, ...options}: OKXWalletOptions & InjectedConnectorOptions): Wallet => {
  const isOKXInjected =
    typeof window !== 'undefined' &&
    // @ts-expect-error
    typeof window.okxwallet !== 'undefined';

  const shouldUseWalletConnect = !isOKXInjected;

  return {
    id: 'okxWallet',
    name: 'OKX Wallet',
    iconUrl: IMAGES.okxWallet,
    installed: !shouldUseWalletConnect ? isOKXInjected : undefined,
    downloadUrls: {
      android: 'https://play.google.com/store/apps/details?id=com.okinc.okex.gp',
      ios: 'https://itunes.apple.com/app/id1327268470?mt=8',
      mobile: 'https://okx.com/download',
      qrCode: 'https://okx.com/download',
      chrome: 'https://chrome.google.com/webstore/detail/okx-wallet/mcohilncbfahbmgdjkbpemcciiolgcge',
      edge: 'https://microsoftedge.microsoft.com/addons/detail/okx-wallet/pbpjkcldjiffchgbbndmhojiacbgflha',
      firefox: 'https://addons.mozilla.org/firefox/addon/okexwallet/',
      browserExtension: 'https://okx.com/download',
    },
    createConnector() {
      const connector = new InjectedConnector({
        chains,
        options: {
          // @ts-expect-error
          getProvider: () => window?.okxwallet,
          ...options,
        },
      });

      return {
        connector,
        mobile: {
          getUri: shouldUseWalletConnect
            ? async () => {
                const uri = await getWalletConnectUri(connector);
                return isAndroid() ? uri : `okex://main/wc?uri=${encodeURIComponent(uri)}`;
              }
            : undefined,
        },
        qrCode: shouldUseWalletConnect
          ? {
              getUri: async () => getWalletConnectUri(connector),
            }
          : undefined,
      };
    },
  };
};
