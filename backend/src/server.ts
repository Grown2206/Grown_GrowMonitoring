import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import http from 'http';
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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting to API routes
app.use('/api', apiLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
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

    // Start server
    server.listen(PORT, () => {
      console.log('═══════════════════════════════════════════════');
      console.log('  🌱 Grow Monitoring System v1.1.0');
      console.log('═══════════════════════════════════════════════');
      console.log(`  Server: http://localhost:${PORT}`);
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
        password: 'Admin123!',
        role: 'admin',
      });
      console.log('✓ Default admin user created (admin / Admin123!)');
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
