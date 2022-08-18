import { useState } from 'react';
import { useDocumentData, useCollectionData } from 'react-firebase-hooks/firestore';
import { doc, query, orderBy, limit } from "firebase/firestore"
import { useNavigate, useLocation } from 'react-router-dom';

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
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

import { ProfilePicture } from '../../components/profile/ProfilePicture';
import { SplashPage } from '../utils/SplashPage';
import { ErrorPage } from '../utils/ErrorPage';

import { COL_REF_USERS, getColRefActive, getColRefHistoryKey } from "../../services/firebase";

import { auth, analytics } from "../../services/firebase";
import { logEvent } from 'firebase/analytics';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useWeb3Auth } from '../../contexts/Web3Auth';
import { useCall } from '../../contexts/Call'

import { StandardButton } from '../../components/utils';
import { DialogHasNetFlow } from '../../components/dialogs/DialogHasNetFlow';

import { PERCENTAGE_TAKE_NUMERATOR } from '../../configs/blockchain/admin';

import { ButtonAcceptIncomingCall } from '../../components/ButtonAcceptIncomingCall'

const dateOptions = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' } // https://www.freecodecamp.org/news/how-to-format-dates-in-javascript/

type LocationProps = {
    state: {
        from: Location;
    };
};


const CallsPage = () => {
    const navigate = useNavigate();
    const location = useLocation() as unknown as LocationProps; // https://github.com/reach/router/issues/414#issuecomment-1056839570


    const { address: localAddress } = useWeb3Auth()
    const [firebaseUser] = useAuthState(auth);

    const [localUserData, localUserDataLoading, localUserDataError] = useDocumentData(doc(COL_REF_USERS, firebaseUser?.uid));

    const [activeCalls, loadingActiveCalls, activeCallsError] = useCollectionData(getColRefActive(localAddress || "empty"));
    const q = query(getColRefHistoryKey(localAddress || "empty"), orderBy("timestamp", "desc"), limit(10))
    const [historicCalls, loadingHistoricCalls, historicCallsError] = useCollectionData(q);

    const { cleanUp, isEntering, isEnding, isCalleeInCall } = useCall()

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
                                        <Box>
                                            { !item?.callee &&
                                                <ListItem
                                                    disablePadding
                                                    key={ item.roomId }
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
                                                </ListItem>
                                            }
                                        </Box>
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
                            { !loadingHistoricCalls && !historicCallsError && historicCalls && historicCalls?.length > 0 ? (
                                <List sx={ { maxHeight: "30vh", overflow: "auto" } }>
                                    { historicCalls.map((item: any, index: number) => (
                                        // if getting firestore data using query, for some reason data already reversed, historicCalls.reverse().map()

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
                                                                { item?.caller !== localAddress ? (
                                                                    // call in
                                                                    <>
                                                                        <ProfilePicture image={ item?.callerPicture } width={ 64 } height={ 64 } />
                                                                        <Stack>
                                                                            <Typography>{ `${ item?.callerDisplayName }` }</Typography>
                                                                            <Stack
                                                                                direction="row"
                                                                            >
                                                                                <Tooltip title="call received">
                                                                                    <CallReceivedIcon color="secondary" />
                                                                                </Tooltip>
                                                                                <Typography>{ `${ item?.timestamp?.toDate().toLocaleDateString("en-us", dateOptions) }` }</Typography>
                                                                            </Stack>
                                                                        </Stack>
                                                                    </>
                                                                ) : (
                                                                    // call out
                                                                    <>
                                                                        <ProfilePicture image={ item?.calleePicture } width={ 64 } height={ 64 } />
                                                                        <Stack>
                                                                            <Typography>{ `${ item?.calleeDisplayName }` }</Typography>
                                                                            <Stack
                                                                                direction="row"
                                                                            >
                                                                                <Tooltip title="call made">
                                                                                    <CallMadeIcon color="secondary" />
                                                                                </Tooltip>
                                                                                <Typography>{ `${ item?.timestamp?.toDate().toLocaleDateString("en-us", dateOptions) }` }</Typography>
                                                                            </Stack>
                                                                        </Stack>
                                                                    </>
                                                                ) }
                                                            </Stack>
                                                            <Tooltip title="preview profile">
                                                                <span>
                                                                    <StandardButton
                                                                        variant="contained"
                                                                        color="secondary"
                                                                        disabled={ isEntering || isEnding }
                                                                        sx={ { mr: 1 } }
                                                                        onClick={ () => {
                                                                            navigate(`/user/${ item.caller !== localAddress ? item.caller : item.callee }`, {
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
                                <Typography
                                    sx={ {
                                        pt: 1,
                                        pl: 3,
                                        pb: 1,
                                    } }
                                >no recent calls</Typography>
                            ) }
                        </Card>
                    </Stack>
                ) : (null) }
            </Box>
        </Stack >
    )
}

export default CallsPage