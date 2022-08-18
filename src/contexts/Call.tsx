import { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom';
import { doc, setDoc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore"
import { COL_REF_USERS, COL_REF_CALLER_HAS_ROOM, getColRefActive, getColRefHistoryKey, functions, auth, analytics } from '../services/firebase';
import { logEvent } from 'firebase/analytics';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useDocumentData, useCollectionData } from 'react-firebase-hooks/firestore';
import { useHttpsCallable } from 'react-firebase-hooks/functions';
import { useWeb3Auth } from '../contexts/Web3Auth';
import { useSuperfluidGas } from '../contexts/SuperfluidGas';
import { useTimeoutFn, useUpdateEffect, useEffectOnce, useInterval, usePrevious } from 'react-use';
import { useSnackbar } from 'notistack';
import { useLogoutFlow } from "../hooks/useLogoutFlow";
import useSound from 'use-sound';

import ringtone from '../assets/ringtone.wav'

import { ROLE_CALLER, ROLE_CALLEE } from '../configs/hms';
import { CALL_PENDING_EXPIRE_IN_MS, PLACEHOLDER_ADDRESS, END_CALL_BUFFER_SECONDS } from '../configs/general';
import { POLYGON_ADDRESS_USDCx, MUMBAI_ADDRESS_fUSDCx } from '../configs/blockchain/superfluid';
import { CHAIN_ID_POLYGON, CHAIN_ID_MUMBAI } from '../configs/blockchain/web3auth';
import { ADMIN_ADDRESS } from '../configs/blockchain/admin';

import {
    useHMSActions,
    useHMSStore,
    useHMSNotifications,
    selectIsConnectedToRoom,
    // selectLocalPeer,
    // selectRemotePeers,
    // selectPermissions,
    // selectIsLocalAudioEnabled,
    // selectIsLocalVideoEnabled,
    selectPeerCount,
    // selectRoomStartTime,
    // selectConnectionQualities,
    // selectConnectionQualityByPeerID,
    HMSNotificationTypes,
} from "@100mslive/react-sdk";
import { ethers } from 'ethers';

import Button from '@mui/material/Button';

// import axios from 'axios';

export interface ICallContext {
    isInitiating: boolean
    isEntering: boolean
    isEnding: boolean
    activeCallMaxSeconds: string
    flowDeposit: any
    isRingtoneEnabled: boolean
    isCalleeInCall: boolean
    hasRoom: boolean
    setIsEntering: (value: boolean) => void
    initiateCall: (calleeAddress: any) => Promise<void>;
    acceptCall: (callerAddress: any, roomId: any) => Promise<void>;
    cleanUp: (calleeAddress: any, callerAddress: any, active?: boolean, reason?: string, initiateEnd?: boolean) => Promise<void>;
    clearPendingCall: () => void
    clearActiveCall: () => void
    setIsRingtoneEnabled: (value: boolean) => void
}

export const CallContext = createContext<ICallContext>({
    isInitiating: false,
    isEntering: false,
    isEnding: false,
    activeCallMaxSeconds: "0",
    flowDeposit: null,
    isRingtoneEnabled: true,
    isCalleeInCall: false,
    hasRoom: false,
    setIsEntering: (value: boolean) => { },
    initiateCall: async (calleeAddress: any) => { },
    acceptCall: async (callerAddress: any, roomId: any) => { },
    cleanUp: async (calleeAddress: any, callerAddress: any, active?: boolean, reason?: string, initiateEnd?: boolean) => { },
    clearPendingCall: () => { },
    clearActiveCall: () => { },
    setIsRingtoneEnabled: (value: boolean) => { },
})

export const useCall = (): ICallContext => {
    return useContext(CallContext);
}

type LocationProps = {
    state: {
        from: Location;
    };
};

export const CallProvider = ({ children }: { children: JSX.Element }) => {
    const [firebaseUser] = useAuthState(auth);
    const { address: localAddress, chainId } = useWeb3Auth()
    const { createFlow, isCreatingFlow, errorCreatingFlow, setErrorCreatingFlow, deleteFlow, isDeletingFlow, errorDeletingFlow, setErrorDeletingFlow, isTransactionPending, getFlowData, getTokenXBalance } = useSuperfluidGas()

    const { logout } = useLogoutFlow(firebaseUser?.uid)

    const [isCallee, setIsCallee] = useState<boolean>(false)
    const [isCaller, setIsCaller] = useState<boolean>(false)
    const [otherAddress, setOtherAddress] = useState<string>(PLACEHOLDER_ADDRESS)
    const [theCalleeAddress, setTheCalleeAddress] = useState<string>(PLACEHOLDER_ADDRESS)
    const [theCallerAddress, setTheCallerAddress] = useState<string>(PLACEHOLDER_ADDRESS)

    const isConnectedToRoom = useHMSStore(selectIsConnectedToRoom);
    const [localUserData] = useDocumentData<any>(doc(COL_REF_USERS, firebaseUser?.uid));
    const [activeCalls, loadingActiveCalls, activeCallsError] = useCollectionData(getColRefActive(localAddress || "empty"));
    const [activeRoomData, isLoadingActiveRoomData, activeRoomDataError] = useDocumentData(doc(getColRefActive(theCalleeAddress), theCallerAddress));
    const [asCallerData] = useDocumentData(doc(COL_REF_CALLER_HAS_ROOM, localAddress))
    const [hasRoom, setHasRoom] = useState<boolean>(false)
    useEffect(() => {
        setHasRoom(asCallerData?.hasRoom)
    }, [asCallerData])

    const [isRingtoneEnabled, setIsRingtoneEnabled] = useState<boolean>(true)
    const [play, { stop }] = useSound(ringtone, { soundEnabled: isRingtoneEnabled });
    const [isRinging, setIsRinging] = useState<boolean>(false)
    const hmsActions = useHMSActions();
    const navigate = useNavigate();
    const location = useLocation() as unknown as LocationProps; // https://github.com/reach/router/issues/414#issuecomment-1056839570
    const prevLocation = usePrevious(location) as unknown as LocationProps;

    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const [isCheckForRingAgain, setIsCheckForRingAgain] = useState<boolean>(false)

    const [createRoom, isCreatingRoom, createRoomError] = useHttpsCallable(functions, 'createRoom');
    const [fetchToken, isFetchingToken, fetchTokenError] = useHttpsCallable(functions, 'generateAccessToken');

    const [isInitiating, setIsInitiating] = useState<boolean>(false)
    const [isEntering, setIsEntering] = useState<boolean>(false)
    const [isEnding, setIsEnding] = useState<boolean>(false)
    const [isCallerInCall, setIsCallerInCall] = useState<boolean>(false)
    const [isCalleeInCall, setIsCalleeInCall] = useState<boolean>(false)

    //
    // const [turnTapOn, turningOn, turnOnError] = useHttpsCallable(functions, 'turnTapOn');
    const [turnTapOff, turningOff, turnOffError] = useHttpsCallable(functions, 'turnTapOff');

    const hmsNotification = useHMSNotifications();
    const peerCount = useHMSStore(selectPeerCount);

    const [activeCallMaxSeconds, setActiveCallMaxSeconds] = useState<string>("0") // TODO: account for if user top-up mid way
    const [flowDeposit, setFlowDeposit] = useState<any>(null)

    useEffect(() => {
        if (isConnectedToRoom) {
            setIsEntering(false)
        }

    }, [isConnectedToRoom])

    useEffect(() => { // TODO: some cases if history not proper, it will have bug, checkout: https://stackoverflow.com/a/60055110
        // console.log("location changed!")
        // console.log(location.state?.from?.pathname)
        // console.log(prevLocation?.state?.from?.pathname)
        const prevLocation_ = prevLocation?.state?.from?.pathname
        // console.log(prevLocation_)
        // console.log(typeof prevLocation_)
        // console.log(prevLocation_?.split("/"))
        // console.log(prevLocation_?.split("/")[0])
        // console.log(prevLocation_?.split("/")[1])

        if (isCallerInCall && prevLocation_?.split("/")[1] === 'user') {
            endActiveCallFromCaller()
        } else if (isCallee && prevLocation_ && prevLocation_ === '/calls') {
            endActiveCallFromCallee()
        } else {
            // console.log("no isCaller/isCallee")
        }
    }, [location])

    useEffect(() => {
        let isAccessed = false
        activeCalls?.reverse().map((item: any, index: number) => {
            const useKey = <div key={ index }></div>

            if (item?.callee) { // note: this setup means there can only be 1 active call at a time
                setIsCalleeInCall(true) // why set here instead of on join call clicked? because it needs to reflect in all tabs for same user
                isAccessed = true
            }
        })

        if (!isAccessed) {
            setIsCalleeInCall(false)
        }
    }, [activeCalls])

    const updateLocalInCallActivity = async (uid: any, active: boolean) => {
        await updateDoc(doc(COL_REF_USERS, uid), {
            isActive: active
        })
    }
    useEffect(() => { // so that others know u r in call (disable callicon)

        // TODO: enhance to batch operation (save cost): https://firebase.google.com/docs/firestore/manage-data/transactions#batched-writes
        if (activeRoomData && localUserData) {
            if (!localUserData?.isActive && localAddress === activeRoomData?.caller && activeRoomData?.callee) {
                updateLocalInCallActivity(firebaseUser?.uid, true)
            }
            if (!localUserData?.isActive && localAddress === activeRoomData?.callee) {
                updateLocalInCallActivity(firebaseUser?.uid, true)
            }
        } else if (!activeRoomData) {
            if (localUserData?.isActive) {
                updateLocalInCallActivity(firebaseUser?.uid, false)
            }
        }
    }, [activeRoomData])

    useInterval(() => {
        play()
    }, isRinging ? 2500 : null)
    useEffect(() => {
        stop()

        const ringCondition = activeCalls && activeCalls?.length > 0 && !isConnectedToRoom && !isEnding

        if (ringCondition) {

            setTimeout(() => {
                setIsCheckForRingAgain(state => !state)
            }, 5000)

        } else if (activeCalls?.length === 0 || isConnectedToRoom) {
            setIsRinging(false)
            stop()
        }
    }, [activeCalls?.length, isConnectedToRoom, isEnding])
    useEffect(() => {
        if (isCalleeInCall) {
            setIsRinging(false)
            stop()
        }
    }, [activeCalls?.length, isConnectedToRoom, isCalleeInCall])
    useEffect(() => {
        const ringCondition = activeCalls && activeCalls?.length > 0 && !isConnectedToRoom && !isEnding && !isCalleeInCall

        if (ringCondition) {
            notifyIncomingCall()
            setIsRinging(true)
        }

    }, [isCheckForRingAgain, isCalleeInCall])
    useEffect(() => {
        console.log("INCALL", isCalleeInCall)
    }, [isCalleeInCall])

    useEffect(() => {
        if (otherAddress !== PLACEHOLDER_ADDRESS && otherAddress !== localAddress && isCaller) {
            setTheCalleeAddress(otherAddress)
            setTheCallerAddress(localAddress)
        }

        if (otherAddress !== PLACEHOLDER_ADDRESS && otherAddress !== localAddress && isCallee) {
            setTheCalleeAddress(localAddress)
            setTheCallerAddress(otherAddress)
        }
    }, [otherAddress])


    useEffect(() => { // note: important debug check
        if (localAddress && localUserData?.address && localAddress !== localUserData?.address) {
            console.error("LiveThree Error: ADDRESS NOT MATCH")
            console.error(localAddress)
            console.error(localUserData?.address)
            enqueueSnackbar("Multiple login detected on the browser, logging out.", { variant: 'info', autoHideDuration: 10000, action })
            logout()

            console.warn("logging out user")
        }
    }, [localAddress, localUserData])

    const actionIncomingCall = (snackbarId: any) => (
        <>
            { !isConnectedToRoom &&
                <Button
                    onClick={ () => {
                        navigate("/calls")
                        closeSnackbar(snackbarId)
                    } }
                    sx={ { color: "white" } }
                >
                    View
                </Button>
            }

            <Button onClick={ () => { closeSnackbar(snackbarId) } } sx={ { color: "black" } }>
                Dismiss
            </Button>
        </>
    );
    const notifyIncomingCall = () => {
        enqueueSnackbar("Incoming call", { variant: 'info', autoHideDuration: 9000, action: actionIncomingCall })
    }
    const action = (snackbarId: any) => (
        <>
            <Button onClick={ () => { closeSnackbar(snackbarId) } } sx={ { color: "black" } }>
                Dismiss
            </Button>
        </>
    );
    const notifyCallEnded = () => {
        enqueueSnackbar("Call ended", { variant: 'info', autoHideDuration: 3500, action })
    }

    const cleanUp = async (
        calleeAddress: any,
        callerAddress: any,
        active: boolean = false,
        reason: string = "end call",
        rejectCall: boolean = false,
        simpleCleanUp: boolean = false,
    ) => {
        setIsEnding(true)

        try {
            // if (initiateEnd) { // this line is dangerous
            //     await hmsActions.endRoom(true, reason);
            // }
            await hmsActions.endRoom(true, reason);


            if (active) {
                console.log("was an active call", activeRoomData?.caller, activeRoomData?.callee)

                if (calleeAddress === localAddress) { // callee
                    let tokenXAddress
                    if (chainId === CHAIN_ID_POLYGON) {
                        tokenXAddress = POLYGON_ADDRESS_USDCx
                    } else if (chainId === CHAIN_ID_MUMBAI) {
                        tokenXAddress = MUMBAI_ADDRESS_fUSDCx
                    } else {
                        console.error(`${ chainId } ${ typeof chainId } not supported - turnTapOff`)
                    }

                    console.warn("delete flow - TAP")
                    try {
                        const data = {
                            chainId: chainId.toString(),
                            tokenXAddress: tokenXAddress,
                            sender: callerAddress,
                            receiver: calleeAddress,
                        }
                        const resp = await turnTapOff(data)
                        console.log(resp)

                        // await axios.post("https://us-central1-moonlight-173df.cloudfunctions.net/turnTapOffHttp", data)
                    } catch (error: any) {
                        enqueueSnackbar("Something went wrong! - turn tap off", { variant: 'error', autoHideDuration: 3000, action })
                        console.error(error)
                    }

                } else {
                    /**
                     * TODO:
                     * warning, this line might be called sometimes on callee side if call ended 
                     * from caller side either manual or using timeout end
                     * which in turn hits the 'enqueueSnackbar' error, so comment this out for now
                     * (wont hit issue if using webhooks)
                     */
                    console.warn("delete flow - GAS")
                    try {
                        await deleteFlow(callerAddress, calleeAddress)
                    } catch (error: any) {
                        // enqueueSnackbar("Something went wrong!. - Delete flow (in call)", { variant: 'error', autoHideDuration: 3000, action })
                        console.error(error)
                    }
                }

                notifyCallEnded()

                await archiveCall()
            }

            if (!simpleCleanUp && (activeRoomData?.roomId || rejectCall || active)) {
                console.warn("firebase room removed")

                // TODO: MAKE THIS A BATCH CALL SAVE COST !!
                await Promise.all([
                    deleteDoc(doc(COL_REF_CALLER_HAS_ROOM, callerAddress)),
                    deleteDoc(doc(getColRefActive(calleeAddress), callerAddress)),
                ])

                // await deleteDoc(doc(COL_REF_CALLER_HAS_ROOM, callerAddress))
                // await deleteDoc(doc(getColRefActive(calleeAddress), callerAddress));
            }

            setActiveCallMaxSeconds("0")
            setFlowDeposit(null)
            setIsCallee(false)
            setIsCaller(false)
            setOtherAddress(PLACEHOLDER_ADDRESS)
            setTheCalleeAddress(PLACEHOLDER_ADDRESS)
            setTheCallerAddress(PLACEHOLDER_ADDRESS)
            setIsCallerInCall(false)

            if (active) {
                navigate(location.state?.from?.pathname || '/', { replace: true }) //
            }
        } catch (error) {
            console.error(error)
        }

        logEvent(analytics, "call_cleared")
        console.log("call cleared")
        setIsEnding(false)
    }

    const endPendingCallFromCaller = async () => {
        if (!activeRoomData?.callee && isCaller) { // only for precall (pending call), but triggers on active call as well (ignore this side effect)
            console.log("clear call - PENDING - endPendingCallFromCaller")
            await cleanUp(otherAddress, localAddress, false, "timeout", true)
            clearPendingCall()
        }

        // if (localUserData?.isActive) { // extra functionality newly added (not related to parent fn name)

        // }
        await updateLocalInCallActivity(firebaseUser?.uid, false)
    }

    const endActiveCallFromCaller = async () => {
        if (otherAddress !== PLACEHOLDER_ADDRESS && otherAddress !== localAddress) {
            console.log("clear call - ACTIVE - endActiveCallFromCaller")
            await cleanUp(otherAddress, localAddress, true, "out of funds")
            clearActiveCall()
        }
    }

    const endActiveCallFromCallee = async () => {
        if (otherAddress !== PLACEHOLDER_ADDRESS && otherAddress !== localAddress) {
            console.log("clear call - ACTIVE - endActiveCallFromCallee")
            await cleanUp(localAddress, otherAddress, true, "")
            clearActiveCall()
        }
    }

    const [isCallPending, clearPendingCall, resetPendingCall] = useTimeoutFn(endPendingCallFromCaller, CALL_PENDING_EXPIRE_IN_MS)
    const [isCallActive, clearActiveCall, resetActiveCall] = useTimeoutFn(endActiveCallFromCaller, Number(activeCallMaxSeconds) * 1000) // TODO: caution for BigNumber | * 1000 to convert to MS

    useEffectOnce(() => {
        clearPendingCall()
        clearActiveCall()
    })

    const clearEventListener = () => {
        window.removeEventListener('beforeunload', endPendingCallFromCaller)
        // window.removeEventListener('unload', endPendingCallFromCaller)
        window.removeEventListener('popstate', endPendingCallFromCaller)

        console.warn("event listener cleared")
    }

    // ----- 1. initiate call - caller creates room, on standby----- //
    const initiateCall = async (calleeAddress: any) => {
        setIsInitiating(true)

        setErrorCreatingFlow(null)
        setErrorDeletingFlow(null)

        try {
            const roomDetails: any = await createRoom()
            const roomId = roomDetails?.data.id
            const token = await fetchToken({ roomId: roomId, userId: localAddress, role: ROLE_CALLER })

            await setDoc(doc(getColRefActive(calleeAddress), localAddress), { // TODO: save these data locally?
                roomId: roomId,
                caller: localAddress,
                callerToken: token?.data,
                callerPicture: localUserData?.photoURL,
                callerDisplayName: localUserData?.displayName,
                callerUid: firebaseUser?.uid,
                callerChainId: chainId,
                callStartTimestamp: Date.now(),
            })

            await setDoc(doc(COL_REF_CALLER_HAS_ROOM, localAddress), {
                hasRoom: true,
            })

            setOtherAddress(calleeAddress)
            setIsCaller(true)
            resetPendingCall()
        } catch (error) {
            console.error(error)
        }

        setIsInitiating(false)
    }

    // ----- 2. accept call - callee joins room ----- //
    const acceptCall = async (callerAddress: any, roomId: any) => {
        setIsEntering(true)

        setIsRinging(false)
        stop()

        setErrorCreatingFlow(null)
        setErrorDeletingFlow(null)

        try {
            const token = await fetchToken({ roomId: roomId, userId: localAddress, role: ROLE_CALLEE })
            const tokenData: any = token?.data

            await updateDoc(doc(getColRefActive(localAddress), callerAddress), {// TODO: save these data locally?
                callee: localAddress,
                calleeToken: tokenData,
                calleePicture: localUserData?.photoURL,
                calleeDisplayName: localUserData?.displayName,
                calleeUid: firebaseUser?.uid,
                flowRate: localUserData?.flowRate,
            })

            hmsActions.join({
                userName: localUserData?.displayName,
                authToken: tokenData
            });

            setOtherAddress(callerAddress)
            setIsCallee(true)

            clearEventListener()

            navigate(`/call/${ callerAddress }/${ localAddress }/${ localUserData?.flowRate }`, {
                state: {
                    from: location,
                }
            })
        } catch (error) {
            console.error(error)
        }
    }

    // ----- 3. start call - caller joins room ----- //
    useUpdateEffect(() => {
        if (activeRoomData?.caller === localAddress && activeRoomData?.callee === otherAddress && activeRoomData?.calleeToken) {
            setIsEntering(true)
            hmsActions.join({
                userName: localUserData?.displayName,
                authToken: activeRoomData?.callerToken
            });
            setIsCallerInCall(true)
            clearPendingCall()

            clearEventListener()

            navigate(`/call/${ localAddress }/${ otherAddress }/${ activeRoomData?.flowRate }`, {
                state: {
                    from: location,
                }
            })
        }
    }, [activeRoomData?.callee])

    useUpdateEffect(() => {
        const callerCleanUp = async () => {
            console.log("clear call - PENDING - callerCleanUp")
            await cleanUp(otherAddress, localAddress, false, "callee cancelled")
            clearPendingCall()
        }

        if (!activeRoomData?.caller && otherAddress && otherAddress !== PLACEHOLDER_ADDRESS && isCaller) {
            console.warn(`clean up from caller side (stop pending timer) if callee reject call`) // may run as side effect of other operations
            callerCleanUp()
        }
    }, [activeRoomData?.caller])

    useEffect(() => {
        window.addEventListener('beforeunload', endPendingCallFromCaller) // https://developer.mozilla.org/en-US/docs/Web/API/Window#load_unload_events
        // window.addEventListener('unload', endPendingCallFromCaller)
        window.addEventListener('popstate', endPendingCallFromCaller) // TODO: does NOT fire properly, esp when on first load, then call immediately then back
        return () => {
            clearEventListener()
        }
    }, [otherAddress])

    // useEffect(() => { // this block doesn't really work (use when PEER_LEFT block instead)
    //     window.addEventListener('beforeunload', endActiveCallFromCaller) // https://developer.mozilla.org/en-US/docs/Web/API/Window#load_unload_events
    //     window.addEventListener('popstate', endActiveCallFromCaller) // TODO: does NOT fire properly, esp when on first load, then call immediately then back

    //     return () => {
    //         window.removeEventListener('beforeunload', endActiveCallFromCaller)
    //         window.removeEventListener('popstate', endActiveCallFromCaller)
    //     }
    // }, [isConnectedToRoom, activeRoomData?.callee])

    const archiveCall = async () => { // TODO: call from 1 side only to NOT double save - from side that end call
        try {
            // set caller history
            await setDoc(doc(getColRefHistoryKey(activeRoomData?.caller), activeRoomData?.roomId),
                { ...activeRoomData, ...{ timestamp: serverTimestamp() } }
            )
            // set callee history
            await setDoc(doc(getColRefHistoryKey(activeRoomData?.callee), activeRoomData?.roomId),
                { ...activeRoomData, ...{ timestamp: serverTimestamp() } }
            )
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        const startSFStream = async () => {
            try {
                await createFlow(activeRoomData?.callee, activeRoomData?.flowRate)
            } catch (error: any) {
                enqueueSnackbar("Something went wrong! - Create flow", { variant: 'error', autoHideDuration: 3000, action })
                console.error(error)
            }
        }
        if (
            peerCount >= 2
            && activeRoomData?.caller === localAddress
            && otherAddress
            && otherAddress !== PLACEHOLDER_ADDRESS
            && !isTransactionPending
        ) { // note: only caller can turn tap on, many checks
            startSFStream() // TODO: TMP
            return
        }
    }, [peerCount]) // TODO: make sure video visible first / at same time, check (localPeer && remotePeers[0] or peerCount)

    useUpdateEffect(() => {
        const cleanUpOnCallerEndCallProperly = async () => {
            await cleanUp(otherAddress, localAddress, false, "simple clean up", false, true)
        }
        if (hmsNotification?.type === HMSNotificationTypes.ROOM_ENDED) { // other party ends room
            setIsEnding(true)
            notifyCallEnded()
            cleanUpOnCallerEndCallProperly()
            setTimeout(() => {
                navigate(location.state?.from?.pathname || '/', { replace: true })
                setIsEnding(false)
            }, 5000) // why timeout? so that on party that did on end side, it wont show the "incoming call" that has actually just ended

        }

        if (hmsNotification?.type === HMSNotificationTypes.PEER_LEFT) {
            console.warn("PEER LEFT!!!!")
            if (isCaller) {
                endActiveCallFromCaller()
            } else if (isCallee) {
                endActiveCallFromCallee()
            } else {
                // console.log("no isCaller/isCallee")
            }
        }
    }, [hmsNotification])

    const getAvailableSeconds = async (flowRate: string) => {
        const tokenXBalanceAfterDeposit = ethers.BigNumber.from(await getTokenXBalance(activeRoomData?.caller)) // note: this is AFTER minus deposit

        const totalSeconds = tokenXBalanceAfterDeposit?.div(ethers.BigNumber.from(flowRate))

        const safeSeconds = totalSeconds?.sub(ethers.BigNumber.from(END_CALL_BUFFER_SECONDS))
        setActiveCallMaxSeconds(safeSeconds.toString()) // set for caller
    }

    useUpdateEffect(() => {
        const getInfo = async () => {
            console.log("isCreatingFlow:", isCreatingFlow)
            const flowInfo = await getFlowData(activeRoomData?.caller, activeRoomData?.callee)
            const flowInfoAdmin = await getFlowData(activeRoomData?.caller, ADMIN_ADDRESS)
            const flowRateEffective = flowInfo?.flowRate.add(flowInfoAdmin?.flowRate)
            // const flowRate = flowInfo?.flowRate.toString()
            const flowRate = flowRateEffective.toString()
            /** 
             * from flowBigNumberInfo all are 
             * uint256 timestamp,
             * int96 flowRate,
             * uint256 deposit,
             * uint256 owedDeposit
             */
            if (flowRate !== "0" && activeRoomData?.caller === localAddress) { // caller
                await getAvailableSeconds(flowRate)

                setFlowDeposit(flowInfo?.deposit.add(flowInfoAdmin?.deposit).toString())
            }
        }
        if (activeRoomData) {
            getInfo()
        }
    }, [isCreatingFlow, activeRoomData?.flowRate])

    useUpdateEffect(() => {
        if (activeCallMaxSeconds !== "0" && activeRoomData?.caller === localAddress) {
            console.warn("LiveThree: End active call timer begins", activeCallMaxSeconds)
            resetActiveCall()
        }

        const setMaxSeconds = async () => {
            console.warn("UPDATE max seconds!", activeCallMaxSeconds)
            await updateDoc(doc(getColRefActive(otherAddress), localAddress), {// TODO: save these data locally?
                maxSeconds: activeCallMaxSeconds
            })
        }
        if (activeRoomData?.caller === localAddress && activeCallMaxSeconds !== "0") {
            console.log("setting max seconds")
            setMaxSeconds()
        }

    }, [activeCallMaxSeconds])

    useUpdateEffect(() => {
        if (activeRoomData?.maxSeconds && activeRoomData?.callee === localAddress) {
            setActiveCallMaxSeconds(activeRoomData?.maxSeconds) // set for callee
        }
    }, [activeRoomData?.maxSeconds])

    useEffect(() => {
        console.log("isDeletingFlow:", isDeletingFlow)
    }, [isDeletingFlow])

    useUpdateEffect(() => {
        const cleanUpOnFlowError = async (active: boolean) => { // TODO: test
            await cleanUp(otherAddress, localAddress, false, "flow operation failed")
            notifyCallEnded()

            // TODO: this navigate line have bug, where if delete flow from 
            // settings page will navigate to previous (although navigate should
            // only really apply to end active call)
            navigate(location.state?.from?.pathname || '/', { replace: true })

            clearPendingCall()
            clearActiveCall()

            setErrorCreatingFlow(null)
            setErrorDeletingFlow(null)
        }

        if (hmsNotification) {
            console.log("hms notify type:", hmsNotification.type)
        }
        if (createRoomError) {
            console.error("create room error", createRoomError)
        }
        if (fetchTokenError) {
            console.error("fetch token error", fetchTokenError)
        }
        if (errorCreatingFlow) { // only applicable from caller side
            console.error("create flow error", errorCreatingFlow)
            cleanUpOnFlowError(false)
        }
        if (errorDeletingFlow) { // TODO: keep repeat until success?
            console.error("delete flow error", errorDeletingFlow)
            cleanUpOnFlowError(true)
        }
    }, [hmsNotification, createRoomError, fetchTokenError, errorCreatingFlow, errorDeletingFlow])


    const contextProvider = {
        isInitiating,
        isEntering,
        isEnding,
        activeCallMaxSeconds,
        flowDeposit,
        isRingtoneEnabled,
        isCalleeInCall,
        hasRoom,
        setIsEntering,
        initiateCall,
        acceptCall,
        cleanUp,
        clearPendingCall,
        clearActiveCall,
        setIsRingtoneEnabled,
    }
    return (
        <CallContext.Provider value={ contextProvider }>
            { children }
        </CallContext.Provider>
    )
}
