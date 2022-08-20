import { useState, useEffect } from 'react';
import { useDocumentData } from 'react-firebase-hooks/firestore';

import { setDoc, doc } from "firebase/firestore"
import { useNavigate, useLocation } from 'react-router-dom';
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import IconButton from '@mui/material/IconButton';
import VisibilityIcon from '@mui/icons-material/Visibility';

import { Header } from '../../components/profile/Header';
import { About } from '../../components/profile/About';
import { Description } from '../../components/profile/Description';
import { SplashPage } from '../utils/SplashPage';
import { ErrorPage } from '../utils/ErrorPage';

import { COL_REF_USERS } from "../../services/firebase";

import { auth } from "../../services/firebase";
import { useAuthState } from 'react-firebase-hooks/auth';
import { useWeb3Auth } from '../../contexts/Web3Auth';
import { useAuthenticationState } from '../../contexts/AuthenticationState'

type LocationProps = {
    state: {
        from: Location;
    };
};

const ProfileMePage = () => {
    const navigate = useNavigate();
    const location = useLocation() as unknown as LocationProps; // https://github.com/reach/router/issues/414#issuecomment-1056839570

    const [firebaseUser] = useAuthState(auth);
    const { address: localAddress } = useWeb3Auth()
    const [dataUserLocal, dataUserLocalLoading, dataUserLocalError] = useDocumentData(doc(COL_REF_USERS, firebaseUser?.uid));

    const { setIsDebugger } = useAuthenticationState()
    useEffect(() => {
        if (dataUserLocal && dataUserLocal?.debugger) {
            setIsDebugger(true)
        } else {
            setIsDebugger(false)
        }

        const saveUser = async () => {
            try {
                await setDoc(doc(COL_REF_USERS, firebaseUser?.uid), {
                    address: localAddress,
                    photoURL: "",
                    about: "",
                    description: "",
                    headline: "", // note: require to set empty for firestore rules
                    favourites: [],
                    online: true,
                    isActive: false,
                })
            } catch (error: any) {
                const ERROR_MSG = "Missing or insufficient permissions."
                if (error.message === ERROR_MSG) {
                    console.error('LiveThree:', error.message)
                } else {
                    console.error(error)
                }
            }
        }
        if (!dataUserLocal && !dataUserLocalLoading && firebaseUser && localAddress && localAddress !== "empty") {
            console.warn("LiveThree setting user - should be run on first register only")
            saveUser()
        }
    }, [dataUserLocal, dataUserLocalLoading, firebaseUser, localAddress]) // DEBUGGER code

    if (dataUserLocalLoading) {
        return <SplashPage />
    }

    if (dataUserLocalError) {
        return <ErrorPage message="ProfileMePage" />
    }

    return (
        <Box>
            <Stack alignItems="center">
                <Box sx={ { p: 2, width: "98%", maxWidth: 1000 } }>
                    { dataUserLocal ? (
                        <Stack spacing={ 1 } alignItems="center" justifyContent="center" sx={ { pb: 1 } }>
                            <Tooltip title="preview">
                                <IconButton
                                    color="secondary"
                                    onClick={ () => {
                                        navigate(`/user/${ dataUserLocal?.address }`, {
                                            state: {
                                                from: location,
                                            }
                                        })
                                    } }
                                >
                                    <VisibilityIcon />
                                </IconButton>
                            </Tooltip>
                            <Header uid={ firebaseUser?.uid } dataUser={ dataUserLocal } showcaseMode={ false } />
                            <About uid={ firebaseUser?.uid } dataUser={ dataUserLocal } showcaseMode={ false } />
                            <Description uid={ firebaseUser?.uid } dataUser={ dataUserLocal } showcaseMode={ false } />
                        </Stack>
                    ) : (<Box>Loading...</Box>)
                    }

                    {/* TODO enhancement: "masonry" for miscellaneous content like twitch */ }
                </Box >
            </Stack >
        </Box>
    )
}

export default ProfileMePage