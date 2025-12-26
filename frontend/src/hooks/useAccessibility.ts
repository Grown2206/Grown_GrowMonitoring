import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook for managing focus trap (keeping focus within a component)
 * Useful for modals, dialogs, and dropdowns
 */
export function useFocusTrap(isActive: boolean = true) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);

    // Focus first element when trap activates
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, [isActive]);

  return containerRef;
}

/**
 * Hook for live announcements to screen readers
 */
export function useAnnouncer() {
  const announcerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Create announcer element if it doesn't exist
    if (!announcerRef.current) {
      const announcer = document.createElement('div');
      announcer.setAttribute('role', 'status');
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.style.position = 'absolute';
      announcer.style.left = '-10000px';
      announcer.style.width = '1px';
      announcer.style.height = '1px';
      announcer.style.overflow = 'hidden';
      document.body.appendChild(announcer);
      announcerRef.current = announcer;
    }

    return () => {
      if (announcerRef.current) {
        document.body.removeChild(announcerRef.current);
        announcerRef.current = null;
      }
    };
  }, []);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (announcerRef.current) {
      announcerRef.current.setAttribute('aria-live', priority);
      announcerRef.current.textContent = message;

      // Clear after announcement
      setTimeout(() => {
        if (announcerRef.current) {
          announcerRef.current.textContent = '';
        }
      }, 1000);
    }
  }, []);

  return announce;
}

/**
 * Hook for keyboard navigation within a list
 */
export function useKeyboardNav<T extends HTMLElement = HTMLElement>(options: {
  onSelect?: (index: number) => void;
  loop?: boolean;
  orientation?: 'vertical' | 'horizontal';
} = {}) {
  const { onSelect, loop = true, orientation = 'vertical' } = options;
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!containerRef.current) return;

      const items = Array.from(
        containerRef.current.querySelectorAll<T>('[role="option"], [role="menuitem"], [role="tab"]')
      );

      if (items.length === 0) return;

      const isVertical = orientation === 'vertical';
      const nextKey = isVertical ? 'ArrowDown' : 'ArrowRight';
      const prevKey = isVertical ? 'ArrowUp' : 'ArrowLeft';

      let newIndex = activeIndex;

      switch (e.key) {
        case nextKey:
          e.preventDefault();
          newIndex = activeIndex + 1;
          if (newIndex >= items.length) {
            newIndex = loop ? 0 : items.length - 1;
          }
          break;

        case prevKey:
          e.preventDefault();
          newIndex = activeIndex - 1;
          if (newIndex < 0) {
            newIndex = loop ? items.length - 1 : 0;
          }
          break;

        case 'Home':
          e.preventDefault();
          newIndex = 0;
          break;

        case 'End':
          e.preventDefault();
          newIndex = items.length - 1;
          break;

        case 'Enter':
        case ' ':
          e.preventDefault();
          onSelect?.(activeIndex);
          return;

        default:
          return;
      }

      setActiveIndex(newIndex);
      items[newIndex]?.focus();
    },
    [activeIndex, loop, orientation, onSelect]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('keydown', handleKeyDown as EventListener);

    return () => {
      container.removeEventListener('keydown', handleKeyDown as EventListener);
    };
  }, [handleKeyDown]);

  return {
    containerRef,
    activeIndex,
    setActiveIndex,
  };
}

/**
 * Hook for skip links navigation
 */
export function useSkipLink(targetId: string) {
  const handleSkip = useCallback(
    (e: React.MouseEvent | React.KeyboardEvent) => {
      e.preventDefault();
      const target = document.getElementById(targetId);
      if (target) {
        target.focus();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
    [targetId]
  );

  return handleSkip;
}

/**
 * Hook for managing ARIA attributes dynamically
 */
export function useAriaAttributes(config: {
  label?: string;
  labelledBy?: string;
  describedBy?: string;
  required?: boolean;
  invalid?: boolean;
  expanded?: boolean;
  selected?: boolean;
  disabled?: boolean;
  hidden?: boolean;
}) {
  const {
    label,
    labelledBy,
    describedBy,
    required,
    invalid,
    expanded,
    selected,
    disabled,
    hidden,
  } = config;

  const ariaProps: Record<string, string | boolean | undefined> = {};

  if (label) ariaProps['aria-label'] = label;
  if (labelledBy) ariaProps['aria-labelledby'] = labelledBy;
  if (describedBy) ariaProps['aria-describedby'] = describedBy;
  if (required !== undefined) ariaProps['aria-required'] = required;
  if (invalid !== undefined) ariaProps['aria-invalid'] = invalid;
  if (expanded !== undefined) ariaProps['aria-expanded'] = expanded;
  if (selected !== undefined) ariaProps['aria-selected'] = selected;
  if (disabled !== undefined) ariaProps['aria-disabled'] = disabled;
  if (hidden !== undefined) ariaProps['aria-hidden'] = hidden;

  return ariaProps;
}

/**
 * Hook for detecting reduced motion preference
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setPrefersReducedMotion(e.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  return prefersReducedMotion;
}

/**
 * Hook for managing focus visibility (show focus ring only on keyboard nav)
 */
export function useFocusVisible() {
  const [isFocusVisible, setIsFocusVisible] = useState(false);
  const [isKeyboardUser, setIsKeyboardUser] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setIsKeyboardUser(true);
      }
    };

    const handleMouseDown = () => {
      setIsKeyboardUser(false);
    };

    const handleFocus = () => {
      if (isKeyboardUser) {
        setIsFocusVisible(true);
      }
    };

    const handleBlur = () => {
      setIsFocusVisible(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('focus', handleFocus, true);
    window.addEventListener('blur', handleBlur, true);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('focus', handleFocus, true);
      window.removeEventListener('blur', handleBlur, true);
    };
  }, [isKeyboardUser]);

  return isFocusVisible;
}

/**
 * Hook for generating unique IDs for ARIA relationships
 */
let idCounter = 0;
export function useId(prefix: string = 'id'): string {
  const [id] = useState(() => `${prefix}-${++idCounter}`);
  return id;
}
