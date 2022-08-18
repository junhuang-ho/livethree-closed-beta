import { useState } from "react";
import Stack from "@mui/material/Stack";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';

import { Link as RouterLink } from 'react-router-dom';
import { auth } from "../../services/firebase";
import { sendPasswordResetEmail } from "firebase/auth";

import livethreeGrey from '../../assets/livethree-crop-grey-bg.png'

const errorCode = "auth/invalid-email"

const ResetPasswordRequestPage = () => {
    const [email, setEmail] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [emailNotRegistered, setEmailNotRegistered] = useState(false)
    const [isEmailSent, setIsEmailSent] = useState(false)

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
                    <TextField
                        fullWidth
                        autoComplete="email"
                        type="email"
                        label="Registered email"
                        value={ email }
                        onChange={ (event) => {
                            setEmail(event.target.value)
                        } }
                        // { ...getFieldProps('email') }
                        error={ emailNotRegistered }
                        helperText={ emailNotRegistered && "Email not registered" }
                        disabled={ isSubmitting }
                    />
                    <Button
                        fullWidth
                        variant="contained"
                        disabled={ isSubmitting || email === "" }
                        style={ { textTransform: 'none' } }
                        onClick={ async () => {
                            setIsSubmitting(true)
                            setEmailNotRegistered(false)

                            try {
                                await sendPasswordResetEmail(auth, email)
                                setIsEmailSent(true)
                            } catch (error: any) {
                                if (error.code === errorCode) {
                                    setEmailNotRegistered(true)
                                }
                                console.error(error)
                                setIsSubmitting(false)
                            }
                        } }
                    >
                        Send me reset password link
                    </Button>
                    { isEmailSent ? (
                        <Typography
                            align="justify"
                        >
                            Link to reset password sent to { email }. Please
                            check your inbox, and if not found check the spam folder.
                            <Link component={ RouterLink } variant="body1" to="/sign-in" underline="hover" sx={ { ml: 1 } }>
                                Go to sign-in.
                            </Link>
                        </Typography>
                    ) : (
                        <Typography
                            align="justify"
                        >
                            <Link component={ RouterLink } variant="body1" to="/sign-in" underline="hover" sx={ { ml: 1 } }>
                                Go to sign-in.
                            </Link>
                        </Typography>
                    ) }
                </Stack>
            </Box>
        </Stack>
    )
}

export default ResetPasswordRequestPage