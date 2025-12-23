import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ZAxis } from 'recharts';
import { pearsonCorrelation } from '../../utils/statistics';

interface ScatterPlotChartProps {
  data: { x: number; y: number; timestamp?: string }[];
  xLabel: string;
  yLabel: string;
  title?: string;
  color?: string;
}

export const ScatterPlotChart: React.FC<ScatterPlotChartProps> = ({
  data,
  xLabel,
  yLabel,
  title,
  color = '#8884d8',
}) => {
  // Calculate correlation coefficient
  const xValues = data.map(d => d.x);
  const yValues = data.map(d => d.y);
  const correlation = pearsonCorrelation(xValues, yValues);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const point = payload[0].payload;
      return (
        <Box
          sx={{
            bgcolor: 'background.paper',
            p: 1.5,
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
          }}
        >
          <Typography variant="body2">
            <strong>{xLabel}:</strong> {point.x.toFixed(2)}
          </Typography>
          <Typography variant="body2">
            <strong>{yLabel}:</strong> {point.y.toFixed(2)}
          </Typography>
          {point.timestamp && (
            <Typography variant="caption" color="text.secondary">
              {new Date(point.timestamp).toLocaleString('de-DE')}
            </Typography>
          )}
        </Box>
      );
    }
    return null;
  };

  // Get correlation description
  const getCorrelationDescription = (r: number): { text: string; color: string } => {
    const absR = Math.abs(r);
    if (absR > 0.7) {
      return {
        text: r > 0 ? 'Starke positive Korrelation' : 'Starke negative Korrelation',
        color: r > 0 ? '#2e7d32' : '#d32f2f',
      };
    } else if (absR > 0.3) {
      return {
        text: r > 0 ? 'Moderate positive Korrelation' : 'Moderate negative Korrelation',
        color: r > 0 ? '#66bb6a' : '#ff9800',
      };
    }
    return { text: 'Schwache oder keine Korrelation', color: '#757575' };
  };

  const corrDesc = getCorrelationDescription(correlation);

  if (data.length === 0) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          {title || `${xLabel} vs ${yLabel}`}
        </Typography>
        <Typography color="text.secondary">Keine Daten verfügbar</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {title || `${xLabel} vs ${yLabel}`}
      </Typography>

      {/* Correlation info */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Typography variant="body2" color="text.secondary">
          Korrelationskoeffizient (Pearson):
        </Typography>
        <Box
          sx={{
            px: 1.5,
            py: 0.5,
            borderRadius: 1,
            bgcolor: corrDesc.color,
            color: '#ffffff',
          }}
        >
          <Typography variant="body2" fontWeight="bold">
            r = {correlation.toFixed(3)}
          </Typography>
        </Box>
        <Typography variant="body2" color={corrDesc.color} fontWeight="medium">
          {corrDesc.text}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          (n = {data.length} Datenpunkte)
        </Typography>
      </Box>

      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            dataKey="x"
            name={xLabel}
            label={{ value: xLabel, position: 'insideBottom', offset: -10 }}
          />
          <YAxis
            type="number"
            dataKey="y"
            name={yLabel}
            label={{ value: yLabel, angle: -90, position: 'insideLeft' }}
          />
          <ZAxis range={[60, 60]} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            height={36}
            content={() => (
              <Box sx={{ textAlign: 'center', mb: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Jeder Punkt repräsentiert eine gleichzeitige Messung beider Variablen
                </Typography>
              </Box>
            )}
          />
          <Scatter name="Messungen" data={data} fill={color} />
        </ScatterChart>
      </ResponsiveContainer>

      {/* Interpretation help */}
      <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
        <Typography variant="caption" display="block" gutterBottom fontWeight="bold">
          💡 Interpretation:
        </Typography>
        <Typography variant="caption" display="block" color="text.secondary">
          • Punkte in einer aufsteigenden Linie = positive Korrelation (wenn X steigt, steigt auch Y)
        </Typography>
        <Typography variant="caption" display="block" color="text.secondary">
          • Punkte in einer absteigenden Linie = negative Korrelation (wenn X steigt, fällt Y)
        </Typography>
        <Typography variant="caption" display="block" color="text.secondary">
          • Verstreute Punkte = keine Korrelation (X und Y sind unabhängig)
        </Typography>
      </Box>
    </Paper>
  );
};
