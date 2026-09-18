import React, { useState, useEffect } from 'react';
import { db } from '../../../lib/neon';
import toast from 'react-hot-toast';
import { StudentDetailsModal } from '../admin/StudentDetailsModal';
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

interface StudentPerformance {
  id: number;
  academic_year: string;
  term: number;
  class_score: number;
  exam_score: number;
  total_score: number;
  grade: string;
  remarks: string;
  class_name: string;
}

interface TeacherStudentPerformanceProps {
  teacherId: number | string;
}

export const TeacherStudentPerformance: React.FC<TeacherStudentPerformanceProps> = ({ teacherId }) => {
  const numericTeacherId = typeof teacherId === 'string' ? parseInt(teacherId) : teacherId;
  
  const [teacherSubjects, setTeacherSubjects] = useState<TeacherSubject[]>([]);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [classStudents, setClassStudents] = useState<ClassStudent[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<ClassStudent | null>(null);
  const [studentPerformance, setStudentPerformance] = useState<StudentPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [performanceLoading, setPerformanceLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showStudentDetails, setShowStudentDetails] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchTeacherSubjects();
  }, [numericTeacherId]);

  useEffect(() => {
    if (selectedClass) {
      fetchClassStudents(selectedClass);
    }
  }, [selectedClass]);

  const fetchTeacherSubjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const subjects = await db.getTeacherSubjects(numericTeacherId);
      setTeacherSubjects(subjects as TeacherSubject[]);
      
      if (subjects.length > 0) {
        setSelectedClass(subjects[0].class_id);
        setSelectedSubject(subjects[0].subject_id);
      }
    } catch (err) {
      console.error('Failed to fetch subjects:', err);
      setError('Failed to load classes and subjects');
      toast.error('Failed to load teacher classes');
    } finally {
      setLoading(false);
    }
  };

  const fetchClassStudents = async (classId: number) => {
    try {
      const students = await db.getClassStudents(classId);
      setClassStudents(students as ClassStudent[]);
      if (students.length > 0) {
        handleViewPerformance(students[0] as ClassStudent);
      } else {
        setSelectedStudent(null);
        setStudentPerformance([]);
      }
    } catch (err) {
      console.error('Failed to fetch class students:', err);
      toast.error('Failed to load students');
    }
  };

  const handleViewPerformance = async (student: ClassStudent) => {
    setSelectedStudent(student);
    if (!selectedSubject) return;
    
    setPerformanceLoading(true);
    try {
      const results = await db.getStudentSubjectPerformance(student.id, selectedSubject);
      setStudentPerformance(results as StudentPerformance[]);
    } catch (err) {
      console.error('Failed to fetch performance:', err);
      setStudentPerformance([]);
    } finally {
      setPerformanceLoading(false);
    }
  };

  const handleViewStudentDetails = (studentId: number) => {
    setSelectedStudentId(studentId);
    setShowStudentDetails(true);
  };

  const handleStudentModalClose = () => {
    setShowStudentDetails(false);
    setSelectedStudentId(null);
  };

  const groupedSubjects = teacherSubjects.reduce((acc, subject) => {
    const classKey = `${subject.class_name}`;
    if (!acc[classKey]) {
      acc[classKey] = {
        className: subject.class_name,
        form: subject.form,
        stream: subject.stream,
        classId: subject.class_id,
        subjects: [] as TeacherSubject[]
      };
    }
    acc[classKey].subjects.push(subject);
    return acc;
  }, {} as Record<string, { className: string; form: number; stream: string; classId: number; subjects: TeacherSubject[] }>);

  const getSubjectsForSelectedClass = () => {
    if (!selectedClass) return [];
    return teacherSubjects.filter(subject => subject.class_id === selectedClass);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-school-green-200 border-t-school-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <PortalCard className="p-6 text-center space-y-3">
        <h3 className="text-base font-bold text-red-600">Error Loading Analytics</h3>
        <p className="text-xs text-gray-500">{error}</p>
        <PortalButton variant="secondary" onClick={fetchTeacherSubjects}>
          Retry Connection
        </PortalButton>
      </PortalCard>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Performance Analytics & Diagnostics</h2>
        <p className="text-xs text-gray-500">Track cohort trajectory, term-by-term progressions, and student masteries</p>
      </div>

      {/* Class and Subject Selection */}
      <PortalCard className="p-4 sm:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Select Class Cohort</label>
            <select
              value={selectedClass || ''}
              onChange={(e) => setSelectedClass(parseInt(e.target.value))}
              className="w-full min-h-[44px] px-3.5 py-2 bg-white border border-gray-300 rounded-sm text-xs font-medium text-gray-900 focus:outline-none focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600"
            >
              <option value="">Choose a class</option>
              {Object.entries(groupedSubjects).map(([classKey, classData]) => (
                <option key={classKey} value={classData.classId}>
                  {classData.className} (Form {classData.form}{classData.stream})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Select Subject Domain</label>
            <select
              value={selectedSubject || ''}
              onChange={(e) => setSelectedSubject(parseInt(e.target.value))}
              className="w-full min-h-[44px] px-3.5 py-2 bg-white border border-gray-300 rounded-sm text-xs font-medium text-gray-900 focus:outline-none focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600"
              disabled={!selectedClass}
            >
              <option value="">Choose a subject</option>
              {getSubjectsForSelectedClass().map((subject) => (
                <option key={subject.id} value={subject.subject_id}>
                  {subject.subject_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </PortalCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Students List */}
        <PortalCard className="overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Cohort Roster</h3>
              <p className="text-xs text-gray-500 tabular-nums">{classStudents.length} students enrolled</p>
            </div>
          </div>
          
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left">
              <thead className="bg-white border-b border-gray-200 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Student</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {classStudents.length > 0 ? (
                  classStudents.map((student) => {
                    const isSelected = selectedStudent?.id === student.id;
                    const fullName = `${student.surname}, ${student.other_names}`;
                    return (
                      <tr 
                        key={student.id} 
                        className={`hover:bg-gray-50/60 transition-colors cursor-pointer ${
                          isSelected ? 'bg-school-green-50/40' : ''
                        }`}
                        onClick={() => handleViewPerformance(student)}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <UserAvatar name={fullName} size="sm" />
                            <span className="text-xs font-bold text-gray-900">{fullName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs font-mono font-medium text-gray-500 tabular-nums">
                          {student.student_id}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex gap-2">
                            <button 
                              className="text-xs font-semibold text-school-green-700 hover:underline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewPerformance(student);
                              }}
                            >
                              Performance
                            </button>
                            <button 
                              className="text-xs font-semibold text-gray-500 hover:text-gray-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewStudentDetails(student.id);
                              }}
                            >
                              Profile
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-xs text-gray-500">
                      No students enrolled in this class section.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </PortalCard>

        {/* Student Performance Details */}
        <PortalCard className="overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                {selectedStudent ? `${selectedStudent.surname}, ${selectedStudent.other_names}` : 'Individual Diagnostic Profile'}
              </h3>
              <p className="text-xs text-gray-500 font-mono tabular-nums">
                {selectedStudent ? selectedStudent.student_id : 'Select a student to view academic trajectory'}
              </p>
            </div>
          </div>
          
          {performanceLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-school-green-200 border-t-school-green-600"></div>
            </div>
          ) : selectedStudent ? (
            <div className="p-5 space-y-4">
              {studentPerformance.length > 0 ? (
                <div className="space-y-4">
                  <div className="overflow-x-auto rounded-sm border border-gray-200">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-3 py-2.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Term</th>
                          <th className="px-3 py-2.5 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Class</th>
                          <th className="px-3 py-2.5 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Exam</th>
                          <th className="px-3 py-2.5 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Total</th>
                          <th className="px-3 py-2.5 text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">Grade</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {studentPerformance.map((performance, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/60">
                            <td className="px-3 py-2.5 text-xs font-medium text-gray-900">
                              {performance.academic_year} • T{performance.term}
                            </td>
                            <td className="px-3 py-2.5 text-xs font-mono tabular-nums text-gray-600 text-right">
                              {performance.class_score != null ? performance.class_score.toFixed(1) : '-'}
                            </td>
                            <td className="px-3 py-2.5 text-xs font-mono tabular-nums text-gray-600 text-right">
                              {performance.exam_score != null ? performance.exam_score.toFixed(1) : '-'}
                            </td>
                            <td className="px-3 py-2.5 text-xs font-mono font-bold text-gray-900 text-right tabular-nums">
                              {performance.total_score != null ? performance.total_score.toFixed(1) : '-'}
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              <span className="inline-block px-1.5 py-0.5 rounded-sm text-[10px] font-bold border tabular-nums bg-gray-50 text-gray-800 border-gray-200">
                                {performance.grade || '-'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Summary Metric Strip */}
                  <div className="grid grid-cols-3 gap-2.5 pt-2">
                    <div className="p-3 bg-gray-50 rounded-sm border border-gray-200 text-center">
                      <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block">Assessed Terms</span>
                      <span className="text-base font-bold text-gray-900 tabular-nums">{studentPerformance.length}</span>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-sm border border-gray-200 text-center">
                      <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block">Cumulative Avg</span>
                      <span className="text-base font-bold text-school-green-700 tabular-nums">
                        {(studentPerformance.reduce((sum, p) => sum + (p.total_score || 0), 0) / studentPerformance.length).toFixed(1)}%
                      </span>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-sm border border-gray-200 text-center">
                      <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block">Highest Mark</span>
                      <span className="text-base font-bold text-gray-900 tabular-nums">
                        {Math.max(...studentPerformance.map(p => p.total_score || 0)).toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-xs text-gray-500">
                  No recorded examination scores found for this student in the selected subject.
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16 text-xs text-gray-500">
              Select a student from the cohort roster to inspect performance.
            </div>
          )}
        </PortalCard>
      </div>

      {/* Student Details Modal */}
      {selectedStudentId && (
        <StudentDetailsModal
          studentId={selectedStudentId}
          isOpen={showStudentDetails}
          onClose={handleStudentModalClose}
          onStudentUpdated={() => {}}
          programmes={[]}
          classes={[]}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
        />
      )}
    </div>
  );
};