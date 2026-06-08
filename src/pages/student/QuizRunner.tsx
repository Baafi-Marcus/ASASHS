import React, { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { db } from '../../../lib/neon';
import { PortalCard } from '../../components/PortalCard';
import { PortalButton } from '../../components/PortalButton';
import { parseDate } from '../../lib/dates';
import { MathText } from '../../components/MathText';

interface QuizRunnerProps {
  studentId: number;
  quizId: number;
  onClose: () => void;
  standalone?: boolean;
}

type QuizPhase = 'cover' | 'in-progress' | 'review' | 'finished';

export function QuizRunner({ studentId, quizId, onClose, standalone }: QuizRunnerProps) {
  const [quiz, setQuiz] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState<QuizPhase>('cover');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [blocked, setBlocked] = useState<string | null>(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showAnswerReview, setShowAnswerReview] = useState(false);
  const submitQuizRef = useRef<() => Promise<void>>(async () => {});

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  // Cheating Detection: Tab Switch
  useEffect(() => {
    if (phase === 'in-progress' && attemptId) {
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'hidden') {
          setTabSwitches(prev => {
            const newVal = prev + 1;
            toast.error(`WARNING: Tab switch detected! (${newVal}) Stay on this page.`, { duration: 5000 });
            return newVal;
          });
        }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
  }, [phase, attemptId]);

  // Timer logic – uses ref to avoid stale closure on submitQuiz
  useEffect(() => {
    if (phase === 'in-progress' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            toast.error('Time is up! Submitting your quiz automatically...', { duration: 5000 });
            submitQuizRef.current();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, phase]);

  // Full window: hide body scrollbar when exam is active
  useEffect(() => {
    if (phase === 'in-progress' || phase === 'review') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [phase]);

  // Prevent accidental tab close while exam is in progress (standalone mode)
  useEffect(() => {
    if (!standalone) return;
    if (phase === 'in-progress') {
      const handler = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = '';
      };
      window.addEventListener('beforeunload', handler);
      return () => window.removeEventListener('beforeunload', handler);
    }
  }, [standalone, phase]);

  // In standalone mode, close tab when done
  const handleCloseStandalone = () => {
    if (standalone) {
      window.close();
    } else {
      onClose();
    }
  };

  const fetchQuiz = async () => {
    setLoading(true);
    try {
      const quizData = await db.getQuizById(quizId);
      if (!quizData) throw new Error('Quiz not found');

      // Check fixed schedule if due_date is set
      if (quizData.due_date) {
        const now = Date.now();
        const startTime = parseDate(quizData.due_date);
        const durationMs = (quizData.duration_minutes || 60) * 60 * 1000;
        const endTime = startTime ? startTime.getTime() + durationMs : null;

        if (!startTime || !endTime) {
          setTimeLeft((quizData.duration_minutes || quizData.time_limit || 30) * 60);
        } else if (now < startTime.getTime()) {
          setBlocked(`This exam starts at ${startTime.toLocaleString()}. Please wait until then.`);
          setQuiz(quizData);
          setLoading(false);
          return;
        } else if (now > endTime) {
          setBlocked('This exam has ended. It is no longer available.');
          setQuiz(quizData);
          setLoading(false);
          return;
        } else {
          const remainingSeconds = Math.max(0, Math.floor((endTime - now) / 1000));
          setTimeLeft(remainingSeconds);
          quizData._useFixedSchedule = true;
        }
      } else {
        setTimeLeft((quizData.duration_minutes || quizData.time_limit || 30) * 60);
      }

      // Group-aware shuffling
      if (quizData.shuffle_questions && quizData.questions) {
        const groups: Record<string, any[]> = {};
        quizData.questions.forEach((q: any) => {
          const gid = String(q.group_id || 0);
          if (!groups[gid]) groups[gid] = [];
          groups[gid].push(q);
        });
        const groupKeys = Object.keys(groups);
        // shuffle the groups themselves
        for (let i = groupKeys.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [groupKeys[i], groupKeys[j]] = [groupKeys[j], groupKeys[i]];
        }
        const shuffled: any[] = [];
        for (const key of groupKeys) {
          const groupQuestions = [...groups[key]];
          // keep order within each group stable so follow-ups stay with parent
          shuffled.push(...groupQuestions);
        }
        quizData.questions = shuffled;
      }

      if (quizData.shuffle_options) {
        quizData.questions.forEach((q: any) => {
          if (q.options && Array.isArray(q.options)) {
            for (let i = q.options.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [q.options[i], q.options[j]] = [q.options[j], q.options[i]];
            }
          }
        });
      }

      setQuiz(quizData);
      setPhase('cover');
      setLoading(false);
    } catch (error) {
      console.error('Failed to load quiz:', error);
      toast.error('Failed to load quiz');
      handleCloseStandalone();
    }
  };

  const handleStartQuiz = async () => {
    try {
      document.body.style.overflow = 'hidden';
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen().catch(() => {});
      }

      const newAttemptId = await db.startQuizAttempt(studentId, quizId);
      setAttemptId(newAttemptId);
      setPhase('in-progress');
      toast.success('Quiz started! Good luck.');
    } catch (error) {
      console.error('Failed to start quiz attempt:', error);
      toast.error('Failed to start quiz. Please check browser permissions.');
    }
  };

  const submitQuiz = useCallback(async () => {
    if (isSubmitting || !quiz || !attemptId) return;
    setIsSubmitting(true);

    const dbCall = <T,>(promise: Promise<T>, label: string, ms = 15000): Promise<T> =>
      Promise.race([
        promise,
        new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`DB timeout: ${label}`)), ms))
      ]);

    try {
      let totalScore = 0;
      const responses = [];

      for (const question of quiz.questions) {
        const studentAnswer = (answers[question.id] || '').trim();
        let isCorrect = false;
        let pointsEarned = 0;

        if (question.question_type === 'multiple_choice' || question.question_type === 'true_false') {
          const opts = question.options || [];
          const selectedOption = opts.find((o: any) => o.option_text === studentAnswer);
          isCorrect = selectedOption?.is_correct || false;
        } else if (question.question_type === 'short_answer') {
          const correctVariations = (question.correct_answers || []).map((a: any) => {
            const text = typeof a === 'string' ? a : (a.answer_text || '');
            return text.toLowerCase().trim();
          });
          isCorrect = correctVariations.includes(studentAnswer.toLowerCase());
        }

        if (isCorrect) {
          pointsEarned = parseFloat(question.points) || 1;
          totalScore += pointsEarned;
        }

        responses.push({
          attempt_id: attemptId,
          question_id: question.id,
          response_text: studentAnswer || '(no answer)',
          is_correct: isCorrect,
          points_earned: pointsEarned
        });
      }

      // Submit responses sequentially to avoid Neon HTTP connection pool limits
      for (let i = 0; i < responses.length; i++) {
        await dbCall(db.submitQuizResponse(responses[i]), `submitResponse #${i + 1}`);
      }

      const totalPoints = parseFloat(quiz.total_points) || responses.length;
      const percentage = totalPoints > 0 ? (totalScore / totalPoints) * 100 : 0;
      await dbCall(db.completeQuizAttempt(attemptId, totalScore, percentage, tabSwitches), 'completeAttempt');

      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }

      setResult({ score: totalScore, percentage, totalPoints });
      setPhase('finished');
      toast.success('Assessment submitted successfully!');
    } catch (error) {
      console.error('submitQuiz error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit quiz');
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, quiz, attemptId, answers, tabSwitches]);
  submitQuizRef.current = submitQuiz;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Custom submit confirm modal (avoids window.confirm which exits fullscreen)
  if (showSubmitConfirm) {
    return (
      <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900">Submit Assessment?</h3>
          <p className="text-gray-500">Are you sure you want to submit your quiz? This action cannot be undone.</p>
          <div className="flex gap-3 justify-center">
            <PortalButton variant="secondary" onClick={() => setShowSubmitConfirm(false)}>
              Cancel
            </PortalButton>
            <PortalButton onClick={() => { setShowSubmitConfirm(false); submitQuiz(); }}>
              Submit
            </PortalButton>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-school-cream-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-school-green-200 border-t-school-green-600"></div>
      </div>
    );
  }

  // BLOCKED PAGE (before start / after end)
  if (blocked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <PortalCard className="max-w-lg w-full shadow-2xl">
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{quiz?.title || 'Exam'}</h2>
            <p className="text-gray-600">{blocked}</p>
            <PortalButton variant="secondary" onClick={handleCloseStandalone}>Return to Dashboard</PortalButton>
          </div>
        </PortalCard>
      </div>
    );
  }

  // COVER PAGE
  if (phase === 'cover') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <PortalCard className="max-w-2xl w-full shadow-2xl">
          <div className="p-8 space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">{quiz.title}</h1>
              <p className="text-school-green-600 font-bold">{quiz.subject_name || ''}</p>
            </div>

            <div className="bg-amber-50 border-l-4 border-amber-400 p-6 space-y-4 rounded-r-xl">
              <h3 className="font-bold text-amber-800 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Examination Rules & Instructions
              </h3>
              <div className="text-amber-900 text-sm whitespace-pre-wrap leading-relaxed">
                {quiz.instructions || "No specific instructions provided."}
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-amber-200">
                <div>
                  <div className="text-[10px] uppercase font-bold text-amber-700">Duration</div>
                  <div className="font-bold">{quiz.duration_minutes || quiz.time_limit} Minutes</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-amber-700">Questions</div>
                  <div className="font-bold">{quiz.questions?.length || 0}</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-xs text-gray-500 text-center italic">
                By clicking "Start Assessment", the browser will enter fullscreen mode and tab switching will be logged.
              </div>
              <PortalButton
                className="w-full py-4 text-lg font-bold shadow-lg shadow-school-green-100"
                onClick={handleStartQuiz}
              >
                Start Assessment
              </PortalButton>
              <button
                onClick={handleCloseStandalone}
                className="w-full text-gray-400 hover:text-gray-600 text-sm font-medium"
              >
                Cancel and Return
              </button>
            </div>
          </div>
        </PortalCard>
      </div>
    );
  }

  // FINISHED / RESULT PAGE
  if (phase === 'finished') {
    const showScore = quiz?.show_results_immediately !== false;
    const canReview = quiz?.allow_answer_review === true;

    if (showAnswerReview && canReview) {
      return (
        <div className="fixed inset-0 z-[100] bg-gray-50 overflow-y-auto">
          <div className="max-w-5xl mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Answer Review</h2>
                <p className="text-gray-500">{result?.score} / {result?.totalPoints} marks ({Math.round(result?.percentage || 0)}%)</p>
              </div>
              <PortalButton variant="secondary" onClick={() => setShowAnswerReview(false)}>
                Back
              </PortalButton>
            </div>
            {quiz.questions.map((q: any, idx: number) => {
              const studentAnswer = answers[q.id] || '(no answer)';
              const opts = q.options || [];
              const selectedOption = opts.find((o: any) => o.option_text === studentAnswer);
              const correctOption = opts.find((o: any) => o.is_correct);
              const isCorrect = selectedOption?.is_correct || false;
              return (
                <div key={q.id} className={`bg-white rounded-2xl shadow-sm border-l-4 p-6 ${isCorrect ? 'border-l-green-500' : 'border-l-red-500'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Question {idx + 1}</span>
                    <span className={`text-xs font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                      {isCorrect ? '+' + (q.points || 1) + ' marks' : '0 marks'}
                    </span>
                  </div>
                  <MathText text={q.question_text} className="text-lg font-bold text-gray-900 mb-4" />
                  {q.imageDataUrl && (
                    <div className="mb-4">
                      <img src={q.imageDataUrl} alt="Diagram" className="w-full max-w-md rounded-xl border cursor-pointer hover:shadow-lg" onClick={() => window.open(q.imageDataUrl, '_blank')} />
                    </div>
                  )}
                  {q.diagramDescription && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-gray-700">
                      <span className="font-bold text-yellow-700">Diagram:</span> {q.diagramDescription}
                    </div>
                  )}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-500">Your answer:</span>
                      <span className={`${isCorrect ? 'text-green-700' : 'text-red-700'}`}>{studentAnswer}</span>
                    </div>
                    {!isCorrect && correctOption && (
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-500">Correct answer:</span>
                        <span className="text-green-700">{correctOption.option_text}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-lg w-full text-center space-y-6">
          {showScore ? (
            <>
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto ${result?.percentage >= 50 ? 'bg-school-green-100 text-school-green-600' : 'bg-red-100 text-red-600'}`}>
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d={result?.percentage >= 50 ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} />
                </svg>
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">Assessment Completed!</h2>
                <p className="text-gray-500">You scored {result?.score} out of {result?.totalPoints}</p>
                <div className="text-5xl font-black text-school-green-600">{Math.round(result?.percentage || 0)}%</div>
                {tabSwitches > 0 && (
                  <div className="text-xs text-red-500 font-bold uppercase py-1 px-3 bg-red-50 rounded-full inline-block">
                    {tabSwitches} TAB SWITCHES LOGGED
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto bg-school-green-100 text-school-green-600">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Submitted Successfully!</h2>
              <p className="text-gray-500">Your answers have been recorded. Results will be available once released by your teacher.</p>
            </div>
          )}
          <div className="flex flex-col gap-3">
            <PortalButton onClick={handleCloseStandalone} variant="secondary" className="w-full">Close and Return</PortalButton>
            {canReview && (
              <PortalButton onClick={() => setShowAnswerReview(true)} variant="primary" className="w-full">
                View Answers
              </PortalButton>
            )}
          </div>
        </div>
      </div>
    );
  }

  // REVIEW PAGE (before final submission)
  if (phase === 'review') {
    const answeredCount = quiz.questions.filter((q: any) => !!answers[q.id]?.trim()).length;

    return (
      <div className="fixed inset-0 z-[100] bg-gray-50 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Review Your Answers</h2>
              <p className="text-gray-500">{answeredCount} of {quiz.questions.length} questions answered</p>
            </div>
            <div className="flex gap-3">
              <PortalButton variant="secondary" onClick={() => setPhase('in-progress')}>
                Back to Editing
              </PortalButton>
              <PortalButton onClick={() => setShowSubmitConfirm(true)} disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
              </PortalButton>
            </div>
          </div>

          {quiz.questions.map((q: any, idx: number) => {
            const answer = answers[q.id] || '';
            return (
              <div key={q.id} className="bg-white rounded-2xl shadow-sm border border-school-cream-200 overflow-hidden border-l-4" style={{ borderLeftColor: answer ? '#16a34a' : '#d1d5db' }}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="bg-gray-800 text-white w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold">
                        {idx + 1}
                      </span>
                      <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">{q.question_type}</span>
                      {q.group_id > 0 && <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-bold">Follow-up</span>}
                    </div>
                    <span className="text-xs font-bold text-gray-300">{q.points || 1} MARKS</span>
                  </div>
                  <MathText text={q.question_text} className="text-lg font-bold text-gray-900 mb-4" />
                  {q.imageDataUrl && (
                    <div className="mb-4">
                      <img src={q.imageDataUrl} alt="Diagram" className="w-full max-w-md rounded-xl border cursor-pointer hover:shadow-lg" onClick={() => window.open(q.imageDataUrl, '_blank')} />
                    </div>
                  )}
                  {q.diagramDescription && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-gray-700">
                      <span className="font-bold text-yellow-700">Diagram:</span> {q.diagramDescription}
                    </div>
                  )}
                  {q.question_type === 'multiple_choice' || q.question_type === 'true_false' ? (
                    <div className="flex flex-wrap gap-2">
                      {(q.options || []).map((opt: any) => (
                        <div key={opt.id} className={`px-4 py-2 rounded-xl text-sm font-medium border-2 ${answer === opt.option_text ? 'border-school-green-600 bg-school-green-50 text-school-green-800' : 'border-gray-200 text-gray-500'}`}>
                          <MathText text={opt.option_text} />
                          {answer === opt.option_text && <span className="ml-2 text-green-600">✓</span>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 rounded-xl text-lg font-medium">
                      {answer || <span className="text-gray-400 italic">No answer provided</span>}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <div className="flex justify-between bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky bottom-4">
            <PortalButton variant="secondary" onClick={() => setPhase('in-progress')}>
              Back to Editing
            </PortalButton>
            <PortalButton onClick={() => setShowSubmitConfirm(true)} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
            </PortalButton>
          </div>
        </div>
      </div>
    );
  }

  // --- IN-PROGRESS (answering questions) ---
  const isOneByOne = quiz.display_mode === 'one_by_one';
  const allQuestionsAnswered = quiz.questions.every((q: any) => !!answers[q.id]?.trim());

  const renderQuestion = (q: any, idx: number) => (
    <PortalCard key={q.id} className="overflow-hidden border-none shadow-xl bg-white flex flex-col mb-6">
      <div className="p-8 space-y-8 flex-1">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black text-school-green-600 uppercase tracking-[0.2em]">Question {idx + 1} of {quiz.questions.length}</span>
              {q.group_id > 0 && <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-bold">Follow-up</span>}
            </div>
            <span className="text-[11px] font-bold text-gray-300 uppercase">{q.points || 1} MARKS</span>
          </div>
          <MathText text={q.question_text} className="text-2xl font-bold text-gray-900 leading-tight" />
          {q.imageDataUrl && (
            <div className="mt-4">
              <img
                src={q.imageDataUrl}
                alt="Question diagram"
                className="w-full max-w-lg rounded-xl border cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => window.open(q.imageDataUrl, '_blank')}
              />
              <p className="text-xs text-gray-400 mt-1">Click to expand</p>
            </div>
          )}
          {q.diagramDescription && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-gray-700">
              <span className="font-bold text-yellow-700">Diagram description:</span> {q.diagramDescription}
            </div>
          )}
        </div>

        <div className="space-y-4 pt-6">
          {q.question_type === 'multiple_choice' || q.question_type === 'true_false' ? (
            <div className="grid grid-cols-1 gap-3">
              {(q.options || []).map((option: any) => (
                <button
                  key={option.id}
                  onClick={() => setAnswers({ ...answers, [q.id]: option.option_text })}
                  className={`group p-5 rounded-2xl border-2 text-left transition-all ${
                    answers[q.id] === option.option_text
                      ? 'border-school-green-600 bg-school-green-50 text-school-green-900 shadow-md'
                      : 'border-gray-50 bg-gray-50 hover:border-gray-300'
                  }`}
                >
                    <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center transition-colors ${answers[q.id] === option.option_text ? 'border-school-green-600 bg-school-green-600' : 'border-gray-300 group-hover:border-gray-400'}`}>
                      {answers[q.id] === option.option_text && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
                    </div>
                    <MathText text={option.option_text} className="text-lg font-medium" />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <input
                type="text"
                className="w-full p-6 bg-gray-50 border-2 border-gray-50 rounded-2xl focus:border-school-green-600 focus:bg-white outline-none transition-all text-xl font-medium"
                placeholder="Type your answer here..."
                value={answers[q.id] || ''}
                onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
              />
            </div>
          )}
        </div>
      </div>
    </PortalCard>
  );

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col">
      {/* LOCKED HUD */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-lg px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-4">
          <div className="bg-school-green-600 text-white px-3 py-1 rounded-lg font-bold text-sm">
            {quiz.subject_name || 'Exam'}
          </div>
          <h2 className="text-sm font-bold text-gray-900 truncate max-w-[200px]">{quiz.title}</h2>
        </div>

        {/* Progress indicator (simple text, no clickable grid) */}
        {isOneByOne && (
          <div className="text-sm text-gray-500 font-medium">
            {currentQuestionIdx + 1} / {quiz.questions.length}
          </div>
        )}

        <div className={`px-5 py-2 rounded-2xl font-mono text-2xl font-black flex items-center shadow-inner ${timeLeft < 60 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-900 text-school-green-400'}`}>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Progress Line (visual only) */}
      {isOneByOne && (
        <div className="w-full bg-gray-200 h-1">
          <div
            className="bg-school-green-600 h-1 transition-all duration-500"
            style={{ width: `${((currentQuestionIdx + 1) / quiz.questions.length) * 100}%` }}
          ></div>
        </div>
      )}

      {/* Question content - scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-6 pb-32">
          {isOneByOne ? (
            renderQuestion(quiz.questions[currentQuestionIdx], currentQuestionIdx)
          ) : (
            quiz.questions.map((q: any, idx: number) => renderQuestion(q, idx))
          )}
        </div>
      </div>

      {/* FOOTER ACTIONS - fixed at bottom */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-between items-center shrink-0">
        {isOneByOne ? (
          <PortalButton
            variant="secondary"
            onClick={() => {
              setCurrentQuestionIdx(prev => Math.max(0, prev - 1));
            }}
            disabled={currentQuestionIdx === 0}
            className="px-8"
          >
            ← Previous
          </PortalButton>
        ) : (
          <div></div>
        )}

        {isOneByOne && currentQuestionIdx < quiz.questions.length - 1 ? (
          <PortalButton
            variant="primary"
            onClick={() => {
              setCurrentQuestionIdx(prev => Math.min(quiz.questions.length - 1, prev + 1));
            }}
            className="px-8"
          >
            Next →
          </PortalButton>
        ) : (
          <PortalButton
            variant="primary"
            onClick={() => setPhase('review')}
            className="px-12 py-4 bg-school-green-700 shadow-xl"
          >
            Review Answers
          </PortalButton>
        )}
      </div>
    </div>
  );
}
