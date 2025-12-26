/**
 * Dashboard Widgets & Customization Components
 *
 * Features:
 * - Widget library with 12+ widget types
 * - Dashboard templates (6 pre-configured layouts)
 * - Widget configurator with color and refresh settings
 * - Template preview and application
 * - Category-based widget organization
 */

// Widget Library
export { WidgetLibrary, getWidgetDefinition, getAllWidgetDefinitions } from './WidgetLibrary';
export type { WidgetDefinition, WidgetLibraryProps } from './WidgetLibrary';

// Dashboard Templates
export { DashboardTemplates, getTemplateById, getAllTemplates } from './DashboardTemplates';
export type { DashboardTemplate, DashboardLayout, DashboardTemplatesProps } from './DashboardTemplates';

// Widget Configurator
export { WidgetConfigurator, WidgetSettingsButton } from './WidgetConfigurator';
export type { WidgetConfig, WidgetConfiguratorProps } from './WidgetConfigurator';
