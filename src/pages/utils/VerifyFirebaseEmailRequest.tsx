import { useState } from "react";
import Stack from "@mui/material/Stack";
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import { Navigate, useNavigate } from 'react-router-dom';
import { auth } from "../../services/firebase";
import { sendEmailVerification } from "firebase/auth";
import { signOut } from "firebase/auth";
import { useAuthState } from 'react-firebase-hooks/auth';

import { useWeb3Auth } from '../../contexts/Web3Auth';

import livethreeGrey from '../../assets/livethree-crop-grey-bg.png'

const ERROR_CODE_MANY_REQUEST = "auth/too-many-requests"

const VerifyFirebaseEmailRequest = () => {
    const navigate = useNavigate();

    const { logout: web3authLogout } = useWeb3Auth()

    const [firebaseUser, firebaseUserLoading, firebaseUserError] = useAuthState(auth);
    const [isSubmitted, setIsSubmitted] = useState(false)


    if (firebaseUser?.emailVerified) {
        return <Navigate to='/' replace />
    }

    return (
        <Stack
            alignItems="center"
        >
            <Box
                component="img"
                sx={ {
                    alignItems: "center",
                    justifyContent: "center",
                    mt: 10
                } }
                alt="logo"
                src={ livethreeGrey }
            />
            <Box
                sx={ { width: "98%", maxWidth: 300 } }
            >
                <Stack
                    alignItems="center"
                    justifyContent="center"
                    spacing={ 3 }
                    sx={ { height: "60vh", pb: 15 } }
                >
                    <Typography
                        align="justify"
                    >
                        Please verify email to complete sign-up.
                    </Typography>
                    <Button
                        fullWidth
                        variant="contained"
                        disabled={ isSubmitted }
                        onClick={ async () => {

                            try {
                                await sendEmailVerification(auth?.currentUser!)
                                setIsSubmitted(true)
                            } catch (error: any) {
                                if (error.code === ERROR_CODE_MANY_REQUEST) {
                                    alert("Please try again awhile later.")
                                }
                                console.error(error)
                            }
                        } }
                    >
                        send verification
                    </Button>
                    { isSubmitted && (
                        <Typography
                            align="justify"
                        >
                            A verification email has been send to { auth?.currentUser?.email }.
                            Check your spam folder if not found in inbox.
                        </Typography>
                    ) }
                    <Stack
                        direction="row"
                    >
                        <Typography>
                            <Button
                                sx={ { textTransform: "none" } }
                                onClick={ () => {
                                    window.location.reload();
                                } }
                            >
                                <Typography
                                    align="justify"
                                >
                                    Reload after verified
                                </Typography>
                            </Button>
                            or
                            <Button
                                sx={ { textTransform: "none" } }
                                onClick={ async () => {
                                    await web3authLogout()
                                    await signOut(auth)

                                    navigate('/', { replace: true })
                                } }
                            >
                                <Typography
                                    align="justify"
                                >
                                    logout
                                </Typography>
                            </Button>
                            .
                        </Typography>
                    </Stack>
                </Stack>
            </Box>
        </Stack>
    )
}

export default VerifyFirebaseEmailRequest