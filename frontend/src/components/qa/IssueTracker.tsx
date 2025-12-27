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
  Avatar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  BugReport as BugIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as ResolvedIcon,
  Cancel as ClosedIcon,
} from '@mui/icons-material';

export interface Issue {
  id: string;
  title: string;
  description: string;
  type: IssueType;
  severity: IssueSeverity;
  priority: IssuePriority;
  status: IssueStatus;
  assignedTo?: string;
  reportedBy: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  component?: string;
  version?: string;
  stepsToReproduce?: string;
  resolution?: string;
}

export type IssueType = 'bug' | 'feature' | 'improvement' | 'task' | 'question';
export type IssueSeverity = 'critical' | 'major' | 'minor' | 'trivial';
export type IssuePriority = 'urgent' | 'high' | 'medium' | 'low';
export type IssueStatus = 'open' | 'in-progress' | 'resolved' | 'closed' | 're-opened';

export interface IssueTrackerProps {
  issues?: Issue[];
  onAddIssue?: (issue: Omit<Issue, 'id'>) => void;
  onUpdateIssue?: (id: string, issue: Partial<Issue>) => void;
  onDeleteIssue?: (id: string) => void;
  onResolveIssue?: (id: string, resolution: string) => void;
}

export function IssueTracker({
  issues: initialIssues,
  onAddIssue,
  onUpdateIssue,
  onDeleteIssue,
  onResolveIssue,
}: IssueTrackerProps) {
  const [issues, setIssues] = useState<Issue[]>(initialIssues || getSampleIssues());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState<Issue | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [typeFilter, setTypeFilter] = useState<IssueType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<IssueStatus | 'all'>('all');

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formType, setFormType] = useState<IssueType>('bug');
  const [formSeverity, setFormSeverity] = useState<IssueSeverity>('minor');
  const [formPriority, setFormPriority] = useState<IssuePriority>('medium');
  const [formAssignedTo, setFormAssignedTo] = useState('');
  const [formComponent, setFormComponent] = useState('');
  const [formVersion, setFormVersion] = useState('');
  const [formSteps, setFormSteps] = useState('');
  const [formResolution, setFormResolution] = useState('');

  const handleOpenDialog = (issue?: Issue) => {
    if (issue) {
      setEditingIssue(issue);
      setFormTitle(issue.title);
      setFormDescription(issue.description);
      setFormType(issue.type);
      setFormSeverity(issue.severity);
      setFormPriority(issue.priority);
      setFormAssignedTo(issue.assignedTo || '');
      setFormComponent(issue.component || '');
      setFormVersion(issue.version || '');
      setFormSteps(issue.stepsToReproduce || '');
      setFormResolution(issue.resolution || '');
    } else {
      setEditingIssue(null);
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingIssue(null);
    resetForm();
  };

  const resetForm = () => {
    setFormTitle('');
    setFormDescription('');
    setFormType('bug');
    setFormSeverity('minor');
    setFormPriority('medium');
    setFormAssignedTo('');
    setFormComponent('');
    setFormVersion('');
    setFormSteps('');
    setFormResolution('');
  };

  const handleSaveIssue = () => {
    const issueData = {
      title: formTitle,
      description: formDescription,
      type: formType,
      severity: formSeverity,
      priority: formPriority,
      status: 'open' as IssueStatus,
      assignedTo: formAssignedTo,
      reportedBy: 'Current User',
      createdAt: new Date(),
      updatedAt: new Date(),
      component: formComponent,
      version: formVersion,
      stepsToReproduce: formSteps,
      resolution: formResolution,
    };

    if (editingIssue) {
      const updated = issues.map((issue) =>
        issue.id === editingIssue.id
          ? { ...issue, ...issueData, updatedAt: new Date() }
          : issue
      );
      setIssues(updated);
      onUpdateIssue?.(editingIssue.id, issueData);
    } else {
      const newIssue: Issue = {
        id: `issue-${Date.now()}`,
        ...issueData,
      };
      setIssues([...issues, newIssue]);
      onAddIssue?.(issueData);
    }

    handleCloseDialog();
  };

  const handleDeleteIssue = (id: string) => {
    setIssues(issues.filter((issue) => issue.id !== id));
    onDeleteIssue?.(id);
  };

  const handleResolveIssue = (id: string) => {
    const resolution = prompt('Enter resolution:');
    if (resolution) {
      const updated = issues.map((issue) =>
        issue.id === id
          ? {
              ...issue,
              status: 'resolved' as IssueStatus,
              resolution,
              resolvedAt: new Date(),
              updatedAt: new Date(),
            }
          : issue
      );
      setIssues(updated);
      onResolveIssue?.(id, resolution);
    }
  };

  const getTypeIcon = (type: IssueType) => {
    switch (type) {
      case 'bug':
        return <BugIcon />;
      case 'feature':
      case 'improvement':
        return <InfoIcon />;
      case 'task':
        return <CheckCircle />;
      case 'question':
        return <InfoIcon />;
    }
  };

  const getSeverityColor = (severity: IssueSeverity) => {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'major':
        return 'warning';
      case 'minor':
        return 'info';
      case 'trivial':
        return 'default';
    }
  };

  const getPriorityColor = (priority: IssuePriority) => {
    switch (priority) {
      case 'urgent':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'default';
    }
  };

  const getStatusColor = (status: IssueStatus) => {
    switch (status) {
      case 'open':
        return 'error';
      case 'in-progress':
        return 'warning';
      case 'resolved':
        return 'success';
      case 'closed':
        return 'default';
      case 're-opened':
        return 'warning';
    }
  };

  const filteredIssues = issues.filter((issue) => {
    const matchesType = typeFilter === 'all' || issue.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
    return matchesType && matchesStatus;
  });

  const openIssues = issues.filter((i) => i.status === 'open').length;
  const inProgressIssues = issues.filter((i) => i.status === 'in-progress').length;
  const resolvedIssues = issues.filter((i) => i.status === 'resolved').length;
  const criticalIssues = issues.filter((i) => i.severity === 'critical' && i.status !== 'resolved').length;

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5">Issue Tracker</Typography>
          <Typography variant="body2" color="text.secondary">
            Track and manage bugs and issues
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Report Issue
        </Button>
      </Stack>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Open Issues
                  </Typography>
                  <Typography variant="h4" color="error.main">
                    {openIssues}
                  </Typography>
                </Box>
                <ErrorIcon color="error" sx={{ fontSize: 40 }} />
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
                    In Progress
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {inProgressIssues}
                  </Typography>
                </Box>
                <WarningIcon color="warning" sx={{ fontSize: 40 }} />
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
                    Resolved
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {resolvedIssues}
                  </Typography>
                </Box>
                <ResolvedIcon color="success" sx={{ fontSize: 40 }} />
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
                    Critical
                  </Typography>
                  <Typography variant="h4">{criticalIssues}</Typography>
                </Box>
                <BugIcon color="error" sx={{ fontSize: 40 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={2}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as IssueType | 'all')}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="bug">Bug</MenuItem>
                <MenuItem value="feature">Feature</MenuItem>
                <MenuItem value="improvement">Improvement</MenuItem>
                <MenuItem value="task">Task</MenuItem>
                <MenuItem value="question">Question</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as IssueStatus | 'all')}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="open">Open</MenuItem>
                <MenuItem value="in-progress">In Progress</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
                <MenuItem value="closed">Closed</MenuItem>
                <MenuItem value="re-opened">Re-opened</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </CardContent>
      </Card>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Severity</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Assigned To</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredIssues
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((issue) => (
                <TableRow key={issue.id}>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {issue.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      {getTypeIcon(issue.type)}
                      <Typography variant="body2" fontWeight="medium">
                        {issue.title}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip label={issue.type} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={issue.severity}
                      size="small"
                      color={getSeverityColor(issue.severity)}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={issue.priority}
                      size="small"
                      color={getPriorityColor(issue.priority)}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={issue.status}
                      size="small"
                      color={getStatusColor(issue.status)}
                    />
                  </TableCell>
                  <TableCell>
                    {issue.assignedTo ? (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar sx={{ width: 24, height: 24 }}>
                          {issue.assignedTo[0]}
                        </Avatar>
                        <Typography variant="caption">{issue.assignedTo}</Typography>
                      </Stack>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">
                      {issue.createdAt.toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={0.5} justifyContent="center">
                      {issue.status === 'open' && (
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handleResolveIssue(issue.id)}
                        >
                          <ResolvedIcon fontSize="small" />
                        </IconButton>
                      )}
                      <IconButton size="small" onClick={() => handleOpenDialog(issue)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteIssue(issue.id)}
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
          count={filteredIssues.length}
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
        <DialogTitle>{editingIssue ? 'Edit Issue' : 'Report New Issue'}</DialogTitle>
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
                rows={3}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth required>
                <InputLabel>Type</InputLabel>
                <Select value={formType} onChange={(e) => setFormType(e.target.value as IssueType)}>
                  <MenuItem value="bug">Bug</MenuItem>
                  <MenuItem value="feature">Feature</MenuItem>
                  <MenuItem value="improvement">Improvement</MenuItem>
                  <MenuItem value="task">Task</MenuItem>
                  <MenuItem value="question">Question</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth required>
                <InputLabel>Severity</InputLabel>
                <Select
                  value={formSeverity}
                  onChange={(e) => setFormSeverity(e.target.value as IssueSeverity)}
                >
                  <MenuItem value="critical">Critical</MenuItem>
                  <MenuItem value="major">Major</MenuItem>
                  <MenuItem value="minor">Minor</MenuItem>
                  <MenuItem value="trivial">Trivial</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth required>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formPriority}
                  onChange={(e) => setFormPriority(e.target.value as IssuePriority)}
                >
                  <MenuItem value="urgent">Urgent</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Assigned To"
                value={formAssignedTo}
                onChange={(e) => setFormAssignedTo(e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Component"
                value={formComponent}
                onChange={(e) => setFormComponent(e.target.value)}
                fullWidth
                placeholder="e.g., Dashboard, API"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Version"
                value={formVersion}
                onChange={(e) => setFormVersion(e.target.value)}
                fullWidth
                placeholder="e.g., 2.72.0"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Steps to Reproduce"
                value={formSteps}
                onChange={(e) => setFormSteps(e.target.value)}
                fullWidth
                multiline
                rows={3}
                placeholder="1. Go to...
2. Click on...
3. See error"
              />
            </Grid>
            {editingIssue && (
              <Grid item xs={12}>
                <TextField
                  label="Resolution"
                  value={formResolution}
                  onChange={(e) => setFormResolution(e.target.value)}
                  fullWidth
                  multiline
                  rows={2}
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveIssue}>
            {editingIssue ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function getSampleIssues(): Issue[] {
  return [
    {
      id: 'ISSUE-001',
      title: 'Login page not responsive on mobile',
      description: 'The login form does not adapt properly to mobile screen sizes',
      type: 'bug',
      severity: 'major',
      priority: 'high',
      status: 'open',
      assignedTo: 'Frontend Team',
      reportedBy: 'QA Tester',
      createdAt: new Date('2024-12-20'),
      updatedAt: new Date('2024-12-20'),
      component: 'Authentication',
      version: '2.70.0',
      stepsToReproduce: '1. Open app on mobile device
2. Navigate to login page
3. Observe layout issues',
    },
    {
      id: 'ISSUE-002',
      title: 'CSV export includes incorrect data',
      description: 'Plant export to CSV contains wrong field values',
      type: 'bug',
      severity: 'critical',
      priority: 'urgent',
      status: 'in-progress',
      assignedTo: 'Backend Team',
      reportedBy: 'User Support',
      createdAt: new Date('2024-12-19'),
      updatedAt: new Date('2024-12-21'),
      component: 'Data Export',
      version: '2.69.0',
    },
    {
      id: 'ISSUE-003',
      title: 'Add dark mode support',
      description: 'Users requesting dark mode theme option',
      type: 'feature',
      severity: 'minor',
      priority: 'medium',
      status: 'open',
      reportedBy: 'Product Team',
      createdAt: new Date('2024-12-15'),
      updatedAt: new Date('2024-12-15'),
    },
  ];
}
