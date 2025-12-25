import { Request, Response, NextFunction } from 'express';

export interface BatchOperation {
  action: string;
  ids?: number[];
  data?: any;
}

export interface BatchResult {
  success: boolean;
  action: string;
  affected?: number;
  errors?: string[];
  data?: any;
}

/**
 * Batch Operations Middleware
 *
 * Validates batch operation requests
 *
 * Expected request body format:
 * {
 *   "operations": [
 *     {
 *       "action": "update",
 *       "ids": [1, 2, 3],
 *       "data": { "field": "value" }
 *     },
 *     {
 *       "action": "delete",
 *       "ids": [4, 5, 6]
 *     }
 *   ]
 * }
 */
export function validateBatchOperations(allowedActions: string[] = []) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.body.operations || !Array.isArray(req.body.operations)) {
        return res.status(400).json({
          error: 'Invalid batch request',
          message: 'Request body must contain an "operations" array',
        });
      }

      const operations: BatchOperation[] = req.body.operations;

      // Validate max operations limit
      if (operations.length > 100) {
        return res.status(400).json({
          error: 'Too many operations',
          message: 'Maximum 100 operations allowed per batch request',
        });
      }

      // Validate each operation
      for (let i = 0; i < operations.length; i++) {
        const op = operations[i];

        if (!op.action || typeof op.action !== 'string') {
          return res.status(400).json({
            error: 'Invalid operation',
            message: `Operation at index ${i} missing or invalid "action" field`,
          });
        }

        // Check if action is allowed
        if (allowedActions.length > 0 && !allowedActions.includes(op.action)) {
          return res.status(400).json({
            error: 'Invalid action',
            message: `Action "${op.action}" is not allowed. Allowed actions: ${allowedActions.join(', ')}`,
          });
        }

        // Validate IDs if present
        if (op.ids !== undefined) {
          if (!Array.isArray(op.ids) || op.ids.some(id => typeof id !== 'number')) {
            return res.status(400).json({
              error: 'Invalid operation',
              message: `Operation at index ${i} has invalid "ids" field (must be array of numbers)`,
            });
          }

          // Limit number of IDs per operation
          if (op.ids.length > 1000) {
            return res.status(400).json({
              error: 'Too many IDs',
              message: `Operation at index ${i} exceeds maximum of 1000 IDs`,
            });
          }
        }
      }

      next();
    } catch (error) {
      res.status(400).json({
        error: 'Invalid batch request',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };
}

/**
 * Helper function to execute batch operations safely
 */
export async function executeBatchOperations<T>(
  operations: BatchOperation[],
  executor: (operation: BatchOperation) => Promise<BatchResult>
): Promise<{ results: BatchResult[]; summary: { total: number; succeeded: number; failed: number } }> {
  const results: BatchResult[] = [];
  let succeeded = 0;
  let failed = 0;

  for (const operation of operations) {
    try {
      const result = await executor(operation);
      results.push(result);

      if (result.success) {
        succeeded++;
      } else {
        failed++;
      }
    } catch (error) {
      results.push({
        success: false,
        action: operation.action,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      });
      failed++;
    }
  }

  return {
    results,
    summary: {
      total: operations.length,
      succeeded,
      failed,
    },
  };
}
