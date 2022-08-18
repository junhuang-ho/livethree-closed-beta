import { useState } from 'react';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { IconGas } from '../IconGas';

import { StyledGasBadge } from "../utils";

import { getFeeValuesSafeLow } from '../../utils';

import { useWeb3Auth } from '../../contexts/Web3Auth';
import { useSuperfluidGas } from '../../contexts/SuperfluidGas';

export const DialogInsufficientGas = ({
    strict,
    open, setOpen,
    txParameters, setTxParameters,
    isCreateFlow, setIsCreateFlowOperation,
    isDeleteFlow, setIsDeleteFlowOperation
}: any) => {
    const { address: localAddress } = useWeb3Auth()
    const { sendTransaction } = useSuperfluidGas()


    const [isProcessing, setIsProcessing] = useState<boolean>(false)

    return (
        <Dialog
            disableEscapeKeyDown
            open={ open }
            onClose={ () => {
                setOpen(false)

            } }
        >
            <DialogTitle>
                { "Insufficient gas (MATIC)" }
            </DialogTitle>
            <DialogContent>
                { strict ? (
                    <Box>
                        <DialogContentText align="justify">
                            You might not have enough funds (MATIC gas) to both start and end the money streaming video call.
                        </DialogContentText>
                        <DialogContentText align="justify">
                            Please top-up your account with MATIC before proceeding.
                        </DialogContentText>
                    </Box>
                ) : (
                    <Box>
                        <DialogContentText align="justify">
                            You might not have enough funds (MATIC gas) to complete this transaction.
                        </DialogContentText>
                        <DialogContentText align="justify">
                            Please top-up your account with MATIC before proceeding.
                        </DialogContentText>
                    </Box>
                ) }
            </DialogContent>
            <DialogActions>
                { strict ? (
                    <Button
                        autoFocus
                        disabled={ isProcessing }
                        onClick={ () => {
                            setOpen(false)
                        } }
                    >
                        I will top-up my account first then try again
                    </Button>
                ) : (
                    <Box>
                        <Button
                            autoFocus
                            disabled={ isProcessing }
                            onClick={ () => {
                                setTxParameters(null)
                                setIsCreateFlowOperation(null)
                                setIsDeleteFlowOperation(null)

                                setOpen(false)
                            } }
                        >
                            Cancel operation
                        </Button>
                        <StyledGasBadge badgeContent={ <IconGas /> }>
                            <Button
                                autoFocus
                                disabled={ isProcessing || !txParameters || isCreateFlow === null || isDeleteFlow === null }
                                onClick={ async () => {
                                    setIsProcessing(true)

                                    const txParam = { ...txParameters, ...{ from: localAddress, } }
                                    const { maxPriorityFeeWei, maxFeeWei } = await getFeeValuesSafeLow()
                                    await sendTransaction(maxPriorityFeeWei, maxFeeWei, txParam, isCreateFlow, isDeleteFlow)

                                    setTxParameters(null)
                                    setIsCreateFlowOperation(null)
                                    setIsDeleteFlowOperation(null)

                                    setOpen(false)
                                    setIsProcessing(false)
                                } }
                            >
                                Try anyway
                            </Button>
                        </StyledGasBadge>
                    </Box>
                ) }

            </DialogActions>
        </Dialog>
    )
}
