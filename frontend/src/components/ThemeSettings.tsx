import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Switch,
  Paper,
  Grid,
  Chip,
  Divider,
  Alert,
} from '@mui/material';
import {
  Brightness4 as DarkIcon,
  Brightness7 as LightIcon,
  BrightnessAuto as AutoIcon,
  Palette as PaletteIcon,
  Speed as SpeedIcon,
  Contrast as ContrastIcon,
} from '@mui/icons-material';
import { useThemeMode, PaletteMode } from '../contexts/ThemeContext';

interface ThemeSettingsProps {
  open: boolean;
  onClose: () => void;
}

const accentColors = [
  { name: 'Green (Default)', value: undefined },
  { name: 'Blue', value: '#2196F3' },
  { name: 'Purple', value: '#9C27B0' },
  { name: 'Orange', value: '#FF9800' },
  { name: 'Teal', value: '#009688' },
  { name: 'Pink', value: '#E91E63' },
  { name: 'Indigo', value: '#3F51B5' },
  { name: 'Cyan', value: '#00BCD4' },
];

export function ThemeSettings({ open, onClose }: ThemeSettingsProps) {
  const { mode, actualMode, setMode, preferences, updatePreferences, systemPrefersDark } = useThemeMode();

  const handleModeChange = (newMode: PaletteMode) => {
    setMode(newMode);
  };

  const handleAccentColorChange = (color: string | undefined) => {
    updatePreferences({ accentColor: color });
  };

  const handleTransitionsToggle = () => {
    updatePreferences({ enableTransitions: !preferences.enableTransitions });
  };

  const handleContrastChange = (contrast: 'normal' | 'high') => {
    updatePreferences({ contrast });
  };

  const getModeIcon = (themeMode: PaletteMode) => {
    switch (themeMode) {
      case 'light':
        return <LightIcon />;
      case 'dark':
        return <DarkIcon />;
      case 'auto':
        return <AutoIcon />;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <PaletteIcon />
          Theme-Einstellungen
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ py: 1 }}>
          {/* Theme Mode */}
          <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
            <FormLabel component="legend" sx={{ mb: 2, fontWeight: 600 }}>
              Theme-Modus
            </FormLabel>
            <Grid container spacing={2}>
              {(['light', 'dark', 'auto'] as PaletteMode[]).map((themeMode) => (
                <Grid item xs={4} key={themeMode}>
                  <Paper
                    onClick={() => handleModeChange(themeMode)}
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      border: mode === themeMode ? 2 : 0,
                      borderColor: 'primary.main',
                      textAlign: 'center',
                      transition: 'all 0.2s',
                      '&:hover': {
                        boxShadow: 4,
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    <Box sx={{ fontSize: 40, mb: 1 }}>{getModeIcon(themeMode)}</Box>
                    <Typography variant="body2" fontWeight={600}>
                      {themeMode === 'light' && 'Hell'}
                      {themeMode === 'dark' && 'Dunkel'}
                      {themeMode === 'auto' && 'Auto'}
                    </Typography>
                    {themeMode === 'auto' && (
                      <Typography variant="caption" color="text.secondary">
                        Folgt System
                      </Typography>
                    )}
                  </Paper>
                </Grid>
              ))}
            </Grid>
            {mode === 'auto' && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Auto-Modus aktiv: Verwendet derzeit{' '}
                <strong>{systemPrefersDark ? 'Dunkel' : 'Hell'}</strong> basierend auf Ihren
                Systemeinstellungen
              </Alert>
            )}
          </FormControl>

          <Divider sx={{ my: 3 }} />

          {/* Accent Color */}
          <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
            <FormLabel component="legend" sx={{ mb: 2, fontWeight: 600 }}>
              Akzentfarbe
            </FormLabel>
            <Grid container spacing={1}>
              {accentColors.map((color) => (
                <Grid item xs={6} sm={4} key={color.name}>
                  <Paper
                    onClick={() => handleAccentColorChange(color.value)}
                    sx={{
                      p: 1.5,
                      cursor: 'pointer',
                      border: preferences.accentColor === color.value ? 2 : 0,
                      borderColor: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      transition: 'all 0.2s',
                      '&:hover': {
                        boxShadow: 2,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        bgcolor: color.value || (actualMode === 'dark' ? '#66bb6a' : '#2e7d32'),
                        border: '2px solid',
                        borderColor: 'divider',
                      }}
                    />
                    <Typography variant="body2" fontSize="0.75rem">
                      {color.name}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </FormControl>

          <Divider sx={{ my: 3 }} />

          {/* Contrast Mode */}
          <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
            <FormLabel component="legend" sx={{ mb: 2, fontWeight: 600 }}>
              <Box display="flex" alignItems="center" gap={1}>
                <ContrastIcon fontSize="small" />
                Kontrast
              </Box>
            </FormLabel>
            <RadioGroup
              value={preferences.contrast}
              onChange={(e) => handleContrastChange(e.target.value as 'normal' | 'high')}
            >
              <FormControlLabel
                value="normal"
                control={<Radio />}
                label={
                  <Box>
                    <Typography>Normal</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Standard-Kontrastverhältnis
                    </Typography>
                  </Box>
                }
              />
              <FormControlLabel
                value="high"
                control={<Radio />}
                label={
                  <Box>
                    <Typography>Hoch</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Erhöhter Kontrast für bessere Lesbarkeit
                    </Typography>
                  </Box>
                }
              />
            </RadioGroup>
          </FormControl>

          <Divider sx={{ my: 3 }} />

          {/* Animations */}
          <Box sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.enableTransitions}
                  onChange={handleTransitionsToggle}
                />
              }
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <SpeedIcon fontSize="small" />
                  <Box>
                    <Typography>Animationen aktivieren</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Sanfte Übergänge und Animationen (kann Performance beeinflussen)
                    </Typography>
                  </Box>
                </Box>
              }
            />
          </Box>

          {/* Current Theme Info */}
          <Paper sx={{ p: 2, bgcolor: 'action.hover' }}>
            <Typography variant="body2" fontWeight={600} gutterBottom>
              Aktuelles Theme:
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap" mt={1}>
              <Chip
                size="small"
                label={`Modus: ${mode === 'auto' ? `Auto (${actualMode})` : actualMode}`}
                icon={getModeIcon(mode)}
              />
              <Chip
                size="small"
                label={`Kontrast: ${preferences.contrast === 'high' ? 'Hoch' : 'Normal'}`}
                icon={<ContrastIcon />}
              />
              <Chip
                size="small"
                label={`Animationen: ${preferences.enableTransitions ? 'An' : 'Aus'}`}
                icon={<SpeedIcon />}
              />
            </Box>
          </Paper>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Schließen</Button>
        <Button
          variant="contained"
          onClick={() => {
            updatePreferences(defaultPreferences);
          }}
        >
          Zurücksetzen
        </Button>
      </DialogActions>
    </Dialog>
  );
}

const defaultPreferences = {
  mode: 'dark' as PaletteMode,
  enableTransitions: true,
  contrast: 'normal' as const,
  accentColor: undefined,
};
