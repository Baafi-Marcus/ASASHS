import React, { useState, useEffect } from 'react';
import { StudentProfile } from './StudentProfile';
import { StudentBehavior } from './StudentBehavior';
import { StudentDownloads } from './StudentDownloads';
import { StudentMessages } from './StudentMessages';
import { StudentELearning } from './StudentELearning';
import { StudentExams } from './StudentExams';
import db from '../../../lib/neon';

const TestStudentView: React.FC<{ activeTab: string; setActiveTab: (t: string) => void; fullName: string }> = ({ activeTab, setActiveTab, fullName }) => {
  const [demoQuizzes, setDemoQuizzes] = useState<any[]>([]);

  useEffect(() => {
    db.getQuizzes({}).then((quizzes: any[]) => {
      setDemoQuizzes((quizzes || []).filter((q: any) => q.title?.includes('[DEMO]')));
    }).catch(() => {});
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-school-green-800 via-school-green-700 to-teal-900 rounded-2xl p-8 text-white shadow-2xl">
              <h2 className="text-3xl font-black mb-2">Welcome, {fullName}!</h2>
              <p className="text-school-green-100 text-lg">You are viewing the Student Portal as a test account.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="text-3xl mb-2">📚</div>
                <h3 className="font-bold text-gray-800">Demo Quizzes</h3>
                <p className="text-2xl font-black text-school-green-600 mt-2">{demoQuizzes.length}</p>
                <p className="text-sm text-gray-500">available to take</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="text-3xl mb-2">📊</div>
                <h3 className="font-bold text-gray-800">Demo Grades</h3>
                <p className="text-sm text-gray-500 mt-2">Switch to E-Learning tab to take a quiz</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="text-3xl mb-2">📝</div>
                <h3 className="font-bold text-gray-800">Demo Assignments</h3>
                <p className="text-sm text-gray-500 mt-2">Browse other tabs to explore features</p>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
              <strong>Test Mode:</strong> You are viewing a simulated student experience. Some data shown is demo data.
            </div>
          </div>
        );
      case 'profile':
        return <StudentProfile student={{ id: '0', studentId: 'TEST-STU-001', fullName, course: 'Demo Programme', className: 'Demo Class', current_class_id: 0, registration_status: 'complete' } as any} />;
      case 'grades':
        return (
          <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-8 text-center">
            <div className="text-5xl mb-4">📈</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Demo Grades</h3>
            <p className="text-gray-500">Take a demo quiz from the E-Learning tab to see your results here.</p>
          </div>
        );
      case 'assignments':
        return (
          <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-8 text-center">
            <div className="text-5xl mb-4">📝</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Demo Assignments</h3>
            <p className="text-gray-500">Assignments will appear here when teachers create them.</p>
          </div>
        );
      case 'behavior':
        return <StudentBehavior studentId={0} />;
      case 'downloads':
        return <StudentDownloads studentId="0" />;
      case 'messages':
        return <StudentMessages studentId="0" studentName={fullName} currentClassId={0} />;
      case 'exams':
        return <StudentExams studentId={0} studentName={fullName} />;
      case 'elearning':
        return <StudentELearning studentId={0} studentName={fullName} />;
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto">{renderContent()}</div>
    </div>
  );
};

export default TestStudentView;
