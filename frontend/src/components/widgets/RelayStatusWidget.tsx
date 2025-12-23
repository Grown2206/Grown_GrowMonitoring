import React from 'react';
import { Box, Typography, Grid, Chip } from '@mui/material';
import { Relay } from '../../types';
import PowerIcon from '@mui/icons-material/Power';
import PowerOffIcon from '@mui/icons-material/PowerOff';

interface RelayStatusWidgetProps {
  relays: Relay[];
}

export function RelayStatusWidget({ relays }: RelayStatusWidgetProps) {
  return (
    <Box height="100%" overflow="auto">
      {relays.length === 0 ? (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          height="100%"
        >
          <Typography color="text.secondary">Keine Geräte verfügbar</Typography>
        </Box>
      ) : (
        <Grid container spacing={1.5}>
          {relays.map((relay) => (
            <Grid item xs={6} key={relay.id}>
              <Box
                sx={{
                  p: 1.5,
                  border: 1,
                  borderColor: relay.status ? 'success.main' : 'grey.300',
                  borderRadius: 1,
                  bgcolor: relay.status ? 'success.light' : 'grey.50',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                {relay.status ? (
                  <PowerIcon sx={{ color: 'success.dark', fontSize: 28 }} />
                ) : (
                  <PowerOffIcon sx={{ color: 'grey.500', fontSize: 28 }} />
                )}
                <Typography
                  variant="body2"
                  color="text.secondary"
                  align="center"
                  sx={{ fontSize: '0.75rem' }}
                >
                  {relay.name}
                </Typography>
                <Chip
                  label={relay.status ? 'EIN' : 'AUS'}
                  size="small"
                  color={relay.status ? 'success' : 'default'}
                  sx={{ fontSize: '0.7rem', height: 20 }}
                />
              </Box>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
