import React from 'react';
import { GlobalStyles } from '@mui/material';
import { useThemeMode } from '../../contexts/ThemeContext';

/**
 * Global focus indicator styles
 * Provides clear, visible focus rings for keyboard navigation
 */
export function FocusIndicator() {
  const { actualMode } = useThemeMode();
  const isDark = actualMode === 'dark';

  return (
    <GlobalStyles
      styles={{
        // Enhanced focus styles for keyboard navigation
        '*:focus-visible': {
          outline: `3px solid ${isDark ? '#66bb6a' : '#2e7d32'}`,
          outlineOffset: '2px',
        },

        // Remove default browser focus for mouse users
        '*:focus:not(:focus-visible)': {
          outline: 'none',
        },

        // Button focus styles
        'button:focus-visible': {
          outline: `3px solid ${isDark ? '#66bb6a' : '#2e7d32'}`,
          outlineOffset: '2px',
        },

        // Link focus styles
        'a:focus-visible': {
          outline: `3px solid ${isDark ? '#66bb6a' : '#2e7d32'}`,
          outlineOffset: '2px',
          borderRadius: '4px',
        },

        // Input focus styles
        'input:focus-visible, textarea:focus-visible, select:focus-visible': {
          outline: `3px solid ${isDark ? '#66bb6a' : '#2e7d32'}`,
          outlineOffset: '2px',
        },

        // Card/Paper focus styles
        '[role="button"]:focus-visible, [role="link"]:focus-visible': {
          outline: `3px solid ${isDark ? '#66bb6a' : '#2e7d32'}`,
          outlineOffset: '2px',
        },
      }}
    />
  );
}

/**
 * Component wrapper that adds focus management
 */
export interface FocusTrapProps {
  children: React.ReactNode;
  active?: boolean;
}

export function FocusTrap({ children, active = true }: FocusTrapProps) {
  const trapRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!active || !trapRef.current) return;

    const element = trapRef.current;
    const focusableElements = element.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    element.addEventListener('keydown', handleTab);
    firstElement?.focus();

    return () => {
      element.removeEventListener('keydown', handleTab);
    };
  }, [active]);

  return <div ref={trapRef}>{children}</div>;
}
