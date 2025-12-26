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
  ListItemAvatar,
  ListItemText,
  Paper,
  Stack,
  Typography,
  Alert,
  Avatar,
  Divider,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  InsertDriveFile as FileIcon,
  Image as ImageIcon,
  VideoLibrary as VideoIcon,
  AudioFile as AudioIcon,
  PictureAsPdf as PdfIcon,
  Description as DocIcon,
  TableChart as SheetIcon,
  Code as CodeIcon,
  Archive as ArchiveIcon,
  Clear as ClearAllIcon,
} from '@mui/icons-material';
import { useFileUpload, FileUploadOptions, formatFileSize, getFileIcon } from '../../hooks/useFileUpload';

export interface MultiFileUploadProps extends FileUploadOptions {
  title?: string;
  description?: string;
  uploadButtonText?: string;
  clearButtonText?: string;
  showClearButton?: boolean;
  showFilePreviews?: boolean;
  variant?: 'detailed' | 'compact';
}

/**
 * Multi-file upload component with detailed file list
 */
export function MultiFileUpload({
  title = 'Upload Multiple Files',
  description = 'Drag and drop files here or click to browse',
  uploadButtonText = 'Upload All',
  clearButtonText = 'Clear All',
  showClearButton = true,
  showFilePreviews = true,
  variant = 'detailed',
  ...uploadOptions
}: MultiFileUploadProps) {
  const {
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
  } = useFileUpload(uploadOptions);

  const getFileIconComponent = (fileName: string, fileType: string) => {
    const icon = getFileIcon(new File([], fileName, { type: fileType }));

    const iconProps = { fontSize: 'large' as const };

    switch (icon) {
      case 'image':
        return <ImageIcon {...iconProps} color="primary" />;
      case 'video':
        return <VideoIcon {...iconProps} color="secondary" />;
      case 'audio':
        return <AudioIcon {...iconProps} color="info" />;
      case 'pdf':
        return <PdfIcon {...iconProps} color="error" />;
      case 'document':
        return <DocIcon {...iconProps} color="primary" />;
      case 'spreadsheet':
        return <SheetIcon {...iconProps} color="success" />;
      case 'archive':
        return <ArchiveIcon {...iconProps} color="warning" />;
      case 'text':
        return <CodeIcon {...iconProps} />;
      default:
        return <FileIcon {...iconProps} />;
    }
  };

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  return (
    <Card>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6">{title}</Typography>
          {files.length > 0 && (
            <Chip
              label={`${files.length} file${files.length > 1 ? 's' : ''} (${formatFileSize(totalSize)})`}
              color="primary"
              size="small"
            />
          )}
        </Stack>

        {/* Drag and drop zone */}
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
            p: 3,
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
          <UploadIcon sx={{ fontSize: 50, color: 'text.secondary', mb: 1 }} />
          <Typography variant="body1" color="text.secondary">
            {description}
          </Typography>
          {uploadOptions.maxFiles && (
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
              Maximum {uploadOptions.maxFiles} files
            </Typography>
          )}
          {uploadOptions.maxSize && (
            <Typography variant="caption" color="text.secondary" display="block">
              Max file size: {formatFileSize(uploadOptions.maxSize)}
            </Typography>
          )}
          {uploadOptions.acceptedTypes && uploadOptions.acceptedTypes.length > 0 && (
            <Typography variant="caption" color="text.secondary" display="block">
              Accepted: {uploadOptions.acceptedTypes.join(', ')}
            </Typography>
          )}
        </Paper>

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
        {files.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Divider sx={{ mb: 2 }} />

            {variant === 'detailed' ? (
              <List>
                {files.map((file, index) => (
                  <ListItem
                    key={index}
                    secondaryAction={
                      <IconButton edge="end" onClick={() => removeFile(index)} disabled={isUploading}>
                        <DeleteIcon />
                      </IconButton>
                    }
                    sx={{
                      bgcolor: 'background.paper',
                      borderRadius: 1,
                      mb: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <ListItemAvatar>
                      {showFilePreviews && file.preview ? (
                        <Avatar src={file.preview} variant="rounded" />
                      ) : (
                        <Avatar variant="rounded" sx={{ bgcolor: 'transparent' }}>
                          {getFileIconComponent(file.name, file.type)}
                        </Avatar>
                      )}
                    </ListItemAvatar>
                    <ListItemText
                      primary={file.name}
                      secondary={
                        <Stack spacing={0.5}>
                          <Typography variant="caption">{formatFileSize(file.size)}</Typography>
                          {file.progress !== undefined && file.progress > 0 && (
                            <LinearProgress
                              variant="determinate"
                              value={file.progress}
                              sx={{ height: 4, borderRadius: 2 }}
                            />
                          )}
                          {file.error && (
                            <Typography variant="caption" color="error">
                              {file.error}
                            </Typography>
                          )}
                        </Stack>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {files.map((file, index) => (
                  <Chip
                    key={index}
                    label={`${file.name} (${formatFileSize(file.size)})`}
                    onDelete={() => removeFile(index)}
                    disabled={isUploading}
                    icon={getFileIconComponent(file.name, file.type)}
                  />
                ))}
              </Box>
            )}
          </Box>
        )}

        {/* Upload progress */}
        {isUploading && (
          <Box sx={{ mt: 2 }}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                Uploading files...
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {progress.toFixed(0)}%
              </Typography>
            </Stack>
            <LinearProgress variant="determinate" value={progress} />
          </Box>
        )}

        {/* Action buttons */}
        {!uploadOptions.autoUpload && files.length > 0 && (
          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button
              variant="contained"
              startIcon={<UploadIcon />}
              onClick={uploadFiles}
              disabled={isUploading}
              fullWidth
            >
              {isUploading ? 'Uploading...' : uploadButtonText}
            </Button>
            {showClearButton && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<ClearAllIcon />}
                onClick={clearFiles}
                disabled={isUploading}
              >
                {clearButtonText}
              </Button>
            )}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Compact multi-file upload for inline use
 */
export function CompactFileUpload({
  onFilesChange,
  maxFiles = 5,
  ...uploadOptions
}: {
  onFilesChange?: (files: File[]) => void;
  maxFiles?: number;
} & Omit<FileUploadOptions, 'maxFiles'>) {
  const { files, addFiles, removeFile, inputRef, openFileDialog } = useFileUpload({
    ...uploadOptions,
    maxFiles,
    onUpload: async (uploadedFiles) => {
      if (onFilesChange) {
        onFilesChange(uploadedFiles);
      }
    },
  });

  return (
    <Box>
      <Stack direction="row" spacing={1} flexWrap="wrap">
        {files.map((file, index) => (
          <Chip
            key={index}
            label={file.name}
            onDelete={() => removeFile(index)}
            size="small"
            icon={<FileIcon />}
          />
        ))}
        {files.length < maxFiles && (
          <Chip
            label="Add files"
            onClick={openFileDialog}
            size="small"
            icon={<UploadIcon />}
            color="primary"
            variant="outlined"
          />
        )}
      </Stack>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={uploadOptions.acceptedTypes?.join(',')}
        onChange={(e) => {
          if (e.target.files) {
            addFiles(e.target.files);
          }
        }}
        style={{ display: 'none' }}
      />
    </Box>
  );
}
