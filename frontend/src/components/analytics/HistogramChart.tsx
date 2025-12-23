import React, { useState } from 'react';
import { Paper, Typography, Box, Slider } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { createHistogram, mean, standardDeviation } from '../../utils/statistics';

interface HistogramChartProps {
  data: number[];
  title?: string;
  xLabel?: string;
  color?: string;
  defaultBins?: number;
}

export const HistogramChart: React.FC<HistogramChartProps> = ({
  data,
  title = 'Häufigkeitsverteilung',
  xLabel = 'Wert',
  color = '#8884d8',
  defaultBins = 10,
}) => {
  const [binCount, setBinCount] = useState(defaultBins);

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

  const histogram = createHistogram(data, binCount);
  const avg = mean(data);
  const stdDev = standardDeviation(data);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const bin = payload[0].payload;
      const percentage = ((bin.count / data.length) * 100).toFixed(1);

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
          <Typography variant="body2" fontWeight="bold">
            {bin.bin}
          </Typography>
          <Typography variant="body2">Anzahl: {bin.count}</Typography>
          <Typography variant="caption" color="text.secondary">
            {percentage}% aller Werte
          </Typography>
        </Box>
      );
    }
    return null;
  };

  // Determine which bins are within 1 standard deviation of mean
  const isWithinStdDev = (min: number, max: number) => {
    const lowerBound = avg - stdDev;
    const upperBound = avg + stdDev;
    return (min >= lowerBound && min <= upperBound) || (max >= lowerBound && max <= upperBound);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Verteilung der Messwerte in {binCount} Intervallen
      </Typography>

      {/* Bin count slider */}
      <Box sx={{ mb: 3, px: 2 }}>
        <Typography variant="caption" color="text.secondary" gutterBottom>
          Anzahl der Intervalle: {binCount}
        </Typography>
        <Slider
          value={binCount}
          onChange={(_, value) => setBinCount(value as number)}
          min={5}
          max={30}
          step={1}
          marks={[
            { value: 5, label: '5' },
            { value: 10, label: '10' },
            { value: 20, label: '20' },
            { value: 30, label: '30' },
          ]}
          size="small"
        />
      </Box>

      {/* Statistics summary */}
      <Box sx={{ mb: 2, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Mittelwert
          </Typography>
          <Typography variant="body1" fontWeight="bold">
            {avg.toFixed(2)}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Standardabweichung
          </Typography>
          <Typography variant="body1" fontWeight="bold">
            ±{stdDev.toFixed(2)}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Anzahl Messungen
          </Typography>
          <Typography variant="body1" fontWeight="bold">
            {data.length}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Bereich
          </Typography>
          <Typography variant="body1" fontWeight="bold">
            {Math.min(...data).toFixed(2)} - {Math.max(...data).toFixed(2)}
          </Typography>
        </Box>
      </Box>

      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={histogram} margin={{ top: 20, right: 30, left: 60, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="bin" angle={-45} textAnchor="end" height={80} label={{ value: xLabel, position: 'insideBottom', offset: -40 }} />
          <YAxis label={{ value: 'Häufigkeit', angle: -90, position: 'insideLeft' }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {histogram.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={isWithinStdDev(entry.min, entry.max) ? color : `${color}80`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Normal distribution info */}
      <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
        <Typography variant="caption" display="block" gutterBottom fontWeight="bold">
          💡 Interpretation:
        </Typography>
        <Typography variant="caption" display="block" color="text.secondary">
          • <strong>Dunklere Balken:</strong> Werte innerhalb von ±1 Standardabweichung vom Mittelwert (~68% bei
          Normalverteilung)
        </Typography>
        <Typography variant="caption" display="block" color="text.secondary">
          • <strong>Hellere Balken:</strong> Werte außerhalb von ±1 Standardabweichung (Extremwerte)
        </Typography>
        <Typography variant="caption" display="block" color="text.secondary">
          • <strong>Symmetrische Verteilung:</strong> Gleichmäßig um den Mittelwert = stabile Bedingungen
        </Typography>
        <Typography variant="caption" display="block" color="text.secondary">
          • <strong>Schiefe Verteilung:</strong> Häufung an einem Ende = mögliche Probleme oder Trends
        </Typography>
      </Box>

      {/* Distribution shape analysis */}
      {(() => {
        const maxCount = Math.max(...histogram.map((h) => h.count));
        const maxBin = histogram.find((h) => h.count === maxCount);
        const midRange = (Math.min(...data) + Math.max(...data)) / 2;
        const isSymmetric = maxBin && Math.abs((maxBin.min + maxBin.max) / 2 - midRange) < (Math.max(...data) - Math.min(...data)) * 0.1;

        return (
          <Box sx={{ mt: 1, p: 1.5, bgcolor: isSymmetric ? 'success.light' : 'warning.light', borderRadius: 1, opacity: 0.8 }}>
            <Typography variant="caption" fontWeight="bold">
              {isSymmetric ? '✓ Symmetrische Verteilung erkannt' : '⚠ Asymmetrische Verteilung'}
            </Typography>
            <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
              {isSymmetric
                ? 'Die Werte sind gleichmäßig um den Mittelwert verteilt - ein Zeichen für stabile Bedingungen.'
                : 'Die Verteilung ist nicht symmetrisch - überprüfen Sie auf Trends oder systematische Abweichungen.'}
            </Typography>
          </Box>
        );
      })()}
    </Paper>
  );
};
