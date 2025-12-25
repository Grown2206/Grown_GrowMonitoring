import { Router, Response } from 'express';
import { AuthRequest, authenticateToken } from '../middleware/auth';
import { recentItemsService } from '../services/recentItemsService';
import { RecentItemType } from '../models/RecentItem';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /api/recent-items:
 *   get:
 *     summary: Get recent items for current user
 *     tags: [Recent Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [plant, sensor, device, harvest, automation, recipe, report]
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of recent items
 */
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const itemType = req.query.type as RecentItemType | undefined;
    const limit = parseInt(req.query.limit as string) || 20;

    const items = await recentItemsService.getRecentItems(userId, itemType, limit);
    res.json(items);
  } catch (error: any) {
    console.error('Error fetching recent items:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/recent-items/most-accessed:
 *   get:
 *     summary: Get most accessed items
 *     tags: [Recent Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of most accessed items
 */
router.get('/most-accessed', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const itemType = req.query.type as RecentItemType | undefined;
    const limit = parseInt(req.query.limit as string) || 10;

    const items = await recentItemsService.getMostAccessed(userId, itemType, limit);
    res.json(items);
  } catch (error: any) {
    console.error('Error fetching most accessed items:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/recent-items/statistics:
 *   get:
 *     summary: Get statistics about recent items
 *     tags: [Recent Items]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics
 */
router.get('/statistics', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const stats = await recentItemsService.getStatistics(userId);
    res.json(stats);
  } catch (error: any) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/recent-items/track:
 *   post:
 *     summary: Track an item access
 *     tags: [Recent Items]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - itemType
 *               - itemId
 *               - itemName
 *             properties:
 *               itemType:
 *                 type: string
 *                 enum: [plant, sensor, device, harvest, automation, recipe, report]
 *               itemId:
 *                 type: integer
 *               itemName:
 *                 type: string
 *               metadata:
 *                 type: object
 *     responses:
 *       200:
 *         description: Item tracked successfully
 */
router.post('/track', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { itemType, itemId, itemName, metadata } = req.body;

    if (!itemType || !itemId || !itemName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await recentItemsService.trackAccess(userId, itemType, itemId, itemName, metadata);
    res.json({ message: 'Item tracked successfully' });
  } catch (error: any) {
    console.error('Error tracking item:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/recent-items:
 *   delete:
 *     summary: Clear all recent items
 *     tags: [Recent Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Items cleared successfully
 */
router.delete('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const itemType = req.query.type as RecentItemType | undefined;

    const count = await recentItemsService.clearRecent(userId, itemType);
    res.json({ message: `${count} items cleared successfully` });
  } catch (error: any) {
    console.error('Error clearing recent items:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/recent-items/{type}/{id}:
 *   delete:
 *     summary: Remove a specific recent item
 *     tags: [Recent Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Item removed successfully
 */
router.delete('/:type/:id', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const itemType = req.params.type as RecentItemType;
    const itemId = parseInt(req.params.id);

    const success = await recentItemsService.removeItem(userId, itemType, itemId);
    if (success) {
      res.json({ message: 'Item removed successfully' });
    } else {
      res.status(404).json({ error: 'Item not found' });
    }
  } catch (error: any) {
    console.error('Error removing item:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
