import livethreeGrey from '../../assets/livethree-crop-grey-bg.png'

import Stack from "@mui/material/Stack";
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

export const SplashPage = () => {
    return (
        <Stack
            alignItems="center"
            justifyContent="center"
            spacing={ 3 }
            sx={ { height: "100vh", pb: 15 } }
        >
            <Box
                component="img"
                sx={ {
                    alignItems: "center",
                    justifyContent: "center",
                } }
                alt="logo"
                src={ livethreeGrey }
            />
            <CircularProgress />
        </Stack>
    )
}
