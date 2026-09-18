import React, { useEffect, useState, useMemo, useContext } from 'react';
import { db } from '../../../lib/neon';
import toast from 'react-hot-toast';
import { AuthContext } from '../../../AuthContext';
import { AssignSubjectToTeacherModal } from '../../components/AssignSubjectToTeacherModal';
import { TeacherDetailsModal } from './TeacherDetailsModal';
import { PortalCard } from '../../components/PortalCard';
import { PortalButton } from '../../components/PortalButton';
import { PortalInput } from '../../components/PortalInput';
import { UserAvatar } from '../../components/UserAvatar';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { TeacherBulkUpload } from './TeacherBulkUpload';

interface Teacher {
  id: number;
  staff_id: string;
  title: string;
  surname: string;
  other_names: string;
  gender: string;
  department: string;
  status: string;
  position_rank: string;
  personal_email: string;
  personal_phone: string;
  created_at: string;
  is_active: boolean;
}

interface Subject {
  id: number;
  name: string;
  code: string;
  course_id: number | null;
  is_core: boolean;
}

interface Class {
  id: number;
  class_name: string;
  course_id: number;
  form: number;
  stream: string | null;
}

type RegistrationResult = {
  teacher_id: string;
  password: string;
} | null;

export function AdminTeacherManagement() {
  const { user } = useContext(AuthContext);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [registrationResult, setRegistrationResult] = useState<RegistrationResult>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [showSubjectAssignmentModal, setShowSubjectAssignmentModal] = useState(false);
  const [selectedTeacherForAssignment, setSelectedTeacherForAssignment] = useState<Teacher | null>(null);
  const [teacherExistingAssignments, setTeacherExistingAssignments] = useState<any[]>([]);

  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [isTeacherEditing, setIsTeacherEditing] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  const [formData, setFormData] = useState({
    staff_id: '',
    title: 'Mr.',
    surname: '',
    other_names: '',
    gender: 'Male',
    department: '',
    position_rank: '',
  });

  const [editFormData, setEditFormData] = useState({
    title: 'Mr.',
    surname: '',
    other_names: '',
    gender: 'Male',
    department: '',
    position_rank: '',
  });

  useEffect(() => {
    fetchTeachers();
    fetchSubjectsAndClasses();
  }, []);

  const filteredTeachers = useMemo(() => {
    let list = teachers;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(t =>
        t.staff_id?.toLowerCase().includes(q) ||
        t.surname?.toLowerCase().includes(q) ||
        t.other_names?.toLowerCase().includes(q) ||
        t.department?.toLowerCase().includes(q) ||
        t.position_rank?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [teachers, searchTerm]);

  const paginatedTeachers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredTeachers.slice(start, start + pageSize);
  }, [filteredTeachers, page]);

  const totalPages = Math.max(1, Math.ceil(filteredTeachers.length / pageSize));

  useEffect(() => { setPage(1); }, [searchTerm]);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const teachersData = await db.getTeachers({ 
        limit: 100,
        search: searchTerm || undefined,
        includeInactive: true
      });
      setTeachers(teachersData as Teacher[]);
    } catch (error) {
      console.error('Failed to fetch teachers:', error);
      toast.error('Failed to load teachers');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjectsAndClasses = async () => {
    try {
      const [subjectsData, classesData] = await Promise.all([
        db.getSubjects(),
        db.getClasses()
      ]);
      setSubjects(subjectsData as Subject[]);
      setClasses(classesData as Class[]);
    } catch (error) {
      console.error('Failed to fetch subjects and classes:', error);
      toast.error('Failed to load subjects and classes');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const defaultBloatData = {
        dob: '1980-01-01',
        nationality: 'Ghanaian',
        ghana_card_id: 'N/A',
        employment_date: new Date().toISOString().split('T')[0],
        status: 'Active',
        staff_type: 'Permanent',
        personal_phone: '0000000000',
        alt_phone: '',
        personal_email: '',
        residential_address: 'N/A',
        highest_qualification: 'N/A',
        field_of_study: 'N/A',
        institution: 'N/A',
        year_obtained: new Date().getFullYear(),
        other_qualifications: '',
        role: 'Teacher',
        emergency_name: 'N/A',
        emergency_relationship: 'N/A',
        emergency_phone: '0000000000'
      };
      
      const submitData = { ...formData, ...defaultBloatData };
      const result: any = await db.createTeacher(submitData);
      
      if (result && result.teacher_id && result.password) {
        setRegistrationResult({
          teacher_id: result.teacher_id,
          password: result.password
        });
      } else {
        toast.success('Teacher registered successfully');
      }
      
      db.logAuditEvent({
        actor_id: user?.user_id || 'unknown',
        actor_name: user?.full_name || 'Unknown',
        action: 'create',
        entity_type: 'teacher',
        entity_id: result?.teacher_id || formData.staff_id,
        details: `Created teacher ${formData.title} ${formData.surname} ${formData.other_names}`
      });
      
      setShowForm(false);
      setFormData({
        staff_id: '',
        title: 'Mr.',
        surname: '',
        other_names: '',
        gender: 'Male',
        department: '',
        position_rank: '',
      });
      fetchTeachers();
    } catch (error) {
      console.error('Failed to register teacher:', error);
      toast.error('Failed to register teacher');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleDeleteTeacher = async (teacherId: number) => {
    if (window.confirm('Are you sure you want to permanently delete this teacher? This action cannot be undone.')) {
      try {
        const teacher = teachers.find(t => t.id === teacherId);
        await db.deleteTeacher(teacherId);
        toast.success('Teacher deleted successfully');
        db.logAuditEvent({
          actor_id: user?.user_id || 'unknown',
          actor_name: user?.full_name || 'Unknown',
          action: 'delete',
          entity_type: 'teacher',
          entity_id: teacher?.staff_id || String(teacherId),
          details: `Deleted teacher ${teacher?.title || ''} ${teacher?.surname || ''} ${teacher?.other_names || ''}`
        });
        fetchData();
      } catch (error) {
        console.error('Failed to delete teacher:', error);
        toast.error('Failed to delete teacher: ' + (error as Error).message);
      }
    }
  };

  const handleDeactivateTeacher = async (teacherId: number) => {
    if (window.confirm('Are you sure you want to deactivate this teacher?')) {
      try {
        const teacher = teachers.find(t => t.id === teacherId);
        await db.deactivateTeacher(teacherId);
        toast.success('Teacher deactivated successfully');
        db.logAuditEvent({
          actor_id: user?.user_id || 'unknown',
          actor_name: user?.full_name || 'Unknown',
          action: 'deactivate',
          entity_type: 'teacher',
          entity_id: teacher?.staff_id || String(teacherId),
          details: `Deactivated teacher ${teacher?.title || ''} ${teacher?.surname || ''} ${teacher?.other_names || ''}`
        });
        fetchData();
      } catch (error) {
        console.error('Failed to deactivate teacher:', error);
        toast.error('Failed to deactivate teacher: ' + (error as Error).message);
      }
    }
  };

  const handleReactivateTeacher = async (teacherId: number) => {
    if (window.confirm('Are you sure you want to reactivate this teacher?')) {
      try {
        await db.reactivateTeacher(teacherId);
        toast.success('Teacher reactivated successfully');
        fetchData();
      } catch (error) {
        console.error('Failed to reactivate teacher:', error);
        toast.error('Failed to reactivate teacher: ' + (error as Error).message);
      }
    }
  };

  const handleEditTeacher = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setEditFormData({
      title: teacher.title || 'Mr.',
      surname: teacher.surname || '',
      other_names: teacher.other_names || '',
      gender: teacher.gender === 'Female' ? 'Female' : 'Male',
      department: teacher.department || '',
      position_rank: teacher.position_rank || '',
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher) return;
    
    try {
      await db.updateTeacher(editingTeacher.id, editFormData);
      toast.success('Teacher information updated successfully');
      setShowEditModal(false);
      fetchData();
    } catch (error) {
      console.error('Failed to update teacher:', error);
      toast.error('Failed to update teacher: ' + (error as Error).message);
    }
  };

  const handleAssignSubject = async (teacher: Teacher) => {
    await fetchSubjectsAndClasses();
    try {
      const existing = await db.getTeacherSubjects(teacher.id);
      setTeacherExistingAssignments(existing);
    } catch {
      setTeacherExistingAssignments([]);
    }
    setSelectedTeacherForAssignment(teacher);
    setShowSubjectAssignmentModal(true);
  };

  const fetchData = () => {
    fetchTeachers();
    fetchSubjectsAndClasses();
  };

  const handleViewTeacherDetails = (teacherId: number) => {
    setSelectedTeacherId(teacherId);
    setIsTeacherEditing(false);
    setIsTeacherModalOpen(true);
  };

  const handleTeacherModalClose = () => {
    setIsTeacherModalOpen(false);
    setSelectedTeacherId(null);
    setIsTeacherEditing(false);
  };

  const handleTeacherUpdated = () => {
    fetchData();
  };

  return (
    <div className="space-y-6">
      {/* Registration Success Modal */}
      {registrationResult && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-md border border-gray-200 shadow-xl max-w-md w-full mx-4 overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-sm bg-school-green-50 border border-school-green-200 flex items-center justify-center text-school-green-700">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-base font-semibold text-gray-900">Registration Successful</h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 p-4 rounded-sm border border-gray-200">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-3">Faculty Portal Credentials</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500">Teacher ID / Staff ID:</label>
                    <div className="bg-white px-3 py-2 rounded-sm border border-gray-300 font-mono font-bold text-gray-900 text-sm mt-1 tabular-nums">
                      {registrationResult.teacher_id}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Temporary Password:</label>
                    <div className="bg-white px-3 py-2 rounded-sm border border-gray-300 font-mono font-bold text-school-green-700 text-sm mt-1">
                      {registrationResult.password}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-amber-50 p-3 rounded-sm border border-amber-200 text-xs text-amber-800 leading-relaxed">
                <strong>Security Note:</strong> The teacher must change this temporary password upon first login.
              </div>
              <div className="flex gap-3 pt-2">
                <PortalButton
                  onClick={() => {
                    navigator.clipboard.writeText(`Teacher ID: ${registrationResult.teacher_id}\nPassword: ${registrationResult.password}`);
                    toast.success('Credentials copied to clipboard');
                  }}
                  variant="primary"
                  className="flex-1 justify-center"
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  Copy Credentials
                </PortalButton>
                <PortalButton
                  onClick={() => setRegistrationResult(null)}
                  variant="secondary"
                  className="flex-1 justify-center"
                >
                  Close
                </PortalButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Teacher Management</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage faculty profiles, course assignments, and credential access</p>
        </div>
        <div className="flex items-center gap-2.5">
          <PortalButton
            onClick={() => setShowBulkUpload(!showBulkUpload)}
            variant="secondary"
            size="sm"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            {showBulkUpload ? 'View Teacher Roster' : 'Bulk Upload'}
          </PortalButton>
          <PortalButton
            onClick={() => setShowForm(true)}
            variant="primary"
            size="sm"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Add Teacher
          </PortalButton>
        </div>
      </div>

      {showBulkUpload ? (
        <TeacherBulkUpload onSuccess={() => { fetchTeachers(); setShowBulkUpload(false); }} />
      ) : (
        <PortalCard>
          {/* Filter Bar */}
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by name, staff ID, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-sm bg-gray-50 border border-gray-300 rounded-sm focus:bg-white focus:outline-none focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600 transition-colors"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <div className="text-xs text-gray-500 font-medium tabular-nums">
              Total Faculty: {filteredTeachers.length}
            </div>
          </div>

          {/* Teacher Roster Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  <th className="py-3 px-4">Staff ID</th>
                  <th className="py-3 px-4">Teacher Name</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Rank / Position</th>
                  <th className="py-3 px-4">Gender</th>
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
                ) : paginatedTeachers.length > 0 ? (
                  paginatedTeachers.map((teacher) => (
                    <tr key={teacher.id} className="hover:bg-gray-50/70 transition-colors group">
                      <td className="py-3 px-4 font-mono text-xs font-semibold text-gray-800 tabular-nums">
                        {teacher.staff_id}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar
                            name={`${teacher.surname} ${teacher.other_names}`}
                            size="sm"
                            status={teacher.is_active ? 'online' : 'offline'}
                          />
                          <div>
                            <div className="font-medium text-gray-900 leading-tight">
                              {teacher.title} {teacher.surname}, {teacher.other_names}
                            </div>
                            {teacher.personal_phone && teacher.personal_phone !== '0000000000' && (
                              <div className="text-[11px] text-gray-400 font-mono tabular-nums">
                                {teacher.personal_phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-700">
                        {teacher.department || '—'}
                      </td>
                      <td className="py-3 px-4 text-xs font-medium text-gray-800">
                        {teacher.position_rank || 'Teacher'}
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-600">
                        {teacher.gender || '—'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium border ${
                          teacher.is_active 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {teacher.is_active ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          {/* View */}
                          <button
                            onClick={() => handleViewTeacherDetails(teacher.id)}
                            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-sm transition-colors"
                            title="View Teacher Dossier"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => handleEditTeacher(teacher)}
                            className="p-1.5 text-gray-500 hover:text-school-green-700 hover:bg-gray-100 rounded-sm transition-colors"
                            title="Edit Faculty Record"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>

                          {/* Assign Subject */}
                          <button
                            onClick={() => handleAssignSubject(teacher)}
                            className="p-1.5 text-gray-500 hover:text-purple-700 hover:bg-gray-100 rounded-sm transition-colors"
                            title="Assign Subjects & Classes"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                          </button>

                          {/* Toggle Active */}
                          {teacher.is_active ? (
                            <button
                              onClick={() => handleDeactivateTeacher(teacher.id)}
                              className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-gray-100 rounded-sm transition-colors"
                              title="Deactivate Teacher"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleReactivateTeacher(teacher.id)}
                              className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-gray-100 rounded-sm transition-colors"
                              title="Reactivate Teacher"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteTeacher(teacher.id)}
                            className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-sm transition-colors"
                            title="Delete Teacher"
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
                        <p className="font-medium text-gray-700">{searchTerm ? 'No teachers match your search query' : 'No teachers registered yet'}</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-gray-100 flex items-center justify-between">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 border border-gray-300 rounded-sm text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Previous
              </button>
              <span className="text-xs text-gray-500 font-medium tabular-nums">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 border border-gray-300 rounded-sm text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </PortalCard>
      )}

      {/* Add Teacher Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-md border border-gray-200 shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
              <div>
                <h2 className="text-base font-bold text-gray-900 tracking-tight">Add New Faculty Member</h2>
                <p className="text-xs text-gray-500 mt-0.5">Register staff credentials and department placement</p>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-sm transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
              <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
                <div className="bg-blue-50/60 border border-blue-200 rounded-sm p-3.5 text-xs text-blue-900 leading-relaxed">
                  <strong>Lite Registration Mode:</strong> Demographic and historical data are synchronized from the primary school management records.
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Staff ID</label>
                    <input
                      type="text"
                      name="staff_id"
                      value={formData.staff_id}
                      onChange={handleInputChange}
                      className="w-full h-11 px-3 bg-white border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600"
                      placeholder="Leave blank to auto-generate"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Salutation / Title</label>
                    <select
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full h-11 px-3 bg-white border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600"
                    >
                      <option value="Mr.">Mr.</option>
                      <option value="Mrs.">Mrs.</option>
                      <option value="Ms.">Ms.</option>
                      <option value="Dr.">Dr.</option>
                      <option value="Prof.">Prof.</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Surname *</label>
                    <input
                      type="text"
                      name="surname"
                      value={formData.surname}
                      onChange={handleInputChange}
                      required
                      className="w-full h-11 px-3 bg-white border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Other Names *</label>
                    <input
                      type="text"
                      name="other_names"
                      value={formData.other_names}
                      onChange={handleInputChange}
                      required
                      className="w-full h-11 px-3 bg-white border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Gender *</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      required
                      className="w-full h-11 px-3 bg-white border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Department *</label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      required
                      className="w-full h-11 px-3 bg-white border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600"
                    >
                      <option value="">Select Department</option>
                      <option value="Mathematics Department">Mathematics Department</option>
                      <option value="Language Department">Language Department</option>
                      <option value="Science Department">Science Department</option>
                      <option value="Social Studies Department">Social Studies Department</option>
                      <option value="Religious Studies Department">Religious Studies Department</option>
                      <option value="Business Studies Department">Business Studies Department</option>
                      <option value="Technical Skills Department">Technical Skills Department</option>
                      <option value="Creative Arts Department">Creative Arts Department</option>
                      <option value="Physical Education Department">Physical Education Department</option>
                      <option value="Computing Department">Computing Department</option>
                      <option value="French Department">French Department</option>
                      <option value="Other Department">Other Department</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Position / Academic Rank</label>
                    <select
                      name="position_rank"
                      value={formData.position_rank}
                      onChange={handleInputChange}
                      className="w-full h-11 px-3 bg-white border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600"
                    >
                      <option value="">Select Position</option>
                      <option value="Teacher">Teacher</option>
                      <option value="Senior Teacher">Senior Teacher</option>
                      <option value="Head of Department">Head of Department</option>
                      <option value="Deputy Principal">Deputy Principal</option>
                      <option value="Principal">Principal</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
                <PortalButton
                  type="button"
                  onClick={() => setShowForm(false)}
                  variant="secondary"
                >
                  Cancel
                </PortalButton>
                <PortalButton
                  type="submit"
                  variant="primary"
                >
                  Register Teacher
                </PortalButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Teacher Modal */}
      {showEditModal && editingTeacher && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-md border border-gray-200 shadow-xl max-w-lg w-full overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-base font-bold text-gray-900">Edit Faculty Profile</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-sm transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
                  <select
                    value={editFormData.title}
                    onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                    className="w-full h-11 px-3 bg-white border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600"
                  >
                    <option value="Mr.">Mr.</option>
                    <option value="Mrs.">Mrs.</option>
                    <option value="Ms.">Ms.</option>
                    <option value="Dr.">Dr.</option>
                    <option value="Prof.">Prof.</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Surname</label>
                  <input
                    type="text"
                    value={editFormData.surname}
                    onChange={(e) => setEditFormData({...editFormData, surname: e.target.value})}
                    className="w-full h-11 px-3 bg-white border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Other Names</label>
                  <input
                    type="text"
                    value={editFormData.other_names}
                    onChange={(e) => setEditFormData({...editFormData, other_names: e.target.value})}
                    className="w-full h-11 px-3 bg-white border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    value={editFormData.gender}
                    onChange={(e) => setEditFormData({...editFormData, gender: e.target.value})}
                    className="w-full h-11 px-3 bg-white border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <PortalInput
                    label="Department *"
                    type="text"
                    value={editFormData.department}
                    onChange={(e) => setEditFormData({...editFormData, department: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <PortalInput
                    label="Position Rank *"
                    type="text"
                    value={editFormData.position_rank}
                    onChange={(e) => setEditFormData({...editFormData, position_rank: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2.5 p-4 border-t border-gray-100 bg-gray-50/50">
                <PortalButton
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  variant="secondary"
                  size="sm"
                >
                  Cancel
                </PortalButton>
                <PortalButton
                  type="submit"
                  variant="primary"
                  size="sm"
                >
                  Save Updates
                </PortalButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subject Assignment Modal */}
      {showSubjectAssignmentModal && selectedTeacherForAssignment && (
        <AssignSubjectToTeacherModal
          teacher={selectedTeacherForAssignment}
          subjects={subjects}
          classes={classes}
          existingAssignments={teacherExistingAssignments}
          isOpen={showSubjectAssignmentModal}
          onClose={() => {
            setShowSubjectAssignmentModal(false);
            setSelectedTeacherForAssignment(null);
            setTeacherExistingAssignments([]);
          }}
          onAssign={async (subjectId: number, classId: number) => {
            try {
              const result = await db.assignSubjectToTeacher(
                selectedTeacherForAssignment.id,
                subjectId,
                classId
              );
              if (result && result.alreadyAssigned) {
                toast('This subject assignment already exists for this teacher and class', { icon: 'ℹ️' });
              } else {
                toast.success('Subject assigned successfully');
              }
              setShowSubjectAssignmentModal(false);
              setSelectedTeacherForAssignment(null);
              fetchData();
            } catch (error) {
              console.error('Failed to assign subject:', error);
              toast.error('Failed to assign subject to teacher');
            }
          }}
          onRemoveAssignment={async (assignmentId: number) => {
            try {
              await db.removeTeacherSubject(assignmentId);
              toast.success('Assignment removed successfully');
              const existing = await db.getTeacherSubjects(selectedTeacherForAssignment!.id);
              setTeacherExistingAssignments(existing);
            } catch (error) {
              console.error('Failed to remove assignment:', error);
              toast.error('Failed to remove assignment');
            }
          }}
        />
      )}

      {/* Teacher Details Modal */}
      {selectedTeacherId && (
        <TeacherDetailsModal
          teacherId={selectedTeacherId}
          isOpen={isTeacherModalOpen}
          onClose={handleTeacherModalClose}
          onTeacherUpdated={handleTeacherUpdated}
          isEditing={isTeacherEditing}
          setIsEditing={setIsTeacherEditing}
        />
      )}
    </div>
  );
}

export default AdminTeacherManagement;
