import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormGroup,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  Chip,
  Alert,
  Divider,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Close as CloseIcon,
  TableChart as CsvIcon,
  Code as JsonIcon,
  Description as ExcelIcon,
  PictureAsPdf as PdfIcon,
} from '@mui/icons-material';

export type ExportFormat = 'csv' | 'json' | 'excel' | 'pdf';

export interface ExportOptions {
  format: ExportFormat;
  filename?: string;
  includeHeaders?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  selectedFields?: string[];
  compress?: boolean;
}

export interface DataExporterProps<T = any> {
  data: T[];
  availableFields?: Array<{ key: string; label: string }>;
  defaultFilename?: string;
  onExport?: (data: T[], options: ExportOptions) => void;
  allowedFormats?: ExportFormat[];
}

/**
 * Comprehensive data export component with multiple format support
 */
export function DataExporter<T extends Record<string, any>>({
  data,
  availableFields,
  defaultFilename = 'export',
  onExport,
  allowedFormats = ['csv', 'json', 'excel', 'pdf'],
}: DataExporterProps<T>) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ExportOptions>({
    format: 'csv',
    filename: defaultFilename,
    includeHeaders: true,
    compress: false,
    selectedFields: availableFields?.map((f) => f.key),
  });

  const fields = availableFields || (data.length > 0 ? Object.keys(data[0]).map((key) => ({ key, label: key })) : []);

  const handleExport = () => {
    if (onExport) {
      const filteredData = data.map((item) => {
        if (!options.selectedFields || options.selectedFields.length === 0) {
          return item;
        }
        const filtered: any = {};
        options.selectedFields.forEach((field) => {
          filtered[field] = item[field];
        });
        return filtered;
      });

      onExport(filteredData, options);
    } else {
      // Default export behavior
      exportData(data, options, fields);
    }
    setOpen(false);
  };

  const handleFieldToggle = (fieldKey: string) => {
    setOptions((prev) => {
      const selected = prev.selectedFields || [];
      const newSelected = selected.includes(fieldKey)
        ? selected.filter((f) => f !== fieldKey)
        : [...selected, fieldKey];
      return { ...prev, selectedFields: newSelected };
    });
  };

  const handleSelectAll = () => {
    setOptions((prev) => ({
      ...prev,
      selectedFields: fields.map((f) => f.key),
    }));
  };

  const handleDeselectAll = () => {
    setOptions((prev) => ({
      ...prev,
      selectedFields: [],
    }));
  };

  const getFormatIcon = (format: ExportFormat) => {
    switch (format) {
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

  const getFormatLabel = (format: ExportFormat) => {
    switch (format) {
      case 'csv':
        return 'CSV (Comma Separated)';
      case 'json':
        return 'JSON (JavaScript Object)';
      case 'excel':
        return 'Excel (XLSX)';
      case 'pdf':
        return 'PDF Document';
    }
  };

  return (
    <>
      <Button variant="contained" startIcon={<DownloadIcon />} onClick={() => setOpen(true)}>
        Export Data
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Export Data</Typography>
            <IconButton onClick={() => setOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Alert severity="info">
              Exporting {data.length} record{data.length !== 1 ? 's' : ''}
            </Alert>

            {/* Format Selection */}
            <FormControl fullWidth>
              <InputLabel>Export Format</InputLabel>
              <Select
                value={options.format}
                onChange={(e) => setOptions({ ...options, format: e.target.value as ExportFormat })}
                label="Export Format"
              >
                {allowedFormats.map((format) => (
                  <MenuItem key={format} value={format}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      {getFormatIcon(format)}
                      <Typography>{getFormatLabel(format)}</Typography>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Filename */}
            <TextField
              label="Filename"
              value={options.filename}
              onChange={(e) => setOptions({ ...options, filename: e.target.value })}
              fullWidth
              helperText={`Will be saved as: ${options.filename}.${options.format}`}
            />

            <Divider />

            {/* Field Selection */}
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="subtitle2">Select Fields to Export</Typography>
                <Stack direction="row" spacing={1}>
                  <Button size="small" onClick={handleSelectAll}>
                    Select All
                  </Button>
                  <Button size="small" onClick={handleDeselectAll}>
                    Deselect All
                  </Button>
                </Stack>
              </Stack>

              <FormGroup>
                {fields.map((field) => (
                  <FormControlLabel
                    key={field.key}
                    control={
                      <Checkbox
                        checked={options.selectedFields?.includes(field.key) || false}
                        onChange={() => handleFieldToggle(field.key)}
                      />
                    }
                    label={field.label}
                  />
                ))}
              </FormGroup>

              <Chip
                label={`${options.selectedFields?.length || 0} / ${fields.length} fields selected`}
                size="small"
                color="primary"
                sx={{ mt: 1 }}
              />
            </Box>

            <Divider />

            {/* Options */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Export Options
              </Typography>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={options.includeHeaders}
                      onChange={(e) => setOptions({ ...options, includeHeaders: e.target.checked })}
                    />
                  }
                  label="Include Headers"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={options.compress}
                      onChange={(e) => setOptions({ ...options, compress: e.target.checked })}
                    />
                  }
                  label="Compress (ZIP)"
                  disabled={options.format === 'pdf'}
                />
              </FormGroup>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
            disabled={!options.selectedFields || options.selectedFields.length === 0}
          >
            Export
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

/**
 * Export data to file (default implementation)
 */
export function exportData<T extends Record<string, any>>(
  data: T[],
  options: ExportOptions,
  fields: Array<{ key: string; label: string }>
) {
  const { format, filename = 'export', includeHeaders = true, selectedFields } = options;

  switch (format) {
    case 'csv':
      exportToCSV(data, filename, includeHeaders, selectedFields, fields);
      break;
    case 'json':
      exportToJSON(data, filename);
      break;
    default:
      console.warn(`Export format ${format} not implemented in default exporter`);
  }
}

/**
 * Export to CSV
 */
function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  includeHeaders: boolean,
  selectedFields?: string[],
  fields?: Array<{ key: string; label: string }>
) {
  const keys = selectedFields || Object.keys(data[0] || {});
  const fieldLabels = fields?.reduce((acc, f) => ({ ...acc, [f.key]: f.label }), {} as Record<string, string>) || {};

  let csv = '';

  if (includeHeaders) {
    csv += keys.map((key) => fieldLabels[key] || key).join(',') + '\n';
  }

  data.forEach((row) => {
    csv += keys.map((key) => JSON.stringify(row[key] || '')).join(',') + '\n';
  });

  downloadFile(csv, `${filename}.csv`, 'text/csv');
}

/**
 * Export to JSON
 */
function exportToJSON<T>(data: T[], filename: string) {
  const json = JSON.stringify(data, null, 2);
  downloadFile(json, `${filename}.json`, 'application/json');
}

/**
 * Download file helper
 */
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
