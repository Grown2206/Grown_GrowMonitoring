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
  Switch,
  FormControlLabel,
} from '@mui/material';
import { automationAPI } from '../services/api';
import { AutomationRule } from '../types';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

export function Automation() {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    enabled: true,
    triggerType: 'time' as any,
    actionType: 'relay' as any,
    // For time trigger
    cronExpression: '0 8 * * *',
    // For sensor trigger
    sensorId: 1,
    threshold: 30,
    operator: '<',
    // For actions
    relayId: 1,
    relayStatus: true,
    pumpId: 1,
    pumpDuration: 5,
    notificationMessage: '',
  });

  useEffect(() => {
    loadRules();
  }, []);

  async function loadRules() {
    try {
      const res = await automationAPI.getAll();
      setRules(res.data);
    } catch (error) {
      console.error('Failed to load rules:', error);
    }
  }

  async function handleSubmit() {
    try {
      // Build trigger and action configs
      let triggerConfig: any = {};
      let actionConfig: any = {};

      if (formData.triggerType === 'time') {
        triggerConfig = { cron: formData.cronExpression };
      } else if (formData.triggerType === 'sensor') {
        triggerConfig = {
          sensorId: formData.sensorId,
          threshold: formData.threshold,
          operator: formData.operator,
        };
      }

      if (formData.actionType === 'relay') {
        actionConfig = { relayId: formData.relayId, status: formData.relayStatus };
      } else if (formData.actionType === 'pump') {
        actionConfig = { pumpId: formData.pumpId, duration: formData.pumpDuration };
      } else if (formData.actionType === 'notification') {
        actionConfig = { message: formData.notificationMessage };
      }

      const data = {
        name: formData.name,
        description: formData.description,
        enabled: formData.enabled,
        triggerType: formData.triggerType,
        triggerConfig: JSON.stringify(triggerConfig),
        actionType: formData.actionType,
        actionConfig: JSON.stringify(actionConfig),
      };

      if (editingRule) {
        await automationAPI.update(editingRule.id, data);
      } else {
        await automationAPI.create(data);
      }

      setDialogOpen(false);
      setEditingRule(null);
      resetForm();
      loadRules();
    } catch (error) {
      console.error('Failed to save rule:', error);
    }
  }

  async function handleDelete(id: number) {
    if (window.confirm('Regel wirklich löschen?')) {
      try {
        await automationAPI.delete(id);
        loadRules();
      } catch (error) {
        console.error('Failed to delete rule:', error);
      }
    }
  }

  async function handleToggle(rule: AutomationRule) {
    try {
      await automationAPI.update(rule.id, { ...rule, enabled: !rule.enabled });
      loadRules();
    } catch (error) {
      console.error('Failed to toggle rule:', error);
    }
  }

  async function handleTrigger(id: number) {
    try {
      await automationAPI.trigger(id);
      alert('Regel ausgeführt!');
      loadRules();
    } catch (error: any) {
      alert('Fehler: ' + (error.response?.data?.error || error.message));
    }
  }

  function openDialog(rule?: AutomationRule) {
    if (rule) {
      setEditingRule(rule);
      const triggerConfig = JSON.parse(rule.triggerConfig);
      const actionConfig = JSON.parse(rule.actionConfig);

      setFormData({
        name: rule.name,
        description: rule.description || '',
        enabled: rule.enabled,
        triggerType: rule.triggerType,
        actionType: rule.actionType,
        cronExpression: triggerConfig.cron || '0 8 * * *',
        sensorId: triggerConfig.sensorId || 1,
        threshold: triggerConfig.threshold || 30,
        operator: triggerConfig.operator || '<',
        relayId: actionConfig.relayId || 1,
        relayStatus: actionConfig.status !== undefined ? actionConfig.status : true,
        pumpId: actionConfig.pumpId || 1,
        pumpDuration: actionConfig.duration || 5,
        notificationMessage: actionConfig.message || '',
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
      enabled: true,
      triggerType: 'time',
      actionType: 'relay',
      cronExpression: '0 8 * * *',
      sensorId: 1,
      threshold: 30,
      operator: '<',
      relayId: 1,
      relayStatus: true,
      pumpId: 1,
      pumpDuration: 5,
      notificationMessage: '',
    });
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Automatisierung</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => openDialog()}>
          Regel hinzufügen
        </Button>
      </Box>

      <Grid container spacing={3}>
        {rules.map((rule) => (
          <Grid item xs={12} md={6} key={rule.id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                  <Box>
                    <Typography variant="h6">{rule.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {rule.description}
                    </Typography>
                  </Box>
                  <Box>
                    <Switch checked={rule.enabled} onChange={() => handleToggle(rule)} />
                  </Box>
                </Box>

                <Box display="flex" gap={1} mb={2}>
                  <Chip label={`Trigger: ${rule.triggerType}`} size="small" color="primary" />
                  <Chip label={`Action: ${rule.actionType}`} size="small" color="secondary" />
                </Box>

                <Typography variant="body2" color="text.secondary">
                  Ausgeführt: {rule.triggerCount}x
                </Typography>
                {rule.lastTriggered && (
                  <Typography variant="body2" color="text.secondary">
                    Zuletzt: {new Date(rule.lastTriggered).toLocaleString()}
                  </Typography>
                )}

                <Box display="flex" gap={1} mt={2}>
                  <IconButton size="small" onClick={() => handleTrigger(rule.id)} color="primary">
                    <PlayArrowIcon />
                  </IconButton>
                  <IconButton size="small" onClick={() => openDialog(rule)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(rule.id)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingRule ? 'Regel bearbeiten' : 'Neue Regel'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
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

            <Grid item xs={6}>
              <TextField
                fullWidth
                select
                label="Trigger-Typ"
                value={formData.triggerType}
                onChange={(e) => setFormData({ ...formData, triggerType: e.target.value as any })}
              >
                <MenuItem value="time">Zeit (Cron)</MenuItem>
                <MenuItem value="sensor">Sensor-Wert</MenuItem>
                <MenuItem value="manual">Manuell</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                select
                label="Action-Typ"
                value={formData.actionType}
                onChange={(e) => setFormData({ ...formData, actionType: e.target.value as any })}
              >
                <MenuItem value="relay">Relais</MenuItem>
                <MenuItem value="pump">Pumpe</MenuItem>
                <MenuItem value="notification">Benachrichtigung</MenuItem>
              </TextField>
            </Grid>

            {/* Trigger Config */}
            {formData.triggerType === 'time' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Cron-Ausdruck"
                  value={formData.cronExpression}
                  onChange={(e) => setFormData({ ...formData, cronExpression: e.target.value })}
                  helperText="z.B. '0 8 * * *' = täglich um 8:00 Uhr"
                />
              </Grid>
            )}

            {formData.triggerType === 'sensor' && (
              <>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Sensor ID"
                    value={formData.sensorId}
                    onChange={(e) => setFormData({ ...formData, sensorId: parseInt(e.target.value) })}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField fullWidth select label="Operator" value={formData.operator} onChange={(e) => setFormData({ ...formData, operator: e.target.value })}>
                    <MenuItem value="<">Kleiner als</MenuItem>
                    <MenuItem value=">">Größer als</MenuItem>
                    <MenuItem value="==">Gleich</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Schwellwert"
                    value={formData.threshold}
                    onChange={(e) => setFormData({ ...formData, threshold: parseFloat(e.target.value) })}
                  />
                </Grid>
              </>
            )}

            {/* Action Config */}
            {formData.actionType === 'relay' && (
              <>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Relais ID"
                    value={formData.relayId}
                    onChange={(e) => setFormData({ ...formData, relayId: parseInt(e.target.value) })}
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={<Switch checked={formData.relayStatus} onChange={(e) => setFormData({ ...formData, relayStatus: e.target.checked })} />}
                    label="Status: EIN"
                  />
                </Grid>
              </>
            )}

            {formData.actionType === 'pump' && (
              <>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Pumpe ID"
                    value={formData.pumpId}
                    onChange={(e) => setFormData({ ...formData, pumpId: parseInt(e.target.value) })}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Dauer (Sekunden)"
                    value={formData.pumpDuration}
                    onChange={(e) => setFormData({ ...formData, pumpDuration: parseInt(e.target.value) })}
                  />
                </Grid>
              </>
            )}

            {formData.actionType === 'notification' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Benachrichtigungs-Text"
                  value={formData.notificationMessage}
                  onChange={(e) => setFormData({ ...formData, notificationMessage: e.target.value })}
                />
              </Grid>
            )}
          </Grid>
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
