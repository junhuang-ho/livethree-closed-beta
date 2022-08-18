import { useState } from 'react';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { doc } from "firebase/firestore"
import { useNavigate, useLocation } from 'react-router-dom';

import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import { ProfileCard } from "../../components/ProfileCard";
import { useResponsive } from '../../hooks/useResponsive'

import { Header } from '../../components/profile/Header';

import { COL_REF_USERS } from "../../services/firebase";

import { auth } from "../../services/firebase";
import { useAuthState } from 'react-firebase-hooks/auth';
import { useSearchByAddressOrHandle } from '../../hooks/useSearchByAddressOrHandle'
import { useDebounce } from 'react-use';

import { SplashPage } from '../utils/SplashPage';
import { ErrorPage } from '../utils/ErrorPage';


type LocationProps = {
    state: {
        from: Location;
    };
};

const FavouritesPage = () => {
    const navigate = useNavigate();
    const location = useLocation() as unknown as LocationProps; // https://github.com/reach/router/issues/414#issuecomment-1056839570

    const isMobile = useResponsive('down', 'sm');

    const [firebaseUser] = useAuthState(auth);

    const [isSearched, setIsSearched] = useState<boolean>(false)
    const [isSearchedClicked, setIsSearchedClicked] = useState<boolean>(false)
    const [searchValue, setSearchValue] = useState<string>("")
    const [searchValueDebounce, setSearchValueDebounce] = useState<string>("")
    const { uid, setUid, data: dataUser, setData: setDataUser, isLoading: isSearchingValue } = useSearchByAddressOrHandle(searchValueDebounce!, isSearched, isSearchedClicked, setIsSearchedClicked)

    const [dataUserLocal, dataUserLocalLoading, dataUserLocalError] = useDocumentData(doc(COL_REF_USERS, firebaseUser?.uid));

    const [isDebounceReady, cancelDebounce] = useDebounce(
        () => {
            setSearchValueDebounce(searchValue);
        },
        2000,
        [searchValue]
    );

    // useEffect(() => { // doesn't really work as WalletDisplay component not in focus?
    //     refreshNativeBalance()
    //     refreshSFStates()
    //     console.log("refresh states")
    // }, [])

    if (dataUserLocalLoading) {
        return <SplashPage />
    }

    if (dataUserLocalError) {
        return <ErrorPage message="FavouritesPage" />
    }

    return (
        <Stack alignItems="center">
            <Box sx={ { p: 2, width: "98%", maxWidth: 1000 } }>
                <Stack spacing={ 3 } sx={ { mb: 3 } }>
                    <TextField
                        disabled={ !isDebounceReady }
                        id="outlined-basic"
                        label="Search by @ or Address"
                        variant="outlined"
                        value={ searchValue }
                        onChange={ (event) => setSearchValue(event.target.value) }
                        InputProps={ {
                            endAdornment: (
                                <InputAdornment position="end">
                                    { isSearched ? (
                                        <IconButton onClick={ () => {
                                            setIsSearched(false)
                                            setSearchValueDebounce("")
                                            setSearchValue("")
                                            setUid(null)
                                            setDataUser(null)
                                        } }
                                        >
                                            <CloseIcon />
                                        </IconButton>
                                    ) : (
                                        <IconButton disabled={ !searchValue } onClick={ () => {
                                            setIsSearched(true)
                                            setIsSearchedClicked(true)
                                        } }>
                                            <SearchIcon />
                                        </IconButton>
                                    ) }
                                </InputAdornment>
                            )
                        } }
                    // sx={ { position: "absolute" } }
                    />
                    { isSearched &&
                        (!isSearchingValue && dataUser && searchValueDebounce !== "" ? (
                            <Stack spacing={ 1 }>
                                <Header uid={ uid } dataUser={ dataUser } showcaseMode={ true } inFavPage={ true } />
                                <Button
                                    variant="contained"
                                    endIcon={ <ArrowForwardIcon /> }
                                    onClick={ () => {
                                        navigate(`/user/${ dataUser?.address }`, {
                                            state: {
                                                from: location,
                                            }
                                        })
                                    } }
                                >
                                    view
                                </Button>
                            </Stack>
                        ) : (
                            <Box>
                                { !isSearchingValue && !dataUser && searchValueDebounce !== "" ? (
                                    <Box>no matching result</Box>
                                ) : (
                                    <Box>loading...</Box>
                                ) }
                            </Box>
                        )) }
                </Stack>
                { dataUserLocal?.favourites.length > 0 ? (
                    <Box sx={ { maxHeight: "85vh", overflow: 'auto' } }>
                        { isMobile ? (
                            <List>
                                { dataUserLocal?.favourites.map((item: string, index: number) => (
                                    <ListItem
                                        disablePadding
                                        key={ index }
                                    >
                                        <ProfileCard address={ item } isMobile={ isMobile } />
                                    </ListItem>
                                )) }
                            </List>
                        ) : (
                            <Grid container spacing={ 2 }>
                                { dataUserLocal?.favourites.map((item: string, index: number) => (
                                    <Grid item key={ index } xs={ 12 } sm={ 6 } md={ 3 }>
                                        <ProfileCard address={ item } isMobile={ isMobile } />
                                    </Grid>
                                )) }
                            </Grid>
                        ) }
                    </Box>
                ) : (
                    <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        sx={ { width: "100%", height: "50vh" } }
                    >
                        no favourites
                    </Box>
                ) }

            </Box >
        </Stack >
    )
}

export default FavouritesPage