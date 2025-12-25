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
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  SelectChangeEvent,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { sensorGroupsAPI, sensorsManagementAPI } from '../services/api';
import { SensorGroup, SensorManagement } from '../types';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import SensorsIcon from '@mui/icons-material/Sensors';

export function SensorGroups() {
  const [groups, setGroups] = useState<SensorGroup[]>([]);
  const [allSensors, setAllSensors] = useState<SensorManagement[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<SensorGroup | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sensorIds: [] as number[],
    color: '#1976d2',
    icon: 'sensors',
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [groupsRes, sensorsRes] = await Promise.all([
        sensorGroupsAPI.getAll(),
        sensorsManagementAPI.getAll(),
      ]);
      setGroups(groupsRes.data);
      setAllSensors(sensorsRes.data);
    } catch (error) {
      console.error('Failed to load sensor groups:', error);
    }
  }

  async function handleSubmit() {
    try {
      const data = {
        ...formData,
      };

      if (editingGroup) {
        await sensorGroupsAPI.update(editingGroup.id, data);
      } else {
        await sensorGroupsAPI.create(data);
      }

      setDialogOpen(false);
      setEditingGroup(null);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Failed to save sensor group:', error);
    }
  }

  async function handleDelete(id: number) {
    if (window.confirm('Sensor-Gruppe wirklich löschen?')) {
      try {
        await sensorGroupsAPI.delete(id);
        loadData();
      } catch (error) {
        console.error('Failed to delete sensor group:', error);
      }
    }
  }

  function openDialog(group?: SensorGroup) {
    if (group) {
      setEditingGroup(group);
      setFormData({
        name: group.name,
        description: group.description || '',
        sensorIds: group.sensorIds,
        color: group.color || '#1976d2',
        icon: group.icon || 'sensors',
      });
    } else {
      resetForm();
    }
    setDialogOpen(true);
  }

  function resetForm() {
    setFormData({
      name: '',
      description: '',
      sensorIds: [],
      color: '#1976d2',
      icon: 'sensors',
    });
  }

  function handleSensorChange(event: SelectChangeEvent<number[]>) {
    const {
      target: { value },
    } = event;
    setFormData({
      ...formData,
      sensorIds: typeof value === 'string' ? [] : value,
    });
  }

  const colors = [
    { value: '#1976d2', label: 'Blau' },
    { value: '#388e3c', label: 'Grün' },
    { value: '#d32f2f', label: 'Rot' },
    { value: '#f57c00', label: 'Orange' },
    { value: '#7b1fa2', label: 'Lila' },
    { value: '#0288d1', label: 'Cyan' },
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Sensor-Gruppen</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => openDialog()}>
          Gruppe hinzufügen
        </Button>
      </Box>

      <Grid container spacing={3}>
        {groups.map((group) => (
          <Grid item xs={12} sm={6} md={4} key={group.id}>
            <Card sx={{ borderLeft: `4px solid ${group.color || '#1976d2'}` }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <SensorsIcon sx={{ color: group.color || '#1976d2' }} />
                    <Typography variant="h6">{group.name}</Typography>
                  </Box>
                  <Box>
                    <IconButton size="small" onClick={() => openDialog(group)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(group.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>

                {group.description && (
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {group.description}
                  </Typography>
                )}

                <Box display="flex" gap={1} flexWrap="wrap" mb={1}>
                  <Chip label={`${group.sensorIds.length} Sensoren`} size="small" />
                  <Chip
                    label={group.isActive ? 'Aktiv' : 'Inaktiv'}
                    size="small"
                    color={group.isActive ? 'success' : 'default'}
                  />
                </Box>

                {group.sensors && group.sensors.length > 0 && (
                  <Box mt={2}>
                    <Typography variant="caption" color="text.secondary">
                      Sensoren:
                    </Typography>
                    <List dense>
                      {group.sensors.slice(0, 3).map((sensor) => (
                        <ListItem key={sensor.id} sx={{ px: 0, py: 0.5 }}>
                          <ListItemText
                            primary={sensor.name}
                            secondary={sensor.type}
                            primaryTypographyProps={{ variant: 'body2' }}
                            secondaryTypographyProps={{ variant: 'caption' }}
                          />
                        </ListItem>
                      ))}
                      {group.sensors.length > 3 && (
                        <Typography variant="caption" color="text.secondary">
                          ...und {group.sensors.length - 3} weitere
                        </Typography>
                      )}
                    </List>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingGroup ? 'Gruppe bearbeiten' : 'Neue Gruppe'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Beschreibung"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            margin="normal"
            multiline
            rows={2}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Sensoren</InputLabel>
            <Select
              multiple
              value={formData.sensorIds}
              onChange={handleSensorChange}
              input={<OutlinedInput label="Sensoren" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => {
                    const sensor = allSensors.find((s) => s.id === value);
                    return <Chip key={value} label={sensor?.name || `ID: ${value}`} size="small" />;
                  })}
                </Box>
              )}
            >
              {allSensors.map((sensor) => (
                <MenuItem key={sensor.id} value={sensor.id}>
                  {sensor.name} ({sensor.type})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Farbe</InputLabel>
            <Select
              value={formData.color}
              label="Farbe"
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            >
              {colors.map((color) => (
                <MenuItem key={color.value} value={color.value}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        backgroundColor: color.value,
                        borderRadius: 1,
                      }}
                    />
                    {color.label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Abbrechen</Button>
          <Button onClick={handleSubmit} variant="contained">
            Speichern
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
