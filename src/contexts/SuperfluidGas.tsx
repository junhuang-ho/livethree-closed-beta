import { createContext, useContext, useEffect, useState } from 'react'
import { useWeb3Auth } from './Web3Auth';
import { ethers } from 'ethers';
import { getFeeValuesSafeLow } from '../utils';

import { useInterval } from 'react-use';
import { useSnackbar } from 'notistack';
import { useIdleTimer } from 'react-idle-timer'

import { COL_REF_PROMO1 } from '../services/firebase';
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { CHAIN_ID_POLYGON, CHAIN_ID_MUMBAI } from '../configs/blockchain/web3auth';
import { BYTES, ZERO_BYTES, GAS_LIMIT_MULTIPLIER_NUMERATOR, GAS_LIMIT_MULTIPLIER_DENOMINATOR } from '../configs/general';

import { DialogInsufficientGas } from '../components/dialogs/DialogInsufficientGas'

import Button from '@mui/material/Button';

import { analytics } from '../services/firebase';
import { logEvent } from 'firebase/analytics';

import {
    POLYGON_ADDRESS_SF_HOST,
    POLYGON_ADDRESS_CFAV1,
    POLYGON_ADDRESS_USDC,
    POLYGON_ADDRESS_USDCx,
    MUMBAI_ADDRESS_SF_HOST,
    MUMBAI_ADDRESS_CFAV1,
    MUMBAI_ADDRESS_fUSDC,
    MUMBAI_ADDRESS_fUSDCx,
    ABI_SF_HOST,
    ABI_CFAV1,
    ABI_ERC20,
    ABI_SUPERTOKEN,
    OPERATION_TYPE_SUPERFLUID_CALL_AGREEMENT,
    DEFAULT_ADDRESS_SF_HOST,
    DEFAULT_ADDRESS_CFAV1,
    DEFAULT_ADDRESS_USDC,
    DEFAULT_ADDRESS_USDCx,
    DELETE_PERMISSION,
} from '../configs/blockchain/superfluid';

import {
    ADMIN_ADDRESS,
    PERCENTAGE_TAKE_NUMERATOR,
    PERCENTAGE_TAKE_DENOMINATOR,
    PERCENTAGE_TAKE_NUMERATOR_PROMO1,
} from '../configs/blockchain/admin';

export interface ISuperfluidGasContext {
    createFlow: (receiver: string, flowRate: string) => Promise<void>;
    deleteFlow: (sender: string, receiver: string) => Promise<void>;
    grantOperatorDeletePermission: () => Promise<void>;
    revokeOperatorAllPermissions: () => Promise<void>;
    getNetFlowTokenX: () => Promise<any>
    getFlowData: (sender: string, receiver: string) => Promise<any>;
    getDepositRequiredForFlowRate: (flowRate: string) => Promise<any>;
    getOperatorData: () => Promise<any>;
    // getTokenXRealtimeBalance: () => Promise<any>;
    getTokenBalance: (address?: string) => Promise<any>;
    getTokenXBalance: (address?: string) => Promise<any>;
    approveToken: (amount: string) => Promise<void>
    upgradeToken: (amount: string) => Promise<void>
    downgradeTokenX: (amount: string) => Promise<void>
    transferToken: (receiver: string, amount: string) => Promise<void>;
    transferTokenX: (receiver: string, amount: string) => Promise<void>;
    transferNative: (receiver: string, value: string) => Promise<void>;
    refreshSFStates: () => void
    setErrorCreatingFlow: (value: any) => void
    setErrorDeletingFlow: (value: any) => void
    sendTransaction: (maxPriorityFeeWei: any, maxFeeWei: any, txParam: any, createFlow_?: boolean, deleteFlow_?: boolean) => Promise<void>;
    hasGasToCreateAndDeleteFlow: (receiver: string, flowRate: string) => Promise<any>
    setIsCheckNetFlow: (value: boolean) => void
    isSettingUp: boolean
    isTransactionPending: boolean
    isCreatingFlow: boolean
    isDeletingFlow: boolean
    errorCreatingFlow: any
    errorDeletingFlow: any
    netFlow: string
    tokenAllowance: any
    tokenBalance: any
    tokenSymbol: any
    tokenXBalance: any
    tokenXSymbol: any
    hasDeletePermission: boolean
    getNetFlowAdminTokenXTmp: () => Promise<any>
}

export const SuperfluidGasContext = createContext<ISuperfluidGasContext>({
    createFlow: async (receiver: string, flowRate: string) => { },
    deleteFlow: async (sender: string, receiver: string) => { },
    grantOperatorDeletePermission: async () => { },
    revokeOperatorAllPermissions: async () => { },
    getNetFlowTokenX: async () => { },
    getFlowData: async (sender: string, receiver: string) => { },
    getDepositRequiredForFlowRate: async (flowRate: string) => { },
    getOperatorData: async () => { },
    getTokenBalance: async (address?: string) => { },
    getTokenXBalance: async (address?: string) => { },
    approveToken: async (amount: string) => { },
    upgradeToken: async (amount: string) => { },
    downgradeTokenX: async (amount: string) => { },
    transferToken: async (receiver: string, amount: string) => { },
    transferTokenX: async (receiver: string, amount: string) => { },
    transferNative: async (receiver: string, value: string) => { },
    refreshSFStates: () => { },
    setErrorCreatingFlow: (value: any) => { },
    setErrorDeletingFlow: (value: any) => { },
    sendTransaction: async (maxPriorityFeeWei: any, maxFeeWei: any, txParam: any, createFlow_?: boolean, deleteFlow_?: boolean) => { },
    hasGasToCreateAndDeleteFlow: async (receiver: string, flowRate: string) => { },
    setIsCheckNetFlow: (value: boolean) => { },
    isSettingUp: false,
    isTransactionPending: false,
    isCreatingFlow: false,
    isDeletingFlow: false,
    errorCreatingFlow: null,
    errorDeletingFlow: null,
    netFlow: "0",
    tokenAllowance: null,
    tokenBalance: null,
    tokenSymbol: null,
    tokenXBalance: null,
    tokenXSymbol: null,
    hasDeletePermission: false,
    getNetFlowAdminTokenXTmp: async () => { },
})

export const useSuperfluidGas = (): ISuperfluidGasContext => {
    return useContext(SuperfluidGasContext);
}

const INTERFACES_NOT_SETUP_MESSAGE = "Interface is not setup yet!"

export const SuperfluidGasProvider = ({ children }: { children: JSX.Element }) => {
    const { address: localAddress, user: web3authUser, chainId, signer, provider, refreshNativeBalance, getBalance } = useWeb3Auth()
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();


    const [sfHostAddress, setSFHostAddress] = useState<string>(DEFAULT_ADDRESS_SF_HOST)
    const [cfav1Address, setCFAV1Address] = useState<string>(DEFAULT_ADDRESS_CFAV1)
    const [tokenAddress, setTokenAddress] = useState<string>(DEFAULT_ADDRESS_USDC)
    const [tokenXAddress, setTokenXAddress] = useState<string>(DEFAULT_ADDRESS_USDCx)

    const [iSFHost, setISFHost] = useState<any>(null)
    const [iCFAV1, setICFAV1] = useState<any>(null)
    const [cCFAV1, setCCFAV1] = useState<any>(null)
    const [iERC20, setIERC20] = useState<any>(null)
    const [cERC20, setCERC20] = useState<any>(null)
    const [iSuperToken, setISuperToken] = useState<any>(null)
    const [cSuperToken, setCSuperToken] = useState<any>(null)
    const [isSettingUp, setIsSettingUp] = useState<boolean>(false)
    const [isTransactionPending, setIsTransactionPending] = useState<boolean>(false)
    const [isCreatingFlow, setIsCreatingFlow] = useState<boolean>(false)
    const [isDeletingFlow, setIsDeletingFlow] = useState<boolean>(false)
    const [errorCreatingFlow, setErrorCreatingFlow] = useState<any>(null)
    const [errorDeletingFlow, setErrorDeletingFlow] = useState<any>(null)

    const [tokenAllowance, setTokenAllowance] = useState<any>(null)
    const [tokenBalance, setTokenBalance] = useState<any>(null)
    const [tokenSymbol, setTokenSymbol] = useState<any>(null)
    const [tokenXBalance, setTokenXBalance] = useState<any>(null)
    const [tokenXSymbol, setTokenXSymbol] = useState<any>(null)
    const [hasDeletePermission, setHasDeletePermission] = useState<boolean>(false)
    const [isToggled, toggle] = useState<boolean>(false)

    const [isCheckNetFlow, setIsCheckNetFlow] = useState<boolean>(false)
    const [netFlow, setNetFlow] = useState<string>("0")

    const { isIdle } = useIdleTimer({
        timeout: 30000,
        onIdle: () => {
            setIsCheckNetFlow(false)
            console.log("state: idle")
        },
        onActive: () => {
            setIsCheckNetFlow(true)
            console.log("state: active")
        },
    })

    const [displayInsufficientGasModal, setDisplayInsufficientGasModal] = useState<boolean>(false)
    const [txParameters, setTxParameters] = useState<any>(null)
    const [isCreateFlowOperation, setIsCreateFlowOperation] = useState<any>(null)
    const [isDeleteFlowOperation, setIsDeleteFlowOperation] = useState<any>(null)

    useEffect(() => {
        setIsSettingUp(true)

        if (chainId && chainId === CHAIN_ID_POLYGON) {
            setSFHostAddress(POLYGON_ADDRESS_SF_HOST)
            setCFAV1Address(POLYGON_ADDRESS_CFAV1)
            setTokenAddress(POLYGON_ADDRESS_USDC)
            setTokenXAddress(POLYGON_ADDRESS_USDCx)
        } else if (chainId && chainId === CHAIN_ID_MUMBAI) {
            setSFHostAddress(MUMBAI_ADDRESS_SF_HOST)
            setCFAV1Address(MUMBAI_ADDRESS_CFAV1)
            setTokenAddress(MUMBAI_ADDRESS_fUSDC)
            setTokenXAddress(MUMBAI_ADDRESS_fUSDCx)
        }

        if (web3authUser && chainId && signer && tokenXAddress) {
            setISFHost(new ethers.utils.Interface(ABI_SF_HOST))
            setICFAV1(new ethers.utils.Interface(ABI_CFAV1))
            setCCFAV1(new ethers.Contract(
                cfav1Address,
                ABI_CFAV1,
                signer,
            ))
            setIERC20(new ethers.utils.Interface(ABI_ERC20))
            setCERC20(new ethers.Contract(
                tokenAddress,
                ABI_ERC20,
                signer,
            ))
            setISuperToken(new ethers.utils.Interface(ABI_SUPERTOKEN))
            setCSuperToken(new ethers.Contract(
                tokenXAddress,
                ABI_SUPERTOKEN,
                signer,
            ))

            setIsCheckNetFlow(true)
        }

        setIsTransactionPending(false)
        setErrorCreatingFlow(null)
        setErrorDeletingFlow(null)
        setIsSettingUp(false)
    }, [web3authUser, chainId, signer, tokenXAddress])

    useEffect(() => {
        const init = async () => {
            const tokenBalance = await getTokenBalance()
            const tokenXBalance = await getTokenXBalance()
            const tokenAllowance = await getTokenAllowance()
            const operatorData = await getOperatorData()

            if (tokenBalance) {
                setTokenBalance(tokenBalance.toString())
                setTokenSymbol(await getTokenSymbol())
            }

            if (tokenXBalance) {
                setTokenXBalance(tokenXBalance.toString())
                setTokenXSymbol(await getTokenXSymbol())
            }

            if (tokenAllowance) {
                setTokenAllowance(tokenAllowance.toString())
            }

            if (operatorData) {
                setHasDeletePermission(operatorData.permissions === DELETE_PERMISSION)
            }
        }
        if (chainId && localAddress && tokenAddress && cERC20 && cSuperToken) {
            init()
        }
    }, [chainId, localAddress, tokenAddress, cERC20, cSuperToken, isToggled])

    const refreshSFStates = () => {
        toggle(state => !state)
    }

    useInterval(() => {
        const run = async () => {
            // refreshSFStates() // too expensive to call refresh all states on loop
            const netFlow = await getNetFlowTokenX()
            if (netFlow) {
                setNetFlow(netFlow.toString())
                console.log("stream check RAN")
            }

            const idle = isIdle()
            if (idle) { // mainly useful if idle timer is very short like < 10seconds
                setIsCheckNetFlow(false)
                console.log("isIdle now so turn off")
            }
        }
        run()
    }, (isCheckNetFlow && web3authUser) ? 5000 : null)

    const action = (snackbarId: any) => (
        <>
            <Button onClick={ () => { closeSnackbar(snackbarId) } } sx={ { color: "black" } }>
                Dismiss
            </Button>
        </>
    );
    const notifyTransactionSent = () => {
        enqueueSnackbar("Sent! Please wait for awhile for the transaction to be processed.", { variant: 'info', autoHideDuration: 3500, action })
    }
    const notifyTransactionSuccess = () => {
        enqueueSnackbar("Success! Your transaction has been confirmed.", { variant: 'success', autoHideDuration: 3500, action })
    }
    const notifyTransactionFailed = (flowErrorCreate: boolean = false, flowErrorDelete: boolean = false) => {
        enqueueSnackbar(
            `Fail! Transaction execution error. 
            ${ flowErrorCreate ? "On create flow" : "" } 
            ${ flowErrorDelete ? "On delete flow. Please go to the settings to manually delete the flow." : "" }`,
            { variant: 'error', autoHideDuration: 3500, action }
        )
    }

    const sendTransaction = async (maxPriorityFeeWei: any, maxFeeWei: any, txParam: any, createFlow_ = false, deleteFlow_ = false) => {
        setIsTransactionPending(true)

        try {
            const gasPriceValues = {
                maxPriorityFeePerGas: ethers.BigNumber.from(maxPriorityFeeWei).toHexString(),
                maxFeePerGas: ethers.BigNumber.from(maxFeeWei).toHexString(),
            }

            const txParams = { ...txParam, ...gasPriceValues }

            const tx = await provider.send("eth_sendTransaction", [txParams])
            notifyTransactionSent()

            provider.once(tx, (transaction: any) => { // Emitted when the transaction has been mined
                console.log("Transaction confirmed on chain");
                console.log(transaction)

                refreshNativeBalance()
                refreshSFStates()
                setIsTransactionPending(false)
                setIsCreatingFlow(false)
                setIsDeletingFlow(false)

                notifyTransactionSuccess()

                // TODO: display video call, allow end call
            })
        } catch (error) {
            notifyTransactionFailed(createFlow_, deleteFlow_)

            if (createFlow_) {
                setErrorCreatingFlow(error)
            } else if (deleteFlow_) {
                setErrorDeletingFlow(error)
            }

            setIsTransactionPending(false)
            setIsCreatingFlow(false)
            setIsDeletingFlow(false)
            console.error("LiveThree Execute Error:", error)
            // TODO: exit call?
        }
    }

    const estimateGasRequired = async (txParam: any, maxFeeWei: any) => {
        const estimatedGasUnits = await provider.estimateGas(txParam)
        console.log("amount of estimated gas units required:", estimatedGasUnits.toString())
        const estimatedGasUnitsWithBuffer_ = estimatedGasUnits.mul(GAS_LIMIT_MULTIPLIER_NUMERATOR).div(GAS_LIMIT_MULTIPLIER_DENOMINATOR)
        const estimatedGasUnitsWithBuffer = estimatedGasUnits.add(estimatedGasUnitsWithBuffer_)
        console.log("buffered amount of estimated gas units required:", estimatedGasUnitsWithBuffer.toString())

        const estimatedGasCoinToUse = estimatedGasUnitsWithBuffer.mul(Number(maxFeeWei))
        console.log("estimated gas required:", estimatedGasCoinToUse.toString())

        return estimatedGasCoinToUse
    }

    const hasSufficientGas = async (estimatedGasCoinToUse: any) => {
        const nativeCoinBalance = await getBalance()

        if (!nativeCoinBalance.gte(estimatedGasCoinToUse)) {
            console.error("LiveThree: insufficient gas")
            return false
        } else {
            console.log("LiveThree: sufficient gas")
            return true
        }
    }

    const executeTransaction = async (txParameters: any, createFlow_ = false, deleteFlow_ = false) => {
        const txParam = { ...txParameters, ...{ from: localAddress, } }

        const { maxPriorityFeeWei, maxFeeWei } = await getFeeValuesSafeLow()
        console.log("max priority fee [wei]:", maxPriorityFeeWei)
        console.log("max fee [wei]:", maxFeeWei)

        const gasNeeded = await estimateGasRequired(txParam, maxFeeWei)
        const isEnoughGas = await hasSufficientGas(gasNeeded)

        if (isEnoughGas) {
            await sendTransaction(maxPriorityFeeWei, maxFeeWei, txParam, createFlow_, deleteFlow_)
        } else {
            setTxParameters(txParameters)
            setIsCreateFlowOperation(createFlow_)
            setIsDeleteFlowOperation(deleteFlow_)

            setDisplayInsufficientGasModal(true)
        }

    }

    const batchCall = (data1: any, data2: any) => {

        const abiCoder = new ethers.utils.AbiCoder()
        const encodedData1 = abiCoder.encode([BYTES, BYTES], [data1, ZERO_BYTES])
        const encodedData2 = abiCoder.encode([BYTES, BYTES], [data2, ZERO_BYTES])

        const data = iSFHost.encodeFunctionData("batchCall", [
            [
                [
                    OPERATION_TYPE_SUPERFLUID_CALL_AGREEMENT,
                    cfav1Address,
                    encodedData1,
                ],
                [
                    OPERATION_TYPE_SUPERFLUID_CALL_AGREEMENT,
                    cfav1Address,
                    encodedData2,
                ],
            ]
        ])

        const txParameters = {
            data: data,
            to: sfHostAddress,
        }

        return txParameters
    }

    const callAgreement = (data: any) => {
        const callAgreementData = iSFHost.encodeFunctionData("callAgreement", [
            cfav1Address,
            data,
            ZERO_BYTES, // userData is empty
        ])

        const txParameters = {
            data: callAgreementData,
            to: sfHostAddress,
        }

        return txParameters
    }

    const createFlowInternal = (receiver: string, flowRate: string, isPromo1: boolean) => {
        const flowRateBN = ethers.BigNumber.from(flowRate)

        let percentageTakeNumerator
        if (isPromo1) {
            percentageTakeNumerator = PERCENTAGE_TAKE_NUMERATOR_PROMO1
        } else {
            percentageTakeNumerator = PERCENTAGE_TAKE_NUMERATOR
        }

        const flowRateFee = flowRateBN.mul(percentageTakeNumerator).div(PERCENTAGE_TAKE_DENOMINATOR)
        const flowRateReceiver = flowRateBN.sub(flowRateFee)

        const dataReceiver = iCFAV1.encodeFunctionData("createFlow", [
            tokenXAddress,
            receiver,
            flowRateReceiver.toString(),
            ZERO_BYTES,
        ])

        const dataFee = iCFAV1.encodeFunctionData("createFlow", [
            tokenXAddress,
            ADMIN_ADDRESS,
            flowRateFee.toString(),
            ZERO_BYTES,
        ])

        return batchCall(dataReceiver, dataFee)
    }

    const createFlow = async (receiver: string, flowRate: string) => {
        if (!iSFHost || !iCFAV1) {
            console.warn(INTERFACES_NOT_SETUP_MESSAGE);
            return;
        }

        setIsCreatingFlow(true)

        // referral check
        let isPromo: boolean = false
        const docRef = doc(COL_REF_PROMO1, receiver)
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data()
            if (data.count > 0) {
                updateDoc(docRef, { count: increment(-1) }) // decrement
                isPromo = true
            }
        }

        const txParameters = createFlowInternal(receiver, flowRate, isPromo)
        await executeTransaction(txParameters, true, false)
        logEvent(analytics, "create_flow")
    }

    const deleteFlowInternal = (sender: string, receiver: string) => {

        const dataReceiver = iCFAV1.encodeFunctionData("deleteFlow", [
            tokenXAddress,
            sender,
            receiver,
            ZERO_BYTES,
        ])

        const dataFee = iCFAV1.encodeFunctionData("deleteFlow", [
            tokenXAddress,
            sender,
            ADMIN_ADDRESS,
            ZERO_BYTES,
        ])

        return batchCall(dataReceiver, dataFee)
    }

    const deleteFlow = async (sender: string, receiver: string) => {
        if (!iSFHost || !iCFAV1) {
            console.warn(INTERFACES_NOT_SETUP_MESSAGE);
            return;
        }

        setIsDeletingFlow(true)


        // const dataReceiver = iCFAV1.encodeFunctionData("deleteFlow", [
        //     tokenXAddress,
        //     sender,
        //     receiver,
        //     ZERO_BYTES,
        // ])

        // const dataFee = iCFAV1.encodeFunctionData("deleteFlow", [
        //     tokenXAddress,
        //     sender,
        //     ADMIN_ADDRESS,
        //     ZERO_BYTES,
        // ])

        // const txParameters = batchCall(dataReceiver, dataFee)

        const txParameters = deleteFlowInternal(sender, receiver)
        await executeTransaction(txParameters, false, true)
        logEvent(analytics, "delete_flow")
    }

    const hasGasToCreateAndDeleteFlow = async (receiver: string, flowRate: string) => {
        if (!iSFHost || !iCFAV1) {
            console.warn(INTERFACES_NOT_SETUP_MESSAGE);
            return;
        }

        if (!localAddress) {
            return
        }

        const txParametersCreateFlow = createFlowInternal(receiver, flowRate, false)
        // const txParametersDeleteFlow = deleteFlowInternal(localAddress, receiver)

        const txParamCreateFlow = { ...txParametersCreateFlow, ...{ from: localAddress, } }
        // const txParamDeleteFlow = { ...txParametersDeleteFlow, ...{ from: localAddress, } }

        const { maxPriorityFeeWei, maxFeeWei } = await getFeeValuesSafeLow()

        const gasNeededToCreateFlow = await estimateGasRequired(txParamCreateFlow, maxFeeWei)
        // const gasNeededToDeleteFlow = await estimateGasRequired(txParamDeleteFlow, maxFeeWei) // cant tet has no flow created
        // const gasNeeded = gasNeededToCreateFlow.add(gasNeededToDeleteFlow)
        const gasNeeded = gasNeededToCreateFlow.mul(2)

        return await hasSufficientGas(gasNeeded)
    }

    const grantOperatorDeletePermission = async () => {
        if (!iSFHost || !iCFAV1) {
            console.warn(INTERFACES_NOT_SETUP_MESSAGE);
            return;
        }

        const data = iCFAV1.encodeFunctionData("updateFlowOperatorPermissions", [
            tokenXAddress,
            ADMIN_ADDRESS,
            DELETE_PERMISSION.toString(), // grants operator the delete permission (example only)
            "0", // flow allowance is 0 for delete permission
            [], // empty // TODO: change to 0x constant and test
        ])

        const txParameters = await callAgreement(data)
        await executeTransaction(txParameters)
        logEvent(analytics, "grant_permission_delete")
    }

    const revokeOperatorAllPermissions = async () => {
        if (!iSFHost || !iCFAV1) {
            console.warn(INTERFACES_NOT_SETUP_MESSAGE);
            return;
        }

        const data = iCFAV1.encodeFunctionData("revokeFlowOperatorWithFullControl", [
            tokenXAddress,
            ADMIN_ADDRESS,
            [], // empty // TODO: change to 0x constant and test
        ])

        const txParameters = await callAgreement(data)
        await executeTransaction(txParameters)
        logEvent(analytics, "revoke_all_permissions")
    }

    const getNetFlowTokenX = async () => {
        if (!cCFAV1) {
            console.warn(INTERFACES_NOT_SETUP_MESSAGE);
            return;
        }

        if (!localAddress || !tokenXAddress) {
            return
        }

        try {
            return await cCFAV1.getNetFlow(
                tokenXAddress,
                localAddress,
            )
        } catch (error: any) {
            if (error.reason) {
                console.error(error)
            }

            return
        }
    }

    const getFlowData = async (sender: string, receiver: string) => { // TODO: this is currently TokenX specific, change this !!
        if (!cCFAV1) {
            console.warn(INTERFACES_NOT_SETUP_MESSAGE);
            return;
        }

        try {
            return await cCFAV1.getFlow(
                tokenXAddress,
                sender,
                receiver,
            )
        } catch (error: any) {
            if (error.reason) {
                console.error(error)
            }

            return
        }
    }

    const getDepositRequiredForFlowRate = async (flowRate: string) => {
        if (!cCFAV1) {
            console.warn(INTERFACES_NOT_SETUP_MESSAGE);
            return;
        }

        try {
            return await cCFAV1.getDepositRequiredForFlowRate(
                tokenXAddress,
                flowRate,
            )
        } catch (error: any) {
            if (error.reason) {
                console.error(error)
            }

            return
        }
    }

    const getOperatorData = async () => {
        if (!cCFAV1) {
            console.warn(INTERFACES_NOT_SETUP_MESSAGE);
            return;
        }

        if (!localAddress || !tokenXAddress) {
            return
        }

        try {
            return await cCFAV1.getFlowOperatorData(
                tokenXAddress,
                localAddress, // can only check own flow operator data
                ADMIN_ADDRESS,
            ) // object: .permissions && .flowRateAllowance.toString()
        } catch (error: any) {
            if (error.reason) {
                console.error(error)
            }

            return
        }
    }

    // const hasDeletePermission = async () => {
    //     if (!cCFAV1) {
    //         console.warn(INTERFACES_NOT_SETUP_MESSAGE);
    //         return;
    //     }

    //     const operatorData = await getOperatorData()
    //     return operatorData.permissions === DELETE_PERMISSION
    // }

    // const getTokenXRealtimeBalance = async () => {
    //     if (!cCFAV1) {
    //         console.warn(INTERFACES_NOT_SETUP_MESSAGE);
    //         return;
    //     }

    //     return await cCFAV1.realtimeBalanceOf(
    //         tokenXAddress,
    //         localAddress,
    //         (new Date()).getTime(),
    //     )
    // }

    const getTokenAllowance = async () => {
        if (!cERC20) {
            console.warn(INTERFACES_NOT_SETUP_MESSAGE);
            return;
        }

        if (!localAddress || !tokenXAddress) {
            return;
        }
        try {
            return await cERC20.allowance(localAddress, tokenXAddress)
        } catch (error: any) {
            if (error.reason) {
                console.error(error)
            }

            return
        }
    }

    const getTokenBalance = async (address: string = "") => {
        if (!cERC20) {
            console.warn(INTERFACES_NOT_SETUP_MESSAGE);
            return;
        }

        if (!localAddress) {
            return;
        }
        try {
            return await cERC20.balanceOf(
                address !== "" ? address : localAddress,
            )
        } catch (error: any) {
            if (error.reason) {
                console.error(error)
            }

            return
        }
    }

    const getTokenSymbol = async () => {
        if (!cERC20) {
            console.warn(INTERFACES_NOT_SETUP_MESSAGE);
            return;
        }

        return await cERC20.symbol()
    }

    const getTokenXBalance = async (address: string = "") => {
        if (!cSuperToken) {
            console.warn(INTERFACES_NOT_SETUP_MESSAGE);
            return;
        }

        if (!localAddress) {
            return;
        }
        try {
            return await cSuperToken.balanceOf(
                address !== "" ? address : localAddress,
            )
        } catch (error: any) {
            if (error.reason) {
                console.error(error)
            }

            return
        }
    }

    const getTokenXSymbol = async () => {
        if (!cSuperToken) {
            console.warn(INTERFACES_NOT_SETUP_MESSAGE);
            return;
        }

        return await cSuperToken.symbol()
    }

    const approveToken = async (amount: string) => {
        if (!iERC20) {
            console.warn(INTERFACES_NOT_SETUP_MESSAGE);
            return;
        }

        if (!tokenXAddress) {
            console.error(`${ tokenXAddress }. Token address not ready.`)
            return
        }

        const data = iERC20.encodeFunctionData("approve", [
            tokenXAddress,
            amount,
        ])

        const txParameters = {
            data: data,
            to: tokenAddress,
        }

        await executeTransaction(txParameters)
        logEvent(analytics, "token_approve")
    }

    const upgradeToken = async (amount: string) => {
        if (!iSuperToken) {
            console.warn(INTERFACES_NOT_SETUP_MESSAGE);
            return;
        }

        const data = iSuperToken.encodeFunctionData("upgrade", [
            amount,
        ])

        const txParameters = {
            data: data,
            to: tokenXAddress,
        }

        await executeTransaction(txParameters)
        logEvent(analytics, "token_upgrade")
    }

    const downgradeTokenX = async (amount: string) => {
        if (!iSuperToken) {
            console.warn(INTERFACES_NOT_SETUP_MESSAGE);
            return;
        }

        const data = iSuperToken.encodeFunctionData("downgrade", [
            amount,
        ])

        const txParameters = {
            data: data,
            to: tokenXAddress,
        }

        await executeTransaction(txParameters)
        logEvent(analytics, "token_downgrade")
    }

    const transferToken = async (receiver: string, amount: string) => {
        if (!iERC20) {
            console.warn(INTERFACES_NOT_SETUP_MESSAGE);
            return;
        }

        const data = iERC20.encodeFunctionData("transfer", [
            receiver,
            amount,
        ])

        const txParameters = {
            data: data,
            to: tokenAddress,
        }

        await executeTransaction(txParameters)
        logEvent(analytics, "token_transfer")
    }

    const transferTokenX = async (receiver: string, amount: string) => {
        if (!iSuperToken) {
            console.warn(INTERFACES_NOT_SETUP_MESSAGE);
            return;
        }

        const data = iSuperToken.encodeFunctionData("transfer", [
            receiver,
            amount,
        ])

        const txParameters = {
            data: data,
            to: tokenXAddress,
        }

        await executeTransaction(txParameters)
        logEvent(analytics, "token_transfer_x")
    }

    const transferNative = async (receiver: string, value: string) => {
        const txParameters = {
            value: ethers.BigNumber.from(value).toHexString(),
            to: receiver,
        }

        await executeTransaction(txParameters)
        logEvent(analytics, "token_transfer_native")
    }

    const getNetFlowAdminTokenXTmp = async () => {
        if (!cCFAV1) {
            console.warn(INTERFACES_NOT_SETUP_MESSAGE);
            return;
        }

        return await cCFAV1.getNetFlow(
            tokenXAddress,
            ADMIN_ADDRESS,
        )
    }

    const contextProvider = {
        createFlow,
        deleteFlow,
        grantOperatorDeletePermission,
        revokeOperatorAllPermissions,
        getNetFlowTokenX,
        getFlowData,
        getDepositRequiredForFlowRate,
        getOperatorData,
        getTokenBalance,
        getTokenXBalance,
        approveToken,
        upgradeToken,
        downgradeTokenX,
        transferToken,
        transferTokenX,
        transferNative,
        refreshSFStates,
        setErrorCreatingFlow,
        setErrorDeletingFlow,
        sendTransaction,
        hasGasToCreateAndDeleteFlow,
        setIsCheckNetFlow,
        isSettingUp,
        isTransactionPending,
        isCreatingFlow,
        isDeletingFlow,
        errorCreatingFlow,
        errorDeletingFlow,
        netFlow,
        tokenAllowance,
        tokenBalance,
        tokenSymbol,
        tokenXBalance,
        tokenXSymbol,
        hasDeletePermission,
        getNetFlowAdminTokenXTmp,
    }
    return (
        <SuperfluidGasContext.Provider value={ contextProvider }>
            { children }
            <DialogInsufficientGas
                strict={ false }
                open={ displayInsufficientGasModal } setOpen={ setDisplayInsufficientGasModal }
                txParameters={ txParameters } setTxParameters={ setTxParameters }
                isCreateFlow={ isCreateFlowOperation } setIsCreateFlowOperation={ setIsCreateFlowOperation }
                isDeleteFlow={ isDeleteFlowOperation } setIsDeleteFlowOperation={ setIsDeleteFlowOperation }
            />
        </SuperfluidGasContext.Provider>
    )
}