import React from 'react';
import { Box, Card, CardContent, Typography, LinearProgress, Stack, Chip } from '@mui/material';
import { Memory, TrendingUp } from '@mui/icons-material';

export function MachineLearning() {
  const models = [
    { name: 'Yield Prediction Model', accuracy: 92, status: 'active' },
    { name: 'Disease Detection', accuracy: 87, status: 'active' },
    { name: 'Growth Optimization', accuracy: 79, status: 'training' },
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Machine Learning Models</Typography>
      <Stack spacing={2}>
        {models.map(m => (
          <Card key={m.name}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{mb:1}}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Memory />
                  <Typography variant="h6">{m.name}</Typography>
                </Stack>
                <Chip label={m.status} color={m.status === 'active' ? 'success' : 'warning'} />
              </Stack>
              <Typography variant="body2" color="text.secondary" gutterBottom>Accuracy: {m.accuracy}%</Typography>
              <LinearProgress variant="determinate" value={m.accuracy} color={m.accuracy > 85 ? 'success' : 'warning'} />
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
