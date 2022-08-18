import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import { useNavigate } from 'react-router-dom';
import { useWeb3Auth } from '../contexts/Web3Auth';
import { useSuperfluidGas } from '../contexts/SuperfluidGas';

import { setOnline } from "../utils"

export const useLogoutFlow = (firebaseUid: any) => {
    const navigate = useNavigate();
    const { logout: web3authLogout } = useWeb3Auth()
    const { setIsCheckNetFlow } = useSuperfluidGas()

    const logout = async () => {
        await setOnline(firebaseUid, false)
        setIsCheckNetFlow(false)
        await web3authLogout()
        await signOut(auth)

        navigate('/', { replace: true })
    }

    return { logout }
}
