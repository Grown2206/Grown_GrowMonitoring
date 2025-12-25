import express from 'express';
import { Alert } from '../models/Alert';
import { AlertHistory } from '../models/AlertHistory';
import { AlertEscalationService } from '../services/alertEscalationService';
import { authenticateToken } from '../middleware/auth';
import { queryParser, applyParsedQuery, createPaginationResponse } from '../middleware/queryParser';

const router = express.Router();

router.use(authenticateToken);

router.get(
  '/',
  queryParser({
    maxLimit: 100,
    defaultLimit: 20,
    allowedFilters: ['name', 'type', 'enabled', 'sensorId', 'condition'],
    allowedSortFields: ['name', 'type', 'createdAt', 'enabled'],
    allowedFields: ['id', 'name', 'type', 'sensorId', 'condition', 'threshold', 'enabled', 'config', 'escalationLevel', 'createdAt', 'updatedAt'],
  }),
  async (req, res) => {
    try {
      const parsedQuery = (req as any).parsedQuery;

      const alerts = await Alert.findAndCountAll(
        applyParsedQuery(parsedQuery, {
          order: parsedQuery.order.length > 0 ? parsedQuery.order : [['createdAt', 'DESC']],
        })
      );

      const page = parseInt(req.query.page as string) || 1;
      const limit = parsedQuery.limit;

      res.json(createPaginationResponse(alerts, page, limit));
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch alerts' });
    }
  }
);

router.post('/', async (req, res) => {
  try {
    const alert = await Alert.create(req.body);
    res.status(201).json(alert);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const alert = await Alert.findByPk(req.params.id);
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    await alert.update(req.body);
    res.json(alert);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const alert = await Alert.findByPk(req.params.id);
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    await alert.destroy();
    res.json({ message: 'Alert deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete alert' });
  }
});

// Get alert history
router.get('/history', async (req, res) => {
  try {
    const { alertId, limit } = req.query;
    const history = await AlertEscalationService.getRecentHistory(
      alertId ? parseInt(alertId as string) : undefined,
      limit ? parseInt(limit as string) : 100
    );
    res.json(history);
  } catch (error) {
    console.error('Error fetching alert history:', error);
    res.status(500).json({ error: 'Failed to fetch alert history' });
  }
});

// Acknowledge alert history entry
router.post('/history/:id/acknowledge', async (req, res) => {
  try {
    const { acknowledgedBy } = req.body;
    await AlertEscalationService.acknowledgeAlert(
      parseInt(req.params.id),
      acknowledgedBy || 'user'
    );
    res.json({ message: 'Alert acknowledged successfully' });
  } catch (error) {
    console.error('Error acknowledging alert:', error);
    res.status(500).json({ error: 'Failed to acknowledge alert' });
  }
});

// Get alert statistics
router.get('/stats', async (req, res) => {
  try {
    const unacknowledgedCount = await AlertEscalationService.getUnacknowledgedCount();
    const totalAlerts = await Alert.count({ where: { enabled: true } });
    const activeWarnings = await Alert.count({ where: { currentSeverity: 'warning' } });
    const activeCritical = await Alert.count({ where: { currentSeverity: 'critical' } });

    res.json({
      totalAlerts,
      unacknowledgedCount,
      activeWarnings,
      activeCritical,
    });
  } catch (error) {
    console.error('Error fetching alert stats:', error);
    res.status(500).json({ error: 'Failed to fetch alert statistics' });
  }
});

// Test alert (manual trigger for testing)
router.post('/:id/test', async (req, res) => {
  try {
    const alert = await Alert.findByPk(req.params.id);
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    const { value } = req.body;
    const result = await AlertEscalationService.checkAndTrigger(
      alert,
      value || alert.threshold + 1,
      alert.condition
    );

    res.json({
      message: 'Alert tested',
      result,
    });
  } catch (error: any) {
    console.error('Error testing alert:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
