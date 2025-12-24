import React, { useState, useEffect } from 'react';
import {
  Box,
  Tab,
  Tabs,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Divider,
} from '@mui/material';
import { settingsAPI, authAPI, activityAPI, relaysAPI } from '../services/api';
import { User, Relay, ActivityLog } from '../types';
import { useAuth } from '../contexts/AuthContext';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import { exportAPI } from '../services/api';
import { DeveloperTools } from '../components/DeveloperTools';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export function Settings() {
  const [tab, setTab] = useState(0);
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [relays, setRelays] = useState<Relay[]>([]);

  // Check if dev mode is enabled
  const isDevMode = process.env.NODE_ENV === 'development' || process.env.REACT_APP_ENABLE_DEV_TOOLS === 'true';

  // Password change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // New API Key
  const [newApiKey, setNewApiKey] = useState({ name: '', description: '' });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [apiKeysRes, activityRes, relaysRes] = await Promise.all([
        authAPI.getApiKeys(),
        activityAPI.getAll({ limit: 50 }),
        relaysAPI.getAll(),
      ]);

      setApiKeys(apiKeysRes.data);
      setActivityLogs(activityRes.data);
      setRelays(relaysRes.data);

      // Load users if admin
      if (user?.role === 'admin') {
        const usersRes = await settingsAPI.getAllUsers();
        setUsers(usersRes.data);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  async function handlePasswordChange() {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Passwörter stimmen nicht überein!');
      return;
    }

    try {
      await authAPI.changePassword(passwordData.currentPassword, passwordData.newPassword);
      alert('Passwort erfolgreich geändert!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      alert('Fehler: ' + (error.response?.data?.error || error.message));
    }
  }

  async function handleCreateApiKey() {
    try {
      await authAPI.createApiKey(newApiKey.name, newApiKey.description);
      setNewApiKey({ name: '', description: '' });
      loadData();
    } catch (error) {
      alert('Fehler beim Erstellen des API-Keys');
    }
  }

  async function handleToggleApiKey(id: number, isActive: boolean) {
    try {
      await authAPI.updateApiKey(id, !isActive);
      loadData();
    } catch (error) {
      console.error('Failed to toggle API key:', error);
    }
  }

  async function handleDeleteApiKey(id: number) {
    if (window.confirm('API-Key wirklich löschen?')) {
      try {
        await authAPI.deleteApiKey(id);
        loadData();
      } catch (error) {
        console.error('Failed to delete API key:', error);
      }
    }
  }

  async function handleToggleUser(userId: number, isActive: boolean) {
    try {
      await settingsAPI.updateUser(userId, { isActive: !isActive });
      loadData();
    } catch (error) {
      console.error('Failed to toggle user:', error);
    }
  }

  async function handleExportBackup() {
    try {
      const res = await exportAPI.fullBackup();
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `grow-backup-${new Date().toISOString()}.json`;
      a.click();
    } catch (error) {
      alert('Fehler beim Export');
    }
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Einstellungen
      </Typography>

      <Paper sx={{ width: '100%' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Profil" />
          <Tab label="API-Keys" />
          <Tab label="Hardware" />
          {user?.role === 'admin' && <Tab label="Benutzer" />}
          <Tab label="Aktivität" />
          <Tab label="Backup" />
          {isDevMode && <Tab label="Developer Tools" />}
        </Tabs>

        {/* Profile Tab */}
        <TabPanel value={tab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Profil-Informationen
                  </Typography>
                  <TextField fullWidth label="Benutzername" value={user?.username} disabled margin="normal" />
                  <TextField fullWidth label="E-Mail" value={user?.email} disabled margin="normal" />
                  <TextField fullWidth label="Rolle" value={user?.role} disabled margin="normal" />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Passwort ändern
                  </Typography>
                  <TextField
                    fullWidth
                    type="password"
                    label="Aktuelles Passwort"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    type="password"
                    label="Neues Passwort"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    type="password"
                    label="Passwort bestätigen"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    margin="normal"
                  />
                  <Button variant="contained" onClick={handlePasswordChange} sx={{ mt: 2 }}>
                    Passwort ändern
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* API Keys Tab */}
        <TabPanel value={tab} index={1}>
          <Box mb={3}>
            <Typography variant="h6" gutterBottom>
              Neuen API-Key erstellen
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Name" value={newApiKey.name} onChange={(e) => setNewApiKey({ ...newApiKey, name: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Beschreibung"
                  value={newApiKey.description}
                  onChange={(e) => setNewApiKey({ ...newApiKey, description: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <Button fullWidth variant="contained" onClick={handleCreateApiKey} sx={{ height: '56px' }}>
                  Erstellen
                </Button>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 3 }} />

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Key</TableCell>
                  <TableCell>Beschreibung</TableCell>
                  <TableCell>Zuletzt verwendet</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {apiKeys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell>{key.name}</TableCell>
                    <TableCell>
                      <code>{key.key.substring(0, 20)}...</code>
                    </TableCell>
                    <TableCell>{key.description || '-'}</TableCell>
                    <TableCell>{key.lastUsed ? new Date(key.lastUsed).toLocaleString() : 'Nie'}</TableCell>
                    <TableCell>
                      <Switch checked={key.isActive} onChange={() => handleToggleApiKey(key.id, key.isActive)} />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleDeleteApiKey(key.id)} size="small">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Hardware Tab */}
        <TabPanel value={tab} index={2}>
          <Typography variant="h6" gutterBottom>
            Relais-Konfiguration
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Typ</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Zuletzt geändert</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {relays.map((relay) => (
                  <TableRow key={relay.id}>
                    <TableCell>{relay.relayId}</TableCell>
                    <TableCell>{relay.name}</TableCell>
                    <TableCell>{relay.type}</TableCell>
                    <TableCell>
                      <Chip label={relay.status ? 'EIN' : 'AUS'} color={relay.status ? 'success' : 'default'} size="small" />
                    </TableCell>
                    <TableCell>{relay.lastChanged ? new Date(relay.lastChanged).toLocaleString() : '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Users Tab (Admin only) */}
        {user?.role === 'admin' && (
          <TabPanel value={tab} index={3}>
            <Typography variant="h6" gutterBottom>
              Benutzerverwaltung
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Benutzername</TableCell>
                    <TableCell>E-Mail</TableCell>
                    <TableCell>Rolle</TableCell>
                    <TableCell>Erstellt</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>{u.id}</TableCell>
                      <TableCell>{u.username}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        <Chip label={u.role} color={u.role === 'admin' ? 'primary' : 'default'} size="small" />
                      </TableCell>
                      <TableCell>{new Date(u.createdAt || '').toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Switch checked={u.isActive} onChange={() => handleToggleUser(u.id, u.isActive)} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
        )}

        {/* Activity Tab */}
        <TabPanel value={tab} index={user?.role === 'admin' ? 4 : 3}>
          <Typography variant="h6" gutterBottom>
            Aktivitäts-Log
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Zeit</TableCell>
                  <TableCell>Benutzer</TableCell>
                  <TableCell>Aktion</TableCell>
                  <TableCell>Entity</TableCell>
                  <TableCell>Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {activityLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                    <TableCell>{log.user?.username || 'System'}</TableCell>
                    <TableCell>{log.action}</TableCell>
                    <TableCell>{log.entity}</TableCell>
                    <TableCell>{log.details || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Backup Tab */}
        <TabPanel value={tab} index={user?.role === 'admin' ? 5 : 4}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Datenbank-Backup
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Exportieren Sie alle Ihre Daten als JSON-Backup-Datei.
                  </Typography>
                  <Button variant="contained" startIcon={<DownloadIcon />} onClick={handleExportBackup}>
                    Backup herunterladen
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    System-Informationen
                  </Typography>
                  <Typography variant="body2">Version: 1.1.0</Typography>
                  <Typography variant="body2">Aktive Benutzer: {users.filter((u) => u.isActive).length}</Typography>
                  <Typography variant="body2">API-Keys: {apiKeys.length}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Developer Tools Tab */}
        {isDevMode && (
          <TabPanel value={tab} index={user?.role === 'admin' ? 6 : 5}>
            <DeveloperTools />
          </TabPanel>
        )}
      </Paper>
    </Box>
  );
}
