import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  Alert,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Stack,
  Slider,
  TextField,
  Tooltip,
  IconButton,
  Divider,
  Badge,
} from '@mui/material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import axios from 'axios';
import RefreshIcon from '@mui/icons-material/Refresh';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import BugReportIcon from '@mui/icons-material/BugReport';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssessmentIcon from '@mui/icons-material/Assessment';
import FilterListIcon from '@mui/icons-material/FilterList';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

interface Sensor {
  id: number;
  name: string;
  type: string;
  isActive: boolean;
}

interface Anomaly {
  timestamp: Date;
  sensorId: number;
  sensorName: string;
  value: number;
  expectedValue: number;
  deviation: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  method: string;
  confidence: number;
  description: string;
}

interface AnomalyDetectionResult {
  sensorId: number;
  sensorName: string;
  method: string;
  anomalies: Anomaly[];
  totalAnomalies: number;
  severityCounts: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  detectionPeriod: {
    start: Date;
    end: Date;
    hours: number;
  };
  statistics: {
    mean: number;
    median: number;
    stdDev: number;
    min: number;
    max: number;
    q1: number;
    q3: number;
    iqr: number;
  };
}

interface AnomalySummary {
  totalSensors: number;
  totalAnomalies: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  topAnomalousSensors: Array<{
    sensorId: number;
    sensorName: string;
    anomalyCount: number;
    criticalCount: number;
  }>;
  recentAnomalies: Anomaly[];
}

interface DetectionMethod {
  id: string;
  name: string;
  description: string;
}

export function AnomalyDetection() {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [selectedSensorId, setSelectedSensorId] = useState<number | ''>('');
  const [selectedMethod, setSelectedMethod] = useState<string>('combined');
  const [hours, setHours] = useState<number>(24);
  const [zScoreThreshold, setZScoreThreshold] = useState<number>(3);
  const [iqrMultiplier, setIqrMultiplier] = useState<number>(1.5);
  const [result, setResult] = useState<AnomalyDetectionResult | null>(null);
  const [summary, setSummary] = useState<AnomalySummary | null>(null);
  const [methods, setMethods] = useState<DetectionMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [sensorsRes, methodsRes, summaryRes] = await Promise.all([
        axios.get(`${API_URL}/sensors`, { headers }),
        axios.get(`${API_URL}/anomaly-detection/methods`, { headers }),
        axios.get(`${API_URL}/anomaly-detection/summary?hours=24`, { headers }),
      ]);

      const activeSensors = sensorsRes.data.filter((s: Sensor) => s.isActive);
      setSensors(activeSensors);
      setMethods(methodsRes.data);
      setSummary(summaryRes.data);

      if (activeSensors.length > 0) {
        setSelectedSensorId(activeSensors[0].id);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Fehler beim Laden der Daten');
    }
  };

  const detectAnomalies = async () => {
    if (!selectedSensorId) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const res = await axios.post(
        `${API_URL}/anomaly-detection/detect/${selectedSensorId}`,
        {
          hours,
          method: selectedMethod,
          zScoreThreshold,
          iqrMultiplier,
        },
        { headers }
      );

      setResult(res.data);

      // Refresh summary
      const summaryRes = await axios.get(`${API_URL}/anomaly-detection/summary?hours=${hours}`, {
        headers,
      });
      setSummary(summaryRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Fehler bei der Anomalie-Erkennung');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSensorId) {
      detectAnomalies();
    }
  }, [selectedSensorId, selectedMethod, hours]);

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical':
        return '#d32f2f';
      case 'high':
        return '#f57c00';
      case 'medium':
        return '#ffa726';
      case 'low':
        return '#66bb6a';
      default:
        return '#9e9e9e';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <ErrorIcon />;
      case 'high':
        return <WarningIcon />;
      case 'medium':
        return <InfoIcon />;
      case 'low':
        return <CheckCircleIcon />;
      default:
        return <BugReportIcon />;
    }
  };

  const getSeverityLabel = (severity: string): string => {
    switch (severity) {
      case 'critical':
        return 'Kritisch';
      case 'high':
        return 'Hoch';
      case 'medium':
        return 'Mittel';
      case 'low':
        return 'Niedrig';
      default:
        return 'Unbekannt';
    }
  };

  const getFilteredAnomalies = (): Anomaly[] => {
    if (!result) return [];
    if (severityFilter === 'all') return result.anomalies;
    return result.anomalies.filter((a) => a.severity === severityFilter);
  };

  // Prepare chart data for anomaly timeline
  const timelineData = result
    ? result.anomalies.map((a) => ({
        time: new Date(a.timestamp).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
        value: a.value,
        expected: a.expectedValue,
        severity: a.severity,
      }))
    : [];

  // Prepare severity distribution data
  const severityData = result
    ? [
        { name: 'Niedrig', count: result.severityCounts.low, color: '#66bb6a' },
        { name: 'Mittel', count: result.severityCounts.medium, color: '#ffa726' },
        { name: 'Hoch', count: result.severityCounts.high, color: '#f57c00' },
        { name: 'Kritisch', count: result.severityCounts.critical, color: '#d32f2f' },
      ]
    : [];

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <BugReportIcon />
        Anomalie-Erkennung
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Automatische Erkennung von Anomalien in Sensordaten mit verschiedenen statistischen Methoden
      </Typography>

      {/* Summary Cards */}
      {summary && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Gesamt Anomalien
                </Typography>
                <Typography variant="h4">{summary.totalAnomalies}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card sx={{ bgcolor: '#ffebee' }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Kritische
                </Typography>
                <Typography variant="h4" color="error">
                  {summary.criticalCount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card sx={{ bgcolor: '#fff3e0' }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Hohe Priorität
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {summary.highCount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card sx={{ bgcolor: '#e8f5e9' }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Mittlere/Niedrige
                </Typography>
                <Typography variant="h4" color="success.main">
                  {summary.mediumCount + summary.lowCount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Detection Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Sensor</InputLabel>
                <Select
                  value={selectedSensorId}
                  onChange={(e) => setSelectedSensorId(e.target.value as number)}
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
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Erkennungsmethode</InputLabel>
                <Select
                  value={selectedMethod}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                  label="Erkennungsmethode"
                >
                  {methods.map((method) => (
                    <MenuItem key={method.id} value={method.id}>
                      {method.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Zeitraum</InputLabel>
                <Select value={hours} onChange={(e) => setHours(e.target.value as number)} label="Zeitraum">
                  <MenuItem value={6}>Letzte 6 Stunden</MenuItem>
                  <MenuItem value={12}>Letzte 12 Stunden</MenuItem>
                  <MenuItem value={24}>Letzte 24 Stunden</MenuItem>
                  <MenuItem value={48}>Letzte 48 Stunden</MenuItem>
                  <MenuItem value={168}>Letzte Woche</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {(selectedMethod === 'zscore' || selectedMethod === 'combined') && (
              <Grid item xs={12} md={6}>
                <Typography variant="body2" gutterBottom>
                  Z-Score Schwellwert: {zScoreThreshold}
                </Typography>
                <Slider
                  value={zScoreThreshold}
                  onChange={(_, value) => setZScoreThreshold(value as number)}
                  min={1.5}
                  max={5}
                  step={0.1}
                  marks
                  valueLabelDisplay="auto"
                  size="small"
                />
              </Grid>
            )}

            {(selectedMethod === 'iqr' || selectedMethod === 'combined') && (
              <Grid item xs={12} md={6}>
                <Typography variant="body2" gutterBottom>
                  IQR Multiplikator: {iqrMultiplier}
                </Typography>
                <Slider
                  value={iqrMultiplier}
                  onChange={(_, value) => setIqrMultiplier(value as number)}
                  min={0.5}
                  max={3}
                  step={0.1}
                  marks
                  valueLabelDisplay="auto"
                  size="small"
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <Button
                fullWidth
                variant="contained"
                onClick={detectAnomalies}
                disabled={loading || !selectedSensorId}
                startIcon={loading ? <CircularProgress size={16} /> : <RefreshIcon />}
              >
                Anomalien erkennen
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading && <LinearProgress sx={{ mb: 3 }} />}

      {result && (
        <>
          {/* Statistics Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Schweregrad-Verteilung
                  </Typography>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={severityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="count">
                        {severityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Statistiken
                  </Typography>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 1.5, bgcolor: '#f5f5f5', textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          Mittelwert
                        </Typography>
                        <Typography variant="h6">{result.statistics.mean.toFixed(2)}</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 1.5, bgcolor: '#f5f5f5', textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          Median
                        </Typography>
                        <Typography variant="h6">{result.statistics.median.toFixed(2)}</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 1.5, bgcolor: '#f5f5f5', textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          Std.-Abweichung
                        </Typography>
                        <Typography variant="h6">{result.statistics.stdDev.toFixed(2)}</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 1.5, bgcolor: '#f5f5f5', textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          IQR
                        </Typography>
                        <Typography variant="h6">{result.statistics.iqr.toFixed(2)}</Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Anomaly Timeline Chart */}
          {timelineData.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Anomalie-Zeitverlauf
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Line type="monotone" dataKey="expected" stroke="#2196f3" name="Erwarteter Wert" />
                    <Line type="monotone" dataKey="value" stroke="#f44336" name="Gemessener Wert" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Anomaly List */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Erkannte Anomalien ({result.totalAnomalies})
                </Typography>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Filter nach Schweregrad</InputLabel>
                  <Select
                    value={severityFilter}
                    onChange={(e) => setSeverityFilter(e.target.value)}
                    label="Filter nach Schweregrad"
                  >
                    <MenuItem value="all">Alle</MenuItem>
                    <MenuItem value="critical">Kritisch</MenuItem>
                    <MenuItem value="high">Hoch</MenuItem>
                    <MenuItem value="medium">Mittel</MenuItem>
                    <MenuItem value="low">Niedrig</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {getFilteredAnomalies().length === 0 ? (
                <Alert severity="success" icon={<CheckCircleIcon />}>
                  Keine Anomalien im gewählten Zeitraum gefunden
                </Alert>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Zeit</TableCell>
                        <TableCell>Wert</TableCell>
                        <TableCell>Erwartet</TableCell>
                        <TableCell>Abweichung</TableCell>
                        <TableCell>Schweregrad</TableCell>
                        <TableCell>Konfidenz</TableCell>
                        <TableCell>Beschreibung</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {getFilteredAnomalies().map((anomaly, index) => (
                        <TableRow key={index} sx={{ bgcolor: `${getSeverityColor(anomaly.severity)}10` }}>
                          <TableCell>
                            {new Date(anomaly.timestamp).toLocaleString('de-DE', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </TableCell>
                          <TableCell>
                            <Typography fontWeight="bold" color={getSeverityColor(anomaly.severity)}>
                              {anomaly.value.toFixed(2)}
                            </Typography>
                          </TableCell>
                          <TableCell>{anomaly.expectedValue.toFixed(2)}</TableCell>
                          <TableCell>
                            {anomaly.deviation > 0 ? '+' : ''}
                            {anomaly.deviation.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={getSeverityIcon(anomaly.severity)}
                              label={getSeverityLabel(anomaly.severity)}
                              size="small"
                              sx={{
                                bgcolor: getSeverityColor(anomaly.severity),
                                color: 'white',
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={anomaly.confidence}
                                sx={{ flex: 1, height: 6, borderRadius: 3 }}
                              />
                              <Typography variant="body2">{anomaly.confidence}%</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {anomaly.description}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {!result && !loading && selectedSensorId && (
        <Alert severity="info">Wählen Sie einen Sensor und Zeitraum aus, um Anomalien zu erkennen.</Alert>
      )}
    </Box>
  );
}
