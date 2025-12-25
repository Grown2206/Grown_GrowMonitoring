import { useState, useMemo, useCallback, useEffect } from 'react';

export interface SearchOptions<T> {
  data: T[];
  searchFields: (keyof T)[];
  filterFn?: (item: T, filters: Record<string, any>) => boolean;
  sortFn?: (a: T, b: T, sortBy: string, sortOrder: 'asc' | 'desc') => number;
  debounceMs?: number;
}

export interface UseSearchResult<T> {
  query: string;
  setQuery: (query: string) => void;
  filters: Record<string, any>;
  setFilters: (filters: Record<string, any>) => void;
  sortBy: string;
  setSortBy: (field: string) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
  toggleSortOrder: () => void;
  results: T[];
  totalResults: number;
  isSearching: boolean;
  clearSearch: () => void;
}

/**
 * Hook for client-side search, filter, and sort functionality
 *
 * @example
 * const { query, setQuery, results, filters, setFilters, sortBy, setSortBy } = useSearch({
 *   data: plants,
 *   searchFields: ['name', 'strain'],
 *   filterFn: (plant, filters) => {
 *     if (filters.phase && plant.phase !== filters.phase) return false;
 *     return true;
 *   },
 * });
 */
export function useSearch<T extends Record<string, any>>({
  data,
  searchFields,
  filterFn,
  sortFn,
  debounceMs = 300,
}: SearchOptions<T>): UseSearchResult<T> {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isSearching, setIsSearching] = useState(false);

  // Debounce search query
  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setIsSearching(false);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  const results = useMemo(() => {
    let filtered = [...data];

    // Apply search query
    if (debouncedQuery.trim()) {
      const lowerQuery = debouncedQuery.toLowerCase();
      filtered = filtered.filter((item) => {
        return searchFields.some((field) => {
          const value = item[field];
          if (value == null) return false;
          return String(value).toLowerCase().includes(lowerQuery);
        });
      });
    }

    // Apply custom filters
    if (filterFn && Object.keys(filters).length > 0) {
      filtered = filtered.filter((item) => filterFn(item, filters));
    }

    // Apply sorting
    if (sortBy) {
      filtered.sort((a, b) => {
        if (sortFn) {
          return sortFn(a, b, sortBy, sortOrder);
        }

        // Default sorting
        const aValue = a[sortBy];
        const bValue = b[sortBy];

        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return sortOrder === 'asc' ? 1 : -1;
        if (bValue == null) return sortOrder === 'asc' ? -1 : 1;

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortOrder === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
        }

        if (aValue instanceof Date && bValue instanceof Date) {
          return sortOrder === 'asc'
            ? aValue.getTime() - bValue.getTime()
            : bValue.getTime() - aValue.getTime();
        }

        return 0;
      });
    }

    return filtered;
  }, [data, debouncedQuery, filters, sortBy, sortOrder, searchFields, filterFn, sortFn]);

  const toggleSortOrder = useCallback(() => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  }, []);

  const clearSearch = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
    setFilters({});
    setSortBy('');
    setSortOrder('asc');
  }, []);

  return {
    query,
    setQuery,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    toggleSortOrder,
    results,
    totalResults: results.length,
    isSearching,
    clearSearch,
  };
}

/**
 * Hook for fuzzy search with ranking
 */
export function useFuzzySearch<T extends Record<string, any>>(
  data: T[],
  searchFields: (keyof T)[],
  query: string
): T[] {
  return useMemo(() => {
    if (!query.trim()) return data;

    const lowerQuery = query.toLowerCase();
    const words = lowerQuery.split(/\s+/);

    const scored = data.map((item) => {
      let score = 0;

      searchFields.forEach((field) => {
        const value = String(item[field] || '').toLowerCase();

        // Exact match
        if (value === lowerQuery) {
          score += 100;
        }

        // Starts with
        if (value.startsWith(lowerQuery)) {
          score += 50;
        }

        // Contains
        if (value.includes(lowerQuery)) {
          score += 25;
        }

        // Word matches
        words.forEach((word) => {
          if (value.includes(word)) {
            score += 10;
          }
        });
      });

      return { item, score };
    });

    return scored
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ item }) => item);
  }, [data, searchFields, query]);
}

/**
 * Hook for highlighting search terms in text
 */
export function useHighlight(text: string, query: string): string {
  return useMemo(() => {
    if (!query.trim()) return text;

    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }, [text, query]);
}
