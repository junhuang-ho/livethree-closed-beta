import * as Yup from 'yup';
// import { Link as RouterLink } from 'react-router-dom';
import { useFormik, Form, FormikProvider } from 'formik';
// import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
// import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
// import FormControlLabel from '@mui/material/FormControlLabel';
import Button from '@mui/material/Button';
import { LoadingButton } from '@mui/lab';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useToggle } from 'react-use';
import { useSnackbar } from 'notistack';
import { auth, analytics } from '../services/firebase';
import { logEvent } from 'firebase/analytics';
import { signInWithEmailAndPassword, browserSessionPersistence } from 'firebase/auth';

export const SignInForm = ({ isSubmitting, setIsSubmitting }: any) => {
    const [showPassword, setShowPassword] = useToggle(false);
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const action = (snackbarId: any) => (
        <>
            <Button onClick={ () => { closeSnackbar(snackbarId) } } sx={ { color: "black" } }>
                Dismiss
            </Button>
        </>
    );

    // TODO: use-react-form || react-use 's useStateValidator
    const LoginSchema = Yup.object().shape({
        email: Yup.string().email('Must be a valid email address').required('Email is required'),
        password: Yup.string().required('Password is required'),
    });

    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
            remember: true,
        },
        validationSchema: LoginSchema,
        onSubmit: async (values) => {
            setIsSubmitting(true)

            await auth.setPersistence(browserSessionPersistence)
            // await signInWithEmailAndPassword(values.email, values.password)
            signInWithEmailAndPassword(auth, values.email, values.password)
                .then((userCredential) => {
                    // Signed in 
                    // const user = userCredential.user;
                })
                .catch((error) => {
                    const ERROR_MSG_1 = 'auth/user-not-found'
                    const ERROR_MSG_2 = 'auth/wrong-password'
                    if (error.code === ERROR_MSG_1 || error.code === ERROR_MSG_2) {
                        enqueueSnackbar("Invalid email or password!", { variant: 'error', autoHideDuration: 2000, action })
                    } else {
                        console.error(error)
                    }
                    setIsSubmitting(false)
                });

            logEvent(analytics, "sign_in")

            // setIsSubmitting(false)
        },
    });

    const { errors, touched, values, isSubmitting: isFormikSumbitting, handleSubmit, getFieldProps } = formik;

    return (
        <FormikProvider value={ formik }>
            <Form autoComplete="off" noValidate onSubmit={ handleSubmit }>
                <Stack spacing={ 3 }>
                    <TextField
                        fullWidth
                        autoComplete="email"
                        type="email"
                        label="Email"
                        { ...getFieldProps('email') }
                        error={ Boolean(touched.email && errors.email) }
                        helperText={ touched.email && errors.email }
                        disabled={ isSubmitting || isFormikSumbitting }
                    />

                    <TextField
                        fullWidth
                        type={ showPassword ? 'text' : 'password' }
                        label="Password"
                        { ...getFieldProps('password') }
                        InputProps={ {
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={ setShowPassword } edge="end">
                                        { showPassword ? <VisibilityIcon /> : <VisibilityOffIcon /> }
                                    </IconButton>
                                </InputAdornment>
                            ),
                        } }
                        error={ Boolean(touched.password && errors.password) }
                        helperText={ touched.password && errors.password }
                        disabled={ isSubmitting || isFormikSumbitting }
                    />
                </Stack>

                <Stack direction="row" alignItems="center" justifyContent="flex-end" sx={ { my: 2 } }>
                    <Box sx={ { p: 1 } }></Box>
                </Stack>
                <LoadingButton fullWidth size="large" type="submit" variant="contained" loading={ isSubmitting || isFormikSumbitting }>
                    Login
                </LoadingButton>
            </Form>
        </FormikProvider>
    )
}
