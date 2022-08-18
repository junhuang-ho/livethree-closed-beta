import { useState, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import { styled } from '@mui/material/styles';
import { useSignInWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { auth } from "../../services/firebase";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";

import { SplashPage } from '../utils/SplashPage';

import { SignInForm } from "../../components/SignInForm";
import { Logo } from "../../components/Logo";

import { useResponsive } from '../../hooks/useResponsive';
import { useSnackbar } from 'notistack';
import { useAuthenticationState } from '../../contexts/AuthenticationState';

const RootStyle = styled('div')(({ theme }) => ({
    [theme.breakpoints.up('md')]: {
        display: 'flex',
    },
}));

const HeaderStyle = styled('header')(({ theme }) => ({
    top: 0,
    zIndex: 9,
    lineHeight: 0,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    position: 'absolute',
    padding: theme.spacing(3),
    justifyContent: 'flex-end',
    [theme.breakpoints.up('md')]: {
        alignItems: 'flex-start',
        padding: theme.spacing(7, 5, 0, 7),
    },
}));

const ContentStyle = styled('div')(({ theme }) => ({
    maxWidth: 480,
    margin: 'auto',
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    padding: theme.spacing(12, 0),
}));

const SignInPage = () => {
    const isMobile = useResponsive('down', 'sm');

    const { firebaseUser } = useAuthenticationState()
    const [signInWithEmailAndPassword, _, __, firebaseUserError] = useSignInWithEmailAndPassword(auth);

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const action = (snackbarId: any) => (
        <>
            <Button onClick={ () => { closeSnackbar(snackbarId) } } sx={ { color: "black" } }>
                Dismiss
            </Button>
        </>
    );

    useEffect(() => {
        if (firebaseUserError && isSubmitting) {
            enqueueSnackbar("Invalid email or password!", { variant: 'error', autoHideDuration: 2000, action })
        }
    }, [firebaseUserError, isSubmitting])

    if (!firebaseUser) {
        return (
            <RootStyle>
                <HeaderStyle>
                    { !isMobile && !isSubmitting && (
                        <Typography variant="body2" sx={ { mt: { md: -2 } } }>
                            Don’t have an account? { '' }
                            <Link variant="subtitle2" component={ RouterLink } to="/sign-up">
                                Get started
                            </Link>
                        </Typography>
                    ) }
                </HeaderStyle>

                <Container>
                    <ContentStyle>
                        <Stack
                            justifyContent="center"
                            spacing={ 10 }
                        >
                            <Logo bgGrey={ true } />
                            <Box>
                                <Typography variant="h4" gutterBottom sx={ { mb: 5 } }>
                                    Sign In
                                </Typography>

                                {/* <Typography sx={ { color: 'text.secondary', mb: 5 } }>Enter your details below.</Typography> */ }

                                {/* <AuthSocial /> */ }

                                <SignInForm
                                    signInWithEmailAndPassword={ signInWithEmailAndPassword }
                                    setIsSubmitting={ setIsSubmitting }
                                />
                                <Box sx={ { p: 5 } }></Box>
                                { isMobile && !isSubmitting && (
                                    <Typography variant="body2" align="center" sx={ { mt: 3 } }>
                                        Don’t have an account?{ ' ' }
                                        <Link variant="subtitle2" component={ RouterLink } to="/sign-up">
                                            Get started
                                        </Link>
                                    </Typography>
                                ) }
                            </Box>
                        </Stack>
                    </ContentStyle>
                </Container>
            </RootStyle>
        )
    }

    return <SplashPage />
}

export default SignInPage