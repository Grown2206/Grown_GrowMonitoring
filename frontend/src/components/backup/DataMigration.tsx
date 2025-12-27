import React from 'react';
import { Box, Card, CardContent, Typography, Stepper, Step, StepLabel, Button, Stack } from '@mui/material';
import { MoveToInbox } from '@mui/icons-material';

export function DataMigration() {
  const steps = ['Prepare', 'Validate', 'Migrate', 'Verify'];
  
  return (
    <Box>
      <Typography variant="h5" gutterBottom>Data Migration</Typography>
      <Card>
        <CardContent>
          <Stepper activeStep={0} sx={{mb:3}}>
            {steps.map(s => <Step key={s}><StepLabel>{s}</StepLabel></Step>)}
          </Stepper>
          <Typography variant="body2" paragraph>Migration tool for upgrading database schema and importing legacy data.</Typography>
          <Button variant="contained" startIcon={<MoveToInbox />}>Start Migration</Button>
        </CardContent>
      </Card>
    </Box>
  );
}
