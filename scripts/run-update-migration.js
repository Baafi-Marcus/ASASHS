import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';

config();

const databaseUrl = process.env.VITE_DATABASE_URL || process.env.DATABASE_URL || '';

if (!databaseUrl) {
  throw new Error('DATABASE_URL or VITE_DATABASE_URL is not set in environment variables');
}

const sql = neon(databaseUrl);

async function runMigration() {
  try {
    const fileName = 'update-elearning-schema.sql';
    console.log(`Running migration: ${fileName}`);
    const migrationPath = path.join(process.cwd(), 'migrations', fileName);
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');
    
    const statements = migrationSql
      .replace(/--.*$/gm, '') 
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    for (const statement of statements) {
      console.log('Executing:', statement.substring(0, 50) + '...');
      await sql.unsafe(statement);
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
