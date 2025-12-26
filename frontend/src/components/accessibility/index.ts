/**
 * Accessibility Components and Utilities
 *
 * This module provides comprehensive accessibility (a11y) features for the Grow Monitoring System:
 *
 * ## Hooks
 * - `useFocusTrap`: Keep focus within a component (modals, dialogs)
 * - `useAnnouncer`: Screen reader announcements
 * - `useKeyboardNav`: Keyboard navigation for lists
 * - `useSkipLink`: Skip navigation functionality
 * - `useAriaAttributes`: Dynamic ARIA attribute management
 * - `useReducedMotion`: Detect reduced motion preference
 * - `useFocusVisible`: Keyboard vs mouse focus detection
 * - `useId`: Generate unique IDs for ARIA relationships
 *
 * ## Components
 * - `SkipLinks`: Skip navigation links
 * - `VisuallyHidden`: Hide content visually, keep for screen readers
 * - `LiveRegion`: Screen reader announcements
 * - `FocusIndicator`: Global focus ring styles
 * - `FocusTrap`: Trap focus within component
 * - `AccessibleIcon`: Accessible icon wrapper
 * - `AccessibleIconButton`: Icon button with label
 *
 * ## Best Practices
 * - Always provide text alternatives for non-text content
 * - Ensure keyboard navigation works everywhere
 * - Use semantic HTML elements
 * - Provide clear focus indicators
 * - Use ARIA attributes correctly
 * - Test with screen readers
 *
 * @example
 * ```tsx
 * import { SkipLinks, useFocusTrap, useAnnouncer } from './components/accessibility';
 *
 * function App() {
 *   return (
 *     <>
 *       <SkipLinks />
 *       <MyContent />
 *     </>
 *   );
 * }
 *
 * function Modal({ open, onClose }) {
 *   const trapRef = useFocusTrap(open);
 *   const announce = useAnnouncer();
 *
 *   useEffect(() => {
 *     if (open) announce('Modal opened');
 *   }, [open]);
 *
 *   return (
 *     <div ref={trapRef}>
 *       ...
 *     </div>
 *   );
 * }
 * ```
 */

// Hooks
export {
  useFocusTrap,
  useAnnouncer,
  useKeyboardNav,
  useSkipLink,
  useAriaAttributes,
  useReducedMotion,
  useFocusVisible,
  useId,
} from '../../hooks/useAccessibility';

// Components
export { SkipLinks } from './SkipLinks';
export type { SkipLinksProps, SkipLink } from './SkipLinks';

export { VisuallyHidden, LiveRegion } from './VisuallyHidden';
export type { VisuallyHiddenProps, LiveRegionProps } from './VisuallyHidden';

export { FocusIndicator, FocusTrap } from './FocusIndicator';
export type { FocusTrapProps } from './FocusIndicator';

export { AccessibleIconButton } from './AccessibleIcon';
export type { AccessibleIconButtonProps } from './AccessibleIcon';
