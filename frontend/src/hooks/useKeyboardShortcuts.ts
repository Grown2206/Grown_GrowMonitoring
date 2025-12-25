import { useEffect } from 'react';
import { useKeyboardShortcutsContext, KeyboardShortcut } from '../contexts/KeyboardShortcutsContext';

/**
 * Hook to register keyboard shortcuts within a component
 * Shortcuts are automatically unregistered when the component unmounts
 *
 * @example
 * useKeyboardShortcuts([
 *   {
 *     id: 'save-data',
 *     key: 's',
 *     ctrl: true,
 *     description: 'Save data',
 *     category: 'Actions',
 *     action: handleSave,
 *   },
 * ]);
 */
export function useKeyboardShortcuts(
  shortcuts: Array<{ id: string } & KeyboardShortcut>
) {
  const { registerShortcut, unregisterShortcut } = useKeyboardShortcutsContext();

  useEffect(() => {
    shortcuts.forEach(({ id, ...shortcut }) => {
      registerShortcut(id, shortcut);
    });

    return () => {
      shortcuts.forEach(({ id }) => {
        unregisterShortcut(id);
      });
    };
  }, [shortcuts, registerShortcut, unregisterShortcut]);
}

/**
 * Hook to access keyboard shortcuts context
 */
export function useKeyboardShortcutsHelp() {
  const { showHelp, hideHelp, helpVisible, shortcuts } = useKeyboardShortcutsContext();
  return { showHelp, hideHelp, helpVisible, shortcuts };
}
