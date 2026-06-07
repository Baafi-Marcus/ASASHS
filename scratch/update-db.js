import { neon } from '@neondatabase/serverless';

const sql = neon('postgresql://neondb_owner:npg_OPpsiSX0dEB5@ep-autumn-bush-adzmnun7-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require');

async function updateDb() {
  try {
    console.log('Altering assignments table...');
    await sql`ALTER TABLE assignments ALTER COLUMN teacher_id DROP NOT NULL`;
    await sql`ALTER TABLE assignments ADD COLUMN IF NOT EXISTS is_general_exam BOOLEAN DEFAULT false`;
    await sql`ALTER TABLE assignments ADD COLUMN IF NOT EXISTS exam_type VARCHAR(50)`;
    console.log('Database updated successfully!');
  } catch (err) {
    console.error('Error updating database:', err);
  }
}

updateDb();
