const { neon } = require('@neondatabase/serverless');

const dbUrl = 'postgresql://neondb_owner:npg_OPpsiSX0dEB5@ep-autumn-bush-adzmnun7-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(dbUrl);

async function main() {
  const userIdsToRemove = ['TCH001', 'STU2025001', 'STU2025004'];
  
  for (const userId of userIdsToRemove) {
    try {
      console.log(`Removing user: ${userId}...`);
      
      // Get the user ID first
      const users = await sql`SELECT id FROM users WHERE user_id = ${userId}`;
      
      if (users.length === 0) {
        console.log(`- User ${userId} not found.`);
        continue;
      }
      
      const dbId = users[0].id;
      
      // Delete from child tables first to avoid foreign key constraints (just in case ON DELETE CASCADE is not set)
      await sql`DELETE FROM students WHERE user_id = ${dbId}`;
      await sql`DELETE FROM teachers WHERE user_id = ${dbId}`;
      
      // Delete from users table
      await sql`DELETE FROM users WHERE id = ${dbId}`;
      
      console.log(`- Successfully removed ${userId}`);
    } catch (error) {
      console.error(`- Error removing ${userId}:`, error.message);
    }
  }
  
  console.log('Finished removing requested accounts.');
}

main().catch(console.error);
