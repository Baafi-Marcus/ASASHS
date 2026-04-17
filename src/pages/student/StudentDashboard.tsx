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
import { Student } from '../../contexts/StudentAuthContext';

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
    <div className="space-y-6">
      {student && student.registration_status !== 'complete' && !isVotingMode && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-xl shadow-sm flex items-start space-x-3">
          <div className="flex-shrink-0">
             <span className="text-xl">⚠️</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-amber-800">Registration Incomplete</h3>
            <div className="mt-1 text-sm text-amber-700">
              <p>Your official school registration is currently pending. Please visit the <strong>ICT Department</strong> with your documents to complete your full profile.</p>
            </div>
          </div>
        </div>
      )}

      <PortalCard>
        <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-6">
          <div className="bg-school-green-100 p-4 rounded-xl text-4xl">🎓</div>
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold text-gray-900">Welcome back, {student.fullName}!</h2>
            <p className="text-gray-600 mt-1">Here's your academic dashboard for this semester.</p>
          </div>
        </div>
      </PortalCard>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PortalCard className="hover:shadow-lg transition-all transform hover:-translate-y-1">
          <h3 className="text-2xl font-bold text-blue-600">{subjects?.length || 0}</h3>
          <p className="text-gray-600">Enrolled Subjects</p>
        </PortalCard>
        <PortalCard className="hover:shadow-lg transition-all transform hover:-translate-y-1">
          <h3 className="text-2xl font-bold text-green-600">{results?.filter(r => r?.grade)?.length || 0}</h3>
          <p className="text-gray-600">Graded Results</p>
        </PortalCard>
        <PortalCard className="hover:shadow-lg transition-all transform hover:-translate-y-1">
          <h3 className="text-2xl font-bold text-purple-600">{assignments?.length || 0}</h3>
          <p className="text-gray-600">Active Assignments</p>
        </PortalCard>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'profile': return <StudentProfile student={student} onLogout={onLogout} />;
      case 'grades': return (
        <PortalCard title="My Grades">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Grade</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.map((result) => (
                  <tr key={result.id}>
                    <td className="px-6 py-4 font-medium">{result.subject_name}</td>
                    <td className="px-6 py-4 font-bold text-school-green-600">{result.grade || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PortalCard>
      );
      case 'assignments': return (
        <PortalCard title="Assignments">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignments.map((ass) => (
              <div key={ass.id} className="p-4 border rounded-xl">
                <h4 className="font-bold">{ass.title}</h4>
                <p className="text-sm text-gray-500 mb-2">{ass.description}</p>
                <div className="flex justify-between items-center">
                   <span className="text-xs text-gray-400">Due: {new Date(ass.due_date).toLocaleDateString()}</span>
                   {submissions[ass.id] ? <span className="text-xs text-green-600 font-bold">Submitted</span> : 
                   <button onClick={() => setShowSubmitModal(ass)} className="text-xs bg-school-green-600 text-white px-3 py-1 rounded-lg">Submit</button>}
                </div>
              </div>
            ))}
          </div>
        </PortalCard>
      );
      case 'behavior': return <StudentBehavior studentId={parseInt(student.id)} />;
      case 'downloads': return <StudentDownloads />;
      case 'messages': return <StudentMessages />;
      case 'voting': return <StudentVoting studentId={parseInt(student.id)} onComplete={() => setActiveTab('overview')} />;
      case 'elearning': return <StudentELearning studentId={parseInt(student.id)} classId={student.current_class_id} />;
      default: return renderOverview();
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 capitalize">
          {activeTab ? activeTab.replace('_', ' ') : 'Dashboard'}
        </h1>
        <p className="text-gray-600">Access your school information and resources below.</p>
      </div>
      {loading && activeTab === 'overview' ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-school-green-600"></div></div>
      ) : renderContent()}

      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Submit {showSubmitModal.title}</h3>
            <textarea 
               className="w-full p-3 border rounded-xl mb-4" 
               rows={4} 
               placeholder="Enter your response..." 
               value={submissionData.text}
               onChange={e => setSubmissionData({...submissionData, text: e.target.value})}
            />
            <div className="flex gap-3">
              <button onClick={() => setShowSubmitModal(null)} className="flex-1 py-2 text-gray-500">Cancel</button>
              <button 
                onClick={async () => {
                  await db.submitAssignment(showSubmitModal.id, parseInt(student.id), undefined);
                  toast.success('Submitted');
                  setShowSubmitModal(null);
                  fetchData();
                }}
                className="flex-1 py-2 bg-school-green-600 text-white rounded-xl"
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