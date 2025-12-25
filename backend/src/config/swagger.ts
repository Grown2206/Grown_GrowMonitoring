import swaggerJsdoc from 'swagger-jsdoc';

const packageJson = require('../../package.json');

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Grow Monitoring System API',
      version: packageJson.version,
      description: `
        Comprehensive REST API for the Grow Monitoring System.

        ## Features
        - Plant & Strain Management
        - Sensor Data Collection & Analysis
        - Automation Rules & PID Controllers
        - Analytics & Reporting
        - Yield Predictions & Anomaly Detection
        - Cost Tracking & ROI Analysis
        - Grow Recipes & Schedules

        ## Authentication
        Most endpoints require JWT authentication. Include the token in the Authorization header:
        \`\`\`
        Authorization: Bearer <your-token>
        \`\`\`
      `,
      contact: {
        name: 'API Support',
        email: 'support@growmonitoring.local',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server',
      },
      {
        url: 'http://localhost:3001',
        description: 'Production server (configure as needed)',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
            },
            message: {
              type: 'string',
              description: 'Detailed error message',
            },
          },
        },
        Plant: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            strainId: { type: 'integer', nullable: true },
            phase: {
              type: 'string',
              enum: ['germination', 'seedling', 'vegetative', 'flowering', 'harvested'],
            },
            plantedDate: { type: 'string', format: 'date-time', nullable: true },
            harvestDate: { type: 'string', format: 'date-time', nullable: true },
            sensorId: { type: 'integer' },
            description: { type: 'string', nullable: true },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Strain: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            type: { type: 'string', enum: ['indica', 'sativa', 'hybrid'] },
            floweringWeeks: { type: 'integer', minimum: 1, maximum: 20 },
            description: { type: 'string', nullable: true },
            thcContent: { type: 'string', nullable: true },
            cbdContent: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Sensor: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            sensorId: { type: 'integer' },
            deviceId: { type: 'integer', nullable: true },
            name: { type: 'string' },
            type: {
              type: 'string',
              enum: ['moisture', 'temperature', 'humidity', 'ph', 'ec', 'light', 'water_level', 'co2', 'par', 'tds', 'voc', 'pm25'],
            },
            unit: { type: 'string' },
            minValue: { type: 'number' },
            maxValue: { type: 'number' },
            calibrationOffset: { type: 'number' },
            isActive: { type: 'boolean' },
            location: { type: 'string', nullable: true },
            lastReading: { type: 'number', nullable: true },
            lastReadingAt: { type: 'string', format: 'date-time', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        SensorData: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            sensorId: { type: 'integer' },
            moistureLevel: { type: 'number', minimum: 0, maximum: 100 },
            tankLevel: { type: 'number', nullable: true },
            nutrientLevel: { type: 'number', nullable: true },
            temperature: { type: 'number', nullable: true },
            humidity: { type: 'number', nullable: true },
            co2: { type: 'number', nullable: true },
            par: { type: 'number', nullable: true },
            ph: { type: 'number', nullable: true },
            ec: { type: 'number', nullable: true },
            tds: { type: 'number', nullable: true },
            voc: { type: 'number', nullable: true },
            pm25: { type: 'number', nullable: true },
            light: { type: 'number', nullable: true },
            timestamp: { type: 'string', format: 'date-time' },
          },
        },
        AutomationRule: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            description: { type: 'string', nullable: true },
            enabled: { type: 'boolean' },
            triggerType: { type: 'string', enum: ['time', 'sensor', 'manual'] },
            triggerConfig: { type: 'string', description: 'JSON string' },
            actionType: { type: 'string', enum: ['relay', 'pump', 'notification'] },
            actionConfig: { type: 'string', description: 'JSON string' },
            conditions: { type: 'string', nullable: true, description: 'JSON string' },
            lastTriggered: { type: 'string', format: 'date-time', nullable: true },
            triggerCount: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Harvest: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            plantId: { type: 'integer' },
            harvestDate: { type: 'string', format: 'date-time' },
            wetWeight: { type: 'number' },
            dryWeight: { type: 'number', nullable: true },
            dryingDays: { type: 'integer', nullable: true },
            quality: { type: 'string', nullable: true },
            notes: { type: 'string', nullable: true },
            imageUrl: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        YieldPrediction: {
          type: 'object',
          properties: {
            plantId: { type: 'integer' },
            plantName: { type: 'string' },
            strainName: { type: 'string' },
            method: { type: 'string', enum: ['historical_average', 'linear_growth', 'environmental_weighted', 'combined'] },
            predictedYield: { type: 'number', description: 'in grams' },
            confidenceScore: { type: 'number', minimum: 0, maximum: 100 },
            expectedRange: {
              type: 'object',
              properties: {
                min: { type: 'number' },
                max: { type: 'number' },
              },
            },
            estimatedDaysToHarvest: { type: 'integer' },
            factors: {
              type: 'object',
              properties: {
                strainQuality: { type: 'number' },
                growthProgress: { type: 'number' },
                environmentalScore: { type: 'number' },
                historicalData: { type: 'boolean' },
              },
            },
            recommendations: { type: 'array', items: { type: 'string' } },
            timestamp: { type: 'string', format: 'date-time' },
          },
        },
        AnomalyDetectionResult: {
          type: 'object',
          properties: {
            sensorId: { type: 'integer' },
            sensorName: { type: 'string' },
            method: { type: 'string', enum: ['zscore', 'iqr', 'threshold', 'combined'] },
            anomalies: { type: 'array', items: { $ref: '#/components/schemas/Anomaly' } },
            totalAnomalies: { type: 'integer' },
            severityCounts: {
              type: 'object',
              properties: {
                low: { type: 'integer' },
                medium: { type: 'integer' },
                high: { type: 'integer' },
                critical: { type: 'integer' },
              },
            },
            detectionPeriod: {
              type: 'object',
              properties: {
                start: { type: 'string', format: 'date-time' },
                end: { type: 'string', format: 'date-time' },
                hours: { type: 'number' },
              },
            },
            statistics: {
              type: 'object',
              properties: {
                mean: { type: 'number' },
                median: { type: 'number' },
                stdDev: { type: 'number' },
                min: { type: 'number' },
                max: { type: 'number' },
                q1: { type: 'number' },
                q3: { type: 'number' },
                iqr: { type: 'number' },
              },
            },
          },
        },
        Anomaly: {
          type: 'object',
          properties: {
            timestamp: { type: 'string', format: 'date-time' },
            sensorId: { type: 'integer' },
            sensorName: { type: 'string' },
            value: { type: 'number' },
            expectedValue: { type: 'number' },
            deviation: { type: 'number' },
            severity: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
            method: { type: 'string' },
            confidence: { type: 'number', minimum: 0, maximum: 100 },
            description: { type: 'string' },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      { name: 'Authentication', description: 'User authentication and authorization' },
      { name: 'Plants', description: 'Plant management endpoints' },
      { name: 'Strains', description: 'Strain management endpoints' },
      { name: 'Sensors', description: 'Sensor management and data endpoints' },
      { name: 'Automation', description: 'Automation rules and triggers' },
      { name: 'Analytics', description: 'Analytics and reporting endpoints' },
      { name: 'Predictions', description: 'Yield predictions and forecasting' },
      { name: 'Anomaly Detection', description: 'Anomaly detection endpoints' },
      { name: 'PID Controllers', description: 'PID controller management' },
      { name: 'Cost Tracking', description: 'Cost tracking and ROI analysis' },
      { name: 'Grow Recipes', description: 'Grow recipe management' },
      { name: 'Devices', description: 'Device management' },
    ],
  },
  apis: ['./src/routes/*.ts', './src/server.ts'], // Path to the API routes
};

export const swaggerSpec = swaggerJsdoc(options);
