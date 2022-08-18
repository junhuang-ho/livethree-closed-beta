import { useState } from 'react'

import Stack from "@mui/material/Stack"
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

import { StandardButton } from "./utils";

import { useCall } from "../contexts/Call"

export const Ringtone = () => {
    const [isProcessing, setIsProcessing] = useState<boolean>(false)

    const { isRingtoneEnabled, setIsRingtoneEnabled } = useCall()
    return (
        <Card
            variant="outlined"
            sx={ { width: "100%" } }
        >
            <CardHeader
                title="Ringtone"
                sx={ {
                    "&:last-child": {
                        paddingLeft: 24
                    }
                } }
            />
            <CardContent>
                <Typography align="justify">
                    Incoming calls will { !isRingtoneEnabled ? "not" : "" } be playing sound.
                </Typography>
                <Stack
                    direction="row"
                    justifyContent="flex-end"
                    alignItems="center"
                >
                    <StandardButton
                        variant="contained"
                        disabled={ isProcessing }
                        onClick={ async () => {
                            setIsProcessing(true)
                            setIsRingtoneEnabled(!isRingtoneEnabled)
                            setIsProcessing(false)
                        } }
                    >
                        { isRingtoneEnabled ? 'mute' : 'unmute' }
                    </StandardButton >
                </Stack>
            </CardContent>
        </Card >
    )
}
