import React from 'react';
import {
  Alert,
  AlertTitle,
  Snackbar,
  SnackbarContent,
  IconButton,
  Box,
  Typography,
  Button,
} from '@mui/material';
import {
  Close as CloseIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

export interface EnhancedToastProps {
  open: boolean;
  message: string;
  variant?: ToastVariant;
  title?: string;
  duration?: number;
  position?: ToastPosition;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose: () => void;
}

const iconMap = {
  success: <SuccessIcon />,
  error: <ErrorIcon />,
  warning: <WarningIcon />,
  info: <InfoIcon />,
};

const anchorOriginMap: Record<ToastPosition, { vertical: 'top' | 'bottom'; horizontal: 'left' | 'center' | 'right' }> = {
  'top-left': { vertical: 'top', horizontal: 'left' },
  'top-center': { vertical: 'top', horizontal: 'center' },
  'top-right': { vertical: 'top', horizontal: 'right' },
  'bottom-left': { vertical: 'bottom', horizontal: 'left' },
  'bottom-center': { vertical: 'bottom', horizontal: 'center' },
  'bottom-right': { vertical: 'bottom', horizontal: 'right' },
};

/**
 * Enhanced Toast notification with title, actions, and variants
 */
export function EnhancedToast({
  open,
  message,
  variant = 'info',
  title,
  duration = 6000,
  position = 'bottom-center',
  action,
  onClose,
}: EnhancedToastProps) {
  const handleClose = (_event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    onClose();
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={duration}
      onClose={handleClose}
      anchorOrigin={anchorOriginMap[position]}
    >
      <Alert
        severity={variant}
        onClose={onClose}
        icon={iconMap[variant]}
        action={
          action ? (
            <Button color="inherit" size="small" onClick={action.onClick}>
              {action.label}
            </Button>
          ) : undefined
        }
        sx={{
          minWidth: 300,
          boxShadow: 3,
        }}
      >
        {title && <AlertTitle>{title}</AlertTitle>}
        {message}
      </Alert>
    </Snackbar>
  );
}

/**
 * Simple toast notification
 */
export interface SimpleToastProps {
  open: boolean;
  message: string;
  variant?: ToastVariant;
  duration?: number;
  position?: ToastPosition;
  onClose: () => void;
}

export function SimpleToast({
  open,
  message,
  variant = 'info',
  duration = 4000,
  position = 'bottom-center',
  onClose,
}: SimpleToastProps) {
  const handleClose = (_event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    onClose();
  };

  const variantStyles = {
    success: { bgcolor: 'success.main', color: 'success.contrastText' },
    error: { bgcolor: 'error.main', color: 'error.contrastText' },
    warning: { bgcolor: 'warning.main', color: 'warning.contrastText' },
    info: { bgcolor: 'info.main', color: 'info.contrastText' },
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={duration}
      onClose={handleClose}
      anchorOrigin={anchorOriginMap[position]}
    >
      <SnackbarContent
        message={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {iconMap[variant]}
            <Typography variant="body2">{message}</Typography>
          </Box>
        }
        action={
          <IconButton size="small" color="inherit" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        }
        sx={{
          ...variantStyles[variant],
          boxShadow: 3,
        }}
      />
    </Snackbar>
  );
}

/**
 * Toast with progress indicator
 */
export interface ProgressToastProps {
  open: boolean;
  message: string;
  progress: number;
  onClose: () => void;
}

export function ProgressToast({ open, message, progress, onClose }: ProgressToastProps) {
  return (
    <Snackbar
      open={open}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <SnackbarContent
        message={
          <Box sx={{ width: 300 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              {message}
            </Typography>
            <Box
              sx={{
                width: '100%',
                height: 6,
                bgcolor: 'rgba(255, 255, 255, 0.3)',
                borderRadius: 1,
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  width: `${progress}%`,
                  height: '100%',
                  bgcolor: 'success.main',
                  transition: 'width 0.3s ease',
                }}
              />
            </Box>
            <Typography variant="caption" sx={{ mt: 0.5, display: 'block' }}>
              {Math.round(progress)}%
            </Typography>
          </Box>
        }
        action={
          progress >= 100 ? (
            <IconButton size="small" color="inherit" onClick={onClose}>
              <CloseIcon fontSize="small" />
            </IconButton>
          ) : undefined
        }
      />
    </Snackbar>
  );
}
