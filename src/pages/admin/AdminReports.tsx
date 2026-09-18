import React, { useEffect, useState } from 'react';
import { db } from '../../../lib/neon';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area
} from 'recharts';
import {
  ChartBarIcon,
  UsersIcon,
  AcademicCapIcon,
  ArrowTrendingUpIcon,
  ArrowDownTrayIcon,
  DocumentChartBarIcon,
  PrinterIcon,
  EnvelopeIcon,
  BuildingLibraryIcon,
} from '@heroicons/react/24/outline';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { PortalButton } from '../../components/PortalButton';

interface ReportStats {
  totalStudents: number;
  totalActiveStudents: number;
  totalInactiveStudents: number;
  totalTeachers: number;
  totalActiveTeachers: number;
  totalInactiveTeachers: number;
  studentsByProgramme: { programme: string; count: number; activeCount: number }[];
  studentsByGender: { gender: string; count: number }[];
  teachersByDepartment: { department: string; count: number; activeCount?: number }[];
  recentRegistrations: { date: string; count: number }[];
  totalCourses: number;
  activeCourses: number;
  studentsByClass: { className: string; count: number }[];
  teachersBySubject: { subject: string; count: number }[];
  timetableUpdates: { date: string; count: number }[];
}

export function AdminReports() {
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState('overview');
  
  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      const [allStudents, allTeachers, allCoursesData, allSubjects, allClasses, timetableEntries] = await Promise.all([
        db.getStudents({ limit: 10000, includeInactive: true }),
        db.getTeachers({ limit: 10000, includeInactive: true }),
        db.getCourses(),
        db.getSubjects(),
        db.getClasses(),
        db.getTimetableEntries(),
      ]);
      
      const totalStudents = allStudents.length;
      const totalActiveStudents = allStudents.filter((s: any) => s.is_active).length;
      const totalInactiveStudents = totalStudents - totalActiveStudents;
      
      const totalTeachers = allTeachers.length;
      const totalActiveTeachers = allTeachers.filter((t: any) => t.is_active).length;
      const totalInactiveTeachers = totalTeachers - totalActiveTeachers;
      
      const totalCourses = allCoursesData.length;
      const activeCourses = allCoursesData.filter((c: any) => c.is_active).length;

      const studentsByProgramme = allCoursesData.map((course: any) => {
        const courseStudents = allStudents.filter((student: any) => student.course_id === course.id);
        const activeCourseStudents = courseStudents.filter((s: any) => s.is_active);
        return {
          programme: course.name,
          count: courseStudents.length,
          activeCount: activeCourseStudents.length
        };
      });

      const studentsByGender = [
        { gender: 'Male', count: allStudents.filter((student: any) => student.gender === 'Male').length },
        { gender: 'Female', count: allStudents.filter((student: any) => student.gender === 'Female').length },
      ];

      const departments: string[] = Array.from(new Set(allTeachers.map((teacher: any) => String(teacher.department || ''))));
      const teachersByDepartment = departments.map((dept: string) => {
        const deptTeachers = allTeachers.filter((teacher: any) => String(teacher.department || '') === dept);
        const activeDeptTeachers = deptTeachers.filter((t: any) => t.is_active);
        return {
          department: dept || 'Unassigned',
          count: deptTeachers.length,
          activeCount: activeDeptTeachers.length
        };
      });

      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();

      const recentRegistrations = last30Days.map((date) => ({
        date,
        count: allStudents.filter((student: any) => {
          const createdAtStr = student.created_at instanceof Date 
            ? student.created_at.toISOString().split('T')[0]
            : typeof student.created_at === 'string'
            ? student.created_at.split('T')[0]
            : '';
          return createdAtStr === date;
        }).length,
      }));

      const studentsByClass = allClasses.map((cls: any) => {
        const classStudents = allStudents.filter((student: any) => 
          student.current_class_id === cls.id && student.is_active
        );
        return {
          className: cls.class_name,
          count: classStudents.length
        };
      }).filter((cls: any) => cls.count > 0);

      const teachersBySubject = allSubjects.map((subject: any) => {
        const subjectTeachers = allTeachers.filter((teacher: any) => {
          return teacher.department && subject.name.includes(teacher.department.split(' ')[0]);
        });
        return {
          subject: subject.name,
          count: subjectTeachers.length
        };
      }).filter((subj: any) => subj.count > 0);

      const timetableUpdates = last30Days.map((date) => ({
        date,
        count: timetableEntries.filter((entry: any) => {
          const createdAtStr = entry.created_at instanceof Date 
            ? entry.created_at.toISOString().split('T')[0]
            : typeof entry.created_at === 'string'
            ? entry.created_at.split('T')[0]
            : '';
          return createdAtStr === date;
        }).length,
      }));

      setStats({
        totalStudents,
        totalActiveStudents,
        totalInactiveStudents,
        totalTeachers,
        totalActiveTeachers,
        totalInactiveTeachers,
        studentsByProgramme,
        studentsByGender,
        teachersByDepartment,
        recentRegistrations,
        totalCourses,
        activeCourses,
        studentsByClass,
        teachersBySubject,
        timetableUpdates
      });
    } catch (error) {
      console.error('Failed to fetch report data:', error);
      setStats({
        totalStudents: 0,
        totalActiveStudents: 0,
        totalInactiveStudents: 0,
        totalTeachers: 0,
        totalActiveTeachers: 0,
        totalInactiveTeachers: 0,
        studentsByProgramme: [],
        studentsByGender: [
          { gender: 'Male', count: 0 },
          { gender: 'Female', count: 0 },
        ],
        teachersByDepartment: [],
        recentRegistrations: [],
        totalCourses: 0,
        activeCourses: 0,
        studentsByClass: [],
        teachersBySubject: [],
        timetableUpdates: []
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton variant="stats" />
        <LoadingSkeleton variant="table" rows={6} />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white rounded-md border border-gray-200 p-12 text-center">
        <p className="text-xs text-gray-500">Failed to aggregate institutional reports and metrics.</p>
      </div>
    );
  }

  const reportTabs = [
    { id: 'overview', label: 'Institutional Overview', icon: ChartBarIcon },
    { id: 'students', label: 'Student Demographics', icon: UsersIcon },
    { id: 'teachers', label: 'Faculty Roster', icon: AcademicCapIcon },
    { id: 'analytics', label: 'Academic Operations', icon: ArrowTrendingUpIcon },
  ];

  const CHART_COLORS = ['#15803d', '#2563eb', '#d97706', '#9333ea', '#0284c7', '#0d9488', '#ea580c', '#475569'];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-md border border-gray-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Enrolled Students</span>
            <UsersIcon className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1 tabular-nums">{stats.totalStudents}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 tabular-nums">
            <span>Active: <strong className="text-school-green-700">{stats.totalActiveStudents}</strong></span>
            <span>Inactive: <strong className="text-gray-600">{stats.totalInactiveStudents}</strong></span>
          </div>
        </div>
        
        <div className="bg-white rounded-md border border-gray-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Teaching Faculty</span>
            <AcademicCapIcon className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1 tabular-nums">{stats.totalTeachers}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 tabular-nums">
            <span>Active: <strong className="text-school-green-700">{stats.totalActiveTeachers}</strong></span>
            <span>Inactive: <strong className="text-gray-600">{stats.totalInactiveTeachers}</strong></span>
          </div>
        </div>
        
        <div className="bg-white rounded-md border border-gray-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Active Programmes</span>
            <BuildingLibraryIcon className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1 tabular-nums">{stats.activeCourses}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 tabular-nums">
            <span>Total Curricula: <strong className="text-gray-700">{stats.totalCourses}</strong></span>
          </div>
        </div>
        
        <div className="bg-white rounded-md border border-gray-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Student-Teacher Ratio</span>
            <ChartBarIcon className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1 tabular-nums">
            {stats.totalTeachers > 0 ? Math.round(stats.totalStudents / stats.totalTeachers) : 0}:1
          </p>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            <span>Statutory capacity ratio</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Students by Programme */}
        <div className="bg-white rounded-md border border-gray-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
            <div>
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Enrollment by Academic Programme</h3>
              <p className="text-xs text-gray-500 mt-0.5">Distribution across registered SHS departments</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.studentsByProgramme}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={85}
                  fill="#15803d"
                  dataKey="count"
                  nameKey="programme"
                  label={({ name, percent }: any) => `${name.substring(0, 10)}: ${(percent * 100).toFixed(0)}%`}
                >
                  {stats.studentsByProgramme.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Students']} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gender Distribution */}
        <div className="bg-white rounded-md border border-gray-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
            <div>
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Gender Demographics</h3>
              <p className="text-xs text-gray-500 mt-0.5">Cohort balance across institutional registers</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.studentsByGender}
                margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="gender" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" name="Enrolled Count" fill="#15803d" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Students by Class */}
        <div className="bg-white rounded-md border border-gray-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
            <div>
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Students Enrolled by Class Arm</h3>
              <p className="text-xs text-gray-500 mt-0.5">Active registration numbers per classroom</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.studentsByClass}
                margin={{ top: 10, right: 20, left: 10, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="className" angle={-45} textAnchor="end" height={60} tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" name="Class Count" fill="#2563eb" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Teachers by Department */}
        <div className="bg-white rounded-md border border-gray-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
            <div>
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Faculty Distribution by Department</h3>
              <p className="text-xs text-gray-500 mt-0.5">Instructional staff allocation across departments</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.teachersByDepartment}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={85}
                  fill="#2563eb"
                  dataKey="count"
                  nameKey="department"
                  label={({ name, percent }: any) => `${name.substring(0, 8)}: ${(percent * 100).toFixed(0)}%`}
                >
                  {stats.teachersByDepartment.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Teachers']} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStudentReport = () => (
    <div className="space-y-6">
      {/* Registration Trends */}
      <div className="bg-white rounded-md border border-gray-200 p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
          <div>
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Student Registration Inflow (Last 30 Days)</h3>
            <p className="text-xs text-gray-500 mt-0.5">Daily record of student admissions and onboardings</p>
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={stats.recentRegistrations}
              margin={{ top: 10, right: 30, left: 10, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                angle={-45} 
                textAnchor="end" 
                height={50}
                tick={{ fontSize: 10 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })}
              />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value) => [value, 'Registrations']}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                name="Daily Registrations" 
                stroke="#15803d" 
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 6 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white rounded-md border border-gray-200 p-5 shadow-xs space-y-4">
          <div className="pb-3 border-b border-gray-100">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Enrollment Status Summary</h3>
            <p className="text-xs text-gray-500 mt-0.5">Ratio of active attending students vs archived records</p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-gray-50 p-3 rounded-sm border border-gray-200">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Total Roster</span>
              <p className="text-xl font-bold text-gray-900 mt-1 tabular-nums">{stats.totalStudents}</p>
            </div>
            <div className="bg-green-50/60 p-3 rounded-sm border border-green-200">
              <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider block">Active</span>
              <p className="text-xl font-bold text-green-900 mt-1 tabular-nums">{stats.totalActiveStudents}</p>
            </div>
            <div className="bg-red-50/60 p-3 rounded-sm border border-red-200">
              <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider block">Inactive</span>
              <p className="text-xl font-bold text-red-900 mt-1 tabular-nums">{stats.totalInactiveStudents}</p>
            </div>
          </div>
          
          <div className="h-48 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.studentsByGender}
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  fill="#15803d"
                  dataKey="count"
                  nameKey="gender"
                  label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {stats.studentsByGender.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Students']} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Programme Breakdown List */}
        <div className="bg-white rounded-md border border-gray-200 p-5 shadow-xs">
          <div className="pb-3 border-b border-gray-100 mb-3">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Programme Enrollment Quotas</h3>
            <p className="text-xs text-gray-500 mt-0.5">Enrolled breakdown across all authorized courses</p>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {stats.studentsByProgramme.map((item, index) => {
              const percentage = stats.totalStudents > 0 ? (item.count / stats.totalStudents) * 100 : 0;
              const activePercentage = stats.totalStudents > 0 ? (item.activeCount / stats.totalStudents) * 100 : 0;
              return (
                <div key={index} className="p-2.5 bg-gray-50/70 rounded-sm border border-gray-200 text-xs">
                  <div className="flex justify-between items-center font-medium">
                    <span className="text-gray-900">{item.programme}</span>
                    <span className="text-gray-600 tabular-nums">{item.count} students ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-sm h-1.5 mt-2 overflow-hidden">
                    <div
                      className="bg-school-green-700 h-1.5 rounded-sm"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-gray-400 mt-1 tabular-nums">
                    <span>Active: {item.activeCount} ({activePercentage.toFixed(1)}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const renderTeacherReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Detailed View */}
        <div className="bg-white rounded-md border border-gray-200 p-5 shadow-xs">
          <div className="pb-3 border-b border-gray-100 mb-3">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Departmental Faculty Strength</h3>
            <p className="text-xs text-gray-500 mt-0.5">Teaching personnel allocations per department</p>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {stats.teachersByDepartment.map((item, index) => {
              const percentage = stats.totalTeachers > 0 ? (item.count / stats.totalTeachers) * 100 : 0;
              const activeCount = item.activeCount || 0;
              const activePercentage = stats.totalTeachers > 0 ? (activeCount / stats.totalTeachers) * 100 : 0;
              return (
                <div key={index} className="p-2.5 bg-gray-50/70 rounded-sm border border-gray-200 text-xs">
                  <div className="flex justify-between items-center font-medium">
                    <span className="text-gray-900">{item.department}</span>
                    <span className="text-gray-600 tabular-nums">{item.count} teachers ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-sm h-1.5 mt-2 overflow-hidden">
                    <div
                      className="bg-blue-700 h-1.5 rounded-sm"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-gray-400 mt-1 tabular-nums">
                    <span>Active: {activeCount} ({activePercentage.toFixed(1)}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Teacher Status Distribution */}
        <div className="bg-white rounded-md border border-gray-200 p-5 shadow-xs space-y-4">
          <div className="pb-3 border-b border-gray-100">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Faculty Employment Roster</h3>
            <p className="text-xs text-gray-500 mt-0.5">Active classroom teachers vs inactive records</p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-gray-50 p-3 rounded-sm border border-gray-200">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Total Faculty</span>
              <p className="text-xl font-bold text-gray-900 mt-1 tabular-nums">{stats.totalTeachers}</p>
            </div>
            <div className="bg-green-50/60 p-3 rounded-sm border border-green-200">
              <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider block">Active</span>
              <p className="text-xl font-bold text-green-900 mt-1 tabular-nums">{stats.totalActiveTeachers}</p>
            </div>
            <div className="bg-red-50/60 p-3 rounded-sm border border-red-200">
              <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider block">Inactive</span>
              <p className="text-xl font-bold text-red-900 mt-1 tabular-nums">{stats.totalInactiveTeachers}</p>
            </div>
          </div>
          
          <div className="h-48 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.teachersByDepartment}
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  fill="#2563eb"
                  dataKey="count"
                  nameKey="department"
                  label={({ name, percent }: any) => `${name.substring(0, 8)}: ${(percent * 100).toFixed(0)}%`}
                >
                  {stats.teachersByDepartment.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Teachers']} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      {/* Timetable Activity Chart */}
      <div className="bg-white rounded-md border border-gray-200 p-5 shadow-xs">
        <div className="pb-3 border-b border-gray-100 mb-4">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Timetable & Schedule Maintenance (Last 30 Days)</h3>
          <p className="text-xs text-gray-500 mt-0.5">Frequency of class schedule alterations and entries</p>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={stats.timetableUpdates}
              margin={{ top: 10, right: 30, left: 0, bottom: 25 }}
            >
              <defs>
                <linearGradient id="colorTimetable" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#15803d" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#15803d" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                angle={-45} 
                textAnchor="end" 
                height={50}
                tick={{ fontSize: 10 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })}
              />
              <YAxis tick={{ fontSize: 11 }} />
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value) => [value, 'Updates']}
              />
              <Area 
                type="monotone" 
                dataKey="count" 
                name="Timetable Entries" 
                stroke="#15803d" 
                fillOpacity={1} 
                fill="url(#colorTimetable)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Operational Key Metrics */}
        <div className="bg-white rounded-md border border-gray-200 p-5 shadow-xs">
          <div className="pb-3 border-b border-gray-100 mb-4">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Operational Summary Metrics</h3>
            <p className="text-xs text-gray-500 mt-0.5">Calculated institutional ratios and retention indicators</p>
          </div>
          <div className="space-y-3 divide-y divide-gray-100 text-xs">
            <div className="flex justify-between items-center pt-1">
              <span className="text-gray-600">Mean Students per Programme</span>
              <span className="font-bold text-gray-900 tabular-nums">
                {stats.studentsByProgramme.length > 0 
                  ? Math.round(stats.totalStudents / stats.studentsByProgramme.length)
                  : 0}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-gray-600">Institutional Faculty Ratio</span>
              <span className="font-bold text-gray-900 tabular-nums">
                {stats.totalTeachers > 0 ? Math.round(stats.totalStudents / stats.totalTeachers) : 0}:1
              </span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-gray-600">New Registrations (Past 30 Days)</span>
              <span className="font-bold text-gray-900 tabular-nums">
                {stats.recentRegistrations.reduce((sum, item) => sum + item.count, 0)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-gray-600">Active Student Retention</span>
              <span className="font-bold text-school-green-700 tabular-nums">
                {stats.totalStudents > 0 
                  ? ((stats.totalActiveStudents / stats.totalStudents) * 100).toFixed(1) 
                  : 0}%
              </span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-gray-600">Active Teacher Retention</span>
              <span className="font-bold text-school-green-700 tabular-nums">
                {stats.totalTeachers > 0 
                  ? ((stats.totalActiveTeachers / stats.totalTeachers) * 100).toFixed(1) 
                  : 0}%
              </span>
            </div>
          </div>
        </div>

        {/* Quick Report Actions */}
        <div className="bg-white rounded-md border border-gray-200 p-5 shadow-xs">
          <div className="pb-3 border-b border-gray-100 mb-4">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Report Generation & Export</h3>
            <p className="text-xs text-gray-500 mt-0.5">Produce printable and downloadable institutional documents</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => window.print()}
              className="px-3 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-sm text-xs font-medium text-gray-700 flex items-center justify-center gap-2 transition-colors"
            >
              <PrinterIcon className="w-4 h-4 text-gray-500" />
              <span>Print Overview</span>
            </button>
            <button 
              onClick={() => window.print()}
              className="px-3 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-sm text-xs font-medium text-gray-700 flex items-center justify-center gap-2 transition-colors"
            >
              <DocumentChartBarIcon className="w-4 h-4 text-gray-500" />
              <span>Export Dossier</span>
            </button>
            <button 
              onClick={() => window.print()}
              className="px-3 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-sm text-xs font-medium text-gray-700 flex items-center justify-center gap-2 transition-colors"
            >
              <ArrowDownTrayIcon className="w-4 h-4 text-gray-500" />
              <span>Download CSV</span>
            </button>
            <button 
              onClick={() => window.print()}
              className="px-3 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-sm text-xs font-medium text-gray-700 flex items-center justify-center gap-2 transition-colors"
            >
              <EnvelopeIcon className="w-4 h-4 text-gray-500" />
              <span>Email Briefing</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (selectedReport) {
      case 'students':
        return renderStudentReport();
      case 'teachers':
        return renderTeacherReport();
      case 'analytics':
        return renderAnalytics();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-md border border-gray-200 shadow-xs p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-gray-900">Institutional Reports & Analytics</h2>
          <p className="text-xs text-gray-500 mt-0.5">Comprehensive enrollment statistics, staffing levels, and operational metrics</p>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Generated Snapshot</span>
          <span className="text-xs font-semibold text-gray-700 tabular-nums font-mono">{new Date().toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 flex space-x-1">
        {reportTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = selectedReport === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedReport(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                isActive
                  ? 'border-school-green-700 text-school-green-800 bg-school-green-50/50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-school-green-700' : 'text-gray-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {renderContent()}
    </div>
  );
}