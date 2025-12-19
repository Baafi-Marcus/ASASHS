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

async function testTimetableRetrieval() {
  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to database');
    
    // Test 1: Get all timetable entries
    console.log('\n--- All Timetable Entries ---');
    const allEntries = await client.query(`
      SELECT te.*, c.class_name, s.name as subject_name, t.surname as teacher_surname, t.other_names as teacher_other_names
      FROM timetable_entries te
      JOIN classes c ON te.class_id = c.id
      JOIN subjects s ON te.subject_id = s.id
      JOIN teachers t ON te.teacher_id = t.id
      WHERE te.is_active = true
      ORDER BY te.day, te.time_slot
    `);
    
    for (const row of allEntries.rows) {
      console.log(`${row.day} ${row.time_slot}: ${row.class_name} - ${row.subject_name} (${row.teacher_surname} ${row.teacher_other_names})`);
    }
    
    // Test 2: Get timetable entries for teacher ID 1
    console.log('\n--- Timetable Entries for Teacher ID 1 ---');
    const teacherEntries = await client.query(`
      SELECT te.*, c.class_name, s.name as subject_name
      FROM timetable_entries te
      JOIN classes c ON te.class_id = c.id
      JOIN subjects s ON te.subject_id = s.id
      WHERE te.teacher_id = $1 AND te.academic_year = $2 AND te.is_active = true
      ORDER BY te.day, te.time_slot
    `, [1, '2025/2026']);
    
    for (const row of teacherEntries.rows) {
      console.log(`${row.day} ${row.time_slot}: ${row.class_name} - ${row.subject_name}`);
    }
    
    // Close the connection
    await client.end();
    console.log('\nDisconnected from database');
  } catch (err) {
    console.error('Error testing timetable retrieval:', err);
    await client.end();
    process.exit(1);
  }
}

testTimetableRetrieval();