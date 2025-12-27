import React from 'react';
import { Box, Card, CardContent, Typography, Button, Stack, Alert } from '@mui/material';
import { Lock, Key } from '@mui/icons-material';

export function EncryptionManager() {
  return (
    <Box>
      <Typography variant="h5" gutterBottom>Encryption Manager</Typography>
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Alert severity="success" icon={<Lock />}>All data is encrypted at rest using AES-256</Alert>
            <Alert severity="info" icon={<Key />}>TLS 1.3 enabled for data in transit</Alert>
            <Button variant="contained" startIcon={<Key />}>Rotate Encryption Keys</Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
