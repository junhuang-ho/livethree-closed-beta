import { useVideo, useHMSStore, selectCameraStreamByPeerID, selectVideoTrackByPeerID } from '@100mslive/react-sdk';

import { useResponsive } from '../../hooks/useResponsive';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { shortenAddress } from '../../utils';

export const VideoLayout3 = ({ peerLocal, peerRemote, maxWidth }: any) => {

    const isMobile = useResponsive('down', 'sm');

    const { videoRef: videoRefLocal } = useVideo({ trackId: peerLocal.videoTrack });
    const { videoRef: videoRefRemote } = useVideo({ trackId: peerRemote.videoTrack });

    const videoTrackLocal = useHMSStore(selectCameraStreamByPeerID(peerLocal.id));
    const videoTrackRemote = useHMSStore(selectCameraStreamByPeerID(peerRemote.id));

    const trackLocal = useHMSStore(selectVideoTrackByPeerID(peerLocal.id))

    return (
        <Box sx={ { width: "100%", height: "auto", backgroundColor: "black", position: "relative" } }>

            <Stack
                direction={ isMobile ? "column" : "row" }
                alignItems="center"
                justifyContent="center"
                sx={ { width: "100%", height: "auto" } }
            >
                { videoTrackLocal?.enabled ? (
                    <video
                        style={ { width: "100%", height: "auto", maxWidth: maxWidth } }
                        ref={ videoRefLocal }
                        autoPlay
                        muted
                        playsInline
                    />
                ) : (
                    <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        sx={ { width: trackLocal?.width, height: trackLocal?.height, backgroundColor: "#22272E" } }
                    >
                        <Typography color="white">{ peerLocal.name.length > 15 ? shortenAddress(peerLocal.name) : `@${ peerLocal.name }` }</Typography>
                    </Box>
                ) }
                { videoTrackRemote?.enabled ? (
                    <video
                        style={ { width: "100%", height: "auto", maxWidth: maxWidth } }
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
                        sx={ { width: trackLocal?.width, height: trackLocal?.height, backgroundColor: "#22272E" } }
                    >
                        <Typography color="white">{ peerRemote.name.length > 15 ? shortenAddress(peerRemote.name) : `@${ peerRemote.name }` }</Typography>
                    </Box>
                ) }
            </Stack >
        </Box >
    )
}
