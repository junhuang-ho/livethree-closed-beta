import livethreeGrey from '../../assets/livethree-crop-grey-bg.png'

import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { Link as RouterLink } from 'react-router-dom';

export const InvalidReferralPage = () => {
    return (
        <Stack
            alignItems="center"
            justifyContent="center"
            spacing={ 2 }
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
            <Typography variant="body2" sx={ { mt: { md: -2 } } }>
                Invalid referral link. { '' }
                <Link variant="subtitle2" component={ RouterLink } to="/sign-up">
                    Sign up without a referral.
                </Link>
            </Typography>
        </Stack>
    )
}
