import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App, Login } from './components'
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { createTheme, ThemeProvider } from '@mui/material';
import { HashRouter } from 'react-router-dom';
import { UserAuthContextProvider } from './context/userAuthConfig';

const theme = createTheme({
  typography: {
    fontFamily:[
      'Poppins'
    ]
  },
  palette: {
    primary: {
      main: '#8979FF',
      contrastText: '#fff'
    },
    background: {
      main: '#0B0B12' 
    }
  },
  components: {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
        
      }
    }
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <HashRouter>
      <UserAuthContextProvider>
        <App />
      </UserAuthContextProvider>
      </HashRouter>
    </ThemeProvider>
  </StrictMode>,
)
