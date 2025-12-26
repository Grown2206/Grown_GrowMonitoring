import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Slider,
  Stack,
  Switch,
  TextField,
  Typography,
  Alert,
  Paper,
  Avatar,
} from '@mui/material';
import {
  Save as SaveIcon,
  Palette as PaletteIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Contrast as ContrastIcon,
  FormatSize as FontIcon,
  Language as LanguageIcon,
  Accessibility as AccessibilityIcon,
} from '@mui/icons-material';

export type ThemeMode = 'light' | 'dark' | 'auto';
export type ColorScheme = 'default' | 'blue' | 'green' | 'purple' | 'orange';
export type FontSize = 'small' | 'medium' | 'large' | 'xlarge';
export type Language = 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ja';
export type DateFormat = 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
export type TimeFormat = '12h' | '24h';

export interface AppearanceSettingsData {
  theme: {
    mode: ThemeMode;
    colorScheme: ColorScheme;
    compactMode: boolean;
    borderRadius: number;
  };
  typography: {
    fontSize: FontSize;
    fontFamily: string;
    lineHeight: number;
  };
  localization: {
    language: Language;
    dateFormat: DateFormat;
    timeFormat: TimeFormat;
    timezone: string;
    firstDayOfWeek: number;
  };
  accessibility: {
    highContrast: boolean;
    reduceMotion: boolean;
    screenReaderOptimized: boolean;
    keyboardNavigation: boolean;
  };
  layout: {
    sidebarCollapsed: boolean;
    showBreadcrumbs: boolean;
    showQuickActions: boolean;
    density: 'comfortable' | 'compact' | 'spacious';
  };
}

export interface AppearanceSettingsProps {
  settings?: AppearanceSettingsData;
  onSave?: (settings: AppearanceSettingsData) => void;
}

/**
 * Appearance and UI customization settings
 */
export function AppearanceSettings({
  settings: initialSettings,
  onSave,
}: AppearanceSettingsProps) {
  const [settings, setSettings] = useState<AppearanceSettingsData>(
    initialSettings || getDefaultSettings()
  );
  const [showSuccess, setShowSuccess] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = <K extends keyof AppearanceSettingsData>(
    category: K,
    field: keyof AppearanceSettingsData[K],
    value: any
  ) => {
    setSettings({
      ...settings,
      [category]: {
        ...settings[category],
        [field]: value,
      },
    });
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave?.(settings);
    setHasChanges(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const getThemePreview = () => {
    const colors: Record<ColorScheme, { primary: string; secondary: string }> = {
      default: { primary: '#1976d2', secondary: '#dc004e' },
      blue: { primary: '#2196f3', secondary: '#03a9f4' },
      green: { primary: '#4caf50', secondary: '#8bc34a' },
      purple: { primary: '#9c27b0', secondary: '#673ab7' },
      orange: { primary: '#ff9800', secondary: '#ff5722' },
    };
    return colors[settings.theme.colorScheme];
  };

  const getFontSizePixels = (size: FontSize) => {
    switch (size) {
      case 'small':
        return 12;
      case 'medium':
        return 14;
      case 'large':
        return 16;
      case 'xlarge':
        return 18;
    }
  };

  const themePreview = getThemePreview();

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5">Appearance Settings</Typography>
          <Typography variant="body2" color="text.secondary">
            Customize the look and feel of your interface
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={!hasChanges}
        >
          Save Changes
        </Button>
      </Stack>

      {showSuccess && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setShowSuccess(false)}>
          Appearance settings saved successfully
        </Alert>
      )}

      {hasChanges && (
        <Alert severity="info" sx={{ mb: 2 }}>
          You have unsaved changes
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Theme Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Stack spacing={3}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <PaletteIcon />
                  <Typography variant="h6">Theme</Typography>
                </Stack>

                <Divider />

                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Theme Mode
                  </Typography>
                  <RadioGroup
                    value={settings.theme.mode}
                    onChange={(e) => handleChange('theme', 'mode', e.target.value as ThemeMode)}
                  >
                    <FormControlLabel
                      value="light"
                      control={<Radio />}
                      label={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <LightModeIcon />
                          <Typography>Light</Typography>
                        </Stack>
                      }
                    />
                    <FormControlLabel
                      value="dark"
                      control={<Radio />}
                      label={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <DarkModeIcon />
                          <Typography>Dark</Typography>
                        </Stack>
                      }
                    />
                    <FormControlLabel
                      value="auto"
                      control={<Radio />}
                      label="Auto (system preference)"
                    />
                  </RadioGroup>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Color Scheme
                  </Typography>
                  <Grid container spacing={1}>
                    {(['default', 'blue', 'green', 'purple', 'orange'] as ColorScheme[]).map((scheme) => (
                      <Grid item key={scheme}>
                        <Paper
                          sx={{
                            p: 1,
                            cursor: 'pointer',
                            border: 2,
                            borderColor: settings.theme.colorScheme === scheme ? 'primary.main' : 'transparent',
                          }}
                          onClick={() => handleChange('theme', 'colorScheme', scheme)}
                        >
                          <Stack spacing={0.5}>
                            <Box
                              sx={{
                                width: 60,
                                height: 40,
                                bgcolor: scheme === 'default' ? '#1976d2' : scheme === 'blue' ? '#2196f3' : scheme === 'green' ? '#4caf50' : scheme === 'purple' ? '#9c27b0' : '#ff9800',
                                borderRadius: 1,
                              }}
                            />
                            <Typography variant="caption" align="center">
                              {scheme}
                            </Typography>
                          </Stack>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Box>

                <Divider />

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.theme.compactMode}
                      onChange={(e) => handleChange('theme', 'compactMode', e.target.checked)}
                    />
                  }
                  label="Compact Mode"
                />

                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Border Radius: {settings.theme.borderRadius}px
                  </Typography>
                  <Slider
                    value={settings.theme.borderRadius}
                    onChange={(_, value) => handleChange('theme', 'borderRadius', value)}
                    min={0}
                    max={16}
                    step={2}
                    marks
                  />
                </Box>

                <Divider />

                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                    Preview
                  </Typography>
                  <Stack spacing={1}>
                    <Button
                      variant="contained"
                      size="small"
                      sx={{
                        bgcolor: themePreview.primary,
                        borderRadius: `${settings.theme.borderRadius}px`,
                      }}
                    >
                      Primary Button
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{
                        borderColor: themePreview.primary,
                        color: themePreview.primary,
                        borderRadius: `${settings.theme.borderRadius}px`,
                      }}
                    >
                      Secondary Button
                    </Button>
                  </Stack>
                </Paper>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Typography Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Stack spacing={3}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <FontIcon />
                  <Typography variant="h6">Typography</Typography>
                </Stack>

                <Divider />

                <FormControl fullWidth>
                  <InputLabel>Font Size</InputLabel>
                  <Select
                    value={settings.typography.fontSize}
                    onChange={(e) => handleChange('typography', 'fontSize', e.target.value as FontSize)}
                  >
                    <MenuItem value="small">Small (12px)</MenuItem>
                    <MenuItem value="medium">Medium (14px)</MenuItem>
                    <MenuItem value="large">Large (16px)</MenuItem>
                    <MenuItem value="xlarge">Extra Large (18px)</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Font Family</InputLabel>
                  <Select
                    value={settings.typography.fontFamily}
                    onChange={(e) => handleChange('typography', 'fontFamily', e.target.value)}
                  >
                    <MenuItem value="Roboto" style={{ fontFamily: 'Roboto' }}>Roboto</MenuItem>
                    <MenuItem value="Open Sans" style={{ fontFamily: 'Open Sans' }}>Open Sans</MenuItem>
                    <MenuItem value="Lato" style={{ fontFamily: 'Lato' }}>Lato</MenuItem>
                    <MenuItem value="Montserrat" style={{ fontFamily: 'Montserrat' }}>Montserrat</MenuItem>
                    <MenuItem value="Inter" style={{ fontFamily: 'Inter' }}>Inter</MenuItem>
                  </Select>
                </FormControl>

                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Line Height: {settings.typography.lineHeight}
                  </Typography>
                  <Slider
                    value={settings.typography.lineHeight}
                    onChange={(_, value) => handleChange('typography', 'lineHeight', value)}
                    min={1.2}
                    max={2.0}
                    step={0.1}
                    marks={[
                      { value: 1.2, label: '1.2' },
                      { value: 1.6, label: '1.6' },
                      { value: 2.0, label: '2.0' },
                    ]}
                  />
                </Box>

                <Divider />

                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                    Preview
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: settings.typography.fontFamily,
                      fontSize: getFontSizePixels(settings.typography.fontSize),
                      lineHeight: settings.typography.lineHeight,
                    }}
                  >
                    The quick brown fox jumps over the lazy dog. This is a sample text to preview your typography settings.
                  </Typography>
                </Paper>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Localization Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Stack spacing={3}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <LanguageIcon />
                  <Typography variant="h6">Localization</Typography>
                </Stack>

                <Divider />

                <FormControl fullWidth>
                  <InputLabel>Language</InputLabel>
                  <Select
                    value={settings.localization.language}
                    onChange={(e) => handleChange('localization', 'language', e.target.value as Language)}
                  >
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="es">Español</MenuItem>
                    <MenuItem value="fr">Français</MenuItem>
                    <MenuItem value="de">Deutsch</MenuItem>
                    <MenuItem value="zh">中文</MenuItem>
                    <MenuItem value="ja">日本語</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Date Format</InputLabel>
                  <Select
                    value={settings.localization.dateFormat}
                    onChange={(e) => handleChange('localization', 'dateFormat', e.target.value as DateFormat)}
                  >
                    <MenuItem value="MM/DD/YYYY">MM/DD/YYYY (12/31/2024)</MenuItem>
                    <MenuItem value="DD/MM/YYYY">DD/MM/YYYY (31/12/2024)</MenuItem>
                    <MenuItem value="YYYY-MM-DD">YYYY-MM-DD (2024-12-31)</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Time Format</InputLabel>
                  <Select
                    value={settings.localization.timeFormat}
                    onChange={(e) => handleChange('localization', 'timeFormat', e.target.value as TimeFormat)}
                  >
                    <MenuItem value="12h">12-hour (2:30 PM)</MenuItem>
                    <MenuItem value="24h">24-hour (14:30)</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  label="Timezone"
                  value={settings.localization.timezone}
                  onChange={(e) => handleChange('localization', 'timezone', e.target.value)}
                  fullWidth
                  placeholder="America/New_York"
                />

                <FormControl fullWidth>
                  <InputLabel>First Day of Week</InputLabel>
                  <Select
                    value={settings.localization.firstDayOfWeek}
                    onChange={(e) => handleChange('localization', 'firstDayOfWeek', e.target.value)}
                  >
                    <MenuItem value={0}>Sunday</MenuItem>
                    <MenuItem value={1}>Monday</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Accessibility Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Stack spacing={3}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <AccessibilityIcon />
                  <Typography variant="h6">Accessibility</Typography>
                </Stack>

                <Divider />

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.accessibility.highContrast}
                      onChange={(e) => handleChange('accessibility', 'highContrast', e.target.checked)}
                    />
                  }
                  label={
                    <Stack>
                      <Typography>High Contrast Mode</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Increase contrast for better visibility
                      </Typography>
                    </Stack>
                  }
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.accessibility.reduceMotion}
                      onChange={(e) => handleChange('accessibility', 'reduceMotion', e.target.checked)}
                    />
                  }
                  label={
                    <Stack>
                      <Typography>Reduce Motion</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Minimize animations and transitions
                      </Typography>
                    </Stack>
                  }
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.accessibility.screenReaderOptimized}
                      onChange={(e) => handleChange('accessibility', 'screenReaderOptimized', e.target.checked)}
                    />
                  }
                  label={
                    <Stack>
                      <Typography>Screen Reader Optimized</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Enhanced support for screen readers
                      </Typography>
                    </Stack>
                  }
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.accessibility.keyboardNavigation}
                      onChange={(e) => handleChange('accessibility', 'keyboardNavigation', e.target.checked)}
                    />
                  }
                  label={
                    <Stack>
                      <Typography>Enhanced Keyboard Navigation</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Improved keyboard shortcuts and focus indicators
                      </Typography>
                    </Stack>
                  }
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Layout Settings */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Stack spacing={3}>
                <Typography variant="h6">Layout Preferences</Typography>

                <Divider />

                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Density</InputLabel>
                      <Select
                        value={settings.layout.density}
                        onChange={(e) => handleChange('layout', 'density', e.target.value)}
                      >
                        <MenuItem value="comfortable">Comfortable</MenuItem>
                        <MenuItem value="compact">Compact</MenuItem>
                        <MenuItem value="spacious">Spacious</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={8}>
                    <Stack spacing={2}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.layout.sidebarCollapsed}
                            onChange={(e) => handleChange('layout', 'sidebarCollapsed', e.target.checked)}
                          />
                        }
                        label="Collapse sidebar by default"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.layout.showBreadcrumbs}
                            onChange={(e) => handleChange('layout', 'showBreadcrumbs', e.target.checked)}
                          />
                        }
                        label="Show breadcrumbs navigation"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.layout.showQuickActions}
                            onChange={(e) => handleChange('layout', 'showQuickActions', e.target.checked)}
                          />
                        }
                        label="Show quick actions toolbar"
                      />
                    </Stack>
                  </Grid>
                </Grid>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

/**
 * Get default appearance settings
 */
function getDefaultSettings(): AppearanceSettingsData {
  return {
    theme: {
      mode: 'light',
      colorScheme: 'default',
      compactMode: false,
      borderRadius: 4,
    },
    typography: {
      fontSize: 'medium',
      fontFamily: 'Roboto',
      lineHeight: 1.5,
    },
    localization: {
      language: 'en',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      timezone: 'America/New_York',
      firstDayOfWeek: 0,
    },
    accessibility: {
      highContrast: false,
      reduceMotion: false,
      screenReaderOptimized: false,
      keyboardNavigation: true,
    },
    layout: {
      sidebarCollapsed: false,
      showBreadcrumbs: true,
      showQuickActions: true,
      density: 'comfortable',
    },
  };
}
