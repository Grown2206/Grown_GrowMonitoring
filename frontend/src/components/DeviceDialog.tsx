import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { Device } from '../types';

interface DeviceDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (device: Partial<Device>) => void;
  device?: Device;
}

export function DeviceDialog({ open, onClose, onSave, device }: DeviceDialogProps) {
  const [formData, setFormData] = useState<Partial<Device>>({
    deviceId: '',
    name: '',
    type: 'esp32',
    ipAddress: '',
    macAddress: '',
    firmwareVersion: '',
    location: '',
    description: '',
    status: 'offline',
    isActive: true,
  });

  useEffect(() => {
    if (device) {
      setFormData(device);
    } else {
      setFormData({
        deviceId: '',
        name: '',
        type: 'esp32',
        ipAddress: '',
        macAddress: '',
        firmwareVersion: '',
        location: '',
        description: '',
        status: 'offline',
        isActive: true,
      });
    }
  }, [device, open]);

  function handleChange(field: keyof Device, value: any) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(formData);
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{device ? 'Gerät bearbeiten' : 'Neues Gerät hinzufügen'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                select
                label="Typ"
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
              >
                <MenuItem value="esp32">ESP32</MenuItem>
                <MenuItem value="esp8266">ESP8266</MenuItem>
                <MenuItem value="raspberry_pi">Raspberry Pi</MenuItem>
                <MenuItem value="other">Andere</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Device ID"
                value={formData.deviceId}
                onChange={(e) => handleChange('deviceId', e.target.value)}
                disabled={!!device}
                helperText={device ? 'Device ID kann nicht geändert werden' : 'Eindeutige Kennung (z.B. MAC-Adresse)'}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="IP-Adresse"
                value={formData.ipAddress}
                onChange={(e) => handleChange('ipAddress', e.target.value)}
                placeholder="192.168.1.100"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="MAC-Adresse"
                value={formData.macAddress}
                onChange={(e) => handleChange('macAddress', e.target.value)}
                placeholder="AA:BB:CC:DD:EE:FF"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Firmware-Version"
                value={formData.firmwareVersion}
                onChange={(e) => handleChange('firmwareVersion', e.target.value)}
                placeholder="1.0.0"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Standort"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="Grow Room 1"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Status"
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
              >
                <MenuItem value="online">Online</MenuItem>
                <MenuItem value="offline">Offline</MenuItem>
                <MenuItem value="error">Fehler</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Beschreibung"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Optionale Beschreibung..."
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => handleChange('isActive', e.target.checked)}
                  />
                }
                label="Gerät aktiv"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Abbrechen</Button>
          <Button type="submit" variant="contained">
            {device ? 'Speichern' : 'Hinzufügen'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
