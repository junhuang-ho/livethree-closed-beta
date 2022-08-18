import { useState } from "react"

import { useWeb3Auth } from "../contexts/Web3Auth";
import { useSuperfluidGas } from "../contexts/SuperfluidGas";
import { useCall } from "../contexts/Call"
import { useInterval } from "react-use";

import CallIcon from '@mui/icons-material/Call';

import { StandardButton } from "./utils"
import { INCOMING_CALL_DURATION_MS } from "../configs/general";
import { analytics } from '../services/firebase';
import { logEvent } from 'firebase/analytics';

export const ButtonAcceptIncomingCall = ({ caller, callerChainId, roomId, callStartTimestamp, setDisplayHasNetFlowModal }: any) => {

    const { address: localAddress, chainId } = useWeb3Auth()
    const { getNetFlowTokenX } = useSuperfluidGas()
    const { acceptCall, isEntering, isEnding, isCalleeInCall } = useCall()

    const [isExpire, setIsExpire] = useState<boolean>(false)

    useInterval(() => {
        setIsExpire(Date.now() >= callStartTimestamp + INCOMING_CALL_DURATION_MS)
    }, true ? 1000 : null) // run every half second

    return (
        <StandardButton
            variant="contained"
            color="success"
            disabled={
                isEntering || isEnding || !caller
                || !roomId || !localAddress || isCalleeInCall
                || isExpire || chainId !== callerChainId
            }
            onClick={ async () => {
                const netFlow = (await getNetFlowTokenX()).toString()
                if (chainId !== 0 && chainId === callerChainId) {
                    if (netFlow !== "0") {
                        setDisplayHasNetFlowModal(true)
                        logEvent(analytics, "call_has_existing_flow_callee")
                    } else {
                        await acceptCall(caller, roomId)
                        logEvent(analytics, "call_accepted")
                    }
                } else {
                    alert("ERROR: not connected to a chain")
                }
            } }
        >
            <CallIcon />
        </StandardButton >
    )
}
