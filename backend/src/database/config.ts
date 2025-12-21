import { Sequelize } from 'sequelize';
import path from 'path';
import fs from 'fs';

const dbPath = process.env.DB_PATH || './data/grow-monitoring.db';
const dbDir = path.dirname(dbPath);

// Ensure data directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: false,
  },
});

export async function initDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connection established');

    // Sync all models
    await sequelize.sync({ alter: true });
    console.log('✓ Database models synchronized');

    return true;
  } catch (error) {
    console.error('✗ Unable to connect to database:', error);
    return false;
  }
}
