import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
  useTheme,
  Divider,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp as TrendUpIcon,
  TrendingDown as TrendDownIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
  ShowChart as ChartIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export type TimeRange = '24h' | '7d' | '30d' | '90d' | 'all';
export type MetricType = 'temperature' | 'humidity' | 'soil_moisture' | 'light' | 'ph' | 'all';

export interface AnalyticsMetric {
  label: string;
  value: number;
  unit: string;
  change?: number; // Percentage change
  trend?: 'up' | 'down' | 'stable';
  target?: number;
  min?: number;
  max?: number;
  avg?: number;
}

export interface DataPoint {
  timestamp: string;
  value: number;
  label?: string;
}

export interface AnalyticsDashboardProps {
  metrics?: AnalyticsMetric[];
  onRefresh?: () => void;
  onExport?: () => void;
  onFilterChange?: (timeRange: TimeRange, metric: MetricType) => void;
}

/**
 * Advanced analytics dashboard with metrics and visualizations
 */
export function AnalyticsDashboard({
  metrics: initialMetrics = [],
  onRefresh,
  onExport,
  onFilterChange,
}: AnalyticsDashboardProps) {
  const theme = useTheme();
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('all');
  const [metrics] = useState<AnalyticsMetric[]>(
    initialMetrics.length > 0 ? initialMetrics : getSampleMetrics()
  );

  const handleTimeRangeChange = (range: TimeRange) => {
    setTimeRange(range);
    onFilterChange?.(range, selectedMetric);
  };

  const handleMetricChange = (metric: MetricType) => {
    setSelectedMetric(metric);
    onFilterChange?.(timeRange, metric);
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return <TrendUpIcon color="success" />;
      case 'down':
        return <TrendDownIcon color="error" />;
      default:
        return null;
    }
  };

  const getTrendColor = (trend?: string) => {
    switch (trend) {
      case 'up':
        return theme.palette.success.main;
      case 'down':
        return theme.palette.error.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  const getHealthStatus = (metric: AnalyticsMetric): { status: string; color: string } => {
    if (!metric.target || !metric.avg) {
      return { status: 'Unknown', color: theme.palette.text.secondary };
    }

    const deviation = Math.abs(metric.avg - metric.target) / metric.target;

    if (deviation < 0.05) {
      return { status: 'Optimal', color: theme.palette.success.main };
    } else if (deviation < 0.15) {
      return { status: 'Good', color: theme.palette.info.main };
    } else if (deviation < 0.25) {
      return { status: 'Fair', color: theme.palette.warning.main };
    } else {
      return { status: 'Poor', color: theme.palette.error.main };
    }
  };

  const temperatureData = getTimeSeriesData('temperature', timeRange);
  const humidityData = getTimeSeriesData('humidity', timeRange);
  const distributionData = getDistributionData();
  const comparisonData = getComparisonData();

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5">Analytics Dashboard</Typography>
          <Typography variant="body2" color="text.secondary">
            Advanced insights and data analysis
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <IconButton onClick={onRefresh}>
            <RefreshIcon />
          </IconButton>
          <IconButton onClick={onExport}>
            <DownloadIcon />
          </IconButton>
        </Stack>
      </Stack>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <FilterIcon color="action" />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Time Range</InputLabel>
            <Select value={timeRange} onChange={(e) => handleTimeRangeChange(e.target.value as TimeRange)}>
              <MenuItem value="24h">Last 24 Hours</MenuItem>
              <MenuItem value="7d">Last 7 Days</MenuItem>
              <MenuItem value="30d">Last 30 Days</MenuItem>
              <MenuItem value="90d">Last 90 Days</MenuItem>
              <MenuItem value="all">All Time</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Metric</InputLabel>
            <Select value={selectedMetric} onChange={(e) => handleMetricChange(e.target.value as MetricType)}>
              <MenuItem value="all">All Metrics</MenuItem>
              <MenuItem value="temperature">Temperature</MenuItem>
              <MenuItem value="humidity">Humidity</MenuItem>
              <MenuItem value="soil_moisture">Soil Moisture</MenuItem>
              <MenuItem value="light">Light Level</MenuItem>
              <MenuItem value="ph">pH Level</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {/* Key Metrics */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {metrics.map((metric, index) => {
          const health = getHealthStatus(metric);
          const progress = metric.target && metric.avg ? (metric.avg / metric.target) * 100 : 0;

          return (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card>
                <CardContent>
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between" alignItems="start">
                      <Typography variant="caption" color="text.secondary">
                        {metric.label}
                      </Typography>
                      <Tooltip title={`Health: ${health.status}`}>
                        <Chip label={health.status} size="small" sx={{ bgcolor: health.color, color: 'white' }} />
                      </Tooltip>
                    </Stack>

                    <Stack direction="row" alignItems="baseline" spacing={1}>
                      <Typography variant="h4">{metric.value.toFixed(1)}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {metric.unit}
                      </Typography>
                    </Stack>

                    {metric.change !== undefined && (
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        {getTrendIcon(metric.trend)}
                        <Typography variant="caption" sx={{ color: getTrendColor(metric.trend) }}>
                          {metric.change > 0 ? '+' : ''}
                          {metric.change.toFixed(1)}% vs last period
                        </Typography>
                      </Stack>
                    )}

                    {metric.min !== undefined && metric.max !== undefined && (
                      <Box>
                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            Min: {metric.min}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Max: {metric.max}
                          </Typography>
                        </Stack>
                        <LinearProgress variant="determinate" value={progress} sx={{ height: 6, borderRadius: 1 }} />
                        {metric.avg !== undefined && (
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                            Avg: {metric.avg.toFixed(1)} {metric.unit}
                            {metric.target && ` (Target: ${metric.target})`}
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Charts */}
      <Grid container spacing={2}>
        {/* Temperature Trend */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              avatar={<ChartIcon />}
              title="Temperature Trend"
              subheader={`Over ${timeRange}`}
              action={
                <Tooltip title="Temperature readings over time">
                  <IconButton size="small">
                    <InfoIcon />
                  </IconButton>
                </Tooltip>
              }
            />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={temperatureData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke={theme.palette.primary.main} name="Temperature (°C)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Humidity Trend */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              avatar={<ChartIcon />}
              title="Humidity Trend"
              subheader={`Over ${timeRange}`}
              action={
                <Tooltip title="Humidity levels over time">
                  <IconButton size="small">
                    <InfoIcon />
                  </IconButton>
                </Tooltip>
              }
            />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={humidityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Area type="monotone" dataKey="value" stroke={theme.palette.info.main} fill={theme.palette.info.light} name="Humidity (%)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Metric Distribution */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              avatar={<AssessmentIcon />}
              title="Metric Distribution"
              subheader="Current status breakdown"
            />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Metric Comparison */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              avatar={<AssessmentIcon />}
              title="Metric Comparison"
              subheader="Current vs Target values"
            />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="current" fill={theme.palette.primary.main} name="Current" />
                  <Bar dataKey="target" fill={theme.palette.success.main} name="Target" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Statistics Summary */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Statistical Summary" />
            <CardContent>
              <Grid container spacing={2}>
                {metrics.map((metric, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                      <Typography variant="subtitle2" gutterBottom>
                        {metric.label}
                      </Typography>
                      <Divider sx={{ my: 1 }} />
                      <Stack spacing={0.5}>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="caption">Current:</Typography>
                          <Typography variant="caption" fontWeight="bold">
                            {metric.value} {metric.unit}
                          </Typography>
                        </Stack>
                        {metric.avg !== undefined && (
                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="caption">Average:</Typography>
                            <Typography variant="caption">
                              {metric.avg.toFixed(1)} {metric.unit}
                            </Typography>
                          </Stack>
                        )}
                        {metric.min !== undefined && (
                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="caption">Minimum:</Typography>
                            <Typography variant="caption">
                              {metric.min} {metric.unit}
                            </Typography>
                          </Stack>
                        )}
                        {metric.max !== undefined && (
                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="caption">Maximum:</Typography>
                            <Typography variant="caption">
                              {metric.max} {metric.unit}
                            </Typography>
                          </Stack>
                        )}
                        {metric.target !== undefined && (
                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="caption">Target:</Typography>
                            <Typography variant="caption" color="success.main">
                              {metric.target} {metric.unit}
                            </Typography>
                          </Stack>
                        )}
                      </Stack>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

/**
 * Generate sample metrics
 */
function getSampleMetrics(): AnalyticsMetric[] {
  return [
    {
      label: 'Temperature',
      value: 24.5,
      unit: '°C',
      change: 2.3,
      trend: 'up',
      min: 18,
      max: 28,
      avg: 23.5,
      target: 24,
    },
    {
      label: 'Humidity',
      value: 65,
      unit: '%',
      change: -1.5,
      trend: 'down',
      min: 50,
      max: 75,
      avg: 62,
      target: 65,
    },
    {
      label: 'Soil Moisture',
      value: 45,
      unit: '%',
      change: 0.5,
      trend: 'stable',
      min: 30,
      max: 60,
      avg: 42,
      target: 50,
    },
    {
      label: 'Light Level',
      value: 850,
      unit: 'lux',
      change: 5.2,
      trend: 'up',
      min: 200,
      max: 1000,
      avg: 720,
      target: 800,
    },
  ];
}

/**
 * Generate time series data
 */
function getTimeSeriesData(metric: string, range: TimeRange): DataPoint[] {
  const dataPoints: DataPoint[] = [];
  const now = new Date();
  let count = 24;

  switch (range) {
    case '24h':
      count = 24;
      break;
    case '7d':
      count = 7;
      break;
    case '30d':
      count = 30;
      break;
    case '90d':
      count = 90;
      break;
    default:
      count = 24;
  }

  for (let i = count; i >= 0; i--) {
    const timestamp = new Date(now);
    if (range === '24h') {
      timestamp.setHours(timestamp.getHours() - i);
    } else {
      timestamp.setDate(timestamp.getDate() - i);
    }

    const baseValue = metric === 'temperature' ? 23 : 60;
    const variation = Math.sin(i / 3) * 3 + Math.random() * 2;

    dataPoints.push({
      timestamp: range === '24h' ? timestamp.toLocaleTimeString([], { hour: '2-digit' }) : timestamp.toLocaleDateString(),
      value: parseFloat((baseValue + variation).toFixed(1)),
    });
  }

  return dataPoints;
}

/**
 * Generate distribution data
 */
function getDistributionData() {
  return [
    { name: 'Optimal', value: 45, color: '#4caf50' },
    { name: 'Good', value: 30, color: '#2196f3' },
    { name: 'Fair', value: 15, color: '#ff9800' },
    { name: 'Poor', value: 10, color: '#f44336' },
  ];
}

/**
 * Generate comparison data
 */
function getComparisonData() {
  return [
    { name: 'Temp', current: 24.5, target: 24 },
    { name: 'Humidity', current: 65, target: 65 },
    { name: 'Soil', current: 45, target: 50 },
    { name: 'Light', current: 850, target: 800 },
  ];
}
