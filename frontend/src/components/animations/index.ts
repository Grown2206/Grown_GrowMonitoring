/**
 * Animation Components and Hooks
 *
 * This module provides a comprehensive set of animation utilities for the Grow Monitoring System:
 *
 * ## Hooks
 * - `useAnimation`: Core animation hook with multiple animation types
 * - `useStaggeredAnimation`: Animate list items with delays
 * - `useScrollAnimation`: Trigger animations on scroll
 * - `useHoverAnimation`: Animate on hover
 * - `useSpring`: Spring physics animations
 * - `useCountAnimation`: Animated number counter
 *
 * ## Components
 * - `AnimatedContainer`: Wrapper for animated content
 * - `ScrollAnimatedContainer`: Scroll-triggered animations
 * - `StaggeredList`: Animate list items with stagger effect
 * - `SkeletonLoader`: Loading skeleton components
 * - `SkeletonDashboard`: Dashboard loading state
 * - `SkeletonForm`: Form loading state
 *
 * @example
 * ```tsx
 * import { AnimatedContainer, SkeletonLoader } from './components/animations';
 *
 * function MyComponent() {
 *   return loading ? (
 *     <SkeletonLoader variant="card" count={3} />
 *   ) : (
 *     <AnimatedContainer animation="fade" duration="normal">
 *       <Card>Content</Card>
 *     </AnimatedContainer>
 *   );
 * }
 * ```
 */

// Hooks
export {
  useAnimation,
  useStaggeredAnimation,
  useScrollAnimation,
  useHoverAnimation,
  useSpring,
  useCountAnimation,
} from '../../hooks/useAnimation';

export type {
  AnimationType,
  AnimationDuration,
  AnimationOptions,
} from '../../hooks/useAnimation';

// Components
export {
  AnimatedContainer,
  ScrollAnimatedContainer,
  StaggeredList,
} from './AnimatedContainer';

export type {
  AnimatedContainerProps,
  ScrollAnimatedContainerProps,
  StaggeredListProps,
} from './AnimatedContainer';

export {
  SkeletonLoader,
  SkeletonDashboard,
  SkeletonForm,
} from './SkeletonLoader';

export type {
  SkeletonLoaderProps,
} from './SkeletonLoader';
