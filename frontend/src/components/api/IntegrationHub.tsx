import React from 'react';
import { Box, Card, CardContent, Typography, Grid, Button, Stack, Chip } from '@mui/material';
import { Cloud, Storage, Analytics, Email } from '@mui/icons-material';

const integrations = [
  { name: 'AWS S3', icon: <Cloud />, status: 'connected', description: 'Cloud storage for images' },
  { name: 'Google Analytics', icon: <Analytics />, status: 'connected', description: 'Usage analytics' },
  { name: 'SendGrid', icon: <Email />, status: 'not-connected', description: 'Email notifications' },
  { name: 'PostgreSQL', icon: <Storage />, status: 'connected', description: 'Primary database' },
];

export function IntegrationHub() {
  return (
    <Box>
      <Typography variant="h5" gutterBottom>Integration Hub</Typography>
      <Grid container spacing={2}>
        {integrations.map(i => (
          <Grid item xs={12} md={6} key={i.name}>
            <Card>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  {i.icon}
                  <Box sx={{flexGrow:1}}>
                    <Typography variant="h6">{i.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{i.description}</Typography>
                  </Box>
                  <Chip label={i.status} color={i.status === 'connected' ? 'success' : 'default'} />
                </Stack>
                <Button variant="outlined" sx={{mt:2}} fullWidth>{i.status === 'connected' ? 'Configure' : 'Connect'}</Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
