import { neon } from '@neondatabase/serverless';

const sql = neon('postgresql://neondb_owner:npg_OPpsiSX0dEB5@ep-autumn-bush-adzmnun7-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require');

async function updateDb() {
  try {
    console.log('Altering assignments table for Answer Key...');
    await sql`ALTER TABLE assignments ADD COLUMN IF NOT EXISTS obj_answer_key VARCHAR(500)`;
    console.log('Database updated successfully!');
  } catch (err) {
    console.error('Error updating database:', err);
  }
}

updateDb();
