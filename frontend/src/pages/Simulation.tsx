import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  Switch,
  Slider,
  Paper,
  Chip,
  IconButton,
  Alert,
  LinearProgress,
  Divider,
  alpha,
  FormControlLabel,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  WaterDrop as WaterDropIcon,
  WbIncandescent as LightIcon,
  Air as AirIcon,
  Thermostat as ThermostatIcon,
  Opacity as HumidityIcon,
  Science as NutrientIcon,
  Waves as TankIcon,
  Power as PowerIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useToast } from '../contexts/ToastContext';

interface SimulatedSensor {
  id: number;
  name: string;
  moisture: number;
  temperature: number;
  humidity: number;
  tankLevel: number;
  nutrientLevel: number;
}

interface SimulatedRelay {
  id: number;
  relayId: number;
  name: string;
  type: 'light' | 'fan' | 'pump' | 'heater' | 'humidifier';
  status: boolean;
}

export function Simulation() {
  const [isRunning, setIsRunning] = useState(false);
  const [connected, setConnected] = useState(false);
  const [sensors, setSensors] = useState<SimulatedSensor[]>([
    { id: 1, name: 'Sensor 1', moisture: 45, temperature: 23, humidity: 60, tankLevel: 80, nutrientLevel: 750 },
    { id: 2, name: 'Sensor 2', moisture: 52, temperature: 24, humidity: 65, tankLevel: 75, nutrientLevel: 820 },
    { id: 3, name: 'Sensor 3', moisture: 38, temperature: 22, humidity: 58, tankLevel: 80, nutrientLevel: 680 },
  ]);

  const [relays, setRelays] = useState<SimulatedRelay[]>([
    { id: 1, relayId: 1, name: 'Hauptlicht', type: 'light', status: false },
    { id: 2, relayId: 2, name: 'Abluft', type: 'fan', status: false },
    { id: 3, relayId: 3, name: 'Pumpe 1', type: 'pump', status: false },
    { id: 4, relayId: 4, name: 'Pumpe 2', type: 'pump', status: false },
    { id: 5, relayId: 5, name: 'Heizung', type: 'heater', status: false },
  ]);

  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [autoMode, setAutoMode] = useState(false);
  const { success, info, warning } = useToast();

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSensors((prev) =>
        prev.map((sensor) => {
          let newMoisture = sensor.moisture + (Math.random() - 0.5) * 2;
          let newTemp = sensor.temperature + (Math.random() - 0.5) * 0.5;
          let newHumidity = sensor.humidity + (Math.random() - 0.5) * 2;
          let newTank = sensor.tankLevel - 0.1 * simulationSpeed;
          let newNutrient = sensor.nutrientLevel + (Math.random() - 0.5) * 10;

          // Simulate pump effect on moisture
          const activePumps = relays.filter((r) => r.type === 'pump' && r.status);
          if (activePumps.length > 0) {
            newMoisture = Math.min(100, newMoisture + 2 * simulationSpeed);
            newTank = Math.max(0, newTank - 0.5 * simulationSpeed);
          } else {
            newMoisture = Math.max(0, newMoisture - 0.3 * simulationSpeed);
          }

          // Simulate light effect on temperature
          const lights = relays.filter((r) => r.type === 'light' && r.status);
          if (lights.length > 0) {
            newTemp = Math.min(35, newTemp + 0.2 * simulationSpeed);
          }

          // Simulate fan effect on temperature and humidity
          const fans = relays.filter((r) => r.type === 'fan' && r.status);
          if (fans.length > 0) {
            newTemp = Math.max(18, newTemp - 0.3 * simulationSpeed);
            newHumidity = Math.max(30, newHumidity - 0.5 * simulationSpeed);
          }

          // Simulate heater effect
          const heaters = relays.filter((r) => r.type === 'heater' && r.status);
          if (heaters.length > 0) {
            newTemp = Math.min(30, newTemp + 0.5 * simulationSpeed);
          }

          // Clamp values
          newMoisture = Math.max(0, Math.min(100, newMoisture));
          newTemp = Math.max(15, Math.min(35, newTemp));
          newHumidity = Math.max(20, Math.min(90, newHumidity));
          newTank = Math.max(0, Math.min(100, newTank));
          newNutrient = Math.max(0, Math.min(1500, newNutrient));

          return {
            ...sensor,
            moisture: newMoisture,
            temperature: newTemp,
            humidity: newHumidity,
            tankLevel: newTank,
            nutrientLevel: newNutrient,
          };
        })
      );

      // Auto mode: control relays based on sensor values
      if (autoMode) {
        setRelays((prev) =>
          prev.map((relay) => {
            let newStatus = relay.status;
            const avgMoisture = sensors.reduce((sum, s) => sum + s.moisture, 0) / sensors.length;
            const avgTemp = sensors.reduce((sum, s) => sum + s.temperature, 0) / sensors.length;

            if (relay.type === 'pump' && avgMoisture < 40) {
              newStatus = true;
            } else if (relay.type === 'pump' && avgMoisture > 60) {
              newStatus = false;
            }

            if (relay.type === 'fan' && avgTemp > 26) {
              newStatus = true;
            } else if (relay.type === 'fan' && avgTemp < 23) {
              newStatus = false;
            }

            if (relay.type === 'heater' && avgTemp < 20) {
              newStatus = true;
            } else if (relay.type === 'heater' && avgTemp > 24) {
              newStatus = false;
            }

            return { ...relay, status: newStatus };
          })
        );
      }
    }, 1000 / simulationSpeed);

    return () => clearInterval(interval);
  }, [isRunning, simulationSpeed, autoMode, relays, sensors]);

  const handleStart = () => {
    setIsRunning(true);
    setConnected(true);
    success('Simulation gestartet');
    sendToBackend('connect');
  };

  const handleStop = () => {
    setIsRunning(false);
    setConnected(false);
    info('Simulation gestoppt');
  };

  const handleReset = () => {
    setSensors([
      { id: 1, name: 'Sensor 1', moisture: 45, temperature: 23, humidity: 60, tankLevel: 80, nutrientLevel: 750 },
      { id: 2, name: 'Sensor 2', moisture: 52, temperature: 24, humidity: 65, tankLevel: 75, nutrientLevel: 820 },
      { id: 3, name: 'Sensor 3', moisture: 38, temperature: 22, humidity: 58, tankLevel: 80, nutrientLevel: 680 },
    ]);
    setRelays((prev) => prev.map((r) => ({ ...r, status: false })));
    info('Simulation zurückgesetzt');
  };

  const toggleRelay = (id: number) => {
    setRelays((prev) =>
      prev.map((relay) => {
        if (relay.id === id) {
          const newStatus = !relay.status;
          sendToBackend('relay_control', { relayId: relay.relayId, status: newStatus });
          return { ...relay, status: newStatus };
        }
        return relay;
      })
    );
  };

  const sendToBackend = (type: string, data?: any) => {
    if (!connected && type !== 'connect') return;

    // Simulate sending data to backend via WebSocket
    const payload = {
      type,
      data: data || {},
      timestamp: new Date().toISOString(),
    };

    // In real implementation, this would send to WebSocket
    console.log('Sending to backend:', payload);

    if (type === 'sensor_data') {
      // Send sensor data to backend API
      fetch('http://localhost:3001/api/sensors/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(data),
      }).catch((err) => console.error('Failed to send sensor data:', err));
    }
  };

  useEffect(() => {
    if (!isRunning || !connected) return;

    // Send sensor data every 5 seconds
    const interval = setInterval(() => {
      sensors.forEach((sensor) => {
        sendToBackend('sensor_data', {
          sensorId: sensor.id,
          moistureLevel: sensor.moisture,
          temperature: sensor.temperature,
          humidity: sensor.humidity,
          tankLevel: sensor.tankLevel,
          nutrientLevel: sensor.nutrientLevel,
        });
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [isRunning, connected, sensors]);

  const getMoistureColor = (value: number) => {
    if (value < 30) return '#f44336';
    if (value < 50) return '#ff9800';
    return '#4caf50';
  };

  const getTempColor = (value: number) => {
    if (value < 20 || value > 28) return '#f44336';
    if (value < 22 || value > 26) return '#ff9800';
    return '#4caf50';
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">ESP32 Simulation</Typography>
        <Box display="flex" gap={2}>
          <Chip
            icon={<PowerIcon />}
            label={connected ? 'Verbunden' : 'Getrennt'}
            color={connected ? 'success' : 'default'}
            variant={connected ? 'filled' : 'outlined'}
          />
          {!isRunning ? (
            <Button variant="contained" startIcon={<PlayIcon />} onClick={handleStart} color="success">
              Starten
            </Button>
          ) : (
            <Button variant="contained" startIcon={<StopIcon />} onClick={handleStop} color="error">
              Stoppen
            </Button>
          )}
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleReset}>
            Zurücksetzen
          </Button>
        </Box>
      </Box>

      {/* Control Panel */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Steuerung
            </Typography>
            <Box mb={2}>
              <Typography variant="body2" gutterBottom>
                Simulationsgeschwindigkeit: {simulationSpeed}x
              </Typography>
              <Slider
                value={simulationSpeed}
                onChange={(_, value) => setSimulationSpeed(value as number)}
                min={0.5}
                max={5}
                step={0.5}
                marks
                disabled={!isRunning}
              />
            </Box>
            <FormControlLabel
              control={<Switch checked={autoMode} onChange={(e) => setAutoMode(e.target.checked)} disabled={!isRunning} />}
              label="Automatik-Modus (Auto-Steuerung)"
            />
            {autoMode && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Relays werden automatisch basierend auf Sensorwerten gesteuert
              </Alert>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              System-Status
            </Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2">ESP32 Status:</Typography>
                <Chip label={isRunning ? 'Läuft' : 'Gestoppt'} size="small" color={isRunning ? 'success' : 'default'} />
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2">Aktive Sensoren:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {sensors.length}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2">Aktive Relays:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {relays.filter((r) => r.status).length} / {relays.length}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2">Uptime:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {isRunning ? 'Live' : '--'}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Sensors */}
      <Typography variant="h5" gutterBottom mb={2}>
        Sensoren
      </Typography>
      <Grid container spacing={3} mb={3}>
        {sensors.map((sensor) => (
          <Grid item xs={12} md={4} key={sensor.id}>
            <Card sx={{ border: isRunning ? '2px solid' : '1px solid', borderColor: isRunning ? 'primary.main' : 'divider' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">{sensor.name}</Typography>
                  <Chip label={`ID: ${sensor.id}`} size="small" />
                </Box>

                <Box mb={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <WaterDropIcon sx={{ color: getMoistureColor(sensor.moisture) }} />
                      <Typography variant="body2">Feuchtigkeit</Typography>
                    </Box>
                    <Typography variant="h6" sx={{ color: getMoistureColor(sensor.moisture) }}>
                      {sensor.moisture.toFixed(1)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={sensor.moisture}
                    sx={{
                      height: 8,
                      borderRadius: 1,
                      bgcolor: alpha(getMoistureColor(sensor.moisture), 0.2),
                      '& .MuiLinearProgress-bar': { bgcolor: getMoistureColor(sensor.moisture) },
                    }}
                  />
                </Box>

                <Box mb={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <ThermostatIcon sx={{ color: getTempColor(sensor.temperature) }} />
                      <Typography variant="body2">Temperatur</Typography>
                    </Box>
                    <Typography variant="h6" sx={{ color: getTempColor(sensor.temperature) }}>
                      {sensor.temperature.toFixed(1)}°C
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(sensor.temperature / 35) * 100}
                    sx={{
                      height: 8,
                      borderRadius: 1,
                      bgcolor: alpha(getTempColor(sensor.temperature), 0.2),
                      '& .MuiLinearProgress-bar': { bgcolor: getTempColor(sensor.temperature) },
                    }}
                  />
                </Box>

                <Box mb={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <HumidityIcon color="info" />
                      <Typography variant="body2">Luftfeuchte</Typography>
                    </Box>
                    <Typography variant="h6">{sensor.humidity.toFixed(1)}%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={sensor.humidity} sx={{ height: 8, borderRadius: 1 }} />
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <TankIcon color="primary" fontSize="small" />
                    <Typography variant="body2">Tank</Typography>
                  </Box>
                  <Typography variant="body2" fontWeight="bold">
                    {sensor.tankLevel.toFixed(0)}%
                  </Typography>
                </Box>

                <Box display="flex" justifyContent="space-between">
                  <Box display="flex" alignItems="center" gap={1}>
                    <NutrientIcon color="secondary" fontSize="small" />
                    <Typography variant="body2">EC-Wert</Typography>
                  </Box>
                  <Typography variant="body2" fontWeight="bold">
                    {sensor.nutrientLevel.toFixed(0)} µS
                  </Typography>
                </Box>

                {sensor.tankLevel < 20 && (
                  <Alert severity="warning" sx={{ mt: 2 }} icon={<WarningIcon />}>
                    Tank fast leer!
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Relays */}
      <Typography variant="h5" gutterBottom mb={2}>
        Relays
      </Typography>
      <Grid container spacing={2}>
        {relays.map((relay) => (
          <Grid item xs={12} sm={6} md={4} lg={2.4} key={relay.id}>
            <Card
              sx={{
                cursor: isRunning && !autoMode ? 'pointer' : 'default',
                border: relay.status ? '2px solid' : '1px solid',
                borderColor: relay.status ? 'primary.main' : 'divider',
                transition: 'all 0.3s',
                '&:hover': isRunning && !autoMode ? { transform: 'translateY(-4px)', boxShadow: 4 } : {},
              }}
              onClick={() => isRunning && !autoMode && toggleRelay(relay.id)}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="h6" fontSize={14}>
                    {relay.name}
                  </Typography>
                  <Switch checked={relay.status} disabled={!isRunning || autoMode} size="small" />
                </Box>

                <Chip
                  label={`Relay ${relay.relayId}`}
                  size="small"
                  variant="outlined"
                  sx={{ mb: 1, fontSize: 10 }}
                />

                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  {relay.type === 'pump' && <WaterDropIcon color={relay.status ? 'primary' : 'disabled'} />}
                  {relay.type === 'light' && <LightIcon sx={{ color: relay.status ? '#FFD700' : 'gray' }} />}
                  {relay.type === 'fan' && <AirIcon color={relay.status ? 'info' : 'disabled'} />}
                  {relay.type === 'heater' && <ThermostatIcon color={relay.status ? 'error' : 'disabled'} />}
                  {relay.type === 'humidifier' && <HumidityIcon color={relay.status ? 'info' : 'disabled'} />}
                  <Typography variant="body2" color={relay.status ? 'primary' : 'text.secondary'}>
                    {relay.status ? 'AN' : 'AUS'}
                  </Typography>
                </Box>

                {relay.status && (
                  <Box mt={1}>
                    {relay.type === 'pump' && <Chip size="small" icon={<WaterDropIcon />} label="Pumpt..." color="primary" variant="outlined" />}
                    {relay.type === 'light' && <Chip size="small" icon={<LightIcon />} label="Leuchtet" color="warning" variant="outlined" />}
                    {relay.type === 'fan' && <Chip size="small" icon={<AirIcon />} label="Lüftet" color="info" variant="outlined" />}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
