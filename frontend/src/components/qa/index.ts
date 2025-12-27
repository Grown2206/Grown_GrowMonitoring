/**
 * Quality Assurance & Testing System (Sprint 74)
 *
 * Features:
 * - Comprehensive test case management
 * - Quality control inspections and checks
 * - Bug tracking and issue management
 * - Test execution tracking
 * - Quality criteria rating system
 * - Issue priority and severity tracking
 * - Resolution workflows
 */

// Test Manager
export { TestManager } from './TestManager';
export type {
  TestManagerProps,
  TestCase,
  TestStep,
  TestCategory,
  TestPriority,
  TestStatus,
} from './TestManager';

// Quality Control
export { QualityControl } from './QualityControl';
export type {
  QualityControlProps,
  QualityCheck,
  QualityCriteria,
  QualityCategory,
  CheckStatus,
} from './QualityControl';

// Issue Tracker
export { IssueTracker } from './IssueTracker';
export type {
  IssueTrackerProps,
  Issue,
  IssueType,
  IssueSeverity,
  IssuePriority,
  IssueStatus,
} from './IssueTracker';
