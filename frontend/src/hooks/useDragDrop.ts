import { useState, useCallback, useRef, DragEvent } from 'react';

export interface DragDropOptions {
  onDrop?: (files: File[]) => void;
  onError?: (error: string) => void;
  accept?: string[]; // e.g., ['image/*', 'application/pdf']
  maxSize?: number; // in bytes
  maxFiles?: number;
  multiple?: boolean;
}

export interface DragDropState {
  isDragging: boolean;
  files: File[];
  error: string | null;
}

/**
 * Hook for drag and drop file upload functionality
 *
 * @example
 * const { isDragging, files, getRootProps, getInputProps, removeFile, clearFiles } = useDragDrop({
 *   accept: ['image/*'],
 *   maxSize: 5 * 1024 * 1024, // 5MB
 *   maxFiles: 5,
 *   onDrop: (files) => console.log(files),
 * });
 */
export function useDragDrop(options: DragDropOptions = {}) {
  const {
    onDrop,
    onError,
    accept,
    maxSize,
    maxFiles,
    multiple = true,
  } = options;

  const [state, setState] = useState<DragDropState>({
    isDragging: false,
    files: [],
    error: null,
  });

  const dragCounterRef = useRef(0);

  const validateFile = useCallback((file: File): string | null => {
    // Check file type
    if (accept && accept.length > 0) {
      const fileType = file.type;
      const isAccepted = accept.some((type) => {
        if (type.endsWith('/*')) {
          const category = type.split('/')[0];
          return fileType.startsWith(category);
        }
        return fileType === type;
      });

      if (!isAccepted) {
        return `File type ${fileType} is not accepted. Accepted types: ${accept.join(', ')}`;
      }
    }

    // Check file size
    if (maxSize && file.size > maxSize) {
      const sizeMB = (maxSize / 1024 / 1024).toFixed(2);
      return `File size exceeds maximum of ${sizeMB}MB`;
    }

    return null;
  }, [accept, maxSize]);

  const processFiles = useCallback((fileList: FileList | File[]) => {
    const filesArray = Array.from(fileList);

    // Check max files
    if (maxFiles && filesArray.length > maxFiles) {
      const error = `Maximum ${maxFiles} file(s) allowed`;
      setState((prev) => ({ ...prev, error }));
      onError?.(error);
      return;
    }

    // Validate files
    const validFiles: File[] = [];
    let validationError: string | null = null;

    for (const file of filesArray) {
      const error = validateFile(file);
      if (error) {
        validationError = error;
        break;
      }
      validFiles.push(file);
    }

    if (validationError) {
      setState((prev) => ({ ...prev, error: validationError }));
      onError?.(validationError);
      return;
    }

    setState((prev) => ({
      ...prev,
      files: multiple ? [...prev.files, ...validFiles] : validFiles,
      error: null,
    }));

    onDrop?.(validFiles);
  }, [maxFiles, validateFile, multiple, onDrop, onError]);

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;

    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setState((prev) => ({ ...prev, isDragging: true }));
    }
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;

    if (dragCounterRef.current === 0) {
      setState((prev) => ({ ...prev, isDragging: false }));
    }
  }, []);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;

    setState((prev) => ({ ...prev, isDragging: false }));

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  }, [processFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  }, [processFiles]);

  const removeFile = useCallback((index: number) => {
    setState((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
      error: null,
    }));
  }, []);

  const clearFiles = useCallback(() => {
    setState((prev) => ({
      ...prev,
      files: [],
      error: null,
    }));
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({
      ...prev,
      error: null,
    }));
  }, []);

  const getRootProps = useCallback(() => ({
    onDragEnter: handleDragEnter,
    onDragLeave: handleDragLeave,
    onDragOver: handleDragOver,
    onDrop: handleDrop,
  }), [handleDragEnter, handleDragLeave, handleDragOver, handleDrop]);

  const getInputProps = useCallback(() => ({
    type: 'file' as const,
    multiple,
    accept: accept?.join(','),
    onChange: handleFileInput,
    style: { display: 'none' },
  }), [multiple, accept, handleFileInput]);

  return {
    ...state,
    getRootProps,
    getInputProps,
    removeFile,
    clearFiles,
    clearError,
  };
}

/**
 * Format file size to human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.slice(filename.lastIndexOf('.') + 1).toLowerCase();
}

/**
 * Check if file is an image
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}
