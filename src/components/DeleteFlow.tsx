import { useState, useEffect } from "react";

import Typography from "@mui/material/Typography"
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { IconGas } from './IconGas';

import { StandardButton, StyledGasBadge } from "./utils";

import { ethers } from "ethers";

import { useWeb3Auth } from "../contexts/Web3Auth";
import { useSuperfluidGas } from "../contexts/SuperfluidGas";
import { useSnackbar } from 'notistack';

export const DeleteFlow = () => {

    const [inputAddress, setInputAddress] = useState<string>("")
    const [isAddress, setIsAddress] = useState<boolean>(false)

    const [deletingFlow, setDeletingFlow] = useState<boolean>(false)

    const { address: localAddress } = useWeb3Auth()
    const { netFlow, deleteFlow } = useSuperfluidGas()
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
                title="Delete outgoing stream (advance)"
                sx={ {
                    "&:last-child": {
                        paddingLeft: 24
                    }
                } }
            />
            <CardContent>
                <Stack spacing={ 1 }>
                    { netFlow === "0" ? (
                        <Typography>
                            There are no open streams.
                        </Typography>
                    ) : (
                        <Stack spacing={ 1 }>
                            <Typography>
                                There are open streams.
                            </Typography>
                            <TextField
                                fullWidth
                                label="end stream with address (only works if you are sender of stream)"
                                value={ inputAddress }
                                onChange={ (event) => {
                                    const value = event.target.value
                                    setIsAddress(ethers.utils.isAddress(value))
                                    setInputAddress(value)
                                } }
                                // disabled={  }
                                error={ inputAddress !== "" && !isAddress || inputAddress === localAddress }
                                helperText={
                                    inputAddress !== "" && !isAddress && 'Please enter a valid address'
                                    || inputAddress === localAddress && "Address cannot be the same as this account's address"

                                }
                                disabled={ deletingFlow || netFlow === "0" }
                            />
                            <Stack
                                direction="row"
                                justifyContent="flex-end"
                                alignItems="center"
                            >
                                <StyledGasBadge badgeContent={ <IconGas /> }>
                                    <StandardButton
                                        variant="contained"
                                        disabled={ deletingFlow || inputAddress === "" || !isAddress || inputAddress === localAddress }
                                        onClick={ async () => {
                                            setDeletingFlow(true)
                                            try {
                                                await deleteFlow(localAddress, inputAddress)
                                            } catch (error: any) {
                                                const ERROR_REASON = "execution reverted: CFA: flow does not exist"

                                                if (error.reason === ERROR_REASON) {
                                                    enqueueSnackbar(`No flow exists with address: ${ inputAddress }`, { variant: 'info', autoHideDuration: 3000, action })
                                                } else {
                                                    enqueueSnackbar("Something went wrong! Please try again later. - Delete flow (settings)", { variant: 'error', autoHideDuration: 3000, action })
                                                    console.error(error)
                                                }
                                            }

                                            setInputAddress("")
                                            setDeletingFlow(false)
                                        } }
                                    >
                                        delete
                                    </StandardButton >
                                </StyledGasBadge>
                            </Stack>
                        </Stack>
                    ) }
                </Stack>
            </CardContent>
        </Card >
    )
}
