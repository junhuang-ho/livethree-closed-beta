import { useSuperfluidGas } from '../../contexts/SuperfluidGas';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import Button from '@mui/material/Button';
import { IconGas } from '../IconGas';

import { StyledGasBadge } from "../utils";

export const DialogGrantPermission = ({ open, setOpen }: any) => {
    const { isTransactionPending, grantOperatorDeletePermission } = useSuperfluidGas()

    return (
        <Dialog
            disableEscapeKeyDown
            open={ open }
            onClose={ () => {
                setOpen(false)

            } }
        >
            <DialogTitle id="responsive-dialog-title">
                { "Permission required" }
            </DialogTitle>
            <DialogContent>
                <DialogContentText align="justify">
                    LiveThree requires permission to allow the call recipient to end
                    the money streaming video call if necessary. This only needs to be
                    granted once. Note that it is still recommended that the caller should
                    always end the call first.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button
                    disabled={ isTransactionPending }
                    onClick={ () => {
                        setOpen(false)
                    } }
                >
                    Cancel
                </Button>
                <StyledGasBadge badgeContent={ <IconGas /> }>
                    <Button
                        autoFocus
                        disabled={ isTransactionPending }
                        onClick={ async () => {
                            try {
                                await grantOperatorDeletePermission()
                            } catch (error) {
                                console.error(error)
                            } finally {
                                setOpen(false)
                            }
                        } }
                    >
                        Grant
                    </Button>
                </StyledGasBadge>
            </DialogActions>
        </Dialog>
    )
}
