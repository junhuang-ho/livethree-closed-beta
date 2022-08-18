import Stack from "@mui/material/Stack";
import Typography from '@mui/material/Typography';

export const ErrorPage = ({ message }: { message?: string }) => {
    return (
        <Stack
            alignItems="center"
            justifyContent="center"
            spacing={ 3 }
            sx={ { height: "100vh", pb: 15 } }
        >
            <Typography>
                Opps.. Page not found.
            </Typography>
        </Stack>
    )
}
