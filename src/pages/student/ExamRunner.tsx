import React from 'react';
import { LegacyExamRunner } from './LegacyExamRunner';
import { PortalCard } from '../../components/PortalCard';
import { PortalButton } from '../../components/PortalButton';

export function ExamRunner({ studentId, exam, onClose }: { studentId: number, exam: any, onClose: () => void }) {
  if (exam.quiz_id) {
    const handleOpenQuizTab = () => {
      const quizUrl = `${window.location.origin}${window.location.pathname}?takeQuiz=1&quizId=${exam.quiz_id}`;
      window.open(quizUrl, '_blank');
    };

    return (
      <PortalCard className="p-8 sm:p-12 text-center max-w-xl mx-auto space-y-6">
        <div className="w-14 h-14 bg-school-green-50 border border-school-green-200 rounded-md flex items-center justify-center mx-auto text-school-green-700">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-gray-900">{exam.title}</h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            This exam opens in a dedicated fullscreen session. Complete all questions and submit — the session will save automatically.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <PortalButton
            onClick={handleOpenQuizTab}
            variant="primary"
          >
            Open Exam Session
          </PortalButton>
          <PortalButton
            onClick={onClose}
            variant="secondary"
          >
            Back
          </PortalButton>
        </div>
      </PortalCard>
    );
  }

  return <LegacyExamRunner studentId={studentId} exam={exam} onClose={onClose} />;
}
