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
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Save as SaveIcon,
  ContentCopy as CopyIcon,
  Settings as SettingsIcon,
  Notifications as NotifyIcon,
  Send as SendIcon,
  Timer as TimerIcon,
  CompareArrows as ConditionIcon,
  Functions as FunctionIcon,
  WaterDrop as WaterIcon,
  Lightbulb as LightIcon,
  Thermostat as TempIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
  Webhook as WebhookIcon,
} from '@mui/icons-material';

export type WorkflowTriggerType =
  | 'sensor_reading'
  | 'schedule'
  | 'manual'
  | 'threshold'
  | 'event';

export type WorkflowActionType =
  | 'send_notification'
  | 'send_email'
  | 'send_sms'
  | 'webhook'
  | 'control_device'
  | 'update_setting'
  | 'log_event';

export interface WorkflowTrigger {
  id: string;
  type: WorkflowTriggerType;
  config: Record<string, any>;
}

export interface WorkflowCondition {
  id: string;
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
  value: any;
}

export interface WorkflowAction {
  id: string;
  type: WorkflowActionType;
  config: Record<string, any>;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  trigger: WorkflowTrigger;
  conditions?: WorkflowCondition[];
  actions: WorkflowAction[];
  lastRun?: Date;
  runCount?: number;
}

export interface WorkflowBuilderProps {
  workflows?: Workflow[];
  onSave?: (workflow: Workflow) => void;
  onDelete?: (workflowId: string) => void;
  onToggle?: (workflowId: string, enabled: boolean) => void;
  onRun?: (workflowId: string) => void;
}

/**
 * Visual workflow builder for creating automated workflows
 */
export function WorkflowBuilder({
  workflows: initialWorkflows = [],
  onSave,
  onDelete,
  onToggle,
  onRun,
}: WorkflowBuilderProps) {
  const [workflows, setWorkflows] = useState<Workflow[]>(
    initialWorkflows.length > 0 ? initialWorkflows : getSampleWorkflows()
  );
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentWorkflow, setCurrentWorkflow] = useState<Workflow | null>(null);
  const [activeStep, setActiveStep] = useState(0);

  const handleNew = () => {
    setCurrentWorkflow({
      id: `workflow-${Date.now()}`,
      name: 'New Workflow',
      enabled: true,
      trigger: {
        id: 'trigger-1',
        type: 'sensor_reading',
        config: {},
      },
      actions: [],
    });
    setActiveStep(0);
    setEditDialogOpen(true);
  };

  const handleEdit = (workflow: Workflow) => {
    setCurrentWorkflow(workflow);
    setActiveStep(0);
    setEditDialogOpen(true);
  };

  const handleSave = () => {
    if (!currentWorkflow) return;

    const updated = workflows.some((w) => w.id === currentWorkflow.id);
    if (updated) {
      setWorkflows(workflows.map((w) => (w.id === currentWorkflow.id ? currentWorkflow : w)));
    } else {
      setWorkflows([...workflows, currentWorkflow]);
    }

    onSave?.(currentWorkflow);
    setEditDialogOpen(false);
    setCurrentWorkflow(null);
  };

  const handleDelete = (workflowId: string) => {
    setWorkflows(workflows.filter((w) => w.id !== workflowId));
    onDelete?.(workflowId);
  };

  const handleToggle = (workflowId: string) => {
    setWorkflows(
      workflows.map((w) =>
        w.id === workflowId ? { ...w, enabled: !w.enabled } : w
      )
    );
    const workflow = workflows.find((w) => w.id === workflowId);
    if (workflow) {
      onToggle?.(workflowId, !workflow.enabled);
    }
  };

  const handleRun = (workflowId: string) => {
    setWorkflows(
      workflows.map((w) =>
        w.id === workflowId
          ? {
              ...w,
              lastRun: new Date(),
              runCount: (w.runCount || 0) + 1,
            }
          : w
      )
    );
    onRun?.(workflowId);
  };

  const addCondition = () => {
    if (!currentWorkflow) return;
    const newCondition: WorkflowCondition = {
      id: `condition-${Date.now()}`,
      field: 'temperature',
      operator: 'greater_than',
      value: 25,
    };
    setCurrentWorkflow({
      ...currentWorkflow,
      conditions: [...(currentWorkflow.conditions || []), newCondition],
    });
  };

  const addAction = () => {
    if (!currentWorkflow) return;
    const newAction: WorkflowAction = {
      id: `action-${Date.now()}`,
      type: 'send_notification',
      config: { title: 'Alert', message: 'Workflow triggered' },
    };
    setCurrentWorkflow({
      ...currentWorkflow,
      actions: [...currentWorkflow.actions, newAction],
    });
  };

  const removeCondition = (conditionId: string) => {
    if (!currentWorkflow) return;
    setCurrentWorkflow({
      ...currentWorkflow,
      conditions: currentWorkflow.conditions?.filter((c) => c.id !== conditionId),
    });
  };

  const removeAction = (actionId: string) => {
    if (!currentWorkflow) return;
    setCurrentWorkflow({
      ...currentWorkflow,
      actions: currentWorkflow.actions.filter((a) => a.id !== actionId),
    });
  };

  const getTriggerIcon = (type: WorkflowTriggerType) => {
    switch (type) {
      case 'sensor_reading':
        return <TempIcon />;
      case 'schedule':
        return <TimerIcon />;
      case 'threshold':
        return <ConditionIcon />;
      case 'event':
        return <NotifyIcon />;
      default:
        return <SettingsIcon />;
    }
  };

  const getActionIcon = (type: WorkflowActionType) => {
    switch (type) {
      case 'send_notification':
        return <NotifyIcon />;
      case 'send_email':
        return <EmailIcon />;
      case 'send_sms':
        return <SmsIcon />;
      case 'webhook':
        return <WebhookIcon />;
      case 'control_device':
        return <SettingsIcon />;
      default:
        return <FunctionIcon />;
    }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5">Workflows</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleNew}>
          New Workflow
        </Button>
      </Stack>

      <Grid container spacing={2}>
        {workflows.map((workflow) => (
          <Grid item xs={12} md={6} key={workflow.id}>
            <Card>
              <CardHeader
                avatar={getTriggerIcon(workflow.trigger.type)}
                title={workflow.name}
                subheader={
                  <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                    <Chip
                      label={workflow.enabled ? 'Active' : 'Inactive'}
                      color={workflow.enabled ? 'success' : 'default'}
                      size="small"
                    />
                    <Chip
                      label={`${workflow.actions.length} action${
                        workflow.actions.length !== 1 ? 's' : ''
                      }`}
                      size="small"
                    />
                  </Stack>
                }
                action={
                  <Stack direction="row">
                    <IconButton onClick={() => handleRun(workflow.id)}>
                      <PlayIcon />
                    </IconButton>
                    <IconButton onClick={() => handleEdit(workflow)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(workflow.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                }
              />
              <CardContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {workflow.description || 'No description'}
                </Typography>

                <Stack spacing={1}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Trigger
                    </Typography>
                    <Typography variant="body2">
                      {workflow.trigger.type.replace('_', ' ')}
                    </Typography>
                  </Box>

                  {workflow.conditions && workflow.conditions.length > 0 && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Conditions
                      </Typography>
                      <Typography variant="body2">
                        {workflow.conditions.length} condition
                        {workflow.conditions.length !== 1 ? 's' : ''}
                      </Typography>
                    </Box>
                  )}

                  {workflow.lastRun && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Last Run
                      </Typography>
                      <Typography variant="body2">
                        {workflow.lastRun.toLocaleString()} ({workflow.runCount || 0} times)
                      </Typography>
                    </Box>
                  )}
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Stack direction="row" justifyContent="space-between">
                  <Button
                    size="small"
                    onClick={() => handleToggle(workflow.id)}
                    startIcon={workflow.enabled ? <StopIcon /> : <PlayIcon />}
                  >
                    {workflow.enabled ? 'Disable' : 'Enable'}
                  </Button>
                  <Button size="small" startIcon={<CopyIcon />}>
                    Duplicate
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Workflow Editor Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {currentWorkflow?.id.startsWith('workflow-') ? 'New Workflow' : 'Edit Workflow'}
        </DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep} orientation="vertical">
            {/* Step 1: Basic Info */}
            <Step>
              <StepLabel>Basic Information</StepLabel>
              <StepContent>
                <Stack spacing={2}>
                  <TextField
                    label="Workflow Name"
                    value={currentWorkflow?.name || ''}
                    onChange={(e) =>
                      setCurrentWorkflow(
                        currentWorkflow ? { ...currentWorkflow, name: e.target.value } : null
                      )
                    }
                    fullWidth
                  />
                  <TextField
                    label="Description"
                    value={currentWorkflow?.description || ''}
                    onChange={(e) =>
                      setCurrentWorkflow(
                        currentWorkflow
                          ? { ...currentWorkflow, description: e.target.value }
                          : null
                      )
                    }
                    multiline
                    rows={2}
                    fullWidth
                  />
                  <Button variant="contained" onClick={() => setActiveStep(1)}>
                    Next
                  </Button>
                </Stack>
              </StepContent>
            </Step>

            {/* Step 2: Trigger */}
            <Step>
              <StepLabel>Configure Trigger</StepLabel>
              <StepContent>
                <Stack spacing={2}>
                  <FormControl fullWidth>
                    <InputLabel>Trigger Type</InputLabel>
                    <Select
                      value={currentWorkflow?.trigger.type || 'sensor_reading'}
                      onChange={(e) =>
                        setCurrentWorkflow(
                          currentWorkflow
                            ? {
                                ...currentWorkflow,
                                trigger: {
                                  ...currentWorkflow.trigger,
                                  type: e.target.value as WorkflowTriggerType,
                                },
                              }
                            : null
                        )
                      }
                    >
                      <MenuItem value="sensor_reading">Sensor Reading</MenuItem>
                      <MenuItem value="schedule">Schedule</MenuItem>
                      <MenuItem value="manual">Manual</MenuItem>
                      <MenuItem value="threshold">Threshold</MenuItem>
                      <MenuItem value="event">Event</MenuItem>
                    </Select>
                  </FormControl>
                  <Stack direction="row" spacing={1}>
                    <Button onClick={() => setActiveStep(0)}>Back</Button>
                    <Button variant="contained" onClick={() => setActiveStep(2)}>
                      Next
                    </Button>
                  </Stack>
                </Stack>
              </StepContent>
            </Step>

            {/* Step 3: Conditions */}
            <Step>
              <StepLabel optional="Optional">Add Conditions</StepLabel>
              <StepContent>
                <Stack spacing={2}>
                  <List>
                    {currentWorkflow?.conditions?.map((condition) => (
                      <ListItem
                        key={condition.id}
                        secondaryAction={
                          <IconButton onClick={() => removeCondition(condition.id)}>
                            <DeleteIcon />
                          </IconButton>
                        }
                      >
                        <ListItemText
                          primary={`${condition.field} ${condition.operator} ${condition.value}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                  <Button startIcon={<AddIcon />} onClick={addCondition}>
                    Add Condition
                  </Button>
                  <Stack direction="row" spacing={1}>
                    <Button onClick={() => setActiveStep(1)}>Back</Button>
                    <Button variant="contained" onClick={() => setActiveStep(3)}>
                      Next
                    </Button>
                  </Stack>
                </Stack>
              </StepContent>
            </Step>

            {/* Step 4: Actions */}
            <Step>
              <StepLabel>Configure Actions</StepLabel>
              <StepContent>
                <Stack spacing={2}>
                  <List>
                    {currentWorkflow?.actions.map((action) => (
                      <ListItem
                        key={action.id}
                        secondaryAction={
                          <IconButton onClick={() => removeAction(action.id)}>
                            <DeleteIcon />
                          </IconButton>
                        }
                      >
                        <ListItemIcon>{getActionIcon(action.type)}</ListItemIcon>
                        <ListItemText
                          primary={action.type.replace('_', ' ')}
                          secondary={JSON.stringify(action.config)}
                        />
                      </ListItem>
                    ))}
                  </List>
                  <Button startIcon={<AddIcon />} onClick={addAction}>
                    Add Action
                  </Button>
                  <Stack direction="row" spacing={1}>
                    <Button onClick={() => setActiveStep(2)}>Back</Button>
                    <Button variant="contained" onClick={handleSave}>
                      Save Workflow
                    </Button>
                  </Stack>
                </Stack>
              </StepContent>
            </Step>
          </Stepper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

/**
 * Generate sample workflows
 */
function getSampleWorkflows(): Workflow[] {
  return [
    {
      id: '1',
      name: 'High Temperature Alert',
      description: 'Send notification when temperature exceeds 30°C',
      enabled: true,
      trigger: {
        id: 'trigger-1',
        type: 'sensor_reading',
        config: { sensor: 'temperature' },
      },
      conditions: [
        {
          id: 'cond-1',
          field: 'temperature',
          operator: 'greater_than',
          value: 30,
        },
      ],
      actions: [
        {
          id: 'action-1',
          type: 'send_notification',
          config: { title: 'High Temperature', message: 'Temperature exceeded 30°C' },
        },
        {
          id: 'action-2',
          type: 'send_email',
          config: { to: 'admin@example.com', subject: 'Temperature Alert' },
        },
      ],
      lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000),
      runCount: 15,
    },
    {
      id: '2',
      name: 'Daily Watering Reminder',
      description: 'Send watering reminder every morning at 8 AM',
      enabled: true,
      trigger: {
        id: 'trigger-2',
        type: 'schedule',
        config: { cron: '0 8 * * *' },
      },
      actions: [
        {
          id: 'action-3',
          type: 'send_notification',
          config: { title: 'Watering Time', message: 'Time to water your plants!' },
        },
      ],
      lastRun: new Date(Date.now() - 16 * 60 * 60 * 1000),
      runCount: 45,
    },
    {
      id: '3',
      name: 'Low Soil Moisture Action',
      description: 'Activate irrigation when soil moisture is low',
      enabled: false,
      trigger: {
        id: 'trigger-3',
        type: 'threshold',
        config: { metric: 'soil_moisture', threshold: 30 },
      },
      conditions: [
        {
          id: 'cond-2',
          field: 'soil_moisture',
          operator: 'less_than',
          value: 30,
        },
      ],
      actions: [
        {
          id: 'action-4',
          type: 'control_device',
          config: { device: 'irrigation_system', action: 'turn_on', duration: 600 },
        },
        {
          id: 'action-5',
          type: 'log_event',
          config: { event: 'auto_irrigation_triggered' },
        },
      ],
    },
  ];
}
