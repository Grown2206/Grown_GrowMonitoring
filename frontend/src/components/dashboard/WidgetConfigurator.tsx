import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
  Slider,
  Divider,
  Chip,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  Palette as ColorIcon,
} from '@mui/icons-material';

export interface WidgetConfig {
  id: string;
  title?: string;
  refreshInterval?: number; // in seconds
  showHeader?: boolean;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  customSettings?: Record<string, any>;
}

export interface WidgetConfiguratorProps {
  widgetId: string;
  widgetName: string;
  config?: WidgetConfig;
  onSave?: (config: WidgetConfig) => void;
  onClose?: () => void;
  open?: boolean;
}

const colorPresets = [
  { name: 'Default', value: 'transparent' },
  { name: 'Primary', value: '#1976d2' },
  { name: 'Secondary', value: '#dc004e' },
  { name: 'Success', value: '#4caf50' },
  { name: 'Warning', value: '#ff9800' },
  { name: 'Error', value: '#f44336' },
  { name: 'Info', value: '#2196f3' },
  { name: 'Dark', value: '#212121' },
  { name: 'Light', value: '#f5f5f5' },
];

/**
 * Widget configuration dialog
 */
export function WidgetConfigurator({
  widgetId,
  widgetName,
  config: initialConfig,
  onSave,
  onClose,
  open = false,
}: WidgetConfiguratorProps) {
  const [config, setConfig] = useState<WidgetConfig>(
    initialConfig || {
      id: widgetId,
      title: widgetName,
      refreshInterval: 30,
      showHeader: true,
      backgroundColor: 'transparent',
      textColor: 'inherit',
      borderColor: 'divider',
      customSettings: {},
    }
  );

  const handleSave = () => {
    if (onSave) {
      onSave(config);
    }
    if (onClose) {
      onClose();
    }
  };

  const handleChange = (field: keyof WidgetConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1} alignItems="center">
            <SettingsIcon />
            <Typography variant="h6">Configure Widget</Typography>
          </Stack>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {/* Basic Settings */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Basic Settings
            </Typography>
            <Stack spacing={2}>
              <TextField
                label="Widget Title"
                value={config.title}
                onChange={(e) => handleChange('title', e.target.value)}
                fullWidth
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={config.showHeader}
                    onChange={(e) => handleChange('showHeader', e.target.checked)}
                  />
                }
                label="Show Header"
              />
            </Stack>
          </Box>

          <Divider />

          {/* Refresh Settings */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Refresh Interval (seconds)
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Slider
                value={config.refreshInterval}
                onChange={(_, value) => handleChange('refreshInterval', value)}
                min={5}
                max={300}
                step={5}
                marks={[
                  { value: 5, label: '5s' },
                  { value: 30, label: '30s' },
                  { value: 60, label: '1m' },
                  { value: 300, label: '5m' },
                ]}
                valueLabelDisplay="auto"
                sx={{ flex: 1 }}
              />
              <Chip label={`${config.refreshInterval}s`} color="primary" />
            </Stack>
          </Box>

          <Divider />

          {/* Color Customization */}
          <Box>
            <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
              <ColorIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
              Color Customization
            </Typography>

            <Stack spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Background Color</InputLabel>
                <Select
                  value={config.backgroundColor}
                  onChange={(e) => handleChange('backgroundColor', e.target.value)}
                  label="Background Color"
                >
                  {colorPresets.map((color) => (
                    <MenuItem key={color.value} value={color.value}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            bgcolor: color.value,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                          }}
                        />
                        <Typography>{color.name}</Typography>
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Text Color</InputLabel>
                <Select
                  value={config.textColor}
                  onChange={(e) => handleChange('textColor', e.target.value)}
                  label="Text Color"
                >
                  <MenuItem value="inherit">Inherit</MenuItem>
                  <MenuItem value="#000000">Black</MenuItem>
                  <MenuItem value="#FFFFFF">White</MenuItem>
                  <MenuItem value="#1976d2">Primary</MenuItem>
                  <MenuItem value="#dc004e">Secondary</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Border Color</InputLabel>
                <Select
                  value={config.borderColor}
                  onChange={(e) => handleChange('borderColor', e.target.value)}
                  label="Border Color"
                >
                  <MenuItem value="divider">Default</MenuItem>
                  <MenuItem value="primary.main">Primary</MenuItem>
                  <MenuItem value="secondary.main">Secondary</MenuItem>
                  <MenuItem value="success.main">Success</MenuItem>
                  <MenuItem value="warning.main">Warning</MenuItem>
                  <MenuItem value="error.main">Error</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Box>

          <Divider />

          {/* Widget-Specific Settings */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Widget-Specific Settings
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Advanced settings for {widgetName}
            </Typography>
            {/* Placeholder for widget-specific configuration */}
            <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Widget-specific options will appear here based on the widget type
              </Typography>
            </Box>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave}>
          Save Configuration
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/**
 * Quick widget settings button
 */
export function WidgetSettingsButton({
  widgetId,
  widgetName,
  config,
  onSave,
}: Omit<WidgetConfiguratorProps, 'open' | 'onClose'>) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <IconButton size="small" onClick={() => setOpen(true)}>
        <SettingsIcon fontSize="small" />
      </IconButton>
      <WidgetConfigurator
        widgetId={widgetId}
        widgetName={widgetName}
        config={config}
        onSave={onSave}
        onClose={() => setOpen(false)}
        open={open}
      />
    </>
  );
}
