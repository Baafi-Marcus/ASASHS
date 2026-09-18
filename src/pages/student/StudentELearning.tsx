import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { db } from '../../../lib/neon';
import { PortalCard } from '../../components/PortalCard';
import { PortalButton } from '../../components/PortalButton';
import { QuizRunner } from './QuizRunner';
import { isEnded, isUpcoming } from '../../lib/dates';
import { syncEngine } from '../../services/syncEngine';
import { SkeletonList } from '../../components/SkeletonLoader';

export function StudentELearning({ studentId, classId }: { studentId: number; classId?: number }) {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, [studentId, classId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch available quizzes for this class
      if (classId) {
        const quizData = await db.getQuizzes({ class_id: classId });
        setQuizzes(quizData);
      }
      
      // Fetch past attempts
      const attemptData = await db.getQuizAttempts({ student_id: studentId });
      setAttempts(attemptData);
    } catch (error) {
      console.error('Failed to fetch eLearning data:', error);
      toast.error('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  if (selectedQuizId) {
    return (
      <QuizRunner 
        studentId={studentId} 
        quizId={selectedQuizId} 
        onClose={() => {
          setSelectedQuizId(null);
          fetchData();
        }} 
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-md border border-gray-200">
        <div>
          <h2 className="text-base font-semibold text-gray-900 tracking-tight">Digital Assessments</h2>
          <p className="text-xs text-gray-500 mt-0.5">Online quizzes, term revisions, and e-learning evaluations</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-1">Available Quizzes</h3>
            <SkeletonList count={3} />
          </div>
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-1">Recent Activity</h3>
            <SkeletonList count={3} />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Available Quizzes */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-1">
              Available Quizzes (<span className="tabular-nums">{quizzes.length}</span>)
            </h3>
            {quizzes.length > 0 ? (
              quizzes.map((quiz) => {
                const hasAttempt = attempts.find(a => a.quiz_id === quiz.id && a.status === 'completed');
                const ended = isEnded(quiz.due_date, quiz.duration_minutes);
                const upcoming = isUpcoming(quiz.due_date, quiz.duration_minutes);
                return (
                  <div key={quiz.id} className={`p-4 rounded-md border border-gray-200 bg-white transition-all duration-fast ease-standard hover:-translate-y-0.5 ${ended ? 'opacity-70 bg-gray-50/60' : ''}`}>
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 bg-gray-100 border border-gray-200 text-gray-700 text-[11px] font-semibold rounded-sm">
                            {quiz.subject_name}
                          </span>
                          <span className="text-[11px] text-gray-500">{quiz.teacher_surname}, {quiz.teacher_other_names}</span>
                        </div>
                        <h4 className="font-semibold text-sm text-gray-900 leading-snug">{quiz.title}</h4>
                        <div className="flex items-center space-x-3 text-xs text-gray-500 pt-1">
                          <span className="flex items-center tabular-nums">
                            <svg className="w-3.5 h-3.5 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {quiz.duration_minutes || quiz.time_limit || '-'} mins
                          </span>
                          {quiz.due_date && (
                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-sm border ${
                              ended ? 'bg-gray-100 text-gray-600 border-gray-200' : 
                              upcoming ? 'bg-blue-50 text-blue-800 border-blue-200' : 
                              'bg-emerald-50 text-emerald-800 border-emerald-200'
                            }`}>
                              {ended ? 'Ended' : upcoming ? 'Upcoming' : 'Active'}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex sm:flex-col items-end justify-between sm:justify-start gap-2 flex-shrink-0">
                        {hasAttempt ? (
                          <div className="text-right">
                            <span className="text-[11px] font-bold text-school-green-800 block">COMPLETED</span>
                            {hasAttempt.show_results_immediately !== false ? (
                              <div className="text-sm font-bold text-gray-900 tabular-nums">{hasAttempt.score} marks</div>
                            ) : (
                              <div className="text-[11px] text-gray-400 italic">Results pending</div>
                            )}
                          </div>
                        ) : ended ? (
                          <span className="px-2.5 py-1 text-xs font-medium text-gray-500 bg-gray-100 rounded-sm border border-gray-200">Closed</span>
                        ) : (
                          <div className="flex flex-col gap-2 w-full sm:w-auto">
                            <PortalButton 
                              size="sm"
                              onClick={() => setSelectedQuizId(quiz.id)}
                              disabled={upcoming}
                            >
                              {upcoming ? 'Available Soon' : 'Start Assessment'}
                            </PortalButton>
                            {quiz.allow_offline !== false && !upcoming && (
                              <button
                                onClick={async () => {
                                  try {
                                    await syncEngine.checkOutAssessment(studentId, quiz.id);
                                    toast.success('Saved to offline storage');
                                  } catch (e) {
                                    toast.error('Could not save for offline');
                                  }
                                }}
                                className="min-h-[36px] px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-sm transition-colors flex items-center justify-center gap-1.5 focus-visible:ring-2 focus-visible:ring-school-green-700"
                              >
                                <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                <span>Save for Offline</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center bg-gray-50 rounded-md border border-gray-200 text-xs text-gray-500">
                No active quizzes available for your class.
              </div>
            )}
          </div>

          {/* Past Attempts / History */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-1">Assessment History</h3>
            <PortalCard title="Recent Activity">
              {attempts.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {attempts.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((attempt) => (
                    <div key={attempt.id} className="py-2.5 flex items-center justify-between first:pt-0 last:pb-0">
                      <div>
                        <div className="text-xs font-semibold text-gray-900 leading-snug">{attempt.quiz_title}</div>
                        <div className="text-[11px] text-gray-500 mt-0.5">{attempt.subject_name} • <span className="tabular-nums">{new Date(attempt.created_at).toLocaleDateString()}</span></div>
                      </div>
                      <div className="text-right">
                        {attempt.show_results_immediately !== false ? (
                          <>
                            <div className={`text-xs font-bold tabular-nums ${attempt.percentage >= 50 ? 'text-school-green-700' : 'text-red-600'}`}>
                              {attempt.percentage}%
                            </div>
                            <div className="text-[11px] text-gray-500 tabular-nums">{attempt.score} marks</div>
                          </>
                        ) : (
                          <span className="text-[11px] text-gray-400 italic">Pending</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 text-xs py-6">No previous attempts recorded.</p>
              )}
            </PortalCard>
          </div>
        </div>
      )}
    </div>
  );
}
