import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  IconButton,
  Toolbar,
  Typography,
  FormControlLabel,
  Switch,
  Tooltip,
} from '@mui/material';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { SensorData, Plant, Relay } from '../types';
import { sensorsAPI, plantsAPI, relaysAPI } from '../services/api';
import { useWebSocket, useWebSocketConnection } from '../hooks/useWebSocket';
import { DashboardWidget } from '../components/widgets/DashboardWidget';
import { SensorWidget } from '../components/widgets/SensorWidget';
import { ChartWidget } from '../components/widgets/ChartWidget';
import { PlantStatusWidget } from '../components/widgets/PlantStatusWidget';
import { RelayStatusWidget } from '../components/widgets/RelayStatusWidget';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import RefreshIcon from '@mui/icons-material/Refresh';
import SaveIcon from '@mui/icons-material/Save';
import SettingsIcon from '@mui/icons-material/Settings';

type LayoutItem = {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
};

interface WidgetConfig {
  id: string;
  type: string;
  title: string;
  config?: any;
}

const DEFAULT_LAYOUT: LayoutItem[] = [
  { i: 'moisture', x: 0, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
  { i: 'temperature', x: 3, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
  { i: 'humidity', x: 6, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
  { i: 'tank', x: 9, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
  { i: 'chart', x: 0, y: 2, w: 12, h: 4, minW: 6, minH: 3 },
  { i: 'plants', x: 0, y: 6, w: 6, h: 4, minW: 4, minH: 3 },
  { i: 'relays', x: 6, y: 6, w: 6, h: 4, minW: 4, minH: 3 },
];

const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: 'moisture', type: 'sensor', title: 'Bodenfeuchtigkeit', config: { sensorType: 'moisture' } },
  { id: 'temperature', type: 'sensor', title: 'Temperatur', config: { sensorType: 'temperature' } },
  { id: 'humidity', type: 'sensor', title: 'Luftfeuchtigkeit', config: { sensorType: 'humidity' } },
  { id: 'tank', type: 'sensor', title: 'Wassertank', config: { sensorType: 'tank' } },
  { id: 'chart', type: 'chart', title: 'Sensor-Verlauf (24h)' },
  { id: 'plants', type: 'plants', title: 'Pflanzen Status' },
  { id: 'relays', type: 'relays', title: 'Geräte Status' },
];

export function DashboardEnhanced() {
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [relays, setRelays] = useState<Relay[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [layout, setLayout] = useState<LayoutItem[]>(() => {
    const saved = localStorage.getItem('dashboardLayout');
    return saved ? JSON.parse(saved) : DEFAULT_LAYOUT;
  });
  const [widgets, setWidgets] = useState<WidgetConfig[]>(() => {
    const saved = localStorage.getItem('dashboardWidgets');
    return saved ? JSON.parse(saved) : DEFAULT_WIDGETS;
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

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
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (sensorData.length > 0) {
      const chartPoints = sensorData
        .slice(0, 30)
        .reverse()
        .map((d) => ({
          time: new Date(d.timestamp).toLocaleTimeString(),
          Feuchtigkeit: d.moistureLevel,
          Temperatur: d.temperature || 0,
          Luftfeuchtigkeit: d.humidity || 0,
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

      const chartPoints = historyRes.data.slice(-30).map((d: SensorData) => ({
        time: new Date(d.timestamp).toLocaleTimeString(),
        Feuchtigkeit: d.moistureLevel,
        Temperatur: d.temperature || 0,
        Luftfeuchtigkeit: d.humidity || 0,
      }));
      setChartData(chartPoints);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  }

  function handleLayoutChange(newLayout: any) {
    setLayout(Array.from(newLayout as LayoutItem[]));
  }

  function saveLayout() {
    localStorage.setItem('dashboardLayout', JSON.stringify(layout));
    localStorage.setItem('dashboardWidgets', JSON.stringify(widgets));
    alert('Layout gespeichert!');
  }

  function resetLayout() {
    if (window.confirm('Layout auf Standard zurücksetzen?')) {
      setLayout(DEFAULT_LAYOUT);
      setWidgets(DEFAULT_WIDGETS);
      localStorage.removeItem('dashboardLayout');
      localStorage.removeItem('dashboardWidgets');
    }
  }

  function toggleFullscreen() {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  }

  function removeWidget(widgetId: string) {
    setWidgets((prev) => prev.filter((w) => w.id !== widgetId));
    setLayout((prev) => prev.filter((l) => l.i !== widgetId));
  }

  function renderWidget(widget: WidgetConfig) {
    const latestData = sensorData[0];

    switch (widget.type) {
      case 'sensor':
        return (
          <SensorWidget
            type={widget.config.sensorType}
            latestData={latestData}
          />
        );
      case 'chart':
        return (
          <ChartWidget
            data={chartData}
            lines={[
              { dataKey: 'Feuchtigkeit', color: '#8884d8', name: 'Feuchtigkeit' },
              { dataKey: 'Temperatur', color: '#82ca9d', name: 'Temperatur' },
              { dataKey: 'Luftfeuchtigkeit', color: '#ffc658', name: 'Luftfeuchtigkeit' },
            ]}
          />
        );
      case 'plants':
        return <PlantStatusWidget plants={plants} sensorData={sensorData} />;
      case 'relays':
        return <RelayStatusWidget relays={relays} />;
      default:
        return <Typography>Unknown widget type</Typography>;
    }
  }

  return (
    <Box sx={{ height: isFullscreen ? '100vh' : 'auto' }}>
      {/* Toolbar */}
      {!isFullscreen && (
        <Toolbar sx={{ px: 0, mb: 2, gap: 2 }}>
          <Typography variant="h4" sx={{ flexGrow: 1 }}>
            Dashboard
          </Typography>

          <Tooltip title="Aktualisieren">
            <IconButton onClick={loadData} color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>

          <FormControlLabel
            control={
              <Switch
                checked={isEditMode}
                onChange={(e) => setIsEditMode(e.target.checked)}
              />
            }
            label="Bearbeiten"
          />

          {isEditMode && (
            <>
              <Tooltip title="Layout speichern">
                <IconButton onClick={saveLayout} color="success">
                  <SaveIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Zurücksetzen">
                <IconButton onClick={resetLayout} color="warning">
                  <SettingsIcon />
                </IconButton>
              </Tooltip>
            </>
          )}

          <Tooltip title={isFullscreen ? 'Vollbild verlassen' : 'Vollbild'}>
            <IconButton onClick={toggleFullscreen} color="primary">
              {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>
          </Tooltip>
        </Toolbar>
      )}

      {/* Dashboard Grid */}
      <Box
        sx={{
          bgcolor: 'background.default',
          p: isFullscreen ? 2 : 0,
          height: isFullscreen ? 'calc(100vh - 32px)' : 'auto',
          overflow: 'auto',
        }}
      >
        {React.createElement(
          GridLayout as any,
          {
            className: "layout",
            layout: layout,
            cols: 12,
            rowHeight: 60,
            width: 1200,
            onLayoutChange: handleLayoutChange,
            isDraggable: isEditMode,
            isResizable: isEditMode,
            draggableHandle: ".drag-handle",
            compactType: "vertical"
          },
          widgets.map((widget) => (
            <div key={widget.id}>
              <DashboardWidget
                id={widget.id}
                title={widget.title}
                onRemove={isEditMode ? () => removeWidget(widget.id) : undefined}
              >
                {renderWidget(widget)}
              </DashboardWidget>
            </div>
          ))
        )}
      </Box>

      {/* Fullscreen Exit Button */}
      {isFullscreen && (
        <IconButton
          onClick={toggleFullscreen}
          sx={{
            position: 'fixed',
            top: 16,
            right: 16,
            bgcolor: 'background.paper',
            '&:hover': { bgcolor: 'background.default' },
          }}
        >
          <FullscreenExitIcon />
        </IconButton>
      )}
    </Box>
  );
}
