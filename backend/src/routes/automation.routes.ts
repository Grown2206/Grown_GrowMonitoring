import express from 'express';
import { AutomationRule } from '../models/AutomationRule';
import { authenticateToken } from '../middleware/auth';
import { wsManager } from '../websocket/server';

const router = express.Router();

router.use(authenticateToken);

// Get all automation rules
router.get('/', async (req, res) => {
  try {
    const rules = await AutomationRule.findAll({ order: [['createdAt', 'DESC']] });
    res.json(rules);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch automation rules' });
  }
});

// Get single rule
router.get('/:id', async (req, res) => {
  try {
    const rule = await AutomationRule.findByPk(req.params.id);
    if (!rule) {
      return res.status(404).json({ error: 'Rule not found' });
    }
    res.json(rule);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch rule' });
  }
});

// Create automation rule
router.post('/', async (req, res) => {
  try {
    const rule = await AutomationRule.create(req.body);
    res.status(201).json(rule);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update automation rule
router.put('/:id', async (req, res) => {
  try {
    const rule = await AutomationRule.findByPk(req.params.id);
    if (!rule) {
      return res.status(404).json({ error: 'Rule not found' });
    }
    await rule.update(req.body);
    res.json(rule);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Trigger automation rule manually
router.post('/:id/trigger', async (req, res) => {
  try {
    const rule = await AutomationRule.findByPk(req.params.id);
    if (!rule) {
      return res.status(404).json({ error: 'Rule not found' });
    }

    if (!rule.enabled) {
      return res.status(400).json({ error: 'Rule is disabled' });
    }

    // Parse action config
    const actionConfig = JSON.parse(rule.actionConfig);

    // Execute action based on type
    switch (rule.actionType) {
      case 'relay':
        wsManager.sendToESP32({
          type: 'relay_control',
          data: { relayId: actionConfig.relayId, status: actionConfig.status },
        });
        break;
      case 'pump':
        wsManager.sendToESP32({
          type: 'pump_control',
          data: { pumpId: actionConfig.pumpId, action: 'start', duration: actionConfig.duration },
        });
        break;
      case 'notification':
        // Send notification (could extend with email/webhook)
        console.log('Notification:', actionConfig.message);
        break;
    }

    // Update trigger count and timestamp
    await rule.update({
      lastTriggered: new Date(),
      triggerCount: rule.triggerCount + 1,
    });

    res.json({ message: 'Rule triggered successfully', rule });
  } catch (error) {
    res.status(500).json({ error: 'Failed to trigger rule' });
  }
});

// Delete automation rule
router.delete('/:id', async (req, res) => {
  try {
    const rule = await AutomationRule.findByPk(req.params.id);
    if (!rule) {
      return res.status(404).json({ error: 'Rule not found' });
    }
    await rule.destroy();
    res.json({ message: 'Rule deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete rule' });
  }
});

export default router;
