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

import { auth, analytics } from '../services/firebase';
import { logEvent } from 'firebase/analytics';
import { browserSessionPersistence } from 'firebase/auth';

export const SignInForm = ({ signInWithEmailAndPassword, setIsSubmitting }: any) => {
    const [showPassword, setShowPassword] = useToggle(false);

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

            try {
                await auth.setPersistence(browserSessionPersistence)
                await signInWithEmailAndPassword(values.email, values.password)
                logEvent(analytics, "sign_in")
            } catch (error: any) {
                if (error.code === "auth/user-not-found") {
                    alert("Account Not Registered!")
                } else {
                    console.log(error)
                    alert("sign in error!")
                }
            }

            setIsSubmitting(false)
        },
    });

    const { errors, touched, values, isSubmitting, handleSubmit, getFieldProps } = formik;

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
                        disabled={ (isSubmitting) }
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
                        disabled={ (isSubmitting) }
                    />
                </Stack>

                <Stack direction="row" alignItems="center" justifyContent="flex-end" sx={ { my: 2 } }>
                    <Box sx={ { p: 1 } }></Box>
                    {/* <FormControlLabel
                        control={ <Checkbox disabled={ isSubmitting } { ...getFieldProps('remember') } checked={ values.remember } /> }
                        label="Remember me"
                    />
                    { isSubmitting ? (
                        <Link component={ Button } variant="subtitle2" underline="hover" disabled>
                            Forgot password?
                        </Link>
                    ) : (
                        <Link component={ RouterLink } variant="subtitle2" to="/reset-password" underline="hover">
                            Forgot password?
                        </Link>
                    ) } */}
                </Stack>
                <LoadingButton fullWidth size="large" type="submit" variant="contained" loading={ isSubmitting }>
                    Login
                </LoadingButton>
            </Form>
        </FormikProvider>
    )
}
