import React, { useState } from 'react';
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
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
} from '@mui/material';
import {
  Lightbulb as InsightIcon,
  TrendingUp as TrendUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  ExpandMore as ExpandIcon,
  Refresh as RefreshIcon,
  AutoAwesome as AIIcon,
  WaterDrop as WaterIcon,
  Thermostat as TempIcon,
  Brightness5 as LightIcon,
  Science as NutrientIcon,
  Timeline as ForecastIcon,
} from '@mui/icons-material';

export type InsightType = 'recommendation' | 'warning' | 'optimization' | 'forecast';
export type InsightPriority = 'critical' | 'high' | 'medium' | 'low';
export type InsightCategory = 'watering' | 'temperature' | 'light' | 'nutrients' | 'general';

export interface PredictiveInsight {
  id: string;
  type: InsightType;
  priority: InsightPriority;
  category: InsightCategory;
  title: string;
  description: string;
  confidence: number; // 0-100
  impact: number; // 0-100 (expected improvement)
  timeframe?: string;
  actions?: Array<{
    label: string;
    description: string;
  }>;
  metrics?: Array<{
    label: string;
    current: number;
    predicted: number;
    unit: string;
  }>;
}

export interface Forecast {
  metric: string;
  predictions: Array<{
    date: string;
    value: number;
    confidence: number;
  }>;
  recommendation?: string;
}

export interface PredictiveInsightsProps {
  insights?: PredictiveInsight[];
  forecasts?: Forecast[];
  onRefresh?: () => void;
  onApplyAction?: (insightId: string, actionLabel: string) => void;
}

/**
 * AI-powered predictive insights and recommendations
 */
export function PredictiveInsights({
  insights: initialInsights = [],
  forecasts: initialForecasts = [],
  onRefresh,
  onApplyAction,
}: PredictiveInsightsProps) {
  const [insights] = useState<PredictiveInsight[]>(
    initialInsights.length > 0 ? initialInsights : getSampleInsights()
  );
  const [forecasts] = useState<Forecast[]>(
    initialForecasts.length > 0 ? initialForecasts : getSampleForecasts()
  );
  const [activeTab, setActiveTab] = useState(0);
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);

  const getPriorityColor = (priority: InsightPriority) => {
    switch (priority) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
      default:
        return 'default';
    }
  };

  const getTypeIcon = (type: InsightType) => {
    switch (type) {
      case 'warning':
        return <WarningIcon />;
      case 'recommendation':
        return <InsightIcon />;
      case 'optimization':
        return <TrendUpIcon />;
      case 'forecast':
        return <ForecastIcon />;
    }
  };

  const getCategoryIcon = (category: InsightCategory) => {
    switch (category) {
      case 'watering':
        return <WaterIcon />;
      case 'temperature':
        return <TempIcon />;
      case 'light':
        return <LightIcon />;
      case 'nutrients':
        return <NutrientIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'success';
    if (confidence >= 60) return 'info';
    if (confidence >= 40) return 'warning';
    return 'error';
  };

  const criticalInsights = insights.filter((i) => i.priority === 'critical');
  const highPriorityInsights = insights.filter((i) => i.priority === 'high');

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Stack direction="row" alignItems="center" spacing={1}>
            <AIIcon color="primary" />
            <Typography variant="h5">Predictive Insights</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            AI-powered recommendations and forecasts
          </Typography>
        </Box>
        <IconButton onClick={onRefresh}>
          <RefreshIcon />
        </IconButton>
      </Stack>

      {/* Critical Alerts */}
      {criticalInsights.length > 0 && (
        <Alert severity="error" icon={<ErrorIcon />} sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            {criticalInsights.length} Critical Issue{criticalInsights.length > 1 ? 's' : ''} Detected
          </Typography>
          <Typography variant="body2">
            Immediate action required to prevent potential problems.
          </Typography>
        </Alert>
      )}

      {/* High Priority Alerts */}
      {highPriorityInsights.length > 0 && (
        <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 3 }}>
          <Typography variant="subtitle2">
            {highPriorityInsights.length} High Priority Recommendation{highPriorityInsights.length > 1 ? 's' : ''}
          </Typography>
        </Alert>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
          <Tab label={`Insights (${insights.length})`} icon={<InsightIcon />} iconPosition="start" />
          <Tab label={`Forecasts (${forecasts.length})`} icon={<ForecastIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* Insights Tab */}
      {activeTab === 0 && (
        <Stack spacing={2}>
          {insights.map((insight) => (
            <Accordion
              key={insight.id}
              expanded={expandedInsight === insight.id}
              onChange={() => setExpandedInsight(expandedInsight === insight.id ? null : insight.id)}
            >
              <AccordionSummary expandIcon={<ExpandIcon />}>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%', pr: 2 }}>
                  {getCategoryIcon(insight.category)}
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1">{insight.title}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {insight.category} • Confidence: {insight.confidence}% • Impact: {insight.impact}%
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Chip
                      label={insight.priority}
                      color={getPriorityColor(insight.priority) as any}
                      size="small"
                    />
                    <Chip
                      label={insight.type}
                      icon={getTypeIcon(insight.type)}
                      size="small"
                      variant="outlined"
                    />
                  </Stack>
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  <Typography variant="body2">{insight.description}</Typography>

                  {insight.timeframe && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Timeframe
                      </Typography>
                      <Typography variant="body2">{insight.timeframe}</Typography>
                    </Box>
                  )}

                  {/* Confidence & Impact */}
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Confidence
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={insight.confidence}
                        color={getConfidenceColor(insight.confidence) as any}
                        sx={{ height: 8, borderRadius: 1, mt: 0.5 }}
                      />
                      <Typography variant="caption">{insight.confidence}%</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Expected Impact
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={insight.impact}
                        color="success"
                        sx={{ height: 8, borderRadius: 1, mt: 0.5 }}
                      />
                      <Typography variant="caption">{insight.impact}%</Typography>
                    </Grid>
                  </Grid>

                  {/* Metrics */}
                  {insight.metrics && insight.metrics.length > 0 && (
                    <>
                      <Divider />
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          Expected Changes
                        </Typography>
                        <Grid container spacing={2}>
                          {insight.metrics.map((metric, index) => (
                            <Grid item xs={6} key={index}>
                              <Paper sx={{ p: 1.5, bgcolor: 'background.default' }}>
                                <Typography variant="caption" color="text.secondary">
                                  {metric.label}
                                </Typography>
                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                                  <Typography variant="body2">
                                    {metric.current} {metric.unit}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    →
                                  </Typography>
                                  <Typography variant="body2" color="success.main" fontWeight="bold">
                                    {metric.predicted} {metric.unit}
                                  </Typography>
                                </Stack>
                              </Paper>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    </>
                  )}

                  {/* Actions */}
                  {insight.actions && insight.actions.length > 0 && (
                    <>
                      <Divider />
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          Recommended Actions
                        </Typography>
                        <List dense>
                          {insight.actions.map((action, index) => (
                            <ListItem
                              key={index}
                              secondaryAction={
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => onApplyAction?.(insight.id, action.label)}
                                >
                                  Apply
                                </Button>
                              }
                            >
                              <ListItemIcon>
                                <CheckIcon color="success" />
                              </ListItemIcon>
                              <ListItemText
                                primary={action.label}
                                secondary={action.description}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    </>
                  )}
                </Stack>
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>
      )}

      {/* Forecasts Tab */}
      {activeTab === 1 && (
        <Grid container spacing={2}>
          {forecasts.map((forecast, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card>
                <CardHeader
                  avatar={<ForecastIcon />}
                  title={`${forecast.metric} Forecast`}
                  subheader="Next 7 days"
                />
                <CardContent>
                  <Stack spacing={2}>
                    {forecast.predictions.map((pred, pIndex) => (
                      <Box key={pIndex}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                          <Typography variant="body2">{pred.date}</Typography>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="body2" fontWeight="bold">
                              {pred.value.toFixed(1)}
                            </Typography>
                            <Tooltip title={`Confidence: ${pred.confidence}%`}>
                              <Chip
                                label={`${pred.confidence}%`}
                                size="small"
                                color={getConfidenceColor(pred.confidence) as any}
                              />
                            </Tooltip>
                          </Stack>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={pred.confidence}
                          color={getConfidenceColor(pred.confidence) as any}
                          sx={{ height: 4, borderRadius: 1 }}
                        />
                      </Box>
                    ))}

                    {forecast.recommendation && (
                      <>
                        <Divider />
                        <Alert severity="info" icon={<InsightIcon />}>
                          <Typography variant="body2">{forecast.recommendation}</Typography>
                        </Alert>
                      </>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

/**
 * Generate sample insights
 */
function getSampleInsights(): PredictiveInsight[] {
  return [
    {
      id: '1',
      type: 'warning',
      priority: 'critical',
      category: 'watering',
      title: 'Soil Moisture Dropping Rapidly',
      description:
        'Based on current trends, soil moisture will drop below critical levels within 24 hours. Immediate watering recommended to prevent plant stress.',
      confidence: 92,
      impact: 85,
      timeframe: 'Within 24 hours',
      actions: [
        {
          label: 'Water Now',
          description: 'Activate irrigation system immediately',
        },
        {
          label: 'Increase Watering Schedule',
          description: 'Adjust automation to water twice daily',
        },
      ],
      metrics: [
        { label: 'Soil Moisture', current: 35, predicted: 18, unit: '%' },
        { label: 'Plant Health', current: 85, predicted: 62, unit: '%' },
      ],
    },
    {
      id: '2',
      type: 'recommendation',
      priority: 'high',
      category: 'temperature',
      title: 'Optimize Temperature for Growth Phase',
      description:
        'Your plants are entering the vegetative growth phase. Increasing temperature by 2-3°C can improve growth rate by up to 25%.',
      confidence: 78,
      impact: 72,
      timeframe: 'Next 7-14 days',
      actions: [
        {
          label: 'Adjust Thermostat',
          description: 'Set target temperature to 26°C',
        },
        {
          label: 'Review Ventilation',
          description: 'Reduce ventilation to maintain higher temps',
        },
      ],
      metrics: [
        { label: 'Temperature', current: 23, predicted: 26, unit: '°C' },
        { label: 'Growth Rate', current: 100, predicted: 125, unit: '%' },
      ],
    },
    {
      id: '3',
      type: 'optimization',
      priority: 'medium',
      category: 'light',
      title: 'Light Schedule Optimization Available',
      description:
        'Analysis shows your plants could benefit from a modified light schedule. Extending the light period by 1 hour can improve photosynthesis efficiency.',
      confidence: 65,
      impact: 45,
      timeframe: 'Gradual implementation over 5 days',
      actions: [
        {
          label: 'Update Light Schedule',
          description: 'Change from 16/8 to 17/7 light/dark cycle',
        },
      ],
      metrics: [
        { label: 'Daily Light Hours', current: 16, predicted: 17, unit: 'hrs' },
        { label: 'Photosynthesis', current: 100, predicted: 115, unit: '%' },
      ],
    },
    {
      id: '4',
      type: 'forecast',
      priority: 'low',
      category: 'nutrients',
      title: 'Nutrient Levels Stable',
      description:
        'Nutrient levels are predicted to remain optimal for the next 14 days based on current consumption patterns.',
      confidence: 88,
      impact: 10,
      timeframe: 'Next 14 days',
      metrics: [
        { label: 'Nitrogen (N)', current: 120, predicted: 115, unit: 'ppm' },
        { label: 'Phosphorus (P)', current: 45, predicted: 43, unit: 'ppm' },
        { label: 'Potassium (K)', current: 180, predicted: 175, unit: 'ppm' },
      ],
    },
  ];
}

/**
 * Generate sample forecasts
 */
function getSampleForecasts(): Forecast[] {
  const today = new Date();

  return [
    {
      metric: 'Temperature',
      predictions: Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() + i + 1);
        return {
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          value: 23 + Math.random() * 3 + i * 0.2,
          confidence: 95 - i * 5,
        };
      }),
      recommendation: 'Temperature trending upward. Consider adjusting ventilation on day 5.',
    },
    {
      metric: 'Humidity',
      predictions: Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() + i + 1);
        return {
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          value: 65 - i * 1.5 + Math.random() * 2,
          confidence: 92 - i * 4,
        };
      }),
      recommendation: 'Humidity decreasing. Monitor closely and consider adding humidifier by day 4.',
    },
  ];
}
