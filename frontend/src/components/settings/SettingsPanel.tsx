import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Typography,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Palette as ThemeIcon,
  Person as ProfileIcon,
  Notifications as NotificationIcon,
  Security as SecurityIcon,
  Language as LanguageIcon,
  Storage as DataIcon,
  Devices as DeviceIcon,
  Build as SystemIcon,
  Save as SaveIcon,
  RestartAlt as ResetIcon,
  CheckCircle as SuccessIcon,
} from '@mui/icons-material';

export interface SettingsSection {
  id: string;
  label: string;
  icon: React.ReactNode;
  description?: string;
  component?: React.ReactNode;
}

export interface SettingsPanelProps {
  sections?: SettingsSection[];
  defaultSection?: string;
  onSave?: (sectionId: string, settings: any) => void;
  onReset?: (sectionId: string) => void;
}

const defaultSections: SettingsSection[] = [
  {
    id: 'theme',
    label: 'Appearance',
    icon: <ThemeIcon />,
    description: 'Customize theme, colors, and visual appearance',
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: <ProfileIcon />,
    description: 'Manage your personal information and preferences',
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: <NotificationIcon />,
    description: 'Configure notification preferences and alerts',
  },
  {
    id: 'security',
    label: 'Security & Privacy',
    icon: <SecurityIcon />,
    description: 'Manage security settings and privacy options',
  },
  {
    id: 'language',
    label: 'Language & Region',
    icon: <LanguageIcon />,
    description: 'Set language, timezone, and regional preferences',
  },
  {
    id: 'data',
    label: 'Data & Storage',
    icon: <DataIcon />,
    description: 'Manage data storage, backup, and retention settings',
  },
  {
    id: 'devices',
    label: 'Devices & Integrations',
    icon: <DeviceIcon />,
    description: 'Configure connected devices and third-party integrations',
  },
  {
    id: 'system',
    label: 'System',
    icon: <SystemIcon />,
    description: 'Advanced system configuration and maintenance',
  },
];

/**
 * Comprehensive settings panel with categorized sections
 */
export function SettingsPanel({
  sections = defaultSections,
  defaultSection = 'theme',
  onSave,
  onReset,
}: SettingsPanelProps) {
  const [activeSection, setActiveSection] = useState(defaultSection);
  const [savedSnackbar, setSavedSnackbar] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const currentSection = sections.find((s) => s.id === activeSection);

  const handleSave = () => {
    if (onSave) {
      onSave(activeSection, {});
    }
    setSavedSnackbar(true);
    setHasChanges(false);
  };

  const handleReset = () => {
    if (onReset) {
      onReset(activeSection);
    }
    setHasChanges(false);
  };

  return (
    <Box sx={{ display: 'flex', gap: 3, height: '100%' }}>
      {/* Sidebar Navigation */}
      <Paper sx={{ width: 280, flexShrink: 0, height: 'fit-content' }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6">Settings</Typography>
        </Box>
        <List sx={{ py: 0 }}>
          {sections.map((section) => (
            <ListItem key={section.id} disablePadding>
              <ListItemButton
                selected={activeSection === section.id}
                onClick={() => setActiveSection(section.id)}
              >
                <ListItemIcon>{section.icon}</ListItemIcon>
                <ListItemText primary={section.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Main Content Area */}
      <Box sx={{ flexGrow: 1 }}>
        <Stack spacing={3}>
          {/* Section Header */}
          <Box>
            <Typography variant="h4" gutterBottom>
              {currentSection?.label}
            </Typography>
            {currentSection?.description && (
              <Typography variant="body1" color="text.secondary">
                {currentSection.description}
              </Typography>
            )}
          </Box>

          <Divider />

          {/* Section Content */}
          {currentSection?.component ? (
            currentSection.component
          ) : (
            <PlaceholderContent sectionId={activeSection} onChange={() => setHasChanges(true)} />
          )}

          {/* Action Buttons */}
          <Paper sx={{ p: 2, position: 'sticky', bottom: 0, bgcolor: 'background.paper' }}>
            <Stack direction="row" spacing={2} justifyContent="space-between">
              <Button
                variant="outlined"
                startIcon={<ResetIcon />}
                onClick={handleReset}
                disabled={!hasChanges}
              >
                Reset to Defaults
              </Button>
              <Stack direction="row" spacing={1}>
                {hasChanges && (
                  <Alert severity="info" sx={{ py: 0.5 }}>
                    You have unsaved changes
                  </Alert>
                )}
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  disabled={!hasChanges}
                >
                  Save Changes
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Stack>
      </Box>

      {/* Success Snackbar */}
      <Snackbar
        open={savedSnackbar}
        autoHideDuration={3000}
        onClose={() => setSavedSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSavedSnackbar(false)}
          severity="success"
          icon={<SuccessIcon />}
          sx={{ width: '100%' }}
        >
          Settings saved successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
}

/**
 * Placeholder content for sections without custom components
 */
function PlaceholderContent({
  sectionId,
  onChange,
}: {
  sectionId: string;
  onChange: () => void;
}) {
  const getPlaceholderCards = () => {
    switch (sectionId) {
      case 'theme':
        return [
          {
            title: 'Color Theme',
            description: 'Choose between light, dark, or auto theme based on system preferences',
          },
          {
            title: 'Primary Color',
            description: 'Select the primary color for buttons, links, and accents',
          },
          {
            title: 'Font Size',
            description: 'Adjust the base font size for better readability',
          },
        ];
      case 'profile':
        return [
          {
            title: 'Personal Information',
            description: 'Update your name, email, and contact information',
          },
          {
            title: 'Avatar',
            description: 'Upload or change your profile picture',
          },
          {
            title: 'Bio',
            description: 'Add a short description about yourself',
          },
        ];
      case 'notifications':
        return [
          {
            title: 'Email Notifications',
            description: 'Configure which notifications you want to receive via email',
          },
          {
            title: 'Push Notifications',
            description: 'Manage browser push notification preferences',
          },
          {
            title: 'Notification Frequency',
            description: 'Choose how often you want to receive notification summaries',
          },
        ];
      case 'security':
        return [
          {
            title: 'Password',
            description: 'Change your account password',
          },
          {
            title: 'Two-Factor Authentication',
            description: 'Enable additional security with 2FA',
          },
          {
            title: 'Active Sessions',
            description: 'View and manage your active login sessions',
          },
        ];
      case 'language':
        return [
          {
            title: 'Display Language',
            description: 'Choose your preferred interface language',
          },
          {
            title: 'Timezone',
            description: 'Set your local timezone for accurate timestamps',
          },
          {
            title: 'Date Format',
            description: 'Customize how dates are displayed',
          },
        ];
      case 'data':
        return [
          {
            title: 'Auto Backup',
            description: 'Enable automatic backup of your data',
          },
          {
            title: 'Data Retention',
            description: 'Configure how long data is stored',
          },
          {
            title: 'Export Data',
            description: 'Download all your data in various formats',
          },
        ];
      case 'devices':
        return [
          {
            title: 'Connected Sensors',
            description: 'Manage connected environmental sensors',
          },
          {
            title: 'Integrations',
            description: 'Configure third-party service integrations',
          },
          {
            title: 'API Keys',
            description: 'Generate and manage API keys for external access',
          },
        ];
      case 'system':
        return [
          {
            title: 'Performance',
            description: 'Adjust performance and resource usage settings',
          },
          {
            title: 'Maintenance',
            description: 'System maintenance and diagnostic tools',
          },
          {
            title: 'Advanced',
            description: 'Advanced configuration options for power users',
          },
        ];
      default:
        return [
          {
            title: 'Configuration',
            description: 'Configure settings for this section',
          },
        ];
    }
  };

  return (
    <Stack spacing={2}>
      {getPlaceholderCards().map((card, index) => (
        <Card key={index}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {card.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {card.description}
            </Typography>
          </CardContent>
        </Card>
      ))}
      <Alert severity="info">
        This section contains placeholder content. Integrate with ThemeCustomizer, PreferencesManager,
        or SystemConfig components for full functionality.
      </Alert>
    </Stack>
  );
}
