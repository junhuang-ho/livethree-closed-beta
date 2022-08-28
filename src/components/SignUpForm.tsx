import { useToggle } from 'react-use';
import { useFormik, Form, FormikProvider } from 'formik'; // TODO: try react-hook-form
import * as Yup from 'yup';
import { LoadingButton } from '@mui/lab';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

import { setDoc, doc } from "firebase/firestore"
import { auth, analytics, COL_REF_REFERRALS } from "../services/firebase";
import { logEvent } from 'firebase/analytics';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useWeb3Auth } from '../contexts/Web3Auth';
import { useSnackbar } from 'notistack';
import { createUserWithEmailAndPassword, browserSessionPersistence } from 'firebase/auth';

export const SignUpForm = ({ referrerAddress, isSubmitting, setIsSubmitting }: any) => {

    const [firebaseUser] = useAuthState(auth);
    const { user: web3authUser, address: localAddress } = useWeb3Auth()
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const [showPassword, setShowPassword] = useToggle(false);

    const action = (snackbarId: any) => (
        <>
            <Button onClick={ () => { closeSnackbar(snackbarId) } } sx={ { color: "black" } }>
                Dismiss
            </Button>
        </>
    );

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

            await auth.setPersistence(browserSessionPersistence)
            // await createUserWithEmailAndPassword(values.email, values.password)
            createUserWithEmailAndPassword(auth, values.email, values.password)
                .then((userCredential) => {
                    // Signed in 
                    const user = userCredential.user

                    if (referrerAddress) {
                        setDoc(doc(COL_REF_REFERRALS, user.uid), {
                            referrerAddress: referrerAddress,
                        })
                    } else {
                        console.log("no referrer")
                    }

                })
                .catch((error) => {
                    const ERROR_MSG = 'auth/email-already-in-use'
                    if (error.code === ERROR_MSG) {
                        enqueueSnackbar("Email already registered. Sign-in instead.", { variant: 'error', autoHideDuration: 2000, action })
                    } else {
                        console.error(error)
                    }
                    setIsSubmitting(false)
                });

            logEvent(analytics, "sign_up_started", { method: "Email/Password" })
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
                                    disabled={ isSubmitting || isFormikSumbitting || !!web3authUser }
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
                                    disabled={ isSubmitting || isFormikSumbitting || !!web3authUser }
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
                                    disabled={ isSubmitting || isFormikSumbitting || !!web3authUser }
                                />
                                <LoadingButton fullWidth size="large" type="submit" variant="contained" loading={ isSubmitting || isFormikSumbitting || !!web3authUser }>
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
