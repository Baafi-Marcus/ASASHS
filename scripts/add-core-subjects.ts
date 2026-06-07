import { db } from '../lib/neon.ts';

const coreSubjects = [
  { name: 'Core Mathematics', code: 'C-MATH', course_id: null, is_core: true },
  { name: 'Integrated Science', code: 'C-SCI', course_id: null, is_core: true },
  { name: 'English Language', code: 'C-ENG', course_id: null, is_core: true },
  { name: 'Social Studies', code: 'C-SOC', course_id: null, is_core: true }
];

async function addCoreSubjects() {
  for (const subject of coreSubjects) {
    try {
      await db.createSubject(subject);
      console.log(`Added: ${subject.name}`);
    } catch (e) {
      console.error(`Failed to add ${subject.name}: ${e.message}`);
    }
  }
}

addCoreSubjects();
