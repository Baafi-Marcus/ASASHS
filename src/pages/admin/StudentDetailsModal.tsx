import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { db } from '../../../lib/neon';
import { PortalInput } from '../../components/PortalInput';
import { PortalButton } from '../../components/PortalButton';

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
  house_preference: string | null;
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
      fetchStudentDetails(); // Refresh the data
    } catch (error: any) {
      console.error('Failed to update student:', error);
      toast.error(error.message || 'Failed to update student details');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              {isEditing ? 'Edit Student Details' : 'Student Details'}
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
          ) : student ? (
            <div>
              {!isEditing ? (
                // View Mode
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-700">Student ID</h3>
                      <p>{student.student_id}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700">Admission Number</h3>
                      <p>{student.admission_number}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700">Full Name</h3>
                      <p>{student.surname}, {student.other_names}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700">Gender</h3>
                      <p>{student.gender}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700">Date of Birth</h3>
                      <p>{student.date_of_birth}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700">Programme</h3>
                      <p>{student.course_name || 'Not assigned'}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700">Class</h3>
                      <p>{student.class_name || 'Not assigned'}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700">Status</h3>
                      <p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          student.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {student.is_active ? 'Active' : 'Deactivated'}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-school-cream-200 pt-4">
                    <h3 className="text-lg font-semibold mb-3 text-gray-900">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-700">Nationality</h4>
                        <p>{student.nationality}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700">Hometown</h4>
                        <p>{student.hometown || 'N/A'}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700">District of Origin</h4>
                        <p>{student.district_of_origin || 'N/A'}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700">Region of Origin</h4>
                        <p>{student.region_of_origin || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-school-cream-200 pt-4">
                    <h3 className="text-lg font-semibold mb-3 text-gray-900">Guardian Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-700">Guardian Name</h4>
                        <p>{student.guardian_name || 'N/A'}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700">Relationship</h4>
                        <p>{student.guardian_relationship || 'N/A'}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700">Phone</h4>
                        <p>{student.guardian_phone || 'N/A'}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700">Alternative Phone</h4>
                        <p>{student.guardian_phone_alt || 'N/A'}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700">Email</h4>
                        <p>{student.guardian_email || 'N/A'}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700">Address</h4>
                        <p>{student.guardian_address || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-school-cream-200 pt-4">
                    <h3 className="text-lg font-semibold mb-3 text-gray-900">Academic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-700">Previous School</h4>
                        <p>{student.previous_school || 'N/A'}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700">Graduation Year</h4>
                        <p>{student.graduation_year || 'N/A'}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700">Enrollment Date</h4>
                        <p>{student.enrollment_date}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700">Residential Status</h4>
                        <p>{student.residential_status || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-school-cream-200 pt-4">
                    <h3 className="text-lg font-semibold mb-3 text-gray-900">Medical Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-700">Known Allergies</h4>
                        <p>{student.known_allergies || 'None'}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700">Chronic Conditions</h4>
                        <p>{student.chronic_conditions || 'None'}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700">Blood Group</h4>
                        <p>{student.blood_group || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Only show edit button if programmes and classes are provided (admin view) */}
                  {(programmes.length > 0 || classes.length > 0) && (
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
                  )}
                  
                  {/* Show close button only if programmes and classes are not provided (teacher view) */}
                  {(programmes.length === 0 && classes.length === 0) && (
                    <div className="flex justify-end space-x-3 pt-4">
                      <PortalButton
                        onClick={onClose}
                        variant="secondary"
                      >
                        Close
                      </PortalButton>
                    </div>
                  )}
                </div>
              ) : (
                // Edit Mode - only shown in admin view
                <form onSubmit={handleSubmit} className="space-y-6">
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                      <select
                        value={formData.gender || ''}
                        onChange={(e) => handleInputChange('gender', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-school-green-500"
                        required
                        disabled={isSubmitting}
                      >
                        <option value="">Select gender</option>
                        <option value="M">Male</option>
                        <option value="F">Female</option>
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Programme</label>
                      <select
                        value={formData.course_id || ''}
                        onChange={(e) => handleInputChange('course_id', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-school-green-500"
                        disabled={isSubmitting}
                      >
                        <option value="">Select programme</option>
                        {programmes.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                      <select
                        value={formData.current_class_id || ''}
                        onChange={(e) => handleInputChange('current_class_id', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-school-green-500"
                        disabled={isSubmitting}
                      >
                        <option value="">Select class</option>
                        {classes.map((c) => (
                          <option key={c.id} value={c.id}>{c.class_name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="border-t border-school-cream-200 pt-4">
                    <h3 className="text-lg font-semibold mb-3 text-gray-900">Personal Information</h3>
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
                      <PortalInput
                        label="District of Origin"
                        type="text"
                        value={formData.district_of_origin || ''}
                        onChange={(e) => handleInputChange('district_of_origin', e.target.value)}
                        disabled={isSubmitting}
                      />
                      <PortalInput
                        label="Region of Origin"
                        type="text"
                        value={formData.region_of_origin || ''}
                        onChange={(e) => handleInputChange('region_of_origin', e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="border-t border-school-cream-200 pt-4">
                    <h3 className="text-lg font-semibold mb-3 text-gray-900">Guardian Information</h3>
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
                        label="Alternative Phone"
                        type="text"
                        value={formData.guardian_phone_alt || ''}
                        onChange={(e) => handleInputChange('guardian_phone_alt', e.target.value)}
                        disabled={isSubmitting}
                      />
                      <PortalInput
                        label="Email"
                        type="email"
                        value={formData.guardian_email || ''}
                        onChange={(e) => handleInputChange('guardian_email', e.target.value)}
                        disabled={isSubmitting}
                      />
                      <div className="md:col-span-2">
                        <PortalInput
                          label="Address"
                          as="textarea"
                          rows={3}
                          value={formData.guardian_address || ''}
                          onChange={(e) => handleInputChange('guardian_address', e.target.value)}
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-school-cream-200 pt-4">
                    <h3 className="text-lg font-semibold mb-3 text-gray-900">Academic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <PortalInput
                        label="Previous School"
                        type="text"
                        value={formData.previous_school || ''}
                        onChange={(e) => handleInputChange('previous_school', e.target.value)}
                        disabled={isSubmitting}
                      />
                      <PortalInput
                        label="Graduation Year"
                        type="number"
                        value={formData.graduation_year || ''}
                        onChange={(e) => handleInputChange('graduation_year', parseInt(e.target.value))}
                        disabled={isSubmitting}
                      />
                      <PortalInput
                        label="Enrollment Date"
                        type="date"
                        value={formData.enrollment_date || ''}
                        onChange={(e) => handleInputChange('enrollment_date', e.target.value)}
                        disabled={isSubmitting}
                      />
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Residential Status</label>
                        <select
                          value={formData.residential_status || ''}
                          onChange={(e) => handleInputChange('residential_status', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-school-green-500"
                          disabled={isSubmitting}
                        >
                          <option value="">Select status</option>
                          <option value="Day Student">Day Student</option>
                          <option value="Boarding Student">Boarding Student</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-school-cream-200 pt-4">
                    <h3 className="text-lg font-semibold mb-3 text-gray-900">Medical Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <PortalInput
                        label="Known Allergies"
                        type="text"
                        value={formData.known_allergies || ''}
                        onChange={(e) => handleInputChange('known_allergies', e.target.value)}
                        disabled={isSubmitting}
                      />
                      <PortalInput
                        label="Chronic Conditions"
                        type="text"
                        value={formData.chronic_conditions || ''}
                        onChange={(e) => handleInputChange('chronic_conditions', e.target.value)}
                        disabled={isSubmitting}
                      />
                      <PortalInput
                        label="Blood Group"
                        type="text"
                        value={formData.blood_group || ''}
                        onChange={(e) => handleInputChange('blood_group', e.target.value)}
                        disabled={isSubmitting}
                      />
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
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                          Saving...
                        </>
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