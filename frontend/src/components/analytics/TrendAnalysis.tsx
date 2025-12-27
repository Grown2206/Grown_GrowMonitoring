import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function TrendAnalysis() {
  const data = [
    { month: 'Jul', yield: 2.2, quality: 7.5 },
    { month: 'Aug', yield: 2.4, quality: 7.8 },
    { month: 'Sep', yield: 2.6, quality: 8.1 },
    { month: 'Oct', yield: 2.7, quality: 8.3 },
    { month: 'Nov', yield: 2.8, quality: 8.5 },
    { month: 'Dec', yield: 2.9, quality: 8.7 },
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Trend Analysis</Typography>
      <Card>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="yield" stroke="#8884d8" name="Yield (kg)" />
              <Line type="monotone" dataKey="quality" stroke="#82ca9d" name="Quality Score" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
