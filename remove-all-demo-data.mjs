import dotenv from 'dotenv';
dotenv.config();
import { sql } from './lib/neon.ts';

async function main() {
  console.log('--- STARTING REMOVAL OF ALL DEMO EXAMS & QUIZZES ---');

  // Find all demo quiz IDs
  const demoQuizzes = await sql`
    SELECT id, title FROM elearning_quizzes 
    WHERE title ILIKE '%demo%' OR description ILIKE '%demo%'
  `;
  console.log(`Found ${demoQuizzes.length} demo quizzes/exams.`);

  if (demoQuizzes.length > 0) {
    const quizIds = demoQuizzes.map(q => q.id);
    
    // Delete quiz responses and attempts
    console.log('Deleting associated quiz attempts and responses...');
    await sql`DELETE FROM quiz_responses WHERE attempt_id IN (SELECT id FROM quiz_attempts WHERE quiz_id = ANY(${quizIds}))`;
    await sql`DELETE FROM quiz_attempts WHERE quiz_id = ANY(${quizIds})`;

    // Delete options and correct answers
    console.log('Deleting questions and answers...');
    await sql`DELETE FROM quiz_options WHERE question_id IN (SELECT id FROM quiz_questions WHERE quiz_id = ANY(${quizIds}))`;
    await sql`DELETE FROM quiz_correct_answers WHERE question_id IN (SELECT id FROM quiz_questions WHERE quiz_id = ANY(${quizIds}))`;
    await sql`DELETE FROM quiz_questions WHERE quiz_id = ANY(${quizIds})`;

    // Delete the quizzes themselves
    console.log('Deleting demo quizzes...');
    await sql`DELETE FROM elearning_quizzes WHERE id = ANY(${quizIds})`;
  }

  // Check any remaining quizzes
  const remainingQuizzes = await sql`SELECT id, title, is_active FROM elearning_quizzes`;
  console.log('Remaining active quizzes after cleanup:', remainingQuizzes);

  // Also clean up any demo assignments or announcements just in case
  try {
    const deletedAssignments = await sql`DELETE FROM assignments WHERE title ILIKE '%demo%' OR description ILIKE '%demo%' RETURNING id`;
    console.log(`Deleted ${deletedAssignments.length} demo assignments.`);
  } catch {}

  try {
    const deletedAnnouncements = await sql`DELETE FROM announcements WHERE title ILIKE '%demo%' OR content ILIKE '%demo%' RETURNING id`;
    console.log(`Deleted ${deletedAnnouncements.length} demo announcements.`);
  } catch {}

  console.log('--- DEMO CLEANUP COMPLETE ---');
  process.exit(0);
}
main().catch(console.error);
