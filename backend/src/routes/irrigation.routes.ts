import express from 'express';
import { IrrigationConfig } from '../models/IrrigationConfig';
import { IrrigationLog } from '../models/IrrigationLog';
import { Plant } from '../models/Plant';
import { SensorData } from '../models/SensorData';
import { authenticateToken } from '../middleware/auth';
import { irrigationService } from '../services/IrrigationService';
import { wsManager } from '../websocket/server';

const router = express.Router();

router.use(authenticateToken);

// Get all irrigation configs
router.get('/config', async (req, res) => {
  try {
    const configs = await IrrigationConfig.findAll({
      include: [{ model: Plant, as: 'plant' }],
    });
    res.json(configs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch irrigation configs' });
  }
});

// Get config for specific plant
router.get('/config/plant/:plantId', async (req, res) => {
  try {
    const config = await IrrigationConfig.findOne({
      where: { plantId: req.params.plantId },
      include: [{ model: Plant, as: 'plant' }],
    });
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch irrigation config' });
  }
});

// Create or update irrigation config
router.post('/config', async (req, res) => {
  try {
    const { plantId, pumpId, enabled, moistureThreshold, pumpDurationSeconds, cooldownMinutes } = req.body;

    const [config, created] = await IrrigationConfig.upsert({
      plantId,
      pumpId,
      enabled,
      moistureThreshold,
      pumpDurationSeconds,
      cooldownMinutes,
    });

    res.status(created ? 201 : 200).json(config);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Manual irrigation trigger
router.post('/manual', async (req, res) => {
  try {
    const { plantId, pumpId, durationSeconds } = req.body;

    const plant = await Plant.findByPk(plantId);
    if (!plant) {
      return res.status(404).json({ error: 'Plant not found' });
    }

    // Get current moisture level
    const latestData = await SensorData.findOne({
      where: { sensorId: plant.sensorId },
      order: [['timestamp', 'DESC']],
    });

    const moistureLevel = latestData?.moistureLevel || 0;

    // Send pump command to ESP32
    const sent = wsManager.sendToESP32({
      type: 'pump_control',
      data: { pumpId, action: 'start', duration: durationSeconds },
    });

    if (!sent) {
      return res.status(503).json({ error: 'ESP32 not connected' });
    }

    // Log irrigation
    await irrigationService.triggerIrrigation(plantId, pumpId, durationSeconds, moistureLevel, 'manual');

    res.json({ message: 'Manual irrigation triggered' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to trigger irrigation' });
  }
});

// Get irrigation history
router.get('/history', async (req, res) => {
  try {
    const { plantId, limit = 50 } = req.query;
    const history = await irrigationService.getIrrigationHistory(
      plantId ? parseInt(plantId as string) : undefined,
      parseInt(limit as string)
    );
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch irrigation history' });
  }
});

export default router;
