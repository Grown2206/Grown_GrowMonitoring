import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, Card, CardContent, MenuItem, TextField, Button } from '@mui/material';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { sensorsAPI, plantsAPI, irrigationAPI, relaysAPI } from '../services/api';
import { SensorData, Plant, Relay } from '../types';
import { ExportDialog, ExportFormat } from '../components/ExportDialog';
import { ExportService } from '../services/exportService';
import DownloadIcon from '@mui/icons-material/Download';
import { useToast } from '../contexts/ToastContext';

export function Analytics() {
  const [sensorHistory, setSensorHistory] = useState<SensorData[]>([]);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [relays, setRelays] = useState<Relay[]>([]);
  const [selectedSensor, setSelectedSensor] = useState<number | ''>('');
  const [timeRange, setTimeRange] = useState(24);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    loadData();
  }, [selectedSensor, timeRange]);

  async function loadData() {
    try {
      const [sensorRes, plantsRes, relaysRes] = await Promise.all([
        sensorsAPI.getHistory(selectedSensor || undefined, timeRange),
        plantsAPI.getAll(),
        relaysAPI.getAll(),
      ]);

      setSensorHistory(Array.isArray(sensorRes.data) ? sensorRes.data : []);
      setPlants(Array.isArray(plantsRes.data) ? plantsRes.data : []);
      setRelays(Array.isArray(relaysRes.data) ? relaysRes.data : []);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  }

  function handleExport(format: ExportFormat, dateRange?: { start: Date; end: Date }) {
    try {
      let filteredData = sensorHistory;

      // Apply date range filter if provided
      if (dateRange) {
        filteredData = sensorHistory.filter((d) => {
          const timestamp = new Date(d.timestamp);
          return timestamp >= dateRange.start && timestamp <= dateRange.end;
        });
      }

      switch (format) {
        case 'csv':
          ExportService.exportSensorDataToCSV(filteredData, `sensor-data-${Date.now()}.csv`);
          break;
        case 'excel':
          ExportService.exportComprehensiveReport(
            filteredData,
            plants,
            relays,
            `grow-report-${Date.now()}.xlsx`
          );
          break;
        case 'json':
          ExportService.exportSensorDataToJSON(filteredData, `sensor-data-${Date.now()}.json`);
          break;
        case 'pdf':
          ExportService.exportAnalyticsReport(filteredData, plants, {
            title: 'Grow Monitoring Analytics Bericht',
            dateRange,
          });
          break;
      }

      showToast(`Export als ${format.toUpperCase()} erfolgreich!`, 'success');
    } catch (error) {
      console.error('Export failed:', error);
      showToast('Export fehlgeschlagen', 'error');
    }
  }

  // Chart data preparation
  const moistureChartData = sensorHistory.map((d) => ({
    time: new Date(d.timestamp).toLocaleTimeString(),
    Feuchtigkeit: d.moistureLevel,
    Temperatur: d.temperature || 0,
  }));

  const plantPhaseData = [
    { name: 'Keimung', value: plants.filter((p) => p.phase === 'germination').length },
    { name: 'Sämling', value: plants.filter((p) => p.phase === 'seedling').length },
    { name: 'Vegetativ', value: plants.filter((p) => p.phase === 'vegetative').length },
    { name: 'Blüte', value: plants.filter((p) => p.phase === 'flowering').length },
    { name: 'Geerntet', value: plants.filter((p) => p.phase === 'harvested').length },
  ].filter((d) => d.value > 0);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // Stats
  const avgMoisture = sensorHistory.length > 0 ? sensorHistory.reduce((sum, d) => sum + d.moistureLevel, 0) / sensorHistory.length : 0;

  const avgTemp = sensorHistory.length > 0 ? sensorHistory.reduce((sum, d) => sum + (d.temperature || 0), 0) / sensorHistory.length : 0;

  const activePlants = plants.filter((p) => p.isActive).length;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Analytics & Statistiken</Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={() => setExportDialogOpen(true)}
          >
            Export
          </Button>
          <TextField
            select
            size="small"
            label="Zeitraum"
            value={timeRange}
            onChange={(e) => setTimeRange(parseInt(e.target.value))}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value={1}>1 Stunde</MenuItem>
            <MenuItem value={6}>6 Stunden</MenuItem>
            <MenuItem value={24}>24 Stunden</MenuItem>
            <MenuItem value={168}>7 Tage</MenuItem>
            <MenuItem value={720}>30 Tage</MenuItem>
          </TextField>
          <TextField
            select
            size="small"
            label="Sensor"
            value={selectedSensor}
            onChange={(e) => setSelectedSensor(e.target.value === '' ? '' : parseInt(e.target.value))}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">Alle</MenuItem>
            {plants.map((p) => (
              <MenuItem key={p.id} value={p.sensorId}>
                Sensor {p.sensorId} ({p.name})
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </Box>

      {/* Export Dialog */}
      <ExportDialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        onExport={handleExport}
        dataType="analytics"
        totalRecords={sensorHistory.length}
      />

      {/* Stats Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Aktive Pflanzen
              </Typography>
              <Typography variant="h3">{activePlants}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Ø Feuchtigkeit
              </Typography>
              <Typography variant="h3">{avgMoisture.toFixed(1)}%</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Ø Temperatur
              </Typography>
              <Typography variant="h3">{avgTemp.toFixed(1)}°C</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Datenpunkte
              </Typography>
              <Typography variant="h3">{sensorHistory.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Moisture & Temperature Chart */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Sensor-Verlauf
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={moistureChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Feuchtigkeit" stroke="#8884d8" />
                <Line type="monotone" dataKey="Temperatur" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Phase Distribution */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Wachstumsphasen
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie data={plantPhaseData} cx="50%" cy="50%" labelLine={false} label={(entry) => entry.name} outerRadius={80} fill="#8884d8" dataKey="value">
                  {plantPhaseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Plant Stats */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Pflanzen-Statistiken
            </Typography>
            <Grid container spacing={2}>
              {plants
                .filter((p) => p.isActive)
                .map((plant) => {
                  const plantData = sensorHistory.filter((d) => d.sensorId === plant.sensorId);
                  const avgMoisture = plantData.length > 0 ? plantData.reduce((sum, d) => sum + d.moistureLevel, 0) / plantData.length : 0;

                  return (
                    <Grid item xs={12} sm={6} md={4} key={plant.id}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="h6">{plant.name}</Typography>
                          <Typography color="text.secondary">Phase: {plant.phase}</Typography>
                          <Typography>Ø Feuchtigkeit: {avgMoisture.toFixed(1)}%</Typography>
                          <Typography>Sensor: {plant.sensorId}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
