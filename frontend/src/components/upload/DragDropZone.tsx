import React, { useState, useRef, useCallback } from 'react';
import { Box, Paper, Typography, alpha } from '@mui/material';
import { CloudUpload as UploadIcon } from '@mui/icons-material';

export interface DragDropZoneProps {
  onDrop: (files: FileList) => void;
  accept?: string[];
  maxFiles?: number;
  disabled?: boolean;
  children?: React.ReactNode;
  height?: number | string;
  variant?: 'outlined' | 'filled' | 'minimal';
  showIcon?: boolean;
  message?: string;
}

/**
 * Reusable drag and drop zone component
 */
export function DragDropZone({
  onDrop,
  accept = [],
  maxFiles,
  disabled = false,
  children,
  height = 200,
  variant = 'outlined',
  showIcon = true,
  message = 'Drag files here or click to browse',
}: DragDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      if (disabled) return;
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current++;
      if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
        setIsDragging(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      if (disabled) return;
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current--;
      if (dragCounter.current === 0) {
        setIsDragging(false);
      }
    },
    [disabled]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      if (disabled) return;
      e.preventDefault();
      e.stopPropagation();
    },
    [disabled]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      if (disabled) return;
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounter.current = 0;

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        onDrop(e.dataTransfer.files);
      }
    },
    [disabled, onDrop]
  );

  const handleClick = useCallback(() => {
    if (disabled) return;
    inputRef.current?.click();
  }, [disabled]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        onDrop(e.target.files);
      }
    },
    [onDrop]
  );

  const getVariantStyles = () => {
    switch (variant) {
      case 'filled':
        return {
          border: 'none',
          bgcolor: isDragging ? 'action.selected' : 'action.hover',
        };
      case 'minimal':
        return {
          border: '1px solid',
          borderColor: isDragging ? 'primary.main' : 'transparent',
          bgcolor: isDragging ? alpha('#000', 0.02) : 'transparent',
        };
      default: // outlined
        return {
          border: '2px dashed',
          borderColor: isDragging ? 'primary.main' : 'divider',
          bgcolor: isDragging ? 'action.hover' : 'background.default',
        };
    }
  };

  return (
    <>
      <Paper
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        elevation={variant === 'minimal' ? 0 : isDragging ? 4 : 1}
        sx={{
          ...getVariantStyles(),
          borderRadius: 2,
          p: 3,
          height,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          transition: 'all 0.2s',
          '&:hover': disabled
            ? {}
            : {
                borderColor: 'primary.main',
                bgcolor: variant === 'filled' ? 'action.selected' : 'action.hover',
                transform: 'scale(1.01)',
              },
        }}
      >
        {children || (
          <>
            {showIcon && <UploadIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />}
            <Typography variant="body1" color="text.secondary" textAlign="center">
              {message}
            </Typography>
          </>
        )}
      </Paper>

      <input
        ref={inputRef}
        type="file"
        multiple={maxFiles !== 1}
        accept={accept.join(',')}
        onChange={handleFileChange}
        disabled={disabled}
        style={{ display: 'none' }}
      />
    </>
  );
}

/**
 * Compact inline drag and drop zone
 */
export function InlineDragDropZone({
  onDrop,
  accept,
  disabled = false,
  message = 'Drop files here',
}: Pick<DragDropZoneProps, 'onDrop' | 'accept' | 'disabled' | 'message'>) {
  return (
    <DragDropZone
      onDrop={onDrop}
      accept={accept}
      disabled={disabled}
      height={80}
      variant="minimal"
      showIcon={false}
      message={message}
    />
  );
}

/**
 * Full-page drag and drop overlay
 */
export function FullPageDragDropZone({
  onDrop,
  accept,
  children,
}: {
  onDrop: (files: FileList) => void;
  accept?: string[];
  children: React.ReactNode;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

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
        onDrop(e.dataTransfer.files);
      }
    },
    [onDrop]
  );

  return (
    <Box
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      sx={{ position: 'relative', width: '100%', height: '100%' }}
    >
      {children}

      {isDragging && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: alpha('#000', 0.5),
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <Paper
            sx={{
              p: 4,
              bgcolor: 'background.paper',
              borderRadius: 2,
              border: '4px dashed',
              borderColor: 'primary.main',
            }}
          >
            <UploadIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2, display: 'block', mx: 'auto' }} />
            <Typography variant="h5" color="primary" textAlign="center">
              Drop files to upload
            </Typography>
            {accept && accept.length > 0 && (
              <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 1 }}>
                Accepted types: {accept.join(', ')}
              </Typography>
            )}
          </Paper>
        </Box>
      )}
    </Box>
  );
}
