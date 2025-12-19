// Test creating a simple table directly
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
  
  // Test creating a simple table
  console.log('\nTesting direct table creation...');
  const result = await sql`CREATE TABLE test_table (id SERIAL PRIMARY KEY, name VARCHAR(50))`;
  console.log('✅ Table creation successful:', result);
  
  // Test inserting data
  console.log('\nTesting data insertion...');
  const insertResult = await sql`INSERT INTO test_table (name) VALUES ('Test Entry') RETURNING *`;
  console.log('✅ Data insertion successful:', insertResult);
  
  // Test querying data
  console.log('\nTesting data query...');
  const queryResult = await sql`SELECT * FROM test_table`;
  console.log('✅ Data query successful:', queryResult);
  
  // Clean up - drop the test table
  console.log('\nCleaning up...');
  await sql`DROP TABLE test_table`;
  console.log('✅ Cleanup successful');
  
  console.log('\n✅ All tests completed successfully!');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}