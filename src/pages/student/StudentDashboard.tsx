import React, { useState, useEffect } from 'react';
import { db } from '../../../lib/neon';
import toast from 'react-hot-toast';
import { PortalCard } from '../../components/PortalCard';
import { StudentProfile } from './StudentProfile';
import { StudentBehavior } from './StudentBehavior';
import { StudentDownloads } from './StudentDownloads';
import { StudentMessages } from './StudentMessages';
import { StudentVoting } from './StudentVoting';
import { StudentELearning } from './StudentELearning';
import { StudentExams } from './StudentExams';
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
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear().toString());
  const [semester, setSemester] = useState(1);
  const [term, setTerm] = useState(1);
  const [submissions, setSubmissions] = useState<Record<number, any>>({});
  const [showSubmitModal, setShowSubmitModal] = useState<Assignment | null>(null);
  const [submissionData, setSubmissionData] = useState({ text: '', file: null as File | null });

  useEffect(() => {
    setTerm(semester);
  }, [semester]);

  useEffect(() => {
    fetchData();
  }, [academicYear, term]);

  const fetchData = async () => {
    try {
      setLoading(true);
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
    <div className="space-y-8">
      {student && student.registration_status !== 'complete' && !isVotingMode && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-[1px] rounded-2xl shadow-lg animate-pulse">
          <div className="bg-white/95 backdrop-blur-sm p-4 rounded-[15px] flex items-center">
            <div className="flex-shrink-0 bg-amber-100 p-2 rounded-full mr-4">
              <span className="text-xl">⚠️</span>
            </div>
            <div>
              <p className="text-sm font-bold text-amber-700 uppercase tracking-wider">Registration Incomplete</p>
              <p className="text-sm text-gray-600 mt-1">
                Your official school registration is currently pending. Please visit the <strong>ICT Department</strong> with your documents to complete your full profile.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Premium Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-school-green-800 via-school-green-700 to-teal-900 rounded-[2rem] p-8 md:p-10 shadow-2xl text-white">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-10 w-40 h-40 bg-teal-400 opacity-20 rounded-full blur-2xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center md:space-x-8">
          <div className="bg-white/10 p-5 rounded-3xl backdrop-blur-md border border-white/20 shadow-inner mb-6 md:mb-0">
            <span className="text-5xl block">🎓</span>
          </div>
          <div className="text-center md:text-left flex-1">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-2">Welcome back, {student.fullName}!</h2>
            <p className="text-school-green-100 text-lg opacity-90 mb-6">Here's your academic dashboard for this semester.</p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10">
                <span className="text-xs text-school-green-100 uppercase tracking-wider block mb-1">Student ID</span>
                <div className="font-bold text-lg">{student.student_id || student.id}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10">
                <span className="text-xs text-school-green-100 uppercase tracking-wider block mb-1">Academic Year</span>
                <div className="font-bold text-lg">{academicYear} - Term {term}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'Enrolled Subjects', value: subjects?.length || 0, icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', color: 'from-blue-500 to-indigo-500', bg: 'bg-blue-50' },
          { title: 'Graded Results', value: results?.filter(r => r?.grade)?.length || 0, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50' },
          { title: 'Active Assignments', value: assignments?.length || 0, icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', color: 'from-purple-500 to-pink-500', bg: 'bg-purple-50' },
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
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'profile': return <StudentProfile student={student as any} onLogout={onLogout} />;
      case 'grades': return (
        <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-6">My Grades</h3>
          <div className="overflow-x-auto rounded-2xl border border-gray-100">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Grade</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {results.map((result) => (
                  <tr key={result.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-800">{result.subject_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-sm leading-5 font-bold rounded-full bg-emerald-100 text-emerald-800">
                        {result.grade || 'N/A'}
                      </span>
                    </td>
                  </tr>
                ))}
                {results.length === 0 && (
                  <tr>
                    <td colSpan={2} className="px-6 py-8 text-center text-gray-500 font-medium">No grades available yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      );
      case 'assignments': return (
        <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Assignments</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {assignments.map((ass) => (
              <div key={ass.id} className="p-6 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-gray-900 group-hover:text-school-green-600 transition-colors">{ass.title}</h4>
                  {submissions[ass.id] ? (
                    <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">Submitted</span>
                  ) : (
                    <span className="text-xs font-bold bg-amber-100 text-amber-700 px-3 py-1 rounded-full">Pending</span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-6 line-clamp-2">{ass.description}</p>
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                   <div className="flex items-center text-xs text-gray-500 font-medium">
                     <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                     Due: {new Date(ass.due_date).toLocaleDateString()}
                   </div>
                   {!submissions[ass.id] && (
                     <button onClick={() => setShowSubmitModal(ass)} className="text-xs font-bold bg-school-green-600 hover:bg-school-green-700 text-white px-4 py-2 rounded-xl transition-colors shadow-md shadow-school-green-200">
                       Submit Now
                     </button>
                   )}
                </div>
              </div>
            ))}
            {assignments.length === 0 && (
              <div className="col-span-full py-10 text-center bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-gray-500 font-medium">No active assignments.</p>
              </div>
            )}
          </div>
        </div>
      );
      case 'behavior': return <StudentBehavior studentId={parseInt(student.id)} />;
      case 'downloads': return <StudentDownloads />;
      case 'messages': return <StudentMessages />;
      case 'voting': return <StudentVoting studentId={parseInt(student.id)} onComplete={() => setActiveTab('overview')} />;
      case 'exams': return <StudentExams studentId={parseInt(student.id)} classId={student.current_class_id} />;
      case 'elearning': return <StudentELearning studentId={parseInt(student.id)} classId={student.current_class_id} />;
      default: return renderOverview();
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {loading && activeTab === 'overview' ? (
        <div className="flex justify-center items-center h-[60vh]">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-school-green-200 border-t-school-green-600"></div>
        </div>
      ) : renderContent()}

      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fadeIn">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl transform transition-all">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-gray-900">Submit Assignment</h3>
              <button onClick={() => setShowSubmitModal(null)} className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <p className="text-sm font-semibold text-school-green-700 mb-4">{showSubmitModal.title}</p>
            <textarea 
               className="w-full p-4 border-2 border-gray-100 bg-gray-50 rounded-2xl mb-6 focus:ring-4 focus:ring-school-green-100 focus:border-school-green-500 transition-all resize-none font-medium" 
               rows={5} 
               placeholder="Type your response here..." 
               value={submissionData.text}
               onChange={e => setSubmissionData({...submissionData, text: e.target.value})}
            />
            <div className="flex gap-4">
              <button onClick={() => setShowSubmitModal(null)} className="flex-1 py-3 text-gray-600 font-bold bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">Cancel</button>
              <button 
                onClick={async () => {
                  await db.submitAssignment(showSubmitModal.id, parseInt(student.id), undefined);
                  toast.success('Successfully Submitted! 🎉');
                  setShowSubmitModal(null);
                  fetchData();
                }}
                className="flex-1 py-3 font-bold bg-school-green-600 hover:bg-school-green-700 text-white rounded-xl shadow-lg shadow-school-green-200 transition-all transform hover:-translate-y-1"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};