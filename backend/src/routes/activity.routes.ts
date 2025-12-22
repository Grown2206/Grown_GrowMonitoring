import express from 'express';
import { ActivityLog } from '../models/ActivityLog';
import { User } from '../models/User';
import { authenticateToken } from '../middleware/auth';
import { Op } from 'sequelize';

const router = express.Router();

router.use(authenticateToken);

// Get activity logs with filtering
router.get('/', async (req, res) => {
  try {
    const { entity, userId, startDate, endDate, limit = 100 } = req.query;
    const where: any = {};

    if (entity) {
      where.entity = entity;
    }

    if (userId) {
      where.userId = parseInt(userId as string);
    }

    if (startDate && endDate) {
      where.timestamp = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)],
      };
    }

    const logs = await ActivityLog.findAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['id', 'username'] }],
      order: [['timestamp', 'DESC']],
      limit: parseInt(limit as string),
    });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch activity logs' });
  }
});

// Get activity stats
router.get('/stats', async (req, res) => {
  try {
    const totalLogs = await ActivityLog.count();
    const todayLogs = await ActivityLog.count({
      where: {
        timestamp: {
          [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });

    const topActions = await ActivityLog.findAll({
      attributes: [
        'action',
        [ActivityLog.sequelize!.fn('COUNT', ActivityLog.sequelize!.col('id')), 'count'],
      ],
      group: ['action'],
      order: [[ActivityLog.sequelize!.fn('COUNT', ActivityLog.sequelize!.col('id')), 'DESC']],
      limit: 10,
    });

    res.json({
      totalLogs,
      todayLogs,
      topActions,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch activity stats' });
  }
});

export default router;
