import { neon } from '@neondatabase/serverless';
import * as fs from 'fs';
import * as path from 'path';

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
    const migrationPath = path.join(__dirname, '..', 'migrations', 'add-results-and-assignments.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');
    
    // Split the SQL into individual statements (basic splitting by semicolon)
    const statements = migrationSql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    console.log(`Found ${statements.length} statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim().length > 0) {
        console.log(`Executing statement ${i + 1}/${statements.length}`);
        // Use sql.query() for raw SQL statements instead of sql.unsafe()
        await sql.query(statement);
      }
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();