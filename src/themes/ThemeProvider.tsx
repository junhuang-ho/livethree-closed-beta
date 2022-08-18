import { useMemo } from 'react';

import { CssBaseline } from '@mui/material';
import { ThemeProvider as MUIThemeProvider, createTheme, StyledEngineProvider } from '@mui/material/styles';


import customPalette from './palette';
import typography from './typography';
import shadows, { customShadows } from './shadows';
import { componentsOverrides } from './overrides/componentOverrides'

type Props = {
    children: React.ReactNode
}

export const ThemeProvider = ({ children }: Props) => {
    const themeOptions = useMemo(
        () => ({
            // palette: { mode: "dark" as PaletteType, customPalette }, // note: dark mode not implemented as not properly done yet
            palette: customPalette,
            typography,
            shadows,
            customShadows,
            shape: { borderRadius: 8 },
        }),
        []
    );

    const theme = createTheme(themeOptions);
    theme.components = componentsOverrides(theme);

    return (
        <StyledEngineProvider injectFirst>

            <MUIThemeProvider theme={ theme }>
                <CssBaseline />
                { children }
            </MUIThemeProvider>
        </StyledEngineProvider>
    );
}
