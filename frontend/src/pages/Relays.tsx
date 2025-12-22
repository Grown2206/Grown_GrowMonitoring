import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Chip,
  Paper,
  Tooltip,
  alpha,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  WbIncandescent as LightIcon,
  Air as FanIcon,
  WaterDrop as PumpIcon,
  Whatshot as HeaterIcon,
  Opacity as HumidifierIcon,
  MoreHoriz as OtherIcon,
  PowerSettingsNew as PowerIcon,
} from '@mui/icons-material';
import { relaysAPI } from '../services/api';
import { Relay } from '../types';
import { useToast } from '../contexts/ToastContext';

const relayTypeIcons: Record<string, React.ReactNode> = {
  light: <LightIcon />,
  fan: <FanIcon />,
  pump: <PumpIcon />,
  heater: <HeaterIcon />,
  humidifier: <HumidifierIcon />,
  other: <OtherIcon />,
};

const relayTypeColors: Record<string, string> = {
  light: '#FFD700',
  fan: '#87CEEB',
  pump: '#4682B4',
  heater: '#FF6347',
  humidifier: '#48D1CC',
  other: '#9370DB',
};

export function Relays() {
  const [relays, setRelays] = useState<Relay[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRelay, setEditingRelay] = useState<Relay | null>(null);
  const [formData, setFormData] = useState({
    relayId: 1,
    name: '',
    type: 'light' as Relay['type'],
  });
  const { success, error: showError } = useToast();

  useEffect(() => {
    loadRelays();
  }, []);

  async function loadRelays() {
    try {
      const res = await relaysAPI.getAll();
      setRelays(res.data);
    } catch (err) {
      showError('Fehler beim Laden der Relays');
    }
  }

  async function handleToggle(relay: Relay) {
    try {
      await relaysAPI.control(relay.id, !relay.status);
      success(`Relay ${relay.name} ${!relay.status ? 'aktiviert' : 'deaktiviert'}`);
      loadRelays();
    } catch (err) {
      showError('Fehler beim Steuern des Relays');
    }
  }

  async function handleSave() {
    try {
      if (editingRelay) {
        await relaysAPI.update(editingRelay.id, formData);
        success('Relay aktualisiert');
      } else {
        await relaysAPI.create(formData);
        success('Relay erstellt');
      }
      setDialogOpen(false);
      setEditingRelay(null);
      setFormData({ relayId: 1, name: '', type: 'light' });
      loadRelays();
    } catch (err) {
      showError('Fehler beim Speichern');
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Relay wirklich löschen?')) return;

    try {
      await relaysAPI.delete(id);
      success('Relay gelöscht');
      loadRelays();
    } catch (err) {
      showError('Fehler beim Löschen');
    }
  }

  function openEditDialog(relay?: Relay) {
    if (relay) {
      setEditingRelay(relay);
      setFormData({
        relayId: relay.relayId,
        name: relay.name,
        type: relay.type,
      });
    } else {
      setEditingRelay(null);
      setFormData({ relayId: 1, name: '', type: 'light' });
    }
    setDialogOpen(true);
  }

  const groupedRelays = relays.reduce((acc, relay) => {
    if (!acc[relay.type]) acc[relay.type] = [];
    acc[relay.type].push(relay);
    return acc;
  }, {} as Record<string, Relay[]>);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Relays & Geräte</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => openEditDialog()}>
          Relay hinzufügen
        </Button>
      </Box>

      {/* Stats Overview */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={6} sm={4} md={2}>
          <Card sx={{ bgcolor: alpha('#4CAF50', 0.1) }}>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                Gesamt
              </Typography>
              <Typography variant="h4">{relays.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Card sx={{ bgcolor: alpha('#2196F3', 0.1) }}>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                Aktiv
              </Typography>
              <Typography variant="h4">{relays.filter((r) => r.status).length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        {Object.keys(groupedRelays).map((type) => (
          <Grid item xs={6} sm={4} md={2} key={type}>
            <Card sx={{ bgcolor: alpha(relayTypeColors[type], 0.1) }}>
              <CardContent>
                <Typography color="text.secondary" variant="body2">
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Typography>
                <Typography variant="h4">{groupedRelays[type].length}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Relays by Type */}
      {Object.entries(groupedRelays).map(([type, typeRelays]) => (
        <Box key={type} mb={4}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {relayTypeIcons[type]}
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Typography>
          <Grid container spacing={2}>
            {typeRelays.map((relay) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={relay.id}>
                <Card
                  sx={{
                    position: 'relative',
                    overflow: 'visible',
                    transition: 'all 0.3s ease',
                    border: relay.status ? `2px solid ${relayTypeColors[relay.type]}` : '1px solid',
                    borderColor: relay.status ? relayTypeColors[relay.type] : 'divider',
                    boxShadow: relay.status ? `0 0 20px ${alpha(relayTypeColors[relay.type], 0.3)}` : 1,
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Box sx={{ color: relayTypeColors[relay.type], fontSize: 40 }}>{relayTypeIcons[relay.type]}</Box>
                      <Box>
                        <Tooltip title="Bearbeiten">
                          <IconButton size="small" onClick={() => openEditDialog(relay)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Löschen">
                          <IconButton size="small" onClick={() => handleDelete(relay.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>

                    <Typography variant="h6" gutterBottom>
                      {relay.name}
                    </Typography>

                    <Box display="flex" gap={1} mb={2}>
                      <Chip label={`ID: ${relay.relayId}`} size="small" variant="outlined" />
                      <Chip
                        label={relay.status ? 'AN' : 'AUS'}
                        size="small"
                        color={relay.status ? 'success' : 'default'}
                        sx={{
                          fontWeight: 'bold',
                          bgcolor: relay.status ? alpha('#4CAF50', 0.2) : undefined,
                        }}
                      />
                    </Box>

                    {relay.lastChanged && (
                      <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                        Zuletzt: {new Date(relay.lastChanged).toLocaleString()}
                      </Typography>
                    )}

                    <Button
                      fullWidth
                      variant={relay.status ? 'outlined' : 'contained'}
                      color={relay.status ? 'error' : 'primary'}
                      startIcon={<PowerIcon />}
                      onClick={() => handleToggle(relay)}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 'bold',
                      }}
                    >
                      {relay.status ? 'Ausschalten' : 'Einschalten'}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}

      {relays.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Keine Relays konfiguriert
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Fügen Sie Ihr erstes Relay hinzu, um Geräte zu steuern
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => openEditDialog()}>
            Relay hinzufügen
          </Button>
        </Paper>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingRelay ? 'Relay bearbeiten' : 'Neues Relay'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            type="number"
            label="Relay ID (Hardware)"
            value={formData.relayId}
            onChange={(e) => setFormData({ ...formData, relayId: parseInt(e.target.value) })}
            margin="normal"
          />
          <TextField
            fullWidth
            select
            label="Typ"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as Relay['type'] })}
            margin="normal"
          >
            <MenuItem value="light">Licht</MenuItem>
            <MenuItem value="fan">Lüfter</MenuItem>
            <MenuItem value="pump">Pumpe</MenuItem>
            <MenuItem value="heater">Heizung</MenuItem>
            <MenuItem value="humidifier">Luftbefeuchter</MenuItem>
            <MenuItem value="other">Sonstige</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Abbrechen</Button>
          <Button onClick={handleSave} variant="contained" disabled={!formData.name}>
            Speichern
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
