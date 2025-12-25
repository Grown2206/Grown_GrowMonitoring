import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { CostEntry } from '../models/CostEntry';
import { CostTrackingService } from '../services/costTrackingService';
import { Op } from 'sequelize';

const router = express.Router();

router.use(authenticateToken);

/**
 * GET /api/cost-tracking
 * Get all cost entries with optional filters
 */
router.get('/', async (req, res) => {
  try {
    const { plantId, category, startDate, endDate, limit = 100 } = req.query;

    const where: any = {};

    if (plantId) {
      where.plantId = parseInt(plantId as string);
    }

    if (category) {
      where.category = category;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date[Op.gte] = new Date(startDate as string);
      if (endDate) where.date[Op.lte] = new Date(endDate as string);
    }

    const entries = await CostEntry.findAll({
      where,
      order: [['date', 'DESC']],
      limit: parseInt(limit as string),
    });

    res.json(entries);
  } catch (error: any) {
    console.error('Get cost entries error:', error);
    res.status(500).json({ error: 'Failed to get cost entries', message: error.message });
  }
});

/**
 * POST /api/cost-tracking
 * Create a new cost entry
 */
router.post('/', async (req, res) => {
  try {
    const entry = await CostEntry.create(req.body);
    res.status(201).json(entry);
  } catch (error: any) {
    console.error('Create cost entry error:', error);
    res.status(400).json({ error: 'Failed to create cost entry', message: error.message });
  }
});

/**
 * PUT /api/cost-tracking/:id
 * Update a cost entry
 */
router.put('/:id', async (req, res) => {
  try {
    const entry = await CostEntry.findByPk(req.params.id);

    if (!entry) {
      return res.status(404).json({ error: 'Cost entry not found' });
    }

    await entry.update(req.body);
    res.json(entry);
  } catch (error: any) {
    console.error('Update cost entry error:', error);
    res.status(400).json({ error: 'Failed to update cost entry', message: error.message });
  }
});

/**
 * DELETE /api/cost-tracking/:id
 * Delete a cost entry
 */
router.delete('/:id', async (req, res) => {
  try {
    const entry = await CostEntry.findByPk(req.params.id);

    if (!entry) {
      return res.status(404).json({ error: 'Cost entry not found' });
    }

    await entry.destroy();
    res.json({ message: 'Cost entry deleted successfully' });
  } catch (error: any) {
    console.error('Delete cost entry error:', error);
    res.status(500).json({ error: 'Failed to delete cost entry', message: error.message });
  }
});

/**
 * GET /api/cost-tracking/summary
 * Get cost summary for a period
 */
router.get('/summary/period', async (req, res) => {
  try {
    const { startDate, endDate, plantId } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    const summary = await CostTrackingService.getCostSummary(
      new Date(startDate as string),
      new Date(endDate as string),
      plantId ? parseInt(plantId as string) : undefined
    );

    res.json(summary);
  } catch (error: any) {
    console.error('Get cost summary error:', error);
    res.status(500).json({ error: 'Failed to get cost summary', message: error.message });
  }
});

/**
 * GET /api/cost-tracking/plant/:plantId
 * Analyze costs for a specific plant
 */
router.get('/plant/:plantId', async (req, res) => {
  try {
    const plantId = parseInt(req.params.plantId);

    if (isNaN(plantId)) {
      return res.status(400).json({ error: 'Invalid plantId' });
    }

    const analysis = await CostTrackingService.analyzePlantCosts(plantId);

    if (!analysis) {
      return res.status(404).json({ error: 'Plant not found' });
    }

    res.json(analysis);
  } catch (error: any) {
    console.error('Analyze plant costs error:', error);
    res.status(500).json({ error: 'Failed to analyze plant costs', message: error.message });
  }
});

/**
 * GET /api/cost-tracking/roi/:plantId
 * Calculate ROI for a harvested plant
 */
router.get('/roi/:plantId', async (req, res) => {
  try {
    const plantId = parseInt(req.params.plantId);
    const marketPricePerGram = parseFloat((req.query.pricePerGram as string) || '10');

    if (isNaN(plantId)) {
      return res.status(400).json({ error: 'Invalid plantId' });
    }

    const roi = await CostTrackingService.calculateROI(plantId, marketPricePerGram);

    if (!roi) {
      return res.status(404).json({
        error: 'ROI data not available',
        message: 'Plant must be harvested to calculate ROI',
      });
    }

    res.json(roi);
  } catch (error: any) {
    console.error('Calculate ROI error:', error);
    res.status(500).json({ error: 'Failed to calculate ROI', message: error.message });
  }
});

/**
 * GET /api/cost-tracking/budget
 * Analyze budget for a period
 */
router.get('/budget/analysis', async (req, res) => {
  try {
    const { startDate, endDate, budgetLimit } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    const analysis = await CostTrackingService.analyzeBudget(
      new Date(startDate as string),
      new Date(endDate as string),
      budgetLimit ? parseFloat(budgetLimit as string) : undefined
    );

    res.json(analysis);
  } catch (error: any) {
    console.error('Analyze budget error:', error);
    res.status(500).json({ error: 'Failed to analyze budget', message: error.message });
  }
});

/**
 * GET /api/cost-tracking/trends
 * Get cost trends over time
 */
router.get('/trends/timeline', async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'month' } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    if (!['day', 'week', 'month'].includes(groupBy as string)) {
      return res.status(400).json({ error: 'groupBy must be day, week, or month' });
    }

    const trends = await CostTrackingService.getCostTrends(
      new Date(startDate as string),
      new Date(endDate as string),
      groupBy as 'day' | 'week' | 'month'
    );

    res.json(trends);
  } catch (error: any) {
    console.error('Get cost trends error:', error);
    res.status(500).json({ error: 'Failed to get cost trends', message: error.message });
  }
});

/**
 * POST /api/cost-tracking/recurring/process
 * Process recurring cost entries
 */
router.post('/recurring/process', async (req, res) => {
  try {
    const processedCount = await CostTrackingService.processRecurringCosts();

    res.json({
      message: 'Recurring costs processed successfully',
      processedCount,
    });
  } catch (error: any) {
    console.error('Process recurring costs error:', error);
    res.status(500).json({
      error: 'Failed to process recurring costs',
      message: error.message,
    });
  }
});

/**
 * GET /api/cost-tracking/categories
 * Get available cost categories
 */
router.get('/categories/list', async (req, res) => {
  try {
    const categories = [
      { value: 'seeds', label: 'Seeds & Genetics', icon: '🌱' },
      { value: 'nutrients', label: 'Nutrients & Fertilizers', icon: '🧪' },
      { value: 'electricity', label: 'Electricity', icon: '⚡' },
      { value: 'water', label: 'Water', icon: '💧' },
      { value: 'equipment', label: 'Equipment', icon: '🔧' },
      { value: 'soil', label: 'Soil & Growing Medium', icon: '🪴' },
      { value: 'containers', label: 'Containers & Pots', icon: '🪣' },
      { value: 'maintenance', label: 'Maintenance & Repairs', icon: '🛠️' },
      { value: 'other', label: 'Other Expenses', icon: '📦' },
    ];

    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to get categories', message: error.message });
  }
});

export default router;
