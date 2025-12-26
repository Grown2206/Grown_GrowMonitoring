import React from 'react';
import { Box, Skeleton, Card, CardContent, Grid, Stack } from '@mui/material';

export interface SkeletonLoaderProps {
  variant?: 'card' | 'list' | 'table' | 'chart' | 'text';
  count?: number;
  height?: number | string;
  width?: number | string;
  animation?: 'pulse' | 'wave' | false;
}

/**
 * Skeleton loader component for loading states
 *
 * @example
 * {loading ? (
 *   <SkeletonLoader variant="card" count={3} />
 * ) : (
 *   <div>Content</div>
 * )}
 */
export function SkeletonLoader({
  variant = 'card',
  count = 1,
  height = 200,
  width = '100%',
  animation = 'wave',
}: SkeletonLoaderProps) {
  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return <SkeletonCard animation={animation} height={height} />;

      case 'list':
        return <SkeletonList animation={animation} />;

      case 'table':
        return <SkeletonTable animation={animation} />;

      case 'chart':
        return <SkeletonChart animation={animation} height={height} />;

      case 'text':
        return <Skeleton animation={animation} width={width} height={height} />;

      default:
        return <Skeleton animation={animation} width={width} height={height} />;
    }
  };

  if (count === 1) {
    return renderSkeleton();
  }

  return (
    <Stack spacing={2}>
      {Array.from({ length: count }).map((_, index) => (
        <React.Fragment key={index}>{renderSkeleton()}</React.Fragment>
      ))}
    </Stack>
  );
}

/**
 * Skeleton Card
 */
function SkeletonCard({
  animation,
  height,
}: {
  animation: 'pulse' | 'wave' | false;
  height?: number | string;
}) {
  return (
    <Card>
      <Skeleton animation={animation} variant="rectangular" height={160} />
      <CardContent>
        <Skeleton animation={animation} height={32} width="60%" sx={{ mb: 1 }} />
        <Skeleton animation={animation} height={20} width="80%" />
        <Skeleton animation={animation} height={20} width="90%" />
        <Skeleton animation={animation} height={20} width="40%" />
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton List
 */
function SkeletonList({ animation }: { animation: 'pulse' | 'wave' | false }) {
  return (
    <Stack spacing={1}>
      {[1, 2, 3].map((i) => (
        <Box key={i} display="flex" alignItems="center" gap={2}>
          <Skeleton animation={animation} variant="circular" width={40} height={40} />
          <Box flex={1}>
            <Skeleton animation={animation} height={20} width="70%" />
            <Skeleton animation={animation} height={16} width="40%" />
          </Box>
        </Box>
      ))}
    </Stack>
  );
}

/**
 * Skeleton Table
 */
function SkeletonTable({ animation }: { animation: 'pulse' | 'wave' | false }) {
  return (
    <Stack spacing={1}>
      {/* Header */}
      <Box display="flex" gap={2} p={2} borderBottom="1px solid" borderColor="divider">
        <Skeleton animation={animation} height={24} width="20%" />
        <Skeleton animation={animation} height={24} width="30%" />
        <Skeleton animation={animation} height={24} width="25%" />
        <Skeleton animation={animation} height={24} width="15%" />
      </Box>

      {/* Rows */}
      {[1, 2, 3, 4, 5].map((i) => (
        <Box key={i} display="flex" gap={2} p={2}>
          <Skeleton animation={animation} height={20} width="20%" />
          <Skeleton animation={animation} height={20} width="30%" />
          <Skeleton animation={animation} height={20} width="25%" />
          <Skeleton animation={animation} height={20} width="15%" />
        </Box>
      ))}
    </Stack>
  );
}

/**
 * Skeleton Chart
 */
function SkeletonChart({
  animation,
  height,
}: {
  animation: 'pulse' | 'wave' | false;
  height?: number | string;
}) {
  return (
    <Box>
      <Skeleton animation={animation} height={32} width="40%" sx={{ mb: 2 }} />
      <Skeleton animation={animation} variant="rectangular" height={height || 300} />
      <Box display="flex" justifyContent="center" gap={3} mt={2}>
        <Skeleton animation={animation} width={60} height={16} />
        <Skeleton animation={animation} width={60} height={16} />
        <Skeleton animation={animation} width={60} height={16} />
      </Box>
    </Box>
  );
}

/**
 * Skeleton Dashboard Grid
 */
export function SkeletonDashboard({ animation = 'wave' }: { animation?: 'pulse' | 'wave' | false }) {
  return (
    <Grid container spacing={3}>
      {[1, 2, 3, 4].map((i) => (
        <Grid item xs={12} sm={6} md={3} key={i}>
          <Card>
            <CardContent>
              <Skeleton animation={animation} height={24} width="60%" />
              <Skeleton animation={animation} height={48} width="40%" sx={{ mt: 1 }} />
            </CardContent>
          </Card>
        </Grid>
      ))}

      <Grid item xs={12} md={8}>
        <Card sx={{ p: 3 }}>
          <SkeletonChart animation={animation} height={350} />
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card sx={{ p: 3 }}>
          <Skeleton animation={animation} height={32} width="50%" sx={{ mb: 2 }} />
          <SkeletonList animation={animation} />
        </Card>
      </Grid>
    </Grid>
  );
}

/**
 * Skeleton Form
 */
export function SkeletonForm({ animation = 'wave' }: { animation?: 'pulse' | 'wave' | false }) {
  return (
    <Stack spacing={3}>
      <Skeleton animation={animation} height={32} width="30%" />
      <Skeleton animation={animation} height={56} />
      <Skeleton animation={animation} height={56} />
      <Box display="flex" gap={2}>
        <Skeleton animation={animation} height={56} width="50%" />
        <Skeleton animation={animation} height={56} width="50%" />
      </Box>
      <Skeleton animation={animation} height={120} />
      <Box display="flex" gap={2} justifyContent="flex-end">
        <Skeleton animation={animation} height={42} width={100} />
        <Skeleton animation={animation} height={42} width={100} />
      </Box>
    </Stack>
  );
}
