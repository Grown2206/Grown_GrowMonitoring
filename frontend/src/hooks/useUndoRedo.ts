import { useState, useCallback, useRef } from 'react';

export interface UndoRedoState<T> {
  past: T[];
  present: T;
  future: T[];
}

export interface UndoRedoResult<T> {
  state: T;
  setState: (newState: T | ((prev: T) => T)) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  clear: () => void;
  reset: (newState: T) => void;
  historySize: number;
}

export interface UndoRedoOptions {
  maxHistorySize?: number;
  debounceMs?: number;
}

/**
 * Hook for undo/redo functionality with history management
 *
 * @example
 * const { state, setState, undo, redo, canUndo, canRedo } = useUndoRedo({
 *   initialState: { name: '', age: 0 },
 *   maxHistorySize: 50,
 * });
 */
export function useUndoRedo<T>(
  initialState: T,
  options: UndoRedoOptions = {}
): UndoRedoResult<T> {
  const { maxHistorySize = 50, debounceMs = 0 } = options;

  const [history, setHistory] = useState<UndoRedoState<T>>({
    past: [],
    present: initialState,
    future: [],
  });

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const setState = useCallback(
    (newState: T | ((prev: T) => T)) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      const applyState = () => {
        setHistory((current) => {
          const resolvedState =
            typeof newState === 'function'
              ? (newState as (prev: T) => T)(current.present)
              : newState;

          // Don't add to history if state hasn't changed
          if (JSON.stringify(resolvedState) === JSON.stringify(current.present)) {
            return current;
          }

          let newPast = [...current.past, current.present];

          // Limit history size
          if (newPast.length > maxHistorySize) {
            newPast = newPast.slice(newPast.length - maxHistorySize);
          }

          return {
            past: newPast,
            present: resolvedState,
            future: [], // Clear future when making a new change
          };
        });
      };

      if (debounceMs > 0) {
        debounceTimerRef.current = setTimeout(applyState, debounceMs);
      } else {
        applyState();
      }
    },
    [maxHistorySize, debounceMs]
  );

  const undo = useCallback(() => {
    setHistory((current) => {
      if (current.past.length === 0) return current;

      const previous = current.past[current.past.length - 1];
      const newPast = current.past.slice(0, current.past.length - 1);

      return {
        past: newPast,
        present: previous,
        future: [current.present, ...current.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory((current) => {
      if (current.future.length === 0) return current;

      const next = current.future[0];
      const newFuture = current.future.slice(1);

      return {
        past: [...current.past, current.present],
        present: next,
        future: newFuture,
      };
    });
  }, []);

  const clear = useCallback(() => {
    setHistory((current) => ({
      past: [],
      present: current.present,
      future: [],
    }));
  }, []);

  const reset = useCallback((newState: T) => {
    setHistory({
      past: [],
      present: newState,
      future: [],
    });
  }, []);

  return {
    state: history.present,
    setState,
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    clear,
    reset,
    historySize: history.past.length + history.future.length + 1,
  };
}

/**
 * Hook for keyboard shortcuts for undo/redo
 */
export function useUndoRedoShortcuts(onUndo: () => void, onRedo: () => void) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger in input fields
      const target = event.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      if (isInput) return;

      // Ctrl/Cmd + Z for undo
      if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        onUndo();
      }

      // Ctrl/Cmd + Shift + Z for redo (or Ctrl/Cmd + Y)
      if (
        (event.ctrlKey || event.metaKey) &&
        ((event.key === 'z' && event.shiftKey) || event.key === 'y')
      ) {
        event.preventDefault();
        onRedo();
      }
    },
    [onUndo, onRedo]
  );

  return { handleKeyDown };
}

/**
 * Hook for managing undo/redo with React state
 * Alternative to useUndoRedo for simpler use cases
 */
export function useHistoryState<T>(
  initialState: T,
  maxHistory: number = 50
): [
  T,
  (newState: T | ((prev: T) => T)) => void,
  { undo: () => void; redo: () => void; canUndo: boolean; canRedo: boolean }
] {
  const { state, setState, undo, redo, canUndo, canRedo } = useUndoRedo(initialState, {
    maxHistorySize: maxHistory,
  });

  return [state, setState, { undo, redo, canUndo, canRedo }];
}
