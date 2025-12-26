/**
 * Settings & Configuration Components
 *
 * Features:
 * - Comprehensive settings panel with categorized sections
 * - Theme customization (colors, fonts, spacing, animations)
 * - User preferences (language, timezone, display, notifications)
 * - Advanced system configuration
 * - Performance tuning and optimization
 * - Security and privacy controls
 * - Debug and logging configuration
 * - Backup and maintenance tools
 */

// Settings Panel
export { SettingsPanel } from './SettingsPanel';
export type { SettingsPanelProps, SettingsSection } from './SettingsPanel';

// Theme Customizer
export { ThemeCustomizer } from './ThemeCustomizer';
export type { ThemeCustomizerProps, ThemeSettings } from './ThemeCustomizer';

// Preferences Manager
export { PreferencesManager } from './PreferencesManager';
export type { PreferencesManagerProps, UserPreferences } from './PreferencesManager';

// System Configuration
export { SystemConfig } from './SystemConfig';
export type { SystemConfigProps, SystemConfiguration } from './SystemConfig';
