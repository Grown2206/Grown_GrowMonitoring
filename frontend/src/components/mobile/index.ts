/**
 * Mobile & Responsive Components
 *
 * Features:
 * - Mobile-optimized navigation with drawer and bottom nav
 * - Responsive table adapting to mobile/tablet/desktop
 * - Touch gesture detection (swipe, long press, pinch, drag)
 * - Mobile-first design patterns
 */

// Mobile Navigation
export { MobileNavigation } from './MobileNavigation';
export type { MobileNavigationProps, NavigationItem } from './MobileNavigation';

// Responsive Table
export { ResponsiveTable, PlantTable } from './ResponsiveTable';
export type { ResponsiveTableProps, TableColumn, Plant } from './ResponsiveTable';

// Touch Gestures
export { TouchGestures, useTouchGestures, SwipeableCard } from './TouchGestures';
export type { TouchGesturesProps, TouchGestureHandlers, SwipeDirection } from './TouchGestures';
