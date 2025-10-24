import React, { createContext, useState, useMemo, useContext } from 'react';
import { createTheme, ThemeProvider, alpha } from '@mui/material';

const ThemeContext = createContext({
  themeName: 'purple',
  setThemeName: () => {},
});

export const useAppTheme = () => useContext(ThemeContext);

const themes = {
  blue: {
    palette: {
      mode: 'dark',
      primary: {
        main: '#53b0ee',
        light: '#9dd0f2',
        dark: '#2a6f9e',
        transparent02: alpha('#53b0ee', 0.3),
        transparent05: alpha('#53b0ee', 0.7),
        contrastText: '#fff'
      },
      secondary: {
        main: '#89a96c'
      },
      background: {
      default: '#06141e',
      paper: '#002840',
      gradient: 'linear-gradient(150deg,rgba(13, 45, 77, 1) 0%, rgba(42, 111, 158, 1) 50%, rgba(13, 45, 77, 1) 100%)',
      transparentGradient: 'linear-gradient(180deg, rgba(42, 111, 158, 0.5), rgba(42, 111, 158, 0))',
      },
      text: {
          primary: '#ffff'
      }
    },
  },
  green: {
    palette: {
      mode: 'dark',
      primary: {
        main: '#187',
        light: '#2FB5A1',
        dark: '#002E26',
        transparent02: alpha('#187', 0.3),
        transparent05: alpha('#187', 0.7),
        contrastText: '#fffff'
      },
      secondary: {
        main: '#4a4888'
      },
      background: {
      default: '#031210',
      paper: '#051c19',
      gradient: 'linear-gradient(150deg, rgba(8, 74, 63, 1) 0%, rgba(47, 181, 161, 1) 50%, rgba(8, 74, 63, 1) 100%);',
      transparentGradient: 'linear-gradient(180deg, rgba(47, 181, 161, 0.5), rgba(47, 181, 161, 0))',
      },
      text: {
          primary: '#ffff',
          secondary: '#ffff',
      }
    },
  },
  sunset: {
    palette: {
      mode: 'dark',
      primary: {
        main: '#C7784A',
        light: '#ee935e',
        dark: '#8c5637',
        transparent02: alpha('#C7784A7', 0.3),
        transparent05: alpha('#C7784A7', 0.7),
        contrastText: '#fffff'
      },
      secondary: {
        main: '#c6d04a'
      },
      background: {
      default: '#1f110a',
      paper: '#472819',
      gradient: 'linear-gradient(150deg, rgba(89, 52, 29, 1) 0%, rgba(199, 120, 74, 1) 50%, rgba(89, 52, 29, 1) 100%)',
      transparentGradient: 'linear-gradient(180deg, rgba(89, 52, 29, 0.5), rgba(47, 181, 161, 0))',
      },
      text: {
          primary: '#ffff',
          secondary: '#ffff',
      }
    },
  },
    purple: {
    palette: {
      mode: 'dark',
      primary: {
        main: '#aa14f0',
        light: '#DB8FFF',
        dark: '#7510A3',
        transparent02: alpha('#aa14f0', 0.3),
        transparent05: alpha('#aa14f0', 0.7),
        contrastText: '#fffff'
      },
      secondary: {
        main: '#79FFE4'
      },
      background: {
      default: '#0b0618',
      paper: '#0b0618',
      gradient: 'linear-gradient(150deg, rgba(49,6,69,1) 0%, rgba(170, 20, 240, 1) 50%, rgb(49, 6, 69) 100%)',
      transparentGradient: 'linear-gradient(180deg, rgba(170, 20, 240, 0.3), rgba(170, 20, 240, 0))',
      },
      text: {
          primary: '#ffff',
          secondary: '#ffff',
          gray: '#d4d4d4'
      }
    },
  },
};

export const ThemeProviderCustom = ({ children }) => {
  const [themeName, setThemeName] = useState(localStorage.getItem('themeName') || 'blue');

  const muiTheme = useMemo(() => {
    const themeConfig = themes[themeName] || themes.purple;
    return createTheme({
      ...themeConfig,
      typography: {
        fontFamily: "'Inter', sans-serif",
      },
    });
  }, [themeName]);

  

  const handleSetTheme = (name) => {
    setThemeName(name);
    localStorage.setItem('themeName', name);
  };

  return (
    <ThemeContext.Provider value={{ themeName, setThemeName: handleSetTheme }}>
      <ThemeProvider theme={muiTheme}>{children}</ThemeProvider>
    </ThemeContext.Provider>
  );
};