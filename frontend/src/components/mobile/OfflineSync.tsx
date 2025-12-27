import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, Button, LinearProgress, List, ListItem, ListItemText, Chip, Stack } from '@mui/material';
import { CloudSync, CloudDone, CloudOff } from '@mui/icons-material';

interface SyncStatus {
  pending: number;
  synced: number;
  failed: number;
  lastSync: Date;
}

export function OfflineSync() {
  const [status] = useState<SyncStatus>({
    pending: 5, synced: 120, failed: 2, lastSync: new Date(),
  });
  const [syncing, setSyncing] = useState(false);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Offline Sync</Typography>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="h6">Sync Status</Typography>
              <Button variant="contained" startIcon={<CloudSync />} onClick={() => setSyncing(true)} disabled={syncing}>Sync Now</Button>
            </Stack>
            {syncing && <LinearProgress />}
            <Stack direction="row" spacing={2}>
              <Chip icon={<CloudDone />} label={`${status.synced} synced`} color="success" />
              <Chip icon={<CloudSync />} label={`${status.pending} pending`} color="warning" />
              <Chip icon={<CloudOff />} label={`${status.failed} failed`} color="error" />
            </Stack>
            <Typography variant="caption" color="text.secondary">Last sync: {status.lastSync.toLocaleString()}</Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
