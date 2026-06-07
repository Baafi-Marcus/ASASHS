require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

async function test() {
  const sql = neon(process.env.VITE_DATABASE_URL || process.env.DATABASE_URL);
  try {
    const exams = await sql`SELECT id, quiz_id, title FROM assignments WHERE is_general_exam = true`;
    if (exams.length > 0) {
      console.log("Found exams:", exams);
      // Let's try deleting the first one
      const { id, quiz_id } = exams[0];
      
      if (quiz_id) {
        console.log("Deleting quiz_id:", quiz_id);
        await sql`DELETE FROM elearning_quizzes WHERE id = ${quiz_id}`;
      }
      console.log("Deleting assignment:", id);
      await sql`DELETE FROM assignments WHERE id = ${id}`;
      console.log("Deleted successfully!");
    } else {
      console.log("No exams to delete");
    }
  } catch (e) {
    console.error("Delete failed:", e);
  }
}
test();
