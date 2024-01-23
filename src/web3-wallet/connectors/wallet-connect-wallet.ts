import type {Chain} from '@wagmi/core/chains';
import type {Wallet} from '@/wallets/utils/Wallet';
import type {WalletConnectConnectorOptions} from '@/wallets/utils/getWalletConnectConnector';
import {getWalletConnectConnector} from '@/wallets/utils/getWalletConnectConnector';
import {getWalletConnectUri} from '@/wallets/utils/getWalletConnectUri';
import {isIOS} from '@/wallets/utils/isMobile';
import {IMAGES} from '@fd/const/images';
import * as QRCode from 'qrcode';

export interface WalletConnectWalletOptions {
  projectId: string;
  chains: Chain[];
  version?: '2';
  options?: WalletConnectConnectorOptions;
}

export const walletConnectWallet = ({chains, options, projectId, version = '2'}: WalletConnectWalletOptions): Wallet => {
  return {
    id: !!options?.showQrModal ? 'walletConnect' : 'walletConnectQr',
    name: 'WalletConnect',
    iconUrl: IMAGES.walletConnect,
    installed: true,
    hidden: () => !options?.showQrModal,
    createConnector() {
      const ios = isIOS();
      const connector = getWalletConnectConnector({
        version: '2',
        chains,
        projectId,
        // @ts-ignore
        options: {
          showQrModal: true,
          qrModalOptions: {
            themeMode: 'dark',
            themeVariables: {
              '--wcm-z-index': 11001,
            },
          },
          ...options,
        },
      } as any);

      const getUri = async () => {
        const uri = await getWalletConnectUri(connector, version);
        const opts = {
          errorCorrectionLevel: 'H',
          type: 'image/jpeg',
          quality: 0.3,
          margin: 4,
        };
        // @ts-ignore
        return QRCode.toDataURL(uri, opts);
      };

      return {
        connector,
        ...(ios
          ? {}
          : {
              mobile: {getUri},
              qrCode: {getUri},
            }),
      };
    },
  };
};
