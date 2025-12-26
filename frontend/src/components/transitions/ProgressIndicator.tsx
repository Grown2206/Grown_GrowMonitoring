import React, { useState, useEffect } from 'react';
import {
  Box,
  LinearProgress,
  Typography,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Paper,
} from '@mui/material';
import { CheckCircle, RadioButtonUnchecked } from '@mui/icons-material';

export interface ProgressIndicatorProps {
  /**
   * Current progress value (0-100)
   */
  value: number;
  /**
   * Variant of progress indicator
   */
  variant?: 'linear' | 'circular' | 'stepped';
  /**
   * Label to display
   */
  label?: string;
  /**
   * Show percentage
   */
  showPercentage?: boolean;
  /**
   * Color theme
   */
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}

/**
 * Progress indicator with multiple variants
 */
export function ProgressIndicator({
  value,
  variant = 'linear',
  label,
  showPercentage = true,
  color = 'primary',
}: ProgressIndicatorProps) {
  const percentage = Math.min(100, Math.max(0, value));

  if (variant === 'circular') {
    return (
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <CircularProgress
          variant="determinate"
          value={percentage}
          size={80}
          color={color}
        />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="caption" component="div" color="text.secondary">
            {`${Math.round(percentage)}%`}
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {label && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          {showPercentage && (
            <Typography variant="body2" color="text.secondary">
              {Math.round(percentage)}%
            </Typography>
          )}
        </Box>
      )}
      <LinearProgress
        variant="determinate"
        value={percentage}
        color={color}
        sx={{
          height: 8,
          borderRadius: 1,
        }}
      />
    </Box>
  );
}

/**
 * Multi-step progress indicator
 */
export interface StepProgress {
  label: string;
  description?: string;
}

export interface SteppedProgressProps {
  steps: StepProgress[];
  activeStep: number;
  completed?: Set<number>;
}

export function SteppedProgress({ steps, activeStep, completed = new Set() }: SteppedProgressProps) {
  return (
    <Stepper activeStep={activeStep} alternativeLabel>
      {steps.map((step, index) => (
        <Step key={step.label} completed={completed.has(index)}>
          <StepLabel
            StepIconComponent={({ active, completed }) => {
              if (completed) {
                return <CheckCircle color="success" />;
              }
              if (active) {
                return <RadioButtonUnchecked color="primary" />;
              }
              return <RadioButtonUnchecked color="disabled" />;
            }}
          >
            <Typography variant="caption">{step.label}</Typography>
            {step.description && (
              <Typography variant="caption" color="text.secondary" display="block">
                {step.description}
              </Typography>
            )}
          </StepLabel>
        </Step>
      ))}
    </Stepper>
  );
}

/**
 * Upload progress indicator
 */
export interface UploadProgressProps {
  fileName: string;
  progress: number;
  size?: string;
  onCancel?: () => void;
}

export function UploadProgress({ fileName, progress, size, onCancel }: UploadProgressProps) {
  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2" noWrap sx={{ flex: 1, mr: 2 }}>
          {fileName}
        </Typography>
        {size && (
          <Typography variant="caption" color="text.secondary">
            {size}
          </Typography>
        )}
      </Box>
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 6,
          borderRadius: 1,
        }}
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
        <Typography variant="caption" color="text.secondary">
          {Math.round(progress)}%
        </Typography>
        {onCancel && progress < 100 && (
          <Typography
            variant="caption"
            color="error"
            sx={{ cursor: 'pointer' }}
            onClick={onCancel}
          >
            Cancel
          </Typography>
        )}
      </Box>
    </Paper>
  );
}

/**
 * Animated progress bar that fills smoothly
 */
export function AnimatedProgress({
  targetValue,
  duration = 1000,
  label,
}: {
  targetValue: number;
  duration?: number;
  label?: string;
}) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const startValue = progress;
    const diff = targetValue - startValue;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const percentage = Math.min(elapsed / duration, 1);

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - percentage, 3);
      const newValue = startValue + diff * easeOut;

      setProgress(newValue);

      if (percentage < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [targetValue, duration]);

  return <ProgressIndicator value={progress} label={label} />;
}
