import { useState, useEffect } from "react";

import { Navigate, Link as RouterLink } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";

import Link from "@mui/material/Link";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { auth } from "../../services/firebase";

import { useResponsive } from '../../hooks/useResponsive';

import { Logo } from '../../components/Logo';
import { SignUpForm } from '../../components/SignUpForm';

import { useCreateUserWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { useWeb3Auth } from "../../contexts/Web3Auth";
import { useAuthenticationState } from '../../contexts/AuthenticationState';
import { useSnackbar } from 'notistack';
// import { DialogTermsOfService } from "../../components/dialogs/DialogTermsOfService";

import { SplashPage } from '../utils/SplashPage';

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

const SignUpPage = () => {
    const isMobile = useResponsive('down', 'sm');

    const [createUserWithEmailAndPassword, _, __, firebaseUserError] = useCreateUserWithEmailAndPassword(auth);
    const { user: web3authUser } = useWeb3Auth()
    const { firebaseUser } = useAuthenticationState()

    const [isSubmitting, setIsSubmitting] = useState(false)
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
            enqueueSnackbar("Sign up error, email may have already been registered.", { variant: 'error', autoHideDuration: 2000, action })
        }
    }, [firebaseUserError, isSubmitting])

    useEffect(() => {
        if (firebaseUser && web3authUser) {
            setIsSubmitting(false)
        }
    }, [firebaseUser, web3authUser])

    if (!firebaseUser) {
        return (
            <RootStyle>
                <HeaderStyle>
                    { !isMobile && !isSubmitting && (
                        <Typography variant="body2" sx={ { mt: { md: -2 } } }>
                            Already have an account? { '' }
                            <Link variant="subtitle2" component={ RouterLink } to="/sign-in">
                                Sign In
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
                                    Get started.
                                </Typography>
                                {/* secondary text style */ }
                                {/* <Typography sx={ { color: 'text.secondary', mb: 5 } }>Free forever. No credit card needed.</Typography> */ }

                                {/* <AuthSocial /> */ }

                                <SignUpForm
                                    createUserWithEmailAndPassword={ createUserWithEmailAndPassword }
                                    setIsSubmitting={ setIsSubmitting }
                                />
                                { isMobile && !isSubmitting && (
                                    <Typography variant="body2" sx={ { mt: 3, textAlign: 'center' } }>
                                        Already have an account?{ ' ' }
                                        <Link variant="subtitle2" to="/sign-in" component={ RouterLink }>
                                            Sign In
                                        </Link>
                                    </Typography>
                                ) }
                            </Box>
                        </Stack>
                        {/* <DialogTermsOfService open={ displayTermsOfService } setOpen={ setDisplayTermsOfService } /> */ }
                    </ContentStyle>
                </Container>
            </RootStyle>
        )
    }

    return <SplashPage />
}

export default SignUpPage