import express, { Request, Response } from 'express';
import SensorGroup from '../models/SensorGroup';
import { Sensor } from '../models';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get all sensor groups
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const groups = await SensorGroup.findAll({
      order: [['name', 'ASC']],
    });

    // Parse sensorIds JSON for each group
    const groupsWithSensors = groups.map((group) => ({
      ...group.toJSON(),
      sensorIds: JSON.parse(group.sensorIds || '[]'),
    }));

    res.json(groupsWithSensors);
  } catch (error) {
    console.error('Error fetching sensor groups:', error);
    res.status(500).json({ error: 'Failed to fetch sensor groups' });
  }
});

// Get single sensor group
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const group = await SensorGroup.findByPk(req.params.id);
    if (!group) {
      return res.status(404).json({ error: 'Sensor group not found' });
    }

    const sensorIds = JSON.parse(group.sensorIds || '[]');

    // Get sensor details
    const sensors = await Sensor.findAll({
      where: {
        id: sensorIds,
      },
    });

    res.json({
      ...group.toJSON(),
      sensorIds,
      sensors,
    });
  } catch (error) {
    console.error('Error fetching sensor group:', error);
    res.status(500).json({ error: 'Failed to fetch sensor group' });
  }
});

// Create sensor group
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { name, description, sensorIds, color, icon } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Validate sensor IDs
    if (sensorIds && Array.isArray(sensorIds) && sensorIds.length > 0) {
      const sensors = await Sensor.findAll({
        where: {
          id: sensorIds,
        },
      });

      if (sensors.length !== sensorIds.length) {
        return res.status(400).json({ error: 'Some sensor IDs are invalid' });
      }
    }

    const group = await SensorGroup.create({
      name,
      description,
      sensorIds: JSON.stringify(sensorIds || []),
      color: color || '#1976d2',
      icon: icon || 'sensors',
      isActive: true,
    });

    res.status(201).json({
      ...group.toJSON(),
      sensorIds: JSON.parse(group.sensorIds),
    });
  } catch (error) {
    console.error('Error creating sensor group:', error);
    res.status(500).json({ error: 'Failed to create sensor group' });
  }
});

// Update sensor group
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const group = await SensorGroup.findByPk(req.params.id);
    if (!group) {
      return res.status(404).json({ error: 'Sensor group not found' });
    }

    const { name, description, sensorIds, color, icon, isActive } = req.body;

    // Validate sensor IDs if provided
    if (sensorIds && Array.isArray(sensorIds) && sensorIds.length > 0) {
      const sensors = await Sensor.findAll({
        where: {
          id: sensorIds,
        },
      });

      if (sensors.length !== sensorIds.length) {
        return res.status(400).json({ error: 'Some sensor IDs are invalid' });
      }
    }

    await group.update({
      name: name !== undefined ? name : group.name,
      description: description !== undefined ? description : group.description,
      sensorIds:
        sensorIds !== undefined ? JSON.stringify(sensorIds) : group.sensorIds,
      color: color !== undefined ? color : group.color,
      icon: icon !== undefined ? icon : group.icon,
      isActive: isActive !== undefined ? isActive : group.isActive,
    });

    res.json({
      ...group.toJSON(),
      sensorIds: JSON.parse(group.sensorIds),
    });
  } catch (error) {
    console.error('Error updating sensor group:', error);
    res.status(500).json({ error: 'Failed to update sensor group' });
  }
});

// Delete sensor group
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const group = await SensorGroup.findByPk(req.params.id);
    if (!group) {
      return res.status(404).json({ error: 'Sensor group not found' });
    }

    await group.destroy();
    res.json({ message: 'Sensor group deleted successfully' });
  } catch (error) {
    console.error('Error deleting sensor group:', error);
    res.status(500).json({ error: 'Failed to delete sensor group' });
  }
});

// Get sensor group statistics
router.get('/:id/stats', authenticateToken, async (req: Request, res: Response) => {
  try {
    const group = await SensorGroup.findByPk(req.params.id);
    if (!group) {
      return res.status(404).json({ error: 'Sensor group not found' });
    }

    const sensorIds = JSON.parse(group.sensorIds || '[]');

    const sensors = await Sensor.findAll({
      where: {
        id: sensorIds,
      },
    });

    const activeSensors = sensors.filter(s => s.isActive).length;
    const inactiveSensors = sensors.length - activeSensors;

    res.json({
      totalSensors: sensors.length,
      activeSensors,
      inactiveSensors,
      sensors: sensors.map(s => ({
        id: s.id,
        name: s.name,
        type: s.type,
        isActive: s.isActive,
        lastReading: s.lastReading,
        lastReadingAt: s.lastReadingAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching sensor group stats:', error);
    res.status(500).json({ error: 'Failed to fetch sensor group stats' });
  }
});

export default router;
