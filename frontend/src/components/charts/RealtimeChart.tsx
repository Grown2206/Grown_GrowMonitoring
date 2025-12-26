import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Stack,
  Typography,
  Chip,
  FormControl,
  Select,
  MenuItem,
  Button,
} from '@mui/material';
import {
  Pause as PauseIcon,
  PlayArrow as PlayIcon,
  Refresh as RefreshIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

export interface RealtimeDataPoint {
  timestamp: number;
  [key: string]: number;
}

export interface RealtimeChartProps {
  title?: string;
  dataKeys: Array<{ key: string; color: string; label?: string }>;
  onFetchData?: () => Promise<RealtimeDataPoint>;
  refreshInterval?: number; // in ms
  maxDataPoints?: number;
  showControls?: boolean;
  height?: number;
  unit?: string;
  thresholds?: Array<{ value: number; label: string; color: string }>;
}

/**
 * Real-time chart with auto-refresh and streaming data
 */
export function RealtimeChart({
  title = 'Real-time Data',
  dataKeys,
  onFetchData,
  refreshInterval = 2000,
  maxDataPoints = 50,
  showControls = true,
  height = 300,
  unit = '',
  thresholds = [],
}: RealtimeChartProps) {
  const [data, setData] = useState<RealtimeDataPoint[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [zoom, setZoom] = useState(1);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = async () => {
    if (!onFetchData || isPaused) return;

    try {
      const newPoint = await onFetchData();
      setData((prevData) => {
        const updated = [...prevData, newPoint];
        return updated.slice(-maxDataPoints);
      });
    } catch (error) {
      console.error('Failed to fetch realtime data:', error);
    }
  };

  useEffect(() => {
    if (!isPaused && onFetchData) {
      intervalRef.current = setInterval(fetchData, refreshInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPaused, refreshInterval, onFetchData]);

  const handleTogglePause = () => {
    setIsPaused(!isPaused);
  };

  const handleRefresh = () => {
    setData([]);
    fetchData();
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.2, 2));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.2, 0.5));
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const visibleDataPoints = Math.floor(maxDataPoints / zoom);
  const visibleData = data.slice(-visibleDataPoints);

  return (
    <Card>
      <CardHeader
        title={title}
        subheader={
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              label={isPaused ? 'Paused' : 'Live'}
              color={isPaused ? 'default' : 'success'}
              size="small"
            />
            <Typography variant="caption" color="text.secondary">
              {data.length} / {maxDataPoints} points
            </Typography>
          </Stack>
        }
        action={
          showControls && (
            <Stack direction="row" spacing={0.5}>
              <IconButton size="small" onClick={handleTogglePause}>
                {isPaused ? <PlayIcon /> : <PauseIcon />}
              </IconButton>
              <IconButton size="small" onClick={handleRefresh}>
                <RefreshIcon />
              </IconButton>
              <IconButton size="small" onClick={handleZoomIn}>
                <ZoomInIcon />
              </IconButton>
              <IconButton size="small" onClick={handleZoomOut}>
                <ZoomOutIcon />
              </IconButton>
            </Stack>
          )
        }
      />
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={visibleData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatTimestamp}
              type="number"
              domain={['dataMin', 'dataMax']}
            />
            <YAxis unit={unit} />
            <Tooltip labelFormatter={formatTimestamp} />
            <Legend />

            {/* Threshold lines */}
            {thresholds.map((threshold, index) => (
              <ReferenceLine
                key={index}
                y={threshold.value}
                label={threshold.label}
                stroke={threshold.color}
                strokeDasharray="3 3"
              />
            ))}

            {/* Data lines */}
            {dataKeys.map((dataKey) => (
              <Line
                key={dataKey.key}
                type="monotone"
                dataKey={dataKey.key}
                stroke={dataKey.color}
                name={dataKey.label || dataKey.key}
                dot={false}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>

        {data.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Waiting for data...
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Simple realtime chart hook for managing streaming data
 */
export function useRealtimeData(fetchFn: () => Promise<any>, interval: number = 2000) {
  const [data, setData] = useState<any[]>([]);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const intervalId = setInterval(async () => {
      try {
        const newPoint = await fetchFn();
        setData((prev) => [...prev, newPoint].slice(-50));
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    }, interval);

    return () => clearInterval(intervalId);
  }, [isPaused, interval, fetchFn]);

  return {
    data,
    isPaused,
    setIsPaused,
    clearData: () => setData([]),
  };
}
