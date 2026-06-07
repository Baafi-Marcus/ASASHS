import React from 'react';
import { LegacyExamRunner } from './LegacyExamRunner';

export function ExamRunner({ studentId, exam, onClose }: { studentId: number, exam: any, onClose: () => void }) {
  if (exam.quiz_id) {
    const handleOpenQuizTab = () => {
      const quizUrl = `${window.location.origin}${window.location.pathname}?takeQuiz=1&quizId=${exam.quiz_id}`;
      window.open(quizUrl, '_blank');
    };

    return (
      <div className="bg-white rounded-3xl shadow-xl p-12 text-center space-y-6">
        <div className="w-20 h-20 bg-school-green-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-10 h-10 text-school-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">{exam.title}</h2>
        <p className="text-gray-500 max-w-md mx-auto">
          This exam will open in a new fullscreen tab. Complete all questions and submit — the tab will close automatically.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={handleOpenQuizTab}
            className="px-8 py-3 bg-school-green-600 text-white font-bold rounded-xl hover:bg-school-green-700 transition shadow-lg"
          >
            Open Exam in New Tab
          </button>
          <button
            onClick={onClose}
            className="px-8 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return <LegacyExamRunner studentId={studentId} exam={exam} onClose={onClose} />;
}
