import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Box,
  Typography,
  Divider,
  TextField,
  Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { de } from 'date-fns/locale';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import CodeIcon from '@mui/icons-material/Code';
import DescriptionIcon from '@mui/icons-material/Description';

export type ExportFormat = 'csv' | 'excel' | 'json' | 'pdf';
export type ExportDataType = 'sensors' | 'plants' | 'relays' | 'comprehensive' | 'analytics';

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  onExport: (format: ExportFormat, dateRange?: { start: Date; end: Date }) => void;
  dataType: ExportDataType;
  totalRecords?: number;
}

export function ExportDialog({
  open,
  onClose,
  onExport,
  dataType,
  totalRecords,
}: ExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [startDate, setStartDate] = useState<Date | null>(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  );
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [useDateRange, setUseDateRange] = useState(false);

  const handleExport = () => {
    const dateRange =
      useDateRange && startDate && endDate ? { start: startDate, end: endDate } : undefined;
    onExport(format, dateRange);
    onClose();
  };

  const getDataTypeLabel = () => {
    switch (dataType) {
      case 'sensors':
        return 'Sensor-Daten';
      case 'plants':
        return 'Pflanzen';
      case 'relays':
        return 'Geräte';
      case 'comprehensive':
        return 'Komplett-Bericht';
      case 'analytics':
        return 'Analyse-Bericht';
      default:
        return 'Daten';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <DownloadIcon />
          <Typography variant="h6">{getDataTypeLabel()} exportieren</Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 1 }}>
          {totalRecords !== undefined && (
            <Alert severity="info" sx={{ mb: 3 }}>
              {totalRecords} Datensätze werden exportiert
            </Alert>
          )}

          <FormControl component="fieldset" fullWidth>
            <FormLabel component="legend" sx={{ mb: 2 }}>
              Export-Format
            </FormLabel>
            <RadioGroup value={format} onChange={(e) => setFormat(e.target.value as ExportFormat)}>
              <FormControlLabel
                value="csv"
                control={<Radio />}
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <DescriptionIcon fontSize="small" />
                    <Box>
                      <Typography variant="body1">CSV (Comma-Separated Values)</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Für Excel, Google Sheets, etc.
                      </Typography>
                    </Box>
                  </Box>
                }
              />
              <FormControlLabel
                value="excel"
                control={<Radio />}
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <TableChartIcon fontSize="small" color="success" />
                    <Box>
                      <Typography variant="body1">Excel (XLSX)</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Natives Excel-Format mit Formatierung
                      </Typography>
                    </Box>
                  </Box>
                }
              />
              <FormControlLabel
                value="json"
                control={<Radio />}
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <CodeIcon fontSize="small" color="info" />
                    <Box>
                      <Typography variant="body1">JSON</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Für technische Anwendungen und APIs
                      </Typography>
                    </Box>
                  </Box>
                }
              />
              <FormControlLabel
                value="pdf"
                control={<Radio />}
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <PictureAsPdfIcon fontSize="small" color="error" />
                    <Box>
                      <Typography variant="body1">PDF Bericht</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Druckfertiges Dokument mit Formatierung
                      </Typography>
                    </Box>
                  </Box>
                }
              />
            </RadioGroup>
          </FormControl>

          {(dataType === 'sensors' || dataType === 'analytics') && (
            <>
              <Divider sx={{ my: 3 }} />

              <FormControl component="fieldset" fullWidth>
                <FormLabel component="legend" sx={{ mb: 2 }}>
                  Zeitraum (optional)
                </FormLabel>
                <FormControlLabel
                  control={
                    <Radio
                      checked={!useDateRange}
                      onChange={() => setUseDateRange(false)}
                    />
                  }
                  label="Alle verfügbaren Daten"
                />
                <FormControlLabel
                  control={
                    <Radio
                      checked={useDateRange}
                      onChange={() => setUseDateRange(true)}
                    />
                  }
                  label="Bestimmter Zeitraum"
                />

                {useDateRange && (
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={de}>
                    <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                      <DatePicker
                        label="Von"
                        value={startDate}
                        onChange={(newValue) => setStartDate(newValue)}
                        slotProps={{
                          textField: { size: 'small', fullWidth: true },
                        }}
                      />
                      <DatePicker
                        label="Bis"
                        value={endDate}
                        onChange={(newValue) => setEndDate(newValue)}
                        slotProps={{
                          textField: { size: 'small', fullWidth: true },
                        }}
                      />
                    </Box>
                  </LocalizationProvider>
                )}
              </FormControl>
            </>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Abbrechen</Button>
        <Button onClick={handleExport} variant="contained" startIcon={<DownloadIcon />}>
          Exportieren
        </Button>
      </DialogActions>
    </Dialog>
  );
}
