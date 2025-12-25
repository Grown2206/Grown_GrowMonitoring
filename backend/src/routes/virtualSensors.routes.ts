import { Router, Request, Response } from 'express';
import VirtualSensor from '../models/VirtualSensor';
import { VirtualSensorService } from '../services/virtualSensorService';
import { authenticateToken } from '../middleware/auth';
import { Sensor } from '../models';

const router = Router();

// Get all virtual sensors
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const virtualSensors = await VirtualSensor.findAll({
      order: [['name', 'ASC']],
    });

    // Parse config JSON for each sensor
    const parsed = virtualSensors.map((vs) => ({
      ...vs.toJSON(),
      config: JSON.parse(vs.config),
    }));

    res.json(parsed);
  } catch (error) {
    console.error('Error fetching virtual sensors:', error);
    res.status(500).json({ error: 'Failed to fetch virtual sensors' });
  }
});

// Get single virtual sensor
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const virtualSensor = await VirtualSensor.findByPk(id);

    if (!virtualSensor) {
      return res.status(404).json({ error: 'Virtual sensor not found' });
    }

    const parsed = {
      ...virtualSensor.toJSON(),
      config: JSON.parse(virtualSensor.config),
    };

    res.json(parsed);
  } catch (error) {
    console.error('Error fetching virtual sensor:', error);
    res.status(500).json({ error: 'Failed to fetch virtual sensor' });
  }
});

// Create virtual sensor
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const {
      name,
      type,
      sensorId,
      description,
      formula,
      config,
      unit,
      enabled,
      updateIntervalMinutes,
    } = req.body;

    // Validate required fields
    if (!name || !type || !sensorId || !config || !unit) {
      return res.status(400).json({
        error: 'Missing required fields: name, type, sensorId, config, unit',
      });
    }

    // Validate sensor IDs exist
    const { sourceSensorIds } = config;
    if (sourceSensorIds && sourceSensorIds.length > 0) {
      const sensors = await Sensor.findAll({
        where: {
          id: sourceSensorIds,
        },
      });

      if (sensors.length !== sourceSensorIds.length) {
        return res.status(400).json({
          error: 'One or more source sensor IDs do not exist',
        });
      }
    }

    // Check if sensorId is already in use
    const existingSensor = await VirtualSensor.findOne({
      where: { sensorId },
    });

    if (existingSensor) {
      return res.status(400).json({
        error: `Sensor ID ${sensorId} is already in use by another virtual sensor`,
      });
    }

    const virtualSensor = await VirtualSensor.create({
      name,
      type,
      sensorId,
      description,
      formula,
      config: JSON.stringify(config),
      unit,
      enabled: enabled !== undefined ? enabled : true,
      updateIntervalMinutes: updateIntervalMinutes || 5,
    });

    // Calculate initial value
    if (virtualSensor.enabled) {
      await VirtualSensorService.updateVirtualSensor(virtualSensor);
    }

    const parsed = {
      ...virtualSensor.toJSON(),
      config: JSON.parse(virtualSensor.config),
    };

    res.status(201).json(parsed);
  } catch (error) {
    console.error('Error creating virtual sensor:', error);
    res.status(500).json({ error: 'Failed to create virtual sensor' });
  }
});

// Update virtual sensor
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      type,
      sensorId,
      description,
      formula,
      config,
      unit,
      enabled,
      updateIntervalMinutes,
    } = req.body;

    const virtualSensor = await VirtualSensor.findByPk(id);

    if (!virtualSensor) {
      return res.status(404).json({ error: 'Virtual sensor not found' });
    }

    // Validate sensor IDs if config is being updated
    if (config && config.sourceSensorIds) {
      const sensors = await Sensor.findAll({
        where: {
          id: config.sourceSensorIds,
        },
      });

      if (sensors.length !== config.sourceSensorIds.length) {
        return res.status(400).json({
          error: 'One or more source sensor IDs do not exist',
        });
      }
    }

    // Check if new sensorId conflicts with existing
    if (sensorId && sensorId !== virtualSensor.sensorId) {
      const existingSensor = await VirtualSensor.findOne({
        where: { sensorId },
      });

      if (existingSensor) {
        return res.status(400).json({
          error: `Sensor ID ${sensorId} is already in use by another virtual sensor`,
        });
      }
    }

    await virtualSensor.update({
      ...(name && { name }),
      ...(type && { type }),
      ...(sensorId && { sensorId }),
      ...(description !== undefined && { description }),
      ...(formula !== undefined && { formula }),
      ...(config && { config: JSON.stringify(config) }),
      ...(unit && { unit }),
      ...(enabled !== undefined && { enabled }),
      ...(updateIntervalMinutes && { updateIntervalMinutes }),
    });

    // Recalculate if enabled
    if (virtualSensor.enabled) {
      await VirtualSensorService.updateVirtualSensor(virtualSensor);
    }

    const parsed = {
      ...virtualSensor.toJSON(),
      config: JSON.parse(virtualSensor.config),
    };

    res.json(parsed);
  } catch (error) {
    console.error('Error updating virtual sensor:', error);
    res.status(500).json({ error: 'Failed to update virtual sensor' });
  }
});

// Delete virtual sensor
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const virtualSensor = await VirtualSensor.findByPk(id);

    if (!virtualSensor) {
      return res.status(404).json({ error: 'Virtual sensor not found' });
    }

    await virtualSensor.destroy();

    res.json({ message: 'Virtual sensor deleted successfully' });
  } catch (error) {
    console.error('Error deleting virtual sensor:', error);
    res.status(500).json({ error: 'Failed to delete virtual sensor' });
  }
});

// Manually trigger calculation for a virtual sensor
router.post('/:id/calculate', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const virtualSensor = await VirtualSensor.findByPk(id);

    if (!virtualSensor) {
      return res.status(404).json({ error: 'Virtual sensor not found' });
    }

    const success = await VirtualSensorService.updateVirtualSensor(virtualSensor);

    if (!success) {
      return res.status(500).json({
        error: 'Failed to calculate virtual sensor value. Check source sensors.',
      });
    }

    // Reload to get updated values
    await virtualSensor.reload();

    const parsed = {
      ...virtualSensor.toJSON(),
      config: JSON.parse(virtualSensor.config),
    };

    res.json(parsed);
  } catch (error) {
    console.error('Error calculating virtual sensor:', error);
    res.status(500).json({ error: 'Failed to calculate virtual sensor' });
  }
});

// Get virtual sensor types info
router.get('/types/info', authenticateToken, async (req: Request, res: Response) => {
  const typesInfo = [
    {
      type: 'vpd',
      name: 'Vapor Pressure Deficit',
      description: 'Measures the difference between moisture in air and saturation',
      unit: 'kPa',
      requiredSensors: 2,
      sensorTypes: ['temperature', 'humidity'],
    },
    {
      type: 'dew_point',
      name: 'Dew Point',
      description: 'Temperature at which water vapor condenses',
      unit: '°C',
      requiredSensors: 2,
      sensorTypes: ['temperature', 'humidity'],
    },
    {
      type: 'heat_index',
      name: 'Heat Index',
      description: 'Apparent temperature combining temp and humidity',
      unit: '°C',
      requiredSensors: 2,
      sensorTypes: ['temperature', 'humidity'],
    },
    {
      type: 'absolute_humidity',
      name: 'Absolute Humidity',
      description: 'Water vapor mass per unit volume of air',
      unit: 'g/m³',
      requiredSensors: 2,
      sensorTypes: ['temperature', 'humidity'],
    },
    {
      type: 'dli',
      name: 'Daily Light Integral',
      description: 'Total photosynthetically active radiation over 24 hours',
      unit: 'mol/m²/day',
      requiredSensors: 1,
      sensorTypes: ['par'],
    },
    {
      type: 'custom',
      name: 'Custom Formula',
      description: 'User-defined calculation (advanced)',
      unit: 'varies',
      requiredSensors: 0,
      sensorTypes: [],
    },
  ];

  res.json(typesInfo);
});

export default router;
