import { useState, useEffect } from 'react';
import { matchPath, useLocation, useNavigate } from 'react-router-dom';
import { styled, useTheme, alpha } from '@mui/material/styles';
import Drawer from '@mui/material/Drawer';
import Avatar from '@mui/material/Avatar';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Box from '@mui/material/Box';
import Badge from '@mui/material/Badge';
import Stack from '@mui/material/Stack';

import { Logo } from '../components/Logo'
import { ScrollBar } from '../components/ScrollBar';
import { NavigationTabs } from '../components/navigation/NavigationTabs';

import { getNavConfig } from '../configs/navigation';
import { useResponsive } from '../hooks/useResponsive'
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../services/firebase';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { getColRefActive } from '../services/firebase';
import { useWeb3Auth } from '../contexts/Web3Auth';

import { StyledBadge } from '../components/utils';

const DRAWER_WIDTH_FULL = 280;
const DRAWER_WIDTH_PARTIAL = 55;

const FullBar = styled('div')(({ theme }) => ({
    [theme.breakpoints.up('lg')]: {
        flexShrink: 0,
        width: DRAWER_WIDTH_FULL,
    },
}));

const PartialBar = styled('div')(({ theme }) => ({
    [theme.breakpoints.between('sm', 'lg')]: {
        flexShrink: 0,
        width: DRAWER_WIDTH_PARTIAL,
    },
}));

export const NavigationLayout = () => {

    const theme = useTheme();
    let navigate = useNavigate();
    let location = useLocation();

    const isWide = useResponsive('up', 'lg');
    const isPartial = useResponsive('between', '', 'sm', 'lg');

    const [firebaseUser] = useAuthState(auth);

    const [bottomTab, setBottomTab] = useState(0);
    const [navConfig, setNavConfig] = useState<any[]>([])
    const { address: localAddress } = useWeb3Auth()
    const [activeCalls] = useCollectionData(getColRefActive(localAddress));

    const match = (path: any) => (path ? !!matchPath({ path, end: false }, location.pathname) : false);

    useEffect(() => {
        async function retrieveNavConfig() {
            setNavConfig(await getNavConfig(firebaseUser?.uid))
        }
        if (firebaseUser) {
            retrieveNavConfig()
        }
    }, [firebaseUser])


    const renderContent = (
        <ScrollBar>
            <Stack sx={ { justifyContent: 'center', alightItem: 'center', height: 92 } }>
                { isWide && <Logo /> }
                { isPartial && <Logo mini={ true } /> }
            </Stack>

            <Box>
                <NavigationTabs navConfig={ navConfig } setBottomTab={ setBottomTab } activeCalls={ activeCalls } />
            </Box>

        </ScrollBar>
    )

    return (
        <>
            { isWide && (
                <FullBar>
                    <Drawer
                        open={ true }
                        variant="persistent"
                        PaperProps={ {
                            sx: {
                                width: DRAWER_WIDTH_FULL,
                                borderRightStyle: 'inset',
                            },
                        } }
                    >
                        { renderContent }
                    </Drawer>
                </FullBar>
            ) }
            { isPartial && (
                <PartialBar>
                    <Drawer
                        open={ true }
                        variant="persistent"
                        PaperProps={ {
                            sx: {
                                width: DRAWER_WIDTH_PARTIAL,
                                borderRightStyle: 'inset',
                            },
                        } }
                    >
                        { renderContent }
                    </Drawer>
                </PartialBar>
            ) }
            { !isWide && !isPartial && (
                <Box sx={ { position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1 } }>
                    <BottomNavigation
                        onChange={ (event, newBottomTab) => {
                            setBottomTab(newBottomTab);
                        } }
                    >
                        { navConfig.map((item, index) => (
                            <BottomNavigationAction
                                key={ item.title }
                                icon={ item.title === "calls" ? (
                                    <StyledBadge
                                        overlap="circular"
                                        anchorOrigin={ { vertical: 'top', horizontal: 'right' } }
                                        badgeContent={ activeCalls?.length }
                                        variant="dot"
                                        sx={ { zIndex: 1 } }
                                    >
                                        { item.icon }
                                    </StyledBadge>
                                ) : (
                                    <>
                                        { typeof item.icon === "string" ? (
                                            <Avatar src={ item.icon } alt="profile" sx={ { border: (match(item.path) ? 2 : 0) } } />
                                        ) : (
                                            item.icon
                                        ) }
                                    </>
                                ) }
                                sx={
                                    match(item.path) ? {
                                        color: 'primary.main',
                                        fontWeight: 'fontWeightMedium',
                                        bgcolor: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
                                    } : {}
                                }
                                onClick={ () => navigate(item.path, { state: location, replace: true }) }
                            />
                        )) }
                    </BottomNavigation>
                </Box>
            ) }
        </>
    )
}
