import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.VITE_DATABASE_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL or VITE_DATABASE_URL is not set in environment variables');
}

const sql = neon(databaseUrl);

async function runMigration() {
  try {
    console.log('Running migration: Add group_id to quiz_questions, scheduling to elearning_quizzes...');
    
    await sql`
      ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS group_id INTEGER DEFAULT 0
    `;
    console.log('Added group_id to quiz_questions');

    await sql`
      ALTER TABLE elearning_quizzes ADD COLUMN IF NOT EXISTS due_date TIMESTAMP
    `;
    console.log('Added due_date to elearning_quizzes');

    await sql`
      ALTER TABLE elearning_quizzes ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 60
    `;
    console.log('Added duration_minutes to elearning_quizzes');
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

runMigration();
