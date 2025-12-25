import React from 'react';
import { Box, CircularProgress, Typography, Chip } from '@mui/material';
import {
  Check as SavedIcon,
  Error as ErrorIcon,
  Schedule as PendingIcon,
} from '@mui/icons-material';
import { AutoSaveStatus } from '../hooks/useAutoSave';

interface AutoSaveIndicatorProps {
  status: AutoSaveStatus;
  size?: 'small' | 'medium';
  showText?: boolean;
  error?: any;
}

export function AutoSaveIndicator({
  status,
  size = 'small',
  showText = true,
  error,
}: AutoSaveIndicatorProps) {
  if (status === 'idle') {
    return null;
  }

  const getContent = () => {
    switch (status) {
      case 'pending':
        return {
          icon: <PendingIcon fontSize={size} color="action" />,
          text: 'Pending...',
          color: 'default' as const,
        };
      case 'saving':
        return {
          icon: <CircularProgress size={size === 'small' ? 16 : 20} />,
          text: 'Saving...',
          color: 'info' as const,
        };
      case 'saved':
        return {
          icon: <SavedIcon fontSize={size} color="success" />,
          text: 'Saved',
          color: 'success' as const,
        };
      case 'error':
        return {
          icon: <ErrorIcon fontSize={size} color="error" />,
          text: 'Error',
          color: 'error' as const,
        };
      default:
        return null;
    }
  };

  const content = getContent();
  if (!content) return null;

  if (!showText) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {content.icon}
      </Box>
    );
  }

  return (
    <Chip
      icon={content.icon}
      label={content.text}
      size={size}
      color={content.color}
      variant="outlined"
      sx={{ height: size === 'small' ? 24 : 32 }}
    />
  );
}

interface FieldAutoSaveIndicatorProps {
  status: AutoSaveStatus;
  compact?: boolean;
}

export function FieldAutoSaveIndicator({
  status,
  compact = false,
}: FieldAutoSaveIndicatorProps) {
  if (status === 'idle') {
    return null;
  }

  const getContent = () => {
    switch (status) {
      case 'pending':
        return {
          icon: <PendingIcon fontSize="small" color="action" />,
          text: 'Pending',
        };
      case 'saving':
        return {
          icon: <CircularProgress size={16} />,
          text: 'Saving',
        };
      case 'saved':
        return {
          icon: <SavedIcon fontSize="small" color="success" />,
          text: 'Saved',
        };
      case 'error':
        return {
          icon: <ErrorIcon fontSize="small" color="error" />,
          text: 'Error',
        };
      default:
        return null;
    }
  };

  const content = getContent();
  if (!content) return null;

  if (compact) {
    return <Box sx={{ display: 'inline-flex', ml: 1 }}>{content.icon}</Box>;
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 1 }}>
      {content.icon}
      <Typography variant="caption" color="text.secondary">
        {content.text}
      </Typography>
    </Box>
  );
}
