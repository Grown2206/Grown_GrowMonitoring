/**
 * Reset database - drops all tables and recreates them
 * USE WITH CAUTION: This will delete all data!
 */
import { sequelize } from '../database/config';
import '../models'; // Import all models
import { User } from '../models/User';

async function resetDatabase() {
  try {
    console.log('🔧 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Connected successfully');

    console.log('⚠️  Dropping all tables...');
    await sequelize.drop();
    console.log('✅ All tables dropped');

    console.log('🔨 Creating tables with new schema...');
    await sequelize.sync({ force: true });
    console.log('✅ All tables created');

    console.log('👤 Creating default admin user...');
    await User.create({
      username: 'admin',
      email: 'admin@growmonitoring.local',
      password: 'admin123',
      role: 'admin',
    });
    console.log('✅ Admin user created');
    console.log('   Username: admin');
    console.log('   Password: admin123');

    console.log('');
    console.log('✨ Database reset complete!');
    console.log('You can now:');
    console.log('  1. Login with admin / admin123');
    console.log('  2. Use the test data generator in Settings > Developer Tools');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    process.exit(1);
  }
}

resetDatabase();
