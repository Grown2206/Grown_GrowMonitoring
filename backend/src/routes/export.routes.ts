import express from 'express';
import { SensorData } from '../models/SensorData';
import { Plant } from '../models/Plant';
import { Note } from '../models/Note';
import { IrrigationLog } from '../models/IrrigationLog';
import { authenticateToken } from '../middleware/auth';
import { exportLimiter } from '../middleware/rateLimiter';
import { Op } from 'sequelize';

const router = express.Router();

router.use(authenticateToken);
router.use(exportLimiter);

router.get('/sensor-data', async (req, res) => {
  try {
    const { format = 'json', days = 7 } = req.query;
    const since = new Date(Date.now() - parseInt(days as string) * 24 * 60 * 60 * 1000);

    const data = await SensorData.findAll({
      where: {
        timestamp: { [Op.gte]: since },
      },
      order: [['timestamp', 'ASC']],
    });

    if (format === 'csv') {
      const csv = convertToCSV(data);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=sensor-data.csv');
      res.send(csv);
    } else {
      res.json(data);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to export sensor data' });
  }
});

router.get('/plants', async (req, res) => {
  try {
    const { format = 'json' } = req.query;
    const plants = await Plant.findAll({
      include: ['strain', 'irrigationConfig', 'notes'],
    });

    if (format === 'csv') {
      const csv = convertToCSV(plants);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=plants.csv');
      res.send(csv);
    } else {
      res.json(plants);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to export plants' });
  }
});

router.get('/full-backup', async (req, res) => {
  try {
    const [plants, sensorData, notes, irrigationLogs] = await Promise.all([
      Plant.findAll({ include: ['strain', 'irrigationConfig'] }),
      SensorData.findAll({ limit: 10000, order: [['timestamp', 'DESC']] }),
      Note.findAll(),
      IrrigationLog.findAll({ limit: 1000, order: [['timestamp', 'DESC']] }),
    ]);

    const backup = {
      exportDate: new Date().toISOString(),
      version: '1.1.0',
      data: {
        plants,
        sensorData,
        notes,
        irrigationLogs,
      },
    };

    res.json(backup);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create backup' });
  }
});

function convertToCSV(data: any[]): string {
  if (!data.length) return '';

  const headers = Object.keys(data[0].get ? data[0].get() : data[0]);
  const rows = data.map((item) => {
    const obj = item.get ? item.get() : item;
    return headers.map((h) => JSON.stringify(obj[h] || '')).join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

export default router;
