import express from 'express';
import { Device, Sensor, Relay } from '../models';
import { authenticateToken } from '../middleware/auth';
import { Op } from 'sequelize';

const router = express.Router();

router.use(authenticateToken);

// Get all devices
router.get('/', async (req, res) => {
  try {
    const devices = await Device.findAll({
      include: [
        {
          model: Sensor,
          as: 'sensors',
          required: false,
        },
        {
          model: Relay,
          as: 'relays',
          required: false,
        },
      ],
      order: [['name', 'ASC']],
    });
    res.json(devices);
  } catch (error) {
    console.error('Failed to fetch devices:', error);
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
});

// Get single device by ID
router.get('/:id', async (req, res) => {
  try {
    const device = await Device.findByPk(req.params.id, {
      include: [
        {
          model: Sensor,
          as: 'sensors',
          required: false,
        },
        {
          model: Relay,
          as: 'relays',
          required: false,
        },
      ],
    });

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    res.json(device);
  } catch (error) {
    console.error('Failed to fetch device:', error);
    res.status(500).json({ error: 'Failed to fetch device' });
  }
});

// Create new device
router.post('/', async (req, res) => {
  try {
    const {
      deviceId,
      name,
      type,
      ipAddress,
      macAddress,
      firmwareVersion,
      location,
      description,
    } = req.body;

    // Check if deviceId already exists
    const existing = await Device.findOne({ where: { deviceId } });
    if (existing) {
      return res.status(400).json({ error: 'Device ID already exists' });
    }

    const device = await Device.create({
      deviceId,
      name,
      type,
      ipAddress,
      macAddress,
      firmwareVersion,
      location,
      description,
      status: 'offline',
      isActive: true,
    });

    res.status(201).json(device);
  } catch (error) {
    console.error('Failed to create device:', error);
    res.status(500).json({ error: 'Failed to create device' });
  }
});

// Update device
router.put('/:id', async (req, res) => {
  try {
    const device = await Device.findByPk(req.params.id);

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    const {
      name,
      type,
      ipAddress,
      macAddress,
      firmwareVersion,
      status,
      location,
      description,
      isActive,
    } = req.body;

    await device.update({
      name: name !== undefined ? name : device.name,
      type: type !== undefined ? type : device.type,
      ipAddress: ipAddress !== undefined ? ipAddress : device.ipAddress,
      macAddress: macAddress !== undefined ? macAddress : device.macAddress,
      firmwareVersion: firmwareVersion !== undefined ? firmwareVersion : device.firmwareVersion,
      status: status !== undefined ? status : device.status,
      location: location !== undefined ? location : device.location,
      description: description !== undefined ? description : device.description,
      isActive: isActive !== undefined ? isActive : device.isActive,
    });

    res.json(device);
  } catch (error) {
    console.error('Failed to update device:', error);
    res.status(500).json({ error: 'Failed to update device' });
  }
});

// Delete device
router.delete('/:id', async (req, res) => {
  try {
    const device = await Device.findByPk(req.params.id);

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    await device.destroy();
    res.json({ message: 'Device deleted successfully' });
  } catch (error) {
    console.error('Failed to delete device:', error);
    res.status(500).json({ error: 'Failed to delete device' });
  }
});

// Update device status (heartbeat/ping)
router.post('/:id/heartbeat', async (req, res) => {
  try {
    const device = await Device.findByPk(req.params.id);

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    const { ipAddress, firmwareVersion } = req.body;

    await device.update({
      status: 'online',
      lastSeen: new Date(),
      ipAddress: ipAddress || device.ipAddress,
      firmwareVersion: firmwareVersion || device.firmwareVersion,
    });

    res.json(device);
  } catch (error) {
    console.error('Failed to update device heartbeat:', error);
    res.status(500).json({ error: 'Failed to update device heartbeat' });
  }
});

// Get device statistics
router.get('/:id/stats', async (req, res) => {
  try {
    const device = await Device.findByPk(req.params.id, {
      include: [
        {
          model: Sensor,
          as: 'sensors',
        },
        {
          model: Relay,
          as: 'relays',
        },
      ],
    });

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    const stats = {
      deviceId: device.deviceId,
      name: device.name,
      status: device.status,
      lastSeen: device.lastSeen,
      sensorCount: device.get('sensors')?.length || 0,
      relayCount: device.get('relays')?.length || 0,
      uptime: device.lastSeen ? Date.now() - new Date(device.lastSeen).getTime() : null,
    };

    res.json(stats);
  } catch (error) {
    console.error('Failed to fetch device stats:', error);
    res.status(500).json({ error: 'Failed to fetch device stats' });
  }
});

export default router;
