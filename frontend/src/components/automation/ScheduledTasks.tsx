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
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  PlayArrow as RunIcon,
  Schedule as ScheduleIcon,
  Event as EventIcon,
  Repeat as RepeatIcon,
  AccessTime as TimeIcon,
  CheckCircle as DoneIcon,
  Error as ErrorIcon,
  Pending as PendingIcon,
  History as HistoryIcon,
} from '@mui/icons-material';

export type TaskFrequency = 'once' | 'daily' | 'weekly' | 'monthly' | 'custom';
export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface ScheduledTask {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  frequency: TaskFrequency;
  schedule: {
    time?: string; // HH:MM format
    dayOfWeek?: number; // 0-6 (Sunday-Saturday)
    dayOfMonth?: number; // 1-31
    cron?: string; // Cron expression for custom schedules
  };
  action: {
    type: string;
    params: Record<string, any>;
  };
  nextRun?: Date;
  lastRun?: Date;
  lastStatus?: TaskStatus;
  runCount?: number;
  successCount?: number;
  failureCount?: number;
}

export interface TaskExecution {
  id: string;
  taskId: string;
  taskName: string;
  startTime: Date;
  endTime?: Date;
  status: TaskStatus;
  result?: any;
  error?: string;
}

export interface ScheduledTasksProps {
  tasks?: ScheduledTask[];
  executions?: TaskExecution[];
  onSave?: (task: ScheduledTask) => void;
  onDelete?: (taskId: string) => void;
  onToggle?: (taskId: string, enabled: boolean) => void;
  onRunNow?: (taskId: string) => Promise<void>;
}

/**
 * Task scheduling and management component
 */
export function ScheduledTasks({
  tasks: initialTasks = [],
  executions: initialExecutions = [],
  onSave,
  onDelete,
  onToggle,
  onRunNow,
}: ScheduledTasksProps) {
  const [tasks, setTasks] = useState<ScheduledTask[]>(
    initialTasks.length > 0 ? initialTasks : getSampleTasks()
  );
  const [executions, setExecutions] = useState<TaskExecution[]>(
    initialExecutions.length > 0 ? initialExecutions : getSampleExecutions()
  );
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<ScheduledTask | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  const handleNew = () => {
    setCurrentTask({
      id: `task-${Date.now()}`,
      name: 'New Scheduled Task',
      enabled: true,
      frequency: 'daily',
      schedule: {
        time: '08:00',
      },
      action: {
        type: 'send_notification',
        params: { message: 'Task executed' },
      },
    });
    setEditDialogOpen(true);
  };

  const handleEdit = (task: ScheduledTask) => {
    setCurrentTask({ ...task });
    setEditDialogOpen(true);
  };

  const handleSave = () => {
    if (!currentTask) return;

    // Calculate next run time
    const nextRun = calculateNextRun(currentTask);
    const taskToSave = { ...currentTask, nextRun };

    const updated = tasks.some((t) => t.id === currentTask.id);
    if (updated) {
      setTasks(tasks.map((t) => (t.id === currentTask.id ? taskToSave : t)));
    } else {
      setTasks([...tasks, taskToSave]);
    }

    onSave?.(taskToSave);
    setEditDialogOpen(false);
    setCurrentTask(null);
  };

  const handleDelete = (taskId: string) => {
    setTasks(tasks.filter((t) => t.id !== taskId));
    onDelete?.(taskId);
  };

  const handleToggle = (taskId: string) => {
    setTasks(
      tasks.map((t) => (t.id === taskId ? { ...t, enabled: !t.enabled } : t))
    );
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      onToggle?.(taskId, !task.enabled);
    }
  };

  const handleRunNow = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const execution: TaskExecution = {
      id: `exec-${Date.now()}`,
      taskId: task.id,
      taskName: task.name,
      startTime: new Date(),
      status: 'running',
    };

    setExecutions([execution, ...executions]);

    try {
      if (onRunNow) {
        await onRunNow(taskId);
      }

      // Simulate execution
      setTimeout(() => {
        execution.endTime = new Date();
        execution.status = 'completed';
        setExecutions([execution, ...executions.slice(1)]);

        // Update task stats
        setTasks(
          tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  lastRun: new Date(),
                  lastStatus: 'completed',
                  runCount: (t.runCount || 0) + 1,
                  successCount: (t.successCount || 0) + 1,
                }
              : t
          )
        );
      }, 2000);
    } catch (error) {
      execution.endTime = new Date();
      execution.status = 'failed';
      execution.error = error instanceof Error ? error.message : 'Unknown error';
      setExecutions([execution, ...executions.slice(1)]);

      setTasks(
        tasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                lastRun: new Date(),
                lastStatus: 'failed',
                runCount: (t.runCount || 0) + 1,
                failureCount: (t.failureCount || 0) + 1,
              }
            : t
        )
      );
    }
  };

  const calculateNextRun = (task: ScheduledTask): Date => {
    const now = new Date();
    const next = new Date();

    switch (task.frequency) {
      case 'once':
        return now;

      case 'daily':
        if (task.schedule.time) {
          const [hours, minutes] = task.schedule.time.split(':').map(Number);
          next.setHours(hours, minutes, 0, 0);
          if (next <= now) {
            next.setDate(next.getDate() + 1);
          }
        }
        break;

      case 'weekly':
        if (task.schedule.time && task.schedule.dayOfWeek !== undefined) {
          const [hours, minutes] = task.schedule.time.split(':').map(Number);
          next.setHours(hours, minutes, 0, 0);
          const currentDay = next.getDay();
          const targetDay = task.schedule.dayOfWeek;
          let daysToAdd = targetDay - currentDay;
          if (daysToAdd <= 0 || (daysToAdd === 0 && next <= now)) {
            daysToAdd += 7;
          }
          next.setDate(next.getDate() + daysToAdd);
        }
        break;

      case 'monthly':
        if (task.schedule.time && task.schedule.dayOfMonth) {
          const [hours, minutes] = task.schedule.time.split(':').map(Number);
          next.setDate(task.schedule.dayOfMonth);
          next.setHours(hours, minutes, 0, 0);
          if (next <= now) {
            next.setMonth(next.getMonth() + 1);
          }
        }
        break;

      case 'custom':
        // For custom cron, would need a cron parser library
        next.setHours(next.getHours() + 1);
        break;
    }

    return next;
  };

  const getFrequencyDisplay = (task: ScheduledTask): string => {
    switch (task.frequency) {
      case 'once':
        return 'Once';
      case 'daily':
        return `Daily at ${task.schedule.time}`;
      case 'weekly':
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return `Weekly on ${days[task.schedule.dayOfWeek || 0]} at ${task.schedule.time}`;
      case 'monthly':
        return `Monthly on day ${task.schedule.dayOfMonth} at ${task.schedule.time}`;
      case 'custom':
        return `Custom: ${task.schedule.cron}`;
      default:
        return 'Unknown';
    }
  };

  const getStatusIcon = (status?: TaskStatus) => {
    switch (status) {
      case 'completed':
        return <DoneIcon color="success" />;
      case 'failed':
        return <ErrorIcon color="error" />;
      case 'running':
        return <PendingIcon color="info" />;
      default:
        return <ScheduleIcon />;
    }
  };

  const getStatusColor = (status?: TaskStatus) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      case 'running':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5">Scheduled Tasks</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage recurring and one-time scheduled tasks
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleNew}>
          New Task
        </Button>
      </Stack>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
          <Tab label="Tasks" icon={<ScheduleIcon />} iconPosition="start" />
          <Tab label="Execution History" icon={<HistoryIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* Tasks Tab */}
      {activeTab === 0 && (
        <Grid container spacing={2}>
          {tasks.map((task) => (
            <Grid item xs={12} md={6} key={task.id}>
              <Card>
                <CardContent>
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="start">
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6">{task.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {task.description || 'No description'}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={1}>
                        <IconButton size="small" onClick={() => handleRunNow(task.id)}>
                          <RunIcon />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleEdit(task)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDelete(task.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    </Stack>

                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Chip
                        label={task.enabled ? 'Active' : 'Inactive'}
                        color={task.enabled ? 'success' : 'default'}
                        size="small"
                      />
                      <Chip label={task.frequency} size="small" />
                      {task.lastStatus && (
                        <Chip
                          label={task.lastStatus}
                          color={getStatusColor(task.lastStatus) as any}
                          size="small"
                        />
                      )}
                    </Stack>

                    <Divider />

                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Schedule
                      </Typography>
                      <Typography variant="body2">{getFrequencyDisplay(task)}</Typography>
                    </Box>

                    {task.nextRun && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Next Run
                        </Typography>
                        <Typography variant="body2">{task.nextRun.toLocaleString()}</Typography>
                      </Box>
                    )}

                    {task.runCount && task.runCount > 0 && (
                      <Grid container spacing={2}>
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary">
                            Total Runs
                          </Typography>
                          <Typography variant="body2">{task.runCount}</Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary">
                            Success
                          </Typography>
                          <Typography variant="body2" color="success.main">
                            {task.successCount || 0}
                          </Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary">
                            Failed
                          </Typography>
                          <Typography variant="body2" color="error.main">
                            {task.failureCount || 0}
                          </Typography>
                        </Grid>
                      </Grid>
                    )}

                    <Divider />

                    <FormControlLabel
                      control={
                        <Switch
                          checked={task.enabled}
                          onChange={() => handleToggle(task.id)}
                        />
                      }
                      label={task.enabled ? 'Enabled' : 'Disabled'}
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Execution History Tab */}
      {activeTab === 1 && (
        <Paper>
          <List>
            {executions.map((exec) => (
              <React.Fragment key={exec.id}>
                <ListItem>
                  <ListItemIcon>{getStatusIcon(exec.status)}</ListItemIcon>
                  <ListItemText
                    primary={exec.taskName}
                    secondary={
                      <Stack spacing={0.5}>
                        <Typography variant="caption">
                          Started: {exec.startTime.toLocaleString()}
                        </Typography>
                        {exec.endTime && (
                          <Typography variant="caption">
                            Ended: {exec.endTime.toLocaleString()} (
                            {Math.round((exec.endTime.getTime() - exec.startTime.getTime()) / 1000)}
                            s)
                          </Typography>
                        )}
                        {exec.error && (
                          <Typography variant="caption" color="error">
                            Error: {exec.error}
                          </Typography>
                        )}
                      </Stack>
                    }
                  />
                  <Chip label={exec.status} color={getStatusColor(exec.status) as any} size="small" />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
            {executions.length === 0 && (
              <ListItem>
                <ListItemText
                  primary="No execution history"
                  secondary="Run a task to see execution history"
                />
              </ListItem>
            )}
          </List>
        </Paper>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {currentTask?.id.startsWith('task-') ? 'New Scheduled Task' : 'Edit Scheduled Task'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Task Name"
              value={currentTask?.name || ''}
              onChange={(e) =>
                setCurrentTask(currentTask ? { ...currentTask, name: e.target.value } : null)
              }
              fullWidth
            />

            <TextField
              label="Description"
              value={currentTask?.description || ''}
              onChange={(e) =>
                setCurrentTask(
                  currentTask ? { ...currentTask, description: e.target.value } : null
                )
              }
              multiline
              rows={2}
              fullWidth
            />

            <Divider />

            <FormControl component="fieldset">
              <Typography variant="subtitle2" gutterBottom>
                Frequency
              </Typography>
              <RadioGroup
                value={currentTask?.frequency || 'daily'}
                onChange={(e) =>
                  setCurrentTask(
                    currentTask
                      ? { ...currentTask, frequency: e.target.value as TaskFrequency }
                      : null
                  )
                }
              >
                <FormControlLabel value="once" control={<Radio />} label="Once" />
                <FormControlLabel value="daily" control={<Radio />} label="Daily" />
                <FormControlLabel value="weekly" control={<Radio />} label="Weekly" />
                <FormControlLabel value="monthly" control={<Radio />} label="Monthly" />
                <FormControlLabel value="custom" control={<Radio />} label="Custom (Cron)" />
              </RadioGroup>
            </FormControl>

            {currentTask?.frequency !== 'once' && currentTask?.frequency !== 'custom' && (
              <TextField
                label="Time"
                type="time"
                value={currentTask?.schedule.time || '08:00'}
                onChange={(e) =>
                  setCurrentTask(
                    currentTask
                      ? {
                          ...currentTask,
                          schedule: { ...currentTask.schedule, time: e.target.value },
                        }
                      : null
                  )
                }
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            )}

            {currentTask?.frequency === 'weekly' && (
              <FormControl fullWidth>
                <InputLabel>Day of Week</InputLabel>
                <Select
                  value={currentTask?.schedule.dayOfWeek ?? 1}
                  onChange={(e) =>
                    setCurrentTask(
                      currentTask
                        ? {
                            ...currentTask,
                            schedule: {
                              ...currentTask.schedule,
                              dayOfWeek: e.target.value as number,
                            },
                          }
                        : null
                    )
                  }
                >
                  <MenuItem value={0}>Sunday</MenuItem>
                  <MenuItem value={1}>Monday</MenuItem>
                  <MenuItem value={2}>Tuesday</MenuItem>
                  <MenuItem value={3}>Wednesday</MenuItem>
                  <MenuItem value={4}>Thursday</MenuItem>
                  <MenuItem value={5}>Friday</MenuItem>
                  <MenuItem value={6}>Saturday</MenuItem>
                </Select>
              </FormControl>
            )}

            {currentTask?.frequency === 'monthly' && (
              <TextField
                label="Day of Month"
                type="number"
                value={currentTask?.schedule.dayOfMonth || 1}
                onChange={(e) =>
                  setCurrentTask(
                    currentTask
                      ? {
                          ...currentTask,
                          schedule: {
                            ...currentTask.schedule,
                            dayOfMonth: parseInt(e.target.value),
                          },
                        }
                      : null
                  )
                }
                inputProps={{ min: 1, max: 31 }}
                fullWidth
              />
            )}

            {currentTask?.frequency === 'custom' && (
              <TextField
                label="Cron Expression"
                value={currentTask?.schedule.cron || ''}
                onChange={(e) =>
                  setCurrentTask(
                    currentTask
                      ? {
                          ...currentTask,
                          schedule: { ...currentTask.schedule, cron: e.target.value },
                        }
                      : null
                  )
                }
                helperText="Example: 0 8 * * * (every day at 8:00 AM)"
                fullWidth
              />
            )}

            <Divider />

            <Typography variant="subtitle2">Action Configuration</Typography>

            <FormControl fullWidth>
              <InputLabel>Action Type</InputLabel>
              <Select
                value={currentTask?.action.type || 'send_notification'}
                onChange={(e) =>
                  setCurrentTask(
                    currentTask
                      ? { ...currentTask, action: { ...currentTask.action, type: e.target.value } }
                      : null
                  )
                }
              >
                <MenuItem value="send_notification">Send Notification</MenuItem>
                <MenuItem value="send_email">Send Email</MenuItem>
                <MenuItem value="backup_data">Backup Data</MenuItem>
                <MenuItem value="generate_report">Generate Report</MenuItem>
                <MenuItem value="webhook">Webhook</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Action Parameters (JSON)"
              value={JSON.stringify(currentTask?.action.params || {})}
              onChange={(e) => {
                try {
                  const params = JSON.parse(e.target.value);
                  setCurrentTask(
                    currentTask
                      ? { ...currentTask, action: { ...currentTask.action, params } }
                      : null
                  );
                } catch (error) {
                  // Invalid JSON
                }
              }}
              multiline
              rows={3}
              fullWidth
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
 * Generate sample scheduled tasks
 */
function getSampleTasks(): ScheduledTask[] {
  return [
    {
      id: '1',
      name: 'Daily Health Report',
      description: 'Generate and send daily plant health report',
      enabled: true,
      frequency: 'daily',
      schedule: { time: '08:00' },
      action: {
        type: 'generate_report',
        params: { reportType: 'health', recipients: ['admin@example.com'] },
      },
      nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000),
      lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000),
      lastStatus: 'completed',
      runCount: 45,
      successCount: 44,
      failureCount: 1,
    },
    {
      id: '2',
      name: 'Weekly Data Backup',
      description: 'Backup all sensor data and configurations',
      enabled: true,
      frequency: 'weekly',
      schedule: { time: '02:00', dayOfWeek: 0 },
      action: {
        type: 'backup_data',
        params: { destination: 's3://backups/', compress: true },
      },
      nextRun: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      lastRun: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      lastStatus: 'completed',
      runCount: 12,
      successCount: 12,
      failureCount: 0,
    },
    {
      id: '3',
      name: 'Watering Reminder',
      description: 'Send watering reminder notification',
      enabled: false,
      frequency: 'daily',
      schedule: { time: '18:00' },
      action: {
        type: 'send_notification',
        params: { title: 'Watering Time', message: 'Remember to check your plants' },
      },
      nextRun: new Date(Date.now() + 12 * 60 * 60 * 1000),
      runCount: 0,
    },
  ];
}

/**
 * Generate sample executions
 */
function getSampleExecutions(): TaskExecution[] {
  return [
    {
      id: 'exec-1',
      taskId: '1',
      taskName: 'Daily Health Report',
      startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 24 * 60 * 60 * 1000 + 5000),
      status: 'completed',
    },
    {
      id: 'exec-2',
      taskId: '2',
      taskName: 'Weekly Data Backup',
      startTime: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 30000),
      status: 'completed',
    },
  ];
}
