/**
 * Test script to verify seed service works
 */
import { initDatabase } from './database/config';
import { SeedService } from './services/seedService';

async function test() {
  console.log('🔧 Initializing database...');
  await initDatabase();

  console.log('🌱 Generating quick demo data...');
  try {
    const stats = await SeedService.generateQuickDemo();
    console.log('✅ Success!');
    console.log('Stats:', JSON.stringify(stats, null, 2));
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }

  process.exit(0);
}

test();
