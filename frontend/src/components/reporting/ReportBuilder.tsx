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
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  Alert,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Stepper,
  Step,
  StepLabel,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as RunIcon,
  Schedule as ScheduleIcon,
  FileDownload as ExportIcon,
  Save as SaveIcon,
  Visibility as PreviewIcon,
  BarChart as ChartIcon,
  TableChart as TableIcon,
  PieChart as PieIcon,
  ShowChart as LineIcon,
} from '@mui/icons-material';

export type ReportType = 'table' | 'chart' | 'summary' | 'detailed';
export type ChartType = 'bar' | 'line' | 'pie' | 'area' | 'scatter';
export type DataSource = 'plants' | 'sensors' | 'users' | 'audit' | 'custom';
export type AggregationType = 'sum' | 'avg' | 'min' | 'max' | 'count';

export interface ReportField {
  id: string;
  name: string;
  dataType: 'string' | 'number' | 'date' | 'boolean';
  aggregation?: AggregationType;
}

export interface ReportFilter {
  field: string;
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'between';
  value: string | number;
  value2?: string | number;
}

export interface Report {
  id: string;
  name: string;
  description: string;
  type: ReportType;
  chartType?: ChartType;
  dataSource: DataSource;
  fields: ReportField[];
  filters: ReportFilter[];
  groupBy?: string[];
  sortBy?: { field: string; direction: 'asc' | 'desc' };
  schedule?: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    recipients: string[];
  };
  createdAt: Date;
  createdBy: string;
  lastRun?: Date;
}

export interface ReportBuilderProps {
  reports?: Report[];
  onCreateReport?: (report: Omit<Report, 'id' | 'createdAt'>) => void;
  onUpdateReport?: (reportId: string, updates: Partial<Report>) => void;
  onDeleteReport?: (reportId: string) => void;
  onRunReport?: (reportId: string) => Promise<any>;
  onExportReport?: (reportId: string, format: 'pdf' | 'excel' | 'csv') => void;
}

/**
 * Advanced report builder with custom fields and filters
 */
export function ReportBuilder({
  reports: initialReports = [],
  onCreateReport,
  onUpdateReport,
  onDeleteReport,
  onRunReport,
  onExportReport,
}: ReportBuilderProps) {
  const [reports, setReports] = useState<Report[]>(
    initialReports.length > 0 ? initialReports : getSampleReports()
  );
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Form states
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formType, setFormType] = useState<ReportType>('table');
  const [formChartType, setFormChartType] = useState<ChartType>('bar');
  const [formDataSource, setFormDataSource] = useState<DataSource>('plants');
  const [formFields, setFormFields] = useState<ReportField[]>([]);
  const [formFilters, setFormFilters] = useState<ReportFilter[]>([]);
  const [formGroupBy, setFormGroupBy] = useState<string[]>([]);
  const [formScheduleEnabled, setFormScheduleEnabled] = useState(false);
  const [formScheduleFrequency, setFormScheduleFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [formScheduleTime, setFormScheduleTime] = useState('09:00');

  const steps = ['Basic Info', 'Data Source', 'Fields & Filters', 'Visualization', 'Schedule'];

  const handleNext = () => {
    setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const handleCreate = () => {
    const newReport: Report = {
      id: (reports.length + 1).toString(),
      name: formName,
      description: formDescription,
      type: formType,
      chartType: formType === 'chart' ? formChartType : undefined,
      dataSource: formDataSource,
      fields: formFields,
      filters: formFilters,
      groupBy: formGroupBy.length > 0 ? formGroupBy : undefined,
      schedule: formScheduleEnabled
        ? {
            enabled: true,
            frequency: formScheduleFrequency,
            time: formScheduleTime,
            recipients: [],
          }
        : undefined,
      createdAt: new Date(),
      createdBy: 'current-user',
    };

    setReports([...reports, newReport]);
    onCreateReport?.(newReport);
    showSuccessNotification('Report created successfully');
    resetForm();
    setCreateDialogOpen(false);
    setActiveStep(0);
  };

  const handleDelete = (reportId: string) => {
    setReports(reports.filter((r) => r.id !== reportId));
    onDeleteReport?.(reportId);
    showSuccessNotification('Report deleted successfully');
  };

  const handleRunReport = async (reportId: string) => {
    try {
      await onRunReport?.(reportId);
      setReports(
        reports.map((r) => (r.id === reportId ? { ...r, lastRun: new Date() } : r))
      );
      showSuccessNotification('Report generated successfully');
    } catch (error) {
      showSuccessNotification('Error generating report');
    }
  };

  const handleAddField = () => {
    const newField: ReportField = {
      id: `field-${formFields.length + 1}`,
      name: '',
      dataType: 'string',
    };
    setFormFields([...formFields, newField]);
  };

  const handleUpdateField = (index: number, updates: Partial<ReportField>) => {
    const updated = formFields.map((f, i) => (i === index ? { ...f, ...updates } : f));
    setFormFields(updated);
  };

  const handleRemoveField = (index: number) => {
    setFormFields(formFields.filter((_, i) => i !== index));
  };

  const handleAddFilter = () => {
    const newFilter: ReportFilter = {
      field: '',
      operator: 'equals',
      value: '',
    };
    setFormFilters([...formFilters, newFilter]);
  };

  const handleUpdateFilter = (index: number, updates: Partial<ReportFilter>) => {
    const updated = formFilters.map((f, i) => (i === index ? { ...f, ...updates } : f));
    setFormFilters(updated);
  };

  const handleRemoveFilter = (index: number) => {
    setFormFilters(formFilters.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setFormName('');
    setFormDescription('');
    setFormType('table');
    setFormChartType('bar');
    setFormDataSource('plants');
    setFormFields([]);
    setFormFilters([]);
    setFormGroupBy([]);
    setFormScheduleEnabled(false);
    setFormScheduleFrequency('daily');
    setFormScheduleTime('09:00');
  };

  const showSuccessNotification = (message: string) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const getReportTypeIcon = (type: ReportType) => {
    switch (type) {
      case 'table':
        return <TableIcon />;
      case 'chart':
        return <ChartIcon />;
      default:
        return <ChartIcon />;
    }
  };

  const getChartTypeIcon = (type: ChartType) => {
    switch (type) {
      case 'bar':
        return <BarChart />;
      case 'line':
        return <LineIcon />;
      case 'pie':
        return <PieIcon />;
      default:
        return <ChartIcon />;
    }
  };

  const formatLastRun = (date?: Date) => {
    if (!date) return 'Never';
    return date.toLocaleString();
  };

  const availableFields: Record<DataSource, string[]> = {
    plants: ['name', 'type', 'location', 'health', 'growthRate', 'harvestDate'],
    sensors: ['sensorId', 'type', 'value', 'unit', 'timestamp', 'status'],
    users: ['name', 'email', 'role', 'department', 'lastLogin'],
    audit: ['action', 'user', 'resource', 'timestamp', 'status'],
    custom: [],
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5">Report Builder</Typography>
          <Typography variant="body2" color="text.secondary">
            Create custom reports and analytics
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Create Report
        </Button>
      </Stack>

      {showSuccess && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setShowSuccess(false)}>
          {successMessage}
        </Alert>
      )}

      {/* Reports Grid */}
      <Grid container spacing={2}>
        {reports.map((report) => (
          <Grid item xs={12} md={6} lg={4} key={report.id}>
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Stack spacing={0.5}>
                      <Typography variant="h6">{report.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {report.description}
                      </Typography>
                    </Stack>
                    {getReportTypeIcon(report.type)}
                  </Stack>

                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Chip label={report.type} size="small" />
                    <Chip label={report.dataSource} size="small" variant="outlined" />
                    {report.chartType && (
                      <Chip
                        icon={getChartTypeIcon(report.chartType)}
                        label={report.chartType}
                        size="small"
                        variant="outlined"
                      />
                    )}
                    {report.schedule?.enabled && (
                      <Chip icon={<ScheduleIcon />} label="Scheduled" size="small" color="info" />
                    )}
                  </Stack>

                  <Divider />

                  <Stack spacing={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      Fields: {report.fields.length}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Filters: {report.filters.length}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Last run: {formatLastRun(report.lastRun)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Created: {report.createdAt.toLocaleDateString()}
                    </Typography>
                  </Stack>

                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      startIcon={<RunIcon />}
                      onClick={() => handleRunReport(report.id)}
                    >
                      Run
                    </Button>
                    <Button
                      size="small"
                      startIcon={<ExportIcon />}
                      onClick={() => onExportReport?.(report.id, 'pdf')}
                    >
                      Export
                    </Button>
                    <IconButton size="small" onClick={() => handleDelete(report.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {reports.length === 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <ChartIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No reports yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Create your first custom report
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setCreateDialogOpen(true)}
              >
                Create Report
              </Button>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Create Report Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Report</DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep} sx={{ mt: 2, mb: 3 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Step 1: Basic Info */}
          {activeStep === 0 && (
            <Stack spacing={2}>
              <TextField
                label="Report Name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                fullWidth
                required
              />
              <TextField
                label="Description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                fullWidth
                multiline
                rows={2}
              />
              <FormControl fullWidth required>
                <InputLabel>Report Type</InputLabel>
                <Select value={formType} onChange={(e) => setFormType(e.target.value as ReportType)}>
                  <MenuItem value="table">Table Report</MenuItem>
                  <MenuItem value="chart">Chart Report</MenuItem>
                  <MenuItem value="summary">Summary Report</MenuItem>
                  <MenuItem value="detailed">Detailed Report</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          )}

          {/* Step 2: Data Source */}
          {activeStep === 1 && (
            <Stack spacing={2}>
              <FormControl fullWidth required>
                <InputLabel>Data Source</InputLabel>
                <Select
                  value={formDataSource}
                  onChange={(e) => setFormDataSource(e.target.value as DataSource)}
                >
                  <MenuItem value="plants">Plants</MenuItem>
                  <MenuItem value="sensors">Sensors</MenuItem>
                  <MenuItem value="users">Users</MenuItem>
                  <MenuItem value="audit">Audit Logs</MenuItem>
                  <MenuItem value="custom">Custom Query</MenuItem>
                </Select>
              </FormControl>
              <Alert severity="info">
                Selected data source: {formDataSource}. Available fields will be shown in the next
                step.
              </Alert>
            </Stack>
          )}

          {/* Step 3: Fields & Filters */}
          {activeStep === 2 && (
            <Stack spacing={3}>
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="subtitle1">Fields</Typography>
                  <Button size="small" startIcon={<AddIcon />} onClick={handleAddField}>
                    Add Field
                  </Button>
                </Stack>
                {formFields.map((field, index) => (
                  <Stack key={field.id} direction="row" spacing={1} sx={{ mb: 1 }}>
                    <FormControl size="small" sx={{ flex: 1 }}>
                      <InputLabel>Field</InputLabel>
                      <Select
                        value={field.name}
                        onChange={(e) => handleUpdateField(index, { name: e.target.value })}
                      >
                        {availableFields[formDataSource].map((f) => (
                          <MenuItem key={f} value={f}>
                            {f}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ width: 150 }}>
                      <InputLabel>Type</InputLabel>
                      <Select
                        value={field.dataType}
                        onChange={(e) => handleUpdateField(index, { dataType: e.target.value as any })}
                      >
                        <MenuItem value="string">String</MenuItem>
                        <MenuItem value="number">Number</MenuItem>
                        <MenuItem value="date">Date</MenuItem>
                        <MenuItem value="boolean">Boolean</MenuItem>
                      </Select>
                    </FormControl>
                    <IconButton size="small" onClick={() => handleRemoveField(index)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                ))}
              </Box>

              <Divider />

              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="subtitle1">Filters</Typography>
                  <Button size="small" startIcon={<AddIcon />} onClick={handleAddFilter}>
                    Add Filter
                  </Button>
                </Stack>
                {formFilters.map((filter, index) => (
                  <Stack key={index} direction="row" spacing={1} sx={{ mb: 1 }}>
                    <TextField
                      size="small"
                      label="Field"
                      value={filter.field}
                      onChange={(e) => handleUpdateFilter(index, { field: e.target.value })}
                      sx={{ flex: 1 }}
                    />
                    <FormControl size="small" sx={{ width: 150 }}>
                      <InputLabel>Operator</InputLabel>
                      <Select
                        value={filter.operator}
                        onChange={(e) => handleUpdateFilter(index, { operator: e.target.value as any })}
                      >
                        <MenuItem value="equals">Equals</MenuItem>
                        <MenuItem value="contains">Contains</MenuItem>
                        <MenuItem value="greater">Greater than</MenuItem>
                        <MenuItem value="less">Less than</MenuItem>
                        <MenuItem value="between">Between</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      size="small"
                      label="Value"
                      value={filter.value}
                      onChange={(e) => handleUpdateFilter(index, { value: e.target.value })}
                      sx={{ width: 150 }}
                    />
                    <IconButton size="small" onClick={() => handleRemoveFilter(index)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                ))}
              </Box>
            </Stack>
          )}

          {/* Step 4: Visualization */}
          {activeStep === 3 && (
            <Stack spacing={2}>
              {formType === 'chart' && (
                <FormControl fullWidth>
                  <InputLabel>Chart Type</InputLabel>
                  <Select
                    value={formChartType}
                    onChange={(e) => setFormChartType(e.target.value as ChartType)}
                  >
                    <MenuItem value="bar">Bar Chart</MenuItem>
                    <MenuItem value="line">Line Chart</MenuItem>
                    <MenuItem value="pie">Pie Chart</MenuItem>
                    <MenuItem value="area">Area Chart</MenuItem>
                    <MenuItem value="scatter">Scatter Plot</MenuItem>
                  </Select>
                </FormControl>
              )}
              <FormGroup>
                <Typography variant="subtitle2" gutterBottom>
                  Group By (optional)
                </Typography>
                {availableFields[formDataSource].slice(0, 5).map((field) => (
                  <FormControlLabel
                    key={field}
                    control={
                      <Checkbox
                        checked={formGroupBy.includes(field)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormGroupBy([...formGroupBy, field]);
                          } else {
                            setFormGroupBy(formGroupBy.filter((f) => f !== field));
                          }
                        }}
                      />
                    }
                    label={field}
                  />
                ))}
              </FormGroup>
            </Stack>
          )}

          {/* Step 5: Schedule */}
          {activeStep === 4 && (
            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formScheduleEnabled}
                    onChange={(e) => setFormScheduleEnabled(e.target.checked)}
                  />
                }
                label="Enable scheduled report generation"
              />
              {formScheduleEnabled && (
                <>
                  <FormControl fullWidth>
                    <InputLabel>Frequency</InputLabel>
                    <Select
                      value={formScheduleFrequency}
                      onChange={(e) => setFormScheduleFrequency(e.target.value as any)}
                    >
                      <MenuItem value="daily">Daily</MenuItem>
                      <MenuItem value="weekly">Weekly</MenuItem>
                      <MenuItem value="monthly">Monthly</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    label="Time"
                    type="time"
                    value={formScheduleTime}
                    onChange={(e) => setFormScheduleTime(e.target.value)}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          {activeStep > 0 && <Button onClick={handleBack}>Back</Button>}
          {activeStep < steps.length - 1 ? (
            <Button variant="contained" onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleCreate}
              disabled={!formName || formFields.length === 0}
            >
              Create Report
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}

/**
 * Generate sample reports
 */
function getSampleReports(): Report[] {
  return [
    {
      id: '1',
      name: 'Plant Growth Summary',
      description: 'Weekly summary of plant growth rates across all greenhouses',
      type: 'chart',
      chartType: 'bar',
      dataSource: 'plants',
      fields: [
        { id: 'f1', name: 'name', dataType: 'string' },
        { id: 'f2', name: 'growthRate', dataType: 'number', aggregation: 'avg' },
        { id: 'f3', name: 'location', dataType: 'string' },
      ],
      filters: [
        { field: 'health', operator: 'greater', value: 70 },
      ],
      groupBy: ['location'],
      createdAt: new Date('2024-01-15'),
      createdBy: 'admin',
      lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
    {
      id: '2',
      name: 'Sensor Data Report',
      description: 'Daily sensor readings for temperature and humidity',
      type: 'table',
      dataSource: 'sensors',
      fields: [
        { id: 'f1', name: 'sensorId', dataType: 'string' },
        { id: 'f2', name: 'type', dataType: 'string' },
        { id: 'f3', name: 'value', dataType: 'number' },
        { id: 'f4', name: 'timestamp', dataType: 'date' },
      ],
      filters: [],
      schedule: {
        enabled: true,
        frequency: 'daily',
        time: '09:00',
        recipients: ['admin@example.com'],
      },
      createdAt: new Date('2024-02-01'),
      createdBy: 'admin',
      lastRun: new Date(Date.now() - 12 * 60 * 60 * 1000),
    },
  ];
}
