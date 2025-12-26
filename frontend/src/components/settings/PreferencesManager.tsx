import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Slider,
  Stack,
  Switch,
  TextField,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  ExpandMore as ExpandIcon,
  Language as LanguageIcon,
  Schedule as TimezoneIcon,
  Today as DateIcon,
  NotificationsActive as NotificationIcon,
  Visibility as DisplayIcon,
  Autorenew as AutoIcon,
} from '@mui/icons-material';

export interface UserPreferences {
  // Localization
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  firstDayOfWeek: number;

  // Display
  itemsPerPage: number;
  defaultView: 'grid' | 'list' | 'table';
  showTutorials: boolean;
  showTooltips: boolean;
  compactMode: boolean;

  // Notifications
  emailDigest: 'instant' | 'daily' | 'weekly' | 'never';
  desktopNotifications: boolean;
  soundEnabled: boolean;
  notificationCategories: string[];

  // Auto-refresh
  autoRefresh: boolean;
  refreshInterval: number;

  // Data & Privacy
  analyticsEnabled: boolean;
  crashReportingEnabled: boolean;
  dataSharing: boolean;
}

export interface PreferencesManagerProps {
  preferences?: UserPreferences;
  onChange?: (preferences: UserPreferences) => void;
}

const languages = [
  { code: 'en', name: 'English' },
  { code: 'de', name: 'Deutsch' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'it', name: 'Italiano' },
  { code: 'pt', name: 'Português' },
  { code: 'zh', name: '中文' },
  { code: 'ja', name: '日本語' },
];

const timezones = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
];

const dateFormats = [
  { label: 'MM/DD/YYYY', value: 'MM/DD/YYYY' },
  { label: 'DD/MM/YYYY', value: 'DD/MM/YYYY' },
  { label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' },
  { label: 'DD.MM.YYYY', value: 'DD.MM.YYYY' },
];

const notificationCategories = [
  'Sensor Alerts',
  'Plant Events',
  'System Updates',
  'Task Reminders',
  'Reports',
  'Maintenance',
];

/**
 * Comprehensive user preferences management
 */
export function PreferencesManager({
  preferences: initialPreferences,
  onChange,
}: PreferencesManagerProps) {
  const [preferences, setPreferences] = useState<UserPreferences>(
    initialPreferences || {
      language: 'en',
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '24h',
      firstDayOfWeek: 0,
      itemsPerPage: 25,
      defaultView: 'grid',
      showTutorials: true,
      showTooltips: true,
      compactMode: false,
      emailDigest: 'daily',
      desktopNotifications: true,
      soundEnabled: true,
      notificationCategories: notificationCategories,
      autoRefresh: true,
      refreshInterval: 30,
      analyticsEnabled: true,
      crashReportingEnabled: true,
      dataSharing: false,
    }
  );

  const updatePreference = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    if (onChange) {
      onChange(newPreferences);
    }
  };

  const toggleNotificationCategory = (category: string) => {
    const current = preferences.notificationCategories;
    const updated = current.includes(category)
      ? current.filter((c) => c !== category)
      : [...current, category];
    updatePreference('notificationCategories', updated);
  };

  return (
    <Stack spacing={2}>
      {/* Localization */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandIcon />}>
          <Stack direction="row" spacing={1} alignItems="center">
            <LanguageIcon />
            <Typography variant="h6">Language & Region</Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={3}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Language</InputLabel>
                  <Select
                    value={preferences.language}
                    onChange={(e) => updatePreference('language', e.target.value)}
                    label="Language"
                  >
                    {languages.map((lang) => (
                      <MenuItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Timezone</InputLabel>
                  <Select
                    value={preferences.timezone}
                    onChange={(e) => updatePreference('timezone', e.target.value)}
                    label="Timezone"
                  >
                    {timezones.map((tz) => (
                      <MenuItem key={tz} value={tz}>
                        {tz}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Date Format</InputLabel>
                  <Select
                    value={preferences.dateFormat}
                    onChange={(e) => updatePreference('dateFormat', e.target.value)}
                    label="Date Format"
                  >
                    {dateFormats.map((format) => (
                      <MenuItem key={format.value} value={format.value}>
                        {format.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Time Format</InputLabel>
                  <Select
                    value={preferences.timeFormat}
                    onChange={(e) => updatePreference('timeFormat', e.target.value as any)}
                    label="Time Format"
                  >
                    <MenuItem value="12h">12-hour (2:30 PM)</MenuItem>
                    <MenuItem value="24h">24-hour (14:30)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <FormControl fullWidth>
              <InputLabel>First Day of Week</InputLabel>
              <Select
                value={preferences.firstDayOfWeek}
                onChange={(e) => updatePreference('firstDayOfWeek', e.target.value as number)}
                label="First Day of Week"
              >
                <MenuItem value={0}>Sunday</MenuItem>
                <MenuItem value={1}>Monday</MenuItem>
                <MenuItem value={6}>Saturday</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </AccordionDetails>
      </Accordion>

      {/* Display Preferences */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandIcon />}>
          <Stack direction="row" spacing={1} alignItems="center">
            <DisplayIcon />
            <Typography variant="h6">Display & Interface</Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={3}>
            <FormControl fullWidth>
              <InputLabel>Default View</InputLabel>
              <Select
                value={preferences.defaultView}
                onChange={(e) => updatePreference('defaultView', e.target.value as any)}
                label="Default View"
              >
                <MenuItem value="grid">Grid View</MenuItem>
                <MenuItem value="list">List View</MenuItem>
                <MenuItem value="table">Table View</MenuItem>
              </Select>
            </FormControl>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Items Per Page: {preferences.itemsPerPage}
              </Typography>
              <Slider
                value={preferences.itemsPerPage}
                onChange={(_, value) => updatePreference('itemsPerPage', value as number)}
                min={10}
                max={100}
                step={5}
                marks={[
                  { value: 10, label: '10' },
                  { value: 25, label: '25' },
                  { value: 50, label: '50' },
                  { value: 100, label: '100' },
                ]}
                valueLabelDisplay="auto"
              />
            </Box>

            <Divider />

            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.showTutorials}
                    onChange={(e) => updatePreference('showTutorials', e.target.checked)}
                  />
                }
                label={
                  <Stack>
                    <Typography variant="body2">Show Tutorials</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Display interactive tutorials for new features
                    </Typography>
                  </Stack>
                }
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.showTooltips}
                    onChange={(e) => updatePreference('showTooltips', e.target.checked)}
                  />
                }
                label={
                  <Stack>
                    <Typography variant="body2">Show Tooltips</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Display helpful tooltips on hover
                    </Typography>
                  </Stack>
                }
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.compactMode}
                    onChange={(e) => updatePreference('compactMode', e.target.checked)}
                  />
                }
                label={
                  <Stack>
                    <Typography variant="body2">Compact Mode</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Reduce spacing to fit more content on screen
                    </Typography>
                  </Stack>
                }
              />
            </FormGroup>
          </Stack>
        </AccordionDetails>
      </Accordion>

      {/* Notifications */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandIcon />}>
          <Stack direction="row" spacing={1} alignItems="center">
            <NotificationIcon />
            <Typography variant="h6">Notifications</Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={3}>
            <FormControl fullWidth>
              <InputLabel>Email Digest</InputLabel>
              <Select
                value={preferences.emailDigest}
                onChange={(e) => updatePreference('emailDigest', e.target.value as any)}
                label="Email Digest"
              >
                <MenuItem value="instant">Instant (Real-time)</MenuItem>
                <MenuItem value="daily">Daily Summary</MenuItem>
                <MenuItem value="weekly">Weekly Summary</MenuItem>
                <MenuItem value="never">Never</MenuItem>
              </Select>
            </FormControl>

            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.desktopNotifications}
                    onChange={(e) => updatePreference('desktopNotifications', e.target.checked)}
                  />
                }
                label="Desktop Notifications"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.soundEnabled}
                    onChange={(e) => updatePreference('soundEnabled', e.target.checked)}
                  />
                }
                label="Notification Sounds"
              />
            </FormGroup>

            <Divider />

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Notification Categories
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                Choose which types of notifications you want to receive
              </Typography>
              <FormGroup>
                {notificationCategories.map((category) => (
                  <FormControlLabel
                    key={category}
                    control={
                      <Checkbox
                        checked={preferences.notificationCategories.includes(category)}
                        onChange={() => toggleNotificationCategory(category)}
                      />
                    }
                    label={category}
                  />
                ))}
              </FormGroup>
            </Box>
          </Stack>
        </AccordionDetails>
      </Accordion>

      {/* Auto-Refresh */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandIcon />}>
          <Stack direction="row" spacing={1} alignItems="center">
            <AutoIcon />
            <Typography variant="h6">Auto-Refresh</Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={3}>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.autoRefresh}
                  onChange={(e) => updatePreference('autoRefresh', e.target.checked)}
                />
              }
              label={
                <Stack>
                  <Typography variant="body2">Enable Auto-Refresh</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Automatically refresh data at regular intervals
                  </Typography>
                </Stack>
              }
            />

            {preferences.autoRefresh && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Refresh Interval: {preferences.refreshInterval} seconds
                </Typography>
                <Slider
                  value={preferences.refreshInterval}
                  onChange={(_, value) => updatePreference('refreshInterval', value as number)}
                  min={10}
                  max={300}
                  step={10}
                  marks={[
                    { value: 10, label: '10s' },
                    { value: 30, label: '30s' },
                    { value: 60, label: '1m' },
                    { value: 300, label: '5m' },
                  ]}
                  valueLabelDisplay="auto"
                />
              </Box>
            )}
          </Stack>
        </AccordionDetails>
      </Accordion>

      {/* Data & Privacy */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandIcon />}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h6">Data & Privacy</Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.analyticsEnabled}
                    onChange={(e) => updatePreference('analyticsEnabled', e.target.checked)}
                  />
                }
                label={
                  <Stack>
                    <Typography variant="body2">Usage Analytics</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Help improve the app by sharing anonymous usage data
                    </Typography>
                  </Stack>
                }
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.crashReportingEnabled}
                    onChange={(e) => updatePreference('crashReportingEnabled', e.target.checked)}
                  />
                }
                label={
                  <Stack>
                    <Typography variant="body2">Crash Reporting</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Automatically report errors to help us fix bugs
                    </Typography>
                  </Stack>
                }
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.dataSharing}
                    onChange={(e) => updatePreference('dataSharing', e.target.checked)}
                  />
                }
                label={
                  <Stack>
                    <Typography variant="body2">Data Sharing</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Share anonymized data with research partners
                    </Typography>
                  </Stack>
                }
              />
            </FormGroup>
          </Stack>
        </AccordionDetails>
      </Accordion>
    </Stack>
  );
}
