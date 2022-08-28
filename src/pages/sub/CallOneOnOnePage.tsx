import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';

import { doc } from "firebase/firestore"
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { getColRefActive, analytics } from '../../services/firebase';
import { logEvent } from 'firebase/analytics';

import { FullScreen, useFullScreenHandle } from "react-full-screen";
import {
    useAVToggle,
    useHMSActions,
    useHMSStore,
    // useHMSNotifications,
    selectIsConnectedToRoom,
    selectLocalPeer,
    selectRemotePeers,
    selectPermissions,
    selectDevices,
    // selectLocalMediaSettings,
    // selectIsLocalAudioEnabled,
    // selectIsLocalVideoEnabled,
    // selectPeerCount,
    // selectRoomStartTime,
    // selectConnectionQualities,
    // selectConnectionQualityByPeerID,
    // HMSNotificationTypes,
} from "@100mslive/react-sdk";

import Box from "@mui/material/Box";
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Stack from "@mui/material/Stack";
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import Tooltip from "@mui/material/Tooltip";
import Card from "@mui/material/Card";
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import CallEndIcon from '@mui/icons-material/CallEnd';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import ViewCompactIcon from '@mui/icons-material/ViewCompact';
import { IconGas } from '../../components/IconGas';
import { StyledGasBadge } from '../../components/utils';

import { VideoLayout0 } from '../../components/video/VideoLayout0';
import { VideoLayout1 } from '../../components/video/VideoLayout1';
import { VideoLayout2 } from '../../components/video/VideoLayout2';
import { VideoLayout3 } from '../../components/video/VideoLayout3';

import { useResponsive } from '../../hooks/useResponsive';
import { useCall } from '../../contexts/Call';
import { useTimer } from 'react-timer-hook';
import { useSnackbar } from 'notistack';

import { DisplayFromPerSecondToXXX } from '../../components/DisplayFromPerSecondToXXX'
import { shortenAddress } from '../../utils';
import { ButtonCopy } from '../../components/ButtonCopy';

import { SplashPage } from '../utils/SplashPage';

const CallOneOnOnePage = () => {
    const params = useParams()

    const {
        isLocalAudioEnabled,
        isLocalVideoEnabled,
        toggleAudio,
        toggleVideo
    } = useAVToggle((err) => { throw err });

    const hmsActions = useHMSActions();
    const isConnected = useHMSStore(selectIsConnectedToRoom);
    const localPeer = useHMSStore(selectLocalPeer);
    const remotePeers = useHMSStore(selectRemotePeers);
    const permissions = useHMSStore(selectPermissions);
    const devices = useHMSStore(selectDevices)
    // const selectedDevices = useHMSStore(selectLocalMediaSettings)

    const [audioInput, setAudioInput] = useState("")
    const [audioOutput, setAudioOutput] = useState("")
    const [videoInput, setVideoInput] = useState("")

    const FullScreenWithChildren = FullScreen as any
    const fullScreenHandle = useFullScreenHandle();

    const [videoLayout, setVideoLayout] = useState<number>(0)
    const [clickCount, setClickCount] = useState<number>(0)
    const totalLayouts = 4

    const nonFullScreenVideoMaxWidth = 1500
    const fullScreenVideoMaxWidth = 3000
    const [maxWidth, setMaxWidth] = useState<number>(nonFullScreenVideoMaxWidth)

    const [activeRoomData, isLoadingActiveRoomData, activeRoomDataError] = useDocumentData(doc(getColRefActive(params.callee!), params.caller!));

    const { cleanUp, clearActiveCallBatch, activeCallMaxSeconds, setIsEntering } = useCall()
    const isMobile = useResponsive('down', 'sm');

    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const action = (snackbarId: any) => (
        <>
            <Button onClick={ () => { closeSnackbar(snackbarId) } } sx={ { color: "black" } }>
                Dismiss
            </Button>
        </>
    );

    const reportChange = useCallback((state: any, handle: any) => {
        if (handle === fullScreenHandle && !handle.active) {
            setMaxWidth(nonFullScreenVideoMaxWidth)
            console.log('exit fullscreen')
        }
    }, [fullScreenHandle]);

    const expiryTimestamp = new Date();
    expiryTimestamp.setSeconds(expiryTimestamp.getSeconds())
    const {
        seconds,
        minutes,
        hours,
        days,
        isRunning: isTimerRunning,
        start,
        pause,
        resume,
        restart: restartTimer,
    } = useTimer({ expiryTimestamp, onExpire: () => console.warn('timer expired'), autoStart: false }); // TODO: autoStart ? start as close to stream start !!

    const [active, setActive] = useState<boolean>(false)
    useEffect(() => {
        setActive(activeCallMaxSeconds !== "0")
    }, [activeCallMaxSeconds])

    useEffect(() => {
        if (active) {
            const expiryTimestamp = new Date();
            expiryTimestamp.setSeconds(expiryTimestamp.getSeconds() + Number(activeCallMaxSeconds))
            restartTimer(expiryTimestamp)
        }
    }, [active])

    const [triggered, setTriggered] = useState<boolean>(false)

    useEffect(() => {
        if (toggleAudio && toggleVideo && !triggered) {
            if (active && !isLocalAudioEnabled && !isLocalVideoEnabled) {
                toggleAudio()
                toggleVideo()
                setTriggered(true)
            } else if (isLocalAudioEnabled) {
                toggleAudio()
            } else if (isLocalVideoEnabled) {
                toggleVideo()
            }
        }

    }, [active, toggleAudio, toggleVideo, isLocalAudioEnabled, isLocalVideoEnabled])

    // useEffect(() => { // for debug
    //     console.log("active call timer:", isTimerRunning, days, hours, minutes, seconds)
    // }, [isTimerRunning, days, hours, minutes, seconds])

    return (
        <Box>
            { (params.callee && isConnected) ? (
                <Box>
                    { (localPeer && remotePeers[0]) ? (
                        <Stack alignItems="center" spacing={ 0 } sx={ { p: 0, m: 0 } }>
                            <Box sx={ { width: "100%", height: "auto", position: "relative" } }>
                                <FullScreenWithChildren handle={ fullScreenHandle } onChange={ reportChange }>
                                    {/* TODO: useFullscreen ? https://github.com/streamich/react-use/blob/master/docs/useFullscreen.md */ }
                                    {/*  style={ { width: "100%", height: "auto", maxWidth: nonFullScreenVideoMaxWidth } } */ }
                                    <Stack
                                        direction="row"
                                        alignItems="center"
                                        justifyContent="center"
                                        // sx={ { width: "100%", height: "auto" } }
                                        sx={ { minHeight: maxWidth > nonFullScreenVideoMaxWidth ? '100vh' : "none" } }
                                    >
                                        { videoLayout === 0 && <VideoLayout0 peerLocal={ localPeer } peerRemote={ remotePeers[0] } maxWidth={ maxWidth } /> }
                                        { videoLayout === 1 && <VideoLayout1 peerLocal={ localPeer } peerRemote={ remotePeers[0] } maxWidth={ maxWidth } /> }
                                        { videoLayout === 2 && <VideoLayout2 peerLocal={ localPeer } peerRemote={ remotePeers[0] } maxWidth={ maxWidth } /> }
                                        { videoLayout === 3 && <VideoLayout3 peerLocal={ localPeer } peerRemote={ remotePeers[0] } maxWidth={ maxWidth } /> }
                                        { (active && isTimerRunning) ? (
                                            <Box sx={ { position: "absolute", top: "3%", zIndex: 1, backgroundColor: "#b7e0d6" } }>
                                                { ` time remaining: 
                                                ${ days ? `${ days } days` : "" }  
                                                ${ hours ? `${ hours } hours` : "" }
                                                ${ minutes ? `${ minutes } minutes` : "" }
                                                ${ seconds ? `${ seconds } seconds` : "" }
                                                ` }
                                            </Box>
                                        ) : (
                                            <Box sx={ { position: "absolute", top: "3%", zIndex: 1 } }>loading timer.. { activeCallMaxSeconds }</Box>
                                        ) }

                                        <Stack
                                            direction="row"
                                            alignItems="flex-end"
                                            justifyContent="center"
                                            spacing={ 2 }
                                            sx={ { position: "absolute", bottom: "3%", zIndex: 1 } }
                                        >
                                            { maxWidth > nonFullScreenVideoMaxWidth ? (
                                                <Button
                                                    variant="contained"
                                                    onClick={ () => {
                                                        fullScreenHandle.exit()
                                                        setMaxWidth(nonFullScreenVideoMaxWidth)
                                                    } }
                                                >
                                                    <FullscreenExitIcon />
                                                </Button>
                                            ) : (
                                                <Tooltip title="Fullscreen">
                                                    <Button
                                                        variant="contained"
                                                        onClick={ () => {
                                                            fullScreenHandle.enter()
                                                            setMaxWidth(fullScreenVideoMaxWidth)
                                                        } }
                                                    >
                                                        <FullscreenIcon />
                                                    </Button>
                                                </Tooltip>
                                            ) }
                                            <Tooltip title="Change View">
                                                <Button
                                                    variant="contained"
                                                    onClick={ () => {
                                                        const count = clickCount + 1
                                                        setVideoLayout(count % totalLayouts)
                                                        logEvent(analytics, `call_layout_${ count % totalLayouts }`)
                                                        setClickCount(count)
                                                    } }
                                                >
                                                    <ViewCompactIcon />
                                                </Button>
                                            </Tooltip>
                                            <Tooltip title="Audio">
                                                <span>
                                                    <Button
                                                        variant="contained"
                                                        disabled={ !active || !toggleAudio }
                                                        onClick={ async () => {
                                                            // await hmsActions.setLocalAudioEnabled(!audioEnabled);
                                                            if (toggleAudio) {
                                                                try {
                                                                    await toggleAudio()
                                                                } catch (error: any) {
                                                                    const ERROR_MSG = "User denied permission to access capture device - audio"
                                                                    if (error.message === ERROR_MSG) {
                                                                        enqueueSnackbar("You have not granted browser permission for LiveThree to access your microphone", { variant: 'error', autoHideDuration: 5000, action })
                                                                    } else {
                                                                        console.error(error)
                                                                        console.error(error.message)
                                                                    }
                                                                }
                                                            }
                                                        } }
                                                    >
                                                        { isLocalAudioEnabled ? <MicIcon /> : <MicOffIcon /> }
                                                    </Button>
                                                </span>
                                            </Tooltip>
                                            <Tooltip title="Camera">
                                                <span>
                                                    <Button
                                                        variant="contained"
                                                        disabled={ !active || !toggleVideo }
                                                        onClick={ async () => {
                                                            // await hmsActions.setLocalVideoEnabled(!videoEnabled);
                                                            if (toggleVideo) {
                                                                try {
                                                                    await toggleVideo()
                                                                } catch (error: any) {
                                                                    const ERROR_MSG = "User denied permission to access capture device - video"
                                                                    if (error.message === ERROR_MSG) {
                                                                        enqueueSnackbar("You have not granted browser permission for LiveThree to access your camera", { variant: 'error', autoHideDuration: 5000, action })
                                                                    } else {
                                                                        console.error(error)
                                                                    }
                                                                }
                                                            }
                                                        } }
                                                    >
                                                        { isLocalVideoEnabled ? <VideocamIcon /> : <VideocamOffIcon /> }
                                                    </Button>
                                                </span>
                                            </Tooltip>
                                            { (permissions?.endRoom && localPeer && remotePeers[0]) ? (
                                                <StyledGasBadge badgeContent={ <IconGas /> }>
                                                    <Tooltip title="End money streaming video call">
                                                        <span>
                                                            <Button
                                                                variant="contained"
                                                                color="error"
                                                                disabled={ activeCallMaxSeconds === "0" } // TODO: TMP
                                                                onClick={ async () => {
                                                                    await cleanUp(params.callee!, params.caller!, true, "end call")
                                                                    logEvent(analytics, "call_end")
                                                                    clearActiveCallBatch()
                                                                } }
                                                            >
                                                                <CallEndIcon />
                                                            </Button>
                                                        </span>
                                                    </Tooltip>
                                                </StyledGasBadge>
                                            ) : (
                                                <Box>error no permission to end room</Box>
                                            ) }
                                        </Stack>
                                    </Stack>
                                </FullScreenWithChildren>
                            </Box>
                            <Box sx={ { width: "98%", m: 2 } }>
                                <Stack spacing={ 2 }>
                                    <Card variant="outlined" sx={ { width: "100%" } }>
                                        <CardContent sx={ { pl: 5, pr: 5 } }>
                                            { (activeRoomData && !isLoadingActiveRoomData && !activeRoomDataError && params.caller && params.callee && active) ? (
                                                <Stack alignItems="flex-start" justifyContent="center">
                                                    <Stack
                                                        direction="row"
                                                        justifyContent="flex-start"
                                                        alignItems="center"

                                                    >
                                                        { params.caller === activeRoomData?.callerDisplayName ? (
                                                            <Box>{ `${ isMobile ? shortenAddress(params.caller!) : params.caller }` }</Box>
                                                        ) : (
                                                            <Box>{ `${ activeRoomData?.callerDisplayName } | ${ isMobile ? shortenAddress(params.caller!) : params.caller }` }</Box>
                                                        ) }

                                                        <ButtonCopy value={ params.caller } />
                                                    </Stack>
                                                    <Stack
                                                        direction={ isMobile ? "column" : "row" }
                                                        alignItems={ isMobile ? "flex-start" : "center" }
                                                    >
                                                        <Typography>streaming</Typography>
                                                        <DisplayFromPerSecondToXXX flowRate={ activeRoomData.flowRate } />
                                                        <Typography>to</Typography>
                                                    </Stack>
                                                    <Stack
                                                        direction="row"
                                                        justifyContent="flex-start"
                                                        alignItems="center"

                                                    >
                                                        { params.callee === activeRoomData?.calleeDisplayName ? (
                                                            <Box>{ `${ isMobile ? shortenAddress(params.callee!) : params.callee }` }</Box>
                                                        ) : (
                                                            <Box>{ `${ activeRoomData?.calleeDisplayName } | ${ isMobile ? shortenAddress(params.callee!) : params.callee }` }</Box>
                                                        ) }

                                                        <ButtonCopy value={ params.callee } />
                                                    </Stack>
                                                </Stack>
                                            ) : (
                                                <Box>starting stream...</Box>
                                            ) }
                                        </CardContent>
                                    </Card>
                                    <Card variant="outlined" sx={ { width: "100%" } }>
                                        <CardHeader
                                            title="Devices"
                                            sx={ {
                                                "&:last-child": {
                                                    paddingLeft: 24
                                                }
                                            } }
                                        />
                                        <CardContent sx={ { pl: 5, pr: 5 } }>
                                            <Stack
                                                direction='column'
                                                alignItems='flex-left'
                                                justifyContent='space-evenly'
                                                spacing={ 1 }
                                            >
                                                <Box sx={ { minWidth: 120 } }>
                                                    <FormControl fullWidth>
                                                        <InputLabel id="devices-label">Audio Input</InputLabel>
                                                        <Select
                                                            labelId="devices-label"
                                                            //   id="demo-simple-select"
                                                            value={ audioInput }
                                                            label="Audio Input"
                                                            onChange={ async (event: SelectChangeEvent) => {
                                                                const value = event.target.value
                                                                await hmsActions.setAudioSettings({ deviceId: value });
                                                                setAudioInput(value)
                                                            } }
                                                        >
                                                            { devices.audioInput.map((item) => (
                                                                <MenuItem
                                                                    key={ item.deviceId }
                                                                    value={ item.deviceId }
                                                                >
                                                                    { item.label }
                                                                </MenuItem>
                                                            )) }
                                                        </Select>
                                                    </FormControl>
                                                </Box>
                                                <Box sx={ { minWidth: 120 } }>
                                                    <FormControl fullWidth>
                                                        <InputLabel id="devices-label">Audio Output</InputLabel>
                                                        <Select
                                                            labelId="devices-label"
                                                            //   id="demo-simple-select"
                                                            value={ audioOutput }
                                                            label="Audio Output"
                                                            onChange={ async (event: SelectChangeEvent) => {
                                                                const value = event.target.value
                                                                await hmsActions.setAudioOutputDevice(value);
                                                                setAudioOutput(value)
                                                            } }
                                                        >
                                                            { devices.audioOutput.map((item) => (
                                                                <MenuItem
                                                                    key={ item.deviceId }
                                                                    value={ item.deviceId }
                                                                >
                                                                    { item.label }
                                                                </MenuItem>
                                                            )) }
                                                        </Select>
                                                    </FormControl>
                                                </Box>
                                                <Box sx={ { minWidth: 120 } }>
                                                    <FormControl fullWidth>
                                                        <InputLabel id="devices-label">Video</InputLabel>
                                                        <Select
                                                            labelId="devices-label"
                                                            //   id="demo-simple-select"
                                                            value={ videoInput }
                                                            label="Video"
                                                            onChange={ async (event: SelectChangeEvent) => {
                                                                const value = event.target.value
                                                                await hmsActions.setVideoSettings({ deviceId: value });
                                                                setVideoInput(value)
                                                            } }
                                                        >
                                                            { devices.videoInput.map((item) => (
                                                                <MenuItem
                                                                    key={ item.deviceId }
                                                                    value={ item.deviceId }
                                                                >
                                                                    { item.label }
                                                                </MenuItem>
                                                            )) }
                                                        </Select>
                                                    </FormControl>
                                                </Box>
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                </Stack>
                            </Box>
                            <Box sx={ { p: 10 } }></Box>
                        </Stack>
                    ) : (
                        <Box>loading peer</Box>
                    ) }
                </Box >
            ) : (
                <SplashPage />
            ) }
            <Dialog
                disableEscapeKeyDown
                open={ !active && !!isConnected }
            >
                <DialogTitle id="responsive-dialog-title" align="center">
                    { "Starting money streaming video call." }
                </DialogTitle>
                <DialogTitle id="responsive-dialog-title" align="center">
                    { "Please do not leave this page." }
                </DialogTitle>
            </Dialog>
        </Box >
    )
}

export default CallOneOnOnePage

/**
 *  const [audioInput, setAudioInput] = useState("")
    const [audioOutput, setAudioOutput] = useState("")
    const [videoInput, setVideoInput] = useState("")
 */