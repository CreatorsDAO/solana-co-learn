import {Connector} from '@wagmi/core';
import {Wallet} from '@/wallets/utils/Wallet';
import {omitUndefinedValues} from '@/wallets/utils/omitUndefinedValues';

export interface ConnectorInstance extends Connector {
  instance: {
    connector: Connector;
    id: string;
    name: string;
    iconUrl?: string;
  };
}

export const connectorsForWallets = (walletList: Wallet[]) => {
  return () => {
    const connectors: ConnectorInstance[] = [];

    walletList.forEach(({createConnector, ...options}) => {
      const {connector, ...connectionMethods}: any = omitUndefinedValues(createConnector());
      connector.instance = {
        ...options,
        ...connectionMethods,
      };
      connectors.push(connector);
    });
    console.log('4 : ', connectors);
    return connectors;
  };
};
