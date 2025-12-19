// Check database schema and search_path
import dotenv from 'dotenv';
dotenv.config();

// Try to import and test neon connection
try {
  const { neon } = await import('@neondatabase/serverless');
  
  // Use the DATABASE_URL from environment variables
  const databaseUrl = process.env.VITE_DATABASE_URL || process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL or VITE_DATABASE_URL is not set in environment variables');
    process.exit(1);
  }
  
  console.log('✅ Environment variables found');
  
  // Create the Neon SQL function
  const sql = neon(databaseUrl);
  
  // Check current search_path
  console.log('\nChecking current search_path...');
  const searchPathResult = await sql`SHOW search_path`;
  console.log('Current search_path:', searchPathResult);
  
  // Check current schema
  console.log('\nChecking current schema...');
  const schemaResult = await sql`SELECT current_schema()`;
  console.log('Current schema:', schemaResult);
  
  // List all schemas
  console.log('\nListing all schemas...');
  const schemasResult = await sql`SELECT schema_name FROM information_schema.schemata`;
  console.log('All schemas:', schemasResult);
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}