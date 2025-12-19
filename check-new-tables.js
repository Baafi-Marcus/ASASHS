// Check specifically for our new tables
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
  
  // Check for each new table specifically
  const newTables = [
    'assignment_types',
    'assignments',
    'assignment_submissions',
    'student_results',
    'teacher_messages'
  ];
  
  console.log('\nChecking for new tables...');
  for (const table of newTables) {
    try {
      const result = await sql`SELECT COUNT(*) as count FROM ${sql.unsafe(table)}`;
      console.log(`✅ Table ${table} exists with ${result[0].count} rows`);
    } catch (error) {
      console.log(`❌ Table ${table} does not exist or is not accessible:`, error.message);
    }
  }
  
  // Also check if we can query assignment_types directly
  console.log('\nTesting direct query on assignment_types...');
  try {
    const result = await sql`SELECT * FROM assignment_types`;
    console.log('✅ Direct query successful:', result);
  } catch (error) {
    console.log('❌ Direct query failed:', error.message);
  }
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}