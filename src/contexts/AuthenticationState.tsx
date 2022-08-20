import { createContext, useContext, useEffect, useState } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth';
import { useWeb3Auth } from './Web3Auth';
import { useNavigate } from 'react-router-dom';

import { auth } from '../services/firebase';

import { WALLET_ADAPTERS } from "@web3auth/base";

export interface IAuthenticationStateContext {
    firebaseUser: any
    isLoadingFirebaseUser: boolean
    isDebugger: boolean
    setIsDebugger: (value: boolean) => void
}

export const AuthenticationStateContext = createContext<IAuthenticationStateContext>({
    firebaseUser: null,
    isLoadingFirebaseUser: false,
    isDebugger: false,
    setIsDebugger: (value: boolean) => { },
})

export const useAuthenticationState = (): IAuthenticationStateContext => {
    return useContext(AuthenticationStateContext);
}

export const AuthenticationStateProvider = ({ children }: { children: JSX.Element }) => {
    const [firebaseUser, isLoadingFirebaseUser, firebaseUserError] = useAuthState(auth);
    const { user: web3authUser, login: web3authLogin, logout: web3authLogout, connecting } = useWeb3Auth()
    const navigate = useNavigate();
    const [isDebugger, setIsDebugger] = useState<boolean>(false)

    useEffect(() => { // TODO: test as firebaseUserError does not reset to null
        if (firebaseUserError) {
            alert("Authentication Error!")
        }
    }, [firebaseUserError])

    useEffect(() => {
        const loginWeb3Auth = async () => {
            const jwtToken = await firebaseUser?.getIdToken(true)
            if (jwtToken) {
                await web3authLogin(WALLET_ADAPTERS.OPENLOGIN, "jwt", jwtToken)
            } else {
                console.error("LiveThree: Error retrieving JWT token")
            }
        }

        const logoutWeb3Auth = async () => {
            await web3authLogout()
        }

        if (firebaseUser && web3authUser) {
            navigate('/', { replace: true })
        } else if (firebaseUser && !web3authUser && !connecting) {
            loginWeb3Auth()
        } else if (!firebaseUser && web3authUser && !connecting) {
            logoutWeb3Auth()
        }

        if (firebaseUser) {
            console.log("LiveThree: Firebase user auth status -", true)
        } else {
            console.log("LiveThree: Firebase user auth status -", null)
        }
        if (web3authUser) {
            console.log("LiveThree: Web3Auth user auth status -", true)
        } else {
            console.log("LiveThree: Web3Auth user auth status -", null)
        }
    }, [firebaseUser, web3authUser, connecting])

    const contextProvider = {
        firebaseUser,
        isLoadingFirebaseUser,
        isDebugger,
        setIsDebugger,
    }
    return (
        <AuthenticationStateContext.Provider value={ contextProvider }>
            { children }
        </AuthenticationStateContext.Provider>
    )
}
