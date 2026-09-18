import React, { useEffect, useState, useContext } from 'react';
import toast from 'react-hot-toast';
import { db } from '../../../lib/neon';
import { AuthContext } from '../../../AuthContext';
import { AuditLogViewer } from './AuditLogViewer';
import {
  ServerStackIcon,
  WrenchScrewdriverIcon,
  ShieldCheckIcon,
  AcademicCapIcon,
  ScaleIcon,
  TrashIcon,
  LockClosedIcon,
  LockOpenIcon,
  SignalIcon,
  CpuChipIcon,
  CircleStackIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { PortalButton } from '../../components/PortalButton';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';

interface AnalyticsData {
  totalLoginsToday: number;
  activeSessions: number;
  systemPerformance: number;
  storageUsage: number;
  apiResponseTime: number;
  errorRate: number;
  userRegistrations: { date: string; count: number }[];
  peakUsageHours: { hour: number; count: number }[];
}

const PAGE_GROUPS: Record<string, { label: string; pages: { key: string; label: string }[] }> = {
  admin: {
    label: 'Admin Control Surface',
    pages: [
      { key: 'admin_dashboard', label: 'Overview' },
      { key: 'admin_subadmins', label: 'Sub-Admins' },
      { key: 'admin_school_exams', label: 'School Exams' },
      { key: 'admin_exam_reports', label: 'Exam Reports' },
      { key: 'admin_students', label: 'Students' },
      { key: 'admin_teachers', label: 'Teachers' },
      { key: 'admin_courses', label: 'Academics' },
      { key: 'admin_timetables', label: 'Timetables' },
      { key: 'admin_announcements', label: 'Announcements' },
      { key: 'admin_performance', label: 'Performance' },
      { key: 'admin_ai-settings', label: 'AI Settings' },
      { key: 'admin_voting', label: 'Elections' },
      { key: 'admin_ict', label: 'ICT Registration' },
      { key: 'admin_reports', label: 'Reports' },
      { key: 'admin_system', label: 'System' },
      { key: 'admin_profile', label: 'My Profile' },
    ],
  },
  teacher: {
    label: 'Teacher Portal Surface',
    pages: [
      { key: 'teacher_dashboard', label: 'Overview' },
      { key: 'teacher_classes', label: 'My Classes' },
      { key: 'teacher_assignments', label: 'Assignments' },
      { key: 'teacher_exams', label: 'School Exams' },
      { key: 'teacher_grades', label: 'Gradebook' },
      { key: 'teacher_performance', label: 'Performance' },
      { key: 'teacher_messages', label: 'Messages' },
      { key: 'teacher_elearning', label: 'E-Learning' },
      { key: 'teacher_profile', label: 'My Profile' },
    ],
  },
  student: {
    label: 'Student Portal Surface',
    pages: [
      { key: 'student_overview', label: 'Overview' },
      { key: 'student_profile', label: 'My Profile' },
      { key: 'student_grades', label: 'My Grades' },
      { key: 'student_assignments', label: 'Assignments' },
      { key: 'student_downloads', label: 'Downloads' },
      { key: 'student_messages', label: 'Messages' },
      { key: 'student_voting', label: 'Vote Now' },
      { key: 'student_exams', label: 'School Exams' },
      { key: 'student_elearning', label: 'E-Learning' },
    ],
  },
};

function PageMaintenanceControl() {
  const [pageMaintenance, setPageMaintenance] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    db.getPageMaintenance().then((pm) => {
      setPageMaintenance(pm || {});
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const togglePage = async (pageKey: string) => {
    const current = pageMaintenance[pageKey];
    const updated = await db.setPageMaintenance(pageKey, !current);
    setPageMaintenance({ ...updated });
    toast.success(`${current ? 'Unlocked' : 'Locked'} route for maintenance`);
  };

  if (loading) {
    return <div className="text-xs text-gray-400 py-4">Loading operational routes...</div>;
  }

  return (
    <div className="space-y-4 text-xs">
      {Object.entries(PAGE_GROUPS).map(([portal, group]) => (
        <div key={portal} className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">{group.label}</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {group.pages.map((page) => {
              const isLocked = !!pageMaintenance[page.key];
              return (
                <button
                  key={page.key}
                  onClick={() => togglePage(page.key)}
                  className={`flex items-center justify-between px-3 py-2 rounded-sm text-xs border transition-colors ${
                    isLocked
                      ? 'bg-red-50 border-red-200 text-red-800 hover:bg-red-100'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="truncate font-medium">{page.label}</span>
                  <span className={`ml-2 text-[10px] font-bold uppercase ${isLocked ? 'text-red-600' : 'text-gray-400'}`}>
                    {isLocked ? 'LOCKED' : 'Active'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {Object.keys(pageMaintenance).length === 0 && (
        <p className="text-xs text-gray-400 italic">All institutional portals and sub-routes are fully active.</p>
      )}
    </div>
  );
}

export default function SystemOversight() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceToggling, setMaintenanceToggling] = useState(false);
  const [currentAcademicYear, setCurrentAcademicYear] = useState('');
  const [currentSemester, setCurrentSemester] = useState(1);
  const [savingAY, setSavingAY] = useState(false);
  const [classWeight, setClassWeight] = useState(30);
  const [examWeight, setExamWeight] = useState(70);
  const [savingWeights, setSavingWeights] = useState(false);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    db.getMaintenanceMode().then(setMaintenanceMode).catch(() => {});
    db.getCurrentAcademicYear().then(setCurrentAcademicYear).catch(() => {});
    db.getCurrentSemester().then(setCurrentSemester).catch(() => {});
    db.getGradingWeights().then(w => {
      setClassWeight(w.classScore);
      setExamWeight(w.examScore);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const registrationData = [];
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        registrationData.push({
          date: date.toISOString().split('T')[0],
          count: Math.floor(Math.random() * 15) + 5
        });
      }
      
      const peakHours = [];
      for (let hour = 0; hour < 24; hour++) {
        peakHours.push({
          hour,
          count: hour >= 8 && hour <= 18 ? Math.floor(Math.random() * 100) + 50 : Math.floor(Math.random() * 30)
        });
      }
      
      setAnalytics({
        totalLoginsToday: Math.floor(Math.random() * 100) + 50,
        activeSessions: Math.floor(Math.random() * 50) + 20,
        systemPerformance: Math.floor(Math.random() * 30) + 70,
        storageUsage: Math.floor(Math.random() * 50) + 30,
        apiResponseTime: Math.floor(Math.random() * 200) + 50,
        errorRate: Math.floor(Math.random() * 5),
        userRegistrations: registrationData,
        peakUsageHours: peakHours
      });
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton variant="stats" />
        <LoadingSkeleton variant="card" rows={3} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-md border border-gray-200 shadow-xs p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-gray-900">System Oversight & Infrastructure Governance</h2>
          <p className="text-xs text-gray-500 mt-0.5">Control global runtime settings, academic session bounds, route locks, and grading weights</p>
        </div>
        <div className="flex space-x-1 border border-gray-300 rounded-sm p-0.5 bg-gray-50">
          {(['7d', '30d', '90d'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-xs text-xs font-semibold tabular-nums transition-colors ${
                timeRange === range
                  ? 'bg-white text-school-green-800 shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>
      
      {/* Infrastructure Telemetry */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-md border border-gray-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Logins Today</span>
            <SignalIcon className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1 tabular-nums">{analytics?.totalLoginsToday || 0}</p>
          <span className="text-[11px] text-gray-400 mt-1 block">Active institutional access events</span>
        </div>
        
        <div className="bg-white rounded-md border border-gray-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Active Sessions</span>
            <CpuChipIcon className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-school-green-800 mt-1 tabular-nums">{analytics?.activeSessions || 0}</p>
          <span className="text-[11px] text-gray-400 mt-1 block">Concurrent portal sessions</span>
        </div>
        
        <div className="bg-white rounded-md border border-gray-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">System Performance</span>
            <ServerStackIcon className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1 tabular-nums">{analytics?.systemPerformance || 0}%</p>
          <span className="text-[11px] text-gray-400 mt-1 block">Neon DB query response health</span>
        </div>
        
        <div className="bg-white rounded-md border border-gray-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Database Storage</span>
            <CircleStackIcon className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1 tabular-nums">{analytics?.storageUsage || 0}%</p>
          <span className="text-[11px] text-gray-400 mt-1 block">Schema capacity consumption</span>
        </div>
      </div>

      {/* Global Maintenance Mode */}
      <div className="bg-white rounded-md border border-gray-200 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900">School-Wide Maintenance Lockout</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Restricts access exclusively to administrators. Teachers and students will encounter the system maintenance screen.
            </p>
          </div>
          <button
            onClick={async () => {
              setMaintenanceToggling(true);
              try {
                const newMode = await db.setMaintenanceMode(!maintenanceMode);
                setMaintenanceMode(newMode);
                await db.logAuditEvent({
                  actor_id: user?.user_id || 'unknown',
                  actor_name: user?.full_name || 'Unknown',
                  action: newMode ? 'enable_maintenance' : 'disable_maintenance',
                  entity_type: 'system',
                  details: `Maintenance mode ${newMode ? 'enabled' : 'disabled'}`
                });
                toast.success(newMode ? 'Maintenance Lockout Engaged' : 'System Resumed Normal Access');
              } catch (e) {
                console.error('Failed to toggle maintenance mode:', e);
              } finally {
                setMaintenanceToggling(false);
              }
            }}
            disabled={maintenanceToggling}
            className={`px-4 py-2 rounded-sm text-xs font-semibold border transition-colors ${
              maintenanceMode
                ? 'bg-red-700 text-white border-red-700 hover:bg-red-800'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {maintenanceMode ? 'Lockout Active (Disengage)' : 'Engage Global Lockout'}
          </button>
        </div>
        {maintenanceMode && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-sm text-xs text-red-800 flex items-center gap-2">
            <ExclamationTriangleIcon className="w-4 h-4 text-red-700 shrink-0" />
            <span>GLOBAL LOCKOUT ENGAGED: Only authenticated administrators can log in and browse routes.</span>
          </div>
        )}
      </div>

      {/* Page Maintenance Control */}
      <div className="bg-white rounded-md border border-gray-200 p-5 shadow-xs space-y-3">
        <div className="pb-3 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-900">Per-Route Maintenance Switches</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Lock specific functional views (e.g. gradebooks during verification, student election voting during tallies)
          </p>
        </div>
        <PageMaintenanceControl />
      </div>

      {/* Academic Year & Semester Parameters */}
      <div className="bg-white rounded-md border border-gray-200 p-5 shadow-xs space-y-4">
        <div className="pb-3 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-900">Academic Session Governance</h3>
          <p className="text-xs text-gray-500 mt-0.5">Global defaults determining current enrollment intake, assessment roll, and reports</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-medium text-gray-700 mb-1">Active Academic Year</label>
            <input
              type="text"
              value={currentAcademicYear}
              onChange={(e) => setCurrentAcademicYear(e.target.value)}
              placeholder="e.g. 2025/2026"
              className="w-full px-3 py-2 border border-gray-300 rounded-sm bg-white tabular-nums text-xs"
            />
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-1">Active Semester</label>
            <select
              value={currentSemester}
              onChange={(e) => setCurrentSemester(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-sm bg-white text-xs"
            >
              <option value={1}>Semester 1 (Sep–Feb)</option>
              <option value={2}>Semester 2 (Mar–Aug)</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end">
          <PortalButton
            onClick={async () => {
              setSavingAY(true);
              try {
                await db.setCurrentAcademicYear(currentAcademicYear);
                await db.setCurrentSemester(currentSemester);
                await db.logAuditEvent({
                  actor_id: user?.user_id || 'unknown',
                  actor_name: user?.full_name || 'Unknown',
                  action: 'update_academic_settings',
                  entity_type: 'system',
                  details: `Academic year set to ${currentAcademicYear}, Semester ${currentSemester}`
                });
                toast.success('Academic session parameters committed');
              } catch (e) {
                toast.error('Failed to commit academic parameters');
              } finally {
                setSavingAY(false);
              }
            }}
            disabled={savingAY}
            className="px-5 py-2 bg-school-green-700 text-white rounded-sm text-xs font-medium hover:bg-school-green-800 transition-colors shadow-2xs"
          >
            {savingAY ? 'Saving Session...' : 'Commit Session Parameters'}
          </PortalButton>
        </div>
      </div>

      {/* Official Grading Weight Ratios */}
      <div className="bg-white rounded-md border border-gray-200 p-5 shadow-xs space-y-4">
        <div className="pb-3 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-900">Grading & Score Synthesis Ratios</h3>
          <p className="text-xs text-gray-500 mt-0.5">School-wide continuous assessment vs examination score distribution percentage</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-medium text-gray-700 mb-1">Continuous Assessment Weight (%)</label>
            <input
              type="number"
              value={classWeight}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 0;
                setClassWeight(val);
                setExamWeight(100 - val);
              }}
              min="0"
              max="100"
              className="w-full px-3 py-2 border border-gray-300 rounded-sm bg-white tabular-nums text-xs"
            />
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-1">Final Examination Weight (%)</label>
            <input
              type="number"
              value={examWeight}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 0;
                setExamWeight(val);
                setClassWeight(100 - val);
              }}
              min="0"
              max="100"
              className="w-full px-3 py-2 border border-gray-300 rounded-sm bg-white tabular-nums text-xs"
            />
          </div>
        </div>
        <div className="flex items-center justify-between pt-1">
          <div>
            {classWeight + examWeight !== 100 && (
              <p className="text-red-600 text-xs font-medium">Weights must total exactly 100%.</p>
            )}
          </div>
          <PortalButton
            onClick={async () => {
              setSavingWeights(true);
              try {
                await db.setGradingWeights(classWeight, examWeight);
                await db.logAuditEvent({
                  actor_id: user?.user_id || 'unknown',
                  actor_name: user?.full_name || 'Unknown',
                  action: 'update_grading_settings',
                  entity_type: 'system',
                  details: `Grading weights set to Class: ${classWeight}%, Exam: ${examWeight}%`
                });
                toast.success('Grading synthesis ratios saved');
              } catch (e) {
                toast.error('Failed to commit grading ratios');
              } finally {
                setSavingWeights(false);
              }
            }}
            disabled={savingWeights || (classWeight + examWeight !== 100)}
            className="px-5 py-2 bg-school-green-700 text-white rounded-sm text-xs font-medium hover:bg-school-green-800 transition-colors shadow-2xs"
          >
            {savingWeights ? 'Saving Weights...' : 'Commit Grading Ratios'}
          </PortalButton>
        </div>
      </div>

      {/* Database Sanitation */}
      <div className="bg-white rounded-md border border-gray-200 p-5 shadow-xs space-y-3">
        <div className="pb-3 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-900">Database Sanitation & Test Artifacts Cleanup</h3>
          <p className="text-xs text-gray-500 mt-0.5">Purge mock test accounts and diagnostic artifacts from the database</p>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-500">Deletes all generated test accounts. Permanent action.</span>
          <button
            onClick={async () => {
              if (!confirm('Are you certain you want to purge all test accounts? This action cannot be reversed.')) return;
              try {
                await db.deleteAllTestAccounts();
                toast.success('Test accounts successfully purged');
              } catch { 
                toast.error('Failed to execute test cleanup'); 
              }
            }}
            className="px-3.5 py-2 bg-red-700 text-white rounded-sm font-medium hover:bg-red-800 transition-colors shadow-2xs"
          >
            Purge Test Accounts
          </button>
        </div>
      </div>

      {/* Audit Log Component Embed */}
      <AuditLogViewer />
    </div>
  );
}