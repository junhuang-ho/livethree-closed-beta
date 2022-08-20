import { useToggle } from 'react-use';
import { useFormik, Form, FormikProvider } from 'formik'; // TODO: try react-hook-form
import * as Yup from 'yup';
import { LoadingButton } from '@mui/lab';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

import { auth, analytics } from "../services/firebase";
import { logEvent } from 'firebase/analytics';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useWeb3Auth } from '../contexts/Web3Auth';

import { browserSessionPersistence } from 'firebase/auth';
import { useEffect } from 'react';

export const SignUpForm = ({ createUserWithEmailAndPassword, setIsSubmitting }: any) => {

    const [firebaseUser] = useAuthState(auth);
    const { user: web3authUser, address: localAddress } = useWeb3Auth()

    const [showPassword, setShowPassword] = useToggle(false);

    // TODO: use-react-form || react-hook-form-mui https://github.com/dohomi/react-hook-form-mui || react-use 's useStateValidator
    const RegisterSchema = Yup.object().shape({
        email: Yup.string().email('Must be a valid email address').required('Email is required'),
        password: Yup.string().required('Password is required').matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/,
            "Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and One Special Case Character"
        ),
        passwordConfirm: Yup.string().required('Confirm password is required').when("password", {
            is: (val: any) => (val && val.length > 0 ? true : false),
            then: Yup.string().oneOf(
                [Yup.ref("password")],
                "Password not match"
            )
        }),
    });

    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
            passwordConfirm: '',
        },
        validationSchema: RegisterSchema,
        onSubmit: async (values) => {
            setIsSubmitting(true)

            try {
                await auth.setPersistence(browserSessionPersistence)
                await createUserWithEmailAndPassword(values.email, values.password)
                logEvent(analytics, "sign_up_started", { method: "Email/Password" })
            } catch (error) {
                console.error(error)
                alert("user registration error!")

            } finally {
                setIsSubmitting(false)
            }
        },
    });

    const { errors, touched, handleSubmit, isSubmitting: isFormikSumbitting, getFieldProps } = formik;

    return (
        <FormikProvider value={ formik }>
            <Form
                autoComplete="off"
                noValidate
                onSubmit={ (e) => {
                    e.preventDefault()
                    handleSubmit()
                } }
            >
                <Stack spacing={ 3 }>
                    { !web3authUser && (
                        <Box>
                            <Stack spacing={ 3 }>
                                <TextField
                                    fullWidth
                                    autoComplete="username"
                                    type="email"
                                    label="Email address"
                                    { ...getFieldProps('email') }
                                    error={ Boolean(touched.email && errors.email) }
                                    helperText={ touched.email && errors.email }
                                    disabled={ (isFormikSumbitting || !!web3authUser) }
                                />

                                <TextField
                                    fullWidth
                                    type={ showPassword ? 'text' : 'password' }
                                    label="Password"
                                    { ...getFieldProps('password') }
                                    InputProps={ {
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton edge="end" onClick={ setShowPassword }>
                                                    { showPassword ? <VisibilityIcon /> : <VisibilityOffIcon /> }
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    } }
                                    error={ Boolean(touched.password && errors.password) }
                                    helperText={ touched.password && errors.password }
                                    disabled={ (isFormikSumbitting || !!web3authUser) }
                                />

                                <TextField
                                    fullWidth
                                    type={ showPassword ? 'text' : 'password' }
                                    label="Confirm password"
                                    { ...getFieldProps('passwordConfirm') }
                                    InputProps={ {
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton edge="end" onClick={ setShowPassword }>
                                                    { showPassword ? <VisibilityIcon /> : <VisibilityOffIcon /> }
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    } }
                                    error={ Boolean(touched.passwordConfirm && errors.passwordConfirm) }
                                    helperText={ touched.passwordConfirm && errors.passwordConfirm }
                                    disabled={ (isFormikSumbitting || !!web3authUser) }
                                />
                                <LoadingButton fullWidth size="large" type="submit" variant="contained" loading={ isFormikSumbitting || !!web3authUser }>
                                    Register
                                </LoadingButton>
                            </Stack>

                        </Box>
                    ) }
                </Stack>
            </Form>
        </FormikProvider>
    )
}
