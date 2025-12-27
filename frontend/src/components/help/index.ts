/**
 * Help & Documentation System (Sprint 72)
 *
 * Features:
 * - Comprehensive help center with articles, FAQs, and videos
 * - Interactive documentation viewer with navigation
 * - Step-by-step tutorial guides with progress tracking
 * - Search and filtering capabilities
 * - Category-based organization
 * - Print and download documentation
 * - Tutorial completion tracking
 * - Learning outcomes and difficulty levels
 */

// Help Center
export { HelpCenter } from './HelpCenter';
export type {
  HelpCenterProps,
  HelpArticle,
  FAQ,
  VideoTutorial,
  HelpCategory,
} from './HelpCenter';

// Documentation Viewer
export { DocumentationViewer } from './DocumentationViewer';
export type {
  DocumentationViewerProps,
  Documentation,
  DocSection,
  DocCategory,
} from './DocumentationViewer';

// Tutorial Guide
export { TutorialGuide } from './TutorialGuide';
export type {
  TutorialGuideProps,
  Tutorial,
  TutorialStep,
  TutorialDifficulty,
  TutorialCategory,
  UserProgress,
} from './TutorialGuide';
