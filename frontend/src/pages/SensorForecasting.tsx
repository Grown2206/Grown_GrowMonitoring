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
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  Timeline as TimelineIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  Science as ScienceIcon,
} from '@mui/icons-material';
import axios from 'axios';
import {
  LineChart,
  Line,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Scatter,
  ScatterChart,
  ZAxis,
} from 'recharts';

type ForecastMethod = 'sma' | 'ema' | 'linear_regression' | 'arima_simple';

interface ForecastResult {
  sensorId: number;
  sensorName: string;
  field: string;
  method: ForecastMethod;
  predictions: Array<{
    timestamp: string;
    predictedValue: number;
    confidence: {
      lower: number;
      upper: number;
    };
  }>;
  trend: 'increasing' | 'decreasing' | 'stable';
  trendStrength: number;
  accuracy: {
    mae: number;
    rmse: number;
    mape: number;
  };
  trainingPeriod: {
    start: string;
    end: string;
    samples: number;
  };
  timestamp: string;
}

interface TrendAnalysis {
  sensorId: number;
  sensorName: string;
  field: string;
  direction: 'increasing' | 'decreasing' | 'stable';
  slope: number;
  strength: number;
  forecast24h: number;
  forecast48h: number;
  periodHours: number;
  timestamp: string;
}

interface AnomalyDetection {
  sensorId: number;
  sensorName: string;
  field: string;
  anomalies: Array<{
    timestamp: string;
    actualValue: number;
    expectedValue: number;
    deviation: number;
    severity: 'low' | 'medium' | 'high';
    description: string;
  }>;
  totalAnomalies: number;
  anomalyRate: number;
  timestamp: string;
}

interface Sensor {
  id: number;
  name: string;
  type: string;
}

const methodLabels: Record<ForecastMethod, string> = {
  sma: 'Simple Moving Average (SMA)',
  ema: 'Exponential Moving Average (EMA)',
  linear_regression: 'Linear Regression',
  arima_simple: 'ARIMA (Simplified)',
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

const severityColors: Record<string, string> = {
  low: '#ff9800',
  medium: '#ff5722',
  high: '#f44336',
};

export function SensorForecasting() {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [forecastResult, setForecastResult] = useState<ForecastResult | null>(null);
  const [trendAnalysis, setTrendAnalysis] = useState<TrendAnalysis | null>(null);
  const [anomalies, setAnomalies] = useState<AnomalyDetection | null>(null);
  const [loading, setLoading] = useState(false);

  // Configuration
  const [sensorId, setSensorId] = useState<string>('');
  const [field, setField] = useState<string>('temperature');
  const [method, setMethod] = useState<ForecastMethod>('ema');
  const [trainingHours, setTrainingHours] = useState<number>(72);
  const [forecastSteps, setForecastSteps] = useState<number>(24);
  const [confidenceLevel, setConfidenceLevel] = useState<number>(95);

  useEffect(() => {
    loadSensors();
  }, []);

  const loadSensors = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/sensors');
      setSensors(response.data);
      if (response.data.length > 0) {
        setSensorId(response.data[0].id.toString());
      }
    } catch (error) {
      console.error('Error loading sensors:', error);
    }
  };

  const handleGenerateForecast = async () => {
    if (!sensorId) {
      alert('Bitte wählen Sie einen Sensor aus');
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `http://localhost:3001/api/sensor-forecasting/forecast/${sensorId}`,
        {
          field,
          method,
          trainingHours,
          forecastSteps,
          confidenceLevel,
        }
      );

      setForecastResult(response.data);
    } catch (error) {
      console.error('Error generating forecast:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeTrend = async () => {
    if (!sensorId) return;

    try {
      setLoading(true);

      const response = await axios.post(
        `http://localhost:3001/api/sensor-forecasting/trend/${sensorId}`,
        {
          field,
          periodHours: trainingHours,
        }
      );

      setTrendAnalysis(response.data);
    } catch (error) {
      console.error('Error analyzing trend:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDetectAnomalies = async () => {
    if (!sensorId) return;

    try {
      setLoading(true);

      const response = await axios.post(
        `http://localhost:3001/api/sensor-forecasting/anomalies/${sensorId}`,
        {
          field,
          lookbackHours: trainingHours,
          method: 'statistical',
          sensitivityStdDev: 2.5,
        }
      );

      setAnomalies(response.data);
    } catch (error) {
      console.error('Error detecting anomalies:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'increasing':
        return <TrendingUpIcon color="success" />;
      case 'decreasing':
        return <TrendingDownIcon color="error" />;
      default:
        return <TrendingFlatIcon color="info" />;
    }
  };

  const formatForecastData = () => {
    if (!forecastResult) return [];

    return forecastResult.predictions.map((pred) => ({
      time: new Date(pred.timestamp).toLocaleString('de-DE', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
      }),
      timestamp: new Date(pred.timestamp).getTime(),
      prediction: pred.predictedValue,
      lower: pred.confidence.lower,
      upper: pred.confidence.upper,
    }));
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Sensor Forecasting & Predictions
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Zeitreihen-Vorhersagen mit statistischen Methoden und Anomalie-Erkennung
        </Typography>
      </Box>

      {/* Configuration Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Konfiguration
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Sensor</InputLabel>
              <Select
                value={sensorId}
                onChange={(e) => setSensorId(e.target.value)}
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
              <Select value={field} onChange={(e) => setField(e.target.value)} label="Feld">
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
              <InputLabel>Methode</InputLabel>
              <Select
                value={method}
                onChange={(e) => setMethod(e.target.value as ForecastMethod)}
                label="Methode"
              >
                {Object.entries(methodLabels).map(([key, label]) => (
                  <MenuItem key={key} value={key}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Training-Zeitraum (Stunden)"
              type="number"
              value={trainingHours}
              onChange={(e) => setTrainingHours(parseInt(e.target.value))}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Vorhersage-Schritte"
              type="number"
              value={forecastSteps}
              onChange={(e) => setForecastSteps(parseInt(e.target.value))}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Konfidenz-Level (%)"
              type="number"
              value={confidenceLevel}
              onChange={(e) => setConfidenceLevel(parseInt(e.target.value))}
              inputProps={{ min: 50, max: 99 }}
            />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<TimelineIcon />}
                onClick={handleGenerateForecast}
                disabled={loading || !sensorId}
              >
                Forecast erstellen
              </Button>
              <Button
                variant="outlined"
                startIcon={<TrendingUpIcon />}
                onClick={handleAnalyzeTrend}
                disabled={loading || !sensorId}
              >
                Trend analysieren
              </Button>
              <Button
                variant="outlined"
                startIcon={<WarningIcon />}
                onClick={handleDetectAnomalies}
                disabled={loading || !sensorId}
              >
                Anomalien erkennen
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Loading */}
      {loading && <LinearProgress sx={{ mb: 3 }} />}

      {/* Forecast Results */}
      {forecastResult && (
        <Box sx={{ mb: 3 }}>
          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    {getTrendIcon(forecastResult.trend)}
                    <Typography variant="caption" color="text.secondary">
                      Trend
                    </Typography>
                  </Box>
                  <Typography variant="h6">
                    {forecastResult.trend === 'increasing' && 'Steigend'}
                    {forecastResult.trend === 'decreasing' && 'Fallend'}
                    {forecastResult.trend === 'stable' && 'Stabil'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Stärke: {forecastResult.trendStrength.toFixed(1)}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">
                    MAE (Mean Abs. Error)
                  </Typography>
                  <Typography variant="h6">{forecastResult.accuracy.mae.toFixed(2)}</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">
                    RMSE (Root MSE)
                  </Typography>
                  <Typography variant="h6">{forecastResult.accuracy.rmse.toFixed(2)}</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">
                    MAPE (%)
                  </Typography>
                  <Typography variant="h6">{forecastResult.accuracy.mape.toFixed(1)}%</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Forecast Chart */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Vorhersage - {methodLabels[forecastResult.method]}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Training: {forecastResult.trainingPeriod.samples} Samples ({new Date(forecastResult.trainingPeriod.start).toLocaleDateString()} - {new Date(forecastResult.trainingPeriod.end).toLocaleDateString()})
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={formatForecastData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="upper"
                  stackId="1"
                  stroke="transparent"
                  fill="#e3f2fd"
                  name="Konfidenz (Oben)"
                />
                <Area
                  type="monotone"
                  dataKey="lower"
                  stackId="2"
                  stroke="transparent"
                  fill="#e3f2fd"
                  name="Konfidenz (Unten)"
                />
                <Line
                  type="monotone"
                  dataKey="prediction"
                  stroke="#2196f3"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="Vorhersage"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Box>
      )}

      {/* Trend Analysis */}
      {trendAnalysis && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Trend-Analyse
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {getTrendIcon(trendAnalysis.direction)}
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Richtung
                  </Typography>
                  <Typography variant="h6">
                    {trendAnalysis.direction === 'increasing' && 'Steigend'}
                    {trendAnalysis.direction === 'decreasing' && 'Fallend'}
                    {trendAnalysis.direction === 'stable' && 'Stabil'}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="caption" color="text.secondary">
                Steigung (pro Stunde)
              </Typography>
              <Typography variant="h6">{trendAnalysis.slope.toFixed(4)}</Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="caption" color="text.secondary">
                Stärke (R²)
              </Typography>
              <Typography variant="h6">{(trendAnalysis.strength * 100).toFixed(1)}%</Typography>
              <LinearProgress
                variant="determinate"
                value={trendAnalysis.strength * 100}
                sx={{ mt: 1 }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="caption" color="text.secondary">
                Zeitraum
              </Typography>
              <Typography variant="h6">{trendAnalysis.periodHours}h</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Alert severity="info" icon={<InfoIcon />}>
                <Typography variant="subtitle2">24h Vorhersage</Typography>
                <Typography variant="h5">{trendAnalysis.forecast24h.toFixed(2)}</Typography>
              </Alert>
            </Grid>
            <Grid item xs={12} md={6}>
              <Alert severity="info" icon={<InfoIcon />}>
                <Typography variant="subtitle2">48h Vorhersage</Typography>
                <Typography variant="h5">{trendAnalysis.forecast48h.toFixed(2)}</Typography>
              </Alert>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Anomalies */}
      {anomalies && (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Anomalie-Erkennung</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Chip
                label={`${anomalies.totalAnomalies} Anomalien`}
                color={anomalies.totalAnomalies > 0 ? 'error' : 'success'}
              />
              <Chip label={`${anomalies.anomalyRate.toFixed(1)}% Rate`} />
            </Box>
          </Box>

          {anomalies.totalAnomalies === 0 ? (
            <Alert severity="success">
              Keine Anomalien im analysierten Zeitraum erkannt
            </Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Zeitpunkt</TableCell>
                    <TableCell align="right">Ist-Wert</TableCell>
                    <TableCell align="right">Erwarteter Wert</TableCell>
                    <TableCell align="right">Abweichung</TableCell>
                    <TableCell>Schwere</TableCell>
                    <TableCell>Beschreibung</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {anomalies.anomalies.map((anomaly, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        {new Date(anomaly.timestamp).toLocaleString('de-DE')}
                      </TableCell>
                      <TableCell align="right">{anomaly.actualValue.toFixed(2)}</TableCell>
                      <TableCell align="right">{anomaly.expectedValue.toFixed(2)}</TableCell>
                      <TableCell align="right">
                        <Typography
                          sx={{
                            color: severityColors[anomaly.severity],
                            fontWeight: 'bold',
                          }}
                        >
                          {anomaly.deviation > 0 ? '+' : ''}
                          {anomaly.deviation.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={anomaly.severity.toUpperCase()}
                          size="small"
                          sx={{
                            bgcolor: severityColors[anomaly.severity],
                            color: 'white',
                          }}
                        />
                      </TableCell>
                      <TableCell>{anomaly.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}

      {/* Empty State */}
      {!forecastResult && !trendAnalysis && !anomalies && !loading && (
        <Paper sx={{ p: 5, textAlign: 'center' }}>
          <TimelineIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Keine Vorhersage erstellt
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Wählen Sie einen Sensor und eine Methode aus, um eine Forecast zu generieren
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
