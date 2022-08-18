import { CHAIN_NAMESPACES, CustomChainConfig } from "@web3auth/base";

export const RPC_URL_BACKUP = "https://polygon-rpc.com"
export const RPC_URL_POLYGON = import.meta.env.VITE_ALCHEMY_API_URL_POLYGON // process.env.REACT_APP_ALCHEMY_API_URL_POLYGON
export const RPC_URL_MUMBAI = import.meta.env.VITE_ALCHEMY_API_URL_MUMBAI  // process.env.REACT_APP_ALCHEMY_API_URL_MUMBAI


// // TODO: make this (web3auth details) a config object
// // export const WEB3AUTH_CLIENT_ID = 'BBEeEMBtqxKqfn0n7b0LCwbm8ZrysTPnN0bZjBWLVIqYs3BD4qIL35yUaEKsq_W8BVR2Nx7f_lk9YSItqWtSJVw' as const // web3auth's testnet
// export const WEB3AUTH_CLIENT_ID = 'BMdhaBBKwsMr1jS7Z6rikXs_DDHZaFE1S9zIHrUZRA3J5xi-pTvN_LVm7UpeVbKmwxOk3W0T5YtoPKyrZIuWleQ' as const // web3auth's mainnet (standard - not cyan)
// export const WEB3AUTH_VERIFIER_NAME = 'moonlight-mumbai' as const
// export const BRAND_NAME = 'moonlight' as const
// export const WEB3AUTH_NETWORK_DEFAULT = "mainnet" // "testnet" "mainnet"

// // Web3Auth's LiveThree credentials
const WEB3AUTH_CLIENT_ID_MAINNET = 'BCra18FhoqHZBjima6njP0JKotW1lSDCyjdhcyuHpj8WO_0AbQ04_psVRM-5XV9DpUFYGRbct78l5JVN4qvskh0' as const // web3auth's mainnet (not polygon)
const WEB3AUTH_CLIENT_ID_TESTNET = 'BBMnle-LGyXQcvhXXqdS29gEL3zbOZeUgF7p4u9ghFQREXPxEcm1zL_hmYT7RU8TTW0ukM-qghH0DRgNyYDlOIc' as const // web3auth's testnet (not polygon)

// change following 2 TOGETHER
export const WEB3AUTH_CLIENT_ID = WEB3AUTH_CLIENT_ID_MAINNET //WEB3AUTH_CLIENT_ID_TESTNET
export const WEB3AUTH_NETWORK_DEFAULT = "mainnet" // "testnet" "mainnet"

export const WEB3AUTH_VERIFIER_NAME = 'livethreeweb1' as const
export const BRAND_NAME = 'LiveThree' as const


export const WEB3AUTH_NETWORK = {
    // ref: https://docs.tor.us/open-login/api-reference/initialization#openlogin
    testnet: {
        displayName: "Testnet",
    },
    mainnet: {
        displayName: "Mainnet",
    },
    development: {
        displayName: "Development",
    },
} as const;


export const CHAIN_NAME_POLYGON = "polygon"
export const CHAIN_NAME_MUMBAI = "mumbai"

export const CHAIN_CONFIG_DEFAULT = CHAIN_NAME_POLYGON

export const CHAIN_ID_POLYGON = 137
export const CHAIN_ID_MUMBAI = 80001

export const CHAIN_CONFIG = {
    polygon: {
        chainNamespace: CHAIN_NAMESPACES.EIP155,
        chainId: "0x89",
        rpcTarget: RPC_URL_POLYGON, // note: free version: "https://polygon-rpc.com",
        displayName: "Polygon Mainnet",
        blockExplorer: "https://polygonscan.com/",
        ticker: "MATIC",
        tickerName: "Matic",
    } as CustomChainConfig,
    mumbai: {
        chainNamespace: CHAIN_NAMESPACES.EIP155,
        chainId: "0x13881", // 80001
        rpcTarget: RPC_URL_MUMBAI, // note: free version: "https://rpc-mumbai.matic.today",
        displayName: "Mumbai Testnet",
        blockExplorer: "https://mumbai.polygonscan.com/",
        ticker: "MATIC",
        tickerName: "Matic",
    } as CustomChainConfig,
    // ethereum: {
    //     chainNamespace: CHAIN_NAMESPACES.EIP155,
    //     chainId: "0x1",
    //     rpcTarget: ,// TODO 
    //     displayName: "Ethereum Mainnet",
    //     blockExplorer: "https://etherscan.io/",
    //     ticker: "ETH",
    //     tickerName: "Ethereum",
    // } as CustomChainConfig,
    // solana: {
    //     chainNamespace: CHAIN_NAMESPACES.SOLANA,
    //     chainId: "0x1",
    //     rpcTarget: "https://api.mainnet-beta.solana.com", // tODO: setup node provider equivalent
    //     displayName: "Solana Mainnet",
    //     blockExplorer: "https://explorer.solana.com/",
    //     ticker: "SOL",
    //     tickerName: "Solana",
    // } as CustomChainConfig,
} as const;

export const CHAIN_ID_TO_CHAIN_NAME_MAPPING: any = {
    [CHAIN_ID_POLYGON]: "Polygon Mainnet",
    [CHAIN_ID_MUMBAI]: "Polygon Mumbai",
}

export type WEB3AUTH_NETWORK_TYPE = keyof typeof WEB3AUTH_NETWORK;
export type CHAIN_CONFIG_TYPE = keyof typeof CHAIN_CONFIG;