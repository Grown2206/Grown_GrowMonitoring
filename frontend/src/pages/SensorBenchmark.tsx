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
  Tooltip as MuiTooltip,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Divider,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CompareArrows as CompareIcon,
  ExpandMore as ExpandMoreIcon,
  Science as ScienceIcon,
} from '@mui/icons-material';
import axios from 'axios';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface BenchmarkBaseline {
  field: string;
  expectedValue?: number;
  expectedRange?: { min: number; max: number };
  tolerancePercent?: number;
  driftThreshold?: number;
}

interface SensorPerformanceScore {
  sensorId: number;
  sensorName: string;
  field: string;
  score: number;
  accuracy: number;
  consistency: number;
  reliability: number;
  drift: number;
  issues: string[];
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  recommendations: string[];
}

interface BenchmarkReport {
  field: string;
  baseline: BenchmarkBaseline;
  sensors: SensorPerformanceScore[];
  summary: {
    bestSensor: number | null;
    worstSensor: number | null;
    averageScore: number;
    totalIssues: number;
  };
  timestamp: string;
}

interface DriftAnalysis {
  sensorId: number;
  field: string;
  startValue: number;
  endValue: number;
  driftAmount: number;
  driftPercent: number;
  isDrifting: boolean;
  period: string;
  timestamp: string;
}

interface Sensor {
  id: number;
  name: string;
  type: string;
}

const fieldLabels: Record<string, string> = {
  temperature: 'Temperatur',
  humidity: 'Luftfeuchtigkeit',
  soilMoisture: 'Bodenfeuchtigkeit',
  vpd: 'VPD',
  lightIntensity: 'Lichtintensität',
  co2: 'CO2',
  ph: 'pH-Wert',
};

const gradeColors: Record<string, string> = {
  A: '#4caf50',
  B: '#8bc34a',
  C: '#ff9800',
  D: '#ff5722',
  F: '#f44336',
};

export function SensorBenchmark() {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [selectedSensors, setSelectedSensors] = useState<number[]>([]);
  const [benchmarkReport, setBenchmarkReport] = useState<BenchmarkReport | null>(null);
  const [driftAnalysis, setDriftAnalysis] = useState<DriftAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Baseline configuration
  const [field, setField] = useState('temperature');
  const [expectedValue, setExpectedValue] = useState<number>(25);
  const [minRange, setMinRange] = useState<number>(20);
  const [maxRange, setMaxRange] = useState<number>(30);
  const [useRange, setUseRange] = useState(true);
  const [tolerancePercent, setTolerancePercent] = useState<number>(5);
  const [driftThreshold, setDriftThreshold] = useState<number>(2);
  const [lookbackHours, setLookbackHours] = useState<number>(24);

  useEffect(() => {
    loadSensors();
  }, []);

  const loadSensors = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/sensors');
      setSensors(response.data);
    } catch (error) {
      console.error('Error loading sensors:', error);
    }
  };

  const handleSensorToggle = (sensorId: number) => {
    setSelectedSensors((prev) =>
      prev.includes(sensorId) ? prev.filter((id) => id !== sensorId) : [...prev, sensorId]
    );
  };

  const handleRunBenchmark = async () => {
    if (selectedSensors.length === 0) {
      alert('Bitte wählen Sie mindestens einen Sensor aus');
      return;
    }

    try {
      setLoading(true);

      const baseline: BenchmarkBaseline = {
        field,
        tolerancePercent,
        driftThreshold,
      };

      if (useRange) {
        baseline.expectedRange = { min: minRange, max: maxRange };
      } else {
        baseline.expectedValue = expectedValue;
      }

      const response = await axios.post('http://localhost:3001/api/sensor-benchmark/benchmark', {
        sensorIds: selectedSensors,
        baseline,
        lookbackHours,
      });

      setBenchmarkReport(response.data);
    } catch (error) {
      console.error('Error running benchmark:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeDrift = async () => {
    try {
      setLoading(true);
      const driftPromises = selectedSensors.map(async (sensorId) => {
        try {
          const response = await axios.post(
            `http://localhost:3001/api/sensor-benchmark/drift/${sensorId}`,
            {
              field,
              lookbackHours,
            }
          );
          return response.data;
        } catch (error) {
          return null;
        }
      });

      const results = await Promise.all(driftPromises);
      setDriftAnalysis(results.filter((r) => r !== null));
    } catch (error) {
      console.error('Error analyzing drift:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadExampleBaseline = (example: string) => {
    const examples: Record<string, any> = {
      temperature: {
        field: 'temperature',
        expectedRange: { min: 20, max: 28 },
        tolerancePercent: 5,
        driftThreshold: 2,
      },
      humidity: {
        field: 'humidity',
        expectedRange: { min: 40, max: 70 },
        tolerancePercent: 10,
        driftThreshold: 5,
      },
    };

    if (examples[example]) {
      setField(examples[example].field);
      setUseRange(true);
      setMinRange(examples[example].expectedRange.min);
      setMaxRange(examples[example].expectedRange.max);
      setTolerancePercent(examples[example].tolerancePercent);
      setDriftThreshold(examples[example].driftThreshold);
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return '#4caf50';
    if (score >= 80) return '#8bc34a';
    if (score >= 70) return '#ff9800';
    if (score >= 60) return '#ff5722';
    return '#f44336';
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Sensor-Benchmarking
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Vergleichen Sie Sensoren gegen Baselines und untereinander für Qualitätssicherung
        </Typography>
      </Box>

      {/* Configuration Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Benchmark-Konfiguration
        </Typography>

        <Grid container spacing={3}>
          {/* Sensor Selection */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Sensoren auswählen
            </Typography>
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
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              {selectedSensors.length} Sensor(en) ausgewählt
            </Typography>
          </Grid>

          {/* Baseline Configuration */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Baseline-Parameter
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Button size="small" onClick={() => loadExampleBaseline('temperature')}>
                    Temperatur-Preset
                  </Button>
                  <Button size="small" onClick={() => loadExampleBaseline('humidity')}>
                    Feuchtigkeits-Preset
                  </Button>
                </Box>
              </Grid>
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
                <FormControlLabel
                  control={
                    <Checkbox checked={useRange} onChange={(e) => setUseRange(e.target.checked)} />
                  }
                  label="Wertebereich statt Einzelwert"
                />
              </Grid>

              {useRange ? (
                <>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Min. Wert"
                      type="number"
                      value={minRange}
                      onChange={(e) => setMinRange(parseFloat(e.target.value))}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Max. Wert"
                      type="number"
                      value={maxRange}
                      onChange={(e) => setMaxRange(parseFloat(e.target.value))}
                    />
                  </Grid>
                </>
              ) : (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Erwarteter Wert"
                    type="number"
                    value={expectedValue}
                    onChange={(e) => setExpectedValue(parseFloat(e.target.value))}
                  />
                </Grid>
              )}

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Toleranz (%)"
                  type="number"
                  value={tolerancePercent}
                  onChange={(e) => setTolerancePercent(parseFloat(e.target.value))}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Drift-Schwellwert"
                  type="number"
                  value={driftThreshold}
                  onChange={(e) => setDriftThreshold(parseFloat(e.target.value))}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Zeitraum (Stunden)"
                  type="number"
                  value={lookbackHours}
                  onChange={(e) => setLookbackHours(parseFloat(e.target.value))}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Action Buttons */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<AssessmentIcon />}
                onClick={handleRunBenchmark}
                disabled={loading || selectedSensors.length === 0}
              >
                Benchmark durchführen
              </Button>
              <Button
                variant="outlined"
                startIcon={<TrendingUpIcon />}
                onClick={handleAnalyzeDrift}
                disabled={loading || selectedSensors.length === 0}
              >
                Drift analysieren
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Loading */}
      {loading && <LinearProgress sx={{ mb: 3 }} />}

      {/* Results Section */}
      {benchmarkReport && (
        <Box>
          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">
                    Durchschn. Score
                  </Typography>
                  <Typography variant="h4" sx={{ color: getScoreColor(benchmarkReport.summary.averageScore) }}>
                    {benchmarkReport.summary.averageScore.toFixed(1)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">
                    Beste Sensor
                  </Typography>
                  <Typography variant="h6">
                    {benchmarkReport.summary.bestSensor
                      ? sensors.find((s) => s.id === benchmarkReport.summary.bestSensor)?.name
                      : '-'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">
                    Schlechteste Sensor
                  </Typography>
                  <Typography variant="h6">
                    {benchmarkReport.summary.worstSensor
                      ? sensors.find((s) => s.id === benchmarkReport.summary.worstSensor)?.name
                      : '-'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">
                    Probleme gesamt
                  </Typography>
                  <Typography variant="h4" color={benchmarkReport.summary.totalIssues > 0 ? 'error' : 'success.main'}>
                    {benchmarkReport.summary.totalIssues}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Performance Charts */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Sensor-Scores
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={benchmarkReport.sensors}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="sensorName" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="score" name="Gesamt-Score">
                      {benchmarkReport.sensors.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getScoreColor(entry.score)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Leistungs-Radar
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={benchmarkReport.sensors.map((s) => ({
                    sensor: s.sensorName,
                    Genauigkeit: s.accuracy,
                    Konsistenz: s.consistency,
                    Zuverlässigkeit: s.reliability,
                  }))}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="sensor" />
                    <PolarRadiusAxis domain={[0, 100]} />
                    <Radar
                      name="Performance"
                      dataKey="Genauigkeit"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.6}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>

          {/* Detailed Results */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Detaillierte Ergebnisse
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Sensor</TableCell>
                    <TableCell>Note</TableCell>
                    <TableCell align="right">Score</TableCell>
                    <TableCell align="right">Genauigkeit</TableCell>
                    <TableCell align="right">Konsistenz</TableCell>
                    <TableCell align="right">Zuverlässigkeit</TableCell>
                    <TableCell align="right">Drift</TableCell>
                    <TableCell>Probleme</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {benchmarkReport.sensors.map((sensor) => (
                    <TableRow key={sensor.sensorId}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {sensor.sensorId === benchmarkReport.summary.bestSensor && (
                            <CheckCircleIcon color="success" fontSize="small" />
                          )}
                          {sensor.sensorId === benchmarkReport.summary.worstSensor && (
                            <WarningIcon color="warning" fontSize="small" />
                          )}
                          {sensor.sensorName}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={sensor.grade}
                          size="small"
                          sx={{ bgcolor: gradeColors[sensor.grade], color: 'white', fontWeight: 'bold' }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography sx={{ color: getScoreColor(sensor.score), fontWeight: 'bold' }}>
                          {sensor.score.toFixed(1)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">{sensor.accuracy.toFixed(1)}</TableCell>
                      <TableCell align="right">{sensor.consistency.toFixed(1)}</TableCell>
                      <TableCell align="right">{sensor.reliability.toFixed(1)}</TableCell>
                      <TableCell align="right">
                        {sensor.drift.toFixed(2)}
                        {sensor.drift > driftThreshold && <TrendingUpIcon color="error" fontSize="small" />}
                      </TableCell>
                      <TableCell>
                        {sensor.issues.length > 0 ? (
                          <Chip label={`${sensor.issues.length} Problem(e)`} size="small" color="error" />
                        ) : (
                          <Chip label="OK" size="small" color="success" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Sensor Details Accordions */}
            <Box sx={{ mt: 3 }}>
              {benchmarkReport.sensors.map((sensor) => (
                <Accordion key={sensor.sensorId}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography sx={{ fontWeight: 'bold' }}>
                      {sensor.sensorName} - Details & Empfehlungen
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      {sensor.issues.length > 0 && (
                        <Grid item xs={12}>
                          <Alert severity="warning" icon={<WarningIcon />}>
                            <Typography variant="subtitle2" gutterBottom>
                              Probleme:
                            </Typography>
                            <ul style={{ margin: 0, paddingLeft: 20 }}>
                              {sensor.issues.map((issue, idx) => (
                                <li key={idx}>{issue}</li>
                              ))}
                            </ul>
                          </Alert>
                        </Grid>
                      )}
                      {sensor.recommendations.length > 0 && (
                        <Grid item xs={12}>
                          <Alert severity="info" icon={<ScienceIcon />}>
                            <Typography variant="subtitle2" gutterBottom>
                              Empfehlungen:
                            </Typography>
                            <ul style={{ margin: 0, paddingLeft: 20 }}>
                              {sensor.recommendations.map((rec, idx) => (
                                <li key={idx}>{rec}</li>
                              ))}
                            </ul>
                          </Alert>
                        </Grid>
                      )}
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          </Paper>
        </Box>
      )}

      {/* Drift Analysis Results */}
      {driftAnalysis.length > 0 && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Drift-Analyse
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Sensor</TableCell>
                  <TableCell align="right">Start-Wert</TableCell>
                  <TableCell align="right">End-Wert</TableCell>
                  <TableCell align="right">Drift</TableCell>
                  <TableCell align="right">Drift %</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Zeitraum</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {driftAnalysis.map((drift) => {
                  const sensor = sensors.find((s) => s.id === drift.sensorId);
                  return (
                    <TableRow key={drift.sensorId}>
                      <TableCell>{sensor?.name || `Sensor ${drift.sensorId}`}</TableCell>
                      <TableCell align="right">{drift.startValue.toFixed(2)}</TableCell>
                      <TableCell align="right">{drift.endValue.toFixed(2)}</TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {drift.driftAmount >= 0 ? (
                            <TrendingUpIcon fontSize="small" color={drift.isDrifting ? 'error' : 'inherit'} />
                          ) : (
                            <TrendingDownIcon fontSize="small" color={drift.isDrifting ? 'error' : 'inherit'} />
                          )}
                          {Math.abs(drift.driftAmount).toFixed(2)}
                        </Box>
                      </TableCell>
                      <TableCell align="right">{Math.abs(drift.driftPercent).toFixed(1)}%</TableCell>
                      <TableCell>
                        {drift.isDrifting ? (
                          <Chip label="Drift erkannt" size="small" color="error" icon={<ErrorIcon />} />
                        ) : (
                          <Chip label="Stabil" size="small" color="success" icon={<CheckCircleIcon />} />
                        )}
                      </TableCell>
                      <TableCell>{drift.period}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Empty State */}
      {!benchmarkReport && !loading && (
        <Paper sx={{ p: 5, textAlign: 'center' }}>
          <AssessmentIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Kein Benchmark durchgeführt
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Wählen Sie Sensoren aus und konfigurieren Sie die Baseline-Parameter, um einen Benchmark zu starten
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
