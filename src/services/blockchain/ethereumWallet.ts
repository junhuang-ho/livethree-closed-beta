import { SafeEventEmitterProvider } from "@web3auth/base";
import { ethers } from "ethers"

import { IWallet } from "./wallet";

// ref: https://docs.ethers.io/v5/api/signer/

const ethereumWallet = (rawProvider: SafeEventEmitterProvider): IWallet => {

    const getWalletProvider = () => {
        return new ethers.providers.Web3Provider(rawProvider)
    }

    const getSigner = () => {
        const walletProvider = getWalletProvider()
        return walletProvider.getSigner()
    }

    const getAddress = async () => {
        const signer = getSigner()
        return await signer.getAddress()
    }

    const getChainId = async () => {
        const signer = getSigner()
        return await signer.getChainId()
    }

    const getBalance = async () => {
        const signer = getSigner()
        return await signer.getBalance()
    }

    const signMessage = async (message: any) => {
        const signer = getSigner()
        return await signer.signMessage(message)
    }

    const signTransaction = async (transactionRequest: any) => {
        const signer = getSigner()
        return await signer.signMessage(transactionRequest)
    }

    const sendTransaction = async (transactionRequest: any) => {
        const signer = getSigner()
        return await signer.signMessage(transactionRequest)
    }

    return { getWalletProvider, getSigner, getAddress, getChainId, getBalance, signMessage, signTransaction, sendTransaction };
};

export default ethereumWallet;