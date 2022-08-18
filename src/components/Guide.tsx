import { useState } from 'react';

import Fab from '@mui/material/Fab';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import { IconGas } from './IconGas';

import { IconButton, StyledGasBadgeMini2 } from "./utils";
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import CallEndIcon from '@mui/icons-material/CallEnd';

import { useSuperfluidGas } from '../contexts/SuperfluidGas';
import { useResponsive } from '../hooks/useResponsive';

import { PERCENTAGE_TAKE_NUMERATOR } from '../configs/blockchain/admin';
import { END_CALL_BUFFER_SECONDS } from '../configs/general';

export const Guide = () => {
    const isMobile = useResponsive('down', 'sm');

    const { tokenSymbol, tokenXSymbol } = useSuperfluidGas()

    const [isOpen, setIsOpen] = useState<boolean>(false)

    return (
        <Box
            sx={ isMobile ? {
                position: "fixed",
                bottom: (theme) => theme.spacing(8),
                right: (theme) => theme.spacing(2)
            } : {
                position: "fixed",
                bottom: (theme) => theme.spacing(3),
                right: (theme) => theme.spacing(48)
            } }
        >
            <Tooltip title="Getting Started">
                <Fab
                    color="primary"
                    onClick={ () => {
                        setIsOpen(true)
                        console.log("open guide")
                    } }
                >
                    <AutoStoriesIcon />
                </Fab>
            </Tooltip>
            <Dialog
                disableEscapeKeyDown
                open={ isOpen }
                onClose={ () => {
                    setIsOpen(false)
                } }
            >
                <DialogTitle id="responsive-dialog-title" align="center" variant="h2">
                    { "Getting Started" }
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={ 2 }>
                        <Stack spacing={ 1 }>
                            <DialogContentText align="justify" variant="h4">
                                What is LiveThree?
                            </DialogContentText>
                            <DialogContentText align="justify" variant="body2">
                                LiveThree is a platform for money streaming video calls. LiveThree provides
                                a new way of supporting creators and pay for only what you get from services.
                                No more upfront payments or monthly subscriptions.
                            </DialogContentText>
                            <DialogContentText align="justify" variant="body2">
                                Money is streamed to the recipient of the video call every second in exchange
                                for the value and time they give through the video calls. The caller can end
                                the video call at any time, and when it does, the money stream ends as well.
                                This ensures that the caller only pays for what they get.
                            </DialogContentText>
                            <DialogContentText align="justify" variant="body2">
                                Some examples include fans who only want to pay for the creator's time and any
                                form of value through a video call, or consulting services where their clients
                                can now only pay for the actual time spent on the consultation. LiveThree is a
                                blank canvas so feel free to do whatever with money streaming video calls!
                            </DialogContentText>
                        </Stack>
                        <Stack spacing={ 1 }>
                            <DialogContentText align="justify" variant="h4">
                                Getting started
                            </DialogContentText>
                            <DialogContentText align="justify" variant="body2">
                                Anyone on this platform can make or receive calls. LiveThree supports two tokens,
                                MATIC and { tokenSymbol ? tokenSymbol : "" }. To make calls, your account needs to
                                have both MATIC and { tokenSymbol ? tokenSymbol : "" }, where the { tokenSymbol ? tokenSymbol : "" }
                                { ` ` } is then wrapped into { tokenXSymbol ? tokenXSymbol : "" } so that it can be
                                used as the money to be streamed via video call. To receive calls, you do not need
                                any token to start, but it is good to have some MATIC to perform certain actions.
                            </DialogContentText>
                            <DialogContentText align="justify" variant="h6" sx={ { textDecoration: 'underline' } }>
                                Why do I need MATIC/{ tokenSymbol ? tokenSymbol : "" }/{ tokenXSymbol ? tokenXSymbol : "" } to make a simple video call?
                            </DialogContentText>
                            <DialogContentText align="justify" variant="body2">
                                There are many platforms out there that provide a basic video call, but none provide
                                money streaming video calls. LiveThree uses blockchain technology to make money streaming
                                video calls work, and MATIC/{ tokenSymbol ? tokenSymbol : "" }/{ tokenXSymbol ? tokenXSymbol : "" }
                                { ` ` } tokens are just part of this blockchain technology.
                            </DialogContentText>
                            <DialogContentText align="justify" variant="h6" sx={ { textDecoration: 'underline' } }>
                                What is MATIC?
                            </DialogContentText>
                            <DialogContentText align="justify" variant="body2">
                                MATIC is the native coin (token) of the Polygon network. LiveThree supports Polygon which
                                is one of many networks in the blockchain space.
                            </DialogContentText>
                            <DialogContentText align="justify" variant="body2">
                                Some actions taken in this platform requires
                                gas fee to be paid (in MATIC) to the network in order to securely confirm the action on the
                                blockchain. The amount that needs to be paid per action is not determined by LiveThree, but
                                by the Polygon network itself, and LiveThree does not take a cut in this gas fee. If an action
                                on LiveThree requires gas, it will be indicated to you by the gas symbol so that it is clear to you.
                                <StyledGasBadgeMini2 badgeContent={ <IconGas /> }><IconButton variant="contained">action</IconButton></StyledGasBadgeMini2>
                            </DialogContentText>
                            <DialogContentText align="justify" variant="body2">
                                Paying for gas is an unavoidable aspect of using blockchain technology. Luckily, the gas fees are
                                typically low and not more that 0.02 US dollar per action. LiveThree hopes to cover the gas cost of
                                our users in the future.
                            </DialogContentText>
                            <DialogContentText align="justify" variant="h6" sx={ { textDecoration: 'underline' } }>
                                What is { tokenSymbol ? tokenSymbol : "" }?
                            </DialogContentText>
                            <DialogContentText align="justify" variant="body2">
                                { tokenSymbol ? tokenSymbol : "" } is the tokenized blockchain version of the fiat US dollar, and their
                                value for the most part are 1 to 1. LiveThree does not support transactions in fiat US dollar currency,
                                only transactions in { tokenSymbol ? tokenSymbol : "" } token. There are other tokenized versions of the
                                fiat US dollar out there, but LiveThree only supports { tokenSymbol ? tokenSymbol : "" }.
                            </DialogContentText>
                            <DialogContentText align="justify" variant="h6" sx={ { textDecoration: 'underline' } }>
                                What is { tokenXSymbol ? tokenXSymbol : "" }?
                            </DialogContentText>
                            <DialogContentText align="justify" variant="body2">
                                { tokenXSymbol ? tokenXSymbol : "" } is like a supercharged { tokenSymbol ? tokenSymbol : "" } which allows
                                it to do more. In this case, LiveThree utilizes { tokenXSymbol ? tokenXSymbol : "" } in money streaming video
                                calls where this is the token you actually send/stream to the video call recipient.
                            </DialogContentText>
                            <DialogContentText align="justify" variant="h6" sx={ { textDecoration: 'underline' } }>
                                How can I get MATIC/{ tokenSymbol ? tokenSymbol : "" }/{ tokenXSymbol ? tokenXSymbol : "" } into my account?
                            </DialogContentText>
                            <DialogContentText align="justify" variant="body2">
                                LiveThree currently only supports one way of getting these tokens into your account, that is, by sending them
                                from another external address that owns these tokens to your LiveThree account's address. You can view your
                                account's address in your profile page. Here are some examples of external address wallets/accounts:
                            </DialogContentText>
                            <DialogContentText align="justify" variant="body2" sx={ { display: 'list-item' } }>
                                A wallet that you or your friend owns, such as MetaMask, Trust Wallet.
                            </DialogContentText>
                            <DialogContentText align="justify" variant="body2" sx={ { display: 'list-item' } }>
                                A cold/hardware wallet such as Trezor.
                            </DialogContentText>
                            <DialogContentText align="justify" variant="body2" sx={ { display: 'list-item' } }>
                                An exchange base account/wallet such as Binance, Coinbase.
                            </DialogContentText>
                            <DialogContentText align="justify" variant="body2" sx={ { display: 'list-item' } }>
                                Another LiveThree account.
                            </DialogContentText>
                            <DialogContentText align="justify" variant="body2">
                                If you are new to web3/blockchain and find words like wallet/address in this context confusing, then you probably
                                want to start by buying some tokens from a trusted crypto exchange. LiveThree does not endorse any exchanges, but
                                Binance and Coinbase are the biggest so its best to start there. However, please do your own research before
                                purchasing any tokens from any exchanges.
                            </DialogContentText>
                            <DialogContentText align="justify" variant="body2">
                                In the future, you can buy these tokens directly on the LiveThree platform.
                            </DialogContentText>
                            <DialogContentText align="justify" variant="h6" sx={ { textDecoration: 'underline' } }>
                                Receiving calls
                            </DialogContentText>
                            <DialogContentText align="justify" variant="body2">
                                To start receiving money streaming video calls, all you have to do is set your rate in the Settings tab under "Set rate".
                                Once the rate is set, that rate will be converted to the equivalent rate per second and whoever calls you would be streaming
                                that amount per second to your account. The streamed amount will be in { tokenXSymbol ? tokenXSymbol : "" }
                            </DialogContentText>
                            <DialogContentText align="justify" variant="body2">
                                LiveThree takes { PERCENTAGE_TAKE_NUMERATOR }% of every money streamed video call. There is no other fees, so we earn only if you earn.
                            </DialogContentText>
                            <DialogContentText align="justify" variant="body2">
                                Thats it! Now all you have to do is promote your LiveThree address on your socials so that others can follow and make calls to you!
                            </DialogContentText>
                            <DialogContentText align="justify" variant="h6" sx={ { textDecoration: 'underline' } }>
                                Making calls *
                            </DialogContentText>
                            <Box>
                                <DialogContentText align="justify" variant="body2">
                                    1) Ensure your account has sufficient MATIC and { tokenXSymbol ? tokenXSymbol : "" }
                                </DialogContentText>
                                <DialogContentText align="justify" variant="body2">
                                    2) Add someone else by their LiveThree address
                                </DialogContentText>
                                <DialogContentText align="justify" variant="body2">
                                    3) Ensure the necessary permission has been granted
                                </DialogContentText>
                                <DialogContentText align="justify" variant="body2">
                                    4) Start a money streaming video call
                                </DialogContentText>
                                <DialogContentText align="justify" variant="body2">
                                    5) End the call <Box component="span" fontWeight='fontWeightMedium' display='inline'>before your account { tokenXSymbol ? tokenXSymbol : "" } runs out</Box>
                                </DialogContentText>
                            </Box>
                            <DialogContentText align="justify" variant="body2">
                                To start making money streaming video calls, you will need MATIC and { tokenXSymbol ? tokenXSymbol : "" }.
                                Please refer to the section above on how to get those tokens into your LiveThree account. 1 MATIC should be
                                sufficient to last for quite a few calls.
                            </DialogContentText>
                            <DialogContentText align="justify" variant="body2">
                                { tokenXSymbol ? tokenXSymbol : "" } will be the actual token streamed to the call recipient. If you can get { ` ` }
                                { tokenXSymbol ? tokenXSymbol : "" } directly from an external address, then you do not need { tokenSymbol ? tokenSymbol : "" }.
                                Otherwise, the more common way to get { tokenXSymbol ? tokenXSymbol : "" } in your account is to first get { ` ` }
                                { tokenSymbol ? tokenSymbol : "" } then wrap it in the Settings tab under "Token wrapping" section. Note that MATIC
                                would be spent in wrapping of { tokenXSymbol ? tokenXSymbol : "" }. You can unwrap it anytime in a similar fasion.
                            </DialogContentText>
                            <DialogContentText align="justify" variant="body2">
                                Before starting a call, please grant permission to LiveThree in order to allow the call recipient to end the money
                                streaming video call if necessary. This can be done in the Settings tab under "Permissions" section.
                            </DialogContentText>
                            <DialogContentText align="justify" variant="body2">
                                When you make a money streaming video call, a portion of { tokenXSymbol ? tokenXSymbol : "" } will be kept as a deposit
                                to act as a collateral. <Box component="span" fontWeight='fontWeightMedium' display='inline'>The deposit is returned
                                    to your account once the money stream has ended before your funds ({ tokenXSymbol ? tokenXSymbol : "" })
                                    { ` ` } runs out. The deposit is deducted from your account if you run out of funds before the money stream ends.</Box>
                            </DialogContentText>
                            <DialogContentText align="justify" variant="body2">
                                This deposit is required by the blockchain to allow the money streaming mechanism to work. This is not determined by LiveThree.
                                Hence, LiveThree has no control over this deposit and can only help with best practices so that our users do not lose the deposit.
                                Make sure your account has sufficient { tokenXSymbol ? tokenXSymbol : "" } for the deposit and the rate for which you want
                                the video call to last.
                            </DialogContentText>
                            <DialogContentText align="justify" variant="body2">
                                Please note that as the person who started a money steaming video call, you have the sole responsibility of ending the
                                same call, <Box component="span" fontWeight='fontWeightMedium' display='inline'>before your account run out of funds</Box>.
                                Although you have granted permission to allow the call recipient to end the money streaming video call, it is still highly
                                recommended that the maker of the call ends it, before the funds run out. In this case, the "funds" refers to { tokenXSymbol ? tokenXSymbol : "" }.
                            </DialogContentText>
                            <DialogContentText align="justify" variant="body2">
                                There is a countdown timer during the money streaming video call for your convenience to indicate how long you have left before
                                your account runs out of funds. LiveThree will attempt to end the money streaming video call { Number(END_CALL_BUFFER_SECONDS) }
                                { ` ` } seconds before your funds run out, but you should not depend on this.
                            </DialogContentText>
                            <DialogContentText align="justify" variant="body2">
                                You should only use the end call button <StyledGasBadgeMini2 badgeContent={ <IconGas /> }><Tooltip title="End money streaming video call"><IconButton variant="contained" color="error"><CallEndIcon /></IconButton></Tooltip></StyledGasBadgeMini2> to end the call and not
                                leave the video call page through any other means such as closing the tab or window, refreshing the page, or pressing the back button.
                            </DialogContentText>
                            <DialogContentText align="justify" variant="body2">
                                In any case that the money stream remains open even after the video call has ended, there will be an indication showing this and
                                you can manually end the money stream by going to the Settings tab under "Delete outgoing stream" and enter the recipient address
                                of the stream.
                            </DialogContentText>
                            <DialogContentText align="justify" variant="h6" sx={ { textDecoration: 'underline' } }>
                                How is the deposit amount determined?
                            </DialogContentText>
                            <DialogContentText align="justify" variant="body2">
                                4 hours (14400 seconds) multiplied by the flow rate set by the call recipient.
                            </DialogContentText>

                        </Stack>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button
                        autoFocus
                        onClick={ () => {
                            setIsOpen(false)
                        } }
                    >
                        Done
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}
