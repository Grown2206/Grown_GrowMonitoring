import React from 'react';
import { Box, BoxProps } from '@mui/material';

export interface VisuallyHiddenProps extends BoxProps {
  children: React.ReactNode;
  focusable?: boolean;
}

/**
 * Component that hides content visually but keeps it accessible to screen readers
 * Use for labels, instructions, or additional context for screen reader users
 *
 * @example
 * <VisuallyHidden>
 *   Loading sensor data...
 * </VisuallyHidden>
 */
export function VisuallyHidden({ children, focusable = false, sx, ...props }: VisuallyHiddenProps) {
  return (
    <Box
      component="span"
      sx={{
        position: 'absolute',
        left: '-10000px',
        width: '1px',
        height: '1px',
        overflow: 'hidden',
        ...(focusable && {
          '&:focus': {
            position: 'static',
            width: 'auto',
            height: 'auto',
            overflow: 'visible',
          },
        }),
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
}

/**
 * Live region for screen reader announcements
 */
export interface LiveRegionProps {
  children: React.ReactNode;
  level?: 'polite' | 'assertive';
  atomic?: boolean;
  role?: 'status' | 'alert' | 'log';
}

export function LiveRegion({
  children,
  level = 'polite',
  atomic = true,
  role = 'status',
}: LiveRegionProps) {
  return (
    <VisuallyHidden role={role} aria-live={level} aria-atomic={atomic}>
      {children}
    </VisuallyHidden>
  );
}
