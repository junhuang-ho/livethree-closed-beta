import { Link } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import Icon from '@mui/material/Icon';
import Box from '@mui/material/Box';
import livethree from '../assets/livethree-crop.png'
import l3 from '../assets/l3-crop.png'
import livethreeGrey from '../assets/livethree-crop-grey-bg.png'

/**
 * ref:
 * 1. https://www.canva.com/design/DAFFPmXG-TI/X0-1MceOUWgJ28P9rGhuhg/edit?utm_content=DAFFPmXG-TI&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton
 * 2. https://express.adobe.com/sp/branding/urn:aaid:sc:AP:ab9bc1f9-aa0d-4704-b0a0-9acd6e93bc50
 * 3. https://jpgtopngconverter.com/crop-svg-online/
 */

const LogoIcon = styled(Icon)({
    width: "100%",
    height: "100%"
});

export const Logo = ({ disabledLink = false, mini = false, bgGrey = false }: { disabledLink?: boolean, mini?: boolean, bgGrey?: boolean }) => {
    // const theme = useTheme();

    // const PRIMARY_LIGHT = theme.palette.primary.light;

    // const PRIMARY_MAIN = theme.palette.primary.main;

    // const PRIMARY_DARK = theme.palette.primary.dark;

    const logo = (
        <Box sx={ { width: "100%", height: "100%" } }>
            { mini && (
                <LogoIcon>
                    <img src={ l3 } />
                </LogoIcon>
            ) }
            { bgGrey && (
                <LogoIcon>
                    <img src={ livethreeGrey } />
                </LogoIcon>
            ) }
            { (!mini && !bgGrey) && (
                <LogoIcon>
                    <img src={ livethree } />
                </LogoIcon>
            ) }
        </Box>

    );

    if (disabledLink) {
        return <>{ logo }</>;
    }

    return <Link to="/">{ logo }</Link>;
}
