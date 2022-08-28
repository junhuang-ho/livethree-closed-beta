import { Outlet } from 'react-router-dom';
import { styled } from '@mui/material/styles';

import { NavigationLayout } from './NavigationLayout';

import { Referral } from '../components/Referral';
import { Guide } from '../components/Guide';
import { Debugger } from '../components/Debugger';
import { WalletDisplay } from '../components/WalletDisplay';

import { useCall } from '../contexts/Call';
import { useAuthenticationState } from '../contexts/AuthenticationState'

import {
    useHMSStore,
    selectIsConnectedToRoom,
} from "@100mslive/react-sdk";

// const APP_BAR_MOBILE = 64;
// const APP_BAR_DESKTOP = 92;

const RootStyle = styled('div')({
    display: 'flex',
    minHeight: '100%',
    overflow: 'hidden'
});

const MainStyle = styled('div')(({ theme }) => ({
    flexGrow: 1,
    overflow: 'auto',
    minHeight: '100%',
    // paddingTop: APP_BAR_MOBILE + 24,
    paddingBottom: theme.spacing(10),
    [theme.breakpoints.up('lg')]: {
        // paddingTop: APP_BAR_DESKTOP + 24,
        // paddingLeft: theme.spacing(2),
        // paddingRight: theme.spacing(2)
    },
}));

export const MainLayout = () => {

    const { activeCallMaxSeconds, isEntering } = useCall()
    const { isDebugger } = useAuthenticationState()

    const isConnectedToRoom = useHMSStore(selectIsConnectedToRoom);

    return (
        <RootStyle>
            { (activeCallMaxSeconds === "0" && !isConnectedToRoom && !isEntering) ? (
                <NavigationLayout />
            ) : (
                null
            ) }

            <MainStyle sx={ { paddingBottom: 12 } }>
                {/* paddingBottom is so that BottomNavigation (during mobile view) does not block main content */ }
                <Outlet />
            </MainStyle>
            <WalletDisplay />
            <Referral />
            <Guide />
            { isDebugger && <Debugger /> }
        </RootStyle>
    )
}
