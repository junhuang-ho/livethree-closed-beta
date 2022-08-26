import { useState, useEffect } from 'react';
import { setDoc, doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore" // 
import { auth, analytics } from '../../services/firebase';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { logEvent } from 'firebase/analytics';

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TextField from '@mui/material/TextField';
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import Slider from '@mui/material/Slider';
import CircularProgress from '@mui/material/CircularProgress';

import UploadIcon from '@mui/icons-material/Upload';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import CallIcon from '@mui/icons-material/Call';
import Tooltip from '@mui/material/Tooltip';
import ErrorIcon from '@mui/icons-material/Error';
import CloseIcon from '@mui/icons-material/Close';
// import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

import { ButtonRefresh } from '../ButtonRefresh';
import { IconGas } from '../IconGas';

import { styled } from '@mui/material/styles';

import palette from '../../themes/palette';

import { ProfilePicture } from './ProfilePicture';

import { COL_REF_USERS, getColRefActive } from '../../services/firebase';
import { uploadImage } from '../../utils';
import { ethers } from 'ethers';

import { useWeb3Auth } from '../../contexts/Web3Auth';
import { useSuperfluidGas } from '../../contexts/SuperfluidGas';
import { useAuthState } from 'react-firebase-hooks/auth';
import { usePreviewMode } from '../../hooks/usePreviewMode';
import { useCall } from '../../contexts/Call'
import { useResponsive } from '../../hooks/useResponsive'
import { useTimer } from 'react-timer-hook';
import { useUpdateEffect, useCopyToClipboard } from 'react-use';

import { StandardButton } from '../utils';
import { ButtonCopy } from '../ButtonCopy';
import { IconEdit } from '../IconEdit';

import { END_CALL_BUFFER_SECONDS_EXTRA } from '../../configs/general';
import { shortenAddress } from '../../utils';
import { DisplayFromPerSecondToXXX } from '../DisplayFromPerSecondToXXX'

import { getCroppedImg } from '../../utils';
import { ImageCropper } from '../ImageCropper';
import imageCompression from 'browser-image-compression';
// ref: https://www.npmjs.com/package/browser-image-compression

import { useSnackbar } from 'notistack';

import { DialogGrantPermission } from '../dialogs/DialogGrantPermission';
import { DialogInsufficientGas } from '../dialogs/DialogInsufficientGas';
import { DialogInsufficientFunds } from '../dialogs/DialogInsufficientFunds';
import { DialogPreCallDetails } from '../dialogs/DialogPreCallDetails'
import { DialogHasNetFlow } from '../dialogs/DialogHasNetFlow';

import { CHAIN_ID_TO_CHAIN_NAME_MAPPING, CHAIN_ID_POLYGON } from '../../configs/blockchain/web3auth';
import { DELETE_PERMISSION } from '../../configs/blockchain/superfluid';

const Input = styled('input')({
    display: 'none',
});

// const firestoreCharacterMinDisplayName = 3
// const firestoreCharacterMaxDisplayName = 50
const firestoreCharacterMaxHeadline = 200

export const Header = ({ uid, dataUser, showcaseMode, isUserLoading, reloadUser, inFavPage }: any) => {
    const isMobile = useResponsive('down', 'sm');

    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const { address: localAddress, chainId, nativeCoinBalance, refreshNativeBalance } = useWeb3Auth()
    const {
        hasGasToCreateAndDeleteFlow, tokenBalance, tokenSymbol, tokenXBalance, tokenXSymbol,
        refreshSFStates, getTokenXBalance, getNetFlowTokenX, getFlowData, getDepositRequiredForFlowRate,
        isTransactionPending, getOperatorData
    } = useSuperfluidGas()
    const { cleanUp, clearPendingCall, isInitiating, isEnding, hasRoom, isCalleeInCall } = useCall()
    const [{ }, copyToClipboard] = useCopyToClipboard();

    const [firebaseUser] = useAuthState(auth);
    const [dataUserLocal] = useDocumentData<any>(doc(COL_REF_USERS, firebaseUser?.uid));
    const [dataRoomActive, loadingRoomActive, errorRoomActive] = useDocumentData(doc(getColRefActive(dataUser?.address), localAddress));

    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
    const [cropped, setCropped] = useState<boolean>(false)
    const [croppedImage, setCroppedImage] = useState<any>(null)
    const [displayImageCropper, setDisplayImageCropper] = useState<boolean>(false)
    const [zoom, setZoom] = useState(1)

    const [saving, setSaving] = useState<boolean>(false)
    const [editHeader, setEditHeader] = useState<boolean>(false)
    const [newImage, setNewImage] = useState("")
    const [newHeadline, setNewHeadline] = useState<string>("")
    const [confirmEndCall, setConfirmEndCall] = useState<boolean>(false)
    const [previewMode] = usePreviewMode(localAddress, dataUser?.address)

    const [displayHasNetFlowModal, setDisplayHasNetFlowModal] = useState<boolean>(false)

    const [isFavourited, setIsFavourited] = useState(false)
    useEffect(() => {
        setIsFavourited(dataUserLocal?.favourites.includes(dataUser?.address))
    }, [dataUserLocal])

    //

    const [deposit, setDeposit] = useState<any>(null)
    const [minimumBalance, setMinimumBalance] = useState<any>(null)
    const [displayGrantPermissionModal, setDisplayGrantPermissionModal] = useState<boolean>(false)
    const [displayInsufficientGasModal, setDisplayInsufficientGasModal] = useState<boolean>(false)
    const [displayInsufficientBalanceModal, setDisplayInsufficientBalanceModal] = useState<boolean>(false)
    const [displayStartStreamModal, setDisplayStartStreamModal] = useState<boolean>(false)

    const [closeWarning1, setCloseWarning1] = useState<boolean>(false)
    const [closeWarning2, setCloseWarning2] = useState<boolean>(false)
    const [closeWarning3, setCloseWarning3] = useState<boolean>(false)

    const [isProcessing, setIsProcessing] = useState<boolean>(false)

    const expiryTimestamp = new Date();
    expiryTimestamp.setSeconds(expiryTimestamp.getSeconds());
    const {
        seconds,
        minutes,
        hours,
        days,
        isRunning: isTimerRunning,
        start,
        pause: pauseTimer,
        resume,
        restart: restartTimer,
    } = useTimer({ expiryTimestamp, onExpire: () => console.warn('timer expired'), autoStart: false });

    // useEffect(() => { // for debug
    //     console.log("pre call timer:", isTimerRunning, days, hours, minutes, seconds)
    // }, [isTimerRunning, days, hours, minutes, seconds])

    useEffect(() => {
        if (dataUser?.photoURL) {
            setNewImage(dataUser.photoURL)
        }
    }, [dataUser?.photoURL])

    useEffect(() => {
        const run = async () => {
            refreshSFStates()
            setDeposit(await getDepositRequiredForFlowRate(dataUser?.flowRate))
        }
        if (dataUser?.flowRate) {
            run()
        }
    }, [dataUser?.flowRate, isTransactionPending])

    useEffect(() => {
        const run = () => {
            setMinimumBalance(deposit.add((Number(dataUser?.flowRate) * Number(END_CALL_BUFFER_SECONDS_EXTRA)).toString()))
        }
        if (dataUser?.flowRate && tokenXBalance && deposit) {
            run()
        }
    }, [dataUser, tokenXBalance, deposit])

    useUpdateEffect(() => {
        const cleanUpAfterCalleeRejectCall = async () => {
            await cleanUp(dataUser?.address, localAddress)
            clearPendingCall() // TODO: buggy, use "fullScreen" to hide this fact. BONUS: fullScreen also focuses user attention
            pauseTimer()
        }

        if (dataRoomActive?.caller !== localAddress) {
            cleanUpAfterCalleeRejectCall()
        }
    }, [dataRoomActive])

    const action = (snackbarId: any) => (
        <>
            <Button onClick={ () => { closeSnackbar(snackbarId) } } sx={ { color: "black" } }>
                Dismiss
            </Button>
        </>
    );
    const previewMessage = () => {
        enqueueSnackbar("Feature not available in preview mode", { variant: 'info', autoHideDuration: 2000, action })
    }

    return (
        <Card variant="outlined" sx={ { width: "100%" } }>
            <CardContent sx={ { pl: 5, pr: 5 } }>
                <Stack direction="row" justifyContent="space-between">
                    <Box>
                        <Stack direction={ isMobile ? "column" : "row" } alignItems="center" spacing={ 3 }>
                            { editHeader ? (
                                <Badge
                                    overlap="circular"
                                    anchorOrigin={ { vertical: 'bottom', horizontal: 'right' } }
                                    badgeContent={
                                        <Box>
                                            <label htmlFor="contained-button-file">
                                                <Input
                                                    disabled={ saving }
                                                    accept="image/*"
                                                    id="contained-button-file"
                                                    multiple
                                                    type="file"
                                                    onChange={ async (e: any) => {
                                                        if (e.target.files instanceof FileList) {
                                                            const imageFile = await e.target.files[0]
                                                            // const url = URL.createObjectURL(await e.target.files[0]) // a blob type

                                                            const options = {
                                                                maxSizeMB: 1,
                                                                // maxWidthOrHeight: 1920,
                                                                useWebWorker: true
                                                            }
                                                            try {
                                                                const compressedFile = await imageCompression(imageFile, options);
                                                                const url = URL.createObjectURL(compressedFile)
                                                                setNewImage(url)
                                                                setDisplayImageCropper(true)
                                                            } catch (error) {
                                                                console.error(error)
                                                            }
                                                        }
                                                    } }
                                                />
                                                <Avatar>
                                                    <UploadIcon />
                                                </Avatar>
                                            </label>
                                        </Box>

                                    }
                                >
                                    <ProfilePicture image={ cropped ? croppedImage : dataUser.photoURL } />
                                </Badge>
                            ) : (
                                <Stack alignItems="center" justifyContent="center">
                                    <IconButton
                                        onClick={ async () => {
                                            const flowInfo = await getFlowData(localAddress, dataUser.address)
                                            console.log("FLOW DATA with user selected:")
                                            console.log("flow rate:", flowInfo.flowRate.toString())
                                            console.log("deposit:", flowInfo.deposit.toString())
                                            console.log("deposit owed:", flowInfo.owedDeposit.toString())
                                        } }
                                        sx={ { p: 0, m: 0 } }
                                    >
                                        <ProfilePicture image={ dataUser.photoURL } />
                                    </IconButton>
                                    <Tooltip title={ dataUser.handle ? (
                                        previewMode && !showcaseMode ? "share your profile, click to copy" : "click to copy"
                                    ) : (
                                        previewMode && !showcaseMode ? "easily share your profile by setting your handle, go to Settings tab" : "handle not set"
                                    ) }>
                                        <Typography
                                            variant="body2"
                                            color='#808080'
                                            align='justify'
                                            onClick={ () => {
                                                if (dataUser.handle) {
                                                    copyToClipboard(`@${ dataUser.handle }`)
                                                    enqueueSnackbar("Handle copied!", { variant: 'info', autoHideDuration: 2000, action })
                                                }
                                            } }
                                        >
                                            { dataUser.handle ? `@${ dataUser.handle }` : '@ ?' }
                                        </Typography>
                                    </Tooltip>
                                </Stack>
                            ) }
                            <Stack justifyContent="space-evenly">
                                { !editHeader &&
                                    <Box>
                                        { dataUser.flowRate ? (
                                            <DisplayFromPerSecondToXXX flowRate={ dataUser.flowRate } />
                                        ) : (
                                            <Box>
                                                { !closeWarning3 &&
                                                    <Stack direction="row" alignItems="center" justifyContent="center" spacing={ 1 } color="error.main" sx={ { border: 1, borderRadius: 2, pl: 1, pr: 1 } }>
                                                        <ErrorIcon fontSize="small" />
                                                        <Typography align="justify" variant="caption">
                                                            { previewMode && !showcaseMode ? "Please set your rate in the settings tab to start receiving calls" : "Not available for call as this user has not set rate" }
                                                        </Typography>
                                                        <CloseIcon fontSize="small" onClick={ () => { setCloseWarning3(true) } } />
                                                    </Stack>
                                                }
                                            </Box>

                                        ) }
                                    </Box>
                                }

                                { !editHeader &&
                                    <Stack direction="row" alignItems="center">
                                        {/* <FiberManualRecordIcon fontSize="inherit" sx={ { color: dataUser?.online ? "#30ef63" : "#808080" } } /> */ }
                                        {/* <Typography>{ dataUser?.online ? "online" : "offline" }</Typography> */ }
                                        <Typography>{ dataUser?.isActive ? " [in call]" : "" }</Typography>
                                    </Stack>
                                }
                                { editHeader ? (
                                    <Box sx={ { p: 6 } }></Box>
                                ) : (
                                    <Stack
                                        direction="row"
                                        justifyContent="flex-start"
                                        alignItems="center"
                                    >
                                        <Typography variant="body1">Address { isMobile ? shortenAddress(dataUser.address) : dataUser.address }</Typography>
                                        <ButtonCopy value={ dataUser.address } />
                                    </Stack>
                                ) }
                                { editHeader ? (
                                    <Stack>
                                        <TextField
                                            disabled={ saving }
                                            variant="standard"
                                            fullWidth
                                            multiline
                                            placeholder="Headline"
                                            value={ newHeadline }
                                            inputProps={ { maxLength: firestoreCharacterMaxHeadline /** based on firestore rules */ } }
                                            onChange={ (event) => { setNewHeadline(event.target.value) } }
                                            sx={ { pb: 1 } }
                                        />
                                        <Stack direction="row-reverse">
                                            <Typography variant="body2">
                                                { `${ newHeadline?.length }/${ firestoreCharacterMaxHeadline }` }
                                            </Typography>
                                        </Stack>
                                    </Stack>
                                ) : (
                                    <Box>
                                        { !dataUser.headline ? (
                                            <Box>
                                                { showcaseMode ? (
                                                    <Box></Box>
                                                ) : (
                                                    <Typography align="justify" color={ palette.grey[400] }>Headline</Typography>
                                                ) }

                                            </Box>
                                        ) : (
                                            <Typography
                                                variant="body1"
                                                align="justify"
                                                sx={ { wordWrap: "break-word", whiteSpace: 'pre-line' } }
                                            >{ dataUser.headline }</Typography>
                                        ) }
                                    </Box>
                                ) }
                            </Stack>
                            { isMobile && !showcaseMode && dataUser?.address === localAddress &&

                                <Stack
                                    justifyContent="center"
                                    alignItems="flex-start"
                                    sx={ { width: "100%", p: 2, border: 2, borderRadius: 2, borderColor: "primary.main", backgroundColor: '#b7e0d6', } }
                                >
                                    <Typography>
                                        Connected to { CHAIN_ID_TO_CHAIN_NAME_MAPPING[chainId] } network.
                                    </Typography>
                                    <Stack direction="row" alignItems="center">
                                        <Typography>
                                            Token balances
                                        </Typography>
                                        <ButtonRefresh />
                                    </Stack>
                                    <Typography variant="h4" color={ tokenXBalance && Number(ethers.utils.formatEther(tokenXBalance)) === 0 ? "error.main" : "" }>
                                        { tokenXBalance && tokenXSymbol ? `* ${ Number(ethers.utils.formatEther(tokenXBalance)).toFixed(4) } ${ tokenXSymbol }` : "" }
                                    </Typography>

                                    { chainId === CHAIN_ID_POLYGON ? (
                                        <Typography >
                                            { tokenBalance && tokenSymbol ? `* ${ Number(ethers.utils.formatUnits(tokenBalance, 6)).toFixed(4) } ${ tokenSymbol }` : "" }
                                        </Typography>
                                    ) : (
                                        <Typography >
                                            { tokenBalance && tokenSymbol ? `* ${ Number(ethers.utils.formatEther(tokenBalance)).toFixed(4) } ${ tokenSymbol }` : "" }
                                        </Typography>
                                    ) }


                                    <Typography color={ nativeCoinBalance && Number(ethers.utils.formatEther(nativeCoinBalance)) === 0 ? "error.main" : "" }>
                                        { nativeCoinBalance ? `* ${ Number(ethers.utils.formatEther(nativeCoinBalance)).toFixed(4) } MATIC` : "" }
                                    </Typography>

                                    { !closeWarning1 && nativeCoinBalance && Number(ethers.utils.formatEther(nativeCoinBalance)) === 0 &&
                                        <Stack direction="row" alignItems="center" justifyContent="center" spacing={ 1 } color="error.main" sx={ { border: 1, borderRadius: 2, pl: 1, pr: 1 } }>
                                            <ErrorIcon fontSize="small" />
                                            <Typography align="justify" variant="caption">
                                                This account has 0 MATIC, please top-up this account with MATIC before attempting to execute any actions that require gas <IconGas /> such as making calls
                                            </Typography>
                                            <CloseIcon fontSize="small" onClick={ () => { setCloseWarning1(true) } } />
                                        </Stack>
                                    }

                                    { !closeWarning2 && tokenXBalance && Number(ethers.utils.formatEther(tokenXBalance)) === 0 &&
                                        <Stack direction="row" alignItems="center" justifyContent="center" spacing={ 1 } color="error.main" sx={ { border: 1, borderRadius: 2, pl: 1, pr: 1 } }>
                                            <ErrorIcon fontSize="small" />
                                            <Typography align="justify" variant="caption">
                                                Your account has 0 { tokenXSymbol ? tokenXSymbol : "" }. To make calls, please top-up your account or wrap sufficient { tokenSymbol ? tokenSymbol : "" }
                                            </Typography>
                                            <CloseIcon fontSize="small" onClick={ () => { setCloseWarning2(true) } } />
                                        </Stack>
                                    }
                                </Stack>

                            }
                        </Stack>
                    </Box>
                    { showcaseMode ? (
                        <Stack justifyContent="center">
                            { isFavourited ? (
                                <Tooltip title="Unfollow">
                                    <StandardButton
                                        variant="outlined"
                                        color="secondary"
                                        onClick={ async () => {
                                            await updateDoc(doc(COL_REF_USERS, firebaseUser?.uid), {
                                                favourites: arrayRemove(dataUser.address)
                                            })
                                        } }
                                    >
                                        <StarBorderIcon />
                                    </StandardButton>
                                </Tooltip>
                            ) : (
                                <Tooltip title="Follow">
                                    <StandardButton
                                        variant="contained"
                                        color="secondary"
                                        onClick={ async () => {
                                            if (previewMode) {
                                                previewMessage()
                                            } else {
                                                await updateDoc(doc(COL_REF_USERS, firebaseUser?.uid), {
                                                    favourites: arrayUnion(dataUser.address)
                                                })
                                            }
                                        } }
                                    >
                                        <StarIcon />
                                    </StandardButton>
                                </Tooltip>
                            ) }
                            <Box>
                                { isProcessing ? (
                                    <Stack
                                        alignItems='center'
                                        justifyContent='center'
                                    >
                                        <CircularProgress size="33px" />
                                    </Stack>
                                ) : (
                                    <Tooltip title="Video Call">
                                        <span>
                                            <StandardButton
                                                variant="contained"
                                                color="primary"
                                                // caller, dataUser, localAddress
                                                disabled={
                                                    isInitiating || loadingRoomActive ||
                                                    dataRoomActive?.caller === localAddress
                                                    || !minimumBalance || !localAddress
                                                    || !dataUser?.address || !dataUser?.online
                                                    || dataUser?.isActive || hasRoom || inFavPage
                                                    || isCalleeInCall
                                                }
                                                onClick={ async () => {
                                                    if (previewMode) {
                                                        previewMessage()
                                                    } else {
                                                        setIsProcessing(true)
                                                        reloadUser()
                                                        if (chainId !== 0 && !isUserLoading && dataUser?.online && !dataUser?.isActive) {
                                                            // the is online check in if statement doesn't really work
                                                            // but current system to prevent calls if offline its "good enough"
                                                            // to work in mosts cases, only edge case is if 
                                                            // callee is viewing a stale page of a recently logged 
                                                            // out user and calling them
                                                            refreshNativeBalance()
                                                            refreshSFStates()
                                                            const netFlow = (await getNetFlowTokenX()).toString() // manually run netFlow check just in case
                                                            const operatorData = await getOperatorData()
                                                            const hasDeletePermission = operatorData.permissions === DELETE_PERMISSION
                                                            const tokenXBalance_ = await getTokenXBalance()

                                                            if (!hasDeletePermission) {
                                                                setDisplayGrantPermissionModal(true)
                                                                logEvent(analytics, "call_require_grant")
                                                            } else if (netFlow !== "0") {
                                                                setDisplayHasNetFlowModal(true)
                                                                logEvent(analytics, "call_has_existing_flow_caller")
                                                            } else if (ethers.BigNumber.from(tokenXBalance_).gte(minimumBalance)) {
                                                                const hasSufficientGas = await hasGasToCreateAndDeleteFlow(dataUser.address, dataUser.flowRate)

                                                                if (hasSufficientGas) {
                                                                    setDisplayStartStreamModal(true)
                                                                    logEvent(analytics, "call_pre_call_details")
                                                                } else {
                                                                    setDisplayInsufficientGasModal(true)
                                                                    logEvent(analytics, "call_insufficient_gas")
                                                                }

                                                            } else {
                                                                setDisplayInsufficientBalanceModal(true)
                                                                logEvent(analytics, "call_insufficient_funds")
                                                            }
                                                        }
                                                        setIsProcessing(false)
                                                    }
                                                } }
                                            >
                                                <CallIcon />
                                            </StandardButton>
                                        </span>
                                    </Tooltip>
                                ) }

                                <DialogGrantPermission
                                    open={ displayGrantPermissionModal } setOpen={ setDisplayGrantPermissionModal }
                                />
                                <DialogInsufficientGas
                                    strict={ true }
                                    open={ displayInsufficientGasModal } setOpen={ setDisplayInsufficientGasModal }
                                />
                                <DialogInsufficientFunds
                                    open={ displayInsufficientBalanceModal } setOpen={ setDisplayInsufficientBalanceModal }
                                    minimumBalance={ minimumBalance }
                                />
                                <DialogPreCallDetails
                                    open={ displayStartStreamModal } setOpen={ setDisplayStartStreamModal }
                                    deposit={ deposit }
                                    restartTimer={ restartTimer } address={ dataUser?.address } flowRate={ dataUser.flowRate }
                                    isOnline={ dataUser?.online } isActive={ dataUser?.isActive }
                                />
                                <DialogHasNetFlow
                                    open={ displayHasNetFlowModal } setOpen={ setDisplayHasNetFlowModal }
                                />
                            </Box>
                        </Stack>
                    ) : (
                        <Stack justifyContent="center">
                            { editHeader ? (
                                <Stack justifyContent="center">
                                    { saving ? (
                                        <CircularProgress />
                                    ) : (
                                        <Stack justifyContent="center">
                                            <StandardButton
                                                variant="contained"
                                                color="primary"
                                                disabled={ newHeadline.length > 200 || (dataUser?.headline === newHeadline && dataUser?.photoURL === newImage) }
                                                onClick={ async () => {
                                                    setSaving(true)
                                                    try {
                                                        let newHeaders = {
                                                            headline: newHeadline,
                                                        }
                                                        if (cropped) {
                                                            const { profilePictureURL } = await uploadImage(
                                                                croppedImage,
                                                                `images/${ uid }`,
                                                                "profilePicture"
                                                            )
                                                            let profileUrl = { photoURL: profilePictureURL, }
                                                            newHeaders = { ...newHeaders, ...profileUrl }
                                                        }
                                                        setCropped(false)

                                                        await updateDoc(doc(COL_REF_USERS, uid), newHeaders)

                                                        setEditHeader(false)
                                                    } catch (error) {
                                                        console.error(error)
                                                    }
                                                    setSaving(false)
                                                } }
                                            >
                                                save
                                            </StandardButton>
                                            <StandardButton
                                                variant="contained"
                                                color="secondary"
                                                onClick={ () => {
                                                    setNewImage(dataUser.photoURL)
                                                    setEditHeader(false)
                                                    setCropped(false)

                                                } }
                                            >
                                                cancel
                                            </StandardButton>
                                        </Stack>
                                    ) }
                                </Stack>
                            ) : (
                                <IconButton
                                    onClick={ () => {
                                        if (!dataUser.headline) {
                                            setNewHeadline("")
                                        }
                                        setNewHeadline(dataUser.headline)
                                        setEditHeader(true)
                                    } }
                                >
                                    <IconEdit />
                                </IconButton>
                            ) }
                        </Stack>
                    ) }
                </Stack>
            </CardContent>
            <Dialog
                fullScreen
                disableEscapeKeyDown
                open={ dataRoomActive?.caller === localAddress && !errorRoomActive }
                onClose={ async () => {
                    // note: this section does not work, refer cleanUpAfterCalleeRejectCall in useEffect above
                    await cleanUp(dataUser?.address, localAddress)
                    clearPendingCall() // TODO: buggy, use "fullScreen" to hide this fact. BONUS: fullScreen also focuses user attention
                    pauseTimer()
                } }
            >
                <DialogTitle id="responsive-dialog-title">
                    { "Waiting for response" }
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        { `The call will be cancelled if you leave this window.
                        call request ending in... 
                        ${ days ? `${ days } days` : "" }  
                        ${ hours ? `${ hours } hours` : "" }
                        ${ minutes ? `${ minutes } minutes` : "" }
                        ${ seconds ? `${ seconds } seconds` : "" }
                        ` }
                    </DialogContentText>
                    <Box sx={ { p: 1 } }></Box>
                    { confirmEndCall ? (
                        <Stack
                            direction="row"
                            spacing={ 2 }
                        >
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={ () => {
                                    setConfirmEndCall(false)
                                } }
                            >
                                cancel
                            </Button>
                            <Button
                                fullWidth
                                variant="contained"
                                disabled={ isEnding }
                                onClick={ async () => {
                                    await cleanUp(dataUser?.address, localAddress)
                                    clearPendingCall()
                                    pauseTimer()
                                    setConfirmEndCall(false)
                                } }
                            >
                                confirm end
                            </Button>
                        </Stack>
                    ) : (
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={ () => {
                                setConfirmEndCall(true)
                            } }
                        >
                            end call
                        </Button>
                    ) }
                </DialogContent>
            </Dialog>
            <Dialog
                fullScreen
                disableEscapeKeyDown
                open={ displayImageCropper }
                onClose={ () => {
                    setDisplayImageCropper(false)
                } }
            >
                <DialogTitle id="responsive-dialog-title">
                    { "Adjust photo" }
                </DialogTitle>
                <DialogContent>
                    <ImageCropper
                        srcImage={ newImage } setCroppedAreaPixels={ setCroppedAreaPixels }
                        zoom={ zoom } setZoom={ setZoom }
                    />
                    <Stack alignItems='center'>
                        <Slider
                            min={ 1 }
                            max={ 3 }
                            step={ 0.1 }
                            value={ zoom }
                            onChange={ (e: any) => {
                                setZoom(e.target.value)
                            } }
                            valueLabelDisplay="auto"
                            sx={ { width: '50%' } }
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={ { p: 3 } }>
                    <Button
                        variant="contained"
                        onClick={ () => {
                            setCropped(false)
                            setCroppedImage(null)
                            setDisplayImageCropper(false)
                        } }
                    >
                        CANCEL
                    </Button>
                    <Button
                        variant="contained"
                        disabled={ isInitiating }
                        onClick={ async () => {
                            const croppedImage: any = await getCroppedImg(
                                newImage,
                                croppedAreaPixels,
                            )
                            setCroppedImage(croppedImage)
                            setCropped(true)
                            setDisplayImageCropper(false)

                        } }
                    >
                        CROP
                    </Button>
                </DialogActions>
            </Dialog>
        </Card>
    )
}
