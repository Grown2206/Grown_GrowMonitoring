import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, Button, List, ListItem, ListItemText, Chip, Stack, LinearProgress } from '@mui/material';
import { Backup, CloudDownload, Schedule } from '@mui/icons-material';

interface BackupJob { id: string; name: string; status: 'running' | 'completed' | 'failed'; size: string; date: Date; }

export function BackupManager() {
  const [jobs] = useState<BackupJob[]>([
    { id: '1', name: 'Full Backup', status: 'completed', size: '2.4 GB', date: new Date() },
    { id: '2', name: 'Incremental', status: 'running', size: '450 MB', date: new Date() },
  ]);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Backup Manager</Typography>
      <Card>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" sx={{mb:2}}>
            <Typography variant="h6">Backup Jobs</Typography>
            <Button variant="contained" startIcon={<Backup />}>Start Backup</Button>
          </Stack>
          <List>
            {jobs.map(j => (
              <ListItem key={j.id}>
                <ListItemText primary={j.name} secondary={`${j.size} - ${j.date.toLocaleString()}`} />
                <Chip label={j.status} color={j.status === 'completed' ? 'success' : j.status === 'running' ? 'warning' : 'error'} />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
}
