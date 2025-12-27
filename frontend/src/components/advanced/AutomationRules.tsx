import React from 'react';
import { Box, Card, CardContent, Typography, List, ListItem, ListItemText, Switch, Stack } from '@mui/material';
import { SmartToy } from '@mui/icons-material';

export function AutomationRules() {
  const rules = [
    { name: 'Auto-adjust temperature', enabled: true, description: 'Maintain 24°C ± 2°C' },
    { name: 'Auto-watering schedule', enabled: true, description: 'Water when soil moisture < 40%' },
    { name: 'Light cycle automation', enabled: true, description: '18/6 vegetative schedule' },
    { name: 'Nutrient dosing', enabled: false, description: 'Auto-calculate and dispense' },
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Automation Rules</Typography>
      <Card>
        <CardContent>
          <List>
            {rules.map(r => (
              <ListItem key={r.name}>
                <SmartToy sx={{mr:2}} />
                <ListItemText primary={r.name} secondary={r.description} />
                <Switch checked={r.enabled} />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
}
