import { auth } from "../services/firebase";
import { useAuthState } from 'react-firebase-hooks/auth';

import Stack from "@mui/material/Stack"
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';

import { StandardButton } from "./utils";

import { useLogoutFlow } from "../hooks/useLogoutFlow";

export const Logout = () => {
    const [firebaseUser, firebaseUserLoading, firebaseUserError] = useAuthState(auth);

    const { logout } = useLogoutFlow(firebaseUser?.uid)


    return (
        <Card
            variant="outlined"
            sx={ { width: "100%" } }
        >
            <CardHeader
                title="Sign out"
                sx={ {
                    "&:last-child": {
                        paddingLeft: 24
                    }
                } }
            />
            <CardContent>
                <Stack
                    direction="row"
                    justifyContent="flex-end"
                    alignItems="center"
                >
                    <StandardButton
                        variant="contained"
                        disabled={ !firebaseUser }
                        onClick={ async () => {
                            await logout()
                        } }
                    >
                        logout
                    </StandardButton >
                </Stack>
            </CardContent>
        </Card >
    )
}
