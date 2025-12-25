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
  Divider,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts';
import axios from 'axios';
import RefreshIcon from '@mui/icons-material/Refresh';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SpaIcon from '@mui/icons-material/Spa';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import OpacityIcon from '@mui/icons-material/Opacity';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import ScaleIcon from '@mui/icons-material/Scale';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

interface Plant {
  id: number;
  name: string;
  strainId?: number;
  phase: string;
  isActive: boolean;
}

interface Strain {
  id: number;
  name: string;
  type: string;
  floweringWeeks: number;
}

interface YieldPrediction {
  plantId: number;
  plantName: string;
  strainName: string;
  method: string;
  predictedYield: number;
  confidenceScore: number;
  expectedRange: {
    min: number;
    max: number;
  };
  estimatedDaysToHarvest: number;
  factors: {
    strainQuality: number;
    growthProgress: number;
    environmentalScore: number;
    historicalData: boolean;
  };
  recommendations: string[];
  timestamp: Date;
}

interface StrainStatistics {
  strainId: number;
  strainName: string;
  totalHarvests: number;
  averageYield: number;
  minYield: number;
  maxYield: number;
  stdDeviation: number;
  averageGrowDays: number;
  successRate: number;
}

interface PredictionMethod {
  id: string;
  name: string;
  description: string;
}

export function YieldPrediction() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [strains, setStrains] = useState<Strain[]>([]);
  const [selectedPlantId, setSelectedPlantId] = useState<number | ''>('');
  const [selectedMethod, setSelectedMethod] = useState<string>('combined');
  const [prediction, setPrediction] = useState<YieldPrediction | null>(null);
  const [strainStats, setStrainStats] = useState<StrainStatistics | null>(null);
  const [methods, setMethods] = useState<PredictionMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [plantsRes, strainsRes, methodsRes] = await Promise.all([
        axios.get(`${API_URL}/plants`, { headers }),
        axios.get(`${API_URL}/strains`, { headers }),
        axios.get(`${API_URL}/yield-prediction/methods`, { headers }),
      ]);

      const activePlants = plantsRes.data.filter((p: Plant) => p.isActive && p.phase !== 'harvested');
      setPlants(activePlants);
      setStrains(strainsRes.data);
      setMethods(methodsRes.data);

      if (activePlants.length > 0) {
        setSelectedPlantId(activePlants[0].id);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Fehler beim Laden der Daten');
    }
  };

  const loadPrediction = async () => {
    if (!selectedPlantId) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const predictionRes = await axios.post(
        `${API_URL}/yield-prediction/predict/${selectedPlantId}`,
        { method: selectedMethod },
        { headers }
      );

      setPrediction(predictionRes.data);

      // Load strain statistics if available
      const plant = plants.find((p) => p.id === selectedPlantId);
      if (plant?.strainId) {
        const statsRes = await axios.get(
          `${API_URL}/yield-prediction/strain-statistics/${plant.strainId}`,
          { headers }
        );
        setStrainStats(statsRes.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Fehler beim Laden der Prognose');
      setPrediction(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedPlantId) {
      loadPrediction();
    }
  }, [selectedPlantId, selectedMethod]);

  const getConfidenceColor = (score: number): string => {
    if (score >= 80) return '#4caf50';
    if (score >= 60) return '#ff9800';
    return '#f44336';
  };

  const getConfidenceLabel = (score: number): string => {
    if (score >= 80) return 'Hoch';
    if (score >= 60) return 'Mittel';
    return 'Niedrig';
  };

  const getProgressColor = (value: number): 'success' | 'warning' | 'info' => {
    if (value >= 75) return 'success';
    if (value >= 50) return 'warning';
    return 'info';
  };

  const formatYieldRange = (prediction: YieldPrediction): string => {
    return `${prediction.expectedRange.min}g - ${prediction.expectedRange.max}g`;
  };

  // Prepare radar chart data
  const radarData = prediction
    ? [
        {
          factor: 'Sortenqualität',
          value: prediction.factors.strainQuality,
          fullMark: 100,
        },
        {
          factor: 'Wachstumsfortschritt',
          value: prediction.factors.growthProgress,
          fullMark: 100,
        },
        {
          factor: 'Umgebungsbedingungen',
          value: prediction.factors.environmentalScore,
          fullMark: 100,
        },
      ]
    : [];

  // Prepare comparison chart data
  const comparisonData = strainStats
    ? [
        { name: 'Minimum', value: strainStats.minYield },
        { name: 'Durchschnitt', value: strainStats.averageYield },
        { name: 'Prognose', value: prediction?.predictedYield || 0 },
        { name: 'Maximum', value: strainStats.maxYield },
      ]
    : [];

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ScaleIcon />
        Ertrags-Prognosen
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Vorhersage von Ernte-Erträgen basierend auf historischen Daten, Sorte und Umgebungsbedingungen
      </Typography>

      {/* Selection Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={5}>
              <FormControl fullWidth size="small">
                <InputLabel>Pflanze</InputLabel>
                <Select
                  value={selectedPlantId}
                  onChange={(e) => setSelectedPlantId(e.target.value as number)}
                  label="Pflanze"
                >
                  {plants.map((plant) => (
                    <MenuItem key={plant.id} value={plant.id}>
                      {plant.name} ({plant.phase})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={5}>
              <FormControl fullWidth size="small">
                <InputLabel>Prognosemethode</InputLabel>
                <Select
                  value={selectedMethod}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                  label="Prognosemethode"
                >
                  {methods.map((method) => (
                    <MenuItem key={method.id} value={method.id}>
                      {method.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="contained"
                onClick={loadPrediction}
                disabled={loading || !selectedPlantId}
                startIcon={loading ? <CircularProgress size={16} /> : <RefreshIcon />}
              >
                Aktualisieren
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

      {prediction && (
        <>
          {/* Main Prediction Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
                    Prognostizierter Ertrag
                  </Typography>
                  <Typography variant="h3" sx={{ color: 'white', fontWeight: 'bold' }}>
                    {prediction.predictedYield}g
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 1 }}>
                    Erwartete Spanne: {formatYieldRange(prediction)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingUpIcon />
                    Konfidenz-Score
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Typography variant="h3" sx={{ color: getConfidenceColor(prediction.confidenceScore) }}>
                      {prediction.confidenceScore}%
                    </Typography>
                    <Chip
                      label={getConfidenceLabel(prediction.confidenceScore)}
                      color={
                        prediction.confidenceScore >= 80
                          ? 'success'
                          : prediction.confidenceScore >= 60
                          ? 'warning'
                          : 'error'
                      }
                    />
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={prediction.confidenceScore}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'rgba(0,0,0,0.1)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getConfidenceColor(prediction.confidenceScore),
                      },
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SpaIcon />
                    Bis zur Ernte
                  </Typography>
                  <Typography variant="h3" sx={{ color: '#4caf50' }}>
                    {prediction.estimatedDaysToHarvest}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Tage verbleibend
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Factors Analysis */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Einflussfaktoren
                  </Typography>
                  <Stack spacing={2} sx={{ mt: 2 }}>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2">Sortenqualität</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {prediction.factors.strainQuality}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={prediction.factors.strainQuality}
                        color={getProgressColor(prediction.factors.strainQuality)}
                      />
                    </Box>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2">Wachstumsfortschritt</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {prediction.factors.growthProgress}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={prediction.factors.growthProgress}
                        color={getProgressColor(prediction.factors.growthProgress)}
                      />
                    </Box>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2">Umgebungsbedingungen</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {prediction.factors.environmentalScore}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={prediction.factors.environmentalScore}
                        color={getProgressColor(prediction.factors.environmentalScore)}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                      {prediction.factors.historicalData ? (
                        <>
                          <CheckCircleIcon color="success" fontSize="small" />
                          <Typography variant="body2" color="success.main">
                            Historische Daten verfügbar
                          </Typography>
                        </>
                      ) : (
                        <>
                          <WarningIcon color="warning" fontSize="small" />
                          <Typography variant="body2" color="warning.main">
                            Keine historischen Daten - Standard-Schätzung
                          </Typography>
                        </>
                      )}
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Faktoren-Analyse
                  </Typography>
                  <ResponsiveContainer width="100%" height={250}>
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="factor" tick={{ fontSize: 12 }} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} />
                      <Radar
                        name="Wert"
                        dataKey="value"
                        stroke="#667eea"
                        fill="#667eea"
                        fillOpacity={0.6}
                      />
                      <RechartsTooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Strain Statistics Comparison */}
          {strainStats && strainStats.totalHarvests > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Sorten-Statistiken: {strainStats.strainName}
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={8}>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={comparisonData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis label={{ value: 'Ertrag (g)', angle: -90, position: 'insideLeft' }} />
                        <RechartsTooltip />
                        <Bar dataKey="value" fill="#667eea" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Stack spacing={2}>
                      <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                        <Typography variant="body2" color="text.secondary">
                          Anzahl Ernten
                        </Typography>
                        <Typography variant="h6">{strainStats.totalHarvests}</Typography>
                      </Paper>
                      <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                        <Typography variant="body2" color="text.secondary">
                          Durchschn. Wachstumsdauer
                        </Typography>
                        <Typography variant="h6">{Math.round(strainStats.averageGrowDays)} Tage</Typography>
                      </Paper>
                      <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                        <Typography variant="body2" color="text.secondary">
                          Erfolgsrate
                        </Typography>
                        <Typography variant="h6">{Math.round(strainStats.successRate)}%</Typography>
                      </Paper>
                      <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                        <Typography variant="body2" color="text.secondary">
                          Standardabweichung
                        </Typography>
                        <Typography variant="h6">±{Math.round(strainStats.stdDeviation)}g</Typography>
                      </Paper>
                    </Stack>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {prediction.recommendations.length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Empfehlungen zur Ertragsoptimierung
                </Typography>
                <Stack spacing={1.5} sx={{ mt: 2 }}>
                  {prediction.recommendations.map((rec, index) => (
                    <Alert key={index} severity="info" icon={<TrendingUpIcon />}>
                      {rec}
                    </Alert>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {!prediction && !loading && selectedPlantId && (
        <Alert severity="info">Wählen Sie eine Pflanze und Methode aus, um eine Prognose zu erstellen.</Alert>
      )}
    </Box>
  );
}
