const { neon } = require('@neondatabase/serverless');

const dbUrl = 'postgresql://neondb_owner:npg_OPpsiSX0dEB5@ep-autumn-bush-adzmnun7-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(dbUrl);

async function main() {
  const users = await sql`
    SELECT 
      u.user_type, 
      u.user_id, 
      u.temp_password, 
      COALESCE(s.surname || ' ' || s.other_names, t.surname || ' ' || t.other_names, 'Admin') as full_name
    FROM users u
    LEFT JOIN students s ON u.id = s.user_id
    LEFT JOIN teachers t ON u.id = t.user_id
    WHERE u.temp_password IS NOT NULL
  `;
  
  console.log("=== USER CREDENTIALS ===");
  console.log("TYPE\t| ID\t\t| NAME\t\t\t| PASSWORD");
  console.log("---------------------------------------------------------");
  users.forEach(u => {
    console.log(`${u.user_type}\t| ${u.user_id}\t| ${u.full_name}\t| ${u.temp_password}`);
  });
}

main().catch(console.error);
