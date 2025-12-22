import express from 'express';
import { SystemSetting } from '../models/SystemSetting';
import { User } from '../models/User';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

// Get all settings
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const where = category ? { category: category as string } : {};
    const settings = await SystemSetting.findAll({ where, order: [['category', 'ASC'], ['key', 'ASC']] });
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Get setting by key
router.get('/:key', async (req, res) => {
  try {
    const setting = await SystemSetting.findOne({ where: { key: req.params.key } });
    if (!setting) {
      return res.status(404).json({ error: 'Setting not found' });
    }
    res.json(setting);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch setting' });
  }
});

// Update or create setting (admin only)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { key, value, type, category, description } = req.body;

    const [setting, created] = await SystemSetting.upsert({
      key,
      value,
      type,
      category,
      description,
    });

    res.status(created ? 201 : 200).json(setting);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Delete setting (admin only)
router.delete('/:key', requireAdmin, async (req, res) => {
  try {
    const setting = await SystemSetting.findOne({ where: { key: req.params.key } });
    if (!setting) {
      return res.status(404).json({ error: 'Setting not found' });
    }
    await setting.destroy();
    res.json({ message: 'Setting deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete setting' });
  }
});

// User management routes (admin only)
router.get('/users/all', requireAdmin, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'role', 'isActive', 'createdAt'],
      order: [['createdAt', 'DESC']],
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.patch('/users/:id', requireAdmin, async (req, res) => {
  try {
    const { isActive, role } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    await user.update({ isActive, role });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

export default router;
