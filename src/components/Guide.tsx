import Fab from '@mui/material/Fab';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';

import AutoStoriesIcon from '@mui/icons-material/AutoStories';

import { useResponsive } from '../hooks/useResponsive';

export const Guide = () => {
    const isMobile = useResponsive('down', 'sm');

    return (
        <Box
            sx={ isMobile ? {
                position: "fixed",
                bottom: (theme) => theme.spacing(8),
                right: (theme) => theme.spacing(2)
            } : {
                position: "fixed",
                bottom: (theme) => theme.spacing(3),
                right: (theme) => theme.spacing(48)
            } }
        >
            <Tooltip title="howtos / guides / manuals / blog">
                <Fab
                    color="primary"
                    onClick={ () => {
                        window.open("https://medium.com/@livethreeweb", '_blank', 'noopener');
                    } }
                >
                    <AutoStoriesIcon />
                </Fab>
            </Tooltip>
        </Box>
    )
}
