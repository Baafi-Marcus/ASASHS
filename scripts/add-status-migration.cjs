require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

async function migrate() {
  const sql = neon(process.env.VITE_DATABASE_URL || process.env.DATABASE_URL);
  try {
    await sql`ALTER TABLE assignment_submissions ADD COLUMN status VARCHAR(50) DEFAULT 'graded'`;
    console.log("Migration successful");
  } catch (e) {
    if (e.message.includes('already exists')) {
      console.log('Column already exists, ignoring.');
    } else {
      console.error("Migration failed:", e);
    }
  }
}
migrate();
