import React, { useState, useEffect } from 'react';
import { db } from '../../../lib/neon';
import toast from 'react-hot-toast';
import { PortalCard } from '../../components/PortalCard';
import { PortalButton } from '../../components/PortalButton';
import { UserAvatar } from '../../components/UserAvatar';

interface TeacherSubject {
  id: number;
  subject_name: string;
  class_name: string;
  form: number;
  stream: string;
  class_id: number;
  subject_id: number;
}

interface ClassStudent {
  id: number;
  student_id: string;
  surname: string;
  other_names: string;
  class_name: string;
  is_active: boolean;
}

interface TeacherClassesProps {
  teacherId: number;
}

export const TeacherClasses: React.FC<TeacherClassesProps> = ({ teacherId }) => {
  const [teacherSubjects, setTeacherSubjects] = useState<TeacherSubject[]>([]);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [classStudents, setClassStudents] = useState<ClassStudent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeacherSubjects();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchClassStudents(selectedClass);
    }
  }, [selectedClass]);

  const fetchTeacherSubjects = async () => {
    try {
      setLoading(true);
      const subjects = await db.getTeacherSubjects(teacherId);
      setTeacherSubjects(subjects as TeacherSubject[]);
      
      if (subjects.length > 0) {
        setSelectedClass(subjects[0].class_id);
      } else {
        toast.error('No classes or subjects assigned to this teacher');
      }
    } catch (error) {
      console.error('Failed to fetch teacher subjects:', error);
      toast.error('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  const fetchClassStudents = async (classId: number) => {
    try {
      setLoading(true);
      const students = await db.getClassStudents(classId);
      setClassStudents(students as ClassStudent[]);
    } catch (error) {
      console.error('Failed to fetch class students:', error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  // Group subjects by class
  const groupedSubjects = teacherSubjects.reduce((acc, subject) => {
    const classKey = `${subject.class_id}`;
    if (!acc[classKey]) {
      acc[classKey] = {
        classId: subject.class_id,
        className: subject.class_name,
        form: subject.form,
        stream: subject.stream,
        subjects: []
      };
    }
    acc[classKey].subjects.push(subject);
    return acc;
  }, {} as Record<string, { classId: number; className: string; form: number; stream: string; subjects: TeacherSubject[] }>);

  if (loading && teacherSubjects.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-school-green-200 border-t-school-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Assigned Classes</h2>
        <p className="text-xs text-gray-500">View and manage assigned classes, curricula, and student rosters</p>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(groupedSubjects).map(([classKey, classData]) => {
          const isSelected = selectedClass === classData.classId;
          return (
            <PortalCard 
              key={classKey}
              onClick={() => setSelectedClass(classData.classId)}
              className={`p-5 cursor-pointer transition-all ${
                isSelected 
                  ? 'border-school-green-700 bg-school-green-50/20 ring-1 ring-school-green-700' 
                  : 'hover:border-gray-300'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-base font-bold text-gray-900">{classData.className}</h3>
                  <p className="text-xs text-gray-500">
                    Form {classData.form}{classData.stream ? ` • ${classData.stream}` : ''}
                  </p>
                </div>
                <span className="bg-school-green-50 text-school-green-800 border border-school-green-200 text-[10px] font-bold px-2 py-0.5 rounded-sm tabular-nums uppercase tracking-wider">
                  {classData.subjects.length} {classData.subjects.length === 1 ? 'Subject' : 'Subjects'}
                </span>
              </div>
              
              <div className="mt-3 space-y-1.5 pt-3 border-t border-gray-100">
                {classData.subjects.map((subject) => (
                  <div key={subject.id} className="flex items-center text-xs text-gray-700">
                    <span className="w-1.5 h-1.5 bg-school-green-700 rounded-full mr-2"></span>
                    <span className="truncate">{subject.subject_name}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-3 border-t border-gray-100">
                <PortalButton 
                  variant={isSelected ? 'primary' : 'secondary'}
                  className="w-full text-xs !min-h-[36px] !py-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedClass(classData.classId);
                  }}
                >
                  {isSelected ? 'Currently Viewing' : 'View Student Roster'}
                </PortalButton>
              </div>
            </PortalCard>
          );
        })}
      </div>

      {/* Students List */}
      {selectedClass && classStudents.length > 0 && (
        <PortalCard className="overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Class Student Roster</h3>
              <p className="text-xs text-gray-500 tabular-nums">
                {classStudents.length} student{classStudents.length === 1 ? '' : 's'} enrolled in this section
              </p>
            </div>
            <PortalButton
              variant="secondary"
              className="text-xs !min-h-[36px] !py-1"
              onClick={() => fetchClassStudents(selectedClass)}
            >
              Refresh
            </PortalButton>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Student ID</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Class</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {classStudents.map((student) => {
                  const fullName = `${student.surname}, ${student.other_names}`;
                  return (
                    <tr key={student.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <UserAvatar name={fullName} size="sm" />
                          <span className="text-sm font-semibold text-gray-900">{fullName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-xs font-mono font-medium text-gray-700 tabular-nums">
                        {student.student_id}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-semibold border ${
                          student.is_active 
                            ? 'bg-school-green-50 text-school-green-800 border-school-green-200' 
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {student.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-xs text-gray-500 text-right tabular-nums">
                        {student.class_name || 'Assigned'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </PortalCard>
      )}

      {/* Empty State for Students */}
      {selectedClass && classStudents.length === 0 && (
        <PortalCard className="p-8 text-center space-y-4">
          <div className="w-12 h-12 bg-gray-50 border border-gray-200 rounded-md flex items-center justify-center mx-auto text-gray-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-gray-900">No Students Found</h3>
            <p className="text-xs text-gray-500">There are no students enrolled in this class yet.</p>
          </div>
          <PortalButton 
            variant="secondary"
            onClick={() => fetchClassStudents(selectedClass)}
          >
            Refresh Roster
          </PortalButton>
        </PortalCard>
      )}
    </div>
  );
};