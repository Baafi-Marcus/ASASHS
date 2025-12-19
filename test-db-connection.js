// Simple test to verify database connection
import dotenv from 'dotenv';
dotenv.config();

console.log('Testing environment variables...');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
console.log('VITE_DATABASE_URL:', process.env.VITE_DATABASE_URL ? 'SET' : 'NOT SET');

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
  
  // Test a simple query
  console.log('Testing database connection...');
  const result = await sql`SELECT 1 as test`;
  console.log('✅ Database connection successful:', result);
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}