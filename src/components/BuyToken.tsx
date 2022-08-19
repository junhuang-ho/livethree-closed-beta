import Typography from "@mui/material/Typography"
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

import { ButtonCopy } from "./ButtonCopy";

import { useWeb3Auth } from "../contexts/Web3Auth";
import { useResponsive } from "../hooks/useResponsive";

import { shortenAddress } from "../utils";

import rampIcon from '../assets/rampServices/ramp-network-icon-1.svg'
import moonpayIcon from '../assets/rampServices/moonpay-icon.svg'
import transakIcon from '../assets/rampServices/transak-icon.png'
import simplexIcon from '../assets/rampServices/simplex-icon.png'

export const BuyToken = () => {
    const isMobile = useResponsive('down', 'sm');

    const { address: localAddress } = useWeb3Auth()

    return (
        <Card
            variant="outlined"
            sx={ { width: "100%" } }
        >
            <CardHeader
                title="Buy tokens"
                sx={ {
                    "&:last-child": {
                        paddingLeft: 24
                    }
                } }
            />
            <CardContent>
                <Stack spacing={ 1 }>
                    <Typography align="justify">
                        Select from a range of third party providers to buy MATIC or USDC in
                        order to top-up your LiveThree account. Please select the MATIC and USDC
                        tokens that are on the <Box component="span" fontWeight='fontWeightMedium' display='inline'>Polygon network </Box>
                        only.
                    </Typography>
                    <Typography align="justify">
                        Remember to send your funds to use your LiveThree account address:
                    </Typography>
                    <Stack
                        direction="row"
                        justifyContent="center"
                        alignItems="center"
                    >
                        <Typography align="justify">
                            { isMobile ? shortenAddress(localAddress) : localAddress }
                        </Typography>
                        <ButtonCopy value={ localAddress } />
                    </Stack>
                    <Box sx={ { p: 1 } }></Box>
                    <Typography align="justify">
                        Third party providers:
                    </Typography>
                    <Stack
                        direction={ isMobile ? "column" : "row" }
                        justifyContent="center"
                        alignItems="center"
                        spacing={ 2 }
                    >
                        <Button
                            onClick={ () => {
                                window.open("https://buy.ramp.network/");
                            } }
                        >
                            <img src={ rampIcon } />
                        </Button>
                        <Button
                            onClick={ () => {
                                window.open("https://www.moonpay.com/buy")
                            } }
                        >
                            <img src={ moonpayIcon } style={ { width: '155px' } } />
                        </Button>
                        <Button
                            onClick={ () => {
                                window.open("https://global.transak.com/?utm_campaign=Website%20Conversions&utm_source=homePage&utm_medium=menu&utm_term=buy-crypto")
                            } }
                        >
                            <img src={ transakIcon } style={ { width: '150px' } } />
                        </Button>
                        <Button
                            onClick={ () => {
                                window.open("https://buy-crypto.chainbits.com/")
                            } }
                        >
                            <img src={ simplexIcon } style={ { width: '150px' } } />
                        </Button>
                    </Stack>
                </Stack>
            </CardContent>
        </Card >
    )
}
