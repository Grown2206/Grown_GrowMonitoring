import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  alpha,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocalFlorist as HarvestIcon,
  TrendingUp as TrendingUpIcon,
  Scale as ScaleIcon,
} from '@mui/icons-material';
import { harvestsAPI, plantsAPI } from '../services/api';
import { Harvest, Plant } from '../types';
import { useToast } from '../contexts/ToastContext';

const qualityColors = {
  excellent: '#4CAF50',
  good: '#8BC34A',
  average: '#FFC107',
  poor: '#FF5722',
};

const qualityLabels = {
  excellent: 'Exzellent',
  good: 'Gut',
  average: 'Durchschnitt',
  poor: 'Schlecht',
};

export function Harvests() {
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingHarvest, setEditingHarvest] = useState<Harvest | null>(null);
  const [formData, setFormData] = useState({
    plantId: '',
    harvestDate: new Date().toISOString().split('T')[0],
    wetWeight: '',
    dryWeight: '',
    quality: 'good' as Harvest['quality'],
    notes: '',
  });
  const { success, error: showError } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [harvestsRes, plantsRes] = await Promise.all([harvestsAPI.getAll(), plantsAPI.getAll()]);
      setHarvests(harvestsRes.data);
      setPlants(plantsRes.data);
    } catch (err) {
      showError('Fehler beim Laden der Ernten');
    }
  }

  async function handleSave() {
    try {
      const data = {
        plantId: parseInt(formData.plantId),
        harvestDate: formData.harvestDate,
        wetWeight: formData.wetWeight ? parseFloat(formData.wetWeight) : undefined,
        dryWeight: formData.dryWeight ? parseFloat(formData.dryWeight) : undefined,
        quality: formData.quality,
        notes: formData.notes || undefined,
      };

      if (editingHarvest) {
        await harvestsAPI.update(editingHarvest.id, data);
        success('Ernte aktualisiert');
      } else {
        await harvestsAPI.create(data);
        success('Ernte hinzugefügt');
      }
      setDialogOpen(false);
      setEditingHarvest(null);
      resetForm();
      loadData();
    } catch (err) {
      showError('Fehler beim Speichern');
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Ernte wirklich löschen?')) return;

    try {
      await harvestsAPI.delete(id);
      success('Ernte gelöscht');
      loadData();
    } catch (err) {
      showError('Fehler beim Löschen');
    }
  }

  function openEditDialog(harvest?: Harvest) {
    if (harvest) {
      setEditingHarvest(harvest);
      setFormData({
        plantId: harvest.plantId.toString(),
        harvestDate: harvest.harvestDate.split('T')[0],
        wetWeight: harvest.wetWeight?.toString() || '',
        dryWeight: harvest.dryWeight?.toString() || '',
        quality: harvest.quality,
        notes: harvest.notes || '',
      });
    } else {
      setEditingHarvest(null);
      resetForm();
    }
    setDialogOpen(true);
  }

  function resetForm() {
    setFormData({
      plantId: '',
      harvestDate: new Date().toISOString().split('T')[0],
      wetWeight: '',
      dryWeight: '',
      quality: 'good',
      notes: '',
    });
  }

  const totalWetWeight = harvests.reduce((sum, h) => sum + (h.wetWeight || 0), 0);
  const totalDryWeight = harvests.reduce((sum, h) => sum + (h.dryWeight || 0), 0);
  const avgDryPercent = totalWetWeight > 0 ? (totalDryWeight / totalWetWeight) * 100 : 0;
  const qualityCounts = harvests.reduce((acc, h) => {
    acc[h.quality] = (acc[h.quality] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Ernten & Erträge</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => openEditDialog()}>
          Ernte hinzufügen
        </Button>
      </Box>

      {/* Stats */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: alpha('#4CAF50', 0.1) }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <HarvestIcon />
                <Typography color="text.secondary" variant="body2">
                  Ernten gesamt
                </Typography>
              </Box>
              <Typography variant="h4">{harvests.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: alpha('#2196F3', 0.1) }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <ScaleIcon />
                <Typography color="text.secondary" variant="body2">
                  Nassgewicht gesamt
                </Typography>
              </Box>
              <Typography variant="h4">{totalWetWeight.toFixed(1)}g</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: alpha('#FF9800', 0.1) }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <ScaleIcon />
                <Typography color="text.secondary" variant="body2">
                  Trockengewicht gesamt
                </Typography>
              </Box>
              <Typography variant="h4">{totalDryWeight.toFixed(1)}g</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: alpha('#9C27B0', 0.1) }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <TrendingUpIcon />
                <Typography color="text.secondary" variant="body2">
                  Ø Trocken-Anteil
                </Typography>
              </Box>
              <Typography variant="h4">{avgDryPercent.toFixed(1)}%</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quality Distribution */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Qualitätsverteilung
        </Typography>
        <Grid container spacing={2}>
          {Object.entries(qualityLabels).map(([key, label]) => {
            const count = qualityCounts[key] || 0;
            const percent = harvests.length > 0 ? (count / harvests.length) * 100 : 0;
            return (
              <Grid item xs={12} sm={6} md={3} key={key}>
                <Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">{label}</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {count} ({percent.toFixed(0)}%)
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={percent}
                    sx={{
                      height: 8,
                      borderRadius: 1,
                      bgcolor: alpha(qualityColors[key as keyof typeof qualityColors], 0.2),
                      '& .MuiLinearProgress-bar': {
                        bgcolor: qualityColors[key as keyof typeof qualityColors],
                      },
                    }}
                  />
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Paper>

      {/* Harvests Table */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Ernten-Übersicht
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Datum</TableCell>
                <TableCell>Pflanze</TableCell>
                <TableCell align="right">Nassgewicht</TableCell>
                <TableCell align="right">Trockengewicht</TableCell>
                <TableCell align="right">Trocken %</TableCell>
                <TableCell>Qualität</TableCell>
                <TableCell>Notizen</TableCell>
                <TableCell align="right">Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {harvests.map((harvest) => {
                const plant = plants.find((p) => p.id === harvest.plantId);
                const dryPercent =
                  harvest.wetWeight && harvest.dryWeight ? (harvest.dryWeight / harvest.wetWeight) * 100 : 0;

                return (
                  <TableRow key={harvest.id} hover>
                    <TableCell>{new Date(harvest.harvestDate).toLocaleDateString()}</TableCell>
                    <TableCell>{plant?.name || `Pflanze #${harvest.plantId}`}</TableCell>
                    <TableCell align="right">{harvest.wetWeight ? `${harvest.wetWeight.toFixed(1)}g` : '-'}</TableCell>
                    <TableCell align="right">{harvest.dryWeight ? `${harvest.dryWeight.toFixed(1)}g` : '-'}</TableCell>
                    <TableCell align="right">{dryPercent > 0 ? `${dryPercent.toFixed(1)}%` : '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={qualityLabels[harvest.quality]}
                        size="small"
                        sx={{
                          bgcolor: alpha(qualityColors[harvest.quality], 0.2),
                          color: qualityColors[harvest.quality],
                          fontWeight: 'bold',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {harvest.notes || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => openEditDialog(harvest)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(harvest.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {harvests.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center', mt: 3 }}>
          <HarvestIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Noch keine Ernten erfasst
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Dokumentieren Sie Ihre Ernten mit Gewicht, Qualität und Notizen
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => openEditDialog()}>
            Erste Ernte hinzufügen
          </Button>
        </Paper>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingHarvest ? 'Ernte bearbeiten' : 'Neue Ernte'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            select
            label="Pflanze"
            value={formData.plantId}
            onChange={(e) => setFormData({ ...formData, plantId: e.target.value })}
            margin="normal"
          >
            <MenuItem value="">Pflanze wählen...</MenuItem>
            {plants.map((plant) => (
              <MenuItem key={plant.id} value={plant.id}>
                {plant.name} ({plant.phase})
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            type="date"
            label="Erntedatum"
            value={formData.harvestDate}
            onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="number"
                label="Nassgewicht (g)"
                value={formData.wetWeight}
                onChange={(e) => setFormData({ ...formData, wetWeight: e.target.value })}
                margin="normal"
                inputProps={{ step: '0.1', min: '0' }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="number"
                label="Trockengewicht (g)"
                value={formData.dryWeight}
                onChange={(e) => setFormData({ ...formData, dryWeight: e.target.value })}
                margin="normal"
                inputProps={{ step: '0.1', min: '0' }}
              />
            </Grid>
          </Grid>
          <TextField
            fullWidth
            select
            label="Qualität"
            value={formData.quality}
            onChange={(e) => setFormData({ ...formData, quality: e.target.value as Harvest['quality'] })}
            margin="normal"
          >
            <MenuItem value="excellent">Exzellent</MenuItem>
            <MenuItem value="good">Gut</MenuItem>
            <MenuItem value="average">Durchschnitt</MenuItem>
            <MenuItem value="poor">Schlecht</MenuItem>
          </TextField>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Notizen"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Abbrechen</Button>
          <Button onClick={handleSave} variant="contained" disabled={!formData.plantId}>
            Speichern
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
