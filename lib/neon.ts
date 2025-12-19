// lib/neon.ts
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';



// Handle environment variables for both Node.js and browser environments
const getDatabaseUrl = () => {
  // In browser environment
  if (typeof window !== 'undefined') {
    // Try to get from import.meta.env (Vite)
    // @ts-ignore
    if (import.meta.env && import.meta.env.VITE_DATABASE_URL) {
      // @ts-ignore
      return import.meta.env.VITE_DATABASE_URL;
    }
    
    // Try to get DATABASE_URL as fallback
    // @ts-ignore
    if (import.meta.env && import.meta.env.DATABASE_URL) {
      // @ts-ignore
      return import.meta.env.DATABASE_URL;
    }
    
    return '';
  }
  
  // In Node.js environment
  try {
    // @ts-ignore
    return process.env.VITE_DATABASE_URL || process.env.DATABASE_URL || '';
  } catch (e) {
    // If process is not defined, return empty string
    return '';
  }
};

const databaseUrl = getDatabaseUrl();

// Create the Neon SQL function only if we have a database URL
let sql: any;
if (databaseUrl) {
  try {
    sql = neon(databaseUrl);
  } catch (error) {
    console.error('Failed to initialize Neon SQL function:', error);
    sql = null;
  }
} else {
  console.warn('DATABASE_URL or VITE_DATABASE_URL is not set in environment variables');
  // Create a mock sql function for development
  sql = async () => {
    console.warn('Database not configured - returning empty result');
    return [];
  };
  // Add the unsafe method to the mock sql function for string interpolation
  sql.unsafe = (str: string) => str;
}

// Utility function to check if database is configured
const checkDatabaseConfig = () => {
  if (!databaseUrl || !sql) {
    throw new Error('Database not configured. Please set DATABASE_URL or VITE_DATABASE_URL in your environment variables.');
  }
};

// Utility function to generate random password
function generateRandomPassword(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Database helper functions
export const db = {
  // Authentication
  async authenticateUser(userId: string, password: string) {
    if (!databaseUrl || !sql) {
      console.warn('Database not configured - authentication will fail');
      return null;
    }
    
    const result = await sql`
      SELECT u.*, s.student_id, s.admission_number, s.surname as student_surname, s.other_names as student_other_names,
             t.teacher_id, t.staff_id, t.surname as teacher_surname, t.other_names as teacher_other_names
      FROM users u
      LEFT JOIN students s ON u.id = s.user_id
      LEFT JOIN teachers t ON u.id = t.user_id
      WHERE u.user_id = ${userId} AND u.is_active = true
    `;
    
    if (result.length === 0) {
      return null;
    }
    
    const user = result[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return null;
    }
    
    // Update last login
    await sql`UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ${user.id}`;
    
    return {
      id: user.id,
      user_id: user.user_id,
      user_type: user.user_type,
      must_change_password: user.must_change_password,
      full_name: user.user_type === 'student' 
        ? `${user.student_surname}, ${user.student_other_names}`
        : user.user_type === 'teacher'
        ? `${user.teacher_surname}, ${user.teacher_other_names}`
        : 'Administrator',
      role: user.user_type,
      student_id: user.student_id,
      teacher_id: user.teacher_id,
      admission_number: user.admission_number,
      staff_id: user.staff_id
    };
  },

  async changePassword(userId: string, newPassword: string) {
    if (!databaseUrl || !sql) {
      throw new Error('Database not configured. Please set DATABASE_URL or VITE_DATABASE_URL in your environment variables.');
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await sql`
      UPDATE users 
      SET password_hash = ${hashedPassword}, 
          must_change_password = false,
          temp_password = NULL,
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ${userId}
    `;
  },

  // Students
  async getStudents(filters?: {
    search?: string;
    course_id?: number;
    gender?: string;
    unassignedHouse?: boolean; // New parameter for filtering students with unassigned houses
    house5?: boolean; // New parameter for filtering students in House 5
    page?: number;
    limit?: number;
    includeInactive?: boolean; // New parameter
  }) {
    const { search, course_id, gender, unassignedHouse, house5, page = 1, limit = 10, includeInactive = false } = filters || {};
    
    // Base query condition
    const isActiveCondition = includeInactive ? '' : 'AND s.is_active = true';
    
    // Use template literals for complex filtering
    if (search) {
      return await sql`
        SELECT s.*, c.name as course_name, cl.class_name, u.user_id
        FROM students s
        LEFT JOIN courses c ON s.course_id = c.id
        LEFT JOIN classes cl ON s.current_class_id = cl.id
        LEFT JOIN users u ON s.user_id = u.id
        WHERE 1=1 ${sql.unsafe(isActiveCondition)}
        AND (s.surname ILIKE ${`%${search}%`} OR s.other_names ILIKE ${`%${search}%`} OR s.student_id ILIKE ${`%${search}%`})
        ORDER BY s.created_at DESC
        LIMIT ${limit} OFFSET ${(page - 1) * limit}
      `;
    }
    
    if (course_id) {
      return await sql`
        SELECT s.*, c.name as course_name, cl.class_name, u.user_id
        FROM students s
        LEFT JOIN courses c ON s.course_id = c.id
        LEFT JOIN classes cl ON s.current_class_id = cl.id
        LEFT JOIN users u ON s.user_id = u.id
        WHERE 1=1 ${sql.unsafe(isActiveCondition)} AND s.course_id = ${course_id}
        ORDER BY s.created_at DESC
        LIMIT ${limit} OFFSET ${(page - 1) * limit}
      `;
    }
    
    if (gender) {
      return await sql`
        SELECT s.*, c.name as course_name, cl.class_name, u.user_id
        FROM students s
        LEFT JOIN courses c ON s.course_id = c.id
        LEFT JOIN classes cl ON s.current_class_id = cl.id
        LEFT JOIN users u ON s.user_id = u.id
        WHERE 1=1 ${sql.unsafe(isActiveCondition)} AND s.gender = ${gender}
        ORDER BY s.created_at DESC
        LIMIT ${limit} OFFSET ${(page - 1) * limit}
      `;
    }
    
    // New filter for students with unassigned houses
    if (unassignedHouse) {
      return await sql`
        SELECT s.*, c.name as course_name, cl.class_name, u.user_id
        FROM students s
        LEFT JOIN courses c ON s.course_id = c.id
        LEFT JOIN classes cl ON s.current_class_id = cl.id
        LEFT JOIN users u ON s.user_id = u.id
        WHERE 1=1 ${sql.unsafe(isActiveCondition)} AND (s.house_preference IS NULL OR s.house_preference = '' OR s.house_preference = 'Not Assigned')
        ORDER BY s.created_at DESC
        LIMIT ${limit} OFFSET ${(page - 1) * limit}
      `;
    }
    
    // New filter for students in House 5
    if (house5) {
      return await sql`
        SELECT s.*, c.name as course_name, cl.class_name, u.user_id
        FROM students s
        LEFT JOIN courses c ON s.course_id = c.id
        LEFT JOIN classes cl ON s.current_class_id = cl.id
        LEFT JOIN users u ON s.user_id = u.id
        WHERE 1=1 ${sql.unsafe(isActiveCondition)} AND s.house_preference = 'House 5'
        ORDER BY s.created_at DESC
        LIMIT ${limit} OFFSET ${(page - 1) * limit}
      `;
    }
    
    return await sql`
      SELECT s.*, c.name as course_name, cl.class_name, u.user_id
      FROM students s
      LEFT JOIN courses c ON s.course_id = c.id
      LEFT JOIN classes cl ON s.current_class_id = cl.id
      LEFT JOIN users u ON s.user_id = u.id
      WHERE 1=1 ${sql.unsafe(isActiveCondition)}
      ORDER BY s.created_at DESC
      LIMIT ${limit} OFFSET ${(page - 1) * limit}
    `;
  },

  // New function to assign unassigned students to House 5
  async assignUnassignedToHouse5() {
    try {
      const result = await sql`
        UPDATE students 
        SET house_preference = 'House 5'
        WHERE house_preference IS NULL OR house_preference = '' OR house_preference = 'Not Assigned'
        RETURNING *
      `;
      
      return {
        success: true,
        updatedCount: result.length,
        message: `Successfully updated ${result.length} students to House 5`
      };
    } catch (error) {
      console.error('Error assigning students to House 5:', error);
      throw new Error('Failed to assign students to House 5');
    }
  },

  async createStudent(studentData: any) {
    // Generate student ID and admission number
    const year = new Date().getFullYear();
    
    // Generate a unique student ID by checking for existing IDs
    let studentId;
    let nextStudentNum = 1;
    let isUnique = false;
    
    while (!isUnique) {
      studentId = `STU${year}${nextStudentNum.toString().padStart(3, '0')}`;
      
      // Check if this ID already exists
      const existingUser = await sql`
        SELECT 1 FROM users WHERE user_id = ${studentId}
      `;
      
      if (existingUser.length === 0) {
        isUnique = true;
      } else {
        nextStudentNum++;
      }
    }
    
    // Generate a unique admission number
    let admissionNumber = studentData.admission_number;
    if (!admissionNumber) {
      let nextAdmissionNum = 1;
      let isAdmissionUnique = false;
      
      while (!isAdmissionUnique) {
        admissionNumber = `ASA${year}${nextAdmissionNum.toString().padStart(3, '0')}`;
        
        // Check if this admission number already exists
        const existingStudent = await sql`
          SELECT 1 FROM students WHERE admission_number = ${admissionNumber}
        `;
        
        if (existingStudent.length === 0) {
          isAdmissionUnique = true;
        } else {
          nextAdmissionNum++;
        }
      }
    }
    
    // Generate random password
    const tempPassword = generateRandomPassword(8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    
    // Create user account
    const userResult = await sql`
      INSERT INTO users (user_id, user_type, password_hash, temp_password, must_change_password)
      VALUES (${studentId}, 'student', ${hashedPassword}, ${tempPassword}, true)
      RETURNING id
    `;
    
    const userId = userResult[0].id;
    
    // Create student record
    const result = await sql`
      INSERT INTO students (
        user_id, student_id, admission_number, course_id, current_class_id, surname, other_names,
        date_of_birth, gender, nationality, hometown, district_of_origin,
        region_of_origin, guardian_name, guardian_relationship, guardian_phone,
        guardian_phone_alt, guardian_email, guardian_address, previous_school,
        graduation_year, known_allergies, chronic_conditions, blood_group,
        enrollment_date, residential_status, house_preference, is_active
      ) VALUES (
        ${userId}, ${studentId}, ${admissionNumber}, ${studentData.programme_id || studentData.course_id}, ${studentData.current_class_id}, 
        ${studentData.surname}, ${studentData.other_names}, ${studentData.date_of_birth}, 
        ${studentData.gender}, ${studentData.nationality}, ${studentData.hometown}, 
        ${studentData.district_of_origin}, ${studentData.region_of_origin}, ${studentData.guardian_name}, 
        ${studentData.guardian_relationship}, ${studentData.guardian_phone}, ${studentData.guardian_phone_alt}, 
        ${studentData.guardian_email}, ${studentData.guardian_address}, ${studentData.previous_school}, 
        ${studentData.graduation_year}, ${studentData.known_allergies}, ${studentData.chronic_conditions}, 
        ${studentData.blood_group}, ${studentData.enrollment_date}, 
        ${studentData.residential_status || 'Day Student'}, ${studentData.house_preference || null}, true
      ) RETURNING *
    `;
    
    const studentRecord = result[0];
    
    // Save student subjects if provided
    const academicYear = new Date().getFullYear() + '/' + (new Date().getFullYear() + 1);
    
    // Get core subjects for the course
    const coreSubjects = await sql`
      SELECT id FROM subjects WHERE (course_id = ${studentData.programme_id || studentData.course_id} OR course_id IS NULL) AND is_core = true
    `;
    
    // Insert core subjects
    for (const subject of coreSubjects) {
      await sql`
        INSERT INTO student_subjects (student_id, subject_id, academic_year, is_active)
        VALUES (${studentRecord.id}, ${subject.id}, ${academicYear}, true)
        ON CONFLICT (student_id, subject_id, academic_year) DO UPDATE SET is_active = true
      `;
    }
    
    // Insert elective subjects if provided
    const electiveSubjectIds = [
      studentData.elective_subject_1,
      studentData.elective_subject_2,
      studentData.elective_subject_3,
      studentData.elective_subject_4
    ].filter(id => id && id !== '');
    
    for (const subjectId of electiveSubjectIds) {
      const subjectIdNum = parseInt(subjectId);
      if (!isNaN(subjectIdNum)) {
        await sql`
          INSERT INTO student_subjects (student_id, subject_id, academic_year, is_active)
          VALUES (${studentRecord.id}, ${subjectIdNum}, ${academicYear}, true)
          ON CONFLICT (student_id, subject_id, academic_year) DO UPDATE SET is_active = true
        `;
      }
    }
    
    return {
      ...studentRecord,
      student_id: studentId,
      password: tempPassword
    };
  },

  async getStudentById(studentId: number) {
    try {
      const result = await sql`
        SELECT s.*, c.name as course_name, cl.class_name, u.user_id
        FROM students s
        LEFT JOIN courses c ON s.course_id = c.id
        LEFT JOIN classes cl ON s.current_class_id = cl.id
        LEFT JOIN users u ON s.user_id = u.id
        WHERE s.id = ${studentId}
      `;
      
      if (result.length === 0) {
        throw new Error('Student not found');
      }
      
      // Convert date objects to strings to prevent React rendering issues
      const student = result[0];
      return {
        ...student,
        date_of_birth: student.date_of_birth ? student.date_of_birth.toString() : '',
        enrollment_date: student.enrollment_date ? student.enrollment_date.toString() : '',
        created_at: student.created_at ? student.created_at.toString() : '',
        updated_at: student.updated_at ? student.updated_at.toString() : ''
      };
    } catch (error) {
      console.error('Error fetching student by ID:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to fetch student: ${errorMessage}`);
    }
  },

  async deleteStudent(studentId: number) {
    try {
      // This will cascade delete the student and associated user
      const result = await sql`
        DELETE FROM students 
        WHERE id = ${studentId}
        RETURNING *
      `;
      
      if (result.length === 0) {
        throw new Error('Student not found');
      }
      
      return {
        success: true,
        message: 'Student deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting student:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to delete student: ${errorMessage}`);
    }
  },

  async deactivateStudent(studentId: number) {
    try {
      const result = await sql`
        UPDATE students 
        SET is_active = false, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${studentId}
        RETURNING *
      `;
      
      if (result.length === 0) {
        throw new Error('Student not found');
      }
      
      // Also deactivate the associated user account
      await sql`
        UPDATE users 
        SET is_active = false, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${result[0].user_id}
      `;
      
      return {
        success: true,
        message: 'Student deactivated successfully'
      };
    } catch (error) {
      console.error('Error deactivating student:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to deactivate student: ${errorMessage}`);
    }
  },

  async reactivateStudent(studentId: number) {
    try {
      const result = await sql`
        UPDATE students 
        SET is_active = true, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${studentId}
        RETURNING *
      `;
      
      if (result.length === 0) {
        throw new Error('Student not found');
      }
      
      // Also reactivate the associated user account
      await sql`
        UPDATE users 
        SET is_active = true, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${result[0].user_id}
      `;
      
      return {
        success: true,
        message: 'Student reactivated successfully'
      };
    } catch (error) {
      console.error('Error reactivating student:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to reactivate student: ${errorMessage}`);
    }
  },

  async updateStudent(studentId: number, studentData: any) {
    try {
      const result = await sql`
        UPDATE students 
        SET 
          course_id = COALESCE(${studentData.programme_id}, course_id),
          current_class_id = COALESCE(${studentData.current_class_id}, current_class_id),
          surname = COALESCE(${studentData.surname}, surname),
          other_names = COALESCE(${studentData.other_names}, other_names),
          date_of_birth = COALESCE(${studentData.date_of_birth}, date_of_birth),
          gender = COALESCE(${studentData.gender}, gender),
          nationality = COALESCE(${studentData.nationality}, nationality),
          hometown = COALESCE(${studentData.hometown}, hometown),
          district_of_origin = COALESCE(${studentData.district_of_origin}, district_of_origin),
          region_of_origin = COALESCE(${studentData.region_of_origin}, region_of_origin),
          guardian_name = COALESCE(${studentData.guardian_name}, guardian_name),
          guardian_relationship = COALESCE(${studentData.guardian_relationship}, guardian_relationship),
          guardian_phone = COALESCE(${studentData.guardian_phone}, guardian_phone),
          guardian_phone_alt = COALESCE(${studentData.guardian_phone_alt}, guardian_phone_alt),
          guardian_email = COALESCE(${studentData.guardian_email}, guardian_email),
          guardian_address = COALESCE(${studentData.guardian_address}, guardian_address),
          previous_school = COALESCE(${studentData.previous_school}, previous_school),
          graduation_year = COALESCE(${studentData.graduation_year}, graduation_year),
          known_allergies = COALESCE(${studentData.known_allergies}, known_allergies),
          chronic_conditions = COALESCE(${studentData.chronic_conditions}, chronic_conditions),
          blood_group = COALESCE(${studentData.blood_group}, blood_group),
          enrollment_date = COALESCE(${studentData.enrollment_date}, enrollment_date),
          residential_status = COALESCE(${studentData.residential_status}, residential_status),
          house_preference = COALESCE(${studentData.house_preference}, house_preference),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${studentId}
        RETURNING *
      `;
      
      if (result.length === 0) {
        throw new Error('Student not found');
      }
      
      return result[0];
    } catch (error) {
      console.error('Error updating student:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to update student: ${errorMessage}`);
    }
  },

  // Teachers
  async getTeachers(filters?: {
    search?: string;
    department?: string;
    page?: number;
    limit?: number;
    includeInactive?: boolean; // New parameter
  }) {
    const { search, department, page = 1, limit = 10, includeInactive = false } = filters || {};
    
    // Base query condition
    const isActiveCondition = includeInactive ? '' : 'AND t.is_active = true';

    // Use template literals for complex filtering
    if (search) {
      return await sql`
        SELECT t.*, u.user_id
        FROM teachers t
        LEFT JOIN users u ON t.user_id = u.id
        WHERE 1=1 ${sql.unsafe(isActiveCondition)}
        AND (t.surname ILIKE ${`%${search}%`} OR t.other_names ILIKE ${`%${search}%`} OR t.staff_id ILIKE ${`%${search}%`} OR t.department ILIKE ${`%${search}%`} OR t.teacher_id ILIKE ${`%${search}%`})
        ORDER BY t.created_at DESC
        LIMIT ${limit} OFFSET ${(page - 1) * limit}
      `;
    }
    
    if (department) {
      return await sql`
        SELECT t.*, u.user_id
        FROM teachers t
        LEFT JOIN users u ON t.user_id = u.id
        WHERE 1=1 ${sql.unsafe(isActiveCondition)} AND t.department = ${department}
        ORDER BY t.created_at DESC
        LIMIT ${limit} OFFSET ${(page - 1) * limit}
      `;
    }
    
    return await sql`
      SELECT t.*, u.user_id
      FROM teachers t
      LEFT JOIN users u ON t.user_id = u.id
      WHERE 1=1 ${sql.unsafe(isActiveCondition)}
      ORDER BY t.created_at DESC
      LIMIT ${limit} OFFSET ${(page - 1) * limit}
    `;
  },

  async createTeacher(teacherData: any) {
    // Generate teacher ID with uniqueness check
    const year = new Date().getFullYear();
    let teacherId;
    let nextTeacherNum = 1;
    let isUnique = false;
    
    while (!isUnique) {
      teacherId = `TEA${year}${nextTeacherNum.toString().padStart(3, '0')}`;
      
      // Check if this ID already exists
      const existingUser = await sql`
        SELECT 1 FROM users WHERE user_id = ${teacherId}
      `;
      
      if (existingUser.length === 0) {
        isUnique = true;
      } else {
        nextTeacherNum++;
      }
    }
    
    // Generate random password
    const tempPassword = generateRandomPassword(8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    
    // Create user account
    const userResult = await sql`
      INSERT INTO users (user_id, user_type, password_hash, temp_password, must_change_password)
      VALUES (${teacherId}, 'teacher', ${hashedPassword}, ${tempPassword}, true)
      RETURNING id
    `;
    
    const userId = userResult[0].id;
    
    // Create teacher record
    const result = await sql`
      INSERT INTO teachers (
        user_id, teacher_id, staff_id, title, surname, other_names, date_of_birth, gender, 
        nationality, ghana_card_id, employment_date, department, position_rank, 
        staff_type, personal_phone, alt_phone, personal_email, residential_address, 
        highest_qualification, field_of_study, institution, year_obtained, 
        other_qualifications, role, emergency_name, emergency_relationship, emergency_phone, is_active
      ) VALUES (
        ${userId}, ${teacherId}, ${teacherData.staff_id}, ${teacherData.title}, ${teacherData.surname}, 
        ${teacherData.other_names}, ${teacherData.dob || teacherData.date_of_birth}, ${teacherData.gender}, 
        ${teacherData.nationality}, ${teacherData.ghana_card_id}, ${teacherData.employment_date}, 
        ${teacherData.department}, ${teacherData.position_rank}, 
        ${teacherData.staff_type}, ${teacherData.personal_phone}, ${teacherData.alt_phone}, 
        ${teacherData.personal_email}, ${teacherData.residential_address}, ${teacherData.highest_qualification}, 
        ${teacherData.field_of_study}, ${teacherData.institution}, ${teacherData.year_obtained}, 
        ${teacherData.other_qualifications}, ${teacherData.role}, ${teacherData.emergency_name}, 
        ${teacherData.emergency_relationship}, ${teacherData.emergency_phone}, true
      ) RETURNING *
    `;
    
    return {
      ...result[0],
      teacher_id: teacherId,
      password: tempPassword
    };
  },

  async deleteTeacher(teacherId: number) {
    try {
      // This will cascade delete the teacher and associated user
      const result = await sql`
        DELETE FROM teachers 
        WHERE id = ${teacherId}
        RETURNING *
      `;
      
      if (result.length === 0) {
        throw new Error('Teacher not found');
      }
      
      return {
        success: true,
        message: 'Teacher deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting teacher:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to delete teacher: ${errorMessage}`);
    }
  },

  async deactivateTeacher(teacherId: number) {
    try {
      const result = await sql`
        UPDATE teachers 
        SET is_active = false, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${teacherId}
        RETURNING *
      `;
      
      if (result.length === 0) {
        throw new Error('Teacher not found');
      }
      
      // Also deactivate the associated user account
      await sql`
        UPDATE users 
        SET is_active = false, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${result[0].user_id}
      `;
      
      return {
        success: true,
        message: 'Teacher deactivated successfully'
      };
    } catch (error) {
      console.error('Error deactivating teacher:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to deactivate teacher: ${errorMessage}`);
    }
  },

  async reactivateTeacher(teacherId: number) {
    try {
      const result = await sql`
        UPDATE teachers 
        SET is_active = true, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${teacherId}
        RETURNING *
      `;
      
      if (result.length === 0) {
        throw new Error('Teacher not found');
      }
      
      // Also reactivate the associated user account
      await sql`
        UPDATE users 
        SET is_active = true, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${result[0].user_id}
      `;
      
      return {
        success: true,
        message: 'Teacher reactivated successfully'
      };
    } catch (error) {
      console.error('Error reactivating teacher:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to reactivate teacher: ${errorMessage}`);
    }
  },

  async getTeacherById(teacherId: number) {
    try {
      const result = await sql`
        SELECT t.*, u.user_id
        FROM teachers t
        LEFT JOIN users u ON t.user_id = u.id
        WHERE t.id = ${teacherId}
      `;
      
      if (result.length === 0) {
        throw new Error('Teacher not found');
      }
      
      // Convert date objects to strings to prevent React rendering issues
      const teacher = result[0];
      return {
        ...teacher,
        date_of_birth: teacher.date_of_birth ? teacher.date_of_birth.toString() : '',
        employment_date: teacher.employment_date ? teacher.employment_date.toString() : '',
        created_at: teacher.created_at ? teacher.created_at.toString() : '',
        updated_at: teacher.updated_at ? teacher.updated_at.toString() : ''
      };
    } catch (error) {
      console.error('Error fetching teacher by ID:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to fetch teacher: ${errorMessage}`);
    }
  },

  async updateTeacher(teacherId: number, teacherData: any) {
    try {
      const result = await sql`
        UPDATE teachers 
        SET 
          department = COALESCE(${teacherData.department}, department),
          position_rank = COALESCE(${teacherData.position_rank}, position_rank),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${teacherId}
        RETURNING *
      `;
      
      if (result.length === 0) {
        throw new Error('Teacher not found');
      }
      
      return result[0];
    } catch (error) {
      console.error('Error updating teacher:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to update teacher: ${errorMessage}`);
    }
  },

  // Courses and Classes (updated from programmes)
  async getCourses() {
    return await sql`SELECT * FROM courses WHERE is_active = true ORDER BY name`;
  },

  async createCourse(courseData: any) {
    const result = await sql`
      INSERT INTO courses (name, code, description, duration_years)
      VALUES (${courseData.name}, ${courseData.code}, ${courseData.description}, ${courseData.duration_years})
      RETURNING *
    `;
    return result[0];
  },
  async getClasses(courseId?: number, form?: number, semester?: number) {
    let query = sql`SELECT * FROM classes WHERE is_active = true`;
    
    if (courseId) {
      query = sql`SELECT * FROM classes WHERE course_id = ${courseId} AND is_active = true`;
    }
    
    if (form) {
      query = sql`${query} AND form = ${form}`;
    }
    
    if (semester) {
      query = sql`${query} AND semester = ${semester}`;
    }
    
    query = sql`${query} ORDER BY form, semester, stream`;
    
    return await query;
  },
  async getClassWithSubjects(classId?: number, courseId?: number, form?: number, semester?: number) {
    if (classId) {
      const classInfo = await sql`
        SELECT c.*, 
               COALESCE(
                 json_agg(
                   json_build_object(
                     'id', s.id,
                     'name', s.name,
                     'code', s.code,
                     'is_core', s.is_core,
                     'is_elective', cs.is_elective
                   )
                 ) FILTER (WHERE s.id IS NOT NULL), 
                 '[]'
               ) as subjects
        FROM classes c
        LEFT JOIN class_subjects cs ON c.id = cs.class_id
        LEFT JOIN subjects s ON cs.subject_id = s.id
        WHERE c.id = ${classId}
        GROUP BY c.id
      `;
      return classInfo[0];
    }
    
    let query = sql`
      SELECT c.*, 
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', s.id,
                   'name', s.name,
                   'code', s.code,
                   'is_core', s.is_core,
                   'is_elective', cs.is_elective
                 )
               ) FILTER (WHERE s.id IS NOT NULL), 
               '[]'
             ) as subjects
      FROM classes c
      LEFT JOIN class_subjects cs ON c.id = cs.class_id
      LEFT JOIN subjects s ON cs.subject_id = s.id
      WHERE c.is_active = true`;
    
    if (courseId) {
      query = sql`${query} AND c.course_id = ${courseId}`;
    }
    
    if (form) {
      query = sql`${query} AND c.form = ${form}`;
    }
    
    if (semester) {
      query = sql`${query} AND c.semester = ${semester}`;
    }
    
    query = sql`${query} GROUP BY c.id ORDER BY c.form, c.semester, c.stream`;
    
    const classes = await query;
    return classes;
  },
  async findOrCreateClassForElectives(courseId: number, electiveSubjectIds: number[], form: number = 1, semester: number = 1) {
    try {
      // Validate inputs
      if (!courseId || !electiveSubjectIds || electiveSubjectIds.length === 0) {
        throw new Error('Course ID and elective subject IDs are required');
      }
      
      // Ensure all subject IDs are valid numbers
      const validSubjectIds = electiveSubjectIds.filter(id => !isNaN(id));
      if (validSubjectIds.length !== electiveSubjectIds.length) {
        throw new Error('Invalid subject IDs provided');
      }
      
      // Find existing class with the same elective combination, form, and semester
      const classesWithSubjects = await sql`
        SELECT c.id, c.class_name, c.form, c.semester, c.stream
        FROM classes c
        JOIN class_subjects cs ON c.id = cs.class_id
        WHERE c.course_id = ${courseId} 
        AND c.form = ${form}
        AND c.semester = ${semester}
        AND cs.subject_id = ANY(${validSubjectIds})
        GROUP BY c.id, c.class_name, c.form, c.semester, c.stream
        HAVING COUNT(DISTINCT cs.subject_id) = ${validSubjectIds.length}
      `;

      if (classesWithSubjects.length > 0) {
        // Return the first matching class
        return classesWithSubjects[0];
      }

      // If no class exists with this combination, create one
      // Get course name
      const courseResult = await sql`SELECT name FROM courses WHERE id = ${courseId}`;
      const courseName = courseResult[0]?.name || 'Course';
      
      // Get subject names for class naming
      const subjectsResult = await sql`
        SELECT name FROM subjects WHERE id = ANY(${validSubjectIds})
      `;
      
      const subjectNames = subjectsResult.map((s: any) => s.name).join('-');
      
      // Generate class name
      const className = `${courseName.split(' ')[0]} ${form} ${subjectNames} S${semester}`;
      
      // Get next available stream
      const streamResult = await sql`
        SELECT COALESCE(MAX(stream), 'A') as max_stream 
        FROM classes 
        WHERE course_id = ${courseId} AND form = ${form} AND semester = ${semester}
      `;
      
      const currentStream = streamResult[0]?.max_stream || 'A';
      let nextStream = 'A';
      
      // Only increment if currentStream is a valid letter
      if (currentStream && /^[A-Z]$/i.test(currentStream)) {
        nextStream = String.fromCharCode(currentStream.charCodeAt(0) + 1);
      }
      
      // Create the new class
      const classResult = await sql`
        INSERT INTO classes (class_name, course_id, form, semester, stream, academic_year)
        VALUES (${className}, ${courseId}, ${form}, ${semester}, ${nextStream}, ${new Date().getFullYear() + '/' + (new Date().getFullYear() + 1)})
        RETURNING *
      `;
      
      const newClass = classResult[0];
      
      // Create subject relationships
      for (const subjectId of validSubjectIds) {
        await sql`
          INSERT INTO class_subjects (class_id, subject_id, is_elective)
          VALUES (${newClass.id}, ${subjectId}, true)
          ON CONFLICT DO NOTHING
        `;
      }
      
      return newClass;
    } catch (error) {
      console.error('Error finding or creating class for electives:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to find or create class: ${errorMessage}`);
    }
  },
  async createClass(classData: any) {
    try {
      // Validate required fields
      if (!classData.class_name || !classData.course_id || !classData.form) {
        throw new Error('Class name, course ID, and form are required');
      }
      
      // Create the class first
      const result = await sql`
        INSERT INTO classes (class_name, course_id, form, semester, stream, academic_year, capacity)
        VALUES (${classData.class_name}, ${classData.course_id}, ${classData.form}, ${classData.semester || 1}, ${classData.stream || null}, ${classData.academic_year}, ${classData.capacity || 40})
        RETURNING *
      `;
      
      const createdClass = result[0];
      
      // If elective subjects are provided, store the class-subject relationships
      if (classData.elective_subject_1 || classData.elective_subject_2 || classData.elective_subject_3 || classData.elective_subject_4) {
        const electiveSubjects = [
          classData.elective_subject_1,
          classData.elective_subject_2,
          classData.elective_subject_3,
          classData.elective_subject_4
        ].filter(id => id && id !== ''); // Remove empty values
        
        // Insert class-subject relationships for electives
        for (const subjectId of electiveSubjects) {
          // Validate subject ID
          const subjectIdNum = parseInt(subjectId);
          if (isNaN(subjectIdNum)) {
            console.warn(`Invalid subject ID: ${subjectId}`);
            continue;
          }
          
          await sql`
            INSERT INTO class_subjects (class_id, subject_id, is_elective)
            VALUES (${createdClass.id}, ${subjectIdNum}, true)
            ON CONFLICT (class_id, subject_id) DO NOTHING
          `;
        }
      }
      
      return createdClass;
    } catch (error) {
      console.error('Error creating class:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to create class: ${errorMessage}`);
    }
  },
  async deleteAllClasses() {
    try {
      // First, update any students who are assigned to classes to have null class_id
      await sql`UPDATE students SET current_class_id = NULL WHERE current_class_id IS NOT NULL`;
      
      // Delete all teacher-subject-class relationships
      await sql`DELETE FROM teacher_subjects`;
      
      // Delete all classes
      const result = await sql`DELETE FROM classes RETURNING *`;
      
      return {
        success: true,
        deletedCount: result.length,
        message: `Successfully deleted ${result.length} classes`
      };
    } catch (error) {
      console.error('Error deleting classes:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to delete classes: ${errorMessage}`);
    }
  },
  async deleteClass(classId: number) {
    try {
      // Update students who are in this class
      await sql`UPDATE students SET current_class_id = NULL WHERE current_class_id = ${classId}`;
      
      // Delete teacher-subject relationships for this class
      await sql`DELETE FROM teacher_subjects WHERE class_id = ${classId}`;
      
      // Delete the class
      const result = await sql`DELETE FROM classes WHERE id = ${classId} RETURNING *`;
      
      if (result.length === 0) {
        throw new Error('Class not found');
      }
      
      return {
        success: true,
        message: 'Class deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting class:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to delete class: ${errorMessage}`);
    }
  },
  async getSubjects(courseId?: number) {
    if (courseId) {
      return await sql`
        SELECT * FROM subjects 
        WHERE (course_id = ${courseId} OR course_id IS NULL) AND is_active = true 
        ORDER BY is_core DESC, name
      `;
    }
    return await sql`SELECT * FROM subjects WHERE is_active = true ORDER BY is_core DESC, name`;
  },
  async createSubject(subjectData: any) {
    const result = await sql`
      INSERT INTO subjects (name, code, course_id, is_core)
      VALUES (${subjectData.name}, ${subjectData.code}, ${subjectData.course_id}, ${subjectData.is_core})
      RETURNING *
    `;
    return result[0];
  },
  async updateElectiveSubjects() {
    try {
      // Remove all existing elective subjects (keep core subjects)
      await sql`DELETE FROM subjects WHERE is_core = false`;
      
      // 1. General Arts electives
      await sql`
        INSERT INTO subjects (name, code, course_id, is_core) VALUES 
        ('Literature in English', 'LIT_ENG', 1, false),
        ('History', 'HIST', 1, false),
        ('Geography', 'GEOG', 1, false),
        ('Government', 'GOV', 1, false),
        ('Economics', 'ECON_GA', 1, false),
        ('Christian Religious Studies (CRS)', 'CRS', 1, false),
        ('Elective Mathematics', 'MATH_E_GA', 1, false),
        ('Ghanaian Language (Akwapim Twi)', 'TWI', 1, false),
        ('French', 'FRENCH', 1, false)
      `;
      
      // 2. General Science electives
      await sql`
        INSERT INTO subjects (name, code, course_id, is_core) VALUES 
        ('Physics', 'PHYS', 3, false),
        ('Chemistry', 'CHEM', 3, false),
        ('Biology', 'BIO', 3, false),
        ('Elective Mathematics', 'MATH_E_GS', 3, false),
        ('Information and Communication Technology (ICT)', 'ICT_GS', 3, false)
      `;
      
      // 3. Business electives
      await sql`
        INSERT INTO subjects (name, code, course_id, is_core) VALUES 
        ('Financial Accounting', 'FIN_ACC', 2, false),
        ('Costing', 'COST', 2, false),
        ('Business Management', 'BUS_MGT', 2, false),
        ('Economics', 'ECON_BUS', 2, false),
        ('Elective Mathematics', 'MATH_E_BUS', 2, false)
      `;
      
      // 4. Visual Arts electives
      await sql`
        INSERT INTO subjects (name, code, course_id, is_core) VALUES 
        ('General Knowledge in Art', 'GEN_ART', 4, false),
        ('Information and Communication Technology (ICT)', 'ICT_VA', 4, false),
        ('Graphic Design', 'GRAPH_DES', 4, false),
        ('Picture Making', 'PIC_MAK', 4, false),
        ('Sculpture', 'SCULP', 4, false)
      `;
      
      // 5. Home Economics electives
      await sql`
        INSERT INTO subjects (name, code, course_id, is_core) VALUES 
        ('Management in Living', 'MGT_LIV', 6, false),
        ('Food and Nutrition', 'FOOD_NUT', 6, false),
        ('Clothing and Textiles', 'CLOTH_TEXT', 6, false),
        ('Biology', 'BIO_HE', 6, false),
        ('General Knowledge in Art', 'GEN_ART_HE', 6, false)
      `;
      
      // 6. Agricultural Science electives
      await sql`
        INSERT INTO subjects (name, code, course_id, is_core) VALUES 
        ('General Agriculture', 'GEN_AGRIC', 5, false),
        ('Chemistry', 'CHEM_AG', 5, false),
        ('Animal Husbandry', 'ANIM_HUS', 5, false),
        ('Elective Mathematics', 'MATH_E_AG', 5, false)
      `;
      
      // Update course names to match curriculum
      await sql`UPDATE courses SET name = 'General Art' WHERE id = 1`;
      await sql`UPDATE courses SET name = 'Business' WHERE id = 2`;
      await sql`UPDATE courses SET name = 'General Science' WHERE id = 3`;
      await sql`UPDATE courses SET name = 'Visual Art' WHERE id = 4`;
      await sql`UPDATE courses SET name = 'Agricultural Science' WHERE id = 5`;
      await sql`UPDATE courses SET name = 'Home Economics' WHERE id = 6`;
      
      return {
        success: true,
        message: 'Elective subjects updated successfully according to Ghana curriculum'
      };
    } catch (error) {
      console.error('Error updating elective subjects:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to update elective subjects: ${errorMessage}`);
    }
  },

  // Teacher-Subject Assignment
  async assignSubjectToTeacher(teacherId: number, subjectId: number, classId: number) {
    try {
      const academicYear = new Date().getFullYear() + '/' + (new Date().getFullYear() + 1);
      
      const result = await sql`
        INSERT INTO teacher_subjects (teacher_id, subject_id, class_id, academic_year)
        VALUES (${teacherId}, ${subjectId}, ${classId}, ${academicYear})
        RETURNING *
      `;
      
      return result[0];
    } catch (error) {
      console.error('Error assigning subject to teacher:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to assign subject to teacher: ${errorMessage}`);
    }
  },

  async getTeacherSubjects(teacherId: number) {
    try {
      const result = await sql`
        SELECT ts.*, s.name as subject_name, c.class_name, c.form, c.stream, c.id as class_id, s.id as subject_id
        FROM teacher_subjects ts
        JOIN subjects s ON ts.subject_id = s.id
        JOIN classes c ON ts.class_id = c.id
        WHERE ts.teacher_id = ${teacherId} AND ts.is_active = true
        ORDER BY c.form, c.stream, s.name
      `;
      
      return result;
    } catch (error) {
      console.error('Error fetching teacher subjects:', error);
      return [];
    }
  },

  // Announcements
  async getAnnouncements(classId?: number) {
    try {
      let result;
      if (classId) {
        // Get announcements for a specific class (for teachers)
        result = await sql`
          SELECT *
          FROM announcements
          WHERE (target_class_id = ${classId} OR target_class_id IS NULL) AND is_published = true
          ORDER BY created_at DESC
        `;
      } else {
        // Get all announcements (for admins)
        result = await sql`
          SELECT *
          FROM announcements
          WHERE is_published = true
          ORDER BY created_at DESC
        `;
      }
      return result || [];
    } catch (error) {
      console.error('Error fetching announcements:', error);
      return [];
    }
  },

  async createAnnouncement(announcementData: { 
    title: string; 
    content: string; 
    created_by: number;
    class_id?: number; // Optional class ID for teacher announcements
  }) {
    try {
      const result = await sql`
        INSERT INTO announcements (title, content, created_by, class_id)
        VALUES (${announcementData.title}, ${announcementData.content}, ${announcementData.created_by}, ${announcementData.class_id || null})
        RETURNING *
      `;
      
      return result[0];
    } catch (error) {
      console.error('Error creating announcement:', error);
      throw new Error('Failed to create announcement');
    }
  },

  async deleteAnnouncement(announcementId: number) {
    try {
      const result = await sql`
        UPDATE announcements 
        SET is_published = false, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${announcementId}
        RETURNING *
      `;
      
      return result[0];
    } catch (error) {
      console.error('Error deleting announcement:', error);
      throw new Error('Failed to delete announcement');
    }
  },

  // Timetables
  async uploadTimetable(timetableData: { 
    class_id: number; 
    file_name: string; 
    file_path: string; 
    file_type: string; 
    academic_year: string; 
    uploaded_by: number 
  }) {
    try {
      const result = await sql`
        INSERT INTO timetables (class_id, file_name, file_path, file_type, academic_year, uploaded_by)
        VALUES (${timetableData.class_id}, ${timetableData.file_name}, ${timetableData.file_path}, 
                ${timetableData.file_type}, ${timetableData.academic_year}, ${timetableData.uploaded_by})
        RETURNING *
      `;
      
      return result[0];
    } catch (error) {
      console.error('Error uploading timetable:', error);
      throw new Error('Failed to upload timetable');
    }
  },

  async getTimetables(classId?: number) {
    try {
      if (classId) {
        return await sql`
          SELECT t.*, c.class_name, u.user_id as uploaded_by_user
          FROM timetables t
          JOIN classes c ON t.class_id = c.id
          JOIN users u ON t.uploaded_by = u.id
          WHERE t.class_id = ${classId} AND t.is_active = true
          ORDER BY t.created_at DESC
        `;
      }
      
      return await sql`
        SELECT t.*, c.class_name, u.user_id as uploaded_by_user
        FROM timetables t
        JOIN classes c ON t.class_id = c.id
        JOIN users u ON t.uploaded_by = u.id
        WHERE t.is_active = true
        ORDER BY c.class_name, t.created_at DESC
      `;
    } catch (error) {
      console.error('Error fetching timetables:', error);
      return [];
    }
  },

  async deleteTimetable(timetableId: number) {
    try {
      const result = await sql`
        UPDATE timetables 
        SET is_active = false, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${timetableId}
        RETURNING *
      `;
      
      return result[0];
    } catch (error) {
      console.error('Error deleting timetable:', error);
      throw new Error('Failed to delete timetable');
    }
  },

  // Timetable Entries
  async createTimetableEntry(entryData: { 
    day: string;
    time_slot: string;
    class_id: number;
    subject_id: number;
    teacher_id: number;
    academic_year: string;
  }) {
    try {
      const result = await sql`
        INSERT INTO timetable_entries (day, time_slot, class_id, subject_id, teacher_id, academic_year)
        VALUES (${entryData.day}, ${entryData.time_slot}, ${entryData.class_id}, ${entryData.subject_id}, ${entryData.teacher_id}, ${entryData.academic_year})
        RETURNING *
      `;
      
      return result[0];
    } catch (error) {
      console.error('Error creating timetable entry:', error);
      throw new Error('Failed to create timetable entry');
    }
  },

  async getTimetableEntries(filters?: { 
    class_id?: number;
    teacher_id?: number;
    academic_year?: string;
    day?: string;
  }) {
    try {
      let query = sql`SELECT te.*, c.class_name, s.name as subject_name, t.surname as teacher_surname, t.other_names as teacher_other_names
                     FROM timetable_entries te
                     JOIN classes c ON te.class_id = c.id
                     JOIN subjects s ON te.subject_id = s.id
                     JOIN teachers t ON te.teacher_id = t.id
                     WHERE te.is_active = true`;
      
      if (filters?.class_id) {
        query = sql`${query} AND te.class_id = ${filters.class_id}`;
      }
      
      if (filters?.teacher_id) {
        query = sql`${query} AND te.teacher_id = ${filters.teacher_id}`;
      }
      
      if (filters?.academic_year) {
        query = sql`${query} AND te.academic_year = ${filters.academic_year}`;
      }
      
      if (filters?.day) {
        query = sql`${query} AND te.day = ${filters.day}`;
      }
      
      query = sql`${query} ORDER BY te.day, te.time_slot`;
      
      return await query;
    } catch (error) {
      console.error('Error fetching timetable entries:', error);
      return [];
    }
  },

  async getTeacherTimetable(teacherId: number, academicYear: string) {
    try {
      const result = await sql`
        SELECT te.*, c.class_name, s.name as subject_name
        FROM timetable_entries te
        JOIN classes c ON te.class_id = c.id
        JOIN subjects s ON te.subject_id = s.id
        WHERE te.teacher_id = ${teacherId} 
        AND te.academic_year = ${academicYear}
        AND te.is_active = true
        ORDER BY te.day, te.time_slot
      `;
      
      return result;
    } catch (error) {
      console.error('Error fetching teacher timetable:', error);
      return [];
    }
  },

  async getClassTimetable(classId: number, academicYear: string) {
    try {
      const result = await sql`
        SELECT te.*, s.name as subject_name, t.surname as teacher_surname, t.other_names as teacher_other_names
        FROM timetable_entries te
        JOIN subjects s ON te.subject_id = s.id
        JOIN teachers t ON te.teacher_id = t.id
        WHERE te.class_id = ${classId} 
        AND te.academic_year = ${academicYear}
        AND te.is_active = true
        ORDER BY te.day, te.time_slot
      `;
      
      return result;
    } catch (error) {
      console.error('Error fetching class timetable:', error);
      return [];
    }
  },

  async deleteTimetableEntries(academicYear: string) {
    try {
      const result = await sql`
        UPDATE timetable_entries 
        SET is_active = false, updated_at = CURRENT_TIMESTAMP
        WHERE academic_year = ${academicYear}
        RETURNING *
      `;
      
      return result;
    } catch (error) {
      console.error('Error deleting timetable entries:', error);
      throw new Error('Failed to delete timetable entries');
    }
  },

  async getUserByEmail(email: string) {
    // This is kept for admin login compatibility
    const result = await sql`
      SELECT * FROM users WHERE user_id = ${email} AND user_type = 'admin' AND is_active = true
    `;
    return result[0] || null;
  },

  async getStudentSubjects(studentId: number) {
    try {
      const result = await sql`
        SELECT ss.*, s.name as subject_name, s.code as subject_code, c.class_name
        FROM student_subjects ss
        JOIN subjects s ON ss.subject_id = s.id
        JOIN students st ON ss.student_id = st.id
        LEFT JOIN classes c ON st.current_class_id = c.id
        WHERE ss.student_id = ${studentId} AND ss.is_active = true
        ORDER BY s.is_core DESC, s.name
      `;
      
      return result;
    } catch (error) {
      console.error('Error fetching student subjects:', error);
      return [];
    }
  },

  async promoteStudentsToNextForm(currentAcademicYear: string, targetAcademicYear: string, fromForm: number = 1, fromSemester: number = 2, toForm: number = (fromForm + 1), toSemester: number = 1) {
    try {
      // Get all students in the specified form and semester
      const studentsToPromote = await sql`
        SELECT s.*, c.form as current_form, c.semester as current_semester
        FROM students s
        JOIN classes c ON s.current_class_id = c.id
        WHERE c.form = ${fromForm} AND c.semester = ${fromSemester} AND s.is_active = true
      `;

      // For each student, find or create a corresponding class in the next form/semester
      for (const student of studentsToPromote) {
        // Get the current class information
        const currentClass = await sql`
          SELECT * FROM classes WHERE id = ${student.current_class_id}
        `;

        if (currentClass.length > 0) {
          const classInfo = currentClass[0];
          
          // Check if a target class already exists with the same parameters
          let targetClassName;
          if (fromSemester === 2 && toSemester === 1) {
            // Moving from semester 2 to next form semester 1
            targetClassName = classInfo.class_name.replace(`${fromForm} S2`, `${toForm} S1`);
          } else if (fromSemester === 1 && toSemester === 2) {
            // Moving from semester 1 to semester 2 (same form)
            targetClassName = classInfo.class_name.replace(`${fromForm} S1`, `${toForm} S2`);
          } else {
            // Default pattern
            targetClassName = classInfo.class_name.replace(`${fromForm}`, `${toForm}`).replace(`S${fromSemester}`, `S${toSemester}`);
          }
          
          const existingTargetClass = await sql`
            SELECT * FROM classes 
            WHERE class_name = ${targetClassName} 
            AND course_id = ${classInfo.course_id}
            AND form = ${toForm}
            AND semester = ${toSemester}
            AND academic_year = ${targetAcademicYear}
          `;

          let targetClassId;
          if (existingTargetClass.length > 0) {
            // Use existing target class
            targetClassId = existingTargetClass[0].id;
          } else {
            // Create new target class with same parameters
            const newClassResult = await sql`
              INSERT INTO classes (class_name, course_id, form, semester, stream, academic_year, capacity)
              VALUES (${targetClassName}, ${classInfo.course_id}, ${toForm}, ${toSemester}, ${classInfo.stream}, ${targetAcademicYear}, ${classInfo.capacity})
              RETURNING id
            `;
            targetClassId = newClassResult[0].id;
            
            // Copy subject relationships if they exist
            const subjectRelationships = await sql`
              SELECT * FROM class_subjects WHERE class_id = ${classInfo.id}
            `;
            
            for (const rel of subjectRelationships) {
              await sql`
                INSERT INTO class_subjects (class_id, subject_id, is_elective)
                VALUES (${targetClassId}, ${rel.subject_id}, ${rel.is_elective})
                ON CONFLICT DO NOTHING
              `;
            }
          }

          // Update student to target class
          await sql`
            UPDATE students 
            SET current_class_id = ${targetClassId}
            WHERE id = ${student.id}
          `;
        }
      }

      return {
        success: true,
        message: `Successfully promoted ${studentsToPromote.length} students from Form ${fromForm} Semester ${fromSemester} to Form ${toForm} Semester ${toSemester}`
      };
    } catch (error) {
      console.error('Error promoting students:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to promote students: ${errorMessage}`);
    }
  },

  // Add new functions for teacher portal
  async getClassStudents(classId: number) {
    try {
      const result = await sql`
        SELECT s.*, c.class_name
        FROM students s
        JOIN classes c ON s.current_class_id = c.id
        WHERE s.current_class_id = ${classId} AND s.is_active = true
        ORDER BY s.surname, s.other_names
      `;
      
      return result;
    } catch (error) {
      console.error('Error fetching class students:', error);
      return [];
    }
  },

  async getAssignmentTypes() {
    try {
      const result = await sql`
        SELECT * FROM assignment_types
        ORDER BY id
      `;
      
      return result;
    } catch (error) {
      console.error('Error fetching assignment types:', error);
      return [];
    }
  },

  async createAssignment(assignmentData: any) {
    try {
      const result = await sql`
        INSERT INTO assignments (teacher_id, class_id, subject_id, title, description, assignment_type_id, due_date, max_score)
        VALUES (${assignmentData.teacher_id}, ${assignmentData.class_id}, ${assignmentData.subject_id}, 
                ${assignmentData.title}, ${assignmentData.description}, ${assignmentData.assignment_type_id}, 
                ${assignmentData.due_date}, ${assignmentData.max_score})
        RETURNING *
      `;
      
      return result[0];
    } catch (error) {
      console.error('Error creating assignment:', error);
      throw new Error('Failed to create assignment');
    }
  },

  async getAssignmentsByTeacher(teacherId: number) {
    try {
      const result = await sql`
        SELECT a.*, c.class_name, s.name as subject_name, at.name as assignment_type
        FROM assignments a
        JOIN classes c ON a.class_id = c.id
        JOIN subjects s ON a.subject_id = s.id
        JOIN assignment_types at ON a.assignment_type_id = at.id
        WHERE a.teacher_id = ${teacherId} AND a.is_active = true
        ORDER BY a.created_at DESC
      `;
      
      return result;
    } catch (error) {
      console.error('Error fetching teacher assignments:', error);
      return [];
    }
  },

  async getAssignmentsByClass(classId: number) {
    try {
      const result = await sql`
        SELECT a.*, c.class_name, s.name as subject_name, at.name as assignment_type
        FROM assignments a
        JOIN classes c ON a.class_id = c.id
        JOIN subjects s ON a.subject_id = s.id
        JOIN assignment_types at ON a.assignment_type_id = at.id
        WHERE a.class_id = ${classId} AND a.is_active = true
        ORDER BY a.created_at DESC
      `;
      
      return result;
    } catch (error) {
      console.error('Error fetching class assignments:', error);
      return [];
    }
  },

  async submitAssignment(assignmentId: number, studentId: number, filePath?: string) {
    try {
      const result = await sql`
        INSERT INTO assignment_submissions (assignment_id, student_id, file_path)
        VALUES (${assignmentId}, ${studentId}, ${filePath || null})
        RETURNING *
      `;
      
      return result[0];
    } catch (error) {
      console.error('Error submitting assignment:', error);
      throw new Error('Failed to submit assignment');
    }
  },

  async getAssignmentSubmissions(assignmentId: number) {
    try {
      const result = await sql`
        SELECT ass.*, s.student_id, s.surname, s.other_names, c.class_name
        FROM assignment_submissions ass
        JOIN students s ON ass.student_id = s.id
        JOIN classes c ON s.current_class_id = c.id
        WHERE ass.assignment_id = ${assignmentId} AND ass.is_active = true
        ORDER BY s.surname, s.other_names
      `;
      
      return result;
    } catch (error) {
      console.error('Error fetching assignment submissions:', error);
      return [];
    }
  },

  async gradeAssignmentSubmission(submissionId: number, score: number, remarks: string, teacherId: number) {
    try {
      const result = await sql`
        UPDATE assignment_submissions 
        SET score = ${score}, remarks = ${remarks}, graded_by = ${teacherId}, graded_date = CURRENT_TIMESTAMP
        WHERE id = ${submissionId}
        RETURNING *
      `;
      
      return result[0];
    } catch (error) {
      console.error('Error grading assignment:', error);
      throw new Error('Failed to grade assignment');
    }
  },

  async getStudentBehaviorRecords(studentId: number) {
    try {
      const result = await sql`
        SELECT *
        FROM student_behavior_records
        WHERE student_id = ${studentId} AND is_active = true
        ORDER BY date DESC
      `;
      
      return result;
    } catch (error) {
      console.error('Error fetching student behavior records:', error);
      return [];
    }
  },

  async getAllBehaviorRecords() {
    try {
      const result = await sql`
        SELECT sbr.*, 
               s.surname as student_surname, 
               s.other_names as student_other_names,
               t.surname as teacher_surname,
               t.other_names as teacher_other_names
        FROM student_behavior_records sbr
        JOIN students s ON sbr.student_id = s.id
        LEFT JOIN teachers t ON sbr.recorded_by = t.id
        WHERE sbr.is_active = true
        ORDER BY sbr.date DESC
      `;
      
      return result.map((record: any) => ({
        ...record,
        student_name: `${record.student_surname} ${record.student_other_names}`,
        teacher_name: record.teacher_surname ? `${record.teacher_surname} ${record.teacher_other_names}` : 'System'
      }));
    } catch (error) {
      console.error('Error fetching all behavior records:', error);
      return [];
    }
  },

  async createBehaviorRecord(recordData: any) {
    try {
      const result = await sql`
        INSERT INTO student_behavior_records 
        (student_id, recorded_by, date, type, description, status)
        VALUES (${recordData.student_id}, ${recordData.recorded_by}, ${recordData.date}, 
                ${recordData.type}, ${recordData.description}, ${recordData.status})
        RETURNING *
      `;
      
      return result[0];
    } catch (error) {
      console.error('Error creating behavior record:', error);
      throw new Error('Failed to create behavior record');
    }
  },

  async updateBehaviorRecord(id: number, recordData: any) {
    try {
      const result = await sql`
        UPDATE student_behavior_records
        SET student_id = ${recordData.student_id},
            recorded_by = ${recordData.recorded_by},
            date = ${recordData.date},
            type = ${recordData.type},
            description = ${recordData.description},
            status = ${recordData.status},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `;
      
      return result[0];
    } catch (error) {
      console.error('Error updating behavior record:', error);
      throw new Error('Failed to update behavior record');
    }
  },

  async deleteBehaviorRecord(id: number) {
    try {
      const result = await sql`
        UPDATE student_behavior_records
        SET is_active = false, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `;
      
      return result[0];
    } catch (error) {
      console.error('Error deleting behavior record:', error);
      throw new Error('Failed to delete behavior record');
    }
  },

  async saveStudentResult(resultData: any) {
    try {
      // Check if result already exists
      const existingResult = await sql`
        SELECT id FROM student_results
        WHERE student_id = ${resultData.student_id} 
        AND subject_id = ${resultData.subject_id}
        AND academic_year = ${resultData.academic_year}
        AND term = ${resultData.term}
      `;

      if (existingResult.length > 0) {
        // Update existing result
        const result = await sql`
          UPDATE student_results
          SET class_score = ${resultData.class_score}, 
              exam_score = ${resultData.exam_score},
              total_score = ${resultData.total_score},
              grade = ${resultData.grade},
              remarks = ${resultData.remarks},
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ${existingResult[0].id}
          RETURNING *
        `;
        
        return result[0];
      } else {
        // Insert new result
        const result = await sql`
          INSERT INTO student_results (student_id, subject_id, class_id, academic_year, term, 
                                     class_score, exam_score, total_score, grade, remarks)
          VALUES (${resultData.student_id}, ${resultData.subject_id}, ${resultData.class_id}, 
                  ${resultData.academic_year}, ${resultData.term}, ${resultData.class_score}, 
                  ${resultData.exam_score}, ${resultData.total_score}, ${resultData.grade}, ${resultData.remarks})
          RETURNING *
        `;
        
        return result[0];
      }
    } catch (error) {
      console.error('Error saving student result:', error);
      throw new Error('Failed to save student result');
    }
  },

  async getStudentResults(studentId: number, academicYear?: string, term?: number) {
    try {
      let query = sql`
        SELECT sr.*, s.name as subject_name, c.class_name
        FROM student_results sr
        JOIN subjects s ON sr.subject_id = s.id
        JOIN classes c ON sr.class_id = c.id
        WHERE sr.student_id = ${studentId} AND sr.is_active = true
      `;
      
      if (academicYear) {
        query = sql`${query} AND sr.academic_year = ${academicYear}`;
      }
      
      if (term) {
        query = sql`${query} AND sr.term = ${term}`;
      }
      
      query = sql`${query} ORDER BY sr.academic_year DESC, sr.term, s.name`;
      
      return await query;
    } catch (error) {
      console.error('Error fetching student results:', error);
      return [];
    }
  },

  async getClassResults(classId: number, subjectId: number, academicYear: string, term: number) {
    try {
      const result = await sql`
        SELECT sr.*, s.student_id, s.surname, s.other_names
        FROM student_results sr
        JOIN students s ON sr.student_id = s.id
        WHERE sr.class_id = ${classId} 
        AND sr.subject_id = ${subjectId}
        AND sr.academic_year = ${academicYear}
        AND sr.term = ${term}
        AND sr.is_active = true
        AND s.is_active = true
        ORDER BY s.surname, s.other_names
      `;
      
      return result;
    } catch (error) {
      console.error('Error fetching class results:', error);
      return [];
    }
  },

  async getTeacherMessages(teacherId: number) {
    try {
      const result = await sql`
        SELECT tm.*, c.class_name, s.name as subject_name
        FROM teacher_messages tm
        LEFT JOIN classes c ON tm.class_id = c.id
        LEFT JOIN subjects s ON tm.subject_id = s.id
        WHERE tm.teacher_id = ${teacherId} AND tm.is_active = true
        ORDER BY tm.created_at DESC
      `;
      
      return result;
    } catch (error) {
      console.error('Error fetching teacher messages:', error);
      return [];
    }
  },

  async createTeacherMessage(messageData: any) {
    try {
      const result = await sql`
        INSERT INTO teacher_messages (teacher_id, class_id, subject_id, title, content, is_private, recipient_student_id)
        VALUES (${messageData.teacher_id}, ${messageData.class_id}, ${messageData.subject_id}, 
                ${messageData.title}, ${messageData.content}, ${messageData.is_private || false}, 
                ${messageData.recipient_student_id || null})
        RETURNING *
      `;
      
      return result[0];
    } catch (error) {
      console.error('Error creating teacher message:', error);
      throw new Error('Failed to create teacher message');
    }
  },

  async getStudentPerformanceHistory(studentId: number, subjectId: number) {
    try {
      const result = await sql`
        SELECT sr.*, c.class_name
        FROM student_results sr
        JOIN classes c ON sr.class_id = c.id
        WHERE sr.student_id = ${studentId} 
        AND sr.subject_id = ${subjectId}
        AND sr.is_active = true
        ORDER BY sr.academic_year, sr.term
      `;
      
      return result;
    } catch (error) {
      console.error('Error fetching student performance history:', error);
      return [];
    }
  },

  // New functions for overall student performance analytics
  async getTopStudents(limit: number = 10, academicYear?: string, term?: number) {
    try {
      let query = sql`
        SELECT 
          s.id,
          s.student_id,
          s.surname,
          s.other_names,
          c.class_name,
          AVG(sr.total_score) as average_score,
          COUNT(sr.id) as subjects_count
        FROM students s
        JOIN student_results sr ON s.id = sr.student_id
        JOIN classes c ON s.current_class_id = c.id
        WHERE s.is_active = true AND sr.is_active = true
      `;
      
      if (academicYear) {
        query = sql`${query} AND sr.academic_year = ${academicYear}`;
      }
      
      if (term) {
        query = sql`${query} AND sr.term = ${term}`;
      }
      
      query = sql`
        ${query}
        GROUP BY s.id, s.student_id, s.surname, s.other_names, c.class_name
        HAVING COUNT(sr.id) >= 5  -- Only include students with at least 5 subjects
        ORDER BY AVG(sr.total_score) DESC
        LIMIT ${limit}
      `;
      
      return await query;
    } catch (error) {
      console.error('Error fetching top students:', error);
      return [];
    }
  },

  async getTopStudentsByClass(academicYear?: string, term?: number) {
    try {
      let query = sql`
        WITH class_averages AS (
          SELECT 
            s.id,
            s.student_id,
            s.surname,
            s.other_names,
            c.class_name,
            c.id as class_id,
            AVG(sr.total_score) as average_score,
            COUNT(sr.id) as subjects_count
          FROM students s
          JOIN student_results sr ON s.id = sr.student_id
          JOIN classes c ON s.current_class_id = c.id
          WHERE s.is_active = true AND sr.is_active = true
      `;
      
      if (academicYear) {
        query = sql`${query} AND sr.academic_year = ${academicYear}`;
      }
      
      if (term) {
        query = sql`${query} AND sr.term = ${term}`;
      }
      
      query = sql`
        ${query}
          GROUP BY s.id, s.student_id, s.surname, s.other_names, c.class_name, c.id
          HAVING COUNT(sr.id) >= 5  -- Only include students with at least 5 subjects
        ),
        ranked_students AS (
          SELECT 
            *,
            ROW_NUMBER() OVER (PARTITION BY class_id ORDER BY average_score DESC) as class_rank
          FROM class_averages
        )
        SELECT * FROM ranked_students WHERE class_rank = 1
        ORDER BY average_score DESC
      `;
      
      return await query;
    } catch (error) {
      console.error('Error fetching top students by class:', error);
      return [];
    }
  },

  async getTopStudentsByCourse(courseId: number, limit: number = 10, academicYear?: string, term?: number) {
    try {
      let query = sql`
        SELECT 
          s.id,
          s.student_id,
          s.surname,
          s.other_names,
          c.class_name,
          crs.name as course_name,
          AVG(sr.total_score) as average_score,
          COUNT(sr.id) as subjects_count
        FROM students s
        JOIN student_results sr ON s.id = sr.student_id
        JOIN classes c ON s.current_class_id = c.id
        JOIN courses crs ON c.course_id = crs.id
        WHERE s.is_active = true AND sr.is_active = true AND c.course_id = ${courseId}
      `;
      
      if (academicYear) {
        query = sql`${query} AND sr.academic_year = ${academicYear}`;
      }
      
      if (term) {
        query = sql`${query} AND sr.term = ${term}`;
      }
      
      query = sql`
        ${query}
        GROUP BY s.id, s.student_id, s.surname, s.other_names, c.class_name, crs.name
        HAVING COUNT(sr.id) >= 5  -- Only include students with at least 5 subjects
        ORDER BY AVG(sr.total_score) DESC
        LIMIT ${limit}
      `;
      
      return await query;
    } catch (error) {
      console.error('Error fetching top students by course:', error);
      return [];
    }
  },

  async getStudentPerformanceSummary(academicYear?: string, term?: number) {
    try {
      let query = sql`
        SELECT 
          s.id,
          s.student_id,
          s.surname,
          s.other_names,
          c.class_name,
          AVG(sr.total_score) as average_score,
          COUNT(sr.id) as subjects_count,
          SUM(CASE WHEN sr.total_score >= 50 THEN 1 ELSE 0 END) as passed_subjects,
          SUM(CASE WHEN sr.total_score < 50 THEN 1 ELSE 0 END) as failed_subjects
        FROM students s
        JOIN student_results sr ON s.id = sr.student_id
        JOIN classes c ON s.current_class_id = c.id
        WHERE s.is_active = true AND sr.is_active = true
      `;
      
      if (academicYear) {
        query = sql`${query} AND sr.academic_year = ${academicYear}`;
      }
      
      if (term) {
        query = sql`${query} AND sr.term = ${term}`;
      }
      
      query = sql`
        ${query}
        GROUP BY s.id, s.student_id, s.surname, s.other_names, c.class_name
        HAVING COUNT(sr.id) >= 5  -- Only include students with at least 5 subjects
        ORDER BY AVG(sr.total_score) DESC
      `;
      
      return await query;
    } catch (error) {
      console.error('Error fetching student performance summary:', error);
      return [];
    }
  }

};

// Learning Materials
async function uploadLearningMaterial(materialData: { 
  teacher_id: number;
  class_id: number;
  subject_id: number;
  title: string;
  description: string;
  file_name: string;
  file_path: string;
  file_type: string;
  material_type: string;
  academic_year: string;
}) {
  try {
    const result = await sql`
      INSERT INTO learning_materials (teacher_id, class_id, subject_id, title, description, file_name, file_path, file_type, material_type, academic_year)
      VALUES (${materialData.teacher_id}, ${materialData.class_id}, ${materialData.subject_id}, 
              ${materialData.title}, ${materialData.description}, ${materialData.file_name}, 
              ${materialData.file_path}, ${materialData.file_type}, ${materialData.material_type}, 
              ${materialData.academic_year})
      RETURNING *
    `;
    
    return result[0];
  } catch (error) {
    console.error('Error uploading learning material:', error);
    throw new Error('Failed to upload learning material');
  }
}

async function getLearningMaterials(filters?: { 
  teacher_id?: number;
  class_id?: number;
  subject_id?: number;
  material_type?: string;
  academic_year?: string;
}) {
  try {
    let query = sql`SELECT lm.*, c.class_name, s.name as subject_name, t.surname as teacher_surname, t.other_names as teacher_other_names
                   FROM learning_materials lm
                   JOIN classes c ON lm.class_id = c.id
                   JOIN subjects s ON lm.subject_id = s.id
                   JOIN teachers t ON lm.teacher_id = t.id
                   WHERE lm.is_active = true`;
    
    if (filters?.teacher_id) {
      query = sql`${query} AND lm.teacher_id = ${filters.teacher_id}`;
    }
    
    if (filters?.class_id) {
      query = sql`${query} AND lm.class_id = ${filters.class_id}`;
    }
    
    if (filters?.subject_id) {
      query = sql`${query} AND lm.subject_id = ${filters.subject_id}`;
    }
    
    if (filters?.material_type) {
      query = sql`${query} AND lm.material_type = ${filters.material_type}`;
    }
    
    if (filters?.academic_year) {
      query = sql`${query} AND lm.academic_year = ${filters.academic_year}`;
    }
    
    query = sql`${query} ORDER BY lm.created_at DESC`;
    
    return await query;
  } catch (error) {
    console.error('Error fetching learning materials:', error);
    return [];
  }
}

async function deleteLearningMaterial(materialId: number) {
  try {
    const result = await sql`
      UPDATE learning_materials 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${materialId}
      RETURNING *
    `;
    
    return result[0];
  } catch (error) {
    console.error('Error deleting learning material:', error);
    throw new Error('Failed to delete learning material');
  }
}


export { uploadLearningMaterial, getLearningMaterials, deleteLearningMaterial };
export default db;