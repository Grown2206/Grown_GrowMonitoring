import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { SensorBenchmarkService, BenchmarkBaseline } from '../services/sensorBenchmarkService';

const router = express.Router();

router.use(authenticateToken);

/**
 * POST /api/sensor-benchmark/benchmark
 * Benchmark sensors against a baseline
 *
 * Body:
 * {
 *   sensorIds: number[],
 *   baseline: {
 *     field: string,
 *     expectedValue?: number,
 *     expectedRange?: { min: number, max: number },
 *     tolerancePercent?: number,
 *     driftThreshold?: number
 *   },
 *   lookbackHours?: number
 * }
 */
router.post('/benchmark', async (req, res) => {
  try {
    const { sensorIds, baseline, lookbackHours } = req.body;

    if (!sensorIds || !Array.isArray(sensorIds) || sensorIds.length === 0) {
      return res.status(400).json({ error: 'sensorIds array is required and must not be empty' });
    }

    if (!baseline || !baseline.field) {
      return res.status(400).json({ error: 'baseline with field is required' });
    }

    // Validate baseline structure
    if (!baseline.expectedValue && !baseline.expectedRange) {
      return res.status(400).json({
        error: 'baseline must have either expectedValue or expectedRange',
      });
    }

    if (baseline.expectedRange) {
      const { min, max } = baseline.expectedRange;
      if (min === undefined || max === undefined || min >= max) {
        return res.status(400).json({
          error: 'expectedRange must have valid min and max (min < max)',
        });
      }
    }

    const report = await SensorBenchmarkService.benchmarkSensors(
      sensorIds,
      baseline as BenchmarkBaseline,
      lookbackHours
    );

    res.json(report);
  } catch (error: any) {
    console.error('Benchmark error:', error);
    res.status(500).json({ error: 'Failed to benchmark sensors', message: error.message });
  }
});

/**
 * POST /api/sensor-benchmark/drift/:sensorId
 * Detect drift for a specific sensor over time
 *
 * Body:
 * {
 *   field: string,
 *   periodHours?: number
 * }
 */
router.post('/drift/:sensorId', async (req, res) => {
  try {
    const sensorId = parseInt(req.params.sensorId);
    const { field, periodHours } = req.body;

    if (isNaN(sensorId)) {
      return res.status(400).json({ error: 'Invalid sensorId' });
    }

    if (!field || typeof field !== 'string') {
      return res.status(400).json({ error: 'field is required' });
    }

    const driftAnalysis = await SensorBenchmarkService.detectDrift(
      sensorId,
      field,
      periodHours
    );

    if (!driftAnalysis) {
      return res.status(404).json({
        error: 'Not enough data available',
        message: 'Drift detection requires at least 10 readings',
      });
    }

    res.json(driftAnalysis);
  } catch (error: any) {
    console.error('Drift detection error:', error);
    res.status(500).json({ error: 'Failed to detect drift', message: error.message });
  }
});

/**
 * POST /api/sensor-benchmark/compare
 * Compare multiple sensors against each other (no baseline needed)
 *
 * Body:
 * {
 *   sensorIds: number[],
 *   field: string,
 *   lookbackHours?: number
 * }
 */
router.post('/compare', async (req, res) => {
  try {
    const { sensorIds, field, lookbackHours } = req.body;

    if (!sensorIds || !Array.isArray(sensorIds) || sensorIds.length < 2) {
      return res.status(400).json({
        error: 'sensorIds array is required and must contain at least 2 sensors',
      });
    }

    if (!field || typeof field !== 'string') {
      return res.status(400).json({ error: 'field is required' });
    }

    const comparison = await SensorBenchmarkService.compareSensors(
      sensorIds,
      field,
      lookbackHours
    );

    res.json(comparison);
  } catch (error: any) {
    console.error('Sensor comparison error:', error);
    res.status(500).json({ error: 'Failed to compare sensors', message: error.message });
  }
});

/**
 * GET /api/sensor-benchmark/examples
 * Get example baseline configurations for different scenarios
 */
router.get('/examples', async (req, res) => {
  try {
    const examples = {
      temperatureBaseline: {
        description: 'Benchmark temperature sensors against ideal grow room temperature',
        baseline: {
          field: 'temperature',
          expectedValue: 24.0,
          tolerancePercent: 5,
          driftThreshold: 2,
        },
        usage: 'POST /api/sensor-benchmark/benchmark with sensorIds and this baseline',
      },
      humidityRange: {
        description: 'Benchmark humidity sensors against acceptable VPD range',
        baseline: {
          field: 'humidity',
          expectedRange: { min: 50, max: 70 },
          tolerancePercent: 5,
          driftThreshold: 3,
        },
        usage: 'POST /api/sensor-benchmark/benchmark with sensorIds and this baseline',
      },
      co2Range: {
        description: 'Benchmark CO2 sensors for optimal photosynthesis',
        baseline: {
          field: 'co2',
          expectedRange: { min: 800, max: 1200 },
          tolerancePercent: 10,
          driftThreshold: 5,
        },
        usage: 'POST /api/sensor-benchmark/benchmark with sensorIds and this baseline',
      },
      lightIntensity: {
        description: 'Benchmark PAR/light sensors for grow phase',
        baseline: {
          field: 'light',
          expectedRange: { min: 400, max: 600 },
          tolerancePercent: 10,
          driftThreshold: 5,
        },
        usage: 'POST /api/sensor-benchmark/benchmark with sensorIds and this baseline',
      },
    };

    res.json(examples);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to get examples', message: error.message });
  }
});

/**
 * GET /api/sensor-benchmark/fields
 * Get available sensor fields that can be benchmarked
 */
router.get('/fields', async (req, res) => {
  try {
    const fields = {
      available: [
        { field: 'temperature', unit: '°C', description: 'Air temperature' },
        { field: 'humidity', unit: '%', description: 'Relative humidity' },
        { field: 'soilMoisture', unit: '%', description: 'Soil moisture level' },
        { field: 'light', unit: 'lux/μmol', description: 'Light intensity (PAR)' },
        { field: 'co2', unit: 'ppm', description: 'CO2 concentration' },
        { field: 'ph', unit: 'pH', description: 'pH level' },
        { field: 'ec', unit: 'mS/cm', description: 'Electrical conductivity' },
      ],
      customFields: {
        description: 'Any numeric field from SensorData can be benchmarked',
        note: 'Use the exact field name from your sensor data model',
      },
    };

    res.json(fields);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to get fields', message: error.message });
  }
});

export default router;
