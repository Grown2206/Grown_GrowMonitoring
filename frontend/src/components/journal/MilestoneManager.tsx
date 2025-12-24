import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
  Rating,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  EmojiEvents as MilestoneIcon,
} from '@mui/icons-material';
import { milestonesAPI } from '../../services/api';
import { Milestone, MilestoneType } from '../../types';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

interface MilestoneManagerProps {
  plantId: number;
  onUpdate?: () => void;
}

const MILESTONE_TYPES: { value: MilestoneType; label: string; emoji: string }[] = [
  { value: 'germination', label: 'Germination', emoji: '🌱' },
  { value: 'seedling', label: 'Seedling', emoji: '🌿' },
  { value: 'vegetative', label: 'Vegetative', emoji: '🌳' },
  { value: 'flowering', label: 'Flowering', emoji: '🌸' },
  { value: 'harvest', label: 'Harvest', emoji: '🌾' },
  { value: 'topping', label: 'Topping', emoji: '✂️' },
  { value: 'training', label: 'Training', emoji: '🎯' },
  { value: 'transplant', label: 'Transplant', emoji: '🪴' },
  { value: 'problem', label: 'Problem', emoji: '⚠️' },
  { value: 'achievement', label: 'Achievement', emoji: '🏆' },
  { value: 'custom', label: 'Custom', emoji: '📌' },
];

export const MilestoneManager: React.FC<MilestoneManagerProps> = ({ plantId, onUpdate }) => {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);

  const [formData, setFormData] = useState({
    type: 'custom' as MilestoneType,
    title: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    importance: 3,
  });

  useEffect(() => {
    loadMilestones();
  }, [plantId]);

  const loadMilestones = async () => {
    try {
      setLoading(true);
      const response = await milestonesAPI.getAll(plantId);
      setMilestones(response.data);
    } catch (error) {
      console.error('Error loading milestones:', error);
      toast.error('Fehler beim Laden der Meilensteine');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (milestone?: Milestone) => {
    if (milestone) {
      setEditingMilestone(milestone);
      setFormData({
        type: milestone.type,
        title: milestone.title,
        description: milestone.description || '',
        date: format(new Date(milestone.date), 'yyyy-MM-dd'),
        importance: milestone.importance || 3,
      });
    } else {
      setEditingMilestone(null);
      setFormData({
        type: 'custom',
        title: '',
        description: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        importance: 3,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingMilestone(null);
  };

  const handleSave = async () => {
    try {
      const data = {
        ...formData,
        plantId,
      };

      if (editingMilestone) {
        await milestonesAPI.update(editingMilestone.id, data);
        toast.success('Meilenstein aktualisiert');
      } else {
        await milestonesAPI.create(data);
        toast.success('Meilenstein erstellt');
      }

      handleCloseDialog();
      loadMilestones();
      onUpdate?.();
    } catch (error) {
      console.error('Error saving milestone:', error);
      toast.error('Fehler beim Speichern');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Meilenstein wirklich löschen?')) return;

    try {
      await milestonesAPI.delete(id);
      toast.success('Meilenstein gelöscht');
      loadMilestones();
      onUpdate?.();
    } catch (error) {
      console.error('Error deleting milestone:', error);
      toast.error('Fehler beim Löschen');
    }
  };

  const getMilestoneTypeInfo = (type: MilestoneType) => {
    return MILESTONE_TYPES.find(t => t.value === type) || MILESTONE_TYPES[MILESTONE_TYPES.length - 1];
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">
          <MilestoneIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Meilensteine
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Neuer Meilenstein
        </Button>
      </Box>

      <Grid container spacing={2}>
        {milestones.map((milestone) => {
          const typeInfo = getMilestoneTypeInfo(milestone.type);
          return (
            <Grid item xs={12} md={6} key={milestone.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box flex={1}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Typography variant="h6">
                          {typeInfo.emoji} {milestone.title}
                        </Typography>
                      </Box>

                      <Chip
                        label={typeInfo.label}
                        size="small"
                        color="primary"
                        sx={{ mr: 1, mb: 1 }}
                      />
                      <Chip
                        label={format(new Date(milestone.date), 'dd.MM.yyyy')}
                        size="small"
                        variant="outlined"
                        sx={{ mb: 1 }}
                      />

                      {milestone.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {milestone.description}
                        </Typography>
                      )}

                      <Box mt={1} display="flex" alignItems="center" gap={1}>
                        <Typography variant="caption">Wichtigkeit:</Typography>
                        <Rating
                          value={milestone.importance || 3}
                          readOnly
                          size="small"
                        />
                      </Box>
                    </Box>

                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(milestone)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(milestone.id)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {milestones.length === 0 && !loading && (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight={200}
          textAlign="center"
        >
          <MilestoneIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Keine Meilensteine vorhanden
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Erstelle deinen ersten Meilenstein um wichtige Ereignisse zu dokumentieren
          </Typography>
        </Box>
      )}

      {/* Dialog for creating/editing milestone */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingMilestone ? 'Meilenstein bearbeiten' : 'Neuer Meilenstein'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Typ</InputLabel>
              <Select
                value={formData.type}
                label="Typ"
                onChange={(e) => setFormData({ ...formData, type: e.target.value as MilestoneType })}
              >
                {MILESTONE_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.emoji} {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Titel"
              fullWidth
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />

            <TextField
              label="Beschreibung"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />

            <TextField
              label="Datum"
              type="date"
              fullWidth
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />

            <Box>
              <Typography variant="body2" gutterBottom>
                Wichtigkeit
              </Typography>
              <Rating
                value={formData.importance}
                onChange={(_, value) => setFormData({ ...formData, importance: value || 3 })}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Abbrechen</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={!formData.title}
          >
            Speichern
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
