import express from 'express';
import { Plant } from '../models/Plant';
import { Strain } from '../models/Strain';
import { IrrigationConfig } from '../models/IrrigationConfig';
import { Note } from '../models/Note';
import { CalendarEvent } from '../models/CalendarEvent';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

// Get all plants
router.get('/', async (req, res) => {
  try {
    const plants = await Plant.findAll({
      include: [
        { model: Strain, as: 'strain' },
        { model: IrrigationConfig, as: 'irrigationConfig' },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(plants);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch plants' });
  }
});

// Get single plant
router.get('/:id', async (req, res) => {
  try {
    const plant = await Plant.findByPk(req.params.id, {
      include: [
        { model: Strain, as: 'strain' },
        { model: IrrigationConfig, as: 'irrigationConfig' },
        { model: Note, as: 'notes' },
        { model: CalendarEvent, as: 'events' },
      ],
    });

    if (!plant) {
      return res.status(404).json({ error: 'Plant not found' });
    }

    res.json(plant);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch plant' });
  }
});

// Create plant
router.post('/', async (req, res) => {
  try {
    const plant = await Plant.create(req.body);
    res.status(201).json(plant);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update plant
router.put('/:id', async (req, res) => {
  try {
    const plant = await Plant.findByPk(req.params.id);
    if (!plant) {
      return res.status(404).json({ error: 'Plant not found' });
    }

    await plant.update(req.body);
    res.json(plant);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Delete plant
router.delete('/:id', async (req, res) => {
  try {
    const plant = await Plant.findByPk(req.params.id);
    if (!plant) {
      return res.status(404).json({ error: 'Plant not found' });
    }

    await plant.destroy();
    res.json({ message: 'Plant deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete plant' });
  }
});

export default router;
