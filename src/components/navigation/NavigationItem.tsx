import { NavLink } from 'react-router-dom';
import { alpha, useTheme, styled } from '@mui/material/styles';

import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";

import { StyledBadge } from '../utils';

import { useCall } from '../../contexts/Call'

const ListItemStyle = styled((props: any) => <ListItemButton disableGutters { ...props } />)(({ theme }) => ({
    ...theme.typography.body2,
    height: 48,
    position: 'relative',
    textTransform: 'capitalize',
    color: theme.palette.text.secondary,
    borderRadius: theme.shape.borderRadius,
}));

const ListItemIconStyle = styled(ListItemIcon)({
    width: 22,
    height: 22,
    color: 'inherit',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
});

const ListItemAvatarStyle = styled(ListItemAvatar)({
    width: 22,
    height: 22,
    color: 'inherit',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
});


export const NavigationItem = ({ index, item, active, setBottomTab, activeCalls }: any) => {
    const theme = useTheme();
    const { isCalleeInCall } = useCall()

    const isActiveRoot = active(item.path);

    const { title, path, icon } = item;

    const activeRootStyle = {
        color: 'primary.main',
        fontWeight: 'fontWeightMedium',
        bgcolor: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
    };

    return (
        <ListItemStyle
            component={ NavLink }
            to={ path }
            onClick={ () => setBottomTab(index) }
            sx={ {
                ...(isActiveRoot && activeRootStyle),
            } }
        >
            { title === "calls" ? ( // note: call notifications
                <StyledBadge
                    overlap="circular"
                    anchorOrigin={ { vertical: 'top', horizontal: 'right' } }
                    badgeContent={ 1 }
                    invisible={ !(activeCalls && ((!isCalleeInCall && activeCalls?.length > 0) || (isCalleeInCall && activeCalls?.length > 1))) }
                    variant="dot"
                    sx={ { zIndex: 1 } }
                >
                    <ListItemIconStyle>{ icon }</ListItemIconStyle>
                </StyledBadge>
            ) : (
                <>
                    { (typeof icon === "string") ? (
                        <Box>
                            <ListItemAvatarStyle>
                                <Avatar src={ icon } alt="profile" sx={ { border: (isActiveRoot ? 2 : 0) } } />
                            </ListItemAvatarStyle>
                        </Box>
                    ) : (
                        <ListItemIconStyle>{ icon }</ListItemIconStyle>
                    ) }
                </>
            ) }

            <ListItemText disableTypography primary={ title } />
        </ListItemStyle>
    );
}
