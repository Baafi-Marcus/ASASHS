import React, { useEffect, useState } from 'react';
import { db } from '../../../lib/neon';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area
} from 'recharts';

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
      
      // Fetch data, including inactive users for comprehensive reporting
      const [allStudents, allTeachers, allCoursesData, allSubjects, allClasses, timetableEntries] = await Promise.all([
        db.getStudents({ limit: 10000, includeInactive: true }), // Get all students including inactive
        db.getTeachers({ limit: 10000, includeInactive: true }), // Get all teachers including inactive
        db.getCourses(), // Get active courses only
        db.getSubjects(), // Get all subjects
        db.getClasses(), // Get all classes
        db.getTimetableEntries(), // Get all timetable entries
      ]);
      
      // Get total counts
      const totalStudents = allStudents.length;
      const totalActiveStudents = allStudents.filter((s: any) => s.is_active).length;
      const totalInactiveStudents = totalStudents - totalActiveStudents;
      
      const totalTeachers = allTeachers.length;
      const totalActiveTeachers = allTeachers.filter((t: any) => t.is_active).length;
      const totalInactiveTeachers = totalTeachers - totalActiveTeachers;
      
      const totalCourses = allCoursesData.length;
      const activeCourses = allCoursesData.filter((c: any) => c.is_active).length;

      // Process student data by programme
      const studentsByProgramme = allCoursesData.map((course: any) => {
        const courseStudents = allStudents.filter((student: any) => student.course_id === course.id);
        const activeCourseStudents = courseStudents.filter((s: any) => s.is_active);
        return {
          programme: course.name,
          count: courseStudents.length,
          activeCount: activeCourseStudents.length
        };
      });

      // Process student data by gender
      const studentsByGender = [
        { gender: 'Male', count: allStudents.filter((student: any) => student.gender === 'Male').length },
        { gender: 'Female', count: allStudents.filter((student: any) => student.gender === 'Female').length },
      ];

      // Process teacher data by department
      const departments = [...new Set(allTeachers.map((teacher: any) => teacher.department))];
      const teachersByDepartment = departments.map((dept) => {
        const deptTeachers = allTeachers.filter((teacher: any) => teacher.department === dept);
        const activeDeptTeachers = deptTeachers.filter((t: any) => t.is_active);
        return {
          department: dept || 'Unassigned',
          count: deptTeachers.length,
          activeCount: activeDeptTeachers.length
        };
      });

      // Process recent registrations (last 30 days)
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();

      const recentRegistrations = last30Days.map((date) => ({
        date,
        count: allStudents.filter((student: any) => {
          // Convert date to string if it's a Date object
          const createdAtStr = student.created_at instanceof Date 
            ? student.created_at.toISOString().split('T')[0]
            : typeof student.created_at === 'string'
            ? student.created_at.split('T')[0]
            : '';
          return createdAtStr === date;
        }).length,
      }));

      // Process students by class
      const studentsByClass = allClasses.map((cls: any) => {
        const classStudents = allStudents.filter((student: any) => 
          student.current_class_id === cls.id && student.is_active
        );
        return {
          className: cls.class_name,
          count: classStudents.length
        };
      }).filter((cls: any) => cls.count > 0); // Only show classes with students

      // Process teachers by subject
      const teachersBySubject = allSubjects.map((subject: any) => {
        // Get teacher-subject relationships
        // This would require a specific query, but for now we'll simulate
        const subjectTeachers = allTeachers.filter((teacher: any) => {
          // This is a simplified approach - in reality, we'd need to check teacher_subjects table
          return teacher.department && subject.name.includes(teacher.department.split(' ')[0]);
        });
        return {
          subject: subject.name,
          count: subjectTeachers.length
        };
      }).filter((subj: any) => subj.count > 0);

      // Process timetable updates (last 30 days)
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
      // Set fallback data
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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-school-green-200 border-t-school-green-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load report data</p>
      </div>
    );
  }

  const reportTabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'students', label: 'Students', icon: '👥' },
    { id: 'teachers', label: 'Teachers', icon: '👨‍🏫' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658', '#8dd1e1'];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-school-green-50 border-2 border-school-green-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-school-green-600 text-sm font-medium">Total Students</p>
              <p className="text-3xl font-bold text-school-green-800">{stats.totalStudents}</p>
              <p className="text-xs text-gray-600">
                Active: {stats.totalActiveStudents} | Inactive: {stats.totalInactiveStudents}
              </p>
            </div>
            <div className="text-3xl">👥</div>
          </div>
        </div>
        
        <div className="bg-school-cream-50 border-2 border-school-cream-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-school-cream-700 text-sm font-medium">Total Teachers</p>
              <p className="text-3xl font-bold text-school-cream-800">{stats.totalTeachers}</p>
              <p className="text-xs text-gray-600">
                Active: {stats.totalActiveTeachers} | Inactive: {stats.totalInactiveTeachers}
              </p>
            </div>
            <div className="text-3xl">👨‍🏫</div>
          </div>
        </div>
        
        <div className="bg-school-green-50 border-2 border-school-green-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-school-green-600 text-sm font-medium">Active Programmes</p>
              <p className="text-3xl font-bold text-school-green-800">{stats.activeCourses}</p>
              <p className="text-xs text-gray-600">Total: {stats.totalCourses}</p>
            </div>
            <div className="text-3xl">📚</div>
          </div>
        </div>
        
        <div className="bg-school-cream-50 border-2 border-school-cream-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-school-cream-700 text-sm font-medium">Student-Teacher Ratio</p>
              <p className="text-3xl font-bold text-school-cream-800">
                {stats.totalTeachers > 0 ? Math.round(stats.totalStudents / stats.totalTeachers) : 0}:1
              </p>
            </div>
            <div className="text-3xl">📊</div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Students by Programme - Pie Chart */}
        <div className="bg-white rounded-xl border-2 border-school-cream-200 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Students by Programme</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.studentsByProgramme}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="programme"
                  label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {stats.studentsByProgramme.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Students']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gender Distribution - Bar Chart */}
        <div className="bg-white rounded-xl border-2 border-school-cream-200 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Gender Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.studentsByGender}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="gender" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Student Count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Students by Class - Bar Chart */}
        <div className="bg-white rounded-xl border-2 border-school-cream-200 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Students by Class</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.studentsByClass}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 40,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="className" angle={-45} textAnchor="end" height={60} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Student Count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Teachers by Department - Pie Chart */}
        <div className="bg-white rounded-xl border-2 border-school-cream-200 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Teachers by Department</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.teachersByDepartment}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="department"
                  label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {stats.teachersByDepartment.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Teachers']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStudentReport = () => (
    <div className="space-y-6">
      {/* Student Registration Trends - Line Chart */}
      <div className="bg-white rounded-xl border-2 border-school-cream-200 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Student Registration Trends (Last 30 Days)</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={stats.recentRegistrations}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                angle={-45} 
                textAnchor="end" 
                height={60}
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value) => [value, 'Registrations']}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="count" 
                name="Daily Registrations" 
                stroke="#8884d8" 
                activeDot={{ r: 8 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Status Distribution */}
        <div className="bg-white rounded-xl border-2 border-school-cream-200 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Student Status Distribution</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-school-green-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-school-green-800">{stats.totalStudents}</p>
              <p className="text-sm text-gray-600">Total Students</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-blue-800">{stats.totalActiveStudents}</p>
              <p className="text-sm text-gray-600">Active Students</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-red-800">{stats.totalInactiveStudents}</p>
              <p className="text-sm text-gray-600">Inactive Students</p>
            </div>
          </div>
          
          {/* Gender Distribution Pie Chart */}
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.studentsByGender}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={60}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="gender"
                  label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {stats.studentsByGender.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Students']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Students by Programme - Detailed View */}
        <div className="bg-white rounded-xl border-2 border-school-cream-200 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Students by Programme</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {stats.studentsByProgramme.map((item, index) => {
              const percentage = stats.totalStudents > 0 ? (item.count / stats.totalStudents) * 100 : 0;
              const activePercentage = stats.totalStudents > 0 ? (item.activeCount / stats.totalStudents) * 100 : 0;
              return (
                <div key={index}>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">{item.programme}</span>
                    <span className="text-gray-600">{item.count} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mt-1">
                    <div
                      className="bg-school-cream-600 h-3 rounded-full"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Active: {item.activeCount} ({activePercentage.toFixed(1)}%)
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
        {/* Teachers by Department - Detailed View */}
        <div className="bg-white rounded-xl border-2 border-school-cream-200 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Teachers by Department</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {stats.teachersByDepartment.map((item, index) => {
              const percentage = stats.totalTeachers > 0 ? (item.count / stats.totalTeachers) * 100 : 0;
              const activeCount = item.activeCount || 0;
              const activePercentage = stats.totalTeachers > 0 ? (activeCount / stats.totalTeachers) * 100 : 0;
              return (
                <div key={index}>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">{item.department}</span>
                    <span className="text-gray-600">{item.count} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mt-1">
                    <div
                      className="bg-school-cream-600 h-3 rounded-full"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Active: {activeCount} ({activePercentage.toFixed(1)}%)
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Teacher Status Distribution */}
        <div className="bg-white rounded-xl border-2 border-school-cream-200 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Teacher Status Distribution</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-school-cream-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-school-cream-800">{stats.totalTeachers}</p>
              <p className="text-sm text-gray-600">Total Teachers</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-blue-800">{stats.totalActiveTeachers}</p>
              <p className="text-sm text-gray-600">Active Teachers</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-red-800">{stats.totalInactiveTeachers}</p>
              <p className="text-sm text-gray-600">Inactive Teachers</p>
            </div>
          </div>
          
          {/* Department Distribution Pie Chart */}
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.teachersByDepartment}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={60}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="department"
                  label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {stats.teachersByDepartment.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Teachers']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      {/* Timetable Updates - Area Chart */}
      <div className="bg-white rounded-xl border-2 border-school-cream-200 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Timetable Updates (Last 30 Days)</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={stats.timetableUpdates}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 40,
              }}
            >
              <defs>
                <linearGradient id="colorTimetable" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                angle={-45} 
                textAnchor="end" 
                height={60}
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value) => [value, 'Updates']}
              />
              <Area 
                type="monotone" 
                dataKey="count" 
                name="Timetable Updates" 
                stroke="#8884d8" 
                fillOpacity={1} 
                fill="url(#colorTimetable)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border-2 border-school-cream-200 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Key Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average Students per Programme</span>
              <span className="font-bold text-school-green-600">
                {stats.studentsByProgramme.length > 0 
                  ? Math.round(stats.totalStudents / stats.studentsByProgramme.length)
                  : 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Student-Teacher Ratio</span>
              <span className="font-bold text-school-green-600">
                {stats.totalTeachers > 0 ? Math.round(stats.totalStudents / stats.totalTeachers) : 0}:1
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Registrations (Last 30 Days)</span>
              <span className="font-bold text-school-green-600">
                {stats.recentRegistrations.reduce((sum, item) => sum + item.count, 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Student Rate</span>
              <span className="font-bold text-school-green-600">
                {stats.totalStudents > 0 
                  ? ((stats.totalActiveStudents / stats.totalStudents) * 100).toFixed(1) 
                  : 0}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Teacher Rate</span>
              <span className="font-bold text-school-green-600">
                {stats.totalTeachers > 0 
                  ? ((stats.totalActiveTeachers / stats.totalTeachers) * 100).toFixed(1) 
                  : 0}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border-2 border-school-cream-200 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full bg-school-green-600 text-white p-3 rounded-lg hover:bg-school-green-700 transition-colors flex items-center justify-center">
              <span className="mr-2">📄</span> Export Student List
            </button>
            <button className="w-full bg-school-cream-600 text-white p-3 rounded-lg hover:bg-school-cream-700 transition-colors flex items-center justify-center">
              <span className="mr-2">📊</span> Generate Full Report
            </button>
            <button className="w-full bg-gray-600 text-white p-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center">
              <span className="mr-2">📧</span> Email Report
            </button>
            <button className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
              <span className="mr-2">🖨️</span> Print Report
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
      {/* Report Tabs */}
      <div className="bg-white rounded-xl border-2 border-school-cream-200 p-2">
        <div className="flex space-x-2">
          {reportTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedReport(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all ${
                selectedReport === tab.id
                  ? 'bg-school-green-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-school-cream-100'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Report Content */}
      {renderContent()}
    </div>
  );
}