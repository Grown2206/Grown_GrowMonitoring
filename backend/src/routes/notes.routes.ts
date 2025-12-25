import express from 'express';
import { Note } from '../models/Note';
import { authenticateToken } from '../middleware/auth';
import { queryParser, applyParsedQuery, createPaginationResponse } from '../middleware/queryParser';

const router = express.Router();

router.use(authenticateToken);

router.get(
  '/',
  queryParser({
    maxLimit: 100,
    defaultLimit: 20,
    allowedFilters: ['plantId', 'title', 'category', 'content'],
    allowedSortFields: ['title', 'category', 'createdAt'],
    allowedFields: ['id', 'plantId', 'title', 'content', 'category', 'createdAt', 'updatedAt'],
  }),
  async (req, res) => {
    try {
      const parsedQuery = (req as any).parsedQuery;

      const notes = await Note.findAndCountAll(
        applyParsedQuery(parsedQuery, {
          order: parsedQuery.order.length > 0 ? parsedQuery.order : [['createdAt', 'DESC']],
        })
      );

      const page = parseInt(req.query.page as string) || 1;
      const limit = parsedQuery.limit;

      res.json(createPaginationResponse(notes, page, limit));
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch notes' });
    }
  }
);

router.post('/', async (req, res) => {
  try {
    const note = await Note.create(req.body);
    res.status(201).json(note);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const note = await Note.findByPk(req.params.id);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    await note.update(req.body);
    res.json(note);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const note = await Note.findByPk(req.params.id);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    await note.destroy();
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

export default router;
