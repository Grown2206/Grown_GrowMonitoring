import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { PIDControllerService, PIDControllerConfig } from '../services/pidControllerService';

const router = express.Router();

router.use(authenticateToken);

/**
 * POST /api/pid-controller/create
 * Create a new PID controller
 *
 * Body: PIDControllerConfig
 */
router.post('/create', async (req, res) => {
  try {
    const config: PIDControllerConfig = req.body;

    if (!config.id || !config.name || !config.sensorId || !config.field) {
      return res.status(400).json({
        error: 'Missing required fields: id, name, sensorId, field',
      });
    }

    if (!config.parameters) {
      return res.status(400).json({
        error: 'Missing required field: parameters',
      });
    }

    // Validate parameters
    const { kp, ki, kd, setpoint } = config.parameters;
    if (
      kp === undefined ||
      ki === undefined ||
      kd === undefined ||
      setpoint === undefined
    ) {
      return res.status(400).json({
        error: 'PID parameters must include kp, ki, kd, and setpoint',
      });
    }

    PIDControllerService.createController(config);

    res.status(201).json({
      message: 'PID controller created successfully',
      controllerId: config.id,
    });
  } catch (error: any) {
    console.error('Create controller error:', error);
    res.status(400).json({ error: 'Failed to create controller', message: error.message });
  }
});

/**
 * POST /api/pid-controller/:id/start
 * Start a PID controller
 */
router.post('/:id/start', async (req, res) => {
  try {
    const controllerId = req.params.id;

    PIDControllerService.startController(controllerId);

    res.json({
      message: `PID controller ${controllerId} started successfully`,
    });
  } catch (error: any) {
    console.error('Start controller error:', error);
    res.status(400).json({ error: 'Failed to start controller', message: error.message });
  }
});

/**
 * POST /api/pid-controller/:id/stop
 * Stop a PID controller
 */
router.post('/:id/stop', async (req, res) => {
  try {
    const controllerId = req.params.id;

    PIDControllerService.stopController(controllerId);

    res.json({
      message: `PID controller ${controllerId} stopped successfully`,
    });
  } catch (error: any) {
    console.error('Stop controller error:', error);
    res.status(400).json({ error: 'Failed to stop controller', message: error.message });
  }
});

/**
 * GET /api/pid-controller/:id
 * Get controller status
 */
router.get('/:id', async (req, res) => {
  try {
    const controllerId = req.params.id;

    const status = PIDControllerService.getControllerStatus(controllerId);

    if (!status) {
      return res.status(404).json({ error: 'Controller not found' });
    }

    res.json(status);
  } catch (error: any) {
    console.error('Get controller status error:', error);
    res.status(500).json({ error: 'Failed to get controller status', message: error.message });
  }
});

/**
 * GET /api/pid-controller
 * Get all controllers
 */
router.get('/', async (req, res) => {
  try {
    const controllers = PIDControllerService.getAllControllers();

    res.json({
      count: controllers.length,
      controllers,
    });
  } catch (error: any) {
    console.error('Get all controllers error:', error);
    res.status(500).json({ error: 'Failed to get controllers', message: error.message });
  }
});

/**
 * PUT /api/pid-controller/:id
 * Update controller configuration
 */
router.put('/:id', async (req, res) => {
  try {
    const controllerId = req.params.id;
    const updates = req.body;

    PIDControllerService.updateController(controllerId, updates);

    res.json({
      message: `PID controller ${controllerId} updated successfully`,
    });
  } catch (error: any) {
    console.error('Update controller error:', error);
    res.status(400).json({ error: 'Failed to update controller', message: error.message });
  }
});

/**
 * DELETE /api/pid-controller/:id
 * Delete a controller
 */
router.delete('/:id', async (req, res) => {
  try {
    const controllerId = req.params.id;

    PIDControllerService.deleteController(controllerId);

    res.json({
      message: `PID controller ${controllerId} deleted successfully`,
    });
  } catch (error: any) {
    console.error('Delete controller error:', error);
    res.status(400).json({ error: 'Failed to delete controller', message: error.message });
  }
});

/**
 * POST /api/pid-controller/auto-tune
 * Auto-tune PID parameters using Ziegler-Nichols method
 *
 * Body:
 * {
 *   sensorId: number,
 *   field: string,
 *   setpoint: number,
 *   oscillationTestDurationMinutes?: number
 * }
 */
router.post('/auto-tune', async (req, res) => {
  try {
    const { sensorId, field, setpoint, oscillationTestDurationMinutes } = req.body;

    if (!sensorId || !field || setpoint === undefined) {
      return res.status(400).json({
        error: 'Missing required fields: sensorId, field, setpoint',
      });
    }

    const tuningResult = await PIDControllerService.autoTune(
      sensorId,
      field,
      setpoint,
      oscillationTestDurationMinutes
    );

    res.json(tuningResult);
  } catch (error: any) {
    console.error('Auto-tune error:', error);
    res.status(400).json({ error: 'Failed to auto-tune', message: error.message });
  }
});

/**
 * GET /api/pid-controller/recommended/:scenario
 * Get recommended PID parameters for a scenario
 */
router.get('/recommended/:scenario', async (req, res) => {
  try {
    const scenario = req.params.scenario as 'temperature' | 'humidity' | 'co2' | 'light';

    if (!['temperature', 'humidity', 'co2', 'light'].includes(scenario)) {
      return res.status(400).json({
        error: 'Invalid scenario. Must be: temperature, humidity, co2, or light',
      });
    }

    const parameters = PIDControllerService.getRecommendedParameters(scenario);

    res.json({
      scenario,
      parameters,
      description: `Recommended PID parameters for ${scenario} control`,
    });
  } catch (error: any) {
    console.error('Get recommended parameters error:', error);
    res.status(500).json({
      error: 'Failed to get recommended parameters',
      message: error.message,
    });
  }
});

/**
 * GET /api/pid-controller/examples
 * Get example configurations for different use cases
 */
router.get('/examples/configurations', async (req, res) => {
  try {
    const examples = {
      temperatureControl: {
        description: 'PID controller for maintaining grow room temperature',
        config: {
          id: 'temp-controller-1',
          name: 'Room Temperature Controller',
          sensorId: 1,
          field: 'temperature',
          parameters: PIDControllerService.getRecommendedParameters('temperature'),
          relayId: 1, // Heater/AC relay
          updateIntervalSeconds: 30,
          enabled: true,
        },
      },
      humidityControl: {
        description: 'PID controller for maintaining optimal humidity',
        config: {
          id: 'humidity-controller-1',
          name: 'Humidity Controller',
          sensorId: 1,
          field: 'humidity',
          parameters: PIDControllerService.getRecommendedParameters('humidity'),
          relayId: 2, // Humidifier relay
          updateIntervalSeconds: 60,
          enabled: true,
        },
      },
      co2Control: {
        description: 'PID controller for CO2 enrichment',
        config: {
          id: 'co2-controller-1',
          name: 'CO2 Controller',
          sensorId: 2,
          field: 'co2',
          parameters: PIDControllerService.getRecommendedParameters('co2'),
          relayId: 3, // CO2 valve relay
          updateIntervalSeconds: 120,
          enabled: true,
        },
      },
      customControl: {
        description: 'Custom PID controller with manual parameters',
        config: {
          id: 'custom-controller-1',
          name: 'Custom Controller',
          sensorId: 1,
          field: 'custom_field',
          parameters: {
            kp: 1.0,
            ki: 0.1,
            kd: 0.5,
            setpoint: 50,
            minOutput: 0,
            maxOutput: 100,
            integralWindup: 20,
          },
          updateIntervalSeconds: 60,
          enabled: false,
        },
      },
    };

    res.json(examples);
  } catch (error: any) {
    console.error('Get examples error:', error);
    res.status(500).json({ error: 'Failed to get examples', message: error.message });
  }
});

export default router;
