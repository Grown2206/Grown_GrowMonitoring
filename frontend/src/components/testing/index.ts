/**
 * Testing & Quality Assurance Components
 *
 * Features:
 * - Test execution dashboard with multiple test types
 * - Error boundary for graceful error handling
 * - Real-time performance monitoring
 * - Web Vitals tracking
 * - Code coverage reporting
 */

// Testing Dashboard
export { TestingDashboard } from './TestingDashboard';
export type {
  TestingDashboardProps,
  TestSuite,
  Test,
  TestType,
  TestStatus,
} from './TestingDashboard';

// Error Boundary
export { ErrorBoundary, withErrorBoundary, CompactErrorFallback } from './ErrorBoundary';
export type {
  ErrorBoundaryProps,
  ErrorBoundaryState,
} from './ErrorBoundary';

// Performance Monitor
export { PerformanceMonitor } from './PerformanceMonitor';
export type {
  PerformanceMonitorProps,
  PerformanceMetric,
  PerformanceData,
} from './PerformanceMonitor';
