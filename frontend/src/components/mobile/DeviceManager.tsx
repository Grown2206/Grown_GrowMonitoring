import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, List, ListItem, ListItemText, Chip, IconButton, Stack } from '@mui/material';
import { Smartphone, Tablet, Computer, Delete as DeleteIcon } from '@mui/icons-material';

interface Device {
  id: string;
  name: string;
  type: 'phone' | 'tablet' | 'desktop';
  lastSeen: Date;
  active: boolean;
}

export function DeviceManager() {
  const [devices] = useState<Device[]>([
    { id: '1', name: 'iPhone 14 Pro', type: 'phone', lastSeen: new Date(), active: true },
    { id: '2', name: 'iPad Air', type: 'tablet', lastSeen: new Date(Date.now() - 86400000), active: false },
  ]);

  const getIcon = (type: string) => {
    if (type === 'phone') return <Smartphone />;
    if (type === 'tablet') return <Tablet />;
    return <Computer />;
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Connected Devices</Typography>
      <Card>
        <CardContent>
          <List>
            {devices.map(d => (
              <ListItem key={d.id} secondaryAction={<IconButton edge="end"><DeleteIcon /></IconButton>}>
                {getIcon(d.type)}
                <ListItemText primary={d.name} secondary={<Stack direction="row" spacing={1}><Chip label={d.active ? 'Active' : 'Inactive'} size="small" color={d.active ? 'success' : 'default'} /><Typography variant="caption">Last seen: {d.lastSeen.toLocaleString()}</Typography></Stack>} sx={{ ml: 2 }} />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
}
