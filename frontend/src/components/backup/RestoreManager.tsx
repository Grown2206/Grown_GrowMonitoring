import React from 'react';
import { Box, Card, CardContent, Typography, List, ListItem, ListItemText, Button, Stack } from '@mui/material';
import { Restore } from '@mui/icons-material';

export function RestoreManager() {
  const backups = [
    { id: '1', name: 'Backup 2024-12-27', date: new Date(), size: '2.4 GB' },
    { id: '2', name: 'Backup 2024-12-26', date: new Date(Date.now() - 86400000), size: '2.3 GB' },
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Restore Manager</Typography>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Available Backups</Typography>
          <List>
            {backups.map(b => (
              <ListItem key={b.id} secondaryAction={<Button size="small" startIcon={<Restore />}>Restore</Button>}>
                <ListItemText primary={b.name} secondary={`${b.size} - ${b.date.toLocaleDateString()}`} />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
}
