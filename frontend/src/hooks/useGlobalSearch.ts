import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export type SearchEntityType = 'plant' | 'sensor' | 'device' | 'harvest' | 'automation' | 'strain' | 'alert' | 'note';

export interface GlobalSearchResult {
  id: number;
  type: SearchEntityType;
  title: string;
  subtitle?: string;
  description?: string;
  metadata?: Record<string, any>;
  score?: number;
}

export interface GlobalSearchOptions {
  types?: SearchEntityType[];
  limit?: number;
  minQueryLength?: number;
  debounceMs?: number;
}

/**
 * Hook for global search across multiple entity types
 *
 * @example
 * const { query, setQuery, results, isSearching, error } = useGlobalSearch({
 *   types: ['plant', 'sensor', 'device'],
 *   limit: 10,
 * });
 */
export function useGlobalSearch(options: GlobalSearchOptions = {}) {
  const {
    types = ['plant', 'sensor', 'device', 'harvest', 'automation', 'strain', 'alert', 'note'],
    limit = 20,
    minQueryLength = 2,
    debounceMs = 300,
  } = options;

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<GlobalSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  // Perform search
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedQuery.length < minQueryLength) {
        setResults([]);
        return;
      }

      setIsSearching(true);
      setError(null);

      try {
        const searchPromises = types.map(async (type) => {
          try {
            const response = await api.get(`/${type}s`, {
              params: { search: debouncedQuery, limit },
            });
            const items = response.data;

            return items.map((item: any) => transformToSearchResult(item, type));
          } catch (err) {
            console.error(`Error searching ${type}s:`, err);
            return [];
          }
        });

        const allResults = await Promise.all(searchPromises);
        const flatResults = allResults.flat();

        // Score and sort results
        const scoredResults = flatResults
          .map((result) => ({
            ...result,
            score: calculateScore(result, debouncedQuery),
          }))
          .sort((a, b) => (b.score || 0) - (a.score || 0))
          .slice(0, limit);

        setResults(scoredResults);
      } catch (err: any) {
        setError(err.message || 'Search failed');
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();
  }, [debouncedQuery, types, limit, minQueryLength]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
    setResults([]);
    setError(null);
  }, []);

  return {
    query,
    setQuery,
    results,
    isSearching,
    error,
    clearSearch,
    hasResults: results.length > 0,
  };
}

/**
 * Transform API response to search result
 */
function transformToSearchResult(item: any, type: SearchEntityType): GlobalSearchResult {
  const base: GlobalSearchResult = {
    id: item.id,
    type,
    title: '',
    metadata: item,
  };

  switch (type) {
    case 'plant':
      return {
        ...base,
        title: item.name,
        subtitle: item.strain?.name || 'No strain',
        description: `Phase: ${item.phase}`,
      };
    case 'sensor':
      return {
        ...base,
        title: item.name || `Sensor #${item.id}`,
        subtitle: item.type,
        description: item.location,
      };
    case 'device':
      return {
        ...base,
        title: item.name || `Device #${item.id}`,
        subtitle: item.type,
        description: item.status === 'online' ? 'Online' : 'Offline',
      };
    case 'harvest':
      return {
        ...base,
        title: `Harvest #${item.id}`,
        subtitle: item.plant?.name,
        description: `${item.wetWeight}g wet / ${item.dryWeight}g dry`,
      };
    case 'automation':
      return {
        ...base,
        title: item.name || `Rule #${item.id}`,
        subtitle: item.enabled ? 'Enabled' : 'Disabled',
        description: item.description,
      };
    case 'strain':
      return {
        ...base,
        title: item.name,
        subtitle: item.type,
        description: item.genetics,
      };
    case 'alert':
      return {
        ...base,
        title: item.title,
        subtitle: item.severity,
        description: item.message,
      };
    case 'note':
      return {
        ...base,
        title: item.title || 'Note',
        subtitle: item.category,
        description: item.content?.substring(0, 100),
      };
    default:
      return base;
  }
}

/**
 * Calculate relevance score for search result
 */
function calculateScore(result: GlobalSearchResult, query: string): number {
  const lowerQuery = query.toLowerCase();
  let score = 0;

  // Title match
  const title = result.title.toLowerCase();
  if (title === lowerQuery) score += 100;
  else if (title.startsWith(lowerQuery)) score += 50;
  else if (title.includes(lowerQuery)) score += 25;

  // Subtitle match
  if (result.subtitle) {
    const subtitle = result.subtitle.toLowerCase();
    if (subtitle.includes(lowerQuery)) score += 10;
  }

  // Description match
  if (result.description) {
    const description = result.description.toLowerCase();
    if (description.includes(lowerQuery)) score += 5;
  }

  return score;
}

/**
 * Group search results by type
 */
export function groupResultsByType(results: GlobalSearchResult[]): Record<SearchEntityType, GlobalSearchResult[]> {
  const grouped: Record<string, GlobalSearchResult[]> = {};

  results.forEach((result) => {
    if (!grouped[result.type]) {
      grouped[result.type] = [];
    }
    grouped[result.type].push(result);
  });

  return grouped as Record<SearchEntityType, GlobalSearchResult[]>;
}
