import React from 'react';
import { Routes, Route } from 'react-router-dom';

import { CallProvider } from './contexts/Call';
import { AuthenticationGuard } from './components/AuthenticationGuard';
import { MainLayout } from './layouts/MainLayout';
import { SplashPage } from './pages/utils/SplashPage';
import { ErrorPage } from './pages/utils/ErrorPage';


// ---- lazy loading ref ---- //
// https://www.youtube.com/watch?v=0mQbxF-_S-M&ab_channel=uidotdev
// https://www.youtube.com/watch?v=MJn4W7pR6RU&list=PLC3y8-rFHvwjkxt8TOteFdT_YmzwpBlrG&index=15&ab_channel=Codevolution
const SignInPage = React.lazy(() => import('./pages/register/SignInPage'))
const SignUpPage = React.lazy(() => import('./pages/register/SignUpPage'))
const ProfileMePage = React.lazy(() => import('./pages/main/ProfileMePage'))
const ProfileYouPage = React.lazy(() => import('./pages/sub/ProfileYouPage'))
const FavouritesPage = React.lazy(() => import('./pages/main/FavouritesPage'))
const CallsPage = React.lazy(() => import('./pages/main/CallsPage'))
const SettingsPage = React.lazy(() => import('./pages/main/SettingsPage'))
const CallOneOnOnePage = React.lazy(() => import('./pages/sub/CallOneOnOnePage'))
// const ResetPasswordPage = React.lazy(() => import('./pages/utils/ResetPasswordPage'))
// const ResetPasswordRequestPage = React.lazy(() => import('./pages/utils/ResetPasswordRequestPage'))
const VerifyFirebaseEmailRequest = React.lazy(() => import('./pages/utils/VerifyFirebaseEmailRequest'))

export const App = () => {
    return (
        <Routes>
            <Route path='/' element={
                <AuthenticationGuard>
                    <CallProvider>
                        <MainLayout />
                    </CallProvider>
                </AuthenticationGuard>
            } >
                <Route path='/my-profile' element={ <React.Suspense fallback={ <SplashPage /> }><ProfileMePage /> </React.Suspense> } />
                <Route path='/user/:address' element={ <React.Suspense fallback={ <SplashPage /> }><ProfileYouPage /></React.Suspense> } />
                <Route path='/favourites' element={ <React.Suspense fallback={ <SplashPage /> }><FavouritesPage /></React.Suspense> } />
                <Route path='/calls' element={ <React.Suspense fallback={ <SplashPage /> }><CallsPage /></React.Suspense> } />
                <Route path='/settings' element={ <React.Suspense fallback={ <SplashPage /> }><SettingsPage /></React.Suspense> } />
                <Route path='/call/:caller/:callee/:flowRate' element={ <React.Suspense fallback={ <SplashPage /> }><CallOneOnOnePage /></React.Suspense> } />
                <Route index element={ <React.Suspense fallback={ <SplashPage /> }><FavouritesPage /></React.Suspense> } />
            </Route >
            <Route path='/sign-in' element={ <React.Suspense fallback={ <SplashPage /> }><SignInPage /></React.Suspense> } />
            <Route path='/sign-up' element={ <React.Suspense fallback={ <SplashPage /> }><SignUpPage /></React.Suspense> } />
            <Route path='/verification-request' element={ <React.Suspense fallback={ <SplashPage /> }><VerifyFirebaseEmailRequest /></React.Suspense> } />
            {/* <Route path='/reset-password' element={ <React.Suspense fallback={ <SplashPage /> }><ResetPasswordPage /></React.Suspense> } /> */ }
            {/* <Route path='/reset-password-request' element={ <React.Suspense fallback={ <SplashPage /> }><ResetPasswordRequestPage /></React.Suspense> } /> */ }
            <Route path='/error' element={ <ErrorPage /> } />
            <Route
                path="*"
                element={ <ErrorPage /> }
            />

        </Routes >
    );
}