const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const databaseUrl = 'postgresql://neondb_owner:npg_OPpsiSX0dEB5@ep-autumn-bush-adzmnun7-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';

const client = new Client({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false
  }
});

async function verifyAllHashes() {
  try {
    await client.connect();
    const res = await client.query("SELECT user_id, password_hash, temp_password FROM users WHERE is_active = true");
    
    console.log('--- PASSWORD VERIFICATION ---');
    for (const r of res.rows) {
      if (!r.temp_password) {
        console.log(`${r.user_id}: SKIPPED (No temp_password)`);
        continue;
      }
      const match = await bcrypt.compare(r.temp_password, r.password_hash);
      console.log(`${r.user_id} (${r.temp_password}): ${match ? '✅ MATCH' : '❌ MISMATCH'}`);
    }
    
    await client.end();
  } catch (err) {
    console.error('Error:', err);
    await client.end();
  }
}

verifyAllHashes();
