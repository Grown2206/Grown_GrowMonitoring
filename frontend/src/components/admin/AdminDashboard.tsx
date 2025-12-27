import React from 'react';
import { Box, Card, CardContent, Typography, Grid, Stack } from '@mui/material';
import { People, Settings, Security, Assessment } from '@mui/icons-material';

export function AdminDashboard() {
  const stats = [
    { label: 'Total Users', value: '1,234', icon: <People color="primary" sx={{fontSize:40}} /> },
    { label: 'System Health', value: '98%', icon: <Assessment color="success" sx={{fontSize:40}} /> },
    { label: 'Active Sessions', value: '45', icon: <Security color="info" sx={{fontSize:40}} /> },
    { label: 'Configurations', value: '12', icon: <Settings color="warning" sx={{fontSize:40}} /> },
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Admin Dashboard</Typography>
      <Grid container spacing={3}>
        {stats.map(s => (
          <Grid item xs={12} md={3} key={s.label}>
            <Card>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" color="text.secondary">{s.label}</Typography>
                    <Typography variant="h4">{s.value}</Typography>
                  </Box>
                  {s.icon}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
