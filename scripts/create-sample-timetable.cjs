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

async function createSampleTimetable() {
  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to database');
    
    // Insert sample timetable entries
    const sampleEntries = [
      {
        day: 'Mon',
        time_slot: '8-9 AM',
        class_id: 11,
        subject_id: 1,
        teacher_id: 1,
        academic_year: '2025/2026'
      },
      {
        day: 'Mon',
        time_slot: '9-10 AM',
        class_id: 11,
        subject_id: 2,
        teacher_id: 1,
        academic_year: '2025/2026'
      },
      {
        day: 'Tue',
        time_slot: '8-9 AM',
        class_id: 12,
        subject_id: 3,
        teacher_id: 1,
        academic_year: '2025/2026'
      }
    ];
    
    for (const entry of sampleEntries) {
      await client.query(
        `INSERT INTO timetable_entries (day, time_slot, class_id, subject_id, teacher_id, academic_year)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [entry.day, entry.time_slot, entry.class_id, entry.subject_id, entry.teacher_id, entry.academic_year]
      );
      console.log(`Inserted timetable entry: ${entry.day} ${entry.time_slot}`);
    }
    
    console.log('Sample timetable entries created successfully!');
    
    // Close the connection
    await client.end();
    console.log('Disconnected from database');
  } catch (err) {
    console.error('Error creating sample timetable:', err);
    await client.end();
    process.exit(1);
  }
}

createSampleTimetable();