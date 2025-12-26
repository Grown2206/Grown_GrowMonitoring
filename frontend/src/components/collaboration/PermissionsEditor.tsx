import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Checkbox,
  Chip,
  FormControlLabel,
  FormGroup,
  Grid,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
} from '@mui/material';
import {
  ExpandMore as ExpandIcon,
  Info as InfoIcon,
  Lock as LockIcon,
  LockOpen as UnlockIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Share as ShareIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'read' | 'write' | 'delete' | 'share' | 'admin';
}

export interface RolePermissions {
  role: string;
  label: string;
  description: string;
  permissions: string[]; // Permission IDs
  isCustom?: boolean;
}

export interface PermissionsEditorProps {
  roles?: RolePermissions[];
  permissions?: Permission[];
  onUpdatePermissions?: (role: string, permissions: string[]) => void;
  readOnly?: boolean;
}

const defaultPermissions: Permission[] = [
  // Read Permissions
  { id: 'view_plants', name: 'View Plants', description: 'Can view plant information', category: 'read' },
  { id: 'view_sensors', name: 'View Sensors', description: 'Can view sensor data', category: 'read' },
  { id: 'view_reports', name: 'View Reports', description: 'Can view generated reports', category: 'read' },
  { id: 'view_dashboard', name: 'View Dashboards', description: 'Can view dashboards', category: 'read' },

  // Write Permissions
  { id: 'create_plants', name: 'Create Plants', description: 'Can add new plants', category: 'write' },
  { id: 'edit_plants', name: 'Edit Plants', description: 'Can modify plant information', category: 'write' },
  { id: 'create_sensors', name: 'Create Sensors', description: 'Can add new sensors', category: 'write' },
  { id: 'edit_sensors', name: 'Edit Sensors', description: 'Can modify sensor settings', category: 'write' },
  { id: 'create_reports', name: 'Create Reports', description: 'Can generate new reports', category: 'write' },
  { id: 'edit_dashboards', name: 'Edit Dashboards', description: 'Can customize dashboards', category: 'write' },

  // Delete Permissions
  { id: 'delete_plants', name: 'Delete Plants', description: 'Can remove plants', category: 'delete' },
  { id: 'delete_sensors', name: 'Delete Sensors', description: 'Can remove sensors', category: 'delete' },
  { id: 'delete_reports', name: 'Delete Reports', description: 'Can delete reports', category: 'delete' },

  // Share Permissions
  { id: 'share_plants', name: 'Share Plants', description: 'Can share plants with others', category: 'share' },
  { id: 'share_dashboards', name: 'Share Dashboards', description: 'Can share dashboards', category: 'share' },
  { id: 'share_reports', name: 'Share Reports', description: 'Can share reports', category: 'share' },

  // Admin Permissions
  { id: 'manage_users', name: 'Manage Users', description: 'Can invite and remove team members', category: 'admin' },
  { id: 'manage_permissions', name: 'Manage Permissions', description: 'Can modify role permissions', category: 'admin' },
  { id: 'manage_billing', name: 'Manage Billing', description: 'Can access billing and subscriptions', category: 'admin' },
  { id: 'manage_settings', name: 'Manage Settings', description: 'Can modify system settings', category: 'admin' },
];

const defaultRoles: RolePermissions[] = [
  {
    role: 'admin',
    label: 'Administrator',
    description: 'Full access to all features',
    permissions: defaultPermissions.map((p) => p.id),
  },
  {
    role: 'editor',
    label: 'Editor',
    description: 'Can create and edit content',
    permissions: [
      'view_plants',
      'view_sensors',
      'view_reports',
      'view_dashboard',
      'create_plants',
      'edit_plants',
      'create_sensors',
      'edit_sensors',
      'create_reports',
      'edit_dashboards',
      'share_plants',
      'share_dashboards',
      'share_reports',
    ],
  },
  {
    role: 'viewer',
    label: 'Viewer',
    description: 'Read-only access',
    permissions: [
      'view_plants',
      'view_sensors',
      'view_reports',
      'view_dashboard',
    ],
  },
];

/**
 * Granular permissions editor for roles
 */
export function PermissionsEditor({
  roles: customRoles,
  permissions: customPermissions,
  onUpdatePermissions,
  readOnly = false,
}: PermissionsEditorProps) {
  const permissions = customPermissions || defaultPermissions;
  const [roles, setRoles] = useState<RolePermissions[]>(customRoles || defaultRoles);

  const handlePermissionToggle = (role: string, permissionId: string) => {
    if (readOnly) return;

    setRoles((prevRoles) =>
      prevRoles.map((r) => {
        if (r.role === role) {
          const newPermissions = r.permissions.includes(permissionId)
            ? r.permissions.filter((p) => p !== permissionId)
            : [...r.permissions, permissionId];

          if (onUpdatePermissions) {
            onUpdatePermissions(role, newPermissions);
          }

          return { ...r, permissions: newPermissions };
        }
        return r;
      })
    );
  };

  const hasPermission = (role: string, permissionId: string) => {
    const roleData = roles.find((r) => r.role === role);
    return roleData?.permissions.includes(permissionId) || false;
  };

  const getCategoryIcon = (category: Permission['category']) => {
    switch (category) {
      case 'read':
        return <ViewIcon />;
      case 'write':
        return <EditIcon />;
      case 'delete':
        return <DeleteIcon />;
      case 'share':
        return <ShareIcon />;
      case 'admin':
        return <AdminIcon />;
    }
  };

  const getCategoryColor = (category: Permission['category']) => {
    switch (category) {
      case 'read':
        return 'info';
      case 'write':
        return 'primary';
      case 'delete':
        return 'error';
      case 'share':
        return 'success';
      case 'admin':
        return 'warning';
    }
  };

  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <Box>
      <Stack spacing={3}>
        {/* Header */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Role Permissions
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure what each role can do in the system
          </Typography>
        </Box>

        {readOnly && (
          <Alert severity="info" icon={<LockIcon />}>
            Permissions are read-only. Contact an administrator to make changes.
          </Alert>
        )}

        {/* Role Cards Overview */}
        <Grid container spacing={2}>
          {roles.map((role) => {
            const permissionCount = role.permissions.length;
            const totalPermissions = permissions.length;
            const percentage = Math.round((permissionCount / totalPermissions) * 100);

            return (
              <Grid item xs={12} sm={6} md={4} key={role.role}>
                <Card>
                  <CardContent>
                    <Stack spacing={1}>
                      <Typography variant="h6">{role.label}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {role.description}
                      </Typography>
                      <Chip
                        label={`${permissionCount} permissions (${percentage}%)`}
                        size="small"
                        color="primary"
                      />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Permissions Matrix */}
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Permission</TableCell>
                  {roles.map((role) => (
                    <TableCell key={role.role} align="center">
                      {role.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
                  <React.Fragment key={category}>
                    <TableRow>
                      <TableCell colSpan={roles.length + 1} sx={{ bgcolor: 'background.default' }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          {getCategoryIcon(category as Permission['category'])}
                          <Typography variant="subtitle2">
                            {category.charAt(0).toUpperCase() + category.slice(1)} Permissions
                          </Typography>
                          <Chip
                            label={categoryPermissions.length}
                            size="small"
                            color={getCategoryColor(category as Permission['category'])}
                          />
                        </Stack>
                      </TableCell>
                    </TableRow>
                    {categoryPermissions.map((permission) => (
                      <TableRow key={permission.id}>
                        <TableCell>
                          <Stack>
                            <Typography variant="body2">{permission.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {permission.description}
                            </Typography>
                          </Stack>
                        </TableCell>
                        {roles.map((role) => (
                          <TableCell key={role.role} align="center">
                            <Checkbox
                              checked={hasPermission(role.role, permission.id)}
                              onChange={() => handlePermissionToggle(role.role, permission.id)}
                              disabled={readOnly}
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Detailed Permissions by Role */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Detailed Permissions
          </Typography>
          {roles.map((role) => (
            <Accordion key={role.role}>
              <AccordionSummary expandIcon={<ExpandIcon />}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%' }}>
                  <Typography variant="subtitle1">{role.label}</Typography>
                  <Chip
                    label={`${role.permissions.length} permissions`}
                    size="small"
                  />
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <FormGroup>
                  {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => {
                    const categoryPerms = categoryPermissions.filter((p) =>
                      role.permissions.includes(p.id)
                    );

                    if (categoryPerms.length === 0) return null;

                    return (
                      <Box key={category} sx={{ mb: 2 }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                          {getCategoryIcon(category as Permission['category'])}
                          <Typography variant="subtitle2" color="text.secondary">
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </Typography>
                        </Stack>
                        <Grid container spacing={1}>
                          {categoryPerms.map((permission) => (
                            <Grid item xs={12} sm={6} key={permission.id}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked
                                    onChange={() => handlePermissionToggle(role.role, permission.id)}
                                    disabled={readOnly}
                                  />
                                }
                                label={
                                  <Tooltip title={permission.description} arrow>
                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                      <Typography variant="body2">{permission.name}</Typography>
                                      <InfoIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                                    </Stack>
                                  </Tooltip>
                                }
                              />
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    );
                  })}
                </FormGroup>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Stack>
    </Box>
  );
}
