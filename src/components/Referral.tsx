import { useState } from 'react';

import Fab from '@mui/material/Fab';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import Badge from '@mui/material/Badge';

import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

import { useResponsive } from '../hooks/useResponsive';
import { useWeb3Auth } from '../contexts/Web3Auth';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { doc } from 'firebase/firestore';

import { DialogReferralProgram } from './dialogs/DialogReferralProgram';

import { COL_REF_PROMO1 } from '../services/firebase';

export const Referral = () => {
    const isMobile = useResponsive('down', 'sm');
    const [open, setOpen] = useState<boolean>(false)
    const { address: localAddress } = useWeb3Auth()
    const [promo1Data] = useDocumentData(doc(COL_REF_PROMO1, localAddress));

    return (
        <Box
            sx={ isMobile ? {
                position: "fixed",
                bottom: (theme) => theme.spacing(8),
                right: (theme) => theme.spacing(10)
            } : {
                position: "fixed",
                bottom: (theme) => theme.spacing(12),
                right: (theme) => theme.spacing(48)
            } }
        >
            <Tooltip title="Earn more from every call">

                <Fab
                    color="primary"
                    onClick={ () => {
                        setOpen(true)
                    } }
                >
                    <Badge badgeContent={ promo1Data?.count } color="error" overlap='rectangular'>
                        <AttachMoneyIcon />
                    </Badge>
                </Fab>

            </Tooltip>
            <DialogReferralProgram open={ open } setOpen={ setOpen } count={ promo1Data?.count } />
        </Box >
    )
}
