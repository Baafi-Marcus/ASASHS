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

// Create a client
const client = new Client({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false
  }
});

async function listClasses() {
  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to database');
    
    // Get all classes
    const result = await client.query('SELECT id, class_name FROM classes ORDER BY id');
    
    console.log('Existing classes:');
    for (const row of result.rows) {
      console.log(`ID: ${row.id}, Name: ${row.class_name}`);
    }
    
    // Get all subjects
    const subjectsResult = await client.query('SELECT id, name FROM subjects ORDER BY id LIMIT 10');
    
    console.log('\nExisting subjects (first 10):');
    for (const row of subjectsResult.rows) {
      console.log(`ID: ${row.id}, Name: ${row.name}`);
    }
    
    // Get all teachers
    const teachersResult = await client.query('SELECT id, surname, other_names FROM teachers ORDER BY id LIMIT 10');
    
    console.log('\nExisting teachers (first 10):');
    for (const row of teachersResult.rows) {
      console.log(`ID: ${row.id}, Name: ${row.surname} ${row.other_names}`);
    }
    
    // Close the connection
    await client.end();
    console.log('\nDisconnected from database');
  } catch (err) {
    console.error('Error listing classes:', err);
    await client.end();
    process.exit(1);
  }
}

listClasses();