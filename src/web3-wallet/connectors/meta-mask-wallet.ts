import {Chain} from '@wagmi/core';
import type {MetaMaskConnectorOptions} from '@wagmi/core/connectors/metaMask';
import {MetaMaskConnector} from '@wagmi/core/connectors/metaMask';
import {Wallet} from '@/wallets/utils/Wallet';
import {getWalletConnectConnector, WalletConnectConnectorOptions} from '@/wallets/utils/getWalletConnectConnector';
import {getWalletConnectUri} from '@/wallets/utils/getWalletConnectUri';
import {isAndroid, isIOS} from '@/wallets/utils/isMobile';
import {IMAGES} from '@fd/const/images';

export interface MetaMaskWalletOptions {
  projectId?: string;
  chains: Chain[];
  walletConnectOptions?: WalletConnectConnectorOptions;
}

export const metaMaskWallet = ({chains, projectId, walletConnectOptions, ...options}: MetaMaskWalletOptions & MetaMaskConnectorOptions): Wallet => {
  const providers = typeof window !== 'undefined' && window.ethereum?.providers;

  const isMetaMaskInjected = typeof window !== 'undefined' && typeof window.ethereum !== 'undefined' && (!!window.ethereum.providers?.some(isMetaMask) || !!window.ethereum.isMetaMask);
  const shouldUseWalletConnect = !isMetaMaskInjected;
  return {
    id: 'metaMask',
    name: 'MetaMask',
    iconUrl: IMAGES.metaMask,
    installed: isMetaMaskInjected,
    downloadUrls: {
      android: 'https://play.google.com/store/apps/details?id=io.metamask',
      ios: 'https://apps.apple.com/us/app/metamask/id1438144202',
      mobile: 'https://metamask.io/download',
      qrCode: 'https://metamask.io/download',
      chrome: 'https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn',
      edge: 'https://microsoftedge.microsoft.com/addons/detail/metamask/ejbalbakoplchlghecdalmeeeajnimhm',
      firefox: 'https://addons.mozilla.org/firefox/addon/ether-metamask',
      opera: 'https://addons.opera.com/extensions/details/metamask-10',
      browserExtension: 'https://metamask.io/download',
    },
    createConnector() {
      const connector = new MetaMaskConnector({
        chains,
        options: {
          // @ts-ignore
          getProvider: () => (providers ? providers.find(isMetaMask) : typeof window !== 'undefined' ? window.ethereum : undefined),
          ...options,
        },
      }) as any;

      const getUri = async () => {
        const uri = await getWalletConnectUri(connector, '2');
        return isAndroid() ? uri : isIOS() ? `metamask://wc?uri=${encodeURIComponent(uri)}` : `https://metamask.app.link/wc?uri=${encodeURIComponent(uri)}`;
      };
      return {
        connector,
        mobile: shouldUseWalletConnect ? {getUri} : undefined,
        qrCode: shouldUseWalletConnect ? {getUri} : undefined,
      };
    },
  };
};

function isMetaMask(ethereum?: typeof window['ethereum']): boolean {
  if (!ethereum?.isMetaMask) return false;
  if (ethereum.isBraveWallet && !ethereum._events && !ethereum._state) return false;
  if (ethereum.isApexWallet) return false;
  if (ethereum.isAvalanche) return false;
  if (ethereum.isBackpack) return false;
  if (ethereum.isBifrost) return false;
  if (ethereum.isBitKeep) return false;
  if (ethereum.isBitski) return false;
  if (ethereum.isBlockWallet) return false;
  if (ethereum.isCoinbaseWallet) return false;
  if (ethereum.isDawn) return false;
  if (ethereum.isEnkrypt) return false;
  if (ethereum.isExodus) return false;
  if (ethereum.isFrame) return false;
  if (ethereum.isFrontier) return false;
  if (ethereum.isGamestop) return false;
  if (ethereum.isHyperPay) return false;
  if (ethereum.isImToken) return false;
  if (ethereum.isKuCoinWallet) return false;
  if (ethereum.isMathWallet) return false;
  if (ethereum.isOkxWallet || ethereum.isOKExWallet) return false;
  if (ethereum.isOneInchIOSWallet || ethereum.isOneInchAndroidWallet) return false;
  if (ethereum.isOpera) return false;
  if (ethereum.isPhantom) return false;
  if (ethereum.isPortal) return false;
  if (ethereum.isRabby) return false;
  if (ethereum.isRainbow) return false;
  if (ethereum.isStatus) return false;
  if (ethereum.isTalisman) return false;
  if (ethereum.isTally) return false;
  if (ethereum.isTokenPocket) return false;
  if (ethereum.isTokenary) return false;
  if (ethereum.isTrust || ethereum.isTrustWallet) return false;
  if (ethereum.isXDEFI) return false;
  return !ethereum.isZerion;
}
