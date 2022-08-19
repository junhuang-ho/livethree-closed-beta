import { useState } from "react";

import { useWeb3Auth } from "../contexts/Web3Auth"

import Box from '@mui/material/Box';
import Stack from "@mui/material/Stack"
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

import { StandardButton } from "./utils";

import { DialogExposeSecrets } from "./dialogs/DialogExposeSecrets";

export const ExposeSecrets = () => {
    const { web3AuthInstance } = useWeb3Auth()

    const [privateKey, setPrivateKey] = useState<string | null | unknown>(null)
    const [open, setOpen] = useState<boolean>(false)

    return (
        <Card
            variant="outlined"
            sx={ { width: "100%" } }
        >
            <CardHeader
                title="Reveal Private Key"
                sx={ {
                    "&:last-child": {
                        paddingLeft: 24
                    }
                } }
            />
            <CardContent>
                <Typography align="justify">
                    Private key allows you to store your funds on a wallet other than in your LiveThree account.
                    This is useful to act as a backup so that you can have access to your funds by other means.
                    Note that this is <Box component="span" fontWeight='fontWeightMedium' display='inline'>not </Box>
                    the same as transferring your funds to another wallet address.
                </Typography>
                <Box sx={ { p: 1 } }></Box>
                <Stack
                    direction="row"
                    justifyContent="flex-end"
                    alignItems="center"
                >
                    <StandardButton
                        variant="contained"
                        disabled={ !web3AuthInstance }
                        onClick={ async () => {
                            const privateKey = await web3AuthInstance?.provider?.request({
                                method: "eth_private_key"
                            });
                            setPrivateKey(privateKey)
                            setOpen(true)
                        } }
                    >
                        reveal
                    </StandardButton >
                </Stack>
            </CardContent>
            <DialogExposeSecrets open={ open } setOpen={ setOpen } privateKey={ privateKey } />
        </Card >
    )
}
