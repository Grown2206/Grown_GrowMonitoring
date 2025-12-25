import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Chip,
  LinearProgress,
  Alert,
  Button,
  Divider,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import OfflineBoltIcon from '@mui/icons-material/OfflineBolt';
import RefreshIcon from '@mui/icons-material/Refresh';
import BatteryFullIcon from '@mui/icons-material/BatteryFull';
import BatteryAlertIcon from '@mui/icons-material/BatteryAlert';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';

interface SensorHealthMetrics {
  sensorId: number;
  sensorName: string;
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  healthScore: number;
  uptime: number;
  lastSeen: Date | null;
  lastSeenMinutes: number | null;
  dataAvailability: number;
  batteryLevel?: number;
  signalStrength?: number;
  issues: string[];
  recommendations: string[];
  metrics: {
    totalReadings: number;
    expectedReadings: number;
    missedReadings: number;
    avgInterval: number;
    longestGap: number;
  };
  timestamp: Date;
}

interface FleetHealthSummary {
  totalSensors: number;
  healthy: number;
  warning: number;
  critical: number;
  offline: number;
  averageHealth: number;
  averageUptime: number;
  sensors: SensorHealthMetrics[];
  timestamp: Date;
}

const statusConfig = {
  healthy: {
    color: 'success' as const,
    icon: <CheckCircleIcon />,
    label: 'Gesund',
  },
  warning: {
    color: 'warning' as const,
    icon: <WarningIcon />,
    label: 'Warnung',
  },
  critical: {
    color: 'error' as const,
    icon: <ErrorIcon />,
    label: 'Kritisch',
  },
  offline: {
    color: 'default' as const,
    icon: <OfflineBoltIcon />,
    label: 'Offline',
  },
};

export function SensorHealthMonitoring() {
  const [fleetHealth, setFleetHealth] = useState<FleetHealthSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lookbackHours, setLookbackHours] = useState(24);

  const loadFleetHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/sensor-health/fleet?lookbackHours=${lookbackHours}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to load fleet health');

      const data = await response.json();
      setFleetHealth(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFleetHealth();
    const interval = setInterval(loadFleetHealth, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [lookbackHours]);

  if (loading && !fleetHealth) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!fleetHealth) return null;

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Sensor Health Monitoring</Typography>
        <Button
          startIcon={<RefreshIcon />}
          onClick={loadFleetHealth}
          variant="outlined"
          disabled={loading}
        >
          Aktualisieren
        </Button>
      </Box>

      {/* Fleet Summary */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Gesamt Sensoren
              </Typography>
              <Typography variant="h3">{fleetHealth.totalSensors}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: 'success.light' }}>
            <CardContent>
              <Typography color="success.contrastText" gutterBottom>
                Gesund
              </Typography>
              <Typography variant="h3" color="success.contrastText">
                {fleetHealth.healthy}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: 'warning.light' }}>
            <CardContent>
              <Typography gutterBottom>Warnung + Kritisch</Typography>
              <Typography variant="h3">
                {fleetHealth.warning + fleetHealth.critical}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: 'grey.300' }}>
            <CardContent>
              <Typography gutterBottom>Offline</Typography>
              <Typography variant="h3">{fleetHealth.offline}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Average Metrics */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Durchschnittliche Gesundheit
              </Typography>
              <Box display="flex" alignItems="center" gap={2}>
                <Box flexGrow={1}>
                  <LinearProgress
                    variant="determinate"
                    value={fleetHealth.averageHealth}
                    sx={{ height: 10, borderRadius: 1 }}
                    color={
                      fleetHealth.averageHealth >= 70
                        ? 'success'
                        : fleetHealth.averageHealth >= 50
                        ? 'warning'
                        : 'error'
                    }
                  />
                </Box>
                <Typography variant="h6">{fleetHealth.averageHealth.toFixed(1)}%</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Durchschnittliche Uptime
              </Typography>
              <Box display="flex" alignItems="center" gap={2}>
                <Box flexGrow={1}>
                  <LinearProgress
                    variant="determinate"
                    value={fleetHealth.averageUptime}
                    sx={{ height: 10, borderRadius: 1 }}
                    color={
                      fleetHealth.averageUptime >= 95
                        ? 'success'
                        : fleetHealth.averageUptime >= 90
                        ? 'warning'
                        : 'error'
                    }
                  />
                </Box>
                <Typography variant="h6">{fleetHealth.averageUptime.toFixed(1)}%</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Individual Sensors */}
      <Typography variant="h5" gutterBottom>
        Sensor Details
      </Typography>
      <Grid container spacing={3}>
        {fleetHealth.sensors
          .sort((a, b) => a.healthScore - b.healthScore)
          .map((sensor) => {
            const statusCfg = statusConfig[sensor.status];
            return (
              <Grid item xs={12} md={6} key={sensor.sensorId}>
                <Card
                  sx={{
                    border: 2,
                    borderColor:
                      sensor.status === 'healthy'
                        ? 'success.main'
                        : sensor.status === 'warning'
                        ? 'warning.main'
                        : sensor.status === 'critical'
                        ? 'error.main'
                        : 'grey.300',
                  }}
                >
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="h6">{sensor.sensorName}</Typography>
                      <Chip
                        icon={statusCfg.icon}
                        label={statusCfg.label}
                        color={statusCfg.color}
                        size="small"
                      />
                    </Box>

                    {/* Health Score */}
                    <Box mb={2}>
                      <Box display="flex" justifyContent="space-between" mb={0.5}>
                        <Typography variant="body2">Health Score</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {sensor.healthScore}/100
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={sensor.healthScore}
                        color={
                          sensor.healthScore >= 70
                            ? 'success'
                            : sensor.healthScore >= 50
                            ? 'warning'
                            : 'error'
                        }
                        sx={{ height: 8, borderRadius: 1 }}
                      />
                    </Box>

                    {/* Metrics */}
                    <Grid container spacing={1} mb={2}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Uptime
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {sensor.uptime.toFixed(1)}%
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Data Availability
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {sensor.dataAvailability.toFixed(1)}%
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Last Seen
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {sensor.lastSeenMinutes !== null
                            ? `${sensor.lastSeenMinutes} min`
                            : 'Never'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Avg Interval
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {sensor.metrics.avgInterval.toFixed(1)} min
                        </Typography>
                      </Grid>
                    </Grid>

                    {/* Battery & Signal */}
                    {(sensor.batteryLevel !== undefined || sensor.signalStrength !== undefined) && (
                      <Box display="flex" gap={2} mb={2}>
                        {sensor.batteryLevel !== undefined && (
                          <Tooltip title="Battery Level">
                            <Chip
                              icon={
                                sensor.batteryLevel >= 20 ? (
                                  <BatteryFullIcon />
                                ) : (
                                  <BatteryAlertIcon />
                                )
                              }
                              label={`${sensor.batteryLevel}%`}
                              size="small"
                              color={sensor.batteryLevel >= 20 ? 'success' : 'error'}
                            />
                          </Tooltip>
                        )}
                        {sensor.signalStrength !== undefined && (
                          <Tooltip title="Signal Strength">
                            <Chip
                              icon={<SignalCellularAltIcon />}
                              label={`${sensor.signalStrength} dBm`}
                              size="small"
                            />
                          </Tooltip>
                        )}
                      </Box>
                    )}

                    {/* Issues */}
                    {sensor.issues.length > 0 && (
                      <>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="caption" color="text.secondary" gutterBottom>
                          Issues:
                        </Typography>
                        {sensor.issues.map((issue, idx) => (
                          <Typography key={idx} variant="body2" color="error.main">
                            • {issue}
                          </Typography>
                        ))}
                      </>
                    )}

                    {/* Recommendations */}
                    {sensor.recommendations.length > 0 && (
                      <>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="caption" color="text.secondary" gutterBottom>
                          Empfehlungen:
                        </Typography>
                        {sensor.recommendations.map((rec, idx) => (
                          <Typography key={idx} variant="body2" color="info.main">
                            • {rec}
                          </Typography>
                        ))}
                      </>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
      </Grid>
    </Box>
  );
}
