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
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  Alert as MuiAlert,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as ResolvedIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Notifications as NotifyIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendIcon,
} from '@mui/icons-material';

export type AlertSeverity = 'critical' | 'warning' | 'info';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved';

export interface AlertRule {
  id: string;
  name: string;
  condition: string;
  severity: AlertSeverity;
  enabled: boolean;
}

export interface Alert {
  id: string;
  ruleId?: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  status: AlertStatus;
  triggeredAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  source: string;
  value?: number;
  threshold?: number;
  unit?: string;
}

export interface AlertsPanelProps {
  alerts?: Alert[];
  rules?: AlertRule[];
  onAcknowledge?: (alertId: string) => void;
  onResolve?: (alertId: string) => void;
  onCreateRule?: (rule: Omit<AlertRule, 'id'>) => void;
  onDeleteRule?: (ruleId: string) => void;
}

/**
 * Alerts monitoring and management panel
 */
export function AlertsPanel({
  alerts: initialAlerts = [],
  rules: initialRules = [],
  onAcknowledge,
  onResolve,
  onCreateRule,
  onDeleteRule,
}: AlertsPanelProps) {
  const [alerts, setAlerts] = useState<Alert[]>(
    initialAlerts.length > 0 ? initialAlerts : getSampleAlerts()
  );
  const [rules] = useState<AlertRule[]>(
    initialRules.length > 0 ? initialRules : getSampleRules()
  );
  const [activeTab, setActiveTab] = useState(0);
  const [createRuleDialogOpen, setCreateRuleDialogOpen] = useState(false);
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleCondition, setNewRuleCondition] = useState('');
  const [newRuleSeverity, setNewRuleSeverity] = useState<AlertSeverity>('warning');

  const handleAcknowledge = (alertId: string) => {
    setAlerts(
      alerts.map((alert) =>
        alert.id === alertId
          ? { ...alert, status: 'acknowledged', acknowledgedAt: new Date() }
          : alert
      )
    );
    onAcknowledge?.(alertId);
  };

  const handleResolve = (alertId: string) => {
    setAlerts(
      alerts.map((alert) =>
        alert.id === alertId
          ? { ...alert, status: 'resolved', resolvedAt: new Date() }
          : alert
      )
    );
    onResolve?.(alertId);
  };

  const handleCreateRule = () => {
    const newRule: Omit<AlertRule, 'id'> = {
      name: newRuleName,
      condition: newRuleCondition,
      severity: newRuleSeverity,
      enabled: true,
    };

    onCreateRule?.(newRule);
    setCreateRuleDialogOpen(false);
    setNewRuleName('');
    setNewRuleCondition('');
    setNewRuleSeverity('warning');
  };

  const getSeverityIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical':
        return <ErrorIcon color="error" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'info';
    }
  };

  const getStatusColor = (status: AlertStatus) => {
    switch (status) {
      case 'active':
        return 'error';
      case 'acknowledged':
        return 'warning';
      case 'resolved':
        return 'success';
    }
  };

  const formatDuration = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getFilteredAlerts = () => {
    switch (activeTab) {
      case 1: // Active
        return alerts.filter((a) => a.status === 'active');
      case 2: // Acknowledged
        return alerts.filter((a) => a.status === 'acknowledged');
      case 3: // Resolved
        return alerts.filter((a) => a.status === 'resolved');
      default: // All
        return alerts;
    }
  };

  const activeAlerts = alerts.filter((a) => a.status === 'active');
  const criticalAlerts = activeAlerts.filter((a) => a.severity === 'critical');
  const filteredAlerts = getFilteredAlerts();

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5">Alerts</Typography>
          <Typography variant="body2" color="text.secondary">
            Monitor and manage system alerts
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateRuleDialogOpen(true)}
        >
          Create Alert Rule
        </Button>
      </Stack>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: 'error.50' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h3" color="error.main">
                    {criticalAlerts.length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Critical Alerts
                  </Typography>
                </Box>
                <ErrorIcon sx={{ fontSize: 48, color: 'error.main', opacity: 0.3 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: 'warning.50' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h3" color="warning.main">
                    {activeAlerts.length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Active Alerts
                  </Typography>
                </Box>
                <WarningIcon sx={{ fontSize: 48, color: 'warning.main', opacity: 0.3 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: 'success.50' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h3" color="success.main">
                    {alerts.filter((a) => a.status === 'resolved').length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Resolved Today
                  </Typography>
                </Box>
                <ResolvedIcon sx={{ fontSize: 48, color: 'success.main', opacity: 0.3 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Critical Alerts Warning */}
      {criticalAlerts.length > 0 && (
        <MuiAlert severity="error" sx={{ mb: 2 }}>
          <Typography variant="subtitle2">
            {criticalAlerts.length} critical alert{criticalAlerts.length > 1 ? 's' : ''} require
            immediate attention!
          </Typography>
        </MuiAlert>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
          <Tab label={`All (${alerts.length})`} />
          <Tab label={`Active (${alerts.filter((a) => a.status === 'active').length})`} />
          <Tab
            label={`Acknowledged (${alerts.filter((a) => a.status === 'acknowledged').length})`}
          />
          <Tab label={`Resolved (${alerts.filter((a) => a.status === 'resolved').length})`} />
        </Tabs>
      </Box>

      {/* Alerts List */}
      <Stack spacing={2}>
        {filteredAlerts.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <ResolvedIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No alerts
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {activeTab === 1 && 'All active alerts have been handled!'}
              {activeTab === 2 && 'No acknowledged alerts.'}
              {activeTab === 3 && 'No resolved alerts.'}
              {activeTab === 0 && 'System is running smoothly!'}
            </Typography>
          </Paper>
        ) : (
          filteredAlerts.map((alert) => (
            <Card key={alert.id}>
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="start">
                    <Stack direction="row" spacing={2} alignItems="start">
                      {getSeverityIcon(alert.severity)}
                      <Box>
                        <Typography variant="h6">{alert.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {alert.description}
                        </Typography>
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      <Chip
                        label={alert.severity}
                        color={getSeverityColor(alert.severity) as any}
                        size="small"
                      />
                      <Chip
                        label={alert.status}
                        color={getStatusColor(alert.status) as any}
                        size="small"
                      />
                    </Stack>
                  </Stack>

                  {alert.value !== undefined && alert.threshold !== undefined && (
                    <Box>
                      <Stack direction="row" spacing={1} alignItems="baseline">
                        <Typography variant="h5" color={getSeverityColor(alert.severity) + '.main'}>
                          {alert.value}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {alert.unit} (threshold: {alert.threshold} {alert.unit})
                        </Typography>
                      </Stack>
                    </Box>
                  )}

                  <Divider />

                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" color="text.secondary">
                        Source
                      </Typography>
                      <Typography variant="body2">{alert.source}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" color="text.secondary">
                        Triggered
                      </Typography>
                      <Typography variant="body2">{formatDuration(alert.triggeredAt)}</Typography>
                    </Grid>
                    {alert.acknowledgedAt && (
                      <Grid item xs={6} sm={3}>
                        <Typography variant="caption" color="text.secondary">
                          Acknowledged
                        </Typography>
                        <Typography variant="body2">
                          {formatDuration(alert.acknowledgedAt)}
                        </Typography>
                      </Grid>
                    )}
                    {alert.resolvedAt && (
                      <Grid item xs={6} sm={3}>
                        <Typography variant="caption" color="text.secondary">
                          Resolved
                        </Typography>
                        <Typography variant="body2">{formatDuration(alert.resolvedAt)}</Typography>
                      </Grid>
                    )}
                  </Grid>

                  {alert.status !== 'resolved' && (
                    <>
                      <Divider />
                      <Stack direction="row" spacing={1}>
                        {alert.status === 'active' && (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleAcknowledge(alert.id)}
                          >
                            Acknowledge
                          </Button>
                        )}
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={() => handleResolve(alert.id)}
                        >
                          Resolve
                        </Button>
                      </Stack>
                    </>
                  )}
                </Stack>
              </CardContent>
            </Card>
          ))
        )}
      </Stack>

      {/* Create Rule Dialog */}
      <Dialog open={createRuleDialogOpen} onClose={() => setCreateRuleDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Alert Rule</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Rule Name"
              value={newRuleName}
              onChange={(e) => setNewRuleName(e.target.value)}
              fullWidth
            />
            <TextField
              label="Condition"
              value={newRuleCondition}
              onChange={(e) => setNewRuleCondition(e.target.value)}
              placeholder="temperature > 30"
              fullWidth
            />
            <TextField
              select
              label="Severity"
              value={newRuleSeverity}
              onChange={(e) => setNewRuleSeverity(e.target.value as AlertSeverity)}
              fullWidth
            >
              <MenuItem value="info">Info</MenuItem>
              <MenuItem value="warning">Warning</MenuItem>
              <MenuItem value="critical">Critical</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateRuleDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateRule}
            disabled={!newRuleName || !newRuleCondition}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

/**
 * Generate sample alerts
 */
function getSampleAlerts(): Alert[] {
  return [
    {
      id: '1',
      title: 'High Temperature Alert',
      description: 'Greenhouse A temperature exceeded safe threshold',
      severity: 'critical',
      status: 'active',
      triggeredAt: new Date(Date.now() - 15 * 60 * 1000),
      source: 'Temperature Sensor #12',
      value: 38,
      threshold: 35,
      unit: '°C',
    },
    {
      id: '2',
      title: 'Low Soil Moisture',
      description: 'Soil moisture level below minimum for Zone 3',
      severity: 'warning',
      status: 'acknowledged',
      triggeredAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      acknowledgedAt: new Date(Date.now() - 30 * 60 * 1000),
      source: 'Moisture Sensor #8',
      value: 18,
      threshold: 25,
      unit: '%',
    },
    {
      id: '3',
      title: 'Sensor Offline',
      description: 'pH sensor has been offline for extended period',
      severity: 'warning',
      status: 'resolved',
      triggeredAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      resolvedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      source: 'pH Sensor #5',
    },
    {
      id: '4',
      title: 'Irrigation System Active',
      description: 'Automated watering cycle started for Zone 1',
      severity: 'info',
      status: 'resolved',
      triggeredAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      resolvedAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000),
      source: 'Automation System',
    },
  ];
}

/**
 * Generate sample alert rules
 */
function getSampleRules(): AlertRule[] {
  return [
    {
      id: '1',
      name: 'High Temperature Warning',
      condition: 'temperature > 30',
      severity: 'warning',
      enabled: true,
    },
    {
      id: '2',
      name: 'Critical Temperature',
      condition: 'temperature > 35',
      severity: 'critical',
      enabled: true,
    },
    {
      id: '3',
      name: 'Low Soil Moisture',
      condition: 'soil_moisture < 25',
      severity: 'warning',
      enabled: true,
    },
  ];
}
