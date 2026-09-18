import dotenv from 'dotenv';
dotenv.config();
import { sql } from './lib/neon.ts';

async function main() {
  console.log('--- ALL E-LEARNING QUIZZES ---');
  const quizzes = await sql`SELECT id, title, description, is_active FROM elearning_quizzes`;
  console.log(JSON.stringify(quizzes, null, 2));

  console.log('--- ALL TABLES IN DB ---');
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND (table_name LIKE '%quiz%' OR table_name LIKE '%exam%' OR table_name LIKE '%assess%')
  `;
  console.log(tables);

  process.exit(0);
}
main().catch(console.error);
