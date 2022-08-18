import { createContext, useContext, useEffect, useState } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth';
import { useWeb3Auth } from './Web3Auth';
import { useLocalStorage } from 'react-use';
import { useNavigate } from 'react-router-dom';

import { auth } from '../services/firebase';

import { WALLET_ADAPTERS } from "@web3auth/base";

export interface IAuthenticationStateContext {
    firebaseUser: any
    isLoadingFirebaseUser: boolean
    isSigningUp: boolean | undefined
    isDebugger: boolean,
    setIsDebugger: (value: boolean) => void,
    setIsSigningUp: (value: boolean | undefined) => void
}

export const AuthenticationStateContext = createContext<IAuthenticationStateContext>({
    firebaseUser: null,
    isLoadingFirebaseUser: false,
    isSigningUp: false,
    isDebugger: false,
    setIsDebugger: (value: boolean) => { },
    setIsSigningUp: (value: boolean | undefined) => { },
})

export const useAuthenticationState = (): IAuthenticationStateContext => {
    return useContext(AuthenticationStateContext);
}

export const AuthenticationStateProvider = ({ children }: { children: JSX.Element }) => {
    const [firebaseUser, isLoadingFirebaseUser, firebaseUserError] = useAuthState(auth);
    const { user: web3authUser, login: web3authLogin, logout: web3authLogout, loggingIn, loggingOut, connecting } = useWeb3Auth()
    const navigate = useNavigate();
    const [isSigningUp, setIsSigningUp] = useLocalStorage('signing-up', false)
    const [isDebugger, setIsDebugger] = useState<boolean>(false)

    useEffect(() => {
        console.log(isSigningUp)
    }, [isSigningUp])

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
                console.error("error retrieving JWT token")
            }
        }

        const logoutWeb3Auth = async () => {
            await web3authLogout()
        }

        if (firebaseUser && web3authUser && !isSigningUp) {
            navigate('/', { replace: true })
        } else if (firebaseUser && !web3authUser && !connecting) {
            console.log("TRYING")
            loginWeb3Auth()
        } else if (!firebaseUser && web3authUser && !connecting) {
            logoutWeb3Auth()
        } else if (!isSigningUp) {
            navigate('/sign-in', { replace: true })
        } else if (isSigningUp) {
            navigate('/sign-up', { replace: true })
        } else {
            console.error("something went wrong - auth state")
        }
        console.log("USERS CHECK", firebaseUser, web3authUser)
    }, [firebaseUser, web3authUser, isSigningUp, connecting])

    const contextProvider = {
        firebaseUser,
        isLoadingFirebaseUser,
        isSigningUp,
        isDebugger,
        setIsDebugger,
        setIsSigningUp,
    }
    return (
        <AuthenticationStateContext.Provider value={ contextProvider }>
            { children }
        </AuthenticationStateContext.Provider>
    )
}
