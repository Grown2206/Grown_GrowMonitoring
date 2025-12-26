/**
 * Advanced Analytics & Insights Components
 *
 * Features:
 * - Comprehensive analytics dashboard with metrics and visualizations
 * - Trend analysis with predictions and confidence intervals
 * - AI-powered predictive insights and recommendations
 * - Statistical analysis and forecasting
 */

// Analytics Dashboard
export { AnalyticsDashboard } from './AnalyticsDashboard';
export type {
  AnalyticsDashboardProps,
  AnalyticsMetric,
  DataPoint,
  TimeRange,
  MetricType,
} from './AnalyticsDashboard';

// Trend Analysis
export { TrendAnalysis } from './TrendAnalysis';
export type {
  TrendAnalysisProps,
  TrendData,
  TrendDirection,
  TrendStrength,
} from './TrendAnalysis';

// Predictive Insights
export { PredictiveInsights } from './PredictiveInsights';
export type {
  PredictiveInsightsProps,
  PredictiveInsight,
  Forecast,
  InsightType,
  InsightPriority,
  InsightCategory,
} from './PredictiveInsights';
