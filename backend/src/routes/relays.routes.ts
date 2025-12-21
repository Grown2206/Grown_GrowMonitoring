import express from 'express';
import { Relay } from '../models/Relay';
import { authenticateToken } from '../middleware/auth';
import { wsManager } from '../websocket/server';

const router = express.Router();

router.use(authenticateToken);

// Get all relays
router.get('/', async (req, res) => {
  try {
    const relays = await Relay.findAll({ order: [['relayId', 'ASC']] });
    res.json(relays);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch relays' });
  }
});

// Create relay
router.post('/', async (req, res) => {
  try {
    const relay = await Relay.create(req.body);
    res.status(201).json(relay);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update relay
router.put('/:id', async (req, res) => {
  try {
    const relay = await Relay.findByPk(req.params.id);
    if (!relay) {
      return res.status(404).json({ error: 'Relay not found' });
    }
    await relay.update(req.body);
    res.json(relay);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Control relay
router.post('/:id/control', async (req, res) => {
  try {
    const { status } = req.body;
    const relay = await Relay.findByPk(req.params.id);

    if (!relay) {
      return res.status(404).json({ error: 'Relay not found' });
    }

    // Send control command to ESP32
    const sent = wsManager.sendToESP32({
      type: 'relay_control',
      data: { relayId: relay.relayId, status },
    });

    if (!sent) {
      return res.status(503).json({ error: 'ESP32 not connected' });
    }

    // Update database
    await relay.update({ status, lastChanged: new Date() });

    res.json({ message: 'Relay control sent', relay });
  } catch (error) {
    res.status(500).json({ error: 'Failed to control relay' });
  }
});

// Delete relay
router.delete('/:id', async (req, res) => {
  try {
    const relay = await Relay.findByPk(req.params.id);
    if (!relay) {
      return res.status(404).json({ error: 'Relay not found' });
    }
    await relay.destroy();
    res.json({ message: 'Relay deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete relay' });
  }
});

export default router;
