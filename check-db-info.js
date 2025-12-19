// Check database information
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
  
  // Check current database
  console.log('\nChecking current database...');
  const dbResult = await sql`SELECT current_database()`;
  console.log('Current database:', dbResult);
  
  // Check current user
  console.log('\nChecking current user...');
  const userResult = await sql`SELECT current_user`;
  console.log('Current user:', userResult);
  
  // Check if we can see the users table (which should exist)
  console.log('\nChecking for existing users table...');
  try {
    const usersResult = await sql`SELECT COUNT(*) as count FROM users`;
    console.log('Users table exists with', usersResult[0].count, 'rows');
  } catch (error) {
    console.log('Cannot access users table:', error.message);
  }
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}