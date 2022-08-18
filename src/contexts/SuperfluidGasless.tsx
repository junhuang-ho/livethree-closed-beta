import { createContext, useContext, useEffect, useState } from 'react'
// import { useWeb3Auth } from './Web3Auth';
// import { ethers } from 'ethers';

// import {
//     MUMBAI_ADDRESS_SF_HOST,
//     ABI_SF_HOST,
//     MUMBAI_ADDRESS_CFAV1,
//     ABI_CFAV1,
//     MUMBAI_ADDRESS_fUSDCx,
//     FLOW_OPERATOR_ADDRESS,
//     OPERATION_TYPE_SUPERFLUID_CALL_AGREEMENT,
// } from '../configs/blockchain/superfluid';

export interface ISuperfluidGaslessContext {
}

export const SuperfluidGaslessContext = createContext<ISuperfluidGaslessContext>({
})

export const useSuperfluidGasless = (): ISuperfluidGaslessContext => {
    return useContext(SuperfluidGaslessContext);
}

const NO_CFAV1INTERFACE_MESSAGE = "CFAV1 Interface not init yet!"

export const SuperfluidGaslessProvider = ({ children }: { children: JSX.Element }) => {

    // TODO

    const contextProvider = {
    }
    return (
        <SuperfluidGaslessContext.Provider value={ contextProvider }>
            { children }
        </SuperfluidGaslessContext.Provider>
    )
}
