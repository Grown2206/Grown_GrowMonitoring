import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Grid,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import CalculateIcon from '@mui/icons-material/Calculate';
import { virtualSensorsAPI, sensorsManagementAPI } from '../services/api';
import {
  VirtualSensor,
  VirtualSensorType,
  VirtualSensorTypeInfo,
  SensorManagement,
} from '../types';

export const VirtualSensors: React.FC = () => {
  const [virtualSensors, setVirtualSensors] = useState<VirtualSensor[]>([]);
  const [physicalSensors, setPhysicalSensors] = useState<SensorManagement[]>([]);
  const [typesInfo, setTypesInfo] = useState<VirtualSensorTypeInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSensor, setSelectedSensor] = useState<VirtualSensor | null>(null);
  const [error, setError] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    type: 'vpd' as VirtualSensorType,
    sensorId: 1000,
    description: '',
    sourceSensorIds: [] as number[],
    unit: 'kPa',
    enabled: true,
    updateIntervalMinutes: 5,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [vsResponse, psResponse, tiResponse] = await Promise.all([
        virtualSensorsAPI.getAll(),
        sensorsManagementAPI.getAll(),
        virtualSensorsAPI.getTypesInfo(),
      ]);
      setVirtualSensors(vsResponse.data);
      setPhysicalSensors(psResponse.data);
      setTypesInfo(tiResponse.data);
      setError('');
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError('Fehler beim Laden der Daten');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (sensor?: VirtualSensor) => {
    if (sensor) {
      setSelectedSensor(sensor);
      setFormData({
        name: sensor.name,
        type: sensor.type,
        sensorId: sensor.sensorId,
        description: sensor.description || '',
        sourceSensorIds: sensor.config.sourceSensorIds,
        unit: sensor.unit,
        enabled: sensor.enabled,
        updateIntervalMinutes: sensor.updateIntervalMinutes,
      });
    } else {
      setSelectedSensor(null);
      // Find next available sensor ID
      const maxId = Math.max(
        ...virtualSensors.map((vs) => vs.sensorId),
        ...physicalSensors.map((ps) => ps.id),
        999
      );
      setFormData({
        name: '',
        type: 'vpd',
        sensorId: maxId + 1,
        description: '',
        sourceSensorIds: [],
        unit: 'kPa',
        enabled: true,
        updateIntervalMinutes: 5,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedSensor(null);
    setError('');
  };

  const handleTypeChange = (type: VirtualSensorType) => {
    const typeInfo = typesInfo.find((ti) => ti.type === type);
    setFormData({
      ...formData,
      type,
      unit: typeInfo?.unit || '',
      sourceSensorIds: [],
    });
  };

  const handleSave = async () => {
    try {
      const config = {
        sourceSensorIds: formData.sourceSensorIds,
      };

      const data = {
        name: formData.name,
        type: formData.type,
        sensorId: formData.sensorId,
        description: formData.description,
        config,
        unit: formData.unit,
        enabled: formData.enabled,
        updateIntervalMinutes: formData.updateIntervalMinutes,
      };

      if (selectedSensor) {
        await virtualSensorsAPI.update(selectedSensor.id, data);
      } else {
        await virtualSensorsAPI.create(data);
      }

      handleCloseDialog();
      loadData();
    } catch (err: any) {
      console.error('Error saving virtual sensor:', err);
      setError(err.response?.data?.error || 'Fehler beim Speichern');
    }
  };

  const handleDelete = async () => {
    if (!selectedSensor) return;

    try {
      await virtualSensorsAPI.delete(selectedSensor.id);
      setDeleteDialogOpen(false);
      setSelectedSensor(null);
      loadData();
    } catch (err: any) {
      console.error('Error deleting virtual sensor:', err);
      setError(err.response?.data?.error || 'Fehler beim Löschen');
    }
  };

  const handleCalculate = async (sensor: VirtualSensor) => {
    try {
      await virtualSensorsAPI.calculate(sensor.id);
      loadData();
    } catch (err: any) {
      console.error('Error calculating virtual sensor:', err);
      setError(err.response?.data?.error || 'Fehler bei der Berechnung');
    }
  };

  const getTypeColor = (type: VirtualSensorType): string => {
    const colors: Record<VirtualSensorType, string> = {
      vpd: '#2196f3',
      dli: '#ff9800',
      dew_point: '#00bcd4',
      heat_index: '#f44336',
      absolute_humidity: '#9c27b0',
      custom: '#607d8b',
    };
    return colors[type] || '#9e9e9e';
  };

  const currentTypeInfo = typesInfo.find((ti) => ti.type === formData.type);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Virtuelle Sensoren</Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadData}
            sx={{ mr: 1 }}
          >
            Aktualisieren
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Neuer Virtueller Sensor
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {virtualSensors.map((sensor) => (
          <Grid item xs={12} sm={6} md={4} key={sensor.id}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                <Box flex={1}>
                  <Typography variant="h6" gutterBottom>
                    {sensor.name}
                  </Typography>
                  <Chip
                    label={sensor.type.toUpperCase()}
                    size="small"
                    sx={{
                      backgroundColor: getTypeColor(sensor.type),
                      color: 'white',
                      fontWeight: 'bold',
                    }}
                  />
                </Box>
                <Box>
                  <Tooltip title="Berechnen">
                    <IconButton
                      size="small"
                      onClick={() => handleCalculate(sensor)}
                      sx={{ mr: 0.5 }}
                    >
                      <CalculateIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Bearbeiten">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(sensor)}
                      sx={{ mr: 0.5 }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Löschen">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedSensor(sensor);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              {sensor.description && (
                <Typography variant="body2" color="textSecondary" mb={1}>
                  {sensor.description}
                </Typography>
              )}

              <Box mt={2}>
                <Typography variant="body2" color="textSecondary">
                  Aktueller Wert:
                </Typography>
                <Typography variant="h5">
                  {sensor.lastValue !== null && sensor.lastValue !== undefined
                    ? `${sensor.lastValue} ${sensor.unit}`
                    : 'Keine Daten'}
                </Typography>
                {sensor.lastCalculated && (
                  <Typography variant="caption" color="textSecondary">
                    Zuletzt berechnet:{' '}
                    {new Date(sensor.lastCalculated).toLocaleString('de-DE')}
                  </Typography>
                )}
              </Box>

              <Box mt={2}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Quell-Sensoren: {sensor.config.sourceSensorIds.length}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Intervall: {sensor.updateIntervalMinutes} min
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Status: {sensor.enabled ? '✅ Aktiv' : '⚫ Deaktiviert'}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}

        {virtualSensors.length === 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Keine virtuellen Sensoren vorhanden
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Erstelle virtuelle Sensoren wie VPD, DLI oder Dew Point basierend auf
                physischen Sensordaten.
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
                sx={{ mt: 2 }}
              >
                Ersten Virtuellen Sensor erstellen
              </Button>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedSensor ? 'Virtuellen Sensor bearbeiten' : 'Neuen Virtuellen Sensor erstellen'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Sensor-Typ</InputLabel>
                <Select
                  value={formData.type}
                  label="Sensor-Typ"
                  onChange={(e) => handleTypeChange(e.target.value as VirtualSensorType)}
                >
                  {typesInfo.map((ti) => (
                    <MenuItem key={ti.type} value={ti.type}>
                      {ti.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {currentTypeInfo && (
              <Grid item xs={12}>
                <Alert severity="info">
                  <Typography variant="body2">
                    <strong>{currentTypeInfo.name}</strong>: {currentTypeInfo.description}
                  </Typography>
                  <Typography variant="caption">
                    Benötigt: {currentTypeInfo.requiredSensors} Sensor(en) (
                    {currentTypeInfo.sensorTypes.join(', ')})
                  </Typography>
                </Alert>
              </Grid>
            )}

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Sensor ID"
                value={formData.sensorId}
                onChange={(e) =>
                  setFormData({ ...formData, sensorId: parseInt(e.target.value) })
                }
                required
                helperText="Eindeutige ID für diesen virtuellen Sensor"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Einheit"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Quell-Sensoren</InputLabel>
                <Select
                  multiple
                  value={formData.sourceSensorIds}
                  label="Quell-Sensoren"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sourceSensorIds: e.target.value as number[],
                    })
                  }
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as number[]).map((id) => {
                        const sensor = physicalSensors.find((s) => s.id === id);
                        return (
                          <Chip
                            key={id}
                            label={sensor?.name || `Sensor ${id}`}
                            size="small"
                          />
                        );
                      })}
                    </Box>
                  )}
                >
                  {physicalSensors.map((sensor) => (
                    <MenuItem key={sensor.id} value={sensor.id}>
                      {sensor.name} ({sensor.type})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Beschreibung"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Update-Intervall (Minuten)"
                value={formData.updateIntervalMinutes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    updateIntervalMinutes: parseInt(e.target.value),
                  })
                }
                required
                inputProps={{ min: 1 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.enabled}
                    onChange={(e) =>
                      setFormData({ ...formData, enabled: e.target.checked })
                    }
                  />
                }
                label="Sensor aktiviert"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Abbrechen</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            {selectedSensor ? 'Aktualisieren' : 'Erstellen'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Virtuellen Sensor löschen?</DialogTitle>
        <DialogContent>
          <Typography>
            Möchten Sie den virtuellen Sensor "{selectedSensor?.name}" wirklich löschen?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Abbrechen</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Löschen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VirtualSensors;
