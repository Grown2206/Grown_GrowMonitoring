import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
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
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  PlayArrow as RunIcon,
  Pause as PauseIcon,
  Add as AddIcon,
  Email as EmailIcon,
  NotificationsActive as NotificationIcon,
  CloudDownload as DownloadIcon,
} from '@mui/icons-material';

export interface ScheduleConfig {
  id?: string;
  reportId: string;
  reportName: string;
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  time: string;
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
  customCron?: string;
  recipients?: string[];
  deliveryMethods: Array<'email' | 'notification' | 'download'>;
  format: 'pdf' | 'excel' | 'csv';
  nextRun?: Date;
  lastRun?: Date;
}

export interface ReportSchedulerProps {
  schedules?: ScheduleConfig[];
  availableReports?: Array<{ id: string; name: string }>;
  onCreateSchedule?: (schedule: ScheduleConfig) => void;
  onUpdateSchedule?: (id: string, schedule: ScheduleConfig) => void;
  onDeleteSchedule?: (id: string) => void;
  onRunNow?: (id: string) => void;
}

/**
 * Schedule automated report generation and delivery
 */
export function ReportScheduler({
  schedules: initialSchedules = [],
  availableReports = [],
  onCreateSchedule,
  onUpdateSchedule,
  onDeleteSchedule,
  onRunNow,
}: ReportSchedulerProps) {
  const [schedules, setSchedules] = useState<ScheduleConfig[]>(initialSchedules);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleConfig | null>(null);
  const [formData, setFormData] = useState<Partial<ScheduleConfig>>({
    enabled: true,
    frequency: 'weekly',
    time: '09:00',
    deliveryMethods: ['email'],
    format: 'pdf',
    recipients: [],
  });

  const handleCreateSchedule = () => {
    setEditingSchedule(null);
    setFormData({
      enabled: true,
      frequency: 'weekly',
      time: '09:00',
      deliveryMethods: ['email'],
      format: 'pdf',
      recipients: [],
    });
    setDialogOpen(true);
  };

  const handleEditSchedule = (schedule: ScheduleConfig) => {
    setEditingSchedule(schedule);
    setFormData(schedule);
    setDialogOpen(true);
  };

  const handleSaveSchedule = () => {
    const newSchedule: ScheduleConfig = {
      ...formData,
      id: editingSchedule?.id || `schedule-${Date.now()}`,
      reportId: formData.reportId || '',
      reportName: formData.reportName || '',
      enabled: formData.enabled ?? true,
      frequency: formData.frequency || 'weekly',
      time: formData.time || '09:00',
      deliveryMethods: formData.deliveryMethods || ['email'],
      format: formData.format || 'pdf',
      recipients: formData.recipients || [],
    };

    if (editingSchedule) {
      if (onUpdateSchedule) {
        onUpdateSchedule(editingSchedule.id!, newSchedule);
      }
      setSchedules((prev) => prev.map((s) => (s.id === editingSchedule.id ? newSchedule : s)));
    } else {
      if (onCreateSchedule) {
        onCreateSchedule(newSchedule);
      }
      setSchedules((prev) => [...prev, newSchedule]);
    }

    setDialogOpen(false);
  };

  const handleDeleteSchedule = (id: string) => {
    if (onDeleteSchedule) {
      onDeleteSchedule(id);
    }
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  };

  const handleToggleSchedule = (id: string) => {
    setSchedules((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const updated = { ...s, enabled: !s.enabled };
          if (onUpdateSchedule) {
            onUpdateSchedule(id, updated);
          }
          return updated;
        }
        return s;
      })
    );
  };

  const handleRunNow = (id: string) => {
    if (onRunNow) {
      onRunNow(id);
    }
  };

  const getFrequencyLabel = (schedule: ScheduleConfig) => {
    switch (schedule.frequency) {
      case 'daily':
        return `Daily at ${schedule.time}`;
      case 'weekly':
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return `Weekly on ${days[schedule.dayOfWeek || 0]} at ${schedule.time}`;
      case 'monthly':
        return `Monthly on day ${schedule.dayOfMonth} at ${schedule.time}`;
      case 'custom':
        return `Custom: ${schedule.customCron}`;
      default:
        return 'Unknown';
    }
  };

  const [recipientInput, setRecipientInput] = useState('');

  const handleAddRecipient = () => {
    if (recipientInput.trim() && formData.recipients) {
      setFormData({
        ...formData,
        recipients: [...formData.recipients, recipientInput.trim()],
      });
      setRecipientInput('');
    } else if (recipientInput.trim()) {
      setFormData({
        ...formData,
        recipients: [recipientInput.trim()],
      });
      setRecipientInput('');
    }
  };

  const handleRemoveRecipient = (email: string) => {
    setFormData({
      ...formData,
      recipients: formData.recipients?.filter((r) => r !== email),
    });
  };

  const handleDeliveryMethodToggle = (method: 'email' | 'notification' | 'download') => {
    const current = formData.deliveryMethods || [];
    const updated = current.includes(method)
      ? current.filter((m) => m !== method)
      : [...current, method];
    setFormData({ ...formData, deliveryMethods: updated });
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h6">Report Schedules</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateSchedule}>
          New Schedule
        </Button>
      </Stack>

      {schedules.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <ScheduleIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Scheduled Reports
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Create automated schedules to receive reports regularly
          </Typography>
          <Button variant="outlined" startIcon={<AddIcon />} onClick={handleCreateSchedule}>
            Create First Schedule
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Report</TableCell>
                <TableCell>Schedule</TableCell>
                <TableCell>Delivery</TableCell>
                <TableCell>Format</TableCell>
                <TableCell>Next Run</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {schedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell>
                    <Typography variant="body2">{schedule.reportName}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{getFrequencyLabel(schedule)}</Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5}>
                      {schedule.deliveryMethods.map((method) => (
                        <Chip
                          key={method}
                          label={method}
                          size="small"
                          icon={
                            method === 'email' ? (
                              <EmailIcon />
                            ) : method === 'notification' ? (
                              <NotificationIcon />
                            ) : (
                              <DownloadIcon />
                            )
                          }
                        />
                      ))}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip label={schedule.format.toUpperCase()} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {schedule.nextRun
                        ? new Date(schedule.nextRun).toLocaleString()
                        : 'Not scheduled'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={schedule.enabled}
                      onChange={() => handleToggleSchedule(schedule.id!)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                      <IconButton size="small" onClick={() => handleRunNow(schedule.id!)}>
                        <RunIcon />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleEditSchedule(schedule)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteSchedule(schedule.id!)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Schedule Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingSchedule ? 'Edit Schedule' : 'Create Schedule'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {/* Report Selection */}
            <FormControl fullWidth>
              <InputLabel>Report</InputLabel>
              <Select
                value={formData.reportId || ''}
                onChange={(e) => {
                  const report = availableReports.find((r) => r.id === e.target.value);
                  setFormData({
                    ...formData,
                    reportId: e.target.value,
                    reportName: report?.name || '',
                  });
                }}
                label="Report"
              >
                {availableReports.map((report) => (
                  <MenuItem key={report.id} value={report.id}>
                    {report.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Divider />

            {/* Frequency */}
            <FormControl fullWidth>
              <InputLabel>Frequency</InputLabel>
              <Select
                value={formData.frequency}
                onChange={(e) =>
                  setFormData({ ...formData, frequency: e.target.value as any })
                }
                label="Frequency"
              >
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="custom">Custom (Cron)</MenuItem>
              </Select>
            </FormControl>

            {/* Time */}
            <TextField
              label="Time"
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />

            {/* Day of Week (for weekly) */}
            {formData.frequency === 'weekly' && (
              <FormControl fullWidth>
                <InputLabel>Day of Week</InputLabel>
                <Select
                  value={formData.dayOfWeek ?? 1}
                  onChange={(e) =>
                    setFormData({ ...formData, dayOfWeek: e.target.value as number })
                  }
                  label="Day of Week"
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

            {/* Day of Month (for monthly) */}
            {formData.frequency === 'monthly' && (
              <TextField
                label="Day of Month"
                type="number"
                value={formData.dayOfMonth ?? 1}
                onChange={(e) =>
                  setFormData({ ...formData, dayOfMonth: parseInt(e.target.value) })
                }
                InputProps={{ inputProps: { min: 1, max: 31 } }}
                fullWidth
              />
            )}

            {/* Custom Cron */}
            {formData.frequency === 'custom' && (
              <TextField
                label="Cron Expression"
                value={formData.customCron || ''}
                onChange={(e) => setFormData({ ...formData, customCron: e.target.value })}
                placeholder="0 9 * * *"
                helperText="Format: minute hour day month weekday"
                fullWidth
              />
            )}

            <Divider />

            {/* Delivery Methods */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Delivery Methods
              </Typography>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.deliveryMethods?.includes('email')}
                      onChange={() => handleDeliveryMethodToggle('email')}
                    />
                  }
                  label="Email"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.deliveryMethods?.includes('notification')}
                      onChange={() => handleDeliveryMethodToggle('notification')}
                    />
                  }
                  label="In-App Notification"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.deliveryMethods?.includes('download')}
                      onChange={() => handleDeliveryMethodToggle('download')}
                    />
                  }
                  label="Auto Download"
                />
              </FormGroup>
            </Box>

            {/* Format */}
            <FormControl fullWidth>
              <InputLabel>Format</InputLabel>
              <Select
                value={formData.format}
                onChange={(e) => setFormData({ ...formData, format: e.target.value as any })}
                label="Format"
              >
                <MenuItem value="pdf">PDF</MenuItem>
                <MenuItem value="excel">Excel</MenuItem>
                <MenuItem value="csv">CSV</MenuItem>
              </Select>
            </FormControl>

            {/* Recipients (for email) */}
            {formData.deliveryMethods?.includes('email') && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Email Recipients
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                  <TextField
                    value={recipientInput}
                    onChange={(e) => setRecipientInput(e.target.value)}
                    placeholder="email@example.com"
                    size="small"
                    fullWidth
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddRecipient();
                      }
                    }}
                  />
                  <Button variant="outlined" onClick={handleAddRecipient}>
                    Add
                  </Button>
                </Stack>
                <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ gap: 0.5 }}>
                  {formData.recipients?.map((email) => (
                    <Chip
                      key={email}
                      label={email}
                      onDelete={() => handleRemoveRecipient(email)}
                      size="small"
                    />
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveSchedule}
            disabled={!formData.reportId}
          >
            {editingSchedule ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
