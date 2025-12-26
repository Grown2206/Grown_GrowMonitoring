import React from 'react';
import {
  Box,
  CircularProgress,
  LinearProgress,
  Typography,
  Fade,
  Backdrop,
} from '@mui/material';
import { useAnimation } from '../../hooks/useAnimation';

export interface LoadingStateProps {
  /**
   * Loading message to display
   */
  message?: string;
  /**
   * Progress value (0-100) for determinate progress
   */
  progress?: number;
  /**
   * Variant of loading indicator
   */
  variant?: 'circular' | 'linear' | 'dots' | 'spinner';
  /**
   * Size of the loading indicator
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Whether to show as fullscreen overlay
   */
  fullscreen?: boolean;
  /**
   * Whether to blur background
   */
  backdrop?: boolean;
}

/**
 * Loading state component with various styles
 */
export function LoadingState({
  message,
  progress,
  variant = 'circular',
  size = 'medium',
  fullscreen = false,
  backdrop = false,
}: LoadingStateProps) {
  const { style } = useAnimation({
    type: 'fade',
    duration: 'fast',
  });

  const sizeMap = {
    small: 32,
    medium: 48,
    large: 64,
  };

  const content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        ...style,
      }}
    >
      {variant === 'circular' && (
        <CircularProgress
          size={sizeMap[size]}
          variant={progress !== undefined ? 'determinate' : 'indeterminate'}
          value={progress}
        />
      )}

      {variant === 'linear' && (
        <Box sx={{ width: '100%', maxWidth: 300 }}>
          <LinearProgress
            variant={progress !== undefined ? 'determinate' : 'indeterminate'}
            value={progress}
          />
        </Box>
      )}

      {variant === 'dots' && <LoadingDots size={size} />}

      {variant === 'spinner' && <LoadingSpinner size={size} />}

      {message && (
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      )}

      {progress !== undefined && progress >= 0 && (
        <Typography variant="caption" color="text.secondary">
          {Math.round(progress)}%
        </Typography>
      )}
    </Box>
  );

  if (fullscreen) {
    return (
      <Backdrop
        open
        sx={{
          zIndex: (theme) => theme.zIndex.modal + 1,
          bgcolor: backdrop ? 'rgba(0, 0, 0, 0.5)' : 'transparent',
        }}
      >
        {content}
      </Backdrop>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 200,
        width: '100%',
      }}
    >
      {content}
    </Box>
  );
}

/**
 * Loading dots animation
 */
function LoadingDots({ size }: { size: 'small' | 'medium' | 'large' }) {
  const dotSize = size === 'small' ? 8 : size === 'medium' ? 12 : 16;
  const gap = size === 'small' ? 4 : size === 'medium' ? 6 : 8;

  return (
    <Box sx={{ display: 'flex', gap: `${gap}px` }}>
      {[0, 1, 2].map((i) => (
        <Box
          key={i}
          sx={{
            width: dotSize,
            height: dotSize,
            borderRadius: '50%',
            bgcolor: 'primary.main',
            animation: 'bounce 1.4s infinite ease-in-out',
            animationDelay: `${i * 0.16}s`,
            '@keyframes bounce': {
              '0%, 80%, 100%': {
                transform: 'scale(0)',
                opacity: 0.5,
              },
              '40%': {
                transform: 'scale(1)',
                opacity: 1,
              },
            },
          }}
        />
      ))}
    </Box>
  );
}

/**
 * Loading spinner animation
 */
function LoadingSpinner({ size }: { size: 'small' | 'medium' | 'large' }) {
  const spinnerSize = size === 'small' ? 32 : size === 'medium' ? 48 : 64;

  return (
    <Box
      sx={{
        width: spinnerSize,
        height: spinnerSize,
        border: '3px solid',
        borderColor: 'action.disabled',
        borderTopColor: 'primary.main',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        '@keyframes spin': {
          '0%': {
            transform: 'rotate(0deg)',
          },
          '100%': {
            transform: 'rotate(360deg)',
          },
        },
      }}
    />
  );
}

/**
 * Inline loading indicator for buttons or small spaces
 */
export function InlineLoader({ size = 16 }: { size?: number }) {
  return (
    <CircularProgress
      size={size}
      sx={{
        verticalAlign: 'middle',
      }}
    />
  );
}

/**
 * Suspense fallback with loading state
 */
export function SuspenseFallback({ message = 'Loading...' }: { message?: string }) {
  return (
    <Fade in timeout={300}>
      <Box>
        <LoadingState message={message} variant="circular" size="medium" />
      </Box>
    </Fade>
  );
}

/**
 * Loading overlay that can be placed over content
 */
export interface LoadingOverlayProps {
  loading: boolean;
  children: React.ReactNode;
  message?: string;
}

export function LoadingOverlay({ loading, children, message }: LoadingOverlayProps) {
  return (
    <Box sx={{ position: 'relative' }}>
      {children}
      {loading && (
        <Backdrop
          open
          sx={{
            position: 'absolute',
            zIndex: 1,
            bgcolor: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(2px)',
          }}
        >
          <LoadingState message={message} variant="circular" size="medium" />
        </Backdrop>
      )}
    </Box>
  );
}
