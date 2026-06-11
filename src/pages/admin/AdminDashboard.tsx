import React, { useState, useEffect } from 'react';
import { db } from '../../../lib/neon';
import toast from 'react-hot-toast';
import { PortalHeader } from '../../components/PortalHeader';
import { PortalCard } from '../../components/PortalCard';

interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  recentRegistrations: number;
  maleStudents: number;
  femaleStudents: number;
  activeClasses: number;
  totalSubjects: number;
}

interface RecentActivity {
  id: string;
  type: 'student' | 'teacher' | 'system' | 'announcement' | 'timetable';
  message: string;
  timestamp: string;
  icon: string;
  details?: any;
}

interface Admin {
  id: string;
  adminId: string;
  fullName: string;
  role: string;
}

export function AdminDashboard({ admin, onLogout }: { admin: Admin; onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalTeachers: 0,
    totalCourses: 0,
    recentRegistrations: 0,
    maleStudents: 0,
    femaleStudents: 0,
    activeClasses: 0,
    totalSubjects: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [classEnrollment, setClassEnrollment] = useState<{ className: string; count: number }[]>([]);
  const [aiKeyCount, setAiKeyCount] = useState<number>(0);

  // Ensure we're using the admin and onLogout props
  const _admin = admin;
  const _onLogout = onLogout;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch data from database, including inactive users for accurate statistics
      const [studentsRaw, teachersRaw, coursesRaw, subjectsRaw] = await Promise.all([
        db.getStudents({ limit: 1000, includeInactive: true }),
        db.getTeachers({ limit: 1000, includeInactive: true }),
        db.getCourses(),
        db.getSubjects(),
      ]);

      const students = Array.isArray(studentsRaw) ? studentsRaw : [];
      const teachers = Array.isArray(teachersRaw) ? teachersRaw : [];
      const courses = Array.isArray(coursesRaw) ? coursesRaw : [];
      const subjects = Array.isArray(subjectsRaw) ? subjectsRaw : [];

      // Calculate recent registrations (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentStudents = students?.filter((student: any) => 
        student && student.created_at && new Date(student.created_at) > thirtyDaysAgo
      ) || [];

      // Calculate gender distribution (only active students)
      const activeStudents = students?.filter((student: any) => student?.is_active) || [];
      const maleStudents = activeStudents.filter((student: any) => student?.gender === 'Male').length;
      const femaleStudents = activeStudents.filter((student: any) => student?.gender === 'Female').length;

      // Get active classes and enrollment
      const activeClassesResult = await db.getClasses();
      const activeClasses = Array.isArray(activeClassesResult) ? activeClassesResult : [];

      // Build class enrollment from students
      const classCounts: Record<string, number> = {};
      activeStudents.forEach((s: any) => {
        const cn = s.class_name || 'Unassigned';
        classCounts[cn] = (classCounts[cn] || 0) + 1;
      });
      const enrollmentData = Object.entries(classCounts)
        .map(([className, count]) => ({ className, count }))
        .sort((a, b) => b.count - a.count);

      setStats({
        totalStudents: students?.length || 0,
        totalTeachers: teachers?.length || 0,
        totalCourses: courses?.length || 0,
        recentRegistrations: recentStudents?.length || 0,
        maleStudents,
        femaleStudents,
        activeClasses: activeClasses?.length || 0,
        totalSubjects: subjects?.length || 0,
      });

      setClassEnrollment(enrollmentData);

      // Set recent activities from real data
      const activities: RecentActivity[] = [];
      
      // Add recent student registrations
      const sortedStudents = [...recentStudents].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      sortedStudents.slice(0, 3).forEach((student: any) => {
        activities.push({
          id: `student-${student.id}`,
          type: 'student',
          message: `New student registered: ${student.surname}, ${student.other_names}`,
          timestamp: new Date(student.created_at).toLocaleDateString(),
          icon: '👨‍🎓'
        });
      });
      
      // Add recent teacher registrations
      const sortedTeachers = [...teachers].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      sortedTeachers.slice(0, 2).forEach((teacher: any) => {
        activities.push({
          id: `teacher-${teacher.id}`,
          type: 'teacher',
          message: `New teacher added: ${teacher.surname}, ${teacher.other_names}`,
          timestamp: new Date(teacher.created_at).toLocaleDateString(),
          icon: '👩‍🏫'
        });
      });
      
      // Check AI Keys
      const keys = await db.getAIKeys();
      setAiKeyCount(Array.isArray(keys) ? keys.length : 0);
      
      setRecentActivities(activities);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Premium Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-school-green-800 via-school-green-700 to-teal-900 rounded-[2rem] p-8 md:p-10 shadow-2xl text-white">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-10 w-40 h-40 bg-teal-400 opacity-20 rounded-full blur-2xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center md:space-x-8">
          <div className="bg-white/10 p-5 rounded-3xl backdrop-blur-md border border-white/20 shadow-inner mb-6 md:mb-0">
            <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div className="text-center md:text-left flex-1">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-2">Welcome back, {admin.fullName}!</h2>
            <p className="text-school-green-100 text-lg opacity-90 mb-6">Here's your school's overview for today.</p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10">
                <span className="text-xs text-school-green-100 uppercase tracking-wider block mb-1">Admin Role</span>
                <div className="font-bold text-lg">{admin.role.charAt(0).toUpperCase() + admin.role.slice(1)}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10">
                <span className="text-xs text-school-green-100 uppercase tracking-wider block mb-1">System Status</span>
                <div className="font-bold text-lg text-emerald-300 flex items-center"><div className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse"></div> Online</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* System Health Alerts */}
      {aiKeyCount === 0 && (
        <div className="bg-gradient-to-r from-red-500 to-rose-500 p-[1px] rounded-2xl shadow-lg animate-pulse">
          <div className="bg-white/95 backdrop-blur-sm p-4 rounded-[15px] flex items-center">
            <div className="flex-shrink-0 bg-red-100 p-2 rounded-full mr-4">
              <span className="text-xl">⚠️</span>
            </div>
            <div>
              <p className="text-sm font-bold text-red-600 uppercase tracking-wider">AI Service Configuration Required</p>
              <p className="text-sm text-gray-600 mt-1">
                You haven't added any AI API keys yet. Teachers will not be able to auto-generate quiz questions.
                <button 
                  onClick={() => toast.success('Navigate to Admin Settings to add keys')} 
                  className="font-bold text-red-600 hover:text-red-800 underline ml-2 transition-colors"
                >
                  Configure Now
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modern Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total Students', value: stats.totalStudents, icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', color: 'from-blue-500 to-cyan-400', bg: 'bg-blue-50' },
          { title: 'Total Teachers', value: stats.totalTeachers, icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', color: 'from-emerald-500 to-teal-400', bg: 'bg-emerald-50' },
          { title: 'Total Courses', value: stats.totalCourses, icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', color: 'from-amber-500 to-orange-400', bg: 'bg-amber-50' },
          { title: 'Active Classes', value: stats.activeClasses, icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', color: 'from-purple-500 to-indigo-400', bg: 'bg-purple-50' },
        ].map((stat, idx) => (
          <div key={idx} className="group relative bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110`}></div>
            <div className="relative z-10 flex items-center space-x-4">
              <div className={`${stat.bg} p-4 rounded-2xl`}>
                <svg className="w-8 h-8 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                </svg>
              </div>
              <div>
                <h3 className="text-3xl font-black text-gray-900 tracking-tight">{stat.value}</h3>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mt-1">{stat.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gender Distribution */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Student Demographics</h3>
          <div className="flex items-center justify-center h-56">
            <div className="flex justify-center space-x-8 w-full">
              <div className="text-center flex-1 group">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-400 to-indigo-500 shadow-lg shadow-blue-200 flex items-center justify-center mx-auto mb-4 transform transition-transform group-hover:scale-105">
                  <span className="text-3xl font-black text-white">{stats.maleStudents}</span>
                </div>
                <p className="text-sm font-semibold text-gray-600 uppercase">Boys</p>
              </div>
              <div className="text-center flex-1 group">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-pink-400 to-rose-500 shadow-lg shadow-pink-200 flex items-center justify-center mx-auto mb-4 transform transition-transform group-hover:scale-105">
                  <span className="text-3xl font-black text-white">{stats.femaleStudents}</span>
                </div>
                <p className="text-sm font-semibold text-gray-600 uppercase">Girls</p>
              </div>
            </div>
          </div>
        </div>

        {/* Class Enrollment */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Class Enrollment</h3>
          <div className="h-56 overflow-y-auto pr-2 custom-scrollbar">
            {classEnrollment.length > 0 ? (
              <div className="space-y-3">
                {classEnrollment.map((cls, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all cursor-pointer group">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 text-white font-bold shadow-md ${
                        index === 0 ? 'bg-gradient-to-br from-school-green-400 to-school-green-600 shadow-green-200' :
                        index === 1 ? 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-blue-200' :
                        index === 2 ? 'bg-gradient-to-br from-amber-400 to-amber-600 shadow-amber-200' :
                        index === 3 ? 'bg-gradient-to-br from-purple-400 to-purple-600 shadow-purple-200' : 
                        'bg-gradient-to-br from-teal-400 to-teal-600 shadow-teal-200'
                      }`}>
                        {cls.className.charAt(0)}
                      </div>
                      <span className="font-semibold text-gray-800 group-hover:text-school-green-600 transition-colors">{cls.className}</span>
                    </div>
                    <span className="text-xl font-black text-gray-700 bg-gray-100 px-3 py-1 rounded-lg">{cls.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 font-medium bg-gray-50 px-6 py-3 rounded-2xl">No class enrollment data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 group cursor-pointer">
                  <div className="text-2xl bg-white shadow-sm p-2 rounded-xl group-hover:scale-110 transition-transform">{activity.icon}</div>
                  <div className="flex-1 pt-1">
                    <p className="text-sm font-semibold text-gray-900 leading-tight">{activity.message}</p>
                    <p className="text-xs font-medium text-gray-500 mt-1">{activity.timestamp}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 bg-gray-50 rounded-2xl">
                <p className="text-gray-500 font-medium">No recent activities</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-10">
      {/* Premium Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-school-green-800 via-school-green-700 to-teal-800 rounded-3xl p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-20 w-40 h-40 bg-teal-400 opacity-20 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">Admin Overview</h2>
            <p className="text-school-green-100 font-medium mt-2 opacity-90 text-lg">System summary and key statistics at a glance</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-school-green-200 border-t-school-green-600"></div>
        </div>
      ) : (
        renderOverview()
      )}
    </div>
  );
}