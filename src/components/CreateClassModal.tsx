import React, { useState } from 'react';

interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateClass: (classData: any) => void;
}

export function CreateClassModal({ isOpen, onClose, onCreateClass }: CreateClassModalProps) {
  const [formData, setFormData] = useState({
    form: 'Form 1',
    course: '',
    section: 'A',
    capacity: '',
    classTeacher: '',
    room: ''
  });
  
  const [selectedCoreSubjects, setSelectedCoreSubjects] = useState<string[]>([]);
  const [selectedElectiveSubjects, setSelectedElectiveSubjects] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Core subjects (compulsory for all students)
  const coreSubjects = [
    'English Language',
    'Integrated Science', 
    'Social Studies',
    'Core Mathematics'
  ];

  // Available courses/programs
  const availableCourses = [
    'General Arts',
    'Visual Arts', 
    'Home Economics',
    'Agriculture',
    'Business',
    'General Science'
  ];

  // Elective subjects by course
  const electiveSubjectsByCourse: Record<string, string[]> = {
    'General Arts': [
      'Literature in English', 'History', 'Geography', 'French',
      'Akan', 'Ewe', 'Government', 'Economics', 'Music',
      'Christian Religious Studies', 'Islamic Studies'
    ],
    'Visual Arts': [
      'Graphic Design', 'Picture Making', 'Ceramics', 'Sculpture',
      'Textiles', 'Leatherwork', 'Basketry', 'General Knowledge in Art',
      'History', 'Literature in English'
    ],
    'Home Economics': [
      'Food and Nutrition', 'Clothing and Textiles', 'Management in Living',
      'General Knowledge in Art', 'Economics', 'Biology', 'Chemistry'
    ],
    'Agriculture': [
      'Animal Husbandry', 'Crop Husbandry', 'General Agriculture',
      'Biology', 'Chemistry', 'Physics', 'Geography'
    ],
    'Business': [
      'Business Management', 'Financial Accounting', 'Cost Accounting',
      'Economics', 'Geography', 'Government', 'Mathematics (Elective)'
    ],
    'General Science': [
      'Physics', 'Chemistry', 'Biology', 'Mathematics (Elective)',
      'Geography', 'Economics', 'Further Mathematics'
    ]
  };

  const forms = ['Form 1', 'Form 2', 'Form 3'];
  const sections = ['A', 'B', 'C', 'D', 'E'];

  const handleCoreSubjectToggle = (subject: string) => {
    setSelectedCoreSubjects(prev => 
      prev.includes(subject) 
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
  };

  const handleElectiveSubjectToggle = (subject: string) => {
    if (selectedElectiveSubjects.length >= 4 && !selectedElectiveSubjects.includes(subject)) {
      return; // Don't allow more than 4 electives
    }
    setSelectedElectiveSubjects(prev => 
      prev.includes(subject) 
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.course) newErrors.course = 'Course is required';
    if (!formData.capacity || parseInt(formData.capacity) < 1) newErrors.capacity = 'Valid capacity is required';
    if (!formData.classTeacher.trim()) newErrors.classTeacher = 'Class teacher is required';
    if (selectedCoreSubjects.length === 0) newErrors.coreSubjects = 'At least one core subject is required';
    if (selectedElectiveSubjects.length !== 4) newErrors.electiveSubjects = 'Exactly 4 elective subjects are required';
    if (!formData.room.trim()) newErrors.room = 'Room assignment is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const className = `${formData.course} ${formData.form.split(' ')[1]}${formData.section}`;
    
    const classData = {
      name: className,
      form: formData.form,
      course: formData.course,
      section: formData.section,
      capacity: parseInt(formData.capacity),
      classTeacher: formData.classTeacher,
      room: formData.room,
      coreSubjects: selectedCoreSubjects,
      electiveSubjects: selectedElectiveSubjects,
      subjects: [...selectedCoreSubjects, ...selectedElectiveSubjects]
    };
    
    onCreateClass(classData);
    
    // Reset form
    setFormData({
      form: 'Form 1',
      course: '',
      section: 'A',
      capacity: '',
      classTeacher: '',
      room: ''
    });
    setSelectedCoreSubjects([]);
    setSelectedElectiveSubjects([]);
    setErrors({});
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  const availableElectives = formData.course ? electiveSubjectsByCourse[formData.course] || [] : [];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-school-green-600 to-school-green-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Create New Class</h2>
              <p className="text-school-green-100 mt-1">Set up a new class with course and subject selection</p>
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
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📚 Form Level *
              </label>
              <select
                value={formData.form}
                onChange={(e) => setFormData(prev => ({ ...prev, form: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-school-green-500 focus:outline-none transition-colors"
              >
                {forms.map(form => (
                  <option key={form} value={form}>{form}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🎓 Course/Program *
              </label>
              <select
                value={formData.course}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, course: e.target.value }));
                  setSelectedElectiveSubjects([]); // Reset electives when course changes
                }}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                  errors.course ? 'border-red-500 focus:border-red-600' : 'border-gray-200 focus:border-school-green-500'
                }`}
              >
                <option value="">Select a course...</option>
                {availableCourses.map(course => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>
              {errors.course && <p className="text-red-500 text-sm mt-1">{errors.course}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📝 Section *
              </label>
              <select
                value={formData.section}
                onChange={(e) => setFormData(prev => ({ ...prev, section: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-school-green-500 focus:outline-none transition-colors"
              >
                {sections.map(section => (
                  <option key={section} value={section}>Section {section}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Class Preview */}
          {formData.course && (
            <div className="bg-school-green-50 border border-school-green-200 rounded-xl p-4">
              <p className="text-school-green-800 font-semibold">
                📋 Class Name Preview: <span className="text-xl">{formData.course} {formData.form.split(' ')[1]}{formData.section}</span>
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                👥 Capacity *
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={formData.capacity}
                onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                placeholder="Maximum students"
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                  errors.capacity ? 'border-red-500 focus:border-red-600' : 'border-gray-200 focus:border-school-green-500'
                }`}
              />
              {errors.capacity && <p className="text-red-500 text-sm mt-1">{errors.capacity}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                👨‍🏫 Class Teacher *
              </label>
              <input
                type="text"
                value={formData.classTeacher}
                onChange={(e) => setFormData(prev => ({ ...prev, classTeacher: e.target.value }))}
                placeholder="Full name of class teacher"
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                  errors.classTeacher ? 'border-red-500 focus:border-red-600' : 'border-gray-200 focus:border-school-green-500'
                }`}
              />
              {errors.classTeacher && <p className="text-red-500 text-sm mt-1">{errors.classTeacher}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🏢 Room Assignment *
              </label>
              <input
                type="text"
                value={formData.room}
                onChange={(e) => setFormData(prev => ({ ...prev, room: e.target.value }))}
                placeholder="e.g., Room 101, Block A"
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                  errors.room ? 'border-red-500 focus:border-red-600' : 'border-gray-200 focus:border-school-green-500'
                }`}
              />
              {errors.room && <p className="text-red-500 text-sm mt-1">{errors.room}</p>}
            </div>
          </div>

          {/* Subject Selection */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Core Subjects */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                📘 Core Subjects (Compulsory) - ({selectedCoreSubjects.length} selected)
              </label>
              <div className="max-h-64 overflow-y-auto border-2 border-gray-200 rounded-xl p-4 space-y-2">
                {coreSubjects.map(subject => (
                  <label
                    key={subject}
                    className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedCoreSubjects.includes(subject) 
                        ? 'bg-blue-100 border border-blue-300' 
                        : 'hover:bg-gray-100 border border-transparent'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedCoreSubjects.includes(subject)}
                      onChange={() => handleCoreSubjectToggle(subject)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">{subject}</span>
                  </label>
                ))}
              </div>
              {errors.coreSubjects && <p className="text-red-500 text-sm mt-1">{errors.coreSubjects}</p>}
            </div>

            {/* Elective Subjects */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                📗 Elective Subjects (Choose exactly 4) - ({selectedElectiveSubjects.length}/4 selected)
              </label>
              {!formData.course ? (
                <div className="border-2 border-gray-200 rounded-xl p-8 text-center">
                  <p className="text-gray-500">Select a course first to see available elective subjects</p>
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto border-2 border-gray-200 rounded-xl p-4 space-y-2">
                  {availableElectives.map(subject => (
                    <label
                      key={subject}
                      className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedElectiveSubjects.includes(subject) 
                          ? 'bg-green-100 border border-green-300' 
                          : selectedElectiveSubjects.length >= 4
                          ? 'opacity-50 cursor-not-allowed hover:bg-gray-50 border border-transparent'
                          : 'hover:bg-gray-100 border border-transparent'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedElectiveSubjects.includes(subject)}
                        onChange={() => handleElectiveSubjectToggle(subject)}
                        disabled={selectedElectiveSubjects.length >= 4 && !selectedElectiveSubjects.includes(subject)}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm font-medium text-gray-700">{subject}</span>
                    </label>
                  ))}
                </div>
              )}
              {errors.electiveSubjects && <p className="text-red-500 text-sm mt-1">{errors.electiveSubjects}</p>}
            </div>
          </div>

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
              Create Class
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}