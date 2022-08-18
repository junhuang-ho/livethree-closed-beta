import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { ThemeProvider } from './themes/ThemeProvider';
import { BrowserRouter } from 'react-router-dom';
import { HMSRoomProvider } from '@100mslive/react-sdk';
import { Web3AuthProvider } from './contexts/Web3Auth';
import { AuthenticationStateProvider } from './contexts/AuthenticationState';
import { SuperfluidGasProvider } from './contexts/SuperfluidGas'
import { SnackbarProvider } from 'notistack';

// import { QueryClientProvider, QueryClient } from 'react-query'
// import { ReactQueryDevtools } from 'react-query/devtools'

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(
    <React.StrictMode>
        <ThemeProvider>
            <BrowserRouter>
                <HMSRoomProvider>
                    <SnackbarProvider
                        maxSnack={ 3 }
                        anchorOrigin={ {
                            vertical: 'top',
                            horizontal: 'center',
                        } }
                    >
                        <Web3AuthProvider>
                            <AuthenticationStateProvider>
                                <SuperfluidGasProvider>
                                    <App />
                                </SuperfluidGasProvider>
                            </AuthenticationStateProvider>
                        </Web3AuthProvider>
                    </SnackbarProvider>
                </HMSRoomProvider>
            </BrowserRouter>
            {/* </PromtContext> */ }
        </ThemeProvider>
    </React.StrictMode>
);