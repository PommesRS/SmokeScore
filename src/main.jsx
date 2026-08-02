import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './components'
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { CssBaseline } from '@mui/material';
import { HashRouter } from 'react-router-dom';
import { UserAuthContextProvider } from './context/userAuthConfig';
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import { ThemeProviderCustom } from './components/Settings/ThemeProviderCustom';
import { AppStateContextProvider } from './context/appState';
import { NotificationContextProvider } from './context/notificationContext'
import { CounterContextProvider } from './context/counterContext';
import { UserDataContextProvider } from './context/userData';
import { UserStreakContextProvider } from './context/userStreak';
import { UserBadgesContextProvider } from './context/userBadges';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProviderCustom>
      <HashRouter>
        <UserAuthContextProvider>
          <NotificationContextProvider>
            <UserDataContextProvider>
              <UserStreakContextProvider>
                <UserBadgesContextProvider>
                    <CounterContextProvider>
                      <AppStateContextProvider>
                          <CssBaseline/>
                          <App />
                      </AppStateContextProvider>
                    </CounterContextProvider>
                </UserBadgesContextProvider>
              </UserStreakContextProvider>
            </UserDataContextProvider>
          </NotificationContextProvider>
        </UserAuthContextProvider>
      </HashRouter>
    </ThemeProviderCustom>
  </StrictMode>
)

serviceWorkerRegistration.register();