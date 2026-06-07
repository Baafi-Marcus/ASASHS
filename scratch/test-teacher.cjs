require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function run() {
  try {
    const teachers = await sql`SELECT id FROM teachers LIMIT 1`;
    const subjects = await sql`SELECT id FROM subjects LIMIT 1`;
    const classes = await sql`SELECT id FROM classes LIMIT 1`;
    
    console.log(teachers[0], subjects[0], classes[0]);
    
    if (teachers.length && subjects.length && classes.length) {
      await sql`
        INSERT INTO teacher_subjects (teacher_id, subject_id, class_id, academic_year)
        VALUES (${teachers[0].id}, ${subjects[0].id}, ${classes[0].id}, '2026/2027')
      `;
      console.log('Success');
    }
  } catch(e) {
    console.error('Error:', e.message);
  }
}
run();
