import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
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
  Switch,
  FormControlLabel,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  Divider,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import BugReportIcon from '@mui/icons-material/BugReport';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

interface AutomationRule {
  id: number;
  name: string;
  description?: string;
  enabled: boolean;
  triggerType: 'time' | 'sensor' | 'manual';
  triggerConfig: string;
  actionType: 'relay' | 'pump' | 'notification';
  actionConfig: string;
  conditions?: string;
  lastTriggered?: Date;
  triggerCount: number;
}

interface Condition {
  type: 'sensor' | 'time' | 'formula' | 'rule_state';
  field?: string;
  operator?: '>' | '<' | '>=' | '<=' | '==' | '!=';
  value?: number | string | boolean;
  formula?: string;
  sensorId?: number;
  ruleId?: number;
}

interface ConditionGroup {
  operator: 'AND' | 'OR';
  conditions: Condition[];
}

interface Action {
  type: 'relay' | 'pump' | 'notification' | 'trigger_rule' | 'webhook';
  config: Record<string, any>;
  delay?: number;
  condition?: ConditionGroup;
}

interface Sensor {
  id: number;
  name: string;
  type: string;
}

interface Relay {
  id: number;
  name: string;
}

export function AdvancedAutomation() {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [relays, setRelays] = useState<Relay[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [triggerType, setTriggerType] = useState<'time' | 'sensor' | 'manual'>('manual');
  const [conditionGroup, setConditionGroup] = useState<ConditionGroup>({
    operator: 'AND',
    conditions: [],
  });
  const [actions, setActions] = useState<Action[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [rulesRes, sensorsRes, relaysRes] = await Promise.all([
        axios.get(`${API_URL}/automation`, { headers }),
        axios.get(`${API_URL}/sensors`, { headers }),
        axios.get(`${API_URL}/relays`, { headers }),
      ]);

      setRules(rulesRes.data);
      setSensors(sensorsRes.data);
      setRelays(relaysRes.data);
    } catch (err: any) {
      setError('Fehler beim Laden der Daten');
    }
  };

  const handleOpenDialog = (rule?: AutomationRule) => {
    if (rule) {
      setEditingRule(rule);
      setName(rule.name);
      setDescription(rule.description || '');
      setEnabled(rule.enabled);
      setTriggerType(rule.triggerType);

      // Parse conditions
      if (rule.conditions) {
        try {
          setConditionGroup(JSON.parse(rule.conditions));
        } catch (e) {
          setConditionGroup({ operator: 'AND', conditions: [] });
        }
      }

      // Parse actions
      try {
        const actionConfig = JSON.parse(rule.actionConfig);
        setActions(actionConfig.actions || []);
      } catch (e) {
        setActions([]);
      }
    } else {
      resetForm();
    }
    setOpenDialog(true);
  };

  const resetForm = () => {
    setEditingRule(null);
    setName('');
    setDescription('');
    setEnabled(true);
    setTriggerType('manual');
    setConditionGroup({ operator: 'AND', conditions: [] });
    setActions([]);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    resetForm();
  };

  const handleSaveRule = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const ruleData = {
        name,
        description,
        enabled,
        triggerType,
        triggerConfig: JSON.stringify({ manual: true }), // Simplified for now
        actionType: actions.length > 0 ? actions[0].type : 'notification',
        actionConfig: JSON.stringify({ actions }),
        conditions: JSON.stringify(conditionGroup),
      };

      if (editingRule) {
        await axios.put(`${API_URL}/automation/${editingRule.id}`, ruleData, { headers });
      } else {
        await axios.post(`${API_URL}/automation`, ruleData, { headers });
      }

      await loadData();
      handleCloseDialog();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Fehler beim Speichern der Regel');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRule = async (id: number) => {
    if (!window.confirm('Regel wirklich löschen?')) return;

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`${API_URL}/automation/${id}`, { headers });
      await loadData();
    } catch (err: any) {
      setError('Fehler beim Löschen der Regel');
    }
  };

  const handleTriggerRule = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      await axios.post(`${API_URL}/automation/${id}/trigger`, {}, { headers });
      alert('Regel erfolgreich ausgelöst!');
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Fehler beim Auslösen der Regel');
    }
  };

  const handleTestRule = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.post(`${API_URL}/automation/${id}/test`, {}, { headers });
      alert(JSON.stringify(res.data, null, 2));
    } catch (err: any) {
      alert('Fehler beim Testen: ' + (err.response?.data?.error || err.message));
    }
  };

  // Condition Management
  const addCondition = () => {
    setConditionGroup({
      ...conditionGroup,
      conditions: [
        ...conditionGroup.conditions,
        { type: 'sensor', field: 'temperature', operator: '>', value: 0, sensorId: sensors[0]?.id },
      ],
    });
  };

  const updateCondition = (index: number, updates: Partial<Condition>) => {
    const newConditions = [...conditionGroup.conditions];
    newConditions[index] = { ...newConditions[index], ...updates };
    setConditionGroup({ ...conditionGroup, conditions: newConditions });
  };

  const removeCondition = (index: number) => {
    setConditionGroup({
      ...conditionGroup,
      conditions: conditionGroup.conditions.filter((_, i) => i !== index),
    });
  };

  // Action Management
  const addAction = () => {
    setActions([
      ...actions,
      { type: 'relay', config: { relayId: relays[0]?.id, state: 'on' }, delay: 0 },
    ]);
  };

  const updateAction = (index: number, updates: Partial<Action>) => {
    const newActions = [...actions];
    newActions[index] = { ...newActions[index], ...updates };
    setActions(newActions);
  };

  const removeAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index));
  };

  const getSensorFields = (sensorType: string): string[] => {
    const fieldMap: Record<string, string[]> = {
      temperature: ['temperature'],
      humidity: ['humidity'],
      moisture: ['moistureLevel'],
      ph: ['ph'],
      ec: ['ec'],
      light: ['light'],
      co2: ['co2'],
      par: ['par'],
    };
    return fieldMap[sensorType] || ['temperature', 'humidity'];
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Erweiterte Automatisierungs-Regeln</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Neue Regel
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Beschreibung</TableCell>
              <TableCell>Trigger</TableCell>
              <TableCell>Bedingungen</TableCell>
              <TableCell>Aktionen</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Letzte Ausführung</TableCell>
              <TableCell>Aktionen</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rules.map((rule) => (
              <TableRow key={rule.id}>
                <TableCell>{rule.name}</TableCell>
                <TableCell>{rule.description || '-'}</TableCell>
                <TableCell>
                  <Chip label={rule.triggerType} size="small" />
                </TableCell>
                <TableCell>
                  {rule.conditions ? (
                    <Chip label={`${JSON.parse(rule.conditions).conditions.length} Bedingung(en)`} size="small" />
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  {(() => {
                    try {
                      const config = JSON.parse(rule.actionConfig);
                      return <Chip label={`${config.actions?.length || 1} Aktion(en)`} size="small" />;
                    } catch {
                      return '-';
                    }
                  })()}
                </TableCell>
                <TableCell>
                  <Chip
                    label={rule.enabled ? 'Aktiv' : 'Inaktiv'}
                    color={rule.enabled ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {rule.lastTriggered
                    ? new Date(rule.lastTriggered).toLocaleString('de-DE')
                    : 'Nie'}
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="Bearbeiten">
                      <IconButton size="small" onClick={() => handleOpenDialog(rule)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Testen">
                      <IconButton size="small" onClick={() => handleTestRule(rule.id)}>
                        <BugReportIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Auslösen">
                      <IconButton
                        size="small"
                        onClick={() => handleTriggerRule(rule.id)}
                        disabled={!rule.enabled}
                      >
                        <PlayArrowIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Löschen">
                      <IconButton size="small" color="error" onClick={() => handleDeleteRule(rule.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {rules.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography color="text.secondary">Keine Regeln vorhanden</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingRule ? 'Regel bearbeiten' : 'Neue Regel erstellen'}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            {/* Basic Info */}
            <TextField
              label="Name"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <TextField
              label="Beschreibung"
              fullWidth
              multiline
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <FormControlLabel
              control={<Switch checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />}
              label="Regel aktiviert"
            />
            <FormControl fullWidth>
              <InputLabel>Trigger-Typ</InputLabel>
              <Select
                value={triggerType}
                onChange={(e) => setTriggerType(e.target.value as any)}
                label="Trigger-Typ"
              >
                <MenuItem value="manual">Manuell</MenuItem>
                <MenuItem value="sensor">Sensor-basiert</MenuItem>
                <MenuItem value="time">Zeit-basiert</MenuItem>
              </Select>
            </FormControl>

            <Divider />

            {/* Conditions */}
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">
                  Bedingungen ({conditionGroup.conditions.length})
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Operator</InputLabel>
                    <Select
                      value={conditionGroup.operator}
                      onChange={(e) =>
                        setConditionGroup({ ...conditionGroup, operator: e.target.value as 'AND' | 'OR' })
                      }
                      label="Operator"
                    >
                      <MenuItem value="AND">UND (alle müssen erfüllt sein)</MenuItem>
                      <MenuItem value="OR">ODER (mindestens eine muss erfüllt sein)</MenuItem>
                    </Select>
                  </FormControl>

                  {conditionGroup.conditions.map((condition, index) => (
                    <Card key={index} variant="outlined">
                      <CardContent>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={12} sm={3}>
                            <FormControl fullWidth size="small">
                              <InputLabel>Typ</InputLabel>
                              <Select
                                value={condition.type}
                                onChange={(e) => updateCondition(index, { type: e.target.value as any })}
                                label="Typ"
                              >
                                <MenuItem value="sensor">Sensor</MenuItem>
                                <MenuItem value="time">Zeit</MenuItem>
                                <MenuItem value="formula">Formel</MenuItem>
                                <MenuItem value="rule_state">Regel-Status</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>

                          {condition.type === 'sensor' && (
                            <>
                              <Grid item xs={12} sm={3}>
                                <FormControl fullWidth size="small">
                                  <InputLabel>Sensor</InputLabel>
                                  <Select
                                    value={condition.sensorId || ''}
                                    onChange={(e) => updateCondition(index, { sensorId: Number(e.target.value) })}
                                    label="Sensor"
                                  >
                                    {sensors.map((sensor) => (
                                      <MenuItem key={sensor.id} value={sensor.id}>
                                        {sensor.name}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              </Grid>
                              <Grid item xs={12} sm={2}>
                                <FormControl fullWidth size="small">
                                  <InputLabel>Feld</InputLabel>
                                  <Select
                                    value={condition.field || 'temperature'}
                                    onChange={(e) => updateCondition(index, { field: e.target.value })}
                                    label="Feld"
                                  >
                                    {getSensorFields(
                                      sensors.find((s) => s.id === condition.sensorId)?.type || 'temperature'
                                    ).map((field) => (
                                      <MenuItem key={field} value={field}>
                                        {field}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              </Grid>
                              <Grid item xs={12} sm={2}>
                                <FormControl fullWidth size="small">
                                  <InputLabel>Operator</InputLabel>
                                  <Select
                                    value={condition.operator || '>'}
                                    onChange={(e) => updateCondition(index, { operator: e.target.value as any })}
                                    label="Operator"
                                  >
                                    <MenuItem value=">">{'>'}</MenuItem>
                                    <MenuItem value="<">{'<'}</MenuItem>
                                    <MenuItem value=">=">{'>='}</MenuItem>
                                    <MenuItem value="<=">{'<='}</MenuItem>
                                    <MenuItem value="==">{'=='}</MenuItem>
                                    <MenuItem value="!=">{'!='}</MenuItem>
                                  </Select>
                                </FormControl>
                              </Grid>
                              <Grid item xs={12} sm={2}>
                                <TextField
                                  fullWidth
                                  size="small"
                                  label="Wert"
                                  type="number"
                                  value={condition.value || 0}
                                  onChange={(e) => updateCondition(index, { value: Number(e.target.value) })}
                                />
                              </Grid>
                            </>
                          )}

                          {condition.type === 'formula' && (
                            <Grid item xs={12} sm={8}>
                              <TextField
                                fullWidth
                                size="small"
                                label="Formel (z.B. (20 + 5) > 10)"
                                value={condition.formula || ''}
                                onChange={(e) => updateCondition(index, { formula: e.target.value })}
                              />
                            </Grid>
                          )}

                          {condition.type === 'time' && (
                            <>
                              <Grid item xs={12} sm={3}>
                                <FormControl fullWidth size="small">
                                  <InputLabel>Operator</InputLabel>
                                  <Select
                                    value={condition.operator || '=='}
                                    onChange={(e) => updateCondition(index, { operator: e.target.value as any })}
                                    label="Operator"
                                  >
                                    <MenuItem value="==">Genau</MenuItem>
                                    <MenuItem value=">">Nach</MenuItem>
                                    <MenuItem value="<">Vor</MenuItem>
                                  </Select>
                                </FormControl>
                              </Grid>
                              <Grid item xs={12} sm={5}>
                                <TextField
                                  fullWidth
                                  size="small"
                                  label="Zeit (HH:MM)"
                                  value={condition.value || '12:00'}
                                  onChange={(e) => updateCondition(index, { value: e.target.value })}
                                />
                              </Grid>
                            </>
                          )}

                          {condition.type === 'rule_state' && (
                            <>
                              <Grid item xs={12} sm={5}>
                                <FormControl fullWidth size="small">
                                  <InputLabel>Regel</InputLabel>
                                  <Select
                                    value={condition.ruleId || ''}
                                    onChange={(e) => updateCondition(index, { ruleId: Number(e.target.value) })}
                                    label="Regel"
                                  >
                                    {rules.map((rule) => (
                                      <MenuItem key={rule.id} value={rule.id}>
                                        {rule.name}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              </Grid>
                              <Grid item xs={12} sm={3}>
                                <FormControl fullWidth size="small">
                                  <InputLabel>Status</InputLabel>
                                  <Select
                                    value={condition.value ? 'true' : 'false'}
                                    onChange={(e) => updateCondition(index, { value: e.target.value === 'true' })}
                                    label="Status"
                                  >
                                    <MenuItem value="true">Aktiv</MenuItem>
                                    <MenuItem value="false">Inaktiv</MenuItem>
                                  </Select>
                                </FormControl>
                              </Grid>
                            </>
                          )}

                          <Grid item xs={12} sm={1}>
                            <IconButton size="small" color="error" onClick={() => removeCondition(index)}>
                              <DeleteIcon />
                            </IconButton>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  ))}

                  <Button startIcon={<AddIcon />} onClick={addCondition} variant="outlined">
                    Bedingung hinzufügen
                  </Button>
                </Stack>
              </AccordionDetails>
            </Accordion>

            {/* Actions */}
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Aktionen ({actions.length})</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  {actions.map((action, index) => (
                    <Card key={index} variant="outlined">
                      <CardContent>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={12} sm={3}>
                            <FormControl fullWidth size="small">
                              <InputLabel>Typ</InputLabel>
                              <Select
                                value={action.type}
                                onChange={(e) => updateAction(index, { type: e.target.value as any })}
                                label="Typ"
                              >
                                <MenuItem value="relay">Relais</MenuItem>
                                <MenuItem value="pump">Pumpe</MenuItem>
                                <MenuItem value="notification">Benachrichtigung</MenuItem>
                                <MenuItem value="trigger_rule">Regel auslösen</MenuItem>
                                <MenuItem value="webhook">Webhook</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>

                          {action.type === 'relay' && (
                            <>
                              <Grid item xs={12} sm={4}>
                                <FormControl fullWidth size="small">
                                  <InputLabel>Relais</InputLabel>
                                  <Select
                                    value={action.config.relayId || ''}
                                    onChange={(e) =>
                                      updateAction(index, {
                                        config: { ...action.config, relayId: Number(e.target.value) },
                                      })
                                    }
                                    label="Relais"
                                  >
                                    {relays.map((relay) => (
                                      <MenuItem key={relay.id} value={relay.id}>
                                        {relay.name}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              </Grid>
                              <Grid item xs={12} sm={2}>
                                <FormControl fullWidth size="small">
                                  <InputLabel>Status</InputLabel>
                                  <Select
                                    value={action.config.state || 'on'}
                                    onChange={(e) =>
                                      updateAction(index, {
                                        config: { ...action.config, state: e.target.value },
                                      })
                                    }
                                    label="Status"
                                  >
                                    <MenuItem value="on">An</MenuItem>
                                    <MenuItem value="off">Aus</MenuItem>
                                  </Select>
                                </FormControl>
                              </Grid>
                            </>
                          )}

                          {action.type === 'notification' && (
                            <Grid item xs={12} sm={6}>
                              <TextField
                                fullWidth
                                size="small"
                                label="Nachricht"
                                value={action.config.message || ''}
                                onChange={(e) =>
                                  updateAction(index, {
                                    config: { ...action.config, message: e.target.value },
                                  })
                                }
                              />
                            </Grid>
                          )}

                          <Grid item xs={12} sm={2}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Verzögerung (ms)"
                              type="number"
                              value={action.delay || 0}
                              onChange={(e) => updateAction(index, { delay: Number(e.target.value) })}
                            />
                          </Grid>

                          <Grid item xs={12} sm={1}>
                            <IconButton size="small" color="error" onClick={() => removeAction(index)}>
                              <DeleteIcon />
                            </IconButton>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  ))}

                  <Button startIcon={<AddIcon />} onClick={addAction} variant="outlined">
                    Aktion hinzufügen
                  </Button>
                </Stack>
              </AccordionDetails>
            </Accordion>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Abbrechen</Button>
          <Button onClick={handleSaveRule} variant="contained" disabled={loading || !name}>
            {loading ? <CircularProgress size={24} /> : 'Speichern'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
