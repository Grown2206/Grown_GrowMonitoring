import { useState, useCallback, useMemo } from 'react';

export interface BulkActionOptions<T> {
  items: T[];
  getItemId: (item: T) => string | number;
  onAction?: (action: string, selectedItems: T[]) => Promise<void> | void;
}

export interface BulkActionResult<T> {
  selectedIds: Set<string | number>;
  selectedItems: T[];
  selectedCount: number;
  allSelected: boolean;
  someSelected: boolean;
  selectItem: (id: string | number) => void;
  deselectItem: (id: string | number) => void;
  toggleItem: (id: string | number) => void;
  selectAll: () => void;
  deselectAll: () => void;
  toggleAll: () => void;
  isSelected: (id: string | number) => boolean;
  executeAction: (action: string) => Promise<void>;
  isExecuting: boolean;
  error: string | null;
}

/**
 * Hook for bulk actions and multi-select functionality
 *
 * @example
 * const { selectedIds, selectedItems, toggleItem, selectAll, executeAction } = useBulkActions({
 *   items: plants,
 *   getItemId: (plant) => plant.id,
 *   onAction: async (action, items) => {
 *     if (action === 'delete') {
 *       await Promise.all(items.map(item => api.delete(`/plants/${item.id}`)));
 *     }
 *   },
 * });
 */
export function useBulkActions<T>({
  items,
  getItemId,
  onAction,
}: BulkActionOptions<T>): BulkActionResult<T> {
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedItems = useMemo(() => {
    return items.filter((item) => selectedIds.has(getItemId(item)));
  }, [items, selectedIds, getItemId]);

  const allSelected = useMemo(() => {
    return items.length > 0 && selectedIds.size === items.length;
  }, [items.length, selectedIds.size]);

  const someSelected = useMemo(() => {
    return selectedIds.size > 0 && selectedIds.size < items.length;
  }, [items.length, selectedIds.size]);

  const selectItem = useCallback((id: string | number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const deselectItem = useCallback((id: string | number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const toggleItem = useCallback((id: string | number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(items.map(getItemId)));
  }, [items, getItemId]);

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const toggleAll = useCallback(() => {
    if (allSelected) {
      deselectAll();
    } else {
      selectAll();
    }
  }, [allSelected, selectAll, deselectAll]);

  const isSelected = useCallback(
    (id: string | number) => selectedIds.has(id),
    [selectedIds]
  );

  const executeAction = useCallback(
    async (action: string) => {
      if (selectedItems.length === 0) {
        setError('No items selected');
        return;
      }

      setIsExecuting(true);
      setError(null);

      try {
        await onAction?.(action, selectedItems);
        deselectAll();
      } catch (err: any) {
        setError(err.message || 'Action failed');
        console.error('Bulk action error:', err);
      } finally {
        setIsExecuting(false);
      }
    },
    [selectedItems, onAction, deselectAll]
  );

  return {
    selectedIds,
    selectedItems,
    selectedCount: selectedIds.size,
    allSelected,
    someSelected,
    selectItem,
    deselectItem,
    toggleItem,
    selectAll,
    deselectAll,
    toggleAll,
    isSelected,
    executeAction,
    isExecuting,
    error,
  };
}

/**
 * Hook for bulk selection with range support (Shift+Click)
 */
export function useBulkSelect<T>(
  items: T[],
  getItemId: (item: T) => string | number
) {
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);

  const toggleItem = useCallback(
    (id: string | number, index: number, shiftKey: boolean) => {
      if (shiftKey && lastSelectedIndex !== null) {
        // Range selection
        const start = Math.min(lastSelectedIndex, index);
        const end = Math.max(lastSelectedIndex, index);
        const rangeIds = items
          .slice(start, end + 1)
          .map(getItemId);

        setSelectedIds((prev) => {
          const next = new Set(prev);
          rangeIds.forEach((rangeId) => next.add(rangeId));
          return next;
        });
      } else {
        // Single toggle
        setSelectedIds((prev) => {
          const next = new Set(prev);
          if (next.has(id)) {
            next.delete(id);
          } else {
            next.add(id);
          }
          return next;
        });
      }

      setLastSelectedIndex(index);
    },
    [items, getItemId, lastSelectedIndex]
  );

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(items.map(getItemId)));
  }, [items, getItemId]);

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
    setLastSelectedIndex(null);
  }, []);

  const isSelected = useCallback(
    (id: string | number) => selectedIds.has(id),
    [selectedIds]
  );

  return {
    selectedIds,
    selectedCount: selectedIds.size,
    toggleItem,
    selectAll,
    deselectAll,
    isSelected,
    allSelected: items.length > 0 && selectedIds.size === items.length,
    someSelected: selectedIds.size > 0 && selectedIds.size < items.length,
  };
}
