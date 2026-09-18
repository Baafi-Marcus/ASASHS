import React, { useState, useEffect } from 'react';
import { db } from '../../../lib/neon';
import toast from 'react-hot-toast';
import { PortalCard } from '../../components/PortalCard';
import { PortalButton } from '../../components/PortalButton';
import { UserAvatar } from '../../components/UserAvatar';

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
}

interface Admin {
  id: string;
  adminId: string;
  fullName: string;
  role: string;
}

export function AdminDashboard({ admin, onLogout }: { admin: Admin; onLogout: () => void }) {
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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
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

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentStudents = students.filter((student: any) => 
        student && student.created_at && new Date(student.created_at) > thirtyDaysAgo
      );

      const activeStudents = students.filter((student: any) => student?.is_active);
      const maleStudents = activeStudents.filter((student: any) => student?.gender === 'Male').length;
      const femaleStudents = activeStudents.filter((student: any) => student?.gender === 'Female').length;

      const activeClassesResult = await db.getClasses();
      const activeClasses = Array.isArray(activeClassesResult) ? activeClassesResult : [];

      const classCounts: Record<string, number> = {};
      activeStudents.forEach((s: any) => {
        const cn = s.class_name || 'Unassigned';
        classCounts[cn] = (classCounts[cn] || 0) + 1;
      });
      const enrollmentData = Object.entries(classCounts)
        .map(([className, count]) => ({ className, count }))
        .sort((a, b) => b.count - a.count);

      setStats({
        totalStudents: students.length,
        totalTeachers: teachers.length,
        totalCourses: courses.length,
        recentRegistrations: recentStudents.length,
        maleStudents,
        femaleStudents,
        activeClasses: activeClasses.length,
        totalSubjects: subjects.length,
      });

      setClassEnrollment(enrollmentData);

      const activities: RecentActivity[] = [];
      const sortedStudents = [...recentStudents].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      sortedStudents.slice(0, 3).forEach((student: any) => {
        activities.push({
          id: `student-${student.id}`,
          type: 'student',
          message: `Enrolled: ${student.surname}, ${student.other_names}`,
          timestamp: new Date(student.created_at).toLocaleDateString()
        });
      });
      
      const sortedTeachers = [...teachers].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      sortedTeachers.slice(0, 2).forEach((teacher: any) => {
        activities.push({
          id: `teacher-${teacher.id}`,
          type: 'teacher',
          message: `Staff registered: ${teacher.surname}, ${teacher.other_names}`,
          timestamp: new Date(teacher.created_at).toLocaleDateString()
        });
      });
      
      try {
        const keys = await db.getAIKeys();
        setAiKeyCount(Array.isArray(keys) ? keys.length : 0);
      } catch {
        setAiKeyCount(1);
      }
      
      setRecentActivities(activities);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-school-green-200 border-t-school-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Admin Profile & Status Header */}
      <PortalCard className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <UserAvatar name={admin.fullName} size="lg" />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-sm text-[10px] font-bold bg-school-green-50 text-school-green-800 border border-school-green-200 uppercase tracking-wider">
                  {admin.role.charAt(0).toUpperCase() + admin.role.slice(1)} Portal
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 font-mono">
                  <span className="w-2 h-2 rounded-full bg-school-green-500"></span>
                  Online
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                {admin.fullName}
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Central Operations & Institutional Oversight • ID: {admin.adminId || 'ADM001'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="bg-gray-50 rounded-sm border border-gray-200 px-4 py-2 text-center min-w-[120px]">
              <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block">New Enrollments</span>
              <span className="text-lg font-bold text-gray-900 tabular-nums">{stats.recentRegistrations}</span>
            </div>
            <div className="bg-gray-50 rounded-sm border border-gray-200 px-4 py-2 text-center min-w-[120px]">
              <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block">Total Cohort</span>
              <span className="text-lg font-bold text-school-green-700 tabular-nums">{stats.totalStudents}</span>
            </div>
          </div>
        </div>
      </PortalCard>

      {/* AI Key Notification Alert */}
      {aiKeyCount === 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-sm flex items-start gap-3">
          <div className="w-5 h-5 rounded-sm bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
            !
          </div>
          <div>
            <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider">AI Service Configuration Recommended</h4>
            <p className="text-xs text-amber-900 mt-0.5 leading-relaxed">
              No generative AI API keys are configured. Teachers will not be able to auto-extract questions from lecture documents. Navigate to System Settings to add a key.
            </p>
          </div>
        </div>
      )}

      {/* Modern High-Density Metric Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            title: 'Enrolled Students',
            value: stats.totalStudents,
            subtitle: `${stats.recentRegistrations} enrolled last 30d`,
            icon: (
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )
          },
          {
            title: 'Faculty Teachers',
            value: stats.totalTeachers,
            subtitle: 'Active staff accounts',
            icon: (
              <svg className="w-5 h-5 text-school-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            )
          },
          {
            title: 'Programmes & Courses',
            value: stats.totalCourses,
            subtitle: `${stats.totalSubjects} distinct subjects`,
            icon: (
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            )
          },
          {
            title: 'Active Class Sections',
            value: stats.activeClasses,
            subtitle: 'Form 1, 2, and 3 streams',
            icon: (
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )
          },
        ].map((stat, idx) => (
          <PortalCard key={idx} className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{stat.title}</span>
              <div className="p-2 rounded-sm bg-gray-50 border border-gray-200">
                {stat.icon}
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 tabular-nums tracking-tight">
              {stat.value}
            </div>
            <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
          </PortalCard>
        ))}
      </div>

      {/* Charts & Breakdown Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gender Distribution */}
        <PortalCard className="p-6">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">Student Demographics</h3>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-4 bg-gray-50 rounded-sm border border-gray-200 text-center">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Boys</span>
              <span className="text-2xl font-bold text-gray-900 tabular-nums">{stats.maleStudents}</span>
            </div>
            <div className="p-4 bg-gray-50 rounded-sm border border-gray-200 text-center">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Girls</span>
              <span className="text-2xl font-bold text-gray-900 tabular-nums">{stats.femaleStudents}</span>
            </div>
          </div>
          <div className="space-y-1.5 pt-2 border-t border-gray-100">
            <div className="flex justify-between text-xs font-medium text-gray-600">
              <span>Ratio</span>
              <span className="font-mono tabular-nums">
                {stats.maleStudents + stats.femaleStudents > 0 
                  ? `${Math.round((stats.maleStudents / (stats.maleStudents + stats.femaleStudents)) * 100)}% M / ${Math.round((stats.femaleStudents / (stats.maleStudents + stats.femaleStudents)) * 100)}% F`
                  : 'N/A'}
              </span>
            </div>
            <div className="w-full bg-gray-200 h-1.5 rounded-sm overflow-hidden flex">
              <div 
                className="bg-blue-600 h-full"
                style={{ 
                  width: `${stats.maleStudents + stats.femaleStudents > 0 ? (stats.maleStudents / (stats.maleStudents + stats.femaleStudents)) * 100 : 50}%` 
                }}
              />
              <div 
                className="bg-pink-600 h-full"
                style={{ 
                  width: `${stats.maleStudents + stats.femaleStudents > 0 ? (stats.femaleStudents / (stats.maleStudents + stats.femaleStudents)) * 100 : 50}%` 
                }}
              />
            </div>
          </div>
        </PortalCard>

        {/* Class Enrollment */}
        <PortalCard className="p-6">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">Class Distribution</h3>
          <div className="h-48 overflow-y-auto pr-1 space-y-2">
            {classEnrollment.length > 0 ? (
              classEnrollment.map((cls, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-sm hover:bg-gray-50 border border-gray-100">
                  <span className="text-xs font-medium text-gray-900 truncate max-w-[180px]">{cls.className}</span>
                  <span className="text-xs font-mono font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-sm tabular-nums">
                    {cls.count}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 py-8 text-center">No enrollment records</p>
            )}
          </div>
        </PortalCard>

        {/* Recent Activity */}
        <PortalCard className="p-6">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">Activity Log</h3>
          <div className="space-y-3">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-2.5 pb-2 border-b border-gray-100 last:border-0 last:pb-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-school-green-600 mt-1.5 shrink-0"></span>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-900 leading-tight">{activity.message}</p>
                    <p className="text-[10px] font-mono text-gray-400 mt-0.5 tabular-nums">{activity.timestamp}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 py-8 text-center">No recent activity logged</p>
            )}
          </div>
        </PortalCard>
      </div>
    </div>
  );
}