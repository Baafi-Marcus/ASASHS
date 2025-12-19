import React, { useState, useEffect } from 'react';
import { db } from '../../../lib/neon';
import toast from 'react-hot-toast';

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
      console.log('Fetching teacher subjects for teacherId:', teacherId);
      
      // Fetch real teacher subjects from database
      const subjects = await db.getTeacherSubjects(teacherId);
      console.log('Fetched teacher subjects:', subjects);
      setTeacherSubjects(subjects as TeacherSubject[]);
      
      // Auto-select the first class if available
      if (subjects.length > 0) {
        console.log('Auto-selecting first class:', subjects[0].class_id);
        setSelectedClass(subjects[0].class_id);
      } else {
        console.log('No subjects found for teacher');
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
      console.log('Fetching class students for classId:', classId);
      // Fetch real class students from database
      const students = await db.getClassStudents(classId);
      console.log('Fetched class students:', students);
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
  
  // Debug logging
  console.log('Teacher subjects:', teacherSubjects);
  console.log('Grouped subjects:', groupedSubjects);
  console.log('Number of classes:', Object.keys(groupedSubjects).length);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-school-green-200 border-t-school-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">My Classes</h2>
          <p className="text-gray-600">View and manage your assigned classes and students</p>
        </div>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(groupedSubjects).map(([classKey, classData]) => (
          <div 
            key={classKey}
            className={`bg-white rounded-2xl shadow-lg border-2 p-6 cursor-pointer transition-all hover:shadow-xl ${
              selectedClass === classData.classId 
                ? 'border-school-green-500 ring-2 ring-school-green-200' 
                : 'border-gray-200'
            }`}
            onClick={() => setSelectedClass(classData.classId)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{classData.className}</h3>
                <p className="text-gray-600">Form {classData.form}{classData.stream ? ` ${classData.stream}` : ''}</p>
              </div>
              <span className="bg-school-green-100 text-school-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {classData.subjects.length} subjects
              </span>
            </div>
            
            <div className="mt-4 space-y-2">
              {classData.subjects.map((subject) => (
                <div key={subject.id} className="flex items-center text-sm text-gray-700">
                  <span className="w-2 h-2 bg-school-green-500 rounded-full mr-2"></span>
                  {subject.subject_name}
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100">
              <button 
                className="w-full bg-school-green-600 text-white py-2 px-4 rounded-lg hover:bg-school-green-700 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedClass(classData.classId);
                }}
              >
                View Students
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Students List */}
      {selectedClass && classStudents.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden">
          <div className="bg-school-green-600 text-white p-6">
            <h3 className="text-xl font-bold">Class Students</h3>
            <p className="text-school-green-100">
              {classStudents.length} students enrolled
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-school-cream-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Student ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-school-cream-200">
                {classStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-school-cream-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{student.student_id}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {student.surname}, {student.other_names}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        student.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {student.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <button className="text-school-green-600 hover:text-school-green-800 mr-3">
                        View Profile
                      </button>
                      <button className="text-blue-600 hover:text-blue-800">
                        Send Message
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State for Students */}
      {selectedClass && classStudents.length === 0 && (
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-8 text-center">
          <div className="text-4xl mb-4">👥</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Students Found</h3>
          <p className="text-gray-600 mb-4">There are no students enrolled in this class yet.</p>
          <button 
            className="px-4 py-2 bg-school-green-600 text-white rounded-lg hover:bg-school-green-700"
            onClick={() => fetchClassStudents(selectedClass)}
          >
            Refresh
          </button>
        </div>
      )}
    </div>
  );
};