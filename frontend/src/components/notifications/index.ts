/**
 * Real-time Notifications & Alerts System
 *
 * Features:
 * - Real-time notification center with badge and drawer
 * - Notification settings and preferences management
 * - Alert monitoring with severity levels and workflows
 * - Notification history with filtering and search
 * - Multi-channel support (email, SMS, push, in-app, Telegram, Discord)
 * - Alert rules and automation
 * - Acknowledgment and resolution workflow
 * - Priority and frequency settings
 * - Quiet hours configuration
 */

// Notification Center (Sprint 66)
export { NotificationCenter } from './NotificationCenter';
export type {
  NotificationCenterProps,
  Notification,
  NotificationType,
  NotificationPriority,
} from './NotificationCenter';

// Notification Settings (Sprint 66)
export { NotificationSettings } from './NotificationSettings';
export type {
  NotificationSettingsProps,
  NotificationPreference,
  NotificationChannel,
  NotificationFrequency,
} from './NotificationSettings';

// Alerts Panel (Sprint 66)
export { AlertsPanel } from './AlertsPanel';
export type {
  AlertsPanelProps,
  Alert,
  AlertRule,
  AlertSeverity,
  AlertStatus,
} from './AlertsPanel';

// Notification Preferences (Earlier Sprint)
export { NotificationPreferences, QuickNotificationSettings } from './NotificationPreferences';
export type { NotificationPreferencesProps } from './NotificationPreferences';

// Notification History (Earlier Sprint)
export { NotificationHistory } from './NotificationHistory';
export type { NotificationHistoryItem, NotificationHistoryProps } from './NotificationHistory';
