import { useEffect, useRef, useState, useCallback } from 'react';

export interface AutoSaveOptions {
  delay?: number; // Delay in milliseconds (default: 2000)
  onSave: (data: any) => Promise<void> | void;
  onError?: (error: any) => void;
  enabled?: boolean;
}

export type AutoSaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error';

/**
 * Hook for automatic saving with debounce
 *
 * @example
 * const { status, trigger } = useAutoSave(data, {
 *   delay: 2000,
 *   onSave: async (data) => {
 *     await api.put(`/items/${id}`, data);
 *   },
 * });
 */
export function useAutoSave<T>(
  data: T,
  options: AutoSaveOptions
) {
  const {
    delay = 2000,
    onSave,
    onError,
    enabled = true,
  } = options;

  const [status, setStatus] = useState<AutoSaveStatus>('idle');
  const [error, setError] = useState<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousDataRef = useRef<T>(data);
  const isSavingRef = useRef(false);

  const save = useCallback(async (dataToSave: T) => {
    if (isSavingRef.current) return;

    isSavingRef.current = true;
    setStatus('saving');
    setError(null);

    try {
      await onSave(dataToSave);
      setStatus('saved');

      // Reset to idle after showing "saved" for 2 seconds
      setTimeout(() => {
        setStatus((current) => current === 'saved' ? 'idle' : current);
      }, 2000);
    } catch (err) {
      setStatus('error');
      setError(err);
      onError?.(err);
      console.error('Auto-save error:', err);
    } finally {
      isSavingRef.current = false;
    }
  }, [onSave, onError]);

  const trigger = useCallback(() => {
    if (!enabled) return;

    setStatus('pending');

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      save(data);
    }, delay);
  }, [data, delay, enabled, save]);

  // Auto-save when data changes
  useEffect(() => {
    if (!enabled) return;

    // Check if data actually changed
    const hasChanged = JSON.stringify(data) !== JSON.stringify(previousDataRef.current);

    if (hasChanged) {
      previousDataRef.current = data;
      trigger();
    }

    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, enabled, trigger]);

  return {
    status,
    error,
    trigger,
    isSaving: status === 'saving',
    isSaved: status === 'saved',
    isPending: status === 'pending',
    hasError: status === 'error',
  };
}

/**
 * Hook for auto-saving individual form fields
 *
 * @example
 * const { handleChange, status } = useFormAutoSave({
 *   onSave: async (field, value) => {
 *     await api.patch(`/items/${id}`, { [field]: value });
 *   },
 * });
 *
 * <TextField onChange={(e) => handleChange('name', e.target.value)} />
 */
export function useFormAutoSave(options: Omit<AutoSaveOptions, 'onSave'> & {
  onSave: (field: string, value: any) => Promise<void> | void;
}) {
  const [fieldStatuses, setFieldStatuses] = useState<Record<string, AutoSaveStatus>>({});
  const timeoutsRef = useRef<Record<string, NodeJS.Timeout>>({});

  const handleChange = useCallback(async (field: string, value: any) => {
    const { delay = 2000, onSave, onError, enabled = true } = options;

    if (!enabled) return;

    // Clear existing timeout for this field
    if (timeoutsRef.current[field]) {
      clearTimeout(timeoutsRef.current[field]);
    }

    // Set pending status
    setFieldStatuses((prev) => ({ ...prev, [field]: 'pending' }));

    // Set new timeout
    timeoutsRef.current[field] = setTimeout(async () => {
      setFieldStatuses((prev) => ({ ...prev, [field]: 'saving' }));

      try {
        await onSave(field, value);
        setFieldStatuses((prev) => ({ ...prev, [field]: 'saved' }));

        // Reset to idle after 2 seconds
        setTimeout(() => {
          setFieldStatuses((prev) => {
            const next = { ...prev };
            if (next[field] === 'saved') {
              delete next[field];
            }
            return next;
          });
        }, 2000);
      } catch (error) {
        setFieldStatuses((prev) => ({ ...prev, [field]: 'error' }));
        onError?.(error);
        console.error('Field auto-save error:', error);
      }
    }, delay);
  }, [options]);

  useEffect(() => {
    // Cleanup timeouts on unmount
    return () => {
      Object.values(timeoutsRef.current).forEach(clearTimeout);
    };
  }, []);

  return {
    handleChange,
    fieldStatuses,
    getStatus: (field: string) => fieldStatuses[field] || 'idle',
  };
}
