import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
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
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
  Tooltip,
  Checkbox,
  FormGroup,
} from '@mui/material';
import {
  Add as AddIcon,
  ContentCopy as CopyIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  VisibilityOff as HideIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  VpnKey as KeyIcon,
} from '@mui/icons-material';

export interface APIKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  createdAt: Date;
  lastUsed?: Date;
  expiresAt?: Date;
  enabled: boolean;
  usageCount?: number;
}

export interface APIKeyManagerProps {
  apiKeys?: APIKey[];
  onCreateKey?: (name: string, permissions: string[], expiresIn?: number) => Promise<string>;
  onRevokeKey?: (keyId: string) => Promise<void>;
  onToggleKey?: (keyId: string, enabled: boolean) => Promise<void>;
}

const availablePermissions = [
  { id: 'plants:read', label: 'Read Plants', category: 'Plants' },
  { id: 'plants:write', label: 'Write Plants', category: 'Plants' },
  { id: 'plants:delete', label: 'Delete Plants', category: 'Plants' },
  { id: 'sensors:read', label: 'Read Sensors', category: 'Sensors' },
  { id: 'sensors:write', label: 'Write Sensors', category: 'Sensors' },
  { id: 'sensors:delete', label: 'Delete Sensors', category: 'Sensors' },
  { id: 'reports:read', label: 'Read Reports', category: 'Reports' },
  { id: 'reports:write', label: 'Write Reports', category: 'Reports' },
  { id: 'users:read', label: 'Read Users', category: 'Users' },
  { id: 'users:write', label: 'Write Users', category: 'Users' },
  { id: 'webhooks:manage', label: 'Manage Webhooks', category: 'Webhooks' },
  { id: 'admin:full', label: 'Full Admin Access', category: 'Admin' },
];

/**
 * API key management with permissions and security
 */
export function APIKeyManager({
  apiKeys: initialKeys = [],
  onCreateKey,
  onRevokeKey,
  onToggleKey,
}: APIKeyManagerProps) {
  const [apiKeys, setApiKeys] = useState<APIKey[]>(
    initialKeys.length > 0 ? initialKeys : getSampleKeys()
  );
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [expirationDays, setExpirationDays] = useState<number | null>(null);
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  const handleCreateKey = async () => {
    if (!newKeyName.trim() || selectedPermissions.length === 0) return;

    try {
      let keyValue = '';
      if (onCreateKey) {
        keyValue = await onCreateKey(newKeyName, selectedPermissions, expirationDays || undefined);
      } else {
        keyValue = `gms_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      }

      const newKey: APIKey = {
        id: `key-${Date.now()}`,
        name: newKeyName,
        key: keyValue,
        permissions: selectedPermissions,
        createdAt: new Date(),
        expiresAt: expirationDays ? new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000) : undefined,
        enabled: true,
        usageCount: 0,
      };

      setApiKeys([newKey, ...apiKeys]);
      setGeneratedKey(keyValue);
      setNewKeyName('');
      setSelectedPermissions([]);
      setExpirationDays(null);
    } catch (error) {
      console.error('Failed to create API key:', error);
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    try {
      if (onRevokeKey) {
        await onRevokeKey(keyId);
      }
      setApiKeys(apiKeys.filter((k) => k.id !== keyId));
    } catch (error) {
      console.error('Failed to revoke key:', error);
    }
  };

  const handleToggleKey = async (keyId: string, enabled: boolean) => {
    try {
      if (onToggleKey) {
        await onToggleKey(keyId, enabled);
      }
      setApiKeys(apiKeys.map((k) => (k.id === keyId ? { ...k, enabled } : k)));
    } catch (error) {
      console.error('Failed to toggle key:', error);
    }
  };

  const handleCopyKey = async (key: string) => {
    await navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleKeyVisibility = (keyId: string) => {
    setRevealedKeys((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(keyId)) {
        newSet.delete(keyId);
      } else {
        newSet.add(keyId);
      }
      return newSet;
    });
  };

  const maskKey = (key: string) => {
    return `${key.substring(0, 8)}...${key.substring(key.length - 4)}`;
  };

  const getExpirationStatus = (expiresAt?: Date) => {
    if (!expiresAt) return null;
    const daysUntilExpiry = Math.floor((expiresAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
    if (daysUntilExpiry < 0) return { label: 'Expired', color: 'error' as const };
    if (daysUntilExpiry <= 7) return { label: `Expires in ${daysUntilExpiry}d`, color: 'warning' as const };
    return { label: `Expires in ${daysUntilExpiry}d`, color: 'default' as const };
  };

  const permissionsByCategory = availablePermissions.reduce((acc, perm) => {
    if (!acc[perm.category]) {
      acc[perm.category] = [];
    }
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, typeof availablePermissions>);

  return (
    <Box>
      <Stack spacing={3}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h5" gutterBottom>
              API Keys
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage API keys for programmatic access
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Create API Key
          </Button>
        </Stack>

        {/* Security Warning */}
        <Alert severity="warning" icon={<WarningIcon />}>
          API keys provide full access to your account. Keep them secure and never share them publicly.
        </Alert>

        {/* Keys List */}
        {apiKeys.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <KeyIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No API Keys
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Create your first API key to get started with the API
            </Typography>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setCreateDialogOpen(true)}>
              Create First Key
            </Button>
          </Paper>
        ) : (
          <Stack spacing={2}>
            {apiKeys.map((apiKey) => {
              const isRevealed = revealedKeys.has(apiKey.id);
              const expirationStatus = getExpirationStatus(apiKey.expiresAt);

              return (
                <Card key={apiKey.id}>
                  <CardContent>
                    <Stack spacing={2}>
                      {/* Header */}
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Box sx={{ flex: 1 }}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="h6">{apiKey.name}</Typography>
                            {!apiKey.enabled && (
                              <Chip label="Disabled" size="small" color="default" />
                            )}
                            {expirationStatus && (
                              <Chip label={expirationStatus.label} size="small" color={expirationStatus.color} />
                            )}
                          </Stack>
                          <Typography variant="caption" color="text.secondary">
                            Created {apiKey.createdAt.toLocaleDateString()}
                          </Typography>
                        </Box>
                        <Switch
                          checked={apiKey.enabled}
                          onChange={(e) => handleToggleKey(apiKey.id, e.target.checked)}
                        />
                      </Stack>

                      {/* API Key */}
                      <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', flex: 1 }}>
                            {isRevealed ? apiKey.key : maskKey(apiKey.key)}
                          </Typography>
                          <IconButton size="small" onClick={() => toggleKeyVisibility(apiKey.id)}>
                            {isRevealed ? <HideIcon /> : <ViewIcon />}
                          </IconButton>
                          <IconButton size="small" onClick={() => handleCopyKey(apiKey.key)}>
                            {copiedKey === apiKey.key ? (
                              <CheckIcon color="success" />
                            ) : (
                              <CopyIcon />
                            )}
                          </IconButton>
                        </Stack>
                      </Paper>

                      {/* Permissions */}
                      <Box>
                        <Typography variant="caption" color="text.secondary" gutterBottom>
                          Permissions ({apiKey.permissions.length})
                        </Typography>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ gap: 0.5 }}>
                          {apiKey.permissions.slice(0, 5).map((perm) => (
                            <Chip key={perm} label={perm} size="small" variant="outlined" />
                          ))}
                          {apiKey.permissions.length > 5 && (
                            <Chip label={`+${apiKey.permissions.length - 5} more`} size="small" />
                          )}
                        </Stack>
                      </Box>

                      {/* Usage Stats */}
                      <Stack direction="row" spacing={3}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Usage Count
                          </Typography>
                          <Typography variant="body2">{apiKey.usageCount || 0}</Typography>
                        </Box>
                        {apiKey.lastUsed && (
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Last Used
                            </Typography>
                            <Typography variant="body2">
                              {apiKey.lastUsed.toLocaleDateString()}
                            </Typography>
                          </Box>
                        )}
                      </Stack>

                      <Divider />

                      {/* Actions */}
                      <Stack direction="row" justifyContent="flex-end">
                        <Button
                          size="small"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleRevokeKey(apiKey.id)}
                        >
                          Revoke Key
                        </Button>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        )}
      </Stack>

      {/* Create Key Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => !generatedKey && setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {generatedKey ? 'API Key Created' : 'Create New API Key'}
        </DialogTitle>
        <DialogContent>
          {generatedKey ? (
            <Stack spacing={2}>
              <Alert severity="success">
                Your API key has been created successfully!
              </Alert>
              <Alert severity="warning" icon={<WarningIcon />}>
                Make sure to copy your API key now. You won't be able to see it again!
              </Alert>
              <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', flex: 1, wordBreak: 'break-all' }}>
                    {generatedKey}
                  </Typography>
                  <IconButton onClick={() => handleCopyKey(generatedKey)}>
                    {copiedKey === generatedKey ? (
                      <CheckIcon color="success" />
                    ) : (
                      <CopyIcon />
                    )}
                  </IconButton>
                </Stack>
              </Paper>
            </Stack>
          ) : (
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                label="Key Name"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="My API Key"
                fullWidth
                helperText="A descriptive name for this API key"
              />

              <FormControl fullWidth>
                <InputLabel>Expiration</InputLabel>
                <Select
                  value={expirationDays || ''}
                  onChange={(e) => setExpirationDays(e.target.value as number)}
                  label="Expiration"
                >
                  <MenuItem value="">Never expires</MenuItem>
                  <MenuItem value={7}>7 days</MenuItem>
                  <MenuItem value={30}>30 days</MenuItem>
                  <MenuItem value={90}>90 days</MenuItem>
                  <MenuItem value={365}>1 year</MenuItem>
                </Select>
              </FormControl>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Permissions
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                  Select the permissions this API key will have
                </Typography>
                <FormGroup>
                  {Object.entries(permissionsByCategory).map(([category, perms]) => (
                    <Box key={category} sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                        {category}
                      </Typography>
                      {perms.map((perm) => (
                        <FormControlLabel
                          key={perm.id}
                          control={
                            <Checkbox
                              checked={selectedPermissions.includes(perm.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedPermissions([...selectedPermissions, perm.id]);
                                } else {
                                  setSelectedPermissions(
                                    selectedPermissions.filter((p) => p !== perm.id)
                                  );
                                }
                              }}
                            />
                          }
                          label={perm.label}
                        />
                      ))}
                    </Box>
                  ))}
                </FormGroup>
              </Box>

              <Alert severity="info" icon={<InfoIcon />}>
                Choose only the permissions this key needs. You can't modify permissions later.
              </Alert>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          {generatedKey ? (
            <Button
              onClick={() => {
                setGeneratedKey(null);
                setCreateDialogOpen(false);
              }}
              variant="contained"
            >
              Done
            </Button>
          ) : (
            <>
              <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
              <Button
                variant="contained"
                onClick={handleCreateKey}
                disabled={!newKeyName.trim() || selectedPermissions.length === 0}
              >
                Create Key
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}

/**
 * Generate sample API keys for demo
 */
function getSampleKeys(): APIKey[] {
  return [
    {
      id: '1',
      name: 'Production API Key',
      key: 'gms_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
      permissions: ['plants:read', 'sensors:read', 'reports:read'],
      createdAt: new Date('2024-01-15'),
      lastUsed: new Date(),
      enabled: true,
      usageCount: 1523,
    },
    {
      id: '2',
      name: 'Development Key',
      key: 'gms_test_q9r8s7t6u5v4w3x2y1z0a9b8c7d6e5f4',
      permissions: ['plants:read', 'plants:write', 'sensors:read', 'sensors:write'],
      createdAt: new Date('2024-02-01'),
      lastUsed: new Date(Date.now() - 24 * 60 * 60 * 1000),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      enabled: true,
      usageCount: 89,
    },
    {
      id: '3',
      name: 'Deprecated Key',
      key: 'gms_old_g5h4i3j2k1l0m9n8o7p6q5r4s3t2u1v0',
      permissions: ['plants:read'],
      createdAt: new Date('2023-12-01'),
      lastUsed: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      enabled: false,
      usageCount: 2341,
    },
  ];
}
