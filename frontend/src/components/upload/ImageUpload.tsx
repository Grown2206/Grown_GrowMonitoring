import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardMedia,
  Grid,
  IconButton,
  Paper,
  Stack,
  Typography,
  Alert,
  Chip,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  ZoomIn as ZoomIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useFileUpload, FileUploadOptions } from '../../hooks/useFileUpload';

export interface ImageUploadProps extends Omit<FileUploadOptions, 'acceptedTypes' | 'onUpload' | 'maxFiles'> {
  value?: string; // Current image URL
  onChange?: (file: File | null) => void;
  onUpload?: (file: File) => void | Promise<void>;
  aspectRatio?: number; // e.g., 16/9, 4/3, 1 (square)
  maxWidth?: number;
  maxHeight?: number;
  showPreview?: boolean;
  allowEdit?: boolean;
  placeholder?: string;
}

/**
 * Image upload component with preview
 */
export function ImageUpload({
  value,
  onChange,
  onUpload,
  aspectRatio,
  maxWidth = 800,
  maxHeight = 600,
  showPreview = true,
  allowEdit = false,
  placeholder = 'Click to upload image',
  ...uploadOptions
}: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);
  const [error, setError] = useState<string | null>(null);

  const {
    files,
    isDragging,
    errors,
    addFiles,
    clearFiles,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    inputRef,
    openFileDialog,
  } = useFileUpload({
    ...uploadOptions,
    maxFiles: 1,
    acceptedTypes: ['image/*'],
    onUpload: async (uploadedFiles) => {
      if (uploadedFiles.length > 0) {
        const file = uploadedFiles[0];

        // Validate image dimensions
        const img = new Image();
        img.onload = () => {
          if (maxWidth && img.width > maxWidth) {
            setError(`Image width (${img.width}px) exceeds maximum (${maxWidth}px)`);
            return;
          }
          if (maxHeight && img.height > maxHeight) {
            setError(`Image height (${img.height}px) exceeds maximum (${maxHeight}px)`);
            return;
          }

          setError(null);
          setPreviewUrl(URL.createObjectURL(file));

          if (onChange) {
            onChange(file);
          }
          if (onUpload) {
            onUpload(file);
          }
        };
        img.src = URL.createObjectURL(file);
      }
    },
  });

  const handleRemove = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setError(null);
    clearFiles();
    if (onChange) {
      onChange(null);
    }
  };

  const currentFile = files[0];

  return (
    <Box>
      {previewUrl && showPreview ? (
        <Card>
          <CardMedia
            component="img"
            image={previewUrl}
            alt="Preview"
            sx={{
              width: '100%',
              aspectRatio: aspectRatio || 'auto',
              objectFit: 'contain',
              bgcolor: 'background.default',
            }}
          />
          <Stack direction="row" spacing={1} sx={{ p: 1 }} justifyContent="center">
            {allowEdit && (
              <Button size="small" startIcon={<EditIcon />} onClick={openFileDialog}>
                Change
              </Button>
            )}
            <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={handleRemove}>
              Remove
            </Button>
          </Stack>
        </Card>
      ) : (
        <Paper
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={openFileDialog}
          sx={{
            border: '2px dashed',
            borderColor: isDragging ? 'primary.main' : 'divider',
            borderRadius: 2,
            p: 4,
            textAlign: 'center',
            cursor: 'pointer',
            bgcolor: isDragging ? 'action.hover' : 'background.default',
            aspectRatio: aspectRatio || 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: 'action.hover',
            },
          }}
        >
          <UploadIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            {placeholder}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
            Drag and drop or click to browse
          </Typography>
          {uploadOptions.maxSize && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
              Max size: {(uploadOptions.maxSize / 1024 / 1024).toFixed(1)}MB
            </Typography>
          )}
          {(maxWidth || maxHeight) && (
            <Typography variant="caption" color="text.secondary">
              Max dimensions: {maxWidth}x{maxHeight}px
            </Typography>
          )}
        </Paper>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          if (e.target.files) {
            addFiles(e.target.files);
          }
        }}
        style={{ display: 'none' }}
      />

      {(errors.length > 0 || error) && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error || errors.join(', ')}
        </Alert>
      )}

      {currentFile && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Selected: {currentFile.name}
        </Typography>
      )}
    </Box>
  );
}

/**
 * Multi-image upload gallery
 */
export function ImageGalleryUpload({
  images = [],
  onImagesChange,
  maxImages = 10,
  ...uploadOptions
}: {
  images?: Array<{ url: string; file?: File }>;
  onImagesChange?: (images: Array<{ url: string; file?: File }>) => void;
  maxImages?: number;
} & Omit<FileUploadOptions, 'maxFiles' | 'acceptedTypes'>) {
  const {
    files,
    isDragging,
    errors,
    addFiles,
    removeFile,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    inputRef,
    openFileDialog,
  } = useFileUpload({
    ...uploadOptions,
    maxFiles: maxImages,
    acceptedTypes: ['image/*'],
  });

  const allImages = [
    ...images,
    ...files.map((file) => ({
      url: file.preview || '',
      file,
    })),
  ];

  const handleRemoveImage = (index: number) => {
    if (index < images.length) {
      // Remove from existing images
      const newImages = [...images];
      newImages.splice(index, 1);
      if (onImagesChange) {
        onImagesChange(newImages);
      }
    } else {
      // Remove from new files
      const fileIndex = index - images.length;
      removeFile(fileIndex);
    }
  };

  return (
    <Box>
      <Grid container spacing={2}>
        {allImages.map((image, index) => (
          <Grid item xs={6} sm={4} md={3} key={index}>
            <Card>
              <CardMedia component="img" height="150" image={image.url} alt={`Image ${index + 1}`} />
              <Stack direction="row" spacing={1} sx={{ p: 0.5 }} justifyContent="center">
                <IconButton size="small" color="error" onClick={() => handleRemoveImage(index)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Card>
          </Grid>
        ))}

        {allImages.length < maxImages && (
          <Grid item xs={6} sm={4} md={3}>
            <Paper
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={openFileDialog}
              sx={{
                height: 150,
                border: '2px dashed',
                borderColor: isDragging ? 'primary.main' : 'divider',
                borderRadius: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                bgcolor: isDragging ? 'action.hover' : 'background.default',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'action.hover',
                },
              }}
            >
              <UploadIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                Add Image
              </Typography>
              <Chip label={`${allImages.length}/${maxImages}`} size="small" sx={{ mt: 1 }} />
            </Paper>
          </Grid>
        )}
      </Grid>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => {
          if (e.target.files) {
            addFiles(e.target.files);
          }
        }}
        style={{ display: 'none' }}
      />

      {errors.length > 0 && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {errors.join(', ')}
        </Alert>
      )}
    </Box>
  );
}

/**
 * Avatar upload component
 */
export function AvatarUpload({
  value,
  onChange,
  size = 120,
  ...uploadOptions
}: {
  value?: string;
  onChange?: (file: File | null) => void;
  size?: number;
} & Omit<FileUploadOptions, 'acceptedTypes' | 'maxFiles' | 'onUpload'>) {
  return (
    <Box sx={{ width: size, height: size }}>
      <ImageUpload
        value={value}
        onChange={onChange}
        aspectRatio={1}
        showPreview={true}
        allowEdit={true}
        placeholder="Upload Avatar"
        {...uploadOptions}
      />
    </Box>
  );
}
