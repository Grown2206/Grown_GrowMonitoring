import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
  Alert,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  InsertDriveFile as FileIcon,
  Image as ImageIcon,
  VideoLibrary as VideoIcon,
  AudioFile as AudioIcon,
  PictureAsPdf as PdfIcon,
} from '@mui/icons-material';
import { useFileUpload, FileUploadOptions, formatFileSize, getFileIcon } from '../../hooks/useFileUpload';

export interface FileUploadProps extends FileUploadOptions {
  title?: string;
  description?: string;
  uploadButtonText?: string;
  showFileList?: boolean;
  compact?: boolean;
}

/**
 * File upload component with drag and drop support
 */
export function FileUpload({
  title = 'Upload Files',
  description = 'Drag and drop files here or click to browse',
  uploadButtonText = 'Upload',
  showFileList = true,
  compact = false,
  ...uploadOptions
}: FileUploadProps) {
  const {
    files,
    isDragging,
    isUploading,
    progress,
    errors,
    addFiles,
    removeFile,
    uploadFiles,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    inputRef,
    openFileDialog,
  } = useFileUpload(uploadOptions);

  const getFileIconComponent = (fileName: string, fileType: string) => {
    const icon = getFileIcon(new File([], fileName, { type: fileType }));
    switch (icon) {
      case 'image':
        return <ImageIcon color="primary" />;
      case 'video':
        return <VideoIcon color="secondary" />;
      case 'audio':
        return <AudioIcon color="info" />;
      case 'pdf':
        return <PdfIcon color="error" />;
      default:
        return <FileIcon />;
    }
  };

  return (
    <Card>
      <CardContent>
        {!compact && (
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
        )}

        {/* Drag and drop zone */}
        <Box
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={openFileDialog}
          sx={{
            border: '2px dashed',
            borderColor: isDragging ? 'primary.main' : 'divider',
            borderRadius: 2,
            p: compact ? 2 : 4,
            textAlign: 'center',
            cursor: 'pointer',
            bgcolor: isDragging ? 'action.hover' : 'background.default',
            transition: 'all 0.2s',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: 'action.hover',
            },
          }}
        >
          <UploadIcon sx={{ fontSize: compact ? 40 : 60, color: 'text.secondary', mb: 1 }} />
          <Typography variant={compact ? 'body2' : 'body1'} color="text.secondary">
            {description}
          </Typography>
          {!compact && uploadOptions.maxSize && (
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
              Max file size: {formatFileSize(uploadOptions.maxSize)}
            </Typography>
          )}
          {!compact && uploadOptions.acceptedTypes && uploadOptions.acceptedTypes.length > 0 && (
            <Typography variant="caption" color="text.secondary" display="block">
              Accepted types: {uploadOptions.acceptedTypes.join(', ')}
            </Typography>
          )}
        </Box>

        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          multiple={uploadOptions.maxFiles !== 1}
          accept={uploadOptions.acceptedTypes?.join(',')}
          onChange={(e) => {
            if (e.target.files) {
              addFiles(e.target.files);
            }
          }}
          style={{ display: 'none' }}
        />

        {/* Errors */}
        {errors.length > 0 && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {errors.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </Alert>
        )}

        {/* File list */}
        {showFileList && files.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Selected Files ({files.length})
            </Typography>
            <List dense>
              {files.map((file, index) => (
                <ListItem
                  key={index}
                  secondaryAction={
                    <IconButton edge="end" onClick={() => removeFile(index)} disabled={isUploading}>
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <Box sx={{ mr: 2 }}>{getFileIconComponent(file.name, file.type)}</Box>
                  <ListItemText
                    primary={file.name}
                    secondary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="caption">{formatFileSize(file.size)}</Typography>
                        {file.progress !== undefined && file.progress > 0 && (
                          <Chip label={`${file.progress}%`} size="small" color="primary" />
                        )}
                        {file.error && <Chip label="Error" size="small" color="error" />}
                      </Stack>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Upload progress */}
        {isUploading && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Uploading... {progress.toFixed(0)}%
            </Typography>
            <LinearProgress variant="determinate" value={progress} sx={{ mt: 1 }} />
          </Box>
        )}

        {/* Upload button */}
        {!uploadOptions.autoUpload && files.length > 0 && (
          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={uploadFiles}
            disabled={isUploading}
            fullWidth
            sx={{ mt: 2 }}
          >
            {isUploading ? 'Uploading...' : uploadButtonText}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Simple file upload button
 */
export function FileUploadButton({
  onUpload,
  acceptedTypes,
  maxSize,
  children = 'Choose File',
  ...buttonProps
}: {
  onUpload: (files: File[]) => void;
  acceptedTypes?: string[];
  maxSize?: number;
  children?: React.ReactNode;
  variant?: 'text' | 'outlined' | 'contained';
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
  startIcon?: React.ReactNode;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(Array.from(e.target.files));
    }
  };

  return (
    <>
      <Button
        {...buttonProps}
        onClick={() => inputRef.current?.click()}
        startIcon={buttonProps.startIcon || <UploadIcon />}
      >
        {children}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept={acceptedTypes?.join(',')}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </>
  );
}
