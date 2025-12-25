import { useState, useCallback } from 'react';

interface ClipboardItem {
  type: string;
  data: any;
  timestamp: number;
}

const CLIPBOARD_KEY = 'grow-monitoring-clipboard';
const CLIPBOARD_MAX_AGE = 1000 * 60 * 60; // 1 hour

/**
 * Hook for copy/paste functionality
 * Provides clipboard management for duplicating items
 */
export function useCopyPaste() {
  const [clipboard, setClipboard] = useState<ClipboardItem | null>(() => {
    try {
      const stored = localStorage.getItem(CLIPBOARD_KEY);
      if (stored) {
        const item: ClipboardItem = JSON.parse(stored);
        // Check if clipboard item is still valid (not older than max age)
        if (Date.now() - item.timestamp < CLIPBOARD_MAX_AGE) {
          return item;
        }
      }
    } catch (error) {
      console.error('Error loading clipboard:', error);
    }
    return null;
  });

  /**
   * Copy an item to clipboard
   */
  const copy = useCallback((type: string, data: any) => {
    const item: ClipboardItem = {
      type,
      data,
      timestamp: Date.now(),
    };

    setClipboard(item);

    try {
      localStorage.setItem(CLIPBOARD_KEY, JSON.stringify(item));
    } catch (error) {
      console.error('Error saving to clipboard:', error);
    }
  }, []);

  /**
   * Get clipboard data (without clearing)
   */
  const peek = useCallback((expectedType?: string): any | null => {
    if (!clipboard) return null;

    // Check if clipboard is still valid
    if (Date.now() - clipboard.timestamp > CLIPBOARD_MAX_AGE) {
      clear();
      return null;
    }

    // Check type if specified
    if (expectedType && clipboard.type !== expectedType) {
      return null;
    }

    return clipboard.data;
  }, [clipboard]);

  /**
   * Paste clipboard data and optionally clear it
   */
  const paste = useCallback((expectedType?: string, clearAfter: boolean = false): any | null => {
    const data = peek(expectedType);

    if (clearAfter && data) {
      clear();
    }

    return data;
  }, [peek]);

  /**
   * Clear clipboard
   */
  const clear = useCallback(() => {
    setClipboard(null);
    try {
      localStorage.removeItem(CLIPBOARD_KEY);
    } catch (error) {
      console.error('Error clearing clipboard:', error);
    }
  }, []);

  /**
   * Check if clipboard has data of specific type
   */
  const hasType = useCallback((type: string): boolean => {
    if (!clipboard) return false;
    if (Date.now() - clipboard.timestamp > CLIPBOARD_MAX_AGE) {
      clear();
      return false;
    }
    return clipboard.type === type;
  }, [clipboard, clear]);

  /**
   * Get clipboard type
   */
  const getType = useCallback((): string | null => {
    if (!clipboard) return null;
    if (Date.now() - clipboard.timestamp > CLIPBOARD_MAX_AGE) {
      clear();
      return null;
    }
    return clipboard.type;
  }, [clipboard, clear]);

  return {
    copy,
    paste,
    peek,
    clear,
    hasType,
    getType,
    hasClipboard: !!clipboard,
    clipboardType: getType(),
  };
}

/**
 * Hook for keyboard copy/paste shortcuts
 */
export function useCopyPasteShortcuts(
  onCopy?: () => void,
  onPaste?: () => void
) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger in input fields
    const target = event.target as HTMLElement;
    const isInput =
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable;

    if (isInput) return;

    if ((event.ctrlKey || event.metaKey) && event.key === 'c') {
      event.preventDefault();
      onCopy?.();
    }

    if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
      event.preventDefault();
      onPaste?.();
    }
  }, [onCopy, onPaste]);

  return { handleKeyDown };
}

/**
 * Helper to create a copy of an item with modified fields
 */
export function createCopy<T extends Record<string, any>>(
  original: T,
  overrides: Partial<T> = {},
  fieldsToRemove: string[] = ['id', 'createdAt', 'updatedAt']
): Partial<T> {
  const copy: any = { ...original };

  // Remove specified fields
  fieldsToRemove.forEach(field => {
    delete copy[field];
  });

  // Apply overrides
  Object.assign(copy, overrides);

  // Add suffix to name if it exists
  if ('name' in copy && copy.name && !('name' in overrides)) {
    copy.name = `${copy.name} (Copy)`;
  }

  return copy;
}
