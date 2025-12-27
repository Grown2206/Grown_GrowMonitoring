import React from 'react';
import { Box, Card, CardContent, Typography, List, ListItem, ListItemText, Chip, Button } from '@mui/material';
import { AccountBalance, Verified } from '@mui/icons-material';

export function BlockchainTraceability() {
  const records = [
    { id: 'BLOCK-001', batch: 'Batch A-2024', verified: true, timestamp: new Date() },
    { id: 'BLOCK-002', batch: 'Batch B-2024', verified: true, timestamp: new Date(Date.now() - 86400000) },
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Blockchain Traceability</Typography>
      <Card>
        <CardContent>
          <Typography variant="body2" paragraph>Immutable record of cultivation history</Typography>
          <List>
            {records.map(r => (
              <ListItem key={r.id}>
                <AccountBalance sx={{mr:2}} />
                <ListItemText 
                  primary={r.batch}
                  secondary={`${r.id} - ${r.timestamp.toLocaleString()}`}
                />
                {r.verified && <Chip icon={<Verified />} label="Verified" color="success" />}
              </ListItem>
            ))}
          </List>
          <Button variant="outlined" fullWidth>View on Blockchain</Button>
        </CardContent>
      </Card>
    </Box>
  );
}
