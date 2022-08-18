import { useState, useEffect } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom';

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

import { Header } from '../../components/profile/Header';
import { About } from '../../components/profile/About';
import { Description } from '../../components/profile/Description';

import { useWeb3Auth } from '../../contexts/Web3Auth';
import { useSearchByAddressOrHandle } from '../../hooks/useSearchByAddressOrHandle'
import { usePreviewMode } from '../../hooks/usePreviewMode'

import { SplashPage } from '../utils/SplashPage';

type Props = {
    state: {
        from: Location;
    };
};

const ProfileYouPage = () => {
    const params = useParams()
    const navigate = useNavigate();
    const location = useLocation() as unknown as Props; // https://github.com/reach/router/issues/414#issuecomment-1056839570

    const { address: localAddress } = useWeb3Auth()

    const [load, setLoad] = useState<boolean>(false)

    const address = params.address
    const { uid, data: dataUser, isLoading: isSearching, reloadUser } = useSearchByAddressOrHandle(address!, true, load, setLoad)

    const [previewMode] = usePreviewMode(localAddress, dataUser?.address)

    useEffect(() => {
        setLoad(true) // so that call useSearch once only
    }, [])

    return (
        <Box>
            <Stack alignItems="center">
                <Box sx={ { p: 2, width: "98%", maxWidth: 1000 } }>
                    { dataUser ? (
                        <Box>
                            <Stack spacing={ 1 } alignItems="center" justifyContent="center" sx={ { pb: 1 } }>
                                { previewMode &&
                                    <Tooltip title="close">
                                        <IconButton
                                            color="error"
                                            onClick={ () => {
                                                navigate(location.state?.from?.pathname || '/', { replace: true })
                                            } }
                                        >
                                            <CloseIcon />
                                        </IconButton>
                                    </Tooltip>
                                }
                                <Header uid={ uid } dataUser={ dataUser } showcaseMode={ true } isUserLoading={ isSearching } reloadUser={ reloadUser } />
                                <About uid={ uid } dataUser={ dataUser } showcaseMode={ true } />
                                <Description uid={ uid } dataUser={ dataUser } showcaseMode={ true } />
                            </Stack>
                        </Box >
                    ) : (
                        <SplashPage />
                    ) }
                </Box >
            </Stack>
        </Box>
    )
}

export default ProfileYouPage