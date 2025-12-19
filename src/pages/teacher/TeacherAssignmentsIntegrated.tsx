import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../../lib/neon';
import toast from 'react-hot-toast';

interface Assignment {
  id: number;
  title: string;
  description: string;
  class_name: string;
  subject_name: string;
  assignment_type: string;
  due_date: string;
  max_score: number;
  created_at: string;
}

interface LearningMaterial {
  id: number;
  title: string;
  description: string;
  class_name: string;
  subject_name: string;
  material_type: string;
  file_name: string;
  file_path: string;
  created_at: string;
}

interface TeacherAssignmentsIntegratedProps {
  teacherId: number;
}

export const TeacherAssignmentsIntegrated: React.FC<TeacherAssignmentsIntegratedProps> = ({ teacherId }) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [learningMaterials, setLearningMaterials] = useState<LearningMaterial[]>([]);
  const [assignmentTypes, setAssignmentTypes] = useState<any[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'assignments' | 'materials'>('assignments');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    class_id: '',
    subject_id: '',
    assignment_type_id: '',
    due_date: '',
    max_score: 100
  });
  
  // Learning materials state
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
    fetchLearningMaterials();
    fetchAssignmentTypes();
  }, []);

  const fetchAssignments = async () => {
    try {
      const data = await db.getAssignmentsByTeacher(teacherId);
      setAssignments(data as Assignment[]);
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
      toast.error('Failed to load assignments');
    }
  };

  const fetchLearningMaterials = async () => {
    try {
      const filters = { teacher_id: teacherId };
      const materials = await db.getLearningMaterials(filters);
      setLearningMaterials(materials as LearningMaterial[]);
    } catch (error) {
      console.error('Failed to fetch learning materials:', error);
      toast.error('Failed to load learning materials');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignmentTypes = async () => {
    try {
      const types = await db.getAssignmentTypes();
      setAssignmentTypes(types);
    } catch (error) {
      console.error('Failed to fetch assignment types:', error);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
        max_score: 100
      });
      fetchAssignments();
    } catch (error) {
      console.error('Failed to create assignment:', error);
      toast.error('Failed to create assignment');
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
    
    try {
      // In a real implementation, you would upload the file to a server
      // and get a file path back. For now, we'll just simulate this.
      const filePath = `/uploads/${uploadFormData.file.name}`;
      
      await db.uploadLearningMaterial({
        teacher_id: teacherId,
        class_id: parseInt(uploadFormData.class_id),
        subject_id: parseInt(uploadFormData.subject_id),
        title: uploadFormData.title,
        description: uploadFormData.description,
        file_name: uploadFormData.file.name,
        file_path: filePath,
        file_type: uploadFormData.file.type || 'application/octet-stream',
        material_type: uploadFormData.material_type,
        academic_year: '2025/2026' // This should be dynamic
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
      fetchLearningMaterials();
    } catch (error) {
      console.error('Failed to upload learning material:', error);
      toast.error('Failed to upload learning material');
    }
  };
  
  const handleUploadLessonNotes = () => {
    setUploadFormData({
      ...uploadFormData,
      material_type: 'lesson_notes'
    });
    setShowUploadModal(true);
  };
  
  const handleUploadAssignment = () => {
    setUploadFormData({
      ...uploadFormData,
      material_type: 'assignment'
    });
    setShowUploadModal(true);
  };
  
  const handleUploadAssessment = () => {
    setUploadFormData({
      ...uploadFormData,
      material_type: 'assessment'
    });
    setShowUploadModal(true);
  };

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
          <h2 className="text-2xl font-bold text-gray-800">Assignments & Learning Materials</h2>
          <p className="text-gray-600">Create and manage assignments and learning resources</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-school-green-600 text-white px-4 py-2 rounded-lg hover:bg-school-green-700 transition-colors flex items-center space-x-2"
          >
            <span>➕</span>
            <span>Create Assignment</span>
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <span>📁</span>
            <span>Upload Material</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('assignments')}
          className={`py-3 px-6 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'assignments'
              ? 'border-school-green-600 text-school-green-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Assignments ({assignments.length})
        </button>
        <button
          onClick={() => setActiveTab('materials')}
          className={`py-3 px-6 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'materials'
              ? 'border-school-green-600 text-school-green-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Learning Materials ({learningMaterials.length})
        </button>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'assignments' ? (
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-school-cream-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Title</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Class</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Subject</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Due Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Submissions</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-school-cream-200">
                {assignments.length > 0 ? (
                  assignments.map((assignment) => (
                    <tr key={assignment.id} className="hover:bg-school-cream-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{assignment.title}</div>
                        <div className="text-sm text-gray-500 line-clamp-1">{assignment.description}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{assignment.class_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{assignment.subject_name}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          {assignment.assignment_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(assignment.due_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <span className="text-blue-600 font-medium">12/25</span> submitted
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <button className="text-school-green-600 hover:text-school-green-800 mr-3">
                          View
                        </button>
                        <button className="text-blue-600 hover:text-blue-800 mr-3">
                          Edit
                        </button>
                        <button className="text-red-600 hover:text-red-800">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <div className="text-4xl mb-4">📝</div>
                        <p className="text-lg font-medium">No assignments created yet</p>
                        <p className="text-sm">Create your first assignment to get started</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-school-cream-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Title</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Class</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Subject</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Uploaded</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-school-cream-200">
                {learningMaterials.length > 0 ? (
                  learningMaterials.map((material) => (
                    <tr key={material.id} className="hover:bg-school-cream-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{material.title}</div>
                        <div className="text-sm text-gray-500 line-clamp-1">{material.description}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{material.class_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{material.subject_name}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                          {material.material_type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(material.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <button className="text-school-green-600 hover:text-school-green-800 mr-3">
                          View
                        </button>
                        <button className="text-blue-600 hover:text-blue-800 mr-3">
                          Download
                        </button>
                        <button className="text-red-600 hover:text-red-800">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <div className="text-4xl mb-4">📁</div>
                        <p className="text-lg font-medium">No learning materials uploaded yet</p>
                        <p className="text-sm">Upload your first learning material to get started</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Assignment Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-school-green-700 px-6 py-4 rounded-t-2xl">
              <h2 className="text-xl font-bold text-white">Create New Assignment</h2>
            </div>
            
            <form onSubmit={handleCreateAssignment} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-school-cream-300 rounded-lg focus:ring-2 focus:ring-school-green-500 focus:border-transparent"
                  placeholder="Assignment title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-school-cream-300 rounded-lg focus:ring-2 focus:ring-school-green-500 focus:border-transparent"
                  placeholder="Assignment description"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Class *</label>
                  <select
                    name="class_id"
                    value={formData.class_id}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-school-cream-300 rounded-lg focus:ring-2 focus:ring-school-green-500 focus:border-transparent"
                  >
                    <option value="">Select Class</option>
                    <option value="1">General Science 1A</option>
                    <option value="2">General Science 1B</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                  <select
                    name="subject_id"
                    value={formData.subject_id}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-school-cream-300 rounded-lg focus:ring-2 focus:ring-school-green-500 focus:border-transparent"
                  >
                    <option value="">Select Subject</option>
                    <option value="1">Mathematics</option>
                    <option value="2">Integrated Science</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                  <select
                    name="assignment_type_id"
                    value={formData.assignment_type_id}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-school-cream-300 rounded-lg focus:ring-2 focus:ring-school-green-500 focus:border-transparent"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Due Date *</label>
                  <input
                    type="date"
                    name="due_date"
                    value={formData.due_date}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-school-cream-300 rounded-lg focus:ring-2 focus:ring-school-green-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Score</label>
                  <input
                    type="number"
                    name="max_score"
                    value={formData.max_score}
                    onChange={handleInputChange}
                    min="0"
                    step="0.1"
                    className="w-full px-4 py-3 border border-school-cream-300 rounded-lg focus:ring-2 focus:ring-school-green-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-school-green-600 text-white rounded-lg hover:bg-school-green-700 transition-colors"
                >
                  Create Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Learning Material Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-school-green-700 px-6 py-4 rounded-t-2xl">
              <h2 className="text-xl font-bold text-white">Upload Learning Material</h2>
            </div>
            
            <form onSubmit={handleUploadLearningMaterial} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={uploadFormData.title}
                  onChange={handleUploadInputChange}
                  required
                  className="w-full px-4 py-3 border border-school-cream-300 rounded-lg focus:ring-2 focus:ring-school-green-500 focus:border-transparent"
                  placeholder="Material title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={uploadFormData.description}
                  onChange={handleUploadInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-school-cream-300 rounded-lg focus:ring-2 focus:ring-school-green-500 focus:border-transparent"
                  placeholder="Material description"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Class *</label>
                  <select
                    name="class_id"
                    value={uploadFormData.class_id}
                    onChange={handleUploadInputChange}
                    required
                    className="w-full px-4 py-3 border border-school-cream-300 rounded-lg focus:ring-2 focus:ring-school-green-500 focus:border-transparent"
                  >
                    <option value="">Select Class</option>
                    <option value="1">General Science 1A</option>
                    <option value="2">General Science 1B</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                  <select
                    name="subject_id"
                    value={uploadFormData.subject_id}
                    onChange={handleUploadInputChange}
                    required
                    className="w-full px-4 py-3 border border-school-cream-300 rounded-lg focus:ring-2 focus:ring-school-green-500 focus:border-transparent"
                  >
                    <option value="">Select Subject</option>
                    <option value="1">Mathematics</option>
                    <option value="2">Integrated Science</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Material Type</label>
                <select
                  name="material_type"
                  value={uploadFormData.material_type}
                  onChange={handleUploadInputChange}
                  className="w-full px-4 py-3 border border-school-cream-300 rounded-lg focus:ring-2 focus:ring-school-green-500 focus:border-transparent"
                >
                  <option value="lesson_notes">Lesson Notes</option>
                  <option value="assignment">Assignment</option>
                  <option value="assessment">Assessment</option>
                  <option value="resource">Resource</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">File *</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                />
                <div 
                  className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-school-green-400 transition-colors"
                  onClick={triggerFileInput}
                >
                  {uploadFormData.file ? (
                    <div>
                      <p className="text-school-green-600 font-medium">{uploadFormData.file.name}</p>
                      <p className="text-sm text-gray-500">Click to change file</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-500">Click to select a file</p>
                      <p className="text-sm text-gray-400 mt-1">PDF, DOC, PPT, XLS files supported</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-school-green-600 text-white rounded-lg hover:bg-school-green-700 transition-colors"
                >
                  Upload Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};