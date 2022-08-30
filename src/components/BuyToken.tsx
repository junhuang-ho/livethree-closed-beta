import Typography from "@mui/material/Typography"
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Link from '@mui/material/Link';

export const BuyToken = () => {
    return (
        <Card
            variant="outlined"
            sx={ { width: "100%" } }
        >
            <CardHeader
                title="Top-up Account"
                sx={ {
                    "&:last-child": {
                        paddingLeft: 24
                    }
                } }
            />
            <CardContent>
                <Stack spacing={ 1 }>
                    <Typography align="justify">
                        Please follow the instructions in <Link href="https://medium.com/@livethreeweb/how-to-top-up-your-livethree-account-58bc9e39398c" target="_blank" rel="noopener">this blog post</Link> to ensure you top-up your LiveThree account
                        with MATIC or USDC correctly.
                    </Typography>
                </Stack>
            </CardContent>
        </Card >
    )
}
