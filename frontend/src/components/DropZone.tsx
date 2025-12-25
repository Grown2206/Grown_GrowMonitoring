import React, { useRef } from 'react';
import { Box, Typography, Paper, Button, IconButton, List, ListItem, ListItemText, ListItemIcon, Chip, Alert } from '@mui/material';
import {
  CloudUpload as UploadIcon,
  InsertDriveFile as FileIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  Description as DocIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useDragDrop, DragDropOptions, formatFileSize, getFileExtension, isImageFile } from '../hooks/useDragDrop';

interface DropZoneProps extends DragDropOptions {
  title?: string;
  description?: string;
  showFileList?: boolean;
  compact?: boolean;
}

const FILE_ICONS: Record<string, React.ReactElement> = {
  pdf: <PdfIcon />,
  doc: <DocIcon />,
  docx: <DocIcon />,
  txt: <DocIcon />,
  default: <FileIcon />,
};

function getFileIcon(file: File): React.ReactElement {
  if (isImageFile(file)) {
    return <ImageIcon />;
  }
  const ext = getFileExtension(file.name);
  return FILE_ICONS[ext] || FILE_ICONS.default;
}

export function DropZone({
  title = 'Upload Files',
  description = 'Drag & drop files here or click to browse',
  showFileList = true,
  compact = false,
  ...dragDropOptions
}: DropZoneProps) {
  const {
    isDragging,
    files,
    error,
    getRootProps,
    getInputProps,
    removeFile,
    clearError,
  } = useDragDrop(dragDropOptions);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper
        {...getRootProps()}
        sx={{
          p: compact ? 2 : 4,
          border: 2,
          borderStyle: 'dashed',
          borderColor: isDragging ? 'primary.main' : error ? 'error.main' : 'divider',
          bgcolor: isDragging ? 'action.hover' : 'background.paper',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'action.hover',
          },
        }}
        onClick={handleClick}
      >
        <input ref={inputRef} {...getInputProps()} />

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: compact ? 1 : 2,
          }}
        >
          <UploadIcon
            sx={{
              fontSize: compact ? 40 : 60,
              color: isDragging ? 'primary.main' : 'action.active',
            }}
          />

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant={compact ? 'body1' : 'h6'} gutterBottom>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          </Box>

          {dragDropOptions.accept && (
            <Chip
              label={`Accepted: ${dragDropOptions.accept.join(', ')}`}
              size="small"
              variant="outlined"
            />
          )}

          {dragDropOptions.maxSize && (
            <Chip
              label={`Max size: ${formatFileSize(dragDropOptions.maxSize)}`}
              size="small"
              variant="outlined"
            />
          )}
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={clearError}>
          {error}
        </Alert>
      )}

      {showFileList && files.length > 0 && (
        <Paper sx={{ mt: 2 }}>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1">
              Selected Files ({files.length})
            </Typography>
            <Button size="small" onClick={() => files.forEach((_, i) => removeFile(i))}>
              Clear All
            </Button>
          </Box>

          <List dense>
            {files.map((file, index) => (
              <ListItem
                key={`${file.name}-${index}`}
                secondaryAction={
                  <IconButton edge="end" onClick={(e) => { e.stopPropagation(); removeFile(index); }}>
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemIcon>{getFileIcon(file)}</ListItemIcon>
                <ListItemText
                  primary={file.name}
                  secondary={formatFileSize(file.size)}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
}
