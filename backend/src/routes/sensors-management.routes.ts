import express from 'express';
import { Sensor } from '../models/Sensor';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

// Get all sensors
router.get('/', async (req, res) => {
  try {
    const sensors = await Sensor.findAll({ order: [['sensorId', 'ASC']] });
    res.json(sensors);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sensors' });
  }
});

// Get single sensor
router.get('/:id', async (req, res) => {
  try {
    const sensor = await Sensor.findByPk(req.params.id);
    if (!sensor) {
      return res.status(404).json({ error: 'Sensor not found' });
    }
    res.json(sensor);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sensor' });
  }
});

// Create sensor
router.post('/', async (req, res) => {
  try {
    const sensor = await Sensor.create(req.body);
    res.status(201).json(sensor);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update sensor
router.put('/:id', async (req, res) => {
  try {
    const sensor = await Sensor.findByPk(req.params.id);
    if (!sensor) {
      return res.status(404).json({ error: 'Sensor not found' });
    }
    await sensor.update(req.body);
    res.json(sensor);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Calibrate sensor
router.post('/:id/calibrate', async (req, res) => {
  try {
    const { offset } = req.body;
    const sensor = await Sensor.findByPk(req.params.id);
    if (!sensor) {
      return res.status(404).json({ error: 'Sensor not found' });
    }
    await sensor.update({ calibrationOffset: offset });
    res.json({ message: 'Sensor calibrated', sensor });
  } catch (error) {
    res.status(500).json({ error: 'Failed to calibrate sensor' });
  }
});

// Delete sensor
router.delete('/:id', async (req, res) => {
  try {
    const sensor = await Sensor.findByPk(req.params.id);
    if (!sensor) {
      return res.status(404).json({ error: 'Sensor not found' });
    }
    await sensor.destroy();
    res.json({ message: 'Sensor deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete sensor' });
  }
});

export default router;
