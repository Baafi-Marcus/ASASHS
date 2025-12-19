import React, { useState, useEffect } from 'react';
import { db } from '../../../lib/neon';
import toast from 'react-hot-toast';

interface TopStudent {
  id: number;
  student_id: string;
  surname: string;
  other_names: string;
  class_name: string;
  average_score: number;
  subjects_count: number;
}

interface TopClassStudent {
  id: number;
  student_id: string;
  surname: string;
  other_names: string;
  class_name: string;
  class_id: number;
  average_score: number;
  subjects_count: number;
  class_rank: number;
}

interface TopCourseStudent {
  id: number;
  student_id: string;
  surname: string;
  other_names: string;
  class_name: string;
  course_name: string;
  average_score: number;
  subjects_count: number;
}

interface StudentPerformanceSummary {
  id: number;
  student_id: string;
  surname: string;
  other_names: string;
  class_name: string;
  average_score: number;
  subjects_count: number;
  passed_subjects: number;
  failed_subjects: number;
}

export const AdminStudentPerformance: React.FC = () => {
  const [topStudents, setTopStudents] = useState<TopStudent[]>([]);
  const [topClassStudents, setTopClassStudents] = useState<TopClassStudent[]>([]);
  const [topCourseStudents, setTopCourseStudents] = useState<TopCourseStudent[]>([]);
  const [performanceSummary, setPerformanceSummary] = useState<StudentPerformanceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('');
  const [selectedTerm, setSelectedTerm] = useState<number>(0);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number>(0);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      // Fetch courses
      const courseData = await db.getCourses();
      setCourses(courseData);
      
      // Set default academic year and term
      const currentYear = new Date().getFullYear();
      const academicYear = `${currentYear}/${currentYear + 1}`;
      setSelectedAcademicYear(academicYear);
      setSelectedTerm(1);
      
      // Fetch all performance data
      await fetchPerformanceData(academicYear, 1);
    } catch (error) {
      console.error('Failed to fetch initial data:', error);
      toast.error('Failed to load performance data');
    } finally {
      setLoading(false);
    }
  };

  const fetchPerformanceData = async (academicYear: string, term: number) => {
    try {
      // Fetch top students overall
      const topStudentsData = await db.getTopStudents(10, academicYear, term);
      setTopStudents(topStudentsData as TopStudent[]);
      
      // Fetch top students by class
      const topClassStudentsData = await db.getTopStudentsByClass(academicYear, term);
      setTopClassStudents(topClassStudentsData as TopClassStudent[]);
      
      // Fetch performance summary
      const summaryData = await db.getStudentPerformanceSummary(academicYear, term);
      setPerformanceSummary(summaryData as StudentPerformanceSummary[]);
      
      // If a course is selected, fetch top students for that course
      if (selectedCourse > 0) {
        const topCourseStudentsData = await db.getTopStudentsByCourse(selectedCourse, 10, academicYear, term);
        setTopCourseStudents(topCourseStudentsData as TopCourseStudent[]);
      }
    } catch (error) {
      console.error('Failed to fetch performance data:', error);
      toast.error('Failed to load performance data');
    }
  };

  const handleFilterChange = async () => {
    if (selectedAcademicYear && selectedTerm > 0) {
      setLoading(true);
      try {
        await fetchPerformanceData(selectedAcademicYear, selectedTerm);
      } catch (error) {
        console.error('Failed to fetch filtered data:', error);
        toast.error('Failed to load filtered data');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCourseChange = async (courseId: number) => {
    setSelectedCourse(courseId);
    if (selectedAcademicYear && selectedTerm > 0) {
      setLoading(true);
      try {
        const topCourseStudentsData = await db.getTopStudentsByCourse(courseId, 10, selectedAcademicYear, selectedTerm);
        setTopCourseStudents(topCourseStudentsData as TopCourseStudent[]);
      } catch (error) {
        console.error('Failed to fetch course data:', error);
        toast.error('Failed to load course data');
      } finally {
        setLoading(false);
      }
    }
  };

  const getGradeColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 70) return 'bg-blue-100 text-blue-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    if (score >= 50) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
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
          <h2 className="text-2xl font-bold text-gray-800">Student Performance Analytics</h2>
          <p className="text-gray-600">Overall student performance across the school</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year</label>
            <select
              value={selectedAcademicYear}
              onChange={(e) => setSelectedAcademicYear(e.target.value)}
              className="w-full px-4 py-2 border border-school-cream-300 rounded-lg focus:ring-2 focus:ring-school-green-500 focus:border-transparent"
            >
              <option value="">Select Academic Year</option>
              <option value="2025/2026">2025/2026</option>
              <option value="2024/2025">2024/2025</option>
              <option value="2023/2024">2023/2024</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Term</label>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-school-cream-300 rounded-lg focus:ring-2 focus:ring-school-green-500 focus:border-transparent"
            >
              <option value={0}>Select Term</option>
              <option value={1}>Term 1</option>
              <option value={2}>Term 2</option>
              <option value={3}>Term 3</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Course (Optional)</label>
            <select
              value={selectedCourse}
              onChange={(e) => handleCourseChange(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-school-cream-300 rounded-lg focus:ring-2 focus:ring-school-green-500 focus:border-transparent"
            >
              <option value={0}>All Courses</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={handleFilterChange}
              disabled={!selectedAcademicYear || selectedTerm === 0}
              className="w-full px-4 py-2 bg-school-green-600 text-white rounded-lg hover:bg-school-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Overall Top Students */}
      <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden">
        <div className="bg-school-green-600 text-white p-6">
          <h3 className="text-xl font-bold">Top 10 Students Overall</h3>
          <p className="text-school-green-100">Best performing students across all classes</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-school-cream-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Rank</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Student ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Class</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Average Score</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Subjects</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-school-cream-200">
              {topStudents.length > 0 ? (
                topStudents.map((student, index) => (
                  <tr key={student.id} className="hover:bg-school-cream-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {index === 0 && (
                          <span className="mr-2 text-yellow-500">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </span>
                        )}
                        <span className={`font-bold ${index === 0 ? 'text-yellow-600' : index === 1 ? 'text-gray-500' : index === 2 ? 'text-amber-700' : 'text-gray-700'}`}>
                          #{index + 1}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{student.student_id}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {student.surname}, {student.other_names}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{student.class_name}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(student.average_score)}`}>
                        {student.average_score.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{student.subjects_count}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <div className="text-4xl mb-4">📊</div>
                      <p className="text-lg font-medium">No performance data available</p>
                      <p className="text-sm">Select filters to view student performance</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Students by Class */}
      <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden">
        <div className="bg-blue-600 text-white p-6">
          <h3 className="text-xl font-bold">Top Student in Each Class</h3>
          <p className="text-blue-100">Best performing student from each class</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-blue-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Class</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Student ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Average Score</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Subjects</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-100">
              {topClassStudents.length > 0 ? (
                topClassStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-blue-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{student.class_name}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{student.student_id}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {student.surname}, {student.other_names}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(student.average_score)}`}>
                        {student.average_score.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{student.subjects_count}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <div className="text-4xl mb-4">👥</div>
                      <p className="text-lg font-medium">No class performance data available</p>
                      <p className="text-sm">Select filters to view class performance</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Students by Course */}
      {selectedCourse > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden">
          <div className="bg-purple-600 text-white p-6">
            <h3 className="text-xl font-bold">Top 10 Students in {courses.find(c => c.id === selectedCourse)?.name}</h3>
            <p className="text-purple-100">Best performing students in the selected course</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-purple-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Rank</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Student ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Class</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Average Score</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Subjects</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-100">
                {topCourseStudents.length > 0 ? (
                  topCourseStudents.map((student, index) => (
                    <tr key={student.id} className="hover:bg-purple-50">
                      <td className="px-6 py-4">
                        <span className="font-bold text-gray-700">
                          #{index + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{student.student_id}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {student.surname}, {student.other_names}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{student.class_name}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(student.average_score)}`}>
                          {student.average_score.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{student.subjects_count}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <div className="text-4xl mb-4">📚</div>
                        <p className="text-lg font-medium">No course performance data available</p>
                        <p className="text-sm">Select filters to view course performance</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Performance Summary */}
      <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden">
        <div className="bg-amber-600 text-white p-6">
          <h3 className="text-xl font-bold">Student Performance Summary</h3>
          <p className="text-amber-100">Overall performance metrics</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-amber-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Student ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Class</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Average Score</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Subjects</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Passed</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Failed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-100">
              {performanceSummary.length > 0 ? (
                performanceSummary.map((student) => (
                  <tr key={student.id} className="hover:bg-amber-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{student.student_id}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {student.surname}, {student.other_names}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{student.class_name}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(student.average_score)}`}>
                        {student.average_score.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{student.subjects_count}</td>
                    <td className="px-6 py-4 text-sm text-green-600 font-medium">{student.passed_subjects}</td>
                    <td className="px-6 py-4 text-sm text-red-600 font-medium">{student.failed_subjects}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <div className="text-4xl mb-4">📈</div>
                      <p className="text-lg font-medium">No performance summary data available</p>
                      <p className="text-sm">Select filters to view performance summary</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};