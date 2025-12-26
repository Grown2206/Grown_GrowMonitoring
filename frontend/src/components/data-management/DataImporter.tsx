import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Alert,
  Checkbox,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Delete as DeleteIcon,
  Visibility as PreviewIcon,
  PlayArrow as ImportIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

export type ImportFormat = 'csv' | 'json' | 'excel';
export type ImportStatus = 'pending' | 'validating' | 'importing' | 'success' | 'failed';
export type ConflictResolution = 'skip' | 'overwrite' | 'merge';

export interface ImportFile {
  id: string;
  name: string;
  format: ImportFormat;
  size: number;
  recordCount: number;
  status: ImportStatus;
  errors?: string[];
  warnings?: string[];
  uploadedAt: Date;
}

export interface ImportPreview {
  headers: string[];
  sampleData: any[][];
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  warnings: string[];
}

export interface DataImporterProps {
  onImport?: (file: File, options: ImportOptions) => Promise<ImportResult>;
  onValidate?: (file: File) => Promise<ImportPreview>;
  acceptedFormats?: ImportFormat[];
}

export interface ImportOptions {
  conflictResolution: ConflictResolution;
  validateOnly: boolean;
  skipInvalid: boolean;
  dryRun: boolean;
}

export interface ImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  failed: number;
  errors?: string[];
}

/**
 * Data import component with validation and preview
 */
export function DataImporter({
  onImport,
  onValidate,
  acceptedFormats = ['csv', 'json', 'excel'],
}: DataImporterProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<ImportFile[]>([]);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [currentPreview, setCurrentPreview] = useState<ImportPreview | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);

  // Import options
  const [conflictResolution, setConflictResolution] = useState<ConflictResolution>('skip');
  const [skipInvalid, setSkipInvalid] = useState(true);
  const [dryRun, setDryRun] = useState(false);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const newFiles: ImportFile[] = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const format = getFileFormat(file.name);

      if (format && acceptedFormats.includes(format)) {
        const importFile: ImportFile = {
          id: `file-${Date.now()}-${i}`,
          name: file.name,
          format,
          size: file.size,
          recordCount: 0,
          status: 'pending',
          uploadedAt: new Date(),
        };

        newFiles.push(importFile);

        // Validate file
        if (onValidate) {
          try {
            const preview = await onValidate(file);
            importFile.recordCount = preview.totalRecords;
            importFile.status = preview.invalidRecords > 0 ? 'pending' : 'pending';
            importFile.warnings = preview.warnings;
          } catch (error) {
            importFile.status = 'failed';
            importFile.errors = [error instanceof Error ? error.message : 'Validation failed'];
          }
        }
      }
    }

    setFiles([...files, ...newFiles]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePreview = async (fileId: string) => {
    const file = files.find((f) => f.id === fileId);
    if (!file) return;

    // Generate sample preview
    const preview: ImportPreview = {
      headers: ['ID', 'Name', 'Type', 'Status', 'Created'],
      sampleData: [
        ['1', 'Tomato Plant', 'Vegetable', 'Healthy', '2024-01-15'],
        ['2', 'Rose Bush', 'Flower', 'Good', '2024-01-10'],
        ['3', 'Basil', 'Herb', 'Excellent', '2024-01-20'],
      ],
      totalRecords: 150,
      validRecords: 145,
      invalidRecords: 5,
      warnings: [
        '5 records missing required fields',
        '2 duplicate entries detected',
      ],
    };

    setCurrentPreview(preview);
    setPreviewDialogOpen(true);
  };

  const handleImport = async (fileId: string) => {
    const fileIndex = files.findIndex((f) => f.id === fileId);
    if (fileIndex === -1) return;

    const updatedFiles = [...files];
    updatedFiles[fileIndex].status = 'importing';
    setFiles(updatedFiles);
    setImporting(true);
    setProgress(0);

    // Simulate import progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 300);

    try {
      // Simulate import (in real app, would call onImport with actual file)
      await new Promise((resolve) => setTimeout(resolve, 3000));

      updatedFiles[fileIndex].status = 'success';
      setFiles(updatedFiles);
    } catch (error) {
      updatedFiles[fileIndex].status = 'failed';
      updatedFiles[fileIndex].errors = [
        error instanceof Error ? error.message : 'Import failed',
      ];
      setFiles(updatedFiles);
    } finally {
      setImporting(false);
      setProgress(0);
    }
  };

  const handleRemoveFile = (fileId: string) => {
    setFiles(files.filter((f) => f.id !== fileId));
  };

  const getFileFormat = (filename: string): ImportFormat | null => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext === 'csv') return 'csv';
    if (ext === 'json') return 'json';
    if (ext === 'xlsx' || ext === 'xls') return 'excel';
    return null;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getStatusIcon = (status: ImportStatus) => {
    switch (status) {
      case 'success':
        return <SuccessIcon color="success" />;
      case 'failed':
        return <ErrorIcon color="error" />;
      case 'importing':
      case 'validating':
        return <InfoIcon color="info" />;
      default:
        return <WarningIcon color="warning" />;
    }
  };

  const getStatusColor = (status: ImportStatus) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'failed':
        return 'error';
      case 'importing':
      case 'validating':
        return 'info';
      default:
        return 'warning';
    }
  };

  const acceptedExtensions = acceptedFormats
    .map((fmt) => {
      if (fmt === 'csv') return '.csv';
      if (fmt === 'json') return '.json';
      if (fmt === 'excel') return '.xlsx,.xls';
      return '';
    })
    .join(',');

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5">Data Import</Typography>
          <Typography variant="body2" color="text.secondary">
            Import data from CSV, JSON, or Excel files
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<UploadIcon />}
          onClick={() => fileInputRef.current?.click()}
        >
          Upload Files
        </Button>
      </Stack>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept={acceptedExtensions}
        multiple
        style={{ display: 'none' }}
      />

      {/* Import Options */}
      <Card sx={{ mb: 3 }}>
        <CardHeader title="Import Options" />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Conflict Resolution</InputLabel>
                <Select
                  value={conflictResolution}
                  onChange={(e) => setConflictResolution(e.target.value as ConflictResolution)}
                >
                  <MenuItem value="skip">Skip existing records</MenuItem>
                  <MenuItem value="overwrite">Overwrite existing records</MenuItem>
                  <MenuItem value="merge">Merge with existing records</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControlLabel
                control={
                  <Switch checked={skipInvalid} onChange={(e) => setSkipInvalid(e.target.checked)} />
                }
                label="Skip invalid records"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControlLabel
                control={
                  <Switch checked={dryRun} onChange={(e) => setDryRun(e.target.checked)} />
                }
                label="Dry run (validate only)"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Upload Area */}
      {files.length === 0 && (
        <Paper
          sx={{
            p: 6,
            textAlign: 'center',
            bgcolor: 'background.default',
            border: '2px dashed',
            borderColor: 'divider',
            cursor: 'pointer',
            '&:hover': {
              bgcolor: 'action.hover',
              borderColor: 'primary.main',
            },
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <UploadIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Drop files here or click to upload
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Supported formats: {acceptedFormats.map((f) => f.toUpperCase()).join(', ')}
          </Typography>
        </Paper>
      )}

      {/* Files List */}
      {files.length > 0 && (
        <Card>
          <CardHeader
            title="Uploaded Files"
            subheader={`${files.length} file${files.length > 1 ? 's' : ''} ready to import`}
          />
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Status</TableCell>
                    <TableCell>File Name</TableCell>
                    <TableCell>Format</TableCell>
                    <TableCell align="right">Size</TableCell>
                    <TableCell align="right">Records</TableCell>
                    <TableCell>Uploaded</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {files.map((file) => (
                    <TableRow key={file.id}>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          {getStatusIcon(file.status)}
                          <Chip
                            label={file.status}
                            color={getStatusColor(file.status) as any}
                            size="small"
                          />
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{file.name}</Typography>
                        {file.warnings && file.warnings.length > 0 && (
                          <Typography variant="caption" color="warning.main">
                            {file.warnings.length} warning{file.warnings.length > 1 ? 's' : ''}
                          </Typography>
                        )}
                        {file.errors && file.errors.length > 0 && (
                          <Typography variant="caption" color="error">
                            {file.errors.length} error{file.errors.length > 1 ? 's' : ''}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip label={file.format.toUpperCase()} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell align="right">{formatFileSize(file.size)}</TableCell>
                      <TableCell align="right">
                        {file.recordCount > 0 ? file.recordCount.toLocaleString() : '-'}
                      </TableCell>
                      <TableCell>{file.uploadedAt.toLocaleTimeString()}</TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <IconButton
                            size="small"
                            onClick={() => handlePreview(file.id)}
                            disabled={file.status === 'importing'}
                          >
                            <PreviewIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleImport(file.id)}
                            disabled={
                              file.status === 'importing' ||
                              file.status === 'success' ||
                              importing
                            }
                          >
                            <ImportIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveFile(file.id)}
                            disabled={file.status === 'importing'}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {importing && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Importing... {progress}%
                </Typography>
                <LinearProgress variant="determinate" value={progress} />
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Preview Dialog */}
      <Dialog open={previewDialogOpen} onClose={() => setPreviewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Import Preview
          <IconButton
            onClick={() => setPreviewDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {currentPreview && (
            <Stack spacing={2}>
              {/* Summary */}
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4">{currentPreview.totalRecords}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total Records
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.50' }}>
                    <Typography variant="h4" color="success.main">
                      {currentPreview.validRecords}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Valid
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'error.50' }}>
                    <Typography variant="h4" color="error.main">
                      {currentPreview.invalidRecords}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Invalid
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* Warnings */}
              {currentPreview.warnings.length > 0 && (
                <Alert severity="warning">
                  <Typography variant="subtitle2" gutterBottom>
                    Warnings:
                  </Typography>
                  <List dense>
                    {currentPreview.warnings.map((warning, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={warning} />
                      </ListItem>
                    ))}
                  </List>
                </Alert>
              )}

              {/* Sample Data */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Sample Data (first 3 records):
                </Typography>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        {currentPreview.headers.map((header, index) => (
                          <TableCell key={index}>{header}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {currentPreview.sampleData.map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                          {row.map((cell, cellIndex) => (
                            <TableCell key={cellIndex}>{cell}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
