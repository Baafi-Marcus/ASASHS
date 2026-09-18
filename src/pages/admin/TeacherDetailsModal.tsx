import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { db } from '../../../lib/neon';
import { PortalInput } from '../../components/PortalInput';
import { PortalButton } from '../../components/PortalButton';
import { UserAvatar } from '../../components/UserAvatar';

interface Teacher {
  id: number;
  teacher_id: string;
  staff_id: string;
  title: string;
  surname: string;
  other_names: string;
  date_of_birth: string;
  gender: string;
  nationality: string;
  ghana_card_id: string;
  employment_date: string;
  department: string;
  position_rank: string;
  staff_type: string;
  personal_phone: string;
  alt_phone: string;
  personal_email: string;
  residential_address: string;
  highest_qualification: string;
  field_of_study: string;
  institution: string;
  year_obtained: string;
  other_qualifications: string;
  role: string;
  emergency_name: string;
  emergency_relationship: string;
  emergency_phone: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface TeacherDetailsModalProps {
  teacherId: number;
  isOpen: boolean;
  onClose: () => void;
  onTeacherUpdated: () => void;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
}

interface TeacherSubjectAssignment {
  id: number;
  subject_name: string;
  class_name: string;
  form: number;
  stream: string;
}

export function TeacherDetailsModal({
  teacherId,
  isOpen,
  onClose,
  onTeacherUpdated,
  isEditing,
  setIsEditing
}: TeacherDetailsModalProps) {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [assignments, setAssignments] = useState<TeacherSubjectAssignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Teacher>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && teacherId) {
      fetchTeacherDetails();
      fetchTeacherAssignments();
    }
  }, [isOpen, teacherId]);

  useEffect(() => {
    if (teacher) {
      setFormData(teacher);
    }
  }, [teacher]);

  const fetchTeacherDetails = async () => {
    setLoading(true);
    try {
      const teacherData = await db.getTeacherById(teacherId);
      setTeacher(teacherData);
      setFormData(teacherData);
    } catch (error) {
      console.error('Failed to fetch teacher details:', error);
      toast.error('Failed to load teacher details');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const fetchTeacherAssignments = async () => {
    try {
      const result = await db.getTeacherSubjects(teacherId);
      setAssignments(result);
    } catch (error) {
      console.error('Failed to fetch teacher assignments:', error);
      setAssignments([]);
    }
  };

  const handleInputChange = (field: keyof Teacher, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await db.updateTeacher(teacherId, formData);
      toast.success('Teacher details updated successfully');
      setIsEditing(false);
      onTeacherUpdated();
      fetchTeacherDetails();
    } catch (error: any) {
      console.error('Failed to update teacher:', error);
      toast.error(error.message || 'Failed to update teacher details');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-md border border-gray-200 shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 className="text-base font-bold text-gray-900 tracking-tight">
              {isEditing ? 'Edit Faculty Record' : 'Teacher Dossier'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Faculty credentials, department, and class assignments</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-sm transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {loading ? (
            <div className="flex justify-center items-center h-56">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-school-green-200 border-t-school-green-600"></div>
            </div>
          ) : teacher ? (
            <div>
              {!isEditing ? (
                // View Mode
                <div className="space-y-6">
                  {/* Hero Identity Strip */}
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-sm border border-gray-200">
                    <UserAvatar
                      name={`${teacher.surname} ${teacher.other_names}`}
                      size="lg"
                      status={teacher.is_active ? 'online' : 'offline'}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-gray-900 leading-snug">
                          {teacher.title} {teacher.surname}, {teacher.other_names}
                        </h3>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium border ${
                          teacher.is_active 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {teacher.is_active ? 'Active' : 'Deactivated'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-1 flex-wrap">
                        <span>Teacher ID: <strong className="font-mono text-gray-800 tabular-nums">{teacher.teacher_id}</strong></span>
                        <span>Staff ID: <strong className="font-mono text-gray-800 tabular-nums">{teacher.staff_id}</strong></span>
                        <span>Dept: <strong className="text-gray-800">{teacher.department || '—'}</strong></span>
                        <span>Position: <strong className="text-gray-800">{teacher.position_rank || 'Teacher'}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Professional Placement */}
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Professional Record</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3.5 rounded-sm border border-gray-200 text-xs">
                      <div>
                        <span className="text-gray-500 block">Employment Date</span>
                        <span className="font-mono text-gray-900 mt-0.5 block tabular-nums">{teacher.employment_date || '—'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Staff Classification</span>
                        <span className="font-medium text-gray-900 mt-0.5 block">{teacher.staff_type || 'Permanent'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">System Role</span>
                        <span className="font-medium text-gray-900 mt-0.5 block">{teacher.role || 'Teacher'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Gender</span>
                        <span className="font-medium text-gray-900 mt-0.5 block">{teacher.gender || '—'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Contact Information</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3.5 rounded-sm border border-gray-200 text-xs">
                      <div>
                        <span className="text-gray-500 block">Primary Phone</span>
                        <span className="font-mono text-gray-900 mt-0.5 block tabular-nums">{teacher.personal_phone || '—'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Alternative Phone</span>
                        <span className="font-mono text-gray-900 mt-0.5 block tabular-nums">{teacher.alt_phone || '—'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Email Address</span>
                        <span className="text-gray-900 mt-0.5 block">{teacher.personal_email || '—'}</span>
                      </div>
                      {teacher.residential_address && (
                        <div className="sm:col-span-3">
                          <span className="text-gray-500 block">Residential Address</span>
                          <span className="text-gray-900 mt-0.5 block">{teacher.residential_address}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Educational Qualifications */}
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Educational Qualifications</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3.5 rounded-sm border border-gray-200 text-xs">
                      <div>
                        <span className="text-gray-500 block">Highest Qualification</span>
                        <span className="font-medium text-gray-900 mt-0.5 block">{teacher.highest_qualification || '—'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Field of Study</span>
                        <span className="font-medium text-gray-900 mt-0.5 block">{teacher.field_of_study || '—'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Awarding Institution</span>
                        <span className="font-medium text-gray-900 mt-0.5 block">{teacher.institution || '—'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Year Obtained</span>
                        <span className="font-mono text-gray-900 mt-0.5 block tabular-nums">{teacher.year_obtained || '—'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Emergency Contact</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3.5 rounded-sm border border-gray-200 text-xs">
                      <div>
                        <span className="text-gray-500 block">Contact Name</span>
                        <span className="font-medium text-gray-900 mt-0.5 block">{teacher.emergency_name || '—'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Relationship</span>
                        <span className="font-medium text-gray-900 mt-0.5 block">{teacher.emergency_relationship || '—'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Emergency Phone</span>
                        <span className="font-mono text-gray-900 mt-0.5 block tabular-nums">{teacher.emergency_phone || '—'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Assigned Subjects & Classes */}
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Active Teaching Assignments</h4>
                    {assignments.length > 0 ? (
                      <div className="space-y-2">
                        {assignments.map((a) => (
                          <div key={a.id} className="flex items-center justify-between p-2.5 bg-gray-50 border border-gray-200 rounded-sm text-xs">
                            <div className="flex items-center gap-2 font-medium text-gray-900">
                              <span>{a.subject_name}</span>
                              <span className="text-gray-400">→</span>
                              <span className="text-school-green-700 font-semibold">{a.class_name} (Form {a.form}{a.stream ? ` ${a.stream}` : ''})</span>
                            </div>
                            <span className="text-[11px] font-mono text-gray-400">Assignment ID #{a.id}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center bg-gray-50 border border-dashed border-gray-200 rounded-sm text-xs text-gray-400">
                        No subject assignments recorded for this teacher.
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-100">
                    <PortalButton
                      onClick={onClose}
                      variant="secondary"
                    >
                      Close
                    </PortalButton>
                    <PortalButton
                      onClick={() => setIsEditing(true)}
                      variant="primary"
                    >
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit Profile
                    </PortalButton>
                  </div>
                </div>
              ) : (
                // Edit Mode
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <PortalInput
                      label="Teacher ID"
                      type="text"
                      value={formData.teacher_id || ''}
                      onChange={(e) => handleInputChange('teacher_id', e.target.value)}
                      disabled={true}
                    />
                    <PortalInput
                      label="Staff ID"
                      type="text"
                      value={formData.staff_id || ''}
                      onChange={(e) => handleInputChange('staff_id', e.target.value)}
                      disabled={true}
                    />
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Title *</label>
                      <select
                        value={formData.title || ''}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className="w-full h-11 px-3 bg-white border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600"
                        required
                        disabled={isSubmitting}
                      >
                        <option value="Mr.">Mr.</option>
                        <option value="Mrs.">Mrs.</option>
                        <option value="Ms.">Ms.</option>
                        <option value="Dr.">Dr.</option>
                        <option value="Prof.">Prof.</option>
                      </select>
                    </div>
                    <PortalInput
                      label="Surname *"
                      type="text"
                      value={formData.surname || ''}
                      onChange={(e) => handleInputChange('surname', e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                    <PortalInput
                      label="Other Names *"
                      type="text"
                      value={formData.other_names || ''}
                      onChange={(e) => handleInputChange('other_names', e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Gender *</label>
                      <select
                        value={formData.gender || ''}
                        onChange={(e) => handleInputChange('gender', e.target.value)}
                        className="w-full h-11 px-3 bg-white border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600"
                        required
                        disabled={isSubmitting}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                    <PortalInput
                      label="Date of Birth *"
                      type="date"
                      value={formData.date_of_birth || ''}
                      onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                    <PortalInput
                      label="Department *"
                      type="text"
                      value={formData.department || ''}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                    <PortalInput
                      label="Position Rank"
                      type="text"
                      value={formData.position_rank || ''}
                      onChange={(e) => handleInputChange('position_rank', e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Contact Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <PortalInput
                        label="Personal Phone *"
                        type="tel"
                        value={formData.personal_phone || ''}
                        onChange={(e) => handleInputChange('personal_phone', e.target.value)}
                        required
                        disabled={isSubmitting}
                      />
                      <PortalInput
                        label="Alternative Phone"
                        type="tel"
                        value={formData.alt_phone || ''}
                        onChange={(e) => handleInputChange('alt_phone', e.target.value)}
                        disabled={isSubmitting}
                      />
                      <div className="md:col-span-2">
                        <PortalInput
                          label="Personal Email"
                          type="email"
                          value={formData.personal_email || ''}
                          onChange={(e) => handleInputChange('personal_email', e.target.value)}
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-100">
                    <PortalButton
                      type="button"
                      onClick={() => setIsEditing(false)}
                      variant="secondary"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </PortalButton>
                    <PortalButton
                      type="submit"
                      disabled={isSubmitting}
                      variant="primary"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          Saving...
                        </span>
                      ) : (
                        'Save Changes'
                      )}
                    </PortalButton>
                  </div>
                </form>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}