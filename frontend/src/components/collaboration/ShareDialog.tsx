import React, { useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
  Autocomplete,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Close as CloseIcon,
  Link as LinkIcon,
  Email as EmailIcon,
  ContentCopy as CopyIcon,
  Check as CheckIcon,
  Public as PublicIcon,
  Lock as PrivateIcon,
  People as TeamIcon,
} from '@mui/icons-material';

export type AccessLevel = 'view' | 'comment' | 'edit' | 'admin';
export type ShareMethod = 'link' | 'email' | 'team';

export interface SharedUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  accessLevel: AccessLevel;
}

export interface ShareDialogProps {
  open: boolean;
  onClose: () => void;
  resourceName: string;
  resourceType: 'plant' | 'dashboard' | 'report' | 'sensor' | 'document';
  sharedUsers?: SharedUser[];
  currentAccess?: 'private' | 'team' | 'public';
  shareLink?: string;
  onShare?: (users: string[], accessLevel: AccessLevel) => Promise<void>;
  onUpdateAccess?: (userId: string, accessLevel: AccessLevel) => Promise<void>;
  onRemoveAccess?: (userId: string) => Promise<void>;
  onUpdateLinkSharing?: (enabled: boolean, accessLevel: AccessLevel) => Promise<void>;
}

/**
 * Share resources with team members via link or email
 */
export function ShareDialog({
  open,
  onClose,
  resourceName,
  resourceType,
  sharedUsers: initialSharedUsers = [],
  currentAccess = 'private',
  shareLink,
  onShare,
  onUpdateAccess,
  onRemoveAccess,
  onUpdateLinkSharing,
}: ShareDialogProps) {
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>(initialSharedUsers);
  const [shareMethod, setShareMethod] = useState<ShareMethod>('email');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [accessLevel, setAccessLevel] = useState<AccessLevel>('view');
  const [linkSharingEnabled, setLinkSharingEnabled] = useState(currentAccess !== 'private');
  const [linkAccessLevel, setLinkAccessLevel] = useState<AccessLevel>('view');
  const [copied, setCopied] = useState(false);

  const availableUsers = [
    { id: '1', name: 'John Smith', email: 'john@example.com' },
    { id: '2', name: 'Sarah Johnson', email: 'sarah@example.com' },
    { id: '3', name: 'Mike Davis', email: 'mike@example.com' },
    { id: '4', name: 'Emily Wilson', email: 'emily@example.com' },
    { id: '5', name: 'Alex Brown', email: 'alex@example.com' },
  ];

  const handleShare = async () => {
    if (selectedUsers.length === 0) return;

    try {
      if (onShare) {
        await onShare(selectedUsers, accessLevel);
      }

      // Add to shared users locally
      const newSharedUsers = selectedUsers.map((userId) => {
        const user = availableUsers.find((u) => u.id === userId);
        return {
          id: userId,
          name: user?.name || '',
          email: user?.email || '',
          accessLevel,
        };
      });

      setSharedUsers([...sharedUsers, ...newSharedUsers]);
      setSelectedUsers([]);
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  const handleUpdateAccess = async (userId: string, newAccessLevel: AccessLevel) => {
    try {
      if (onUpdateAccess) {
        await onUpdateAccess(userId, newAccessLevel);
      }

      setSharedUsers(
        sharedUsers.map((u) => (u.id === userId ? { ...u, accessLevel: newAccessLevel } : u))
      );
    } catch (error) {
      console.error('Failed to update access:', error);
    }
  };

  const handleRemoveAccess = async (userId: string) => {
    try {
      if (onRemoveAccess) {
        await onRemoveAccess(userId);
      }

      setSharedUsers(sharedUsers.filter((u) => u.id !== userId));
    } catch (error) {
      console.error('Failed to remove access:', error);
    }
  };

  const handleCopyLink = async () => {
    if (shareLink) {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleToggleLinkSharing = async (enabled: boolean) => {
    setLinkSharingEnabled(enabled);
    if (onUpdateLinkSharing) {
      await onUpdateLinkSharing(enabled, linkAccessLevel);
    }
  };

  const getAccessIcon = (access: string) => {
    switch (access) {
      case 'public':
        return <PublicIcon />;
      case 'team':
        return <TeamIcon />;
      default:
        return <PrivateIcon />;
    }
  };

  const getAccessLevelColor = (level: AccessLevel) => {
    switch (level) {
      case 'admin':
        return 'error';
      case 'edit':
        return 'primary';
      case 'comment':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Share "{resourceName}"</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3}>
          {/* Current Access */}
          <Alert
            severity="info"
            icon={getAccessIcon(currentAccess)}
          >
            <Typography variant="body2">
              Current access: <strong>{currentAccess}</strong>
            </Typography>
          </Alert>

          {/* Share Method Tabs */}
          <Tabs value={shareMethod} onChange={(_, value) => setShareMethod(value)}>
            <Tab value="email" label="Share with People" icon={<EmailIcon />} iconPosition="start" />
            <Tab value="link" label="Share Link" icon={<LinkIcon />} iconPosition="start" />
          </Tabs>

          {/* Email Sharing */}
          {shareMethod === 'email' && (
            <Stack spacing={2}>
              <Autocomplete
                multiple
                options={availableUsers.filter(
                  (u) => !sharedUsers.some((s) => s.id === u.id)
                )}
                getOptionLabel={(option) => `${option.name} (${option.email})`}
                value={availableUsers.filter((u) => selectedUsers.includes(u.id))}
                onChange={(_, newValue) => setSelectedUsers(newValue.map((u) => u.id))}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Add people"
                    placeholder="Enter email addresses"
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar sx={{ width: 32, height: 32 }}>
                        {option.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2">{option.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.email}
                        </Typography>
                      </Box>
                    </Stack>
                  </li>
                )}
              />

              <FormControl fullWidth size="small">
                <InputLabel>Access Level</InputLabel>
                <Select
                  value={accessLevel}
                  onChange={(e) => setAccessLevel(e.target.value as AccessLevel)}
                  label="Access Level"
                >
                  <MenuItem value="view">View - Can view only</MenuItem>
                  <MenuItem value="comment">Comment - Can view and comment</MenuItem>
                  <MenuItem value="edit">Edit - Can view and edit</MenuItem>
                  <MenuItem value="admin">Admin - Full control</MenuItem>
                </Select>
              </FormControl>

              <Button
                variant="contained"
                onClick={handleShare}
                disabled={selectedUsers.length === 0}
                fullWidth
              >
                Share with {selectedUsers.length} {selectedUsers.length === 1 ? 'person' : 'people'}
              </Button>
            </Stack>
          )}

          {/* Link Sharing */}
          {shareMethod === 'link' && (
            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={linkSharingEnabled}
                    onChange={(e) => handleToggleLinkSharing(e.target.checked)}
                  />
                }
                label="Anyone with the link can access"
              />

              {linkSharingEnabled && (
                <>
                  <FormControl fullWidth size="small">
                    <InputLabel>Link Access Level</InputLabel>
                    <Select
                      value={linkAccessLevel}
                      onChange={(e) => setLinkAccessLevel(e.target.value as AccessLevel)}
                      label="Link Access Level"
                    >
                      <MenuItem value="view">View only</MenuItem>
                      <MenuItem value="comment">Can comment</MenuItem>
                      <MenuItem value="edit">Can edit</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    value={shareLink || 'https://example.com/share/abc123'}
                    InputProps={{
                      readOnly: true,
                      endAdornment: (
                        <IconButton onClick={handleCopyLink}>
                          {copied ? <CheckIcon color="success" /> : <CopyIcon />}
                        </IconButton>
                      ),
                    }}
                    fullWidth
                  />

                  {copied && (
                    <Alert severity="success">Link copied to clipboard!</Alert>
                  )}
                </>
              )}
            </Stack>
          )}

          {/* People with Access */}
          {sharedUsers.length > 0 && (
            <>
              <Divider />
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  People with access ({sharedUsers.length})
                </Typography>
                <List>
                  {sharedUsers.map((user) => (
                    <ListItem
                      key={user.id}
                      secondaryAction={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Select
                            value={user.accessLevel}
                            onChange={(e) => handleUpdateAccess(user.id, e.target.value as AccessLevel)}
                            size="small"
                            sx={{ minWidth: 120 }}
                          >
                            <MenuItem value="view">View</MenuItem>
                            <MenuItem value="comment">Comment</MenuItem>
                            <MenuItem value="edit">Edit</MenuItem>
                            <MenuItem value="admin">Admin</MenuItem>
                          </Select>
                          <IconButton
                            edge="end"
                            onClick={() => handleRemoveAccess(user.id)}
                            size="small"
                          >
                            <CloseIcon />
                          </IconButton>
                        </Stack>
                      }
                    >
                      <ListItemAvatar>
                        <Avatar src={user.avatar}>
                          {user.name.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={user.name}
                        secondary={user.email}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </>
          )}

          {/* Access Level Descriptions */}
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="caption" component="div">
              <strong>Access Levels:</strong>
            </Typography>
            <Typography variant="caption" component="div">
              • View: Can view {resourceType}
            </Typography>
            <Typography variant="caption" component="div">
              • Comment: Can view and add comments
            </Typography>
            <Typography variant="caption" component="div">
              • Edit: Can view and make changes
            </Typography>
            <Typography variant="caption" component="div">
              • Admin: Full control including sharing
            </Typography>
          </Alert>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Done</Button>
      </DialogActions>
    </Dialog>
  );
}
