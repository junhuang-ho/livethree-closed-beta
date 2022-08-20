import { useRef } from 'react';
import { useSpring, animated } from 'react-spring'
import { useDrag } from '@use-gesture/react';

import { useVideo, useHMSStore, selectCameraStreamByPeerID } from '@100mslive/react-sdk';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { shortenAddress } from '../../utils';

export const VideoLayout0 = ({ peerLocal, peerRemote, maxWidth }: any) => {
    const videoFrameRef = useRef<any>()

    const [{ localVideoPosX, localVideoPosY }, api] = useSpring(() => ({ localVideoPosX: 0, localVideoPosY: 0 }))
    const bindLocalVideoPos = useDrag(({ offset: [localVideoPosX, localVideoPosY] }) => api.start({ localVideoPosX, localVideoPosY }), {
        bounds: videoFrameRef,
    })

    const { videoRef: videoRefLocal } = useVideo({ trackId: peerLocal.videoTrack });
    const { videoRef: videoRefRemote } = useVideo({ trackId: peerRemote.videoTrack });

    const videoTrackLocal = useHMSStore(selectCameraStreamByPeerID(peerLocal.id));
    const videoTrackRemote = useHMSStore(selectCameraStreamByPeerID(peerRemote.id));

    return (
        <Box ref={ videoFrameRef } sx={ { width: "100%", height: "auto", backgroundColor: "black", position: "relative" } }>
            { videoTrackLocal?.enabled ? (
                <animated.div
                    { ...bindLocalVideoPos() }
                    style={ { width: "20%", touchAction: "none", position: "absolute", x: localVideoPosX, y: localVideoPosY, zIndex: 1 } }
                >
                    {/*TODO: why touchAction none?: https://use-gesture.netlify.app/docs/extras/#touch-action */ }
                    <Box sx={ { position: "relative", p: 0, m: 0 } }>
                        <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="center"
                            sx={ { width: "100%", height: "auto" } }
                        >
                            <video
                                style={ { width: "100%", height: "auto", } }
                                // style={ { width: "20%", height: "auto", position: "absolute", bottom: "0%", right: "0%" } }
                                ref={ videoRefLocal }
                                autoPlay
                                muted
                                playsInline
                            />
                        </Stack>
                    </Box>
                </animated.div >
            ) : (
                null
            ) }
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="center"
                sx={ { width: "100%", height: "auto" } }
            >
                { videoTrackRemote?.enabled ? (
                    <video
                        style={ { width: "100%", height: "auto", maxWidth: maxWidth, zIndex: 0 } }
                        ref={ videoRefRemote }
                        autoPlay
                        muted
                        playsInline
                    />
                ) : (
                    <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        sx={ { width: "100%", pb: "56.25%", backgroundColor: "#22272E" } }
                    >
                        <Typography color="white" align="right" sx={ { width: "100%", p: 1 } }>{ peerRemote.name.length > 15 ? shortenAddress(peerRemote.name) : `@${ peerRemote.name }` }</Typography>
                    </Box>
                ) }
            </Stack>

        </Box >
    )
}
