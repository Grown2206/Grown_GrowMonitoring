import React from 'react';
import { Box, Card, CardContent, Typography, List, ListItem, ListItemText, Chip, LinearProgress } from '@mui/material';

export function SystemMonitor() {
  return (
    <Box>
      <Typography variant="h5" gutterBottom>System Monitor</Typography>
      <Card>
        <CardContent>
          <List>
            <ListItem>
              <ListItemText primary="CPU Usage" secondary={<LinearProgress variant="determinate" value={45} />} />
              <Chip label="45%" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Memory" secondary={<LinearProgress variant="determinate" value={62} />} />
              <Chip label="62%" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Disk" secondary={<LinearProgress variant="determinate" value={78} />} />
              <Chip label="78%" color="warning" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Network" secondary={<LinearProgress variant="determinate" value={25} />} />
              <Chip label="25%" color="success" />
            </ListItem>
          </List>
        </CardContent>
      </Card>
    </Box>
  );
}
