import { styled } from '@mui/material/styles';
import Button from "@mui/material/Button";
import Badge, { BadgeProps } from '@mui/material/Badge';

export const StandardButton = styled(Button)({
    width: 60,
    height: 30,
    margin: 2,
});

export const IconButton = styled(Button)({
    width: 40,
    height: 25,
    margin: 2,
});

export const StyledBadge = styled(Badge)<BadgeProps>(({ theme }) => ({
    '& .MuiBadge-badge': {
        backgroundColor: '#ec444f',
        color: '#ec444f',
        boxShadow: `0 0 0 2px ${ theme.palette.background.paper }`,
        '&::after': {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            animation: 'ripple 1.2s infinite ease-in-out',
            border: '1px solid currentColor',
            content: '""',
        },
    },
    '@keyframes ripple': {
        '0%': {
            transform: 'scale(.8)',
            opacity: 1,
        },
        '100%': {
            transform: 'scale(2.4)',
            opacity: 0,
        },
    },
}));

export const StyledGasBadge = styled(Badge)<BadgeProps>(({ theme }) => ({
    '& .MuiBadge-badge': {
        backgroundColor: "#efc230",
        color: '#000000',
        right: -2,
        top: 30,
        // border: `2px solid ${ theme.palette.background.paper }`,
        // padding: "0 4px",
        width: "30"
    },
}));

export const StyledGasBadgeMini = styled(Badge)<BadgeProps>(({ theme }) => ({
    '& .MuiBadge-badge': {
        backgroundColor: "#efc230",
        color: '#000000',
        right: 15,
        top: 25,
        // border: `2px solid ${ theme.palette.background.paper }`,
        // padding: "0 4px",
        width: "30"
    },
}));

export const StyledGasBadgeMini2 = styled(Badge)<BadgeProps>(({ theme }) => ({
    '& .MuiBadge-badge': {
        backgroundColor: "#efc230",
        color: '#000000',
        right: 10,
        top: 25,
        // border: `2px solid ${ theme.palette.background.paper }`,
        // padding: "0 4px",
        width: "30"
    },
}));