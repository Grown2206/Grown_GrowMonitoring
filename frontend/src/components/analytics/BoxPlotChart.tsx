import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getStatisticalSummary, identifyOutliers } from '../../utils/statistics';

interface BoxPlotData {
  label: string;
  values: number[];
  color?: string;
}

interface BoxPlotChartProps {
  data: BoxPlotData[];
  title?: string;
  yLabel?: string;
}

export const BoxPlotChart: React.FC<BoxPlotChartProps> = ({ data, title = 'Box Plot', yLabel = 'Wert' }) => {
  // Calculate statistics for each dataset
  const chartData = data.map((dataset) => {
    const stats = getStatisticalSummary(dataset.values);
    const outliers = identifyOutliers(dataset.values);

    return {
      label: dataset.label,
      min: stats.min,
      q1: stats.q1,
      median: stats.median,
      q3: stats.q3,
      max: stats.max,
      mean: stats.mean,
      outlierCount: outliers.length,
      color: dataset.color || '#8884d8',
      rawValues: dataset.values,
    };
  });

  // Custom tooltip showing all stats
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const stats = payload[0].payload;
      return (
        <Box
          sx={{
            bgcolor: 'background.paper',
            p: 2,
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            minWidth: 200,
          }}
        >
          <Typography variant="subtitle2" gutterBottom fontWeight="bold">
            {stats.label}
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.5 }}>
            <Typography variant="caption">Max:</Typography>
            <Typography variant="caption" fontWeight="bold">
              {stats.max.toFixed(2)}
            </Typography>

            <Typography variant="caption">Q3 (75%):</Typography>
            <Typography variant="caption" fontWeight="bold">
              {stats.q3.toFixed(2)}
            </Typography>

            <Typography variant="caption" color="primary">
              Median:
            </Typography>
            <Typography variant="caption" fontWeight="bold" color="primary">
              {stats.median.toFixed(2)}
            </Typography>

            <Typography variant="caption">Mean:</Typography>
            <Typography variant="caption" fontWeight="bold">
              {stats.mean.toFixed(2)}
            </Typography>

            <Typography variant="caption">Q1 (25%):</Typography>
            <Typography variant="caption" fontWeight="bold">
              {stats.q1.toFixed(2)}
            </Typography>

            <Typography variant="caption">Min:</Typography>
            <Typography variant="caption" fontWeight="bold">
              {stats.min.toFixed(2)}
            </Typography>

            <Typography variant="caption">Ausreißer:</Typography>
            <Typography variant="caption" fontWeight="bold" color={stats.outlierCount > 0 ? 'error' : 'inherit'}>
              {stats.outlierCount}
            </Typography>

            <Typography variant="caption">Anzahl:</Typography>
            <Typography variant="caption" fontWeight="bold">
              {stats.rawValues.length}
            </Typography>
          </Box>
        </Box>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Typography color="text.secondary">Keine Daten verfügbar</Typography>
      </Paper>
    );
  }

  // For visualization, we'll create stacked bars showing the quartiles
  const visualData = chartData.map((stats) => ({
    label: stats.label,
    // We'll use stacked bars to show the box plot visually
    minToQ1: stats.q1 - stats.min,
    q1ToMedian: stats.median - stats.q1,
    medianToQ3: stats.q3 - stats.median,
    q3ToMax: stats.max - stats.q3,
    baseValue: stats.min,
    median: stats.median,
    mean: stats.mean,
    color: stats.color,
  }));

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Statistische Verteilung der Messwerte (Minimum, Quartile, Median, Maximum)
      </Typography>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={visualData} margin={{ top: 20, right: 30, left: 60, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" angle={-45} textAnchor="end" height={80} />
          <YAxis label={{ value: yLabel, angle: -90, position: 'insideLeft' }} />
          <Tooltip content={<CustomTooltip />} />

          {/* Stacked bars to create box plot effect */}
          <Bar dataKey="minToQ1" stackId="a" fill="#e3f2fd" />
          <Bar dataKey="q1ToMedian" stackId="a" fill="#90caf9" />
          <Bar dataKey="medianToQ3" stackId="a" fill="#42a5f5" />
          <Bar dataKey="q3ToMax" stackId="a" fill="#e3f2fd" />
        </BarChart>
      </ResponsiveContainer>

      {/* Statistics summary table */}
      <Box sx={{ mt: 3, overflowX: 'auto' }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: `150px repeat(${chartData.length}, 100px)`,
            gap: '1px',
            bgcolor: 'divider',
          }}
        >
          {/* Header row */}
          <Box sx={{ bgcolor: 'background.paper', p: 1, fontWeight: 'bold' }}>Statistik</Box>
          {chartData.map((stats) => (
            <Box key={stats.label} sx={{ bgcolor: 'background.paper', p: 1, textAlign: 'center', fontWeight: 'bold' }}>
              {stats.label}
            </Box>
          ))}

          {/* Data rows */}
          {['max', 'q3', 'median', 'mean', 'q1', 'min', 'outlierCount'].map((key) => (
            <React.Fragment key={key}>
              <Box sx={{ bgcolor: 'background.paper', p: 1 }}>
                <Typography variant="caption">
                  {key === 'max'
                    ? 'Maximum'
                    : key === 'q3'
                    ? 'Q3 (75%)'
                    : key === 'median'
                    ? 'Median'
                    : key === 'mean'
                    ? 'Mittelwert'
                    : key === 'q1'
                    ? 'Q1 (25%)'
                    : key === 'min'
                    ? 'Minimum'
                    : 'Ausreißer'}
                </Typography>
              </Box>
              {chartData.map((stats) => (
                <Box key={`${stats.label}-${key}`} sx={{ bgcolor: 'background.paper', p: 1, textAlign: 'center' }}>
                  <Typography variant="caption" fontWeight={key === 'median' ? 'bold' : 'normal'}>
                    {key === 'outlierCount' ? (stats as any)[key] : ((stats as any)[key] as number).toFixed(2)}
                  </Typography>
                </Box>
              ))}
            </React.Fragment>
          ))}
        </Box>
      </Box>

      {/* Legend */}
      <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
        <Typography variant="caption" display="block" gutterBottom fontWeight="bold">
          💡 Interpretation:
        </Typography>
        <Typography variant="caption" display="block" color="text.secondary">
          • <strong>Box (Q1-Q3):</strong> Enthält 50% der Daten (mittlere Werte)
        </Typography>
        <Typography variant="caption" display="block" color="text.secondary">
          • <strong>Median:</strong> Mittlerer Wert (50% darüber, 50% darunter)
        </Typography>
        <Typography variant="caption" display="block" color="text.secondary">
          • <strong>Whiskers (Min-Max):</strong> Gesamtspanne der Daten
        </Typography>
        <Typography variant="caption" display="block" color="text.secondary">
          • <strong>Ausreißer:</strong> Werte außerhalb von 1.5 × IQR (Interquartilsabstand)
        </Typography>
      </Box>
    </Paper>
  );
};
