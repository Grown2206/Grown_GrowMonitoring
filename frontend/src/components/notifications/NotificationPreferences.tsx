import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
  Chip,
  Alert,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Notifications as NotificationIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
  Telegram as TelegramIcon,
  ChatBubble as DiscordIcon,
  PhoneIphone as PushIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Save as SaveIcon,
} from '@mui/icons-material';

export interface NotificationChannel {
  type: 'email' | 'sms' | 'telegram' | 'discord' | 'push' | 'in-app';
  enabled: boolean;
  config?: {
    email?: string;
    phone?: string;
    telegramChatId?: string;
    discordWebhook?: string;
  };
}

export interface NotificationPreference {
  category: string;
  channels: NotificationChannel[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  quietHours?: {
    enabled: boolean;
    start: string; // HH:mm
    end: string; // HH:mm
  };
  frequency?: 'immediate' | 'hourly' | 'daily' | 'weekly';
}

export interface NotificationPreferencesProps {
  preferences?: NotificationPreference[];
  onSave?: (preferences: NotificationPreference[]) => void;
}

const notificationCategories = [
  { id: 'sensor_alerts', label: 'Sensor Alerts', description: 'Temperature, humidity, and other sensor warnings' },
  { id: 'plant_events', label: 'Plant Events', description: 'Watering, feeding, and growth milestones' },
  { id: 'system_status', label: 'System Status', description: 'Device connectivity and system health' },
  { id: 'harvest_reminders', label: 'Harvest Reminders', description: 'Notifications about upcoming harvests' },
  { id: 'automation_triggers', label: 'Automation Triggers', description: 'When automation rules are triggered' },
  { id: 'reports', label: 'Reports', description: 'Daily, weekly, and monthly reports' },
];

/**
 * Comprehensive notification preferences management
 */
export function NotificationPreferences({ preferences: initialPreferences = [], onSave }: NotificationPreferencesProps) {
  const [preferences, setPreferences] = useState<NotificationPreference[]>(
    initialPreferences.length > 0
      ? initialPreferences
      : notificationCategories.map((cat) => ({
          category: cat.id,
          channels: [
            { type: 'in-app', enabled: true },
            { type: 'email', enabled: false },
            { type: 'push', enabled: false },
            { type: 'sms', enabled: false },
            { type: 'telegram', enabled: false },
            { type: 'discord', enabled: false },
          ],
          priority: 'medium' as const,
          quietHours: { enabled: false, start: '22:00', end: '08:00' },
          frequency: 'immediate' as const,
        }))
  );

  const [globalQuietHours, setGlobalQuietHours] = useState({
    enabled: false,
    start: '22:00',
    end: '08:00',
  });

  const handleChannelToggle = (categoryIndex: number, channelType: NotificationChannel['type']) => {
    setPreferences((prev) => {
      const newPrefs = [...prev];
      const channel = newPrefs[categoryIndex].channels.find((ch) => ch.type === channelType);
      if (channel) {
        channel.enabled = !channel.enabled;
      }
      return newPrefs;
    });
  };

  const handlePriorityChange = (categoryIndex: number, priority: NotificationPreference['priority']) => {
    setPreferences((prev) => {
      const newPrefs = [...prev];
      newPrefs[categoryIndex].priority = priority;
      return newPrefs;
    });
  };

  const handleFrequencyChange = (categoryIndex: number, frequency: NotificationPreference['frequency']) => {
    setPreferences((prev) => {
      const newPrefs = [...prev];
      newPrefs[categoryIndex].frequency = frequency;
      return newPrefs;
    });
  };

  const handleQuietHoursToggle = (categoryIndex: number) => {
    setPreferences((prev) => {
      const newPrefs = [...prev];
      if (newPrefs[categoryIndex].quietHours) {
        newPrefs[categoryIndex].quietHours!.enabled = !newPrefs[categoryIndex].quietHours!.enabled;
      }
      return newPrefs;
    });
  };

  const handleSave = () => {
    if (onSave) {
      onSave(preferences);
    }
  };

  const getChannelIcon = (type: NotificationChannel['type']) => {
    switch (type) {
      case 'email':
        return <EmailIcon fontSize="small" />;
      case 'sms':
        return <SmsIcon fontSize="small" />;
      case 'telegram':
        return <TelegramIcon fontSize="small" />;
      case 'discord':
        return <DiscordIcon fontSize="small" />;
      case 'push':
        return <PushIcon fontSize="small" />;
      default:
        return <NotificationIcon fontSize="small" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      {/* Global Settings */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Global Settings
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={globalQuietHours.enabled}
                  onChange={(e) => setGlobalQuietHours({ ...globalQuietHours, enabled: e.target.checked })}
                />
              }
              label="Enable Global Quiet Hours"
            />
          </FormGroup>
          {globalQuietHours.enabled && (
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <TextField
                label="Start Time"
                type="time"
                value={globalQuietHours.start}
                onChange={(e) => setGlobalQuietHours({ ...globalQuietHours, start: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="End Time"
                type="time"
                value={globalQuietHours.end}
                onChange={(e) => setGlobalQuietHours({ ...globalQuietHours, end: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* Category Preferences */}
      <Stack spacing={2}>
        {notificationCategories.map((category, index) => {
          const pref = preferences[index];
          if (!pref) return null;

          return (
            <Card key={category.id}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Box>
                    <Typography variant="h6">{category.label}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {category.description}
                    </Typography>
                  </Box>
                  <Chip
                    label={pref.priority.toUpperCase()}
                    color={getPriorityColor(pref.priority) as any}
                    size="small"
                  />
                </Stack>

                <Divider sx={{ my: 2 }} />

                {/* Channels */}
                <FormControl component="fieldset" fullWidth sx={{ mb: 2 }}>
                  <FormLabel component="legend">Notification Channels</FormLabel>
                  <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
                    {pref.channels.map((channel) => (
                      <FormControlLabel
                        key={channel.type}
                        control={
                          <Switch
                            checked={channel.enabled}
                            onChange={() => handleChannelToggle(index, channel.type)}
                            size="small"
                          />
                        }
                        label={
                          <Stack direction="row" spacing={0.5} alignItems="center">
                            {getChannelIcon(channel.type)}
                            <Typography variant="caption">{channel.type}</Typography>
                          </Stack>
                        }
                      />
                    ))}
                  </Stack>
                </FormControl>

                <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                  {/* Priority */}
                  <FormControl size="small" fullWidth>
                    <FormLabel>Priority</FormLabel>
                    <Select
                      value={pref.priority}
                      onChange={(e) => handlePriorityChange(index, e.target.value as any)}
                    >
                      <MenuItem value="low">Low</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="high">High</MenuItem>
                      <MenuItem value="critical">Critical</MenuItem>
                    </Select>
                  </FormControl>

                  {/* Frequency */}
                  <FormControl size="small" fullWidth>
                    <FormLabel>Frequency</FormLabel>
                    <Select
                      value={pref.frequency}
                      onChange={(e) => handleFrequencyChange(index, e.target.value as any)}
                    >
                      <MenuItem value="immediate">Immediate</MenuItem>
                      <MenuItem value="hourly">Hourly Digest</MenuItem>
                      <MenuItem value="daily">Daily Digest</MenuItem>
                      <MenuItem value="weekly">Weekly Digest</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>

                {/* Quiet Hours */}
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={pref.quietHours?.enabled || false}
                        onChange={() => handleQuietHoursToggle(index)}
                        size="small"
                      />
                    }
                    label="Category-specific Quiet Hours"
                  />
                </FormGroup>
              </CardContent>
            </Card>
          );
        })}
      </Stack>

      {/* Save Button */}
      <Button
        variant="contained"
        startIcon={<SaveIcon />}
        onClick={handleSave}
        fullWidth
        sx={{ mt: 3 }}
        size="large"
      >
        Save Preferences
      </Button>

      <Alert severity="info" sx={{ mt: 2 }}>
        Changes will take effect immediately. You can update these preferences at any time.
      </Alert>
    </Box>
  );
}

/**
 * Quick notification settings toggle
 */
export function QuickNotificationSettings({
  enabled = true,
  onToggle,
}: {
  enabled?: boolean;
  onToggle?: (enabled: boolean) => void;
}) {
  return (
    <Paper sx={{ p: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack direction="row" spacing={2} alignItems="center">
          <NotificationIcon />
          <Box>
            <Typography variant="subtitle1">Notifications</Typography>
            <Typography variant="caption" color="text.secondary">
              {enabled ? 'Enabled' : 'Disabled'}
            </Typography>
          </Box>
        </Stack>
        <Switch checked={enabled} onChange={(e) => onToggle?.(e.target.checked)} />
      </Stack>
    </Paper>
  );
}
