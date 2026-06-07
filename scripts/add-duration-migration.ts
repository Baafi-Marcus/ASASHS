import { sql } from '../lib/neon.ts';

async function migrate() {
  try {
    await sql`ALTER TABLE general_exams ADD COLUMN duration_minutes INTEGER DEFAULT 60`;
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
