import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { validateBatchOperations, executeBatchOperations, BatchOperation, BatchResult } from '../middleware/batchOperations';
import { Plant, SensorData, Note, Alert, Relay } from '../models';

const router = Router();

/**
 * Batch operations for plants
 * POST /api/batch/plants
 *
 * Supported actions:
 * - update: Update multiple plants
 * - delete: Delete multiple plants
 * - updatePhase: Update phase for multiple plants
 * - toggleActive: Toggle isActive for multiple plants
 */
router.post(
  '/plants',
  authenticateToken,
  validateBatchOperations(['update', 'delete', 'updatePhase', 'toggleActive']),
  async (req: Request, res: Response) => {
    try {
      const operations: BatchOperation[] = req.body.operations;

      const result = await executeBatchOperations(operations, async (op) => {
        switch (op.action) {
          case 'update':
            if (!op.ids || !op.data) {
              return { success: false, action: op.action, errors: ['Missing ids or data'] };
            }
            const updateCount = await Plant.update(op.data, { where: { id: op.ids } });
            return {
              success: true,
              action: op.action,
              affected: updateCount[0],
            };

          case 'delete':
            if (!op.ids) {
              return { success: false, action: op.action, errors: ['Missing ids'] };
            }
            const deleteCount = await Plant.destroy({ where: { id: op.ids } });
            return {
              success: true,
              action: op.action,
              affected: deleteCount,
            };

          case 'updatePhase':
            if (!op.ids || !op.data?.phase) {
              return { success: false, action: op.action, errors: ['Missing ids or phase'] };
            }
            const phaseUpdateCount = await Plant.update(
              { phase: op.data.phase },
              { where: { id: op.ids } }
            );
            return {
              success: true,
              action: op.action,
              affected: phaseUpdateCount[0],
            };

          case 'toggleActive':
            if (!op.ids) {
              return { success: false, action: op.action, errors: ['Missing ids'] };
            }
            // Toggle isActive for each plant
            const plants = await Plant.findAll({ where: { id: op.ids } });
            let toggled = 0;
            for (const plant of plants) {
              plant.isActive = !plant.isActive;
              await plant.save();
              toggled++;
            }
            return {
              success: true,
              action: op.action,
              affected: toggled,
            };

          default:
            return { success: false, action: op.action, errors: ['Unknown action'] };
        }
      });

      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * Batch operations for sensor data cleanup
 * POST /api/batch/sensor-data
 *
 * Supported actions:
 * - deleteOlderThan: Delete sensor data older than specified date
 * - deleteByDateRange: Delete sensor data within date range
 */
router.post(
  '/sensor-data',
  authenticateToken,
  validateBatchOperations(['deleteOlderThan', 'deleteByDateRange']),
  async (req: Request, res: Response) => {
    try {
      const operations: BatchOperation[] = req.body.operations;

      const result = await executeBatchOperations(operations, async (op) => {
        switch (op.action) {
          case 'deleteOlderThan':
            if (!op.data?.date) {
              return { success: false, action: op.action, errors: ['Missing date'] };
            }
            const deleteCount = await SensorData.destroy({
              where: {
                timestamp: {
                  [require('sequelize').Op.lt]: new Date(op.data.date),
                },
              },
            });
            return {
              success: true,
              action: op.action,
              affected: deleteCount,
            };

          case 'deleteByDateRange':
            if (!op.data?.startDate || !op.data?.endDate) {
              return { success: false, action: op.action, errors: ['Missing startDate or endDate'] };
            }
            const rangeDeleteCount = await SensorData.destroy({
              where: {
                timestamp: {
                  [require('sequelize').Op.between]: [
                    new Date(op.data.startDate),
                    new Date(op.data.endDate),
                  ],
                },
              },
            });
            return {
              success: true,
              action: op.action,
              affected: rangeDeleteCount,
            };

          default:
            return { success: false, action: op.action, errors: ['Unknown action'] };
        }
      });

      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * Batch operations for notes
 * POST /api/batch/notes
 *
 * Supported actions:
 * - delete: Delete multiple notes
 * - updateCategory: Update category for multiple notes
 */
router.post(
  '/notes',
  authenticateToken,
  validateBatchOperations(['delete', 'updateCategory']),
  async (req: Request, res: Response) => {
    try {
      const operations: BatchOperation[] = req.body.operations;

      const result = await executeBatchOperations(operations, async (op) => {
        switch (op.action) {
          case 'delete':
            if (!op.ids) {
              return { success: false, action: op.action, errors: ['Missing ids'] };
            }
            const deleteCount = await Note.destroy({ where: { id: op.ids } });
            return {
              success: true,
              action: op.action,
              affected: deleteCount,
            };

          case 'updateCategory':
            if (!op.ids || !op.data?.category) {
              return { success: false, action: op.action, errors: ['Missing ids or category'] };
            }
            const updateCount = await Note.update(
              { category: op.data.category },
              { where: { id: op.ids } }
            );
            return {
              success: true,
              action: op.action,
              affected: updateCount[0],
            };

          default:
            return { success: false, action: op.action, errors: ['Unknown action'] };
        }
      });

      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * Batch operations for relays
 * POST /api/batch/relays
 *
 * Supported actions:
 * - toggleAll: Toggle all specified relays
 * - setAll: Set all specified relays to ON or OFF
 */
router.post(
  '/relays',
  authenticateToken,
  validateBatchOperations(['toggleAll', 'setAll']),
  async (req: Request, res: Response) => {
    try {
      const operations: BatchOperation[] = req.body.operations;

      const result = await executeBatchOperations(operations, async (op) => {
        switch (op.action) {
          case 'toggleAll':
            if (!op.ids) {
              return { success: false, action: op.action, errors: ['Missing ids'] };
            }
            const relays = await Relay.findAll({ where: { id: op.ids } });
            for (const relay of relays) {
              relay.status = !relay.status;
              relay.lastChanged = new Date();
              await relay.save();
            }
            return {
              success: true,
              action: op.action,
              affected: relays.length,
            };

          case 'setAll':
            if (!op.ids || op.data?.status === undefined) {
              return { success: false, action: op.action, errors: ['Missing ids or status'] };
            }
            const updateCount = await Relay.update(
              { status: op.data.status, lastChanged: new Date() },
              { where: { id: op.ids } }
            );
            return {
              success: true,
              action: op.action,
              affected: updateCount[0],
            };

          default:
            return { success: false, action: op.action, errors: ['Unknown action'] };
        }
      });

      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
