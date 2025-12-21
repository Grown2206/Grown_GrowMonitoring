import express from 'express';
import { Strain } from '../models/Strain';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const strains = await Strain.findAll({ order: [['name', 'ASC']] });
    res.json(strains);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch strains' });
  }
});

router.post('/', async (req, res) => {
  try {
    const strain = await Strain.create(req.body);
    res.status(201).json(strain);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const strain = await Strain.findByPk(req.params.id);
    if (!strain) {
      return res.status(404).json({ error: 'Strain not found' });
    }
    await strain.update(req.body);
    res.json(strain);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const strain = await Strain.findByPk(req.params.id);
    if (!strain) {
      return res.status(404).json({ error: 'Strain not found' });
    }
    await strain.destroy();
    res.json({ message: 'Strain deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete strain' });
  }
});

export default router;
