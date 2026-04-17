import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
config();

const databaseUrl = process.env.VITE_DATABASE_URL || process.env.DATABASE_URL;
const sql = neon(databaseUrl);

async function forceCreate() {
  try {
    console.log('Attempting to create school_settings table...');
    await sql`
      CREATE TABLE IF NOT EXISTS school_settings (
          id SERIAL PRIMARY KEY,
          setting_key VARCHAR(100) UNIQUE NOT NULL,
          setting_value TEXT NOT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('Table created or already exists.');
    
    // Check if it exists now
    const check = await sql`
      SELECT table_name FROM information_schema.tables 
      WHERE table_name = 'school_settings';
    `;
    console.log('Existence check:', check);
  } catch (error) {
    console.error('FORCE CREATE FAILED:', error);
  }
}

forceCreate();
