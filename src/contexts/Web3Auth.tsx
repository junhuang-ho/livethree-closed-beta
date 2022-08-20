import { ADAPTER_EVENTS, SafeEventEmitterProvider, WALLET_ADAPTER_TYPE } from "@web3auth/base";
import { Web3AuthCore } from "@web3auth/core";
import type { LOGIN_PROVIDER_TYPE } from "@toruslabs/openlogin";

import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import {
    CHAIN_CONFIG, CHAIN_CONFIG_TYPE, WEB3AUTH_NETWORK_TYPE,
    WEB3AUTH_CLIENT_ID, WEB3AUTH_VERIFIER_NAME, BRAND_NAME,
    WEB3AUTH_NETWORK_DEFAULT, CHAIN_CONFIG_DEFAULT, CHAIN_NAME_MUMBAI
} from "../configs/blockchain/web3auth";
import { getWallet, IWallet } from "../services/blockchain/wallet";
// import { getBiconomyInstance } from "../services/blockchain/biconomy";
import { useUpdateEffect } from "react-use";

import { analytics } from '../services/firebase';
import { logEvent } from 'firebase/analytics';

export interface IWeb3AuthContext {
    web3AuthInstance: Web3AuthCore | null;
    provider: any;
    signer: any;
    settingUp: boolean;
    loggingIn: boolean;
    loggingOut: boolean;
    connecting: boolean;
    // biconomy: any;
    // biconomyProvider: any;
    user: unknown;
    address: any;
    chainId: any;
    nativeCoinBalance: any;
    refreshNativeBalance: () => void
    selectNetwork: (web3authNetwork: WEB3AUTH_NETWORK_TYPE) => void
    selectChain: (chainConfig: CHAIN_CONFIG_TYPE) => void
    login: (adapter: WALLET_ADAPTER_TYPE, provider: LOGIN_PROVIDER_TYPE, jwtToken: string) => Promise<void>;
    logout: () => Promise<void>;
    getBalance: () => Promise<any>;
    // signMessage: (message: any) => Promise<any>;
    // signTransaction: (transactionRequest: any) => Promise<any>;
    // sendTransaction: (transactionRequest: any) => Promise<any>;
    getUserInfo: () => Promise<any>;
}

export const Web3AuthContext = createContext<IWeb3AuthContext>({
    web3AuthInstance: null,
    provider: null,
    signer: null,
    settingUp: false,
    loggingIn: false,
    loggingOut: false,
    connecting: false,
    // biconomy: null,
    // biconomyProvider: null,
    user: null,
    address: "empty",
    chainId: null,
    nativeCoinBalance: null, // BigNumber
    refreshNativeBalance: () => { },
    selectNetwork: (web3authNetwork: WEB3AUTH_NETWORK_TYPE) => { },
    selectChain: (chainConfig: CHAIN_CONFIG_TYPE) => { },
    login: async (adapter: WALLET_ADAPTER_TYPE, provider: LOGIN_PROVIDER_TYPE, jwtToken: string) => { },
    logout: async () => { },
    getBalance: async () => { },
    // signMessage: async (message: any) => { },
    // signTransaction: async (transactionRequest: any) => { },
    // sendTransaction: async (transactionRequest: any) => { },
    getUserInfo: async () => { },
});

export const useWeb3Auth = (): IWeb3AuthContext => {
    return useContext(Web3AuthContext);
}

// interface IWeb3AuthState {
//     web3AuthNetwork: WEB3AUTH_NETWORK_TYPE;
//     selectedChain: CHAIN_CONFIG_TYPE;
// }
interface IWeb3AuthProps {
    children?: ReactNode;
    // web3AuthNetwork: WEB3AUTH_NETWORK_TYPE;
    // selectedChain: CHAIN_CONFIG_TYPE;
}

const NO_PROVIDER_MESSAGE = "wallet not initialized yet"
const NO_WEB3AUTH_MESSAGE = "web3auth not initialized yet"

export const Web3AuthProvider = ({ children }: IWeb3AuthProps) => {
    const [web3AuthNetwork, setWeb3AuthNetwork] = useState<WEB3AUTH_NETWORK_TYPE>(WEB3AUTH_NETWORK_DEFAULT); // options: testnet, mainnet, development, https://docs.tor.us/open-login/api-reference/initialization#openlogin
    const [selectedChain, setSelectedChain] = useState<CHAIN_CONFIG_TYPE | null>(null);
    const [web3AuthInstance, setWeb3AuthInstance] = useState<Web3AuthCore | null>(null);
    const [wallet, setWallet] = useState<IWallet | null>(null);
    const [user, setUser] = useState<unknown | null>(null);
    const [settingUp, setSettingUp] = useState(false);
    const [loggingIn, setLoggingIn] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const [connecting, setConnecting] = useState(false);
    const [provider, setProvider] = useState<any>(null)
    const [signer, setSigner] = useState<any>(null)
    const [address, setAddress] = useState<string>("empty")
    const [chainId, setChainId] = useState<any>(null)
    const [nativeCoinBalance, setNativeCoinBalance] = useState<any>(null)
    const [isToggled, toggle] = useState<boolean>(false)

    // const [biconomy, setBiconomy] = useState<any>(null) // biconomy edit
    // const [biconomyProvider, setBiconomyProvider] = useState<any>(null)

    const setWeb3AuthProvider = useCallback(
        (web3authProvider: SafeEventEmitterProvider) => {
            if (selectedChain) {
                // let RPC_URL
                // if (selectedChain === CHAIN_NAME_POLYGON) {
                //     RPC_URL = RPC_URL_POLYGON
                // } else if (selectedChain === CHAIN_NAME_MUMBAI) {
                //     RPC_URL = RPC_URL_MUMBAI
                // } else {
                //     console.error(`${ selectedChain } chain not supported`)
                // }
                // const biconomy = getBiconomyInstance(RPC_URL || RPC_URL_BACKUP, web3authProvider) // biconomy edit

                const wallet = getWallet(selectedChain, web3authProvider)
                setWallet(wallet);

                // biconomy.onEvent(biconomy.READY, () => {
                //     // Initialize your dapp here like getting user accounts etc
                //     setBiconomy(biconomy)
                //     setConnecting(false)
                // }).onEvent(biconomy.ERROR, (error: any, message: any) => {
                //     console.error(error)
                //     console.error(message)
                //     setConnecting(false)
                // }); // biconomy edit
            }
        },
        [selectedChain]
    );

    useEffect(() => { // for debug purposes (normal user not supposed to access mumbai)
        if (selectedChain === CHAIN_NAME_MUMBAI) {
            logEvent(analytics, "network_mumbai_accessed", { address: address })
            console.error("LiveThree on Mumbai")
        }
    }, [selectedChain])

    useEffect(() => {
        const subscribeAuthEvents = (web3auth: Web3AuthCore) => {
            // Can subscribe to all ADAPTER_EVENTS and LOGIN_MODAL_EVENTS
            web3auth.on(ADAPTER_EVENTS.CONNECTED, (data: unknown) => {
                console.log("web3auth connected", data);
                setWeb3AuthProvider(web3auth.provider!);
                setUser(data);
                setConnecting(false) // TODO: undo this if have biconomy setup
            });

            web3auth.on(ADAPTER_EVENTS.CONNECTING, () => {
                console.log("web3auth connecting");
                setConnecting(true)
            });

            web3auth.on(ADAPTER_EVENTS.DISCONNECTED, () => {
                console.log("web3auth disconnected");
                setUser(null)
                // setBiconomy(null) // biconomy edit
                setProvider(null)
                setSigner(null)
                setAddress("empty")
                setChainId(null)
                setConnecting(false)
            });

            web3auth.on(ADAPTER_EVENTS.ERRORED, (error) => {
                console.error("web3auth error:", error);
                setConnecting(false)
            });
        };

        const currentChainConfig = CHAIN_CONFIG[selectedChain!];

        const init = async () => {
            try {
                setSettingUp(true);

                const web3AuthInstance_ = new Web3AuthCore({
                    chainConfig: currentChainConfig,
                });

                subscribeAuthEvents(web3AuthInstance_);

                const adapter = new OpenloginAdapter({
                    adapterSettings: {
                        network: web3AuthNetwork, // ref: https://docs.tor.us/open-login/api-reference/initialization#openlogin
                        clientId: WEB3AUTH_CLIENT_ID,
                        uxMode: "popup", // TODO: try "redirect", "popup",
                        loginConfig: {
                            jwt: {
                                name: BRAND_NAME,
                                verifier: WEB3AUTH_VERIFIER_NAME,
                                typeOfLogin: "jwt",
                                clientId: WEB3AUTH_CLIENT_ID,
                            },
                        },
                    },
                    loginSettings: {
                        mfaLevel: "none",
                    },
                });
                web3AuthInstance_.configureAdapter(adapter);
                await web3AuthInstance_.init();
                setWeb3AuthInstance(web3AuthInstance_);
            } catch (error) {
                console.error(error);
            } finally {
                setSettingUp(false);
            }
        }

        if (selectedChain) {
            init();
        } else {
            setSelectedChain(CHAIN_CONFIG_DEFAULT)
        }
    }, [selectedChain, web3AuthNetwork, setWeb3AuthProvider]);

    useEffect(() => {
        const setWalletDetails = async () => {
            setProvider(getWalletProvider())
            setSigner(getSigner())
            setAddress(await getAddress())
            setChainId(await getChainId())
            // setBiconomyProvider(biconomy.getEthersProvider())
            // setNativeCoinBalance(await getBalance())
        }
        if (user) { // && biconomy
            setWalletDetails()
        }
    }, [user]) // biconomy

    const refreshNativeBalance = () => {
        toggle(state => !state)
    }

    useUpdateEffect(() => {
        const refresh = async () => {
            setNativeCoinBalance(await getBalance())
        }
        if (user && address) {
            refresh()
        }

    }, [user, address, isToggled])

    const selectNetwork = (web3authNetwork: WEB3AUTH_NETWORK_TYPE) => {
        setWeb3AuthNetwork(web3authNetwork)
    }

    const selectChain = (chainConfig: CHAIN_CONFIG_TYPE) => {
        setSelectedChain(chainConfig)
    }

    const login = async (adapter: WALLET_ADAPTER_TYPE, loginProvider: LOGIN_PROVIDER_TYPE, jwtToken: string) => {
        try {
            setLoggingIn(true);
            if (!web3AuthInstance) {
                console.warn(NO_WEB3AUTH_MESSAGE);
                return;
            }
            console.log("LiveThree: web3auth login attempt")
            const localProvider = await web3AuthInstance.connectTo(adapter, {
                relogin: true,
                loginProvider: loginProvider,
                mfaLevel: 'none',
                extraLoginOptions: {
                    id_token: jwtToken,
                    domain: window.location.origin,
                    verifierIdField: "sub",
                }
            });
            setWeb3AuthProvider(localProvider!);
        } catch (error: any) {
            const ERROR_MESSAGE = "Wallet is not ready yet, Already connecting"
            if (error.message !== ERROR_MESSAGE) {
                console.error("LiveThree Login Error", error);
            }

        } finally {
            setLoggingIn(false)
        }
    };

    const logout = async () => {
        if (!web3AuthInstance) {
            console.warn(NO_WEB3AUTH_MESSAGE);
            return;
        }
        try {
            setLoggingOut(true);
            console.log("LiveThree: web3auth logout attempt")
            await web3AuthInstance.logout();
            setWallet(null);
        } catch (error) {
            console.error("LiveThree Logout Error", error);
        } finally {
            setLoggingOut(false)
        }
    };

    const getWalletProvider = () => {
        if (!wallet) {
            console.warn(NO_PROVIDER_MESSAGE);
            return;
        }
        return wallet.getWalletProvider();
    };

    const getSigner = () => {
        if (!wallet) {
            console.warn(NO_PROVIDER_MESSAGE);
            return;
        }
        return wallet.getSigner();
    };

    const getAddress = async () => {
        if (!wallet) {
            console.warn(NO_PROVIDER_MESSAGE);
            return;
        }
        return await wallet.getAddress();
    };

    const getChainId = async () => {
        if (!wallet) {
            console.warn(NO_PROVIDER_MESSAGE);
            return;
        }
        return await wallet.getChainId();
    };

    const getBalance = async () => {
        if (!wallet) {
            console.warn(NO_PROVIDER_MESSAGE);
            return;
        }
        return await wallet.getBalance();
    };

    // const signMessage = async (message: any) => {
    //     if (!wallet) {
    //         console.warn(NO_PROVIDER_MESSAGE);
    //         return;
    //     }
    //     return await wallet.signMessage(message);
    // };

    // const signTransaction = async (transactionRequest: any) => {
    //     if (!wallet) {
    //         console.warn(NO_PROVIDER_MESSAGE);
    //         return;
    //     }
    //     return await wallet.signTransaction(transactionRequest);
    // };

    // const sendTransaction = async (transactionRequest: any) => {
    //     if (!wallet) {
    //         console.warn(NO_PROVIDER_MESSAGE);
    //         return;
    //     }
    //     return await wallet.sendTransaction(transactionRequest);
    // };

    const getUserInfo = async () => {
        if (!web3AuthInstance) {
            console.warn(NO_WEB3AUTH_MESSAGE);
            return;
        }
        return await web3AuthInstance.getUserInfo();
    };


    const contextProvider = {
        web3AuthInstance,
        provider,
        signer,
        settingUp,
        loggingIn,
        loggingOut,
        connecting,
        // biconomy,
        // biconomyProvider,
        user,
        address,
        chainId,
        nativeCoinBalance,
        refreshNativeBalance,
        selectNetwork,
        selectChain,
        login,
        logout,
        getBalance,
        // signMessage,
        // signTransaction,
        // sendTransaction,
        getUserInfo,
    };
    return (
        <Web3AuthContext.Provider value={ contextProvider }>
            { children }
        </Web3AuthContext.Provider>
    );
};