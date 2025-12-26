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
  FormControlLabel,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
  Avatar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  CameraAlt as CameraIcon,
  VpnKey as PasswordIcon,
  Security as SecurityIcon,
  Notifications as NotificationIcon,
  History as HistoryIcon,
  Devices as DevicesIcon,
  CheckCircle as VerifiedIcon,
  Warning as WarningIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Business as CompanyIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';

export type UserRole = 'admin' | 'manager' | 'operator' | 'viewer';

export interface UserProfileData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: UserRole;
  department?: string;
  location?: string;
  bio?: string;
  avatar?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

export interface ActivityLog {
  id: string;
  action: string;
  description: string;
  timestamp: Date;
  ipAddress?: string;
  device?: string;
}

export interface ActiveSession {
  id: string;
  device: string;
  location: string;
  ipAddress: string;
  loginTime: Date;
  lastActivity: Date;
  isCurrent: boolean;
}

export interface UserProfileProps {
  user?: UserProfileData;
  activityLog?: ActivityLog[];
  activeSessions?: ActiveSession[];
  onUpdateProfile?: (updates: Partial<UserProfileData>) => void;
  onChangePassword?: (currentPassword: string, newPassword: string) => void;
  onUploadAvatar?: (file: File) => void;
  onEnable2FA?: () => void;
  onDisable2FA?: () => void;
  onTerminateSession?: (sessionId: string) => void;
}

/**
 * User profile view and editor
 */
export function UserProfile({
  user: initialUser,
  activityLog: initialActivityLog = [],
  activeSessions: initialActiveSessions = [],
  onUpdateProfile,
  onChangePassword,
  onUploadAvatar,
  onEnable2FA,
  onDisable2FA,
  onTerminateSession,
}: UserProfileProps) {
  const [user, setUser] = useState<UserProfileData>(
    initialUser || getSampleUser()
  );
  const [activityLog] = useState<ActivityLog[]>(
    initialActivityLog.length > 0 ? initialActivityLog : getSampleActivityLog()
  );
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>(
    initialActiveSessions.length > 0 ? initialActiveSessions : getSampleSessions()
  );
  const [activeTab, setActiveTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Form states
  const [formFirstName, setFormFirstName] = useState(user.firstName);
  const [formLastName, setFormLastName] = useState(user.lastName);
  const [formEmail, setFormEmail] = useState(user.email);
  const [formPhone, setFormPhone] = useState(user.phone || '');
  const [formDepartment, setFormDepartment] = useState(user.department || '');
  const [formLocation, setFormLocation] = useState(user.location || '');
  const [formBio, setFormBio] = useState(user.bio || '');

  // Password form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSaveProfile = () => {
    const updates: Partial<UserProfileData> = {
      firstName: formFirstName,
      lastName: formLastName,
      email: formEmail,
      phone: formPhone || undefined,
      department: formDepartment || undefined,
      location: formLocation || undefined,
      bio: formBio || undefined,
    };

    setUser({ ...user, ...updates });
    onUpdateProfile?.(updates);
    setIsEditing(false);
    showSuccessNotification('Profile updated successfully');
  };

  const handleCancelEdit = () => {
    setFormFirstName(user.firstName);
    setFormLastName(user.lastName);
    setFormEmail(user.email);
    setFormPhone(user.phone || '');
    setFormDepartment(user.department || '');
    setFormLocation(user.location || '');
    setFormBio(user.bio || '');
    setIsEditing(false);
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      return;
    }
    onChangePassword?.(currentPassword, newPassword);
    setPasswordDialogOpen(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    showSuccessNotification('Password changed successfully');
  };

  const handleToggle2FA = () => {
    if (user.twoFactorEnabled) {
      setUser({ ...user, twoFactorEnabled: false });
      onDisable2FA?.();
      showSuccessNotification('Two-factor authentication disabled');
    } else {
      setUser({ ...user, twoFactorEnabled: true });
      onEnable2FA?.();
      showSuccessNotification('Two-factor authentication enabled');
    }
  };

  const handleTerminateSession = (sessionId: string) => {
    setActiveSessions(activeSessions.filter((s) => s.id !== sessionId));
    onTerminateSession?.(sessionId);
    showSuccessNotification('Session terminated');
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUploadAvatar?.(file);
      // In real app, would upload and get URL back
      const url = URL.createObjectURL(file);
      setUser({ ...user, avatar: url });
      showSuccessNotification('Avatar updated successfully');
    }
  };

  const showSuccessNotification = (message: string) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleString();
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'manager':
        return 'warning';
      case 'operator':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        My Profile
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        View and manage your account settings
      </Typography>

      {showSuccess && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setShowSuccess(false)}>
          {successMessage}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Profile Summary Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Stack spacing={3} alignItems="center">
                <Box sx={{ position: 'relative' }}>
                  <Avatar
                    src={user.avatar}
                    sx={{ width: 120, height: 120, fontSize: 48 }}
                  >
                    {user.firstName[0]}
                    {user.lastName[0]}
                  </Avatar>
                  <IconButton
                    component="label"
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      bgcolor: 'background.paper',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                    size="small"
                  >
                    <CameraIcon fontSize="small" />
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleAvatarUpload}
                    />
                  </IconButton>
                </Box>

                <Box textAlign="center">
                  <Typography variant="h6">
                    {user.firstName} {user.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {user.email}
                  </Typography>
                  <Chip
                    label={user.role}
                    color={getRoleBadgeColor(user.role) as any}
                    size="small"
                  />
                </Box>

                <Divider sx={{ width: '100%' }} />

                <Stack spacing={1} sx={{ width: '100%' }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <EmailIcon fontSize="small" color="action" />
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      Email
                    </Typography>
                    {user.emailVerified ? (
                      <VerifiedIcon fontSize="small" color="success" />
                    ) : (
                      <WarningIcon fontSize="small" color="warning" />
                    )}
                  </Stack>

                  {user.phone && (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <PhoneIcon fontSize="small" color="action" />
                      <Typography variant="body2" sx={{ flex: 1 }}>
                        {user.phone}
                      </Typography>
                      {user.phoneVerified ? (
                        <VerifiedIcon fontSize="small" color="success" />
                      ) : (
                        <WarningIcon fontSize="small" color="warning" />
                      )}
                    </Stack>
                  )}

                  {user.department && (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CompanyIcon fontSize="small" color="action" />
                      <Typography variant="body2">{user.department}</Typography>
                    </Stack>
                  )}

                  {user.location && (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <LocationIcon fontSize="small" color="action" />
                      <Typography variant="body2">{user.location}</Typography>
                    </Stack>
                  )}
                </Stack>

                <Divider sx={{ width: '100%' }} />

                <Stack spacing={1} sx={{ width: '100%' }}>
                  <Typography variant="caption" color="text.secondary">
                    Member since {user.createdAt.toLocaleDateString()}
                  </Typography>
                  {user.lastLogin && (
                    <Typography variant="caption" color="text.secondary">
                      Last login {formatDateTime(user.lastLogin)}
                    </Typography>
                  )}
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Details */}
        <Grid item xs={12} md={8}>
          <Card>
            <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
              <Tab icon={<PersonIcon />} label="Profile" />
              <Tab icon={<SecurityIcon />} label="Security" />
              <Tab icon={<HistoryIcon />} label="Activity" />
              <Tab icon={<DevicesIcon />} label="Sessions" />
            </Tabs>
            <Divider />

            {/* Profile Tab */}
            {activeTab === 0 && (
              <CardContent>
                <Stack spacing={3}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">Personal Information</Typography>
                    {!isEditing ? (
                      <Button startIcon={<EditIcon />} onClick={() => setIsEditing(true)}>
                        Edit
                      </Button>
                    ) : (
                      <Stack direction="row" spacing={1}>
                        <Button
                          startIcon={<CancelIcon />}
                          onClick={handleCancelEdit}
                          color="inherit"
                        >
                          Cancel
                        </Button>
                        <Button
                          startIcon={<SaveIcon />}
                          variant="contained"
                          onClick={handleSaveProfile}
                        >
                          Save
                        </Button>
                      </Stack>
                    )}
                  </Stack>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="First Name"
                        value={formFirstName}
                        onChange={(e) => setFormFirstName(e.target.value)}
                        fullWidth
                        disabled={!isEditing}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Last Name"
                        value={formLastName}
                        onChange={(e) => setFormLastName(e.target.value)}
                        fullWidth
                        disabled={!isEditing}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Email"
                        type="email"
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        fullWidth
                        disabled={!isEditing}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Phone"
                        type="tel"
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        fullWidth
                        disabled={!isEditing}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Department"
                        value={formDepartment}
                        onChange={(e) => setFormDepartment(e.target.value)}
                        fullWidth
                        disabled={!isEditing}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Location"
                        value={formLocation}
                        onChange={(e) => setFormLocation(e.target.value)}
                        fullWidth
                        disabled={!isEditing}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Bio"
                        value={formBio}
                        onChange={(e) => setFormBio(e.target.value)}
                        fullWidth
                        multiline
                        rows={3}
                        disabled={!isEditing}
                        placeholder="Tell us about yourself..."
                      />
                    </Grid>
                  </Grid>
                </Stack>
              </CardContent>
            )}

            {/* Security Tab */}
            {activeTab === 1 && (
              <CardContent>
                <Stack spacing={3}>
                  <Typography variant="h6">Security Settings</Typography>

                  <Card variant="outlined">
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            Password
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Change your password regularly to keep your account secure
                          </Typography>
                        </Box>
                        <Button
                          variant="outlined"
                          startIcon={<PasswordIcon />}
                          onClick={() => setPasswordDialogOpen(true)}
                        >
                          Change
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>

                  <Card variant="outlined">
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            Two-Factor Authentication
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Add an extra layer of security to your account
                          </Typography>
                        </Box>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={user.twoFactorEnabled}
                              onChange={handleToggle2FA}
                            />
                          }
                          label={user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                        />
                      </Stack>
                    </CardContent>
                  </Card>

                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom>
                        Account Verification
                      </Typography>
                      <Stack spacing={1} sx={{ mt: 2 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2">Email Verification</Typography>
                          {user.emailVerified ? (
                            <Chip label="Verified" color="success" size="small" icon={<VerifiedIcon />} />
                          ) : (
                            <Button size="small" variant="outlined">
                              Verify
                            </Button>
                          )}
                        </Stack>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2">Phone Verification</Typography>
                          {user.phoneVerified ? (
                            <Chip label="Verified" color="success" size="small" icon={<VerifiedIcon />} />
                          ) : (
                            <Button size="small" variant="outlined">
                              Verify
                            </Button>
                          )}
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Stack>
              </CardContent>
            )}

            {/* Activity Tab */}
            {activeTab === 2 && (
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Activity
                </Typography>
                <List>
                  {activityLog.map((activity) => (
                    <React.Fragment key={activity.id}>
                      <ListItem>
                        <ListItemText
                          primary={activity.action}
                          secondary={
                            <Stack spacing={0.5}>
                              <Typography variant="body2" color="text.secondary">
                                {activity.description}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatDateTime(activity.timestamp)}
                                {activity.ipAddress && ` • ${activity.ipAddress}`}
                                {activity.device && ` • ${activity.device}`}
                              </Typography>
                            </Stack>
                          }
                        />
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            )}

            {/* Sessions Tab */}
            {activeTab === 3 && (
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Active Sessions
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Manage your active sessions across different devices
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Device</TableCell>
                        <TableCell>Location</TableCell>
                        <TableCell>Login Time</TableCell>
                        <TableCell>Last Activity</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {activeSessions.map((session) => (
                        <TableRow key={session.id}>
                          <TableCell>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <DevicesIcon fontSize="small" />
                              <Box>
                                <Typography variant="body2">{session.device}</Typography>
                                {session.isCurrent && (
                                  <Chip label="Current" color="primary" size="small" />
                                )}
                              </Box>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{session.location}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {session.ipAddress}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDateTime(session.loginTime)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDateTime(session.lastActivity)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            {!session.isCurrent && (
                              <Button
                                size="small"
                                color="error"
                                startIcon={<LogoutIcon />}
                                onClick={() => handleTerminateSession(session.id)}
                              >
                                Terminate
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            )}
          </Card>
        </Grid>
      </Grid>

      {/* Change Password Dialog */}
      <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth
              required
              error={confirmPassword !== '' && newPassword !== confirmPassword}
              helperText={
                confirmPassword !== '' && newPassword !== confirmPassword
                  ? 'Passwords do not match'
                  : ''
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleChangePassword}
            disabled={
              !currentPassword ||
              !newPassword ||
              !confirmPassword ||
              newPassword !== confirmPassword
            }
          >
            Change Password
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

/**
 * Generate sample user data
 */
function getSampleUser(): UserProfileData {
  return {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    role: 'admin',
    department: 'IT & Operations',
    location: 'San Francisco, CA',
    bio: 'Experienced greenhouse management professional with a passion for sustainable agriculture.',
    emailVerified: true,
    phoneVerified: true,
    twoFactorEnabled: true,
    createdAt: new Date('2023-01-15'),
    lastLogin: new Date(Date.now() - 30 * 60 * 1000),
  };
}

/**
 * Generate sample activity log
 */
function getSampleActivityLog(): ActivityLog[] {
  return [
    {
      id: '1',
      action: 'Profile Updated',
      description: 'Changed profile information',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      ipAddress: '192.168.1.100',
      device: 'Chrome on Windows',
    },
    {
      id: '2',
      action: 'Password Changed',
      description: 'Successfully changed account password',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      ipAddress: '192.168.1.100',
      device: 'Chrome on Windows',
    },
    {
      id: '3',
      action: 'Login',
      description: 'Logged in from new device',
      timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
      ipAddress: '192.168.1.105',
      device: 'Safari on iPhone',
    },
    {
      id: '4',
      action: '2FA Enabled',
      description: 'Two-factor authentication was enabled',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      ipAddress: '192.168.1.100',
      device: 'Chrome on Windows',
    },
  ];
}

/**
 * Generate sample active sessions
 */
function getSampleSessions(): ActiveSession[] {
  return [
    {
      id: '1',
      device: 'Chrome on Windows 11',
      location: 'San Francisco, CA',
      ipAddress: '192.168.1.100',
      loginTime: new Date(Date.now() - 30 * 60 * 1000),
      lastActivity: new Date(Date.now() - 5 * 60 * 1000),
      isCurrent: true,
    },
    {
      id: '2',
      device: 'Safari on iPhone 14',
      location: 'San Francisco, CA',
      ipAddress: '192.168.1.105',
      loginTime: new Date(Date.now() - 48 * 60 * 60 * 1000),
      lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isCurrent: false,
    },
    {
      id: '3',
      device: 'Firefox on macOS',
      location: 'Oakland, CA',
      ipAddress: '192.168.1.110',
      loginTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      lastActivity: new Date(Date.now() - 24 * 60 * 60 * 1000),
      isCurrent: false,
    },
  ];
}
