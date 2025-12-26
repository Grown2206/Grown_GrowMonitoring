import React, { useState } from 'react';
import {
  Alert,
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
  FormControlLabel,
  FormGroup,
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
  Checkbox,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  PlayArrow as TestIcon,
  History as HistoryIcon,
  Check as SuccessIcon,
  Error as ErrorIcon,
  Schedule as PendingIcon,
  Refresh as RetryIcon,
} from '@mui/icons-material';

export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret?: string;
  enabled: boolean;
  createdAt: Date;
  lastTriggered?: Date;
  successCount: number;
  failureCount: number;
}

export interface WebhookLog {
  id: string;
  webhookId: string;
  event: string;
  status: 'success' | 'failure' | 'pending';
  statusCode?: number;
  timestamp: Date;
  retryCount: number;
  error?: string;
}

export interface WebhookManagerProps {
  webhooks?: Webhook[];
  logs?: WebhookLog[];
  onCreateWebhook?: (webhook: Omit<Webhook, 'id' | 'createdAt' | 'successCount' | 'failureCount'>) => Promise<void>;
  onUpdateWebhook?: (id: string, webhook: Partial<Webhook>) => Promise<void>;
  onDeleteWebhook?: (id: string) => Promise<void>;
  onTestWebhook?: (id: string) => Promise<void>;
}

const availableEvents = [
  { id: 'plant.created', label: 'Plant Created', category: 'Plants' },
  { id: 'plant.updated', label: 'Plant Updated', category: 'Plants' },
  { id: 'plant.deleted', label: 'Plant Deleted', category: 'Plants' },
  { id: 'sensor.reading', label: 'Sensor Reading', category: 'Sensors' },
  { id: 'sensor.alert', label: 'Sensor Alert', category: 'Sensors' },
  { id: 'sensor.offline', label: 'Sensor Offline', category: 'Sensors' },
  { id: 'report.generated', label: 'Report Generated', category: 'Reports' },
  { id: 'user.invited', label: 'User Invited', category: 'Users' },
  { id: 'user.joined', label: 'User Joined', category: 'Users' },
  { id: 'task.completed', label: 'Task Completed', category: 'Tasks' },
  { id: 'backup.completed', label: 'Backup Completed', category: 'System' },
];

/**
 * Webhook management for event-driven integrations
 */
export function WebhookManager({
  webhooks: initialWebhooks = [],
  logs: initialLogs = [],
  onCreateWebhook,
  onUpdateWebhook,
  onDeleteWebhook,
  onTestWebhook,
}: WebhookManagerProps) {
  const [webhooks, setWebhooks] = useState<Webhook[]>(
    initialWebhooks.length > 0 ? initialWebhooks : getSampleWebhooks()
  );
  const [logs] = useState<WebhookLog[]>(
    initialLogs.length > 0 ? initialLogs : getSampleLogs()
  );
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [logsDialogOpen, setLogsDialogOpen] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    events: [] as string[],
    secret: '',
  });

  const handleCreate = async () => {
    if (!formData.name || !formData.url || formData.events.length === 0) return;

    const webhook: Omit<Webhook, 'id' | 'createdAt' | 'successCount' | 'failureCount'> = {
      name: formData.name,
      url: formData.url,
      events: formData.events,
      secret: formData.secret || undefined,
      enabled: true,
    };

    try {
      if (onCreateWebhook) {
        await onCreateWebhook(webhook);
      }

      const newWebhook: Webhook = {
        ...webhook,
        id: `webhook-${Date.now()}`,
        createdAt: new Date(),
        successCount: 0,
        failureCount: 0,
      };

      setWebhooks([...webhooks, newWebhook]);
      setCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create webhook:', error);
    }
  };

  const handleUpdate = async () => {
    if (!selectedWebhook) return;

    try {
      if (onUpdateWebhook) {
        await onUpdateWebhook(selectedWebhook.id, formData);
      }

      setWebhooks(
        webhooks.map((w) =>
          w.id === selectedWebhook.id ? { ...w, ...formData } : w
        )
      );
      setEditDialogOpen(false);
      setSelectedWebhook(null);
      resetForm();
    } catch (error) {
      console.error('Failed to update webhook:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      if (onDeleteWebhook) {
        await onDeleteWebhook(id);
      }
      setWebhooks(webhooks.filter((w) => w.id !== id));
    } catch (error) {
      console.error('Failed to delete webhook:', error);
    }
  };

  const handleToggle = async (id: string, enabled: boolean) => {
    try {
      if (onUpdateWebhook) {
        await onUpdateWebhook(id, { enabled });
      }
      setWebhooks(webhooks.map((w) => (w.id === id ? { ...w, enabled } : w)));
    } catch (error) {
      console.error('Failed to toggle webhook:', error);
    }
  };

  const handleTest = async (id: string) => {
    try {
      if (onTestWebhook) {
        await onTestWebhook(id);
      }
    } catch (error) {
      console.error('Failed to test webhook:', error);
    }
  };

  const openEditDialog = (webhook: Webhook) => {
    setSelectedWebhook(webhook);
    setFormData({
      name: webhook.name,
      url: webhook.url,
      events: webhook.events,
      secret: webhook.secret || '',
    });
    setEditDialogOpen(true);
  };

  const openLogsDialog = (webhook: Webhook) => {
    setSelectedWebhook(webhook);
    setLogsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      url: '',
      events: [],
      secret: '',
    });
  };

  const getWebhookLogs = (webhookId: string) => {
    return logs.filter((log) => log.webhookId === webhookId).slice(0, 10);
  };

  const eventsByCategory = availableEvents.reduce((acc, event) => {
    if (!acc[event.category]) {
      acc[event.category] = [];
    }
    acc[event.category].push(event);
    return acc;
  }, {} as Record<string, typeof availableEvents>);

  return (
    <Box>
      <Stack spacing={3}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h5" gutterBottom>
              Webhooks
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Configure webhooks to receive real-time event notifications
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Create Webhook
          </Button>
        </Stack>

        {/* Webhooks List */}
        {webhooks.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Webhooks Configured
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Create a webhook to receive event notifications
            </Typography>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setCreateDialogOpen(true)}>
              Create First Webhook
            </Button>
          </Paper>
        ) : (
          <Stack spacing={2}>
            {webhooks.map((webhook) => (
              <Card key={webhook.id}>
                <CardContent>
                  <Stack spacing={2}>
                    {/* Header */}
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box sx={{ flex: 1 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="h6">{webhook.name}</Typography>
                          {!webhook.enabled && (
                            <Chip label="Disabled" size="small" color="default" />
                          )}
                        </Stack>
                        <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                          {webhook.url}
                        </Typography>
                      </Box>
                      <Switch
                        checked={webhook.enabled}
                        onChange={(e) => handleToggle(webhook.id, e.target.checked)}
                      />
                    </Stack>

                    {/* Events */}
                    <Box>
                      <Typography variant="caption" color="text.secondary" gutterBottom>
                        Events ({webhook.events.length})
                      </Typography>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ gap: 0.5 }}>
                        {webhook.events.slice(0, 5).map((event) => (
                          <Chip key={event} label={event} size="small" variant="outlined" />
                        ))}
                        {webhook.events.length > 5 && (
                          <Chip label={`+${webhook.events.length - 5} more`} size="small" />
                        )}
                      </Stack>
                    </Box>

                    {/* Stats */}
                    <Stack direction="row" spacing={3}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Success
                        </Typography>
                        <Typography variant="body2" color="success.main">
                          {webhook.successCount}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Failures
                        </Typography>
                        <Typography variant="body2" color="error.main">
                          {webhook.failureCount}
                        </Typography>
                      </Box>
                      {webhook.lastTriggered && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Last Triggered
                          </Typography>
                          <Typography variant="body2">
                            {webhook.lastTriggered.toLocaleString()}
                          </Typography>
                        </Box>
                      )}
                    </Stack>

                    <Divider />

                    {/* Actions */}
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        startIcon={<TestIcon />}
                        onClick={() => handleTest(webhook.id)}
                      >
                        Test
                      </Button>
                      <Button
                        size="small"
                        startIcon={<HistoryIcon />}
                        onClick={() => openLogsDialog(webhook)}
                      >
                        Logs
                      </Button>
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => openEditDialog(webhook)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDelete(webhook.id)}
                      >
                        Delete
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Stack>

      {/* Create/Edit Dialog */}
      <Dialog
        open={createDialogOpen || editDialogOpen}
        onClose={() => {
          setCreateDialogOpen(false);
          setEditDialogOpen(false);
          resetForm();
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {createDialogOpen ? 'Create Webhook' : 'Edit Webhook'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="My Webhook"
              fullWidth
              required
            />

            <TextField
              label="Endpoint URL"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://example.com/webhook"
              fullWidth
              required
              helperText="URL to send webhook events to"
            />

            <TextField
              label="Secret (Optional)"
              value={formData.secret}
              onChange={(e) => setFormData({ ...formData, secret: e.target.value })}
              placeholder="webhook_secret_..."
              fullWidth
              helperText="Secret key for request verification"
            />

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Events
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                Select which events trigger this webhook
              </Typography>
              <FormGroup>
                {Object.entries(eventsByCategory).map(([category, events]) => (
                  <Box key={category} sx={{ mb: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                      {category}
                    </Typography>
                    {events.map((event) => (
                      <FormControlLabel
                        key={event.id}
                        control={
                          <Checkbox
                            checked={formData.events.includes(event.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  events: [...formData.events, event.id],
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  events: formData.events.filter((ev) => ev !== event.id),
                                });
                              }
                            }}
                          />
                        }
                        label={event.label}
                      />
                    ))}
                  </Box>
                ))}
              </FormGroup>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setCreateDialogOpen(false);
              setEditDialogOpen(false);
              resetForm();
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={createDialogOpen ? handleCreate : handleUpdate}
            disabled={!formData.name || !formData.url || formData.events.length === 0}
          >
            {createDialogOpen ? 'Create' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Logs Dialog */}
      <Dialog
        open={logsDialogOpen}
        onClose={() => {
          setLogsDialogOpen(false);
          setSelectedWebhook(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Webhook Logs: {selectedWebhook?.name}
        </DialogTitle>
        <DialogContent>
          {selectedWebhook && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Event</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Timestamp</TableCell>
                    <TableCell>Retries</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getWebhookLogs(selectedWebhook.id).map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{log.event}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          {log.status === 'success' ? (
                            <SuccessIcon color="success" fontSize="small" />
                          ) : log.status === 'failure' ? (
                            <ErrorIcon color="error" fontSize="small" />
                          ) : (
                            <PendingIcon color="warning" fontSize="small" />
                          )}
                          <Typography variant="body2">
                            {log.status}
                            {log.statusCode && ` (${log.statusCode})`}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>{log.timestamp.toLocaleString()}</TableCell>
                      <TableCell>{log.retryCount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function getSampleWebhooks(): Webhook[] {
  return [
    {
      id: '1',
      name: 'Slack Notifications',
      url: 'https://hooks.slack.com/services/...',
      events: ['sensor.alert', 'plant.created'],
      enabled: true,
      createdAt: new Date('2024-01-15'),
      lastTriggered: new Date(),
      successCount: 234,
      failureCount: 3,
    },
    {
      id: '2',
      name: 'Data Pipeline',
      url: 'https://api.example.com/webhook',
      events: ['sensor.reading', 'report.generated'],
      secret: 'wh_secret_...',
      enabled: true,
      createdAt: new Date('2024-02-01'),
      lastTriggered: new Date(Date.now() - 2 * 60 * 60 * 1000),
      successCount: 1523,
      failureCount: 12,
    },
  ];
}

function getSampleLogs(): WebhookLog[] {
  return [
    {
      id: '1',
      webhookId: '1',
      event: 'sensor.alert',
      status: 'success',
      statusCode: 200,
      timestamp: new Date(),
      retryCount: 0,
    },
    {
      id: '2',
      webhookId: '1',
      event: 'plant.created',
      status: 'success',
      statusCode: 200,
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      retryCount: 0,
    },
    {
      id: '3',
      webhookId: '2',
      event: 'sensor.reading',
      status: 'failure',
      statusCode: 500,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      retryCount: 2,
      error: 'Connection timeout',
    },
  ];
}
