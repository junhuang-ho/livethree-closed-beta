import { useState } from "react";

import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Stack from "@mui/material/Stack"
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import { IconGas } from './IconGas';

import { StandardButton, StyledGasBadge } from "./utils";

import { ethers } from "ethers";

import { useWeb3Auth } from "../contexts/Web3Auth";
import { useSuperfluidGas } from "../contexts/SuperfluidGas";
import { useSnackbar } from 'notistack';

import { CHAIN_ID_POLYGON } from "../configs/blockchain/web3auth";
import { MATIC_SYMBOL } from "../configs/blockchain/superfluid";
import { GLOBAL_MAX_CHARACTER_NUMBER } from "../configs/general";
import { DialogHasNetFlow } from "./dialogs/DialogHasNetFlow";


const INPUT_TYPE = "number"
const LABEL = "send amount"
const ERROR_ZERO_AMOUNT = "Cannot be 0 amount"
const INSUFFICIENT_BALANCE = "Insufficient balance"

export const SendToken = () => {
    const [nativeAmount, setNativeAmount] = useState<string>("")
    const [tokenAmount, setTokenAmount] = useState<string>("")
    const [tokenXAmount, setTokenXAmount] = useState<string>("")
    const [recipientAddress, setRecipientAddress] = useState<string>("")
    const [isAddress, setIsAddress] = useState<boolean>(false)
    const [isSend, setIsSend] = useState<boolean>(false)
    const [isProcessing, setIsProcessing] = useState<boolean>(false)
    const [openMenu, setOpenMenu] = useState<boolean>(false)
    const [selectedToken, setSelectedToken] = useState(MATIC_SYMBOL)
    const [isOpenNetFlowModal, setIsOpenNetFlowModal] = useState<boolean>(false)

    const { chainId, address: localAddress, nativeCoinBalance } = useWeb3Auth()
    const {
        tokenSymbol, tokenXSymbol, transferNative, transferToken, transferTokenX,
        tokenBalance, tokenXBalance, getNetFlowTokenX, isTransactionPending,
    } = useSuperfluidGas()
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
                title="Send tokens"
                sx={ {
                    "&:last-child": {
                        paddingLeft: 24
                    }
                } }
            />
            <CardContent>
                <Stack spacing={ 1 }>
                    { isSend ? (
                        <Box>
                            <Typography>
                                You are about to send
                                { selectedToken === MATIC_SYMBOL && ` ${ nativeAmount } ${ MATIC_SYMBOL } ` }
                                { selectedToken === tokenSymbol && ` ${ tokenAmount } ${ tokenSymbol } ` }
                                { selectedToken === tokenXSymbol && ` ${ tokenXAmount } ${ tokenXSymbol } ` }
                                to { recipientAddress }
                            </Typography>
                            <Box sx={ { p: 8.5 } }></Box>
                        </Box>
                    ) : (
                        <Stack
                            spacing={ 1 }
                        >
                            <TextField
                                fullWidth
                                label="recipient address"
                                value={ recipientAddress }
                                onChange={ (event) => {
                                    const value = event.target.value
                                    setIsAddress(ethers.utils.isAddress(value))
                                    setRecipientAddress(value)
                                } }
                                // disabled={  }
                                error={ recipientAddress !== "" && !isAddress || recipientAddress === localAddress }
                                helperText={ recipientAddress !== "" && !isAddress && 'Please enter a valid address' || recipientAddress === localAddress && "Recipient address cannot be the same as this account's address" }
                            />

                            <FormControl fullWidth>
                                <InputLabel id="menu">Select Token</InputLabel>
                                <Select
                                    open={ openMenu }
                                    onClose={ () => {
                                        setOpenMenu(false)
                                    } }
                                    onOpen={ () => {
                                        setOpenMenu(true)
                                    } }
                                    value={ selectedToken }
                                    labelId="menu"
                                    label="Select Token"
                                    onChange={ (event: any) => {
                                        const value = event.target.value
                                        setNativeAmount("")
                                        setTokenAmount("")
                                        setTokenXAmount("")
                                        setSelectedToken(value)
                                    } }
                                >
                                    <MenuItem value={ MATIC_SYMBOL }>{ MATIC_SYMBOL }</MenuItem>
                                    <MenuItem value={ tokenSymbol }>{ tokenSymbol }</MenuItem>
                                    <MenuItem value={ tokenXSymbol }>{ tokenXSymbol }</MenuItem>
                                </Select>
                            </FormControl>

                            { selectedToken === MATIC_SYMBOL &&
                                <TextField
                                    fullWidth
                                    type={ INPUT_TYPE }
                                    label={ LABEL }
                                    value={ nativeAmount }
                                    onChange={ (event) => {
                                        const value = event.target.value
                                        if (value.length >= GLOBAL_MAX_CHARACTER_NUMBER + 1) return false
                                        setNativeAmount(value)
                                    } }
                                    InputProps={ {
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                { MATIC_SYMBOL }
                                            </InputAdornment>
                                        ),
                                    } }
                                    error={ (!!nativeAmount && Number(nativeAmount) === 0) || (!!nativeCoinBalance && !!nativeAmount && nativeCoinBalance.lt(ethers.utils.parseEther(nativeAmount))) }
                                    helperText={
                                        (!!nativeAmount && Number(nativeAmount) === 0) && ERROR_ZERO_AMOUNT
                                        || (!!nativeCoinBalance && !!nativeAmount && nativeCoinBalance.lt(ethers.utils.parseEther(nativeAmount))) && INSUFFICIENT_BALANCE
                                        || selectedToken === MATIC_SYMBOL && "* Max feature unavailable for MATIC"
                                    }
                                // disabled={ }
                                />
                            }

                            { selectedToken === tokenSymbol &&
                                <TextField
                                    fullWidth
                                    type={ INPUT_TYPE }
                                    label={ LABEL }
                                    value={ tokenAmount }
                                    onChange={ (event) => {
                                        const value = event.target.value
                                        if (value.length >= GLOBAL_MAX_CHARACTER_NUMBER + 1) return false
                                        setTokenAmount(value)
                                    } }
                                    InputProps={ {
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                { tokenSymbol }
                                            </InputAdornment>
                                        ),
                                    } }
                                    error={ (!!tokenAmount && Number(tokenAmount) === 0) || (chainId === CHAIN_ID_POLYGON ? (!!tokenBalance && !!tokenAmount && ethers.BigNumber.from(tokenBalance).lt(ethers.utils.parseUnits(tokenAmount, 6))) : (!!tokenBalance && !!tokenAmount && ethers.BigNumber.from(tokenBalance).lt(ethers.utils.parseEther(tokenAmount)))) }
                                    helperText={ (!!tokenAmount && Number(tokenAmount) === 0) && ERROR_ZERO_AMOUNT || (chainId === CHAIN_ID_POLYGON ? (!!tokenBalance && !!tokenAmount && ethers.BigNumber.from(tokenBalance).lt(ethers.utils.parseUnits(tokenAmount, 6))) : (!!tokenBalance && !!tokenAmount && ethers.BigNumber.from(tokenBalance).lt(ethers.utils.parseEther(tokenAmount)))) && INSUFFICIENT_BALANCE }
                                // disabled={  }
                                />
                            }

                            { selectedToken === tokenXSymbol &&
                                <TextField
                                    fullWidth
                                    type={ INPUT_TYPE }
                                    label={ LABEL }
                                    value={ tokenXAmount }
                                    onChange={ (event) => {
                                        const value = event.target.value
                                        if (value.length >= GLOBAL_MAX_CHARACTER_NUMBER + 1) return false
                                        setTokenXAmount(value)
                                    } }
                                    InputProps={ {
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                { tokenXSymbol }
                                            </InputAdornment>
                                        ),
                                    } }
                                    error={ (!!tokenXAmount && Number(tokenXAmount) === 0) || (!!tokenXBalance && !!tokenXAmount && ethers.BigNumber.from(tokenXBalance).lt(ethers.utils.parseEther(tokenXAmount))) }
                                    helperText={ (!!tokenXAmount && Number(tokenXAmount) === 0) && ERROR_ZERO_AMOUNT || (!!tokenXBalance && !!tokenXAmount && ethers.BigNumber.from(tokenXBalance).lt(ethers.utils.parseEther(tokenXAmount))) && INSUFFICIENT_BALANCE }
                                // disabled={  }
                                />
                            }
                        </Stack>
                    ) }

                    <Stack
                        direction="row"
                        justifyContent="flex-end"
                        alignItems="center"
                    >
                        { isSend ? (
                            <Box>
                                <StandardButton
                                    variant="contained"
                                    disabled={ isProcessing }
                                    onClick={ () => {
                                        setIsProcessing(true)
                                        setIsSend(false)
                                        setNativeAmount("")
                                        setTokenAmount("")
                                        setTokenXAmount("")
                                        setIsProcessing(false)
                                    } }
                                >
                                    cancel
                                </StandardButton >
                                <StyledGasBadge badgeContent={ <IconGas /> }>
                                    <StandardButton
                                        variant="contained"
                                        disabled={ isProcessing || isTransactionPending }
                                        onClick={ async () => {
                                            try {
                                                setIsProcessing(true)

                                                try {
                                                    if (selectedToken === MATIC_SYMBOL) {
                                                        const nativeAmountWei = ethers.utils.parseEther(nativeAmount).toString()
                                                        transferNative(recipientAddress, nativeAmountWei)
                                                    } else if (selectedToken === tokenSymbol) {
                                                        let tokenAmountWei
                                                        if (chainId === CHAIN_ID_POLYGON) {
                                                            tokenAmountWei = ethers.utils.parseUnits(tokenAmount, 6).toString()
                                                        } else {
                                                            tokenAmountWei = ethers.utils.parseEther(tokenAmount).toString()
                                                        }

                                                        transferToken(recipientAddress, tokenAmountWei)
                                                    } else if (selectedToken === tokenXSymbol) {
                                                        const tokenXAmountWei = ethers.utils.parseEther(tokenXAmount).toString()
                                                        transferTokenX(recipientAddress, tokenXAmountWei)
                                                    }
                                                } catch (error: any) {
                                                    enqueueSnackbar("Something went wrong! Please try again later. - Send tokens", { variant: 'error', autoHideDuration: 3000, action })
                                                    console.error(error)
                                                }

                                                setIsSend(false)
                                                setNativeAmount("")
                                                setTokenAmount("")
                                                setTokenXAmount("")
                                                setRecipientAddress("")
                                                setIsProcessing(false)
                                            } catch (error: any) {
                                                console.error(error)
                                            }
                                        } }
                                    >
                                        send
                                    </StandardButton >
                                </StyledGasBadge>
                            </Box>
                        ) : (
                            <Box>
                                <StandardButton
                                    variant="contained"
                                    disabled={ isProcessing || !nativeCoinBalance || !tokenBalance || !tokenXBalance || selectedToken === MATIC_SYMBOL }
                                    onClick={ () => {
                                        // if (selectedToken === MATIC_SYMBOL) {
                                        //     setNativeAmount(ethers.utils.formatEther(nativeCoinBalance.toString()))
                                        // } 

                                        if (selectedToken === tokenSymbol) {
                                            if (chainId === CHAIN_ID_POLYGON) {
                                                setTokenAmount(ethers.utils.formatUnits(ethers.BigNumber.from(tokenBalance), 6))
                                            } else {
                                                setTokenAmount(ethers.utils.formatEther(tokenBalance))
                                            }
                                        } else if (selectedToken === tokenXSymbol) {
                                            setTokenXAmount(ethers.utils.formatEther(tokenXBalance))
                                        }
                                    } }
                                >
                                    max
                                </StandardButton >
                                <StandardButton
                                    variant="contained"
                                    disabled={
                                        (nativeAmount && Number(nativeAmount) === 0)
                                        || (tokenAmount && Number(tokenAmount) === 0)
                                        || (tokenXAmount && Number(tokenXAmount) === 0)
                                        || (nativeCoinBalance && nativeAmount && nativeCoinBalance.lt(ethers.utils.parseEther(nativeAmount)))
                                        || (tokenBalance && tokenAmount && (chainId === CHAIN_ID_POLYGON ? (ethers.BigNumber.from(tokenBalance).lt(ethers.utils.parseUnits(tokenAmount, 6))) : (ethers.BigNumber.from(tokenBalance).lt(ethers.utils.parseEther(tokenAmount)))))
                                        || (tokenXBalance && tokenXAmount && ethers.BigNumber.from(tokenXBalance).lt(ethers.utils.parseEther(tokenXAmount)))
                                        || recipientAddress === ""
                                        || !isAddress
                                        || recipientAddress === localAddress
                                        || (selectedToken === MATIC_SYMBOL && nativeAmount === "")
                                        || (selectedToken === tokenSymbol && tokenAmount === "")
                                        || (selectedToken === tokenXSymbol && tokenXAmount === "")
                                    }
                                    onClick={ async () => {
                                        const netFlow = (await getNetFlowTokenX()).toString()
                                        if (netFlow === "0") {
                                            setIsSend(true)
                                        } else {
                                            setIsOpenNetFlowModal(true)
                                        }
                                    } }
                                >
                                    next
                                </StandardButton >
                            </Box>
                        ) }
                    </Stack>
                </Stack>
            </CardContent>
            <DialogHasNetFlow open={ isOpenNetFlowModal } setOpen={ setIsOpenNetFlowModal } />
        </Card >
    )
}
