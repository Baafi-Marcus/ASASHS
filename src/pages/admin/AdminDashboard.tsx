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

interface HouseDistribution {
  house: string;
  count: number;
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
  const [houseDistribution, setHouseDistribution] = useState<HouseDistribution[]>([]);

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
      const [students, teachers, courses, subjects] = await Promise.all([
        db.getStudents({ limit: 1000, includeInactive: true }),
        db.getTeachers({ limit: 1000, includeInactive: true }),
        db.getCourses(),
        db.getSubjects(),
      ]);

      // Calculate recent registrations (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentStudents = students.filter((student: any) => 
        new Date(student.created_at) > thirtyDaysAgo
      );

      // Calculate gender distribution (only active students)
      const activeStudents = students.filter((student: any) => student.is_active);
      const maleStudents = activeStudents.filter((student: any) => student.gender === 'Male').length;
      const femaleStudents = activeStudents.filter((student: any) => student.gender === 'Female').length;

      // Calculate house distribution
      const houseCounts: Record<string, number> = {};
      activeStudents.forEach((student: any) => {
        const house = student.house_preference && student.house_preference.trim() !== '' 
          ? student.house_preference 
          : 'Not Assigned';
        houseCounts[house] = (houseCounts[house] || 0) + 1;
      });
      
      const houseDistributionData = Object.entries(houseCounts)
        .map(([house, count]) => ({ house, count }))
        .sort((a, b) => b.count - a.count);

      // Get active classes count
      const activeClasses = await db.getClasses();

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

      setHouseDistribution(houseDistributionData);

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
      
      setRecentActivities(activities);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <PortalCard>
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-xl">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalStudents}</h3>
              <p className="text-gray-600">Total Students</p>
            </div>
          </div>
        </PortalCard>

        <PortalCard>
          <div className="flex items-center space-x-4">
            <div className="bg-green-100 p-3 rounded-xl">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalTeachers}</h3>
              <p className="text-gray-600">Total Teachers</p>
            </div>
          </div>
        </PortalCard>

        <PortalCard>
          <div className="flex items-center space-x-4">
            <div className="bg-yellow-100 p-3 rounded-xl">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalCourses}</h3>
              <p className="text-gray-600">Total Courses</p>
            </div>
          </div>
        </PortalCard>

        <PortalCard>
          <div className="flex items-center space-x-4">
            <div className="bg-purple-100 p-3 rounded-xl">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.activeClasses}</h3>
              <p className="text-gray-600">Active Classes</p>
            </div>
          </div>
        </PortalCard>
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gender Distribution */}
        <PortalCard title="Student Gender Distribution">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="flex justify-center space-x-8">
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl font-bold text-blue-600">{stats.maleStudents}</span>
                  </div>
                  <p className="text-gray-600">Male Students</p>
                </div>
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full bg-pink-100 flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl font-bold text-pink-600">{stats.femaleStudents}</span>
                  </div>
                  <p className="text-gray-600">Female Students</p>
                </div>
              </div>
            </div>
          </div>
        </PortalCard>

        {/* House Distribution */}
        <PortalCard title="House Distribution">
          <div className="h-64 overflow-y-auto">
            {houseDistribution.length > 0 ? (
              <div className="space-y-3">
                {houseDistribution.map((house, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-school-cream-50 transition-colors">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        index === 0 ? 'bg-red-500' :
                        index === 1 ? 'bg-blue-500' :
                        index === 2 ? 'bg-green-500' :
                        index === 3 ? 'bg-yellow-500' : 'bg-purple-500'
                      }`}></div>
                      <span className="font-medium text-gray-900">{house.house}</span>
                    </div>
                    <span className="text-lg font-bold text-gray-700">{house.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No house data available</p>
              </div>
            )}
          </div>
        </PortalCard>

        {/* Recent Activity */}
        <PortalCard title="Recent Activity">
          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-school-cream-50 transition-colors">
                  <div className="text-2xl">{activity.icon}</div>
                  <div className="flex-1">
                    <p className="text-gray-900">{activity.message}</p>
                    <p className="text-sm text-gray-500">{activity.timestamp}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No recent activities
              </div>
            )}
          </div>
        </PortalCard>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-school-cream-50 flex flex-col">
      <PortalHeader 
        portalName="Admin" 
        userName={admin.fullName} 
        onLogout={onLogout} 
      />
      
      <main className="flex-1 p-6 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-school-green-200 border-t-school-green-600"></div>
          </div>
        ) : (
          renderOverview()
        )}
      </main>
    </div>
  );
}