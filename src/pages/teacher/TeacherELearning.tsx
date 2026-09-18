import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { db } from '../../../lib/neon';
import { PortalCard } from '../../components/PortalCard';
import { PortalButton } from '../../components/PortalButton';
import { QuizBuilder } from './QuizBuilder';
import { getScheduleStatus, parseDate } from '../../lib/dates';
import { TeacherInvigilatorDashboard } from '../../components/teacher/TeacherInvigilatorDashboard';

function QuizDetailModal({ quiz, onClose }: { quiz: any; onClose: () => void }) {
  const startTime = parseDate(quiz.due_date);
  const dur = quiz.duration_minutes || 60;
  const endTime = startTime ? new Date(startTime.getTime() + dur * 60 * 1000) : null;
  const status = getScheduleStatus(quiz.due_date, quiz.duration_minutes);
  const statusLabel = status === 'unscheduled' ? 'Always Available' : status === 'upcoming' ? `Starts ${startTime?.toLocaleString()}` : status === 'ended' ? 'Ended' : 'Active';

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <PortalCard className="w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="text-base font-bold text-gray-900">Quiz Specifications</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-auto p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-0.5">Title</label>
              <p className="text-gray-900 font-bold text-sm">{quiz.title}</p>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-0.5">Subject</label>
              <p className="text-gray-900 font-medium">{quiz.subject_name}</p>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-0.5">Class</label>
              <p className="text-gray-900 font-medium">{quiz.class_name}</p>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-0.5">Status</label>
              <p className={`font-semibold ${status === 'active' ? 'text-school-green-700' : status === 'ended' ? 'text-red-600' : 'text-gray-900'}`}>{statusLabel}</p>
            </div>
            {startTime && (
              <div>
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-0.5">Scheduled Start</label>
                <p className="text-gray-900 font-medium tabular-nums">{startTime.toLocaleString()}</p>
              </div>
            )}
            {endTime && (
              <div>
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-0.5">Scheduled End</label>
                <p className="text-gray-900 font-medium tabular-nums">{endTime.toLocaleString()}</p>
              </div>
            )}
            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-0.5">Duration</label>
              <p className="text-gray-900 font-medium tabular-nums">{quiz.duration_minutes || quiz.time_limit || 'N/A'} mins</p>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-0.5">Total Points</label>
              <p className="text-gray-900 font-medium tabular-nums">{quiz.total_points || 'N/A'} marks</p>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-0.5">Passing Score</label>
              <p className="text-gray-900 font-medium tabular-nums">{quiz.passing_score != null ? quiz.passing_score : 'N/A'}%</p>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-0.5">Display Mode</label>
              <p className="text-gray-900 font-medium capitalize">{quiz.display_mode?.replace(/_/g, ' ') || 'All at once'}</p>
            </div>
          </div>
          {quiz.description && (
            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">Description</label>
              <p className="text-xs text-gray-700 bg-gray-50 p-3 rounded-sm border border-gray-200">{quiz.description}</p>
            </div>
          )}
          {quiz.instructions && (
            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">Instructions</label>
              <p className="text-xs text-gray-700 bg-gray-50 p-3 rounded-sm border border-gray-200 whitespace-pre-wrap">{quiz.instructions}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100 text-xs">
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${quiz.shuffle_questions ? 'bg-school-green-600' : 'bg-gray-300'}`} />
              <span>Shuffle Questions: {quiz.shuffle_questions ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${quiz.shuffle_options ? 'bg-school-green-600' : 'bg-gray-300'}`} />
              <span>Shuffle Options: {quiz.shuffle_options ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>
      </PortalCard>
    </div>
  );
}

function QuizResultsModal({ quiz, onClose }: { quiz: any; onClose: () => void }) {
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, [quiz.id]);

  const fetchResults = async () => {
    try {
      const data = await db.getDetailedQuizAttempts(quiz.id, quiz.class_id);
      setAttempts(data);
    } catch (error) {
      toast.error('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <PortalCard className="w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-base font-bold text-gray-900">{quiz.title} — Assessment Results</h2>
            <p className="text-xs text-gray-500">{quiz.class_name} • {quiz.subject_name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4 sm:p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-school-green-200 border-t-school-green-600"></div>
            </div>
          ) : attempts.length > 0 ? (
            <div className="overflow-x-auto rounded-sm border border-gray-200">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Student Name</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Admission #</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Score</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Percentage</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">Proctoring</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Completed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {attempts.map((attempt) => {
                    const submitted = attempt.attempt_id != null;
                    return (
                      <tr key={attempt.student_id} className={`hover:bg-gray-50/60 transition-colors ${submitted ? '' : 'opacity-60'}`}>
                        <td className="px-4 py-3 text-xs font-bold text-gray-900">
                          {attempt.surname}, {attempt.other_names}
                        </td>
                        <td className="px-4 py-3 text-xs font-mono tabular-nums text-gray-500">
                          {attempt.student_admission_number}
                        </td>
                        {submitted ? (
                          <>
                            <td className="px-4 py-3 text-xs font-mono font-bold text-gray-900 text-right tabular-nums">
                              {attempt.score} marks
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className={`text-xs font-bold font-mono tabular-nums ${attempt.percentage >= 50 ? 'text-school-green-700' : 'text-red-600'}`}>
                                {Math.round(attempt.percentage)}%
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              {attempt.tab_switches > 0 ? (
                                <span className="inline-block px-1.5 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded-sm text-[10px] font-bold tabular-nums">
                                  {attempt.tab_switches} switch{attempt.tab_switches > 1 ? 'es' : ''}
                                </span>
                              ) : (
                                <span className="inline-block px-1.5 py-0.5 bg-school-green-50 text-school-green-800 border border-school-green-200 rounded-sm text-[10px] font-bold">
                                  Secure
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-[11px] text-gray-500 tabular-nums">
                              {attempt.end_time ? new Date(attempt.end_time).toLocaleString() : 'In progress'}
                            </td>
                          </>
                        ) : (
                          <td className="px-4 py-3 text-xs text-gray-400 italic" colSpan={4}>
                            Not submitted
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16 text-xs text-gray-500">
              No students found in this class section.
            </div>
          )}
        </div>
      </PortalCard>
    </div>
  );
}

export function TeacherELearning({ teacherId }: { teacherId: number }) {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<any | null>(null);
  const [detailQuiz, setDetailQuiz] = useState<any | null>(null);
  const [radarQuiz, setRadarQuiz] = useState<any | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetchQuizzes();
  }, [teacherId]);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const data = await db.getQuizzes({ teacher_id: teacherId });
      setQuizzes(data);
    } catch (error) {
      console.error('Failed to fetch quizzes:', error);
      toast.error('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  if (showBuilder) {
    return (
      <QuizBuilder 
        teacherId={teacherId} 
        onClose={() => {
          setShowBuilder(false);
          fetchQuizzes();
        }} 
      />
    );
  }

  return (
    <div className="space-y-6">
      <PortalCard className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">E-Learning Assessments</h2>
          <p className="text-xs text-gray-500">Configure online quizzes, live tests, and instant-marking questions</p>
        </div>
        <PortalButton
          onClick={() => setShowBuilder(true)}
          variant="primary"
          className="text-xs !min-h-[38px]"
        >
          Create New Quiz
        </PortalButton>
      </PortalCard>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-school-green-200 border-t-school-green-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizzes.length > 0 ? (
            quizzes.map((quiz) => (
              <PortalCard key={quiz.id} className="p-5 flex flex-col justify-between hover:border-gray-300 transition">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="px-2 py-0.5 bg-school-green-50 text-school-green-800 border border-school-green-200 text-[10px] font-bold rounded-sm uppercase tracking-wider">
                      {quiz.subject_name}
                    </span>
                    <span className="text-xs font-medium text-gray-500">
                      {quiz.class_name}
                    </span>
                  </div>
                  
                  <h3 className="text-sm font-bold text-gray-900 line-clamp-1">{quiz.title}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2">{quiz.description || 'No description provided.'}</p>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 pt-2 border-t border-gray-100">
                    <div className="tabular-nums font-medium">
                      ⏱️ {quiz.duration_minutes || quiz.time_limit || '30'} mins
                    </div>
                    <div className="tabular-nums font-medium">
                      🎯 {quiz.passing_score != null ? quiz.passing_score : '50'}% pass
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex flex-wrap gap-1.5 mt-3">
                  <button 
                    onClick={() => setSelectedQuiz(quiz)}
                    className="flex-1 min-h-[32px] px-2.5 py-1 bg-school-green-50 text-school-green-800 border border-school-green-200 rounded-sm hover:bg-school-green-100 text-xs font-semibold transition"
                  >
                    Results
                  </button>
                  <button 
                    onClick={() => setDetailQuiz(quiz)}
                    className="min-h-[32px] px-2.5 py-1 bg-gray-50 text-gray-700 border border-gray-200 rounded-sm hover:bg-gray-100 text-xs font-semibold transition"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => setRadarQuiz(quiz)}
                    className="min-h-[32px] px-2.5 py-1 bg-gray-900 hover:bg-black text-white rounded-sm text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-school-green-400 animate-pulse"></span>
                    <span>Radar</span>
                  </button>
                  <button
                    onClick={async () => {
                      if (!window.confirm(`Delete "${quiz.title}"? This cannot be undone.`)) return;
                      setDeletingId(quiz.id);
                      try {
                        await db.deleteQuiz(quiz.id);
                        toast.success('Quiz deleted');
                        fetchQuizzes();
                      } catch (e) {
                        toast.error('Failed to delete quiz');
                      } finally {
                        setDeletingId(null);
                      }
                    }}
                    disabled={deletingId === quiz.id}
                    className="min-h-[32px] px-2 py-1 text-red-600 hover:bg-red-50 border border-red-200 rounded-sm text-xs font-semibold transition disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </PortalCard>
            ))
          ) : (
            <div className="col-span-full py-16 text-center bg-white rounded-md border border-dashed border-gray-300">
              <h3 className="text-sm font-bold text-gray-900">No quizzes configured</h3>
              <p className="text-xs text-gray-500 mt-1">Create your first quiz to start digital e-learning assessments.</p>
              <div className="mt-4">
                <PortalButton onClick={() => setShowBuilder(true)} variant="primary" className="text-xs">
                  Create Quiz
                </PortalButton>
              </div>
            </div>
          )}
        </div>
      )}

      {selectedQuiz && (
        <QuizResultsModal 
          quiz={selectedQuiz} 
          onClose={() => setSelectedQuiz(null)} 
        />
      )}
      {detailQuiz && (
        <QuizDetailModal
          quiz={detailQuiz}
          onClose={() => setDetailQuiz(null)}
        />
      )}
      {radarQuiz && (
        <TeacherInvigilatorDashboard
          isOpen={!!radarQuiz}
          onClose={() => setRadarQuiz(null)}
          assessment={radarQuiz}
        />
      )}
    </div>
  );
}
