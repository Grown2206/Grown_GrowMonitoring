import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  description: string;
  category: string;
  action: () => void;
  enabled?: boolean;
}

interface KeyboardShortcutsContextType {
  shortcuts: KeyboardShortcut[];
  registerShortcut: (id: string, shortcut: KeyboardShortcut) => void;
  unregisterShortcut: (id: string) => void;
  enableShortcut: (id: string) => void;
  disableShortcut: (id: string) => void;
  showHelp: () => void;
  hideHelp: () => void;
  helpVisible: boolean;
}

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextType | undefined>(undefined);

export function KeyboardShortcutsProvider({ children }: { children: React.ReactNode }) {
  const [shortcuts, setShortcuts] = useState<Map<string, KeyboardShortcut>>(new Map());
  const [helpVisible, setHelpVisible] = useState(false);
  const navigate = useNavigate();

  // Core navigation shortcuts
  useEffect(() => {
    const coreShortcuts: Record<string, KeyboardShortcut> = {
      'nav-dashboard': {
        key: '1',
        ctrl: true,
        description: 'Go to Dashboard',
        category: 'Navigation',
        action: () => navigate('/dashboard'),
      },
      'nav-plants': {
        key: '2',
        ctrl: true,
        description: 'Go to Plants',
        category: 'Navigation',
        action: () => navigate('/plants'),
      },
      'nav-analytics': {
        key: '3',
        ctrl: true,
        description: 'Go to Analytics',
        category: 'Navigation',
        action: () => navigate('/analytics'),
      },
      'nav-sensors': {
        key: '4',
        ctrl: true,
        description: 'Go to Sensors',
        category: 'Navigation',
        action: () => navigate('/sensors'),
      },
      'nav-devices': {
        key: '5',
        ctrl: true,
        description: 'Go to Devices',
        category: 'Navigation',
        action: () => navigate('/devices'),
      },
      'nav-automation': {
        key: '6',
        ctrl: true,
        description: 'Go to Automation',
        category: 'Navigation',
        action: () => navigate('/automation'),
      },
      'nav-settings': {
        key: ',',
        ctrl: true,
        description: 'Open Settings',
        category: 'Navigation',
        action: () => navigate('/settings'),
      },
      'action-search': {
        key: 'k',
        ctrl: true,
        description: 'Open Quick Search',
        category: 'Actions',
        action: () => {
          const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
          if (searchInput) {
            searchInput.focus();
          }
        },
      },
      'action-refresh': {
        key: 'r',
        ctrl: true,
        description: 'Refresh Page',
        category: 'Actions',
        action: () => window.location.reload(),
      },
      'help-shortcuts': {
        key: '?',
        shift: true,
        description: 'Show Keyboard Shortcuts',
        category: 'Help',
        action: () => setHelpVisible(true),
      },
      'help-close': {
        key: 'Escape',
        description: 'Close Modal/Dialog',
        category: 'Help',
        action: () => {
          if (helpVisible) {
            setHelpVisible(false);
          }
        },
      },
    };

    setShortcuts(new Map(Object.entries(coreShortcuts)));
  }, [navigate, helpVisible]);

  const registerShortcut = useCallback((id: string, shortcut: KeyboardShortcut) => {
    setShortcuts((prev) => {
      const next = new Map(prev);
      next.set(id, { ...shortcut, enabled: shortcut.enabled !== false });
      return next;
    });
  }, []);

  const unregisterShortcut = useCallback((id: string) => {
    setShortcuts((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const enableShortcut = useCallback((id: string) => {
    setShortcuts((prev) => {
      const next = new Map(prev);
      const shortcut = next.get(id);
      if (shortcut) {
        next.set(id, { ...shortcut, enabled: true });
      }
      return next;
    });
  }, []);

  const disableShortcut = useCallback((id: string) => {
    setShortcuts((prev) => {
      const next = new Map(prev);
      const shortcut = next.get(id);
      if (shortcut) {
        next.set(id, { ...shortcut, enabled: false });
      }
      return next;
    });
  }, []);

  const showHelp = useCallback(() => setHelpVisible(true), []);
  const hideHelp = useCallback(() => setHelpVisible(false), []);

  // Global keyboard event listener
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs (except for Escape and specific shortcuts)
      const target = event.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      if (isInput && event.key !== 'Escape' && !(event.ctrlKey || event.metaKey)) {
        return;
      }

      for (const [id, shortcut] of shortcuts) {
        if (shortcut.enabled === false) continue;

        const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatch = shortcut.alt ? event.altKey : !event.altKey;

        if (
          event.key.toLowerCase() === shortcut.key.toLowerCase() &&
          ctrlMatch &&
          shiftMatch &&
          altMatch
        ) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);

  const value: KeyboardShortcutsContextType = {
    shortcuts: Array.from(shortcuts.values()),
    registerShortcut,
    unregisterShortcut,
    enableShortcut,
    disableShortcut,
    showHelp,
    hideHelp,
    helpVisible,
  };

  return (
    <KeyboardShortcutsContext.Provider value={value}>
      {children}
    </KeyboardShortcutsContext.Provider>
  );
}

export function useKeyboardShortcutsContext() {
  const context = useContext(KeyboardShortcutsContext);
  if (!context) {
    throw new Error('useKeyboardShortcutsContext must be used within KeyboardShortcutsProvider');
  }
  return context;
}
