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
  DialogContentText,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
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
  ExpandMore as ExpandIcon,
  Security as SecurityIcon,
  Lock as LockIcon,
  Devices as DevicesIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  CheckCircle as SuccessIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

export interface AccountSettingsProps {
  email?: string;
  emailVerified?: boolean;
  mfaEnabled?: boolean;
  activeSessions?: Array<{
    id: string;
    device: string;
    location: string;
    lastActive: Date;
    current?: boolean;
  }>;
  onChangePassword?: (oldPassword: string, newPassword: string) => Promise<void>;
  onEnableMFA?: () => void;
  onDisableMFA?: () => void;
  onRevokeSession?: (sessionId: string) => void;
  onDeleteAccount?: () => void;
  onExportData?: () => void;
}

/**
 * Account security and privacy settings
 */
export function AccountSettings({
  email,
  emailVerified = false,
  mfaEnabled = false,
  activeSessions = [],
  onChangePassword,
  onEnableMFA,
  onDisableMFA,
  onRevokeSession,
  onDeleteAccount,
  onExportData,
}: AccountSettingsProps) {
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwords, setPasswords] = useState({
    old: '',
    new: '',
    confirm: '',
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);

  const handlePasswordChange = async () => {
    setPasswordError(null);

    // Validate
    if (!passwords.old || !passwords.new || !passwords.confirm) {
      setPasswordError('All fields are required');
      return;
    }

    if (passwords.new.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }

    if (passwords.new !== passwords.confirm) {
      setPasswordError('New passwords do not match');
      return;
    }

    setChangingPassword(true);
    try {
      if (onChangePassword) {
        await onChangePassword(passwords.old, passwords.new);
      }
      setPasswordDialog(false);
      setPasswords({ old: '', new: '', confirm: '' });
    } catch (error: any) {
      setPasswordError(error.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = () => {
    if (onDeleteAccount) {
      onDeleteAccount();
    }
    setDeleteDialog(false);
  };

  return (
    <Stack spacing={2}>
      {/* Account Overview */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Account Overview
          </Typography>
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Email Address
                </Typography>
                <Typography variant="body1">{email}</Typography>
              </Box>
              {emailVerified ? (
                <Chip icon={<SuccessIcon />} label="Verified" color="success" size="small" />
              ) : (
                <Chip icon={<WarningIcon />} label="Not Verified" color="warning" size="small" />
              )}
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Security */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandIcon />}>
          <Stack direction="row" spacing={1} alignItems="center">
            <SecurityIcon />
            <Typography variant="h6">Security</Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            {/* Password */}
            <Paper sx={{ p: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Password
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Last changed 30 days ago
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  startIcon={<LockIcon />}
                  onClick={() => setPasswordDialog(true)}
                >
                  Change Password
                </Button>
              </Stack>
            </Paper>

            {/* Two-Factor Authentication */}
            <Paper sx={{ p: 2 }}>
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Two-Factor Authentication
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Add an extra layer of security to your account
                    </Typography>
                  </Box>
                  <Switch
                    checked={mfaEnabled}
                    onChange={(e) => {
                      if (e.target.checked) {
                        onEnableMFA?.();
                      } else {
                        onDisableMFA?.();
                      }
                    }}
                  />
                </Stack>
                {mfaEnabled && (
                  <Alert severity="success" icon={<SuccessIcon />}>
                    Two-factor authentication is enabled
                  </Alert>
                )}
              </Stack>
            </Paper>
          </Stack>
        </AccordionDetails>
      </Accordion>

      {/* Active Sessions */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandIcon />}>
          <Stack direction="row" spacing={1} alignItems="center">
            <DevicesIcon />
            <Typography variant="h6">Active Sessions</Typography>
            <Chip label={activeSessions.length} size="small" />
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={1}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Manage devices where you're currently logged in
            </Typography>
            <List>
              {activeSessions.map((session) => (
                <ListItem
                  key={session.id}
                  secondaryAction={
                    !session.current && (
                      <Button
                        size="small"
                        color="error"
                        onClick={() => onRevokeSession?.(session.id)}
                      >
                        Revoke
                      </Button>
                    )
                  }
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1,
                  }}
                >
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography>{session.device}</Typography>
                        {session.current && (
                          <Chip label="Current" size="small" color="primary" />
                        )}
                      </Stack>
                    }
                    secondary={
                      <>
                        {session.location} • Last active:{' '}
                        {new Date(session.lastActive).toLocaleString()}
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Stack>
        </AccordionDetails>
      </Accordion>

      {/* Privacy & Data */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandIcon />}>
          <Typography variant="h6">Privacy & Data</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <Paper sx={{ p: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Export Your Data
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Download a copy of all your data
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={onExportData}
                >
                  Export
                </Button>
              </Stack>
            </Paper>
          </Stack>
        </AccordionDetails>
      </Accordion>

      {/* Danger Zone */}
      <Card sx={{ border: 2, borderColor: 'error.main' }}>
        <CardContent>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} alignItems="center">
              <WarningIcon color="error" />
              <Typography variant="h6" color="error">
                Danger Zone
              </Typography>
            </Stack>
            <Divider />
            <Paper sx={{ p: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Delete Account
                  </Typography>
                  <Typography variant="body2">
                    Permanently delete your account and all data
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => setDeleteDialog(true)}
                >
                  Delete Account
                </Button>
              </Stack>
            </Paper>
          </Stack>
        </CardContent>
      </Card>

      {/* Change Password Dialog */}
      <Dialog open={passwordDialog} onClose={() => setPasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {passwordError && <Alert severity="error">{passwordError}</Alert>}

            <TextField
              label="Current Password"
              type={showPasswords ? 'text' : 'password'}
              value={passwords.old}
              onChange={(e) => setPasswords({ ...passwords, old: e.target.value })}
              fullWidth
              autoComplete="current-password"
            />
            <TextField
              label="New Password"
              type={showPasswords ? 'text' : 'password'}
              value={passwords.new}
              onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
              fullWidth
              autoComplete="new-password"
              helperText="Must be at least 8 characters"
            />
            <TextField
              label="Confirm New Password"
              type={showPasswords ? 'text' : 'password'}
              value={passwords.confirm}
              onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              fullWidth
              autoComplete="new-password"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={showPasswords}
                  onChange={(e) => setShowPasswords(e.target.checked)}
                />
              }
              label="Show passwords"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialog(false)} disabled={changingPassword}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handlePasswordChange}
            disabled={changingPassword}
          >
            {changingPassword ? 'Changing...' : 'Change Password'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <WarningIcon color="error" />
            <Typography variant="h6">Delete Account</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete your account? This action cannot be undone.
            All your data will be permanently deleted.
          </DialogContentText>
          <Alert severity="error" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>This action is irreversible!</strong>
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteAccount}
            startIcon={<DeleteIcon />}
          >
            Delete My Account
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
