import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.VITE_DATABASE_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL or VITE_DATABASE_URL is not set in environment variables.');
  process.exit(1);
}

const sql = neon(databaseUrl);

async function checkAnnouncementsTable() {
  try {
    console.log('🔍 Checking announcements table structure...');
    
    // Check if announcements table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'announcements'
      )
    `;
    
    if (!tableExists[0].exists) {
      console.log('❌ Announcements table does not exist');
      return;
    }
    
    console.log('✅ Announcements table exists');
    
    // Check columns in announcements table
    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'announcements'
      ORDER BY ordinal_position
    `;
    
    console.log('\n📋 Announcements table columns:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // Check if is_active column exists
    const hasIsActive = columns.some(col => col.column_name === 'is_active');
    if (hasIsActive) {
      console.log('\n✅ is_active column exists in announcements table');
    } else {
      console.log('\n❌ is_active column does not exist in announcements table');
    }
    
    // Check sample data
    try {
      const sampleData = await sql`SELECT * FROM announcements LIMIT 1`;
      console.log('\n📝 Sample announcement data:');
      console.log(sampleData);
    } catch (error) {
      console.log('\n⚠️  Could not retrieve sample data:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error checking announcements table:', error.message);
  }
}

checkAnnouncementsTable();