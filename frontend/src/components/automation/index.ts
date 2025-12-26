/**
 * Automation & Workflow Management Components
 *
 * Features:
 * - Visual workflow builder with drag-and-drop
 * - Simple trigger-action automation rules
 * - Task scheduling with cron support
 * - Execution history and monitoring
 */

// Workflow Builder
export { WorkflowBuilder } from './WorkflowBuilder';
export type {
  WorkflowBuilderProps,
  Workflow,
  WorkflowTrigger,
  WorkflowCondition,
  WorkflowAction,
  WorkflowTriggerType,
  WorkflowActionType,
} from './WorkflowBuilder';

// Automation Rules
export { AutomationRules } from './AutomationRules';
export type {
  AutomationRulesProps,
  AutomationRule,
  TriggerType,
  ActionType,
  ComparisonOperator,
} from './AutomationRules';

// Scheduled Tasks
export { ScheduledTasks } from './ScheduledTasks';
export type {
  ScheduledTasksProps,
  ScheduledTask,
  TaskExecution,
  TaskFrequency,
  TaskStatus,
} from './ScheduledTasks';
