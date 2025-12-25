import { Router, Response } from 'express';
import { AuthRequest, authenticateToken } from '../middleware/auth';
import { WebHook } from '../models/WebHook';
import { WebHookLog } from '../models/WebHookLog';
import { webhookService } from '../services/webhookService';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /api/webhooks:
 *   get:
 *     summary: Get all webhooks
 *     tags: [WebHooks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of webhooks
 */
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const webhooks = await WebHook.findAll({
      order: [['createdAt', 'DESC']],
    });
    res.json(webhooks);
  } catch (error: any) {
    console.error('Error fetching webhooks:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/webhooks/{id}:
 *   get:
 *     summary: Get webhook by ID
 *     tags: [WebHooks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Webhook details
 *       404:
 *         description: Webhook not found
 */
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const webhook = await WebHook.findByPk(req.params.id);
    if (!webhook) {
      return res.status(404).json({ error: 'Webhook not found' });
    }
    res.json(webhook);
  } catch (error: any) {
    console.error('Error fetching webhook:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/webhooks:
 *   post:
 *     summary: Create a new webhook
 *     tags: [WebHooks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - url
 *               - events
 *             properties:
 *               name:
 *                 type: string
 *               url:
 *                 type: string
 *                 format: uri
 *               method:
 *                 type: string
 *                 enum: [GET, POST, PUT, PATCH]
 *               events:
 *                 type: array
 *                 items:
 *                   type: string
 *               headers:
 *                 type: object
 *               secret:
 *                 type: string
 *               maxRetries:
 *                 type: integer
 *               timeoutMs:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Webhook created successfully
 */
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const webhook = await WebHook.create(req.body);
    res.status(201).json(webhook);
  } catch (error: any) {
    console.error('Error creating webhook:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/webhooks/{id}:
 *   put:
 *     summary: Update webhook
 *     tags: [WebHooks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Webhook updated successfully
 *       404:
 *         description: Webhook not found
 */
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const webhook = await WebHook.findByPk(req.params.id);
    if (!webhook) {
      return res.status(404).json({ error: 'Webhook not found' });
    }

    await webhook.update(req.body);
    res.json(webhook);
  } catch (error: any) {
    console.error('Error updating webhook:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/webhooks/{id}:
 *   delete:
 *     summary: Delete webhook
 *     tags: [WebHooks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Webhook deleted successfully
 *       404:
 *         description: Webhook not found
 */
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const webhook = await WebHook.findByPk(req.params.id);
    if (!webhook) {
      return res.status(404).json({ error: 'Webhook not found' });
    }

    await webhook.destroy();
    res.json({ message: 'Webhook deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting webhook:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/webhooks/{id}/test:
 *   post:
 *     summary: Test webhook
 *     tags: [WebHooks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Test result
 */
router.post('/:id/test', async (req: AuthRequest, res: Response) => {
  try {
    const result = await webhookService.testWebHook(parseInt(req.params.id));
    res.json(result);
  } catch (error: any) {
    console.error('Error testing webhook:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/webhooks/{id}/reset:
 *   post:
 *     summary: Reset failed webhook
 *     tags: [WebHooks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Webhook reset successfully
 */
router.post('/:id/reset', async (req: AuthRequest, res: Response) => {
  try {
    const success = await webhookService.resetWebHook(parseInt(req.params.id));
    if (!success) {
      return res.status(404).json({ error: 'Webhook not found' });
    }
    res.json({ message: 'Webhook reset successfully' });
  } catch (error: any) {
    console.error('Error resetting webhook:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/webhooks/{id}/statistics:
 *   get:
 *     summary: Get webhook statistics
 *     tags: [WebHooks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Webhook statistics
 *       404:
 *         description: Webhook not found
 */
router.get('/:id/statistics', async (req: AuthRequest, res: Response) => {
  try {
    const stats = await webhookService.getStatistics(parseInt(req.params.id));
    if (!stats) {
      return res.status(404).json({ error: 'Webhook not found' });
    }
    res.json(stats);
  } catch (error: any) {
    console.error('Error fetching webhook statistics:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/webhooks/{id}/logs:
 *   get:
 *     summary: Get webhook execution logs
 *     tags: [WebHooks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Webhook logs
 */
router.get('/:id/logs', async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const logs = await WebHookLog.findAll({
      where: { webhookId: req.params.id },
      order: [['createdAt', 'DESC']],
      limit,
    });
    res.json(logs);
  } catch (error: any) {
    console.error('Error fetching webhook logs:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/webhooks/events/available:
 *   get:
 *     summary: Get available webhook events
 *     tags: [WebHooks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of available events
 */
router.get('/events/available', async (req: AuthRequest, res: Response) => {
  const events = [
    { value: 'sensor.data', label: 'Sensor Data Updated', description: 'Triggered when sensor data is received' },
    { value: 'sensor.alert', label: 'Sensor Alert', description: 'Triggered when sensor value exceeds threshold' },
    { value: 'plant.created', label: 'Plant Created', description: 'Triggered when a new plant is created' },
    { value: 'plant.updated', label: 'Plant Updated', description: 'Triggered when plant is updated' },
    { value: 'plant.deleted', label: 'Plant Deleted', description: 'Triggered when plant is deleted' },
    { value: 'harvest.created', label: 'Harvest Created', description: 'Triggered when harvest is recorded' },
    { value: 'irrigation.triggered', label: 'Irrigation Triggered', description: 'Triggered when irrigation starts' },
    { value: 'relay.state_changed', label: 'Relay State Changed', description: 'Triggered when relay is toggled' },
    { value: 'automation.triggered', label: 'Automation Triggered', description: 'Triggered when automation rule runs' },
    { value: 'alert.triggered', label: 'Alert Triggered', description: 'Triggered when alert is sent' },
    { value: 'device.online', label: 'Device Online', description: 'Triggered when device comes online' },
    { value: 'device.offline', label: 'Device Offline', description: 'Triggered when device goes offline' },
  ];
  res.json(events);
});

export default router;
