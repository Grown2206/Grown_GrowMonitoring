import React from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, Stack } from '@mui/material';
import { Save } from '@mui/icons-material';

export function SystemConfig() {
  return (
    <Box>
      <Typography variant="h5" gutterBottom>System Configuration</Typography>
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <TextField label="System Name" defaultValue="Grow Monitoring System" fullWidth />
            <TextField label="Max Upload Size" defaultValue="100 MB" fullWidth />
            <TextField label="Session Timeout" defaultValue="30 minutes" fullWidth />
            <TextField label="Email Server" defaultValue="smtp.example.com" fullWidth />
            <Button variant="contained" startIcon={<Save />}>Save Configuration</Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
