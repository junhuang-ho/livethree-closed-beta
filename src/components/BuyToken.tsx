import Typography from "@mui/material/Typography"
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';

import { ButtonCopy } from "./ButtonCopy";

import { useWeb3Auth } from "../contexts/Web3Auth";
import { useResponsive } from "../hooks/useResponsive";

import { shortenAddress } from "../utils";

export const BuyToken = () => {
    const isMobile = useResponsive('down', 'sm');

    const { address: localAddress } = useWeb3Auth()

    return (
        <Card
            variant="outlined"
            sx={ { width: "100%" } }
        >
            <CardHeader
                title="Buy tokens - coming soon"
                sx={ {
                    "&:last-child": {
                        paddingLeft: 24
                    }
                } }
            />
            <CardContent>
                <Stack spacing={ 1 }>
                    <Typography align="justify">
                        Soon, you will be able to buy tokens using fiat currency from third party vendors from the LiveThree platform.
                        In the meantime, please top-up your account with MATIC or USDC/USDCx by sending funds to your account's address.
                    </Typography>
                    <Stack
                        direction="row"
                        justifyContent="center"
                        alignItems="center"
                    >
                        <Typography>
                            { isMobile ? shortenAddress(localAddress) : localAddress }
                        </Typography>
                        <ButtonCopy value={ localAddress } />
                    </Stack>
                </Stack>
            </CardContent>
        </Card >
    )
}
