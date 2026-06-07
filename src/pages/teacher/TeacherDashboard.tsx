import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { db } from '../../../lib/neon';
import { PortalHeader } from '../../components/PortalHeader';
import { PortalSidebar } from '../../components/PortalSidebar';
import { PortalCard } from '../../components/PortalCard';
import { TeacherClasses } from './TeacherClasses';
import { TeacherAssignments } from './TeacherAssignments';
import { TeacherGradebook } from './TeacherGradebook';
import { TeacherStudentPerformance } from './TeacherStudentPerformance';
import { TeacherMessages } from './TeacherMessages';
import { TeacherProfile } from './TeacherProfile';
import { TeacherELearning } from './TeacherELearning';
import { TeacherExams } from './TeacherExams';

interface Teacher {
  id: string;
  teacherId: string;
  teacherDbId: number;
  fullName: string;
  subjects: string[];
  classes: string[];
  department: string;
}

interface TeacherDashboardProps {
  teacher: Teacher;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ 
  teacher, 
  onLogout, 
  activeTab, 
  setActiveTab 
}) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [stats, setStats] = useState({
    studentsCount: 0,
    pendingGrades: 0,
    upcomingExams: 0
  });
  const [assignedClasses, setAssignedClasses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const teacherSubjectsResult = await db.getTeacherSubjects(teacher.teacherDbId);
      const teacherSubjects = Array.isArray(teacherSubjectsResult) ? teacherSubjectsResult : [];
      
      // Populate assigned class names for display
      const classMap = new Map<number, string>();
      teacherSubjects.forEach((s: any) => {
        const cid = Number(s?.class_id);
        if (!isNaN(cid) && s?.class_name) {
          classMap.set(cid, s.class_name);
        }
      });
      setAssignedClasses(Array.from(classMap.values()));
      
      // Get unique class IDs
      const classIdSet = new Set<number>();
      teacherSubjects.forEach((subject: any) => {
        const classId = Number(subject?.class_id);
        if (!isNaN(classId)) {
          classIdSet.add(classId);
        }
      });
      const classIds: number[] = Array.from(classIdSet);
      
      // Fetch students for each class and count total
      let totalStudents = 0;
      const studentIds = new Set();
      
      for (let i = 0; i < classIds.length; i++) {
        const classId = classIds[i];
        const classStudentsResult = await db.getClassStudents(classId);
        const classStudents = Array.isArray(classStudentsResult) ? classStudentsResult : [];
        classStudents.forEach((student: any) => {
          if (student?.id) studentIds.add(student.id);
        });
      }
      
      totalStudents = studentIds.size;
      
      // Fetch assignments to count pending grades and upcoming exams
      const assignmentsRaw = await db.getAssignmentsByTeacher(teacher.teacherDbId);
      const assignmentsData = Array.isArray(assignmentsRaw) ? assignmentsRaw : [];
      
      // Count pending grades (assignments without submissions)
      let pendingGrades = 0;
      for (const assignment of assignmentsData) {
        const submissionsResult = await db.getAssignmentSubmissions(assignment.id);
        const submissions = Array.isArray(submissionsResult) ? submissionsResult : [];
        // In a real implementation, we would check for ungraded submissions
        // For now, we'll use the assignment count as a proxy
        pendingGrades += (submissions?.length || 0);
      }
      
      // Count upcoming exams (assignments with type 'Exam' or 'Midsem Exam')
      let upcomingExams = 0;
      const examAssignments = assignmentsData.filter((assignment: any) => 
        assignment.assignment_type === 'Exam' || assignment.assignment_type === 'Midsem Exam'
      );
      upcomingExams = examAssignments.length;
      
      // Set real statistics
      setStats({
        studentsCount: totalStudents,
        pendingGrades: pendingGrades,
        upcomingExams: upcomingExams
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
      
      // Set fallback stats
      setStats({
        studentsCount: 0,
        pendingGrades: 0,
        upcomingExams: 0
      });
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="text-center md:text-left flex-1">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-2">Welcome back, {teacher.fullName}!</h2>
            <p className="text-school-green-100 text-lg opacity-90 mb-6">Ready to inspire your students today?</p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10">
                <span className="text-xs text-school-green-100 uppercase tracking-wider block mb-1">Teacher ID</span>
                <div className="font-bold text-lg">{teacher.teacherId}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10">
                <span className="text-xs text-school-green-100 uppercase tracking-wider block mb-1">Department</span>
                <div className="font-bold text-lg">{teacher.department}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10">
                <span className="text-xs text-school-green-100 uppercase tracking-wider block mb-1">Assigned Classes</span>
                <div className="font-bold text-lg">{assignedClasses.length || 0}</div>
                {assignedClasses.length > 0 && (
                  <div className="text-xs text-school-green-200 mt-1">{assignedClasses.join(', ')}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'Total Students', value: stats.studentsCount || 0, icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', color: 'from-blue-500 to-indigo-500', bg: 'bg-blue-50' },
          { title: 'Pending Grades', value: stats.pendingGrades || 0, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50' },
          { title: 'Upcoming Exams', value: stats.upcomingExams || 0, icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', color: 'from-purple-500 to-pink-500', bg: 'bg-purple-50' },
        ].map((stat, idx) => (
          <div key={idx} className="group relative bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110`}></div>
            <div className="relative z-10 flex items-center space-x-5">
              <div className={`${stat.bg} p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300`}>
                <svg className="w-8 h-8 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                </svg>
              </div>
              <div>
                <h3 className="text-4xl font-black text-gray-900 tracking-tight">{stat.value}</h3>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mt-1">{stat.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { id: 'classes', title: 'My Classes', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', color: 'text-blue-600', bg: 'bg-blue-100', border: 'hover:border-blue-300', shadow: 'hover:shadow-blue-100' },
            { id: 'assignments', title: 'Assignments', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2h-2a2 2 0 01-2-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', color: 'text-emerald-600', bg: 'bg-emerald-100', border: 'hover:border-emerald-300', shadow: 'hover:shadow-emerald-100' },
            { id: 'grades', title: 'Gradebook', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', color: 'text-purple-600', bg: 'bg-purple-100', border: 'hover:border-purple-300', shadow: 'hover:shadow-purple-100' },
            { id: 'messages', title: 'Messages', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z', color: 'text-amber-600', bg: 'bg-amber-100', border: 'hover:border-amber-300', shadow: 'hover:shadow-amber-100' }
          ].map((action, idx) => (
            <button 
              key={idx}
              onClick={() => setActiveTab(action.id)}
              className={`flex flex-col items-center justify-center p-6 bg-gray-50 rounded-2xl border-2 border-transparent transition-all duration-300 transform hover:-translate-y-2 hover:bg-white hover:shadow-xl ${action.border} ${action.shadow} group`}
            >
              <div className={`${action.bg} p-4 rounded-[1.25rem] mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <svg className={`w-8 h-8 ${action.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={action.icon} />
                </svg>
              </div>
              <span className="text-base font-bold text-gray-700 group-hover:text-gray-900 transition-colors">{action.title}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': 
        return renderOverview();
      case 'classes': 
        return <TeacherClasses teacherId={teacher.teacherDbId} />;
      case 'assignments': 
        return <TeacherAssignments teacherId={teacher.teacherDbId} />;
      case 'exams':
        return <TeacherExams teacherId={teacher.teacherDbId} />;
      case 'grades': 
        return <TeacherGradebook teacherId={teacher.teacherDbId} />;
      case 'performance': 
        return <TeacherStudentPerformance teacherId={teacher.teacherDbId} />;
      case 'messages': 
        return <TeacherMessages teacherId={teacher.teacherDbId} />;
      case 'elearning':
        return <TeacherELearning teacherId={teacher.teacherDbId} />;
      case 'profile': 
        return <TeacherProfile teacher={teacher as any} onLogout={onLogout} />;
      default: 
        return renderOverview();
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {loading && activeTab === 'overview' ? (
        <div className="flex justify-center items-center h-[60vh]">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-school-green-200 border-t-school-green-600"></div>
        </div>
      ) : (
        renderContent()
      )}
    </div>
  );
};