import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Divider,
  alpha,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Memory as ChipIcon,
  Sensors as SensorIcon,
  PowerSettingsNew as RelayIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { sensorsManagementAPI, relaysAPI } from '../services/api';
import { SensorManagement, Relay } from '../types';
import { useToast } from '../contexts/ToastContext';

interface GPIOPin {
  pin: number;
  type: 'input' | 'output' | 'pwm' | 'analog';
  assignment?: {
    type: 'sensor' | 'relay';
    id: number;
    name: string;
  };
  available: boolean;
}

// ESP32 DevKit V1 GPIO Pins
const ESP32_PINS: GPIOPin[] = [
  // ADC1 Channels (Analog Input)
  { pin: 36, type: 'analog', available: true }, // VP/A0
  { pin: 39, type: 'analog', available: true }, // VN/A3
  { pin: 34, type: 'analog', available: true }, // A6
  { pin: 35, type: 'analog', available: true }, // A7
  { pin: 32, type: 'analog', available: true }, // A4
  { pin: 33, type: 'analog', available: true }, // A5

  // Digital GPIO
  { pin: 4, type: 'output', available: true },
  { pin: 5, type: 'output', available: true },
  { pin: 12, type: 'output', available: true },
  { pin: 13, type: 'output', available: true },
  { pin: 14, type: 'output', available: true },
  { pin: 15, type: 'output', available: true },
  { pin: 16, type: 'output', available: true },
  { pin: 17, type: 'output', available: true },
  { pin: 18, type: 'output', available: true },
  { pin: 19, type: 'output', available: true },
  { pin: 21, type: 'output', available: true },
  { pin: 22, type: 'output', available: true },
  { pin: 23, type: 'output', available: true },
  { pin: 25, type: 'output', available: true },
  { pin: 26, type: 'output', available: true },
  { pin: 27, type: 'output', available: true },
];

export function GPIOManager() {
  const [pins, setPins] = useState<GPIOPin[]>(ESP32_PINS);
  const [sensors, setSensors] = useState<SensorManagement[]>([]);
  const [relays, setRelays] = useState<Relay[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPin, setSelectedPin] = useState<number | null>(null);
  const [assignmentType, setAssignmentType] = useState<'sensor' | 'relay'>('sensor');
  const [assignmentId, setAssignmentId] = useState<number | ''>('');
  const { success, error: showError } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [sensorsRes, relaysRes] = await Promise.all([
        sensorsManagementAPI.getAll(),
        relaysAPI.getAll(),
      ]);
      setSensors(sensorsRes.data);
      setRelays(relaysRes.data);

      // Load GPIO assignments from localStorage (in real app, from backend)
      const savedAssignments = localStorage.getItem('gpio_assignments');
      if (savedAssignments) {
        const assignments = JSON.parse(savedAssignments);
        setPins((prev) =>
          prev.map((pin) => {
            const assignment = assignments[pin.pin];
            return assignment ? { ...pin, assignment, available: false } : pin;
          })
        );
      }
    } catch (err) {
      showError('Fehler beim Laden der GPIO-Daten');
    }
  }

  function openAssignDialog(pin: number) {
    setSelectedPin(pin);
    const pinData = pins.find((p) => p.pin === pin);
    if (pinData?.assignment) {
      setAssignmentType(pinData.assignment.type);
      setAssignmentId(pinData.assignment.id);
    } else {
      setAssignmentType('sensor');
      setAssignmentId('');
    }
    setDialogOpen(true);
  }

  function handleAssign() {
    if (selectedPin === null || !assignmentId) return;

    const item =
      assignmentType === 'sensor'
        ? sensors.find((s) => s.id === assignmentId)
        : relays.find((r) => r.id === assignmentId);

    if (!item) return;

    const assignment = {
      type: assignmentType,
      id: assignmentId as number,
      name: item.name,
    };

    setPins((prev) =>
      prev.map((pin) => {
        // Clear previous assignment of this item
        if (pin.assignment?.type === assignmentType && pin.assignment.id === assignmentId) {
          return { ...pin, assignment: undefined, available: true };
        }
        // Assign to selected pin
        if (pin.pin === selectedPin) {
          return { ...pin, assignment, available: false };
        }
        return pin;
      })
    );

    // Save to localStorage (in real app, save to backend)
    const assignments: Record<number, typeof assignment> = {};
    pins.forEach((pin) => {
      if (pin.assignment) assignments[pin.pin] = pin.assignment;
    });
    assignments[selectedPin] = assignment;
    localStorage.setItem('gpio_assignments', JSON.stringify(assignments));

    success(`GPIO ${selectedPin} zugewiesen zu ${item.name}`);
    setDialogOpen(false);
    setSelectedPin(null);
    setAssignmentId('');
  }

  function handleUnassign(pin: number) {
    setPins((prev) =>
      prev.map((p) => (p.pin === pin ? { ...p, assignment: undefined, available: true } : p))
    );

    // Update localStorage
    const savedAssignments = localStorage.getItem('gpio_assignments');
    if (savedAssignments) {
      const assignments = JSON.parse(savedAssignments);
      delete assignments[pin];
      localStorage.setItem('gpio_assignments', JSON.stringify(assignments));
    }

    success(`GPIO ${pin} freigegeben`);
  }

  const getPinColor = (pin: GPIOPin) => {
    if (pin.assignment) return '#4caf50';
    if (pin.type === 'analog') return '#2196f3';
    if (pin.type === 'output') return '#ff9800';
    return '#9e9e9e';
  };

  const getPinLabel = (pin: GPIOPin) => {
    if (pin.type === 'analog') return 'ADC';
    if (pin.type === 'output') return 'OUT';
    if (pin.type === 'input') return 'IN';
    return pin.type.toUpperCase();
  };

  const assignedSensors = sensors.filter((s) =>
    pins.some((p) => p.assignment?.type === 'sensor' && p.assignment.id === s.id)
  );
  const unassignedSensors = sensors.filter(
    (s) => !pins.some((p) => p.assignment?.type === 'sensor' && p.assignment.id === s.id)
  );
  const assignedRelays = relays.filter((r) =>
    pins.some((p) => p.assignment?.type === 'relay' && p.assignment.id === r.id)
  );
  const unassignedRelays = relays.filter(
    (r) => !pins.some((p) => p.assignment?.type === 'relay' && p.assignment.id === r.id)
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        GPIO Pin Manager
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        ESP32 DevKit V1 - Verwalten Sie die Zuordnung von GPIO-Pins zu Sensoren und Relays
      </Typography>

      {/* Stats */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={6} sm={3}>
          <Card sx={{ bgcolor: alpha('#4CAF50', 0.1) }}>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                Zugewiesene Pins
              </Typography>
              <Typography variant="h4">{pins.filter((p) => p.assignment).length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card sx={{ bgcolor: alpha('#2196F3', 0.1) }}>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                Verfügbare Pins
              </Typography>
              <Typography variant="h4">{pins.filter((p) => p.available).length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card sx={{ bgcolor: alpha('#FF9800', 0.1) }}>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                Analog Pins
              </Typography>
              <Typography variant="h4">{pins.filter((p) => p.type === 'analog').length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card sx={{ bgcolor: alpha('#9C27B0', 0.1) }}>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                Digital Pins
              </Typography>
              <Typography variant="h4">{pins.filter((p) => p.type === 'output').length}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Warnings */}
      {unassignedSensors.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }} icon={<WarningIcon />}>
          {unassignedSensors.length} Sensor(en) ohne GPIO-Zuordnung
        </Alert>
      )}
      {unassignedRelays.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }} icon={<WarningIcon />}>
          {unassignedRelays.length} Relay(s) ohne GPIO-Zuordnung
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* GPIO Pin Map */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              <ChipIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
              ESP32 GPIO Pinbelegung
            </Typography>
            <Grid container spacing={1} mt={1}>
              {pins.map((pin) => (
                <Grid item xs={6} sm={4} md={3} key={pin.pin}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      border: '2px solid',
                      borderColor: pin.assignment ? getPinColor(pin) : 'divider',
                      bgcolor: pin.assignment ? alpha(getPinColor(pin), 0.1) : 'background.paper',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 3,
                      },
                    }}
                    onClick={() => openAssignDialog(pin.pin)}
                  >
                    <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                        <Typography variant="h6" fontWeight="bold">
                          GPIO {pin.pin}
                        </Typography>
                        <Chip label={getPinLabel(pin)} size="small" sx={{ fontSize: 9 }} />
                      </Box>

                      {pin.assignment ? (
                        <Box>
                          <Chip
                            icon={pin.assignment.type === 'sensor' ? <SensorIcon /> : <RelayIcon />}
                            label={pin.assignment.name}
                            size="small"
                            color="success"
                            variant="outlined"
                            sx={{ fontSize: 10, height: 20, mt: 0.5 }}
                          />
                          <Typography variant="caption" display="block" color="text.secondary" mt={0.5}>
                            {pin.assignment.type === 'sensor' ? 'Sensor' : 'Relay'}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          Nicht zugewiesen
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Assignment Overview */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              <SensorIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
              Sensoren ({assignedSensors.length}/{sensors.length})
            </Typography>
            <Divider sx={{ my: 1 }} />
            {assignedSensors.map((sensor) => {
              const pin = pins.find((p) => p.assignment?.type === 'sensor' && p.assignment.id === sensor.id);
              return (
                <Box key={sensor.id} display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Box>
                    <Typography variant="body2">{sensor.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {pin && `GPIO ${pin.pin}`}
                    </Typography>
                  </Box>
                  <Chip icon={<CheckIcon />} label="Zugewiesen" size="small" color="success" />
                </Box>
              );
            })}
            {unassignedSensors.map((sensor) => (
              <Box key={sensor.id} display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2" color="text.secondary">
                  {sensor.name}
                </Typography>
                <Chip label="Offen" size="small" variant="outlined" />
              </Box>
            ))}
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              <RelayIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
              Relays ({assignedRelays.length}/{relays.length})
            </Typography>
            <Divider sx={{ my: 1 }} />
            {assignedRelays.map((relay) => {
              const pin = pins.find((p) => p.assignment?.type === 'relay' && p.assignment.id === relay.id);
              return (
                <Box key={relay.id} display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Box>
                    <Typography variant="body2">{relay.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {pin && `GPIO ${pin.pin}`}
                    </Typography>
                  </Box>
                  <Chip icon={<CheckIcon />} label="Zugewiesen" size="small" color="success" />
                </Box>
              );
            })}
            {unassignedRelays.map((relay) => (
              <Box key={relay.id} display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2" color="text.secondary">
                  {relay.name}
                </Typography>
                <Chip label="Offen" size="small" variant="outlined" />
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>

      {/* Assignment Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>GPIO {selectedPin} zuweisen</DialogTitle>
        <DialogContent>
          {selectedPin && pins.find((p) => p.pin === selectedPin)?.assignment && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Aktuell zugewiesen zu: {pins.find((p) => p.pin === selectedPin)?.assignment?.name}
            </Alert>
          )}

          <TextField
            fullWidth
            select
            label="Typ"
            value={assignmentType}
            onChange={(e) => {
              setAssignmentType(e.target.value as 'sensor' | 'relay');
              setAssignmentId('');
            }}
            margin="normal"
          >
            <MenuItem value="sensor">Sensor</MenuItem>
            <MenuItem value="relay">Relay</MenuItem>
          </TextField>

          {assignmentType === 'sensor' ? (
            <TextField
              fullWidth
              select
              label="Sensor auswählen"
              value={assignmentId}
              onChange={(e) => setAssignmentId(parseInt(e.target.value))}
              margin="normal"
            >
              {sensors.map((sensor) => (
                <MenuItem key={sensor.id} value={sensor.id}>
                  {sensor.name} ({sensor.type})
                </MenuItem>
              ))}
            </TextField>
          ) : (
            <TextField
              fullWidth
              select
              label="Relay auswählen"
              value={assignmentId}
              onChange={(e) => setAssignmentId(parseInt(e.target.value))}
              margin="normal"
            >
              {relays.map((relay) => (
                <MenuItem key={relay.id} value={relay.id}>
                  {relay.name} ({relay.type})
                </MenuItem>
              ))}
            </TextField>
          )}
        </DialogContent>
        <DialogActions>
          {selectedPin && pins.find((p) => p.pin === selectedPin)?.assignment && (
            <Button onClick={() => handleUnassign(selectedPin)} color="error">
              Freigeben
            </Button>
          )}
          <Button onClick={() => setDialogOpen(false)}>Abbrechen</Button>
          <Button onClick={handleAssign} variant="contained" disabled={!assignmentId}>
            Zuweisen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
