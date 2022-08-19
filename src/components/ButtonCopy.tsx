import { useCopyToClipboard } from 'react-use';

import { useTheme } from '@mui/material/styles';

import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Avatar from "@mui/material/Avatar";
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import { useSnackbar } from 'notistack';

export const ButtonCopy = ({ value }: { value: any }) => {
    const theme = useTheme()
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const [{ }, copyToClipboard] = useCopyToClipboard();

    const action = (snackbarId: any) => (
        <>
            <Button onClick={ () => { closeSnackbar(snackbarId) } } sx={ { color: "black" } }>
                Dismiss
            </Button>
        </>
    );

    return (
        <Tooltip title="copy address" >
            <IconButton
                onClick={ () => {
                    copyToClipboard(value)
                    enqueueSnackbar("Address copied!", { variant: 'info', autoHideDuration: 2000, action })
                } }
            >
                <Avatar
                    sx={ { bgcolor: theme.palette.secondary.main, width: 16, height: 16 } }
                >
                    <ContentCopyIcon sx={ { width: "80%", height: "80%" } } />
                </Avatar>
            </IconButton>
        </Tooltip>
    )
}
