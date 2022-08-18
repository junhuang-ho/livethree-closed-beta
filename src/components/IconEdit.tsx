import { useTheme } from '@mui/material/styles';

import EditIcon from '@mui/icons-material/Edit';
import Avatar from "@mui/material/Avatar";
import Tooltip from '@mui/material/Tooltip';

export const IconEdit = () => {
    const theme = useTheme()

    return (
        <Tooltip title="edit">
            <Avatar
                sx={ { bgcolor: theme.palette.secondary.main, width: 16, height: 16 } }
            >
                <EditIcon sx={ { width: "80%", height: "80%" } } />
            </Avatar>
        </Tooltip>
    )
}
