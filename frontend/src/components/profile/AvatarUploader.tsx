import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
  Avatar,
  Slider,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  PhotoCamera as CameraIcon,
  Delete as DeleteIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  RotateRight as RotateIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

export interface AvatarUploaderProps {
  currentAvatar?: string;
  onUpload?: (file: File) => void | Promise<void>;
  onDelete?: () => void;
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  size?: number;
  editable?: boolean;
}

/**
 * Avatar upload and editing component with zoom and rotation
 */
export function AvatarUploader({
  currentAvatar,
  onUpload,
  onDelete,
  maxSize = 5 * 1024 * 1024, // 5MB
  allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  size = 120,
  editable = true,
}: AvatarUploaderProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Please upload an image file.');
      return;
    }

    // Validate file size
    if (file.size > maxSize) {
      setError(`File is too large. Maximum size is ${(maxSize / 1024 / 1024).toFixed(1)}MB.`);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
      setDialogOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!preview) return;

    setUploading(true);
    setError(null);

    try {
      // Convert preview to blob
      const response = await fetch(preview);
      const blob = await response.blob();
      const file = new File([blob], 'avatar.png', { type: 'image/png' });

      if (onUpload) {
        await onUpload(file);
      }

      setDialogOpen(false);
      resetState();
    } catch (err: any) {
      setError(err.message || 'Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    }
    resetState();
  };

  const handleClose = () => {
    setDialogOpen(false);
    resetState();
  };

  const resetState = () => {
    setPreview(null);
    setZoom(1);
    setRotation(0);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleZoomChange = (_: Event, value: number | number[]) => {
    setZoom(value as number);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  return (
    <Box>
      <Stack spacing={2} alignItems="center">
        <Box sx={{ position: 'relative' }}>
          <Avatar
            src={currentAvatar}
            sx={{
              width: size,
              height: size,
              cursor: editable ? 'pointer' : 'default',
            }}
            onClick={() => editable && fileInputRef.current?.click()}
          />
          {editable && (
            <IconButton
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' },
              }}
              size="small"
              onClick={() => fileInputRef.current?.click()}
            >
              <CameraIcon fontSize="small" />
            </IconButton>
          )}
        </Box>

        {editable && (
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<CameraIcon />}
              onClick={() => fileInputRef.current?.click()}
            >
              Change
            </Button>
            {currentAvatar && (
              <Button
                variant="outlined"
                size="small"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleDelete}
              >
                Remove
              </Button>
            )}
          </Stack>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={allowedTypes.join(',')}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </Stack>

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Edit Avatar</Typography>
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={3}>
            {error && <Alert severity="error">{error}</Alert>}

            {/* Preview */}
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                bgcolor: 'background.default',
                height: 300,
                overflow: 'hidden',
              }}
            >
              {preview && (
                <Box
                  component="img"
                  src={preview}
                  alt="Preview"
                  sx={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    transition: 'transform 0.2s',
                  }}
                />
              )}
            </Paper>

            {/* Zoom Control */}
            <Box>
              <Stack direction="row" spacing={2} alignItems="center">
                <ZoomOutIcon />
                <Slider
                  value={zoom}
                  onChange={handleZoomChange}
                  min={0.5}
                  max={3}
                  step={0.1}
                  marks={[
                    { value: 0.5, label: '0.5x' },
                    { value: 1, label: '1x' },
                    { value: 2, label: '2x' },
                    { value: 3, label: '3x' },
                  ]}
                  valueLabelDisplay="auto"
                  sx={{ flex: 1 }}
                />
                <ZoomInIcon />
              </Stack>
            </Box>

            {/* Rotation Control */}
            <Box>
              <Button
                variant="outlined"
                startIcon={<RotateIcon />}
                onClick={handleRotate}
                fullWidth
              >
                Rotate 90°
              </Button>
            </Box>

            {/* File Info */}
            <Alert severity="info">
              <Typography variant="caption">
                Supported formats: JPEG, PNG, GIF, WebP
                <br />
                Maximum file size: {(maxSize / 1024 / 1024).toFixed(1)}MB
              </Typography>
            </Alert>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={uploading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={!preview || uploading}
            startIcon={uploading ? <CircularProgress size={16} /> : <CameraIcon />}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
