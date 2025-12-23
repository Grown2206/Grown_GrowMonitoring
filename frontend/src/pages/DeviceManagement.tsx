import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Stack,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DevicesIcon from '@mui/icons-material/Devices';
import { devicesAPI } from '../services/api';
import { Device } from '../types';
import { toast } from 'react-toastify';
import { DeviceDialog } from '../components/DeviceDialog';

export function DeviceManagement() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDevices();
  }, []);

  async function loadDevices() {
    try {
      setLoading(true);
      const response = await devicesAPI.getAll();
      setDevices(response.data);
    } catch (error) {
      console.error('Failed to load devices:', error);
      toast.error('Fehler beim Laden der Geräte');
    } finally {
      setLoading(false);
    }
  }

  function handleAdd() {
    setEditingDevice(undefined);
    setDialogOpen(true);
  }

  function handleEdit(device: Device) {
    setEditingDevice(device);
    setDialogOpen(true);
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Gerät wirklich löschen?')) return;

    try {
      await devicesAPI.delete(id);
      toast.success('Gerät gelöscht');
      loadDevices();
    } catch (error) {
      console.error('Failed to delete device:', error);
      toast.error('Fehler beim Löschen des Geräts');
    }
  }

  async function handleSave(deviceData: Partial<Device>) {
    try {
      if (editingDevice) {
        await devicesAPI.update(editingDevice.id, deviceData);
        toast.success('Gerät aktualisiert');
      } else {
        await devicesAPI.create(deviceData);
        toast.success('Gerät hinzugefügt');
      }
      setDialogOpen(false);
      loadDevices();
    } catch (error: any) {
      console.error('Failed to save device:', error);
      toast.error(error.response?.data?.error || 'Fehler beim Speichern des Geräts');
    }
  }

  function getStatusColor(status: string): 'success' | 'error' | 'default' {
    switch (status) {
      case 'online':
        return 'success';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  }

  function getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      esp32: 'ESP32',
      esp8266: 'ESP8266',
      raspberry_pi: 'Raspberry Pi',
      other: 'Andere',
    };
    return labels[type] || type;
  }

  function formatLastSeen(lastSeen?: string): string {
    if (!lastSeen) return 'Nie';

    const date = new Date(lastSeen);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Gerade eben';
    if (diffMins < 60) return `vor ${diffMins} Min.`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `vor ${diffHours} Std.`;

    const diffDays = Math.floor(diffHours / 24);
    return `vor ${diffDays} Tag(en)`;
  }

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Lade Geräte...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DevicesIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4">Geräte-Verwaltung</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
          Gerät hinzufügen
        </Button>
      </Stack>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Typ</TableCell>
                <TableCell>Device ID</TableCell>
                <TableCell>IP-Adresse</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Zuletzt gesehen</TableCell>
                <TableCell>Sensoren</TableCell>
                <TableCell>Relays</TableCell>
                <TableCell>Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {devices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Typography color="text.secondary" py={4}>
                      Keine Geräte vorhanden. Klicken Sie auf "Gerät hinzufügen", um zu beginnen.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                devices.map((device) => (
                  <TableRow key={device.id} hover>
                    <TableCell>
                      <Typography fontWeight="medium">{device.name}</Typography>
                      {device.location && (
                        <Typography variant="caption" color="text.secondary">
                          {device.location}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{getTypeLabel(device.type)}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {device.deviceId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {device.ipAddress || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={device.status}
                        size="small"
                        color={getStatusColor(device.status)}
                      />
                    </TableCell>
                    <TableCell>{formatLastSeen(device.lastSeen)}</TableCell>
                    <TableCell>
                      <Chip
                        label={device.sensors?.length || 0}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={device.relays?.length || 0}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleEdit(device)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(device.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <DeviceDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        device={editingDevice}
      />
    </Box>
  );
}
