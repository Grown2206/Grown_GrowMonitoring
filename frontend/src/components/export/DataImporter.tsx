import React, { useState, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
  Alert,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import {
  Upload as UploadIcon,
  Close as CloseIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useFileUpload } from '../../hooks/useFileUpload';

export interface ImportResult<T = any> {
  success: boolean;
  data?: T[];
  errors?: Array<{ row: number; message: string }>;
  warnings?: Array<{ row: number; message: string }>;
  summary?: {
    total: number;
    successful: number;
    failed: number;
    warnings: number;
  };
}

export interface DataImporterProps<T = any> {
  onImport: (data: T[]) => Promise<ImportResult<T>>;
  acceptedFormats?: string[];
  maxFileSize?: number;
  validateRow?: (row: any, index: number) => { valid: boolean; errors?: string[]; warnings?: string[] };
  title?: string;
  description?: string;
}

/**
 * Data importer with validation and preview
 */
export function DataImporter<T extends Record<string, any>>({
  onImport,
  acceptedFormats = ['.csv', '.json', '.xlsx'],
  maxFileSize = 10 * 1024 * 1024, // 10MB
  validateRow,
  title = 'Import Data',
  description = 'Upload a file to import data',
}: DataImporterProps<T>) {
  const [open, setOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult<T> | null>(null);
  const [previewData, setPreviewData] = useState<T[]>([]);

  const { files, addFiles, clearFiles, inputRef, openFileDialog } = useFileUpload({
    maxFiles: 1,
    maxSize: maxFileSize,
    acceptedTypes: acceptedFormats,
  });

  const handleFileSelect = useCallback(
    async (selectedFiles: FileList) => {
      addFiles(selectedFiles);
      const file = selectedFiles[0];
      if (!file) return;

      try {
        const text = await file.text();
        let parsedData: T[] = [];

        if (file.name.endsWith('.json')) {
          parsedData = JSON.parse(text);
        } else if (file.name.endsWith('.csv')) {
          parsedData = parseCSV(text);
        }

        setPreviewData(parsedData.slice(0, 10)); // Preview first 10 rows
      } catch (error) {
        console.error('Failed to parse file:', error);
      }
    },
    [addFiles]
  );

  const handleImport = async () => {
    if (files.length === 0) return;

    setImporting(true);
    setResult(null);

    try {
      const file = files[0];
      const text = await file.text();
      let data: T[] = [];

      if (file.name.endsWith('.json')) {
        data = JSON.parse(text);
      } else if (file.name.endsWith('.csv')) {
        data = parseCSV(text);
      }

      // Validate if validator provided
      if (validateRow) {
        const errors: Array<{ row: number; message: string }> = [];
        const warnings: Array<{ row: number; message: string }> = [];

        data.forEach((row, index) => {
          const validation = validateRow(row, index);
          if (!validation.valid && validation.errors) {
            validation.errors.forEach((err) => errors.push({ row: index + 1, message: err }));
          }
          if (validation.warnings) {
            validation.warnings.forEach((warn) => warnings.push({ row: index + 1, message: warn }));
          }
        });

        if (errors.length > 0) {
          setResult({
            success: false,
            errors,
            warnings,
            summary: {
              total: data.length,
              successful: 0,
              failed: errors.length,
              warnings: warnings.length,
            },
          });
          setImporting(false);
          return;
        }
      }

      const importResult = await onImport(data);
      setResult(importResult);
    } catch (error: any) {
      setResult({
        success: false,
        errors: [{ row: 0, message: error.message || 'Import failed' }],
      });
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    clearFiles();
    setPreviewData([]);
    setResult(null);
  };

  return (
    <>
      <Button variant="outlined" startIcon={<UploadIcon />} onClick={() => setOpen(true)}>
        Import Data
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">{title}</Typography>
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={3}>
            {/* File Upload Area */}
            {files.length === 0 && !result && (
              <Card
                sx={{
                  border: '2px dashed',
                  borderColor: 'divider',
                  cursor: 'pointer',
                  '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
                }}
                onClick={openFileDialog}
              >
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <UploadIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    {description}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Supported formats: {acceptedFormats.join(', ')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                    Max file size: {(maxFileSize / 1024 / 1024).toFixed(1)}MB
                  </Typography>
                </CardContent>
              </Card>
            )}

            <input
              ref={inputRef}
              type="file"
              accept={acceptedFormats.join(',')}
              onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
              style={{ display: 'none' }}
            />

            {/* File Info */}
            {files.length > 0 && !result && (
              <Alert severity="info">
                <Typography variant="subtitle2">{files[0].name}</Typography>
                <Typography variant="caption">
                  {(files[0].size / 1024).toFixed(2)} KB • {previewData.length} rows detected
                </Typography>
              </Alert>
            )}

            {/* Preview */}
            {previewData.length > 0 && !result && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Preview (First 10 rows)
                </Typography>
                <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        {Object.keys(previewData[0] || {}).map((key) => (
                          <TableCell key={key}>{key}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {previewData.map((row, index) => (
                        <TableRow key={index}>
                          {Object.values(row).map((value: any, i) => (
                            <TableCell key={i}>{String(value)}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {/* Importing Progress */}
            {importing && (
              <Box>
                <Typography variant="body2" gutterBottom>
                  Importing data...
                </Typography>
                <LinearProgress />
              </Box>
            )}

            {/* Import Result */}
            {result && (
              <Box>
                <Alert severity={result.success ? 'success' : 'error'} icon={result.success ? <SuccessIcon /> : <ErrorIcon />}>
                  <Typography variant="subtitle2">
                    {result.success ? 'Import Successful' : 'Import Failed'}
                  </Typography>
                  {result.summary && (
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      <Chip label={`Total: ${result.summary.total}`} size="small" />
                      <Chip label={`Success: ${result.summary.successful}`} size="small" color="success" />
                      {result.summary.failed > 0 && (
                        <Chip label={`Failed: ${result.summary.failed}`} size="small" color="error" />
                      )}
                      {result.summary.warnings > 0 && (
                        <Chip label={`Warnings: ${result.summary.warnings}`} size="small" color="warning" />
                      )}
                    </Stack>
                  )}
                </Alert>

                {/* Errors */}
                {result.errors && result.errors.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" color="error" gutterBottom>
                      Errors
                    </Typography>
                    <TableContainer component={Paper} sx={{ maxHeight: 200 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Row</TableCell>
                            <TableCell>Error</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {result.errors.map((error, index) => (
                            <TableRow key={index}>
                              <TableCell>{error.row}</TableCell>
                              <TableCell>{error.message}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}

                {/* Warnings */}
                {result.warnings && result.warnings.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" color="warning.main" gutterBottom>
                      <WarningIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                      Warnings
                    </Typography>
                    <TableContainer component={Paper} sx={{ maxHeight: 200 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Row</TableCell>
                            <TableCell>Warning</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {result.warnings.map((warning, index) => (
                            <TableRow key={index}>
                              <TableCell>{warning.row}</TableCell>
                              <TableCell>{warning.message}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}
              </Box>
            )}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
          {files.length > 0 && !result && !importing && (
            <Button variant="contained" startIcon={<UploadIcon />} onClick={handleImport}>
              Import
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}

/**
 * Parse CSV to JSON
 */
function parseCSV(csv: string): any[] {
  const lines = csv.split('\n').filter((line) => line.trim());
  if (lines.length === 0) return [];

  const headers = lines[0].split(',').map((h) => h.trim());
  const data: any[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const obj: any = {};
    headers.forEach((header, index) => {
      obj[header] = values[index]?.trim() || '';
    });
    data.push(obj);
  }

  return data;
}
