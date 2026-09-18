import React, { useState, useEffect } from 'react';
import { db } from '../../../lib/neon';
import toast from 'react-hot-toast';
import {
  AcademicCapIcon,
  TrophyIcon,
  UserGroupIcon,
  BookOpenIcon,
  ChartBarIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { PortalButton } from '../../components/PortalButton';

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
      
      const [courseData, ay, sem] = await Promise.all([
        db.getCourses(),
        db.getCurrentAcademicYear(),
        db.getCurrentSemester()
      ]);
      setCourses(courseData || []);
      
      const academicYear = ay || `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`;
      const semester = sem || 1;
      setSelectedAcademicYear(academicYear);
      setSelectedTerm(semester);
      
      await fetchPerformanceData(academicYear, semester);
    } catch (error) {
      console.error('Failed to fetch initial data:', error);
      toast.error('Failed to load performance data');
    } finally {
      setLoading(false);
    }
  };

  const fetchPerformanceData = async (academicYear: string, term: number) => {
    try {
      const [topStudentsData, topClassStudentsData, summaryData] = await Promise.all([
        db.getTopStudents(10, academicYear, term),
        db.getTopStudentsByClass(academicYear, term),
        db.getStudentPerformanceSummary(academicYear, term),
      ]);

      setTopStudents((topStudentsData as TopStudent[]) || []);
      setTopClassStudents((topClassStudentsData as TopClassStudent[]) || []);
      setPerformanceSummary((summaryData as StudentPerformanceSummary[]) || []);
      
      if (selectedCourse > 0) {
        const topCourseStudentsData = await db.getTopStudentsByCourse(selectedCourse, 10, academicYear, term);
        setTopCourseStudents((topCourseStudentsData as TopCourseStudent[]) || []);
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
        setTopCourseStudents((topCourseStudentsData as TopCourseStudent[]) || []);
      } catch (error) {
        console.error('Failed to fetch course data:', error);
        toast.error('Failed to load course data');
      } finally {
        setLoading(false);
      }
    }
  };

  const getGradeBadge = (score: number) => {
    if (score >= 80) return 'bg-green-50 text-green-800 border-green-200';
    if (score >= 70) return 'bg-blue-50 text-blue-800 border-blue-200';
    if (score >= 60) return 'bg-yellow-50 text-yellow-800 border-yellow-200';
    if (score >= 50) return 'bg-orange-50 text-orange-800 border-orange-200';
    return 'bg-red-50 text-red-800 border-red-200';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton variant="card" rows={3} />
        <LoadingSkeleton variant="table" rows={6} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-md border border-gray-200 shadow-xs p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-gray-900">Student Academic Performance Analytics</h2>
          <p className="text-xs text-gray-500 mt-0.5">Cohort rankings, class toppers, and academic standing across all curricula</p>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Target Semester</span>
          <span className="text-xs font-semibold text-gray-800 tabular-nums">
            {selectedAcademicYear || 'Current'} • Semester {selectedTerm || 1}
          </span>
        </div>
      </div>

      {/* Filter Parameters Card */}
      <div className="bg-white rounded-md border border-gray-200 shadow-xs p-4 sm:p-5">
        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-gray-100">
          <FunnelIcon className="w-4 h-4 text-school-green-700" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">Filter Diagnostic Criteria</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Academic Year</label>
            <select
              value={selectedAcademicYear}
              onChange={(e) => setSelectedAcademicYear(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-sm text-xs focus:ring-1 focus:ring-school-green-500 focus:border-school-green-500 bg-white"
            >
              <option value="">Select Academic Year</option>
              <option value="2025/2026">2025/2026</option>
              <option value="2024/2025">2024/2025</option>
              <option value="2023/2024">2023/2024</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Semester / Term</label>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-sm text-xs focus:ring-1 focus:ring-school-green-500 focus:border-school-green-500 bg-white"
            >
              <option value={0}>Select Semester</option>
              <option value={1}>Semester 1 (Sep–Feb)</option>
              <option value={2}>Semester 2 (Mar–Aug)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Programme Filter (Optional)</label>
            <select
              value={selectedCourse}
              onChange={(e) => handleCourseChange(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-sm text-xs focus:ring-1 focus:ring-school-green-500 focus:border-school-green-500 bg-white"
            >
              <option value={0}>All Academic Programmes</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <PortalButton
              onClick={handleFilterChange}
              disabled={!selectedAcademicYear || selectedTerm === 0}
              className="w-full py-2 bg-school-green-700 text-white rounded-sm text-xs font-medium hover:bg-school-green-800 disabled:opacity-40 transition-colors shadow-2xs"
            >
              Update Analytics
            </PortalButton>
          </div>
        </div>
      </div>

      {/* Top 10 Students Overall Table */}
      <div className="bg-white rounded-md border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrophyIcon className="w-5 h-5 text-amber-600" />
            <div>
              <h3 className="text-sm font-bold text-gray-900">Honor Roll: Top 10 Students Overall</h3>
              <p className="text-xs text-gray-500 mt-0.5">Highest composite grade point averages across the entire school</p>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-600 uppercase tracking-wider">Rank</th>
                <th className="px-4 py-3 font-semibold text-gray-600 uppercase tracking-wider">Index / ID</th>
                <th className="px-4 py-3 font-semibold text-gray-600 uppercase tracking-wider">Student Name</th>
                <th className="px-4 py-3 font-semibold text-gray-600 uppercase tracking-wider">Class Arm</th>
                <th className="px-4 py-3 font-semibold text-gray-600 uppercase tracking-wider text-right">Mean Average</th>
                <th className="px-4 py-3 font-semibold text-gray-600 uppercase tracking-wider text-right">Subjects Graded</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {topStudents.length > 0 ? (
                topStudents.map((student, index) => (
                  <tr key={student.id || index} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center justify-center font-mono font-bold text-xs tabular-nums px-2 py-0.5 rounded-sm ${
                        index === 0 ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                        index === 1 ? 'bg-slate-100 text-slate-800 border border-slate-300' :
                        index === 2 ? 'bg-orange-100 text-orange-900 border border-orange-300' :
                        'text-gray-600'
                      }`}>
                        #{index + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono font-medium text-gray-700 tabular-nums">{student.student_id}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {student.surname}, {student.other_names}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{student.class_name}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`px-2 py-0.5 rounded-sm text-[11px] font-bold font-mono tabular-nums border ${getGradeBadge(student.average_score)}`}>
                        {student.average_score.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-gray-600">{student.subjects_count}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-xs text-gray-400">
                    No academic records available for the selected period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Student in Each Class */}
      <div className="bg-white rounded-md border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserGroupIcon className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-sm font-bold text-gray-900">Class Leadership: Highest Ranked by Class Arm</h3>
              <p className="text-xs text-gray-500 mt-0.5">Leading candidates in each respective classroom</p>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-600 uppercase tracking-wider">Class Arm</th>
                <th className="px-4 py-3 font-semibold text-gray-600 uppercase tracking-wider">Student ID</th>
                <th className="px-4 py-3 font-semibold text-gray-600 uppercase tracking-wider">Student Name</th>
                <th className="px-4 py-3 font-semibold text-gray-600 uppercase tracking-wider text-right">Average Score</th>
                <th className="px-4 py-3 font-semibold text-gray-600 uppercase tracking-wider text-right">Subjects</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {topClassStudents.length > 0 ? (
                topClassStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-4 py-3 font-semibold text-gray-900">{student.class_name}</td>
                    <td className="px-4 py-3 font-mono text-gray-600 tabular-nums">{student.student_id}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {student.surname}, {student.other_names}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`px-2 py-0.5 rounded-sm text-[11px] font-bold font-mono tabular-nums border ${getGradeBadge(student.average_score)}`}>
                        {student.average_score.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-gray-600">{student.subjects_count}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-xs text-gray-400">
                    No class ranking data recorded for this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Students by Programme (Conditional) */}
      {selectedCourse > 0 && (
        <div className="bg-white rounded-md border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpenIcon className="w-5 h-5 text-purple-600" />
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Top Candidates in {courses.find(c => c.id === selectedCourse)?.name}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Departmental rankings for the selected curriculum</p>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-semibold text-gray-600 uppercase tracking-wider">Rank</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 uppercase tracking-wider">Student ID</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 uppercase tracking-wider">Student Name</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 uppercase tracking-wider">Class Arm</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 uppercase tracking-wider text-right">Average Score</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 uppercase tracking-wider text-right">Subjects</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {topCourseStudents.length > 0 ? (
                  topCourseStudents.map((student, index) => (
                    <tr key={student.id || index} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-gray-700 tabular-nums">#{index + 1}</td>
                      <td className="px-4 py-3 font-mono text-gray-600 tabular-nums">{student.student_id}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{student.surname}, {student.other_names}</td>
                      <td className="px-4 py-3 text-gray-600">{student.class_name}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`px-2 py-0.5 rounded-sm text-[11px] font-bold font-mono tabular-nums border ${getGradeBadge(student.average_score)}`}>
                          {student.average_score.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums text-gray-600">{student.subjects_count}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-xs text-gray-400">
                      No programme rankings found for the selected department.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cohort Performance Summary Ledger */}
      <div className="bg-white rounded-md border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChartBarIcon className="w-5 h-5 text-school-green-700" />
            <div>
              <h3 className="text-sm font-bold text-gray-900">Comprehensive Performance Ledger</h3>
              <p className="text-xs text-gray-500 mt-0.5">Summary pass/fail metrics and academic standing</p>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-600 uppercase tracking-wider">Student ID</th>
                <th className="px-4 py-3 font-semibold text-gray-600 uppercase tracking-wider">Student Name</th>
                <th className="px-4 py-3 font-semibold text-gray-600 uppercase tracking-wider">Class Arm</th>
                <th className="px-4 py-3 font-semibold text-gray-600 uppercase tracking-wider text-right">Average Score</th>
                <th className="px-4 py-3 font-semibold text-gray-600 uppercase tracking-wider text-right">Total Subjects</th>
                <th className="px-4 py-3 font-semibold text-green-700 uppercase tracking-wider text-right">Passed</th>
                <th className="px-4 py-3 font-semibold text-red-700 uppercase tracking-wider text-right">Failed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {performanceSummary.length > 0 ? (
                performanceSummary.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-gray-700 tabular-nums">{student.student_id}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{student.surname}, {student.other_names}</td>
                    <td className="px-4 py-3 text-gray-600">{student.class_name}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`px-2 py-0.5 rounded-sm text-[11px] font-bold font-mono tabular-nums border ${getGradeBadge(student.average_score)}`}>
                        {student.average_score.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-gray-600">{student.subjects_count}</td>
                    <td className="px-4 py-3 text-right font-mono font-medium text-green-700 tabular-nums">{student.passed_subjects}</td>
                    <td className="px-4 py-3 text-right font-mono font-medium text-red-600 tabular-nums">{student.failed_subjects}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-xs text-gray-400">
                    No summary data recorded for the selected period.
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