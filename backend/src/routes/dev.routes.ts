import express from 'express';
import { SeedService } from '../services/seedService';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Only enable dev routes in development mode
if (process.env.NODE_ENV === 'development' || process.env.ENABLE_DEV_ROUTES === 'true') {
  router.use(authenticateToken);

  /**
   * Generate quick demo data
   * POST /api/dev/seed/quick
   */
  router.post('/seed/quick', async (req, res) => {
    try {
      const stats = await SeedService.generateQuickDemo();
      res.json({
        message: 'Quick demo data generated successfully',
        stats,
      });
    } catch (error) {
      console.error('Failed to generate quick demo data:', error);
      res.status(500).json({ error: 'Failed to generate demo data' });
    }
  });

  /**
   * Generate full test data
   * POST /api/dev/seed/full
   */
  router.post('/seed/full', async (req, res) => {
    try {
      const stats = await SeedService.generateFullTestData();
      res.json({
        message: 'Full test data generated successfully',
        stats,
      });
    } catch (error) {
      console.error('Failed to generate full test data:', error);
      res.status(500).json({ error: 'Failed to generate test data' });
    }
  });

  /**
   * Generate custom test data
   * POST /api/dev/seed/custom
   * Body: { strains?, plants?, completedGrows?, daysOfHistory?, clearExisting? }
   */
  router.post('/seed/custom', async (req, res) => {
    try {
      const options = req.body;
      const stats = await SeedService.generateTestData(options);
      res.json({
        message: 'Custom test data generated successfully',
        stats,
      });
    } catch (error) {
      console.error('Failed to generate custom test data:', error);
      res.status(500).json({ error: 'Failed to generate test data' });
    }
  });

  /**
   * Clear all test data
   * DELETE /api/dev/seed
   */
  router.delete('/seed', async (req, res) => {
    try {
      await SeedService.clearTestData();
      res.json({
        message: 'All test data cleared successfully',
      });
    } catch (error) {
      console.error('Failed to clear test data:', error);
      res.status(500).json({ error: 'Failed to clear test data' });
    }
  });

  /**
   * Get dev mode status
   * GET /api/dev/status
   */
  router.get('/status', (req, res) => {
    res.json({
      devMode: true,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    });
  });

  console.log('✓ Development routes enabled at /api/dev');
} else {
  // Return 404 for all dev routes in production
  router.all('*', (req, res) => {
    res.status(404).json({ error: 'Development routes are disabled' });
  });
}

export default router;
