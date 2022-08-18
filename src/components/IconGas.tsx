import { useTheme } from '@mui/material/styles';

import Tooltip from '@mui/material/Tooltip';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';

export const IconGas = () => {
    const theme = useTheme()

    return (
        <Tooltip title="this action uses MATIC (gas)">
            <LocalGasStationIcon fontSize="small" />
        </Tooltip>
    )
}
