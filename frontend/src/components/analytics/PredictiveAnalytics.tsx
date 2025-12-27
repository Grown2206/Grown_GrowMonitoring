import React from 'react';
import { Box, Card, CardContent, Typography, List, ListItem, ListItemText, Chip } from '@mui/material';
import { TrendingUp } from '@mui/icons-material';

export function PredictiveAnalytics() {
  const predictions = [
    { metric: 'Harvest Date', prediction: 'Jan 15, 2025', confidence: 92 },
    { metric: 'Final Yield', prediction: '2.8kg per plant', confidence: 87 },
    { metric: 'Quality Score', prediction: '8.5/10', confidence: 79 },
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Predictive Analytics</Typography>
      <Card>
        <CardContent>
          <List>
            {predictions.map(p => (
              <ListItem key={p.metric}>
                <ListItemText 
                  primary={p.metric}
                  secondary={p.prediction}
                />
                <Chip label={`${p.confidence}% confidence`} color={p.confidence > 85 ? 'success' : 'warning'} />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
}
