import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

import { ButtonCopy } from '../ButtonCopy';

import { useWeb3Auth } from '../../contexts/Web3Auth';

import { PERCENTAGE_TAKE_NUMERATOR, PERCENTAGE_TAKE_NUMERATOR_PROMO1, PROMO1_COUNT } from '../../configs/blockchain/admin';
import { REFERRAL_MIN_DURATION_S } from '../../configs/general';

export const DialogReferralProgram = ({ open, setOpen, count }: any) => {
    const { address: localAddress } = useWeb3Auth()


    return (
        <Dialog
            disableEscapeKeyDown
            open={ open }
            onClose={ () => {
                setOpen(false)

            } }
            sx={ {
                "& .MuiDialog-container": {
                    "& .MuiPaper-root": {
                        width: "100%",
                        maxWidth: "900px",  // Set your width here
                    },
                },
            } }
        >
            <DialogTitle>
                { "Refer a friend" }
            </DialogTitle>
            <DialogContent>
                <DialogContentText align="justify">
                    You will earn a <Box component="span" fontWeight='fontWeightMedium' display='inline'>{ PERCENTAGE_TAKE_NUMERATOR - PERCENTAGE_TAKE_NUMERATOR_PROMO1 }% reduction </Box>
                    in LiveThree percentage take for the next <Box component="span" fontWeight='fontWeightMedium' display='inline'>{ PROMO1_COUNT } call(s) </Box>
                    for every referee who signs up and makes or receives a money streaming video call for at least { REFERRAL_MIN_DURATION_S + 5 } seconds
                    through your referral link.
                </DialogContentText>
                <Box sx={ { p: 1 } }></Box>
                <DialogContentText align="justify">
                    Referral link:
                </DialogContentText>
                <Stack
                    direction='row'
                    alignItems='center'
                    justifyContent='align-left'
                >
                    <DialogContentText>
                        { window.location.origin }/r/{ localAddress }
                    </DialogContentText>
                    <ButtonCopy value={ `${ window.location.origin }/r/${ localAddress }` } msg={ 'Referral link' } />
                </Stack>
                { count > 0 &&
                    <DialogContentText align="justify">
                        You currently have { count }
                    </DialogContentText>
                }
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
