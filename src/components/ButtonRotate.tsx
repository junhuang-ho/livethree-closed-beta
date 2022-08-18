import { useTheme } from '@mui/material/styles';

import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import Avatar from "@mui/material/Avatar";
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

export const ButtonRotate = ({ rotate }: { rotate: any }) => {
    const theme = useTheme()

    return (
        <Tooltip title="view" >
            <IconButton
                onClick={ () => {
                    rotate()
                } }
            >
                <Avatar
                    sx={ { bgcolor: theme.palette.secondary.main, width: 16, height: 16 } }
                >
                    <NavigateNextIcon sx={ { width: "80%", height: "80%" } } />
                </Avatar>
            </IconButton>
        </Tooltip>
    )
}
