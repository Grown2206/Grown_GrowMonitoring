import express from 'express';
import { Plant, SensorData, Harvest, Strain } from '../models';
import { authenticateToken } from '../middleware/auth';
import { Op } from 'sequelize';
import { sequelize } from '../database/config';

const router = express.Router();

router.use(authenticateToken);

// Compare multiple plants
router.post('/plants', async (req, res) => {
  try {
    const { plantIds, startDate, endDate } = req.body;

    if (!plantIds || !Array.isArray(plantIds) || plantIds.length < 2) {
      return res.status(400).json({ error: 'At least 2 plant IDs required' });
    }

    const plants = await Plant.findAll({
      where: { id: { [Op.in]: plantIds } },
      include: [
        { model: Strain, as: 'strain' },
        { model: Harvest, as: 'harvests' },
      ],
    });

    if (plants.length !== plantIds.length) {
      return res.status(404).json({ error: 'Some plants not found' });
    }

    // Get sensor data for each plant
    const comparisons = await Promise.all(
      plants.map(async (plant) => {
        const where: any = { sensorId: plant.sensorId };

        if (startDate && endDate) {
          where.timestamp = {
            [Op.between]: [new Date(startDate), new Date(endDate)],
          };
        }

        const sensorData = await SensorData.findAll({
          where,
          order: [['timestamp', 'ASC']],
        });

        // Calculate statistics
        const stats = calculateStats(sensorData);

        return {
          plant: {
            id: plant.id,
            name: plant.name,
            phase: plant.phase,
            strainName: plant.strain?.name,
            plantedDate: plant.plantedDate,
          },
          sensorData,
          statistics: stats,
          harvests: plant.harvests,
        };
      })
    );

    res.json(comparisons);
  } catch (error) {
    console.error('Failed to compare plants:', error);
    res.status(500).json({ error: 'Failed to compare plants' });
  }
});

// Compare grow cycles (completed plants)
router.get('/cycles', async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const completedPlants = await Plant.findAll({
      where: { phase: 'harvested' },
      include: [
        { model: Strain, as: 'strain' },
        { model: Harvest, as: 'harvests' },
      ],
      order: [['harvestDate', 'DESC']],
      limit: parseInt(limit as string),
    });

    const cycles = await Promise.all(
      completedPlants.map(async (plant) => {
        const startDate = plant.plantedDate ? new Date(plant.plantedDate) : null;
        const endDate = plant.harvestDate ? new Date(plant.harvestDate) : null;

        if (!startDate || !endDate) {
          return {
            plant: {
              id: plant.id,
              name: plant.name,
              strainName: plant.strain?.name,
              plantedDate: plant.plantedDate,
              harvestDate: plant.harvestDate,
            },
            duration: null,
            statistics: {},
            harvests: plant.harvests,
          };
        }

        const sensorData = await SensorData.findAll({
          where: {
            sensorId: plant.sensorId,
            timestamp: {
              [Op.between]: [startDate, endDate],
            },
          },
          order: [['timestamp', 'ASC']],
        });

        const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const stats = calculateStats(sensorData);

        return {
          plant: {
            id: plant.id,
            name: plant.name,
            strainName: plant.strain?.name,
            plantedDate: plant.plantedDate,
            harvestDate: plant.harvestDate,
          },
          duration,
          statistics: stats,
          harvests: plant.harvests,
        };
      })
    );

    res.json(cycles);
  } catch (error) {
    console.error('Failed to compare cycles:', error);
    res.status(500).json({ error: 'Failed to compare cycles' });
  }
});

// Compare strains
router.get('/strains', async (req, res) => {
  try {
    const strains = await Strain.findAll({
      include: [
        {
          model: Plant,
          as: 'plants',
          where: { phase: 'harvested' },
          required: false,
          include: [
            { model: Harvest, as: 'harvests' },
          ],
        },
      ],
    });

    const comparisons = strains.map((strain) => {
      const plants = strain.get('plants') as any[];

      const totalHarvests = plants.reduce((sum, plant) => {
        const harvests = plant.harvests || [];
        return sum + harvests.reduce((s: number, h: any) => s + (h.wetWeight || 0), 0);
      }, 0);

      const avgYield = plants.length > 0 ? totalHarvests / plants.length : 0;

      const avgDuration = plants.reduce((sum, plant) => {
        if (plant.plantedDate && plant.harvestDate) {
          const duration = Math.ceil(
            (new Date(plant.harvestDate).getTime() - new Date(plant.plantedDate).getTime()) / (1000 * 60 * 60 * 24)
          );
          return sum + duration;
        }
        return sum;
      }, 0) / (plants.length || 1);

      return {
        strain: {
          id: strain.id,
          name: strain.name,
          type: strain.type,
          floweringWeeks: strain.floweringWeeks,
          thcContent: strain.thcContent,
          cbdContent: strain.cbdContent,
        },
        statistics: {
          totalGrows: plants.length,
          averageYield: avgYield,
          totalYield: totalHarvests,
          averageDuration: avgDuration,
        },
      };
    });

    res.json(comparisons);
  } catch (error) {
    console.error('Failed to compare strains:', error);
    res.status(500).json({ error: 'Failed to compare strains' });
  }
});

// Get aggregated sensor data for time periods
router.post('/sensor-trends', async (req, res) => {
  try {
    const { sensorIds, interval = 'day', startDate, endDate } = req.body;

    if (!sensorIds || !Array.isArray(sensorIds)) {
      return res.status(400).json({ error: 'Sensor IDs required' });
    }

    const where: any = {
      sensorId: { [Op.in]: sensorIds },
    };

    if (startDate && endDate) {
      where.timestamp = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    // Get data grouped by interval
    const trends = await Promise.all(
      sensorIds.map(async (sensorId: number) => {
        const data = await SensorData.findAll({
          where: { ...where, sensorId },
          order: [['timestamp', 'ASC']],
        });

        // Group by interval
        const grouped = groupByInterval(data, interval);

        return {
          sensorId,
          trends: grouped,
        };
      })
    );

    res.json(trends);
  } catch (error) {
    console.error('Failed to get sensor trends:', error);
    res.status(500).json({ error: 'Failed to get sensor trends' });
  }
});

// Helper function to calculate statistics
function calculateStats(sensorData: any[]) {
  if (sensorData.length === 0) {
    return {};
  }

  const fields = ['moistureLevel', 'temperature', 'humidity', 'co2', 'par', 'ph', 'ec', 'tds', 'voc', 'pm25', 'light'];
  const stats: any = {};

  fields.forEach((field) => {
    const values = sensorData
      .map((d) => d[field])
      .filter((v) => v != null && !isNaN(v));

    if (values.length > 0) {
      const sorted = values.sort((a, b) => a - b);
      const sum = values.reduce((a, b) => a + b, 0);

      stats[field] = {
        min: Math.min(...values),
        max: Math.max(...values),
        avg: sum / values.length,
        median: sorted[Math.floor(sorted.length / 2)],
        count: values.length,
      };
    }
  });

  return stats;
}

// Helper function to group data by interval
function groupByInterval(data: any[], interval: string) {
  const grouped: any = {};

  data.forEach((record) => {
    const date = new Date(record.timestamp);
    let key: string;

    if (interval === 'hour') {
      key = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:00`;
    } else if (interval === 'day') {
      key = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    } else if (interval === 'week') {
      const weekNum = getWeekNumber(date);
      key = `${date.getFullYear()}-W${pad(weekNum)}`;
    } else {
      key = `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
    }

    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(record);
  });

  // Calculate averages for each group
  return Object.entries(grouped).map(([key, records]: [string, any]) => {
    const stats = calculateStats(records);
    return {
      period: key,
      count: records.length,
      statistics: stats,
    };
  });
}

function pad(num: number): string {
  return num.toString().padStart(2, '0');
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export default router;
