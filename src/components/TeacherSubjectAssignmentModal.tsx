import React, { useState } from 'react';

interface Teacher {
  id: string;
  name: string;
  specialization: string;
  email: string;
}

interface TeacherSubjectAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssignTeacher: (assignment: any) => void;
  teachers: Teacher[];
  classes: any[];
}

export function TeacherSubjectAssignmentModal({ 
  isOpen, 
  onClose, 
  onAssignTeacher, 
  teachers, 
  classes 
}: TeacherSubjectAssignmentModalProps) {
  const [formData, setFormData] = useState({
    teacherId: '',
    teacherName: '',
    classId: '',
    subject: '',
    subjectType: 'core' // 'core' or 'elective'
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedClass = classes.find(c => c.id.toString() === formData.classId);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.teacherId) newErrors.teacherId = 'Teacher is required';
    if (!formData.classId) newErrors.classId = 'Class is required';
    if (!formData.subject) newErrors.subject = 'Subject is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const selectedTeacher = teachers.find(t => t.id === formData.teacherId);
    const selectedClass = classes.find(c => c.id.toString() === formData.classId);
    
    const assignment = {
      id: Date.now().toString(),
      teacherId: formData.teacherId,
      teacherName: selectedTeacher?.name || '',
      teacherSpecialization: selectedTeacher?.specialization || '',
      classId: formData.classId,
      className: selectedClass?.name || '',
      subject: formData.subject,
      subjectType: formData.subjectType,
      assignedDate: new Date().toISOString()
    };
    
    onAssignTeacher(assignment);
    
    // Reset form
    setFormData({
      teacherId: '',
      teacherName: '',
      classId: '',
      subject: '',
      subjectType: 'core'
    });
    setErrors({});
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  const handleTeacherChange = (teacherId: string) => {
    const teacher = teachers.find(t => t.id === teacherId);
    setFormData(prev => ({
      ...prev,
      teacherId,
      teacherName: teacher?.name || ''
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-school-green-600 to-school-green-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Assign Teacher to Subject</h2>
              <p className="text-school-green-100 mt-1">Assign teachers to specific subjects in classes</p>
            </div>
            <button
              onClick={handleClose}
              className="text-white/80 hover:text-white text-2xl transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Teacher Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              ◉ Select Teacher *
            </label>
            <select
              value={formData.teacherId}
              onChange={(e) => handleTeacherChange(e.target.value)}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                errors.teacherId ? 'border-red-500 focus:border-red-600' : 'border-gray-200 focus:border-school-green-500'
              }`}
            >
              <option value="">Choose a teacher...</option>
              {teachers.map(teacher => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name} - {teacher.specialization}
                </option>
              ))}
            </select>
            {errors.teacherId && <p className="text-red-500 text-sm mt-1">{errors.teacherId}</p>}
          </div>

          {/* Class Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              ◢ Select Class *
            </label>
            <select
              value={formData.classId}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, classId: e.target.value, subject: '' }));
              }}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                errors.classId ? 'border-red-500 focus:border-red-600' : 'border-gray-200 focus:border-school-green-500'
              }`}
            >
              <option value="">Choose a class...</option>
              {classes.map(classItem => (
                <option key={classItem.id} value={classItem.id}>
                  {classItem.name} - {classItem.course}
                </option>
              ))}
            </select>
            {errors.classId && <p className="text-red-500 text-sm mt-1">{errors.classId}</p>}
          </div>

          {/* Subject Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              ◈ Select Subject *
            </label>
            {!formData.classId ? (
              <div className="border-2 border-gray-200 rounded-xl p-8 text-center">
                <p className="text-gray-500">Select a class first to see available subjects</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Core Subjects */}
                {selectedClass?.coreSubjects?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Core Subjects (Compulsory)</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {selectedClass.coreSubjects.map((subject: string) => (
                        <label
                          key={subject}
                          className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                            formData.subject === subject && formData.subjectType === 'core'
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="subject"
                            value={subject}
                            checked={formData.subject === subject && formData.subjectType === 'core'}
                            onChange={() => setFormData(prev => ({ ...prev, subject, subjectType: 'core' }))}
                            className="mr-3 text-blue-600"
                          />
                          <div>
                            <span className="font-medium text-gray-800">{subject}</span>
                            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">Core</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Elective Subjects */}
                {selectedClass?.electiveSubjects?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Elective Subjects</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {selectedClass.electiveSubjects.map((subject: string) => (
                        <label
                          key={subject}
                          className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                            formData.subject === subject && formData.subjectType === 'elective'
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="subject"
                            value={subject}
                            checked={formData.subject === subject && formData.subjectType === 'elective'}
                            onChange={() => setFormData(prev => ({ ...prev, subject, subjectType: 'elective' }))}
                            className="mr-3 text-green-600"
                          />
                          <div>
                            <span className="font-medium text-gray-800">{subject}</span>
                            <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Elective</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject}</p>}
          </div>

          {/* Assignment Preview */}
          {formData.teacherId && formData.classId && formData.subject && (
            <div className="bg-school-green-50 border border-school-green-200 rounded-xl p-4">
              <h4 className="font-semibold text-school-green-800 mb-2">Assignment Preview</h4>
              <div className="space-y-1 text-sm text-school-green-700">
                <p><strong>Teacher:</strong> {formData.teacherName}</p>
                <p><strong>Class:</strong> {selectedClass?.name}</p>
                <p><strong>Subject:</strong> {formData.subject} ({formData.subjectType})</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-school-green-600 to-school-green-700 text-white rounded-xl hover:from-school-green-700 hover:to-school-green-800 transition-all font-medium shadow-lg hover:shadow-xl"
            >
              Assign Teacher
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}