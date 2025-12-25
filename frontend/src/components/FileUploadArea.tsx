import React, { useState, useEffect } from 'react';
import { Box, Grid, Card, CardMedia, CardContent, Typography, IconButton, CircularProgress } from '@mui/material';
import { Delete as DeleteIcon, InsertDriveFile as FileIcon } from '@mui/icons-material';
import { useDragDrop, DragDropOptions, formatFileSize, isImageFile } from '../hooks/useDragDrop';
import { DropZone } from './DropZone';

interface FileWithPreview extends File {
  preview?: string;
}

interface FileUploadAreaProps extends DragDropOptions {
  onUpload?: (files: File[]) => Promise<void>;
  showPreviews?: boolean;
  autoUpload?: boolean;
}

export function FileUploadArea({
  onUpload,
  showPreviews = true,
  autoUpload = false,
  ...dragDropOptions
}: FileUploadAreaProps) {
  const [filesWithPreviews, setFilesWithPreviews] = useState<FileWithPreview[]>([]);
  const [uploading, setUploading] = useState(false);

  const {
    files,
    error,
    getRootProps,
    getInputProps,
    removeFile,
    clearError,
  } = useDragDrop({
    ...dragDropOptions,
    onDrop: async (droppedFiles) => {
      if (autoUpload && onUpload) {
        setUploading(true);
        try {
          await onUpload(droppedFiles);
        } catch (err) {
          console.error('Upload error:', err);
        } finally {
          setUploading(false);
        }
      }
      dragDropOptions.onDrop?.(droppedFiles);
    },
  });

  // Generate previews for image files
  useEffect(() => {
    const newFilesWithPreviews: FileWithPreview[] = files.map((file) => {
      if (isImageFile(file)) {
        const preview = URL.createObjectURL(file);
        return Object.assign(file, { preview });
      }
      return file;
    });

    setFilesWithPreviews(newFilesWithPreviews);

    // Cleanup previews on unmount
    return () => {
      newFilesWithPreviews.forEach((file) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [files]);

  const handleRemove = (index: number) => {
    const file = filesWithPreviews[index];
    if (file.preview) {
      URL.revokeObjectURL(file.preview);
    }
    removeFile(index);
  };

  if (!showPreviews) {
    return (
      <DropZone
        {...dragDropOptions}
        onDrop={async (droppedFiles) => {
          if (autoUpload && onUpload) {
            setUploading(true);
            try {
              await onUpload(droppedFiles);
            } catch (err) {
              console.error('Upload error:', err);
            } finally {
              setUploading(false);
            }
          }
          dragDropOptions.onDrop?.(droppedFiles);
        }}
      />
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <DropZone
        {...dragDropOptions}
        showFileList={false}
        compact={filesWithPreviews.length > 0}
      />

      {uploading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <CircularProgress />
        </Box>
      )}

      {filesWithPreviews.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            File Previews ({filesWithPreviews.length})
          </Typography>

          <Grid container spacing={2}>
            {filesWithPreviews.map((file, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={`${file.name}-${index}`}>
                <Card sx={{ position: 'relative', height: '100%' }}>
                  <IconButton
                    size="small"
                    onClick={() => handleRemove(index)}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: 'background.paper',
                      '&:hover': { bgcolor: 'error.light', color: 'error.contrastText' },
                      zIndex: 1,
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>

                  {file.preview ? (
                    <CardMedia
                      component="img"
                      height="160"
                      image={file.preview}
                      alt={file.name}
                      sx={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <Box
                      sx={{
                        height: 160,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'action.hover',
                      }}
                    >
                      <FileIcon sx={{ fontSize: 60, color: 'action.active' }} />
                    </Box>
                  )}

                  <CardContent>
                    <Typography
                      variant="body2"
                      noWrap
                      title={file.name}
                      sx={{ fontWeight: 'medium' }}
                    >
                      {file.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatFileSize(file.size)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
}
