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
        transparent02: alpha('#53b0ee', 0.05),
        transparent05: alpha('#53b0ee', 0.3),
        contrastText: '#fff'
      },
      secondary: {
        main: '#2f7e24',
        transparent02: alpha('#2f7e24', 0.05),
        transparent05: alpha('#2f7e24', 0.3),
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
        transparent02: alpha('#187', 0.05),
        transparent05: alpha('#187', 0.30),
        contrastText: '#fffff'
      },
      secondary: {
        main: '#098fa1',
        transparent02: alpha('#098fa1', 0.05),
        transparent05: alpha('#098fa1', 0.3),
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
        transparent02: alpha('#C7784A7', 0.05),
        transparent05: alpha('#C7784A7', 0.3),
        contrastText: '#fffff'
      },
      secondary: {
        main: '#c6d04a',
        transparent02: alpha('#c6d04a', 0.05),
        transparent05: alpha('#c6d04a', 0.3),
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
        transparent02: alpha('#aa14f0', 0.05),
        transparent05: alpha('#aa14f0', 0.3),
        contrastText: '#fffff'
      },
      secondary: {
        main: '#79FFE4',
        transparent02: alpha('#79FFE4', 0.05),
        transparent05: alpha('#79FFE4', 0.3),
      },
      background: {
      default: '#0b0618',
      paper: '#160d2c',
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
  red: {
    palette: {
      mode: 'dark',
      primary: {
        main: '#861f1f',
        light: '#cd5555',
        dark: '#4b1919',
        transparent02: alpha('#861f1f', 0.05),
        transparent05: alpha('#861f1f', 0.3),
        contrastText: '#fffff'
      },
      secondary: {
        main: '#798e19',
        transparent02: alpha('#798e19', 0.05),
        transparent05: alpha('#798e19', 0.3),
      },
      background: {
      default: '#0a0000',
      paper: '#180000',
      gradient: 'linear-gradient(150deg,rgba(48, 0, 0, 1) 0%, rgba(134, 31, 31, 1) 50%, rgba(48, 0, 0, 1) 100%)',
      transparentGradient: 'linear-gradient(180deg, rgba(134, 31, 31, 0.3), rgba(170, 20, 240, 0))',
      },
      text: {
          primary: '#ffff',
          secondary: '#ffff',
          gray: '#d4d4d4'
      }
    },
  },
  grayBlue: {
    palette: {
      mode: 'dark',
      primary: {
        main: '#53b0ee',
        light: '#9dd0f2',
        dark: '#2a6f9e',
        transparent02: alpha('#53b0ee', 0.05),
        transparent05: alpha('#53b0ee', 0.3),
        contrastText: '#fff'
      },
      secondary: {
        main: '#2f7e24',
        transparent02: alpha('#2f7e24', 0.05),
        transparent05: alpha('#2f7e24', 0.3),
      },
      background: {
      default: '#252525',
      paper: '#252525',
      gradient: 'linear-gradient(150deg,rgba(13, 45, 77, 1) 0%, rgba(42, 111, 158, 1) 50%, rgba(13, 45, 77, 1) 100%)',
      transparentGradient: 'linear-gradient(180deg, rgba(42, 111, 158, 0.5), rgba(42, 111, 158, 0))',
      },
      text: {
          primary: '#ffff'
      }
    },
  },
  grayGreen: {
    palette: {
      mode: 'dark',
      primary: {
        main: '#187',
        light: '#2FB5A1',
        dark: '#002E26',
        transparent02: alpha('#187', 0.05),
        transparent05: alpha('#187', 0.30),
        contrastText: '#fffff'
      },
      secondary: {
        main: '#098fa1',
        transparent02: alpha('#098fa1', 0.05),
        transparent05: alpha('#098fa1', 0.3),
      },
      background: {
      default: '#252525',
      paper: '#252525',
      gradient: 'linear-gradient(150deg, rgba(8, 74, 63, 1) 0%, rgba(47, 181, 161, 1) 50%, rgba(8, 74, 63, 1) 100%);',
      transparentGradient: 'linear-gradient(180deg, rgba(47, 181, 161, 0.5), rgba(47, 181, 161, 0))',
      },
      text: {
          primary: '#ffff',
          secondary: '#ffff',
      }
    },
  },
  graySunset: {
    palette: {
      mode: 'dark',
      primary: {
        main: '#C7784A',
        light: '#ee935e',
        dark: '#8c5637',
        transparent02: alpha('#C7784A7', 0.05),
        transparent05: alpha('#C7784A7', 0.3),
        contrastText: '#fffff'
      },
      secondary: {
        main: '#c6d04a',
        transparent02: alpha('#c6d04a', 0.05),
        transparent05: alpha('#c6d04a', 0.3),
      },
      background: {
      default: '#252525',
      paper: '#252525',
      gradient: 'linear-gradient(150deg, rgba(89, 52, 29, 1) 0%, rgba(199, 120, 74, 1) 50%, rgba(89, 52, 29, 1) 100%)',
      transparentGradient: 'linear-gradient(180deg, rgba(89, 52, 29, 0.5), rgba(47, 181, 161, 0))',
      },
      text: {
          primary: '#ffff',
          secondary: '#ffff',
      }
    },
  },
  grayPurple: {
    palette: {
      mode: 'dark',
      primary: {
        main: '#aa14f0',
        light: '#DB8FFF',
        dark: '#7510A3',
        transparent02: alpha('#aa14f0', 0.05),
        transparent05: alpha('#aa14f0', 0.3),
        contrastText: '#fffff'
      },
      secondary: {
        main: '#79FFE4',
        transparent02: alpha('#79FFE4', 0.05),
        transparent05: alpha('#79FFE4', 0.3),
      },
      background: {
      default: '#252525',
      paper: '#303030',
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
  grayRed: {
    palette: {
      mode: 'dark',
      primary: {
        main: '#861f1f',
        light: '#cd5555',
        dark: '#4b1919',
        transparent02: alpha('#861f1f', 0.05),
        transparent05: alpha('#861f1f', 0.3),
        contrastText: '#fffff'
      },
      secondary: {
        main: '#798e19',
        transparent02: alpha('#798e19', 0.05),
        transparent05: alpha('#798e19', 0.3),
      },
      background: {
      default: '#252525',
      paper: '#252525',
      gradient: 'linear-gradient(150deg,rgba(48, 0, 0, 1) 0%, rgba(134, 31, 31, 1) 50%, rgba(48, 0, 0, 1) 100%)',
      transparentGradient: 'linear-gradient(180deg, rgba(134, 31, 31, 0.3), rgba(170, 20, 240, 0))',
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
        fontFamily: "'Poppins', sans-serif",
      },
    });
  }, [themeName]);

  

  const handleSetTheme = (name, shouldNotWriteToStorage) => {
    setThemeName(name);
    if(shouldNotWriteToStorage) return
    localStorage.setItem('themeName', name);
  };

  return (
    <ThemeContext.Provider value={{ themeName, setThemeName: handleSetTheme }}>
      <ThemeProvider theme={muiTheme}>{children}</ThemeProvider>
    </ThemeContext.Provider>
  );
};