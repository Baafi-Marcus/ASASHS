import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { db } from '../../../lib/neon';
import { PortalInput } from '../../components/PortalInput';
import { PortalButton } from '../../components/PortalButton';

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

export function TeacherDetailsModal({
  teacherId,
  isOpen,
  onClose,
  onTeacherUpdated,
  isEditing,
  setIsEditing
}: TeacherDetailsModalProps) {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Teacher>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && teacherId) {
      fetchTeacherDetails();
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
      fetchTeacherDetails(); // Refresh the data
    } catch (error: any) {
      console.error('Failed to update teacher:', error);
      toast.error(error.message || 'Failed to update teacher details');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              {isEditing ? 'Edit Teacher Details' : 'Teacher Details'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-school-green-200 border-t-school-green-600"></div>
            </div>
          ) : teacher ? (
            <div>
              {!isEditing ? (
                // View Mode
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-700">Teacher ID</h3>
                      <p>{teacher.teacher_id}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700">Staff ID</h3>
                      <p>{teacher.staff_id}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700">Full Name</h3>
                      <p>{teacher.title} {teacher.surname}, {teacher.other_names}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700">Gender</h3>
                      <p>{teacher.gender}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700">Date of Birth</h3>
                      <p>{teacher.date_of_birth}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700">Department</h3>
                      <p>{teacher.department}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700">Position</h3>
                      <p>{teacher.position_rank}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700">Status</h3>
                      <p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          teacher.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {teacher.is_active ? 'Active' : 'Deactivated'}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold mb-3">Professional Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-700">Employment Date</h4>
                        <p>{teacher.employment_date}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700">Staff Type</h4>
                        <p>{teacher.staff_type}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700">Role</h4>
                        <p>{teacher.role}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-700">Personal Phone</h4>
                        <p>{teacher.personal_phone}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700">Alternative Phone</h4>
                        <p>{teacher.alt_phone || 'N/A'}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700">Personal Email</h4>
                        <p>{teacher.personal_email || 'N/A'}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700">Residential Address</h4>
                        <p>{teacher.residential_address || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold mb-3">Educational Qualifications</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-700">Highest Qualification</h4>
                        <p>{teacher.highest_qualification || 'N/A'}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700">Field of Study</h4>
                        <p>{teacher.field_of_study || 'N/A'}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700">Institution</h4>
                        <p>{teacher.institution || 'N/A'}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700">Year Obtained</h4>
                        <p>{teacher.year_obtained || 'N/A'}</p>
                      </div>
                      <div className="md:col-span-2">
                        <h4 className="font-semibold text-gray-700">Other Qualifications</h4>
                        <p>{teacher.other_qualifications || 'None'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold mb-3">Emergency Contact</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-700">Emergency Contact Name</h4>
                        <p>{teacher.emergency_name || 'N/A'}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700">Relationship</h4>
                        <p>{teacher.emergency_relationship || 'N/A'}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700">Emergency Phone</h4>
                        <p>{teacher.emergency_phone || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
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
                      Edit Details
                    </PortalButton>
                  </div>
                </div>
              ) : (
                // Edit Mode
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <PortalInput
                        label="Teacher ID"
                        type="text"
                        value={formData.teacher_id || ''}
                        onChange={(e) => handleInputChange('teacher_id', e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <PortalInput
                        label="Staff ID"
                        type="text"
                        value={formData.staff_id || ''}
                        onChange={(e) => handleInputChange('staff_id', e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                      <select
                        value={formData.title || ''}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-school-green-500"
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
                    <div>
                      <PortalInput
                        label="Surname *"
                        type="text"
                        value={formData.surname || ''}
                        onChange={(e) => handleInputChange('surname', e.target.value)}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <PortalInput
                        label="Other Names *"
                        type="text"
                        value={formData.other_names || ''}
                        onChange={(e) => handleInputChange('other_names', e.target.value)}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                      <select
                        value={formData.gender || ''}
                        onChange={(e) => handleInputChange('gender', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-school-green-500"
                        required
                        disabled={isSubmitting}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                    <div>
                      <PortalInput
                        label="Date of Birth *"
                        type="date"
                        value={formData.date_of_birth || ''}
                        onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <PortalInput
                        label="Department *"
                        type="text"
                        value={formData.department || ''}
                        onChange={(e) => handleInputChange('department', e.target.value)}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <PortalInput
                        label="Position Rank"
                        type="text"
                        value={formData.position_rank || ''}
                        onChange={(e) => handleInputChange('position_rank', e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <PortalInput
                          label="Personal Phone *"
                          type="tel"
                          value={formData.personal_phone || ''}
                          onChange={(e) => handleInputChange('personal_phone', e.target.value)}
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                      <div>
                        <PortalInput
                          label="Alternative Phone"
                          type="tel"
                          value={formData.alt_phone || ''}
                          onChange={(e) => handleInputChange('alt_phone', e.target.value)}
                          disabled={isSubmitting}
                        />
                      </div>
                      <div>
                        <PortalInput
                          label="Personal Email"
                          type="email"
                          value={formData.personal_email || ''}
                          onChange={(e) => handleInputChange('personal_email', e.target.value)}
                          disabled={isSubmitting}
                        />
                      </div>
                      <div>
                        <PortalInput
                          label="Residential Address"
                          as="textarea"
                          rows={3}
                          value={formData.residential_address || ''}
                          onChange={(e) => handleInputChange('residential_address', e.target.value)}
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold mb-3">Educational Qualifications</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Highest Qualification</label>
                        <select
                          value={formData.highest_qualification || ''}
                          onChange={(e) => handleInputChange('highest_qualification', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-school-green-500"
                          disabled={isSubmitting}
                        >
                          <option value="">Select Qualification</option>
                          <option value="WASSCE">WASSCE</option>
                          <option value="SSSCE">SSSCE</option>
                          <option value="Diploma">Diploma</option>
                          <option value="B.Ed">B.Ed</option>
                          <option value="B.A">B.A</option>
                          <option value="B.Sc">B.Sc</option>
                          <option value="M.Ed">M.Ed</option>
                          <option value="M.A">M.A</option>
                          <option value="M.Sc">M.Sc</option>
                          <option value="PhD">PhD</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <PortalInput
                          label="Field of Study"
                          type="text"
                          value={formData.field_of_study || ''}
                          onChange={(e) => handleInputChange('field_of_study', e.target.value)}
                          disabled={isSubmitting}
                        />
                      </div>
                      <div>
                        <PortalInput
                          label="Institution"
                          type="text"
                          value={formData.institution || ''}
                          onChange={(e) => handleInputChange('institution', e.target.value)}
                          disabled={isSubmitting}
                        />
                      </div>
                      <div>
                        <PortalInput
                          label="Year Obtained"
                          type="number"
                          value={formData.year_obtained || ''}
                          onChange={(e) => handleInputChange('year_obtained', e.target.value)}
                          min="1950"
                          max={new Date().getFullYear()}
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <PortalInput
                          label="Other Qualifications"
                          as="textarea"
                          rows={3}
                          value={formData.other_qualifications || ''}
                          onChange={(e) => handleInputChange('other_qualifications', e.target.value)}
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold mb-3">Emergency Contact</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <PortalInput
                          label="Emergency Contact Name *"
                          type="text"
                          value={formData.emergency_name || ''}
                          onChange={(e) => handleInputChange('emergency_name', e.target.value)}
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                        <select
                          value={formData.emergency_relationship || ''}
                          onChange={(e) => handleInputChange('emergency_relationship', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-school-green-500"
                          disabled={isSubmitting}
                        >
                          <option value="">Select Relationship</option>
                          <option value="Spouse">Spouse</option>
                          <option value="Parent">Parent</option>
                          <option value="Sibling">Sibling</option>
                          <option value="Child">Child</option>
                          <option value="Friend">Friend</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <PortalInput
                          label="Emergency Phone *"
                          type="tel"
                          value={formData.emergency_phone || ''}
                          onChange={(e) => handleInputChange('emergency_phone', e.target.value)}
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
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
                      {isSubmitting ? 'Saving...' : 'Save Changes'}
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