import React, { useEffect, useState, useMemo, useContext } from 'react';
import { db } from '../../../lib/neon';
import toast from 'react-hot-toast';
import { AuthContext } from '../../../AuthContext';
import { AssignSubjectToTeacherModal } from '../../components/AssignSubjectToTeacherModal';
import { TeacherDetailsModal } from './TeacherDetailsModal';
import { PortalButton } from '../../components/PortalButton';
import { PortalInput } from '../../components/PortalInput';
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
  // Add more fields as needed for editing
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

// Interface for the teacher creation result
interface TeacherRegistrationResult {
  id: number;
  teacher_id: string;
  password: string;
  [key: string]: any; // Allow other properties from the database result
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
  const [searchTerm, setSearchTerm] = useState(''); // Add search term state
  const [page, setPage] = useState(1);
  const pageSize = 10;

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
  
  // Add state for subject assignment
  const [showSubjectAssignmentModal, setShowSubjectAssignmentModal] = useState(false);
  const [selectedTeacherForAssignment, setSelectedTeacherForAssignment] = useState<Teacher | null>(null);
  const [teacherExistingAssignments, setTeacherExistingAssignments] = useState<any[]>([]);

  // Add state for teacher details modal
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [isTeacherEditing, setIsTeacherEditing] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  // Multi-step form state (similar to student registration)
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    staff_id: '',
    title: 'Mr.',
    surname: '',
    other_names: '',
    gender: 'Male',
    department: '',
    position_rank: '',
  });

  // State for editing form data
  const [editFormData, setEditFormData] = useState({
    title: 'Mr.',
    surname: '',
    other_names: '',
    gender: 'Male',
    department: '',
    position_rank: '',
  });
  const totalSteps = 1; // Simplified to 1 step since it's a Lite Registration

  useEffect(() => {
    fetchTeachers();
    fetchSubjectsAndClasses();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      // Fetch teachers with search term if provided, including inactive teachers
      const teachersData = await db.getTeachers({ 
        limit: 100,
        search: searchTerm || undefined,
        includeInactive: true // Include inactive teachers so they still show in the list
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
      const subjectsData = await db.getSubjects();
      setSubjects(subjectsData as Subject[]);
      
      const classesData = await db.getClasses();
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
        toast.success('Teacher registered successfully!');
      } else {
        toast.success('Teacher registered successfully!');
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


  const renderStepContent = () => {
    return (
      <div className="space-y-6">
        <div className="bg-blue-50 p-4 rounded-xl mb-6">
          <h3 className="text-blue-800 font-bold mb-1">Lite Registration Mode</h3>
          <p className="text-blue-600 text-sm">Detailed records are maintained in the main SMS. Please provide the essential details for portal access.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Staff ID</label>
            <input type="text" name="staff_id" value={formData.staff_id} onChange={handleInputChange} className="w-full px-4 py-3 border border-school-cream-300 rounded-lg focus:ring-2 focus:ring-school-green-500" placeholder="Leave empty to auto-generate" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <select name="title" value={formData.title} onChange={handleInputChange} className="w-full px-4 py-3 border border-school-cream-300 rounded-lg focus:ring-2 focus:ring-school-green-500">
              <option value="Mr.">Mr.</option><option value="Mrs.">Mrs.</option><option value="Ms.">Ms.</option><option value="Dr.">Dr.</option><option value="Prof.">Prof.</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Surname *</label>
            <input type="text" name="surname" value={formData.surname} onChange={handleInputChange} required className="w-full px-4 py-3 border border-school-cream-300 rounded-lg focus:ring-2 focus:ring-school-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Other Names *</label>
            <input type="text" name="other_names" value={formData.other_names} onChange={handleInputChange} required className="w-full px-4 py-3 border border-school-cream-300 rounded-lg focus:ring-2 focus:ring-school-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
            <select name="gender" value={formData.gender} onChange={handleInputChange} required className="w-full px-4 py-3 border border-school-cream-300 rounded-lg focus:ring-2 focus:ring-school-green-500">
              <option value="Male">Male</option><option value="Female">Female</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
            <select name="department" value={formData.department} onChange={handleInputChange} required className="w-full px-4 py-3 border border-school-cream-300 rounded-lg focus:ring-2 focus:ring-school-green-500">
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Position/Rank</label>
            <select name="position_rank" value={formData.position_rank} onChange={handleInputChange} className="w-full px-4 py-3 border border-school-cream-300 rounded-lg focus:ring-2 focus:ring-school-green-500">
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
    );
  };
  const renderStepButtons = () => {
    return (
      <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-100">
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="px-6 py-3 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-3 rounded-lg font-bold bg-school-green-600 text-white hover:bg-school-green-700 shadow-sm"
        >
          Register Teacher
        </button>
      </div>
    );
  };

  const handleDeleteTeacher = async (teacherId: number) => {
    if (window.confirm('Are you sure you want to permanently delete this teacher? This action cannot be undone and all teacher data will be removed from the system.')) {
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
        fetchData(); // Refresh the teacher list
      } catch (error) {
        console.error('Failed to deactivate teacher:', error);
        toast.error('Failed to deactivate teacher: ' + (error as Error).message);
      }
    }
  };

  const handleReactivateTeacher = async (teacherId: number) => {
    if (window.confirm('Are you sure you want to reactivate this teacher? The teacher will be able to log in again.')) {
      try {
        await db.reactivateTeacher(teacherId);
        toast.success('Teacher reactivated successfully');
        fetchData(); // Refresh the teacher list
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
    } as any);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingTeacher) return;
    
    try {
      // Update teacher information in the database
      await db.updateTeacher(editingTeacher.id, editFormData);
      toast.success('Teacher information updated successfully');
      setShowEditModal(false);
      fetchData(); // Refresh the teacher list
    } catch (error) {
      console.error('Failed to update teacher:', error);
      toast.error('Failed to update teacher: ' + (error as Error).message);
    }
  };

  const handleAssignSubject = async (teacher: Teacher) => {
    // Fetch updated subjects and classes before opening the modal
    await fetchSubjectsAndClasses();
    // Fetch existing assignments for this teacher
    try {
      const existing = await db.getTeacherSubjects(teacher.id);
      setTeacherExistingAssignments(existing);
    } catch {
      setTeacherExistingAssignments([]);
    }
    setSelectedTeacherForAssignment(teacher);
    setShowSubjectAssignmentModal(true);
  };

  const handleSubjectAssignment = async (assignment: any) => {
    if (!selectedTeacherForAssignment) return;
    
    try {
      await db.assignSubjectToTeacher(
        selectedTeacherForAssignment.id,
        parseInt(assignment.subjectId),
        parseInt(assignment.classId)
      );
      
      toast.success('Subject assigned to teacher successfully!');
      setShowSubjectAssignmentModal(false);
      setSelectedTeacherForAssignment(null);
    } catch (error) {
      console.error('Failed to assign subject:', error);
      toast.error('Failed to assign subject to teacher');
    }
  };

  const fetchData = () => {
    fetchTeachers();
    fetchSubjectsAndClasses();
  };

  // Handle search submission
  const handleResetSearch = () => {
    setSearchTerm('');
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
    fetchData(); // Refresh the teacher list
  };

  if (showForm || registrationResult) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        {registrationResult ? (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border-2 border-school-green-200">
              <div className="text-center mb-6">
                <div className="bg-school-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl">🎉</span>
                </div>
                <h2 className="text-2xl font-bold text-school-green-800 mb-2">Registration Successful!</h2>
                <p className="text-gray-600">Teacher has been registered successfully</p>
              </div>

              <div className="space-y-4">
                <div className="bg-school-cream-50 p-4 rounded-lg border border-school-cream-300">
                  <h3 className="font-semibold text-gray-800 mb-3">Login Credentials</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Teacher ID:</label>
                      <div className="bg-white p-3 rounded border border-school-cream-300 font-mono font-bold text-school-green-700">
                        {registrationResult.teacher_id}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Temporary Password:</label>
                      <div className="bg-white p-3 rounded border border-school-cream-300 font-mono font-bold text-school-green-700">
                        {registrationResult.password}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <p className="text-sm text-amber-800">
                    <strong>Important:</strong> The teacher must change this password on first login.
                    Please share these credentials securely with the teacher.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`Teacher ID: ${registrationResult.teacher_id}\nPassword: ${registrationResult.password}`);
                    toast.success('Credentials copied to clipboard!');
                  }}
                  className="flex-1 bg-school-green-600 text-white py-3 px-4 rounded-lg hover:bg-school-green-700 transition-colors font-medium"
                >
                  Copy Credentials
                </button>
                <button
                  onClick={() => setRegistrationResult(null)}
                  className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-school-green-700 px-6 py-4">
              <h1 className="text-2xl font-bold text-white">Teacher Registration</h1>
              <p className="text-school-green-100 mt-1">Register a new teacher in the system</p>
            </div>
            
            <div className="p-6">
              
              <form onSubmit={handleSubmit}>
                {renderStepContent()}
                {renderStepButtons()}
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Registration Success Modal */}
      {registrationResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-school-green-700 px-4 py-3 rounded-t-2xl">
              <h2 className="text-lg font-bold text-white">Registration Successful!</h2>
            </div>
            <div className="p-6">
              <div className="text-center">
                <div className="text-5xl mb-4">✅</div>
                <p className="text-gray-700 mb-2">Teacher has been registered successfully.</p>
                <div className="bg-school-cream-100 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-600">Staff ID: <span className="font-mono font-bold">{(registrationResult as any)?.teacher_id || ''}</span></p>
                  <p className="text-sm text-gray-600">Temporary Password: <span className="font-mono font-bold">{(registrationResult as any)?.password || ''}</span></p>
                </div>
                <p className="text-sm text-gray-500">
                  Please provide these credentials to the teacher. They will be required to change their password on first login.
                </p>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200">
              <PortalButton
                onClick={() => setRegistrationResult(null)}
                variant="primary"
                className="w-full"
              >
                Close
              </PortalButton>
            </div>
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
                toast('This assignment already exists', { icon: 'ℹ️' });
              } else {
                toast.success('Subject assigned to teacher successfully!');
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
              // Refresh existing assignments
              const existing = await db.getTeacherSubjects(selectedTeacherForAssignment!.id);
              setTeacherExistingAssignments(existing);
            } catch (error) {
              console.error('Failed to remove assignment:', error);
              toast.error('Failed to remove assignment');
            }
          }}
        />
      )}

      {/* Edit Teacher Modal */}
      {showEditModal && editingTeacher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-school-green-700 px-4 py-3 rounded-t-2xl">
              <h2 className="text-lg font-bold text-white">Edit Teacher</h2>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <select value={editFormData.title} onChange={(e) => setEditFormData({...editFormData, title: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="Mr.">Mr.</option><option value="Mrs.">Mrs.</option><option value="Ms.">Ms.</option><option value="Dr.">Dr.</option><option value="Prof.">Prof.</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Surname</label>
                  <input type="text" value={editFormData.surname} onChange={(e) => setEditFormData({...editFormData, surname: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Other Names</label>
                  <input type="text" value={editFormData.other_names} onChange={(e) => setEditFormData({...editFormData, other_names: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select value={editFormData.gender} onChange={(e) => setEditFormData({...editFormData, gender: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="Male">Male</option><option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <PortalInput
                    label="Department *"
                    type="text"
                    value={editFormData.department}
                    onChange={(e) => setEditFormData({...editFormData, department: e.target.value})}
                    required
                    placeholder="Enter department"
                  />
                </div>
                <div>
                  <PortalInput
                    label="Position Rank *"
                    type="text"
                    value={editFormData.position_rank}
                    onChange={(e) => setEditFormData({...editFormData, position_rank: e.target.value})}
                    required
                    placeholder="Enter position rank"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 p-4 border-t border-gray-200">
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
                  Update Teacher
                </PortalButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Teacher Management</h2>
          <p className="text-gray-600">Manage teacher information and employment</p>
        </div>
        <div className="flex gap-2">
          <PortalButton
            onClick={() => setShowBulkUpload(true)}
            variant="secondary"
          >
            <span>📤</span>
            <span>Bulk Upload</span>
          </PortalButton>
          <PortalButton
            onClick={() => setShowForm(true)}
            variant="primary"
          >
            <span>➕</span>
            <span>Add Teacher</span>
          </PortalButton>
        </div>
      </div>

      {showBulkUpload ? (
        <TeacherBulkUpload onSuccess={() => { fetchTeachers(); setShowBulkUpload(false); }} />
      ) : (
      <>
      {/* Search */}
      <div className="bg-white rounded-2xl shadow-xl border-2 border-school-cream-200 p-6">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input
            type="text"
            placeholder="Search by name, staff ID, department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 border rounded-xl text-sm w-full focus:ring-2 focus:ring-school-green-500 focus:border-school-green-500"
          />
          {searchTerm && (
            <button onClick={handleResetSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
        </div>
      </div>

      {/* Teachers List */}
      <div className="bg-white rounded-2xl shadow-xl border-2 border-school-cream-200 overflow-hidden">
        <div className="bg-school-green-600 text-white p-6 flex justify-between items-center">
          <h3 className="text-xl font-bold">Registered Teachers ({filteredTeachers.length})</h3>
          {loading && <div className="animate-pulse h-4 w-20 bg-white/30 rounded" />}
        </div>
        
        {loading ? (
          <div className="p-6">
            <LoadingSkeleton variant="table" rows={8} columns={7} />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-school-cream-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Staff ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Department</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Position</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Gender</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-school-cream-200">
                  {paginatedTeachers.length > 0 ? (
                    paginatedTeachers.map((teacher) => (
                      <tr key={teacher.id} className="hover:bg-school-cream-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{teacher.staff_id}</td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {teacher.title} {teacher.surname}, {teacher.other_names}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{teacher.department}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{teacher.position_rank}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{teacher.gender}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            teacher.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {teacher.is_active ? 'Active' : 'Deactivated'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="flex space-x-2">
                            <button onClick={() => handleViewTeacherDetails(teacher.id)} className="text-blue-600 hover:text-blue-800 font-medium bg-blue-50 px-2 py-1 rounded">View</button>
                            <button onClick={() => handleEditTeacher(teacher)} className="text-school-green-600 hover:text-school-green-800 font-medium bg-green-50 px-2 py-1 rounded">Edit</button>
                            <button onClick={() => handleAssignSubject(teacher)} className="text-purple-600 hover:text-purple-800 font-medium bg-purple-50 px-2 py-1 rounded">Assign Subject</button>
                            {teacher.is_active ? (
                              <button onClick={() => handleDeactivateTeacher(teacher.id)} className="text-yellow-600 hover:text-yellow-800 font-medium bg-yellow-50 px-2 py-1 rounded">Deactivate</button>
                            ) : (
                              <button onClick={() => handleReactivateTeacher(teacher.id)} className="text-green-600 hover:text-green-800 font-medium bg-green-50 px-2 py-1 rounded">Activate</button>
                            )}
                            <button onClick={() => handleDeleteTeacher(teacher.id)} className="text-red-600 hover:text-red-800 font-medium bg-red-50 px-2 py-1 rounded">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                        {searchTerm ? 'No teachers match your search.' : 'No teachers found.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t">
                <span className="text-sm text-gray-500">Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, filteredTeachers.length)} of {filteredTeachers.length}</span>
                <div className="flex gap-2">
                  <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50">Previous</button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (page <= 3) pageNum = i + 1;
                    else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = page - 2 + i;
                    return (
                      <button key={pageNum} onClick={() => setPage(pageNum)} className={`px-3 py-1.5 border rounded-lg text-sm ${pageNum === page ? 'bg-school-green-600 text-white border-school-green-600' : 'hover:bg-gray-50'}`}>{pageNum}</button>
                    );
                  })}
                  <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50">Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      </>
      )}

      {/* Add Teacher Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8">
            <div className="bg-school-green-700 px-4 py-3 rounded-t-2xl flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">Add New Teacher</h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setCurrentStep(1);
                }}
                className="text-white hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            
            {/* Progress Bar */}
            <form onSubmit={handleSubmit}>
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                {renderStepContent()}
              </div>
              
              </form>
          </div>
        </div>
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
