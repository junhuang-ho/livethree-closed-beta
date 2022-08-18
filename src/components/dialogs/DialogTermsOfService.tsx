import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import Button from '@mui/material/Button';

export const DialogTermsOfService = ({ open, setOpen }: any) => {
    return (
        <Dialog
            disableEscapeKeyDown
            open={ open }
            onClose={ () => {
                setOpen(false)

            } }
        >
            <DialogTitle id="responsive-dialog-title">
                { "Terms of Service" }
            </DialogTitle>
            <DialogContent>
                <DialogContentText align="justify">
                    TODO: the service ~
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button
                    autoFocus
                    onClick={ () => {
                        setOpen(false)
                    } }
                >
                    Agree
                </Button>
            </DialogActions>
        </Dialog>
    )
}
