import React from 'react';
import { Box, Typography, LinearProgress, Chip, Divider } from '@mui/material';
import { Plant, SensorData } from '../../types';

interface PlantStatusWidgetProps {
  plants: Plant[];
  sensorData: SensorData[];
}

export function PlantStatusWidget({ plants, sensorData }: PlantStatusWidgetProps) {
  const activePlants = plants.filter((p) => p.isActive);

  return (
    <Box height="100%" overflow="auto">
      {activePlants.length === 0 ? (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          height="100%"
        >
          <Typography color="text.secondary">Keine aktiven Pflanzen</Typography>
        </Box>
      ) : (
        activePlants.map((plant, index) => {
          const plantData = sensorData.find((d) => d.sensorId === plant.sensorId);
          return (
            <React.Fragment key={plant.id}>
              <Box py={1}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body1" fontWeight="medium">
                    {plant.name}
                  </Typography>
                  <Chip label={plant.phase} size="small" color="primary" />
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="body2" color="text.secondary" minWidth="90px">
                    Feuchtigkeit:
                  </Typography>
                  <Box sx={{ flexGrow: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={plantData?.moistureLevel || 0}
                      sx={{ height: 8, borderRadius: 1 }}
                    />
                  </Box>
                  <Typography variant="body2" minWidth="40px">
                    {plantData ? `${plantData.moistureLevel.toFixed(0)}%` : '-'}
                  </Typography>
                </Box>
                {plantData?.temperature != null && (
                  <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                    <Typography variant="body2" color="text.secondary" minWidth="90px">
                      Temperatur:
                    </Typography>
                    <Typography variant="body2">
                      {plantData.temperature.toFixed(1)}°C
                    </Typography>
                  </Box>
                )}
              </Box>
              {index < activePlants.length - 1 && <Divider />}
            </React.Fragment>
          );
        })
      )}
    </Box>
  );
}
