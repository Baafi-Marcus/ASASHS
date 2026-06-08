import { neon } from '@neondatabase/serverless';
import fs from 'fs';

const url = fs.readFileSync('.env', 'utf8')
  .split('\n')
  .find(l => l.startsWith('VITE_DATABASE_URL='))
  ?.split('=').slice(1).join('=');

const sql = neon(url);

const tables = ['quiz_attempts', 'elearning_quizzes', 'assignments', 'quiz_responses', 'quiz_questions', 'quiz_options', 'quiz_correct_answers', 'teacher_subjects', 'student_subjects', 'students', 'teachers', 'users', 'classes', 'subjects', 'courses'];
for (const t of tables) {
  const cols = await sql`
    SELECT column_name, data_type, is_nullable, column_default 
    FROM information_schema.columns 
    WHERE table_name = ${t}
    ORDER BY ordinal_position
  `;
  if (cols.length > 0) {
    console.log(`\n=== ${t} ===`);
    console.table(cols);
  }
}
