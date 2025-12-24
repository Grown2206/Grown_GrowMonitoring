import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
} from '@mui/material';
import { comparisonAPI, plantsAPI } from '../services/api';
import { Plant } from '../types';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export function ComparisonAnalytics() {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Plant comparison state
  const [plants, setPlants] = useState<Plant[]>([]);
  const [selectedPlants, setSelectedPlants] = useState<number[]>([]);
  const [plantComparison, setPlantComparison] = useState<any[]>([]);

  // Cycle comparison state
  const [cycles, setCycles] = useState<any[]>([]);

  // Strain comparison state
  const [strains, setStrains] = useState<any[]>([]);

  useEffect(() => {
    loadPlants();
  }, []);

  useEffect(() => {
    if (tabValue === 1) {
      loadCycles();
    } else if (tabValue === 2) {
      loadStrains();
    }
  }, [tabValue]);

  async function loadPlants() {
    try {
      const response = await plantsAPI.getAll();
      setPlants(response.data);
    } catch (error) {
      console.error('Failed to load plants:', error);
    }
  }

  async function handleComparePlants() {
    if (selectedPlants.length < 2) {
      setError('Bitte wähle mindestens 2 Pflanzen zum Vergleichen aus');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await comparisonAPI.comparePlants(selectedPlants);
      setPlantComparison(response.data);
    } catch (error) {
      console.error('Failed to compare plants:', error);
      setError('Fehler beim Vergleichen der Pflanzen');
    } finally {
      setLoading(false);
    }
  }

  async function loadCycles() {
    setLoading(true);
    setError(null);
    try {
      const response = await comparisonAPI.getCycles(10);
      setCycles(response.data);
    } catch (error) {
      console.error('Failed to load cycles:', error);
      setError('Fehler beim Laden der Grow-Zyklen');
    } finally {
      setLoading(false);
    }
  }

  async function loadStrains() {
    setLoading(true);
    setError(null);
    try {
      const response = await comparisonAPI.getStrains();
      setStrains(response.data);
    } catch (error) {
      console.error('Failed to load strains:', error);
      setError('Fehler beim Laden der Strain-Vergleiche');
    } finally {
      setLoading(false);
    }
  }

  function renderPlantStats(comparison: any) {
    const stats = comparison.statistics;
    if (!stats || Object.keys(stats).length === 0) {
      return <Typography color="text.secondary">Keine Statistiken verfügbar</Typography>;
    }

    return (
      <Grid container spacing={1}>
        {Object.entries(stats).map(([key, value]: [string, any]) => (
          <Grid item xs={6} sm={4} md={3} key={key}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                {getFieldLabel(key)}
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                Ø {value.avg?.toFixed(1)} ({value.min?.toFixed(1)} - {value.max?.toFixed(1)})
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    );
  }

  function getFieldLabel(field: string): string {
    const labels: Record<string, string> = {
      moistureLevel: 'Feuchtigkeit',
      temperature: 'Temperatur',
      humidity: 'Luftfeuchtigkeit',
      co2: 'CO₂',
      par: 'PAR',
      ph: 'pH',
      ec: 'EC',
      tds: 'TDS',
      voc: 'VOC',
      pm25: 'PM2.5',
      light: 'Licht',
    };
    return labels[field] || field;
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <CompareArrowsIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        <Typography variant="h4">Vergleichs-Analysen</Typography>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} variant="fullWidth">
          <Tab label="Pflanzen vergleichen" />
          <Tab label="Grow-Zyklen" />
          <Tab label="Strains" />
        </Tabs>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Tab 1: Plant Comparison */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Pflanzen auswählen
                </Typography>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Pflanzen (mindestens 2)</InputLabel>
                  <Select
                    multiple
                    value={selectedPlants}
                    onChange={(e) => setSelectedPlants(e.target.value as number[])}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((id) => {
                          const plant = plants.find((p) => p.id === id);
                          return <Chip key={id} label={plant?.name} size="small" />;
                        })}
                      </Box>
                    )}
                  >
                    {plants.map((plant) => (
                      <MenuItem key={plant.id} value={plant.id}>
                        {plant.name} ({plant.strainName || 'Unbekannt'})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button variant="contained" onClick={handleComparePlants} disabled={loading || selectedPlants.length < 2}>
                  {loading ? <CircularProgress size={24} /> : 'Vergleichen'}
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {plantComparison.map((comparison, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {comparison.plant.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Strain: {comparison.plant.strainName || 'Unbekannt'} | Phase: {comparison.plant.phase}
                  </Typography>
                  <Box sx={{ mt: 2 }}>{renderPlantStats(comparison)}</Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Tab 2: Cycle Comparison */}
      <TabPanel value={tabValue} index={1}>
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Pflanze</TableCell>
                      <TableCell>Strain</TableCell>
                      <TableCell>Gepflanzt</TableCell>
                      <TableCell>Geerntet</TableCell>
                      <TableCell>Dauer (Tage)</TableCell>
                      <TableCell>Ertrag (g)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cycles.map((cycle, index) => {
                      const totalYield = cycle.harvests?.reduce((sum: number, h: any) => sum + (h.wetWeight || 0), 0) || 0;
                      return (
                        <TableRow key={index}>
                          <TableCell>{cycle.plant.name}</TableCell>
                          <TableCell>{cycle.plant.strainName || '-'}</TableCell>
                          <TableCell>{cycle.plant.plantedDate ? new Date(cycle.plant.plantedDate).toLocaleDateString('de-DE') : '-'}</TableCell>
                          <TableCell>{cycle.plant.harvestDate ? new Date(cycle.plant.harvestDate).toLocaleDateString('de-DE') : '-'}</TableCell>
                          <TableCell>{cycle.duration || '-'}</TableCell>
                          <TableCell>{totalYield.toFixed(0)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            {cycles.length > 0 && (
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Zyklen-Vergleich
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={cycles.map((c) => ({
                          name: c.plant.name,
                          duration: c.duration,
                          yield: c.harvests?.reduce((sum: number, h: any) => sum + (h.wetWeight || 0), 0) || 0,
                        }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="duration" fill="#8884d8" name="Dauer (Tage)" />
                        <Bar yAxisId="right" dataKey="yield" fill="#82ca9d" name="Ertrag (g)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        )}
      </TabPanel>

      {/* Tab 3: Strain Comparison */}
      <TabPanel value={tabValue} index={2}>
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {strains.map((strainData, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {strainData.strain.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Typ: {strainData.strain.type} | Blütezeit: {strainData.strain.floweringWeeks} Wochen
                    </Typography>
                    {strainData.strain.thcContent && (
                      <Typography variant="caption" display="block">
                        THC: {strainData.strain.thcContent}
                      </Typography>
                    )}
                    <Box sx={{ mt: 2 }}>
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            Gesamt Grows
                          </Typography>
                          <Typography variant="h6">{strainData.statistics.totalGrows}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            Ø Ertrag
                          </Typography>
                          <Typography variant="h6">{strainData.statistics.averageYield.toFixed(0)}g</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            Total Ertrag
                          </Typography>
                          <Typography variant="h6">{strainData.statistics.totalYield.toFixed(0)}g</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            Ø Dauer
                          </Typography>
                          <Typography variant="h6">{strainData.statistics.averageDuration.toFixed(0)}d</Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}

            {strains.length > 0 && (
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Strain Performance Vergleich
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={strains.map((s) => ({
                          name: s.strain.name,
                          avgYield: s.statistics.averageYield,
                          totalGrows: s.statistics.totalGrows,
                        }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="avgYield" fill="#8884d8" name="Ø Ertrag (g)" />
                        <Bar yAxisId="right" dataKey="totalGrows" fill="#82ca9d" name="Anzahl Grows" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        )}
      </TabPanel>
    </Container>
  );
}
