import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  Storage as StorageIcon,
  NetworkCheck as NetworkIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  CheckCircle as GoodIcon,
  Error as ErrorIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  threshold: number;
  status: 'good' | 'warning' | 'error';
}

export interface PerformanceData {
  timestamp: string;
  fps: number;
  memory: number;
  responseTime: number;
}

export interface PerformanceMonitorProps {
  onRefresh?: () => void;
  autoRefresh?: boolean;
  refreshInterval?: number; // ms
}

/**
 * Performance monitoring component with real-time metrics
 */
export function PerformanceMonitor({
  onRefresh,
  autoRefresh = false,
  refreshInterval = 5000,
}: PerformanceMonitorProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>(getInitialMetrics());
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    if (autoRefresh || isMonitoring) {
      const interval = setInterval(() => {
        updateMetrics();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, isMonitoring, refreshInterval]);

  useEffect(() => {
    // Initial load
    updateMetrics();
  }, []);

  const updateMetrics = () => {
    // Simulate metric updates
    const newMetrics: PerformanceMetric[] = [
      {
        name: 'Page Load Time',
        value: Math.random() * 2000 + 500,
        unit: 'ms',
        threshold: 3000,
        status: 'good',
      },
      {
        name: 'Time to Interactive',
        value: Math.random() * 3000 + 1000,
        unit: 'ms',
        threshold: 5000,
        status: 'good',
      },
      {
        name: 'First Contentful Paint',
        value: Math.random() * 1500 + 300,
        unit: 'ms',
        threshold: 2000,
        status: 'good',
      },
      {
        name: 'Largest Contentful Paint',
        value: Math.random() * 2500 + 800,
        unit: 'ms',
        threshold: 4000,
        status: 'good',
      },
      {
        name: 'Memory Usage',
        value: Math.random() * 30 + 40,
        unit: 'MB',
        threshold: 100,
        status: 'good',
      },
      {
        name: 'API Response Time',
        value: Math.random() * 200 + 50,
        unit: 'ms',
        threshold: 500,
        status: 'good',
      },
      {
        name: 'Frame Rate',
        value: Math.random() * 10 + 55,
        unit: 'fps',
        threshold: 30,
        status: 'good',
      },
      {
        name: 'Bundle Size',
        value: 2.4,
        unit: 'MB',
        threshold: 5,
        status: 'good',
      },
    ];

    // Determine status based on threshold
    newMetrics.forEach((metric) => {
      if (metric.name === 'Frame Rate') {
        // Higher is better for FPS
        if (metric.value >= metric.threshold * 2) metric.status = 'good';
        else if (metric.value >= metric.threshold) metric.status = 'warning';
        else metric.status = 'error';
      } else {
        // Lower is better for most metrics
        if (metric.value <= metric.threshold * 0.5) metric.status = 'good';
        else if (metric.value <= metric.threshold) metric.status = 'warning';
        else metric.status = 'error';
      }
    });

    setMetrics(newMetrics);

    // Add to performance data
    const newDataPoint: PerformanceData = {
      timestamp: new Date().toLocaleTimeString(),
      fps: newMetrics.find((m) => m.name === 'Frame Rate')?.value || 0,
      memory: newMetrics.find((m) => m.name === 'Memory Usage')?.value || 0,
      responseTime: newMetrics.find((m) => m.name === 'API Response Time')?.value || 0,
    };

    setPerformanceData((prev) => [...prev.slice(-19), newDataPoint]);

    onRefresh?.();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <GoodIcon color="success" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const getOverallStatus = () => {
    if (metrics.some((m) => m.status === 'error')) return 'error';
    if (metrics.some((m) => m.status === 'warning')) return 'warning';
    return 'good';
  };

  const overallStatus = getOverallStatus();

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5">Performance Monitor</Typography>
          <Typography variant="body2" color="text.secondary">
            Real-time application performance metrics
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            variant={isMonitoring ? 'contained' : 'outlined'}
            onClick={() => setIsMonitoring(!isMonitoring)}
          >
            {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
          </Button>
          <IconButton onClick={updateMetrics}>
            <RefreshIcon />
          </IconButton>
        </Stack>
      </Stack>

      {/* Overall Status */}
      <Alert
        severity={overallStatus}
        icon={getStatusIcon(overallStatus)}
        sx={{ mb: 3 }}
      >
        <Typography variant="subtitle2">
          Overall Performance: {overallStatus.toUpperCase()}
        </Typography>
        <Typography variant="body2">
          {overallStatus === 'good' && 'All metrics are within acceptable thresholds.'}
          {overallStatus === 'warning' && 'Some metrics need attention.'}
          {overallStatus === 'error' && 'Critical performance issues detected!'}
        </Typography>
      </Alert>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
          <Tab label="Overview" icon={<SpeedIcon />} iconPosition="start" />
          <Tab label="Real-time Charts" icon={<TimelineIcon />} iconPosition="start" />
          <Tab label="Web Vitals" icon={<NetworkIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* Overview Tab */}
      {activeTab === 0 && (
        <Grid container spacing={2}>
          {metrics.map((metric, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card>
                <CardContent>
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between" alignItems="start">
                      <Typography variant="caption" color="text.secondary">
                        {metric.name}
                      </Typography>
                      {getStatusIcon(metric.status)}
                    </Stack>

                    <Stack direction="row" alignItems="baseline" spacing={1}>
                      <Typography variant="h4">{metric.value.toFixed(metric.unit === 'MB' ? 1 : 0)}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {metric.unit}
                      </Typography>
                    </Stack>

                    <Box>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          Threshold
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {metric.threshold} {metric.unit}
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min((metric.value / metric.threshold) * 100, 100)}
                        color={getStatusColor(metric.status) as any}
                        sx={{ height: 6, borderRadius: 1 }}
                      />
                    </Box>

                    <Chip
                      label={metric.status.toUpperCase()}
                      color={getStatusColor(metric.status) as any}
                      size="small"
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Real-time Charts Tab */}
      {activeTab === 1 && (
        <Stack spacing={3}>
          <Card>
            <CardHeader title="Frame Rate (FPS)" />
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="fps" stroke="#4caf50" name="FPS" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Memory Usage (MB)" />
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Area type="monotone" dataKey="memory" stroke="#2196f3" fill="#2196f3" fillOpacity={0.3} name="Memory (MB)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="API Response Time (ms)" />
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="responseTime" stroke="#ff9800" name="Response Time (ms)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Stack>
      )}

      {/* Web Vitals Tab */}
      {activeTab === 2 && (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Alert severity="info">
              Web Vitals are key metrics that affect user experience. Google uses these metrics for
              search ranking.
            </Alert>
          </Grid>

          {[
            {
              name: 'Largest Contentful Paint (LCP)',
              description: 'Measures loading performance. Should be less than 2.5s.',
              icon: <SpeedIcon />,
              metric: metrics.find((m) => m.name === 'Largest Contentful Paint'),
            },
            {
              name: 'First Input Delay (FID)',
              description: 'Measures interactivity. Should be less than 100ms.',
              icon: <NetworkIcon />,
              metric: { ...metrics[1], value: 45, threshold: 100, status: 'good' as const },
            },
            {
              name: 'Cumulative Layout Shift (CLS)',
              description: 'Measures visual stability. Should be less than 0.1.',
              icon: <TimelineIcon />,
              metric: { name: 'CLS', value: 0.05, unit: '', threshold: 0.1, status: 'good' as const },
            },
            {
              name: 'Time to First Byte (TTFB)',
              description: 'Measures server response time. Should be less than 600ms.',
              icon: <NetworkIcon />,
              metric: { name: 'TTFB', value: 280, unit: 'ms', threshold: 600, status: 'good' as const },
            },
          ].map((vital, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card>
                <CardHeader
                  avatar={vital.icon}
                  title={vital.name}
                  action={
                    <Chip
                      label={vital.metric.status.toUpperCase()}
                      color={getStatusColor(vital.metric.status) as any}
                      size="small"
                    />
                  }
                />
                <CardContent>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {vital.description}
                  </Typography>

                  <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mb: 2 }}>
                    <Typography variant="h3">
                      {vital.metric.value.toFixed(vital.metric.unit === 'ms' ? 0 : 2)}
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                      {vital.metric.unit}
                    </Typography>
                  </Stack>

                  <LinearProgress
                    variant="determinate"
                    value={Math.min((vital.metric.value / vital.metric.threshold) * 100, 100)}
                    color={getStatusColor(vital.metric.status) as any}
                    sx={{ height: 8, borderRadius: 1 }}
                  />

                  <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Current
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Threshold: {vital.metric.threshold} {vital.metric.unit}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}

          {/* Additional Metrics */}
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Additional Performance Metrics" />
              <CardContent>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Bundle Size"
                      secondary="Total JavaScript bundle size served to users"
                    />
                    <Typography variant="h6">
                      {metrics.find((m) => m.name === 'Bundle Size')?.value} MB
                    </Typography>
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText
                      primary="Cache Hit Rate"
                      secondary="Percentage of requests served from cache"
                    />
                    <Typography variant="h6">87%</Typography>
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText
                      primary="Compression Ratio"
                      secondary="Gzip compression effectiveness"
                    />
                    <Typography variant="h6">4.2x</Typography>
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}

/**
 * Get initial metrics
 */
function getInitialMetrics(): PerformanceMetric[] {
  return [
    { name: 'Page Load Time', value: 1200, unit: 'ms', threshold: 3000, status: 'good' },
    { name: 'Time to Interactive', value: 2100, unit: 'ms', threshold: 5000, status: 'good' },
    { name: 'First Contentful Paint', value: 800, unit: 'ms', threshold: 2000, status: 'good' },
    { name: 'Largest Contentful Paint', value: 1500, unit: 'ms', threshold: 4000, status: 'good' },
    { name: 'Memory Usage', value: 52, unit: 'MB', threshold: 100, status: 'good' },
    { name: 'API Response Time', value: 120, unit: 'ms', threshold: 500, status: 'good' },
    { name: 'Frame Rate', value: 60, unit: 'fps', threshold: 30, status: 'good' },
    { name: 'Bundle Size', value: 2.4, unit: 'MB', threshold: 5, status: 'good' },
  ];
}
