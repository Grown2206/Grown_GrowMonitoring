import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
} from '@mui/icons-material';
import { reportsAPI } from '../services/api';
import { toast } from 'react-toastify';

interface ReportSchedule {
  id: number;
  name: string;
  type: 'daily' | 'weekly' | 'monthly';
  enabled: boolean;
  recipientEmail: string;
  reportFormat: 'pdf' | 'html';
  includeCharts: boolean;
  includeSensorData: boolean;
  includePlantStatus: boolean;
  includeHarvests: boolean;
  includeAlerts: boolean;
  dayOfWeek?: number;
  dayOfMonth?: number;
  timeOfDay: string;
  lastRun?: string;
  nextRun?: string;
}

const DAYS_OF_WEEK = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

export const ReportManagement: React.FC = () => {
  const [schedules, setSchedules] = useState<ReportSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ReportSchedule | null>(null);
  const [formData, setFormData] = useState<Partial<ReportSchedule>>({
    name: '',
    type: 'daily',
    enabled: true,
    recipientEmail: '',
    reportFormat: 'html',
    includeCharts: true,
    includeSensorData: true,
    includePlantStatus: true,
    includeHarvests: true,
    includeAlerts: true,
    timeOfDay: '08:00',
  });

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const response = await reportsAPI.getAll();
      setSchedules(response.data);
    } catch (error) {
      toast.error('Fehler beim Laden der Report-Schedules');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (schedule?: ReportSchedule) => {
    if (schedule) {
      setEditingSchedule(schedule);
      setFormData(schedule);
    } else {
      setEditingSchedule(null);
      setFormData({
        name: '',
        type: 'daily',
        enabled: true,
        recipientEmail: '',
        reportFormat: 'html',
        includeCharts: true,
        includeSensorData: true,
        includePlantStatus: true,
        includeHarvests: true,
        includeAlerts: true,
        timeOfDay: '08:00',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingSchedule(null);
  };

  const handleSave = async () => {
    try {
      if (editingSchedule) {
        await reportsAPI.update(editingSchedule.id, formData);
        toast.success('Report-Schedule aktualisiert');
      } else {
        await reportsAPI.create(formData);
        toast.success('Report-Schedule erstellt');
      }
      handleCloseDialog();
      loadSchedules();
    } catch (error) {
      toast.error('Fehler beim Speichern');
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Möchten Sie diesen Report-Schedule wirklich löschen?')) return;

    try {
      await reportsAPI.delete(id);
      toast.success('Report-Schedule gelöscht');
      loadSchedules();
    } catch (error) {
      toast.error('Fehler beim Löschen');
      console.error(error);
    }
  };

  const handleToggle = async (id: number) => {
    try {
      await reportsAPI.toggle(id);
      toast.success('Status geändert');
      loadSchedules();
    } catch (error) {
      toast.error('Fehler beim Ändern des Status');
      console.error(error);
    }
  };

  const handleSendNow = async (id: number) => {
    try {
      await reportsAPI.sendNow(id);
      toast.success('Report wird gesendet...');
    } catch (error) {
      toast.error('Fehler beim Senden des Reports');
      console.error(error);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Nie';
    return new Date(dateString).toLocaleString('de-DE');
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Automatische Reports</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Neuer Report-Schedule
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Typ</TableCell>
              <TableCell>Empfänger</TableCell>
              <TableCell>Format</TableCell>
              <TableCell>Zeitpunkt</TableCell>
              <TableCell>Letzter Lauf</TableCell>
              <TableCell>Nächster Lauf</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Aktionen</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  Laden...
                </TableCell>
              </TableRow>
            ) : schedules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  Keine Report-Schedules vorhanden
                </TableCell>
              </TableRow>
            ) : (
              schedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell>{schedule.name}</TableCell>
                  <TableCell>
                    <Chip
                      label={
                        schedule.type === 'daily'
                          ? 'Täglich'
                          : schedule.type === 'weekly'
                          ? 'Wöchentlich'
                          : 'Monatlich'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{schedule.recipientEmail}</TableCell>
                  <TableCell>{schedule.reportFormat.toUpperCase()}</TableCell>
                  <TableCell>
                    {schedule.timeOfDay}
                    {schedule.type === 'weekly' && schedule.dayOfWeek !== undefined && (
                      <>, {DAYS_OF_WEEK[schedule.dayOfWeek]}</>
                    )}
                    {schedule.type === 'monthly' && schedule.dayOfMonth && (
                      <>, {schedule.dayOfMonth}. des Monats</>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(schedule.lastRun)}</TableCell>
                  <TableCell>{formatDate(schedule.nextRun)}</TableCell>
                  <TableCell>
                    <Chip
                      label={schedule.enabled ? 'Aktiv' : 'Inaktiv'}
                      color={schedule.enabled ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleToggle(schedule.id)}
                      title={schedule.enabled ? 'Deaktivieren' : 'Aktivieren'}
                    >
                      {schedule.enabled ? <ToggleOnIcon /> : <ToggleOffIcon />}
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleSendNow(schedule.id)}
                      title="Jetzt senden"
                    >
                      <SendIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(schedule)}
                      title="Bearbeiten"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(schedule.id)}
                      title="Löschen"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingSchedule ? 'Report-Schedule bearbeiten' : 'Neuer Report-Schedule'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Typ</InputLabel>
                <Select
                  value={formData.type}
                  label="Typ"
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                >
                  <MenuItem value="daily">Täglich</MenuItem>
                  <MenuItem value="weekly">Wöchentlich</MenuItem>
                  <MenuItem value="monthly">Monatlich</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="time"
                label="Uhrzeit"
                value={formData.timeOfDay}
                onChange={(e) => setFormData({ ...formData, timeOfDay: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {formData.type === 'weekly' && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Wochentag</InputLabel>
                  <Select
                    value={formData.dayOfWeek ?? 1}
                    label="Wochentag"
                    onChange={(e) => setFormData({ ...formData, dayOfWeek: Number(e.target.value) })}
                  >
                    {DAYS_OF_WEEK.map((day, index) => (
                      <MenuItem key={index} value={index}>
                        {day}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {formData.type === 'monthly' && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Tag des Monats"
                  value={formData.dayOfMonth ?? 1}
                  onChange={(e) => setFormData({ ...formData, dayOfMonth: Number(e.target.value) })}
                  inputProps={{ min: 1, max: 31 }}
                />
              </Grid>
            )}

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Empfänger E-Mail"
                type="email"
                value={formData.recipientEmail}
                onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Format</InputLabel>
                <Select
                  value={formData.reportFormat}
                  label="Format"
                  onChange={(e) => setFormData({ ...formData, reportFormat: e.target.value as any })}
                >
                  <MenuItem value="html">HTML (E-Mail)</MenuItem>
                  <MenuItem value="pdf">PDF (Anhang)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Inhalt
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.includeCharts ?? true}
                    onChange={(e) => setFormData({ ...formData, includeCharts: e.target.checked })}
                  />
                }
                label="Charts einschließen"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.includeSensorData ?? true}
                    onChange={(e) => setFormData({ ...formData, includeSensorData: e.target.checked })}
                  />
                }
                label="Sensordaten einschließen"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.includePlantStatus ?? true}
                    onChange={(e) => setFormData({ ...formData, includePlantStatus: e.target.checked })}
                  />
                }
                label="Pflanzenstatus einschließen"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.includeHarvests ?? true}
                    onChange={(e) => setFormData({ ...formData, includeHarvests: e.target.checked })}
                  />
                }
                label="Ernten einschließen"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.includeAlerts ?? true}
                    onChange={(e) => setFormData({ ...formData, includeAlerts: e.target.checked })}
                  />
                }
                label="Alerts einschließen"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.enabled ?? true}
                    onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  />
                }
                label="Aktiviert"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Abbrechen</Button>
          <Button onClick={handleSave} variant="contained">
            Speichern
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
