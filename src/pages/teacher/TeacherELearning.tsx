import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { db } from '../../../lib/neon';
import { PortalCard } from '../../components/PortalCard';
import { PortalButton } from '../../components/PortalButton';
import { QuizBuilder } from './QuizBuilder';

function QuizDetailModal({ quiz, onClose }: { quiz: any; onClose: () => void }) {
  const startTime = quiz.due_date ? new Date(quiz.due_date) : null;
  const dur = quiz.duration_minutes || 60;
  const endTime = startTime ? new Date(startTime.getTime() + dur * 60 * 1000) : null;
  const now = new Date();
  let status = 'Always Available';
  if (startTime && endTime) {
    if (now < startTime) status = `Starts ${startTime.toLocaleString()}`;
    else if (now > endTime) status = 'Ended';
    else status = 'Active';
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        <div className="p-6 border-b flex justify-between items-center bg-school-green-600 text-white">
          <h2 className="text-xl font-bold">Quiz Details</h2>
          <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-auto p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Title</label>
              <p className="text-gray-900 font-medium">{quiz.title}</p>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Subject</label>
              <p className="text-gray-900 font-medium">{quiz.subject_name}</p>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Class</label>
              <p className="text-gray-900 font-medium">{quiz.class_name}</p>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Status</label>
              <p className={`font-medium ${status === 'Active' ? 'text-green-600' : status === 'Ended' ? 'text-red-600' : 'text-gray-900'}`}>{status}</p>
            </div>
            {startTime && (
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Scheduled Start</label>
                <p className="text-gray-900 font-medium">{startTime.toLocaleString()}</p>
              </div>
            )}
            {endTime && (
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Scheduled End</label>
                <p className="text-gray-900 font-medium">{endTime.toLocaleString()}</p>
              </div>
            )}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Duration</label>
              <p className="text-gray-900 font-medium">{quiz.duration_minutes || quiz.time_limit || 'N/A'} mins</p>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Total Points</label>
              <p className="text-gray-900 font-medium">{quiz.total_points || 'N/A'}</p>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Passing Score</label>
              <p className="text-gray-900 font-medium">{quiz.passing_score != null ? quiz.passing_score : 'N/A'}%</p>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Display Mode</label>
              <p className="text-gray-900 font-medium capitalize">{quiz.display_mode?.replace(/_/g, ' ') || 'All at once'}</p>
            </div>
          </div>
          {quiz.description && (
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{quiz.description}</p>
            </div>
          )}
          {quiz.instructions && (
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Instructions</label>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">{quiz.instructions}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${quiz.shuffle_questions ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span>Shuffle Questions: {quiz.shuffle_questions ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${quiz.shuffle_options ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span>Shuffle Options: {quiz.shuffle_options ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${quiz.show_results_immediately ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span>Show Results: {quiz.show_results_immediately ? 'Immediately' : 'After Review'}</span>
            </div>
          </div>
        </div>
      </div>
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
      const data = await db.getDetailedQuizAttempts(quiz.id);
      setAttempts(data);
    } catch (error) {
      toast.error('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center bg-school-green-600 text-white">
          <div>
            <h2 className="text-xl font-bold">{quiz.title} - Results</h2>
            <p className="text-school-green-100 text-sm">{quiz.class_name} | {quiz.subject_name}</p>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-school-green-600 border-t-transparent"></div>
            </div>
          ) : attempts.length > 0 ? (
            <div className="overflow-x-auto border rounded-xl">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Student Name</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Admission #</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Score</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Percentage</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Proctoring</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attempts.map((attempt) => (
                    <tr key={attempt.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {attempt.surname}, {attempt.other_names}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                        {attempt.student_admission_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        {attempt.score} pts
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`text-sm font-bold ${attempt.percentage >= 50 ? 'text-school-green-600' : 'text-red-600'}`}>
                            {Math.round(attempt.percentage)}%
                          </span>
                          <div className="ml-2 w-16 bg-gray-200 rounded-full h-1.5 hidden md:block">
                            <div className={`h-1.5 rounded-full ${attempt.percentage >= 50 ? 'bg-school-green-600' : 'bg-red-600'}`} style={{ width: `${attempt.percentage}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {attempt.tab_switches > 0 ? (
                          <span className="px-2 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-bold flex items-center w-fit">
                            <span className="mr-1">🚨</span> {attempt.tab_switches} Switches
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold flex items-center w-fit">
                            <span className="mr-1">✅</span> Clean
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                        {attempt.end_time ? new Date(attempt.end_time).toLocaleString() : 'In progress'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed">
              <p className="text-gray-500">No students have completed this quiz yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function TeacherELearning({ teacherId }: { teacherId: number }) {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<any | null>(null);
  const [detailQuiz, setDetailQuiz] = useState<any | null>(null);
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
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Quiz Management</h2>
          <p className="text-gray-600">Create and manage your digital assessments</p>
        </div>
        <PortalButton
          onClick={() => setShowBuilder(true)}
          variant="primary"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create New Quiz
        </PortalButton>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-school-green-200 border-t-school-green-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.length > 0 ? (
            quizzes.map((quiz) => (
              <PortalCard key={quiz.id} className="hover:shadow-md transition-shadow">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="px-2 py-1 bg-school-green-100 text-school-green-700 text-xs font-semibold rounded uppercase">
                      {quiz.subject_name}
                    </span>
                    <span className="text-sm font-medium text-gray-500">
                      {quiz.class_name}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{quiz.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{quiz.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {quiz.duration_minutes || quiz.time_limit || 'N/A'} mins
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {quiz.passing_score != null ? quiz.passing_score : 'N/A'}% pass
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex space-x-2">
                    <button 
                      onClick={() => setSelectedQuiz(quiz)}
                      className="flex-1 px-3 py-2 bg-school-green-600 text-white rounded-lg hover:bg-school-green-700 transition-colors text-sm font-medium"
                    >
                      View Results
                    </button>
                    <button 
                      onClick={() => setDetailQuiz(quiz)}
                      className="flex-1 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                    >
                      Details
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
                      className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-semibold disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {deletingId === quiz.id ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </PortalCard>
            ))
          ) : (
            <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-gray-300">
              <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">No quizzes found</h3>
              <p className="text-gray-500">Create your first quiz to start digital assessments.</p>
              <button
                onClick={() => setShowBuilder(true)}
                className="mt-4 text-school-green-600 font-semibold hover:text-school-green-700"
              >
                + Create Quiz
              </button>
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
    </div>
  );
}
