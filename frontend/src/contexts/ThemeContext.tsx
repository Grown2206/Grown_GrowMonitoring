import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

type PaletteMode = 'light' | 'dark';

interface ThemeContextType {
  mode: PaletteMode;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<PaletteMode>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as PaletteMode) || 'dark';
  });

  const toggleMode = () => {
    setMode((prev: PaletteMode) => {
      const newMode = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newMode);
      return newMode;
    });
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: mode === 'light' ? '#2e7d32' : '#66bb6a',
            light: '#60ad5e',
            dark: '#005005',
          },
          secondary: {
            main: mode === 'light' ? '#ff6f00' : '#ffa726',
            light: '#ffa040',
            dark: '#c43e00',
          },
          success: {
            main: '#4caf50',
          },
          warning: {
            main: '#ff9800',
          },
          error: {
            main: '#f44336',
          },
          background: {
            default: mode === 'light' ? '#f5f5f5' : '#121212',
            paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
          },
        },
        typography: {
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          h1: {
            fontWeight: 700,
          },
          h2: {
            fontWeight: 700,
          },
          h3: {
            fontWeight: 600,
          },
          h4: {
            fontWeight: 600,
          },
          h5: {
            fontWeight: 600,
          },
          h6: {
            fontWeight: 600,
          },
        },
        shape: {
          borderRadius: 12,
        },
        shadows: [
          'none',
          '0px 2px 4px rgba(0,0,0,0.05)',
          '0px 4px 8px rgba(0,0,0,0.08)',
          '0px 6px 12px rgba(0,0,0,0.1)',
          '0px 8px 16px rgba(0,0,0,0.12)',
          '0px 10px 20px rgba(0,0,0,0.15)',
          '0px 12px 24px rgba(0,0,0,0.18)',
          '0px 14px 28px rgba(0,0,0,0.2)',
          '0px 16px 32px rgba(0,0,0,0.22)',
          '0px 18px 36px rgba(0,0,0,0.24)',
          '0px 20px 40px rgba(0,0,0,0.26)',
          '0px 22px 44px rgba(0,0,0,0.28)',
          '0px 24px 48px rgba(0,0,0,0.3)',
          '0px 26px 52px rgba(0,0,0,0.32)',
          '0px 28px 56px rgba(0,0,0,0.34)',
          '0px 30px 60px rgba(0,0,0,0.36)',
          '0px 32px 64px rgba(0,0,0,0.38)',
          '0px 34px 68px rgba(0,0,0,0.4)',
          '0px 36px 72px rgba(0,0,0,0.42)',
          '0px 38px 76px rgba(0,0,0,0.44)',
          '0px 40px 80px rgba(0,0,0,0.46)',
          '0px 42px 84px rgba(0,0,0,0.48)',
          '0px 44px 88px rgba(0,0,0,0.5)',
          '0px 46px 92px rgba(0,0,0,0.52)',
          '0px 48px 96px rgba(0,0,0,0.54)',
        ] as any,
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 8,
                padding: '10px 24px',
              },
              contained: {
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: '0px 4px 12px rgba(0,0,0,0.15)',
                },
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 16,
                boxShadow: mode === 'light' ? '0px 4px 20px rgba(0,0,0,0.08)' : '0px 4px 20px rgba(0,0,0,0.3)',
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
              },
            },
          },
          MuiAppBar: {
            styleOverrides: {
              root: {
                backgroundImage: mode === 'light'
                  ? 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)'
                  : 'linear-gradient(135deg, #1e3a20 0%, #0d1f0f 100%)',
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: {
                fontWeight: 600,
              },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={{ mode, toggleMode }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useThemeMode() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within ThemeProvider');
  }
  return context;
}
