import express, { Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { bookmarkService } from '../services/bookmarkService';
import { BookmarkItemType } from '../models/Bookmark';

const router = express.Router();

/**
 * @route GET /api/bookmarks
 * @desc Get all bookmarks for the authenticated user
 * @access Private
 */
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const itemType = req.query.itemType as BookmarkItemType | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

    const bookmarks = await bookmarkService.getBookmarks(userId, itemType, limit);
    res.json(bookmarks);
  } catch (error: any) {
    console.error('Error fetching bookmarks:', error);
    res.status(500).json({ error: 'Failed to fetch bookmarks' });
  }
});

/**
 * @route POST /api/bookmarks
 * @desc Add a new bookmark
 * @access Private
 */
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { itemType, itemId, itemName, metadata } = req.body;

    if (!itemType || !itemId || !itemName) {
      return res.status(400).json({ error: 'itemType, itemId, and itemName are required' });
    }

    const bookmark = await bookmarkService.addBookmark(
      userId,
      itemType as BookmarkItemType,
      parseInt(itemId),
      itemName,
      metadata
    );

    res.status(201).json(bookmark);
  } catch (error: any) {
    console.error('Error adding bookmark:', error);
    res.status(500).json({ error: 'Failed to add bookmark' });
  }
});

/**
 * @route POST /api/bookmarks/toggle
 * @desc Toggle a bookmark (add if not exists, remove if exists)
 * @access Private
 */
router.post('/toggle', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { itemType, itemId, itemName, metadata } = req.body;

    if (!itemType || !itemId || !itemName) {
      return res.status(400).json({ error: 'itemType, itemId, and itemName are required' });
    }

    const result = await bookmarkService.toggleBookmark(
      userId,
      itemType as BookmarkItemType,
      parseInt(itemId),
      itemName,
      metadata
    );

    res.json(result);
  } catch (error: any) {
    console.error('Error toggling bookmark:', error);
    res.status(500).json({ error: 'Failed to toggle bookmark' });
  }
});

/**
 * @route DELETE /api/bookmarks/:itemType/:itemId
 * @desc Remove a bookmark
 * @access Private
 */
router.delete('/:itemType/:itemId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { itemType, itemId } = req.params;

    const removed = await bookmarkService.removeBookmark(
      userId,
      itemType as BookmarkItemType,
      parseInt(itemId)
    );

    if (removed) {
      res.json({ message: 'Bookmark removed successfully' });
    } else {
      res.status(404).json({ error: 'Bookmark not found' });
    }
  } catch (error: any) {
    console.error('Error removing bookmark:', error);
    res.status(500).json({ error: 'Failed to remove bookmark' });
  }
});

/**
 * @route GET /api/bookmarks/check/:itemType/:itemId
 * @desc Check if an item is bookmarked
 * @access Private
 */
router.get('/check/:itemType/:itemId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { itemType, itemId } = req.params;

    const isBookmarked = await bookmarkService.isBookmarked(
      userId,
      itemType as BookmarkItemType,
      parseInt(itemId)
    );

    res.json({ bookmarked: isBookmarked });
  } catch (error: any) {
    console.error('Error checking bookmark:', error);
    res.status(500).json({ error: 'Failed to check bookmark' });
  }
});

/**
 * @route GET /api/bookmarks/statistics
 * @desc Get bookmark statistics
 * @access Private
 */
router.get('/statistics', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const statistics = await bookmarkService.getStatistics(userId);
    res.json(statistics);
  } catch (error: any) {
    console.error('Error fetching bookmark statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router;
