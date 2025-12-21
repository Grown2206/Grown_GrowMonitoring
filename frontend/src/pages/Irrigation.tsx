import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  Switch,
  TextField,
  FormControlLabel,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { irrigationAPI, plantsAPI } from '../services/api';
import { Plant, IrrigationConfig, IrrigationLog } from '../types';
import WaterDropIcon from '@mui/icons-material/WaterDrop';

export function Irrigation() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [configs, setConfigs] = useState<Record<number, IrrigationConfig>>({});
  const [history, setHistory] = useState<IrrigationLog[]>([]);
  const [manualPump, setManualPump] = useState({ plantId: '', pumpId: 1, duration: 5 });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [plantsRes, configsRes, historyRes] = await Promise.all([
        plantsAPI.getAll(),
        irrigationAPI.getConfigs(),
        irrigationAPI.getHistory(undefined, 20),
      ]);

      setPlants(plantsRes.data);

      const configsMap: Record<number, IrrigationConfig> = {};
      configsRes.data.forEach((c: IrrigationConfig) => {
        configsMap[c.plantId] = c;
      });
      setConfigs(configsMap);

      setHistory(historyRes.data);
    } catch (error) {
      console.error('Failed to load irrigation data:', error);
    }
  }

  async function saveConfig(plantId: number, data: Partial<IrrigationConfig>) {
    try {
      const config = configs[plantId] || { plantId, pumpId: 1, moistureThreshold: 30, pumpDurationSeconds: 5, cooldownMinutes: 60 };
      await irrigationAPI.saveConfig({ ...config, ...data, plantId });
      loadData();
    } catch (error) {
      console.error('Failed to save config:', error);
    }
  }

  async function triggerManual() {
    if (!manualPump.plantId) return;

    try {
      await irrigationAPI.manualTrigger(parseInt(manualPump.plantId), manualPump.pumpId, manualPump.duration);
      alert('Bewässerung gestartet!');
      loadData();
    } catch (error: any) {
      alert('Fehler: ' + (error.response?.data?.error || error.message));
    }
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Bewässerung
      </Typography>

      <Grid container spacing={3}>
        {/* Manual Control */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Manuelle Bewässerung
            </Typography>

            <TextField
              fullWidth
              select
              label="Pflanze"
              value={manualPump.plantId}
              onChange={(e) => setManualPump({ ...manualPump, plantId: e.target.value })}
              margin="normal"
              SelectProps={{ native: true }}
            >
              <option value="">Wählen...</option>
              {plants.filter((p) => p.isActive).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </TextField>

            <TextField
              fullWidth
              type="number"
              label="Pumpe ID"
              value={manualPump.pumpId}
              onChange={(e) => setManualPump({ ...manualPump, pumpId: parseInt(e.target.value) })}
              margin="normal"
            />

            <TextField
              fullWidth
              type="number"
              label="Dauer (Sekunden)"
              value={manualPump.duration}
              onChange={(e) => setManualPump({ ...manualPump, duration: parseInt(e.target.value) })}
              margin="normal"
            />

            <Button fullWidth variant="contained" startIcon={<WaterDropIcon />} onClick={triggerManual} sx={{ mt: 2 }}>
              Bewässerung starten
            </Button>
          </Paper>
        </Grid>

        {/* Auto Config */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Automatische Bewässerung
            </Typography>

            {plants.filter((p) => p.isActive).map((plant) => {
              const config = configs[plant.id];
              return (
                <Card key={plant.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="h6">{plant.name}</Typography>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={config?.enabled || false}
                            onChange={(e) => saveConfig(plant.id, { enabled: e.target.checked })}
                          />
                        }
                        label="Aktiviert"
                      />
                    </Box>

                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          label="Schwellwert %"
                          value={config?.moistureThreshold || 30}
                          onChange={(e) => saveConfig(plant.id, { moistureThreshold: parseFloat(e.target.value) })}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          label="Dauer (Sek.)"
                          value={config?.pumpDurationSeconds || 5}
                          onChange={(e) => saveConfig(plant.id, { pumpDurationSeconds: parseInt(e.target.value) })}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          label="Pumpe ID"
                          value={config?.pumpId || 1}
                          onChange={(e) => saveConfig(plant.id, { pumpId: parseInt(e.target.value) })}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          label="Cooldown (Min.)"
                          value={config?.cooldownMinutes || 60}
                          onChange={(e) => saveConfig(plant.id, { cooldownMinutes: parseInt(e.target.value) })}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              );
            })}
          </Paper>
        </Grid>

        {/* History */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Bewässerungs-Historie
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Zeit</TableCell>
                    <TableCell>Pflanze</TableCell>
                    <TableCell>Typ</TableCell>
                    <TableCell>Feuchtigkeit</TableCell>
                    <TableCell>Dauer</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {history.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                      <TableCell>Pflanze #{log.plantId}</TableCell>
                      <TableCell>{log.triggeredBy === 'automatic' ? 'Auto' : 'Manuell'}</TableCell>
                      <TableCell>{log.moistureLevel.toFixed(0)}%</TableCell>
                      <TableCell>{log.durationSeconds}s</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
