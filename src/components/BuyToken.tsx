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
                        Please follow the instructions below to ensure you top-up your LiveThree account
                        with MATIC or USDC correctly.
                    </Typography>
                    <Box sx={ { pl: 2, py: 2 } }>
                        <ol>
                            <li>
                                Select from a range of third party providers to buy MATIC or USDC.
                                KYC verification is required. Please select the MATIC or USDC
                                tokens that are on the <Box component="span" fontWeight='fontWeightMedium' display='inline'>Polygon network </Box>
                                only.
                            </li>
                            <Typography align="justify" sx={ { pt: 2 } }>
                                Third party providers:
                            </Typography>
                            <Stack
                                direction={ isMobile ? "column" : "row" }
                                justifyContent="center"
                                alignItems="center"
                                spacing={ 2 }
                                sx={ { py: 2 } }
                            >
                                <Button
                                    onClick={ () => {
                                        window.open("https://www.moonpay.com/buy", '_blank', 'noopener')
                                    } }
                                >
                                    <img src={ moonpayIcon } style={ { width: '155px' } } />
                                </Button>
                                <Button
                                    onClick={ () => {
                                        window.open("https://global.transak.com/?utm_campaign=Website%20Conversions&utm_source=homePage&utm_medium=menu&utm_term=buy-crypto", '_blank', 'noopener')
                                    } }
                                >
                                    <img src={ transakIcon } style={ { width: '150px' } } />
                                </Button>
                                <Button
                                    onClick={ () => {
                                        window.open("https://buy-crypto.chainbits.com/", '_blank', 'noopener')
                                    } }
                                >
                                    <img src={ simplexIcon } style={ { width: '150px' } } />
                                </Button>
                                <Button
                                    onClick={ () => {
                                        window.open("https://ramp.network/buy/", '_blank', 'noopener');
                                    } }
                                >
                                    <img src={ rampIcon } />
                                </Button>
                            </Stack>
                            <li>
                                When prompt to input your address, please input the address of your
                                existing MetaMask wallet (or equivalent external wallet that you trust).
                                <Box component="span" fontWeight='fontWeightMedium' display='inline'> Do not </Box>
                                input your LiveThree address here.
                            </li>
                            <li>
                                Once you have received your MATIC or USDC in your external wallet, you can now send them
                                to your LiveThree address.
                            </li>
                            <Typography align="justify" sx={ { pt: 2 } }>
                                Your LiveThree account address:
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
                            <li>
                                That's it! If you send over some USDC, you can now wrap it to USDCx to start using it
                                in money streaming video calls.
                            </li>
                        </ol>
                        <Typography align="justify" variant="body2" sx={ { pt: 2 } }>
                            *We are working hard to allow you to buy directly into your LiveThree address. In the meantime,
                            please follow the instructions above.
                        </Typography>
                    </Box>
                </Stack>
            </CardContent>
        </Card >
    )
}
