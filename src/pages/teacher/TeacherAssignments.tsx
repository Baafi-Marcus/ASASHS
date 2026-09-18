import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../../lib/neon';
import { uploadLearningMaterial } from '../../../lib/neon';
import toast from 'react-hot-toast';
import { getScheduleStatus, getStatusLabel, getStatusColor } from '../../lib/dates';
import { PortalCard } from '../../components/PortalCard';
import { PortalButton } from '../../components/PortalButton';

interface Assignment {
  id: number;
  title: string;
  description: string;
  class_name: string;
  subject_name: string;
  assignment_type: string;
  due_date: string;
  max_score: number;
  submission_type: string;
  created_at: string;
}

interface AssignmentType {
  id: number;
  name: string;
  description: string;
}

interface TeacherAssignmentsProps {
  teacherId: number;
}

export const TeacherAssignments: React.FC<TeacherAssignmentsProps> = ({ teacherId }) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [assignmentTypes, setAssignmentTypes] = useState<AssignmentType[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    class_id: '',
    subject_id: '',
    assignment_type_id: '',
    due_date: '',
    max_score: 100,
    submission_type: 'file'
  });
  
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [gradingModal, setGradingModal] = useState<any>(null);
  
  // Learning materials state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFormData, setUploadFormData] = useState({
    title: '',
    description: '',
    class_id: '',
    subject_id: '',
    material_type: 'lesson_notes',
    file: null as File | null
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAssignments();
    fetchAssignmentTypes();
  }, []);

  const fetchAssignments = async () => {
    try {
      const data = await db.getAssignmentsByTeacher(teacherId);
      setAssignments(data as Assignment[]);
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignmentTypes = async () => {
    try {
      const types = await db.getAssignmentTypes();
      setAssignmentTypes(types as AssignmentType[]);
    } catch (error) {
      console.error('Failed to fetch assignment types:', error);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await db.createAssignment({
        ...formData,
        teacher_id: teacherId,
        max_score: parseFloat(formData.max_score as any)
      });
      
      toast.success('Assignment created successfully!');
      setShowCreateForm(false);
      setFormData({
        title: '',
        description: '',
        class_id: '',
        subject_id: '',
        assignment_type_id: '',
        due_date: '',
        max_score: 100,
        submission_type: 'file'
      });
      fetchAssignments();
    } catch (error) {
      console.error('Failed to create assignment:', error);
      toast.error('Failed to create assignment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'max_score' ? parseFloat(value) || 0 : value
    });
  };
  
  const handleUploadInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUploadFormData({
      ...uploadFormData,
      [name]: value
    });
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFormData({
        ...uploadFormData,
        file: e.target.files[0]
      });
    }
  };
  
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleUploadLearningMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFormData.file) {
      toast.error('Please select a file to upload');
      return;
    }
    if (!uploadFormData.class_id || !uploadFormData.subject_id) {
      toast.error('Please select both class and subject');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const filePath = `/uploads/${uploadFormData.file.name}`;
      await uploadLearningMaterial({
        teacher_id: teacherId,
        class_id: parseInt(uploadFormData.class_id),
        subject_id: parseInt(uploadFormData.subject_id),
        title: uploadFormData.title,
        description: uploadFormData.description,
        file_name: uploadFormData.file.name,
        file_path: filePath,
        file_type: uploadFormData.file.type || 'application/octet-stream',
        material_type: uploadFormData.material_type,
        academic_year: '2025/2026'
      });
      
      toast.success('Learning material uploaded successfully!');
      setShowUploadModal(false);
      setUploadFormData({
        title: '',
        description: '',
        class_id: '',
        subject_id: '',
        material_type: 'lesson_notes',
        file: null
      });
    } catch (error) {
      console.error('Failed to upload learning material:', error);
      toast.error('Failed to upload learning material');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleUploadLessonNotes = () => {
    setUploadFormData({ ...uploadFormData, material_type: 'lesson_notes' });
    setShowUploadModal(true);
  };
  
  const handleUploadAssignment = () => {
    setUploadFormData({ ...uploadFormData, material_type: 'assignment' });
    setShowUploadModal(true);
  };
  
  const handleUploadAssessment = () => {
    setUploadFormData({ ...uploadFormData, material_type: 'assessment' });
    setShowUploadModal(true);
  };
  
  const fetchSubmissions = async (assignment: Assignment) => {
    try {
      setLoading(true);
      const data = await db.getAssignmentSubmissions(assignment.id);
      setSubmissions(data as any[]);
      setSelectedAssignment(assignment);
    } catch (error) {
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleGradeSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await db.gradeAssignmentSubmission(
        gradingModal.id,
        gradingModal.score,
        gradingModal.remarks,
        teacherId
      );
      toast.success('Grade saved successfully');
      setGradingModal(null);
      if (selectedAssignment) fetchSubmissions(selectedAssignment);
    } catch (error) {
      toast.error('Failed to save grade');
    }
  };

  if (loading && assignments.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-school-green-200 border-t-school-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Course Assignments</h2>
          <p className="text-xs text-gray-500">Create, distribute, and grade assignments across your classes</p>
        </div>
        <PortalButton
          onClick={() => setShowCreateForm(true)}
          variant="primary"
          className="text-xs !min-h-[38px]"
        >
          Create Assignment
        </PortalButton>
      </div>

      {/* Upload Learning Materials Section */}
      <PortalCard className="p-5">
        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Academic Repository</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button 
            className="border border-dashed border-gray-300 rounded-sm p-4 text-left hover:border-school-green-600 hover:bg-school-green-50/20 transition-all cursor-pointer min-h-[44px] group"
            onClick={handleUploadLessonNotes}
          >
            <div className="w-7 h-7 rounded-sm bg-gray-100 text-gray-700 flex items-center justify-center mb-2 group-hover:bg-school-green-100 group-hover:text-school-green-800 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h4 className="font-bold text-sm text-gray-900">Lesson Notes</h4>
            <p className="text-[11px] text-gray-500 mt-0.5">Upload PDF, DOC lecture handouts</p>
          </button>
          
          <button 
            className="border border-dashed border-gray-300 rounded-sm p-4 text-left hover:border-school-green-600 hover:bg-school-green-50/20 transition-all cursor-pointer min-h-[44px] group"
            onClick={handleUploadAssignment}
          >
            <div className="w-7 h-7 rounded-sm bg-gray-100 text-gray-700 flex items-center justify-center mb-2 group-hover:bg-school-green-100 group-hover:text-school-green-800 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h4 className="font-bold text-sm text-gray-900">Task Document</h4>
            <p className="text-[11px] text-gray-500 mt-0.5">Publish assignment files</p>
          </button>
          
          <button 
            className="border border-dashed border-gray-300 rounded-sm p-4 text-left hover:border-school-green-600 hover:bg-school-green-50/20 transition-all cursor-pointer min-h-[44px] group"
            onClick={handleUploadAssessment}
          >
            <div className="w-7 h-7 rounded-sm bg-gray-100 text-gray-700 flex items-center justify-center mb-2 group-hover:bg-school-green-100 group-hover:text-school-green-800 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h4 className="font-bold text-sm text-gray-900">Assessment Archive</h4>
            <p className="text-[11px] text-gray-500 mt-0.5">Upload past papers and markings</p>
          </button>
        </div>
      </PortalCard>

      {/* Assignments Table List */}
      <PortalCard className="overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Active Coursework</h3>
            <p className="text-xs text-gray-500 tabular-nums">
              {assignments.length} assignment{assignments.length === 1 ? '' : 's'} managed
            </p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white border-b border-gray-200">
              <tr>
                <th className="px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Title</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Class</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Subject</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Due Date</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {assignments.length > 0 ? (
                assignments.map((assignment) => {
                  const status = getScheduleStatus(assignment.created_at, assignment.due_date);
                  return (
                    <tr key={assignment.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="text-xs font-bold text-gray-900">{assignment.title}</div>
                        <div className="text-xs text-gray-500 line-clamp-1">{assignment.description}</div>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-700">{assignment.class_name}</td>
                      <td className="px-5 py-3.5 text-xs text-gray-700">{assignment.subject_name}</td>
                      <td className="px-5 py-3.5">
                        <span className="inline-block px-2 py-0.5 rounded-sm text-[11px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                          {assignment.assignment_type}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-mono tabular-nums text-gray-700">
                            {new Date(assignment.due_date).toLocaleDateString()}
                          </span>
                          <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(status)}`}>
                            {getStatusLabel(status)}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button 
                          onClick={() => fetchSubmissions(assignment)}
                          className="min-h-[32px] px-2.5 py-1 rounded-sm text-xs font-semibold text-school-green-700 hover:bg-school-green-50 border border-school-green-200 transition"
                        >
                          Submissions
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-xs text-gray-500">
                    No assignments created yet. Click "Create Assignment" to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </PortalCard>

      {/* Create Assignment Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <PortalCard className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <h2 className="text-base font-bold text-gray-900">Create New Course Assignment</h2>
              <button onClick={() => setShowCreateForm(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full min-h-[44px] px-3.5 py-2 bg-white border border-gray-300 rounded-sm text-sm text-gray-900 focus:outline-none focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600"
                  placeholder="e.g. Genetics & Heredity Problem Set"
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Instructions / Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-sm text-sm text-gray-900 focus:outline-none focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600"
                  placeholder="Provide instructions or problem list..."
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Class *</label>
                  <select
                    name="class_id"
                    value={formData.class_id}
                    onChange={handleInputChange}
                    required
                    className="w-full min-h-[44px] px-3.5 py-2 bg-white border border-gray-300 rounded-sm text-sm text-gray-900 focus:outline-none focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600"
                  >
                    <option value="">Select Class</option>
                    <option value="1">General Science 1A</option>
                    <option value="2">General Science 1B</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Subject *</label>
                  <select
                    name="subject_id"
                    value={formData.subject_id}
                    onChange={handleInputChange}
                    required
                    className="w-full min-h-[44px] px-3.5 py-2 bg-white border border-gray-300 rounded-sm text-sm text-gray-900 focus:outline-none focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600"
                  >
                    <option value="">Select Subject</option>
                    <option value="1">Mathematics</option>
                    <option value="2">Integrated Science</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Type *</label>
                  <select
                    name="assignment_type_id"
                    value={formData.assignment_type_id}
                    onChange={handleInputChange}
                    required
                    className="w-full min-h-[44px] px-3.5 py-2 bg-white border border-gray-300 rounded-sm text-sm text-gray-900 focus:outline-none focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600"
                  >
                    <option value="">Select Type</option>
                    {assignmentTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Due Date *</label>
                  <input
                    type="date"
                    name="due_date"
                    value={formData.due_date}
                    onChange={handleInputChange}
                    required
                    className="w-full min-h-[44px] px-3.5 py-2 bg-white border border-gray-300 rounded-sm text-sm text-gray-900 focus:outline-none focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600 tabular-nums"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Max Score</label>
                  <input
                    type="number"
                    name="max_score"
                    value={formData.max_score}
                    onChange={handleInputChange}
                    min="0"
                    step="0.1"
                    className="w-full min-h-[44px] px-3.5 py-2 bg-white border border-gray-300 rounded-sm text-sm text-gray-900 focus:outline-none focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600 tabular-nums"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <PortalButton
                  type="button"
                  variant="secondary"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </PortalButton>
                <PortalButton
                  type="submit"
                  variant="primary"
                  loading={isSubmitting}
                  loadingText="Creating..."
                >
                  Create Assignment
                </PortalButton>
              </div>
            </form>
          </PortalCard>
        </div>
      )}

      {/* Upload Material Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <PortalCard className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <h2 className="text-base font-bold text-gray-900">Upload Learning Material</h2>
              <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleUploadLearningMaterial} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={uploadFormData.title}
                  onChange={handleUploadInputChange}
                  required
                  className="w-full min-h-[44px] px-3.5 py-2 bg-white border border-gray-300 rounded-sm text-sm text-gray-900 focus:outline-none focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600"
                  placeholder="Material title"
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={uploadFormData.description}
                  onChange={handleUploadInputChange}
                  rows={3}
                  className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-sm text-sm text-gray-900 focus:outline-none focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600"
                  placeholder="Notes description..."
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Class *</label>
                  <select
                    name="class_id"
                    value={uploadFormData.class_id}
                    onChange={handleUploadInputChange}
                    required
                    className="w-full min-h-[44px] px-3.5 py-2 bg-white border border-gray-300 rounded-sm text-sm text-gray-900 focus:outline-none focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600"
                  >
                    <option value="">Select Class</option>
                    <option value="1">General Science 1A</option>
                    <option value="2">General Science 1B</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Subject *</label>
                  <select
                    name="subject_id"
                    value={uploadFormData.subject_id}
                    onChange={handleUploadInputChange}
                    required
                    className="w-full min-h-[44px] px-3.5 py-2 bg-white border border-gray-300 rounded-sm text-sm text-gray-900 focus:outline-none focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600"
                  >
                    <option value="">Select Subject</option>
                    <option value="1">Mathematics</option>
                    <option value="2">Integrated Science</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Document File *</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                />
                <div 
                  className="w-full min-h-[80px] p-4 border border-dashed border-gray-300 rounded-sm text-center cursor-pointer hover:border-school-green-600 transition-colors flex flex-col items-center justify-center"
                  onClick={triggerFileInput}
                >
                  {uploadFormData.file ? (
                    <div>
                      <p className="text-school-green-800 font-semibold text-xs">{uploadFormData.file.name}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">Click to choose another file</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs text-gray-700 font-medium">Click to select document</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">PDF, Word, PPT, Excel documents accepted</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <PortalButton
                  type="button"
                  variant="secondary"
                  onClick={() => setShowUploadModal(false)}
                >
                  Cancel
                </PortalButton>
                <PortalButton
                  type="submit"
                  variant="primary"
                  loading={isSubmitting}
                  loadingText="Uploading..."
                >
                  Upload Material
                </PortalButton>
              </div>
            </form>
          </PortalCard>
        </div>
      )}

      {/* Submissions Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <PortalCard className="w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="text-sm font-bold text-gray-900">{selectedAssignment.title} — Submissions</h2>
                <p className="text-xs text-gray-500 tabular-nums">
                  {selectedAssignment.class_name} • Max Score: {selectedAssignment.max_score}
                </p>
              </div>
              <button onClick={() => setSelectedAssignment(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4 sm:p-6">
              {submissions.length > 0 ? (
                <table className="w-full text-left">
                  <thead className="bg-white border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Student</th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">File</th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Score</th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {submissions.map((sub: any) => (
                      <tr key={sub.id} className="hover:bg-gray-50/60">
                        <td className="px-4 py-3">
                          <div className="text-xs font-bold text-gray-900">{sub.surname}, {sub.other_names}</div>
                          <div className="text-[11px] font-mono text-gray-500 tabular-nums">{sub.student_admission_number || sub.student_id}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase border ${
                            sub.score !== null 
                              ? 'bg-school-green-50 text-school-green-800 border-school-green-200' 
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}>
                            {sub.score !== null ? 'Graded' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs">
                          {sub.file_path ? (
                            <a href={sub.file_path} className="text-school-green-700 hover:underline inline-flex items-center gap-1" target="_blank" rel="noreferrer">
                              <span>📄</span> {sub.file_path.split('/').pop()}
                            </a>
                          ) : (
                            <span className="text-gray-400">No file</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-xs tabular-nums text-gray-900">
                          {sub.score !== null ? `${sub.score}/${selectedAssignment.max_score}` : '-'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button 
                            onClick={() => setGradingModal(sub)}
                            className="min-h-[32px] px-2.5 py-1 rounded-sm text-xs font-semibold text-school-green-700 hover:bg-school-green-50 border border-school-green-200 transition"
                          >
                            Grade
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-16 text-xs text-gray-500">
                  No submissions yet for this assignment.
                </div>
              )}
            </div>
          </PortalCard>
        </div>
      )}

      {/* Grading Form Modal */}
      {gradingModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
          <PortalCard className="w-full max-w-md p-6 space-y-4">
            <div className="border-b border-gray-200 pb-3">
              <h3 className="text-sm font-bold text-gray-900">Grade Student Submission</h3>
              <p className="text-xs text-gray-500">Student: {gradingModal.surname}, {gradingModal.other_names}</p>
            </div>
            <form onSubmit={handleGradeSubmission} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Score (Max: {selectedAssignment?.max_score})</label>
                <input 
                  type="number"
                  required
                  max={selectedAssignment?.max_score}
                  value={gradingModal.score || ''}
                  onChange={e => setGradingModal({ ...gradingModal, score: parseFloat(e.target.value) })}
                  className="w-full min-h-[44px] px-3 py-2 bg-white border border-gray-300 rounded-sm text-sm font-mono tabular-nums focus:outline-none focus:border-school-green-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Feedback Remarks</label>
                <textarea 
                  value={gradingModal?.remarks || ''}
                  onChange={e => setGradingModal({ ...gradingModal, remarks: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-school-green-600"
                  rows={3}
                  placeholder="Feedback for the student..."
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
                <PortalButton type="button" variant="secondary" onClick={() => setGradingModal(null)}>
                  Cancel
                </PortalButton>
                <PortalButton type="submit" variant="primary">
                  Save Grade
                </PortalButton>
              </div>
            </form>
          </PortalCard>
        </div>
      )}
    </div>
  );
};