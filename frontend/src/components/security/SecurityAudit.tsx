import React from 'react';
import { Box, Card, CardContent, Typography, List, ListItem, ListItemText, Chip } from '@mui/material';
import { Security } from '@mui/icons-material';

export function SecurityAudit() {
  const events = [
    { id: '1', type: 'login', user: 'admin@example.com', ip: '192.168.1.1', time: new Date() },
    { id: '2', type: 'failed_login', user: 'user@example.com', ip: '10.0.0.5', time: new Date(Date.now() - 3600000) },
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Security Audit Log</Typography>
      <Card>
        <CardContent>
          <List>
            {events.map(e => (
              <ListItem key={e.id}>
                <ListItemText 
                  primary={`${e.type} - ${e.user}`}
                  secondary={`${e.ip} - ${e.time.toLocaleString()}`}
                />
                <Chip label={e.type} color={e.type.includes('failed') ? 'error' : 'success'} size="small" />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
}
