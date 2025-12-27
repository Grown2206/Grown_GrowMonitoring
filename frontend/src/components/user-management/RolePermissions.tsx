import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileCopy as CloneIcon,
  ExpandMore as ExpandIcon,
  Security as SecurityIcon,
  People as PeopleIcon,
  LocalFlorist as PlantIcon,
  Sensors as SensorIcon,
  BarChart as ReportIcon,
  Settings as SettingsIcon,
  NotificationsActive as NotificationIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';

export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'manage';

export interface Permission {
  id: string;
  name: string;
  category: string;
  description: string;
  actions: PermissionAction[];
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Record<string, PermissionAction[]>;
  isSystem: boolean;
  userCount?: number;
  createdAt: Date;
}

export interface RolePermissionsProps {
  roles?: Role[];
  permissions?: Permission[];
  onCreateRole?: (role: Omit<Role, 'id' | 'createdAt'>) => void;
  onUpdateRole?: (roleId: string, updates: Partial<Role>) => void;
  onDeleteRole?: (roleId: string) => void;
  onCloneRole?: (roleId: string, newName: string) => void;
}

/**
 * Role and permissions management interface
 */
export function RolePermissions({
  roles: initialRoles = [],
  permissions: initialPermissions = [],
  onCreateRole,
  onUpdateRole,
  onDeleteRole,
  onCloneRole,
}: RolePermissionsProps) {
  const [roles, setRoles] = useState<Role[]>(
    initialRoles.length > 0 ? initialRoles : getSampleRoles()
  );
  const [permissions] = useState<Permission[]>(
    initialPermissions.length > 0 ? initialPermissions : getSamplePermissions()
  );
  const [selectedRole, setSelectedRole] = useState<Role | null>(roles[0] || null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [cloneDialogOpen, setCloneDialogOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Form states
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPermissions, setFormPermissions] = useState<Record<string, PermissionAction[]>>({});

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
  };

  const handleCreateRole = () => {
    const newRole: Role = {
      id: (roles.length + 1).toString(),
      name: formName,
      description: formDescription,
      permissions: formPermissions,
      isSystem: false,
      userCount: 0,
      createdAt: new Date(),
    };

    setRoles([...roles, newRole]);
    onCreateRole?.(newRole);
    showSuccessNotification(`Role "${formName}" created successfully`);
    resetForm();
    setCreateDialogOpen(false);
    setSelectedRole(newRole);
  };

  const handleUpdateRole = () => {
    if (selectedRole) {
      const updates: Partial<Role> = {
        name: formName,
        description: formDescription,
        permissions: formPermissions,
      };

      const updatedRoles = roles.map((r) =>
        r.id === selectedRole.id ? { ...r, ...updates } : r
      );
      setRoles(updatedRoles);
      onUpdateRole?.(selectedRole.id, updates);
      showSuccessNotification(`Role "${formName}" updated successfully`);
      resetForm();
      setEditDialogOpen(false);
      setSelectedRole({ ...selectedRole, ...updates });
    }
  };

  const handleDeleteRole = (role: Role) => {
    setRoles(roles.filter((r) => r.id !== role.id));
    onDeleteRole?.(role.id);
    showSuccessNotification(`Role "${role.name}" deleted successfully`);
    if (selectedRole?.id === role.id) {
      setSelectedRole(roles[0] || null);
    }
  };

  const handleCloneRole = () => {
    if (selectedRole) {
      const newRole: Role = {
        id: (roles.length + 1).toString(),
        name: formName,
        description: selectedRole.description,
        permissions: { ...selectedRole.permissions },
        isSystem: false,
        userCount: 0,
        createdAt: new Date(),
      };

      setRoles([...roles, newRole]);
      onCloneRole?.(selectedRole.id, formName);
      showSuccessNotification(`Role "${formName}" cloned from "${selectedRole.name}"`);
      resetForm();
      setCloneDialogOpen(false);
      setSelectedRole(newRole);
    }
  };

  const handleEditClick = (role: Role) => {
    setFormName(role.name);
    setFormDescription(role.description);
    setFormPermissions(role.permissions);
    setSelectedRole(role);
    setEditDialogOpen(true);
  };

  const handleCloneClick = (role: Role) => {
    setFormName(`${role.name} (Copy)`);
    setSelectedRole(role);
    setCloneDialogOpen(true);
  };

  const handlePermissionToggle = (permissionId: string, action: PermissionAction) => {
    setFormPermissions((prev) => {
      const current = prev[permissionId] || [];
      const updated = current.includes(action)
        ? current.filter((a) => a !== action)
        : [...current, action];
      return { ...prev, [permissionId]: updated };
    });
  };

  const handleCategoryToggle = (category: string, checked: boolean) => {
    const categoryPermissions = permissions.filter((p) => p.category === category);
    setFormPermissions((prev) => {
      const updated = { ...prev };
      categoryPermissions.forEach((perm) => {
        updated[perm.id] = checked ? [...perm.actions] : [];
      });
      return updated;
    });
  };

  const resetForm = () => {
    setFormName('');
    setFormDescription('');
    setFormPermissions({});
  };

  const showSuccessNotification = (message: string) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const getPermissionsByCategory = () => {
    const categories: Record<string, Permission[]> = {};
    permissions.forEach((perm) => {
      if (!categories[perm.category]) {
        categories[perm.category] = [];
      }
      categories[perm.category].push(perm);
    });
    return categories;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Users':
        return <PeopleIcon />;
      case 'Plants':
        return <PlantIcon />;
      case 'Sensors':
        return <SensorIcon />;
      case 'Reports':
        return <ReportIcon />;
      case 'Settings':
        return <SettingsIcon />;
      case 'Notifications':
        return <NotificationIcon />;
      case 'Dashboard':
        return <DashboardIcon />;
      default:
        return <SecurityIcon />;
    }
  };

  const isCategoryFullyEnabled = (category: string, rolePermissions: Record<string, PermissionAction[]>) => {
    const categoryPerms = permissions.filter((p) => p.category === category);
    return categoryPerms.every((perm) => {
      const actions = rolePermissions[perm.id] || [];
      return perm.actions.every((action) => actions.includes(action));
    });
  };

  const permissionsByCategory = getPermissionsByCategory();

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5">Roles & Permissions</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage user roles and access permissions
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateDialogOpen(true)}>
          Create Role
        </Button>
      </Stack>

      {showSuccess && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setShowSuccess(false)}>
          {successMessage}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Roles List */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader
              title="Roles"
              subheader={`${roles.length} role${roles.length !== 1 ? 's' : ''}`}
            />
            <Divider />
            <List sx={{ maxHeight: 600, overflow: 'auto' }}>
              {roles.map((role) => (
                <React.Fragment key={role.id}>
                  <ListItem
                    button
                    selected={selectedRole?.id === role.id}
                    onClick={() => handleRoleSelect(role)}
                    secondaryAction={
                      !role.isSystem && (
                        <Stack direction="row" spacing={0.5}>
                          <IconButton size="small" onClick={() => handleEditClick(role)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleCloneClick(role)}>
                            <CloneIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteRole(role)}
                            disabled={!!(role.userCount && role.userCount > 0)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      )
                    }
                  >
                    <ListItemText
                      primary={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="subtitle2">{role.name}</Typography>
                          {role.isSystem && <Chip label="System" size="small" />}
                        </Stack>
                      }
                      secondary={
                        <Stack spacing={0.5}>
                          <Typography variant="body2" color="text.secondary">
                            {role.description}
                          </Typography>
                          {role.userCount !== undefined && (
                            <Typography variant="caption" color="text.secondary">
                              {role.userCount} user{role.userCount !== 1 ? 's' : ''}
                            </Typography>
                          )}
                        </Stack>
                      }
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </Card>
        </Grid>

        {/* Permissions Detail */}
        <Grid item xs={12} md={8}>
          {selectedRole ? (
            <Card>
              <CardHeader
                title={selectedRole.name}
                subheader={selectedRole.description}
                action={
                  !selectedRole.isSystem && (
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleEditClick(selectedRole)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        startIcon={<CloneIcon />}
                        onClick={() => handleCloneClick(selectedRole)}
                      >
                        Clone
                      </Button>
                    </Stack>
                  )
                }
              />
              <Divider />
              <CardContent>
                <Stack spacing={2}>
                  {Object.entries(permissionsByCategory).map(([category, categoryPerms]) => (
                    <Accordion key={category} defaultExpanded>
                      <AccordionSummary expandIcon={<ExpandIcon />}>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%', pr: 2 }}>
                          {getCategoryIcon(category)}
                          <Typography variant="subtitle1">{category}</Typography>
                          {isCategoryFullyEnabled(category, selectedRole.permissions) && (
                            <Chip label="Full Access" color="success" size="small" sx={{ ml: 'auto' }} />
                          )}
                        </Stack>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Stack spacing={2}>
                          {categoryPerms.map((perm) => (
                            <Box key={perm.id}>
                              <Typography variant="subtitle2" gutterBottom>
                                {perm.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                                {perm.description}
                              </Typography>
                              <Stack direction="row" spacing={1} flexWrap="wrap">
                                {perm.actions.map((action) => {
                                  const hasPermission = (selectedRole.permissions[perm.id] || []).includes(action);
                                  return (
                                    <Chip
                                      key={action}
                                      label={action}
                                      size="small"
                                      color={hasPermission ? 'primary' : 'default'}
                                      variant={hasPermission ? 'filled' : 'outlined'}
                                    />
                                  );
                                })}
                              </Stack>
                            </Box>
                          ))}
                        </Stack>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <SecurityIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No role selected
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Select a role to view its permissions
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* Create Role Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Role</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Role Name"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              fullWidth
              multiline
              rows={2}
              required
            />
            <Divider />
            <Typography variant="subtitle2">Permissions</Typography>
            {Object.entries(permissionsByCategory).map(([category, categoryPerms]) => (
              <Accordion key={category}>
                <AccordionSummary expandIcon={<ExpandIcon />}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    {getCategoryIcon(category)}
                    <Typography variant="subtitle1">{category}</Typography>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={isCategoryFullyEnabled(category, formPermissions)}
                          onChange={(e) => handleCategoryToggle(category, e.target.checked)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      }
                      label="Grant all"
                      onClick={(e) => e.stopPropagation()}
                      sx={{ ml: 'auto' }}
                    />
                  </Stack>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={2}>
                    {categoryPerms.map((perm) => (
                      <Box key={perm.id}>
                        <Typography variant="subtitle2" gutterBottom>
                          {perm.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                          {perm.description}
                        </Typography>
                        <Stack direction="row" spacing={1}>
                          {perm.actions.map((action) => (
                            <FormControlLabel
                              key={action}
                              control={
                                <Checkbox
                                  checked={(formPermissions[perm.id] || []).includes(action)}
                                  onChange={() => handlePermissionToggle(perm.id, action)}
                                />
                              }
                              label={action}
                            />
                          ))}
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateRole} disabled={!formName || !formDescription}>
            Create Role
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Role</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Role Name"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              fullWidth
              multiline
              rows={2}
              required
            />
            <Divider />
            <Typography variant="subtitle2">Permissions</Typography>
            {Object.entries(permissionsByCategory).map(([category, categoryPerms]) => (
              <Accordion key={category}>
                <AccordionSummary expandIcon={<ExpandIcon />}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    {getCategoryIcon(category)}
                    <Typography variant="subtitle1">{category}</Typography>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={isCategoryFullyEnabled(category, formPermissions)}
                          onChange={(e) => handleCategoryToggle(category, e.target.checked)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      }
                      label="Grant all"
                      onClick={(e) => e.stopPropagation()}
                      sx={{ ml: 'auto' }}
                    />
                  </Stack>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={2}>
                    {categoryPerms.map((perm) => (
                      <Box key={perm.id}>
                        <Typography variant="subtitle2" gutterBottom>
                          {perm.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                          {perm.description}
                        </Typography>
                        <Stack direction="row" spacing={1}>
                          {perm.actions.map((action) => (
                            <FormControlLabel
                              key={action}
                              control={
                                <Checkbox
                                  checked={(formPermissions[perm.id] || []).includes(action)}
                                  onChange={() => handlePermissionToggle(perm.id, action)}
                                />
                              }
                              label={action}
                            />
                          ))}
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateRole} disabled={!formName || !formDescription}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Clone Role Dialog */}
      <Dialog open={cloneDialogOpen} onClose={() => setCloneDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Clone Role</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="info">
              This will create a new role with the same permissions as "{selectedRole?.name}".
            </Alert>
            <TextField
              label="New Role Name"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              fullWidth
              required
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCloneDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCloneRole} disabled={!formName}>
            Clone Role
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

/**
 * Generate sample roles
 */
function getSampleRoles(): Role[] {
  return [
    {
      id: '1',
      name: 'Administrator',
      description: 'Full system access with all permissions',
      permissions: {
        'users-view': ['view', 'create', 'edit', 'delete', 'manage'],
        'plants-view': ['view', 'create', 'edit', 'delete', 'manage'],
        'sensors-view': ['view', 'create', 'edit', 'delete', 'manage'],
        'reports-view': ['view', 'create', 'edit', 'delete'],
        'settings-view': ['view', 'edit', 'manage'],
        'notifications-view': ['view', 'create', 'edit', 'delete'],
        'dashboard-view': ['view', 'edit'],
      },
      isSystem: true,
      userCount: 3,
      createdAt: new Date('2023-01-01'),
    },
    {
      id: '2',
      name: 'Manager',
      description: 'Manage operations with limited system configuration',
      permissions: {
        'users-view': ['view'],
        'plants-view': ['view', 'create', 'edit', 'delete'],
        'sensors-view': ['view', 'edit'],
        'reports-view': ['view', 'create'],
        'settings-view': ['view'],
        'notifications-view': ['view', 'create', 'edit'],
        'dashboard-view': ['view', 'edit'],
      },
      isSystem: true,
      userCount: 8,
      createdAt: new Date('2023-01-01'),
    },
    {
      id: '3',
      name: 'Operator',
      description: 'Day-to-day operations and monitoring',
      permissions: {
        'users-view': ['view'],
        'plants-view': ['view', 'edit'],
        'sensors-view': ['view'],
        'reports-view': ['view'],
        'settings-view': ['view'],
        'notifications-view': ['view'],
        'dashboard-view': ['view'],
      },
      isSystem: true,
      userCount: 15,
      createdAt: new Date('2023-01-01'),
    },
    {
      id: '4',
      name: 'Viewer',
      description: 'Read-only access to system data',
      permissions: {
        'plants-view': ['view'],
        'sensors-view': ['view'],
        'reports-view': ['view'],
        'dashboard-view': ['view'],
      },
      isSystem: true,
      userCount: 12,
      createdAt: new Date('2023-01-01'),
    },
  ];
}

/**
 * Generate sample permissions
 */
function getSamplePermissions(): Permission[] {
  return [
    {
      id: 'users-view',
      name: 'User Management',
      category: 'Users',
      description: 'Manage system users and their access',
      actions: ['view', 'create', 'edit', 'delete', 'manage'],
    },
    {
      id: 'plants-view',
      name: 'Plant Management',
      category: 'Plants',
      description: 'Manage plant data and growth tracking',
      actions: ['view', 'create', 'edit', 'delete', 'manage'],
    },
    {
      id: 'sensors-view',
      name: 'Sensor Management',
      category: 'Sensors',
      description: 'Manage sensors and monitoring devices',
      actions: ['view', 'create', 'edit', 'delete', 'manage'],
    },
    {
      id: 'reports-view',
      name: 'Report Generation',
      category: 'Reports',
      description: 'Create and view analytical reports',
      actions: ['view', 'create', 'edit', 'delete'],
    },
    {
      id: 'settings-view',
      name: 'System Settings',
      category: 'Settings',
      description: 'Configure system-wide settings',
      actions: ['view', 'edit', 'manage'],
    },
    {
      id: 'notifications-view',
      name: 'Notification Management',
      category: 'Notifications',
      description: 'Manage alerts and notifications',
      actions: ['view', 'create', 'edit', 'delete'],
    },
    {
      id: 'dashboard-view',
      name: 'Dashboard Configuration',
      category: 'Dashboard',
      description: 'Customize dashboard layouts and widgets',
      actions: ['view', 'edit'],
    },
  ];
}
