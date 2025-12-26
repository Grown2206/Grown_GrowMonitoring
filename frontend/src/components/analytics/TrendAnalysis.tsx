import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp as UpIcon,
  TrendingDown as DownIcon,
  TrendingFlat as StableIcon,
  Warning as WarningIcon,
  CheckCircle as SuccessIcon,
  Info as InfoIcon,
  ZoomIn as ZoomIcon,
  FileDownload as DownloadIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';

export type TrendDirection = 'increasing' | 'decreasing' | 'stable' | 'volatile';
export type TrendStrength = 'strong' | 'moderate' | 'weak';

export interface TrendData {
  metric: string;
  direction: TrendDirection;
  strength: TrendStrength;
  change: number; // Percentage change
  changeAbsolute: number;
  currentValue: number;
  previousValue: number;
  predictedValue?: number;
  confidence?: number; // 0-100
  anomalies?: number;
  unit: string;
}

export interface DataPoint {
  timestamp: string;
  value: number;
  predicted?: number;
  upperBound?: number;
  lowerBound?: number;
}

export interface TrendAnalysisProps {
  trends?: TrendData[];
  historicalData?: DataPoint[];
  onExport?: () => void;
  onZoomMetric?: (metric: string) => void;
}

/**
 * Trend analysis component with predictive capabilities
 */
export function TrendAnalysis({
  trends: initialTrends = [],
  historicalData: initialData = [],
  onExport,
  onZoomMetric,
}: TrendAnalysisProps) {
  const theme = useTheme();
  const [trends] = useState<TrendData[]>(initialTrends.length > 0 ? initialTrends : getSampleTrends());
  const [historicalData] = useState<DataPoint[]>(initialData.length > 0 ? initialData : generateHistoricalData());
  const [selectedMetric, setSelectedMetric] = useState<string>('temperature');
  const [showPredictions, setShowPredictions] = useState(true);
  const [showConfidenceInterval, setShowConfidenceInterval] = useState(true);

  const getTrendIcon = (direction: TrendDirection) => {
    switch (direction) {
      case 'increasing':
        return <UpIcon color="success" />;
      case 'decreasing':
        return <DownIcon color="error" />;
      case 'volatile':
        return <WarningIcon color="warning" />;
      default:
        return <StableIcon color="info" />;
    }
  };

  const getTrendColor = (direction: TrendDirection) => {
    switch (direction) {
      case 'increasing':
        return theme.palette.success.main;
      case 'decreasing':
        return theme.palette.error.main;
      case 'volatile':
        return theme.palette.warning.main;
      default:
        return theme.palette.info.main;
    }
  };

  const getStrengthChip = (strength: TrendStrength) => {
    const colors = {
      strong: 'error',
      moderate: 'warning',
      weak: 'info',
    };

    return (
      <Chip
        label={strength.toUpperCase()}
        size="small"
        color={colors[strength] as any}
      />
    );
  };

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return theme.palette.text.secondary;
    if (confidence >= 80) return theme.palette.success.main;
    if (confidence >= 60) return theme.palette.info.main;
    if (confidence >= 40) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const selectedTrend = trends.find((t) => t.metric.toLowerCase() === selectedMetric);

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5">Trend Analysis</Typography>
          <Typography variant="body2" color="text.secondary">
            Analyze historical trends and forecast future values
          </Typography>
        </Box>
        <Button startIcon={<DownloadIcon />} onClick={onExport}>
          Export Report
        </Button>
      </Stack>

      {/* Alert for significant trends */}
      {trends.some((t) => t.strength === 'strong' && t.direction !== 'stable') && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <strong>Significant trends detected!</strong> Review the strong trends below and consider
          adjusting your grow settings.
        </Alert>
      )}

      {/* Trend Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {trends.map((trend, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                cursor: 'pointer',
                border: selectedMetric === trend.metric.toLowerCase() ? 2 : 0,
                borderColor: 'primary.main',
                transition: 'all 0.2s',
                '&:hover': {
                  boxShadow: 4,
                  transform: 'translateY(-2px)',
                },
              }}
              onClick={() => setSelectedMetric(trend.metric.toLowerCase())}
            >
              <CardContent>
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between" alignItems="start">
                    <Typography variant="subtitle2">{trend.metric}</Typography>
                    {getTrendIcon(trend.direction)}
                  </Stack>

                  <Stack direction="row" alignItems="baseline" spacing={1}>
                    <Typography variant="h5">{trend.currentValue}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {trend.unit}
                    </Typography>
                  </Stack>

                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Typography
                      variant="body2"
                      sx={{ color: getTrendColor(trend.direction), fontWeight: 'bold' }}
                    >
                      {trend.change > 0 ? '+' : ''}
                      {trend.change.toFixed(1)}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ({trend.changeAbsolute > 0 ? '+' : ''}
                      {trend.changeAbsolute.toFixed(1)} {trend.unit})
                    </Typography>
                  </Stack>

                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Chip label={trend.direction} size="small" sx={{ bgcolor: getTrendColor(trend.direction), color: 'white' }} />
                    {getStrengthChip(trend.strength)}
                  </Stack>

                  {trend.predictedValue !== undefined && (
                    <Box sx={{ pt: 1, borderTop: 1, borderColor: 'divider' }}>
                      <Typography variant="caption" color="text.secondary">
                        Predicted: {trend.predictedValue.toFixed(1)} {trend.unit}
                      </Typography>
                      {trend.confidence !== undefined && (
                        <Typography
                          variant="caption"
                          display="block"
                          sx={{ color: getConfidenceColor(trend.confidence) }}
                        >
                          Confidence: {trend.confidence}%
                        </Typography>
                      )}
                    </Box>
                  )}

                  {trend.anomalies !== undefined && trend.anomalies > 0 && (
                    <Alert severity="warning" icon={<WarningIcon fontSize="small" />} sx={{ py: 0.5 }}>
                      {trend.anomalies} anomalies detected
                    </Alert>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Detailed Chart */}
      <Card sx={{ mb: 3 }}>
        <CardHeader
          title={`${selectedTrend?.metric || 'Metric'} Trend Analysis`}
          subheader="Historical data with predictions"
          action={
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant={showPredictions ? 'contained' : 'outlined'}
                onClick={() => setShowPredictions(!showPredictions)}
              >
                Predictions
              </Button>
              <Button
                size="small"
                variant={showConfidenceInterval ? 'contained' : 'outlined'}
                onClick={() => setShowConfidenceInterval(!showConfidenceInterval)}
              >
                Confidence
              </Button>
              <IconButton onClick={() => onZoomMetric?.(selectedMetric)}>
                <ZoomIcon />
              </IconButton>
            </Stack>
          }
        />
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <RechartsTooltip />
              <Legend />

              {/* Historical data */}
              <Line
                type="monotone"
                dataKey="value"
                stroke={theme.palette.primary.main}
                strokeWidth={2}
                dot={{ r: 3 }}
                name="Actual"
              />

              {/* Predictions */}
              {showPredictions && (
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke={theme.palette.secondary.main}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 3 }}
                  name="Predicted"
                />
              )}

              {/* Confidence interval */}
              {showConfidenceInterval && (
                <>
                  <Line
                    type="monotone"
                    dataKey="upperBound"
                    stroke={theme.palette.grey[400]}
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    dot={false}
                    name="Upper Bound"
                  />
                  <Line
                    type="monotone"
                    dataKey="lowerBound"
                    stroke={theme.palette.grey[400]}
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    dot={false}
                    name="Lower Bound"
                  />
                </>
              )}

              {/* Target line */}
              <ReferenceLine y={24} stroke={theme.palette.success.main} strokeDasharray="3 3" label="Target" />
            </LineChart>
          </ResponsiveContainer>

          {selectedTrend && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" color="text.secondary">
                    Current Value
                  </Typography>
                  <Typography variant="h6">
                    {selectedTrend.currentValue} {selectedTrend.unit}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" color="text.secondary">
                    Change
                  </Typography>
                  <Typography variant="h6" sx={{ color: getTrendColor(selectedTrend.direction) }}>
                    {selectedTrend.change > 0 ? '+' : ''}
                    {selectedTrend.change.toFixed(1)}%
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" color="text.secondary">
                    Trend Strength
                  </Typography>
                  <Typography variant="h6">{selectedTrend.strength}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" color="text.secondary">
                    Confidence
                  </Typography>
                  <Typography variant="h6" sx={{ color: getConfidenceColor(selectedTrend.confidence) }}>
                    {selectedTrend.confidence || 'N/A'}%
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Detailed Trends Table */}
      <Card>
        <CardHeader title="Detailed Trend Breakdown" />
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Metric</TableCell>
                  <TableCell>Direction</TableCell>
                  <TableCell>Strength</TableCell>
                  <TableCell align="right">Current</TableCell>
                  <TableCell align="right">Previous</TableCell>
                  <TableCell align="right">Change</TableCell>
                  <TableCell align="right">Predicted</TableCell>
                  <TableCell align="right">Confidence</TableCell>
                  <TableCell align="center">Anomalies</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {trends.map((trend, index) => (
                  <TableRow
                    key={index}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => setSelectedMetric(trend.metric.toLowerCase())}
                  >
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        {getTrendIcon(trend.direction)}
                        <Typography variant="body2">{trend.metric}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip label={trend.direction} size="small" sx={{ bgcolor: getTrendColor(trend.direction), color: 'white' }} />
                    </TableCell>
                    <TableCell>{getStrengthChip(trend.strength)}</TableCell>
                    <TableCell align="right">
                      {trend.currentValue} {trend.unit}
                    </TableCell>
                    <TableCell align="right">
                      {trend.previousValue} {trend.unit}
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        sx={{ color: getTrendColor(trend.direction), fontWeight: 'bold' }}
                      >
                        {trend.change > 0 ? '+' : ''}
                        {trend.change.toFixed(1)}%
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {trend.predictedValue !== undefined
                        ? `${trend.predictedValue.toFixed(1)} ${trend.unit}`
                        : 'N/A'}
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ color: getConfidenceColor(trend.confidence) }}>
                        {trend.confidence !== undefined ? `${trend.confidence}%` : 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {trend.anomalies !== undefined && trend.anomalies > 0 ? (
                        <Tooltip title={`${trend.anomalies} anomalies detected`}>
                          <Chip
                            icon={<WarningIcon />}
                            label={trend.anomalies}
                            size="small"
                            color="warning"
                          />
                        </Tooltip>
                      ) : (
                        <SuccessIcon color="success" fontSize="small" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}

/**
 * Generate sample trend data
 */
function getSampleTrends(): TrendData[] {
  return [
    {
      metric: 'Temperature',
      direction: 'increasing',
      strength: 'moderate',
      change: 5.2,
      changeAbsolute: 1.2,
      currentValue: 24.5,
      previousValue: 23.3,
      predictedValue: 25.1,
      confidence: 78,
      anomalies: 0,
      unit: '°C',
    },
    {
      metric: 'Humidity',
      direction: 'stable',
      strength: 'weak',
      change: -0.5,
      changeAbsolute: -0.3,
      currentValue: 65,
      previousValue: 65.3,
      predictedValue: 64.8,
      confidence: 85,
      anomalies: 1,
      unit: '%',
    },
    {
      metric: 'Soil Moisture',
      direction: 'decreasing',
      strength: 'strong',
      change: -8.3,
      changeAbsolute: -4.2,
      currentValue: 45,
      previousValue: 49.2,
      predictedValue: 42,
      confidence: 72,
      anomalies: 2,
      unit: '%',
    },
    {
      metric: 'Light Level',
      direction: 'volatile',
      strength: 'moderate',
      change: 12.5,
      changeAbsolute: 95,
      currentValue: 850,
      previousValue: 755,
      predictedValue: 920,
      confidence: 58,
      anomalies: 5,
      unit: 'lux',
    },
  ];
}

/**
 * Generate historical data with predictions
 */
function generateHistoricalData(): DataPoint[] {
  const data: DataPoint[] = [];
  const now = new Date();

  // Historical data (30 days)
  for (let i = 30; i >= 0; i--) {
    const timestamp = new Date(now);
    timestamp.setDate(timestamp.getDate() - i);

    const baseValue = 23;
    const trend = (30 - i) * 0.05; // Upward trend
    const seasonal = Math.sin((30 - i) / 5) * 1.5; // Seasonal variation
    const noise = (Math.random() - 0.5) * 1;

    const value = baseValue + trend + seasonal + noise;

    data.push({
      timestamp: timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: parseFloat(value.toFixed(2)),
    });
  }

  // Future predictions (7 days)
  for (let i = 1; i <= 7; i++) {
    const timestamp = new Date(now);
    timestamp.setDate(timestamp.getDate() + i);

    const baseValue = 23;
    const trend = (30 + i) * 0.05;
    const seasonal = Math.sin((30 + i) / 5) * 1.5;

    const predicted = baseValue + trend + seasonal;
    const confidence = 95 - i * 5; // Confidence decreases with time
    const confidenceRange = (100 - confidence) / 20;

    data.push({
      timestamp: timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: undefined as any,
      predicted: parseFloat(predicted.toFixed(2)),
      upperBound: parseFloat((predicted + confidenceRange).toFixed(2)),
      lowerBound: parseFloat((predicted - confidenceRange).toFixed(2)),
    });
  }

  return data;
}
