import { useState, useCallback, useRef } from 'react';

export interface FileUploadOptions {
  maxSize?: number; // in bytes
  maxFiles?: number;
  acceptedTypes?: string[];
  onUpload?: (files: File[]) => void | Promise<void>;
  onProgress?: (progress: number) => void;
  onError?: (error: Error) => void;
  autoUpload?: boolean;
}

export interface FileWithPreview extends File {
  preview?: string;
  progress?: number;
  error?: string;
}

export interface UseFileUploadReturn {
  files: FileWithPreview[];
  isDragging: boolean;
  isUploading: boolean;
  progress: number;
  errors: string[];
  addFiles: (files: FileList | File[]) => void;
  removeFile: (index: number) => void;
  clearFiles: () => void;
  uploadFiles: () => Promise<void>;
  handleDragEnter: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  inputRef: React.RefObject<HTMLInputElement>;
  openFileDialog: () => void;
}

/**
 * Comprehensive file upload hook with validation and progress tracking
 */
export function useFileUpload({
  maxSize = 10 * 1024 * 1024, // 10MB default
  maxFiles = 10,
  acceptedTypes = [],
  onUpload,
  onProgress,
  onError,
  autoUpload = false,
}: FileUploadOptions = {}): UseFileUploadReturn {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  // Validate file
  const validateFile = useCallback(
    (file: File): string | null => {
      // Check file size
      if (file.size > maxSize) {
        return `File "${file.name}" is too large. Max size is ${formatFileSize(maxSize)}.`;
      }

      // Check file type
      if (acceptedTypes.length > 0) {
        const fileType = file.type;
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
        const isAccepted = acceptedTypes.some(
          (type) =>
            type === fileType ||
            type === fileExtension ||
            (type.endsWith('/*') && fileType.startsWith(type.replace('/*', '')))
        );

        if (!isAccepted) {
          return `File "${file.name}" type is not accepted. Accepted types: ${acceptedTypes.join(', ')}`;
        }
      }

      return null;
    },
    [maxSize, acceptedTypes]
  );

  // Add files
  const addFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const fileArray = Array.from(newFiles);
      const validFiles: FileWithPreview[] = [];
      const newErrors: string[] = [];

      // Check max files limit
      if (files.length + fileArray.length > maxFiles) {
        newErrors.push(`Maximum ${maxFiles} files allowed.`);
        setErrors(newErrors);
        return;
      }

      fileArray.forEach((file) => {
        const error = validateFile(file);
        if (error) {
          newErrors.push(error);
        } else {
          const fileWithPreview = file as FileWithPreview;

          // Create preview for images
          if (file.type.startsWith('image/')) {
            fileWithPreview.preview = URL.createObjectURL(file);
          }

          fileWithPreview.progress = 0;
          validFiles.push(fileWithPreview);
        }
      });

      if (newErrors.length > 0) {
        setErrors(newErrors);
        if (onError) {
          onError(new Error(newErrors.join('\n')));
        }
      }

      if (validFiles.length > 0) {
        setFiles((prev) => [...prev, ...validFiles]);
        setErrors([]);

        if (autoUpload && onUpload) {
          uploadFilesInternal(validFiles);
        }
      }
    },
    [files.length, maxFiles, validateFile, autoUpload, onUpload]
  );

  // Remove file
  const removeFile = useCallback((index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      const removed = newFiles[index];

      // Revoke preview URL
      if (removed.preview) {
        URL.revokeObjectURL(removed.preview);
      }

      newFiles.splice(index, 1);
      return newFiles;
    });
  }, []);

  // Clear all files
  const clearFiles = useCallback(() => {
    files.forEach((file) => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    setFiles([]);
    setErrors([]);
    setProgress(0);
  }, [files]);

  // Upload files internal
  const uploadFilesInternal = useCallback(
    async (filesToUpload: FileWithPreview[]) => {
      if (!onUpload) return;

      setIsUploading(true);
      setProgress(0);

      try {
        // Simulate upload progress
        const totalFiles = filesToUpload.length;
        for (let i = 0; i < totalFiles; i++) {
          const currentProgress = ((i + 1) / totalFiles) * 100;
          setProgress(currentProgress);

          if (onProgress) {
            onProgress(currentProgress);
          }

          // Update individual file progress
          setFiles((prev) =>
            prev.map((f, idx) =>
              f === filesToUpload[i] ? { ...f, progress: 100 } : f
            )
          );
        }

        await onUpload(filesToUpload);
        setProgress(100);
      } catch (error) {
        const err = error as Error;
        setErrors([err.message]);
        if (onError) {
          onError(err);
        }
      } finally {
        setIsUploading(false);
      }
    },
    [onUpload, onProgress, onError]
  );

  // Upload files
  const uploadFiles = useCallback(async () => {
    if (files.length === 0) return;
    await uploadFilesInternal(files);
  }, [files, uploadFilesInternal]);

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounter.current = 0;

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files);
      }
    },
    [addFiles]
  );

  // Open file dialog
  const openFileDialog = useCallback(() => {
    inputRef.current?.click();
  }, []);

  return {
    files,
    isDragging,
    isUploading,
    progress,
    errors,
    addFiles,
    removeFile,
    clearFiles,
    uploadFiles,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    inputRef,
    openFileDialog,
  };
}

/**
 * Format file size to human-readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get file extension
 */
export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
}

/**
 * Get file icon name based on file type
 */
export function getFileIcon(file: File): string {
  const type = file.type;

  if (type.startsWith('image/')) return 'image';
  if (type.startsWith('video/')) return 'video';
  if (type.startsWith('audio/')) return 'audio';
  if (type.includes('pdf')) return 'pdf';
  if (type.includes('word') || type.includes('document')) return 'document';
  if (type.includes('sheet') || type.includes('excel')) return 'spreadsheet';
  if (type.includes('presentation') || type.includes('powerpoint')) return 'presentation';
  if (type.includes('zip') || type.includes('rar') || type.includes('tar')) return 'archive';
  if (type.includes('text')) return 'text';

  return 'file';
}

/**
 * Check if file is an image
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

/**
 * Check if file is a video
 */
export function isVideoFile(file: File): boolean {
  return file.type.startsWith('video/');
}

/**
 * Validate file upload
 */
export function validateFileUpload(
  file: File,
  options: {
    maxSize?: number;
    acceptedTypes?: string[];
  } = {}
): { valid: boolean; error?: string } {
  const { maxSize = 10 * 1024 * 1024, acceptedTypes = [] } = options;

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File is too large. Max size is ${formatFileSize(maxSize)}.`,
    };
  }

  if (acceptedTypes.length > 0) {
    const fileType = file.type;
    const fileExtension = '.' + getFileExtension(file.name).toLowerCase();
    const isAccepted = acceptedTypes.some(
      (type) =>
        type === fileType ||
        type === fileExtension ||
        (type.endsWith('/*') && fileType.startsWith(type.replace('/*', '')))
    );

    if (!isAccepted) {
      return {
        valid: false,
        error: `File type not accepted. Accepted types: ${acceptedTypes.join(', ')}`,
      };
    }
  }

  return { valid: true };
}

/**
 * Common file type presets
 */
export const FileTypePresets = {
  images: ['image/*'],
  videos: ['video/*'],
  audio: ['audio/*'],
  documents: ['.pdf', '.doc', '.docx', '.txt'],
  spreadsheets: ['.xls', '.xlsx', '.csv'],
  presentations: ['.ppt', '.pptx'],
  archives: ['.zip', '.rar', '.tar', '.gz'],
  all: ['*/*'],
};
