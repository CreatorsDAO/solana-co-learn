import {
  Config,
  configureChains,
  connect,
  createConfig,
  createStorage,
  disconnect,
  getAccount,
  getConfig,
  getContract,
  getNetwork,
  readContract,
  signMessage,
  switchNetwork,
  watchNetwork,
  writeContract,
  getWalletClient,
  waitForTransaction,
} from '@wagmi/core';
import {formatEther, parseEther, parseUnits, formatUnits} from 'viem';
import {publicProvider} from '@wagmi/core/providers/public';
import {BehaviorSubject, filter, firstValueFrom, take} from 'rxjs';
import {connectorsForWallets} from '@/wallets/utils/connectorsForWallets';
import {allChains$, checkAvailableChain, currentChain$, getChain, updateCurrentChain} from '@fd/streams/chain';
import {bitGetWallet, coinbaseWallet, metaMaskWallet, okxWallet, walletConnectWallet} from './connectors';
import {allChains, NFT_ADDRESS, NFT_CHAIN_ID} from '@/const';
import {toast} from '@fd/toast';
import {Abi} from '@/abi';
import {deposit as depositReq, withdraw as withdrawReq} from '@fd/api/asset';
import {removeToken} from '@fd/storage/token';
import {authStatus$} from '@fd/streams/auth';

const projectId = '56a8ea66aca74568c24474ac10650e1d';
const MaxUint256: bigint = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');

export const walletUtil: any = {
  connector: null,
  getAccount,
  getNetwork,
  watchNetwork,
  formatEther,
  async switchNetwork(chainId) {
    const {chain} = await getNetwork();
    if (chain.id !== chainId) {
      await switchNetwork({chainId});
    }
  },
  async init(connector?: any) {
    if (connector) {
      this.connector = connector;
      return;
    }
    const config = getConfig();
    const walletId = config.storage.getItem('connect-wallet');
    if (walletId) {
      const con = config.connectors.find((c: any) => c.instance.id === walletId);
      if (con) {
        this.connector = con;
        await this.connect();
      }
    }
  },
  async connect() {
    if (this.connector) {
      const config = getConfig();
      const activeConnector = config.connector;
      if (activeConnector && this.connector.id === activeConnector.id) {
        return getAccount();
      }
      const chain = await firstValueFrom(currentChain$);
      const data = await connect({chainId: Number(chain.id), connector: this.connector});
      config.storage.setItem('connect-wallet', this.connector.instance.id);
      return data;
    }
  },
  async disconnect() {
    await disconnect();
    const config = getConfig();
    config.storage.setItem('connect-wallet', null);
  },
  async sign() {
    const message = 'Welcome to RubyDex!';
    const signature = await signMessage({message});
    const config = getConfig();
    config.storage.setItem('connect-wallet', this.connector.instance.id);
    console.log('Signature : ', signature);
    return {signature, message};
  },
  async mint(amount: string) {
    const chain = await getCurrentChain();
    const account = await getAccount();
    return await writeContract({
      chainId: Number(chain.id),
      address: chain.addressOfUSDT,
      abi: Abi.terc20.abi,
      functionName: 'mint',
      args: [account.address, parseUnits(amount, chain.scale)],
    } as any);
  },
  async approve(chainId: bigint) {
    const chain = await getCurrentChain();
    console.log('approve : ', [chain.addressOfVAULT, MaxUint256]);
    const walletClient = await getWalletClient({chainId: Number(chainId)});
    const contract = await getContract({
      chainId: Number(chainId),
      address: chain.addressOfUSDT,
      abi: Abi.terc20.abi,
      walletClient,
    } as any);
    const hash: any = await contract.write.approve({args: [chain.addressOfVAULT, MaxUint256]});
    return await waitForTransaction({
      chainId: Number(chainId),
      hash,
    });
  },
  async getAllowanceAmount(chainId: bigint) {
    const chain = await getCurrentChain();
    const account = await getAccount();
    const contract = await getContract({
      chainId: Number(chainId),
      address: chain.addressOfUSDT,
      abi: Abi.terc20.abi,
    } as any);
    console.log('getAllowanceAmount : ', [account.address, chain.addressOfVAULT]);
    const allowanceValue = await contract.read.allowance({args: [account.address, chain.addressOfVAULT]});
    const decimals = await contract.read.decimals();
    return Number(formatUnits(allowanceValue, decimals));
  },
  async deposit(amount: string, chainId: bigint) {
    const chains = await firstValueFrom(allChains$);
    const chain = getChain(chains, chainId as bigint);
    const account = await getAccount();

    const args: any[] = [chain.addressOfUSDT, parseUnits(amount, chain.scale)];
    const options = {
      chainId: Number(chainId),
      address: chain.addressOfVAULT,
      abi: Abi.vault.abi,
      functionName: 'deposit',
      args,
    };
    const {hash} = await writeContract(options as any);

    return await depositReq(hash, '', String(chain.id), account.address);
  },
  async withdraw(amount: string, chainId: bigint) {
    const all = await firstValueFrom(allChains$);
    const chain = getChain(all, chainId);
    const result = await withdrawReq(amount, String(chain.id));
    if (result.fail) {
      return;
    }

    const {expiry, nonce, sign} = result.data as any;
    const args: any[] = [chain.addressOfUSDT, parseUnits(amount, chain.scale), Number(expiry), nonce, sign];
    const options = {
      chainId: Number(chain.id),
      address: chain.addressOfVAULT,
      abi: Abi.vault.abi,
      functionName: 'withdraw',
      args,
    };
    return await writeContract(options as any);
  },
  async nftInfo() {
    const {chain} = await this.getNetwork();
    if (chain?.id !== NFT_CHAIN_ID) {
      return {chainError: "Your current wallet's chain is not Arbitrum One. Please switch to Arbitrum One."};
    }
    const keys: string[] = [
      'maxSupply',
      'balanceOf',
      'reservedNFTs',
      'discountMintPrice',
      'publicMintPrice',
      'totalSupply',
      'freeMintStartTime',
      'discountMintStartTime',
      'publicMintStartTime',
      'mintEndTime',
      'freeMintWhitelist',
      'discountMintWhitelist',
    ];
    const account = await getAccount();
    const result = {};
    for (let i = 0; i < keys.length; i++) {
      const k: string = keys[i];
      const args = [];
      if (k.endsWith('Whitelist') || k === 'balanceOf') {
        args.push(account.address);
      }
      const data = await readContract({
        chainId: NFT_CHAIN_ID,
        address: NFT_ADDRESS,
        abi: Abi.gemNFT.abi,
        functionName: k,
        args,
      } as any);
      if (k.endsWith('MintPrice')) {
        result[k] = formatEther(data as bigint);
      } else {
        result[k] = data.toString();
      }
    }
    result.percent = Number((result?.totalSupply / result.maxSupply).toFixed(0));
    return result;
  },
  async mintNFT(amount: string) {
    const {chain} = await this.getNetwork();
    if (chain?.id !== NFT_CHAIN_ID) {
      return {error: "Your current wallet's chain is not Arbitrum One. Please switch to Arbitrum One."};
    }
    try {
      const result = await writeContract({
        chainId: NFT_CHAIN_ID,
        address: NFT_ADDRESS,
        abi: Abi.gemNFT.abi,
        functionName: 'mint',
        args: [{value: parseEther(amount)}],
      } as any);
      return {success: true, data: result};
    } catch (e: any) {
      return {error: e.data?.message, success: false};
    }
  },
};

export const walletConfig$ = new BehaviorSubject<Config | null>(null);

allChains$.subscribe((all) => {
  const filterChains = allChains.filter((ac) => all.find((c) => c.id == ac.id));
  const {chains, publicClient, webSocketPublicClient} = configureChains(filterChains, [publicProvider()]);

  const connectors = connectorsForWallets([
    walletConnectWallet({chains, projectId, options: {showQrModal: true} as any}),
    metaMaskWallet({chains, projectId}),
    coinbaseWallet({chains, appName: 'Demo'}),
    okxWallet({chains, projectId}),
    bitGetWallet({chains, projectId}),
    walletConnectWallet({chains, projectId, options: {showQrModal: false} as any}),
  ]);

  const config = createConfig({
    autoConnect: true,
    connectors,
    publicClient,
    webSocketPublicClient,
    storage: createStorage({storage: window.localStorage}),
  });

  walletConfig$.next(config);

  authStatus$
    .pipe(filter((s) => s === 'Login'))
    .pipe(take(1))
    .subscribe(() => {
      walletUtil.init();
    });

  watchNetwork(async (data) => {
    const {chain} = await getNetwork();
    const current = await firstValueFrom(currentChain$);
    if (!chain || chain.id === Number(current.id)) {
      return;
    }
    if (checkAvailableChain(all, BigInt(chain.id))) {
      updateCurrentChain(all, BigInt(chain.id));
      toast.success(`Network was switched to "${chain.name}"`);
      return;
    }

    const useId = !chain.name || chain.name === 'unknown';
    toast.error(`The network with ${useId ? 'id' : 'name'} "${useId ? chain.id : chain.name}" is not available in Rubydex`);
  });
});

export function getCurrentChain() {
  return firstValueFrom(currentChain$);
}

export function logout() {
  removeToken();
  disconnect().then(() => {
    window.location.reload();
  });
}
