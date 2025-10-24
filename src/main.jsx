import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App, Login } from './components'
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { alpha, createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import { HashRouter } from 'react-router-dom';
import { UserAuthContextProvider } from './context/userAuthConfig';
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import { ThemeProviderCustom } from './components/ThemeProviderCustom';

// const green = createTheme({
//   typography: {
//     fontFamily:[
//       'Poppins'
//     ]
//   },
//   palette: {
//     mode: 'dark',
//     primary: {
//       main: '#187',
//       light: '#2FB5A1',
//       dark: '#002E26',
//       transparent02: alpha('#187', 0.3),
//       transparent05: alpha('#187', 0.7),
//       contrastText: '#fff'
//     },
//     background: {
//       default: '#031210',
//       paper: '#051c19',
//       gradient: 'linear-gradient(150deg, rgba(8, 74, 63, 1) 0%, rgba(47, 181, 161, 1) 50%, rgba(8, 74, 63, 1) 100%);',
//       transparentGradient: 'linear-gradient(180deg, rgba(47, 181, 161, 0.5), rgba(47, 181, 161, 0))',
//     }
//   },
// })

// const blue = createTheme({
//   typography: {
//     fontFamily:[
//       'Poppins'
//     ]
//   },
//   palette: {
//     mode: 'dark',
//     primary: {
//       main: '#53b0ee',
//       light: '#9dd0f2',
//       dark: '#2a6f9e',
//       transparent02: alpha('#53b0ee', 0.3),
//       transparent05: alpha('#53b0ee', 0.7),
//       contrastText: '#fff'
//     },
//     background: {
//       default: '#06141e',
//       paper: '#002840',
//       gradient: 'linear-gradient(90deg,rgba(13, 45, 77, 1) 0%, rgba(42, 111, 158, 1) 50%, rgba(13, 45, 77, 1) 100%)',
//       transparentGradient: 'linear-gradient(180deg, rgba(42, 111, 158, 0.5), rgba(42, 111, 158, 0))',
//     }
//   },
// })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProviderCustom>
      
      <HashRouter>
      <UserAuthContextProvider>
        <CssBaseline/>
        <App />
      </UserAuthContextProvider>
      </HashRouter>
    </ThemeProviderCustom>
  </StrictMode>,
)

serviceWorkerRegistration.register();