import { useState, useMemo, useCallback } from 'react';

export type SortDirection = 'asc' | 'desc' | null;

export interface SortConfig<T> {
  key: keyof T;
  direction: SortDirection;
}

export interface FilterConfig<T> {
  key: keyof T;
  value: string;
  operator?: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'lt';
}

export interface PaginationConfig {
  page: number;
  rowsPerPage: number;
}

export interface TableState<T> {
  data: T[];
  sortedData: T[];
  paginatedData: T[];
  sortConfig: SortConfig<T> | null;
  filters: FilterConfig<T>[];
  pagination: PaginationConfig;
  selectedRows: Set<number>;
}

export interface TableActions<T> {
  // Sorting
  handleSort: (key: keyof T) => void;
  clearSort: () => void;

  // Filtering
  addFilter: (filter: FilterConfig<T>) => void;
  removeFilter: (key: keyof T) => void;
  clearFilters: () => void;

  // Pagination
  handleChangePage: (page: number) => void;
  handleChangeRowsPerPage: (rowsPerPage: number) => void;

  // Selection
  handleSelectRow: (index: number) => void;
  handleSelectAll: () => void;
  handleDeselectAll: () => void;
  isRowSelected: (index: number) => boolean;
}

export interface UseTableOptions<T> {
  initialData: T[];
  initialSort?: SortConfig<T> | null;
  initialFilters?: FilterConfig<T>[];
  initialPage?: number;
  initialRowsPerPage?: number;
}

/**
 * Comprehensive table hook with sorting, filtering, pagination, and selection
 */
export function useTable<T>({
  initialData,
  initialSort = null,
  initialFilters = [],
  initialPage = 0,
  initialRowsPerPage = 10,
}: UseTableOptions<T>): TableState<T> & TableActions<T> {
  const [data] = useState<T[]>(initialData);
  const [sortConfig, setSortConfig] = useState<SortConfig<T> | null>(initialSort);
  const [filters, setFilters] = useState<FilterConfig<T>[]>(initialFilters);
  const [pagination, setPagination] = useState<PaginationConfig>({
    page: initialPage,
    rowsPerPage: initialRowsPerPage,
  });
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  // Apply filters
  const filteredData = useMemo(() => {
    if (filters.length === 0) return data;

    return data.filter((item) => {
      return filters.every((filter) => {
        const value = item[filter.key];
        const filterValue = filter.value.toLowerCase();
        const itemValue = String(value).toLowerCase();

        switch (filter.operator || 'contains') {
          case 'equals':
            return itemValue === filterValue;
          case 'contains':
            return itemValue.includes(filterValue);
          case 'startsWith':
            return itemValue.startsWith(filterValue);
          case 'endsWith':
            return itemValue.endsWith(filterValue);
          case 'gt':
            return Number(value) > Number(filter.value);
          case 'lt':
            return Number(value) < Number(filter.value);
          default:
            return true;
        }
      });
    });
  }, [data, filters]);

  // Apply sorting
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    const sorted = [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === bValue) return 0;

      let comparison = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else {
        comparison = aValue > bValue ? 1 : -1;
      }

      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [filteredData, sortConfig]);

  // Apply pagination
  const paginatedData = useMemo(() => {
    const startIndex = pagination.page * pagination.rowsPerPage;
    const endIndex = startIndex + pagination.rowsPerPage;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, pagination]);

  // Sorting actions
  const handleSort = useCallback((key: keyof T) => {
    setSortConfig((current) => {
      if (!current || current.key !== key) {
        return { key, direction: 'asc' };
      }

      if (current.direction === 'asc') {
        return { key, direction: 'desc' };
      }

      return null; // Clear sort on third click
    });

    // Reset to first page when sorting changes
    setPagination((prev) => ({ ...prev, page: 0 }));
  }, []);

  const clearSort = useCallback(() => {
    setSortConfig(null);
  }, []);

  // Filtering actions
  const addFilter = useCallback((filter: FilterConfig<T>) => {
    setFilters((current) => {
      const existing = current.find((f) => f.key === filter.key);
      if (existing) {
        return current.map((f) => (f.key === filter.key ? filter : f));
      }
      return [...current, filter];
    });

    // Reset to first page when filters change
    setPagination((prev) => ({ ...prev, page: 0 }));
  }, []);

  const removeFilter = useCallback((key: keyof T) => {
    setFilters((current) => current.filter((f) => f.key !== key));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters([]);
  }, []);

  // Pagination actions
  const handleChangePage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const handleChangeRowsPerPage = useCallback((rowsPerPage: number) => {
    setPagination({ page: 0, rowsPerPage });
  }, []);

  // Selection actions
  const handleSelectRow = useCallback((index: number) => {
    setSelectedRows((current) => {
      const newSet = new Set(current);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    const allIndices = Array.from({ length: sortedData.length }, (_, i) => i);
    setSelectedRows(new Set(allIndices));
  }, [sortedData.length]);

  const handleDeselectAll = useCallback(() => {
    setSelectedRows(new Set());
  }, []);

  const isRowSelected = useCallback(
    (index: number) => {
      return selectedRows.has(index);
    },
    [selectedRows]
  );

  return {
    // State
    data,
    sortedData,
    paginatedData,
    sortConfig,
    filters,
    pagination,
    selectedRows,

    // Actions
    handleSort,
    clearSort,
    addFilter,
    removeFilter,
    clearFilters,
    handleChangePage,
    handleChangeRowsPerPage,
    handleSelectRow,
    handleSelectAll,
    handleDeselectAll,
    isRowSelected,
  };
}

/**
 * Simple sorting hook for basic tables
 */
export function useTableSort<T>(data: T[], initialKey?: keyof T) {
  const [sortConfig, setSortConfig] = useState<SortConfig<T> | null>(
    initialKey ? { key: initialKey, direction: 'asc' } : null
  );

  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === bValue) return 0;

      let comparison = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else {
        comparison = aValue > bValue ? 1 : -1;
      }

      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [data, sortConfig]);

  const handleSort = useCallback((key: keyof T) => {
    setSortConfig((current) => {
      if (!current || current.key !== key) {
        return { key, direction: 'asc' };
      }

      if (current.direction === 'asc') {
        return { key, direction: 'desc' };
      }

      return null;
    });
  }, []);

  return { sortedData, sortConfig, handleSort };
}

/**
 * Simple pagination hook
 */
export function useTablePagination<T>(data: T[], initialRowsPerPage = 10) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);

  const paginatedData = useMemo(() => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return data.slice(startIndex, endIndex);
  }, [data, page, rowsPerPage]);

  const handleChangePage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  }, []);

  const totalPages = Math.ceil(data.length / rowsPerPage);

  return {
    paginatedData,
    page,
    rowsPerPage,
    totalPages,
    handleChangePage,
    handleChangeRowsPerPage,
  };
}
