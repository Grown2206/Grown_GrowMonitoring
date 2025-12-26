import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button,
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  HelpOutline as QuestionIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

export type ConfirmVariant = 'default' | 'danger' | 'warning' | 'info';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  variant?: ConfirmVariant;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  destructive?: boolean;
}

const variantConfig = {
  default: {
    icon: <QuestionIcon sx={{ fontSize: 48 }} color="primary" />,
    color: 'primary' as const,
  },
  danger: {
    icon: <ErrorIcon sx={{ fontSize: 48 }} color="error" />,
    color: 'error' as const,
  },
  warning: {
    icon: <WarningIcon sx={{ fontSize: 48 }} color="warning" />,
    color: 'warning' as const,
  },
  info: {
    icon: <InfoIcon sx={{ fontSize: 48 }} color="info" />,
    color: 'info' as const,
  },
};

/**
 * Confirmation dialog with variants and loading state
 */
export function ConfirmDialog({
  open,
  title,
  message,
  variant = 'default',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
  destructive = false,
}: ConfirmDialogProps) {
  const config = variantConfig[variant];

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onCancel}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {title}
          {!loading && (
            <IconButton size="small" onClick={onCancel}>
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          {config.icon}
          <DialogContentText sx={{ flex: 1 }}>{message}</DialogContentText>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={loading}>
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          color={destructive ? 'error' : config.color}
          variant="contained"
          disabled={loading}
          autoFocus
        >
          {loading ? 'Processing...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/**
 * Simple confirmation dialog
 */
export interface SimpleConfirmProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function SimpleConfirm({ open, title, message, onConfirm, onCancel }: SimpleConfirmProps) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button onClick={onConfirm} variant="contained" autoFocus>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/**
 * Destructive action confirmation
 */
export interface DestructiveConfirmProps {
  open: boolean;
  title: string;
  message: string;
  itemName?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DestructiveConfirm({
  open,
  title,
  message,
  itemName,
  onConfirm,
  onCancel,
}: DestructiveConfirmProps) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ color: 'error.main' }}>{title}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', mb: 2 }}>
          <ErrorIcon color="error" sx={{ fontSize: 48 }} />
          <Box>
            <DialogContentText>{message}</DialogContentText>
            {itemName && (
              <Typography
                variant="body2"
                sx={{
                  mt: 1,
                  p: 1,
                  bgcolor: 'error.light',
                  color: 'error.dark',
                  borderRadius: 1,
                  fontWeight: 'bold',
                }}
              >
                {itemName}
              </Typography>
            )}
          </Box>
        </Box>
        <Typography variant="caption" color="text.secondary">
          This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button onClick={onConfirm} color="error" variant="contained">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}
