import { Request, Response, NextFunction } from 'express';
import { Op, Order, WhereOptions } from 'sequelize';

export interface ParsedQuery {
  where: WhereOptions;
  order: Array<[string, 'ASC' | 'DESC']>;
  limit: number;
  offset: number;
  attributes?: string[];
}

export interface QueryParserOptions {
  maxLimit?: number;
  defaultLimit?: number;
  allowedFilters?: string[];
  allowedSortFields?: string[];
  allowedFields?: string[];
}

/**
 * Query Parser Middleware
 *
 * Parses query parameters for filtering, sorting, pagination, and field selection
 *
 * Query Parameters:
 * - filter[field]=value           : Exact match
 * - filter[field][$gt]=value      : Greater than
 * - filter[field][$gte]=value     : Greater than or equal
 * - filter[field][$lt]=value      : Less than
 * - filter[field][$lte]=value     : Less than or equal
 * - filter[field][$like]=value    : LIKE query
 * - filter[field][$in]=val1,val2  : IN query
 * - sort=field                    : Sort ascending
 * - sort=-field                   : Sort descending
 * - page=1                        : Page number (1-indexed)
 * - limit=20                      : Items per page
 * - fields=field1,field2          : Select specific fields
 *
 * Example: /api/plants?filter[phase]=vegetative&sort=-createdAt&page=1&limit=10&fields=id,name,phase
 */
export function queryParser(options: QueryParserOptions = {}) {
  const {
    maxLimit = 100,
    defaultLimit = 20,
    allowedFilters = [],
    allowedSortFields = [],
    allowedFields = [],
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsedQuery: ParsedQuery = {
        where: {},
        order: [],
        limit: defaultLimit,
        offset: 0,
      };

      // Parse filters
      if (req.query.filter) {
        const filters = req.query.filter as Record<string, any>;

        for (const [field, value] of Object.entries(filters)) {
          // Check if filter is allowed
          if (allowedFilters.length > 0 && !allowedFilters.includes(field)) {
            continue;
          }

          if (typeof value === 'object' && value !== null) {
            // Handle operators like $gt, $gte, $lt, $lte, $like, $in
            const conditions: any = {};

            for (const [operator, operatorValue] of Object.entries(value)) {
              switch (operator) {
                case '$gt':
                  conditions[Op.gt] = operatorValue;
                  break;
                case '$gte':
                  conditions[Op.gte] = operatorValue;
                  break;
                case '$lt':
                  conditions[Op.lt] = operatorValue;
                  break;
                case '$lte':
                  conditions[Op.lte] = operatorValue;
                  break;
                case '$like':
                  conditions[Op.like] = `%${operatorValue}%`;
                  break;
                case '$in':
                  // Handle comma-separated values
                  const values = typeof operatorValue === 'string'
                    ? operatorValue.split(',')
                    : operatorValue;
                  conditions[Op.in] = values;
                  break;
                case '$ne':
                  conditions[Op.ne] = operatorValue;
                  break;
                case '$between':
                  // Expect array [min, max]
                  if (Array.isArray(operatorValue) && operatorValue.length === 2) {
                    conditions[Op.between] = operatorValue;
                  }
                  break;
                default:
                  // Unknown operator, skip
                  break;
              }
            }

            if (Object.keys(conditions).length > 0) {
              (parsedQuery.where as any)[field] = conditions;
            }
          } else {
            // Simple equality
            (parsedQuery.where as any)[field] = value;
          }
        }
      }

      // Parse sorting
      if (req.query.sort) {
        const sortFields = Array.isArray(req.query.sort)
          ? req.query.sort
          : [req.query.sort];

        for (const sortField of sortFields) {
          if (typeof sortField !== 'string') continue;

          const isDescending = sortField.startsWith('-');
          const field = isDescending ? sortField.substring(1) : sortField;

          // Check if sort field is allowed
          if (allowedSortFields.length > 0 && !allowedSortFields.includes(field)) {
            continue;
          }

          parsedQuery.order.push([field, isDescending ? 'DESC' : 'ASC']);
        }
      }

      // Parse pagination
      const page = parseInt(req.query.page as string) || 1;
      let limit = parseInt(req.query.limit as string) || defaultLimit;

      // Enforce max limit
      if (limit > maxLimit) {
        limit = maxLimit;
      }

      parsedQuery.limit = limit;
      parsedQuery.offset = (page - 1) * limit;

      // Parse field selection
      if (req.query.fields) {
        const fields = typeof req.query.fields === 'string'
          ? req.query.fields.split(',')
          : req.query.fields;

        // Filter allowed fields
        if (allowedFields.length > 0) {
          parsedQuery.attributes = (fields as string[]).filter(f =>
            allowedFields.includes(f.trim())
          );
        } else {
          parsedQuery.attributes = (fields as string[]).map(f => f.trim());
        }

        // Ensure id is always included if attributes are specified
        if (parsedQuery.attributes && !parsedQuery.attributes.includes('id')) {
          parsedQuery.attributes.unshift('id');
        }
      }

      // Attach parsed query to request
      (req as any).parsedQuery = parsedQuery;

      next();
    } catch (error) {
      res.status(400).json({
        error: 'Invalid query parameters',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };
}

/**
 * Helper function to apply parsed query to Sequelize findAndCountAll
 */
export function applyParsedQuery(query: ParsedQuery, additionalOptions: any = {}) {
  return {
    where: { ...query.where, ...additionalOptions.where },
    order: query.order.length > 0 ? query.order : additionalOptions.order,
    limit: query.limit,
    offset: query.offset,
    attributes: query.attributes || additionalOptions.attributes,
    ...additionalOptions,
  };
}

/**
 * Helper function to create pagination response
 */
export function createPaginationResponse<T>(
  data: { rows: T[]; count: number },
  page: number,
  limit: number
) {
  const totalPages = Math.ceil(data.count / limit);

  return {
    data: data.rows,
    pagination: {
      total: data.count,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}
