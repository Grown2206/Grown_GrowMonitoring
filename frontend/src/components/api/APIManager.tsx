import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, List, ListItem, ListItemText, Chip, Button, TextField, Stack, Grid } from '@mui/material';
import { Api as ApiIcon, Key as KeyIcon, Check as CheckIcon } from '@mui/icons-material';

interface APIKey { id: string; name: string; key: string; created: Date; lastUsed?: Date; requests: number; }

export function APIManager() {
  const [keys] = useState<APIKey[]>([
    { id: '1', name: 'Production API', key: 'pk_live_***', created: new Date('2024-01-01'), lastUsed: new Date(), requests: 15420 },
    { id: '2', name: 'Development API', key: 'pk_test_***', created: new Date('2024-06-01'), requests: 892 },
  ]);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>API Manager</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{mb:2}}>
                <Typography variant="h6">API Keys</Typography>
                <Button variant="contained" startIcon={<KeyIcon />}>Generate Key</Button>
              </Stack>
              <List>
                {keys.map(k => (
                  <ListItem key={k.id}>
                    <ListItemText 
                      primary={k.name} 
                      secondary={<Stack spacing={0.5}><Typography variant="caption">{k.key}</Typography><Typography variant="caption">{k.requests} requests</Typography></Stack>} 
                    />
                    <Chip label="Active" size="small" color="success" icon={<CheckIcon />} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>API Documentation</Typography>
              <Typography variant="body2" paragraph>Base URL: https://api.growmonitoring.com/v2</Typography>
              <Typography variant="body2" paragraph>Authentication: Bearer Token</Typography>
              <Button variant="outlined">View Full Docs</Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
