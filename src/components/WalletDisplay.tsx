import { useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ErrorIcon from '@mui/icons-material/Error';
import CloseIcon from '@mui/icons-material/Close';
import { IconGas } from './IconGas'
import { ButtonRefresh } from './ButtonRefresh';

import { useResponsive } from '../hooks/useResponsive';
import { useWeb3Auth } from '../contexts/Web3Auth';
import { useSuperfluidGas } from '../contexts/SuperfluidGas';
import { useCall } from '../contexts/Call';

import {
    useHMSStore,
    selectIsConnectedToRoom,
} from "@100mslive/react-sdk";

import { ButtonCopy } from './ButtonCopy';
import { shortenAddress } from '../utils';
import { CHAIN_ID_TO_CHAIN_NAME_MAPPING, CHAIN_ID_POLYGON } from '../configs/blockchain/web3auth';
import { ethers } from 'ethers';

export const WalletDisplay = () => {
    const isMobile = useResponsive('down', 'sm');

    const { address: localAddress, chainId, nativeCoinBalance } = useWeb3Auth()
    const { tokenBalance, tokenSymbol, tokenXBalance, tokenXSymbol, netFlow } = useSuperfluidGas()
    const { flowDeposit } = useCall()

    const isConnectedToRoom = useHMSStore(selectIsConnectedToRoom);

    const [closeWarning1, setCloseWarning1] = useState<boolean>(false)
    const [closeWarning2, setCloseWarning2] = useState<boolean>(false)

    const OPEN_STREAMS_ALERT = (
        <Box
            sx={ {
                width: 350,
                bgcolor: 'warning.main',
                // border: 2,
            } }
        >
            <Typography align="center">
                <Box component="span" fontWeight='fontWeightMedium' display='inline'>MONEY STREAM ACTIVE</Box>
            </Typography>
            <Typography align="center">
                <Box component="span" fontWeight='fontWeightMedium' display='inline'>NET FLOW { ethers.utils.formatEther(netFlow) }</Box>
            </Typography>
        </Box>
    )


    return (
        <Box>
            { isMobile ? (
                <Box
                    sx={ {
                        position: "fixed",
                        bottom: (theme) => theme.spacing(7),
                        right: (theme) => theme.spacing(2),
                        zIndex: 1
                    } }
                >
                    { netFlow !== "0" && !isConnectedToRoom && OPEN_STREAMS_ALERT }
                </Box>
            ) : (
                <Box
                    sx={ {
                        position: "fixed",
                        bottom: (theme) => theme.spacing(2),
                        right: (theme) => theme.spacing(2),
                        zIndex: 1
                    } }
                >
                    { netFlow !== "0" && !isConnectedToRoom && OPEN_STREAMS_ALERT }
                    <Stack sx={ { width: 350 } }>
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
                    <Box sx={ {
                        // position: 'absolute' as 'absolute',
                        width: 350,
                        backgroundColor: '#b7e0d6',
                        border: 2,
                        borderRadius: 2,
                        borderColor: "primary.main",
                        boxShadow: 24,
                        py: 2,
                        px: 3,
                        m: 0,
                    } }
                    >
                        <Stack>
                            <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="center"
                            >
                                <Stack
                                    direction="row"
                                    justifyContent="flex-start"
                                    alignItems="center"
                                >
                                    <Typography>
                                        { shortenAddress(localAddress) }
                                    </Typography>
                                    <ButtonCopy value={ localAddress } />
                                </Stack>
                                <Typography>
                                    { CHAIN_ID_TO_CHAIN_NAME_MAPPING[chainId] }
                                </Typography>
                            </Stack>
                            <Box sx={ { p: 1 } }></Box>
                            <Stack
                                direction="row"
                                justifyContent="center"
                                alignItems="center"
                            >
                                <Stack alignItems="center">
                                    <Stack direction="row" alignItems="space-between" spacing={ 1 } color={ tokenXBalance && Number(ethers.utils.formatEther(tokenXBalance)) === 0 ? "error.main" : "" } >
                                        <Typography variant="h4">
                                            { tokenXBalance ? `${ Number(ethers.utils.formatEther(tokenXBalance)).toFixed(4) }` : "" }
                                        </Typography>
                                        <Typography variant="h4">
                                            { tokenXSymbol ? tokenXSymbol : "" }
                                        </Typography>
                                    </Stack>

                                    { flowDeposit &&
                                        <Stack alignItems="center" justifyContent="center" sx={ { border: 1, borderRadius: 1, p: 1 } }>
                                            <Stack direction="row" alignItems="space-between" spacing={ 1 } >
                                                <Typography variant="h4">
                                                    { flowDeposit ? `${ Number(ethers.utils.formatEther(flowDeposit)).toFixed(4) }` : "" }
                                                </Typography>
                                                <Typography variant="h4">
                                                    { flowDeposit && tokenXSymbol ? tokenXSymbol : "" }
                                                </Typography>
                                            </Stack>
                                            <Typography variant="caption">
                                                (deposit amount)
                                            </Typography>
                                        </Stack>
                                    }

                                    <Stack direction="row" alignItems="space-between" spacing={ 1 } >
                                        { chainId === CHAIN_ID_POLYGON ? (
                                            <Typography>
                                                { tokenBalance ? `${ Number(ethers.utils.formatUnits(tokenBalance, 6)).toFixed(4) }` : "" }
                                            </Typography>
                                        ) : (
                                            <Typography>
                                                { tokenBalance ? `${ Number(ethers.utils.formatEther(tokenBalance)).toFixed(4) }` : "" }
                                            </Typography>
                                        ) }

                                        <Typography>
                                            { tokenSymbol ? tokenSymbol : "" }
                                        </Typography>
                                    </Stack>

                                    <Stack direction="row" alignItems="space-between" spacing={ 1 } color={ nativeCoinBalance && Number(ethers.utils.formatEther(nativeCoinBalance)) === 0 ? "error.main" : "" }>
                                        <Typography >
                                            { nativeCoinBalance ? `${ Number(ethers.utils.formatEther(nativeCoinBalance)).toFixed(4) }` : "" }
                                        </Typography>
                                        <Typography>
                                            MATIC
                                        </Typography>
                                    </Stack>
                                </Stack>
                                <ButtonRefresh />
                            </Stack>
                        </Stack>
                    </Box>
                </Box >
            ) }
        </Box >

    )
}
