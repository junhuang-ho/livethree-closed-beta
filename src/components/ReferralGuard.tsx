import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'
import { useHttpsCallable } from 'react-firebase-hooks/functions';

import { functions } from '../services/firebase'

import { InvalidReferralPage } from '../pages/utils/InvalidReferralPage';
import { SplashPage } from '../pages/utils/SplashPage';

export const ReferralGuard = ({ children }: { children: JSX.Element }) => {
    const params = useParams()

    const [isAddressExists] = useHttpsCallable(functions, 'isAddressExists');

    const [isValidAddress, setIsValidAddress] = useState<boolean>(false)
    const [isProcessed, setIsProcessed] = useState<boolean>(false)

    useEffect(() => {
        const checkIsAddressExists = async () => {
            const data = {
                address: params.address
            }
            const resp = await isAddressExists(data) // return data is just a boolean value
            if (resp?.data) {
                setIsValidAddress(true)
            }
            setIsProcessed(true)
        }

        checkIsAddressExists()
    }, [])

    if (isProcessed) {
        if (isValidAddress) {
            return children
        } else {
            return <InvalidReferralPage />
        }
    }

    return <SplashPage />
}

// check address is valid, if so, redirect to sign-up page