// List all tables in the database
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
  
  // List all tables
  console.log('\nListing all tables...');
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name
  `;
  console.log('Tables in database:');
  tables.forEach(table => {
    console.log(`  - ${table.table_name}`);
  });
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}