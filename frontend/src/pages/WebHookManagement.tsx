import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Checkbox,
  ListItemText,
  Box,
  Alert,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as TestIcon,
  Refresh as RefreshIcon,
  BarChart as StatsIcon,
} from '@mui/icons-material';
import api from '../services/api';

interface WebHook {
  id: number;
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH';
  events: string[];
  enabled: boolean;
  status: 'active' | 'paused' | 'failed';
  successCount: number;
  failureCount: number;
  lastTriggeredAt?: string;
  lastSuccessAt?: string;
  lastFailureAt?: string;
}

interface AvailableEvent {
  value: string;
  label: string;
  description: string;
}

export function WebHookManagement() {
  const [webhooks, setWebHooks] = useState<WebHook[]>([]);
  const [availableEvents, setAvailableEvents] = useState<AvailableEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingWebHook, setEditingWebHook] = useState<WebHook | null>(null);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    url: '',
    method: 'POST' as 'GET' | 'POST' | 'PUT' | 'PATCH',
    events: [] as string[],
    secret: '',
    maxRetries: 3,
    timeoutMs: 5000,
    enabled: true,
  });

  useEffect(() => {
    fetchWebHooks();
    fetchAvailableEvents();
  }, []);

  const fetchWebHooks = async () => {
    try {
      const response = await api.get('/webhooks');
      setWebHooks(response.data);
    } catch (error) {
      console.error('Error fetching webhooks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableEvents = async () => {
    try {
      const response = await api.get('/webhooks/events/available');
      setAvailableEvents(response.data);
    } catch (error) {
      console.error('Error fetching available events:', error);
    }
  };

  const handleOpenDialog = (webhook?: WebHook) => {
    if (webhook) {
      setEditingWebHook(webhook);
      setFormData({
        name: webhook.name,
        url: webhook.url,
        method: webhook.method,
        events: webhook.events,
        secret: '',
        maxRetries: 3,
        timeoutMs: 5000,
        enabled: webhook.enabled,
      });
    } else {
      setEditingWebHook(null);
      setFormData({
        name: '',
        url: '',
        method: 'POST',
        events: [],
        secret: '',
        maxRetries: 3,
        timeoutMs: 5000,
        enabled: true,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingWebHook(null);
    setTestResult(null);
  };

  const handleSave = async () => {
    try {
      if (editingWebHook) {
        await api.put(`/webhooks/${editingWebHook.id}`, formData);
      } else {
        await api.post('/webhooks', formData);
      }
      handleCloseDialog();
      fetchWebHooks();
    } catch (error: any) {
      console.error('Error saving webhook:', error);
      alert(error.response?.data?.error || 'Failed to save webhook');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this webhook?')) return;

    try {
      await api.delete(`/webhooks/${id}`);
      fetchWebHooks();
    } catch (error) {
      console.error('Error deleting webhook:', error);
    }
  };

  const handleTest = async (id: number) => {
    try {
      const response = await api.post(`/webhooks/${id}/test`);
      setTestResult(response.data);
      setTimeout(() => setTestResult(null), 5000);
    } catch (error: any) {
      setTestResult({
        success: false,
        message: error.response?.data?.error || 'Test failed',
      });
      setTimeout(() => setTestResult(null), 5000);
    }
  };

  const handleReset = async (id: number) => {
    try {
      await api.post(`/webhooks/${id}/reset`);
      fetchWebHooks();
    } catch (error) {
      console.error('Error resetting webhook:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'paused':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          WebHook Management
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchWebHooks}
            sx={{ mr: 1 }}
          >
            Refresh
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
            Add WebHook
          </Button>
        </Box>
      </Box>

      {testResult && (
        <Alert severity={testResult.success ? 'success' : 'error'} sx={{ mb: 2 }}>
          {testResult.message}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>URL</TableCell>
              <TableCell>Method</TableCell>
              <TableCell>Events</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Success</TableCell>
              <TableCell align="right">Failures</TableCell>
              <TableCell>Last Triggered</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {webhooks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <Typography variant="body2" color="textSecondary">
                    No webhooks configured. Click "Add WebHook" to create one.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              webhooks.map((webhook) => (
                <TableRow key={webhook.id}>
                  <TableCell>
                    {webhook.name}
                    {!webhook.enabled && (
                      <Chip label="Disabled" size="small" sx={{ ml: 1 }} />
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                      {webhook.url}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={webhook.method} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {webhook.events.slice(0, 2).map((event) => (
                        <Chip key={event} label={event} size="small" />
                      ))}
                      {webhook.events.length > 2 && (
                        <Chip label={`+${webhook.events.length - 2}`} size="small" />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={webhook.status}
                      color={getStatusColor(webhook.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">{webhook.successCount}</TableCell>
                  <TableCell align="right">{webhook.failureCount}</TableCell>
                  <TableCell>
                    {webhook.lastTriggeredAt ? new Date(webhook.lastTriggeredAt).toLocaleString() : 'Never'}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Test WebHook">
                      <IconButton size="small" onClick={() => handleTest(webhook.id)} color="primary">
                        <TestIcon />
                      </IconButton>
                    </Tooltip>
                    {webhook.status === 'failed' && (
                      <Tooltip title="Reset WebHook">
                        <IconButton size="small" onClick={() => handleReset(webhook.id)} color="info">
                          <RefreshIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => handleOpenDialog(webhook)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(webhook.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingWebHook ? 'Edit WebHook' : 'Add WebHook'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />

            <TextField
              label="URL"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              fullWidth
              required
              placeholder="https://example.com/webhook"
            />

            <FormControl fullWidth>
              <InputLabel>HTTP Method</InputLabel>
              <Select
                value={formData.method}
                onChange={(e) => setFormData({ ...formData, method: e.target.value as any })}
                label="HTTP Method"
              >
                <MenuItem value="GET">GET</MenuItem>
                <MenuItem value="POST">POST</MenuItem>
                <MenuItem value="PUT">PUT</MenuItem>
                <MenuItem value="PATCH">PATCH</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Events</InputLabel>
              <Select
                multiple
                value={formData.events}
                onChange={(e) => setFormData({ ...formData, events: e.target.value as string[] })}
                input={<OutlinedInput label="Events" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                {availableEvents.map((event) => (
                  <MenuItem key={event.value} value={event.value}>
                    <Checkbox checked={formData.events.indexOf(event.value) > -1} />
                    <ListItemText
                      primary={event.label}
                      secondary={event.description}
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Secret (optional)"
              value={formData.secret}
              onChange={(e) => setFormData({ ...formData, secret: e.target.value })}
              fullWidth
              type="password"
              helperText="Used for HMAC signature verification"
            />

            <TextField
              label="Max Retries"
              type="number"
              value={formData.maxRetries}
              onChange={(e) => setFormData({ ...formData, maxRetries: parseInt(e.target.value) })}
              fullWidth
            />

            <TextField
              label="Timeout (ms)"
              type="number"
              value={formData.timeoutMs}
              onChange={(e) => setFormData({ ...formData, timeoutMs: parseInt(e.target.value) })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {editingWebHook ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
