import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  Alert,
  LinearProgress,
  Radio,
  RadioGroup,
} from '@mui/material';
import {
  FileDownload as DownloadIcon,
  Description as FileIcon,
  TableChart as ExcelIcon,
  Code as JsonIcon,
  PictureAsPdf as PdfIcon,
  DataObject as CsvIcon,
  Settings as SettingsIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  History as HistoryIcon,
} from '@mui/icons-material';

export type ExportFormat = 'csv' | 'json' | 'excel' | 'pdf';
export type DataType = 'plants' | 'sensors' | 'readings' | 'analytics' | 'reports' | 'all';
export type DateRange = 'today' | 'week' | 'month' | 'year' | 'all' | 'custom';

export interface ExportConfig {
  id: string;
  name: string;
  format: ExportFormat;
  dataTypes: DataType[];
  dateRange: DateRange;
  customStartDate?: Date;
  customEndDate?: Date;
  includeImages?: boolean;
  includeSummary?: boolean;
  compress?: boolean;
}

export interface ExportHistory {
  id: string;
  name: string;
  format: ExportFormat;
  size: number; // bytes
  recordCount: number;
  timestamp: Date;
  status: 'success' | 'failed';
  downloadUrl?: string;
}

export interface DataExporterProps {
  history?: ExportHistory[];
  onExport?: (config: ExportConfig) => Promise<void>;
  onDownload?: (historyId: string) => void;
  onScheduleExport?: (config: ExportConfig, schedule: string) => void;
}

/**
 * Data export component supporting multiple formats
 */
export function DataExporter({
  history: initialHistory = [],
  onExport,
  onDownload,
  onScheduleExport,
}: DataExporterProps) {
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [history, setHistory] = useState<ExportHistory[]>(
    initialHistory.length > 0 ? initialHistory : getSampleHistory()
  );
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  // Export configuration
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [selectedDataTypes, setSelectedDataTypes] = useState<DataType[]>(['plants']);
  const [dateRange, setDateRange] = useState<DateRange>('month');
  const [exportName, setExportName] = useState('');
  const [includeImages, setIncludeImages] = useState(false);
  const [includeSummary, setIncludeSummary] = useState(true);
  const [compress, setCompress] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [scheduleFrequency, setScheduleFrequency] = useState('daily');

  const handleExport = async () => {
    const config: ExportConfig = {
      id: `export-${Date.now()}`,
      name: exportName || `Export ${new Date().toLocaleDateString()}`,
      format,
      dataTypes: selectedDataTypes,
      dateRange,
      customStartDate: customStartDate ? new Date(customStartDate) : undefined,
      customEndDate: customEndDate ? new Date(customEndDate) : undefined,
      includeImages,
      includeSummary,
      compress,
    };

    setExporting(true);
    setExportProgress(0);

    try {
      // Simulate export progress
      const progressInterval = setInterval(() => {
        setExportProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 10;
        });
      }, 200);

      if (onExport) {
        await onExport(config);
      }

      // Add to history
      const newExport: ExportHistory = {
        id: config.id,
        name: config.name,
        format: config.format,
        size: Math.floor(Math.random() * 5000000) + 1000000, // Random size 1-5 MB
        recordCount: Math.floor(Math.random() * 10000) + 100,
        timestamp: new Date(),
        status: 'success',
        downloadUrl: `/downloads/${config.id}`,
      };

      setHistory([newExport, ...history]);
      setExportDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
      setExportProgress(0);
    }
  };

  const handleScheduleExport = () => {
    const config: ExportConfig = {
      id: `scheduled-${Date.now()}`,
      name: exportName || `Scheduled Export`,
      format,
      dataTypes: selectedDataTypes,
      dateRange,
      includeImages,
      includeSummary,
      compress,
    };

    onScheduleExport?.(config, scheduleFrequency);
    setScheduleDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setExportName('');
    setFormat('csv');
    setSelectedDataTypes(['plants']);
    setDateRange('month');
    setIncludeImages(false);
    setIncludeSummary(true);
    setCompress(false);
    setCustomStartDate('');
    setCustomEndDate('');
  };

  const handleDataTypeToggle = (dataType: DataType) => {
    if (selectedDataTypes.includes(dataType)) {
      setSelectedDataTypes(selectedDataTypes.filter((t) => t !== dataType));
    } else {
      setSelectedDataTypes([...selectedDataTypes, dataType]);
    }
  };

  const getFormatIcon = (fmt: ExportFormat) => {
    switch (fmt) {
      case 'csv':
        return <CsvIcon />;
      case 'json':
        return <JsonIcon />;
      case 'excel':
        return <ExcelIcon />;
      case 'pdf':
        return <PdfIcon />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5">Data Export</Typography>
          <Typography variant="body2" color="text.secondary">
            Export your data in multiple formats
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<ScheduleIcon />}
            onClick={() => setScheduleDialogOpen(true)}
          >
            Schedule Export
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={() => setExportDialogOpen(true)}
          >
            New Export
          </Button>
        </Stack>
      </Stack>

      {/* Quick Export Options */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {(['csv', 'json', 'excel', 'pdf'] as ExportFormat[]).map((fmt) => (
          <Grid item xs={6} sm={3} key={fmt}>
            <Card
              sx={{
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  boxShadow: 4,
                  transform: 'translateY(-2px)',
                },
              }}
              onClick={() => {
                setFormat(fmt);
                setExportDialogOpen(true);
              }}
            >
              <CardContent>
                <Stack alignItems="center" spacing={1}>
                  {getFormatIcon(fmt)}
                  <Typography variant="h6">{fmt.toUpperCase()}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {fmt === 'csv' && 'Spreadsheet data'}
                    {fmt === 'json' && 'Structured data'}
                    {fmt === 'excel' && 'Excel workbook'}
                    {fmt === 'pdf' && 'PDF document'}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Export History */}
      <Card>
        <CardHeader
          avatar={<HistoryIcon />}
          title="Export History"
          subheader={`${history.length} exports`}
        />
        <CardContent>
          {history.length === 0 ? (
            <Alert severity="info">No exports yet. Create your first export above!</Alert>
          ) : (
            <List>
              {history.map((item) => (
                <React.Fragment key={item.id}>
                  <ListItem
                    secondaryAction={
                      <Button
                        size="small"
                        startIcon={<DownloadIcon />}
                        onClick={() => onDownload?.(item.id)}
                        disabled={item.status === 'failed'}
                      >
                        Download
                      </Button>
                    }
                  >
                    <ListItemIcon>
                      {item.status === 'success' ? (
                        <SuccessIcon color="success" />
                      ) : (
                        <ErrorIcon color="error" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="body1">{item.name}</Typography>
                          <Chip label={item.format.toUpperCase()} size="small" />
                        </Stack>
                      }
                      secondary={
                        <Stack spacing={0.5}>
                          <Typography variant="caption">
                            {item.timestamp.toLocaleString()}
                          </Typography>
                          <Typography variant="caption">
                            {formatFileSize(item.size)} • {item.recordCount.toLocaleString()}{' '}
                            records
                          </Typography>
                        </Stack>
                      }
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Export Dialog */}
      <Dialog
        open={exportDialogOpen}
        onClose={() => !exporting && setExportDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Configure Export</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Export Name"
              value={exportName}
              onChange={(e) => setExportName(e.target.value)}
              placeholder={`Export ${new Date().toLocaleDateString()}`}
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>Format</InputLabel>
              <Select value={format} onChange={(e) => setFormat(e.target.value as ExportFormat)}>
                <MenuItem value="csv">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CsvIcon fontSize="small" />
                    <Typography>CSV (Comma Separated Values)</Typography>
                  </Stack>
                </MenuItem>
                <MenuItem value="json">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <JsonIcon fontSize="small" />
                    <Typography>JSON (JavaScript Object Notation)</Typography>
                  </Stack>
                </MenuItem>
                <MenuItem value="excel">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <ExcelIcon fontSize="small" />
                    <Typography>Excel Workbook (.xlsx)</Typography>
                  </Stack>
                </MenuItem>
                <MenuItem value="pdf">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <PdfIcon fontSize="small" />
                    <Typography>PDF Document</Typography>
                  </Stack>
                </MenuItem>
              </Select>
            </FormControl>

            <Divider />

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Data Types
              </Typography>
              <FormGroup>
                <Grid container>
                  {(['plants', 'sensors', 'readings', 'analytics', 'reports'] as DataType[]).map(
                    (type) => (
                      <Grid item xs={6} key={type}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={selectedDataTypes.includes(type)}
                              onChange={() => handleDataTypeToggle(type)}
                            />
                          }
                          label={type.charAt(0).toUpperCase() + type.slice(1)}
                        />
                      </Grid>
                    )
                  )}
                </Grid>
              </FormGroup>
            </Box>

            <FormControl fullWidth>
              <InputLabel>Date Range</InputLabel>
              <Select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as DateRange)}
              >
                <MenuItem value="today">Today</MenuItem>
                <MenuItem value="week">Last 7 Days</MenuItem>
                <MenuItem value="month">Last 30 Days</MenuItem>
                <MenuItem value="year">Last Year</MenuItem>
                <MenuItem value="all">All Time</MenuItem>
                <MenuItem value="custom">Custom Range</MenuItem>
              </Select>
            </FormControl>

            {dateRange === 'custom' && (
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Start Date"
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="End Date"
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            )}

            <Divider />

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Additional Options
              </Typography>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={includeSummary}
                      onChange={(e) => setIncludeSummary(e.target.checked)}
                    />
                  }
                  label="Include summary statistics"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={includeImages}
                      onChange={(e) => setIncludeImages(e.target.checked)}
                    />
                  }
                  label="Include images (larger file size)"
                />
                <FormControlLabel
                  control={
                    <Checkbox checked={compress} onChange={(e) => setCompress(e.target.checked)} />
                  }
                  label="Compress as ZIP file"
                />
              </FormGroup>
            </Box>

            {exporting && (
              <Box>
                <Typography variant="body2" gutterBottom>
                  Exporting... {exportProgress}%
                </Typography>
                <LinearProgress variant="determinate" value={exportProgress} />
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)} disabled={exporting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleExport}
            disabled={exporting || selectedDataTypes.length === 0}
            startIcon={<DownloadIcon />}
          >
            {exporting ? 'Exporting...' : 'Export'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Schedule Export Dialog */}
      <Dialog
        open={scheduleDialogOpen}
        onClose={() => setScheduleDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Schedule Automated Export</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Alert severity="info">
              Automated exports will be generated and emailed to you on the selected schedule.
            </Alert>

            <TextField
              label="Export Name"
              value={exportName}
              onChange={(e) => setExportName(e.target.value)}
              placeholder="Weekly Data Export"
              fullWidth
            />

            <FormControl component="fieldset">
              <Typography variant="subtitle2" gutterBottom>
                Frequency
              </Typography>
              <RadioGroup
                value={scheduleFrequency}
                onChange={(e) => setScheduleFrequency(e.target.value)}
              >
                <FormControlLabel value="daily" control={<Radio />} label="Daily" />
                <FormControlLabel value="weekly" control={<Radio />} label="Weekly" />
                <FormControlLabel value="monthly" control={<Radio />} label="Monthly" />
              </RadioGroup>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Format</InputLabel>
              <Select value={format} onChange={(e) => setFormat(e.target.value as ExportFormat)}>
                <MenuItem value="csv">CSV</MenuItem>
                <MenuItem value="json">JSON</MenuItem>
                <MenuItem value="excel">Excel</MenuItem>
                <MenuItem value="pdf">PDF</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScheduleDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleScheduleExport} startIcon={<ScheduleIcon />}>
            Schedule
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

/**
 * Generate sample export history
 */
function getSampleHistory(): ExportHistory[] {
  return [
    {
      id: '1',
      name: 'Monthly Plant Data',
      format: 'excel',
      size: 2458624,
      recordCount: 1523,
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      status: 'success',
      downloadUrl: '/downloads/1',
    },
    {
      id: '2',
      name: 'Sensor Readings Export',
      format: 'csv',
      size: 1048576,
      recordCount: 5420,
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      status: 'success',
      downloadUrl: '/downloads/2',
    },
    {
      id: '3',
      name: 'Analytics Report',
      format: 'pdf',
      size: 3145728,
      recordCount: 234,
      timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      status: 'success',
      downloadUrl: '/downloads/3',
    },
  ];
}
