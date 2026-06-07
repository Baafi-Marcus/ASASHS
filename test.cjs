const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.VITE_NEON_DATABASE_URL);
sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'general_exams'`.then(res => console.log(res));
