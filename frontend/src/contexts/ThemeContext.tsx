import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, GlobalStyles } from '@mui/material';

export type PaletteMode = 'light' | 'dark' | 'auto';
export type ThemeMode = 'light' | 'dark'; // Actual applied theme (auto resolves to light/dark)

export interface ThemePreferences {
  mode: PaletteMode;
  accentColor?: string;
  enableTransitions: boolean;
  contrast: 'normal' | 'high';
}

interface ThemeContextType {
  mode: PaletteMode;
  actualMode: ThemeMode; // The actual applied mode (auto resolves to system preference)
  toggleMode: () => void;
  setMode: (mode: PaletteMode) => void;
  preferences: ThemePreferences;
  updatePreferences: (prefs: Partial<ThemePreferences>) => void;
  systemPrefersDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'theme-preferences';

const defaultPreferences: ThemePreferences = {
  mode: 'dark',
  enableTransitions: true,
  contrast: 'normal',
};

function getStoredPreferences(): ThemePreferences {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored) {
      return { ...defaultPreferences, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Error loading theme preferences:', error);
  }
  return defaultPreferences;
}

function storePreferences(prefs: ThemePreferences) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(prefs));
  } catch (error) {
    console.error('Error storing theme preferences:', error);
  }
}

// Hook to detect system color scheme preference
function useSystemColorScheme(): boolean {
  const [prefersDark, setPrefersDark] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setPrefersDark(e.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    // Legacy browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  return prefersDark;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<ThemePreferences>(getStoredPreferences);
  const systemPrefersDark = useSystemColorScheme();

  // Determine actual theme mode
  const actualMode: ThemeMode = useMemo(() => {
    if (preferences.mode === 'auto') {
      return systemPrefersDark ? 'dark' : 'light';
    }
    return preferences.mode as ThemeMode;
  }, [preferences.mode, systemPrefersDark]);

  const updatePreferences = (prefs: Partial<ThemePreferences>) => {
    setPreferences((prev) => {
      const updated = { ...prev, ...prefs };
      storePreferences(updated);
      return updated;
    });
  };

  const toggleMode = () => {
    const modes: PaletteMode[] = ['light', 'dark', 'auto'];
    const currentIndex = modes.indexOf(preferences.mode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    updatePreferences({ mode: nextMode });
  };

  const setMode = (mode: PaletteMode) => {
    updatePreferences({ mode });
  };

  // Enhanced color palettes
  const getColorPalette = (mode: ThemeMode, accentColor?: string) => {
    const isDark = mode === 'dark';
    const isHighContrast = preferences.contrast === 'high';

    return {
      mode,
      primary: {
        main: accentColor || (isDark ? '#66bb6a' : '#2e7d32'),
        light: isDark ? '#81c784' : '#60ad5e',
        dark: isDark ? '#388e3c' : '#005005',
        contrastText: '#ffffff',
      },
      secondary: {
        main: isDark ? '#ffa726' : '#ff6f00',
        light: isDark ? '#ffb74d' : '#ffa040',
        dark: isDark ? '#f57c00' : '#c43e00',
        contrastText: isDark ? '#000000' : '#ffffff',
      },
      success: {
        main: isDark ? '#66bb6a' : '#4caf50',
        light: isDark ? '#81c784' : '#6fbf73',
        dark: isDark ? '#388e3c' : '#357a38',
      },
      warning: {
        main: isDark ? '#ffa726' : '#ff9800',
        light: isDark ? '#ffb74d' : '#ffac33',
        dark: isDark ? '#f57c00' : '#b26a00',
      },
      error: {
        main: isDark ? '#ef5350' : '#f44336',
        light: isDark ? '#ff6f60' : '#ff6659',
        dark: isDark ? '#c62828' : '#aa2e25',
      },
      info: {
        main: isDark ? '#42a5f5' : '#2196f3',
        light: isDark ? '#64b5f6' : '#4dabf5',
        dark: isDark ? '#1976d2' : '#0b79d0',
      },
      background: {
        default: isHighContrast
          ? (isDark ? '#000000' : '#ffffff')
          : (isDark ? '#121212' : '#f5f5f5'),
        paper: isHighContrast
          ? (isDark ? '#0a0a0a' : '#fafafa')
          : (isDark ? '#1e1e1e' : '#ffffff'),
      },
      text: {
        primary: isHighContrast
          ? (isDark ? '#ffffff' : '#000000')
          : (isDark ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.87)'),
        secondary: isHighContrast
          ? (isDark ? '#e0e0e0' : '#333333')
          : (isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)'),
        disabled: isDark ? 'rgba(255, 255, 255, 0.38)' : 'rgba(0, 0, 0, 0.38)',
      },
      divider: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
      action: {
        active: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.54)',
        hover: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
        selected: isDark ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.08)',
        disabled: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.26)',
        disabledBackground: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
      },
    };
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: getColorPalette(actualMode, preferences.accentColor),
        typography: {
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          h1: { fontWeight: 700 },
          h2: { fontWeight: 700 },
          h3: { fontWeight: 600 },
          h4: { fontWeight: 600 },
          h5: { fontWeight: 600 },
          h6: { fontWeight: 600 },
          button: { fontWeight: 600 },
        },
        shape: {
          borderRadius: 12,
        },
        shadows: [
          'none',
          actualMode === 'dark' ? '0px 2px 4px rgba(0,0,0,0.3)' : '0px 2px 4px rgba(0,0,0,0.05)',
          actualMode === 'dark' ? '0px 4px 8px rgba(0,0,0,0.4)' : '0px 4px 8px rgba(0,0,0,0.08)',
          actualMode === 'dark' ? '0px 6px 12px rgba(0,0,0,0.5)' : '0px 6px 12px rgba(0,0,0,0.1)',
          actualMode === 'dark' ? '0px 8px 16px rgba(0,0,0,0.6)' : '0px 8px 16px rgba(0,0,0,0.12)',
          actualMode === 'dark' ? '0px 10px 20px rgba(0,0,0,0.65)' : '0px 10px 20px rgba(0,0,0,0.15)',
          actualMode === 'dark' ? '0px 12px 24px rgba(0,0,0,0.7)' : '0px 12px 24px rgba(0,0,0,0.18)',
          actualMode === 'dark' ? '0px 14px 28px rgba(0,0,0,0.75)' : '0px 14px 28px rgba(0,0,0,0.2)',
          actualMode === 'dark' ? '0px 16px 32px rgba(0,0,0,0.8)' : '0px 16px 32px rgba(0,0,0,0.22)',
          actualMode === 'dark' ? '0px 18px 36px rgba(0,0,0,0.85)' : '0px 18px 36px rgba(0,0,0,0.24)',
          actualMode === 'dark' ? '0px 20px 40px rgba(0,0,0,0.9)' : '0px 20px 40px rgba(0,0,0,0.26)',
          actualMode === 'dark' ? '0px 22px 44px rgba(0,0,0,0.9)' : '0px 22px 44px rgba(0,0,0,0.28)',
          actualMode === 'dark' ? '0px 24px 48px rgba(0,0,0,0.9)' : '0px 24px 48px rgba(0,0,0,0.3)',
          actualMode === 'dark' ? '0px 26px 52px rgba(0,0,0,0.95)' : '0px 26px 52px rgba(0,0,0,0.32)',
          actualMode === 'dark' ? '0px 28px 56px rgba(0,0,0,0.95)' : '0px 28px 56px rgba(0,0,0,0.34)',
          actualMode === 'dark' ? '0px 30px 60px rgba(0,0,0,0.95)' : '0px 30px 60px rgba(0,0,0,0.36)',
          actualMode === 'dark' ? '0px 32px 64px rgba(0,0,0,0.95)' : '0px 32px 64px rgba(0,0,0,0.38)',
          actualMode === 'dark' ? '0px 34px 68px rgba(0,0,0,0.95)' : '0px 34px 68px rgba(0,0,0,0.4)',
          actualMode === 'dark' ? '0px 36px 72px rgba(0,0,0,0.95)' : '0px 36px 72px rgba(0,0,0,0.42)',
          actualMode === 'dark' ? '0px 38px 76px rgba(0,0,0,0.95)' : '0px 38px 76px rgba(0,0,0,0.44)',
          actualMode === 'dark' ? '0px 40px 80px rgba(0,0,0,0.95)' : '0px 40px 80px rgba(0,0,0,0.46)',
          actualMode === 'dark' ? '0px 42px 84px rgba(0,0,0,0.95)' : '0px 42px 84px rgba(0,0,0,0.48)',
          actualMode === 'dark' ? '0px 44px 88px rgba(0,0,0,0.95)' : '0px 44px 88px rgba(0,0,0,0.5)',
          actualMode === 'dark' ? '0px 46px 92px rgba(0,0,0,0.95)' : '0px 46px 92px rgba(0,0,0,0.52)',
          actualMode === 'dark' ? '0px 48px 96px rgba(0,0,0,0.95)' : '0px 48px 96px rgba(0,0,0,0.54)',
        ] as any,
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 8,
                padding: '10px 24px',
                transition: preferences.enableTransitions ? 'all 0.2s ease-in-out' : 'none',
              },
              contained: {
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: actualMode === 'dark' ? '0px 4px 12px rgba(0,0,0,0.4)' : '0px 4px 12px rgba(0,0,0,0.15)',
                  transform: 'translateY(-1px)',
                },
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 16,
                boxShadow: actualMode === 'dark' ? '0px 4px 20px rgba(0,0,0,0.4)' : '0px 4px 20px rgba(0,0,0,0.08)',
                transition: preferences.enableTransitions ? 'all 0.2s ease-in-out' : 'none',
                '&:hover': {
                  boxShadow: actualMode === 'dark' ? '0px 6px 24px rgba(0,0,0,0.5)' : '0px 6px 24px rgba(0,0,0,0.12)',
                },
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
                transition: preferences.enableTransitions ? 'background-color 0.3s ease-in-out, color 0.3s ease-in-out' : 'none',
              },
            },
          },
          MuiAppBar: {
            styleOverrides: {
              root: {
                backgroundImage: actualMode === 'dark'
                  ? 'linear-gradient(135deg, #1e3a20 0%, #0d1f0f 100%)'
                  : 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
                transition: preferences.enableTransitions ? 'background-image 0.3s ease-in-out' : 'none',
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: {
                fontWeight: 600,
                transition: preferences.enableTransitions ? 'all 0.2s ease-in-out' : 'none',
              },
            },
          },
          MuiTextField: {
            styleOverrides: {
              root: {
                '& .MuiOutlinedInput-root': {
                  transition: preferences.enableTransitions ? 'all 0.2s ease-in-out' : 'none',
                },
              },
            },
          },
          MuiSwitch: {
            styleOverrides: {
              root: {
                '& .MuiSwitch-thumb': {
                  transition: preferences.enableTransitions ? 'all 0.2s ease-in-out' : 'none',
                },
              },
            },
          },
        },
      }),
    [actualMode, preferences.accentColor, preferences.enableTransitions, preferences.contrast]
  );

  // Global styles for smooth transitions
  const globalStyles = (
    <GlobalStyles
      styles={{
        '*': {
          transition: preferences.enableTransitions ? 'color 0.3s ease-in-out, background-color 0.3s ease-in-out' : 'none',
        },
        'body': {
          transition: preferences.enableTransitions ? 'background-color 0.3s ease-in-out' : 'none',
        },
      }}
    />
  );

  return (
    <ThemeContext.Provider
      value={{
        mode: preferences.mode,
        actualMode,
        toggleMode,
        setMode,
        preferences,
        updatePreferences,
        systemPrefersDark,
      }}
    >
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {globalStyles}
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

// Helper hook for theme-aware styling
export function useThemeAwareStyles() {
  const { actualMode, preferences } = useThemeMode();

  return {
    isDark: actualMode === 'dark',
    isHighContrast: preferences.contrast === 'high',
    transitionsEnabled: preferences.enableTransitions,
  };
}
