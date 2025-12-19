import { config } from 'dotenv';
import { db } from './lib/neon.js';

// Load environment variables
config();

async function testNewFunctions() {
  try {
    console.log('Testing new database functions...');
    
    // Test getAssignmentTypes
    console.log('\n1. Testing getAssignmentTypes...');
    const assignmentTypes = await db.getAssignmentTypes();
    console.log('Assignment types:', assignmentTypes);
    
    // Test getClassStudents with a sample class ID
    console.log('\n2. Testing getClassStudents...');
    const classStudents = await db.getClassStudents(1);
    console.log('Class students:', classStudents);
    
    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testNewFunctions();