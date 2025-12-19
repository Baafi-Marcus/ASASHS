const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Read the .env file
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');

// Parse the DATABASE_URL from .env
let databaseUrl = null;
const lines = envContent.split('\n');
for (const line of lines) {
  if (line.startsWith('DATABASE_URL=') || line.startsWith('VITE_DATABASE_URL=')) {
    databaseUrl = line.split('=')[1].replace(/['"]/g, '').trim();
    break;
  }
}

if (!databaseUrl) {
  console.error('DATABASE_URL or VITE_DATABASE_URL not found in .env file');
  process.exit(1);
}

// Read the migration file
const migrationPath = path.join(__dirname, '..', 'migrations', 'add-timetable-entries.sql');
const migrationSql = fs.readFileSync(migrationPath, 'utf8');

// Create a client
const client = new Client({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false
  }
});

async function applyMigration() {
  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to database');
    
    // Apply the migration
    await client.query(migrationSql);
    console.log('Timetable entries migration applied successfully!');
    
    // Close the connection
    await client.end();
    console.log('Disconnected from database');
  } catch (err) {
    console.error('Error applying timetable entries migration:', err);
    await client.end();
    process.exit(1);
  }
}

applyMigration();