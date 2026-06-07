import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.VITE_DATABASE_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL or VITE_DATABASE_URL is not set in environment variables');
}

const sql = neon(databaseUrl);

async function runMigration() {
  try {
    console.log('Running migration: Change due_date from DATE to TIMESTAMP...');
    
    await sql`
      ALTER TABLE assignments 
      ALTER COLUMN due_date TYPE TIMESTAMP USING due_date::TIMESTAMP
    `;
    
    console.log('Migration completed successfully! due_date is now TIMESTAMP.');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

runMigration();
