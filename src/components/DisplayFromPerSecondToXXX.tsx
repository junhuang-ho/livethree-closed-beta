import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"

import { ButtonRotate } from './ButtonRotate';

import { useRotateCount } from '../hooks/useRotateCount';

import { useSuperfluidGas } from "../contexts/SuperfluidGas";

import { conversion, fromPerSecondToPerXXX } from "../utils";

export const DisplayFromPerSecondToXXX = ({ flowRate }: { flowRate: any }) => {

    const { tokenXSymbol } = useSuperfluidGas()

    const totalPositions = Object.keys(conversion).length
    const defaultPosition: number = 1
    const { position, next } = useRotateCount(totalPositions, defaultPosition)

    const decimal = 4

    return (
        <Stack direction="row" alignItems="center" sx={ { border: 1, borderRadius: 2, pl: 1, pr: 1, m: 1 } }>
            <ButtonRotate rotate={ next } />
            { tokenXSymbol &&
                <Typography variant="subtitle1">
                    { position === 0 && `${ fromPerSecondToPerXXX(flowRate, "second").toFixed(decimal) } ${ tokenXSymbol } per second` }
                    { position === 1 && `${ fromPerSecondToPerXXX(flowRate, "minute").toFixed(decimal) } ${ tokenXSymbol } per minute` }
                    { position === 2 && `${ fromPerSecondToPerXXX(flowRate, "hour").toFixed(decimal) } ${ tokenXSymbol } per hour` }
                    { position === 3 && `${ fromPerSecondToPerXXX(flowRate, "day").toFixed(decimal) } ${ tokenXSymbol } per day` }
                    { position === 4 && `${ fromPerSecondToPerXXX(flowRate, "week").toFixed(decimal) } ${ tokenXSymbol } per week` }
                    { position === 5 && `${ fromPerSecondToPerXXX(flowRate, "month").toFixed(decimal) } ${ tokenXSymbol } per month` }
                    { position === 6 && `${ fromPerSecondToPerXXX(flowRate, "year").toFixed(decimal) } ${ tokenXSymbol } per year` }
                </Typography>
            }

        </Stack>
    )
}
