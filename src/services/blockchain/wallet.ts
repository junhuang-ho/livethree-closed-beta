import { SafeEventEmitterProvider } from "@web3auth/base";
import ethereumWallet from "./ethereumWallet";

export interface IWallet {
    getWalletProvider: () => any;
    getSigner: () => any;
    getAddress: () => Promise<any>;
    getChainId: () => Promise<any>;
    getBalance: () => Promise<any>;
    signMessage: (message: any) => Promise<any>;
    signTransaction: (transactionRequest: any) => Promise<any>;
    sendTransaction: (transactionRequest: any) => Promise<any>;
}

export const getWallet = (chain: string, rawProvider: SafeEventEmitterProvider): IWallet => {
    // if (chain === "solana") { // TODO: change this "solana" string to get from config const
    //     return solanaWallet(rawProvider);
    // }
    return ethereumWallet(rawProvider);
};