import { neon } from '@neondatabase/serverless';

const sql = neon('postgresql://neondb_owner:npg_OPpsiSX0dEB5@ep-autumn-bush-adzmnun7-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require');

async function updateDb() {
  try {
    console.log('Adding quiz_id to assignments...');
    await sql`ALTER TABLE assignments ADD COLUMN IF NOT EXISTS quiz_id INTEGER REFERENCES elearning_quizzes(id) ON DELETE SET NULL`;
    console.log('Database updated successfully!');
  } catch (err) {
    console.error('Error updating database:', err);
  }
}

updateDb();
