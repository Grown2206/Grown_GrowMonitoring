import React from 'react';
import { Paper, Typography, Box, Tooltip as MuiTooltip } from '@mui/material';
import { mean } from '../../utils/statistics';

interface TimeHeatmapProps {
  data: { timestamp: string; value: number }[];
  title?: string;
  valueLabel?: string;
}

export const TimeHeatmap: React.FC<TimeHeatmapProps> = ({ data, title = 'Zeit-Heatmap', valueLabel = 'Wert' }) => {
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

  // Group data by day and hour
  const heatmapData: { [day: string]: { [hour: number]: number[] } } = {};

  data.forEach((point) => {
    const date = new Date(point.timestamp);
    const dayKey = date.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' });
    const hour = date.getHours();

    if (!heatmapData[dayKey]) {
      heatmapData[dayKey] = {};
    }
    if (!heatmapData[dayKey][hour]) {
      heatmapData[dayKey][hour] = [];
    }

    heatmapData[dayKey][hour].push(point.value);
  });

  // Calculate averages for each hour of each day
  const days = Object.keys(heatmapData).slice(-14); // Last 14 days max
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Find min and max values for color scaling
  const allValues = Object.values(heatmapData)
    .flatMap((day) => Object.values(day))
    .flatMap((hour) => hour);

  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  const valueRange = maxValue - minValue;

  // Get color based on value
  const getColor = (values: number[] | undefined): string => {
    if (!values || values.length === 0) return '#f5f5f5';

    const avg = mean(values);
    const normalized = valueRange > 0 ? (avg - minValue) / valueRange : 0.5;

    // Color gradient from blue (cold/low) to red (hot/high)
    if (normalized < 0.2) return '#2196f3'; // Blue
    if (normalized < 0.4) return '#4caf50'; // Green
    if (normalized < 0.6) return '#ffeb3b'; // Yellow
    if (normalized < 0.8) return '#ff9800'; // Orange
    return '#f44336'; // Red
  };

  const getTextColor = (values: number[] | undefined): string => {
    if (!values || values.length === 0) return '#9e9e9e';

    const avg = mean(values);
    const normalized = valueRange > 0 ? (avg - minValue) / valueRange : 0.5;

    return normalized > 0.5 ? '#ffffff' : '#000000';
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Durchschnittliche {valueLabel} pro Stunde und Tag (letzte {days.length} Tage)
      </Typography>

      <Box sx={{ overflowX: 'auto' }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: `100px repeat(${hours.length}, 35px)`,
            gap: '2px',
            bgcolor: 'background.default',
            p: 1,
            borderRadius: 1,
            minWidth: 900,
          }}
        >
          {/* Top-left empty cell */}
          <Box />

          {/* Hour headers */}
          {hours.map((hour) => (
            <Box
              key={`hour-${hour}`}
              sx={{
                p: 0.5,
                textAlign: 'center',
                fontSize: '0.65rem',
                fontWeight: hour % 6 === 0 ? 'bold' : 'normal',
              }}
            >
              {hour}h
            </Box>
          ))}

          {/* Heatmap cells */}
          {days.map((day) => (
            <React.Fragment key={day}>
              {/* Day label */}
              <Box
                sx={{
                  p: 1,
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {day}
              </Box>

              {/* Hour cells for this day */}
              {hours.map((hour) => {
                const values = heatmapData[day]?.[hour];
                const avg = values ? mean(values) : null;

                return (
                  <MuiTooltip
                    key={`${day}-${hour}`}
                    title={
                      avg !== null
                        ? `${day} ${hour}:00-${hour + 1}:00\n${valueLabel}: ${avg.toFixed(2)}\n(${values!.length} Messungen)`
                        : `Keine Daten`
                    }
                    arrow
                  >
                    <Box
                      sx={{
                        aspectRatio: '1/1',
                        bgcolor: getColor(values),
                        color: getTextColor(values),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.6rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        borderRadius: 0.5,
                        '&:hover': {
                          transform: 'scale(1.2)',
                          zIndex: 1,
                        },
                      }}
                    >
                      {avg !== null ? avg.toFixed(0) : '-'}
                    </Box>
                  </MuiTooltip>
                );
              })}
            </React.Fragment>
          ))}
        </Box>
      </Box>

      {/* Color legend */}
      <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
          Wertebereich:
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 30, height: 20, bgcolor: '#2196f3', borderRadius: 0.5 }} />
          <Typography variant="caption">{minValue.toFixed(1)}</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 30, height: 20, bgcolor: '#4caf50', borderRadius: 0.5 }} />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 30, height: 20, bgcolor: '#ffeb3b', borderRadius: 0.5 }} />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 30, height: 20, bgcolor: '#ff9800', borderRadius: 0.5 }} />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 30, height: 20, bgcolor: '#f44336', borderRadius: 0.5 }} />
          <Typography variant="caption">{maxValue.toFixed(1)}</Typography>
        </Box>
      </Box>

      {/* Interpretation help */}
      <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
        <Typography variant="caption" display="block" gutterBottom fontWeight="bold">
          💡 Mustererkennun:
        </Typography>
        <Typography variant="caption" display="block" color="text.secondary">
          • <strong>Vertikale Muster:</strong> Tägliche Zyklen (z.B. Tag/Nacht)
        </Typography>
        <Typography variant="caption" display="block" color="text.secondary">
          • <strong>Horizontale Muster:</strong> Wöchentliche Trends oder Wartungszyklen
        </Typography>
        <Typography variant="caption" display="block" color="text.secondary">
          • <strong>Heiße Zonen (rot):</strong> Hohe Werte - überprüfen Sie auf Überlastung
        </Typography>
        <Typography variant="caption" display="block" color="text.secondary">
          • <strong>Kalte Zonen (blau):</strong> Niedrige Werte - eventuell Unterversorgung
        </Typography>
      </Box>
    </Paper>
  );
};
