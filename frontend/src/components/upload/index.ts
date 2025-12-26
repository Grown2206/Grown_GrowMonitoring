/**
 * File Upload Components - Comprehensive file upload system
 *
 * Features:
 * - Drag and drop file upload
 * - Image upload with preview
 * - Multi-file upload with progress tracking
 * - File validation (size, type)
 * - Upload progress indicators
 * - File type detection and icons
 * - Avatar upload
 * - Image gallery upload
 */

// File Upload Components
export { FileUpload, FileUploadButton } from './FileUpload';
export type { FileUploadProps } from './FileUpload';

// Image Upload Components
export {
  ImageUpload,
  ImageGalleryUpload,
  AvatarUpload,
} from './ImageUpload';
export type { ImageUploadProps } from './ImageUpload';

// Drag and Drop Zone Components
export {
  DragDropZone,
  InlineDragDropZone,
  FullPageDragDropZone,
} from './DragDropZone';
export type { DragDropZoneProps } from './DragDropZone';

// Multi-File Upload Components
export {
  MultiFileUpload,
  CompactFileUpload,
} from './MultiFileUpload';
export type { MultiFileUploadProps } from './MultiFileUpload';

// Re-export upload hook and utilities
export {
  useFileUpload,
  formatFileSize,
  getFileExtension,
  getFileIcon,
  isImageFile,
  isVideoFile,
  validateFileUpload,
  FileTypePresets,
} from '../../hooks/useFileUpload';
export type {
  FileUploadOptions,
  FileWithPreview,
  UseFileUploadReturn,
} from '../../hooks/useFileUpload';
