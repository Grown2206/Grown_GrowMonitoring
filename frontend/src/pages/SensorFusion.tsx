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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Slider,
  Divider,
  IconButton,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Refresh as RefreshIcon,
  Timeline as TimelineIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import axios from 'axios';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
} from 'recharts';

type FusionMethod = 'average' | 'median' | 'weighted_average' | 'best_sensor';

interface FusionResult {
  fusedValue: number;
  method: FusionMethod;
  confidence: number;
  sensorCount: number;
  outliers: number[];
  variance: number;
  timestamp: string;
  details?: {
    min: number;
    max: number;
    median: number;
    average: number;
    stdDev: number;
  };
}

interface Sensor {
  id: number;
  name: string;
  type: string;
}

interface SensorGroup {
  id: number;
  name: string;
  description: string;
  sensorIds: number[];
  color: string;
}

interface HistoricalPoint {
  timestamp: string;
  fusedValue: number;
  confidence: number;
  sensorCount: number;
  variance: number;
}

const methodLabels: Record<FusionMethod, string> = {
  average: 'Durchschnitt',
  median: 'Median',
  weighted_average: 'Gewichteter Durchschnitt',
  best_sensor: 'Bester Sensor',
};

const methodDescriptions: Record<FusionMethod, string> = {
  average: 'Arithmetischer Mittelwert aller Sensoren',
  median: 'Mittlerer Wert (robust gegen Ausreißer)',
  weighted_average: 'Gewichteter Mittelwert basierend auf Sensor-Zuverlässigkeit',
  best_sensor: 'Wert des zuverlässigsten Sensors',
};

const fieldLabels: Record<string, string> = {
  temperature: 'Temperatur',
  humidity: 'Luftfeuchtigkeit',
  soilMoisture: 'Bodenfeuchtigkeit',
  vpd: 'VPD',
  lightIntensity: 'Lichtintensität',
  co2: 'CO2',
  ph: 'pH-Wert',
};

export function SensorFusion() {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [sensorGroups, setSensorGroups] = useState<SensorGroup[]>([]);
  const [selectedSensors, setSelectedSensors] = useState<number[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [field, setField] = useState<string>('temperature');
  const [method, setMethod] = useState<FusionMethod>('average');
  const [outlierThreshold, setOutlierThreshold] = useState<number>(2.0);
  const [weights, setWeights] = useState<Record<number, number>>({});
  const [fusionResult, setFusionResult] = useState<FusionResult | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    loadSensors();
    loadSensorGroups();
  }, []);

  useEffect(() => {
    if (selectedSensors.length > 0) {
      // Initialize weights for weighted_average method
      const initialWeights: Record<number, number> = {};
      selectedSensors.forEach((id) => {
        initialWeights[id] = weights[id] || 1.0;
      });
      setWeights(initialWeights);
    }
  }, [selectedSensors]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (autoRefresh && selectedSensors.length > 0) {
      interval = setInterval(() => {
        handleFuseSensors();
      }, 10000); // Refresh every 10 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, selectedSensors, field, method, outlierThreshold, weights]);

  const loadSensors = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/sensors');
      setSensors(response.data);
    } catch (error) {
      console.error('Error loading sensors:', error);
    }
  };

  const loadSensorGroups = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/sensor-groups');
      setSensorGroups(response.data);
    } catch (error) {
      console.error('Error loading sensor groups:', error);
    }
  };

  const handleSensorToggle = (sensorId: number) => {
    setSelectedSensors((prev) =>
      prev.includes(sensorId) ? prev.filter((id) => id !== sensorId) : [...prev, sensorId]
    );
  };

  const handleGroupSelect = (groupId: string) => {
    setSelectedGroup(groupId);
    if (groupId) {
      const group = sensorGroups.find((g) => g.id === parseInt(groupId));
      if (group) {
        setSelectedSensors(group.sensorIds);
      }
    }
  };

  const handleFuseSensors = async () => {
    if (selectedSensors.length < 2) {
      alert('Bitte wählen Sie mindestens 2 Sensoren aus');
      return;
    }

    try {
      setLoading(true);

      const requestData: any = {
        sensorIds: selectedSensors,
        field,
        method,
        outlierThreshold,
      };

      if (method === 'weighted_average' && Object.keys(weights).length > 0) {
        requestData.weights = weights;
      }

      const response = await axios.post('http://localhost:3001/api/sensor-fusion/fuse', requestData);

      setFusionResult(response.data);
    } catch (error) {
      console.error('Error fusing sensors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFuseGroup = async () => {
    if (!selectedGroup) {
      alert('Bitte wählen Sie eine Sensor-Gruppe aus');
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `http://localhost:3001/api/sensor-fusion/fuse-group/${selectedGroup}`,
        {
          field,
          method,
          outlierThreshold,
        }
      );

      setFusionResult(response.data);
    } catch (error) {
      console.error('Error fusing group:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadHistorical = async () => {
    if (selectedSensors.length < 2) {
      alert('Bitte wählen Sie mindestens 2 Sensoren aus');
      return;
    }

    try {
      setLoading(true);

      const endTime = new Date();
      const startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours

      const response = await axios.post('http://localhost:3001/api/sensor-fusion/historical', {
        sensorIds: selectedSensors,
        field,
        method,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        intervalMinutes: 60,
        outlierThreshold,
      });

      setHistoricalData(response.data);
    } catch (error) {
      console.error('Error loading historical data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWeightChange = (sensorId: number, value: number) => {
    setWeights((prev) => ({
      ...prev,
      [sensorId]: value,
    }));
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.9) return '#4caf50';
    if (confidence >= 0.7) return '#8bc34a';
    if (confidence >= 0.5) return '#ff9800';
    return '#f44336';
  };

  const formatHistoricalData = () => {
    return historicalData.map((point) => ({
      time: new Date(point.timestamp).toLocaleString('de-DE', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
      }),
      timestamp: new Date(point.timestamp).getTime(),
      value: point.fusedValue,
      confidence: (point.confidence * 100).toFixed(1),
      variance: point.variance.toFixed(2),
    }));
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Sensor-Fusion
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Kombinieren Sie mehrere Sensor-Messwerte für verbesserte Genauigkeit
        </Typography>
      </Box>

      {/* Configuration Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Konfiguration
        </Typography>

        <Grid container spacing={3}>
          {/* Sensor Selection */}
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" gutterBottom>
              Sensoren auswählen
            </Typography>
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Sensor-Gruppe (optional)</InputLabel>
              <Select
                value={selectedGroup}
                onChange={(e) => handleGroupSelect(e.target.value)}
                label="Sensor-Gruppe (optional)"
              >
                <MenuItem value="">
                  <em>Keine</em>
                </MenuItem>
                {sensorGroups.map((group) => (
                  <MenuItem key={group.id} value={group.id}>
                    {group.name} ({group.sensorIds.length} Sensoren)
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Paper variant="outlined" sx={{ p: 2, maxHeight: 300, overflowY: 'auto' }}>
              <FormGroup>
                {sensors.map((sensor) => (
                  <FormControlLabel
                    key={sensor.id}
                    control={
                      <Checkbox
                        checked={selectedSensors.includes(sensor.id)}
                        onChange={() => handleSensorToggle(sensor.id)}
                      />
                    }
                    label={`${sensor.name} (${sensor.type})`}
                  />
                ))}
              </FormGroup>
              {sensors.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  Keine Sensoren verfügbar
                </Typography>
              )}
            </Paper>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {selectedSensors.length} Sensor(en) ausgewählt
            </Typography>
          </Grid>

          {/* Fusion Settings */}
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" gutterBottom>
              Fusion-Parameter
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Feld</InputLabel>
                  <Select value={field} onChange={(e) => setField(e.target.value)} label="Feld">
                    {Object.entries(fieldLabels).map(([key, label]) => (
                      <MenuItem key={key} value={key}>
                        {label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Methode</InputLabel>
                  <Select
                    value={method}
                    onChange={(e) => setMethod(e.target.value as FusionMethod)}
                    label="Methode"
                  >
                    {Object.entries(methodLabels).map(([key, label]) => (
                      <MenuItem key={key} value={key}>
                        {label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  {methodDescriptions[method]}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="body2" gutterBottom>
                  Outlier-Schwellwert (Z-Score): {outlierThreshold.toFixed(1)}
                </Typography>
                <Slider
                  value={outlierThreshold}
                  onChange={(_, value) => setOutlierThreshold(value as number)}
                  min={1.0}
                  max={3.5}
                  step={0.1}
                  marks
                  valueLabelDisplay="auto"
                />
                <Typography variant="caption" color="text.secondary">
                  Niedrigere Werte = strenger (mehr Ausreißer)
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={autoRefresh}
                      onChange={(e) => setAutoRefresh(e.target.checked)}
                    />
                  }
                  label="Auto-Refresh (10s)"
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Weights Configuration */}
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" gutterBottom>
              Gewichtung (nur für gewichteter Durchschnitt)
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, maxHeight: 300, overflowY: 'auto' }}>
              {selectedSensors.length > 0 ? (
                selectedSensors.map((sensorId) => {
                  const sensor = sensors.find((s) => s.id === sensorId);
                  return (
                    <Box key={sensorId} sx={{ mb: 2 }}>
                      <Typography variant="body2" gutterBottom>
                        {sensor?.name}: {(weights[sensorId] || 1.0).toFixed(1)}
                      </Typography>
                      <Slider
                        value={weights[sensorId] || 1.0}
                        onChange={(_, value) => handleWeightChange(sensorId, value as number)}
                        min={0.1}
                        max={3.0}
                        step={0.1}
                        disabled={method !== 'weighted_average'}
                        size="small"
                      />
                    </Box>
                  );
                })
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Wählen Sie Sensoren aus, um Gewichte zu konfigurieren
                </Typography>
              )}
            </Paper>
          </Grid>

          {/* Action Buttons */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<PlayIcon />}
                onClick={handleFuseSensors}
                disabled={loading || selectedSensors.length < 2}
              >
                Fusion durchführen
              </Button>
              {selectedGroup && (
                <Button
                  variant="outlined"
                  startIcon={<PlayIcon />}
                  onClick={handleFuseGroup}
                  disabled={loading}
                >
                  Gruppe fusionieren
                </Button>
              )}
              <Button
                variant="outlined"
                startIcon={<TimelineIcon />}
                onClick={handleLoadHistorical}
                disabled={loading || selectedSensors.length < 2}
              >
                Historisch (24h)
              </Button>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleFuseSensors}
                disabled={loading || selectedSensors.length < 2}
              >
                Aktualisieren
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Loading */}
      {loading && <LinearProgress sx={{ mb: 3 }} />}

      {/* Fusion Results */}
      {fusionResult && (
        <Box sx={{ mb: 3 }}>
          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">
                    Fusionierter Wert
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {fusionResult.fusedValue.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {fieldLabels[field]}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">
                    Konfidenz
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{ color: getConfidenceColor(fusionResult.confidence) }}
                  >
                    {(fusionResult.confidence * 100).toFixed(1)}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={fusionResult.confidence * 100}
                    sx={{
                      mt: 1,
                      '& .MuiLinearProgress-bar': {
                        bgcolor: getConfidenceColor(fusionResult.confidence),
                      },
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">
                    Sensoren verwendet
                  </Typography>
                  <Typography variant="h4">{fusionResult.sensorCount}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    von {selectedSensors.length} ausgewählt
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {fusionResult.outliers.length > 0 ? (
                      <WarningIcon color="warning" />
                    ) : (
                      <CheckCircleIcon color="success" />
                    )}
                    <Typography variant="caption" color="text.secondary">
                      Ausreißer
                    </Typography>
                  </Box>
                  <Typography variant="h4" color={fusionResult.outliers.length > 0 ? 'warning.main' : 'success.main'}>
                    {fusionResult.outliers.length}
                  </Typography>
                  {fusionResult.outliers.length > 0 && (
                    <Typography variant="body2" color="text.secondary">
                      {fusionResult.outliers.map((id) => sensors.find((s) => s.id === id)?.name).join(', ')}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Statistics */}
          {fusionResult.details && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Statistiken
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={6} md={2}>
                  <Typography variant="caption" color="text.secondary">
                    Minimum
                  </Typography>
                  <Typography variant="h6">{fusionResult.details.min.toFixed(2)}</Typography>
                </Grid>
                <Grid item xs={6} md={2}>
                  <Typography variant="caption" color="text.secondary">
                    Maximum
                  </Typography>
                  <Typography variant="h6">{fusionResult.details.max.toFixed(2)}</Typography>
                </Grid>
                <Grid item xs={6} md={2}>
                  <Typography variant="caption" color="text.secondary">
                    Durchschnitt
                  </Typography>
                  <Typography variant="h6">{fusionResult.details.average.toFixed(2)}</Typography>
                </Grid>
                <Grid item xs={6} md={2}>
                  <Typography variant="caption" color="text.secondary">
                    Median
                  </Typography>
                  <Typography variant="h6">{fusionResult.details.median.toFixed(2)}</Typography>
                </Grid>
                <Grid item xs={6} md={2}>
                  <Typography variant="caption" color="text.secondary">
                    Standardabweichung
                  </Typography>
                  <Typography variant="h6">{fusionResult.details.stdDev.toFixed(2)}</Typography>
                </Grid>
                <Grid item xs={6} md={2}>
                  <Typography variant="caption" color="text.secondary">
                    Varianz
                  </Typography>
                  <Typography variant="h6">{fusionResult.variance.toFixed(2)}</Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Alert severity="info" icon={<InfoIcon />}>
                <Typography variant="subtitle2" gutterBottom>
                  Methode: {methodLabels[fusionResult.method]}
                </Typography>
                <Typography variant="body2">{methodDescriptions[fusionResult.method]}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Zeitstempel: {new Date(fusionResult.timestamp).toLocaleString('de-DE')}
                </Typography>
              </Alert>
            </Paper>
          )}
        </Box>
      )}

      {/* Historical Data Chart */}
      {historicalData.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Historische Fusion (letzte 24 Stunden)
          </Typography>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={formatHistoricalData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="value"
                fill="#2196f3"
                stroke="#2196f3"
                fillOpacity={0.3}
                name="Fusionierter Wert"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="confidence"
                stroke="#4caf50"
                strokeWidth={2}
                dot={{ r: 2 }}
                name="Konfidenz (%)"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </Paper>
      )}

      {/* Empty State */}
      {!fusionResult && !loading && (
        <Paper sx={{ p: 5, textAlign: 'center' }}>
          <TimelineIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Keine Fusion durchgeführt
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Wählen Sie mindestens 2 Sensoren aus und konfigurieren Sie die Fusion-Parameter
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
