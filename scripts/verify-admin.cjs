const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const databaseUrl = 'postgresql://neondb_owner:npg_OPpsiSX0dEB5@ep-autumn-bush-adzmnun7-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';

const client = new Client({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false
  }
});

async function verifyAdmin() {
  try {
    await client.connect();
    const res = await client.query("SELECT password_hash FROM users WHERE user_id = 'ADMIN001'");
    
    if (res.rows.length === 0) {
      console.log('ADMIN_NOT_FOUND');
    } else {
      const hash = res.rows[0].password_hash;
      const match = await bcrypt.compare('admin123', hash);
      console.log('ADMIN_MATCH:', match);
      console.log('ADMIN_HASH:', hash);
      
      if (!match) {
        const newHash = await bcrypt.hash('admin123', 10);
        console.log('SUGGESTED_NEW_HASH:', newHash);
      }
    }
    
    await client.end();
  } catch (err) {
    console.error('Error:', err);
    await client.end();
  }
}

verifyAdmin();
