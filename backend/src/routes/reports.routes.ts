import express from 'express';
import { ReportSchedule } from '../models';
import { authenticateToken } from '../middleware/auth';
import { ReportService } from '../services/reportService';

const router = express.Router();

router.use(authenticateToken);

// Get all report schedules
router.get('/', async (req, res) => {
  try {
    const schedules = await ReportSchedule.findAll({
      order: [['createdAt', 'DESC']],
    });
    res.json(schedules);
  } catch (error) {
    console.error('Failed to fetch report schedules:', error);
    res.status(500).json({ error: 'Failed to fetch report schedules' });
  }
});

// Get single report schedule
router.get('/:id', async (req, res) => {
  try {
    const schedule = await ReportSchedule.findByPk(req.params.id);

    if (!schedule) {
      return res.status(404).json({ error: 'Report schedule not found' });
    }

    res.json(schedule);
  } catch (error) {
    console.error('Failed to fetch report schedule:', error);
    res.status(500).json({ error: 'Failed to fetch report schedule' });
  }
});

// Create report schedule
router.post('/', async (req, res) => {
  try {
    const schedule = await ReportSchedule.create(req.body);

    // Calculate next run
    const nextRun = ReportService.calculateNextRun(schedule);
    await schedule.update({ nextRun });

    res.status(201).json(schedule);
  } catch (error: any) {
    console.error('Failed to create report schedule:', error);
    res.status(400).json({ error: error.message });
  }
});

// Update report schedule
router.put('/:id', async (req, res) => {
  try {
    const schedule = await ReportSchedule.findByPk(req.params.id);

    if (!schedule) {
      return res.status(404).json({ error: 'Report schedule not found' });
    }

    await schedule.update(req.body);

    // Recalculate next run
    const nextRun = ReportService.calculateNextRun(schedule);
    await schedule.update({ nextRun });

    res.json(schedule);
  } catch (error: any) {
    console.error('Failed to update report schedule:', error);
    res.status(400).json({ error: error.message });
  }
});

// Delete report schedule
router.delete('/:id', async (req, res) => {
  try {
    const schedule = await ReportSchedule.findByPk(req.params.id);

    if (!schedule) {
      return res.status(404).json({ error: 'Report schedule not found' });
    }

    await schedule.destroy();
    res.json({ message: 'Report schedule deleted successfully' });
  } catch (error) {
    console.error('Failed to delete report schedule:', error);
    res.status(500).json({ error: 'Failed to delete report schedule' });
  }
});

// Test send report now
router.post('/:id/send-now', async (req, res) => {
  try {
    const schedule = await ReportSchedule.findByPk(req.params.id);

    if (!schedule) {
      return res.status(404).json({ error: 'Report schedule not found' });
    }

    const success = await ReportService.generateAndSendReport(schedule);

    if (success) {
      res.json({ message: 'Report sent successfully' });
    } else {
      res.status(500).json({ error: 'Failed to send report' });
    }
  } catch (error) {
    console.error('Failed to send report:', error);
    res.status(500).json({ error: 'Failed to send report' });
  }
});

// Toggle report schedule
router.patch('/:id/toggle', async (req, res) => {
  try {
    const schedule = await ReportSchedule.findByPk(req.params.id);

    if (!schedule) {
      return res.status(404).json({ error: 'Report schedule not found' });
    }

    await schedule.update({ enabled: !schedule.enabled });

    if (schedule.enabled) {
      // Recalculate next run when enabling
      const nextRun = ReportService.calculateNextRun(schedule);
      await schedule.update({ nextRun });
    }

    res.json(schedule);
  } catch (error) {
    console.error('Failed to toggle report schedule:', error);
    res.status(500).json({ error: 'Failed to toggle report schedule' });
  }
});

export default router;
