import { neon } from '@neondatabase/serverless';

const sql = neon('postgresql://neondb_owner:npg_OPpsiSX0dEB5@ep-autumn-bush-adzmnun7-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require');

async function updateDb() {
  try {
    console.log('Altering assignments table...');
    await sql`ALTER TABLE assignments ADD COLUMN IF NOT EXISTS has_obj BOOLEAN DEFAULT true`;
    await sql`ALTER TABLE assignments ADD COLUMN IF NOT EXISTS has_theory BOOLEAN DEFAULT false`;
    await sql`ALTER TABLE assignments ADD COLUMN IF NOT EXISTS theory_content_url VARCHAR(500)`;
    
    console.log('Altering assignment_submissions table...');
    await sql`ALTER TABLE assignment_submissions ADD COLUMN IF NOT EXISTS obj_score NUMERIC`;
    await sql`ALTER TABLE assignment_submissions ADD COLUMN IF NOT EXISTS theory_score NUMERIC`;

    console.log('Database updated successfully!');
  } catch (err) {
    console.error('Error updating database:', err);
  }
}

updateDb();
