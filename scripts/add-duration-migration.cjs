require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

async function migrate() {
  const url = process.env.VITE_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) {
    console.error("No DB URL found");
    return;
  }
  const sql = neon(url);
  
  try {
    await sql`ALTER TABLE assignments ADD COLUMN duration_minutes INTEGER DEFAULT 60`;
    console.log("Migration successful");
  } catch (e) {
    console.error("Migration failed:", e);
  }
}

migrate();
