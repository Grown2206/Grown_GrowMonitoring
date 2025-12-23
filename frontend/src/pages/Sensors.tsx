import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Typography,
  MenuItem,
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { sensorsManagementAPI } from '../services/api';
import { SensorManagement } from '../types';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import TuneIcon from '@mui/icons-material/Tune';

export function Sensors() {
  const [sensors, setSensors] = useState<SensorManagement[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [calibrateDialog, setCalibrateDialog] = useState<number | null>(null);
  const [calibrationOffset, setCalibrationOffset] = useState(0);
  const [editingSensor, setEditingSensor] = useState<SensorManagement | null>(null);
  const [formData, setFormData] = useState({
    sensorId: 1,
    name: '',
    type: 'moisture' as any,
    unit: '%',
    minValue: 0,
    maxValue: 100,
    calibrationOffset: 0,
    location: '',
  });

  useEffect(() => {
    loadSensors();
  }, []);

  async function loadSensors() {
    try {
      const res = await sensorsManagementAPI.getAll();
      setSensors(res.data);
    } catch (error) {
      console.error('Failed to load sensors:', error);
    }
  }

  async function handleSubmit() {
    try {
      if (editingSensor) {
        await sensorsManagementAPI.update(editingSensor.id, formData);
      } else {
        await sensorsManagementAPI.create(formData);
      }
      setDialogOpen(false);
      setEditingSensor(null);
      resetForm();
      loadSensors();
    } catch (error) {
      console.error('Failed to save sensor:', error);
    }
  }

  async function handleDelete(id: number) {
    if (window.confirm('Sensor wirklich löschen?')) {
      try {
        await sensorsManagementAPI.delete(id);
        loadSensors();
      } catch (error) {
        console.error('Failed to delete sensor:', error);
      }
    }
  }

  async function handleCalibrate() {
    if (calibrateDialog) {
      try {
        await sensorsManagementAPI.calibrate(calibrateDialog, calibrationOffset);
        setCalibrateDialog(null);
        setCalibrationOffset(0);
        loadSensors();
      } catch (error) {
        console.error('Failed to calibrate sensor:', error);
      }
    }
  }

  function openDialog(sensor?: SensorManagement) {
    if (sensor) {
      setEditingSensor(sensor);
      setFormData({
        sensorId: sensor.sensorId,
        name: sensor.name,
        type: sensor.type,
        unit: sensor.unit,
        minValue: sensor.minValue,
        maxValue: sensor.maxValue,
        calibrationOffset: sensor.calibrationOffset,
        location: sensor.location || '',
      });
    } else {
      resetForm();
    }
    setDialogOpen(true);
  }

  function resetForm() {
    setFormData({
      sensorId: 1,
      name: '',
      type: 'moisture',
      unit: '%',
      minValue: 0,
      maxValue: 100,
      calibrationOffset: 0,
      location: '',
    });
  }

  const sensorTypeLabels: Record<string, string> = {
    moisture: 'Bodenfeuchtigkeit',
    temperature: 'Temperatur',
    humidity: 'Luftfeuchtigkeit',
    ph: 'pH-Wert',
    ec: 'EC-Wert',
    light: 'Lichtstärke',
    water_level: 'Wasserstand',
    co2: 'CO₂',
    par: 'PAR/PPFD',
    tds: 'TDS (Gesamtsalze)',
    voc: 'VOC (Luftqualität)',
    pm25: 'Feinstaub PM2.5',
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Sensor-Verwaltung</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => openDialog()}>
          Sensor hinzufügen
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Typ</TableCell>
              <TableCell>Einheit</TableCell>
              <TableCell>Bereich</TableCell>
              <TableCell>Kalibrierung</TableCell>
              <TableCell>Standort</TableCell>
              <TableCell>Letzter Wert</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Aktionen</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sensors.map((sensor) => (
              <TableRow key={sensor.id}>
                <TableCell>{sensor.sensorId}</TableCell>
                <TableCell>{sensor.name}</TableCell>
                <TableCell>{sensorTypeLabels[sensor.type]}</TableCell>
                <TableCell>{sensor.unit}</TableCell>
                <TableCell>
                  {sensor.minValue} - {sensor.maxValue}
                </TableCell>
                <TableCell>{(sensor.calibrationOffset ?? 0).toFixed(2)}</TableCell>
                <TableCell>{sensor.location || '-'}</TableCell>
                <TableCell>
                  {sensor.lastReading != null ? `${sensor.lastReading.toFixed(1)} ${sensor.unit}` : '-'}
                </TableCell>
                <TableCell>
                  <Chip label={sensor.isActive ? 'Aktiv' : 'Inaktiv'} color={sensor.isActive ? 'success' : 'default'} size="small" />
                </TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => setCalibrateDialog(sensor.id)}>
                    <TuneIcon />
                  </IconButton>
                  <IconButton size="small" onClick={() => openDialog(sensor)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(sensor.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Sensor Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingSensor ? 'Sensor bearbeiten' : 'Neuer Sensor'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="number"
                label="Sensor ID"
                value={formData.sensorId}
                onChange={(e) => setFormData({ ...formData, sensorId: parseInt(e.target.value) })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                select
                label="Typ"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              >
                {Object.entries(sensorTypeLabels).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Einheit" value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="number"
                label="Min. Wert"
                value={formData.minValue}
                onChange={(e) => setFormData({ ...formData, minValue: parseFloat(e.target.value) })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="number"
                label="Max. Wert"
                value={formData.maxValue}
                onChange={(e) => setFormData({ ...formData, maxValue: parseFloat(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Standort" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Abbrechen</Button>
          <Button onClick={handleSubmit} variant="contained">
            Speichern
          </Button>
        </DialogActions>
      </Dialog>

      {/* Calibration Dialog */}
      <Dialog open={calibrateDialog !== null} onClose={() => setCalibrateDialog(null)}>
        <DialogTitle>Sensor kalibrieren</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            type="number"
            label="Kalibrierungs-Offset"
            value={calibrationOffset}
            onChange={(e) => setCalibrationOffset(parseFloat(e.target.value))}
            helperText="Offset wird zum Sensor-Wert addiert"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCalibrateDialog(null)}>Abbrechen</Button>
          <Button onClick={handleCalibrate} variant="contained">
            Kalibrieren
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
