import React, { useState, useEffect, useCallback } from 'react';
import { Box, Grid, Card, CardContent, Typography, Paper, LinearProgress, Chip } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SensorData, Plant, Relay } from '../types';
import { sensorsAPI, plantsAPI, relaysAPI } from '../services/api';
import { useWebSocket, useWebSocketConnection } from '../hooks/useWebSocket';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import OpacityIcon from '@mui/icons-material/Opacity';

export function Dashboard() {
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [relays, setRelays] = useState<Relay[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  useWebSocketConnection();

  const handleSensorUpdate = useCallback((data: SensorData) => {
    setSensorData((prev) => [data, ...prev.slice(0, 99)]);
  }, []);

  useWebSocket('sensor_update', handleSensorUpdate);

  useWebSocket('relay_update', (data: any) => {
    setRelays((prev) => prev.map((r) => (r.relayId === data.relayId ? { ...r, status: data.status } : r)));
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Update chart data when sensor data changes
    if (sensorData.length > 0) {
      const chartPoints = sensorData
        .slice(0, 20)
        .reverse()
        .map((d) => ({
          time: new Date(d.timestamp).toLocaleTimeString(),
          Feuchtigkeit: d.moistureLevel,
          Temperatur: d.temperature || 0,
        }));
      setChartData(chartPoints);
    }
  }, [sensorData]);

  async function loadData() {
    try {
      const [sensorRes, plantsRes, relaysRes, historyRes] = await Promise.all([
        sensorsAPI.getLatest(10),
        plantsAPI.getAll(),
        relaysAPI.getAll(),
        sensorsAPI.getHistory(undefined, 24),
      ]);

      setSensorData(sensorRes.data);
      setPlants(plantsRes.data);
      setRelays(relaysRes.data);

      // Initial chart data
      const chartPoints = historyRes.data.slice(-20).map((d: SensorData) => ({
        time: new Date(d.timestamp).toLocaleTimeString(),
        Feuchtigkeit: d.moistureLevel,
        Temperatur: d.temperature || 0,
      }));
      setChartData(chartPoints);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  }

  const activePlants = plants.filter((p) => p.isActive);
  const latestData = sensorData[0];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Overview Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Aktive Pflanzen
              </Typography>
              <Typography variant="h3">{activePlants.length}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <WaterDropIcon color="primary" />
                <Typography color="text.secondary">Feuchtigkeit</Typography>
              </Box>
              <Typography variant="h3">{latestData ? `${latestData.moistureLevel.toFixed(0)}%` : '-'}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <ThermostatIcon color="error" />
                <Typography color="text.secondary">Temperatur</Typography>
              </Box>
              <Typography variant="h3">{latestData?.temperature ? `${latestData.temperature.toFixed(1)}°C` : '-'}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <OpacityIcon color="info" />
                <Typography color="text.secondary">Luftfeuchtigkeit</Typography>
              </Box>
              <Typography variant="h3">{latestData?.humidity ? `${latestData.humidity.toFixed(0)}%` : '-'}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Sensor-Verlauf (24h)
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
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

        {/* Plants Status */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Pflanzen Status
            </Typography>
            {activePlants.map((plant) => {
              const plantData = sensorData.find((d) => d.sensorId === plant.sensorId);
              return (
                <Box key={plant.id} sx={{ mb: 2 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body1">{plant.name}</Typography>
                    <Chip label={plant.phase} size="small" color="primary" />
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body2" color="text.secondary">
                      Feuchtigkeit:
                    </Typography>
                    <Box sx={{ flexGrow: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={plantData?.moistureLevel || 0}
                        sx={{ height: 8, borderRadius: 1 }}
                      />
                    </Box>
                    <Typography variant="body2">{plantData ? `${plantData.moistureLevel.toFixed(0)}%` : '-'}</Typography>
                  </Box>
                </Box>
              );
            })}
          </Paper>
        </Grid>

        {/* Relays Status */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Geräte Status
            </Typography>
            <Grid container spacing={2}>
              {relays.map((relay) => (
                <Grid item xs={6} key={relay.id}>
                  <Box
                    sx={{
                      p: 2,
                      border: 1,
                      borderColor: relay.status ? 'success.main' : 'grey.300',
                      borderRadius: 1,
                      bgcolor: relay.status ? 'success.light' : 'grey.50',
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {relay.name}
                    </Typography>
                    <Typography variant="h6">{relay.status ? 'EIN' : 'AUS'}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
