require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function run() {
  const columns = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'classes'`;
  console.log('Columns:', columns);
}
run();
