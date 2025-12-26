import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Slider,
  Stack,
  Switch,
  TextField,
  Typography,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  ExpandMore as ExpandIcon,
  Memory as PerformanceIcon,
  Storage as StorageIcon,
  CloudSync as SyncIcon,
  Security as SecurityIcon,
  BugReport as DebugIcon,
  Build as MaintenanceIcon,
  Warning as WarningIcon,
  Delete as DeleteIcon,
  CloudDownload as BackupIcon,
  RestartAlt as RestartIcon,
} from '@mui/icons-material';

export interface SystemConfiguration {
  // Performance
  cachingEnabled: boolean;
  cacheSize: number;
  maxConcurrentRequests: number;
  requestTimeout: number;

  // Storage
  storageQuota: number;
  autoCleanup: boolean;
  retentionDays: number;

  // Sync
  syncEnabled: boolean;
  syncInterval: number;
  conflictResolution: 'local' | 'remote' | 'manual';

  // Security
  sessionTimeout: number;
  requireMFA: boolean;
  passwordExpiration: number;
  ipWhitelist: string[];

  // Debug
  debugMode: boolean;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  performanceMetrics: boolean;
}

export interface SystemConfigProps {
  config?: SystemConfiguration;
  systemInfo?: {
    version: string;
    uptime: number;
    memoryUsage: number;
    storageUsed: number;
    totalStorage: number;
  };
  onChange?: (config: SystemConfiguration) => void;
  onBackup?: () => void;
  onRestore?: () => void;
  onClearCache?: () => void;
  onRestart?: () => void;
}

/**
 * Advanced system configuration and maintenance
 */
export function SystemConfig({
  config: initialConfig,
  systemInfo,
  onChange,
  onBackup,
  onRestore,
  onClearCache,
  onRestart,
}: SystemConfigProps) {
  const [config, setConfig] = useState<SystemConfiguration>(
    initialConfig || {
      cachingEnabled: true,
      cacheSize: 100,
      maxConcurrentRequests: 10,
      requestTimeout: 30,
      storageQuota: 500,
      autoCleanup: true,
      retentionDays: 90,
      syncEnabled: true,
      syncInterval: 300,
      conflictResolution: 'local',
      sessionTimeout: 30,
      requireMFA: false,
      passwordExpiration: 90,
      ipWhitelist: [],
      debugMode: false,
      logLevel: 'info',
      performanceMetrics: false,
    }
  );

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    action: () => void;
  } | null>(null);

  const updateConfig = <K extends keyof SystemConfiguration>(
    key: K,
    value: SystemConfiguration[K]
  ) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    if (onChange) {
      onChange(newConfig);
    }
  };

  const handleDangerousAction = (title: string, message: string, action: () => void) => {
    setConfirmDialog({ open: true, title, message, action });
  };

  const executeConfirmedAction = () => {
    if (confirmDialog) {
      confirmDialog.action();
      setConfirmDialog(null);
    }
  };

  const defaultSystemInfo = systemInfo || {
    version: '2.54.0',
    uptime: 86400,
    memoryUsage: 45,
    storageUsed: 250,
    totalStorage: 500,
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  return (
    <Stack spacing={2}>
      {/* System Information */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            System Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  Version
                </Typography>
                <Typography variant="h6">{defaultSystemInfo.version}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  Uptime
                </Typography>
                <Typography variant="h6">{formatUptime(defaultSystemInfo.uptime)}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  Memory
                </Typography>
                <Typography variant="h6">{defaultSystemInfo.memoryUsage}%</Typography>
                <LinearProgress
                  variant="determinate"
                  value={defaultSystemInfo.memoryUsage}
                  sx={{ mt: 1 }}
                />
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  Storage
                </Typography>
                <Typography variant="h6">
                  {defaultSystemInfo.storageUsed} / {defaultSystemInfo.totalStorage} MB
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={(defaultSystemInfo.storageUsed / defaultSystemInfo.totalStorage) * 100}
                  sx={{ mt: 1 }}
                />
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Performance */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandIcon />}>
          <Stack direction="row" spacing={1} alignItems="center">
            <PerformanceIcon />
            <Typography variant="h6">Performance</Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={3}>
            <FormControlLabel
              control={
                <Switch
                  checked={config.cachingEnabled}
                  onChange={(e) => updateConfig('cachingEnabled', e.target.checked)}
                />
              }
              label={
                <Stack>
                  <Typography variant="body2">Enable Caching</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Cache frequently accessed data for better performance
                  </Typography>
                </Stack>
              }
            />

            {config.cachingEnabled && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Cache Size: {config.cacheSize} MB
                </Typography>
                <Slider
                  value={config.cacheSize}
                  onChange={(_, value) => updateConfig('cacheSize', value as number)}
                  min={50}
                  max={500}
                  step={50}
                  marks={[
                    { value: 50, label: '50 MB' },
                    { value: 250, label: '250 MB' },
                    { value: 500, label: '500 MB' },
                  ]}
                  valueLabelDisplay="auto"
                />
              </Box>
            )}

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Max Concurrent Requests: {config.maxConcurrentRequests}
              </Typography>
              <Slider
                value={config.maxConcurrentRequests}
                onChange={(_, value) => updateConfig('maxConcurrentRequests', value as number)}
                min={5}
                max={50}
                step={5}
                marks
                valueLabelDisplay="auto"
              />
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Request Timeout: {config.requestTimeout}s
              </Typography>
              <Slider
                value={config.requestTimeout}
                onChange={(_, value) => updateConfig('requestTimeout', value as number)}
                min={10}
                max={120}
                step={10}
                marks
                valueLabelDisplay="auto"
              />
            </Box>

            <Button
              variant="outlined"
              startIcon={<DeleteIcon />}
              onClick={() =>
                handleDangerousAction(
                  'Clear Cache',
                  'This will clear all cached data. The system may be slower until the cache is rebuilt.',
                  () => onClearCache?.()
                )
              }
            >
              Clear Cache
            </Button>
          </Stack>
        </AccordionDetails>
      </Accordion>

      {/* Storage */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandIcon />}>
          <Stack direction="row" spacing={1} alignItems="center">
            <StorageIcon />
            <Typography variant="h6">Storage & Data</Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={3}>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Storage Quota: {config.storageQuota} MB
              </Typography>
              <Slider
                value={config.storageQuota}
                onChange={(_, value) => updateConfig('storageQuota', value as number)}
                min={100}
                max={2000}
                step={100}
                marks={[
                  { value: 100, label: '100 MB' },
                  { value: 1000, label: '1 GB' },
                  { value: 2000, label: '2 GB' },
                ]}
                valueLabelDisplay="auto"
              />
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={config.autoCleanup}
                  onChange={(e) => updateConfig('autoCleanup', e.target.checked)}
                />
              }
              label={
                <Stack>
                  <Typography variant="body2">Auto Cleanup</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Automatically delete old data to free up space
                  </Typography>
                </Stack>
              }
            />

            {config.autoCleanup && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Data Retention: {config.retentionDays} days
                </Typography>
                <Slider
                  value={config.retentionDays}
                  onChange={(_, value) => updateConfig('retentionDays', value as number)}
                  min={30}
                  max={365}
                  step={30}
                  marks={[
                    { value: 30, label: '30d' },
                    { value: 90, label: '90d' },
                    { value: 180, label: '180d' },
                    { value: 365, label: '1y' },
                  ]}
                  valueLabelDisplay="auto"
                />
              </Box>
            )}
          </Stack>
        </AccordionDetails>
      </Accordion>

      {/* Sync */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandIcon />}>
          <Stack direction="row" spacing={1} alignItems="center">
            <SyncIcon />
            <Typography variant="h6">Synchronization</Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={3}>
            <FormControlLabel
              control={
                <Switch
                  checked={config.syncEnabled}
                  onChange={(e) => updateConfig('syncEnabled', e.target.checked)}
                />
              }
              label={
                <Stack>
                  <Typography variant="body2">Enable Cloud Sync</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Synchronize data across devices
                  </Typography>
                </Stack>
              }
            />

            {config.syncEnabled && (
              <>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Sync Interval: {config.syncInterval}s
                  </Typography>
                  <Slider
                    value={config.syncInterval}
                    onChange={(_, value) => updateConfig('syncInterval', value as number)}
                    min={60}
                    max={3600}
                    step={60}
                    marks={[
                      { value: 60, label: '1m' },
                      { value: 300, label: '5m' },
                      { value: 1800, label: '30m' },
                      { value: 3600, label: '1h' },
                    ]}
                    valueLabelDisplay="auto"
                  />
                </Box>

                <FormControl fullWidth>
                  <InputLabel>Conflict Resolution</InputLabel>
                  <Select
                    value={config.conflictResolution}
                    onChange={(e) => updateConfig('conflictResolution', e.target.value as any)}
                    label="Conflict Resolution"
                  >
                    <MenuItem value="local">Prefer Local</MenuItem>
                    <MenuItem value="remote">Prefer Remote</MenuItem>
                    <MenuItem value="manual">Manual Resolution</MenuItem>
                  </Select>
                </FormControl>
              </>
            )}
          </Stack>
        </AccordionDetails>
      </Accordion>

      {/* Security */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandIcon />}>
          <Stack direction="row" spacing={1} alignItems="center">
            <SecurityIcon />
            <Typography variant="h6">Security</Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={3}>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Session Timeout: {config.sessionTimeout} minutes
              </Typography>
              <Slider
                value={config.sessionTimeout}
                onChange={(_, value) => updateConfig('sessionTimeout', value as number)}
                min={5}
                max={120}
                step={5}
                marks={[
                  { value: 5, label: '5m' },
                  { value: 30, label: '30m' },
                  { value: 60, label: '1h' },
                  { value: 120, label: '2h' },
                ]}
                valueLabelDisplay="auto"
              />
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={config.requireMFA}
                  onChange={(e) => updateConfig('requireMFA', e.target.checked)}
                />
              }
              label={
                <Stack>
                  <Typography variant="body2">Require Two-Factor Authentication</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Enforce MFA for all users
                  </Typography>
                </Stack>
              }
            />

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Password Expiration: {config.passwordExpiration} days
              </Typography>
              <Slider
                value={config.passwordExpiration}
                onChange={(_, value) => updateConfig('passwordExpiration', value as number)}
                min={30}
                max={365}
                step={30}
                marks={[
                  { value: 30, label: '30d' },
                  { value: 90, label: '90d' },
                  { value: 180, label: '180d' },
                  { value: 365, label: '1y' },
                ]}
                valueLabelDisplay="auto"
              />
            </Box>
          </Stack>
        </AccordionDetails>
      </Accordion>

      {/* Debug & Logging */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandIcon />}>
          <Stack direction="row" spacing={1} alignItems="center">
            <DebugIcon />
            <Typography variant="h6">Debug & Logging</Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={3}>
            <Alert severity="warning" icon={<WarningIcon />}>
              Debug mode is intended for development only and may impact performance.
            </Alert>

            <FormControlLabel
              control={
                <Switch
                  checked={config.debugMode}
                  onChange={(e) => updateConfig('debugMode', e.target.checked)}
                />
              }
              label={
                <Stack>
                  <Typography variant="body2">Debug Mode</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Enable detailed logging and debug tools
                  </Typography>
                </Stack>
              }
            />

            <FormControl fullWidth>
              <InputLabel>Log Level</InputLabel>
              <Select
                value={config.logLevel}
                onChange={(e) => updateConfig('logLevel', e.target.value as any)}
                label="Log Level"
              >
                <MenuItem value="error">Error</MenuItem>
                <MenuItem value="warn">Warning</MenuItem>
                <MenuItem value="info">Info</MenuItem>
                <MenuItem value="debug">Debug</MenuItem>
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={config.performanceMetrics}
                  onChange={(e) => updateConfig('performanceMetrics', e.target.checked)}
                />
              }
              label={
                <Stack>
                  <Typography variant="body2">Performance Metrics</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Collect detailed performance data
                  </Typography>
                </Stack>
              }
            />
          </Stack>
        </AccordionDetails>
      </Accordion>

      {/* Maintenance */}
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} alignItems="center">
              <MaintenanceIcon />
              <Typography variant="h6">Maintenance</Typography>
            </Stack>
            <Divider />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<BackupIcon />}
                  onClick={onBackup}
                >
                  Create Backup
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button variant="outlined" fullWidth startIcon={<BackupIcon />} onClick={onRestore}>
                  Restore Backup
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  fullWidth
                  color="warning"
                  startIcon={<RestartIcon />}
                  onClick={() =>
                    handleDangerousAction(
                      'Restart System',
                      'This will restart the system. All active sessions will be terminated. Are you sure?',
                      () => onRestart?.()
                    )
                  }
                >
                  Restart System
                </Button>
              </Grid>
            </Grid>
          </Stack>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      {confirmDialog && (
        <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog(null)}>
          <DialogTitle>{confirmDialog.title}</DialogTitle>
          <DialogContent>
            <DialogContentText>{confirmDialog.message}</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDialog(null)}>Cancel</Button>
            <Button onClick={executeConfirmedAction} color="warning" variant="contained">
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Stack>
  );
}
