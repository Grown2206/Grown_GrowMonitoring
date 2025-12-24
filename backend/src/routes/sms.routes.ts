import { Router, Request, Response } from 'express';
import { smsService } from '../services/smsService';
import { authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * Get SMS service status
 * GET /api/sms/status
 */
router.get('/status', authenticateToken, async (req: Request, res: Response) => {
  try {
    const status = smsService.getStatus();
    res.json(status);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get SMS statistics
 * GET /api/sms/stats
 */
router.get('/stats', authenticateToken, async (req: Request, res: Response) => {
  try {
    const stats = smsService.getStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get SMS history
 * GET /api/sms/history?limit=50
 */
router.get('/history', authenticateToken, async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const history = smsService.getHistory(limit);
    res.json(history);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Update SMS settings
 * POST /api/sms/settings
 */
router.post('/settings', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { enabled, accountSid, authToken, fromNumber, toNumbers, minIntervalMinutes, maxSMSPerDay } = req.body;

    await smsService.updateSettings({
      enabled,
      accountSid,
      authToken,
      fromNumber,
      toNumbers,
      minIntervalMinutes,
      maxSMSPerDay,
    });

    res.json({ message: 'SMS settings updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Send test SMS
 * POST /api/sms/test
 */
router.post('/test', authenticateToken, async (req: Request, res: Response) => {
  try {
    const result = await smsService.sendTestSMS();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
