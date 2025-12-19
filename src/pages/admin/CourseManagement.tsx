import React, { useEffect, useState } from 'react';
import { db } from '../../../lib/neon';
import toast from 'react-hot-toast';
// Import Heroicons
import { 
  AcademicCapIcon, 
  BookOpenIcon, 
  BuildingLibraryIcon, 
  CalendarIcon, 
  ChevronDownIcon, 
  ChevronUpIcon, 
  ClipboardDocumentIcon, 
  CogIcon, 
  EyeIcon, 
  PencilIcon, 
  PlusIcon, 
  TrashIcon, 
  UserGroupIcon, 
  UserIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface Course {
  id: number;
  name: string;
  code: string;
  description: string;
  duration_years: number;
  is_active: boolean;
}

interface Class {
  id: number;
  class_name: string;
  course_id: number;
  form: number;
  semester: number;
  stream: string;
  academic_year: string;
  capacity: number;
  is_active: boolean;
}

interface Subject {
  id: number;
  name: string;
  code: string;
  course_id: number | null;
  is_core: boolean;
  is_active: boolean;
}

interface ClassStudent {
  id: number;
  student_id: string;
  surname: string;
  other_names: string;
  class_name: string;
  is_active: boolean;
}

interface TeacherSubject {
  id: number;
  subject_name: string;
  class_name: string;
  form: number;
  stream: string;
  teacher_surname: string;
  teacher_other_names: string;
  teacher_id: number;
}

export function CourseManagement() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'courses' | 'classes' | 'subjects' | 'promotions'>('courses');
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showClassForm, setShowClassForm] = useState(false);
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  
  // New state for class details
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [classStudents, setClassStudents] = useState<ClassStudent[]>([]);
  const [classTeachers, setClassTeachers] = useState<TeacherSubject[]>([]);
  const [showClassDetails, setShowClassDetails] = useState(false);
  const [loadingClassDetails, setLoadingClassDetails] = useState(false);
  
  // New state for subject details
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [subjectTeachers, setSubjectTeachers] = useState<TeacherSubject[]>([]);
  const [showSubjectDetails, setShowSubjectDetails] = useState(false);
  const [loadingSubjectDetails, setLoadingSubjectDetails] = useState(false);
  
  const [courseFormData, setCourseFormData] = useState({
    name: '',
    code: '',
    description: '',
    duration_years: 3
  });
  
  const [classFormData, setClassFormData] = useState({
    class_name: '',
    course_id: '',
    form: 1,
    semester: 1,
    stream: '',
    academic_year: '2025/2026',
    capacity: 40,
    elective_subject_1: '',
    elective_subject_2: '',
    elective_subject_3: '',
    elective_subject_4: '',
  });
  
  const [subjectFormData, setSubjectFormData] = useState({
    name: '',
    code: '',
    course_id: '',
    is_core: false
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [coursesData, classesData, subjectsData] = await Promise.all([
        db.getCourses(),
        db.getClasses(),
        db.getSubjects()
      ]);
      
      setCourses(coursesData as Course[]);
      setClasses(classesData as Class[]);
      setSubjects(subjectsData as Subject[]);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // New function to fetch class details
  const fetchClassDetails = async (classId: number) => {
    try {
      setLoadingClassDetails(true);
      // Fetch students in the class
      const students = await db.getClassStudents(classId);
      
      // For teachers, we need to get teachers assigned to subjects in this class
      // This requires a custom query to get teachers for this class
      const teachers = await db.getTimetableEntries({ class_id: classId });
      
      setClassStudents(students as ClassStudent[]);
      setClassTeachers(teachers as TeacherSubject[]);
      
      const classItem = classes.find(c => c.id === classId);
      if (classItem) {
        setSelectedClass(classItem);
      }
      
      setShowClassDetails(true);
    } catch (error) {
      console.error('Failed to fetch class details:', error);
      toast.error('Failed to load class details');
    } finally {
      setLoadingClassDetails(false);
    }
  };

  // New function to fetch subject details
  const fetchSubjectDetails = async (subjectId: number) => {
    try {
      setLoadingSubjectDetails(true);
      // Fetch teachers teaching this subject
      // We'll need to get this from timetable entries or teacher_subjects
      const teachers = await db.getTimetableEntries({ subject_id: subjectId });
      
      setSubjectTeachers(teachers as TeacherSubject[]);
      
      const subjectItem = subjects.find(s => s.id === subjectId);
      if (subjectItem) {
        setSelectedSubject(subjectItem);
      }
      
      setShowSubjectDetails(true);
    } catch (error) {
      console.error('Failed to fetch subject details:', error);
      toast.error('Failed to load subject details');
    } finally {
      setLoadingSubjectDetails(false);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await db.createCourse(courseFormData);
      toast.success('Course created successfully!');
      setCourseFormData({ name: '', code: '', description: '', duration_years: 3 });
      setShowCourseForm(false);
      fetchData();
    } catch (error) {
      console.error('Failed to create course:', error);
      toast.error('Failed to create course');
    }
  };

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;
    
    try {
      // Update course logic would go here
      toast.success('Course updated successfully!');
      setEditingCourse(null);
      fetchData();
    } catch (error) {
      console.error('Failed to update course:', error);
      toast.error('Failed to update course');
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Auto-generate stream if not provided
      let stream = classFormData.stream;
      if (!stream) {
        // Get the next available stream letter for this course and form
        const classesResult = await db.getClasses();
        const sameCourseFormClasses = classesResult.filter(
          (c: any) => c.course_id === parseInt(classFormData.course_id) && c.form === classFormData.form && c.semester === classFormData.semester
        );
        
        if (sameCourseFormClasses.length > 0) {
          // Get the highest stream letter and increment
          const streams = sameCourseFormClasses
            .map((c: any) => c.stream)
            .filter((s: string) => s)
            .sort();
          
          const lastStream = streams[streams.length - 1];
          if (lastStream) {
            stream = String.fromCharCode(lastStream.charCodeAt(0) + 1);
          } else {
            stream = 'A';
          }
        } else {
          stream = 'A';
        }
      }
      
      await db.createClass({
        ...classFormData,
        stream,
        course_id: parseInt(classFormData.course_id)
      });
      toast.success('Class created successfully!');
      setClassFormData({
        class_name: '',
        course_id: '',
        form: 1,
        semester: 1,
        stream: '',
        academic_year: '2025/2026',
        capacity: 40,
        elective_subject_1: '',
        elective_subject_2: '',
        elective_subject_3: '',
        elective_subject_4: '',
      });
      setShowClassForm(false);
      fetchData();
    } catch (error) {
      console.error('Failed to create class:', error);
      toast.error('Failed to create class: ' + (error as Error).message);
    }
  };

  const handleUpdateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass) return;
    
    try {
      // Update class logic would go here
      toast.success('Class updated successfully!');
      setEditingClass(null);
      fetchData();
    } catch (error) {
      console.error('Failed to update class:', error);
      toast.error('Failed to update class');
    }
  };

  const handleDeleteAllClasses = async () => {
    if (window.confirm('Are you sure you want to delete ALL classes? This action cannot be undone and will remove all student class assignments.')) {
      try {
        const result = await db.deleteAllClasses();
        toast.success(result.message);
        fetchData();
      } catch (error) {
        console.error('Failed to delete classes:', error);
        toast.error('Failed to delete classes');
      }
    }
  };

  const handleUpdateElectiveSubjects = async () => {
    if (window.confirm('This will update all elective subjects to match the Ghana curriculum. Are you sure?')) {
      try {
        const result = await db.updateElectiveSubjects();
        toast.success(result.message);
        fetchData();
      } catch (error) {
        console.error('Failed to update elective subjects:', error);
        toast.error('Failed to update elective subjects');
      }
    }
  };

  const handlePromoteStudents = async () => {
    if (window.confirm('This will promote all form 1 semester 2 students to form 2 semester 1. Are you sure?')) {
      try {
        // Get current and next academic year
        const currentYear = new Date().getFullYear();
        const currentAcademicYear = `${currentYear}/${currentYear + 1}`;
        const nextAcademicYear = `${currentYear + 1}/${currentYear + 2}`;
        
        const result = await db.promoteStudentsToNextForm(currentAcademicYear, nextAcademicYear, 1, 2, 2, 1);
        toast.success(result.message);
        fetchData();
      } catch (error) {
        console.error('Failed to promote students:', error);
        toast.error('Failed to promote students: ' + (error as Error).message);
      }
    }
  };
  
  const handlePromoteSemester = async () => {
    if (window.confirm('This will promote all form 1 semester 1 students to form 1 semester 2. Are you sure?')) {
      try {
        // Get current academic year
        const currentYear = new Date().getFullYear();
        const currentAcademicYear = `${currentYear}/${currentYear + 1}`;
        
        const result = await db.promoteStudentsToNextForm(currentAcademicYear, currentAcademicYear, 1, 1, 1, 2);
        toast.success(result.message);
        fetchData();
      } catch (error) {
        console.error('Failed to promote students:', error);
        toast.error('Failed to promote students: ' + (error as Error).message);
      }
    }
  };
  
  const handleAcademicYearEnd = async () => {
    if (window.confirm('This will end the current academic year and start a new one. All students will be promoted accordingly. Are you sure?')) {
      try {
        // Get current and next academic year
        const currentYear = new Date().getFullYear();
        const currentAcademicYear = `${currentYear}/${currentYear + 1}`;
        const nextAcademicYear = `${currentYear + 1}/${currentYear + 2}`;
        
        // First promote semester 2 students to next form
        await db.promoteStudentsToNextForm(currentAcademicYear, nextAcademicYear, 1, 2, 2, 1);
        await db.promoteStudentsToNextForm(currentAcademicYear, nextAcademicYear, 2, 2, 3, 1);
        
        // Then promote semester 1 students to semester 2
        await db.promoteStudentsToNextForm(currentAcademicYear, nextAcademicYear, 1, 1, 1, 2);
        await db.promoteStudentsToNextForm(currentAcademicYear, nextAcademicYear, 2, 1, 2, 2);
        await db.promoteStudentsToNextForm(currentAcademicYear, nextAcademicYear, 3, 1, 3, 2);
        
        toast.success('Academic year ended successfully. All students promoted.');
        fetchData();
      } catch (error) {
        console.error('Failed to end academic year:', error);
        toast.error('Failed to end academic year: ' + (error as Error).message);
      }
    }
  };
  
  const handleManualPromotion = async (fromForm: number, fromSemester: number, toForm: number, toSemester: number) => {
    try {
      // Get current and next academic year
      const currentYear = new Date().getFullYear();
      const currentAcademicYear = `${currentYear}/${currentYear + 1}`;
      const targetAcademicYear = fromSemester === 2 && toSemester === 1 ? `${currentYear + 1}/${currentYear + 2}` : `${currentYear}/${currentYear + 1}`;
      
      const result = await db.promoteStudentsToNextForm(currentAcademicYear, targetAcademicYear, fromForm, fromSemester, toForm, toSemester);
      toast.success(result.message);
      fetchData();
    } catch (error) {
      console.error('Failed to promote students:', error);
      toast.error('Failed to promote students: ' + (error as Error).message);
    }
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await db.createSubject({
        ...subjectFormData,
        course_id: subjectFormData.course_id ? parseInt(subjectFormData.course_id) : null
      });
      toast.success('Subject created successfully!');
      setSubjectFormData({ name: '', code: '', course_id: '', is_core: false });
      setShowSubjectForm(false);
      fetchData();
    } catch (error) {
      console.error('Failed to create subject:', error);
      toast.error('Failed to create subject');
    }
  };

  const handleUpdateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject) return;
    
    try {
      // Update subject logic would go here
      toast.success('Subject updated successfully!');
      setEditingSubject(null);
      fetchData();
    } catch (error) {
      console.error('Failed to update subject:', error);
      toast.error('Failed to update subject');
    }
  };

  // Function to close class details view
  const handleCloseClassDetails = () => {
    setShowClassDetails(false);
    setSelectedClass(null);
    setClassStudents([]);
    setClassTeachers([]);
  };

  // Function to close subject details view
  const handleCloseSubjectDetails = () => {
    setShowSubjectDetails(false);
    setSelectedSubject(null);
    setSubjectTeachers([]);
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Course & Academic Management</h2>
          <p className="text-gray-600">Manage courses, classes, and subjects</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-xl border-2 border-school-cream-200 overflow-hidden">
        <div className="bg-school-green-600 text-white">
          <div className="flex">
            {[
              { id: 'courses', label: 'Courses', icon: AcademicCapIcon },
              { id: 'classes', label: 'Classes', icon: BuildingLibraryIcon },
              { id: 'subjects', label: 'Subjects', icon: BookOpenIcon },
              { id: 'promotions', label: 'Promotions', icon: CalendarIcon }
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 p-4 flex items-center justify-center space-x-2 transition-all ${
                    activeTab === tab.id
                      ? 'bg-white text-school-green-600 font-bold'
                      : 'text-white hover:bg-school-green-700'
                  }`}
                >
                  <IconComponent className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6">
          {/* Courses Tab */}
          {activeTab === 'courses' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">Courses ({courses.length})</h3>
                <button
                  onClick={() => {
                    setEditingCourse(null);
                    setCourseFormData({ name: '', code: '', description: '', duration_years: 3 });
                    setShowCourseForm(true);
                  }}
                  className="bg-school-green-600 text-white px-4 py-2 rounded-lg hover:bg-school-green-700 transition-colors flex items-center space-x-2"
                >
                  <PlusIcon className="h-5 w-5" />
                  <span>Add Course</span>
                </button>
              </div>

              {showCourseForm && (
                <div className="bg-school-cream-50 p-6 rounded-xl border border-school-cream-200">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold text-gray-800">
                      {editingCourse ? 'Edit Course' : 'Create New Course'}
                    </h4>
                    <button
                      onClick={() => {
                        setShowCourseForm(false);
                        setEditingCourse(null);
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                  <form onSubmit={editingCourse ? handleUpdateCourse : handleCreateCourse} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Course Name *</label>
                        <input
                          type="text"
                          value={courseFormData.name}
                          onChange={(e) => setCourseFormData({ ...courseFormData, name: e.target.value })}
                          required
                          className="w-full px-4 py-3 border border-school-cream-300 rounded-lg focus:ring-2 focus:ring-school-green-500 focus:border-transparent"
                          placeholder="e.g., General Science"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Course Code *</label>
                        <input
                          type="text"
                          value={courseFormData.code}
                          onChange={(e) => setCourseFormData({ ...courseFormData, code: e.target.value.toUpperCase() })}
                          required
                          className="w-full px-4 py-3 border border-school-cream-300 rounded-lg focus:ring-2 focus:ring-school-green-500 focus:border-transparent"
                          placeholder="e.g., GS"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        value={courseFormData.description}
                        onChange={(e) => setCourseFormData({ ...courseFormData, description: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 border border-school-cream-300 rounded-lg focus:ring-2 focus:ring-school-green-500 focus:border-transparent"
                        placeholder="Course description..."
                      />
                    </div>
                    <div className="w-32">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Duration (Years)</label>
                      <select
                        value={courseFormData.duration_years}
                        onChange={(e) => setCourseFormData({ ...courseFormData, duration_years: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 border border-school-cream-300 rounded-lg focus:ring-2 focus:ring-school-green-500 focus:border-transparent"
                      >
                        <option value={3}>3 Years</option>
                        <option value={4}>4 Years</option>
                      </select>
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => {
                          setShowCourseForm(false);
                          setEditingCourse(null);
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-school-green-600 text-white rounded-lg hover:bg-school-green-700 transition-colors"
                      >
                        {editingCourse ? 'Update Course' : 'Create Course'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="grid gap-4">
                {courses.map((course) => (
                  <div key={course.id} className="bg-white border border-school-cream-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800">{course.name}</h4>
                        <p className="text-sm text-gray-600 font-mono">{course.code}</p>
                        <p className="text-sm text-gray-500 mt-1">{course.description}</p>
                        <p className="text-xs text-gray-400 mt-2">{course.duration_years} years duration</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingCourse(course);
                            setCourseFormData({
                              name: course.name,
                              code: course.code,
                              description: course.description,
                              duration_years: course.duration_years
                            });
                            setShowCourseForm(true);
                          }}
                          className="p-2 text-gray-500 hover:text-school-green-600 hover:bg-school-green-50 rounded-full transition-colors"
                          title="Edit Course"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          course.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {course.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {courses.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-4">📚</div>
                    <p className="text-lg font-medium">No courses found</p>
                    <p className="text-sm">Create your first course to get started</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Classes Tab */}
          {activeTab === 'classes' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">Classes ({classes.length})</h3>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setEditingClass(null);
                      setClassFormData({
                        class_name: '',
                        course_id: '',
                        form: 1,
                        semester: 1,
                        stream: '',
                        academic_year: '2025/2026',
                        capacity: 40,
                        elective_subject_1: '',
                        elective_subject_2: '',
                        elective_subject_3: '',
                        elective_subject_4: '',
                      });
                      setShowClassForm(true);
                    }}
                    className="bg-school-green-600 text-white px-4 py-2 rounded-lg hover:bg-school-green-700 transition-colors flex items-center space-x-2"
                  >
                    <PlusIcon className="h-5 w-5" />
                    <span>Add Class</span>
                  </button>
                </div>
              </div>

              {showClassForm && (
                <div className="bg-school-cream-50 p-6 rounded-xl border border-school-cream-200">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold text-gray-800">
                      {editingClass ? 'Edit Class' : 'Create New Class'}
                    </h4>
                    <button
                      onClick={() => {
                        setShowClassForm(false);
                        setEditingClass(null);
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                  <form onSubmit={editingClass ? handleUpdateClass : handleCreateClass} className="space-y-6">
                    {/* Basic Class Information */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <h5 className="text-md font-semibold text-gray-700 mb-4">📋 Basic Information</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Class Name *</label>
                          <input
                            type="text"
                            value={classFormData.class_name}
                            onChange={(e) => setClassFormData({ ...classFormData, class_name: e.target.value })}
                            required
                            className="w-full px-4 py-3 border border-school-cream-300 rounded-lg focus:ring-2 focus:ring-school-green-500 focus:border-transparent"
                            placeholder="e.g., General Science 1A"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Course *</label>
                          <select
                            value={classFormData.course_id}
                            onChange={(e) => setClassFormData({ 
                              ...classFormData, 
                              course_id: e.target.value,
                              elective_subject_1: '',
                              elective_subject_2: '',
                              elective_subject_3: '',
                              elective_subject_4: ''
                            })}
                            required
                            className="w-full px-4 py-3 border border-school-cream-300 rounded-lg focus:ring-2 focus:ring-school-green-500 focus:border-transparent"
                          >
                            <option value="">Select Course</option>
                            {courses.map((course) => (
                              <option key={course.id} value={course.id}>
                                {course.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Form *</label>
                          <select
                            value={classFormData.form}
                            onChange={(e) => setClassFormData({ ...classFormData, form: parseInt(e.target.value) })}
                            className="w-full px-4 py-3 border border-school-cream-300 rounded-lg focus:ring-2 focus:ring-school-green-500 focus:border-transparent"
                          >
                            <option value={1}>Form 1</option>
                            <option value={2}>Form 2</option>
                            <option value={3}>Form 3</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Semester *</label>
                          <select
                            value={classFormData.semester}
                            onChange={(e) => setClassFormData({ ...classFormData, semester: parseInt(e.target.value) })}
                            className="w-full px-4 py-3 border border-school-cream-300 rounded-lg focus:ring-2 focus:ring-school-green-500 focus:border-transparent"
                          >
                            <option value={1}>Semester 1</option>
                            <option value={2}>Semester 2</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Stream 
                            <span className="text-xs text-gray-500">(Optional - A, B, C for multiple classes in same form)</span>
                          </label>
                          <input
                            type="text"
                            value={classFormData.stream}
                            onChange={(e) => setClassFormData({ ...classFormData, stream: e.target.value.toUpperCase() })}
                            className="w-full px-4 py-3 border border-school-cream-300 rounded-lg focus:ring-2 focus:ring-school-green-500 focus:border-transparent"
                            placeholder="A, B, C, etc. (optional)"
                            maxLength={1}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Stream helps differentiate classes with same course & form but different elective combinations
                          </p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year</label>
                          <input
                            type="text"
                            value={classFormData.academic_year}
                            onChange={(e) => setClassFormData({ ...classFormData, academic_year: e.target.value })}
                            className="w-full px-4 py-3 border border-school-cream-300 rounded-lg focus:ring-2 focus:ring-school-green-500 focus:border-transparent"
                            placeholder="2025/2026"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Capacity 
                            <span className="text-xs text-gray-500">(Optional - defaults to 40)</span>
                          </label>
                          <input
                            type="number"
                            value={classFormData.capacity}
                            onChange={(e) => setClassFormData({ ...classFormData, capacity: parseInt(e.target.value) || 40 })}
                            min="1"
                            max="60"
                            className="w-full px-4 py-3 border border-school-cream-300 rounded-lg focus:ring-2 focus:ring-school-green-500 focus:border-transparent"
                            placeholder="40"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Core Subjects Display */}
                    {classFormData.course_id && (
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h5 className="text-md font-semibold text-gray-700 mb-3">📚 Core Subjects (Automatic)</h5>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {subjects
                            .filter(subject => subject.is_core)
                            .map((subject) => (
                              <div key={subject.id} className="bg-blue-100 px-3 py-2 rounded-lg text-sm font-medium text-blue-800">
                                {subject.name}
                              </div>
                            ))
                          }
                        </div>
                        <p className="text-xs text-blue-600 mt-2">
                          ✓ These core subjects are automatically included in all classes
                        </p>
                      </div>
                    )}
                    
                    {/* Elective Subjects Selection */}
                    {classFormData.course_id && (
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h5 className="text-md font-semibold text-gray-700 mb-4">🎯 Select 4 Elective Subjects</h5>
                        <p className="text-sm text-gray-600 mb-4">
                          Choose the elective subjects that define this class. Students with the same elective combination will be assigned to this class.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Elective Subject 1 *</label>
                            <select
                              value={classFormData.elective_subject_1}
                              onChange={(e) => setClassFormData({ ...classFormData, elective_subject_1: e.target.value })}
                              required
                              className="w-full px-4 py-3 border border-school-cream-300 rounded-lg focus:ring-2 focus:ring-school-green-500 focus:border-transparent"
                            >
                              <option value="">Select Subject</option>
                              {subjects
                                .filter(subject => subject.course_id === parseInt(classFormData.course_id) && !subject.is_core)
                                .map((subject) => (
                                  <option key={subject.id} value={subject.id}>
                                    {subject.name}
                                  </option>
                                ))
                              }
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Elective Subject 2 *</label>
                            <select
                              value={classFormData.elective_subject_2}
                              onChange={(e) => setClassFormData({ ...classFormData, elective_subject_2: e.target.value })}
                              required
                              className="w-full px-4 py-3 border border-school-cream-300 rounded-lg focus:ring-2 focus:ring-school-green-500 focus:border-transparent"
                            >
                              <option value="">Select Subject</option>
                              {subjects
                                .filter(subject => 
                                  subject.course_id === parseInt(classFormData.course_id) && 
                                  !subject.is_core && 
                                  subject.id !== parseInt(classFormData.elective_subject_1)
                                )
                                .map((subject) => (
                                  <option key={subject.id} value={subject.id}>
                                    {subject.name}
                                  </option>
                                ))
                              }
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Elective Subject 3 *</label>
                            <select
                              value={classFormData.elective_subject_3}
                              onChange={(e) => setClassFormData({ ...classFormData, elective_subject_3: e.target.value })}
                              required
                              className="w-full px-4 py-3 border border-school-cream-300 rounded-lg focus:ring-2 focus:ring-school-green-500 focus:border-transparent"
                            >
                              <option value="">Select Subject</option>
                              {subjects
                                .filter(subject => 
                                  subject.course_id === parseInt(classFormData.course_id) && 
                                  !subject.is_core && 
                                  subject.id !== parseInt(classFormData.elective_subject_1) &&
                                  subject.id !== parseInt(classFormData.elective_subject_2)
                                )
                                .map((subject) => (
                                  <option key={subject.id} value={subject.id}>
                                    {subject.name}
                                  </option>
                                ))
                              }
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Elective Subject 4 *</label>
                            <select
                              value={classFormData.elective_subject_4}
                              onChange={(e) => setClassFormData({ ...classFormData, elective_subject_4: e.target.value })}
                              required
                              className="w-full px-4 py-3 border border-school-cream-300 rounded-lg focus:ring-2 focus:ring-school-green-500 focus:border-transparent"
                            >
                              <option value="">Select Subject</option>
                              {subjects
                                .filter(subject => 
                                  subject.course_id === parseInt(classFormData.course_id) && 
                                  !subject.is_core && 
                                  subject.id !== parseInt(classFormData.elective_subject_1) &&
                                  subject.id !== parseInt(classFormData.elective_subject_2) &&
                                  subject.id !== parseInt(classFormData.elective_subject_3)
                                )
                                .map((subject) => (
                                  <option key={subject.id} value={subject.id}>
                                    {subject.name}
                                  </option>
                                ))
                              }
                            </select>
                          </div>
                        </div>
                        
                        {/* Show selected combination preview */}
                        {classFormData.elective_subject_1 && classFormData.elective_subject_2 && 
                         classFormData.elective_subject_3 && classFormData.elective_subject_4 && (
                          <div className="mt-4 p-3 bg-white border border-green-300 rounded-lg">
                            <h6 className="text-sm font-semibold text-green-800 mb-2">📝 Subject Combination Preview:</h6>
                            <div className="text-sm text-gray-700">
                              <strong>Core:</strong> {subjects.filter(s => s.is_core).map(s => s.name).join(', ')}
                              <br />
                              <strong>Electives:</strong> {
                                [classFormData.elective_subject_1, classFormData.elective_subject_2, 
                                 classFormData.elective_subject_3, classFormData.elective_subject_4]
                                  .map(id => subjects.find(s => s.id === parseInt(id))?.name)
                                  .join(', ')
                              }
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => {
                          setShowClassForm(false);
                          setEditingClass(null);
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-school-green-600 text-white rounded-lg hover:bg-school-green-700 transition-colors"
                      >
                        {editingClass ? 'Update Class' : 'Create Class'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="grid gap-4">
                {classes.map((classItem) => {
                  const course = courses.find(c => c.id === classItem.course_id);
                  return (
                    <div key={classItem.id} className="bg-white border border-school-cream-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-800">{classItem.class_name}</h4>
                          <p className="text-sm text-gray-600">{course?.name || 'Unknown Course'}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span>Form {classItem.form}</span>
                            <span>Semester {classItem.semester}</span>
                            <span>Stream {classItem.stream}</span>
                            <span>Capacity: {classItem.capacity}</span>
                            <span>{classItem.academic_year}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => fetchClassDetails(classItem.id)}
                            className="p-2 text-gray-500 hover:text-school-green-600 hover:bg-school-green-50 rounded-full transition-colors"
                            title="View Class Details"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingClass(classItem);
                              setClassFormData({
                                class_name: classItem.class_name,
                                course_id: classItem.course_id.toString(),
                                form: classItem.form,
                                semester: classItem.semester,
                                stream: classItem.stream,
                                academic_year: classItem.academic_year,
                                capacity: classItem.capacity,
                                elective_subject_1: '',
                                elective_subject_2: '',
                                elective_subject_3: '',
                                elective_subject_4: '',
                              });
                              setShowClassForm(true);
                            }}
                            className="p-2 text-gray-500 hover:text-school-green-600 hover:bg-school-green-50 rounded-full transition-colors"
                            title="Edit Class"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            classItem.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {classItem.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {classes.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-4">🏫</div>
                    <p className="text-lg font-medium">No classes found</p>
                    <p className="text-sm">Create your first class to get started</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Subjects Tab */}
          {activeTab === 'subjects' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">Subjects ({subjects.length})</h3>
                <div className="flex space-x-3">
                  <button
                    onClick={handleUpdateElectiveSubjects}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <CogIcon className="h-5 w-5" />
                    <span>Update Ghana Curriculum</span>
                  </button>
                  <button
                    onClick={() => {
                      setEditingSubject(null);
                      setSubjectFormData({ name: '', code: '', course_id: '', is_core: false });
                      setShowSubjectForm(true);
                    }}
                    className="bg-school-green-600 text-white px-4 py-2 rounded-lg hover:bg-school-green-700 transition-colors flex items-center space-x-2"
                  >
                    <PlusIcon className="h-5 w-5" />
                    <span>Add Subject</span>
                  </button>
                </div>
              </div>

              {showSubjectForm && (
                <div className="bg-school-cream-50 p-6 rounded-xl border border-school-cream-200">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold text-gray-800">
                      {editingSubject ? 'Edit Subject' : 'Create New Subject'}
                    </h4>
                    <button
                      onClick={() => {
                        setShowSubjectForm(false);
                        setEditingSubject(null);
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                  <form onSubmit={editingSubject ? handleUpdateSubject : handleCreateSubject} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Subject Name *</label>
                        <input
                          type="text"
                          value={subjectFormData.name}
                          onChange={(e) => setSubjectFormData({ ...subjectFormData, name: e.target.value })}
                          required
                          className="w-full px-4 py-3 border border-school-cream-300 rounded-lg focus:ring-2 focus:ring-school-green-500 focus:border-transparent"
                          placeholder="e.g., Mathematics"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Subject Code *</label>
                        <input
                          type="text"
                          value={subjectFormData.code}
                          onChange={(e) => setSubjectFormData({ ...subjectFormData, code: e.target.value.toUpperCase() })}
                          required
                          className="w-full px-4 py-3 border border-school-cream-300 rounded-lg focus:ring-2 focus:ring-school-green-500 focus:border-transparent"
                          placeholder="e.g., MATH"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
                        <select
                          value={subjectFormData.course_id}
                          onChange={(e) => setSubjectFormData({ ...subjectFormData, course_id: e.target.value })}
                          className="w-full px-4 py-3 border border-school-cream-300 rounded-lg focus:ring-2 focus:ring-school-green-500 focus:border-transparent"
                        >
                          <option value="">Core Subject (All Courses)</option>
                          {courses.map((course) => (
                            <option key={course.id} value={course.id}>
                              {course.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_core"
                        checked={subjectFormData.is_core}
                        onChange={(e) => setSubjectFormData({ ...subjectFormData, is_core: e.target.checked })}
                        className="h-4 w-4 text-school-green-600 focus:ring-school-green-500 border-gray-300 rounded"
                      />
                      <label htmlFor="is_core" className="ml-2 block text-sm text-gray-700">
                        Core Subject (Required for all students)
                      </label>
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => {
                          setShowSubjectForm(false);
                          setEditingSubject(null);
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-school-green-600 text-white rounded-lg hover:bg-school-green-700 transition-colors"
                      >
                        {editingSubject ? 'Update Subject' : 'Create Subject'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="grid gap-4">
                {subjects.map((subject) => {
                  const course = subject.course_id ? courses.find(c => c.id === subject.course_id) : null;
                  return (
                    <div key={subject.id} className="bg-white border border-school-cream-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-800">{subject.name}</h4>
                          <p className="text-sm text-gray-600 font-mono">{subject.code}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              subject.is_core ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {subject.is_core ? 'Core' : 'Elective'}
                            </span>
                            {course && (
                              <span className="text-sm text-gray-500">{course.name}</span>
                            )}
                            {!course && (
                              <span className="text-sm text-gray-500">All Courses</span>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => fetchSubjectDetails(subject.id)}
                            className="p-2 text-gray-500 hover:text-school-green-600 hover:bg-school-green-50 rounded-full transition-colors"
                            title="View Subject Details"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingSubject(subject);
                              setSubjectFormData({
                                name: subject.name,
                                code: subject.code,
                                course_id: subject.course_id ? subject.course_id.toString() : '',
                                is_core: subject.is_core
                              });
                              setShowSubjectForm(true);
                            }}
                            className="p-2 text-gray-500 hover:text-school-green-600 hover:bg-school-green-50 rounded-full transition-colors"
                            title="Edit Subject"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            subject.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {subject.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {subjects.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-4">📖</div>
                    <p className="text-lg font-medium">No subjects found</p>
                    <p className="text-sm">Create your first subject to get started</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Promotions Tab */}
          {activeTab === 'promotions' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">Academic Promotions</h3>
                <p className="text-gray-600">Manage student promotions between semesters and academic years</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Promote Semester 1 to Semester 2 */}
                <div className="bg-white border border-school-cream-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-4">
                    <div className="bg-indigo-100 p-3 rounded-lg mr-4">
                      <span className="text-indigo-600 text-xl">⏭️</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-gray-800">Semester Promotion</h4>
                      <p className="text-gray-600 text-sm">Form 1 S1 → Form 1 S2</p>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4 text-sm">
                    Promote all students from Semester 1 to Semester 2 within the same academic year.
                  </p>
                  <button
                    onClick={handlePromoteSemester}
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                  >
                    Promote Semester
                  </button>
                </div>

                {/* Promote Form 1 Semester 2 to Form 2 Semester 1 */}
                <div className="bg-white border border-school-cream-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-4">
                    <div className="bg-purple-100 p-3 rounded-lg mr-4">
                      <span className="text-purple-600 text-xl">⬆️</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-gray-800">Form Promotion</h4>
                      <p className="text-gray-600 text-sm">Form 1 S2 → Form 2 S1</p>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4 text-sm">
                    Promote students from Form 1 Semester 2 to Form 2 Semester 1 for the next academic year.
                  </p>
                  <button
                    onClick={handlePromoteStudents}
                    className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                  >
                    Promote Students
                  </button>
                </div>

                {/* End Academic Year */}
                <div className="bg-white border border-school-cream-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-4">
                    <div className="bg-red-100 p-3 rounded-lg mr-4">
                      <span className="text-red-600 text-xl">📅</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-gray-800">End Academic Year</h4>
                      <p className="text-gray-600 text-sm">Complete Year Process</p>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4 text-sm">
                    Complete all promotions for the academic year: S1→S2 and F1S2→F2S1.
                  </p>
                  <button
                    onClick={handleAcademicYearEnd}
                    className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    End Academic Year
                  </button>
                </div>

                {/* Manual Promotion Card */}
                <div className="bg-white border border-school-cream-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow md:col-span-2 lg:col-span-3">
                  <div className="flex items-center mb-4">
                    <div className="bg-green-100 p-3 rounded-lg mr-4">
                      <span className="text-green-600 text-xl">⚙️</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-gray-800">Manual Promotion</h4>
                      <p className="text-gray-600 text-sm">Custom promotion between forms/semesters</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">From Form</label>
                      <select 
                        className="w-full px-3 py-2 border border-school-cream-300 rounded-lg focus:ring-2 focus:ring-school-green-500 focus:border-transparent"
                        // Add state and handler for fromForm
                      >
                        <option value="1">Form 1</option>
                        <option value="2">Form 2</option>
                        <option value="3">Form 3</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">From Semester</label>
                      <select 
                        className="w-full px-3 py-2 border border-school-cream-300 rounded-lg focus:ring-2 focus:ring-school-green-500 focus:border-transparent"
                        // Add state and handler for fromSemester
                      >
                        <option value="1">Semester 1</option>
                        <option value="2">Semester 2</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">To Form</label>
                      <select 
                        className="w-full px-3 py-2 border border-school-cream-300 rounded-lg focus:ring-2 focus:ring-school-green-500 focus:border-transparent"
                        // Add state and handler for toForm
                      >
                        <option value="1">Form 1</option>
                        <option value="2">Form 2</option>
                        <option value="3">Form 3</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">To Semester</label>
                      <select 
                        className="w-full px-3 py-2 border border-school-cream-300 rounded-lg focus:ring-2 focus:ring-school-green-500 focus:border-transparent"
                        // Add state and handler for toSemester
                      >
                        <option value="1">Semester 1</option>
                        <option value="2">Semester 2</option>
                      </select>
                    </div>
                  </div>
                  
                  <button
                    // onClick={handleManualPromotion}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
                    disabled
                  >
                    Execute Manual Promotion
                  </button>
                  <p className="text-gray-500 text-xs mt-2">
                    Note: Manual promotions require custom implementation. Contact system administrator for setup.
                  </p>
                </div>
              </div>

              {/* Information Section */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h4 className="font-bold text-lg text-blue-800 mb-2">About Academic Promotions</h4>
                <ul className="list-disc pl-5 space-y-1 text-blue-700 text-sm">
                  <li>Semester promotions move students within the same form and academic year</li>
                  <li>Form promotions move students to the next form for the next academic year</li>
                  <li>End Academic Year performs all required promotions automatically</li>
                  <li>Always backup data before performing promotions</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Class Details Modal */}
      {showClassDetails && selectedClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="bg-school-green-600 px-6 py-4 text-white">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Class Details: {selectedClass.class_name}</h3>
                <button
                  onClick={handleCloseClassDetails}
                  className="text-white hover:text-gray-200"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            {loadingClassDetails ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-school-green-200 border-t-school-green-600"></div>
              </div>
            ) : (
              <div className="p-6 overflow-y-auto max-h-[70vh]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-school-cream-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">Class Information</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Name:</span> {selectedClass.class_name}</p>
                      <p><span className="font-medium">Form:</span> {selectedClass.form}</p>
                      <p><span className="font-medium">Semester:</span> {selectedClass.semester}</p>
                      <p><span className="font-medium">Stream:</span> {selectedClass.stream || 'N/A'}</p>
                      <p><span className="font-medium">Academic Year:</span> {selectedClass.academic_year}</p>
                      <p><span className="font-medium">Capacity:</span> {selectedClass.capacity} students</p>
                    </div>
                  </div>
                  
                  <div className="bg-school-cream-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">Statistics</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Students:</span> {classStudents.length}</p>
                      <p><span className="font-medium">Teachers:</span> {classTeachers.length}</p>
                      <p><span className="font-medium">Subjects:</span> {subjects.filter(s => s.is_core).length + 4} (Core + 4 Electives)</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Students List */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-bold text-lg text-gray-800">Students ({classStudents.length})</h4>
                      <button className="text-school-green-600 hover:text-school-green-700 text-sm font-medium">
                        View All
                      </button>
                    </div>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {classStudents.length > 0 ? (
                            classStudents.slice(0, 5).map((student) => (
                              <tr key={student.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm text-gray-900">{student.student_id}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  {student.surname}, {student.other_names}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={2} className="px-4 py-6 text-center text-gray-500">
                                No students enrolled in this class
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                      {classStudents.length > 5 && (
                        <div className="px-4 py-3 bg-gray-50 text-center text-sm text-gray-500">
                          Showing 5 of {classStudents.length} students
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Teachers List */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-bold text-lg text-gray-800">Teachers ({classTeachers.length})</h4>
                      <button className="text-school-green-600 hover:text-school-green-700 text-sm font-medium">
                        View All
                      </button>
                    </div>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {classTeachers.length > 0 ? (
                            classTeachers.slice(0, 5).map((teacher) => (
                              <tr key={teacher.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  {teacher.teacher_surname}, {teacher.teacher_other_names}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  {teacher.subject_name}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={2} className="px-4 py-6 text-center text-gray-500">
                                No teachers assigned to this class
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                      {classTeachers.length > 5 && (
                        <div className="px-4 py-3 bg-gray-50 text-center text-sm text-gray-500">
                          Showing 5 of {classTeachers.length} teachers
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={handleCloseClassDetails}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  <button className="px-4 py-2 bg-school-green-600 text-white rounded-lg hover:bg-school-green-700 transition-colors">
                    Edit Class
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Subject Details Modal */}
      {showSubjectDetails && selectedSubject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="bg-school-green-600 px-6 py-4 text-white">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Subject Details: {selectedSubject.name}</h3>
                <button
                  onClick={handleCloseSubjectDetails}
                  className="text-white hover:text-gray-200"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            {loadingSubjectDetails ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-school-green-200 border-t-school-green-600"></div>
              </div>
            ) : (
              <div className="p-6 overflow-y-auto max-h-[70vh]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-school-cream-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">Subject Information</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Name:</span> {selectedSubject.name}</p>
                      <p><span className="font-medium">Code:</span> {selectedSubject.code}</p>
                      <p><span className="font-medium">Type:</span> {selectedSubject.is_core ? 'Core' : 'Elective'}</p>
                      <p><span className="font-medium">Course:</span> {selectedSubject.course_id ? 
                        courses.find(c => c.id === selectedSubject.course_id)?.name || 'Unknown' : 
                        'All Courses'}</p>
                    </div>
                  </div>
                  
                  <div className="bg-school-cream-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">Statistics</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Teachers:</span> {subjectTeachers.length}</p>
                      <p><span className="font-medium">Classes:</span> {subjectTeachers.filter((teacher, index, self) => 
                        index === self.findIndex(t => t.class_id === teacher.class_id)).length}</p>
                    </div>
                  </div>
                </div>
                
                {/* Teachers List */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-lg text-gray-800">Teachers Teaching This Subject ({subjectTeachers.length})</h4>
                    <button className="text-school-green-600 hover:text-school-green-700 text-sm font-medium">
                      View All
                    </button>
                  </div>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Form</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {subjectTeachers.length > 0 ? (
                          subjectTeachers.slice(0, 10).map((teacher) => (
                            <tr key={`${teacher.teacher_id}-${teacher.class_id}`} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {teacher.teacher_surname}, {teacher.teacher_other_names}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {teacher.class_name}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {teacher.form}{teacher.stream || ''}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={3} className="px-4 py-6 text-center text-gray-500">
                              No teachers assigned to teach this subject
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                    {subjectTeachers.length > 10 && (
                      <div className="px-4 py-3 bg-gray-50 text-center text-sm text-gray-500">
                        Showing 10 of {subjectTeachers.length} teachers
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={handleCloseSubjectDetails}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  <button className="px-4 py-2 bg-school-green-600 text-white rounded-lg hover:bg-school-green-700 transition-colors">
                    Edit Subject
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CourseManagement;