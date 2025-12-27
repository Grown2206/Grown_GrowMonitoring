import React, { useState } from 'react';
import {
  Box, Button, Card, CardContent, Chip, Grid, Stack, Typography,
  TextField, FormControl, InputLabel, Select, MenuItem, LinearProgress, Paper, List, ListItem, ListItemText,
} from '@mui/material';
import { PlayArrow as PlayIcon, Stop as StopIcon, Assessment as ResultsIcon } from '@mui/icons-material';

export interface LoadTest {
  id: string;
  name: string;
  targetUrl: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  users: number;
  duration: number;
  rampUp: number;
  status: 'idle' | 'running' | 'completed' | 'failed';
  results?: LoadTestResults;
}

export interface LoadTestResults {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  avgResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  throughput: number;
  errorRate: number;
}

export interface LoadTesterProps {
  tests?: LoadTest[];
  onRunTest?: (test: LoadTest) => void;
  onStopTest?: (id: string) => void;
}

export function LoadTester({ tests: initialTests, onRunTest, onStopTest }: LoadTesterProps) {
  const [tests, setTests] = useState<LoadTest[]>(initialTests || getSampleTests());
  const [formName, setFormName] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formMethod, setFormMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>('GET');
  const [formUsers, setFormUsers] = useState(10);
  const [formDuration, setFormDuration] = useState(60);
  const [formRampUp, setFormRampUp] = useState(10);

  const handleCreateTest = () => {
    const newTest: LoadTest = {
      id: `test-${Date.now()}`,
      name: formName,
      targetUrl: formUrl,
      method: formMethod,
      users: formUsers,
      duration: formDuration,
      rampUp: formRampUp,
      status: 'idle',
    };
    setTests([...tests, newTest]);
    setFormName('');
    setFormUrl('');
  };

  const handleRunTest = (test: LoadTest) => {
    const updated = tests.map(t => t.id === test.id ? { ...t, status: 'running' as const } : t);
    setTests(updated);
    onRunTest?.(test);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Load Tester</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Create Test</Typography>
              <Stack spacing={2}>
                <TextField label="Test Name" value={formName} onChange={(e) => setFormName(e.target.value)} fullWidth />
                <TextField label="Target URL" value={formUrl} onChange={(e) => setFormUrl(e.target.value)} fullWidth />
                <FormControl fullWidth>
                  <InputLabel>Method</InputLabel>
                  <Select value={formMethod} onChange={(e) => setFormMethod(e.target.value as any)}>
                    <MenuItem value="GET">GET</MenuItem>
                    <MenuItem value="POST">POST</MenuItem>
                    <MenuItem value="PUT">PUT</MenuItem>
                    <MenuItem value="DELETE">DELETE</MenuItem>
                  </Select>
                </FormControl>
                <TextField label="Concurrent Users" type="number" value={formUsers} onChange={(e) => setFormUsers(+e.target.value)} />
                <TextField label="Duration (seconds)" type="number" value={formDuration} onChange={(e) => setFormDuration(+e.target.value)} />
                <TextField label="Ramp-up (seconds)" type="number" value={formRampUp} onChange={(e) => setFormRampUp(+e.target.value)} />
                <Button variant="contained" onClick={handleCreateTest}>Create Test</Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Test Results</Typography>
              <List>
                {tests.map(test => (
                  <ListItem key={test.id}>
                    <ListItemText
                      primary={test.name}
                      secondary={
                        <Stack spacing={1}>
                          <Chip label={test.status} size="small" color={test.status === 'running' ? 'primary' : 'default'} />
                          {test.results && (
                            <Typography variant="caption">
                              Success: {test.results.successfulRequests}/{test.results.totalRequests} | 
                              Avg: {test.results.avgResponseTime}ms | 
                              Throughput: {test.results.throughput} req/s
                            </Typography>
                          )}
                        </Stack>
                      }
                    />
                    {test.status === 'idle' && <Button size="small" startIcon={<PlayIcon />} onClick={() => handleRunTest(test)}>Run</Button>}
                    {test.status === 'running' && <Button size="small" startIcon={<StopIcon />} onClick={() => onStopTest?.(test.id)}>Stop</Button>}
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

function getSampleTests(): LoadTest[] {
  return [
    {
      id: '1',
      name: 'API Stress Test',
      targetUrl: '/api/plants',
      method: 'GET',
      users: 100,
      duration: 300,
      rampUp: 30,
      status: 'completed',
      results: {
        totalRequests: 15000,
        successfulRequests: 14950,
        failedRequests: 50,
        avgResponseTime: 145,
        minResponseTime: 45,
        maxResponseTime: 850,
        throughput: 50,
        errorRate: 0.33,
      },
    },
  ];
}
