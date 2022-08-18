import { matchPath, useLocation } from 'react-router-dom';

import Box from "@mui/material/Box";
import List from "@mui/material/List";

import { useResponsive } from '../../hooks/useResponsive'

import { NavigationItem } from './NavigationItem';

export const NavigationTabs = ({ navConfig, setBottomTab, activeCalls, ...other }: any) => {
    const isWide = useResponsive('up', 'lg');

    const { pathname } = useLocation();
    const match = (path: any) => (path ? !!matchPath({ path, end: false }, pathname) : false);

    return (
        <Box { ...other }>
            <List disablePadding sx={ { ...(isWide && { px: 1 }) } }>
                { navConfig.map((item: any, index: number) => (
                    <NavigationItem key={ item.title } index={ index } item={ item } active={ match } setBottomTab={ setBottomTab } activeCalls={ activeCalls } />
                )) }
            </List>
        </Box >
    );
}
