import { useState } from 'react';

import Box from '@mui/material/Box';
import Stack from "@mui/material/Stack"
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { IconGas } from './IconGas';

import { StandardButton, StyledGasBadge } from "./utils";

import { useSuperfluidGas } from '../contexts/SuperfluidGas';
import { useSnackbar } from 'notistack';

export const Permissions = () => {
    const { grantOperatorDeletePermission, revokeOperatorAllPermissions, hasDeletePermission, isTransactionPending } = useSuperfluidGas()

    const [isProcessing, setIsProcessing] = useState<boolean>(false)
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const action = (snackbarId: any) => (
        <>
            <Button onClick={ () => { closeSnackbar(snackbarId) } } sx={ { color: "black" } }>
                Dismiss
            </Button>
        </>
    );

    return (
        <Card
            variant="outlined"
            sx={ { width: "100%" } }
        >
            <CardHeader
                title="Permissions"
                sx={ {
                    "&:last-child": {
                        paddingLeft: 24
                    }
                } }
            />
            <CardContent>
                <Typography align="justify">
                    LiveThree requires permission to allow the call recipient to end
                    the money streaming video call if necessary. This only needs to be
                    granted once. Note that it is still recommended that the caller should
                    always end the call first.
                </Typography>
                <Box sx={ { p: 1 } }></Box>
                <Stack direction="row" alignItems="justify" justifyContent="flex-start">
                    <Typography>
                        Current status:
                    </Typography>
                    <Box sx={ { pl: 1 } }></Box>
                    <Typography color={ hasDeletePermission ? "success.main" : "error.main" }>
                        <Box component="span" fontWeight='fontWeightMedium' display='inline'>
                            { hasDeletePermission ? 'Granted' : 'Not granted' }
                        </Box>
                    </Typography>
                </Stack>
                <Stack
                    direction="row"
                    justifyContent="flex-end"
                    alignItems="center"
                >
                    <StyledGasBadge badgeContent={ <IconGas /> }>
                        <StandardButton
                            variant="contained"
                            disabled={ isProcessing || isTransactionPending }
                            onClick={ async () => {
                                setIsProcessing(true)
                                try {
                                    if (hasDeletePermission) {
                                        await revokeOperatorAllPermissions()
                                    } else {
                                        await grantOperatorDeletePermission()
                                    }
                                } catch (error: any) {
                                    enqueueSnackbar("Something went wrong! Please try again later. - Permissions", { variant: 'error', autoHideDuration: 3000, action })
                                    console.error(error)
                                }
                                setIsProcessing(false)
                            } }
                        >
                            { hasDeletePermission ? 'revoke' : 'grant' }
                        </StandardButton >
                    </StyledGasBadge>
                </Stack>
            </CardContent>
        </Card >
    )
}
