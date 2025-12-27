import React, { useState } from 'react';
import {
  Box, Button, Card, CardContent, Chip, Grid, Stack, Typography,
  FormControl, InputLabel, Select, MenuItem, Paper,
} from '@mui/material';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Speed as SpeedIcon, Memory as MemoryIcon, Storage as StorageIcon, TrendingUp as TrendIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

export interface PerformanceMetric {
  timestamp: Date;
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  responseTime: number;
  throughput: number;
}

export interface PerformanceMonitorProps {
  metrics?: PerformanceMetric[];
  onRefresh?: () => void;
}

export function PerformanceMonitor({ metrics: initialMetrics, onRefresh }: PerformanceMonitorProps) {
  const [metrics] = useState<PerformanceMetric[]>(initialMetrics || getSampleMetrics());
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('24h');
  const [metricType, setMetricType] = useState<'cpu' | 'memory' | 'disk' | 'network' | 'response'>('cpu');

  const avgCpu = (metrics.reduce((sum, m) => sum + m.cpu, 0) / metrics.length).toFixed(1);
  const avgMem = (metrics.reduce((sum, m) => sum + m.memory, 0) / metrics.length).toFixed(1);
  const avgResponse = (metrics.reduce((sum, m) => sum + m.responseTime, 0) / metrics.length).toFixed(0);
  const maxThroughput = Math.max(...metrics.map(m => m.throughput));

  const chartData = metrics.map(m => ({
    time: m.timestamp.toLocaleTimeString(),
    CPU: m.cpu,
    Memory: m.memory,
    Disk: m.disk,
    Network: m.network,
    Response: m.responseTime,
  }));

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5">Performance Monitor</Typography>
          <Typography variant="body2" color="text.secondary">
            Real-time system performance metrics
          </Typography>
        </Box>
        <Button variant="contained" onClick={onRefresh}>Refresh</Button>
      </Stack>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary">Avg CPU</Typography>
                  <Typography variant="h4">{avgCpu}%</Typography>
                </Box>
                <SpeedIcon color="primary" sx={{ fontSize: 40 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary">Avg Memory</Typography>
                  <Typography variant="h4">{avgMem}%</Typography>
                </Box>
                <MemoryIcon color="info" sx={{ fontSize: 40 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary">Avg Response</Typography>
                  <Typography variant="h4">{avgResponse}ms</Typography>
                </Box>
                <StorageIcon color="success" sx={{ fontSize: 40 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary">Max Throughput</Typography>
                  <Typography variant="h4">{maxThroughput}</Typography>
                </Box>
                <TrendIcon color="warning" sx={{ fontSize: 40 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={2}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Time Range</InputLabel>
              <Select value={timeRange} onChange={(e) => setTimeRange(e.target.value as any)}>
                <MenuItem value="1h">Last Hour</MenuItem>
                <MenuItem value="6h">Last 6 Hours</MenuItem>
                <MenuItem value="24h">Last 24 Hours</MenuItem>
                <MenuItem value="7d">Last 7 Days</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Metric</InputLabel>
              <Select value={metricType} onChange={(e) => setMetricType(e.target.value as any)}>
                <MenuItem value="cpu">CPU Usage</MenuItem>
                <MenuItem value="memory">Memory Usage</MenuItem>
                <MenuItem value="disk">Disk Usage</MenuItem>
                <MenuItem value="network">Network</MenuItem>
                <MenuItem value="response">Response Time</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Performance Trends</Typography>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              {metricType === 'cpu' && <Area type="monotone" dataKey="CPU" stroke="#8884d8" fill="#8884d8" />}
              {metricType === 'memory' && <Area type="monotone" dataKey="Memory" stroke="#82ca9d" fill="#82ca9d" />}
              {metricType === 'disk' && <Area type="monotone" dataKey="Disk" stroke="#ffc658" fill="#ffc658" />}
              {metricType === 'network' && <Area type="monotone" dataKey="Network" stroke="#ff7300" fill="#ff7300" />}
              {metricType === 'response' && <Area type="monotone" dataKey="Response" stroke="#413ea0" fill="#413ea0" />}
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </Box>
  );
}

function getSampleMetrics(): PerformanceMetric[] {
  const now = new Date();
  return Array.from({ length: 24 }, (_, i) => ({
    timestamp: new Date(now.getTime() - (23 - i) * 3600000),
    cpu: 20 + Math.random() * 30,
    memory: 40 + Math.random() * 20,
    disk: 60 + Math.random() * 10,
    network: 10 + Math.random() * 40,
    responseTime: 100 + Math.random() * 200,
    throughput: 500 + Math.random() * 500,
  }));
}
