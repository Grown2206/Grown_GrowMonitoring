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
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
  Rating,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as PassIcon,
  Cancel as FailIcon,
  Warning as WarningIcon,
  ThumbUp as ApproveIcon,
  Assignment as InspectionIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

export interface QualityCheck {
  id: string;
  checkpointName: string;
  category: QualityCategory;
  targetEntity: string;
  inspector: string;
  inspectionDate: Date;
  status: CheckStatus;
  criteria: QualityCriteria[];
  overallScore: number;
  passed: boolean;
  notes?: string;
  corrective Actions?: string;
}

export interface QualityCriteria {
  id: string;
  name: string;
  description: string;
  rating: number;
  maxRating: number;
  passed: boolean;
  comments?: string;
}

export type QualityCategory =
  | 'plant-health'
  | 'environment'
  | 'equipment'
  | 'process'
  | 'documentation'
  | 'safety';

export type CheckStatus = 'pending' | 'in-progress' | 'completed' | 'failed' | 'approved';

export interface QualityControlProps {
  checks?: QualityCheck[];
  onAddCheck?: (check: Omit<QualityCheck, 'id'>) => void;
  onUpdateCheck?: (id: string, check: Partial<QualityCheck>) => void;
  onDeleteCheck?: (id: string) => void;
  onApproveCheck?: (id: string) => void;
}

export function QualityControl({
  checks: initialChecks,
  onAddCheck,
  onUpdateCheck,
  onDeleteCheck,
  onApproveCheck,
}: QualityControlProps) {
  const [checks, setChecks] = useState<QualityCheck[]>(initialChecks || getSampleChecks());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCheck, setEditingCheck] = useState<QualityCheck | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<QualityCategory | 'all'>('all');

  // Form state
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<QualityCategory>('plant-health');
  const [formTarget, setFormTarget] = useState('');
  const [formInspector, setFormInspector] = useState('');
  const [formDate, setFormDate] = useState<Date | null>(new Date());
  const [formCriteria, setFormCriteria] = useState<QualityCriteria[]>([]);
  const [formNotes, setFormNotes] = useState('');
  const [formCorrectiveActions, setFormCorrectiveActions] = useState('');

  const handleOpenDialog = (check?: QualityCheck) => {
    if (check) {
      setEditingCheck(check);
      setFormName(check.checkpointName);
      setFormCategory(check.category);
      setFormTarget(check.targetEntity);
      setFormInspector(check.inspector);
      setFormDate(check.inspectionDate);
      setFormCriteria([...check.criteria]);
      setFormNotes(check.notes || '');
      setFormCorrectiveActions(check.correctiveActions || '');
    } else {
      setEditingCheck(null);
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCheck(null);
    resetForm();
  };

  const resetForm = () => {
    setFormName('');
    setFormCategory('plant-health');
    setFormTarget('');
    setFormInspector('');
    setFormDate(new Date());
    setFormCriteria([]);
    setFormNotes('');
    setFormCorrectiveActions('');
  };

  const calculateOverallScore = (criteria: QualityCriteria[]) => {
    if (criteria.length === 0) return 0;
    const totalScore = criteria.reduce((sum, c) => sum + c.rating, 0);
    const maxScore = criteria.reduce((sum, c) => sum + c.maxRating, 0);
    return maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
  };

  const handleSaveCheck = () => {
    if (!formDate) return;

    const overallScore = calculateOverallScore(formCriteria);
    const passed = formCriteria.every((c) => c.passed);

    const checkData = {
      checkpointName: formName,
      category: formCategory,
      targetEntity: formTarget,
      inspector: formInspector,
      inspectionDate: formDate,
      status: 'completed' as CheckStatus,
      criteria: formCriteria,
      overallScore,
      passed,
      notes: formNotes,
      correctiveActions: formCorrectiveActions,
    };

    if (editingCheck) {
      const updated = checks.map((check) =>
        check.id === editingCheck.id ? { ...check, ...checkData } : check
      );
      setChecks(updated);
      onUpdateCheck?.(editingCheck.id, checkData);
    } else {
      const newCheck: QualityCheck = {
        id: `check-${Date.now()}`,
        ...checkData,
      };
      setChecks([...checks, newCheck]);
      onAddCheck?.(checkData);
    }

    handleCloseDialog();
  };

  const handleDeleteCheck = (id: string) => {
    setChecks(checks.filter((check) => check.id !== id));
    onDeleteCheck?.(id);
  };

  const handleApproveCheck = (id: string) => {
    const updated = checks.map((check) =>
      check.id === id ? { ...check, status: 'approved' as CheckStatus } : check
    );
    setChecks(updated);
    onApproveCheck?.(id);
  };

  const handleUpdateCriteria = (id: string, rating: number) => {
    setFormCriteria(
      formCriteria.map((c) => {
        if (c.id === id) {
          return { ...c, rating, passed: rating >= c.maxRating * 0.7 };
        }
        return c;
      })
    );
  };

  const getStatusColor = (status: CheckStatus) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'completed':
        return 'info';
      case 'in-progress':
        return 'warning';
      case 'failed':
        return 'error';
      case 'pending':
        return 'default';
    }
  };

  const filteredChecks = checks.filter(
    (check) => categoryFilter === 'all' || check.category === categoryFilter
  );

  const passedChecks = checks.filter((c) => c.passed).length;
  const failedChecks = checks.filter((c) => !c.passed && c.status === 'completed').length;
  const avgScore = checks.length > 0
    ? (checks.reduce((sum, c) => sum + c.overallScore, 0) / checks.length).toFixed(1)
    : 0;

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5">Quality Control</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage quality checks and inspections
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          New Inspection
        </Button>
      </Stack>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Checks
                  </Typography>
                  <Typography variant="h4">{checks.length}</Typography>
                </Box>
                <InspectionIcon color="primary" sx={{ fontSize: 40 }} />
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
                    {passedChecks}
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
                    {failedChecks}
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
                    Avg Score
                  </Typography>
                  <Typography variant="h4">{avgScore}%</Typography>
                </Box>
                <ApproveIcon color="info" sx={{ fontSize: 40 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as QualityCategory | 'all')}
            >
              <MenuItem value="all">All Categories</MenuItem>
              <MenuItem value="plant-health">Plant Health</MenuItem>
              <MenuItem value="environment">Environment</MenuItem>
              <MenuItem value="equipment">Equipment</MenuItem>
              <MenuItem value="process">Process</MenuItem>
              <MenuItem value="documentation">Documentation</MenuItem>
              <MenuItem value="safety">Safety</MenuItem>
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        {filteredChecks.map((check) => (
          <Grid item xs={12} key={check.id}>
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="start">
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6">{check.checkpointName}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {check.targetEntity} | Inspected by: {check.inspector}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <Chip
                        label={check.category}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        label={check.status}
                        size="small"
                        color={getStatusColor(check.status)}
                      />
                      {check.passed ? (
                        <Chip
                          icon={<PassIcon />}
                          label="Passed"
                          size="small"
                          color="success"
                        />
                      ) : (
                        <Chip
                          icon={<FailIcon />}
                          label="Failed"
                          size="small"
                          color="error"
                        />
                      )}
                    </Stack>
                  </Stack>

                  <Divider />

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">
                        Inspection Date:
                      </Typography>
                      <Typography variant="body1">
                        {check.inspectionDate.toLocaleDateString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">
                        Overall Score:
                      </Typography>
                      <Typography variant="h6" color={check.passed ? 'success.main' : 'error.main'}>
                        {check.overallScore.toFixed(1)}%
                      </Typography>
                    </Grid>
                  </Grid>

                  <Divider />

                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Quality Criteria:
                    </Typography>
                    <List dense>
                      {check.criteria.map((criteria) => (
                        <ListItem key={criteria.id}>
                          <ListItemText
                            primary={criteria.name}
                            secondary={
                              <Stack direction="row" spacing={2} alignItems="center">
                                <Typography variant="caption">
                                  {criteria.rating}/{criteria.maxRating}
                                </Typography>
                                <Chip
                                  label={criteria.passed ? 'Pass' : 'Fail'}
                                  size="small"
                                  color={criteria.passed ? 'success' : 'error'}
                                />
                              </Stack>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>

                  {check.notes && (
                    <>
                      <Divider />
                      <Box>
                        <Typography variant="subtitle2">Notes:</Typography>
                        <Typography variant="body2">{check.notes}</Typography>
                      </Box>
                    </>
                  )}

                  {check.correctiveActions && (
                    <Box>
                      <Typography variant="subtitle2" color="error">
                        Corrective Actions Required:
                      </Typography>
                      <Typography variant="body2">{check.correctiveActions}</Typography>
                    </Box>
                  )}

                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    {check.status === 'completed' && !check.passed && (
                      <Button
                        size="small"
                        startIcon={<ApproveIcon />}
                        onClick={() => handleApproveCheck(check.id)}
                      >
                        Approve with Exceptions
                      </Button>
                    )}
                    <IconButton size="small" onClick={() => handleOpenDialog(check)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteCheck(check.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingCheck ? 'Edit Quality Check' : 'New Quality Inspection'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                label="Checkpoint Name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as QualityCategory)}
                >
                  <MenuItem value="plant-health">Plant Health</MenuItem>
                  <MenuItem value="environment">Environment</MenuItem>
                  <MenuItem value="equipment">Equipment</MenuItem>
                  <MenuItem value="process">Process</MenuItem>
                  <MenuItem value="documentation">Documentation</MenuItem>
                  <MenuItem value="safety">Safety</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Target Entity"
                value={formTarget}
                onChange={(e) => setFormTarget(e.target.value)}
                fullWidth
                placeholder="e.g., Grow Room 1, Batch A"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Inspector"
                value={formInspector}
                onChange={(e) => setFormInspector(e.target.value)}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Inspection Date"
                value={formDate}
                onChange={(newValue) => setFormDate(newValue)}
                slotProps={{ textField: { fullWidth: true, required: true } }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6">Quality Criteria</Typography>
              <List>
                {formCriteria.map((criteria) => (
                  <ListItem key={criteria.id}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2">{criteria.name}</Typography>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Rating
                          value={criteria.rating}
                          max={criteria.maxRating}
                          onChange={(_, value) => handleUpdateCriteria(criteria.id, value || 0)}
                        />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <Chip
                          label={criteria.passed ? 'Pass' : 'Fail'}
                          size="small"
                          color={criteria.passed ? 'success' : 'error'}
                        />
                      </Grid>
                    </Grid>
                  </ListItem>
                ))}
              </List>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Notes"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Corrective Actions"
                value={formCorrectiveActions}
                onChange={(e) => setFormCorrectiveActions(e.target.value)}
                fullWidth
                multiline
                rows={2}
                placeholder="Required actions if check fails"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveCheck}>
            {editingCheck ? 'Update' : 'Complete Inspection'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function getSampleChecks(): QualityCheck[] {
  return [
    {
      id: '1',
      checkpointName: 'Weekly Plant Health Inspection',
      category: 'plant-health',
      targetEntity: 'Grow Room 1 - Batch A',
      inspector: 'Sarah Johnson',
      inspectionDate: new Date('2024-12-20'),
      status: 'completed',
      criteria: [
        {
          id: 'c1',
          name: 'Leaf Color',
          description: 'Check for healthy green color',
          rating: 5,
          maxRating: 5,
          passed: true,
        },
        {
          id: 'c2',
          name: 'Growth Rate',
          description: 'Verify expected growth',
          rating: 4,
          maxRating: 5,
          passed: true,
        },
        {
          id: 'c3',
          name: 'Pest/Disease',
          description: 'No signs of pests or disease',
          rating: 5,
          maxRating: 5,
          passed: true,
        },
      ],
      overallScore: 93.3,
      passed: true,
      notes: 'All plants showing excellent health',
    },
    {
      id: '2',
      checkpointName: 'Environmental Conditions Check',
      category: 'environment',
      targetEntity: 'Grow Room 2',
      inspector: 'Mike Davis',
      inspectionDate: new Date('2024-12-21'),
      status: 'completed',
      criteria: [
        {
          id: 'c4',
          name: 'Temperature',
          description: 'Within optimal range',
          rating: 3,
          maxRating: 5,
          passed: false,
        },
        {
          id: 'c5',
          name: 'Humidity',
          description: 'Proper humidity levels',
          rating: 5,
          maxRating: 5,
          passed: true,
        },
        {
          id: 'c6',
          name: 'Air Circulation',
          description: 'Adequate air flow',
          rating: 4,
          maxRating: 5,
          passed: true,
        },
      ],
      overallScore: 80.0,
      passed: false,
      notes: 'Temperature slightly elevated',
      correctiveActions: 'Adjust HVAC settings to lower temperature by 2°C',
    },
  ];
}
