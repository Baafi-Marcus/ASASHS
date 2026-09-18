import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { db } from '../../../lib/neon';
import { PortalInput } from '../../components/PortalInput';
import { PortalButton } from '../../components/PortalButton';
import { UserAvatar } from '../../components/UserAvatar';

interface Student {
  id: number;
  student_id: string;
  admission_number: string;
  surname: string;
  other_names: string;
  gender: string;
  date_of_birth: string;
  nationality: string;
  hometown: string;
  district_of_origin: string;
  region_of_origin: string;
  guardian_name: string;
  guardian_relationship: string;
  guardian_phone: string;
  guardian_phone_alt: string | null;
  guardian_email: string | null;
  guardian_address: string;
  previous_school: string;
  graduation_year: number;
  known_allergies: string;
  chronic_conditions: string;
  blood_group: string | null;
  enrollment_date: string;
  residential_status: string;
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

interface StudentDetailsModalProps {
  studentId: number;
  isOpen: boolean;
  onClose: () => void;
  onStudentUpdated: () => void;
  programmes: Programme[];
  classes: ClassItem[];
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
}

export function StudentDetailsModal({
  studentId,
  isOpen,
  onClose,
  onStudentUpdated,
  programmes,
  classes,
  isEditing,
  setIsEditing
}: StudentDetailsModalProps) {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Student>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && studentId) {
      fetchStudentDetails();
    }
  }, [isOpen, studentId]);

  useEffect(() => {
    if (student) {
      setFormData(student);
    }
  }, [student]);

  const fetchStudentDetails = async () => {
    setLoading(true);
    try {
      const studentData = await db.getStudentById(studentId);
      setStudent(studentData);
      setFormData(studentData);
    } catch (error) {
      console.error('Failed to fetch student details:', error);
      toast.error('Failed to load student details');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof Student, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await db.updateStudent(studentId, formData);
      toast.success('Student details updated successfully');
      setIsEditing(false);
      onStudentUpdated();
      fetchStudentDetails();
    } catch (error: any) {
      console.error('Failed to update student:', error);
      toast.error(error.message || 'Failed to update student details');
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
              {isEditing ? 'Edit Student Details' : 'Student Dossier'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Comprehensive institutional academic profile</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-sm transition-colors"
            aria-label="Close dialog"
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
          ) : student ? (
            <div>
              {!isEditing ? (
                // View Mode
                <div className="space-y-6">
                  {/* Hero Identity Strip */}
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-sm border border-gray-200">
                    <UserAvatar
                      name={`${student.surname} ${student.other_names}`}
                      size="lg"
                      status={student.is_active ? 'online' : 'offline'}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-gray-900 leading-snug">
                          {student.surname}, {student.other_names}
                        </h3>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium border ${
                          student.is_active 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {student.is_active ? 'Active' : 'Deactivated'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-1 flex-wrap">
                        <span>ID: <strong className="font-mono text-gray-800 tabular-nums">{student.student_id}</strong></span>
                        {student.admission_number && (
                          <span>Adm: <strong className="font-mono text-gray-800 tabular-nums">{student.admission_number}</strong></span>
                        )}
                        <span>Class: <strong className="text-gray-800">{student.class_name || 'Unassigned'}</strong></span>
                        <span>Gender: <strong className="text-gray-800">{student.gender || '—'}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Academic & Class Overview */}
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Academic Placement</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3.5 rounded-sm border border-gray-200 text-xs">
                      <div>
                        <span className="text-gray-500 block">Programme</span>
                        <span className="font-medium text-gray-900 mt-0.5 block">{student.course_name || 'Not assigned'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Class</span>
                        <span className="font-medium text-gray-900 mt-0.5 block">{student.class_name || 'Not assigned'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Residential Status</span>
                        <span className="font-medium text-gray-900 mt-0.5 block">{student.residential_status || 'Day Student'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Enrollment Date</span>
                        <span className="font-mono text-gray-900 mt-0.5 block tabular-nums">{student.enrollment_date || '—'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Personal Demographics */}
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Personal Information</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3.5 rounded-sm border border-gray-200 text-xs">
                      <div>
                        <span className="text-gray-500 block">Date of Birth</span>
                        <span className="font-mono text-gray-900 mt-0.5 block tabular-nums">{student.date_of_birth || '—'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Nationality</span>
                        <span className="font-medium text-gray-900 mt-0.5 block">{student.nationality || 'Ghanaian'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Hometown</span>
                        <span className="font-medium text-gray-900 mt-0.5 block">{student.hometown || '—'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Region / District</span>
                        <span className="font-medium text-gray-900 mt-0.5 block">{student.region_of_origin || '—'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Guardian & Contact */}
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Guardian Information</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3.5 rounded-sm border border-gray-200 text-xs">
                      <div>
                        <span className="text-gray-500 block">Guardian Name</span>
                        <span className="font-medium text-gray-900 mt-0.5 block">{student.guardian_name || '—'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Relationship</span>
                        <span className="font-medium text-gray-900 mt-0.5 block">{student.guardian_relationship || '—'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Primary Phone</span>
                        <span className="font-mono text-gray-900 mt-0.5 block tabular-nums">{student.guardian_phone || '—'}</span>
                      </div>
                      {student.guardian_email && (
                        <div className="sm:col-span-2">
                          <span className="text-gray-500 block">Email Address</span>
                          <span className="text-gray-900 mt-0.5 block">{student.guardian_email}</span>
                        </div>
                      )}
                      {student.guardian_address && (
                        <div className="sm:col-span-3">
                          <span className="text-gray-500 block">Residential Address</span>
                          <span className="text-gray-900 mt-0.5 block">{student.guardian_address}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Medical Details */}
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Medical Summary</h4>
                    <div className="grid grid-cols-3 gap-3 bg-white p-3.5 rounded-sm border border-gray-200 text-xs">
                      <div>
                        <span className="text-gray-500 block">Blood Group</span>
                        <span className="font-mono text-gray-900 mt-0.5 block">{student.blood_group || '—'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Known Allergies</span>
                        <span className="font-medium text-gray-900 mt-0.5 block">{student.known_allergies || 'None'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Chronic Conditions</span>
                        <span className="font-medium text-gray-900 mt-0.5 block">{student.chronic_conditions || 'None'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-100">
                    <PortalButton
                      onClick={onClose}
                      variant="secondary"
                    >
                      Close
                    </PortalButton>

                    {(programmes.length > 0 || classes.length > 0) && (
                      <>
                        <PortalButton
                          onClick={() => {
                            const creds = prompt('Enter new password for student (leave empty to generate):');
                            if (creds === null) return;
                            const reset = async () => {
                              try {
                                const result = await db.resetStudentPassword(studentId);
                                const password = creds || result.password;
                                alert(`Student ID: ${student.student_id}\nPassword: ${password}\n\nSave these credentials. The student must change password on first login.`);
                                toast.success('Password reset successfully');
                              } catch (e) {
                                toast.error('Failed to reset password');
                              }
                            };
                            reset();
                          }}
                          variant="secondary"
                        >
                          <svg className="w-4 h-4 mr-1 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                          </svg>
                          Reset Password
                        </PortalButton>
                        <PortalButton
                          onClick={() => setIsEditing(true)}
                          variant="primary"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit Profile
                        </PortalButton>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                // Edit Mode
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <PortalInput
                      label="Student ID"
                      type="text"
                      value={formData.student_id || ''}
                      onChange={(e) => handleInputChange('student_id', e.target.value)}
                      disabled={isSubmitting}
                    />
                    <PortalInput
                      label="Admission Number"
                      type="text"
                      value={formData.admission_number || ''}
                      onChange={(e) => handleInputChange('admission_number', e.target.value)}
                      disabled={isSubmitting}
                    />
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
                        <option value="">Select gender</option>
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
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Programme</label>
                      <select
                        value={formData.course_id || ''}
                        onChange={(e) => handleInputChange('course_id', parseInt(e.target.value))}
                        className="w-full h-11 px-3 bg-white border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600"
                        disabled={isSubmitting}
                      >
                        <option value="">Select programme</option>
                        {programmes.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Class</label>
                      <select
                        value={formData.current_class_id || ''}
                        onChange={(e) => handleInputChange('current_class_id', parseInt(e.target.value))}
                        className="w-full h-11 px-3 bg-white border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600"
                        disabled={isSubmitting}
                      >
                        <option value="">Select class</option>
                        {classes.map((c) => (
                          <option key={c.id} value={c.id}>{c.class_name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Personal Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <PortalInput
                        label="Nationality"
                        type="text"
                        value={formData.nationality || ''}
                        onChange={(e) => handleInputChange('nationality', e.target.value)}
                        disabled={isSubmitting}
                      />
                      <PortalInput
                        label="Hometown"
                        type="text"
                        value={formData.hometown || ''}
                        onChange={(e) => handleInputChange('hometown', e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Guardian Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <PortalInput
                        label="Guardian Name"
                        type="text"
                        value={formData.guardian_name || ''}
                        onChange={(e) => handleInputChange('guardian_name', e.target.value)}
                        disabled={isSubmitting}
                      />
                      <PortalInput
                        label="Relationship"
                        type="text"
                        value={formData.guardian_relationship || ''}
                        onChange={(e) => handleInputChange('guardian_relationship', e.target.value)}
                        disabled={isSubmitting}
                      />
                      <PortalInput
                        label="Phone"
                        type="text"
                        value={formData.guardian_phone || ''}
                        onChange={(e) => handleInputChange('guardian_phone', e.target.value)}
                        disabled={isSubmitting}
                      />
                      <PortalInput
                        label="Email"
                        type="email"
                        value={formData.guardian_email || ''}
                        onChange={(e) => handleInputChange('guardian_email', e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
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