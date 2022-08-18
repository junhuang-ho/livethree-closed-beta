import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

import { useSuperfluidGas } from '../../contexts/SuperfluidGas';
import { useEffect, useState } from 'react';

import { ethers } from 'ethers';

export const DialogHasNetFlow = ({ open, setOpen }: any) => {

    const { getNetFlowTokenX, tokenXSymbol } = useSuperfluidGas()

    const [netFlow, setNetFlow] = useState<any>(null)

    useEffect(() => {
        const run = async () => {
            setNetFlow(await getNetFlowTokenX())
        }
        run()
    }, [])

    return (
        <Dialog
            disableEscapeKeyDown
            open={ open }
            onClose={ () => {
                setOpen(false)

            } }
        >
            <DialogTitle id="responsive-dialog-title">
                { "Cannot proceed when account has active money stream" }
            </DialogTitle>
            <DialogContent>
                { netFlow &&
                    <Box>
                        <DialogContentText align="justify">
                            Net flow is { Number(ethers.utils.formatEther(netFlow.toString())).toFixed(7) } { tokenXSymbol ? tokenXSymbol : "" } per second.
                            Please close all money streams that might still be open before proceeding. Go to settings, under the 'Delete outgoing stream' section,
                            enter the recipient address to close the money stream.
                        </DialogContentText>
                    </Box>
                }
            </DialogContent>
            <DialogActions>
                <Button
                    autoFocus
                    onClick={ () => {
                        setOpen(false)
                    } }
                >
                    Ok
                </Button>
            </DialogActions>
        </Dialog>
    )
}
