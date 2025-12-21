import express from 'express';
import { SensorData } from '../models/SensorData';
import { Plant } from '../models/Plant';
import { authenticateToken } from '../middleware/auth';
import { Op } from 'sequelize';

const router = express.Router();

router.use(authenticateToken);

// Get latest sensor data
router.get('/latest', async (req, res) => {
  try {
    const latest = await SensorData.findAll({
      order: [['timestamp', 'DESC']],
      limit: parseInt(req.query.limit as string) || 10,
    });
    res.json(latest);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sensor data' });
  }
});

// Get sensor history
router.get('/history', async (req, res) => {
  try {
    const { sensorId, hours = 24 } = req.query;
    const since = new Date(Date.now() - parseInt(hours as string) * 60 * 60 * 1000);

    const where: any = {
      timestamp: { [Op.gte]: since },
    };

    if (sensorId) {
      where.sensorId = parseInt(sensorId as string);
    }

    const history = await SensorData.findAll({
      where,
      order: [['timestamp', 'ASC']],
    });

    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sensor history' });
  }
});

// Get current status for all plants
router.get('/status', async (req, res) => {
  try {
    const plants = await Plant.findAll({ where: { isActive: true } });
    const status = [];

    for (const plant of plants) {
      const latestData = await SensorData.findOne({
        where: { sensorId: plant.sensorId },
        order: [['timestamp', 'DESC']],
      });

      status.push({
        plant: {
          id: plant.id,
          name: plant.name,
          sensorId: plant.sensorId,
        },
        data: latestData,
      });
    }

    res.json(status);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch status' });
  }
});

export default router;
