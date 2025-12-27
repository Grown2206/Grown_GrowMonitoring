import React from 'react';
import { Box, Card, CardContent, Typography, List, ListItem, ListItemText, Chip, Button, Stack } from '@mui/material';
import { Psychology, AutoAwesome } from '@mui/icons-material';

export function AIAssistant() {
  const suggestions = [
    { text: 'Consider increasing humidity by 5% for optimal growth', priority: 'high' },
    { text: 'Nutrient schedule adjustment recommended', priority: 'medium' },
    { text: 'Harvest window opening in 7 days', priority: 'low' },
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>AI Assistant</Typography>
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Psychology color="primary" />
              <Typography variant="h6">Smart Recommendations</Typography>
            </Stack>
            <List>
              {suggestions.map((s, i) => (
                <ListItem key={i}>
                  <ListItemText primary={s.text} />
                  <Chip label={s.priority} color={s.priority === 'high' ? 'error' : s.priority === 'medium' ? 'warning' : 'default'} size="small" />
                </ListItem>
              ))}
            </List>
            <Button variant="contained" startIcon={<AutoAwesome />}>Get More Insights</Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
