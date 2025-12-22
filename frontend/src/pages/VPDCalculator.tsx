import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  Paper,
  Alert,
  Slider,
  Divider,
  Chip,
  alpha,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  WbSunny as SunIcon,
  Nightlight as MoonIcon,
  Spa as PlantIcon,
  ThermostatAuto as TempIcon,
  Opacity as HumidityIcon,
} from '@mui/icons-material';

interface VPDResult {
  vpd: number;
  status: 'low' | 'optimal' | 'high';
  recommendation: string;
  leafTemp: number;
}

export function VPDCalculator() {
  const [airTemp, setAirTemp] = useState(24);
  const [humidity, setHumidity] = useState(60);
  const [leafTempOffset, setLeafTempOffset] = useState(-2);
  const [growthStage, setGrowthStage] = useState<'clone' | 'veg' | 'flower'>('veg');
  const [result, setResult] = useState<VPDResult | null>(null);

  useEffect(() => {
    calculateVPD();
  }, [airTemp, humidity, leafTempOffset, growthStage]);

  function calculateVPD() {
    // Leaf temperature = Air temperature + offset
    const leafTemp = airTemp + leafTempOffset;

    // Saturated Vapor Pressure (SVP) using Magnus formula
    const svpAir = 0.6108 * Math.exp((17.27 * airTemp) / (airTemp + 237.3));
    const svpLeaf = 0.6108 * Math.exp((17.27 * leafTemp) / (leafTemp + 237.3));

    // Actual Vapor Pressure
    const avp = (humidity / 100) * svpAir;

    // VPD = SVP(leaf) - AVP
    const vpd = svpLeaf - avp;

    // Determine status based on growth stage
    let status: 'low' | 'optimal' | 'high' = 'optimal';
    let recommendation = '';

    const ranges = {
      clone: { min: 0.4, max: 0.8 },
      veg: { min: 0.8, max: 1.2 },
      flower: { min: 1.0, max: 1.5 },
    };

    const range = ranges[growthStage];

    if (vpd < range.min) {
      status = 'low';
      recommendation = 'VPD zu niedrig. Erhöhen Sie die Temperatur oder senken Sie die Luftfeuchtigkeit.';
    } else if (vpd > range.max) {
      status = 'high';
      recommendation = 'VPD zu hoch. Senken Sie die Temperatur oder erhöhen Sie die Luftfeuchtigkeit.';
    } else {
      status = 'optimal';
      recommendation = 'Perfekte Bedingungen für diese Wachstumsphase!';
    }

    setResult({
      vpd: Math.max(0, vpd),
      status,
      recommendation,
      leafTemp,
    });
  }

  const getVPDColor = () => {
    if (!result) return '#9e9e9e';
    if (result.status === 'low') return '#2196f3';
    if (result.status === 'optimal') return '#4caf50';
    return '#ff9800';
  };

  const getVPDLabel = () => {
    if (!result) return 'Berechne...';
    if (result.status === 'low') return 'Zu niedrig';
    if (result.status === 'optimal') return 'Optimal';
    return 'Zu hoch';
  };

  const vpdChart = [
    { temp: 18, rh: [40, 50, 60, 70, 80] },
    { temp: 20, rh: [40, 50, 60, 70, 80] },
    { temp: 22, rh: [40, 50, 60, 70, 80] },
    { temp: 24, rh: [40, 50, 60, 70, 80] },
    { temp: 26, rh: [40, 50, 60, 70, 80] },
    { temp: 28, rh: [40, 50, 60, 70, 80] },
    { temp: 30, rh: [40, 50, 60, 70, 80] },
  ];

  function getVPDForCell(temp: number, rh: number): number {
    const svp = 0.6108 * Math.exp((17.27 * temp) / (temp + 237.3));
    const avp = (rh / 100) * svp;
    return svp - avp;
  }

  function getCellColor(vpd: number): string {
    const ranges = {
      clone: { min: 0.4, max: 0.8 },
      veg: { min: 0.8, max: 1.2 },
      flower: { min: 1.0, max: 1.5 },
    };
    const range = ranges[growthStage];

    if (vpd >= range.min && vpd <= range.max) return alpha('#4caf50', 0.3);
    if (vpd < range.min) return alpha('#2196f3', 0.2);
    return alpha('#ff9800', 0.2);
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        VPD Rechner
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Dampfdruckdefizit (VPD) ist der Unterschied zwischen dem Dampfdruck bei Sättigung und dem tatsächlichen
        Dampfdruck in der Luft. Es ist ein wichtiger Indikator für das Wachstum und die Transpiration von Pflanzen.
      </Typography>

      <Grid container spacing={3}>
        {/* Input Controls */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <TempIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                Umgebungsparameter
              </Typography>

              <Box mb={3}>
                <Typography variant="body2" gutterBottom>
                  Lufttemperatur: {airTemp}°C
                </Typography>
                <Slider
                  value={airTemp}
                  onChange={(_, v) => setAirTemp(v as number)}
                  min={15}
                  max={35}
                  step={0.5}
                  marks={[
                    { value: 15, label: '15°C' },
                    { value: 25, label: '25°C' },
                    { value: 35, label: '35°C' },
                  ]}
                  valueLabelDisplay="auto"
                />
              </Box>

              <Box mb={3}>
                <Typography variant="body2" gutterBottom>
                  Relative Luftfeuchtigkeit: {humidity}%
                </Typography>
                <Slider
                  value={humidity}
                  onChange={(_, v) => setHumidity(v as number)}
                  min={20}
                  max={90}
                  step={1}
                  marks={[
                    { value: 20, label: '20%' },
                    { value: 55, label: '55%' },
                    { value: 90, label: '90%' },
                  ]}
                  valueLabelDisplay="auto"
                />
              </Box>

              <Box mb={3}>
                <Typography variant="body2" gutterBottom>
                  Blatt-Temperatur Offset: {leafTempOffset}°C
                </Typography>
                <Slider
                  value={leafTempOffset}
                  onChange={(_, v) => setLeafTempOffset(v as number)}
                  min={-5}
                  max={2}
                  step={0.5}
                  marks={[
                    { value: -5, label: '-5°C' },
                    { value: -2, label: '-2°C' },
                    { value: 2, label: '+2°C' },
                  ]}
                  valueLabelDisplay="auto"
                />
                <Typography variant="caption" color="text.secondary">
                  Blätter sind typischerweise 1-3°C kühler als die Luft
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" gutterBottom>
                  Wachstumsphase
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  <Chip
                    icon={<PlantIcon />}
                    label="Klon/Sämling (0.4-0.8)"
                    onClick={() => setGrowthStage('clone')}
                    color={growthStage === 'clone' ? 'primary' : 'default'}
                    variant={growthStage === 'clone' ? 'filled' : 'outlined'}
                  />
                  <Chip
                    icon={<SunIcon />}
                    label="Vegetativ (0.8-1.2)"
                    onClick={() => setGrowthStage('veg')}
                    color={growthStage === 'veg' ? 'primary' : 'default'}
                    variant={growthStage === 'veg' ? 'filled' : 'outlined'}
                  />
                  <Chip
                    icon={<MoonIcon />}
                    label="Blüte (1.0-1.5)"
                    onClick={() => setGrowthStage('flower')}
                    color={growthStage === 'flower' ? 'primary' : 'default'}
                    variant={growthStage === 'flower' ? 'filled' : 'outlined'}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Result Display */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Ergebnis
              </Typography>

              {result && (
                <>
                  <Box textAlign="center" my={3}>
                    <Typography variant="h1" sx={{ color: getVPDColor(), fontWeight: 'bold', fontSize: '4rem' }}>
                      {result.vpd.toFixed(2)}
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                      kPa
                    </Typography>
                    <Chip
                      label={getVPDLabel()}
                      sx={{
                        mt: 2,
                        bgcolor: alpha(getVPDColor(), 0.2),
                        color: getVPDColor(),
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        padding: '8px 16px',
                      }}
                    />
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Blatttemperatur
                    </Typography>
                    <Typography variant="h6">{result.leafTemp.toFixed(1)}°C</Typography>
                  </Box>

                  <Alert severity={result.status === 'optimal' ? 'success' : result.status === 'low' ? 'info' : 'warning'}>
                    {result.recommendation}
                  </Alert>

                  <Box mt={3}>
                    <Typography variant="body2" fontWeight="bold" gutterBottom>
                      Optimale VPD-Bereiche:
                    </Typography>
                    <Box display="flex" flexDirection="column" gap={1}>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2">Klon/Sämling:</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          0.4 - 0.8 kPa
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2">Vegetativ:</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          0.8 - 1.2 kPa
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2">Blüte:</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          1.0 - 1.5 kPa
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* VPD Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              VPD Tabelle für {growthStage === 'clone' ? 'Klon/Sämling' : growthStage === 'veg' ? 'Vegetativ' : 'Blüte'}
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Grün = Optimal, Blau = Zu niedrig, Orange = Zu hoch
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Temp / RH</TableCell>
                    {vpdChart[0].rh.map((rh) => (
                      <TableCell key={rh} align="center">
                        {rh}%
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {vpdChart.map((row) => (
                    <TableRow key={row.temp}>
                      <TableCell>{row.temp}°C</TableCell>
                      {row.rh.map((rh) => {
                        const vpd = getVPDForCell(row.temp, rh);
                        return (
                          <TableCell
                            key={rh}
                            align="center"
                            sx={{
                              bgcolor: getCellColor(vpd),
                              fontWeight: row.temp === airTemp && rh === humidity ? 'bold' : 'normal',
                              border: row.temp === airTemp && rh === humidity ? '2px solid' : 'none',
                              borderColor: row.temp === airTemp && rh === humidity ? 'primary.main' : 'transparent',
                            }}
                          >
                            {vpd.toFixed(2)}
                          </TableCell>
                        );
                      })}
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
