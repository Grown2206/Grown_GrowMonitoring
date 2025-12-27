import React, { useState } from 'react';
import { Box, Card, CardContent, Grid, Stack, Typography, Switch, Button, List, ListItem, ListItemText, Chip } from '@mui/material';
import { Smartphone as PhoneIcon, Tablet as TabletIcon, Notifications as NotifIcon, CloudDownload as SyncIcon } from '@mui/icons-material';

export interface MobileConfig {
  pushNotifications: boolean;
  offlineMode: boolean;
  autoSync: boolean;
  dataSaver: boolean;
}

export function MobileApp() {
  const [config, setConfig] = useState<MobileConfig>({
    pushNotifications: true, offlineMode: true, autoSync: true, dataSaver: false,
  });

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Mobile App Settings</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>General Settings</Typography>
              <List>
                <ListItem><ListItemText primary="Push Notifications" /><Switch checked={config.pushNotifications} onChange={(e) => setConfig({...config, pushNotifications: e.target.checked})} /></ListItem>
                <ListItem><ListItemText primary="Offline Mode" /><Switch checked={config.offlineMode} onChange={(e) => setConfig({...config, offlineMode: e.target.checked})} /></ListItem>
                <ListItem><ListItemText primary="Auto Sync" /><Switch checked={config.autoSync} onChange={(e) => setConfig({...config, autoSync: e.target.checked})} /></ListItem>
                <ListItem><ListItemText primary="Data Saver" /><Switch checked={config.dataSaver} onChange={(e) => setConfig({...config, dataSaver: e.target.checked})} /></ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card><CardContent>
            <Typography variant="h6" gutterBottom>App Info</Typography>
            <Stack spacing={2}>
              <Box><Typography variant="body2" color="text.secondary">Version</Typography><Typography variant="h6">2.74.0</Typography></Box>
              <Box><Typography variant="body2" color="text.secondary">Platform</Typography><Chip label="iOS & Android" /></Box>
              <Button variant="contained" startIcon={<SyncIcon />}>Check for Updates</Button>
            </Stack>
          </CardContent></Card>
        </Grid>
      </Grid>
    </Box>
  );
}
