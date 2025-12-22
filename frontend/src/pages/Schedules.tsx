import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Chip,
  Paper,
  FormControlLabel,
  Checkbox,
  Stack,
  alpha,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  WbIncandescent as LightIcon,
  WaterDrop as WateringIcon,
  Fastfood as FeedingIcon,
  Air as VentilationIcon,
  MoreHoriz as CustomIcon,
} from '@mui/icons-material';
import { schedulesAPI, relaysAPI } from '../services/api';
import { Schedule, Relay } from '../types';
import { useToast } from '../contexts/ToastContext';

const scheduleTypeIcons: Record<string, React.ReactNode> = {
  light: <LightIcon />,
  watering: <WateringIcon />,
  feeding: <FeedingIcon />,
  ventilation: <VentilationIcon />,
  custom: <CustomIcon />,
};

const scheduleTypeColors: Record<string, string> = {
  light: '#FFD700',
  watering: '#4682B4',
  feeding: '#8BC34A',
  ventilation: '#87CEEB',
  custom: '#9370DB',
};

const daysOfWeekNames = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

export function Schedules() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [relays, setRelays] = useState<Relay[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'light' as Schedule['type'],
    relayId: undefined as number | undefined,
    startTime: '08:00',
    endTime: '20:00',
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    enabled: true,
  });
  const { success, error: showError } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [schedulesRes, relaysRes] = await Promise.all([schedulesAPI.getAll(), relaysAPI.getAll()]);
      setSchedules(schedulesRes.data);
      setRelays(relaysRes.data);
    } catch (err) {
      showError('Fehler beim Laden der Zeitpläne');
    }
  }

  async function handleToggle(schedule: Schedule) {
    try {
      await schedulesAPI.update(schedule.id, { enabled: !schedule.enabled });
      success(`Zeitplan ${schedule.name} ${!schedule.enabled ? 'aktiviert' : 'deaktiviert'}`);
      loadData();
    } catch (err) {
      showError('Fehler beim Aktualisieren');
    }
  }

  async function handleSave() {
    try {
      const data = {
        ...formData,
        daysOfWeek: formData.daysOfWeek.sort().join(','),
      };

      if (editingSchedule) {
        await schedulesAPI.update(editingSchedule.id, data);
        success('Zeitplan aktualisiert');
      } else {
        await schedulesAPI.create(data);
        success('Zeitplan erstellt');
      }
      setDialogOpen(false);
      setEditingSchedule(null);
      resetForm();
      loadData();
    } catch (err) {
      showError('Fehler beim Speichern');
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Zeitplan wirklich löschen?')) return;

    try {
      await schedulesAPI.delete(id);
      success('Zeitplan gelöscht');
      loadData();
    } catch (err) {
      showError('Fehler beim Löschen');
    }
  }

  function openEditDialog(schedule?: Schedule) {
    if (schedule) {
      setEditingSchedule(schedule);
      setFormData({
        name: schedule.name,
        type: schedule.type,
        relayId: schedule.relayId,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        daysOfWeek: schedule.daysOfWeek.split(',').map(Number),
        enabled: schedule.enabled,
      });
    } else {
      setEditingSchedule(null);
      resetForm();
    }
    setDialogOpen(true);
  }

  function resetForm() {
    setFormData({
      name: '',
      type: 'light',
      relayId: undefined,
      startTime: '08:00',
      endTime: '20:00',
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      enabled: true,
    });
  }

  function toggleDay(day: number) {
    const days = [...formData.daysOfWeek];
    const index = days.indexOf(day);
    if (index > -1) {
      days.splice(index, 1);
    } else {
      days.push(day);
    }
    setFormData({ ...formData, daysOfWeek: days });
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Zeitpläne & Timer</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => openEditDialog()}>
          Zeitplan hinzufügen
        </Button>
      </Box>

      {/* Stats */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={6} sm={3}>
          <Card sx={{ bgcolor: alpha('#4CAF50', 0.1) }}>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                Gesamt
              </Typography>
              <Typography variant="h4">{schedules.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card sx={{ bgcolor: alpha('#2196F3', 0.1) }}>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                Aktiv
              </Typography>
              <Typography variant="h4">{schedules.filter((s) => s.enabled).length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card sx={{ bgcolor: alpha('#FF9800', 0.1) }}>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                Heute aktiv
              </Typography>
              <Typography variant="h4">
                {
                  schedules.filter(
                    (s) => s.enabled && s.daysOfWeek.split(',').includes(new Date().getDay().toString())
                  ).length
                }
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card sx={{ bgcolor: alpha('#9C27B0', 0.1) }}>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                Mit Relay
              </Typography>
              <Typography variant="h4">{schedules.filter((s) => s.relayId).length}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Schedules List */}
      <Grid container spacing={2}>
        {schedules.map((schedule) => {
          const relay = relays.find((r) => r.id === schedule.relayId);
          const days = schedule.daysOfWeek.split(',').map(Number);
          const isActiveToday = days.includes(new Date().getDay());

          return (
            <Grid item xs={12} md={6} lg={4} key={schedule.id}>
              <Card
                sx={{
                  border: schedule.enabled && isActiveToday ? `2px solid ${scheduleTypeColors[schedule.type]}` : '1px solid',
                  borderColor: schedule.enabled && isActiveToday ? scheduleTypeColors[schedule.type] : 'divider',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box sx={{ color: scheduleTypeColors[schedule.type], fontSize: 32 }}>
                        {scheduleTypeIcons[schedule.type]}
                      </Box>
                      <Box>
                        <Typography variant="h6">{schedule.name}</Typography>
                        <Chip
                          label={schedule.type}
                          size="small"
                          sx={{ bgcolor: alpha(scheduleTypeColors[schedule.type], 0.2), fontSize: 10 }}
                        />
                      </Box>
                    </Box>
                    <Box>
                      <IconButton size="small" onClick={() => openEditDialog(schedule)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(schedule.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  <Paper sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body2" color="text.secondary">
                        Startzeit
                      </Typography>
                      <Typography variant="h6">{schedule.startTime}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        Endzeit
                      </Typography>
                      <Typography variant="h6">{schedule.endTime}</Typography>
                    </Box>
                  </Paper>

                  {relay && (
                    <Box mb={2}>
                      <Chip
                        icon={<LightIcon />}
                        label={`Relay: ${relay.name}`}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    </Box>
                  )}

                  <Box display="flex" gap={0.5} mb={2} flexWrap="wrap">
                    {daysOfWeekNames.map((day, index) => {
                      const isActive = days.includes(index);
                      return (
                        <Chip
                          key={index}
                          label={day}
                          size="small"
                          sx={{
                            bgcolor: isActive ? alpha(scheduleTypeColors[schedule.type], 0.3) : 'default',
                            fontWeight: isActive ? 'bold' : 'normal',
                          }}
                        />
                      );
                    })}
                  </Box>

                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Chip
                      label={schedule.enabled ? 'Aktiviert' : 'Deaktiviert'}
                      color={schedule.enabled ? 'success' : 'default'}
                      size="small"
                    />
                    <Switch checked={schedule.enabled} onChange={() => handleToggle(schedule)} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {schedules.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <ScheduleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Keine Zeitpläne vorhanden
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Erstellen Sie automatische Zeitpläne für Beleuchtung, Bewässerung und mehr
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => openEditDialog()}>
            Zeitplan erstellen
          </Button>
        </Paper>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingSchedule ? 'Zeitplan bearbeiten' : 'Neuer Zeitplan'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            select
            label="Typ"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as Schedule['type'] })}
            margin="normal"
          >
            <MenuItem value="light">Beleuchtung</MenuItem>
            <MenuItem value="watering">Bewässerung</MenuItem>
            <MenuItem value="feeding">Düngung</MenuItem>
            <MenuItem value="ventilation">Belüftung</MenuItem>
            <MenuItem value="custom">Benutzerdefiniert</MenuItem>
          </TextField>
          <TextField
            fullWidth
            select
            label="Relay (optional)"
            value={formData.relayId || ''}
            onChange={(e) => setFormData({ ...formData, relayId: e.target.value ? parseInt(e.target.value) : undefined })}
            margin="normal"
          >
            <MenuItem value="">Kein Relay</MenuItem>
            {relays.map((relay) => (
              <MenuItem key={relay.id} value={relay.id}>
                {relay.name} (ID: {relay.relayId})
              </MenuItem>
            ))}
          </TextField>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="time"
                label="Startzeit"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="time"
                label="Endzeit"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
          <Box mt={2}>
            <Typography variant="subtitle2" gutterBottom>
              Wochentage
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {daysOfWeekNames.map((day, index) => (
                <Chip
                  key={index}
                  label={day}
                  onClick={() => toggleDay(index)}
                  color={formData.daysOfWeek.includes(index) ? 'primary' : 'default'}
                  variant={formData.daysOfWeek.includes(index) ? 'filled' : 'outlined'}
                />
              ))}
            </Stack>
          </Box>
          <FormControlLabel
            control={
              <Switch
                checked={formData.enabled}
                onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
              />
            }
            label="Aktiviert"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Abbrechen</Button>
          <Button onClick={handleSave} variant="contained" disabled={!formData.name || formData.daysOfWeek.length === 0}>
            Speichern
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
