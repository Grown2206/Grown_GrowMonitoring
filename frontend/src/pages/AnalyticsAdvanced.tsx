import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
  Paper,
} from '@mui/material';
import { sensorsAPI } from '../services/api';
import { SensorData } from '../types';
import { CorrelationMatrix } from '../components/analytics/CorrelationMatrix';
import { ScatterPlotChart } from '../components/analytics/ScatterPlotChart';
import { BoxPlotChart } from '../components/analytics/BoxPlotChart';
import { HistogramChart } from '../components/analytics/HistogramChart';
import { TimeHeatmap } from '../components/analytics/TimeHeatmap';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ScatterPlotIcon from '@mui/icons-material/ScatterPlot';
import BarChartIcon from '@mui/icons-material/BarChart';
import GridOnIcon from '@mui/icons-material/GridOn';

interface TabPanelProps {
  children?: React.Node;
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

export function AnalyticsAdvanced() {
  const [tabValue, setTabValue] = useState(0);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [timeRange]);

  async function loadData() {
    setLoading(true);
    setError(null);

    try {
      const hours = timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 720;
      const response = await sensorsAPI.getHistory(undefined, hours);
      setSensorData(response.data);
    } catch (err) {
      console.error('Failed to load sensor data:', err);
      setError('Fehler beim Laden der Sensor-Daten');
    } finally {
      setLoading(false);
    }
  }

  // Prepare data for different visualizations
  const prepareCorrelationData = () => {
    const data: { [key: string]: number[] } = {
      Feuchtigkeit: [],
      Temperatur: [],
      Luftfeuchtigkeit: [],
      Tankfüllstand: [],
    };

    sensorData.forEach((d) => {
      data.Feuchtigkeit.push(d.moistureLevel);
      if (d.temperature !== undefined && d.temperature !== null) {
        data.Temperatur.push(d.temperature);
      }
      if (d.humidity !== undefined && d.humidity !== null) {
        data.Luftfeuchtigkeit.push(d.humidity);
      }
      if (d.tankLevel !== undefined && d.tankLevel !== null) {
        data.Tankfüllstand.push(d.tankLevel);
      }
    });

    // Only include variables with data
    Object.keys(data).forEach((key) => {
      if (data[key].length === 0) {
        delete data[key];
      }
    });

    return data;
  };

  const prepareScatterData = (xKey: keyof SensorData, yKey: keyof SensorData) => {
    return sensorData
      .filter((d) => d[xKey] !== undefined && d[xKey] !== null && d[yKey] !== undefined && d[yKey] !== null)
      .map((d) => ({
        x: d[xKey] as number,
        y: d[yKey] as number,
        timestamp: d.timestamp,
      }));
  };

  const prepareBoxPlotData = () => {
    return [
      {
        label: 'Feuchtigkeit (%)',
        values: sensorData.map((d) => d.moistureLevel),
        color: '#2196f3',
      },
      {
        label: 'Temp. (°C)',
        values: sensorData.filter((d) => d.temperature !== undefined).map((d) => d.temperature!),
        color: '#f44336',
      },
      {
        label: 'Luftf. (%)',
        values: sensorData.filter((d) => d.humidity !== undefined).map((d) => d.humidity!),
        color: '#4caf50',
      },
      {
        label: 'Tank (%)',
        values: sensorData.filter((d) => d.tankLevel !== undefined).map((d) => d.tankLevel!),
        color: '#ff9800',
      },
    ].filter((dataset) => dataset.values.length > 0);
  };

  const prepareHeatmapData = (valueKey: keyof SensorData) => {
    return sensorData
      .filter((d) => d[valueKey] !== undefined && d[valueKey] !== null)
      .map((d) => ({
        timestamp: d.timestamp,
        value: d[valueKey] as number,
      }));
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          <TrendingUpIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Erweiterte Datenanalyse
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Statistische Analysen und Visualisierungen Ihrer Sensor-Daten
        </Typography>
      </Box>

      {/* Time range selector */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="body2" fontWeight="medium">
            Zeitraum:
          </Typography>
          <ToggleButtonGroup
            value={timeRange}
            exclusive
            onChange={(_, newValue) => newValue && setTimeRange(newValue)}
            size="small"
          >
            <ToggleButton value="24h">24 Stunden</ToggleButton>
            <ToggleButton value="7d">7 Tage</ToggleButton>
            <ToggleButton value="30d">30 Tage</ToggleButton>
          </ToggleButtonGroup>
          <Typography variant="caption" color="text.secondary">
            ({sensorData.length} Datenpunkte)
          </Typography>
        </Box>
      </Paper>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} variant="scrollable" scrollButtons="auto">
          <Tab icon={<GridOnIcon />} label="Korrelationen" iconPosition="start" />
          <Tab icon={<ScatterPlotIcon />} label="Scatter-Plots" iconPosition="start" />
          <Tab icon={<BarChartIcon />} label="Verteilungen" iconPosition="start" />
          <Tab icon={<TrendingUpIcon />} label="Heatmaps" iconPosition="start" />
        </Tabs>
      </Box>

      {/* Tab 1: Correlation Matrix */}
      <TabPanel value={tabValue} index={0}>
        <CorrelationMatrix data={prepareCorrelationData()} />
      </TabPanel>

      {/* Tab 2: Scatter Plots */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <ScatterPlotChart
            data={prepareScatterData('temperature', 'humidity')}
            xLabel="Temperatur (°C)"
            yLabel="Luftfeuchtigkeit (%)"
            title="Temperatur vs. Luftfeuchtigkeit"
            color="#4caf50"
          />
          <ScatterPlotChart
            data={prepareScatterData('temperature', 'moistureLevel')}
            xLabel="Temperatur (°C)"
            yLabel="Bodenfeuchtigkeit (%)"
            title="Temperatur vs. Bodenfeuchtigkeit"
            color="#2196f3"
          />
          <ScatterPlotChart
            data={prepareScatterData('humidity', 'moistureLevel')}
            xLabel="Luftfeuchtigkeit (%)"
            yLabel="Bodenfeuchtigkeit (%)"
            title="Luftfeuchtigkeit vs. Bodenfeuchtigkeit"
            color="#ff9800"
          />
        </Box>
      </TabPanel>

      {/* Tab 3: Distributions (Box Plots & Histograms) */}
      <TabPanel value={tabValue} index={2}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <BoxPlotChart data={prepareBoxPlotData()} title="Statistische Übersicht" yLabel="Wert" />

          <HistogramChart
            data={sensorData.map((d) => d.moistureLevel)}
            title="Bodenfeuchtigkeit - Verteilung"
            xLabel="Feuchtigkeit (%)"
            color="#2196f3"
          />

          {sensorData.some((d) => d.temperature !== undefined) && (
            <HistogramChart
              data={sensorData.filter((d) => d.temperature !== undefined).map((d) => d.temperature!)}
              title="Temperatur - Verteilung"
              xLabel="Temperatur (°C)"
              color="#f44336"
            />
          )}

          {sensorData.some((d) => d.humidity !== undefined) && (
            <HistogramChart
              data={sensorData.filter((d) => d.humidity !== undefined).map((d) => d.humidity!)}
              title="Luftfeuchtigkeit - Verteilung"
              xLabel="Luftfeuchtigkeit (%)"
              color="#4caf50"
            />
          )}
        </Box>
      </TabPanel>

      {/* Tab 4: Time Heatmaps */}
      <TabPanel value={tabValue} index={3}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TimeHeatmap data={prepareHeatmapData('moistureLevel')} title="Bodenfeuchtigkeit - Zeitmuster" valueLabel="Feuchtigkeit (%)" />

          {sensorData.some((d) => d.temperature !== undefined) && (
            <TimeHeatmap
              data={prepareHeatmapData('temperature')}
              title="Temperatur - Zeitmuster"
              valueLabel="Temperatur (°C)"
            />
          )}

          {sensorData.some((d) => d.humidity !== undefined) && (
            <TimeHeatmap
              data={prepareHeatmapData('humidity')}
              title="Luftfeuchtigkeit - Zeitmuster"
              valueLabel="Luftfeuchtigkeit (%)"
            />
          )}
        </Box>
      </TabPanel>
    </Container>
  );
}
