import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
  Typography,
  Chip,
  Alert,
} from '@mui/material';

export interface BatchOperation {
  action: string;
  label: string;
  requiresData?: boolean;
  dataFields?: {
    name: string;
    label: string;
    type: 'text' | 'select' | 'boolean';
    options?: { value: any; label: string }[];
  }[];
}

interface BatchOperationsDialogProps {
  open: boolean;
  onClose: () => void;
  onExecute: (action: string, data?: any) => Promise<void>;
  selectedIds: number[];
  operations: BatchOperation[];
  entityName: string;
}

export function BatchOperationsDialog({
  open,
  onClose,
  onExecute,
  selectedIds,
  operations,
  entityName,
}: BatchOperationsDialogProps) {
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [actionData, setActionData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const currentOperation = operations.find((op) => op.action === selectedAction);

  const handleExecute = async () => {
    if (!selectedAction) return;

    setLoading(true);
    setError('');

    try {
      await onExecute(selectedAction, actionData);
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Fehler beim Ausführen der Operation');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedAction('');
    setActionData({});
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Batch-Operation ausführen</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {/* Selection summary */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Ausgewählte {entityName}:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {selectedIds.map((id) => (
                <Chip key={id} label={`ID: ${id}`} size="small" />
              ))}
            </Box>
            <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
              {selectedIds.length} {entityName} ausgewählt
            </Typography>
          </Box>

          {/* Action selector */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Aktion</InputLabel>
            <Select
              value={selectedAction}
              label="Aktion"
              onChange={(e) => {
                setSelectedAction(e.target.value);
                setActionData({});
              }}
            >
              <MenuItem value="">Bitte wählen...</MenuItem>
              {operations.map((op) => (
                <MenuItem key={op.action} value={op.action}>
                  {op.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Dynamic data fields based on selected operation */}
          {currentOperation?.requiresData && currentOperation.dataFields && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {currentOperation.dataFields.map((field) => {
                if (field.type === 'select') {
                  return (
                    <FormControl key={field.name} fullWidth>
                      <InputLabel>{field.label}</InputLabel>
                      <Select
                        value={actionData[field.name] || ''}
                        label={field.label}
                        onChange={(e) =>
                          setActionData({ ...actionData, [field.name]: e.target.value })
                        }
                      >
                        {field.options?.map((opt) => (
                          <MenuItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  );
                } else if (field.type === 'boolean') {
                  return (
                    <FormControl key={field.name} fullWidth>
                      <InputLabel>{field.label}</InputLabel>
                      <Select
                        value={actionData[field.name] !== undefined ? String(actionData[field.name]) : ''}
                        label={field.label}
                        onChange={(e) =>
                          setActionData({ ...actionData, [field.name]: e.target.value === 'true' })
                        }
                      >
                        <MenuItem value="true">Ja</MenuItem>
                        <MenuItem value="false">Nein</MenuItem>
                      </Select>
                    </FormControl>
                  );
                } else {
                  return (
                    <TextField
                      key={field.name}
                      fullWidth
                      label={field.label}
                      value={actionData[field.name] || ''}
                      onChange={(e) =>
                        setActionData({ ...actionData, [field.name]: e.target.value })
                      }
                    />
                  );
                }
              })}
            </Box>
          )}

          {/* Error display */}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Abbrechen
        </Button>
        <Button
          onClick={handleExecute}
          variant="contained"
          disabled={!selectedAction || loading}
        >
          {loading ? 'Wird ausgeführt...' : 'Ausführen'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
