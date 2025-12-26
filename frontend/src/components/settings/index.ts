/**
 * Settings & Configuration Management System
 *
 * Features:
 * - System-wide settings (email, storage, backup, security, API, database, cache, logs)
 * - Appearance customization (theme, typography, localization, accessibility, layout)
 * - Third-party integrations (API, cloud, email, Slack, storage, webhooks)
 * - Comprehensive settings panel with categorized sections
 * - Theme customization (colors, fonts, spacing, animations)
 * - User preferences (language, timezone, display, notifications)
 * - Advanced system configuration
 * - Performance tuning and optimization
 * - Security and privacy controls
 * - Debug and logging configuration
 * - Backup and maintenance tools
 */

// System Settings (Sprint 69)
export { SystemSettings } from './SystemSettings';
export type {
  SystemSettingsProps,
  SystemSettingsData,
  EmailSettings,
  StorageSettings,
  BackupSettings,
  SecuritySettings,
  ApiSettings,
  DatabaseSettings,
  CacheSettings,
  LogSettings,
} from './SystemSettings';

// Appearance Settings (Sprint 69)
export { AppearanceSettings } from './AppearanceSettings';
export type {
  AppearanceSettingsProps,
  AppearanceSettingsData,
  ThemeMode,
  ColorScheme,
  FontSize,
  Language,
  DateFormat,
  TimeFormat,
} from './AppearanceSettings';

// Integration Settings (Sprint 69)
export { IntegrationSettings } from './IntegrationSettings';
export type {
  IntegrationSettingsProps,
  Integration,
  IntegrationType,
  IntegrationStatus,
} from './IntegrationSettings';

// Settings Panel (Earlier Sprint)
export { SettingsPanel } from './SettingsPanel';
export type { SettingsPanelProps, SettingsSection } from './SettingsPanel';

// Theme Customizer (Earlier Sprint)
export { ThemeCustomizer } from './ThemeCustomizer';
export type { ThemeCustomizerProps, ThemeSettings } from './ThemeCustomizer';

// Preferences Manager (Earlier Sprint)
export { PreferencesManager } from './PreferencesManager';
export type { PreferencesManagerProps, UserPreferences } from './PreferencesManager';

// System Configuration (Earlier Sprint)
export { SystemConfig } from './SystemConfig';
export type { SystemConfigProps, SystemConfiguration } from './SystemConfig';
