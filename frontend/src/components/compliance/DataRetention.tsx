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
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
  Alert,
  FormControlLabel,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  Storage as StorageIcon,
  DeleteSweep as PurgeIcon,
  Archive as ArchiveIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  CheckCircle as ActiveIcon,
} from '@mui/icons-material';

export type RetentionStatus = 'active' | 'pending' | 'archived' | 'purged';
export type DataCategory = 'user' | 'plant' | 'sensor' | 'audit' | 'backup' | 'media' | 'logs';

export interface RetentionPolicy {
  id: string;
  name: string;
  category: DataCategory;
  description: string;
  retentionDays: number;
  archiveDays?: number;
  autoDelete: boolean;
  enabled: boolean;
  appliesTo: string[];
  excludes?: string[];
  createdAt: Date;
  lastRun?: Date;
  recordsAffected?: number;
}

export interface RetentionJob {
  id: string;
  policyId: string;
  policyName: string;
  status: 'running' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date;
  recordsProcessed: number;
  recordsArchived: number;
  recordsDeleted: number;
  errorMessage?: string;
}

export interface DataRetentionProps {
  policies?: RetentionPolicy[];
  jobs?: RetentionJob[];
  onCreatePolicy?: (policy: Omit<RetentionPolicy, 'id' | 'createdAt'>) => void;
  onUpdatePolicy?: (policyId: string, updates: Partial<RetentionPolicy>) => void;
  onDeletePolicy?: (policyId: string) => void;
  onRunPolicy?: (policyId: string) => Promise<void>;
}

/**
 * Data retention policy management
 */
export function DataRetention({
  policies: initialPolicies = [],
  jobs: initialJobs = [],
  onCreatePolicy,
  onUpdatePolicy,
  onDeletePolicy,
  onRunPolicy,
}: DataRetentionProps) {
  const [policies, setPolicies] = useState<RetentionPolicy[]>(
    initialPolicies.length > 0 ? initialPolicies : getSamplePolicies()
  );
  const [jobs, setJobs] = useState<RetentionJob[]>(
    initialJobs.length > 0 ? initialJobs : getSampleJobs()
  );
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<RetentionPolicy | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Form states
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<DataCategory>('user');
  const [formDescription, setFormDescription] = useState('');
  const [formRetentionDays, setFormRetentionDays] = useState(365);
  const [formArchiveDays, setFormArchiveDays] = useState(30);
  const [formAutoDelete, setFormAutoDelete] = useState(false);
  const [formEnabled, setFormEnabled] = useState(true);

  const handleCreate = () => {
    const newPolicy: RetentionPolicy = {
      id: (policies.length + 1).toString(),
      name: formName,
      category: formCategory,
      description: formDescription,
      retentionDays: formRetentionDays,
      archiveDays: formArchiveDays,
      autoDelete: formAutoDelete,
      enabled: formEnabled,
      appliesTo: ['*'],
      createdAt: new Date(),
    };

    setPolicies([...policies, newPolicy]);
    onCreatePolicy?.(newPolicy);
    showSuccessNotification('Retention policy created successfully');
    resetForm();
    setCreateDialogOpen(false);
  };

  const handleUpdate = () => {
    if (selectedPolicy) {
      const updates: Partial<RetentionPolicy> = {
        name: formName,
        description: formDescription,
        retentionDays: formRetentionDays,
        archiveDays: formArchiveDays,
        autoDelete: formAutoDelete,
        enabled: formEnabled,
      };

      setPolicies(policies.map((p) => (p.id === selectedPolicy.id ? { ...p, ...updates } : p)));
      onUpdatePolicy?.(selectedPolicy.id, updates);
      showSuccessNotification('Retention policy updated successfully');
      resetForm();
      setEditDialogOpen(false);
    }
  };

  const handleDelete = (policyId: string) => {
    setPolicies(policies.filter((p) => p.id !== policyId));
    onDeletePolicy?.(policyId);
    showSuccessNotification('Retention policy deleted successfully');
  };

  const handleEdit = (policy: RetentionPolicy) => {
    setFormName(policy.name);
    setFormCategory(policy.category);
    setFormDescription(policy.description);
    setFormRetentionDays(policy.retentionDays);
    setFormArchiveDays(policy.archiveDays || 30);
    setFormAutoDelete(policy.autoDelete);
    setFormEnabled(policy.enabled);
    setSelectedPolicy(policy);
    setEditDialogOpen(true);
  };

  const handleToggleEnabled = (policyId: string) => {
    setPolicies(
      policies.map((p) => (p.id === policyId ? { ...p, enabled: !p.enabled } : p))
    );
  };

  const handleRunPolicy = async (policyId: string) => {
    await onRunPolicy?.(policyId);
    setPolicies(
      policies.map((p) => (p.id === policyId ? { ...p, lastRun: new Date() } : p))
    );
  };

  const resetForm = () => {
    setFormName('');
    setFormCategory('user');
    setFormDescription('');
    setFormRetentionDays(365);
    setFormArchiveDays(30);
    setFormAutoDelete(false);
    setFormEnabled(true);
    setSelectedPolicy(null);
  };

  const showSuccessNotification = (message: string) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const getCategoryIcon = (category: DataCategory) => {
    return <StorageIcon />;
  };

  const formatLastRun = (date?: Date) => {
    if (!date) return 'Never';
    const diff = Date.now() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5">Data Retention Policies</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage data lifecycle and retention rules
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Create Policy
        </Button>
      </Stack>

      {showSuccess && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setShowSuccess(false)}>
          {successMessage}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="primary">
                {policies.length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total Policies
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="success.main">
                {policies.filter((p) => p.enabled).length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Active
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="info.main">
                {jobs.filter((j) => j.status === 'running').length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Running Jobs
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="warning.main">
                {jobs.filter((j) => j.status === 'completed').length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Completed Today
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Policies List */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Retention Policies
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List>
                {policies.map((policy, index) => (
                  <React.Fragment key={policy.id}>
                    {index > 0 && <Divider />}
                    <ListItem>
                      <ListItemText
                        primary={
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="subtitle1">{policy.name}</Typography>
                            <Chip label={policy.category} size="small" />
                            {!policy.enabled && (
                              <Chip label="Disabled" size="small" variant="outlined" />
                            )}
                            {policy.autoDelete && (
                              <Chip
                                icon={<WarningIcon />}
                                label="Auto-delete"
                                size="small"
                                color="warning"
                                variant="outlined"
                              />
                            )}
                          </Stack>
                        }
                        secondary={
                          <Stack spacing={0.5}>
                            <Typography variant="body2" color="text.secondary">
                              {policy.description}
                            </Typography>
                            <Stack direction="row" spacing={2}>
                              <Typography variant="caption" color="text.secondary">
                                Retention: {policy.retentionDays} days
                              </Typography>
                              {policy.archiveDays && (
                                <Typography variant="caption" color="text.secondary">
                                  Archive: {policy.archiveDays} days
                                </Typography>
                              )}
                              <Typography variant="caption" color="text.secondary">
                                Last run: {formatLastRun(policy.lastRun)}
                              </Typography>
                            </Stack>
                          </Stack>
                        }
                      />
                      <Stack direction="row" spacing={1} alignItems="center">
                        <FormControlLabel
                          control={
                            <Switch
                              checked={policy.enabled}
                              onChange={() => handleToggleEnabled(policy.id)}
                            />
                          }
                          label="Enabled"
                        />
                        <Button
                          size="small"
                          startIcon={<ScheduleIcon />}
                          onClick={() => handleRunPolicy(policy.id)}
                          disabled={!policy.enabled}
                        >
                          Run Now
                        </Button>
                        <IconButton size="small" onClick={() => handleEdit(policy)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDelete(policy.id)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Jobs */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Jobs
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List>
                {jobs.map((job) => (
                  <React.Fragment key={job.id}>
                    <ListItem sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                      <Stack direction="row" justifyContent="space-between" sx={{ width: '100%', mb: 1 }}>
                        <Typography variant="subtitle2">{job.policyName}</Typography>
                        <Chip
                          label={job.status}
                          size="small"
                          color={
                            job.status === 'completed'
                              ? 'success'
                              : job.status === 'running'
                              ? 'info'
                              : 'error'
                          }
                        />
                      </Stack>
                      {job.status === 'running' && (
                        <LinearProgress sx={{ width: '100%', mb: 1 }} />
                      )}
                      <Stack spacing={0.5} sx={{ width: '100%' }}>
                        <Typography variant="caption" color="text.secondary">
                          Started: {job.startedAt.toLocaleString()}
                        </Typography>
                        {job.completedAt && (
                          <Typography variant="caption" color="text.secondary">
                            Completed: {job.completedAt.toLocaleString()}
                          </Typography>
                        )}
                        <Typography variant="caption">
                          Processed: {job.recordsProcessed} • Archived: {job.recordsArchived} •
                          Deleted: {job.recordsDeleted}
                        </Typography>
                        {job.errorMessage && (
                          <Alert severity="error" sx={{ mt: 1 }}>
                            <Typography variant="caption">{job.errorMessage}</Typography>
                          </Alert>
                        )}
                      </Stack>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Create Policy Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Retention Policy</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Policy Name"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              fullWidth
              required
            />
            <FormControl fullWidth required>
              <InputLabel>Data Category</InputLabel>
              <Select value={formCategory} onChange={(e) => setFormCategory(e.target.value as DataCategory)}>
                <MenuItem value="user">User Data</MenuItem>
                <MenuItem value="plant">Plant Data</MenuItem>
                <MenuItem value="sensor">Sensor Data</MenuItem>
                <MenuItem value="audit">Audit Logs</MenuItem>
                <MenuItem value="backup">Backups</MenuItem>
                <MenuItem value="media">Media Files</MenuItem>
                <MenuItem value="logs">System Logs</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Description"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              fullWidth
              multiline
              rows={2}
            />
            <TextField
              label="Retention Period (days)"
              type="number"
              value={formRetentionDays}
              onChange={(e) => setFormRetentionDays(parseInt(e.target.value))}
              fullWidth
              required
              helperText="How long to keep data before archiving"
            />
            <TextField
              label="Archive Period (days)"
              type="number"
              value={formArchiveDays}
              onChange={(e) => setFormArchiveDays(parseInt(e.target.value))}
              fullWidth
              helperText="How long to keep archived data before deletion"
            />
            <FormControlLabel
              control={
                <Switch checked={formAutoDelete} onChange={(e) => setFormAutoDelete(e.target.checked)} />
              }
              label="Automatically delete data after retention period"
            />
            <FormControlLabel
              control={<Switch checked={formEnabled} onChange={(e) => setFormEnabled(e.target.checked)} />}
              label="Enable policy immediately"
            />
            <Alert severity="warning">
              <Typography variant="caption">
                Auto-delete policies permanently remove data. Ensure backups are configured.
              </Typography>
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={!formName}>
            Create Policy
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Policy Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Retention Policy</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Policy Name"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              fullWidth
              multiline
              rows={2}
            />
            <TextField
              label="Retention Period (days)"
              type="number"
              value={formRetentionDays}
              onChange={(e) => setFormRetentionDays(parseInt(e.target.value))}
              fullWidth
              required
            />
            <TextField
              label="Archive Period (days)"
              type="number"
              value={formArchiveDays}
              onChange={(e) => setFormArchiveDays(parseInt(e.target.value))}
              fullWidth
            />
            <FormControlLabel
              control={
                <Switch checked={formAutoDelete} onChange={(e) => setFormAutoDelete(e.target.checked)} />
              }
              label="Automatically delete data after retention period"
            />
            <FormControlLabel
              control={<Switch checked={formEnabled} onChange={(e) => setFormEnabled(e.target.checked)} />}
              label="Enable policy"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdate} disabled={!formName}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

/**
 * Generate sample retention policies
 */
function getSamplePolicies(): RetentionPolicy[] {
  return [
    {
      id: '1',
      name: 'User Data Retention',
      category: 'user',
      description: 'Retain user data for 3 years, archive for 1 year',
      retentionDays: 1095,
      archiveDays: 365,
      autoDelete: false,
      enabled: true,
      appliesTo: ['*'],
      createdAt: new Date('2024-01-01'),
      lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000),
      recordsAffected: 1250,
    },
    {
      id: '2',
      name: 'Sensor Data Cleanup',
      category: 'sensor',
      description: 'Keep sensor readings for 1 year, delete after archive',
      retentionDays: 365,
      archiveDays: 90,
      autoDelete: true,
      enabled: true,
      appliesTo: ['*'],
      createdAt: new Date('2024-01-15'),
      lastRun: new Date(Date.now() - 12 * 60 * 60 * 1000),
      recordsAffected: 45320,
    },
    {
      id: '3',
      name: 'Audit Log Retention',
      category: 'audit',
      description: 'Retain audit logs for 7 years for compliance',
      retentionDays: 2555,
      archiveDays: 365,
      autoDelete: false,
      enabled: true,
      appliesTo: ['*'],
      createdAt: new Date('2024-02-01'),
      lastRun: new Date(Date.now() - 48 * 60 * 60 * 1000),
      recordsAffected: 8920,
    },
  ];
}

/**
 * Generate sample retention jobs
 */
function getSampleJobs(): RetentionJob[] {
  return [
    {
      id: 'job-1',
      policyId: '2',
      policyName: 'Sensor Data Cleanup',
      status: 'completed',
      startedAt: new Date(Date.now() - 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 45 * 60 * 1000),
      recordsProcessed: 45320,
      recordsArchived: 12450,
      recordsDeleted: 8920,
    },
    {
      id: 'job-2',
      policyId: '1',
      policyName: 'User Data Retention',
      status: 'completed',
      startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 90 * 60 * 1000),
      recordsProcessed: 1250,
      recordsArchived: 120,
      recordsDeleted: 0,
    },
  ];
}
