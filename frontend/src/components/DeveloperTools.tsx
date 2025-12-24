import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Alert,
  CircularProgress,
  TextField,
  Divider,
} from '@mui/material';
import {
  Science as ScienceIcon,
  AutoAwesome as AutoAwesomeIcon,
  DeleteForever as DeleteForeverIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { devAPI } from '../services/api';
import { toast } from 'react-toastify';

export const DeveloperTools: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);
  const [customOptions, setCustomOptions] = useState({
    strains: 3,
    plants: 5,
    completedGrows: 3,
    daysOfHistory: 90,
    clearExisting: false,
  });

  const handleQuickDemo = async () => {
    if (!window.confirm('Schnelle Demo-Daten generieren? (2 Strains, 3 Pflanzen, 2 abgeschlossene Grows, 30 Tage)')) {
      return;
    }

    setLoading(true);
    try {
      const response = await devAPI.seedQuick();
      setLastResult(response.data);
      toast.success('Demo-Daten erfolgreich generiert!');
    } catch (error: any) {
      toast.error('Fehler beim Generieren der Demo-Daten: ' + error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFullTestData = async () => {
    if (!window.confirm('ACHTUNG: Dies wird ALLE existierenden Daten löschen und neue Testdaten generieren!\n\nFortfahren?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await devAPI.seedFull();
      setLastResult(response.data);
      toast.success('Vollständige Testdaten erfolgreich generiert!');
    } catch (error: any) {
      toast.error('Fehler beim Generieren der Testdaten: ' + error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSeed = async () => {
    const confirmText = customOptions.clearExisting
      ? 'ACHTUNG: Dies wird ALLE existierenden Daten löschen!\n\nFortfahren?'
      : 'Benutzerdefinierte Testdaten generieren?';

    if (!window.confirm(confirmText)) {
      return;
    }

    setLoading(true);
    try {
      const response = await devAPI.seedCustom(customOptions);
      setLastResult(response.data);
      toast.success('Benutzerdefinierte Testdaten erfolgreich generiert!');
    } catch (error: any) {
      toast.error('Fehler beim Generieren der Testdaten: ' + error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearData = async () => {
    if (!window.confirm('ACHTUNG: Dies wird ALLE Daten unwiderruflich löschen!\n\nSind Sie sicher?')) {
      return;
    }

    if (!window.confirm('Letzte Warnung! Alle Pflanzen, Sensordaten, Ernten, etc. werden gelöscht.\n\nWirklich fortfahren?')) {
      return;
    }

    setLoading(true);
    try {
      await devAPI.clearData();
      setLastResult(null);
      toast.success('Alle Daten wurden gelöscht');
    } catch (error: any) {
      toast.error('Fehler beim Löschen der Daten: ' + error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Alert severity="warning" sx={{ mb: 3 }}>
        <Typography variant="body2" fontWeight="bold">
          Developer Mode
        </Typography>
        <Typography variant="body2">
          Diese Werkzeuge sind nur im Entwicklungsmodus verfügbar und dienen zum Generieren von Testdaten.
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        {/* Quick Demo */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <AutoAwesomeIcon sx={{ mr: 1 }} color="primary" />
                <Typography variant="h6">Schnelle Demo</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Generiert eine kleine Menge Testdaten zum schnellen Testen:
              </Typography>
              <Box component="ul" sx={{ fontSize: '0.875rem', color: 'text.secondary', pl: 2 }}>
                <li>2 Strains</li>
                <li>3 aktive Pflanzen</li>
                <li>2 abgeschlossene Grows</li>
                <li>30 Tage Sensordaten</li>
              </Box>
              <Button
                variant="contained"
                fullWidth
                onClick={handleQuickDemo}
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Demo-Daten generieren'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Full Test Data */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <ScienceIcon sx={{ mr: 1 }} color="secondary" />
                <Typography variant="h6">Vollständige Testdaten</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Generiert umfangreiche Testdaten (löscht existierende Daten):
              </Typography>
              <Box component="ul" sx={{ fontSize: '0.875rem', color: 'text.secondary', pl: 2 }}>
                <li>5 verschiedene Strains</li>
                <li>8 aktive Pflanzen</li>
                <li>5 abgeschlossene Grows mit Ernten</li>
                <li>120 Tage historische Sensordaten</li>
              </Box>
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                onClick={handleFullTestData}
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Vollständige Daten generieren'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Custom Seed */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Benutzerdefinierte Testdaten
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Passen Sie die Testdaten-Generierung an Ihre Bedürfnisse an:
              </Typography>

              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Anzahl Strains"
                    value={customOptions.strains}
                    onChange={(e) => setCustomOptions({ ...customOptions, strains: parseInt(e.target.value) || 0 })}
                    inputProps={{ min: 1, max: 10 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Anzahl Pflanzen"
                    value={customOptions.plants}
                    onChange={(e) => setCustomOptions({ ...customOptions, plants: parseInt(e.target.value) || 0 })}
                    inputProps={{ min: 0, max: 20 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Abgeschlossene Grows"
                    value={customOptions.completedGrows}
                    onChange={(e) => setCustomOptions({ ...customOptions, completedGrows: parseInt(e.target.value) || 0 })}
                    inputProps={{ min: 0, max: 10 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Tage Historie"
                    value={customOptions.daysOfHistory}
                    onChange={(e) => setCustomOptions({ ...customOptions, daysOfHistory: parseInt(e.target.value) || 0 })}
                    inputProps={{ min: 7, max: 365 }}
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 3 }}>
                <label>
                  <input
                    type="checkbox"
                    checked={customOptions.clearExisting}
                    onChange={(e) => setCustomOptions({ ...customOptions, clearExisting: e.target.checked })}
                  />
                  <Typography component="span" variant="body2" sx={{ ml: 1 }}>
                    Existierende Daten vorher löschen (ACHTUNG!)
                  </Typography>
                </label>
              </Box>

              <Button
                variant="contained"
                onClick={handleCustomSeed}
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Benutzerdefinierte Daten generieren'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Clear All Data */}
        <Grid item xs={12}>
          <Card sx={{ bgcolor: 'error.dark', color: 'error.contrastText' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <DeleteForeverIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Alle Daten löschen</Typography>
              </Box>
              <Typography variant="body2" paragraph>
                Löscht ALLE Daten aus der Datenbank (Pflanzen, Sensordaten, Ernten, Notizen, Events, etc.)
              </Typography>
              <Button
                variant="contained"
                color="error"
                onClick={handleClearData}
                disabled={loading}
                startIcon={<DeleteForeverIcon />}
              >
                {loading ? <CircularProgress size={24} /> : 'Alle Daten löschen'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Results */}
        {lastResult && (
          <Grid item xs={12}>
            <Card sx={{ bgcolor: 'success.light' }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <CheckIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Ergebnis</Typography>
                </Box>
                <Typography variant="body2" paragraph>
                  {lastResult.message}
                </Typography>
                {lastResult.stats && (
                  <Box>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" gutterBottom>
                      Generierte Daten:
                    </Typography>
                    <Grid container spacing={1}>
                      <Grid item xs={6} sm={4} md={2}>
                        <Typography variant="body2">Strains: <strong>{lastResult.stats.strains}</strong></Typography>
                      </Grid>
                      <Grid item xs={6} sm={4} md={2}>
                        <Typography variant="body2">Pflanzen: <strong>{lastResult.stats.plants}</strong></Typography>
                      </Grid>
                      <Grid item xs={6} sm={4} md={2}>
                        <Typography variant="body2">Sensordaten: <strong>{lastResult.stats.sensorData}</strong></Typography>
                      </Grid>
                      <Grid item xs={6} sm={4} md={2}>
                        <Typography variant="body2">Ernten: <strong>{lastResult.stats.harvests}</strong></Typography>
                      </Grid>
                      <Grid item xs={6} sm={4} md={2}>
                        <Typography variant="body2">Events: <strong>{lastResult.stats.events}</strong></Typography>
                      </Grid>
                      <Grid item xs={6} sm={4} md={2}>
                        <Typography variant="body2">Notizen: <strong>{lastResult.stats.notes}</strong></Typography>
                      </Grid>
                      <Grid item xs={6} sm={4} md={2}>
                        <Typography variant="body2">Geräte: <strong>{lastResult.stats.devices}</strong></Typography>
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};
