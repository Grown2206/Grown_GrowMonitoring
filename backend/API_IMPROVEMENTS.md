# API Improvements - Sprint 7

This document describes the new API features added in Sprint 7: Advanced Querying, Batch Operations, and Performance Optimizations.

## 1. Advanced Query Parameters

All list endpoints now support advanced query parameters for filtering, sorting, pagination, and field selection.

### Example: Plants API

**Endpoint:** `GET /api/plants`

### Filtering

Filter results using the `filter[field]` parameter with various operators:

```
# Exact match
GET /api/plants?filter[phase]=vegetative

# Greater than
GET /api/plants?filter[createdAt][$gt]=2024-01-01

# Less than or equal
GET /api/plants?filter[sensorId][$lte]=5

# LIKE search (case-insensitive substring)
GET /api/plants?filter[name][$like]=Tomato

# IN query (multiple values)
GET /api/plants?filter[phase][$in]=vegetative,flowering

# Not equal
GET /api/plants?filter[isActive][$ne]=false
```

**Supported Operators:**
- `$gt` - Greater than
- `$gte` - Greater than or equal
- `$lt` - Less than
- `$lte` - Less than or equal
- `$like` - LIKE query (substring match)
- `$in` - IN query (comma-separated values)
- `$ne` - Not equal
- `$between` - Between (expects array [min, max])

### Sorting

Sort results using the `sort` parameter:

```
# Sort ascending
GET /api/plants?sort=name

# Sort descending (prefix with -)
GET /api/plants?sort=-createdAt

# Multiple sort fields
GET /api/plants?sort=phase&sort=-createdAt
```

### Pagination

Paginate results using `page` and `limit` parameters:

```
# Get page 1 with 20 items (default)
GET /api/plants?page=1&limit=20

# Get page 2 with 50 items
GET /api/plants?page=2&limit=50

# Maximum limit: 100
GET /api/plants?limit=100
```

**Response Format:**
```json
{
  "data": [...],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Field Selection

Select specific fields using the `fields` parameter (comma-separated):

```
# Only return id, name, and phase
GET /api/plants?fields=id,name,phase

# Reduces response size and improves performance
```

### Combined Example

Combine all features for powerful queries:

```
GET /api/plants?filter[phase]=vegetative&filter[isActive]=true&sort=-createdAt&page=1&limit=10&fields=id,name,phase,plantedDate
```

This query:
- Filters for vegetative phase plants that are active
- Sorts by creation date (newest first)
- Returns page 1 with 10 items
- Only includes id, name, phase, and plantedDate fields

## 2. Batch Operations

Execute multiple operations in a single API call for improved performance.

### Plants Batch Operations

**Endpoint:** `POST /api/batch/plants`

**Supported Actions:**
- `update` - Update multiple plants
- `delete` - Delete multiple plants
- `updatePhase` - Update phase for multiple plants
- `toggleActive` - Toggle isActive for multiple plants

**Request Format:**
```json
{
  "operations": [
    {
      "action": "updatePhase",
      "ids": [1, 2, 3],
      "data": { "phase": "flowering" }
    },
    {
      "action": "delete",
      "ids": [10, 11]
    }
  ]
}
```

**Response Format:**
```json
{
  "results": [
    {
      "success": true,
      "action": "updatePhase",
      "affected": 3
    },
    {
      "success": true,
      "action": "delete",
      "affected": 2
    }
  ],
  "summary": {
    "total": 2,
    "succeeded": 2,
    "failed": 0
  }
}
```

### Sensor Data Batch Operations

**Endpoint:** `POST /api/batch/sensor-data`

**Supported Actions:**
- `deleteOlderThan` - Delete sensor data older than specified date
- `deleteByDateRange` - Delete sensor data within date range

**Example:**
```json
{
  "operations": [
    {
      "action": "deleteOlderThan",
      "data": { "date": "2024-01-01" }
    }
  ]
}
```

### Notes Batch Operations

**Endpoint:** `POST /api/batch/notes`

**Supported Actions:**
- `delete` - Delete multiple notes
- `updateCategory` - Update category for multiple notes

### Relays Batch Operations

**Endpoint:** `POST /api/batch/relays`

**Supported Actions:**
- `toggleAll` - Toggle all specified relays
- `setAll` - Set all specified relays to ON or OFF

**Example:**
```json
{
  "operations": [
    {
      "action": "setAll",
      "ids": [1, 2, 3],
      "data": { "status": true }
    }
  ]
}
```

## 3. Response Compression

All API responses are now compressed using gzip, reducing bandwidth usage by 60-80%.

**How it works:**
- Automatic compression for all responses > 1KB
- Client must send `Accept-Encoding: gzip` header (most modern browsers/clients do this automatically)
- Particularly beneficial for large data sets (sensor data, analytics, etc.)

## 4. Performance Improvements

### Query Optimization
- Field selection reduces response payload size
- Pagination prevents loading large datasets
- Indexed filtering for faster queries

### Bandwidth Reduction
- gzip compression: ~70% size reduction
- Field selection: up to 90% size reduction for specific use cases
- Combined: up to 95% bandwidth savings

### Best Practices

1. **Always use pagination for large datasets:**
   ```
   GET /api/sensor-data?page=1&limit=50
   ```

2. **Select only needed fields:**
   ```
   GET /api/plants?fields=id,name,phase
   ```

3. **Use batch operations for bulk actions:**
   ```
   POST /api/batch/plants
   {
     "operations": [{ "action": "update", "ids": [1,2,3], "data": {...} }]
   }
   ```

4. **Combine filters for precise queries:**
   ```
   GET /api/plants?filter[phase]=vegetative&filter[isActive]=true
   ```

## 5. Limits and Constraints

- **Max pagination limit:** 100 items per page
- **Max batch operations:** 100 operations per request
- **Max IDs per batch operation:** 1000 IDs
- **Rate limiting:** Standard API rate limits apply

## 6. Backward Compatibility

All existing API endpoints remain fully backward compatible:
- Old requests without new parameters work as before
- Default sorting and pagination are applied automatically
- Field selection is optional

## 7. Future Enhancements

Planned for Sprint 8:
- API versioning (/api/v2/)
- GraphQL endpoint
- Webhooks for real-time updates
- Advanced aggregation queries
- Caching with ETags

## 8. Migration Guide

### Frontend Updates Needed

Update API calls to use new features:

**Before:**
```typescript
const plants = await api.get('/plants');
// Returns all plants (potentially thousands)
```

**After:**
```typescript
const response = await api.get('/plants', {
  params: {
    page: 1,
    limit: 20,
    'filter[phase]': 'vegetative',
    sort: '-createdAt',
    fields: 'id,name,phase,plantedDate'
  }
});
const { data, pagination } = response.data;
```

## 9. Testing Examples

```bash
# Test filtering
curl "http://localhost:3001/api/plants?filter[phase]=vegetative"

# Test sorting
curl "http://localhost:3001/api/plants?sort=-createdAt"

# Test pagination
curl "http://localhost:3001/api/plants?page=1&limit=10"

# Test field selection
curl "http://localhost:3001/api/plants?fields=id,name,phase"

# Test batch operations
curl -X POST http://localhost:3001/api/batch/plants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "operations": [
      {
        "action": "updatePhase",
        "ids": [1, 2],
        "data": { "phase": "flowering" }
      }
    ]
  }'
```

## 10. Error Handling

### Query Parser Errors
```json
{
  "error": "Invalid query parameters",
  "message": "Unknown operator $invalid"
}
```

### Batch Operation Errors
```json
{
  "error": "Invalid batch request",
  "message": "Operation at index 0 missing or invalid 'action' field"
}
```

### Limit Exceeded Errors
```json
{
  "error": "Too many operations",
  "message": "Maximum 100 operations allowed per batch request"
}
```
