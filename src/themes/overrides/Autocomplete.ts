export const Autocomplete = (theme: any) => { // TODO: replace any with appropriate type!!
    return {
        MuiAutocomplete: {
            styleOverrides: {
                paper: {
                    boxShadow: theme.customShadows.z20
                }
            }
        }
    };
}