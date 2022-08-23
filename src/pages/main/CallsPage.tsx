import { useState } from 'react';
import { useDocumentData, useCollectionData } from 'react-firebase-hooks/firestore';
import { doc } from "firebase/firestore"
import { useNavigate, useLocation } from 'react-router-dom';

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Link from '@mui/material/Link';
import Typography from "@mui/material/Typography";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Tooltip from '@mui/material/Tooltip';
import CallEndIcon from '@mui/icons-material/CallEnd';
import CallReceivedIcon from '@mui/icons-material/CallReceived';
import CallMadeIcon from '@mui/icons-material/CallMade';
import VisibilityIcon from '@mui/icons-material/Visibility';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import { ProfilePicture } from '../../components/profile/ProfilePicture';
import { SplashPage } from '../utils/SplashPage';
import { ErrorPage } from '../utils/ErrorPage';

import { COL_REF_USERS, getColRefActive } from "../../services/firebase";

import { auth, analytics } from "../../services/firebase";
import { logEvent } from 'firebase/analytics';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useWeb3Auth } from '../../contexts/Web3Auth';
import { useCall } from '../../contexts/Call'

import { StandardButton } from '../../components/utils';
import { DialogHasNetFlow } from '../../components/dialogs/DialogHasNetFlow';

import { PERCENTAGE_TAKE_NUMERATOR } from '../../configs/blockchain/admin';

import { ButtonAcceptIncomingCall } from '../../components/ButtonAcceptIncomingCall'
import { shortenAddress } from '../../utils';
import { CALL_HISTORY_LIMIT } from '../../configs/general';

const dateOptions = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' } // https://www.freecodecamp.org/news/how-to-format-dates-in-javascript/

type LocationProps = {
    state: {
        from: Location;
    };
};


const CallsPage = () => {
    const navigate = useNavigate();
    const location = useLocation() as unknown as LocationProps; // https://github.com/reach/router/issues/414#issuecomment-1056839570


    const { address: localAddress, chainId } = useWeb3Auth()
    const [firebaseUser] = useAuthState(auth);

    const [localUserData, localUserDataLoading, localUserDataError] = useDocumentData(doc(COL_REF_USERS, firebaseUser?.uid));

    const [activeCalls, loadingActiveCalls, activeCallsError] = useCollectionData(getColRefActive(localAddress || "empty"));

    const { cleanUp, isEntering, isEnding, isCalleeInCall, historyData } = useCall()

    const [displayHasNetFlowModal, setDisplayHasNetFlowModal] = useState<boolean>(false)

    // useEffect(() => {  // doesn't really work as WalletDisplay component not in focus?
    //     refreshNativeBalance()
    //     refreshSFStates()
    //     console.log("refresh states")
    // }, [])

    if (localUserDataLoading) {
        return <SplashPage />
    }

    if (localUserDataError) {
        return <ErrorPage message="CallsPage" />
    }

    return (
        <Stack alignItems="center">
            <Box sx={ { p: 2, width: "98%", maxWidth: 1000 } }>
                { localUserData ? (
                    <Stack
                        spacing={ 2 }
                    >
                        <Card
                            variant="outlined"
                            sx={ { width: "100%" } }
                        >
                            <CardHeader title="Incoming calls"
                                sx={ {
                                    "&:last-child": {
                                        paddingLeft: 24
                                    }
                                } }
                            />
                            { !loadingActiveCalls && !activeCallsError && activeCalls && activeCalls?.length > 0 ? (
                                <List sx={ { maxHeight: "30vh", overflow: "auto" } }>
                                    { activeCalls.sort((a, b) => b.callStartTimestamp - a.callStartTimestamp).map((item: any, index: number) => (

                                        <ListItem
                                            disablePadding
                                            key={ item?.roomId }
                                            divider
                                        >
                                            { !item?.callee &&
                                                <Stack spacing={ 1 } alignItems="center" justifyContent="center" sx={ { width: "100%" } } >
                                                    <Card sx={ { borderRadius: 0, width: "100%" } }>
                                                        <CardContent sx={ {
                                                            p: 1, "&:last-child": {
                                                                paddingBottom: 0
                                                            }
                                                        } }>
                                                            <Stack direction="row" alignItems="center" justifyContent="space-between">
                                                                <Stack direction="row" alignItems="center" justifyContent="flex-start" spacing={ 2 }>
                                                                    <ProfilePicture image={ item?.callerPicture } width={ 64 } height={ 64 } />
                                                                    <Typography>{ `${ item?.callerDisplayName }` }</Typography>
                                                                </Stack>
                                                                <Stack direction="row" alignItems="center" spacing={ 1 } sx={ { mr: 1 } }>
                                                                    <Tooltip title="Accept Incoming Video Call">
                                                                        <span>
                                                                            <ButtonAcceptIncomingCall
                                                                                caller={ item?.caller } callerChainId={ item?.callerChainId } roomId={ item?.roomId }
                                                                                callStartTimestamp={ item?.callStartTimestamp }
                                                                                setDisplayHasNetFlowModal={ setDisplayHasNetFlowModal }
                                                                            />
                                                                        </span>
                                                                    </Tooltip>
                                                                    <Tooltip title="Reject Incoming Video Call">
                                                                        <span>
                                                                            <StandardButton
                                                                                variant="contained"
                                                                                disabled={ isEntering || isEnding }
                                                                                onClick={ async () => {
                                                                                    await cleanUp(localAddress, item.caller, false, "reject call", true)
                                                                                    logEvent(analytics, "call_rejected")
                                                                                } }
                                                                                color="error"
                                                                            >
                                                                                <CallEndIcon />
                                                                            </StandardButton>
                                                                        </span>
                                                                    </Tooltip>
                                                                </Stack>
                                                            </Stack>
                                                        </CardContent>
                                                    </Card>
                                                </Stack>
                                            }
                                        </ListItem>

                                    )) }
                                </List>
                            ) : (
                                <Typography
                                    sx={ {
                                        pt: 1,
                                        pl: 3,
                                        pb: 1,
                                    } }
                                >no incoming calls</Typography>
                            ) }
                            {
                                activeCalls && ((!isCalleeInCall && activeCalls?.length > 0) || (isCalleeInCall && activeCalls?.length > 1)) &&
                                <Typography
                                    variant="caption"
                                    sx={ {
                                        pt: 1,
                                        pl: 3,
                                        pb: 1,
                                    } }
                                >
                                    *LiveThree takes { PERCENTAGE_TAKE_NUMERATOR }% of every call.
                                </Typography>
                            }
                            <DialogHasNetFlow
                                open={ displayHasNetFlowModal } setOpen={ setDisplayHasNetFlowModal }
                            />
                        </Card>
                        <Card
                            variant="outlined"
                            sx={ { width: "100%" } }
                        >
                            <CardHeader title="Recent calls completed"
                                sx={ {
                                    "&:last-child": {
                                        paddingLeft: 24
                                    }
                                } }
                            />
                            { historyData && historyData?.length <= CALL_HISTORY_LIMIT && historyData?.length > 5 ? (
                                <List sx={ { maxHeight: "30vh", overflow: "auto" } }>
                                    { historyData.map((item: any, index: number) => (
                                        <ListItem
                                            disablePadding
                                            key={ index }
                                            divider
                                        >
                                            <Stack spacing={ 1 } alignItems="center" justifyContent="center" sx={ { width: "100%" } } >
                                                <Card sx={ { borderRadius: 0, width: "100%" } }>
                                                    <CardContent sx={ {
                                                        p: 1, "&:last-child": {
                                                            paddingBottom: 0
                                                        }
                                                    } }>
                                                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                                                            <Stack direction="row" alignItems="center" justifyContent="flex-start" spacing={ 2 }>
                                                                <ProfilePicture image={ item?.photoURL } width={ 64 } height={ 64 } />
                                                                <Stack>
                                                                    <Typography>{ item?.handle ? item?.handle : shortenAddress(item?.address) }</Typography>
                                                                    <Stack
                                                                        direction="row"
                                                                    >
                                                                        { item?.isIncomingCall ? (
                                                                            <Tooltip title="call received">
                                                                                <CallReceivedIcon color="secondary" />
                                                                            </Tooltip>
                                                                        ) : (
                                                                            <Tooltip title="call made">
                                                                                <CallMadeIcon color="secondary" />
                                                                            </Tooltip>
                                                                        ) }

                                                                        <Typography>{ item?.timestamp ? item?.timestamp?.toDate().toLocaleTimeString("en-us", dateOptions) : "" }</Typography>
                                                                    </Stack>
                                                                </Stack>
                                                            </Stack>
                                                            <Tooltip title="preview profile">
                                                                <span>
                                                                    <StandardButton
                                                                        variant="contained"
                                                                        color="secondary"
                                                                        disabled={ isEntering || isEnding }
                                                                        sx={ { mr: 1 } }
                                                                        onClick={ () => {
                                                                            navigate(`/user/${ item?.address }`, {
                                                                                state: {
                                                                                    from: location,
                                                                                }
                                                                            })
                                                                        } }
                                                                    >
                                                                        <VisibilityIcon />
                                                                    </StandardButton>
                                                                </span>
                                                            </Tooltip>

                                                        </Stack>
                                                    </CardContent>
                                                </Card>
                                            </Stack>
                                        </ListItem>

                                    )) }
                                </List>
                            ) : (
                                <Box>
                                    { historyData?.length <= CALL_HISTORY_LIMIT ? (
                                        <Typography
                                            sx={ {
                                                pt: 1,
                                                pl: 3,
                                                pb: 1,
                                            } }
                                        >
                                            no recent calls
                                        </Typography>
                                    ) : (
                                        <Typography
                                            sx={ {
                                                pt: 1,
                                                pl: 3,
                                                pb: 1,
                                            } }
                                        >
                                            error loading call history, please refresh page | { historyData?.length }
                                        </Typography>
                                        // to catch bugs
                                    ) }
                                </Box>
                            ) }
                        </Card>
                    </Stack>
                ) : (null) }
            </Box>
            <Link
                href={ chainId === 137 ?
                    `https://polygonscan.com/address/${ localAddress }` :
                    `https://mumbai.polygonscan.com/address/${ localAddress }`
                }
                target="_blank"
                rel="noopener"
            >
                <Stack
                    direction='row'
                    alignItems='center'
                >
                    view transactions on block explorer
                    <OpenInNewIcon
                        fontSize='small'
                        color='primary'
                    />
                </Stack>
            </Link>
        </Stack >
    )
}

export default CallsPage