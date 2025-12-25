import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import http from 'http';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { initDatabase } from './database/config';
import { wsManager } from './websocket/server';
import { apiLimiter } from './middleware/rateLimiter';

// Import models to ensure they're initialized
import './models';

// Import routes
import authRoutes from './routes/auth.routes';
import plantRoutes from './routes/plants.routes';
import strainRoutes from './routes/strains.routes';
import sensorRoutes from './routes/sensors.routes';
import relayRoutes from './routes/relays.routes';
import irrigationRoutes from './routes/irrigation.routes';
import alertRoutes from './routes/alerts.routes';
import noteRoutes from './routes/notes.routes';
import eventRoutes from './routes/events.routes';
import exportRoutes from './routes/export.routes';
import sensorsManagementRoutes from './routes/sensors-management.routes';
import automationRoutes from './routes/automation.routes';
import activityRoutes from './routes/activity.routes';
import settingsRoutes from './routes/settings.routes';
import schedulesRoutes from './routes/schedules.routes';
import harvestsRoutes from './routes/harvests.routes';
import devicesRoutes from './routes/devices.routes';
import comparisonRoutes from './routes/comparison.routes';
import reportsRoutes from './routes/reports.routes';
import devRoutes from './routes/dev.routes';
import milestonesRoutes from './routes/milestones.routes';
import journalRoutes from './routes/journal.routes';
import smsRoutes from './routes/sms.routes';
import mqttRoutes from './routes/mqtt.routes';
import batchRoutes from './routes/batch.routes';
import sensorGroupsRoutes from './routes/sensorGroups.routes';
import virtualSensorsRoutes from './routes/virtualSensors.routes';
import sensorFusionRoutes from './routes/sensorFusion.routes';
import sensorBenchmarkRoutes from './routes/sensorBenchmark.routes';
import sensorHealthRoutes from './routes/sensorHealth.routes';
import sensorForecastingRoutes from './routes/sensorForecasting.routes';
import growRecipesRoutes from './routes/growRecipes.routes';
import pidControllerRoutes from './routes/pidController.routes';
import costTrackingRoutes from './routes/costTracking.routes';
import yieldPredictionRoutes from './routes/yieldPrediction.routes';
import anomalyDetectionRoutes from './routes/anomalyDetection.routes';
import webhookRoutes from './routes/webhook.routes';
import recentItemsRoutes from './routes/recentItems.routes';
import bookmarksRoutes from './routes/bookmarks.routes';
import { createApolloServer, graphqlHandler } from './graphql/server';
import { authenticateToken } from './middleware/auth';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(compression()); // Enable gzip compression
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting to API routes
app.use('/api', apiLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Grow Monitoring API Docs',
}));

// Swagger JSON endpoint
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/plants', plantRoutes);
app.use('/api/strains', strainRoutes);
app.use('/api/sensors', sensorRoutes);
app.use('/api/relays', relayRoutes);
app.use('/api/irrigation', irrigationRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/sensors-management', sensorsManagementRoutes);
app.use('/api/automation', automationRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/schedules', schedulesRoutes);
app.use('/api/harvests', harvestsRoutes);
app.use('/api/devices', devicesRoutes);
app.use('/api/comparison', comparisonRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/dev', devRoutes);
app.use('/api/milestones', milestonesRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/sms', smsRoutes);
app.use('/api/mqtt', mqttRoutes);
app.use('/api/batch', batchRoutes);
app.use('/api/sensor-groups', sensorGroupsRoutes);
app.use('/api/virtual-sensors', virtualSensorsRoutes);
app.use('/api/sensor-fusion', sensorFusionRoutes);
app.use('/api/sensor-benchmark', sensorBenchmarkRoutes);
app.use('/api/sensor-health', sensorHealthRoutes);
app.use('/api/sensor-forecasting', sensorForecastingRoutes);
app.use('/api/grow-recipes', growRecipesRoutes);
app.use('/api/pid-controller', pidControllerRoutes);
app.use('/api/cost-tracking', costTrackingRoutes);
app.use('/api/yield-prediction', yieldPredictionRoutes);
app.use('/api/anomaly-detection', anomalyDetectionRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/recent-items', recentItemsRoutes);
app.use('/api/bookmarks', bookmarksRoutes);

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket
wsManager.init(server);

// Start server
async function start() {
  try {
    // Initialize database
    const dbInitialized = await initDatabase();
    if (!dbInitialized) {
      throw new Error('Failed to initialize database');
    }

    // Create default admin user if it doesn't exist
    await createDefaultAdmin();

    // Initialize SMS service
    const { smsService } = await import('./services/smsService');
    await smsService.initialize();

    // Initialize MQTT service
    const { mqttService } = await import('./services/mqttService');
    await mqttService.initialize();

    // Initialize GraphQL server
    const apolloServer = await createApolloServer(server);
    app.post('/graphql', express.json(), authenticateToken, graphqlHandler(apolloServer));

    console.log('✓ GraphQL server initialized');

    // Start server
    server.listen(PORT, () => {
      console.log('═══════════════════════════════════════════════');
      console.log('  🌱 Grow Monitoring System v2.34.0');
      console.log('═══════════════════════════════════════════════');
      console.log(`  Server: http://localhost:${PORT}`);
      console.log(`  GraphQL: http://localhost:${PORT}/graphql`);
      console.log(`  WebSocket: ws://localhost:${PORT}/ws`);
      console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('═══════════════════════════════════════════════');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

async function createDefaultAdmin() {
  try {
    const { User } = await import('./models/User');
    const adminExists = await User.findOne({ where: { username: 'admin' } });

    if (!adminExists) {
      await User.create({
        username: 'admin',
        email: 'admin@growmonitoring.local',
        password: 'admin123',
        role: 'admin',
      });
      console.log('✓ Default admin user created (admin / admin123)');
    }
  } catch (error) {
    console.error('Failed to create default admin:', error);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

start();
