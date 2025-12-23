import React from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';
import { SensorData } from '../../types';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import OpacityIcon from '@mui/icons-material/Opacity';
import InvertColorsIcon from '@mui/icons-material/InvertColors';

interface SensorWidgetProps {
  type: 'moisture' | 'temperature' | 'humidity' | 'tank';
  latestData?: SensorData;
}

export function SensorWidget({ type, latestData }: SensorWidgetProps) {
  const getWidgetContent = () => {
    switch (type) {
      case 'moisture':
        return {
          icon: <WaterDropIcon sx={{ fontSize: 40 }} color="primary" />,
          label: 'Bodenfeuchtigkeit',
          value: latestData?.moistureLevel,
          unit: '%',
          color: 'primary',
        };
      case 'temperature':
        return {
          icon: <ThermostatIcon sx={{ fontSize: 40 }} color="error" />,
          label: 'Temperatur',
          value: latestData?.temperature,
          unit: '°C',
          color: 'error',
        };
      case 'humidity':
        return {
          icon: <OpacityIcon sx={{ fontSize: 40 }} color="info" />,
          label: 'Luftfeuchtigkeit',
          value: latestData?.humidity,
          unit: '%',
          color: 'info',
        };
      case 'tank':
        return {
          icon: <InvertColorsIcon sx={{ fontSize: 40 }} color="success" />,
          label: 'Wassertank',
          value: latestData?.tankLevel,
          unit: '%',
          color: 'success',
        };
    }
  };

  const content = getWidgetContent();
  const value = content.value ?? 0;

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100%"
    >
      {content.icon}
      <Typography variant="body2" color="text.secondary" mt={1}>
        {content.label}
      </Typography>
      <Typography variant="h3" fontWeight="bold" my={1}>
        {content.value != null ? `${value.toFixed(1)}${content.unit}` : '-'}
      </Typography>
      <Box width="100%" mt={1}>
        <LinearProgress
          variant="determinate"
          value={Math.min(value, 100)}
          color={content.color as any}
          sx={{ height: 8, borderRadius: 1 }}
        />
      </Box>
    </Box>
  );
}
