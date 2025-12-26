/**
 * Enhanced Notification System Components
 *
 * Features:
 * - Notification preferences with channel management
 * - Notification history with filtering and search
 * - Quick notification settings toggle
 * - Multi-channel support (email, SMS, push, Telegram, Discord)
 * - Priority and frequency settings
 * - Quiet hours configuration
 */

// Notification Preferences
export { NotificationPreferences, QuickNotificationSettings } from './NotificationPreferences';
export type { NotificationChannel, NotificationPreference, NotificationPreferencesProps } from './NotificationPreferences';

// Notification History
export { NotificationHistory } from './NotificationHistory';
export type { NotificationHistoryItem, NotificationHistoryProps } from './NotificationHistory';
