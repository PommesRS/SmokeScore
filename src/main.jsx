import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './components'
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
import { FriendChatContextProvider } from './context/friendChat';
import { UserCollectablesContextProvider } from './context/userCollectables';
import { UserInventoryContextProvider } from './context/userInventory';
import { FlashMessageContextProvider } from './context/flashMessage';
import { UserQuestsContextProvider } from './context/userQuests';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProviderCustom>
      <HashRouter>
        <UserAuthContextProvider>
          <NotificationContextProvider>
            <UserDataContextProvider>
              <UserInventoryContextProvider>
                <FlashMessageContextProvider>
                  <UserStreakContextProvider>
                    <UserCollectablesContextProvider>
                      <FriendChatContextProvider>
                        <UserBadgesContextProvider>
                          <UserQuestsContextProvider>
                            <CounterContextProvider>
                              <AppStateContextProvider>
                                <CssBaseline/>
                                <App />
                              </AppStateContextProvider>
                            </CounterContextProvider>
                          </UserQuestsContextProvider>
                        </UserBadgesContextProvider>
                      </FriendChatContextProvider>
                    </UserCollectablesContextProvider>
                  </UserStreakContextProvider>
                </FlashMessageContextProvider>
              </UserInventoryContextProvider>
            </UserDataContextProvider>
          </NotificationContextProvider>
        </UserAuthContextProvider>
      </HashRouter>
    </ThemeProviderCustom>
  </StrictMode>
)

serviceWorkerRegistration.register();