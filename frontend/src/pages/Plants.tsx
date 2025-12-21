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
} from '@mui/material';
import { plantsAPI, strainsAPI } from '../services/api';
import { Plant, Strain } from '../types';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';

export function Plants() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [strains, setStrains] = useState<Strain[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlant, setEditingPlant] = useState<Plant | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    strainId: '',
    phase: 'vegetative',
    sensorId: 1,
    plantedDate: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [plantsRes, strainsRes] = await Promise.all([plantsAPI.getAll(), strainsAPI.getAll()]);
      setPlants(plantsRes.data);
      setStrains(strainsRes.data);
    } catch (error) {
      console.error('Failed to load plants:', error);
    }
  }

  async function handleSubmit() {
    try {
      const data = {
        ...formData,
        strainId: formData.strainId ? parseInt(formData.strainId) : null,
        sensorId: parseInt(formData.sensorId.toString()),
      };

      if (editingPlant) {
        await plantsAPI.update(editingPlant.id, data);
      } else {
        await plantsAPI.create(data);
      }

      setDialogOpen(false);
      setEditingPlant(null);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Failed to save plant:', error);
    }
  }

  async function handleDelete(id: number) {
    if (window.confirm('Pflanze wirklich löschen?')) {
      try {
        await plantsAPI.delete(id);
        loadData();
      } catch (error) {
        console.error('Failed to delete plant:', error);
      }
    }
  }

  function openDialog(plant?: Plant) {
    if (plant) {
      setEditingPlant(plant);
      setFormData({
        name: plant.name,
        strainId: plant.strainId?.toString() || '',
        phase: plant.phase,
        sensorId: plant.sensorId,
        plantedDate: plant.plantedDate?.split('T')[0] || '',
      });
    } else {
      resetForm();
    }
    setDialogOpen(true);
  }

  function resetForm() {
    setFormData({
      name: '',
      strainId: '',
      phase: 'vegetative',
      sensorId: 1,
      plantedDate: '',
    });
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Pflanzen</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => openDialog()}>
          Pflanze hinzufügen
        </Button>
      </Box>

      <Grid container spacing={3}>
        {plants.map((plant) => (
          <Grid item xs={12} sm={6} md={4} key={plant.id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                  <Typography variant="h6">{plant.name}</Typography>
                  <Box>
                    <IconButton size="small" onClick={() => openDialog(plant)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(plant.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>

                <Chip label={plant.phase} size="small" color="primary" sx={{ mb: 1 }} />

                {plant.strain && (
                  <Typography variant="body2" color="text.secondary">
                    Sorte: {plant.strain.name} ({plant.strain.type})
                  </Typography>
                )}

                <Typography variant="body2" color="text.secondary">
                  Sensor ID: {plant.sensorId}
                </Typography>

                {plant.plantedDate && (
                  <Typography variant="body2" color="text.secondary">
                    Gepflanzt: {new Date(plant.plantedDate).toLocaleDateString()}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingPlant ? 'Pflanze bearbeiten' : 'Neue Pflanze'}</DialogTitle>
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
            select
            label="Sorte"
            value={formData.strainId}
            onChange={(e) => setFormData({ ...formData, strainId: e.target.value })}
            margin="normal"
          >
            <MenuItem value="">Keine</MenuItem>
            {strains.map((strain) => (
              <MenuItem key={strain.id} value={strain.id}>
                {strain.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            select
            label="Phase"
            value={formData.phase}
            onChange={(e) => setFormData({ ...formData, phase: e.target.value })}
            margin="normal"
          >
            <MenuItem value="germination">Keimung</MenuItem>
            <MenuItem value="seedling">Sämling</MenuItem>
            <MenuItem value="vegetative">Vegetativ</MenuItem>
            <MenuItem value="flowering">Blüte</MenuItem>
            <MenuItem value="harvested">Geerntet</MenuItem>
          </TextField>

          <TextField
            fullWidth
            type="number"
            label="Sensor ID"
            value={formData.sensorId}
            onChange={(e) => setFormData({ ...formData, sensorId: parseInt(e.target.value) })}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            type="date"
            label="Pflanzdatum"
            value={formData.plantedDate}
            onChange={(e) => setFormData({ ...formData, plantedDate: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
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
