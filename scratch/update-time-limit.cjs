require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function run() {
  await sql`UPDATE elearning_quizzes eq SET time_limit = a.duration_minutes FROM assignments a WHERE a.quiz_id = eq.id AND (eq.time_limit IS NULL OR eq.time_limit = 0)`;
  console.log('Updated existing quizzes with time_limit from assignments.');
}
run();
