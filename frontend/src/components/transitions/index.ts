/**
 * Page Transitions & Loading States
 *
 * This module provides components for smooth page transitions, loading states,
 * and progress indicators to enhance the user experience during navigation and
 * data loading operations.
 *
 * ## Page Transitions
 * - `PageTransition`: Animated transitions between routes
 * - `NavigationProgress`: Top bar showing navigation progress
 * - `FadeTransition`: Quick fade effect for routes
 * - `SlideTransition`: Slide animation for routes
 *
 * ## Loading States
 * - `LoadingState`: Versatile loading indicator component
 * - `InlineLoader`: Small loader for inline use
 * - `SuspenseFallback`: Fallback for React Suspense
 * - `LoadingOverlay`: Overlay that shows loading over content
 *
 * ## Progress Indicators
 * - `ProgressIndicator`: Linear/circular progress display
 * - `SteppedProgress`: Multi-step progress indicator
 * - `UploadProgress`: File upload progress
 * - `AnimatedProgress`: Smoothly animated progress bar
 *
 * @example
 * ```tsx
 * // Page transition
 * <PageTransition animation="fade">
 *   <YourPage />
 * </PageTransition>
 *
 * // Loading state
 * {loading ? (
 *   <LoadingState message="Loading data..." variant="circular" />
 * ) : (
 *   <Content />
 * )}
 *
 * // Progress indicator
 * <ProgressIndicator value={uploadProgress} label="Uploading..." />
 *
 * // Stepped progress
 * <SteppedProgress
 *   steps={[
 *     { label: 'Upload', description: 'Uploading files' },
 *     { label: 'Process', description: 'Processing data' },
 *     { label: 'Complete', description: 'All done!' },
 *   ]}
 *   activeStep={currentStep}
 * />
 * ```
 */

// Page Transitions
export {
  PageTransition,
  NavigationProgress,
  FadeTransition,
  SlideTransition,
} from './PageTransition';

export type { PageTransitionProps } from './PageTransition';

// Loading States
export {
  LoadingState,
  InlineLoader,
  SuspenseFallback,
  LoadingOverlay,
} from './LoadingState';

export type {
  LoadingStateProps,
  LoadingOverlayProps,
} from './LoadingState';

// Progress Indicators
export {
  ProgressIndicator,
  SteppedProgress,
  UploadProgress,
  AnimatedProgress,
} from './ProgressIndicator';

export type {
  ProgressIndicatorProps,
  SteppedProgressProps,
  UploadProgressProps,
  StepProgress,
} from './ProgressIndicator';
