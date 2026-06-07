require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

async function test() {
  const sql = neon(process.env.VITE_DATABASE_URL || process.env.DATABASE_URL);
  try {
    const exams = await sql`SELECT title, due_date FROM assignments WHERE is_general_exam = true LIMIT 1`;
    if (exams.length > 0) {
      const { title, due_date } = exams[0];
      const res = await sql`
        SELECT sub.id as submission_id, sub.score, sub.obj_score, sub.theory_score, sub.status,
               st.student_id as admission_number, st.surname, st.other_names,
               c.class_name
        FROM assignment_submissions sub
        JOIN assignments a ON sub.assignment_id = a.id
        JOIN students st ON sub.student_id = st.id
        JOIN classes c ON a.class_id = c.id
        WHERE a.title = ${title} 
          AND a.due_date = ${due_date}
          AND a.is_general_exam = true
        ORDER BY c.class_name, st.surname, st.other_names
      `;
      console.log("Query Successful! Rows:", res.length);
    }
  } catch (e) {
    console.error("Query failed:", e);
  }
}
test();
