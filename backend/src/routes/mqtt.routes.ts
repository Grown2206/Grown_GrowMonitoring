import { Router, Request, Response } from 'express';
import { mqttService } from '../services/mqttService';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Get MQTT status
router.get('/status', authenticateToken, async (req: Request, res: Response) => {
  try {
    const status = mqttService.getStatus();
    res.json(status);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get MQTT settings
router.get('/settings', authenticateToken, async (req: Request, res: Response) => {
  try {
    const settings = mqttService.getSettings();
    res.json(settings);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update MQTT settings
router.post('/settings', authenticateToken, async (req: Request, res: Response) => {
  try {
    await mqttService.updateSettings(req.body);
    res.json({ message: 'MQTT settings updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Test MQTT connection
router.post('/test', authenticateToken, async (req: Request, res: Response) => {
  try {
    const status = mqttService.getStatus();
    if (status.connected) {
      res.json({ success: true, message: 'MQTT broker connected successfully' });
    } else {
      res.json({ success: false, message: 'MQTT broker not connected. Check settings.' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
