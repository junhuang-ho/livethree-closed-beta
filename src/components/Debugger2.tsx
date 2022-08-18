import { useState } from 'react';

import Fab from '@mui/material/Fab';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Typography from "@mui/material/Typography"
import BugReportIcon from '@mui/icons-material/BugReport';

import { useResponsive } from '../hooks/useResponsive';

import { useWeb3Auth } from '../contexts/Web3Auth';

import { CHAIN_CONFIG_TYPE } from '../configs/blockchain/web3auth';

export const Debugger2 = () => {
    const isMobile = useResponsive('down', 'sm');

    const [openWallet, setOpenWallet] = useState<boolean>(false)
    const [openNetwork, setOpenNetwork] = useState<boolean>(false)
    const [network, setNetwork] = useState<CHAIN_CONFIG_TYPE | "">("")

    const { selectChain } = useWeb3Auth()

    return (
        <Box
            sx={ isMobile ? {
                position: "fixed",
                bottom: (theme) => theme.spacing(8),
                right: (theme) => theme.spacing(12)
            } : {
                position: "fixed",
                bottom: (theme) => theme.spacing(3),
                right: (theme) => theme.spacing(58)
            } }
        >
            <Fab
                color="primary"
                onClick={ () => {
                    setOpenWallet(!openWallet)
                } }
            >
                <BugReportIcon />
            </Fab>
            <Modal
                open={ openWallet }
                onClose={ () => {
                    setOpenWallet(false)
                } }
            >
                <Box sx={ {
                    position: 'absolute' as 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 350,
                    bgcolor: 'background.paper',
                    border: '2px solid #000',
                    boxShadow: 24,
                    p: 4,
                } }>
                    <Stack spacing={ 3 }>
                        <Typography>Closed Beta Access</Typography>
                        <FormControl fullWidth>
                            <InputLabel id="select-network">Network</InputLabel>
                            <Select
                                open={ openNetwork }
                                onClose={ () => {
                                    setOpenNetwork(false)
                                } }
                                onOpen={ () => {
                                    setOpenNetwork(true)
                                } }
                                value={ network }
                                labelId="select-network"
                                label="Network"
                                onChange={ (event: any) => {
                                    const value = event.target.value
                                    selectChain(value)
                                    setNetwork(value)
                                } }
                            >
                                <MenuItem value={ "polygon" }>Polygon Mainnet</MenuItem>
                                <MenuItem value={ "mumbai" }>Polygon Mumbai</MenuItem>
                            </Select>
                        </FormControl>
                    </Stack>
                </Box>
            </Modal >
        </Box >
    )
}
