import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Slider,
  Divider,
  Tooltip as MuiTooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Tune as TuneIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  Speed as SpeedIcon,
  TrendingUp as TrendingUpIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';

interface PIDParameters {
  kp: number;
  ki: number;
  kd: number;
  setpoint: number;
  minOutput: number;
  maxOutput: number;
  integralWindup: number;
}

interface PIDControllerConfig {
  id: string;
  name: string;
  sensorId: number;
  field: string;
  parameters: PIDParameters;
  relayId?: number;
  updateIntervalSeconds: number;
  enabled: boolean;
}

interface PIDControlResult {
  output: number;
  error: number;
  proportional: number;
  integral: number;
  derivative: number;
  timestamp: string;
}

interface PIDTuningResult {
  recommendedKp: number;
  recommendedKi: number;
  recommendedKd: number;
  oscillationPeriod: number;
  steadyStateError: number;
  settlingTime: number;
  method: string;
}

interface Sensor {
  id: number;
  name: string;
  type: string;
}

interface Relay {
  id: number;
  name: string;
  pin: number;
}

const fieldLabels: Record<string, string> = {
  temperature: 'Temperatur (°C)',
  humidity: 'Luftfeuchtigkeit (%)',
  soilMoisture: 'Bodenfeuchtigkeit (%)',
  vpd: 'VPD (kPa)',
  co2: 'CO2 (ppm)',
  lightIntensity: 'Licht (lux)',
};

export function PIDController() {
  const [controllers, setControllers] = useState<PIDControllerConfig[]>([]);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [relays, setRelays] = useState<Relay[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tuneDialogOpen, setTuneDialogOpen] = useState(false);
  const [editingController, setEditingController] = useState<PIDControllerConfig | null>(null);
  const [tuningResult, setTuningResult] = useState<PIDTuningResult | null>(null);
  const [liveData, setLiveData] = useState<Record<string, PIDControlResult[]>>({});
  const [selectedScenario, setSelectedScenario] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    sensorId: '',
    field: 'temperature',
    relayId: '',
    kp: 2.0,
    ki: 0.5,
    kd: 1.0,
    setpoint: 25.0,
    minOutput: 0,
    maxOutput: 100,
    integralWindup: 100,
    updateIntervalSeconds: 60,
    enabled: false,
  });

  useEffect(() => {
    loadControllers();
    loadSensors();
    loadRelays();

    // Refresh live data every 10 seconds
    const interval = setInterval(() => {
      loadControllers();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const loadControllers = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/pid-controller');
      setControllers(response.data);
    } catch (error) {
      console.error('Error loading controllers:', error);
    }
  };

  const loadSensors = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/sensors');
      setSensors(response.data);
    } catch (error) {
      console.error('Error loading sensors:', error);
    }
  };

  const loadRelays = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/relays');
      setRelays(response.data);
    } catch (error) {
      console.error('Error loading relays:', error);
    }
  };

  const handleOpenDialog = (controller?: PIDControllerConfig) => {
    if (controller) {
      setEditingController(controller);
      setFormData({
        name: controller.name,
        sensorId: controller.sensorId.toString(),
        field: controller.field,
        relayId: controller.relayId?.toString() || '',
        kp: controller.parameters.kp,
        ki: controller.parameters.ki,
        kd: controller.parameters.kd,
        setpoint: controller.parameters.setpoint,
        minOutput: controller.parameters.minOutput,
        maxOutput: controller.parameters.maxOutput,
        integralWindup: controller.parameters.integralWindup,
        updateIntervalSeconds: controller.updateIntervalSeconds,
        enabled: controller.enabled,
      });
    } else {
      setEditingController(null);
      setFormData({
        name: '',
        sensorId: '',
        field: 'temperature',
        relayId: '',
        kp: 2.0,
        ki: 0.5,
        kd: 1.0,
        setpoint: 25.0,
        minOutput: 0,
        maxOutput: 100,
        integralWindup: 100,
        updateIntervalSeconds: 60,
        enabled: false,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingController(null);
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const data = {
        id: editingController?.id || `pid_${Date.now()}`,
        name: formData.name,
        sensorId: parseInt(formData.sensorId),
        field: formData.field,
        relayId: formData.relayId ? parseInt(formData.relayId) : undefined,
        parameters: {
          kp: formData.kp,
          ki: formData.ki,
          kd: formData.kd,
          setpoint: formData.setpoint,
          minOutput: formData.minOutput,
          maxOutput: formData.maxOutput,
          integralWindup: formData.integralWindup,
        },
        updateIntervalSeconds: formData.updateIntervalSeconds,
        enabled: formData.enabled,
      };

      if (editingController) {
        await axios.put(`http://localhost:3001/api/pid-controller/${editingController.id}`, data);
      } else {
        await axios.post('http://localhost:3001/api/pid-controller/create', data);
      }

      handleCloseDialog();
      loadControllers();
    } catch (error) {
      console.error('Error saving controller:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Controller wirklich löschen?')) {
      try {
        await axios.delete(`http://localhost:3001/api/pid-controller/${id}`);
        loadControllers();
      } catch (error) {
        console.error('Error deleting controller:', error);
      }
    }
  };

  const handleStart = async (id: string) => {
    try {
      await axios.post(`http://localhost:3001/api/pid-controller/${id}/start`);
      loadControllers();
    } catch (error) {
      console.error('Error starting controller:', error);
    }
  };

  const handleStop = async (id: string) => {
    try {
      await axios.post(`http://localhost:3001/api/pid-controller/${id}/stop`);
      loadControllers();
    } catch (error) {
      console.error('Error stopping controller:', error);
    }
  };

  const handleAutoTune = async () => {
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:3001/api/pid-controller/auto-tune', {
        sensorId: parseInt(formData.sensorId),
        field: formData.field,
        setpoint: formData.setpoint,
        testDurationMinutes: 30,
      });

      setTuningResult(response.data);

      // Apply tuned parameters
      setFormData({
        ...formData,
        kp: response.data.recommendedKp,
        ki: response.data.recommendedKi,
        kd: response.data.recommendedKd,
      });
    } catch (error) {
      console.error('Error auto-tuning:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadScenario = async () => {
    if (!selectedScenario) return;

    try {
      const response = await axios.get(
        `http://localhost:3001/api/pid-controller/recommended/${selectedScenario}`
      );

      setFormData({
        ...formData,
        kp: response.data.kp,
        ki: response.data.ki,
        kd: response.data.kd,
      });
    } catch (error) {
      console.error('Error loading scenario:', error);
    }
  };

  const getSensorName = (sensorId: number) => {
    const sensor = sensors.find((s) => s.id === sensorId);
    return sensor?.name || `Sensor ${sensorId}`;
  };

  const getRelayName = (relayId?: number) => {
    if (!relayId) return '-';
    const relay = relays.find((r) => r.id === relayId);
    return relay?.name || `Relay ${relayId}`;
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">PID Controller</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Neuer Controller
        </Button>
      </Box>

      {/* Info Box */}
      <Alert severity="info" sx={{ mb: 3 }} icon={<InfoIcon />}>
        <Typography variant="subtitle2" gutterBottom>
          PID-Regler für präzise Umgebungssteuerung
        </Typography>
        <Typography variant="body2">
          Verwenden Sie PID-Controller für automatische Regelung von Temperatur, Feuchtigkeit und
          anderen Parametern. Der Controller passt die Ausgangsleistung kontinuierlich an, um den
          Sollwert zu erreichen und zu halten.
        </Typography>
      </Alert>

      {/* Controllers Grid */}
      <Grid container spacing={3}>
        {controllers.map((controller) => {
          const sensor = sensors.find((s) => s.id === controller.sensorId);
          const relay = relays.find((r) => r.id === controller.relayId);

          return (
            <Grid item xs={12} md={6} key={controller.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6">{controller.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {sensor?.name || `Sensor ${controller.sensorId}`} →{' '}
                        {fieldLabels[controller.field] || controller.field}
                      </Typography>
                    </Box>
                    <Chip
                      label={controller.enabled ? 'Aktiv' : 'Inaktiv'}
                      color={controller.enabled ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>

                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Sollwert
                      </Typography>
                      <Typography variant="h6">{controller.parameters.setpoint}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Update-Intervall
                      </Typography>
                      <Typography variant="h6">{controller.updateIntervalSeconds}s</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="caption" color="text.secondary">
                        Kp
                      </Typography>
                      <Typography variant="body1">{controller.parameters.kp.toFixed(2)}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="caption" color="text.secondary">
                        Ki
                      </Typography>
                      <Typography variant="body1">{controller.parameters.ki.toFixed(2)}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="caption" color="text.secondary">
                        Kd
                      </Typography>
                      <Typography variant="body1">{controller.parameters.kd.toFixed(2)}</Typography>
                    </Grid>
                  </Grid>

                  {relay && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Gesteuert: {relay.name}
                      </Typography>
                    </Box>
                  )}

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {controller.enabled ? (
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<StopIcon />}
                          onClick={() => handleStop(controller.id)}
                        >
                          Stop
                        </Button>
                      ) : (
                        <Button
                          size="small"
                          variant="outlined"
                          color="success"
                          startIcon={<PlayIcon />}
                          onClick={() => handleStart(controller.id)}
                        >
                          Start
                        </Button>
                      )}
                      <IconButton size="small" onClick={() => handleOpenDialog(controller)}>
                        <EditIcon />
                      </IconButton>
                    </Box>
                    <IconButton size="small" color="error" onClick={() => handleDelete(controller.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Empty State */}
      {controllers.length === 0 && (
        <Paper sx={{ p: 5, textAlign: 'center' }}>
          <SpeedIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Keine PID-Controller konfiguriert
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Erstellen Sie einen PID-Controller für automatische Umgebungssteuerung
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
            Ersten Controller erstellen
          </Button>
        </Paper>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingController ? 'Controller bearbeiten' : 'Neuer PID-Controller'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Basic Settings */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom color="primary">
                Basis-Einstellungen
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Sensor</InputLabel>
                <Select
                  value={formData.sensorId}
                  onChange={(e) => setFormData({ ...formData, sensorId: e.target.value })}
                  label="Sensor"
                >
                  {sensors.map((sensor) => (
                    <MenuItem key={sensor.id} value={sensor.id}>
                      {sensor.name} ({sensor.type})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Feld</InputLabel>
                <Select
                  value={formData.field}
                  onChange={(e) => setFormData({ ...formData, field: e.target.value })}
                  label="Feld"
                >
                  {Object.entries(fieldLabels).map(([key, label]) => (
                    <MenuItem key={key} value={key}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Relay (optional)</InputLabel>
                <Select
                  value={formData.relayId}
                  onChange={(e) => setFormData({ ...formData, relayId: e.target.value })}
                  label="Relay (optional)"
                >
                  <MenuItem value="">
                    <em>Kein</em>
                  </MenuItem>
                  {relays.map((relay) => (
                    <MenuItem key={relay.id} value={relay.id}>
                      {relay.name} (Pin {relay.pin})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Update-Intervall (Sekunden)"
                type="number"
                value={formData.updateIntervalSeconds}
                onChange={(e) =>
                  setFormData({ ...formData, updateIntervalSeconds: parseFloat(e.target.value) })
                }
              />
            </Grid>

            {/* PID Parameters */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" color="primary">
                  PID-Parameter
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Preset laden</InputLabel>
                    <Select
                      value={selectedScenario}
                      onChange={(e) => setSelectedScenario(e.target.value)}
                      label="Preset laden"
                    >
                      <MenuItem value="temperature-stable">Temperatur Stabil</MenuItem>
                      <MenuItem value="temperature-fast">Temperatur Schnell</MenuItem>
                      <MenuItem value="humidity-stable">Feuchtigkeit Stabil</MenuItem>
                      <MenuItem value="humidity-fast">Feuchtigkeit Schnell</MenuItem>
                    </Select>
                  </FormControl>
                  <Button size="small" onClick={handleLoadScenario} disabled={!selectedScenario}>
                    Laden
                  </Button>
                  <Button
                    size="small"
                    startIcon={<TuneIcon />}
                    onClick={() => setTuneDialogOpen(true)}
                    disabled={!formData.sensorId}
                  >
                    Auto-Tune
                  </Button>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Kp (Proportional)"
                type="number"
                value={formData.kp}
                onChange={(e) => setFormData({ ...formData, kp: parseFloat(e.target.value) })}
                inputProps={{ step: 0.1 }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Ki (Integral)"
                type="number"
                value={formData.ki}
                onChange={(e) => setFormData({ ...formData, ki: parseFloat(e.target.value) })}
                inputProps={{ step: 0.1 }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Kd (Derivative)"
                type="number"
                value={formData.kd}
                onChange={(e) => setFormData({ ...formData, kd: parseFloat(e.target.value) })}
                inputProps={{ step: 0.1 }}
              />
            </Grid>

            {/* Setpoint and Limits */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="subtitle2" color="primary">
                Sollwert & Grenzen
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Sollwert"
                type="number"
                value={formData.setpoint}
                onChange={(e) => setFormData({ ...formData, setpoint: parseFloat(e.target.value) })}
                inputProps={{ step: 0.1 }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Min Output (%)"
                type="number"
                value={formData.minOutput}
                onChange={(e) => setFormData({ ...formData, minOutput: parseFloat(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Max Output (%)"
                type="number"
                value={formData.maxOutput}
                onChange={(e) => setFormData({ ...formData, maxOutput: parseFloat(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Integral Windup Limit"
                type="number"
                value={formData.integralWindup}
                onChange={(e) =>
                  setFormData({ ...formData, integralWindup: parseFloat(e.target.value) })
                }
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.enabled}
                    onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  />
                }
                label="Automatisch beim Speichern starten"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Abbrechen</Button>
          <Button onClick={handleSave} variant="contained" disabled={loading}>
            Speichern
          </Button>
        </DialogActions>
      </Dialog>

      {/* Auto-Tune Dialog */}
      <Dialog open={tuneDialogOpen} onClose={() => setTuneDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Auto-Tuning</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Auto-Tuning führt einen 30-minütigen Test durch, um optimale PID-Parameter zu ermitteln.
            Während des Tests wird das System aktiv gesteuert.
          </Alert>

          {tuningResult && (
            <Box sx={{ mt: 2 }}>
              <Alert severity="success" sx={{ mb: 2 }}>
                Tuning abgeschlossen mit Methode: {tuningResult.method}
              </Alert>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">
                    Kp
                  </Typography>
                  <Typography variant="h6">{tuningResult.recommendedKp.toFixed(2)}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">
                    Ki
                  </Typography>
                  <Typography variant="h6">{tuningResult.recommendedKi.toFixed(2)}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">
                    Kd
                  </Typography>
                  <Typography variant="h6">{tuningResult.recommendedKd.toFixed(2)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Settling Time
                  </Typography>
                  <Typography variant="body1">{tuningResult.settlingTime.toFixed(1)}s</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Steady State Error
                  </Typography>
                  <Typography variant="body1">{tuningResult.steadyStateError.toFixed(2)}</Typography>
                </Grid>
              </Grid>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Die Parameter wurden automatisch übernommen. Klicken Sie auf "Schließen" und dann auf
                "Speichern" um sie anzuwenden.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTuneDialogOpen(false)}>Schließen</Button>
          <Button onClick={handleAutoTune} variant="contained" disabled={loading || !formData.sensorId}>
            {loading ? 'Tuning läuft...' : 'Auto-Tuning starten'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
