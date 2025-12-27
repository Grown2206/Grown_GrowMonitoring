import React from 'react';
import { Box, Card, CardContent, Typography, List, ListItem, ListItemText, Chip, Stack, Switch } from '@mui/material';
import { Security, VpnKey, Shield } from '@mui/icons-material';

export function SecuritySettings() {
  return (
    <Box>
      <Typography variant="h5" gutterBottom>Security Settings</Typography>
      <Card>
        <CardContent>
          <List>
            <ListItem><ListItemText primary="Two-Factor Authentication" secondary="Extra layer of security" /><Switch defaultChecked /></ListItem>
            <ListItem><ListItemText primary="Session Timeout" secondary="Auto logout after 30 minutes" /><Switch defaultChecked /></ListItem>
            <ListItem><ListItemText primary="IP Whitelist" secondary="Restrict access by IP" /><Switch /></ListItem>
            <ListItem><ListItemText primary="Audit Logging" secondary="Track all security events" /><Switch defaultChecked /></ListItem>
          </List>
        </CardContent>
      </Card>
    </Box>
  );
}
