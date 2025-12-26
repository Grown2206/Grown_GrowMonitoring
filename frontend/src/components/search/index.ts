/**
 * Advanced Search & Filter Components
 *
 * Features:
 * - Advanced search bar with suggestions
 * - Filter panel with multiple filter types
 * - Active filters display
 * - Search history
 * - Compact search variants
 */

// Search Bar Components
export { SearchBar, CompactSearchBar } from './SearchBar';
export type { SearchBarProps, SearchSuggestion } from './SearchBar';

// Filter Panel Components
export { FilterPanel, ActiveFilters } from './FilterPanel';
export type {
  FilterPanelProps,
  FilterGroup,
  FilterOption,
  ActiveFilter,
} from './FilterPanel';

// Re-export search hooks
export { useSearch, useFuzzySearch, useHighlight } from '../../hooks/useSearch';
export type { SearchOptions, UseSearchResult } from '../../hooks/useSearch';
