/**
 * Advanced Reporting & Analytics Dashboard
 *
 * Features:
 * - Custom report builder with visual query designer
 * - Customizable dashboard with drag-and-drop widgets
 * - Advanced data visualization components
 * - Scheduled report generation
 * - Multiple chart types (bar, line, pie, area, scatter)
 * - Report filtering and grouping
 * - Export to multiple formats (PDF, Excel, CSV)
 * - Real-time data updates
 * - Widget customization
 */

// Report Builder
export { ReportBuilder } from './ReportBuilder';
export type {
  ReportBuilderProps,
  Report,
  ReportField,
  ReportFilter,
  ReportType,
  ChartType,
  DataSource,
  AggregationType,
} from './ReportBuilder';

// Custom Dashboard
export { CustomDashboard } from './CustomDashboard';
export type {
  CustomDashboardProps,
  Dashboard,
  Widget,
  WidgetType,
  WidgetSize,
} from './CustomDashboard';

// Data Visualization
export { DataVisualization } from './DataVisualization';
export type {
  DataVisualizationProps,
  VisualizationType,
} from './DataVisualization';
