import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Save as SaveIcon,
  RestartAlt as ResetIcon,
  ExpandMore as ExpandIcon,
  Email as EmailIcon,
  Storage as StorageIcon,
  Backup as BackupIcon,
  Security as SecurityIcon,
  Api as ApiIcon,
  Database as DatabaseIcon,
  Speed as CacheIcon,
  Article as LogIcon,
  Info as InfoIcon,
  Check as SuccessIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

export interface EmailSettings {
  host: string;
  port: number;
  username: string;
  useSSL: boolean;
  fromAddress: string;
  fromName: string;
}

export interface StorageSettings {
  provider: 'local' | 's3' | 'azure' | 'gcs';
  maxFileSize: number;
  allowedFileTypes: string[];
  retentionDays: number;
}

export interface BackupSettings {
  enabled: boolean;
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
  retention: number;
  includeUploads: boolean;
  compression: boolean;
}

export interface SecuritySettings {
  enforceHTTPS: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  passwordMinLength: number;
  requireTwoFactor: boolean;
  allowedOrigins: string[];
}

export interface ApiSettings {
  rateLimit: number;
  enableCORS: boolean;
  apiVersion: string;
  webhooksEnabled: boolean;
  webhookSecret: string;
}

export interface DatabaseSettings {
  connectionPoolSize: number;
  queryTimeout: number;
  enableSlowQueryLog: boolean;
  slowQueryThreshold: number;
}

export interface CacheSettings {
  enabled: boolean;
  provider: 'redis' | 'memcached' | 'memory';
  ttl: number;
  maxSize: number;
}

export interface LogSettings {
  level: 'debug' | 'info' | 'warning' | 'error';
  retention: number;
  includeStackTrace: boolean;
  logToFile: boolean;
}

export interface SystemSettingsData {
  email: EmailSettings;
  storage: StorageSettings;
  backup: BackupSettings;
  security: SecuritySettings;
  api: ApiSettings;
  database: DatabaseSettings;
  cache: CacheSettings;
  logs: LogSettings;
}

export interface SystemSettingsProps {
  settings?: SystemSettingsData;
  onSave?: (settings: SystemSettingsData) => void;
  onReset?: () => void;
  onTestEmail?: () => Promise<boolean>;
}

/**
 * System-wide settings and configuration
 */
export function SystemSettings({
  settings: initialSettings,
  onSave,
  onReset,
  onTestEmail,
}: SystemSettingsProps) {
  const [settings, setSettings] = useState<SystemSettingsData>(
    initialSettings || getDefaultSettings()
  );
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = <K extends keyof SystemSettingsData>(
    category: K,
    field: keyof SystemSettingsData[K],
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
    showSuccessNotification('Settings saved successfully');
  };

  const handleReset = () => {
    setSettings(getDefaultSettings());
    setHasChanges(false);
    onReset?.();
    showSuccessNotification('Settings reset to defaults');
  };

  const handleTestEmail = async () => {
    try {
      const result = await onTestEmail?.();
      if (result) {
        showSuccessNotification('Test email sent successfully');
      } else {
        showErrorNotification('Failed to send test email');
      }
    } catch (error) {
      showErrorNotification('Error sending test email');
    }
  };

  const showSuccessNotification = (message: string) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const showErrorNotification = (message: string) => {
    setErrorMessage(message);
    setShowError(true);
    setTimeout(() => setShowError(false), 3000);
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5">System Settings</Typography>
          <Typography variant="body2" color="text.secondary">
            Configure system-wide settings and preferences
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            startIcon={<ResetIcon />}
            onClick={handleReset}
            disabled={!hasChanges}
          >
            Reset
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={!hasChanges}
          >
            Save Changes
          </Button>
        </Stack>
      </Stack>

      {showSuccess && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setShowSuccess(false)}>
          {successMessage}
        </Alert>
      )}

      {showError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setShowError(false)}>
          {errorMessage}
        </Alert>
      )}

      {hasChanges && (
        <Alert severity="info" sx={{ mb: 2 }}>
          You have unsaved changes. Remember to save your settings.
        </Alert>
      )}

      <Stack spacing={2}>
        {/* Email Settings */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandIcon />}>
            <Stack direction="row" spacing={2} alignItems="center">
              <EmailIcon />
              <Typography variant="h6">Email Configuration</Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="SMTP Host"
                    value={settings.email.host}
                    onChange={(e) => handleChange('email', 'host', e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="SMTP Port"
                    type="number"
                    value={settings.email.port}
                    onChange={(e) => handleChange('email', 'port', parseInt(e.target.value))}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Username"
                    value={settings.email.username}
                    onChange={(e) => handleChange('email', 'username', e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="From Address"
                    type="email"
                    value={settings.email.fromAddress}
                    onChange={(e) => handleChange('email', 'fromAddress', e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="From Name"
                    value={settings.email.fromName}
                    onChange={(e) => handleChange('email', 'fromName', e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.email.useSSL}
                        onChange={(e) => handleChange('email', 'useSSL', e.target.checked)}
                      />
                    }
                    label="Use SSL/TLS"
                  />
                </Grid>
              </Grid>
              <Button variant="outlined" onClick={handleTestEmail} sx={{ alignSelf: 'flex-start' }}>
                Send Test Email
              </Button>
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* Storage Settings */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandIcon />}>
            <Stack direction="row" spacing={2} alignItems="center">
              <StorageIcon />
              <Typography variant="h6">Storage Configuration</Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Storage Provider</InputLabel>
                  <Select
                    value={settings.storage.provider}
                    onChange={(e) => handleChange('storage', 'provider', e.target.value)}
                  >
                    <MenuItem value="local">Local File System</MenuItem>
                    <MenuItem value="s3">Amazon S3</MenuItem>
                    <MenuItem value="azure">Azure Blob Storage</MenuItem>
                    <MenuItem value="gcs">Google Cloud Storage</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Max File Size (MB)"
                  type="number"
                  value={settings.storage.maxFileSize}
                  onChange={(e) => handleChange('storage', 'maxFileSize', parseInt(e.target.value))}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Retention Days"
                  type="number"
                  value={settings.storage.retentionDays}
                  onChange={(e) => handleChange('storage', 'retentionDays', parseInt(e.target.value))}
                  fullWidth
                  helperText="Days to keep uploaded files"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Allowed File Types"
                  value={settings.storage.allowedFileTypes.join(', ')}
                  onChange={(e) =>
                    handleChange('storage', 'allowedFileTypes', e.target.value.split(',').map((s) => s.trim()))
                  }
                  fullWidth
                  helperText="Comma-separated list (e.g., jpg, png, pdf)"
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Backup Settings */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandIcon />}>
            <Stack direction="row" spacing={2} alignItems="center">
              <BackupIcon />
              <Typography variant="h6">Backup Configuration</Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.backup.enabled}
                      onChange={(e) => handleChange('backup', 'enabled', e.target.checked)}
                    />
                  }
                  label="Enable Automatic Backups"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth disabled={!settings.backup.enabled}>
                  <InputLabel>Backup Frequency</InputLabel>
                  <Select
                    value={settings.backup.frequency}
                    onChange={(e) => handleChange('backup', 'frequency', e.target.value)}
                  >
                    <MenuItem value="hourly">Hourly</MenuItem>
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Retention (Days)"
                  type="number"
                  value={settings.backup.retention}
                  onChange={(e) => handleChange('backup', 'retention', parseInt(e.target.value))}
                  fullWidth
                  disabled={!settings.backup.enabled}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.backup.includeUploads}
                      onChange={(e) => handleChange('backup', 'includeUploads', e.target.checked)}
                      disabled={!settings.backup.enabled}
                    />
                  }
                  label="Include Uploaded Files"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.backup.compression}
                      onChange={(e) => handleChange('backup', 'compression', e.target.checked)}
                      disabled={!settings.backup.enabled}
                    />
                  }
                  label="Use Compression"
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Security Settings */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandIcon />}>
            <Stack direction="row" spacing={2} alignItems="center">
              <SecurityIcon />
              <Typography variant="h6">Security Configuration</Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.security.enforceHTTPS}
                      onChange={(e) => handleChange('security', 'enforceHTTPS', e.target.checked)}
                    />
                  }
                  label="Enforce HTTPS"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.security.requireTwoFactor}
                      onChange={(e) => handleChange('security', 'requireTwoFactor', e.target.checked)}
                    />
                  }
                  label="Require Two-Factor Authentication"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Session Timeout (minutes)"
                  type="number"
                  value={settings.security.sessionTimeout}
                  onChange={(e) => handleChange('security', 'sessionTimeout', parseInt(e.target.value))}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Max Login Attempts"
                  type="number"
                  value={settings.security.maxLoginAttempts}
                  onChange={(e) => handleChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Min Password Length"
                  type="number"
                  value={settings.security.passwordMinLength}
                  onChange={(e) => handleChange('security', 'passwordMinLength', parseInt(e.target.value))}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Allowed Origins (CORS)"
                  value={settings.security.allowedOrigins.join(', ')}
                  onChange={(e) =>
                    handleChange('security', 'allowedOrigins', e.target.value.split(',').map((s) => s.trim()))
                  }
                  fullWidth
                  helperText="Comma-separated list of allowed origins"
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* API Settings */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandIcon />}>
            <Stack direction="row" spacing={2} alignItems="center">
              <ApiIcon />
              <Typography variant="h6">API Configuration</Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Rate Limit (requests/minute)"
                  type="number"
                  value={settings.api.rateLimit}
                  onChange={(e) => handleChange('api', 'rateLimit', parseInt(e.target.value))}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="API Version"
                  value={settings.api.apiVersion}
                  onChange={(e) => handleChange('api', 'apiVersion', e.target.value)}
                  fullWidth
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.api.enableCORS}
                      onChange={(e) => handleChange('api', 'enableCORS', e.target.checked)}
                    />
                  }
                  label="Enable CORS"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.api.webhooksEnabled}
                      onChange={(e) => handleChange('api', 'webhooksEnabled', e.target.checked)}
                    />
                  }
                  label="Enable Webhooks"
                />
              </Grid>
              {settings.api.webhooksEnabled && (
                <Grid item xs={12}>
                  <TextField
                    label="Webhook Secret"
                    type="password"
                    value={settings.api.webhookSecret}
                    onChange={(e) => handleChange('api', 'webhookSecret', e.target.value)}
                    fullWidth
                  />
                </Grid>
              )}
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Database Settings */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandIcon />}>
            <Stack direction="row" spacing={2} alignItems="center">
              <DatabaseIcon />
              <Typography variant="h6">Database Configuration</Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Connection Pool Size"
                  type="number"
                  value={settings.database.connectionPoolSize}
                  onChange={(e) => handleChange('database', 'connectionPoolSize', parseInt(e.target.value))}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Query Timeout (seconds)"
                  type="number"
                  value={settings.database.queryTimeout}
                  onChange={(e) => handleChange('database', 'queryTimeout', parseInt(e.target.value))}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.database.enableSlowQueryLog}
                      onChange={(e) => handleChange('database', 'enableSlowQueryLog', e.target.checked)}
                    />
                  }
                  label="Enable Slow Query Log"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Slow Query Threshold (ms)"
                  type="number"
                  value={settings.database.slowQueryThreshold}
                  onChange={(e) => handleChange('database', 'slowQueryThreshold', parseInt(e.target.value))}
                  fullWidth
                  disabled={!settings.database.enableSlowQueryLog}
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Cache Settings */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandIcon />}>
            <Stack direction="row" spacing={2} alignItems="center">
              <CacheIcon />
              <Typography variant="h6">Cache Configuration</Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.cache.enabled}
                      onChange={(e) => handleChange('cache', 'enabled', e.target.checked)}
                    />
                  }
                  label="Enable Caching"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth disabled={!settings.cache.enabled}>
                  <InputLabel>Cache Provider</InputLabel>
                  <Select
                    value={settings.cache.provider}
                    onChange={(e) => handleChange('cache', 'provider', e.target.value)}
                  >
                    <MenuItem value="redis">Redis</MenuItem>
                    <MenuItem value="memcached">Memcached</MenuItem>
                    <MenuItem value="memory">In-Memory</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="TTL (seconds)"
                  type="number"
                  value={settings.cache.ttl}
                  onChange={(e) => handleChange('cache', 'ttl', parseInt(e.target.value))}
                  fullWidth
                  disabled={!settings.cache.enabled}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Max Size (MB)"
                  type="number"
                  value={settings.cache.maxSize}
                  onChange={(e) => handleChange('cache', 'maxSize', parseInt(e.target.value))}
                  fullWidth
                  disabled={!settings.cache.enabled}
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Log Settings */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandIcon />}>
            <Stack direction="row" spacing={2} alignItems="center">
              <LogIcon />
              <Typography variant="h6">Logging Configuration</Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Log Level</InputLabel>
                  <Select
                    value={settings.logs.level}
                    onChange={(e) => handleChange('logs', 'level', e.target.value)}
                  >
                    <MenuItem value="debug">Debug</MenuItem>
                    <MenuItem value="info">Info</MenuItem>
                    <MenuItem value="warning">Warning</MenuItem>
                    <MenuItem value="error">Error</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Log Retention (days)"
                  type="number"
                  value={settings.logs.retention}
                  onChange={(e) => handleChange('logs', 'retention', parseInt(e.target.value))}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.logs.includeStackTrace}
                      onChange={(e) => handleChange('logs', 'includeStackTrace', e.target.checked)}
                    />
                  }
                  label="Include Stack Trace"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.logs.logToFile}
                      onChange={(e) => handleChange('logs', 'logToFile', e.target.checked)}
                    />
                  }
                  label="Log to File"
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Stack>
    </Box>
  );
}

/**
 * Get default system settings
 */
function getDefaultSettings(): SystemSettingsData {
  return {
    email: {
      host: 'smtp.gmail.com',
      port: 587,
      username: '',
      useSSL: true,
      fromAddress: 'noreply@growmonitoring.com',
      fromName: 'Grow Monitoring System',
    },
    storage: {
      provider: 'local',
      maxFileSize: 10,
      allowedFileTypes: ['jpg', 'jpeg', 'png', 'pdf', 'csv', 'xlsx'],
      retentionDays: 365,
    },
    backup: {
      enabled: true,
      frequency: 'daily',
      retention: 30,
      includeUploads: true,
      compression: true,
    },
    security: {
      enforceHTTPS: true,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      passwordMinLength: 8,
      requireTwoFactor: false,
      allowedOrigins: ['https://app.growmonitoring.com'],
    },
    api: {
      rateLimit: 100,
      enableCORS: true,
      apiVersion: 'v1',
      webhooksEnabled: false,
      webhookSecret: '',
    },
    database: {
      connectionPoolSize: 20,
      queryTimeout: 30,
      enableSlowQueryLog: true,
      slowQueryThreshold: 1000,
    },
    cache: {
      enabled: true,
      provider: 'redis',
      ttl: 3600,
      maxSize: 256,
    },
    logs: {
      level: 'info',
      retention: 90,
      includeStackTrace: true,
      logToFile: true,
    },
  };
}
