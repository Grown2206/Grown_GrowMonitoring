import express from 'express';
import { Harvest } from '../models/Harvest';
import { Plant } from '../models/Plant';
import { authenticateToken } from '../middleware/auth';
import { webhookService } from '../services/webhookService';

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const harvests = await Harvest.findAll({
      include: [{ model: Plant, as: 'plant', attributes: ['name'] }],
      order: [['harvestDate', 'DESC']],
    });
    res.json(harvests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch harvests' });
  }
});

router.post('/', async (req, res) => {
  try {
    const harvest = await Harvest.create(req.body);

    // Trigger webhook
    webhookService.trigger('harvest.created', {
      harvestId: harvest.id,
      plantId: harvest.plantId,
      harvestDate: harvest.harvestDate,
      wetWeight: harvest.wetWeight,
      dryWeight: harvest.dryWeight,
      quality: harvest.quality,
    });

    res.status(201).json(harvest);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const harvest = await Harvest.findByPk(req.params.id);
    if (!harvest) return res.status(404).json({ error: 'Harvest not found' });
    await harvest.update(req.body);
    res.json(harvest);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const harvest = await Harvest.findByPk(req.params.id);
    if (!harvest) return res.status(404).json({ error: 'Harvest not found' });
    await harvest.destroy();
    res.json({ message: 'Harvest deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete harvest' });
  }
});

export default router;
