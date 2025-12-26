import React from 'react';
import { Box, Card, CardContent, Typography, Stack, Chip } from '@mui/material';

export interface GaugeChartProps {
  value: number;
  min?: number;
  max?: number;
  unit?: string;
  title?: string;
  size?: number;
  color?: string;
  thresholds?: Array<{ value: number; color: string; label?: string }>;
  showValue?: boolean;
}

/**
 * Gauge/Speedometer chart for displaying single values
 */
export function GaugeChart({
  value,
  min = 0,
  max = 100,
  unit = '',
  title,
  size = 200,
  color = '#1976d2',
  thresholds = [],
  showValue = true,
}: GaugeChartProps) {
  const percentage = ((value - min) / (max - min)) * 100;
  const angle = (percentage / 100) * 180 - 90;

  const getColor = () => {
    if (thresholds.length === 0) return color;

    const sortedThresholds = [...thresholds].sort((a, b) => a.value - b.value);
    for (let i = sortedThresholds.length - 1; i >= 0; i--) {
      if (value >= sortedThresholds[i].value) {
        return sortedThresholds[i].color;
      }
    }
    return color;
  };

  const currentColor = getColor();
  const radius = size / 2;
  const strokeWidth = size * 0.1;
  const innerRadius = radius - strokeWidth;

  return (
    <Card>
      <CardContent>
        {title && (
          <Typography variant="h6" gutterBottom textAlign="center">
            {title}
          </Typography>
        )}

        <Box sx={{ position: 'relative', width: size, height: size / 2 + 40, margin: '0 auto' }}>
          <svg width={size} height={size / 2 + 40} viewBox={`0 0 ${size} ${size / 2 + 40}`}>
            {/* Background arc */}
            <path
              d={`M ${strokeWidth / 2},${radius} A ${innerRadius},${innerRadius} 0 0,1 ${
                size - strokeWidth / 2
              },${radius}`}
              fill="none"
              stroke="#e0e0e0"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />

            {/* Value arc */}
            <path
              d={`M ${strokeWidth / 2},${radius} A ${innerRadius},${innerRadius} 0 ${
                percentage > 50 ? 1 : 0
              },1 ${
                radius + innerRadius * Math.cos((angle * Math.PI) / 180)
              },${radius + innerRadius * Math.sin((angle * Math.PI) / 180)}`}
              fill="none"
              stroke={currentColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />

            {/* Needle */}
            <line
              x1={radius}
              y1={radius}
              x2={radius + (innerRadius - 10) * Math.cos((angle * Math.PI) / 180)}
              y2={radius + (innerRadius - 10) * Math.sin((angle * Math.PI) / 180)}
              stroke={currentColor}
              strokeWidth={3}
              strokeLinecap="round"
            />

            {/* Center dot */}
            <circle cx={radius} cy={radius} r={8} fill={currentColor} />
          </svg>

          {showValue && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                textAlign: 'center',
              }}
            >
              <Typography variant="h4" fontWeight="bold" color={currentColor}>
                {value.toFixed(1)}
                <Typography component="span" variant="h6" color="text.secondary">
                  {unit}
                </Typography>
              </Typography>
            </Box>
          )}
        </Box>

        {/* Min/Max labels */}
        <Stack direction="row" justifyContent="space-between" sx={{ mt: 1, px: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {min}
            {unit}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {max}
            {unit}
          </Typography>
        </Stack>

        {/* Threshold indicators */}
        {thresholds.length > 0 && (
          <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 2 }} flexWrap="wrap">
            {thresholds.map((threshold, index) => (
              <Chip
                key={index}
                label={`${threshold.label || threshold.value} ${unit}`}
                size="small"
                sx={{ bgcolor: threshold.color, color: '#fff' }}
              />
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Simple circular progress gauge
 */
export function CircularGauge({
  value,
  max = 100,
  size = 120,
  color = '#1976d2',
  label,
}: {
  value: number;
  max?: number;
  size?: number;
  color?: string;
  label?: string;
}) {
  const percentage = (value / max) * 100;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <Box sx={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e0e0e0"
          strokeWidth={strokeWidth}
        />

        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>

      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          {value}
        </Typography>
        {label && (
          <Typography variant="caption" color="text.secondary">
            {label}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
