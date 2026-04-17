import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
config();

const databaseUrl = process.env.VITE_DATABASE_URL || process.env.DATABASE_URL;
const sql = neon(databaseUrl);

async function listTables() {
  try {
    const result = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    console.log('Tables:', result.map(r => r.table_name));
  } catch (error) {
    console.error('FAILED TO LIST TABLES:', error);
  }
}

listTables();
