import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';
config();

const databaseUrl = process.env.VITE_DATABASE_URL || process.env.DATABASE_URL;
const sql = neon(databaseUrl);

async function syncAll() {
  const migrations = ['add-quizzes-and-exams.sql', 'update-elearning-schema.sql'];
  
  for (const file of migrations) {
    console.log(`Force syncing ${file}...`);
    const sqlContent = fs.readFileSync(path.join(process.cwd(), 'migrations', file), 'utf8');
    
    // Run as one big block if possible, or individual statements
    const statements = sqlContent
      .replace(/--.*$/gm, '')
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
      
    for (const stmt of statements) {
      try {
        await sql.unsafe(stmt);
      } catch (e) {
        if (e.message.includes('already exists') || e.message.includes('duplicate')) {
          // ignore
        } else {
          console.error(`Error in ${file}:`, e.message);
        }
      }
    }
  }
  console.log('All migrations synced.');
}

syncAll();
