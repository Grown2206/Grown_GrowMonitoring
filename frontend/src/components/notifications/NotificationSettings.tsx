import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Alert,
} from '@mui/material';
import {
  ExpandMore as ExpandIcon,
  Notifications as NotificationIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
  PhoneAndroid as PushIcon,
  VolumeUp as SoundIcon,
  Save as SaveIcon,
} from '@mui/icons-material';

export type NotificationChannel = 'push' | 'email' | 'sms' | 'inApp';
export type NotificationFrequency = 'realtime' | 'hourly' | 'daily' | 'weekly';

export interface NotificationPreference {
  category: string;
  channels: NotificationChannel[];
  frequency: NotificationFrequency;
  enabled: boolean;
  priority: 'all' | 'high' | 'urgent';
}

export interface NotificationSettingsProps {
  preferences?: NotificationPreference[];
  onSave?: (preferences: NotificationPreference[]) => void;
  emailAddress?: string;
  phoneNumber?: string;
}

/**
 * Notification preferences and settings management
 */
export function NotificationSettings({
  preferences: initialPreferences = [],
  onSave,
  emailAddress: initialEmail = '',
  phoneNumber: initialPhone = '',
}: NotificationSettingsProps) {
  const [preferences, setPreferences] = useState<NotificationPreference[]>(
    initialPreferences.length > 0 ? initialPreferences : getDefaultPreferences()
  );
  const [emailAddress, setEmailAddress] = useState(initialEmail);
  const [phoneNumber, setPhoneNumber] = useState(initialPhone);
  const [enableSound, setEnableSound] = useState(true);
  const [enableDesktop, setEnableDesktop] = useState(true);
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietHoursStart, setQuietHoursStart] = useState('22:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState('08:00');
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  const handlePreferenceChange = (
    category: string,
    field: keyof NotificationPreference,
    value: any
  ) => {
    setPreferences(
      preferences.map((pref) =>
        pref.category === category ? { ...pref, [field]: value } : pref
      )
    );
  };

  const handleChannelToggle = (category: string, channel: NotificationChannel) => {
    setPreferences(
      preferences.map((pref) => {
        if (pref.category !== category) return pref;

        const channels = pref.channels.includes(channel)
          ? pref.channels.filter((c) => c !== channel)
          : [...pref.channels, channel];

        return { ...pref, channels };
      })
    );
  };

  const handleSave = () => {
    onSave?.(preferences);
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  const getChannelIcon = (channel: NotificationChannel) => {
    switch (channel) {
      case 'push':
        return <PushIcon />;
      case 'email':
        return <EmailIcon />;
      case 'sms':
        return <SmsIcon />;
      default:
        return <NotificationIcon />;
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Notification Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Configure how and when you receive notifications
      </Typography>

      {showSaveSuccess && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setShowSaveSuccess(false)}>
          Settings saved successfully!
        </Alert>
      )}

      <Stack spacing={3}>
        {/* General Settings */}
        <Card>
          <CardHeader title="General Settings" />
          <Divider />
          <CardContent>
            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch checked={enableDesktop} onChange={(e) => setEnableDesktop(e.target.checked)} />
                }
                label="Enable desktop notifications"
              />
              <FormControlLabel
                control={
                  <Switch checked={enableSound} onChange={(e) => setEnableSound(e.target.checked)} />
                }
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <SoundIcon fontSize="small" />
                    <Typography>Enable notification sounds</Typography>
                  </Stack>
                }
              />
            </Stack>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader title="Contact Information" />
          <Divider />
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Email Address"
                  type="email"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  fullWidth
                  InputProps={{
                    startAdornment: <EmailIcon sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Phone Number"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  fullWidth
                  InputProps={{
                    startAdornment: <SmsIcon sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Quiet Hours */}
        <Card>
          <CardHeader
            title="Quiet Hours"
            subheader="Pause non-urgent notifications during specific hours"
          />
          <Divider />
          <CardContent>
            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={quietHoursEnabled}
                    onChange={(e) => setQuietHoursEnabled(e.target.checked)}
                  />
                }
                label="Enable quiet hours"
              />
              {quietHoursEnabled && (
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label="Start Time"
                      type="time"
                      value={quietHoursStart}
                      onChange={(e) => setQuietHoursStart(e.target.value)}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="End Time"
                      type="time"
                      value={quietHoursEnd}
                      onChange={(e) => setQuietHoursEnd(e.target.value)}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* Notification Preferences by Category */}
        <Card>
          <CardHeader title="Notification Preferences" subheader="Configure notifications by category" />
          <Divider />
          <CardContent>
            <Stack spacing={2}>
              {preferences.map((pref) => (
                <Accordion key={pref.category}>
                  <AccordionSummary expandIcon={<ExpandIcon />}>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%', pr: 2 }}>
                      <Typography variant="subtitle1">{pref.category}</Typography>
                      <Stack direction="row" spacing={0.5} sx={{ ml: 'auto' }}>
                        {pref.enabled ? (
                          <Chip label="Enabled" color="success" size="small" />
                        ) : (
                          <Chip label="Disabled" size="small" />
                        )}
                        <Chip label={pref.channels.length + ' channels'} size="small" variant="outlined" />
                      </Stack>
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack spacing={2}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={pref.enabled}
                            onChange={(e) =>
                              handlePreferenceChange(pref.category, 'enabled', e.target.checked)
                            }
                          />
                        }
                        label={`Enable ${pref.category} notifications`}
                      />

                      {pref.enabled && (
                        <>
                          <Divider />

                          <Box>
                            <Typography variant="subtitle2" gutterBottom>
                              Notification Channels
                            </Typography>
                            <FormGroup>
                              <Grid container spacing={1}>
                                {(['push', 'email', 'sms', 'inApp'] as NotificationChannel[]).map(
                                  (channel) => (
                                    <Grid item xs={6} sm={3} key={channel}>
                                      <FormControlLabel
                                        control={
                                          <Checkbox
                                            checked={pref.channels.includes(channel)}
                                            onChange={() => handleChannelToggle(pref.category, channel)}
                                          />
                                        }
                                        label={
                                          <Stack direction="row" spacing={1} alignItems="center">
                                            {getChannelIcon(channel)}
                                            <Typography variant="body2">
                                              {channel.charAt(0).toUpperCase() + channel.slice(1)}
                                            </Typography>
                                          </Stack>
                                        }
                                      />
                                    </Grid>
                                  )
                                )}
                              </Grid>
                            </FormGroup>
                          </Box>

                          <Divider />

                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <FormControl fullWidth size="small">
                                <InputLabel>Frequency</InputLabel>
                                <Select
                                  value={pref.frequency}
                                  onChange={(e) =>
                                    handlePreferenceChange(
                                      pref.category,
                                      'frequency',
                                      e.target.value as NotificationFrequency
                                    )
                                  }
                                >
                                  <MenuItem value="realtime">Real-time</MenuItem>
                                  <MenuItem value="hourly">Hourly Digest</MenuItem>
                                  <MenuItem value="daily">Daily Digest</MenuItem>
                                  <MenuItem value="weekly">Weekly Digest</MenuItem>
                                </Select>
                              </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <FormControl fullWidth size="small">
                                <InputLabel>Priority Filter</InputLabel>
                                <Select
                                  value={pref.priority}
                                  onChange={(e) =>
                                    handlePreferenceChange(pref.category, 'priority', e.target.value)
                                  }
                                >
                                  <MenuItem value="all">All Priorities</MenuItem>
                                  <MenuItem value="high">High & Above</MenuItem>
                                  <MenuItem value="urgent">Urgent Only</MenuItem>
                                </Select>
                              </FormControl>
                            </Grid>
                          </Grid>
                        </>
                      )}
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Stack>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button variant="contained" size="large" startIcon={<SaveIcon />} onClick={handleSave}>
          Save Settings
        </Button>
      </Stack>
    </Box>
  );
}

/**
 * Get default notification preferences
 */
function getDefaultPreferences(): NotificationPreference[] {
  return [
    {
      category: 'Alerts',
      channels: ['push', 'email', 'inApp'],
      frequency: 'realtime',
      enabled: true,
      priority: 'high',
    },
    {
      category: 'Sensors',
      channels: ['push', 'inApp'],
      frequency: 'realtime',
      enabled: true,
      priority: 'all',
    },
    {
      category: 'Plants',
      channels: ['inApp'],
      frequency: 'daily',
      enabled: true,
      priority: 'all',
    },
    {
      category: 'Automation',
      channels: ['inApp'],
      frequency: 'realtime',
      enabled: true,
      priority: 'high',
    },
    {
      category: 'Reports',
      channels: ['email', 'inApp'],
      frequency: 'weekly',
      enabled: true,
      priority: 'all',
    },
    {
      category: 'System',
      channels: ['push', 'email', 'inApp'],
      frequency: 'realtime',
      enabled: true,
      priority: 'urgent',
    },
  ];
}
