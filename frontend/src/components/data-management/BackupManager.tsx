import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Backup as BackupIcon,
  Restore as RestoreIcon,
  CloudUpload as CloudIcon,
  Storage as LocalIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Schedule as ScheduleIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Pending as PendingIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

export type BackupType = 'full' | 'incremental' | 'differential';
export type BackupLocation = 'local' | 'cloud' | 'both';
export type BackupStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface Backup {
  id: string;
  name: string;
  type: BackupType;
  location: BackupLocation;
  size: number; // bytes
  status: BackupStatus;
  createdAt: Date;
  completedAt?: Date;
  recordCount?: number;
  encrypted?: boolean;
  compressed?: boolean;
  downloadUrl?: string;
}

export interface AutoBackupConfig {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string; // HH:MM format
  type: BackupType;
  location: BackupLocation;
  retentionDays: number;
  encrypt: boolean;
  compress: boolean;
}

export interface BackupManagerProps {
  backups?: Backup[];
  autoBackupConfig?: AutoBackupConfig;
  onCreateBackup?: (config: CreateBackupConfig) => Promise<void>;
  onRestoreBackup?: (backupId: string) => Promise<void>;
  onDeleteBackup?: (backupId: string) => Promise<void>;
  onDownloadBackup?: (backupId: string) => void;
  onSaveAutoBackup?: (config: AutoBackupConfig) => void;
}

export interface CreateBackupConfig {
  name: string;
  type: BackupType;
  location: BackupLocation;
  encrypt: boolean;
  compress: boolean;
}

/**
 * Backup and restore management component
 */
export function BackupManager({
  backups: initialBackups = [],
  autoBackupConfig: initialAutoConfig,
  onCreateBackup,
  onRestoreBackup,
  onDeleteBackup,
  onDownloadBackup,
  onSaveAutoBackup,
}: BackupManagerProps) {
  const [backups, setBackups] = useState<Backup[]>(
    initialBackups.length > 0 ? initialBackups : getSampleBackups()
  );
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [restoreConfirmOpen, setRestoreConfirmOpen] = useState(false);
  const [selectedBackupId, setSelectedBackupId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [progress, setProgress] = useState(0);

  // Create backup config
  const [backupName, setBackupName] = useState('');
  const [backupType, setBackupType] = useState<BackupType>('full');
  const [backupLocation, setBackupLocation] = useState<BackupLocation>('local');
  const [encrypt, setEncrypt] = useState(true);
  const [compress, setCompress] = useState(true);

  // Auto backup config
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(
    initialAutoConfig?.enabled || false
  );
  const [autoBackupFrequency, setAutoBackupFrequency] = useState<'daily' | 'weekly' | 'monthly'>(
    initialAutoConfig?.frequency || 'daily'
  );
  const [autoBackupTime, setAutoBackupTime] = useState(initialAutoConfig?.time || '02:00');
  const [autoBackupType, setAutoBackupType] = useState<BackupType>(
    initialAutoConfig?.type || 'incremental'
  );
  const [autoBackupLocation, setAutoBackupLocation] = useState<BackupLocation>(
    initialAutoConfig?.location || 'cloud'
  );
  const [retentionDays, setRetentionDays] = useState(initialAutoConfig?.retentionDays || 30);
  const [autoEncrypt, setAutoEncrypt] = useState(initialAutoConfig?.encrypt || true);
  const [autoCompress, setAutoCompress] = useState(initialAutoConfig?.compress || true);

  const handleCreateBackup = async () => {
    const config: CreateBackupConfig = {
      name: backupName || `Backup ${new Date().toLocaleDateString()}`,
      type: backupType,
      location: backupLocation,
      encrypt,
      compress,
    };

    setCreating(true);
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 300);

    try {
      if (onCreateBackup) {
        await onCreateBackup(config);
      }

      // Add to backups list
      const newBackup: Backup = {
        id: `backup-${Date.now()}`,
        name: config.name,
        type: config.type,
        location: config.location,
        size: Math.floor(Math.random() * 50000000) + 10000000, // Random 10-50 MB
        status: 'completed',
        createdAt: new Date(),
        completedAt: new Date(),
        recordCount: Math.floor(Math.random() * 5000) + 1000,
        encrypted: config.encrypt,
        compressed: config.compress,
        downloadUrl: `/backups/${Date.now()}`,
      };

      setBackups([newBackup, ...backups]);
      setCreateDialogOpen(false);
      resetCreateForm();
    } catch (error) {
      console.error('Backup creation failed:', error);
    } finally {
      setCreating(false);
      setProgress(0);
    }
  };

  const handleRestore = async () => {
    if (!selectedBackupId) return;

    try {
      if (onRestoreBackup) {
        await onRestoreBackup(selectedBackupId);
      }
      setRestoreConfirmOpen(false);
      setSelectedBackupId(null);
    } catch (error) {
      console.error('Restore failed:', error);
    }
  };

  const handleDelete = async (backupId: string) => {
    if (onDeleteBackup) {
      await onDeleteBackup(backupId);
    }
    setBackups(backups.filter((b) => b.id !== backupId));
  };

  const handleSaveAutoBackup = () => {
    const config: AutoBackupConfig = {
      enabled: autoBackupEnabled,
      frequency: autoBackupFrequency,
      time: autoBackupTime,
      type: autoBackupType,
      location: autoBackupLocation,
      retentionDays,
      encrypt: autoEncrypt,
      compress: autoCompress,
    };

    onSaveAutoBackup?.(config);
    setSettingsDialogOpen(false);
  };

  const resetCreateForm = () => {
    setBackupName('');
    setBackupType('full');
    setBackupLocation('local');
    setEncrypt(true);
    setCompress(true);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getStatusIcon = (status: BackupStatus) => {
    switch (status) {
      case 'completed':
        return <SuccessIcon color="success" />;
      case 'failed':
        return <ErrorIcon color="error" />;
      case 'running':
        return <PendingIcon color="info" />;
      default:
        return <PendingIcon />;
    }
  };

  const getLocationIcon = (location: BackupLocation) => {
    switch (location) {
      case 'cloud':
        return <CloudIcon />;
      case 'local':
        return <LocalIcon />;
      case 'both':
        return (
          <Stack direction="row" spacing={0.5}>
            <LocalIcon fontSize="small" />
            <CloudIcon fontSize="small" />
          </Stack>
        );
    }
  };

  const getTotalBackupSize = () => {
    return backups.reduce((total, backup) => total + backup.size, 0);
  };

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5">Backup & Restore</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage data backups and restore points
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <IconButton onClick={setSettingsDialogOpen.bind(null, true)}>
            <SettingsIcon />
          </IconButton>
          <Button variant="contained" startIcon={<BackupIcon />} onClick={() => setCreateDialogOpen(true)}>
            Create Backup
          </Button>
        </Stack>
      </Stack>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack alignItems="center">
                <Typography variant="h4">{backups.length}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Backups
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack alignItems="center">
                <Typography variant="h4">{formatFileSize(getTotalBackupSize())}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Size
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack alignItems="center">
                <Typography variant="h4">
                  {backups.filter((b) => b.createdAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  This Week
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack alignItems="center">
                <Chip
                  label={autoBackupEnabled ? 'Active' : 'Inactive'}
                  color={autoBackupEnabled ? 'success' : 'default'}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                  Auto Backup
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Auto Backup Status */}
      {autoBackupEnabled && (
        <Alert severity="info" sx={{ mb: 3 }} icon={<ScheduleIcon />}>
          Automatic {autoBackupFrequency} backups scheduled at {autoBackupTime}. Retention: {retentionDays} days.
        </Alert>
      )}

      {/* Backups List */}
      <Card>
        <CardHeader
          title="Backup History"
          action={
            <IconButton>
              <RefreshIcon />
            </IconButton>
          }
        />
        <CardContent>
          {backups.length === 0 ? (
            <Alert severity="info">No backups yet. Create your first backup above!</Alert>
          ) : (
            <List>
              {backups.map((backup) => (
                <React.Fragment key={backup.id}>
                  <ListItem>
                    <ListItemIcon>{getStatusIcon(backup.status)}</ListItemIcon>
                    <ListItemText
                      primary={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="subtitle1">{backup.name}</Typography>
                          <Chip label={backup.type} size="small" />
                          {backup.encrypted && <Chip label="Encrypted" size="small" color="success" />}
                          {backup.compressed && <Chip label="Compressed" size="small" variant="outlined" />}
                        </Stack>
                      }
                      secondary={
                        <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                          <Stack direction="row" spacing={2}>
                            <Typography variant="caption">
                              Created: {backup.createdAt.toLocaleString()}
                            </Typography>
                            {backup.completedAt && (
                              <Typography variant="caption">
                                Completed: {backup.completedAt.toLocaleString()}
                              </Typography>
                            )}
                          </Stack>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Typography variant="caption">
                              Size: {formatFileSize(backup.size)}
                            </Typography>
                            {backup.recordCount && (
                              <Typography variant="caption">
                                Records: {backup.recordCount.toLocaleString()}
                              </Typography>
                            )}
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              {getLocationIcon(backup.location)}
                              <Typography variant="caption">{backup.location}</Typography>
                            </Stack>
                          </Stack>
                        </Stack>
                      }
                    />
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Restore from backup">
                        <IconButton
                          color="primary"
                          onClick={() => {
                            setSelectedBackupId(backup.id);
                            setRestoreConfirmOpen(true);
                          }}
                        >
                          <RestoreIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Download backup">
                        <IconButton onClick={() => onDownloadBackup?.(backup.id)}>
                          <DownloadIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete backup">
                        <IconButton color="error" onClick={() => handleDelete(backup.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Create Backup Dialog */}
      <Dialog open={createDialogOpen} onClose={() => !creating && setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Backup</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Backup Name"
              value={backupName}
              onChange={(e) => setBackupName(e.target.value)}
              placeholder={`Backup ${new Date().toLocaleDateString()}`}
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>Backup Type</InputLabel>
              <Select value={backupType} onChange={(e) => setBackupType(e.target.value as BackupType)}>
                <MenuItem value="full">Full Backup (all data)</MenuItem>
                <MenuItem value="incremental">Incremental (changes since last backup)</MenuItem>
                <MenuItem value="differential">Differential (changes since last full backup)</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Location</InputLabel>
              <Select value={backupLocation} onChange={(e) => setBackupLocation(e.target.value as BackupLocation)}>
                <MenuItem value="local">Local Storage</MenuItem>
                <MenuItem value="cloud">Cloud Storage</MenuItem>
                <MenuItem value="both">Both (Local + Cloud)</MenuItem>
              </Select>
            </FormControl>

            <Stack spacing={1}>
              <FormControlLabel
                control={<Switch checked={encrypt} onChange={(e) => setEncrypt(e.target.checked)} />}
                label="Encrypt backup (recommended)"
              />
              <FormControlLabel
                control={<Switch checked={compress} onChange={(e) => setCompress(e.target.checked)} />}
                label="Compress backup (reduces size)"
              />
            </Stack>

            {creating && (
              <Box>
                <Typography variant="body2" gutterBottom>
                  Creating backup... {progress}%
                </Typography>
                <LinearProgress variant="determinate" value={progress} />
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)} disabled={creating}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleCreateBackup} disabled={creating} startIcon={<BackupIcon />}>
            {creating ? 'Creating...' : 'Create Backup'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={settingsDialogOpen} onClose={() => setSettingsDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Auto Backup Settings</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControlLabel
              control={
                <Switch checked={autoBackupEnabled} onChange={(e) => setAutoBackupEnabled(e.target.checked)} />
              }
              label="Enable automatic backups"
            />

            {autoBackupEnabled && (
              <>
                <FormControl fullWidth>
                  <InputLabel>Frequency</InputLabel>
                  <Select
                    value={autoBackupFrequency}
                    onChange={(e) => setAutoBackupFrequency(e.target.value as any)}
                  >
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  label="Backup Time"
                  type="time"
                  value={autoBackupTime}
                  onChange={(e) => setAutoBackupTime(e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />

                <FormControl fullWidth>
                  <InputLabel>Backup Type</InputLabel>
                  <Select value={autoBackupType} onChange={(e) => setAutoBackupType(e.target.value as BackupType)}>
                    <MenuItem value="full">Full Backup</MenuItem>
                    <MenuItem value="incremental">Incremental</MenuItem>
                    <MenuItem value="differential">Differential</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Location</InputLabel>
                  <Select
                    value={autoBackupLocation}
                    onChange={(e) => setAutoBackupLocation(e.target.value as BackupLocation)}
                  >
                    <MenuItem value="local">Local Storage</MenuItem>
                    <MenuItem value="cloud">Cloud Storage</MenuItem>
                    <MenuItem value="both">Both</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  label="Retention Period (days)"
                  type="number"
                  value={retentionDays}
                  onChange={(e) => setRetentionDays(parseInt(e.target.value))}
                  helperText="Backups older than this will be automatically deleted"
                  fullWidth
                  inputProps={{ min: 1 }}
                />

                <Stack spacing={1}>
                  <FormControlLabel
                    control={<Switch checked={autoEncrypt} onChange={(e) => setAutoEncrypt(e.target.checked)} />}
                    label="Encrypt backups"
                  />
                  <FormControlLabel
                    control={<Switch checked={autoCompress} onChange={(e) => setAutoCompress(e.target.checked)} />}
                    label="Compress backups"
                  />
                </Stack>
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveAutoBackup}>
            Save Settings
          </Button>
        </DialogActions>
      </Dialog>

      {/* Restore Confirmation Dialog */}
      <Dialog open={restoreConfirmOpen} onClose={() => setRestoreConfirmOpen(false)}>
        <DialogTitle>Confirm Restore</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Restoring from a backup will replace all current data. This action cannot be undone.
            </Typography>
          </Alert>
          <Typography variant="body2">
            Are you sure you want to restore from this backup?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRestoreConfirmOpen(false)}>Cancel</Button>
          <Button variant="contained" color="warning" onClick={handleRestore} startIcon={<RestoreIcon />}>
            Restore
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

/**
 * Generate sample backups
 */
function getSampleBackups(): Backup[] {
  return [
    {
      id: '1',
      name: 'Weekly Backup - Dec 2024',
      type: 'full',
      location: 'both',
      size: 45678912,
      status: 'completed',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000),
      recordCount: 4523,
      encrypted: true,
      compressed: true,
      downloadUrl: '/backups/1',
    },
    {
      id: '2',
      name: 'Daily Incremental',
      type: 'incremental',
      location: 'cloud',
      size: 12345678,
      status: 'completed',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 2 * 60 * 1000),
      recordCount: 245,
      encrypted: true,
      compressed: true,
      downloadUrl: '/backups/2',
    },
    {
      id: '3',
      name: 'Manual Backup Before Update',
      type: 'full',
      location: 'local',
      size: 38901234,
      status: 'completed',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 1000),
      recordCount: 3892,
      encrypted: false,
      compressed: true,
      downloadUrl: '/backups/3',
    },
  ];
}
