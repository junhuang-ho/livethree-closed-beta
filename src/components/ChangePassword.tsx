import { useState } from "react";

import { auth } from "../services/firebase";
import { reauthenticateWithCredential, updatePassword, EmailAuthProvider } from "firebase/auth";

import Stack from "@mui/material/Stack"
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

import { StandardButton } from "./utils";

const ERROR_CODE_REAUTH = "auth/wrong-password"

export const ChangePassword = () => {
    const [passwordOld, setPasswordOld] = useState("")
    const [password, setPassword] = useState("")
    const [passwordConfirm, setPasswordConfirm] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isValidPassword, setIsValidPassword] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)

    return (
        <Card
            variant="outlined"
            sx={ { width: "100%" } }
        >
            <CardHeader
                title="Change password"
                sx={ {
                    "&:last-child": {
                        paddingLeft: 24
                    }
                } }
            />
            <CardContent>
                <Stack
                    spacing={ 1 }
                >
                    <TextField
                        fullWidth
                        type={ showPassword ? 'text' : 'password' }
                        label="Old password"
                        value={ passwordOld }
                        onChange={ (event) => {
                            // const reg = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/);
                            // setIsValidPassword(reg.test(event.target.value))
                            setPasswordOld(event.target.value)
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
                        disabled={ isSubmitting }
                        required
                    />

                    <TextField
                        fullWidth
                        type={ showPassword ? 'text' : 'password' }
                        label="New password"
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
                        error={ (password !== "" && !isValidPassword) || (passwordOld !== "" && passwordOld === password) }
                        helperText={ ((password !== "" && !isValidPassword) && "Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and One Special Case Character") || (passwordOld !== "" && passwordOld === password && "New password cannot be same as old password") }
                        disabled={ isSubmitting }
                        required
                    />

                    <TextField
                        fullWidth
                        type={ showPassword ? 'text' : 'password' }
                        label="Confirm new password"
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
                        error={ (passwordConfirm !== "" && password !== passwordConfirm) }
                        helperText={ (passwordConfirm !== "" && password !== passwordConfirm) && "Password must match!" }
                        disabled={ isSubmitting }
                        required
                    />
                    <Stack
                        direction="row"
                        justifyContent="flex-end"
                        alignItems="center"
                    >
                        <StandardButton
                            variant="contained"
                            disabled={ !auth || isSubmitting || password === "" || password !== passwordConfirm || !isValidPassword || passwordOld === "" || passwordOld === password }
                            onClick={ async () => {
                                if (!auth) {
                                    console.warn("no firebase user")
                                    return
                                } else {
                                    setIsSubmitting(true)

                                    try {
                                        const credential = EmailAuthProvider.credential(auth?.currentUser?.email!, passwordOld)
                                        await reauthenticateWithCredential(auth?.currentUser!, credential)
                                        await updatePassword(auth?.currentUser!, password)
                                        setPasswordOld("")
                                        setPassword("")
                                        setPasswordConfirm("")
                                        alert("Password changed!")
                                    } catch (error: any) {
                                        if (error.code === ERROR_CODE_REAUTH) {
                                            alert(`Invalid password for ${ auth?.currentUser?.email }`)
                                        }
                                        console.error(error)
                                    }
                                    setIsSubmitting(false)
                                }
                            } }
                        >
                            change
                        </StandardButton >
                    </Stack>
                </Stack>
            </CardContent>
        </Card >
    )
}
