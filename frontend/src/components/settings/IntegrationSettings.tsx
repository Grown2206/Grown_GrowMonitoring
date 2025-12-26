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
  FormControlLabel,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import {
  Save as SaveIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Link as LinkIcon,
  CheckCircle as ConnectedIcon,
  Error as DisconnectedIcon,
  Refresh as RefreshIcon,
  Api as ApiIcon,
  Cloud as CloudIcon,
  Email as EmailIcon,
  Message as SlackIcon,
  Storage as StorageIcon,
  Webhook as WebhookIcon,
} from '@mui/icons-material';

export type IntegrationType = 'api' | 'cloud' | 'email' | 'slack' | 'storage' | 'webhook';
export type IntegrationStatus = 'connected' | 'disconnected' | 'error';

export interface Integration {
  id: string;
  name: string;
  type: IntegrationType;
  description: string;
  status: IntegrationStatus;
  enabled: boolean;
  config: Record<string, any>;
  lastSync?: Date;
  createdAt: Date;
}

export interface IntegrationSettingsProps {
  integrations?: Integration[];
  onSave?: (integrations: Integration[]) => void;
  onTest?: (integrationId: string) => Promise<boolean>;
  onSync?: (integrationId: string) => Promise<void>;
}

/**
 * Third-party integrations management
 */
export function IntegrationSettings({
  integrations: initialIntegrations = [],
  onSave,
  onTest,
  onSync,
}: IntegrationSettingsProps) {
  const [integrations, setIntegrations] = useState<Integration[]>(
    initialIntegrations.length > 0 ? initialIntegrations : getSampleIntegrations()
  );
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  // Form states
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<IntegrationType>('api');
  const [formDescription, setFormDescription] = useState('');
  const [formApiKey, setFormApiKey] = useState('');
  const [formEndpoint, setFormEndpoint] = useState('');
  const [formSecret, setFormSecret] = useState('');

  const handleToggleEnabled = (integrationId: string) => {
    setIntegrations(
      integrations.map((int) =>
        int.id === integrationId ? { ...int, enabled: !int.enabled } : int
      )
    );
    setHasChanges(true);
  };

  const handleTest = async (integrationId: string) => {
    try {
      const result = await onTest?.(integrationId);
      if (result) {
        setIntegrations(
          integrations.map((int) =>
            int.id === integrationId ? { ...int, status: 'connected' } : int
          )
        );
        showSuccessNotification('Integration test successful');
      } else {
        setIntegrations(
          integrations.map((int) =>
            int.id === integrationId ? { ...int, status: 'error' } : int
          )
        );
        showSuccessNotification('Integration test failed');
      }
    } catch (error) {
      showSuccessNotification('Error testing integration');
    }
  };

  const handleSync = async (integrationId: string) => {
    try {
      await onSync?.(integrationId);
      setIntegrations(
        integrations.map((int) =>
          int.id === integrationId ? { ...int, lastSync: new Date() } : int
        )
      );
      showSuccessNotification('Integration synced successfully');
    } catch (error) {
      showSuccessNotification('Error syncing integration');
    }
  };

  const handleCreate = () => {
    const newIntegration: Integration = {
      id: (integrations.length + 1).toString(),
      name: formName,
      type: formType,
      description: formDescription,
      status: 'disconnected',
      enabled: true,
      config: {
        apiKey: formApiKey,
        endpoint: formEndpoint,
        secret: formSecret,
      },
      createdAt: new Date(),
    };

    setIntegrations([...integrations, newIntegration]);
    setHasChanges(true);
    resetForm();
    setCreateDialogOpen(false);
    showSuccessNotification('Integration created successfully');
  };

  const handleUpdate = () => {
    if (selectedIntegration) {
      setIntegrations(
        integrations.map((int) =>
          int.id === selectedIntegration.id
            ? {
                ...int,
                name: formName,
                description: formDescription,
                config: {
                  apiKey: formApiKey,
                  endpoint: formEndpoint,
                  secret: formSecret,
                },
              }
            : int
        )
      );
      setHasChanges(true);
      resetForm();
      setEditDialogOpen(false);
      showSuccessNotification('Integration updated successfully');
    }
  };

  const handleDelete = (integrationId: string) => {
    setIntegrations(integrations.filter((int) => int.id !== integrationId));
    setHasChanges(true);
    showSuccessNotification('Integration deleted successfully');
  };

  const handleEdit = (integration: Integration) => {
    setFormName(integration.name);
    setFormType(integration.type);
    setFormDescription(integration.description);
    setFormApiKey(integration.config.apiKey || '');
    setFormEndpoint(integration.config.endpoint || '');
    setFormSecret(integration.config.secret || '');
    setSelectedIntegration(integration);
    setEditDialogOpen(true);
  };

  const handleSave = () => {
    onSave?.(integrations);
    setHasChanges(false);
    showSuccessNotification('Integrations saved successfully');
  };

  const resetForm = () => {
    setFormName('');
    setFormType('api');
    setFormDescription('');
    setFormApiKey('');
    setFormEndpoint('');
    setFormSecret('');
    setSelectedIntegration(null);
  };

  const showSuccessNotification = (message: string) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const getIntegrationIcon = (type: IntegrationType) => {
    switch (type) {
      case 'api':
        return <ApiIcon />;
      case 'cloud':
        return <CloudIcon />;
      case 'email':
        return <EmailIcon />;
      case 'slack':
        return <SlackIcon />;
      case 'storage':
        return <StorageIcon />;
      case 'webhook':
        return <WebhookIcon />;
    }
  };

  const getStatusColor = (status: IntegrationStatus) => {
    switch (status) {
      case 'connected':
        return 'success';
      case 'disconnected':
        return 'default';
      case 'error':
        return 'error';
    }
  };

  const formatLastSync = (date?: Date) => {
    if (!date) return 'Never';
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const groupedIntegrations = integrations.reduce((acc, integration) => {
    if (!acc[integration.type]) {
      acc[integration.type] = [];
    }
    acc[integration.type].push(integration);
    return acc;
  }, {} as Record<IntegrationType, Integration[]>);

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5">Integrations</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage third-party integrations and connections
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            startIcon={<AddIcon />}
            variant="outlined"
            onClick={() => setCreateDialogOpen(true)}
          >
            Add Integration
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

      {hasChanges && (
        <Alert severity="info" sx={{ mb: 2 }}>
          You have unsaved changes
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="primary">
                {integrations.length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total Integrations
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="success.main">
                {integrations.filter((i) => i.status === 'connected').length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Connected
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="warning.main">
                {integrations.filter((i) => i.enabled).length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Active
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Integrations List */}
      <Stack spacing={3}>
        {Object.entries(groupedIntegrations).map(([type, typeIntegrations]) => (
          <Card key={type}>
            <CardHeader
              title={
                <Stack direction="row" spacing={1} alignItems="center">
                  {getIntegrationIcon(type as IntegrationType)}
                  <Typography variant="h6">{type.toUpperCase()}</Typography>
                  <Chip label={typeIntegrations.length} size="small" />
                </Stack>
              }
            />
            <Divider />
            <List>
              {typeIntegrations.map((integration, index) => (
                <React.Fragment key={integration.id}>
                  {index > 0 && <Divider />}
                  <ListItem>
                    <ListItemText
                      primary={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="subtitle1">{integration.name}</Typography>
                          <Chip
                            icon={
                              integration.status === 'connected' ? (
                                <ConnectedIcon />
                              ) : (
                                <DisconnectedIcon />
                              )
                            }
                            label={integration.status}
                            size="small"
                            color={getStatusColor(integration.status) as any}
                          />
                          {!integration.enabled && (
                            <Chip label="Disabled" size="small" variant="outlined" />
                          )}
                        </Stack>
                      }
                      secondary={
                        <Stack spacing={0.5}>
                          <Typography variant="body2" color="text.secondary">
                            {integration.description}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Last synced: {formatLastSync(integration.lastSync)} • Created:{' '}
                            {integration.createdAt.toLocaleDateString()}
                          </Typography>
                        </Stack>
                      }
                    />
                    <Stack direction="row" spacing={1}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={integration.enabled}
                            onChange={() => handleToggleEnabled(integration.id)}
                          />
                        }
                        label="Enabled"
                      />
                      <IconButton
                        size="small"
                        onClick={() => handleTest(integration.id)}
                        disabled={!integration.enabled}
                      >
                        <LinkIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleSync(integration.id)}
                        disabled={!integration.enabled || integration.status !== 'connected'}
                      >
                        <RefreshIcon />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleEdit(integration)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(integration.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          </Card>
        ))}

        {integrations.length === 0 && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <ApiIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No integrations configured
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Connect your favorite tools and services
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialogOpen(true)}
            >
              Add Your First Integration
            </Button>
          </Paper>
        )}
      </Stack>

      {/* Create Integration Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Integration</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Integration Name"
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
              label="API Endpoint"
              value={formEndpoint}
              onChange={(e) => setFormEndpoint(e.target.value)}
              fullWidth
              placeholder="https://api.example.com"
            />
            <TextField
              label="API Key"
              value={formApiKey}
              onChange={(e) => setFormApiKey(e.target.value)}
              fullWidth
              type="password"
            />
            <TextField
              label="Secret Key"
              value={formSecret}
              onChange={(e) => setFormSecret(e.target.value)}
              fullWidth
              type="password"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={!formName}>
            Add Integration
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Integration Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Integration</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Integration Name"
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
              label="API Endpoint"
              value={formEndpoint}
              onChange={(e) => setFormEndpoint(e.target.value)}
              fullWidth
            />
            <TextField
              label="API Key"
              value={formApiKey}
              onChange={(e) => setFormApiKey(e.target.value)}
              fullWidth
              type="password"
              placeholder="••••••••"
            />
            <TextField
              label="Secret Key"
              value={formSecret}
              onChange={(e) => setFormSecret(e.target.value)}
              fullWidth
              type="password"
              placeholder="••••••••"
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
 * Generate sample integrations
 */
function getSampleIntegrations(): Integration[] {
  return [
    {
      id: '1',
      name: 'Weather API',
      type: 'api',
      description: 'Real-time weather data for greenhouse environmental monitoring',
      status: 'connected',
      enabled: true,
      config: {
        apiKey: 'gms_weather_key_12345',
        endpoint: 'https://api.weather.com/v1',
      },
      lastSync: new Date(Date.now() - 15 * 60 * 1000),
      createdAt: new Date('2024-01-15'),
    },
    {
      id: '2',
      name: 'AWS S3 Storage',
      type: 'cloud',
      description: 'Cloud storage for sensor data backups and media files',
      status: 'connected',
      enabled: true,
      config: {
        apiKey: 'gms_aws_access_key',
        secret: 'gms_aws_secret_key',
        endpoint: 's3.amazonaws.com',
      },
      lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000),
      createdAt: new Date('2024-01-10'),
    },
    {
      id: '3',
      name: 'Slack Notifications',
      type: 'slack',
      description: 'Send alerts and notifications to team Slack channels',
      status: 'connected',
      enabled: true,
      config: {
        apiKey: 'gms_slack_webhook',
        endpoint: 'https://hooks.slack.com/services/...',
      },
      lastSync: new Date(Date.now() - 30 * 60 * 1000),
      createdAt: new Date('2024-02-01'),
    },
    {
      id: '4',
      name: 'Email Service',
      type: 'email',
      description: 'SMTP integration for email notifications and reports',
      status: 'disconnected',
      enabled: false,
      config: {
        endpoint: 'smtp.gmail.com:587',
      },
      createdAt: new Date('2024-02-15'),
    },
  ];
}
