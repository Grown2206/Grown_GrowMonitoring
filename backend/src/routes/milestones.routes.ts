import express from 'express';
import { Milestone } from '../models/Milestone';
import { Plant } from '../models/Plant';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

// Get all milestones (optionally filtered by plantId)
router.get('/', async (req, res) => {
  try {
    const { plantId } = req.query;
    const where = plantId ? { plantId: parseInt(plantId as string) } : {};

    const milestones = await Milestone.findAll({
      where,
      include: [
        {
          model: Plant,
          as: 'plant',
          attributes: ['id', 'name', 'phase'],
        },
      ],
      order: [['date', 'DESC']],
    });

    res.json(milestones);
  } catch (error) {
    console.error('Error fetching milestones:', error);
    res.status(500).json({ error: 'Failed to fetch milestones' });
  }
});

// Get a specific milestone
router.get('/:id', async (req, res) => {
  try {
    const milestone = await Milestone.findByPk(req.params.id, {
      include: [
        {
          model: Plant,
          as: 'plant',
          attributes: ['id', 'name', 'phase'],
        },
      ],
    });

    if (!milestone) {
      return res.status(404).json({ error: 'Milestone not found' });
    }

    res.json(milestone);
  } catch (error) {
    console.error('Error fetching milestone:', error);
    res.status(500).json({ error: 'Failed to fetch milestone' });
  }
});

// Create a new milestone
router.post('/', async (req, res) => {
  try {
    const milestone = await Milestone.create(req.body);
    res.status(201).json(milestone);
  } catch (error: any) {
    console.error('Error creating milestone:', error);
    res.status(400).json({ error: error.message });
  }
});

// Update a milestone
router.put('/:id', async (req, res) => {
  try {
    const milestone = await Milestone.findByPk(req.params.id);

    if (!milestone) {
      return res.status(404).json({ error: 'Milestone not found' });
    }

    await milestone.update(req.body);
    res.json(milestone);
  } catch (error: any) {
    console.error('Error updating milestone:', error);
    res.status(400).json({ error: error.message });
  }
});

// Delete a milestone
router.delete('/:id', async (req, res) => {
  try {
    const milestone = await Milestone.findByPk(req.params.id);

    if (!milestone) {
      return res.status(404).json({ error: 'Milestone not found' });
    }

    await milestone.destroy();
    res.json({ message: 'Milestone deleted successfully' });
  } catch (error) {
    console.error('Error deleting milestone:', error);
    res.status(500).json({ error: 'Failed to delete milestone' });
  }
});

export default router;
