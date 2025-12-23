import React from 'react';
import { Box, Paper, Typography, Tooltip } from '@mui/material';
import { correlationMatrix } from '../../utils/statistics';

interface CorrelationMatrixProps {
  data: { [key: string]: number[] };
  title?: string;
}

export const CorrelationMatrix: React.FC<CorrelationMatrixProps> = ({ data, title = 'Korrelations-Matrix' }) => {
  const matrix = correlationMatrix(data);
  const variables = Object.keys(data);

  // Get color based on correlation value
  const getColor = (value: number): string => {
    // Normalize to 0-1 range (correlation is -1 to 1)
    const normalized = (value + 1) / 2;

    if (value > 0.7) return '#2e7d32'; // Strong positive - dark green
    if (value > 0.3) return '#66bb6a'; // Moderate positive - light green
    if (value > -0.3) return '#fff9c4'; // Weak/no correlation - yellow
    if (value > -0.7) return '#ff9800'; // Moderate negative - orange
    return '#d32f2f'; // Strong negative - red
  };

  const getTextColor = (value: number): string => {
    const absValue = Math.abs(value);
    return absValue > 0.5 ? '#ffffff' : '#000000';
  };

  if (variables.length === 0) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Typography color="text.secondary">Keine Daten verfügbar</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Korrelationskoeffizienten zwischen Sensor-Variablen (Pearson)
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `120px repeat(${variables.length}, 80px)`,
          gap: '2px',
          bgcolor: 'background.default',
          p: 1,
          borderRadius: 1,
          overflowX: 'auto',
        }}
      >
        {/* Top-left empty cell */}
        <Box />

        {/* Column headers */}
        {variables.map((variable) => (
          <Box
            key={`header-${variable}`}
            sx={{
              p: 1,
              textAlign: 'center',
              fontWeight: 'bold',
              fontSize: '0.75rem',
            }}
          >
            {variable}
          </Box>
        ))}

        {/* Matrix cells */}
        {variables.map((rowVar) => (
          <React.Fragment key={`row-${rowVar}`}>
            {/* Row header */}
            <Box
              sx={{
                p: 1,
                fontWeight: 'bold',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {rowVar}
            </Box>

            {/* Correlation values */}
            {variables.map((colVar) => {
              const value = matrix[rowVar][colVar];
              return (
                <Tooltip
                  key={`cell-${rowVar}-${colVar}`}
                  title={`${rowVar} vs ${colVar}: ${value.toFixed(3)}`}
                  arrow
                >
                  <Box
                    sx={{
                      p: 1,
                      textAlign: 'center',
                      bgcolor: getColor(value),
                      color: getTextColor(value),
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      '&:hover': {
                        transform: 'scale(1.1)',
                        zIndex: 1,
                      },
                    }}
                  >
                    {value.toFixed(2)}
                  </Box>
                </Tooltip>
              );
            })}
          </React.Fragment>
        ))}
      </Box>

      {/* Legend */}
      <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
          Legende:
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 20, height: 20, bgcolor: '#2e7d32', borderRadius: 0.5 }} />
          <Typography variant="caption">&gt; 0.7 (stark positiv)</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 20, height: 20, bgcolor: '#66bb6a', borderRadius: 0.5 }} />
          <Typography variant="caption">0.3 - 0.7 (positiv)</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 20, height: 20, bgcolor: '#fff9c4', borderRadius: 0.5 }} />
          <Typography variant="caption">-0.3 - 0.3 (schwach)</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 20, height: 20, bgcolor: '#ff9800', borderRadius: 0.5 }} />
          <Typography variant="caption">-0.7 - -0.3 (negativ)</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 20, height: 20, bgcolor: '#d32f2f', borderRadius: 0.5 }} />
          <Typography variant="caption">&lt; -0.7 (stark negativ)</Typography>
        </Box>
      </Box>
    </Paper>
  );
};
