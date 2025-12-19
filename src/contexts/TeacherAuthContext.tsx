import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import db from '../../lib/neon';

interface Teacher {
  id: string;
  teacherId: string;
  teacherDbId: number;
  fullName: string;
  subjects: string[];
  classes: string[];
  department: string;
}

interface TeacherAuthContextType {
  teacher: Teacher | null;
  loading: boolean;
  login: (teacherId: string, password: string) => Promise<void>;
  logout: () => void;
}

const TeacherAuthContext = createContext<TeacherAuthContextType | undefined>(undefined);

export const useTeacherAuth = () => {
  const context = useContext(TeacherAuthContext);
  if (context === undefined) {
    throw new Error('useTeacherAuth must be used within a TeacherAuthProvider');
  }
  return context;
};

interface TeacherAuthProviderProps {
  children: React.ReactNode;
}

export const TeacherAuthProvider: React.FC<TeacherAuthProviderProps> = ({ children }) => {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);

  const authenticateTeacher = async (teacherId: string, password: string): Promise<Teacher> => {
    try {
      const authenticatedUser = await db.authenticateUser(teacherId, password);
      
      if (!authenticatedUser || authenticatedUser.user_type !== 'teacher') {
        throw new Error('Invalid credentials');
      }

      // Get additional teacher details (only active teachers)
      const teacherDetails: any[] = await db.getTeachers({ search: authenticatedUser.teacher_id, includeInactive: false });
      const teacherData = teacherDetails[0];

      if (!teacherData) {
        throw new Error('Teacher details not found');
      }

      // Get teacher's subjects and classes
      const teacherSubjects: any[] = await db.getTeacherSubjects(teacherData.id);
      
      // Extract unique subjects and classes
      const subjects = Array.from(new Set(teacherSubjects.map((ts: any) => `${ts.subject_name} (${ts.class_name})`))) as string[];
      const classes = Array.from(new Set(teacherSubjects.map((ts: any) => ts.class_name))) as string[];

      return {
        id: authenticatedUser.id.toString(),
        teacherId: authenticatedUser.teacher_id,
        teacherDbId: teacherData.id,
        fullName: `${teacherData.surname}, ${teacherData.other_names}`,
        subjects: subjects,
        classes: classes,
        department: teacherData.department || 'Not assigned'
      };
    } catch (error) {
      console.error('Authentication error:', error);
      throw new Error('Invalid credentials');
    }
  };

  const login = async (teacherId: string, password: string) => {
    try {
      setLoading(true);
      const authenticatedTeacher = await authenticateTeacher(teacherId, password);
      setTeacher(authenticatedTeacher);
      
      localStorage.setItem('teacherAuth', JSON.stringify({
        teacherData: authenticatedTeacher,
        timestamp: Date.now()
      }));
      
      toast.success(`Welcome back, ${authenticatedTeacher.fullName}!`);
    } catch (error) {
      toast.error('Invalid Teacher ID or password');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setTeacher(null);
    localStorage.removeItem('teacherAuth');
    toast.success('Successfully signed out');
  };

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const savedAuth = localStorage.getItem('teacherAuth');
        if (savedAuth) {
          const { teacherData, timestamp } = JSON.parse(savedAuth);
          
          const sessionAge = Date.now() - timestamp;
          const maxAge = 24 * 60 * 60 * 1000; // 24 hours
          
          if (sessionAge < maxAge && teacherData) {
            // Restore the teacher session
            setTeacher(teacherData);
          } else {
            // Session expired or invalid
            localStorage.removeItem('teacherAuth');
          }
        }
      } catch (error) {
        console.error('Session check failed:', error);
        localStorage.removeItem('teacherAuth');
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const value: TeacherAuthContextType = {
    teacher,
    loading,
    login,
    logout
  };

  return (
    <TeacherAuthContext.Provider value={value}>
      {children}
    </TeacherAuthContext.Provider>
  );
};