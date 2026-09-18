import React, { useEffect, useState, useContext } from "react";
import toast from 'react-hot-toast';
import { db } from '../../../lib/neon';
import { StudentDetailsModal } from './StudentDetailsModal';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { AuthContext } from '../../../AuthContext';
import { PortalCard } from '../../components/PortalCard';
import { PortalButton } from '../../components/PortalButton';
import { UserAvatar } from '../../components/UserAvatar';

interface Student {
  id: number;
  student_id: string;
  admission_number: string;
  surname: string;
  other_names: string;
  gender: string;
  course_id: number;
  current_class_id: number;
  course_name?: string;
  class_name?: string;
  is_active: boolean;
}

interface Programme {
  id: number;
  name: string;
}

interface ClassItem {
  id: number;
  class_name: string;
  form: number;
  stream: string | null;
}

export function StudentList() {
  const { user } = useContext(AuthContext);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [programme, setProgramme] = useState<string | null>(null);
  const [gender, setGender] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);

  useEffect(() => {
    fetchStudents();
    fetchProgrammesAndClasses();
  }, [search, programme, gender, page]);

  const fetchProgrammesAndClasses = async () => {
    try {
      const [programmesData, classesData] = await Promise.all([
        db.getCourses(),
        db.getClasses()
      ]);
      
      setProgrammes(programmesData);
      setClasses(classesData);
    } catch (error) {
      console.error('Failed to fetch programmes and classes:', error);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    
    try {
      const filters: any = {
        page: page,
        limit: pageSize,
        includeInactive: true
      };
      
      if (search) {
        filters.search = search;
      }
      
      if (programme) {
        filters.course_id = parseInt(programme);
      }
      
      if (gender) {
        filters.gender = gender;
      }

      const studentsData = await db.getStudents(filters);
      setStudents(studentsData as Student[]);
    } catch (error) {
      console.error('Failed to fetch students:', error);
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchStudents();
  };

  const handleViewDetails = (studentId: number) => {
    setSelectedStudentId(studentId);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEditStudent = (studentId: number) => {
    setSelectedStudentId(studentId);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDeactivateStudent = async (studentId: number) => {
    if (window.confirm('Are you sure you want to deactivate this student? The student will no longer be able to log in, but their account will remain in the system.')) {
      try {
        await db.deactivateStudent(studentId);
        toast.success('Student deactivated successfully');
        fetchStudents();
      } catch (error) {
        console.error('Failed to deactivate student:', error);
        toast.error('Failed to deactivate student: ' + (error as Error).message);
      }
    }
  };

  const handleReactivateStudent = async (studentId: number) => {
    if (window.confirm('Are you sure you want to reactivate this student? The student will be able to log in again.')) {
      try {
        await db.reactivateStudent(studentId);
        toast.success('Student reactivated successfully');
        fetchStudents();
      } catch (error) {
        console.error('Failed to reactivate student:', error);
        toast.error('Failed to reactivate student: ' + (error as Error).message);
      }
    }
  };

  const handleDeleteStudent = async (studentId: number) => {
    if (window.confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
      try {
        const student = students.find(s => s.id === studentId);
        await db.deleteStudent(studentId);
        toast.success('Student deleted successfully');
        db.logAuditEvent({
          actor_id: user?.user_id || 'unknown',
          actor_name: user?.full_name || 'Unknown',
          action: 'delete',
          entity_type: 'student',
          entity_id: student?.student_id || String(studentId),
          details: `Deleted student ${student?.surname || ''} ${student?.other_names || ''} (${student?.student_id || ''})`
        });
        fetchStudents();
      } catch (error) {
        console.error('Failed to delete student:', error);
        toast.error('Failed to delete student: ' + (error as Error).message);
      }
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedStudentId(null);
    setIsEditing(false);
  };

  const handleStudentUpdated = () => {
    fetchStudents();
  };

  const getProgrammeName = (courseId: number) => {
    const progs: Record<number, string> = {
      1: "General Science",
      2: "Business",
      3: "Visual Art",
      4: "General Art",
      5: "General Agricultural",
      6: "Home Economics"
    };
    return progs[courseId] || "Unknown";
  };

  return (
    <div className="space-y-4">
      <PortalCard>
        {/* Filters and Search Bar */}
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="flex flex-1 gap-2 items-center">
            <div className="relative flex-1 max-w-sm">
              <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by name or index ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-sm focus:bg-white focus:outline-none focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600 transition-colors"
              />
            </div>
            
            <button
              onClick={handleSearch}
              className="px-3 py-2 bg-gray-100 border border-gray-300 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-sm transition-colors"
            >
              Filter
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={programme || ''}
              onChange={(e) => setProgramme(e.target.value || null)}
              aria-label="Filter students by programme"
              className="px-3 py-2 text-xs bg-white border border-gray-300 rounded-sm focus:outline-none focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600"
            >
              <option value="">All Programmes</option>
              <option value="1">General Science</option>
              <option value="2">Business</option>
              <option value="3">Visual Art</option>
              <option value="4">General Art</option>
              <option value="5">General Agricultural</option>
              <option value="6">Home Economics</option>
            </select>

            <select
              value={gender || ''}
              onChange={(e) => setGender(e.target.value || null)}
              aria-label="Filter students by gender"
              className="px-3 py-2 text-xs bg-white border border-gray-300 rounded-sm focus:outline-none focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600"
            >
              <option value="">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
        </div>

        {/* Student Roster Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                <th className="py-3 px-4">Student ID</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Gender</th>
                <th className="py-3 px-4">Programme</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-4">
                    <LoadingSkeleton variant="table-row" columns={7} />
                  </td>
                </tr>
              ) : students.length > 0 ? (
                students.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/70 transition-colors group">
                    <td className="py-3 px-4 font-mono text-xs font-semibold text-gray-800 tabular-nums">
                      {s.student_id || s.admission_number}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          name={`${s.surname} ${s.other_names}`}
                          size="sm"
                          status={s.is_active ? 'online' : 'offline'}
                        />
                        <div>
                          <div className="font-medium text-gray-900 leading-tight">
                            {s.surname} {s.other_names}
                          </div>
                          {s.admission_number && s.admission_number !== s.student_id && (
                            <div className="text-[11px] text-gray-400 font-mono tabular-nums">
                              Adm: {s.admission_number}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-600">
                      {s.gender || '—'}
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-700">
                      {s.course_name || getProgrammeName(s.course_id)}
                    </td>
                    <td className="py-3 px-4 text-xs font-medium text-gray-800">
                      {s.class_name || <span className="text-gray-400">Unassigned</span>}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium border ${
                        s.is_active 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {s.is_active ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        {/* View Details */}
                        <button
                          onClick={() => handleViewDetails(s.id)}
                          className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-sm transition-colors"
                          title="View Details"
                          aria-label="View Details"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        
                        {/* Edit Student */}
                        <button
                          onClick={() => handleEditStudent(s.id)}
                          className="p-1.5 text-gray-500 hover:text-school-green-700 hover:bg-gray-100 rounded-sm transition-colors"
                          title="Edit Student"
                          aria-label="Edit Student"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>

                        {/* Reset Password */}
                        <button
                          onClick={async () => {
                            const creds = prompt('Enter new password (leave empty to generate):');
                            if (creds === null) return;
                            try {
                              const result = await db.resetStudentPassword(s.id);
                              const password = creds || result.password;
                              alert(`Student ID: ${s.student_id}\nPassword: ${password}\n\nSave these credentials. The student must change password on first login.`);
                              toast.success('Password reset successfully');
                            } catch (e) {
                              toast.error('Failed to reset password');
                            }
                          }}
                          className="p-1.5 text-gray-500 hover:text-amber-700 hover:bg-gray-100 rounded-sm transition-colors"
                          title="Reset Password"
                          aria-label="Reset Password"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                          </svg>
                        </button>

                        {/* Toggle Active Status */}
                        {s.is_active ? (
                          <button
                            onClick={() => handleDeactivateStudent(s.id)}
                            className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-gray-100 rounded-sm transition-colors"
                            title="Deactivate Student"
                            aria-label="Deactivate Student"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReactivateStudent(s.id)}
                            className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-gray-100 rounded-sm transition-colors"
                            title="Reactivate Student"
                            aria-label="Reactivate Student"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        )}

                        {/* Delete Student */}
                        <button
                          onClick={() => handleDeleteStudent(s.id)}
                          className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-sm transition-colors"
                          title="Delete Student"
                          aria-label="Delete Student"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                      <p className="font-medium text-gray-700">No students found</p>
                      <p className="text-xs text-gray-400 mt-1">Try adjusting your filters or search terms</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Clean Footer Pagination */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 border border-gray-300 rounded-sm text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ← Previous
          </button>
          <span className="text-xs text-gray-500 font-medium tabular-nums">
            Page {page}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={students.length < pageSize}
            className="px-3 py-1.5 border border-gray-300 rounded-sm text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next →
          </button>
        </div>
      </PortalCard>

      {/* Student Details Modal */}
      {selectedStudentId && (
        <StudentDetailsModal
          studentId={selectedStudentId}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onStudentUpdated={handleStudentUpdated}
          programmes={programmes}
          classes={classes}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
        />
      )}
    </div>
  );
}