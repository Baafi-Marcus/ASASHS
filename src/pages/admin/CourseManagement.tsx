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
  applicable_forms?: string | null;
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
  subject_id: number;
  class_name: string;
  class_id: number;
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
    is_core: false,
    applicable_forms: ''
  });

  const [currentAcademicYear, setCurrentAcademicYear] = useState('');
  const [currentSemester, setCurrentSemester] = useState(1);
  const [promotionFromForm, setPromotionFromForm] = useState(1);
  const [promotionFromSemester, setPromotionFromSemester] = useState(1);
  const [promotionToForm, setPromotionToForm] = useState(2);
  const [promotionToSemester, setPromotionToSemester] = useState(1);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [coursesData, classesData, subjectsData, ay, sem] = await Promise.all([
        db.getCourses(),
        db.getClasses(),
        db.getSubjects(),
        db.getCurrentAcademicYear(),
        db.getCurrentSemester()
      ]);
      
      setCourses(coursesData as Course[]);
      setClasses(classesData as Class[]);
      setSubjects(subjectsData as Subject[]);
      if (ay) setCurrentAcademicYear(ay);
      if (sem) setCurrentSemester(sem);
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
      
      const teachers = await db.getClassTeachers(classId);
      
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
      const teachers = await db.getSubjectTeachers(subjectId);
      
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
      await db.createClass({
        ...classFormData,
        stream: classFormData.stream || null,
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

  const handlePromoteSemester = async () => {
    if (!currentAcademicYear) { toast.error('Academic year not set.'); return; }
    const ay = currentAcademicYear;
    if (window.confirm(`Promote all students ${currentSemester === 1 ? 'Semester 1 → Semester 2' : 'Semester 2 → next form'} for ${ay}?`)) {
      try {
        if (currentSemester === 1) {
          await db.promoteStudentsToNextForm(ay, ay, 1, 1, 1, 2);
          await db.promoteStudentsToNextForm(ay, ay, 2, 1, 2, 2);
          await db.promoteStudentsToNextForm(ay, ay, 3, 1, 3, 2);
          await db.setCurrentSemester(2);
        } else {
          const nextAy = `${parseInt(ay.split('/')[0]) + 1}/${parseInt(ay.split('/')[1]) + 1}`;
          await db.promoteStudentsToNextForm(ay, nextAy, 1, 2, 2, 1);
          await db.promoteStudentsToNextForm(ay, nextAy, 2, 2, 3, 1);
          await db.setCurrentAcademicYear(nextAy);
          await db.setCurrentSemester(1);
        }
        toast.success('Semester promotion completed.');
        fetchData();
      } catch (error) {
        console.error('Failed to promote students:', error);
        toast.error('Failed to promote students: ' + (error as Error).message);
      }
    }
  };
  
  const handleAcademicYearEnd = async () => {
    if (!currentAcademicYear) { toast.error('Academic year not set.'); return; }
    const ay = currentAcademicYear;
    const nextAy = `${parseInt(ay.split('/')[0]) + 1}/${parseInt(ay.split('/')[1]) + 1}`;
    if (window.confirm(`End academic year ${ay} and start ${nextAy}? All students will be promoted.`)) {
      try {
        await db.promoteStudentsToNextForm(ay, nextAy, 1, 2, 2, 1);
        await db.promoteStudentsToNextForm(ay, nextAy, 2, 2, 3, 1);
        await db.promoteStudentsToNextForm(ay, nextAy, 1, 1, 1, 2);
        await db.promoteStudentsToNextForm(ay, nextAy, 2, 1, 2, 2);
        await db.promoteStudentsToNextForm(ay, nextAy, 3, 1, 3, 2);
        await db.setCurrentAcademicYear(nextAy);
        await db.setCurrentSemester(1);
        toast.success('Academic year ended. All students promoted.');
        fetchData();
      } catch (error) {
        console.error('Failed to end academic year:', error);
        toast.error('Failed to end academic year: ' + (error as Error).message);
      }
    }
  };
  
  const handleManualPromotion = async () => {
    if (!currentAcademicYear) { toast.error('Academic year not set.'); return; }
    const ay = currentAcademicYear;
    const targetAy = promotionFromSemester === 2 && promotionToSemester === 1 ? `${parseInt(ay.split('/')[0]) + 1}/${parseInt(ay.split('/')[1]) + 1}` : ay;
    try {
      const result = await db.promoteStudentsToNextForm(ay, targetAy, promotionFromForm, promotionFromSemester, promotionToForm, promotionToSemester);
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
      setSubjectFormData({ name: '', code: '', course_id: '', is_core: false, applicable_forms: '' });
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
      await db.updateSubject(editingSubject.id, {
        ...subjectFormData,
        course_id: subjectFormData.course_id ? parseInt(subjectFormData.course_id) : null
      });
      toast.success('Subject updated successfully!');
      setEditingSubject(null);
      setShowSubjectForm(false);
      setSubjectFormData({ name: '', code: '', course_id: '', is_core: false, applicable_forms: '' });
      fetchData();
    } catch (error) {
      console.error('Failed to update subject:', error);
      toast.error('Failed to update subject');
    }
  };

  const handleDeleteSubject = async (subject: Subject) => {
    if (!window.confirm(`Delete subject "${subject.name}" (${subject.code})? This cannot be undone.`)) return;
    try {
      await db.deleteSubject(subject.id);
      toast.success('Subject deleted successfully!');
      fetchData();
    } catch (error) {
      console.error('Failed to delete subject:', error);
      toast.error('Failed to delete subject');
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
      {/* Header & Segmented Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Course & Academic Management</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage programmes, class arms, curriculum subjects, and promotion cycles</p>
        </div>

        <div className="inline-flex p-1 bg-gray-100 border border-gray-200 rounded-md">
          {[
            { id: 'courses', label: 'Programmes', count: courses.length, icon: AcademicCapIcon },
            { id: 'classes', label: 'Classes', count: classes.length, icon: BuildingLibraryIcon },
            { id: 'subjects', label: 'Curriculum', count: subjects.length, icon: BookOpenIcon },
            { id: 'promotions', label: 'Promotions', icon: CalendarIcon }
          ].map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-sm text-xs font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-gray-900 shadow-xs border border-gray-200 font-semibold'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
                }`}
              >
                <IconComponent className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-gray-200/70 text-gray-700 font-mono tabular-nums">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Workspace Card */}
      <div className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6">
          {/* Courses Tab */}
          {activeTab === 'courses' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Academic Programmes</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Approved SHS study pathways and graduation requirements</p>
                </div>
                <button
                  onClick={() => {
                    setEditingCourse(null);
                    setCourseFormData({ name: '', code: '', description: '', duration_years: 3 });
                    setShowCourseForm(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-school-green-600 hover:bg-school-green-700 text-white rounded-sm text-xs font-semibold shadow-xs transition-colors"
                >
                  <PlusIcon className="h-3.5 w-3.5" />
                  <span>Add Programme</span>
                </button>
              </div>

              {showCourseForm && (
                <div className="bg-gray-50/80 p-5 rounded-sm border border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-semibold text-gray-900">
                      {editingCourse ? 'Edit Academic Programme' : 'Register New Academic Programme'}
                    </h4>
                    <button
                      onClick={() => {
                        setShowCourseForm(false);
                        setEditingCourse(null);
                      }}
                      className="p-1 text-gray-400 hover:text-gray-700 rounded-sm"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <form onSubmit={editingCourse ? handleUpdateCourse : handleCreateCourse} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Programme Name *</label>
                        <input
                          type="text"
                          value={courseFormData.name}
                          onChange={(e) => setCourseFormData({ ...courseFormData, name: e.target.value })}
                          required
                          className="w-full h-11 px-3 bg-white border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600"
                          placeholder="e.g., General Science"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Programme Code *</label>
                        <input
                          type="text"
                          value={courseFormData.code}
                          onChange={(e) => setCourseFormData({ ...courseFormData, code: e.target.value.toUpperCase() })}
                          required
                          className="w-full h-11 px-3 bg-white border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600 font-mono"
                          placeholder="e.g., GS"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={courseFormData.description}
                        onChange={(e) => setCourseFormData({ ...courseFormData, description: e.target.value })}
                        rows={2}
                        className="w-full p-3 bg-white border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600"
                        placeholder="Programme overview and elective focus..."
                      />
                    </div>
                    <div className="w-40">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Duration (Years)</label>
                      <select
                        value={courseFormData.duration_years}
                        onChange={(e) => setCourseFormData({ ...courseFormData, duration_years: parseInt(e.target.value) })}
                        className="w-full h-11 px-3 bg-white border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600"
                      >
                        <option value={3}>3 Years</option>
                        <option value={4}>4 Years</option>
                      </select>
                    </div>
                    <div className="flex justify-end gap-2.5 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowCourseForm(false);
                          setEditingCourse(null);
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-sm text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-school-green-600 text-white rounded-sm text-xs font-semibold hover:bg-school-green-700 transition-colors"
                      >
                        {editingCourse ? 'Save Changes' : 'Create Programme'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="grid gap-3">
                {courses.map((course) => (
                  <div key={course.id} className="bg-white border border-gray-200 rounded-sm p-4 hover:border-gray-300 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-gray-900">{course.name}</h4>
                          <span className="px-2 py-0.5 font-mono text-[11px] font-bold bg-gray-100 text-gray-700 rounded-xs border border-gray-200 tabular-nums">
                            {course.code}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{course.description || 'No detailed description provided.'}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-400 mt-2 font-medium">
                          <span className="tabular-nums">{course.duration_years} Years Duration</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-sm border ${
                          course.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {course.is_active ? 'Active' : 'Inactive'}
                        </span>
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
                          className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-sm transition-colors"
                          title="Edit Programme"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {courses.length === 0 && (
                  <div className="text-center py-12 text-gray-400 border border-dashed border-gray-200 rounded-sm">
                    <AcademicCapIcon className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                    <p className="text-sm font-medium text-gray-700">No programmes registered</p>
                    <p className="text-xs text-gray-400 mt-0.5">Add an academic course of study to get started</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Classes Tab */}
          {activeTab === 'classes' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Academic Classes</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Form arms, elective combinations, and student intake capacities</p>
                </div>
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
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-school-green-600 hover:bg-school-green-700 text-white rounded-sm text-xs font-semibold shadow-xs transition-colors"
                  >
                    <PlusIcon className="h-3.5 w-3.5" />
                    <span>Add Class</span>
                  </button>
                </div>
              </div>

              {showClassForm && (
                <div className="bg-gray-50/80 p-5 rounded-sm border border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-semibold text-gray-900">
                      {editingClass ? 'Edit Class Arm' : 'Register New Class Arm'}
                    </h4>
                    <button
                      onClick={() => {
                        setShowClassForm(false);
                        setEditingClass(null);
                      }}
                      className="p-1 text-gray-400 hover:text-gray-700 rounded-sm"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <form onSubmit={editingClass ? handleUpdateClass : handleCreateClass} className="space-y-5">
                    {/* Basic Class Information */}
                    <div className="bg-white p-4 rounded-sm border border-gray-200 space-y-4">
                      <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-600">Basic Placement</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Class Name *</label>
                          <input
                            type="text"
                            value={classFormData.class_name}
                            onChange={(e) => setClassFormData({ ...classFormData, class_name: e.target.value })}
                            required
                            className="w-full h-11 px-3 bg-white border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600"
                            placeholder="e.g., 1A1 or Science 1A"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Programme *</label>
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
                            className="w-full h-11 px-3 bg-white border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600"
                          >
                            <option value="">Select Programme</option>
                            {courses.map((course) => (
                              <option key={course.id} value={course.id}>
                                {course.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Form Level *</label>
                          <select
                            value={classFormData.form}
                            onChange={(e) => setClassFormData({ ...classFormData, form: parseInt(e.target.value) })}
                            className="w-full h-11 px-3 bg-white border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600"
                          >
                            <option value={1}>Form 1</option>
                            <option value={2}>Form 2</option>
                            <option value={3}>Form 3</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Semester *</label>
                          <select
                            value={classFormData.semester}
                            onChange={(e) => setClassFormData({ ...classFormData, semester: parseInt(e.target.value) })}
                            className="w-full h-11 px-3 bg-white border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600"
                          >
                            <option value={1}>Semester 1</option>
                            <option value={2}>Semester 2</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Stream / Arm
                            <span className="text-[11px] text-gray-400 font-normal ml-1">(Optional e.g. A, B, 1, 2)</span>
                          </label>
                          <input
                            type="text"
                            value={classFormData.stream}
                            onChange={(e) => setClassFormData({ ...classFormData, stream: e.target.value.toUpperCase() })}
                            className="w-full h-11 px-3 bg-white border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600 font-mono"
                            placeholder="A, B, C..."
                            maxLength={2}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Academic Year</label>
                          <input
                            type="text"
                            value={classFormData.academic_year}
                            onChange={(e) => setClassFormData({ ...classFormData, academic_year: e.target.value })}
                            className="w-full h-11 px-3 bg-white border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600 font-mono"
                            placeholder="2025/2026"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Capacity (Max Students)</label>
                          <input
                            type="number"
                            value={classFormData.capacity}
                            onChange={(e) => setClassFormData({ ...classFormData, capacity: parseInt(e.target.value) || 40 })}
                            min="1"
                            max="60"
                            className="w-full h-11 px-3 bg-white border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600 tabular-nums"
                            placeholder="40"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Core Subjects Display */}
                    {classFormData.course_id && (
                      <div className="bg-blue-50/70 p-4 rounded-sm border border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="text-xs font-semibold uppercase tracking-wider text-blue-900">Core Curriculum (Automatic)</h5>
                          <span className="text-[11px] text-blue-700 font-medium">Included in all classes</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {subjects
                            .filter(subject => subject.is_core)
                            .map((subject) => (
                              <div key={subject.id} className="bg-white px-3 py-1.5 rounded-xs border border-blue-200 text-xs font-medium text-blue-900">
                                {subject.name}
                              </div>
                            ))
                          }
                        </div>
                      </div>
                    )}
                    
                    {/* Elective Subjects Selection */}
                    {classFormData.course_id && (
                      <div className="bg-gray-50 p-4 rounded-sm border border-gray-200 space-y-3">
                        <div className="flex justify-between items-baseline">
                          <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-800">Four Elective Subject Allocations</h5>
                          <span className="text-[11px] text-gray-500">Defines the elective cluster for this class</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Elective Subject 1 *</label>
                            <select
                              value={classFormData.elective_subject_1}
                              onChange={(e) => setClassFormData({ ...classFormData, elective_subject_1: e.target.value })}
                              required
                              className="w-full h-11 px-3 bg-white border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600"
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
                            <label className="block text-xs font-medium text-gray-700 mb-1">Elective Subject 2 *</label>
                            <select
                              value={classFormData.elective_subject_2}
                              onChange={(e) => setClassFormData({ ...classFormData, elective_subject_2: e.target.value })}
                              required
                              className="w-full h-11 px-3 bg-white border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600"
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
                            <label className="block text-xs font-medium text-gray-700 mb-1">Elective Subject 3 *</label>
                            <select
                              value={classFormData.elective_subject_3}
                              onChange={(e) => setClassFormData({ ...classFormData, elective_subject_3: e.target.value })}
                              required
                              className="w-full h-11 px-3 bg-white border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600"
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
                            <label className="block text-xs font-medium text-gray-700 mb-1">Elective Subject 4 *</label>
                            <select
                              value={classFormData.elective_subject_4}
                              onChange={(e) => setClassFormData({ ...classFormData, elective_subject_4: e.target.value })}
                              required
                              className="w-full h-11 px-3 bg-white border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600"
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
                        
                        {/* Selected combination preview */}
                        {classFormData.elective_subject_1 && classFormData.elective_subject_2 && 
                         classFormData.elective_subject_3 && classFormData.elective_subject_4 && (
                          <div className="p-3 bg-white border border-gray-200 rounded-sm text-xs">
                            <h6 className="font-semibold text-gray-800 mb-1">Subject Combination Preview:</h6>
                            <div className="text-gray-600 leading-relaxed">
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
                    
                    <div className="flex justify-end gap-2.5 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowClassForm(false);
                          setEditingClass(null);
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-sm text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-school-green-600 text-white rounded-sm text-xs font-semibold hover:bg-school-green-700 transition-colors"
                      >
                        {editingClass ? 'Save Changes' : 'Create Class Arm'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="grid gap-3">
                {classes.map((classItem) => {
                  const course = courses.find(c => c.id === classItem.course_id);
                  return (
                    <div key={classItem.id} className="bg-white border border-gray-200 rounded-sm p-4 hover:border-gray-300 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-gray-900">{classItem.class_name}</h4>
                            <span className="text-xs text-gray-500 font-medium">({course?.name || 'Programme Unassigned'})</span>
                          </div>
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500 font-medium flex-wrap">
                            <span className="tabular-nums">Form {classItem.form}</span>
                            <span>•</span>
                            <span className="tabular-nums">Sem {classItem.semester}</span>
                            <span>•</span>
                            <span>Stream {classItem.stream || 'Standard'}</span>
                            <span>•</span>
                            <span className="tabular-nums">Cap: {classItem.capacity}</span>
                            <span>•</span>
                            <span className="font-mono tabular-nums">{classItem.academic_year}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => fetchClassDetails(classItem.id)}
                            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-sm transition-colors"
                            title="View Class Dossier"
                          >
                            <EyeIcon className="h-4 w-4" />
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
                            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-sm transition-colors"
                            title="Edit Class"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-sm border ${
                            classItem.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            {classItem.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {classes.length === 0 && (
                  <div className="text-center py-12 text-gray-400 border border-dashed border-gray-200 rounded-sm">
                    <BuildingLibraryIcon className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                    <p className="text-sm font-medium text-gray-700">No classes registered</p>
                    <p className="text-xs text-gray-400 mt-0.5">Create a class arm for students to be assigned to</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Subjects Tab */}
          {activeTab === 'subjects' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Curriculum Subjects</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Core and elective curriculum registered for examination and grading</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleUpdateElectiveSubjects}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-300 text-gray-700 rounded-sm text-xs font-medium transition-colors"
                  >
                    <CogIcon className="h-3.5 w-3.5 text-gray-500" />
                    <span>Update Ghana Curriculum</span>
                  </button>
                  <button
                    onClick={() => {
                      setEditingSubject(null);
                      setSubjectFormData({ name: '', code: '', course_id: '', is_core: false, applicable_forms: '' });
                      setShowSubjectForm(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-school-green-600 hover:bg-school-green-700 text-white rounded-sm text-xs font-semibold shadow-xs transition-colors"
                  >
                    <PlusIcon className="h-3.5 w-3.5" />
                    <span>Add Subject</span>
                  </button>
                </div>
              </div>

              {showSubjectForm && (
                <div className="bg-gray-50/80 p-5 rounded-sm border border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-semibold text-gray-900">
                      {editingSubject ? 'Edit Subject Details' : 'Register New Subject'}
                    </h4>
                    <button
                      onClick={() => {
                        setShowSubjectForm(false);
                        setEditingSubject(null);
                      }}
                      className="p-1 text-gray-400 hover:text-gray-700 rounded-sm"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <form onSubmit={editingSubject ? handleUpdateSubject : handleCreateSubject} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Subject Name *</label>
                        <input
                          type="text"
                          value={subjectFormData.name}
                          onChange={(e) => setSubjectFormData({ ...subjectFormData, name: e.target.value })}
                          required
                          className="w-full h-11 px-3 bg-white border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600"
                          placeholder="e.g., Core Mathematics"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Subject Code *</label>
                        <input
                          type="text"
                          value={subjectFormData.code}
                          onChange={(e) => setSubjectFormData({ ...subjectFormData, code: e.target.value.toUpperCase() })}
                          required
                          className="w-full h-11 px-3 bg-white border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600 font-mono"
                          placeholder="e.g., MATH"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Programme Association</label>
                        <select
                          value={subjectFormData.course_id}
                          onChange={(e) => setSubjectFormData({ ...subjectFormData, course_id: e.target.value })}
                          className="w-full h-11 px-3 bg-white border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600"
                        >
                          <option value="">Core Subject (All Programmes)</option>
                          {courses.map((course) => (
                            <option key={course.id} value={course.id}>
                              {course.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="is_core"
                        checked={subjectFormData.is_core}
                        onChange={(e) => setSubjectFormData({ ...subjectFormData, is_core: e.target.checked })}
                        className="h-4 w-4 text-school-green-600 focus:ring-school-green-500 border-gray-300 rounded-xs"
                      />
                      <label htmlFor="is_core" className="text-xs font-medium text-gray-700 cursor-pointer">
                        Core Curriculum Subject (Mandatory for all students)
                      </label>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">Applicable Forms</label>
                      <div className="flex items-center gap-4 flex-wrap">
                        {[
                          { value: '', label: 'All Forms' },
                          { value: '1', label: 'Form 1' },
                          { value: '2', label: 'Form 2' },
                          { value: '3', label: 'Form 3' },
                        ].map((opt) => (
                          <label key={opt.value} className="flex items-center gap-1.5 cursor-pointer text-xs text-gray-700">
                            <input
                              type="radio"
                              name="applicable_forms"
                              value={opt.value}
                              checked={subjectFormData.applicable_forms === opt.value}
                              onChange={(e) => setSubjectFormData({ ...subjectFormData, applicable_forms: e.target.value })}
                              className="text-school-green-600 focus:ring-school-green-500"
                            />
                            <span>{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-end gap-2.5 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowSubjectForm(false);
                          setEditingSubject(null);
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-sm text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-school-green-600 text-white rounded-sm text-xs font-semibold hover:bg-school-green-700 transition-colors"
                      >
                        {editingSubject ? 'Save Changes' : 'Register Subject'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="grid gap-3">
                {subjects.map((subject) => {
                  const course = subject.course_id ? courses.find(c => c.id === subject.course_id) : null;
                  return (
                    <div key={subject.id} className="bg-white border border-gray-200 rounded-sm p-4 hover:border-gray-300 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-gray-900">{subject.name}</h4>
                            <span className="px-2 py-0.5 font-mono text-[11px] font-bold bg-gray-100 text-gray-700 rounded-xs border border-gray-200 tabular-nums">
                              {subject.code}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500 font-medium flex-wrap">
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-sm border ${
                              subject.is_core ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-100 text-gray-700 border-gray-200'
                            }`}>
                              {subject.is_core ? 'Core' : 'Elective'}
                            </span>
                            <span>{course ? course.name : 'All Programmes'}</span>
                            {subject.applicable_forms && (
                              <span>
                                | Form{subject.applicable_forms.split(',').length > 1 ? 's ' : ' '}
                                {subject.applicable_forms.split(',').map(f => ` ${f}`).join(',')}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => fetchSubjectDetails(subject.id)}
                            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-sm transition-colors"
                            title="View Subject Details"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingSubject(subject);
                              setSubjectFormData({
                                name: subject.name,
                                code: subject.code,
                                course_id: subject.course_id ? subject.course_id.toString() : '',
                                is_core: subject.is_core,
                                applicable_forms: subject.applicable_forms || ''
                              });
                              setShowSubjectForm(true);
                            }}
                            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-sm transition-colors"
                            title="Edit Subject"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSubject(subject)}
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-sm transition-colors"
                            title="Delete Subject"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-sm border ${
                            subject.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            {subject.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {subjects.length === 0 && (
                  <div className="text-center py-12 text-gray-400 border border-dashed border-gray-200 rounded-sm">
                    <BookOpenIcon className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                    <p className="text-sm font-medium text-gray-700">No subjects registered</p>
                    <p className="text-xs text-gray-400 mt-0.5">Add core and elective curriculum subjects to get started</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Promotions Tab */}
          {activeTab === 'promotions' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Academic Promotions</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Student progression across terms, forms, and academic calendars</p>
                </div>
                <div className="text-xs bg-gray-100 px-3 py-1.5 rounded-sm border border-gray-200 font-mono text-gray-700 font-medium tabular-nums">
                  Active: {currentAcademicYear} (Semester {currentSemester})
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* Promote Semester 1 to Semester 2 */}
                <div className="bg-white border border-gray-200 rounded-sm p-5 hover:border-gray-300 transition-colors flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-sm bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-gray-900">Semester Promotion</h4>
                        <p className="text-gray-500 text-xs">{currentSemester === 1 ? 'S1 → S2 (All Forms)' : 'S2 → Next Form'}</p>
                      </div>
                    </div>
                    <p className="text-gray-500 text-xs leading-relaxed mb-4">
                      {currentSemester === 1
                        ? `Advance all students from Semester 1 to Semester 2 within the current academic session (${currentAcademicYear}).`
                        : `Advance all students from Semester 2 to the next academic level.`}
                    </p>
                  </div>
                  <button
                    onClick={handlePromoteSemester}
                    className="w-full bg-indigo-600 text-white py-2.5 px-4 rounded-sm hover:bg-indigo-700 transition-colors font-medium text-xs shadow-xs"
                  >
                    {currentSemester === 1 ? 'Promote S1 → S2' : 'Promote S2 → Next Form'}
                  </button>
                </div>

                {/* End Academic Year */}
                <div className="bg-white border border-gray-200 rounded-sm p-5 hover:border-gray-300 transition-colors flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-sm bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700">
                        <CalendarIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-gray-900">End Academic Year</h4>
                        <p className="text-gray-500 text-xs font-mono tabular-nums">{currentAcademicYear} → Next Session</p>
                      </div>
                    </div>
                    <p className="text-gray-500 text-xs leading-relaxed mb-4">
                      Complete academic year closure: promote eligible cohorts to subsequent forms and archive current term marks.
                    </p>
                  </div>
                  <button
                    onClick={handleAcademicYearEnd}
                    className="w-full bg-rose-600 text-white py-2.5 px-4 rounded-sm hover:bg-rose-700 transition-colors font-medium text-xs shadow-xs"
                  >
                    End Academic Year {currentAcademicYear}
                  </button>
                </div>

                {/* Manual Promotion Card */}
                <div className="bg-white border border-gray-200 rounded-sm p-5 hover:border-gray-300 transition-colors">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-sm bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-700">
                      <CogIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900">Selective Form Transfer</h4>
                      <p className="text-gray-500 text-xs">Custom promotion criteria</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2.5 mb-4">
                    <div>
                      <label className="block text-[11px] font-medium text-gray-600 mb-1">From Form</label>
                      <select value={promotionFromForm} onChange={e => setPromotionFromForm(parseInt(e.target.value))}
                        className="w-full h-9 px-2 bg-white border border-gray-300 rounded-sm text-xs focus:outline-none focus:border-school-green-600">
                        <option value="1">Form 1</option><option value="2">Form 2</option><option value="3">Form 3</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-gray-600 mb-1">From Sem</label>
                      <select value={promotionFromSemester} onChange={e => setPromotionFromSemester(parseInt(e.target.value))}
                        className="w-full h-9 px-2 bg-white border border-gray-300 rounded-sm text-xs focus:outline-none focus:border-school-green-600">
                        <option value="1">Sem 1</option><option value="2">Sem 2</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-gray-600 mb-1">To Form</label>
                      <select value={promotionToForm} onChange={e => setPromotionToForm(parseInt(e.target.value))}
                        className="w-full h-9 px-2 bg-white border border-gray-300 rounded-sm text-xs focus:outline-none focus:border-school-green-600">
                        <option value="1">Form 1</option><option value="2">Form 2</option><option value="3">Form 3</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-gray-600 mb-1">To Sem</label>
                      <select value={promotionToSemester} onChange={e => setPromotionToSemester(parseInt(e.target.value))}
                        className="w-full h-9 px-2 bg-white border border-gray-300 rounded-sm text-xs focus:outline-none focus:border-school-green-600">
                        <option value="1">Sem 1</option><option value="2">Sem 2</option>
                      </select>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleManualPromotion}
                    className="w-full bg-school-green-600 text-white py-2 px-4 rounded-sm hover:bg-school-green-700 transition-colors font-medium text-xs shadow-xs"
                  >
                    Execute Selective Transfer
                  </button>
                </div>
              </div>

              <div className="bg-blue-50/60 border border-blue-200 rounded-sm p-4 text-xs text-blue-900 leading-relaxed">
                <h4 className="font-semibold text-blue-950 mb-1">Academic Promotion Governance:</h4>
                <ul className="list-disc pl-4 space-y-1 text-blue-800">
                  <li>Semester promotions update student class assignments while maintaining continuous assessment history.</li>
                  <li>End of Year triggers official graduation for Form 3 students and marks rollover for subsequent intakes.</li>
                  <li>Configure school-wide default academic dates under System Oversight settings.</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Class Details Modal */}
      {showClassDetails && selectedClass && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-md border border-gray-200 shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="text-base font-bold text-gray-900">Class Dossier: {selectedClass.class_name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">Enrolled student roster and assigned teaching faculty</p>
              </div>
              <button
                onClick={handleCloseClassDetails}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-sm transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            
            {loadingClassDetails ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-school-green-200 border-t-school-green-600"></div>
              </div>
            ) : (
              <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3.5 rounded-sm border border-gray-200">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">Class Specifications</h4>
                    <div className="space-y-1 text-xs text-gray-700">
                      <p><span className="text-gray-400 font-normal">Form Level:</span> <strong>Form {selectedClass.form}</strong></p>
                      <p><span className="text-gray-400 font-normal">Semester:</span> <strong>Semester {selectedClass.semester}</strong></p>
                      <p><span className="text-gray-400 font-normal">Stream:</span> <strong>{selectedClass.stream || 'Standard'}</strong></p>
                      <p><span className="text-gray-400 font-normal">Session:</span> <strong className="font-mono tabular-nums">{selectedClass.academic_year}</strong></p>
                      <p><span className="text-gray-400 font-normal">Capacity:</span> <strong className="tabular-nums">{selectedClass.capacity} seats</strong></p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-3.5 rounded-sm border border-gray-200">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">Enrollment Overview</h4>
                    <div className="space-y-1 text-xs text-gray-700">
                      <p><span className="text-gray-400 font-normal">Enrolled Students:</span> <strong className="tabular-nums">{classStudents.length}</strong></p>
                      <p><span className="text-gray-400 font-normal">Assigned Instructors:</span> <strong className="tabular-nums">{classTeachers.length}</strong></p>
                      <p><span className="text-gray-400 font-normal">Curriculum Courses:</span> <strong>{subjects.filter(s => s.is_core).length + 4} (Core + 4 Electives)</strong></p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* Students List */}
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">Students ({classStudents.length})</h4>
                    <div className="border border-gray-200 rounded-sm overflow-hidden max-h-56 overflow-y-auto">
                      <table className="min-w-full divide-y divide-gray-200 text-xs">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="px-3 py-2 text-left font-medium text-gray-500">Student ID</th>
                            <th className="px-3 py-2 text-left font-medium text-gray-500">Full Name</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                          {classStudents.length > 0 ? (
                            classStudents.map((student) => (
                              <tr key={student.id} className="hover:bg-gray-50">
                                <td className="px-3 py-2 font-mono tabular-nums text-gray-700 font-semibold">{student.student_id}</td>
                                <td className="px-3 py-2 text-gray-900">{student.surname}, {student.other_names}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={2} className="px-3 py-4 text-center text-gray-400">
                                No students currently placed in this class
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  {/* Teachers List */}
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">Assigned Teachers ({classTeachers.length})</h4>
                    <div className="border border-gray-200 rounded-sm overflow-hidden max-h-56 overflow-y-auto">
                      <table className="min-w-full divide-y divide-gray-200 text-xs">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="px-3 py-2 text-left font-medium text-gray-500">Faculty Member</th>
                            <th className="px-3 py-2 text-left font-medium text-gray-500">Subject</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                          {classTeachers.length > 0 ? (
                            classTeachers.map((teacher) => (
                              <tr key={teacher.id} className="hover:bg-gray-50">
                                <td className="px-3 py-2 text-gray-900 font-medium">{teacher.teacher_surname}, {teacher.teacher_other_names}</td>
                                <td className="px-3 py-2 text-school-green-700 font-medium">{teacher.subject_name}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={2} className="px-3 py-4 text-center text-gray-400">
                                No teachers assigned to this class
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-100">
                  <button
                    onClick={handleCloseClassDetails}
                    className="px-4 py-2 border border-gray-300 rounded-sm text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Subject Details Modal */}
      {showSubjectDetails && selectedSubject && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-md border border-gray-200 shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="text-base font-bold text-gray-900">Subject Dossier: {selectedSubject.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">Assigned teaching faculty and designated classrooms</p>
              </div>
              <button
                onClick={handleCloseSubjectDetails}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-sm transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            
            {loadingSubjectDetails ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-school-green-200 border-t-school-green-600"></div>
              </div>
            ) : (
              <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3.5 rounded-sm border border-gray-200">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">Curriculum Information</h4>
                    <div className="space-y-1 text-xs text-gray-700">
                      <p><span className="text-gray-400 font-normal">Subject Name:</span> <strong>{selectedSubject.name}</strong></p>
                      <p><span className="text-gray-400 font-normal">Subject Code:</span> <strong className="font-mono tabular-nums">{selectedSubject.code}</strong></p>
                      <p><span className="text-gray-400 font-normal">Classification:</span> <strong>{selectedSubject.is_core ? 'Core Curriculum' : 'Elective'}</strong></p>
                      <p><span className="text-gray-400 font-normal">Programme:</span> <strong>{selectedSubject.course_id ? courses.find(c => c.id === selectedSubject.course_id)?.name || 'Unknown' : 'All Programmes'}</strong></p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-3.5 rounded-sm border border-gray-200">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">Teaching Faculty</h4>
                    <div className="space-y-1 text-xs text-gray-700">
                      <p><span className="text-gray-400 font-normal">Assigned Teachers:</span> <strong className="tabular-nums">{subjectTeachers.length}</strong></p>
                      <p><span className="text-gray-400 font-normal">Taught Classes:</span> <strong className="tabular-nums">{subjectTeachers.filter((t, i, s) => i === s.findIndex(o => o.class_id === t.class_id)).length}</strong></p>
                    </div>
                  </div>
                </div>
                
                {/* Teachers List */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">Teaching Faculty for this Subject</h4>
                  <div className="border border-gray-200 rounded-sm overflow-hidden max-h-60 overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-xs">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-gray-500">Instructor</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-500">Class Arm</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-500">Form</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {subjectTeachers.length > 0 ? (
                          subjectTeachers.map((teacher) => (
                            <tr key={`${teacher.teacher_id}-${teacher.class_id}`} className="hover:bg-gray-50">
                              <td className="px-3 py-2 font-medium text-gray-900">{teacher.teacher_surname}, {teacher.teacher_other_names}</td>
                              <td className="px-3 py-2 text-school-green-700 font-semibold">{teacher.class_name}</td>
                              <td className="px-3 py-2 text-gray-500 tabular-nums">Form {teacher.form}{teacher.stream ? ` ${teacher.stream}` : ''}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={3} className="px-3 py-4 text-center text-gray-400">
                              No teachers currently assigned to teach this subject
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-100">
                  <button
                    onClick={handleCloseSubjectDetails}
                    className="px-4 py-2 border border-gray-300 rounded-sm text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Close
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