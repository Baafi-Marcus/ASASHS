// Test new database functions
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
  
  // Test getAssignmentTypes function by directly querying the table
  console.log('\n1. Testing assignment_types table...');
  const assignmentTypes = await sql`SELECT * FROM assignment_types`;
  console.log('✅ Assignment types found:', assignmentTypes);
  
  // Test the new tables exist
  console.log('\n2. Testing new tables...');
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('assignment_types', 'assignments', 'assignment_submissions', 'student_results', 'teacher_messages')
  `;
  console.log('✅ New tables found:', tables);
  
  console.log('\n✅ All tests completed successfully!');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}