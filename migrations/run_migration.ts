import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Use Vite's environment variable system
const databaseUrl = process.env.VITE_DATABASE_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL or VITE_DATABASE_URL is not set in environment variables');
}

// Create the Neon SQL function
const sql = neon(databaseUrl);

async function runMigration() {
  try {
    console.log('Running migration to add residential columns to students table...');
    
    // Add residential_status column
    await sql`
      ALTER TABLE students 
      ADD COLUMN IF NOT EXISTS residential_status VARCHAR(20) DEFAULT 'Day Student' 
      CHECK (residential_status IN ('Day Student', 'Boarding Student'))
    `;
    
    console.log('Added residential_status column');
    
    // Add house_preference column
    await sql`
      ALTER TABLE students 
      ADD COLUMN IF NOT EXISTS house_preference VARCHAR(50)
    `;
    
    console.log('Added house_preference column');
    
    // Update any existing records to have default values
    await sql`
      UPDATE students 
      SET residential_status = 'Day Student' 
      WHERE residential_status IS NULL
    `;
    
    console.log('Updated existing records with default values');
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

runMigration();