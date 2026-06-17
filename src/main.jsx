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
import { ThemeProviderCustom } from './components/ThemeProviderCustom';
import { AppStateContextProvider } from './context/appState';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProviderCustom>
      <HashRouter>
        <UserAuthContextProvider>
          <AppStateContextProvider>
            <CssBaseline/>
            <App />
          </AppStateContextProvider>
        </UserAuthContextProvider>
      </HashRouter>
    </ThemeProviderCustom>
  </StrictMode>
)

serviceWorkerRegistration.register();