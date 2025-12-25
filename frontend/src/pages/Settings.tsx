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
import { settingsAPI, authAPI, activityAPI, relaysAPI, smsAPI, mqttAPI } from '../services/api';
import { User, Relay, ActivityLog, SMSSettings, SMSStatus, SMSStats, MQTTSettings, MQTTStatus } from '../types';
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

  // SMS Settings
  const [smsSettings, setSmsSettings] = useState<SMSSettings>({
    enabled: false,
    accountSid: '',
    authToken: '',
    fromNumber: '',
    toNumbers: [],
    minIntervalMinutes: 15,
    maxSMSPerDay: 20,
  });
  const [smsStatus, setSmsStatus] = useState<SMSStatus | null>(null);
  const [smsStats, setSmsStats] = useState<SMSStats | null>(null);
  const [phoneNumberInput, setPhoneNumberInput] = useState('');

  // MQTT Settings
  const [mqttSettings, setMqttSettings] = useState<MQTTSettings>({
    enabled: false,
    brokerUrl: 'mqtt://localhost:1883',
    username: '',
    password: '',
    baseTopic: 'grow_monitoring',
    homeAssistantDiscovery: true,
    discoveryPrefix: 'homeassistant',
  });
  const [mqttStatus, setMqttStatus] = useState<MQTTStatus | null>(null);

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
      const [apiKeysRes, activityRes, relaysRes, smsStatusRes, smsStatsRes, mqttStatusRes, mqttSettingsRes] = await Promise.all([
        authAPI.getApiKeys(),
        activityAPI.getAll({ limit: 50 }),
        relaysAPI.getAll(),
        smsAPI.getStatus(),
        smsAPI.getStats(),
        mqttAPI.getStatus(),
        mqttAPI.getSettings(),
      ]);

      setApiKeys(apiKeysRes.data);
      setActivityLogs(activityRes.data);
      setRelays(relaysRes.data);
      setSmsStatus(smsStatusRes.data);
      setSmsStats(smsStatsRes.data);
      setMqttStatus(mqttStatusRes.data);
      setMqttSettings(mqttSettingsRes.data);

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

  async function handleSaveSMSSettings() {
    try {
      await smsAPI.updateSettings(smsSettings);
      alert('SMS Einstellungen gespeichert!');
      loadData();
    } catch (error: any) {
      alert('Fehler: ' + (error.response?.data?.error || error.message));
    }
  }

  async function handleTestSMS() {
    try {
      const res = await smsAPI.sendTest();
      if (res.data.success) {
        alert('✓ ' + res.data.message);
      } else {
        alert('✗ ' + res.data.message);
      }
      loadData();
    } catch (error: any) {
      alert('Fehler: ' + (error.response?.data?.error || error.message));
    }
  }

  function handleAddPhoneNumber() {
    if (phoneNumberInput.trim()) {
      setSmsSettings({
        ...smsSettings,
        toNumbers: [...smsSettings.toNumbers, phoneNumberInput.trim()],
      });
      setPhoneNumberInput('');
    }
  }

  function handleRemovePhoneNumber(index: number) {
    setSmsSettings({
      ...smsSettings,
      toNumbers: smsSettings.toNumbers.filter((_, i) => i !== index),
    });
  }

  async function handleSaveMQTTSettings() {
    try {
      await mqttAPI.updateSettings(mqttSettings);
      alert('MQTT Einstellungen gespeichert!');
      loadData();
    } catch (error: any) {
      alert('Fehler: ' + (error.response?.data?.error || error.message));
    }
  }

  async function handleTestMQTT() {
    try {
      const res = await mqttAPI.testConnection();
      if (res.data.success) {
        alert('✓ ' + res.data.message);
      } else {
        alert('✗ ' + res.data.message);
      }
      loadData();
    } catch (error: any) {
      alert('Fehler: ' + (error.response?.data?.error || error.message));
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
          <Tab label="SMS / Benachrichtigungen" />
          <Tab label="Smart Home / MQTT" />
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

        {/* SMS / Notifications Tab */}
        <TabPanel value={tab} index={3}>
          <Grid container spacing={3}>
            {/* Status Card */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    SMS Status
                  </Typography>
                  {smsStatus && (
                    <>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Typography variant="body2">Service:</Typography>
                        <Chip
                          label={smsStatus.enabled ? 'Aktiviert' : 'Deaktiviert'}
                          color={smsStatus.enabled ? 'success' : 'default'}
                          size="small"
                        />
                      </Box>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Typography variant="body2">Konfiguration:</Typography>
                        <Chip
                          label={smsStatus.configured ? 'Vollständig' : 'Unvollständig'}
                          color={smsStatus.configured ? 'success' : 'warning'}
                          size="small"
                        />
                      </Box>
                      <Typography variant="body2">Empfänger: {smsStatus.recipientCount}</Typography>
                      <Typography variant="body2">
                        SMS heute: {smsStatus.dailySMSCount} / {smsStatus.maxSMSPerDay}
                      </Typography>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Statistics Card */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Statistiken (Heute)
                  </Typography>
                  {smsStats && (
                    <>
                      <Typography variant="body2">Gesendet: {smsStats.dailySMSCount}</Typography>
                      <Typography variant="body2">Kosten: ${smsStats.totalCostToday.toFixed(4)}</Typography>
                      <Typography variant="body2">Erfolgsrate: {smsStats.successRate}%</Typography>
                    </>
                  )}
                  <Button variant="outlined" onClick={handleTestSMS} sx={{ mt: 2 }} fullWidth>
                    Test-SMS senden
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Configuration Card */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Twilio Konfiguration
                  </Typography>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={smsSettings.enabled}
                        onChange={(e) => setSmsSettings({ ...smsSettings, enabled: e.target.checked })}
                      />
                    }
                    label="SMS Service aktivieren"
                  />

                  <Grid container spacing={2} sx={{ mt: 2 }}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Twilio Account SID"
                        value={smsSettings.accountSid}
                        onChange={(e) => setSmsSettings({ ...smsSettings, accountSid: e.target.value })}
                        placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        type="password"
                        label="Twilio Auth Token"
                        value={smsSettings.authToken}
                        onChange={(e) => setSmsSettings({ ...smsSettings, authToken: e.target.value })}
                        placeholder="********************************"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Von Nummer"
                        value={smsSettings.fromNumber}
                        onChange={(e) => setSmsSettings({ ...smsSettings, fromNumber: e.target.value })}
                        placeholder="+491234567890"
                        helperText="Twilio Telefonnummer im Format +491234567890"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Min. Intervall (Minuten)"
                        value={smsSettings.minIntervalMinutes}
                        onChange={(e) => setSmsSettings({ ...smsSettings, minIntervalMinutes: parseInt(e.target.value) })}
                        helperText="Mindestabstand zwischen SMS"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Max. SMS pro Tag"
                        value={smsSettings.maxSMSPerDay}
                        onChange={(e) => setSmsSettings({ ...smsSettings, maxSMSPerDay: parseInt(e.target.value) })}
                        helperText="Tägliches SMS-Limit (Kostenkontrolle)"
                      />
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 3 }} />

                  <Typography variant="h6" gutterBottom>
                    Empfänger-Nummern
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={10}>
                      <TextField
                        fullWidth
                        label="Telefonnummer hinzufügen"
                        value={phoneNumberInput}
                        onChange={(e) => setPhoneNumberInput(e.target.value)}
                        placeholder="+491234567890"
                        helperText="Format: +491234567890"
                      />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <Button fullWidth variant="outlined" onClick={handleAddPhoneNumber} sx={{ height: '56px' }}>
                        Hinzufügen
                      </Button>
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 2 }}>
                    {smsSettings.toNumbers.map((number, index) => (
                      <Chip
                        key={index}
                        label={number}
                        onDelete={() => handleRemovePhoneNumber(index)}
                        sx={{ m: 0.5 }}
                      />
                    ))}
                  </Box>

                  <Button variant="contained" onClick={handleSaveSMSSettings} sx={{ mt: 3 }}>
                    Einstellungen speichern
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Smart Home / MQTT Tab */}
        <TabPanel value={tab} index={4}>
          <Grid container spacing={3}>
            {/* Status Card */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    MQTT / Smart Home Status
                  </Typography>
                  {mqttStatus && (
                    <>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Typography variant="body2">Service:</Typography>
                        <Chip
                          label={mqttStatus.enabled ? 'Aktiviert' : 'Deaktiviert'}
                          color={mqttStatus.enabled ? 'success' : 'default'}
                          size="small"
                        />
                      </Box>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Typography variant="body2">Verbindung:</Typography>
                        <Chip
                          label={mqttStatus.connected ? 'Verbunden' : 'Getrennt'}
                          color={mqttStatus.connected ? 'success' : 'error'}
                          size="small"
                        />
                      </Box>
                      <Typography variant="body2">Broker: {mqttStatus.brokerUrl}</Typography>
                      <Typography variant="body2">Veröffentlichte Entities: {mqttStatus.publishedEntities}</Typography>
                      <Typography variant="body2">
                        Home Assistant Discovery: {mqttStatus.homeAssistantDiscovery ? 'Aktiviert' : 'Deaktiviert'}
                      </Typography>
                    </>
                  )}
                  <Button variant="outlined" onClick={handleTestMQTT} sx={{ mt: 2 }} fullWidth>
                    Verbindung testen
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Info Card */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Smart Home Integration
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Integrieren Sie Ihr Grow-Monitoring in Ihr Smart Home System über MQTT.
                  </Typography>
                  <Typography variant="body2" fontWeight="bold" gutterBottom>
                    Unterstützte Systeme:
                  </Typography>
                  <Typography variant="body2">• Home Assistant (Auto-Discovery)</Typography>
                  <Typography variant="body2">• openHAB</Typography>
                  <Typography variant="body2">• Node-RED</Typography>
                  <Typography variant="body2">• ioBroker</Typography>
                  <Typography variant="body2">• Alle MQTT-kompatiblen Systeme</Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Configuration Card */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    MQTT Broker Konfiguration
                  </Typography>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={mqttSettings.enabled}
                        onChange={(e) => setMqttSettings({ ...mqttSettings, enabled: e.target.checked })}
                      />
                    }
                    label="MQTT Service aktivieren"
                  />

                  <Grid container spacing={2} sx={{ mt: 2 }}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Broker URL"
                        value={mqttSettings.brokerUrl}
                        onChange={(e) => setMqttSettings({ ...mqttSettings, brokerUrl: e.target.value })}
                        placeholder="mqtt://localhost:1883"
                        helperText="Format: mqtt://host:port oder mqtts://host:port für SSL"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Base Topic"
                        value={mqttSettings.baseTopic}
                        onChange={(e) => setMqttSettings({ ...mqttSettings, baseTopic: e.target.value })}
                        placeholder="grow_monitoring"
                        helperText="Basis-Topic für alle MQTT Nachrichten"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Username (Optional)"
                        value={mqttSettings.username}
                        onChange={(e) => setMqttSettings({ ...mqttSettings, username: e.target.value })}
                        placeholder="mqtt_user"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        type="password"
                        label="Password (Optional)"
                        value={mqttSettings.password}
                        onChange={(e) => setMqttSettings({ ...mqttSettings, password: e.target.value })}
                        placeholder="**********"
                      />
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 3 }} />

                  <Typography variant="h6" gutterBottom>
                    Home Assistant Integration
                  </Typography>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={mqttSettings.homeAssistantDiscovery}
                        onChange={(e) =>
                          setMqttSettings({ ...mqttSettings, homeAssistantDiscovery: e.target.checked })
                        }
                      />
                    }
                    label="Home Assistant Discovery aktivieren"
                  />

                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Discovery Prefix"
                        value={mqttSettings.discoveryPrefix}
                        onChange={(e) => setMqttSettings({ ...mqttSettings, discoveryPrefix: e.target.value })}
                        placeholder="homeassistant"
                        helperText="Standard: homeassistant"
                        disabled={!mqttSettings.homeAssistantDiscovery}
                      />
                    </Grid>
                  </Grid>

                  <Button variant="contained" onClick={handleSaveMQTTSettings} sx={{ mt: 3 }}>
                    Einstellungen speichern
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Users Tab (Admin only) */}
        {user?.role === 'admin' && (
          <TabPanel value={tab} index={5}>
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
        <TabPanel value={tab} index={user?.role === 'admin' ? 6 : 5}>
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
        <TabPanel value={tab} index={user?.role === 'admin' ? 7 : 6}>
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
          <TabPanel value={tab} index={user?.role === 'admin' ? 8 : 7}>
            <DeveloperTools />
          </TabPanel>
        )}
      </Paper>
    </Box>
  );
}
