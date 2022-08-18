import twitter from '../assets/twitter.gif'
import discord from '../assets/discord.gif'

import Stack from "@mui/material/Stack"
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

export const Support = () => {
    return (
        <Card
            variant="outlined"
            sx={ { width: "100%" } }
        >
            <CardHeader
                title="Support"
                sx={ {
                    "&:last-child": {
                        paddingLeft: 24
                    }
                } }
            />
            <CardContent>
                <Stack
                    spacing={ 1 }
                >
                    <Typography>
                        Need help or want to provide feedback? Contact us via our socials:
                    </Typography>
                    <Stack direction="row">
                        <IconButton
                            onClick={ () => {
                                window.open("https://twitter.com/livethreeweb");
                            } }
                        >
                            <img src={ twitter } style={ { width: "30px" } } />
                        </IconButton>
                        <IconButton
                            onClick={ () => {
                                window.open("https://discord.gg/EhFcudaE37");
                            } }
                        >
                            <img src={ discord } style={ { width: "30px" } } />
                        </IconButton>
                    </Stack>

                </Stack>
            </CardContent>
        </Card >
    )
}
