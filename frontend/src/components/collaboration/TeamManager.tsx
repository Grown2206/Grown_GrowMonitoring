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
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Stack,
  TextField,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Divider,
  Alert,
  Paper,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  MoreVert as MoreIcon,
  Search as SearchIcon,
  Email as EmailIcon,
  Shield as AdminIcon,
  Create as EditorIcon,
  Visibility as ViewerIcon,
  Send as InviteIcon,
} from '@mui/icons-material';

export type TeamRole = 'admin' | 'editor' | 'viewer';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: TeamRole;
  status: 'active' | 'pending' | 'inactive';
  joinedAt?: Date;
  lastActive?: Date;
}

export interface TeamManagerProps {
  teamName?: string;
  members?: TeamMember[];
  currentUserId?: string;
  onInviteMember?: (email: string, role: TeamRole) => Promise<void>;
  onUpdateMemberRole?: (memberId: string, role: TeamRole) => Promise<void>;
  onRemoveMember?: (memberId: string) => Promise<void>;
  maxMembers?: number;
}

/**
 * Team member management with roles and permissions
 */
export function TeamManager({
  teamName = 'My Team',
  members: initialMembers = [],
  currentUserId,
  onInviteMember,
  onUpdateMemberRole,
  onRemoveMember,
  maxMembers = 50,
}: TeamManagerProps) {
  const [members, setMembers] = useState<TeamMember[]>(
    initialMembers.length > 0 ? initialMembers : getSampleMembers()
  );
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamRole>('viewer');
  const [searchQuery, setSearchQuery] = useState('');
  const [inviting, setInviting] = useState(false);

  const handleInvite = async () => {
    if (!inviteEmail || !isValidEmail(inviteEmail)) return;

    setInviting(true);
    try {
      if (onInviteMember) {
        await onInviteMember(inviteEmail, inviteRole);
      }

      // Add to local state
      const newMember: TeamMember = {
        id: `member-${Date.now()}`,
        name: inviteEmail.split('@')[0],
        email: inviteEmail,
        role: inviteRole,
        status: 'pending',
      };
      setMembers([...members, newMember]);

      // Reset form
      setInviteEmail('');
      setInviteRole('viewer');
      setInviteDialogOpen(false);
    } catch (error) {
      console.error('Failed to invite member:', error);
    } finally {
      setInviting(false);
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: TeamRole) => {
    try {
      if (onUpdateMemberRole) {
        await onUpdateMemberRole(memberId, newRole);
      }

      setMembers(
        members.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
      );
      setEditDialogOpen(false);
      setSelectedMember(null);
    } catch (error) {
      console.error('Failed to update role:', error);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      if (onRemoveMember) {
        await onRemoveMember(memberId);
      }

      setMembers(members.filter((m) => m.id !== memberId));
      setEditDialogOpen(false);
      setSelectedMember(null);
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const getRoleIcon = (role: TeamRole) => {
    switch (role) {
      case 'admin':
        return <AdminIcon />;
      case 'editor':
        return <EditorIcon />;
      case 'viewer':
        return <ViewerIcon />;
    }
  };

  const getRoleColor = (role: TeamRole) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'editor':
        return 'primary';
      case 'viewer':
        return 'default';
    }
  };

  const getRoleLabel = (role: TeamRole) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const filteredMembers = members.filter(
    (member) =>
      searchQuery === '' ||
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeMembers = members.filter((m) => m.status === 'active');
  const pendingMembers = members.filter((m) => m.status === 'pending');
  const adminMembers = members.filter((m) => m.role === 'admin');

  return (
    <Box>
      <Stack spacing={3}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h5" gutterBottom>
              {teamName}
            </Typography>
            <Stack direction="row" spacing={2}>
              <Chip label={`${activeMembers.length} active`} size="small" color="success" />
              {pendingMembers.length > 0 && (
                <Chip label={`${pendingMembers.length} pending`} size="small" color="warning" />
              )}
            </Stack>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setInviteDialogOpen(true)}
            disabled={members.length >= maxMembers}
          >
            Invite Member
          </Button>
        </Stack>

        {/* Stats */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography variant="h4">{members.length}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Members
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography variant="h4">{adminMembers.length}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Administrators
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography variant="h4">{maxMembers - members.length}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Available Seats
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Search */}
        <TextField
          placeholder="Search members..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        {/* Members List */}
        <Paper>
          <List>
            {filteredMembers.map((member, index) => (
              <React.Fragment key={member.id}>
                {index > 0 && <Divider />}
                <ListItem
                  secondaryAction={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        icon={getRoleIcon(member.role)}
                        label={getRoleLabel(member.role)}
                        size="small"
                        color={getRoleColor(member.role)}
                      />
                      {member.id !== currentUserId && (
                        <IconButton
                          edge="end"
                          onClick={() => {
                            setSelectedMember(member);
                            setEditDialogOpen(true);
                          }}
                        >
                          <MoreIcon />
                        </IconButton>
                      )}
                    </Stack>
                  }
                >
                  <ListItemAvatar>
                    <Avatar src={member.avatar}>
                      {member.name.charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography>{member.name}</Typography>
                        {member.id === currentUserId && (
                          <Chip label="You" size="small" color="primary" />
                        )}
                        {member.status === 'pending' && (
                          <Chip label="Pending" size="small" color="warning" />
                        )}
                      </Stack>
                    }
                    secondary={
                      <Stack>
                        <Typography variant="body2" color="text.secondary">
                          {member.email}
                        </Typography>
                        {member.lastActive && (
                          <Typography variant="caption" color="text.secondary">
                            Last active: {new Date(member.lastActive).toLocaleDateString()}
                          </Typography>
                        )}
                      </Stack>
                    }
                  />
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        </Paper>

        {/* Role Descriptions */}
        <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
          <Typography variant="subtitle2" gutterBottom>
            Role Descriptions
          </Typography>
          <Stack spacing={1}>
            <Stack direction="row" spacing={1} alignItems="center">
              <AdminIcon fontSize="small" />
              <Typography variant="body2">
                <strong>Admin:</strong> Full access including member management
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <EditorIcon fontSize="small" />
              <Typography variant="body2">
                <strong>Editor:</strong> Can create and edit content
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <ViewerIcon fontSize="small" />
              <Typography variant="body2">
                <strong>Viewer:</strong> Read-only access
              </Typography>
            </Stack>
          </Stack>
        </Paper>
      </Stack>

      {/* Invite Dialog */}
      <Dialog open={inviteDialogOpen} onClose={() => setInviteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Invite Team Member</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Alert severity="info">
              An invitation email will be sent to the member.
            </Alert>

            <TextField
              label="Email Address"
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="colleague@example.com"
              fullWidth
              autoFocus
              error={inviteEmail !== '' && !isValidEmail(inviteEmail)}
              helperText={
                inviteEmail !== '' && !isValidEmail(inviteEmail)
                  ? 'Invalid email address'
                  : ''
              }
            />

            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as TeamRole)}
                label="Role"
              >
                <MenuItem value="viewer">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <ViewerIcon fontSize="small" />
                    <Typography>Viewer - Read-only access</Typography>
                  </Stack>
                </MenuItem>
                <MenuItem value="editor">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <EditorIcon fontSize="small" />
                    <Typography>Editor - Can create and edit</Typography>
                  </Stack>
                </MenuItem>
                <MenuItem value="admin">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <AdminIcon fontSize="small" />
                    <Typography>Admin - Full access</Typography>
                  </Stack>
                </MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInviteDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            startIcon={<InviteIcon />}
            onClick={handleInvite}
            disabled={!inviteEmail || !isValidEmail(inviteEmail) || inviting}
          >
            {inviting ? 'Sending...' : 'Send Invitation'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Member Dialog */}
      {selectedMember && (
        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Manage Member</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              {/* Member Info */}
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar src={selectedMember.avatar} sx={{ width: 64, height: 64 }}>
                  {selectedMember.name.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h6">{selectedMember.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedMember.email}
                  </Typography>
                </Box>
              </Stack>

              <Divider />

              {/* Change Role */}
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={selectedMember.role}
                  onChange={(e) => handleUpdateRole(selectedMember.id, e.target.value as TeamRole)}
                  label="Role"
                >
                  <MenuItem value="viewer">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <ViewerIcon fontSize="small" />
                      <Typography>Viewer</Typography>
                    </Stack>
                  </MenuItem>
                  <MenuItem value="editor">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <EditorIcon fontSize="small" />
                      <Typography>Editor</Typography>
                    </Stack>
                  </MenuItem>
                  <MenuItem value="admin">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <AdminIcon fontSize="small" />
                      <Typography>Admin</Typography>
                    </Stack>
                  </MenuItem>
                </Select>
              </FormControl>

              {/* Remove Member */}
              <Alert severity="error">
                <Typography variant="body2" gutterBottom>
                  <strong>Remove Member</strong>
                </Typography>
                <Typography variant="body2" paragraph>
                  This will revoke {selectedMember.name}'s access to the team.
                </Typography>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<DeleteIcon />}
                  onClick={() => handleRemoveMember(selectedMember.id)}
                >
                  Remove from Team
                </Button>
              </Alert>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}

/**
 * Generate sample team members for demo
 */
function getSampleMembers(): TeamMember[] {
  return [
    {
      id: '1',
      name: 'John Smith',
      email: 'john@example.com',
      role: 'admin',
      status: 'active',
      joinedAt: new Date('2024-01-01'),
      lastActive: new Date(),
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      role: 'editor',
      status: 'active',
      joinedAt: new Date('2024-01-15'),
      lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
    {
      id: '3',
      name: 'Mike Davis',
      email: 'mike@example.com',
      role: 'editor',
      status: 'active',
      joinedAt: new Date('2024-02-01'),
      lastActive: new Date(Date.now() - 48 * 60 * 60 * 1000),
    },
    {
      id: '4',
      name: 'Emily Wilson',
      email: 'emily@example.com',
      role: 'viewer',
      status: 'pending',
      joinedAt: new Date('2024-02-15'),
    },
  ];
}
