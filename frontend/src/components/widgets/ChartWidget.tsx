import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Box, Typography } from '@mui/material';

interface ChartWidgetProps {
  data: any[];
  lines: Array<{
    dataKey: string;
    color: string;
    name: string;
  }>;
  xAxisKey?: string;
  height?: number;
}

export const ChartWidget = React.memo(function ChartWidget({ data, lines, xAxisKey = 'time', height = 250 }: ChartWidgetProps) {
  return (
    <Box height="100%" display="flex" flexDirection="column">
      {data.length === 0 ? (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          height="100%"
        >
          <Typography color="text.secondary">Keine Daten verfügbar</Typography>
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey={xAxisKey}
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {lines.map((line) => (
              <Line
                key={line.dataKey}
                type="monotone"
                dataKey={line.dataKey}
                stroke={line.color}
                name={line.name}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </Box>
  );
});
