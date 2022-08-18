import React, { useEffect, useState } from "react";
import { doc, updateDoc } from "firebase/firestore"

import {
    FROM_DENOMINATOR,
    INDEX_MINUTE,
    INDEX_HOUR,
    MINIMUM_STREAM_AMOUNT_PER_SECOND,
    MINIMUM_STREAM_AMOUNT_PER_MINUTE,
    MINIMUM_STREAM_AMOUNT_PER_HOUR,
    toPerSecondFromPerXXX,
    fromPerSecondToPerXXX,
    eToNumber
} from "../utils";

import { PRICE_MAX_CHARACTER } from "../configs/general";

import { COL_REF_USERS } from "../services/firebase";

import Box from "@mui/material/Box";
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Stack from "@mui/material/Stack"
import Button from "@mui/material/Button"
import Typography from "@mui/material/Typography"
import TextField from "@mui/material/TextField"
import Tooltip from "@mui/material/Tooltip"
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

import { StandardButton } from "./utils";

import { auth } from "../services/firebase";
import { useAuthState } from 'react-firebase-hooks/auth';
import { useResponsive } from '../hooks/useResponsive'
import { useSuperfluidGas } from "../contexts/SuperfluidGas";
import { useSnackbar } from 'notistack';

import { ethers } from "ethers";

export const FlowRate = () => {
    const isMobile = useResponsive('down', 'sm');

    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const { tokenXSymbol } = useSuperfluidGas()
    const [firebaseUser] = useAuthState(auth);
    const [amount, setAmount] = useState<string>("") // "1cent" wei/second
    const [belowMinAmount, setBelowMinAmount] = useState<boolean>(false)
    const [weiPerSecond, setWeiPerSecond] = useState<string>("")
    const [minimumStreamAmountInWeiPerSecond, setMinimumStreamAmountInWeiPerSecond] = useState<any>(null)

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedIndex, setSelectedIndex] = useState(INDEX_MINUTE);
    const open = Boolean(anchorEl);
    const handleClickListItem = (event: React.MouseEvent<HTMLElement>) => { // TODO: move away from "mouse" event to "pointer"? better for mobile as well
        setAnchorEl(event.currentTarget);
    };

    const handleMenuItemClick = (
        event: React.MouseEvent<HTMLElement>,
        index: number,
    ) => {
        setSelectedIndex(index);
        setAnchorEl(null);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    useEffect(() => {
        setMinimumStreamAmountInWeiPerSecond(ethers.utils.parseEther(MINIMUM_STREAM_AMOUNT_PER_SECOND).toString())
    }, [])

    useEffect(() => {
        if (amount) {
            const minimumWeiPerSecond = toPerSecondFromPerXXX(MINIMUM_STREAM_AMOUNT_PER_MINUTE, "minute")

            let amountWeiPerSecond = 0

            switch (FROM_DENOMINATOR[selectedIndex]) {
                case FROM_DENOMINATOR[0]:
                    amountWeiPerSecond = toPerSecondFromPerXXX(amount, "second")
                    break
                case FROM_DENOMINATOR[1]:
                    amountWeiPerSecond = toPerSecondFromPerXXX(amount, "minute")
                    break
                case FROM_DENOMINATOR[2]:
                    amountWeiPerSecond = toPerSecondFromPerXXX(amount, "hour")
                    break
                case FROM_DENOMINATOR[3]:
                    amountWeiPerSecond = toPerSecondFromPerXXX(amount, "day")
                    break
                case FROM_DENOMINATOR[4]:
                    amountWeiPerSecond = toPerSecondFromPerXXX(amount, "week")
                    break
                case FROM_DENOMINATOR[5]:
                    amountWeiPerSecond = toPerSecondFromPerXXX(amount, "month")
                    break
                case FROM_DENOMINATOR[6]:
                    amountWeiPerSecond = toPerSecondFromPerXXX(amount, "year")
                    break
                default:
                    amountWeiPerSecond = 0
            }

            if (amountWeiPerSecond < minimumWeiPerSecond) { // TODO: use Yup npm package for validation?
                setBelowMinAmount(true)
            } else {
                setBelowMinAmount(false)
                setWeiPerSecond(eToNumber(amountWeiPerSecond.toString()))
            }
        }
    }, [selectedIndex, amount])

    const inputComponent = (
        <TextField
            error={ (amount !== "" && belowMinAmount) }
            sx={ { width: "100%", minWidth: 230 } }
            type="number"
            label={ `Stream amount ${ FROM_DENOMINATOR[selectedIndex] }` }
            helperText={ (amount !== "" && belowMinAmount) ? "below minimum amount" : "" }
            value={ amount } // consider for leading "0" issue: https://github.com/mui/material-ui/issues/8380#issuecomment-441436757
            onChange={ (event) => {
                const value = event.target.value
                if (value.length >= PRICE_MAX_CHARACTER + 1) return false
                setAmount(value)
            } }
        />
    )

    const decimal = 4

    const selectComponent = (
        <Box
            sx={ { width: "100%" } }
        >
            <List
                component="nav"
                aria-label="Device settings"
                sx={ { bgcolor: 'background.paper', width: "100%" } }
            >
                <ListItem
                    button
                    id="lock-button"
                    aria-haspopup="listbox"
                    aria-controls="lock-menu"
                    aria-label="when device is locked"
                    aria-expanded={ open ? 'true' : undefined }
                    onClick={ handleClickListItem }
                >

                    <ListItemText
                        primary="Select your rate"
                        secondary={ `${ amount } ${ tokenXSymbol ? tokenXSymbol : "" } ${ FROM_DENOMINATOR[selectedIndex] }` }
                    />
                    <ListItemIcon sx={ { minWidth: 0, color: "secondary.main" } }>
                        <Tooltip title="options">
                            <ArrowDropDownIcon fontSize="large" />
                        </Tooltip>
                    </ListItemIcon>
                </ListItem>
            </List>
            <Menu
                id="lock-menu"
                anchorEl={ anchorEl }
                open={ open }
                onClose={ handleClose }
                MenuListProps={ {
                    'aria-labelledby': 'lock-button',
                    role: 'listbox',
                } }
            >
                { FROM_DENOMINATOR.map((option, index) => (
                    <MenuItem
                        key={ option }
                        // disabled={ index === 0 }
                        selected={ index === selectedIndex }
                        onClick={ (event) => handleMenuItemClick(event, index) }
                    >
                        { option }
                    </MenuItem>
                )) }
            </Menu>
        </Box>
    )

    const someText = `* Minimum amount is ${ FROM_DENOMINATOR[selectedIndex] }`
    const infoComponent = (
        <Box>
            { amount !== "" && belowMinAmount && minimumStreamAmountInWeiPerSecond && tokenXSymbol &&
                <Typography color="error.main">
                    { selectedIndex === 0 && `${ someText } ${ fromPerSecondToPerXXX(minimumStreamAmountInWeiPerSecond, "second").toFixed(decimal) } ${ tokenXSymbol }` }
                    { selectedIndex === 1 && `${ someText } ${ fromPerSecondToPerXXX(minimumStreamAmountInWeiPerSecond, "minute").toFixed(decimal) } ${ tokenXSymbol }` }
                    { selectedIndex === 2 && `${ someText } ${ fromPerSecondToPerXXX(minimumStreamAmountInWeiPerSecond, "hour").toFixed(decimal) } ${ tokenXSymbol }` }
                    { selectedIndex === 3 && `${ someText } ${ fromPerSecondToPerXXX(minimumStreamAmountInWeiPerSecond, "day").toFixed(decimal) } ${ tokenXSymbol }` }
                    { selectedIndex === 4 && `${ someText } ${ fromPerSecondToPerXXX(minimumStreamAmountInWeiPerSecond, "week").toFixed(decimal) } ${ tokenXSymbol }` }
                    { selectedIndex === 5 && `${ someText } ${ fromPerSecondToPerXXX(minimumStreamAmountInWeiPerSecond, "month").toFixed(decimal) } ${ tokenXSymbol }` }
                    { selectedIndex === 6 && `${ someText } ${ fromPerSecondToPerXXX(minimumStreamAmountInWeiPerSecond, "year").toFixed(decimal) } ${ tokenXSymbol }` }
                </Typography>
            }
            { amount !== "" && !belowMinAmount &&
                <Typography>
                    { `You will receive ${ amount } ${ tokenXSymbol ? tokenXSymbol : "" } ${ FROM_DENOMINATOR[selectedIndex] } call duration for any incoming calls.` }
                </Typography>
            }
        </Box>

    )

    const action = (snackbarId: any) => (
        <>
            <Button onClick={ () => { closeSnackbar(snackbarId) } } sx={ { color: "black" } }>
                Dismiss
            </Button>
        </>
    );
    const applyComponent = (
        <StandardButton
            variant="contained"
            disabled={ belowMinAmount || amount === "" }
            onClick={ async () => {
                await updateDoc(doc(COL_REF_USERS, firebaseUser?.uid), {
                    flowRate: weiPerSecond
                })
                setAmount("")
                enqueueSnackbar("Rate applied", { variant: 'info', autoHideDuration: 2000, action })
            } }
        >
            apply
        </StandardButton>
    )

    return (
        <Card
            variant="outlined"
            sx={ { width: "100%" } }
        >
            <CardHeader
                title="Set rate"
                sx={ {
                    "&:last-child": {
                        paddingLeft: 24
                    }
                } }
            />
            <CardContent>
                { isMobile ? (
                    <Stack
                        direction="column"
                        justifyContent="center"
                        alignItems="center"
                    >
                        { inputComponent }
                        { selectComponent }
                        { infoComponent }
                        <Stack
                            direction="row"
                            justifyContent="flex-end"
                            alignItems="center"
                            sx={ { width: "100%" } }
                        >
                            { applyComponent }
                        </Stack>
                    </Stack>
                ) : (
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <Stack
                            direction="column"
                            justifyContent="flex-start"
                            alignItems="flex-start"
                        >
                            <Stack
                                direction="row"
                                justifyContent="flex-start"
                                alignItems="center"
                            >
                                { inputComponent }
                                { selectComponent }
                            </Stack>
                            { infoComponent }
                        </Stack>
                        { applyComponent }
                    </Stack>
                ) }
            </CardContent>
        </Card>
    )
}
