require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Get database URL from environment
const databaseUrl = process.env.DATABASE_URL || process.env.VITE_DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL or VITE_DATABASE_URL environment variable is not set');
  process.exit(1);
}

// Get the migration file from arguments or use default
const migrationFile = process.argv[2] || 'complete-semester-migration.sql';
const migrationPath = path.isAbsolute(migrationFile)
  ? migrationFile
  : path.join(__dirname, '..', 'migrations', migrationFile);

if (!fs.existsSync(migrationPath)) {
  console.error(`Migration file not found at: ${migrationPath}`);
  process.exit(1);
}

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
    console.log(`Applying migration: ${path.basename(migrationPath)}`);

    // Apply the migration
    await client.query(migrationSql);
    console.log('Migration applied successfully!');

    // Close the connection
    await client.end();
    console.log('Disconnected from database');
  } catch (err) {
    console.error('Error applying migration:', err);
    await client.end();
    process.exit(1);
  }
}

applyMigration();