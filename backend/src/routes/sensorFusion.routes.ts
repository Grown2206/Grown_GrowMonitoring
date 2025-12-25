import { Router, Request, Response } from 'express';
import { SensorFusionService, FusionConfig } from '../services/sensorFusionService';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Fuse sensor readings
router.post('/fuse', authenticateToken, async (req: Request, res: Response) => {
  try {
    const config: FusionConfig = req.body;

    // Validate config
    if (!config.sensorIds || !Array.isArray(config.sensorIds) || config.sensorIds.length === 0) {
      return res.status(400).json({ error: 'sensorIds array is required' });
    }

    if (!config.field) {
      return res.status(400).json({ error: 'field is required (e.g., temperature, humidity)' });
    }

    if (!config.method) {
      config.method = 'average'; // Default method
    }

    const result = await SensorFusionService.fuseSensorReadings(config);

    if (!result) {
      return res.status(404).json({ error: 'No sensor readings found' });
    }

    res.json(result);
  } catch (error: any) {
    console.error('Fusion error:', error);
    res.status(500).json({ error: 'Fusion failed', message: error.message });
  }
});

// Fuse sensor group
router.post('/fuse-group/:groupId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    const { field, method } = req.body;

    if (!field) {
      return res.status(400).json({ error: 'field is required' });
    }

    const result = await SensorFusionService.fuseSensorGroup(
      parseInt(groupId),
      field,
      method || 'average'
    );

    if (!result) {
      return res.status(404).json({ error: 'Sensor group not found or no readings available' });
    }

    res.json(result);
  } catch (error: any) {
    console.error('Group fusion error:', error);
    res.status(500).json({ error: 'Group fusion failed', message: error.message });
  }
});

// Get historical fusion data
router.post('/historical', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { config, startDate, endDate, intervalMinutes } = req.body;

    if (!config || !config.sensorIds || !config.field) {
      return res.status(400).json({ error: 'config with sensorIds and field is required' });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    const results = await SensorFusionService.getHistoricalFusion(
      config,
      start,
      end,
      intervalMinutes || 60
    );

    res.json({
      count: results.length,
      intervalMinutes: intervalMinutes || 60,
      results,
    });
  } catch (error: any) {
    console.error('Historical fusion error:', error);
    res.status(500).json({ error: 'Historical fusion failed', message: error.message });
  }
});

// Get fusion methods info
router.get('/methods', authenticateToken, async (req: Request, res: Response) => {
  const methods = [
    {
      name: 'average',
      description: 'Simple arithmetic mean of all sensor values',
      useCases: ['General purpose', 'Balanced accuracy'],
      pros: ['Simple', 'Fast', 'Works with any number of sensors'],
      cons: ['Sensitive to outliers'],
    },
    {
      name: 'median',
      description: 'Middle value when sorted, robust against outliers',
      useCases: ['Noisy sensors', 'Presence of occasional bad readings'],
      pros: ['Robust to outliers', 'Reliable with inconsistent sensors'],
      cons: ['Requires 3+ sensors for best results'],
    },
    {
      name: 'weighted_average',
      description: 'Weighted mean based on sensor confidence/quality',
      useCases: ['Known sensor quality differences', 'Prioritize reliable sensors'],
      pros: ['Flexible', 'Can favor better sensors'],
      cons: ['Requires weight configuration', 'More complex'],
    },
    {
      name: 'best_sensor',
      description: 'Use the single most reliable sensor',
      useCases: ['One sensor significantly better', 'Fallback mode'],
      pros: ['Simple', 'Low computation'],
      cons: ['No benefit from multiple sensors', 'No redundancy'],
    },
  ];

  res.json(methods);
});

// Get fusion examples
router.get('/examples', authenticateToken, async (req: Request, res: Response) => {
  const examples = [
    {
      name: 'Temperature Fusion (3 sensors)',
      config: {
        sensorIds: [1, 2, 3],
        method: 'average',
        field: 'temperature',
        outlierThreshold: 2.0,
      },
      description: 'Fuse 3 temperature sensors with outlier removal',
    },
    {
      name: 'Humidity Fusion (Weighted)',
      config: {
        sensorIds: [4, 5],
        method: 'weighted_average',
        field: 'humidity',
        weights: { 4: 0.7, 5: 0.3 }, // Sensor 4 has 70% weight
      },
      description: 'Prioritize sensor 4 due to better calibration',
    },
    {
      name: 'pH Fusion (Median, robust)',
      config: {
        sensorIds: [6, 7, 8, 9],
        method: 'median',
        field: 'ph',
        outlierThreshold: 1.5,
      },
      description: 'Use median for pH sensors (drift-prone)',
    },
  ];

  res.json(examples);
});

export default router;
