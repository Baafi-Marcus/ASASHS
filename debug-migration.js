import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

// Handle environment variables
const getDatabaseUrl = () => {
  if (typeof process !== 'undefined') {
    return process.env.VITE_DATABASE_URL || process.env.DATABASE_URL || '';
  }
  return '';
};

const databaseUrl = getDatabaseUrl();

if (!databaseUrl) {
  throw new Error('DATABASE_URL or VITE_DATABASE_URL is not set in environment variables');
}

// Create the Neon SQL function
const sql = neon(databaseUrl);

async function runMigration() {
  try {
    console.log('Running migration: add-results-and-assignments.sql');
    
    // Read the migration file
    const migrationPath = path.join(process.cwd(), 'migrations', 'add-results-and-assignments.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');
    
    // Split the SQL into individual statements (basic splitting by semicolon)
    const statements = migrationSql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    console.log(`Found ${statements.length} statements to execute`);
    
    // Execute each statement individually and catch errors
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim().length > 0) {
        console.log(`\nExecuting statement ${i + 1}/${statements.length}:`);
        console.log(statement.substring(0, 100) + (statement.length > 100 ? '...' : ''));
        
        try {
          await sql.unsafe(statement);
          console.log('✅ Success');
        } catch (error) {
          console.log('❌ Error:', error.message);
          // Continue with other statements
        }
      }
    }
    
    console.log('\nMigration completed!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();