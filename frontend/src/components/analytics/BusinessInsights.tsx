import React from 'react';
import { Box, Card, CardContent, Typography, Grid, Stack, Chip } from '@mui/material';
import { TrendingUp, TrendingDown, ShowChart } from '@mui/icons-material';

export function BusinessInsights() {
  const insights = [
    { title: 'Growth Rate', value: '+15.3%', trend: 'up', description: 'Month over month' },
    { title: 'Yield Prediction', value: '2.8kg', trend: 'up', description: 'Per plant avg' },
    { title: 'Cost Reduction', value: '-8.2%', trend: 'down', description: 'Operating costs' },
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Business Insights</Typography>
      <Grid container spacing={2}>
        {insights.map(i => (
          <Grid item xs={12} md={4} key={i.title}>
            <Card>
              <CardContent>
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">{i.title}</Typography>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="h4">{i.value}</Typography>
                    {i.trend === 'up' ? <TrendingUp color="success" /> : <TrendingDown color="error" />}
                  </Stack>
                  <Typography variant="caption">{i.description}</Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
