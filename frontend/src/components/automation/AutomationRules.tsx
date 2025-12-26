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
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ExpandMore as ExpandIcon,
  PlayArrow as RunIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  Sensors as SensorIcon,
  Thermostat as TempIcon,
  WaterDrop as WaterIcon,
  Lightbulb as LightIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

export type TriggerType =
  | 'temperature'
  | 'humidity'
  | 'soil_moisture'
  | 'light_level'
  | 'time'
  | 'custom';

export type ActionType =
  | 'send_alert'
  | 'control_device'
  | 'adjust_setting'
  | 'log_data'
  | 'webhook';

export type ComparisonOperator = '>' | '<' | '=' | '>=' | '<=' | '!=';

export interface AutomationRule {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  trigger: {
    type: TriggerType;
    value: number | string;
    operator: ComparisonOperator;
  };
  action: {
    type: ActionType;
    params: Record<string, any>;
  };
  cooldown?: number; // Minutes between activations
  priority?: 'low' | 'medium' | 'high' | 'critical';
  lastTriggered?: Date;
  triggerCount?: number;
  successCount?: number;
  failureCount?: number;
}

export interface AutomationRulesProps {
  rules?: AutomationRule[];
  onSave?: (rule: AutomationRule) => void;
  onDelete?: (ruleId: string) => void;
  onToggle?: (ruleId: string, enabled: boolean) => void;
  onTest?: (ruleId: string) => Promise<boolean>;
}

/**
 * Simple trigger-action automation rules system
 */
export function AutomationRules({
  rules: initialRules = [],
  onSave,
  onDelete,
  onToggle,
  onTest,
}: AutomationRulesProps) {
  const [rules, setRules] = useState<AutomationRule[]>(
    initialRules.length > 0 ? initialRules : getSampleRules()
  );
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentRule, setCurrentRule] = useState<AutomationRule | null>(null);
  const [testingRuleId, setTestingRuleId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleNew = () => {
    setCurrentRule({
      id: `rule-${Date.now()}`,
      name: 'New Rule',
      enabled: true,
      trigger: {
        type: 'temperature',
        value: 25,
        operator: '>',
      },
      action: {
        type: 'send_alert',
        params: { message: 'Alert triggered' },
      },
      priority: 'medium',
      cooldown: 30,
    });
    setEditDialogOpen(true);
  };

  const handleEdit = (rule: AutomationRule) => {
    setCurrentRule({ ...rule });
    setEditDialogOpen(true);
  };

  const handleSave = () => {
    if (!currentRule) return;

    const updated = rules.some((r) => r.id === currentRule.id);
    if (updated) {
      setRules(rules.map((r) => (r.id === currentRule.id ? currentRule : r)));
    } else {
      setRules([...rules, currentRule]);
    }

    onSave?.(currentRule);
    setEditDialogOpen(false);
    setCurrentRule(null);
  };

  const handleDelete = (ruleId: string) => {
    setRules(rules.filter((r) => r.id !== ruleId));
    onDelete?.(ruleId);
  };

  const handleToggle = (ruleId: string) => {
    setRules(
      rules.map((r) => (r.id === ruleId ? { ...r, enabled: !r.enabled } : r))
    );
    const rule = rules.find((r) => r.id === ruleId);
    if (rule) {
      onToggle?.(ruleId, !rule.enabled);
    }
  };

  const handleTest = async (ruleId: string) => {
    setTestingRuleId(ruleId);
    setTestResult(null);

    try {
      const success = onTest ? await onTest(ruleId) : true;
      setTestResult({
        success,
        message: success ? 'Rule executed successfully' : 'Rule execution failed',
      });

      // Update rule stats
      setRules(
        rules.map((r) =>
          r.id === ruleId
            ? {
                ...r,
                lastTriggered: new Date(),
                triggerCount: (r.triggerCount || 0) + 1,
                successCount: success ? (r.successCount || 0) + 1 : r.successCount,
                failureCount: !success ? (r.failureCount || 0) + 1 : r.failureCount,
              }
            : r
        )
      );
    } catch (error) {
      setTestResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setTestingRuleId(null);
    }
  };

  const getTriggerIcon = (type: TriggerType) => {
    switch (type) {
      case 'temperature':
        return <TempIcon />;
      case 'humidity':
      case 'soil_moisture':
        return <WaterIcon />;
      case 'light_level':
        return <LightIcon />;
      case 'time':
        return <ScheduleIcon />;
      default:
        return <SensorIcon />;
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
      default:
        return 'default';
    }
  };

  const getSuccessRate = (rule: AutomationRule) => {
    const total = (rule.triggerCount || 0);
    if (total === 0) return 'N/A';
    const success = (rule.successCount || 0);
    return `${Math.round((success / total) * 100)}%`;
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5">Automation Rules</Typography>
          <Typography variant="body2" color="text.secondary">
            Create simple if-then automation rules
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleNew}>
          New Rule
        </Button>
      </Stack>

      {testResult && (
        <Alert
          severity={testResult.success ? 'success' : 'error'}
          onClose={() => setTestResult(null)}
          sx={{ mb: 2 }}
        >
          {testResult.message}
        </Alert>
      )}

      <Stack spacing={2}>
        {rules.map((rule) => (
          <Accordion key={rule.id}>
            <AccordionSummary expandIcon={<ExpandIcon />}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ width: '100%', pr: 2 }}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  {getTriggerIcon(rule.trigger.type)}
                  <Box>
                    <Typography variant="subtitle1">{rule.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      When {rule.trigger.type} {rule.trigger.operator} {rule.trigger.value}, then{' '}
                      {rule.action.type}
                    </Typography>
                  </Box>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    label={rule.priority || 'medium'}
                    color={getPriorityColor(rule.priority) as any}
                    size="small"
                  />
                  <Chip
                    label={rule.enabled ? 'Active' : 'Inactive'}
                    color={rule.enabled ? 'success' : 'default'}
                    size="small"
                  />
                  <Switch
                    checked={rule.enabled}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleToggle(rule.id);
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </Stack>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                {rule.description && (
                  <Typography variant="body2" color="text.secondary">
                    {rule.description}
                  </Typography>
                )}

                <Divider />

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, bgcolor: 'primary.50' }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Trigger
                      </Typography>
                      <Typography variant="body2">
                        <strong>Type:</strong> {rule.trigger.type}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Condition:</strong> {rule.trigger.operator} {rule.trigger.value}
                      </Typography>
                      {rule.cooldown && (
                        <Typography variant="body2">
                          <strong>Cooldown:</strong> {rule.cooldown} minutes
                        </Typography>
                      )}
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, bgcolor: 'success.50' }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Action
                      </Typography>
                      <Typography variant="body2">
                        <strong>Type:</strong> {rule.action.type}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Params:</strong> {JSON.stringify(rule.action.params)}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>

                {/* Statistics */}
                {rule.triggerCount && rule.triggerCount > 0 && (
                  <>
                    <Divider />
                    <Grid container spacing={2}>
                      <Grid item xs={6} sm={3}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Triggered
                          </Typography>
                          <Typography variant="h6">{rule.triggerCount || 0}</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Success Rate
                          </Typography>
                          <Typography variant="h6">{getSuccessRate(rule)}</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Successful
                          </Typography>
                          <Typography variant="h6" color="success.main">
                            {rule.successCount || 0}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Failed
                          </Typography>
                          <Typography variant="h6" color="error.main">
                            {rule.failureCount || 0}
                          </Typography>
                        </Box>
                      </Grid>
                      {rule.lastTriggered && (
                        <Grid item xs={12}>
                          <Typography variant="caption" color="text.secondary">
                            Last Triggered: {rule.lastTriggered.toLocaleString()}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </>
                )}

                <Divider />

                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    startIcon={<RunIcon />}
                    onClick={() => handleTest(rule.id)}
                    disabled={testingRuleId === rule.id}
                  >
                    {testingRuleId === rule.id ? 'Testing...' : 'Test Rule'}
                  </Button>
                  <Button size="small" startIcon={<EditIcon />} onClick={() => handleEdit(rule)}>
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDelete(rule.id)}
                  >
                    Delete
                  </Button>
                </Stack>
              </Stack>
            </AccordionDetails>
          </Accordion>
        ))}
      </Stack>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {currentRule?.id.startsWith('rule-') ? 'New Automation Rule' : 'Edit Automation Rule'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {/* Basic Info */}
            <TextField
              label="Rule Name"
              value={currentRule?.name || ''}
              onChange={(e) =>
                setCurrentRule(currentRule ? { ...currentRule, name: e.target.value } : null)
              }
              fullWidth
            />

            <TextField
              label="Description"
              value={currentRule?.description || ''}
              onChange={(e) =>
                setCurrentRule(
                  currentRule ? { ...currentRule, description: e.target.value } : null
                )
              }
              multiline
              rows={2}
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={currentRule?.priority || 'medium'}
                onChange={(e) =>
                  setCurrentRule(
                    currentRule
                      ? { ...currentRule, priority: e.target.value as any }
                      : null
                  )
                }
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
              </Select>
            </FormControl>

            <Divider />

            {/* Trigger */}
            <Typography variant="subtitle2">Trigger Configuration</Typography>

            <FormControl fullWidth>
              <InputLabel>Trigger Type</InputLabel>
              <Select
                value={currentRule?.trigger.type || 'temperature'}
                onChange={(e) =>
                  setCurrentRule(
                    currentRule
                      ? {
                          ...currentRule,
                          trigger: { ...currentRule.trigger, type: e.target.value as TriggerType },
                        }
                      : null
                  )
                }
              >
                <MenuItem value="temperature">Temperature</MenuItem>
                <MenuItem value="humidity">Humidity</MenuItem>
                <MenuItem value="soil_moisture">Soil Moisture</MenuItem>
                <MenuItem value="light_level">Light Level</MenuItem>
                <MenuItem value="time">Time</MenuItem>
                <MenuItem value="custom">Custom</MenuItem>
              </Select>
            </FormControl>

            <Grid container spacing={2}>
              <Grid item xs={4}>
                <FormControl fullWidth>
                  <InputLabel>Operator</InputLabel>
                  <Select
                    value={currentRule?.trigger.operator || '>'}
                    onChange={(e) =>
                      setCurrentRule(
                        currentRule
                          ? {
                              ...currentRule,
                              trigger: {
                                ...currentRule.trigger,
                                operator: e.target.value as ComparisonOperator,
                              },
                            }
                          : null
                      )
                    }
                  >
                    <MenuItem value=">">{'>'}</MenuItem>
                    <MenuItem value="<">{'<'}</MenuItem>
                    <MenuItem value="=">{'='}</MenuItem>
                    <MenuItem value=">=">{'>='}</MenuItem>
                    <MenuItem value="<=">{'<='}</MenuItem>
                    <MenuItem value="!=">{'!='}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={8}>
                <TextField
                  label="Value"
                  type="number"
                  value={currentRule?.trigger.value || 0}
                  onChange={(e) =>
                    setCurrentRule(
                      currentRule
                        ? {
                            ...currentRule,
                            trigger: { ...currentRule.trigger, value: parseFloat(e.target.value) },
                          }
                        : null
                    )
                  }
                  fullWidth
                />
              </Grid>
            </Grid>

            <TextField
              label="Cooldown (minutes)"
              type="number"
              value={currentRule?.cooldown || 30}
              onChange={(e) =>
                setCurrentRule(
                  currentRule ? { ...currentRule, cooldown: parseInt(e.target.value) } : null
                )
              }
              helperText="Minimum time between rule activations"
              fullWidth
            />

            <Divider />

            {/* Action */}
            <Typography variant="subtitle2">Action Configuration</Typography>

            <FormControl fullWidth>
              <InputLabel>Action Type</InputLabel>
              <Select
                value={currentRule?.action.type || 'send_alert'}
                onChange={(e) =>
                  setCurrentRule(
                    currentRule
                      ? {
                          ...currentRule,
                          action: { ...currentRule.action, type: e.target.value as ActionType },
                        }
                      : null
                  )
                }
              >
                <MenuItem value="send_alert">Send Alert</MenuItem>
                <MenuItem value="control_device">Control Device</MenuItem>
                <MenuItem value="adjust_setting">Adjust Setting</MenuItem>
                <MenuItem value="log_data">Log Data</MenuItem>
                <MenuItem value="webhook">Webhook</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Action Parameters (JSON)"
              value={JSON.stringify(currentRule?.action.params || {})}
              onChange={(e) => {
                try {
                  const params = JSON.parse(e.target.value);
                  setCurrentRule(
                    currentRule
                      ? { ...currentRule, action: { ...currentRule.action, params } }
                      : null
                  );
                } catch (error) {
                  // Invalid JSON, ignore
                }
              }}
              multiline
              rows={3}
              fullWidth
              helperText="Enter valid JSON object"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

/**
 * Generate sample automation rules
 */
function getSampleRules(): AutomationRule[] {
  return [
    {
      id: '1',
      name: 'High Temperature Alert',
      description: 'Alert when temperature exceeds safe threshold',
      enabled: true,
      trigger: {
        type: 'temperature',
        value: 30,
        operator: '>',
      },
      action: {
        type: 'send_alert',
        params: {
          title: 'High Temperature',
          message: 'Temperature has exceeded 30°C',
          severity: 'warning',
        },
      },
      cooldown: 30,
      priority: 'high',
      lastTriggered: new Date(Date.now() - 3 * 60 * 60 * 1000),
      triggerCount: 8,
      successCount: 8,
      failureCount: 0,
    },
    {
      id: '2',
      name: 'Low Soil Moisture',
      description: 'Activate irrigation when soil moisture drops below 25%',
      enabled: true,
      trigger: {
        type: 'soil_moisture',
        value: 25,
        operator: '<',
      },
      action: {
        type: 'control_device',
        params: {
          device: 'irrigation_system',
          action: 'activate',
          duration: 600,
        },
      },
      cooldown: 120,
      priority: 'critical',
      lastTriggered: new Date(Date.now() - 24 * 60 * 60 * 1000),
      triggerCount: 12,
      successCount: 11,
      failureCount: 1,
    },
    {
      id: '3',
      name: 'Low Light Detection',
      description: 'Turn on grow lights when light level is insufficient',
      enabled: false,
      trigger: {
        type: 'light_level',
        value: 200,
        operator: '<',
      },
      action: {
        type: 'control_device',
        params: {
          device: 'grow_lights',
          action: 'turn_on',
        },
      },
      cooldown: 60,
      priority: 'medium',
      triggerCount: 5,
      successCount: 5,
      failureCount: 0,
    },
  ];
}
