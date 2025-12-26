import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  PlayArrow as RunIcon,
  Stop as StopIcon,
  CheckCircle as PassIcon,
  Error as FailIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandIcon,
  Refresh as RefreshIcon,
  BugReport as BugIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Accessibility as A11yIcon,
  Code as CodeIcon,
} from '@mui/icons-material';

export type TestType = 'unit' | 'integration' | 'e2e' | 'performance' | 'security' | 'accessibility';
export type TestStatus = 'pending' | 'running' | 'passed' | 'failed' | 'skipped';

export interface TestSuite {
  id: string;
  name: string;
  type: TestType;
  status: TestStatus;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  duration?: number; // ms
  coverage?: number; // percentage
  tests: Test[];
}

export interface Test {
  id: string;
  name: string;
  status: TestStatus;
  duration?: number;
  error?: string;
  stack?: string;
}

export interface TestingDashboardProps {
  suites?: TestSuite[];
  onRunTests?: (suiteId?: string) => Promise<void>;
  onStopTests?: () => void;
}

/**
 * Testing dashboard with test execution and results
 */
export function TestingDashboard({
  suites: initialSuites = [],
  onRunTests,
  onStopTests,
}: TestingDashboardProps) {
  const [suites, setSuites] = useState<TestSuite[]>(
    initialSuites.length > 0 ? initialSuites : getSampleSuites()
  );
  const [running, setRunning] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [expandedSuite, setExpandedSuite] = useState<string | null>(null);

  const handleRunAll = async () => {
    setRunning(true);

    // Update all suites to running
    setSuites(suites.map(suite => ({ ...suite, status: 'running' as TestStatus })));

    try {
      if (onRunTests) {
        await onRunTests();
      }

      // Simulate test execution
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Update with results
      setSuites(suites.map(suite => ({
        ...suite,
        status: suite.failedTests > 0 ? 'failed' : 'passed',
      })));
    } finally {
      setRunning(false);
    }
  };

  const handleRunSuite = async (suiteId: string) => {
    const suiteIndex = suites.findIndex(s => s.id === suiteId);
    if (suiteIndex === -1) return;

    const updatedSuites = [...suites];
    updatedSuites[suiteIndex].status = 'running';
    setSuites(updatedSuites);

    try {
      if (onRunTests) {
        await onRunTests(suiteId);
      }

      await new Promise(resolve => setTimeout(resolve, 2000));

      updatedSuites[suiteIndex].status =
        updatedSuites[suiteIndex].failedTests > 0 ? 'failed' : 'passed';
      setSuites(updatedSuites);
    } catch (error) {
      updatedSuites[suiteIndex].status = 'failed';
      setSuites(updatedSuites);
    }
  };

  const getTotalStats = () => {
    return suites.reduce(
      (acc, suite) => ({
        total: acc.total + suite.totalTests,
        passed: acc.passed + suite.passedTests,
        failed: acc.failed + suite.failedTests,
        skipped: acc.skipped + suite.skippedTests,
      }),
      { total: 0, passed: 0, failed: 0, skipped: 0 }
    );
  };

  const getAverageCoverage = () => {
    const suitesWithCoverage = suites.filter(s => s.coverage !== undefined);
    if (suitesWithCoverage.length === 0) return 0;
    return suitesWithCoverage.reduce((sum, s) => sum + (s.coverage || 0), 0) / suitesWithCoverage.length;
  };

  const getStatusIcon = (status: TestStatus) => {
    switch (status) {
      case 'passed':
        return <PassIcon color="success" />;
      case 'failed':
        return <FailIcon color="error" />;
      case 'running':
        return <RefreshIcon color="info" />;
      default:
        return <WarningIcon />;
    }
  };

  const getTypeIcon = (type: TestType) => {
    switch (type) {
      case 'unit':
        return <CodeIcon />;
      case 'integration':
        return <BugIcon />;
      case 'performance':
        return <SpeedIcon />;
      case 'security':
        return <SecurityIcon />;
      case 'accessibility':
        return <A11yIcon />;
      default:
        return <CodeIcon />;
    }
  };

  const stats = getTotalStats();
  const coverage = getAverageCoverage();
  const passRate = stats.total > 0 ? (stats.passed / stats.total) * 100 : 0;

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5">Testing Dashboard</Typography>
          <Typography variant="body2" color="text.secondary">
            Run and monitor automated tests
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          {running && (
            <Button variant="outlined" color="error" startIcon={<StopIcon />} onClick={onStopTests}>
              Stop
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={<RunIcon />}
            onClick={handleRunAll}
            disabled={running}
          >
            Run All Tests
          </Button>
        </Stack>
      </Stack>

      {/* Overall Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack alignItems="center">
                <Typography variant="h3">{stats.total}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Tests
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'success.50' }}>
            <CardContent>
              <Stack alignItems="center">
                <Typography variant="h3" color="success.main">
                  {stats.passed}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Passed
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'error.50' }}>
            <CardContent>
              <Stack alignItems="center">
                <Typography variant="h3" color="error.main">
                  {stats.failed}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Failed
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack alignItems="center">
                <Typography variant="h3">{passRate.toFixed(1)}%</Typography>
                <Typography variant="caption" color="text.secondary">
                  Pass Rate
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={passRate}
                  color={passRate >= 80 ? 'success' : passRate >= 60 ? 'warning' : 'error'}
                  sx={{ width: '100%', mt: 1, height: 6, borderRadius: 1 }}
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Coverage & Performance */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Code Coverage
            </Typography>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box sx={{ flex: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={coverage}
                  color={coverage >= 80 ? 'success' : coverage >= 60 ? 'warning' : 'error'}
                  sx={{ height: 10, borderRadius: 1 }}
                />
              </Box>
              <Typography variant="h6">{coverage.toFixed(1)}%</Typography>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Test Suites Status
            </Typography>
            <Stack direction="row" spacing={2}>
              <Chip
                label={`${suites.filter(s => s.status === 'passed').length} Passed`}
                color="success"
                size="small"
              />
              <Chip
                label={`${suites.filter(s => s.status === 'failed').length} Failed`}
                color="error"
                size="small"
              />
              <Chip
                label={`${suites.filter(s => s.status === 'running').length} Running`}
                color="info"
                size="small"
              />
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
          <Tab label="All Suites" />
          <Tab label="Failed Tests" />
          <Tab label="Coverage" />
        </Tabs>
      </Box>

      {/* Test Suites */}
      {activeTab === 0 && (
        <Stack spacing={2}>
          {suites.map((suite) => (
            <Accordion
              key={suite.id}
              expanded={expandedSuite === suite.id}
              onChange={() => setExpandedSuite(expandedSuite === suite.id ? null : suite.id)}
            >
              <AccordionSummary expandIcon={<ExpandIcon />}>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%', pr: 2 }}>
                  {getTypeIcon(suite.type)}
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1">{suite.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {suite.type} • {suite.totalTests} tests • {suite.duration || 0}ms
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    {getStatusIcon(suite.status)}
                    <Chip
                      label={suite.status}
                      color={suite.status === 'passed' ? 'success' : suite.status === 'failed' ? 'error' : 'default'}
                      size="small"
                    />
                    {suite.coverage !== undefined && (
                      <Chip label={`${suite.coverage}% coverage`} size="small" variant="outlined" />
                    )}
                  </Stack>
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  {/* Suite Stats */}
                  <Grid container spacing={2}>
                    <Grid item xs={3}>
                      <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: 'success.50' }}>
                        <Typography variant="h6" color="success.main">
                          {suite.passedTests}
                        </Typography>
                        <Typography variant="caption">Passed</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={3}>
                      <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: 'error.50' }}>
                        <Typography variant="h6" color="error.main">
                          {suite.failedTests}
                        </Typography>
                        <Typography variant="caption">Failed</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={3}>
                      <Paper sx={{ p: 1.5, textAlign: 'center' }}>
                        <Typography variant="h6">{suite.skippedTests}</Typography>
                        <Typography variant="caption">Skipped</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={3}>
                      <Paper sx={{ p: 1.5, textAlign: 'center' }}>
                        <Typography variant="h6">{suite.duration || 0}ms</Typography>
                        <Typography variant="caption">Duration</Typography>
                      </Paper>
                    </Grid>
                  </Grid>

                  <Divider />

                  {/* Individual Tests */}
                  <List dense>
                    {suite.tests.map((test) => (
                      <ListItem key={test.id}>
                        <ListItemIcon>{getStatusIcon(test.status)}</ListItemIcon>
                        <ListItemText
                          primary={test.name}
                          secondary={
                            test.error ? (
                              <Typography variant="caption" color="error">
                                {test.error}
                              </Typography>
                            ) : test.duration ? (
                              `${test.duration}ms`
                            ) : null
                          }
                        />
                      </ListItem>
                    ))}
                  </List>

                  <Button
                    size="small"
                    startIcon={<RunIcon />}
                    onClick={() => handleRunSuite(suite.id)}
                    disabled={suite.status === 'running'}
                  >
                    Run Suite
                  </Button>
                </Stack>
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>
      )}

      {/* Failed Tests Tab */}
      {activeTab === 1 && (
        <Box>
          {stats.failed === 0 ? (
            <Alert severity="success">All tests passed! No failures to display.</Alert>
          ) : (
            <Stack spacing={2}>
              {suites
                .filter((suite) => suite.failedTests > 0)
                .map((suite) => (
                  <Card key={suite.id}>
                    <CardHeader
                      avatar={<FailIcon color="error" />}
                      title={suite.name}
                      subheader={`${suite.failedTests} failed test(s)`}
                    />
                    <CardContent>
                      <List dense>
                        {suite.tests
                          .filter((test) => test.status === 'failed')
                          .map((test) => (
                            <ListItem key={test.id}>
                              <ListItemText
                                primary={test.name}
                                secondary={
                                  <Stack spacing={0.5}>
                                    {test.error && (
                                      <Typography variant="caption" color="error">
                                        {test.error}
                                      </Typography>
                                    )}
                                    {test.stack && (
                                      <Typography
                                        variant="caption"
                                        component="pre"
                                        sx={{
                                          bgcolor: 'grey.100',
                                          p: 1,
                                          borderRadius: 1,
                                          overflow: 'auto',
                                        }}
                                      >
                                        {test.stack}
                                      </Typography>
                                    )}
                                  </Stack>
                                }
                              />
                            </ListItem>
                          ))}
                      </List>
                    </CardContent>
                  </Card>
                ))}
            </Stack>
          )}
        </Box>
      )}

      {/* Coverage Tab */}
      {activeTab === 2 && (
        <Grid container spacing={2}>
          {suites
            .filter((suite) => suite.coverage !== undefined)
            .map((suite) => (
              <Grid item xs={12} sm={6} md={4} key={suite.id}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      {suite.name}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box sx={{ flex: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={suite.coverage || 0}
                          color={
                            (suite.coverage || 0) >= 80
                              ? 'success'
                              : (suite.coverage || 0) >= 60
                              ? 'warning'
                              : 'error'
                          }
                          sx={{ height: 8, borderRadius: 1 }}
                        />
                      </Box>
                      <Typography variant="h6">{suite.coverage}%</Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
        </Grid>
      )}
    </Box>
  );
}

/**
 * Generate sample test suites
 */
function getSampleSuites(): TestSuite[] {
  return [
    {
      id: '1',
      name: 'Plant Management Tests',
      type: 'unit',
      status: 'passed',
      totalTests: 25,
      passedTests: 25,
      failedTests: 0,
      skippedTests: 0,
      duration: 1234,
      coverage: 92,
      tests: [
        { id: '1-1', name: 'should create new plant', status: 'passed', duration: 45 },
        { id: '1-2', name: 'should update plant details', status: 'passed', duration: 38 },
        { id: '1-3', name: 'should delete plant', status: 'passed', duration: 52 },
      ],
    },
    {
      id: '2',
      name: 'Sensor Data Integration',
      type: 'integration',
      status: 'failed',
      totalTests: 18,
      passedTests: 16,
      failedTests: 2,
      skippedTests: 0,
      duration: 2456,
      coverage: 85,
      tests: [
        { id: '2-1', name: 'should read sensor values', status: 'passed', duration: 120 },
        {
          id: '2-2',
          name: 'should handle sensor timeout',
          status: 'failed',
          duration: 5000,
          error: 'Timeout: Sensor did not respond within 5000ms',
          stack: 'at SensorReader.read (sensor.ts:45)\nat Test (sensor.test.ts:23)',
        },
        { id: '2-3', name: 'should validate sensor data', status: 'passed', duration: 85 },
      ],
    },
    {
      id: '3',
      name: 'API Performance Tests',
      type: 'performance',
      status: 'passed',
      totalTests: 12,
      passedTests: 12,
      failedTests: 0,
      skippedTests: 0,
      duration: 8920,
      tests: [
        { id: '3-1', name: 'GET /plants response time < 200ms', status: 'passed', duration: 145 },
        { id: '3-2', name: 'POST /plants response time < 500ms', status: 'passed', duration: 320 },
        { id: '3-3', name: 'Concurrent requests handling', status: 'passed', duration: 2100 },
      ],
    },
    {
      id: '4',
      name: 'Security Tests',
      type: 'security',
      status: 'passed',
      totalTests: 8,
      passedTests: 8,
      failedTests: 0,
      skippedTests: 0,
      duration: 3450,
      tests: [
        { id: '4-1', name: 'should prevent SQL injection', status: 'passed', duration: 234 },
        { id: '4-2', name: 'should sanitize user input', status: 'passed', duration: 156 },
        { id: '4-3', name: 'should validate authentication', status: 'passed', duration: 423 },
      ],
    },
  ];
}
