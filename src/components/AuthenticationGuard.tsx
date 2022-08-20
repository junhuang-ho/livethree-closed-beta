import { useEffect } from 'react';
import { Navigate } from "react-router-dom";

import { useWeb3Auth } from '../contexts/Web3Auth';
import { useAuthenticationState } from '../contexts/AuthenticationState';

import { SplashPage } from '../pages/utils/SplashPage';

import { setOnline } from "../utils"

// TODO: this will become a simple auth guard, so if not firebaseUser + web3authUser + isSigningUp, then reject

export const AuthenticationGuard = ({ children }: { children: JSX.Element }) => {
    const { user: web3authUser, loggingIn, loggingOut, connecting } = useWeb3Auth()
    const { firebaseUser, isLoadingFirebaseUser } = useAuthenticationState()

    useEffect(() => {
        const setOffline = async () => {
            await setOnline(firebaseUser?.uid, false)
        }
        window.addEventListener('beforeunload', setOffline) // https://developer.mozilla.org/en-US/docs/Web/API/Window#load_unload_events
        return () => {
            window.removeEventListener('beforeunload', setOffline)
        }
    }, [firebaseUser])

    useEffect(() => {
        if (firebaseUser?.emailVerified) {
            if (web3authUser) {
                setOnline(firebaseUser?.uid, true)
            } else {
                setOnline(firebaseUser?.uid, false)
            }
        }

    }, [firebaseUser, web3authUser])

    if (isLoadingFirebaseUser || loggingIn || loggingOut || connecting || (firebaseUser && !web3authUser)) {
        return <SplashPage />
    }

    if (firebaseUser && web3authUser) {
        if (firebaseUser?.emailVerified) {
            return children
        } else {
            return <Navigate to="/verification-request" replace />
        }
    }

    return ( // in case find yourself on this page (such as manually typed in link) without proper auth, go to sign-in page
        <Navigate to="/sign-in" replace />
    )

}
