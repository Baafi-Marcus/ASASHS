import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { db } from '../../../lib/neon';
import { PortalCard } from '../../components/PortalCard';
import { UserAvatar } from '../../components/UserAvatar';
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
      const studentIds = new Set();
      for (let i = 0; i < classIds.length; i++) {
        const classId = classIds[i];
        const classStudentsResult = await db.getClassStudents(classId);
        const classStudents = Array.isArray(classStudentsResult) ? classStudentsResult : [];
        classStudents.forEach((student: any) => {
          if (student?.id) studentIds.add(student.id);
        });
      }
      
      // Fetch assignments to count pending grades and upcoming exams
      const assignmentsRaw = await db.getAssignmentsByTeacher(teacher.teacherDbId);
      const assignmentsData = Array.isArray(assignmentsRaw) ? assignmentsRaw : [];
      
      let pendingGrades = 0;
      for (const assignment of assignmentsData) {
        const submissionsResult = await db.getAssignmentSubmissions(assignment.id);
        const submissions = Array.isArray(submissionsResult) ? submissionsResult : [];
        pendingGrades += (submissions?.length || 0);
      }
      
      const examAssignments = assignmentsData.filter((assignment: any) => 
        assignment.assignment_type === 'Exam' || assignment.assignment_type === 'Midsem Exam'
      );
      
      setStats({
        studentsCount: studentIds.size,
        pendingGrades: pendingGrades,
        upcomingExams: examAssignments.length
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
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
    <div className="space-y-6">
      {/* Teacher Profile Header Card */}
      <PortalCard className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <UserAvatar name={teacher.fullName} size="lg" />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-sm text-[10px] font-bold bg-school-green-50 text-school-green-800 border border-school-green-200 uppercase tracking-wider">
                  Staff Faculty
                </span>
                <span className="text-xs text-gray-500 font-mono tabular-nums">
                  ID: {teacher.teacherId}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                {teacher.fullName}
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                {teacher.department ? `${teacher.department} Department` : 'Academic Staff'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-100">
            <div className="bg-gray-50 rounded-sm border border-gray-200 px-4 py-2 text-center min-w-[110px]">
              <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block">Assigned Classes</span>
              <span className="text-lg font-bold text-gray-900 tabular-nums">{assignedClasses.length}</span>
            </div>
            <div className="bg-gray-50 rounded-sm border border-gray-200 px-4 py-2 text-center min-w-[110px]">
              <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block">Subjects</span>
              <span className="text-lg font-bold text-gray-900 tabular-nums">{teacher.subjects?.length || 1}</span>
            </div>
          </div>
        </div>

        {assignedClasses.length > 0 && (
          <div className="mt-5 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 mr-1">Active Classes:</span>
            {assignedClasses.map((cls, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-sm text-xs font-medium bg-white text-gray-700 border border-gray-200 tabular-nums"
              >
                {cls}
              </span>
            ))}
          </div>
        )}
      </PortalCard>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            title: 'Total Students',
            value: stats.studentsCount,
            subtitle: 'Enrolled across all assigned classes',
            icon: (
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )
          },
          {
            title: 'Submissions Received',
            value: stats.pendingGrades,
            subtitle: 'Student assignment submissions',
            icon: (
              <svg className="w-5 h-5 text-school-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )
          },
          {
            title: 'Scheduled Exams',
            value: stats.upcomingExams,
            subtitle: 'Exams and midsem assessments',
            icon: (
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      {/* Quick Actions Navigation */}
      <PortalCard className="p-6">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Teaching Workspace</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              id: 'classes',
              title: 'My Classes',
              desc: 'Roster & student lists',
              icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
            },
            {
              id: 'assignments',
              title: 'Assignments',
              desc: 'Create and distribute',
              icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
            },
            {
              id: 'grades',
              title: 'Gradebook',
              desc: 'Scores and transcripts',
              icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
            },
            {
              id: 'messages',
              title: 'Messages',
              desc: 'Notices and queries',
              icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z',
            }
          ].map((action, idx) => (
            <button 
              key={idx}
              onClick={() => setActiveTab(action.id)}
              className="flex flex-col items-start p-4 rounded-sm border border-gray-200 hover:border-school-green-600 hover:bg-school-green-50/20 transition-all text-left group min-h-[44px]"
            >
              <div className="w-8 h-8 rounded-sm bg-gray-100 text-gray-700 flex items-center justify-center mb-3 group-hover:bg-school-green-100 group-hover:text-school-green-800 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={action.icon} />
                </svg>
              </div>
              <span className="text-sm font-bold text-gray-900 leading-tight">{action.title}</span>
              <span className="text-xs text-gray-500 mt-0.5">{action.desc}</span>
            </button>
          ))}
        </div>
      </PortalCard>
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
        <div className="flex justify-center items-center h-[50vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-school-green-200 border-t-school-green-600"></div>
        </div>
      ) : (
        renderContent()
      )}
    </div>
  );
};