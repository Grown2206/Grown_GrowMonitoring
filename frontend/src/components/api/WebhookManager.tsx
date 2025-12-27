import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, List, ListItem, ListItemText, Button, Stack, Chip, IconButton } from '@mui/material';
import { Webhook as WebhookIcon, Add as AddIcon, Delete as DeleteIcon, CheckCircle } from '@mui/icons-material';

interface Webhook { id: string; url: string; events: string[]; status: 'active' | 'inactive'; deliveries: number; }

export function WebhookManager() {
  const [webhooks] = useState<Webhook[]>([
    { id: '1', url: 'https://example.com/webhook', events: ['plant.created', 'sensor.alert'], status: 'active', deliveries: 245 },
  ]);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Webhook Manager</Typography>
      <Card>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" sx={{mb:2}}>
            <Typography variant="h6">Configured Webhooks</Typography>
            <Button variant="contained" startIcon={<AddIcon />}>Add Webhook</Button>
          </Stack>
          <List>
            {webhooks.map(w => (
              <ListItem key={w.id} secondaryAction={<IconButton><DeleteIcon /></IconButton>}>
                <WebhookIcon sx={{mr:2}} />
                <ListItemText 
                  primary={w.url}
                  secondary={<Stack direction="row" spacing={1} sx={{mt:1}}>{w.events.map(e => <Chip key={e} label={e} size="small" />)}<Chip label={`${w.deliveries} deliveries`} size="small" variant="outlined" /></Stack>}
                />
                <Chip label={w.status} color={w.status === 'active' ? 'success' : 'default'} size="small" icon={<CheckCircle />} />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
}
