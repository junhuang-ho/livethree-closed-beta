import { useSuperfluidGas } from '../../contexts/SuperfluidGas';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

import { ethers } from 'ethers';
// 0.0001 is for those fractional balance that you cant see after rounding up
export const DialogInsufficientFunds = ({ open, setOpen, minimumBalance }: any) => {
    const { tokenSymbol, tokenXSymbol } = useSuperfluidGas()

    return (
        <Dialog
            disableEscapeKeyDown
            open={ open }
            onClose={ () => {
                setOpen(false)

            } }
        >
            <DialogTitle id="responsive-dialog-title">
                { "Insufficient funds" }
            </DialogTitle>
            <DialogContent>
                { minimumBalance &&
                    <Box>
                        <DialogContentText align="justify">
                            Your account requires a minimum of { (Number(ethers.utils.formatEther(minimumBalance.toString())) + 0.0001).toFixed(4) } { tokenXSymbol ? tokenXSymbol : "" }
                            { ` ` } to start a money streaming video call. Please top-up your account or wrap sufficient { tokenSymbol ? tokenSymbol : "" }.
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
