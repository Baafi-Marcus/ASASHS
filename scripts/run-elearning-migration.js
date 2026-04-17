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

async function runMigration(fileName) {
  try {
    console.log(`Running migration: ${fileName}`);
    
    // Read the migration file
    const migrationPath = path.join(process.cwd(), 'migrations', fileName);
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');
    
    // Split the SQL into individual statements (basic splitting by semicolon)
    // This regex handles comments and semicolons better than just split(';')
    const statements = migrationSql
      .replace(/--.*$/gm, '') // Remove single-line comments
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    console.log(`Found ${statements.length} statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`Executing statement ${i + 1}/${statements.length}`);
      try {
        await sql.unsafe(statement);
      } catch (stmtError) {
        console.error(`Error in statement ${i + 1}:`, stmtError.message);
        throw stmtError;
      }
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

const migrationFile = 'add-quizzes-and-exams.sql';
runMigration(migrationFile);
