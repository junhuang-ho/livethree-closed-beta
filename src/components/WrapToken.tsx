import { useState } from "react";

import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Stack from "@mui/material/Stack"
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment'
import { IconGas } from './IconGas';

import { StandardButton, StyledGasBadge } from "./utils";

import { ethers } from "ethers";

import { useSuperfluidGas } from "../contexts/SuperfluidGas";
import { useWeb3Auth } from "../contexts/Web3Auth";
import { useSnackbar } from 'notistack';

import { GLOBAL_MAX_CHARACTER_NUMBER } from "../configs/general";
import { CHAIN_ID_POLYGON } from "../configs/blockchain/web3auth";

const ERROR_ZERO_AMOUNT = "Cannot be 0 amount"
const INSUFFICIENT_BALANCE = "Insufficient balance"

export const WrapToken = () => {
    const [toggled, toggle] = useState<boolean>(false)
    const [wrapAmount, setWrapAmount] = useState<string>("")
    const [unwrapAmount, setUnwrapAmount] = useState<string>("")
    const [isProcessing, setIsProcessing] = useState<boolean>(false)

    const {
        tokenAllowance, tokenSymbol, tokenXSymbol, tokenBalance,
        tokenXBalance, approveToken, upgradeToken, downgradeTokenX,
        // isTransactionPending 
    } = useSuperfluidGas()
    const { chainId } = useWeb3Auth()

    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const action = (snackbarId: any) => (
        <>
            <Button onClick={ () => { closeSnackbar(snackbarId) } } sx={ { color: "black" } }>
                Dismiss
            </Button>
        </>
    );

    return (
        <Card
            variant="outlined"
            sx={ { width: "100%" } }
        >
            <CardHeader
                title="Token wrapping"
                sx={ {
                    "&:last-child": {
                        paddingLeft: 24
                    }
                } }
            />
            <CardContent>
                <Stack spacing={ 1 }>
                    <Typography align="justify">
                        Token wrapping is the process of converting your { tokenSymbol ? tokenSymbol : "" } to { tokenXSymbol ? tokenXSymbol : "" } (wrap),
                        or  { tokenXSymbol ? tokenXSymbol : "" } to { tokenSymbol ? tokenSymbol : "" } (unwrap).
                        { ` ${ tokenXSymbol ? tokenXSymbol : "" }` } is the token required to allow money streaming together with your video call.
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={ 1 }>
                        <StandardButton
                            variant={ !toggled ? 'contained' : 'outlined' }
                            disabled={ isProcessing }
                            onClick={ () => {
                                toggle(false)
                                setWrapAmount("")
                                setUnwrapAmount("")
                            } }
                        >
                            wrap
                        </StandardButton >
                        <StandardButton
                            variant={ toggled ? 'contained' : 'outlined' }
                            disabled={ isProcessing }
                            onClick={ () => {
                                toggle(true)
                                setWrapAmount("")
                                setUnwrapAmount("")
                            } }
                        >
                            unwrap
                        </StandardButton >
                    </Stack>
                    { !toggled ? (
                        <Stack spacing={ 1 }>
                            <Typography align="justify">
                                Token wrapping is a two step process. You are now in:
                            </Typography>
                            { tokenAllowance === "0" ? (
                                <Stack spacing={ 1 }>
                                    <Typography align="justify">
                                        <Box component="span" fontWeight='fontWeightMedium' display='inline'>Step 1 </Box>
                                        - You currently have { tokenAllowance } amount of { tokenSymbol ? tokenSymbol : "" } approved.
                                        Start by approving the amount of { tokenSymbol ? tokenSymbol : "" } you would like to wrap into { tokenXSymbol ? tokenXSymbol : "" }.
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        label="wrap amount"
                                        value={ wrapAmount }
                                        onChange={ (event) => {
                                            const value = event.target.value
                                            if (value.length >= GLOBAL_MAX_CHARACTER_NUMBER + 1) return false
                                            setWrapAmount(value)
                                        } }
                                        InputProps={ {
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    { tokenSymbol }
                                                </InputAdornment>
                                            ),
                                        } }
                                        error={ (!!wrapAmount && Number(wrapAmount) === 0) || (chainId === CHAIN_ID_POLYGON ? (!!tokenBalance && !!wrapAmount && ethers.BigNumber.from(tokenBalance).lt(ethers.utils.parseUnits(wrapAmount, 6))) : (!!tokenBalance && !!wrapAmount && ethers.BigNumber.from(tokenBalance).lt(ethers.utils.parseEther(wrapAmount)))) }
                                        helperText={ (!!wrapAmount && Number(wrapAmount) === 0) && ERROR_ZERO_AMOUNT || (chainId === CHAIN_ID_POLYGON ? (!!tokenBalance && !!wrapAmount && ethers.BigNumber.from(tokenBalance).lt(ethers.utils.parseUnits(wrapAmount, 6))) : (!!tokenBalance && !!wrapAmount && ethers.BigNumber.from(tokenBalance).lt(ethers.utils.parseEther(wrapAmount)))) && INSUFFICIENT_BALANCE }
                                    // disabled={  }
                                    />
                                </Stack>
                            ) : (
                                <Stack spacing={ 1 }>
                                    <Typography align="justify">
                                        <Box component="span" fontWeight='fontWeightMedium' display='inline'>Step 2 </Box>
                                        - You currently have { tokenAllowance ? (chainId === CHAIN_ID_POLYGON ? ethers.utils.formatUnits(tokenAllowance, 6) : ethers.utils.formatEther(tokenAllowance)) : "" } amount of { tokenSymbol ? tokenSymbol : "" } approved
                                        and ready to be wrapped. You can wrap it now.
                                    </Typography>
                                </Stack>
                            ) }
                        </Stack>

                    ) : (
                        <Stack spacing={ 1 }>
                            <Typography align="justify">
                                Token unwrapping is a one step process.
                            </Typography>
                            <TextField
                                fullWidth
                                type="number"
                                label="unwrap amount"
                                value={ unwrapAmount }
                                onChange={ (event) => {
                                    const value = event.target.value
                                    if (value.length >= GLOBAL_MAX_CHARACTER_NUMBER + 1) return false
                                    setUnwrapAmount(value)
                                } }
                                InputProps={ {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            { tokenXSymbol }
                                        </InputAdornment>
                                    ),
                                } }
                                error={ (!!unwrapAmount && Number(unwrapAmount) === 0) || (!!tokenXBalance && !!unwrapAmount && ethers.BigNumber.from(tokenXBalance).lt(ethers.utils.parseEther(unwrapAmount))) }
                                helperText={ (!!unwrapAmount && Number(unwrapAmount) === 0) && ERROR_ZERO_AMOUNT || (!!tokenXBalance && !!unwrapAmount && ethers.BigNumber.from(tokenXBalance).lt(ethers.utils.parseEther(unwrapAmount))) && INSUFFICIENT_BALANCE }
                            // disabled={  }
                            />
                        </Stack>
                    ) }
                    <Stack
                        direction="row"
                        justifyContent="flex-end"
                        alignItems="center"
                    >
                        <StandardButton
                            variant="contained"
                            disabled={ isProcessing || !tokenBalance || !tokenXBalance || tokenAllowance !== "0" }
                            onClick={ () => {
                                if (!toggled) {
                                    if (chainId === CHAIN_ID_POLYGON) {
                                        setWrapAmount(ethers.utils.formatUnits(tokenBalance, 6))
                                    } else {
                                        setWrapAmount(ethers.utils.formatEther(tokenBalance))
                                    }

                                } else {
                                    setUnwrapAmount(ethers.utils.formatEther(tokenXBalance))
                                }
                            } }
                        >
                            max
                        </StandardButton >
                        <StyledGasBadge badgeContent={ <IconGas /> }>
                            <StandardButton
                                variant="contained"
                                disabled={
                                    isProcessing ||
                                    (!toggled ?
                                        (tokenAllowance === "0" ? (
                                            !wrapAmount
                                            || Number(wrapAmount) === 0
                                            || (chainId === CHAIN_ID_POLYGON ? (tokenBalance && wrapAmount && ethers.BigNumber.from(tokenBalance).lt(ethers.utils.parseUnits(wrapAmount, 6))) : (tokenBalance && wrapAmount && ethers.BigNumber.from(tokenBalance).lt(ethers.utils.parseEther(wrapAmount))))
                                        ) : (
                                            false
                                        )) : (
                                            !unwrapAmount
                                            || Number(unwrapAmount) === 0
                                            || (tokenXBalance && unwrapAmount && ethers.BigNumber.from(tokenXBalance).lt(ethers.utils.parseEther(unwrapAmount)))
                                        )
                                    )
                                }
                                onClick={ async () => {
                                    setIsProcessing(true)

                                    if (!toggled) {
                                        try {
                                            if (tokenAllowance === "0") {
                                                if (chainId === CHAIN_ID_POLYGON) {
                                                    await approveToken(ethers.utils.parseUnits(wrapAmount, 6).toString())
                                                } else {
                                                    await approveToken(ethers.utils.parseEther(wrapAmount).toString())
                                                }
                                            } else {
                                                if (chainId === CHAIN_ID_POLYGON) {
                                                    await upgradeToken(ethers.utils.parseUnits(tokenAllowance, 12).toString())
                                                } else {
                                                    await upgradeToken(tokenAllowance)
                                                }

                                            }
                                        } catch (error: any) {
                                            enqueueSnackbar("Something went wrong! Please try again later. - Token wrapping", { variant: 'error', autoHideDuration: 3000, action })
                                            console.error(error)
                                        }
                                    } else {
                                        await downgradeTokenX(ethers.utils.parseEther(unwrapAmount).toString())
                                    }
                                    setWrapAmount("")
                                    setUnwrapAmount("")

                                    setIsProcessing(false)
                                } }
                            >
                                { !toggled ? (tokenAllowance === "0" ? 'approve' : 'wrap') : 'unwrap' }
                            </StandardButton >
                        </StyledGasBadge>
                    </Stack>
                </Stack>
            </CardContent>
        </Card >
    )
}
