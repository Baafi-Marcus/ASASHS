import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { db } from '../../../lib/neon';
import { PortalCard } from '../../components/PortalCard';
import { PortalButton } from '../../components/PortalButton';
import { QuizRunner } from './QuizRunner';

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
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Digital Assessments</h2>
          <p className="text-gray-600">Take your quizzes and exams online</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-school-green-200 border-t-school-green-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Available Quizzes */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 px-2">Available Quizzes</h3>
            {quizzes.length > 0 ? (
              quizzes.map((quiz) => {
                const hasAttempt = attempts.find(a => a.quiz_id === quiz.id && a.status === 'completed');
                const now = Date.now();
                const startTime = quiz.due_date ? new Date(quiz.due_date).getTime() : null;
                const endTime = startTime ? startTime + (quiz.duration_minutes || 60) * 60 * 1000 : null;
                const isEnded = endTime ? now > endTime : false;
                const isUpcoming = startTime ? now < startTime : false;
                return (
                  <PortalCard key={quiz.id} className={`group hover:border-school-green-300 transition-colors ${isEnded ? 'opacity-60' : ''}`}>
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 bg-school-green-100 text-school-green-700 text-[10px] font-bold rounded">
                            {quiz.subject_name}
                          </span>
                          <span className="text-xs text-gray-500">{quiz.teacher_surname}, {quiz.teacher_other_names}</span>
                        </div>
                        <h4 className="font-bold text-gray-900">{quiz.title}</h4>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center">
                            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {quiz.duration_minutes || quiz.time_limit || 'N/A'} mins
                          </span>
                          {startTime && (
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${isEnded ? 'bg-red-50 text-red-600' : isUpcoming ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                              {isEnded ? 'Ended' : isUpcoming ? 'Upcoming' : 'Active'}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {hasAttempt ? (
                        <div className="text-right">
                          <div className="text-xs font-bold text-school-green-600">COMPLETED</div>
                          {hasAttempt.show_results_immediately !== false ? (
                            <div className="text-lg font-bold text-gray-900">{hasAttempt.score} pts</div>
                          ) : (
                            <div className="text-[10px] text-gray-400 italic">Results pending</div>
                          )}
                        </div>
                      ) : isEnded ? (
                        <span className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg">Ended</span>
                      ) : (
                        <PortalButton 
                          onClick={() => setSelectedQuizId(quiz.id)}
                          size="sm"
                          disabled={isUpcoming}
                        >
                          {isUpcoming ? 'Not Yet Available' : 'Start Quiz'}
                        </PortalButton>
                      )}
                    </div>
                  </PortalCard>
                );
              })
            ) : (
              <div className="p-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                <p className="text-gray-500 text-sm">No quizzes available for your class.</p>
              </div>
            )}
          </div>

          {/* Past Attempts / History */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 px-2">Quiz History</h3>
            <PortalCard title="Recent Activity">
              {attempts.length > 0 ? (
                <div className="space-y-4">
                  {attempts.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((attempt) => (
                      <div key={attempt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div>
                          <div className="text-sm font-bold text-gray-900">{attempt.quiz_title}</div>
                          <div className="text-[10px] text-gray-500 uppercase">{attempt.subject_name}</div>
                          <div className="text-[10px] text-gray-400">{new Date(attempt.created_at).toLocaleDateString()}</div>
                        </div>
                        <div className="text-right">
                          {attempt.show_results_immediately !== false ? (
                            <>
                              <div className={`text-sm font-bold ${attempt.percentage >= 50 ? 'text-school-green-600' : 'text-red-600'}`}>
                                {attempt.percentage}%
                              </div>
                              <div className="text-[10px] text-gray-500">{attempt.score} points</div>
                            </>
                          ) : (
                            <span className="text-xs text-gray-400 italic">Results pending</span>
                          )}
                        </div>
                      </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 text-sm py-4">No attempts recorded yet.</p>
              )}
            </PortalCard>
          </div>
        </div>
      )}
    </div>
  );
}
