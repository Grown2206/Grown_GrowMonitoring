import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
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
  Typography,
  Paper,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  Brightness4 as DarkIcon,
  Brightness7 as LightIcon,
  BrightnessAuto as AutoIcon,
  Palette as PaletteIcon,
  FormatSize as FontSizeIcon,
  BorderStyle as BorderIcon,
  Animation as AnimationIcon,
} from '@mui/icons-material';

export interface ThemeSettings {
  mode: 'light' | 'dark' | 'auto';
  primaryColor: string;
  secondaryColor: string;
  fontSize: number;
  fontFamily: string;
  borderRadius: number;
  density: 'comfortable' | 'compact' | 'spacious';
  animations: boolean;
  reducedMotion: boolean;
}

export interface ThemeCustomizerProps {
  settings?: ThemeSettings;
  onChange?: (settings: ThemeSettings) => void;
  onApply?: (settings: ThemeSettings) => void;
}

const primaryColors = [
  { name: 'Blue', value: '#1976d2', rgb: '25, 118, 210' },
  { name: 'Green', value: '#2e7d32', rgb: '46, 125, 50' },
  { name: 'Purple', value: '#7b1fa2', rgb: '123, 31, 162' },
  { name: 'Orange', value: '#ed6c02', rgb: '237, 108, 2' },
  { name: 'Red', value: '#d32f2f', rgb: '211, 47, 47' },
  { name: 'Teal', value: '#00897b', rgb: '0, 137, 123' },
  { name: 'Indigo', value: '#303f9f', rgb: '48, 63, 159' },
  { name: 'Pink', value: '#c2185b', rgb: '194, 24, 91' },
];

const fontFamilies = [
  { label: 'Roboto (Default)', value: 'Roboto, sans-serif' },
  { label: 'Inter', value: 'Inter, sans-serif' },
  { label: 'Open Sans', value: '"Open Sans", sans-serif' },
  { label: 'Lato', value: 'Lato, sans-serif' },
  { label: 'Poppins', value: 'Poppins, sans-serif' },
  { label: 'Montserrat', value: 'Montserrat, sans-serif' },
];

/**
 * Comprehensive theme customization component
 */
export function ThemeCustomizer({
  settings: initialSettings,
  onChange,
  onApply,
}: ThemeCustomizerProps) {
  const [settings, setSettings] = useState<ThemeSettings>(
    initialSettings || {
      mode: 'light',
      primaryColor: '#1976d2',
      secondaryColor: '#dc004e',
      fontSize: 14,
      fontFamily: 'Roboto, sans-serif',
      borderRadius: 4,
      density: 'comfortable',
      animations: true,
      reducedMotion: false,
    }
  );

  const updateSetting = <K extends keyof ThemeSettings>(key: K, value: ThemeSettings[K]) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    if (onChange) {
      onChange(newSettings);
    }
  };

  const handleApply = () => {
    if (onApply) {
      onApply(settings);
    }
  };

  return (
    <Stack spacing={3}>
      {/* Theme Mode */}
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} alignItems="center">
              <PaletteIcon />
              <Typography variant="h6">Theme Mode</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Choose between light, dark, or automatic theme based on system preferences
            </Typography>
            <ToggleButtonGroup
              value={settings.mode}
              exclusive
              onChange={(_, value) => value && updateSetting('mode', value)}
              fullWidth
            >
              <ToggleButton value="light">
                <Stack direction="row" spacing={1} alignItems="center">
                  <LightIcon />
                  <Typography>Light</Typography>
                </Stack>
              </ToggleButton>
              <ToggleButton value="dark">
                <Stack direction="row" spacing={1} alignItems="center">
                  <DarkIcon />
                  <Typography>Dark</Typography>
                </Stack>
              </ToggleButton>
              <ToggleButton value="auto">
                <Stack direction="row" spacing={1} alignItems="center">
                  <AutoIcon />
                  <Typography>Auto</Typography>
                </Stack>
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </CardContent>
      </Card>

      {/* Primary Color */}
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h6">Primary Color</Typography>
            <Typography variant="body2" color="text.secondary">
              Select the primary color for buttons, links, and accents throughout the app
            </Typography>
            <Grid container spacing={2}>
              {primaryColors.map((color) => (
                <Grid item xs={6} sm={4} md={3} key={color.value}>
                  <Paper
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      border: 2,
                      borderColor:
                        settings.primaryColor === color.value ? 'primary.main' : 'transparent',
                      '&:hover': { borderColor: 'primary.light' },
                    }}
                    onClick={() => updateSetting('primaryColor', color.value)}
                  >
                    <Stack spacing={1} alignItems="center">
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: 1,
                          bgcolor: color.value,
                        }}
                      />
                      <Typography variant="body2">{color.name}</Typography>
                      {settings.primaryColor === color.value && (
                        <Chip label="Active" size="small" color="primary" />
                      )}
                    </Stack>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Stack>
        </CardContent>
      </Card>

      {/* Typography */}
      <Card>
        <CardContent>
          <Stack spacing={3}>
            <Stack direction="row" spacing={1} alignItems="center">
              <FontSizeIcon />
              <Typography variant="h6">Typography</Typography>
            </Stack>

            {/* Font Family */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Font Family
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={settings.fontFamily}
                  onChange={(e) => updateSetting('fontFamily', e.target.value)}
                >
                  {fontFamilies.map((font) => (
                    <MenuItem key={font.value} value={font.value}>
                      {font.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Font Size */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Base Font Size: {settings.fontSize}px
              </Typography>
              <Slider
                value={settings.fontSize}
                onChange={(_, value) => updateSetting('fontSize', value as number)}
                min={12}
                max={18}
                step={1}
                marks={[
                  { value: 12, label: '12px' },
                  { value: 14, label: '14px' },
                  { value: 16, label: '16px' },
                  { value: 18, label: '18px' },
                ]}
                valueLabelDisplay="auto"
              />
            </Box>

            {/* Preview */}
            <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Preview
              </Typography>
              <Typography
                sx={{
                  fontFamily: settings.fontFamily,
                  fontSize: settings.fontSize,
                }}
              >
                The quick brown fox jumps over the lazy dog
              </Typography>
            </Paper>
          </Stack>
        </CardContent>
      </Card>

      {/* Layout & Spacing */}
      <Card>
        <CardContent>
          <Stack spacing={3}>
            <Stack direction="row" spacing={1} alignItems="center">
              <BorderIcon />
              <Typography variant="h6">Layout & Spacing</Typography>
            </Stack>

            {/* Border Radius */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Border Radius: {settings.borderRadius}px
              </Typography>
              <Slider
                value={settings.borderRadius}
                onChange={(_, value) => updateSetting('borderRadius', value as number)}
                min={0}
                max={16}
                step={2}
                marks={[
                  { value: 0, label: 'Square' },
                  { value: 4, label: 'Default' },
                  { value: 8, label: 'Rounded' },
                  { value: 16, label: 'Very Round' },
                ]}
                valueLabelDisplay="auto"
              />
            </Box>

            {/* Density */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Component Density
              </Typography>
              <RadioGroup
                value={settings.density}
                onChange={(e) => updateSetting('density', e.target.value as any)}
              >
                <FormControlLabel
                  value="compact"
                  control={<Radio />}
                  label={
                    <Stack>
                      <Typography variant="body2">Compact</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Minimal spacing, more content visible
                      </Typography>
                    </Stack>
                  }
                />
                <FormControlLabel
                  value="comfortable"
                  control={<Radio />}
                  label={
                    <Stack>
                      <Typography variant="body2">Comfortable (Recommended)</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Balanced spacing for optimal readability
                      </Typography>
                    </Stack>
                  }
                />
                <FormControlLabel
                  value="spacious"
                  control={<Radio />}
                  label={
                    <Stack>
                      <Typography variant="body2">Spacious</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Maximum spacing, easier touch targets
                      </Typography>
                    </Stack>
                  }
                />
              </RadioGroup>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Animations & Motion */}
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} alignItems="center">
              <AnimationIcon />
              <Typography variant="h6">Animations & Motion</Typography>
            </Stack>

            <FormControlLabel
              control={
                <Switch
                  checked={settings.animations}
                  onChange={(e) => updateSetting('animations', e.target.checked)}
                />
              }
              label={
                <Stack>
                  <Typography variant="body2">Enable Animations</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Smooth transitions and UI animations
                  </Typography>
                </Stack>
              }
            />

            <FormControlLabel
              control={
                <Switch
                  checked={settings.reducedMotion}
                  onChange={(e) => updateSetting('reducedMotion', e.target.checked)}
                />
              }
              label={
                <Stack>
                  <Typography variant="body2">Reduce Motion</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Minimize animations for accessibility
                  </Typography>
                </Stack>
              }
            />
          </Stack>
        </CardContent>
      </Card>

      {/* Preview Panel */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Theme Preview
          </Typography>
          <Paper
            sx={{
              p: 3,
              bgcolor: settings.mode === 'dark' ? 'grey.900' : 'background.default',
              color: settings.mode === 'dark' ? 'grey.100' : 'text.primary',
              borderRadius: `${settings.borderRadius}px`,
            }}
          >
            <Stack spacing={2}>
              <Typography variant="h6" sx={{ fontFamily: settings.fontFamily, fontSize: settings.fontSize * 1.5 }}>
                Sample Heading
              </Typography>
              <Typography sx={{ fontFamily: settings.fontFamily, fontSize: settings.fontSize }}>
                This is how your content will look with the selected theme settings.
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: settings.primaryColor,
                    borderRadius: `${settings.borderRadius}px`,
                    fontSize: settings.fontSize,
                  }}
                >
                  Primary Button
                </Button>
                <Button
                  variant="outlined"
                  sx={{
                    borderColor: settings.primaryColor,
                    color: settings.primaryColor,
                    borderRadius: `${settings.borderRadius}px`,
                    fontSize: settings.fontSize,
                  }}
                >
                  Outlined Button
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </CardContent>
      </Card>

      {/* Apply Button */}
      <Paper sx={{ p: 2, position: 'sticky', bottom: 0 }}>
        <Stack direction="row" justifyContent="flex-end">
          <Button
            variant="contained"
            size="large"
            onClick={handleApply}
            sx={{ bgcolor: settings.primaryColor }}
          >
            Apply Theme
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
}
