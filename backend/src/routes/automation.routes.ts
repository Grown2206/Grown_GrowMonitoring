import express from 'express';
import { AutomationRule } from '../models/AutomationRule';
import { authenticateToken } from '../middleware/auth';
import { wsManager } from '../websocket/server';
import { AutomationService } from '../services/automationService';

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

    // Use enhanced automation service
    const success = await AutomationService.executeRule(rule);

    if (success) {
      res.json({ message: 'Rule triggered successfully', rule });
    } else {
      res.status(400).json({ error: 'Rule execution failed (conditions not met or error)' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to trigger rule' });
  }
});

// Validate conditions
router.post('/validate/conditions', async (req, res) => {
  try {
    const { conditionGroup } = req.body;

    if (!conditionGroup) {
      return res.status(400).json({ error: 'conditionGroup is required' });
    }

    const validation = AutomationService.validateConditionGroup(conditionGroup);

    res.json(validation);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Validate actions
router.post('/validate/actions', async (req, res) => {
  try {
    const { actions } = req.body;

    if (!actions) {
      return res.status(400).json({ error: 'actions array is required' });
    }

    const validation = AutomationService.validateActions(actions);

    res.json(validation);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Test rule (dry run without executing actions)
router.post('/:id/test', async (req, res) => {
  try {
    const rule = await AutomationRule.findByPk(req.params.id);
    if (!rule) {
      return res.status(404).json({ error: 'Rule not found' });
    }

    // Parse and validate conditions
    let conditionResult = { met: true, details: 'No conditions defined' };

    if (rule.conditions) {
      const conditionGroup = JSON.parse(rule.conditions);
      const validation = AutomationService.validateConditionGroup(conditionGroup);

      if (!validation.valid) {
        return res.status(400).json({
          error: 'Invalid conditions',
          errors: validation.errors,
        });
      }

      // Note: We can't actually test condition evaluation here without executing
      conditionResult = { met: true, details: 'Conditions validated (not evaluated)' };
    }

    // Parse and validate actions
    const actionConfig = JSON.parse(rule.actionConfig);
    let actionsValidation = { valid: true, errors: [] as string[] };

    if (actionConfig.actions && Array.isArray(actionConfig.actions)) {
      actionsValidation = AutomationService.validateActions(actionConfig.actions);
    }

    res.json({
      ruleName: rule.name,
      enabled: rule.enabled,
      triggerType: rule.triggerType,
      conditions: conditionResult,
      actions: actionsValidation,
      overallValid: actionsValidation.valid,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Test failed', message: error.message });
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
