import { useState } from "react";
import Stack from "@mui/material/Stack";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

import { Link as RouterLink } from 'react-router-dom';

import livethreeGrey from '../../assets/livethree-crop-grey-bg.png'

// const errorCode = "auth/invalid-email"

const ResetPasswordPage = () => {
    const [password, setPassword] = useState("")
    const [passwordConfirm, setPasswordConfirm] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isValidPassword, setIsValidPassword] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    // const [emailNotRegistered, setEmailNotRegistered] = useState(false)
    const [isReset, setIsReset] = useState(false)

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
                        type={ showPassword ? 'text' : 'password' }
                        label="Password"
                        value={ password }
                        onChange={ (event) => {
                            const reg = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/);
                            setIsValidPassword(reg.test(event.target.value))
                            setPassword(event.target.value)
                        } }
                        InputProps={ {
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={ () => setShowPassword(!showPassword) } edge="end">
                                        { showPassword ? <VisibilityIcon /> : <VisibilityOffIcon /> }
                                    </IconButton>
                                </InputAdornment>
                            ),
                        } }
                        error={ !isValidPassword }
                        helperText={ !isValidPassword && "Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and One Special Case Character" }
                        disabled={ isSubmitting }
                        required
                    />

                    <TextField
                        fullWidth
                        type={ showPassword ? 'text' : 'password' }
                        label="Confirm password"
                        value={ passwordConfirm }
                        onChange={ (event) => {
                            setPasswordConfirm(event.target.value)
                        } }
                        InputProps={ {
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={ () => setShowPassword(!showPassword) } edge="end">
                                        { showPassword ? <VisibilityIcon /> : <VisibilityOffIcon /> }
                                    </IconButton>
                                </InputAdornment>
                            ),
                        } }
                        error={ password !== passwordConfirm }
                        helperText={ password !== passwordConfirm && "Password must match!" }
                        disabled={ isSubmitting }
                        required
                    />

                    <Button
                        fullWidth
                        variant="contained"
                        disabled={ isSubmitting || password === "" || password !== passwordConfirm || !isValidPassword }
                        style={ { textTransform: 'none' } }
                        onClick={ async () => {
                            setIsSubmitting(true)

                            try {
                                // await updatePassword(auth?.currentUser, password) // TODO: ERROR USER NOT SIGNED IN
                                // TODO: https://stackoverflow.com/a/59504039
                                // https://firebase.google.com/docs/auth/custom-email-handler
                                setIsReset(true)
                            } catch (error: any) {
                                // if (error.code === errorCode) {
                                //     setEmailNotRegistered(true)
                                // }
                                console.error(error)
                                setIsSubmitting(false)
                            }
                        } }
                    >
                        Reset
                    </Button>
                    { isReset ? (
                        <Typography
                            align="justify"
                        >
                            Your password has been reset.
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

export default ResetPasswordPage