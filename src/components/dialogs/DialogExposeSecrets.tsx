import Dialog from '@mui/material/Dialog';
// import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

import { useWeb3Auth } from '../../contexts/Web3Auth';
import { useCopyToClipboard } from 'react-use';
import { useSnackbar } from 'notistack';

export const DialogExposeSecrets = ({ open, setOpen, privateKey }: any) => {
    const { address: localAddress } = useWeb3Auth()
    const [{ }, copyToClipboard] = useCopyToClipboard();
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const action = (snackbarId: any) => (
        <>
            <Button onClick={ () => { closeSnackbar(snackbarId) } } sx={ { color: "black" } }>
                Dismiss
            </Button>
        </>
    );

    return (
        <Dialog
            disableEscapeKeyDown
            open={ open }
            onClose={ () => {
                setOpen(false)

            } }
        >
            <DialogContent>
                <DialogContentText
                    align='left'
                // onClick={ () => {
                //     if (localAddress) {
                //         copyToClipboard(localAddress)
                //         enqueueSnackbar("Address copied!", { variant: 'info', autoHideDuration: 2000, action })
                //     }
                // } }
                >
                    Address: { localAddress }
                </DialogContentText>
                <Box sx={ { p: 1 } }></Box>
                <DialogContentText
                    align='left'
                    onClick={ () => {
                        if (privateKey) {
                            copyToClipboard(privateKey)
                            enqueueSnackbar("Private key copied!", { variant: 'info', autoHideDuration: 2000, action })
                        }
                    } }
                >
                    Private Key (click to copy): { privateKey }
                </DialogContentText>
                <Box sx={ { p: 1 } }></Box>
                <DialogContentText align="justify" color='error'>
                    Warning: Never disclose this key. Anyone with your private keys can
                    steal any assets held in your account. LiveThree would
                    <Box component="span" fontWeight='fontWeightMedium' display='inline'> never </Box>
                    ask for your private keys (or password).
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={ () => {
                        setOpen(false)
                    } }
                >
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    )
}
