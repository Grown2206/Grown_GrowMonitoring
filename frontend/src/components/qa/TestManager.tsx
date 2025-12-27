import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as RunIcon,
  CheckCircle as PassIcon,
  Cancel as FailIcon,
  RemoveCircle as BlockedIcon,
  ExpandMore as ExpandMoreIcon,
  Assignment as TestIcon,
  BugReport as BugIcon,
} from '@mui/icons-material';

export interface TestCase {
  id: string;
  title: string;
  description: string;
  category: TestCategory;
  priority: TestPriority;
  status: TestStatus;
  steps: TestStep[];
  expectedResult: string;
  actualResult?: string;
  assignedTo?: string;
  createdAt: Date;
  lastRun?: Date;
  executionTime?: number;
  notes?: string;
}

export interface TestStep {
  id: string;
  stepNumber: number;
  action: string;
  expectedBehavior: string;
}

export type TestCategory =
  | 'functional'
  | 'integration'
  | 'performance'
  | 'security'
  | 'usability'
  | 'regression';

export type TestPriority = 'low' | 'medium' | 'high' | 'critical';

export type TestStatus = 'not-run' | 'passed' | 'failed' | 'blocked' | 'in-progress';

export interface TestManagerProps {
  testCases?: TestCase[];
  onAddTest?: (test: Omit<TestCase, 'id'>) => void;
  onUpdateTest?: (id: string, test: Partial<TestCase>) => void;
  onDeleteTest?: (id: string) => void;
  onRunTest?: (id: string) => void;
}

export function TestManager({
  testCases: initialTests,
  onAddTest,
  onUpdateTest,
  onDeleteTest,
  onRunTest,
}: TestManagerProps) {
  const [testCases, setTestCases] = useState<TestCase[]>(initialTests || getSampleTests());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<TestCase | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [categoryFilter, setCategoryFilter] = useState<TestCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<TestStatus | 'all'>('all');

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState<TestCategory>('functional');
  const [formPriority, setFormPriority] = useState<TestPriority>('medium');
  const [formSteps, setFormSteps] = useState<TestStep[]>([]);
  const [formExpectedResult, setFormExpectedResult] = useState('');
  const [formAssignedTo, setFormAssignedTo] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Step form state
  const [stepAction, setStepAction] = useState('');
  const [stepExpected, setStepExpected] = useState('');

  const handleOpenDialog = (test?: TestCase) => {
    if (test) {
      setEditingTest(test);
      setFormTitle(test.title);
      setFormDescription(test.description);
      setFormCategory(test.category);
      setFormPriority(test.priority);
      setFormSteps([...test.steps]);
      setFormExpectedResult(test.expectedResult);
      setFormAssignedTo(test.assignedTo || '');
      setFormNotes(test.notes || '');
    } else {
      setEditingTest(null);
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTest(null);
    resetForm();
  };

  const resetForm = () => {
    setFormTitle('');
    setFormDescription('');
    setFormCategory('functional');
    setFormPriority('medium');
    setFormSteps([]);
    setFormExpectedResult('');
    setFormAssignedTo('');
    setFormNotes('');
  };

  const handleAddStep = () => {
    if (!stepAction || !stepExpected) return;

    const newStep: TestStep = {
      id: `step-${Date.now()}`,
      stepNumber: formSteps.length + 1,
      action: stepAction,
      expectedBehavior: stepExpected,
    };

    setFormSteps([...formSteps, newStep]);
    setStepAction('');
    setStepExpected('');
  };

  const handleRemoveStep = (stepId: string) => {
    setFormSteps(formSteps.filter((step) => step.id !== stepId));
  };

  const handleSaveTest = () => {
    const testData = {
      title: formTitle,
      description: formDescription,
      category: formCategory,
      priority: formPriority,
      status: 'not-run' as TestStatus,
      steps: formSteps,
      expectedResult: formExpectedResult,
      assignedTo: formAssignedTo,
      createdAt: new Date(),
      notes: formNotes,
    };

    if (editingTest) {
      const updated = testCases.map((test) =>
        test.id === editingTest.id ? { ...test, ...testData } : test
      );
      setTestCases(updated);
      onUpdateTest?.(editingTest.id, testData);
    } else {
      const newTest: TestCase = {
        id: `test-${Date.now()}`,
        ...testData,
      };
      setTestCases([...testCases, newTest]);
      onAddTest?.(testData);
    }

    handleCloseDialog();
  };

  const handleDeleteTest = (id: string) => {
    setTestCases(testCases.filter((test) => test.id !== id));
    onDeleteTest?.(id);
  };

  const handleRunTest = (id: string) => {
    onRunTest?.(id);
  };

  const getStatusColor = (status: TestStatus) => {
    switch (status) {
      case 'passed':
        return 'success';
      case 'failed':
        return 'error';
      case 'blocked':
        return 'warning';
      case 'in-progress':
        return 'info';
      case 'not-run':
        return 'default';
    }
  };

  const getStatusIcon = (status: TestStatus) => {
    switch (status) {
      case 'passed':
        return <PassIcon />;
      case 'failed':
        return <FailIcon />;
      case 'blocked':
        return <BlockedIcon />;
      case 'in-progress':
        return <RunIcon />;
      case 'not-run':
        return <TestIcon />;
    }
  };

  const getPriorityColor = (priority: TestPriority) => {
    switch (priority) {
      case 'low':
        return 'default';
      case 'medium':
        return 'info';
      case 'high':
        return 'warning';
      case 'critical':
        return 'error';
    }
  };

  const filteredTests = testCases.filter((test) => {
    const matchesCategory = categoryFilter === 'all' || test.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || test.status === statusFilter;
    return matchesCategory && matchesStatus;
  });

  const passedTests = testCases.filter((t) => t.status === 'passed').length;
  const failedTests = testCases.filter((t) => t.status === 'failed').length;
  const passRate = testCases.length > 0 ? ((passedTests / testCases.length) * 100).toFixed(1) : 0;

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5">Test Manager</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage test cases and track execution
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Add Test Case
        </Button>
      </Stack>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Tests
                  </Typography>
                  <Typography variant="h4">{testCases.length}</Typography>
                </Box>
                <TestIcon color="primary" sx={{ fontSize: 40 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Passed
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {passedTests}
                  </Typography>
                </Box>
                <PassIcon color="success" sx={{ fontSize: 40 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Failed
                  </Typography>
                  <Typography variant="h4" color="error.main">
                    {failedTests}
                  </Typography>
                </Box>
                <FailIcon color="error" sx={{ fontSize: 40 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Pass Rate
                  </Typography>
                  <Typography variant="h4">{passRate}%</Typography>
                </Box>
                <BugIcon color="info" sx={{ fontSize: 40 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={2}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as TestCategory | 'all')}
              >
                <MenuItem value="all">All Categories</MenuItem>
                <MenuItem value="functional">Functional</MenuItem>
                <MenuItem value="integration">Integration</MenuItem>
                <MenuItem value="performance">Performance</MenuItem>
                <MenuItem value="security">Security</MenuItem>
                <MenuItem value="usability">Usability</MenuItem>
                <MenuItem value="regression">Regression</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as TestStatus | 'all')}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="not-run">Not Run</MenuItem>
                <MenuItem value="passed">Passed</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
                <MenuItem value="blocked">Blocked</MenuItem>
                <MenuItem value="in-progress">In Progress</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </CardContent>
      </Card>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Assigned To</TableCell>
              <TableCell>Last Run</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTests
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((test) => (
                <TableRow key={test.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {test.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {test.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={test.category} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={test.priority}
                      size="small"
                      color={getPriorityColor(test.priority)}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(test.status)}
                      label={test.status.replace('-', ' ')}
                      size="small"
                      color={getStatusColor(test.status)}
                    />
                  </TableCell>
                  <TableCell>{test.assignedTo || '-'}</TableCell>
                  <TableCell>
                    {test.lastRun ? test.lastRun.toLocaleDateString() : 'Never'}
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={0.5} justifyContent="center">
                      <IconButton size="small" onClick={() => handleRunTest(test.id)}>
                        <RunIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleOpenDialog(test)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteTest(test.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filteredTests.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </TableContainer>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingTest ? 'Edit Test Case' : 'Add Test Case'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                label="Title"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                fullWidth
                multiline
                rows={2}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as TestCategory)}
                >
                  <MenuItem value="functional">Functional</MenuItem>
                  <MenuItem value="integration">Integration</MenuItem>
                  <MenuItem value="performance">Performance</MenuItem>
                  <MenuItem value="security">Security</MenuItem>
                  <MenuItem value="usability">Usability</MenuItem>
                  <MenuItem value="regression">Regression</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formPriority}
                  onChange={(e) => setFormPriority(e.target.value as TestPriority)}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Test Steps
              </Typography>
              <Stack spacing={2}>
                {formSteps.map((step) => (
                  <Paper key={step.id} sx={{ p: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="start">
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle2">
                          Step {step.stepNumber}: {step.action}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Expected: {step.expectedBehavior}
                        </Typography>
                      </Box>
                      <IconButton size="small" onClick={() => handleRemoveStep(step.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Paper>
                ))}
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        label="Action"
                        value={stepAction}
                        onChange={(e) => setStepAction(e.target.value)}
                        fullWidth
                        placeholder="What action to perform"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Expected Behavior"
                        value={stepExpected}
                        onChange={(e) => setStepExpected(e.target.value)}
                        fullWidth
                        placeholder="What should happen"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button variant="outlined" onClick={handleAddStep}>
                        Add Step
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Expected Result"
                value={formExpectedResult}
                onChange={(e) => setFormExpectedResult(e.target.value)}
                fullWidth
                multiline
                rows={2}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Assigned To"
                value={formAssignedTo}
                onChange={(e) => setFormAssignedTo(e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Notes"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveTest}>
            {editingTest ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function getSampleTests(): TestCase[] {
  return [
    {
      id: '1',
      title: 'User Login Functionality',
      description: 'Verify that users can log in with valid credentials',
      category: 'functional',
      priority: 'critical',
      status: 'passed',
      steps: [
        {
          id: 's1',
          stepNumber: 1,
          action: 'Navigate to login page',
          expectedBehavior: 'Login form is displayed',
        },
        {
          id: 's2',
          stepNumber: 2,
          action: 'Enter valid username and password',
          expectedBehavior: 'Credentials are accepted',
        },
        {
          id: 's3',
          stepNumber: 3,
          action: 'Click login button',
          expectedBehavior: 'User is redirected to dashboard',
        },
      ],
      expectedResult: 'User successfully logs in and sees dashboard',
      assignedTo: 'QA Team',
      createdAt: new Date('2024-12-01'),
      lastRun: new Date('2024-12-20'),
    },
    {
      id: '2',
      title: 'Plant Data Export',
      description: 'Test CSV export of plant data',
      category: 'functional',
      priority: 'medium',
      status: 'failed',
      steps: [
        {
          id: 's4',
          stepNumber: 1,
          action: 'Select plants for export',
          expectedBehavior: 'Plants are selected',
        },
        {
          id: 's5',
          stepNumber: 2,
          action: 'Click export to CSV',
          expectedBehavior: 'CSV file is downloaded',
        },
      ],
      expectedResult: 'CSV file contains correct plant data',
      actualResult: 'CSV file is empty',
      assignedTo: 'Dev Team',
      createdAt: new Date('2024-12-05'),
      lastRun: new Date('2024-12-21'),
      notes: 'Bug reported: #1234',
    },
    {
      id: '3',
      title: 'API Response Time',
      description: 'Verify API responds within 200ms',
      category: 'performance',
      priority: 'high',
      status: 'passed',
      steps: [
        {
          id: 's6',
          stepNumber: 1,
          action: 'Send GET request to /api/plants',
          expectedBehavior: 'Response received',
        },
      ],
      expectedResult: 'Response time < 200ms',
      assignedTo: 'Performance Team',
      createdAt: new Date('2024-12-10'),
      lastRun: new Date('2024-12-22'),
      executionTime: 145,
    },
  ];
}
