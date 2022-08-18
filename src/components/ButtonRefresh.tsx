import { useTheme } from '@mui/material/styles';

import RefreshIcon from '@mui/icons-material/Refresh';
import Avatar from "@mui/material/Avatar";
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';

import { useWeb3Auth } from '../contexts/Web3Auth';
import { useSuperfluidGas } from '../contexts/SuperfluidGas';
import { useSnackbar } from 'notistack';


export const ButtonRefresh = () => {
    const theme = useTheme()

    const { refreshNativeBalance } = useWeb3Auth()
    const { refreshSFStates } = useSuperfluidGas()
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const action = (snackbarId: any) => (
        <>
            <Button onClick={ () => { closeSnackbar(snackbarId) } } sx={ { color: "black" } }>
                Dismiss
            </Button>
        </>
    );

    return (
        <Tooltip title="refresh">
            <IconButton
                onClick={ () => {
                    refreshNativeBalance()
                    refreshSFStates()
                    enqueueSnackbar("Refreshed!", { variant: 'info', autoHideDuration: 2000, action })
                } }
            >
                <Avatar
                    sx={ { bgcolor: theme.palette.secondary.main, width: 16, height: 16 } }
                >
                    <RefreshIcon sx={ { width: "80%", height: "80%" } } />
                </Avatar>
            </IconButton>
        </Tooltip>
    )
}
