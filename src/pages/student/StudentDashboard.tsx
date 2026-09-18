import React, { useState, useEffect } from 'react';
import { db } from '../../../lib/neon';
import toast from 'react-hot-toast';
import { parseDate, getScheduleStatus, getStatusLabel, getStatusColor } from '../../lib/dates';
import { PortalCard } from '../../components/PortalCard';
import { PortalButton } from '../../components/PortalButton';
import { UserAvatar } from '../../components/UserAvatar';
import { StudentProfile } from './StudentProfile';
import { StudentDownloads } from './StudentDownloads';
import { StudentMessages } from './StudentMessages';
import { StudentVoting } from './StudentVoting';
import { StudentELearning } from './StudentELearning';
import { StudentExams } from './StudentExams';
import { Skeleton, SkeletonGrid } from '../../components/SkeletonLoader';
import { VideoShowcase } from '../../components/VideoShowcase';

export interface Student {
  id: string;
  student_id: string;
  fullName: string;
  current_class_id?: number;
  registration_status?: string;
  [key: string]: any;
}

interface Subject {
  id: number;
  name: string;
  code: string;
  class_id: number;
  teacher_id: number;
  teacher_name: string;
}

interface Result {
  id: number;
  student_id: number;
  subject_id: number;
  class_id: number;
  score: number;
  grade: string;
  remark: string;
  academic_year: string;
  form: number;
  subject_name: string;
  subject_code: string;
}

interface Assignment {
  id: number;
  title: string;
  description: string;
  due_date: string;
  class_id: number;
  subject_id: number;
  assignment_type: string;
  file_path: string | null;
  created_at: string;
  subject_name: string;
  submission_type: string;
  max_score: number;
}

export const StudentDashboard: React.FC<{ 
  student: Student; 
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isVotingMode?: boolean;
}> = ({ student, onLogout, activeTab, setActiveTab, isVotingMode }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [activeElections, setActiveElections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [academicYear, setAcademicYear] = useState('');
  const [term, setTerm] = useState(1);
  const [className, setClassName] = useState(student.className || '');
  const [submissions, setSubmissions] = useState<Record<number, any>>({});
  const [showSubmitModal, setShowSubmitModal] = useState<Assignment | null>(null);
  const [submissionData, setSubmissionData] = useState({ text: '', file: null as File | null });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [academicYear, term]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ay, sem, studentDetails] = await Promise.all([
        db.getCurrentAcademicYear(),
        db.getCurrentSemester(),
        db.getStudentById(parseInt(student.id)).catch(() => null)
      ]);
      if (ay) setAcademicYear(ay);
      if (sem) setTerm(sem);
      if (studentDetails?.class_name) setClassName(studentDetails.class_name);
      const studentDbId = parseInt(student.id);
      const studentSubjectsResult = await db.getStudentSubjects(studentDbId);
      const studentSubjects = Array.isArray(studentSubjectsResult) ? studentSubjectsResult : [];
      setSubjects(studentSubjects);
      
      const studentResultsResult = await db.getStudentResults(studentDbId, academicYear, term);
      const studentResults = Array.isArray(studentResultsResult) ? studentResultsResult : [];
      setResults(studentResults);
      
      const classAssignmentsResult = await db.getAssignmentsByClass(student.current_class_id || 1);
      const classAssignments = Array.isArray(classAssignmentsResult) ? classAssignmentsResult : [];
      setAssignments(classAssignments);
      
      const subs: Record<number, any> = {};
      if (classAssignments.length > 0) {
        for (const ass of classAssignments) {
          if (ass?.id) {
            const sub = await db.getStudentSubmissionForAssignment(ass.id, studentDbId);
            if (sub) subs[ass.id] = sub;
          }
        }
      }
      setSubmissions(subs);
      
      const allElectionsResult = await db.getElections();
      const allElections = Array.isArray(allElectionsResult) ? allElectionsResult : [];
      setActiveElections(allElections.filter((e: any) => e && e.status === 'open'));
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {student && student.registration_status !== 'complete' && !isVotingMode && (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex items-start space-x-3 text-amber-900">
          <span className="text-base flex-shrink-0 mt-0.5">⚠️</span>
          <div className="text-xs">
            <p className="font-semibold uppercase tracking-wider text-amber-800">Registration Incomplete</p>
            <p className="mt-1 text-amber-700">
              Official school registration is currently pending. Visit the ICT Department with documents to finalize your records.
            </p>
          </div>
        </div>
      )}

      {/* Clean Structured Academic Banner */}
      <div className="bg-school-green-800 border border-school-green-900/60 rounded-md p-6 text-white">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <UserAvatar name={student.fullName} size="xl" className="ring-2 ring-white/30" />
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">{student.fullName}</h2>
              <p className="text-xs text-school-green-200 mt-0.5">
                Class: <span className="font-semibold text-white">{className || 'Not Assigned'}</span>
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="bg-black/20 border border-white/10 px-4 py-2.5 rounded-sm">
              <span className="text-[11px] uppercase tracking-wider text-school-green-200 block">Student ID</span>
              <span className="text-sm font-semibold tabular-nums text-white">{student.studentId || student.id}</span>
            </div>
            <div className="bg-black/20 border border-white/10 px-4 py-2.5 rounded-sm">
              <span className="text-[11px] uppercase tracking-wider text-school-green-200 block">Academic Term</span>
              <span className="text-sm font-semibold tabular-nums text-white">{academicYear || '2025/2026'} • Sem {term}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid - Hero Numbers with Clean 1px Borders */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { 
            title: 'Enrolled Subjects', 
            value: subjects?.length || 0, 
            icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', 
            clickable: true 
          },
          { 
            title: 'Graded Results', 
            value: results?.filter(r => r?.grade)?.length || 0, 
            icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' 
          },
          { 
            title: 'Active Assignments', 
            value: assignments?.length || 0, 
            icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' 
          },
        ].map((stat, idx) => (
          <div 
            key={idx} 
            onClick={() => { if (stat.clickable) setShowSubjectModal(true); }}
            className={`bg-white rounded-md p-4 border border-gray-200 transition-all duration-fast ease-standard ${
              stat.clickable ? 'cursor-pointer hover:border-school-green-600 hover:-translate-y-0.5' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.title}</p>
                <h3 className="text-2xl font-bold text-gray-900 tabular-nums mt-1">{stat.value}</h3>
              </div>
              <div className="w-10 h-10 rounded-sm bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                </svg>
              </div>
            </div>
            {stat.clickable && (
              <p className="text-[11px] font-medium text-school-green-700 mt-3 flex items-center gap-1">
                <span>View enrolled subjects</span>
                <span aria-hidden="true">&rarr;</span>
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Campus Tour & Showcase Video Player */}
      <VideoShowcase 
        variant="portal" 
        title="ASASHS Campus & Portal Showcase"
        subtitle="Explore life at Akim Asafo SHS and the features of your scholar portal."
      />
    </div>
  );

  // Subject List Modal
  const renderSubjectModal = () => {
    if (!showSubjectModal) return null;
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4" onClick={() => setShowSubjectModal(false)}>
        <div className="bg-white rounded-md border border-gray-200 p-6 w-full max-w-lg shadow-xl" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-900">
              Enrolled Subjects (<span className="tabular-nums">{subjects.length}</span>)
            </h3>
            <button 
              onClick={() => setShowSubjectModal(false)}
              aria-label="Close modal"
              className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-sm hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="space-y-1.5 max-h-80 overflow-y-auto">
            {subjects.length > 0 ? subjects.map((s: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-sm border border-gray-200/60 hover:bg-gray-100 transition-colors text-xs">
                <span className="font-medium text-gray-900">{s.subject_name || s.name}</span>
                <span className="text-gray-500 font-mono tabular-nums">{s.subject_code || s.code}</span>
              </div>
            )) : (
              <p className="text-center text-gray-500 text-xs py-6">No subjects found.</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'profile': return <StudentProfile student={{ ...student, className } as any} onLogout={onLogout} />;
      case 'grades': return (
        <PortalCard title="Academic Results">
          <div className="overflow-x-auto rounded-sm border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">Subject</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">Code</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600 uppercase tracking-wider">Score</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600 uppercase tracking-wider">Grade</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.map((result) => (
                  <tr key={result.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{result.subject_name || '-'}</td>
                    <td className="px-4 py-3 text-gray-500 font-mono tabular-nums">{result.subject_code || '-'}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900 tabular-nums">
                      {result.score !== undefined && result.score !== null ? result.score : '-'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-bold tabular-nums text-school-green-700">
                        {result.grade || '-'}
                      </span>
                    </td>
                  </tr>
                ))}
                {results.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                      No grades recorded for this semester yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </PortalCard>
      );
      case 'assignments': return (
        <PortalCard title="Course Assignments">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignments.map((ass) => {
              const durationMin = Math.round((new Date(ass.due_date).getTime() - new Date(ass.created_at).getTime()) / 60000);
              const isSubmitted = !!submissions[ass.id];
              return (
                <div key={ass.id} className="p-4 rounded-md border border-gray-200 bg-white hover:-translate-y-0.5 transition-all duration-fast ease-standard flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <h4 className="font-semibold text-sm text-gray-900 leading-snug">{ass.title}</h4>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-sm border ${
                        isSubmitted 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        {isSubmitted ? 'Submitted' : 'Pending'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2 mb-4">{ass.description}</p>
                  </div>
                  
                  <div className="flex justify-between items-center pt-3 border-t border-gray-100 text-xs">
                    <span className="text-gray-500 tabular-nums">
                      Due: {new Date(ass.due_date).toLocaleDateString()}
                    </span>
                    {!isSubmitted && (
                      <PortalButton 
                        size="sm" 
                        variant="primary" 
                        onClick={() => setShowSubmitModal(ass)}
                      >
                        Submit Response
                      </PortalButton>
                    )}
                  </div>
                </div>
              );
            })}
            {assignments.length === 0 && (
              <div className="col-span-full py-8 text-center bg-gray-50 rounded-md border border-gray-200 text-xs text-gray-500">
                No active assignments for your class.
              </div>
            )}
          </div>
        </PortalCard>
      );
      case 'downloads': return <StudentDownloads />;
      case 'messages': return <StudentMessages />;
      case 'voting': return <StudentVoting studentId={parseInt(student.id)} onComplete={() => setActiveTab('overview')} />;
      case 'exams': return <StudentExams studentId={parseInt(student.id)} classId={student.current_class_id || 0} />;
      case 'elearning': return <StudentELearning studentId={parseInt(student.id)} classId={student.current_class_id || 0} />;
      default: return renderOverview();
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {loading && activeTab === 'overview' ? (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white p-6 rounded-md border border-gray-200 space-y-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="w-16 h-16 rounded-full flex-shrink-0" />
              <div className="space-y-2 flex-grow">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-3.5 w-1/2" />
              </div>
            </div>
          </div>
          <SkeletonGrid count={3} columns={3} />
        </div>
      ) : renderContent()}

      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-md p-6 w-full max-w-md border border-gray-200 shadow-2xl">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900">Submit Assignment</h3>
              <button 
                onClick={() => setShowSubmitModal(null)}
                aria-label="Close modal"
                className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-sm hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <p className="text-xs font-semibold text-school-green-800 mb-3">{showSubmitModal.title}</p>
            <textarea 
              className="w-full p-3 border border-gray-300 rounded-sm mb-4 focus:ring-1 focus:ring-school-green-700 focus:border-school-green-700 text-xs transition-colors resize-none" 
              rows={5} 
              placeholder="Type your response here..." 
              value={submissionData.text}
              onChange={e => setSubmissionData({...submissionData, text: e.target.value})}
            />
            <div className="flex gap-3 justify-end">
              <PortalButton 
                variant="outline" 
                size="sm"
                onClick={() => setShowSubmitModal(null)}
                disabled={isSubmitting}
              >
                Cancel
              </PortalButton>
              <PortalButton 
                variant="primary" 
                size="sm"
                loading={isSubmitting}
                loadingText="Submitting..."
                onClick={async () => {
                  try {
                    setIsSubmitting(true);
                    await db.submitAssignment(showSubmitModal.id, parseInt(student.id), undefined);
                    toast.success('Assignment submitted successfully');
                    setShowSubmitModal(null);
                    fetchData();
                  } catch (err: any) {
                    toast.error('Failed to submit assignment');
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
              >
                Submit Response
              </PortalButton>
            </div>
          </div>
        </div>
      )}
      {renderSubjectModal()}
    </div>
  );
};