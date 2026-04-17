import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
config();

const databaseUrl = process.env.VITE_DATABASE_URL || process.env.DATABASE_URL;
const sql = neon(databaseUrl);

async function testUpdate() {
  const key = 'github_model_api_keys';
  const value = JSON.stringify(['test-key-1', 'test-key-2']);
  
  try {
    console.log('Attempting to update school_setting...');
    const result = await sql`
      INSERT INTO school_settings (setting_key, setting_value, updated_at)
      VALUES (${key}, ${value}, CURRENT_TIMESTAMP)
      ON CONFLICT (setting_key) DO UPDATE SET 
        setting_value = EXCLUDED.setting_value,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    console.log('Success!', result);
  } catch (error) {
    console.error('FAILED TO UPDATE:', error);
  }
}

testUpdate();
