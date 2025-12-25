import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { SensorHealthService } from '../services/sensorHealthService';

const router = express.Router();

router.use(authenticateToken);

/**
 * GET /api/sensor-health/sensor/:sensorId
 * Get health metrics for a specific sensor
 */
router.get('/sensor/:sensorId', async (req, res) => {
  try {
    const sensorId = parseInt(req.params.sensorId);
    const lookbackHours = req.query.lookbackHours
      ? parseInt(req.query.lookbackHours as string)
      : 24;

    if (isNaN(sensorId)) {
      return res.status(400).json({ error: 'Invalid sensorId' });
    }

    if (lookbackHours < 1 || lookbackHours > 168) {
      return res.status(400).json({
        error: 'lookbackHours must be between 1 and 168 (7 days)',
      });
    }

    const health = await SensorHealthService.getSensorHealth(sensorId, lookbackHours);

    if (!health) {
      return res.status(404).json({ error: 'Sensor not found' });
    }

    res.json(health);
  } catch (error: any) {
    console.error('Get sensor health error:', error);
    res.status(500).json({ error: 'Failed to get sensor health', message: error.message });
  }
});

/**
 * GET /api/sensor-health/fleet
 * Get health metrics for all sensors (fleet overview)
 */
router.get('/fleet', async (req, res) => {
  try {
    const lookbackHours = req.query.lookbackHours
      ? parseInt(req.query.lookbackHours as string)
      : 24;

    if (lookbackHours < 1 || lookbackHours > 168) {
      return res.status(400).json({
        error: 'lookbackHours must be between 1 and 168 (7 days)',
      });
    }

    const fleetHealth = await SensorHealthService.getFleetHealth(lookbackHours);

    res.json(fleetHealth);
  } catch (error: any) {
    console.error('Get fleet health error:', error);
    res.status(500).json({ error: 'Failed to get fleet health', message: error.message });
  }
});

/**
 * GET /api/sensor-health/uptime/:sensorId
 * Get detailed uptime report with gap analysis for a sensor
 */
router.get('/uptime/:sensorId', async (req, res) => {
  try {
    const sensorId = parseInt(req.params.sensorId);
    const periodHours = req.query.periodHours
      ? parseInt(req.query.periodHours as string)
      : 24;

    if (isNaN(sensorId)) {
      return res.status(400).json({ error: 'Invalid sensorId' });
    }

    if (periodHours < 1 || periodHours > 168) {
      return res.status(400).json({
        error: 'periodHours must be between 1 and 168 (7 days)',
      });
    }

    const uptimeReport = await SensorHealthService.getUptimeReport(
      sensorId,
      periodHours
    );

    if (!uptimeReport) {
      return res.status(404).json({ error: 'Sensor not found' });
    }

    res.json(uptimeReport);
  } catch (error: any) {
    console.error('Get uptime report error:', error);
    res.status(500).json({
      error: 'Failed to get uptime report',
      message: error.message,
    });
  }
});

/**
 * GET /api/sensor-health/status/:status
 * Get all sensors with a specific health status
 */
router.get('/status/:status', async (req, res) => {
  try {
    const status = req.params.status as 'healthy' | 'warning' | 'critical' | 'offline';
    const lookbackHours = req.query.lookbackHours
      ? parseInt(req.query.lookbackHours as string)
      : 24;

    if (!['healthy', 'warning', 'critical', 'offline'].includes(status)) {
      return res.status(400).json({
        error: 'Invalid status. Must be: healthy, warning, critical, or offline',
      });
    }

    if (lookbackHours < 1 || lookbackHours > 168) {
      return res.status(400).json({
        error: 'lookbackHours must be between 1 and 168 (7 days)',
      });
    }

    const sensors = await SensorHealthService.getSensorsByStatus(
      status,
      lookbackHours
    );

    res.json({
      status,
      count: sensors.length,
      sensors,
      timestamp: new Date(),
    });
  } catch (error: any) {
    console.error('Get sensors by status error:', error);
    res.status(500).json({
      error: 'Failed to get sensors by status',
      message: error.message,
    });
  }
});

/**
 * GET /api/sensor-health/unhealthy
 * Get top N unhealthy sensors (sorted by health score, ascending)
 */
router.get('/unhealthy', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const lookbackHours = req.query.lookbackHours
      ? parseInt(req.query.lookbackHours as string)
      : 24;

    if (limit < 1 || limit > 100) {
      return res.status(400).json({ error: 'limit must be between 1 and 100' });
    }

    if (lookbackHours < 1 || lookbackHours > 168) {
      return res.status(400).json({
        error: 'lookbackHours must be between 1 and 168 (7 days)',
      });
    }

    const sensors = await SensorHealthService.getUnhealthySensors(
      limit,
      lookbackHours
    );

    res.json({
      count: sensors.length,
      sensors,
      timestamp: new Date(),
    });
  } catch (error: any) {
    console.error('Get unhealthy sensors error:', error);
    res.status(500).json({
      error: 'Failed to get unhealthy sensors',
      message: error.message,
    });
  }
});

/**
 * GET /api/sensor-health/summary
 * Get a quick summary of fleet health (counts only)
 */
router.get('/summary', async (req, res) => {
  try {
    const lookbackHours = req.query.lookbackHours
      ? parseInt(req.query.lookbackHours as string)
      : 24;

    if (lookbackHours < 1 || lookbackHours > 168) {
      return res.status(400).json({
        error: 'lookbackHours must be between 1 and 168 (7 days)',
      });
    }

    const fleetHealth = await SensorHealthService.getFleetHealth(lookbackHours);

    // Return summary only (no individual sensor details)
    res.json({
      totalSensors: fleetHealth.totalSensors,
      healthy: fleetHealth.healthy,
      warning: fleetHealth.warning,
      critical: fleetHealth.critical,
      offline: fleetHealth.offline,
      averageHealth: fleetHealth.averageHealth,
      averageUptime: fleetHealth.averageUptime,
      timestamp: fleetHealth.timestamp,
    });
  } catch (error: any) {
    console.error('Get health summary error:', error);
    res.status(500).json({
      error: 'Failed to get health summary',
      message: error.message,
    });
  }
});

export default router;
