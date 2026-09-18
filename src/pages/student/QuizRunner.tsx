import React, { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { db } from '../../../lib/neon';
import { PortalCard } from '../../components/PortalCard';
import { PortalButton } from '../../components/PortalButton';
import { parseDate } from '../../lib/dates';
import { MathText } from '../../components/MathText';
import { useNativeSecurity } from '../../components/NativeSecurityProvider';
import { localDb } from '../../services/localDb';
import { ScientificCalculator, PeriodicTable } from '../../components/assessments/ResourceLibraries';

interface QuizRunnerProps {
  studentId: number;
  quizId: number;
  onClose: () => void;
  standalone?: boolean;
  offlineAssessment?: any;
}

type QuizPhase = 'cover' | 'in-progress' | 'review' | 'finished';

export function QuizRunner({ studentId, quizId, onClose, standalone, offlineAssessment }: QuizRunnerProps) {
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
  const [showCalculator, setShowCalculator] = useState(false);
  const [showPeriodicTable, setShowPeriodicTable] = useState(false);
  const [pinnedDiagram, setPinnedDiagram] = useState<string | null>(null);
  const [passageReaderMode, setPassageReaderMode] = useState(false);
  const submitQuizRef = useRef<() => Promise<void>>(async () => {});

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  const { startLockdown, stopLockdown, violationsCount } = useNativeSecurity();

  // Cheating Detection: Tab Switch & Native Lockdown
  useEffect(() => {
    if (phase === 'in-progress' && attemptId) {
      startLockdown(() => {
        toast.error('Auto-submitting due to maximum security violations!');
        submitQuizRef.current();
      });
      return () => {
        stopLockdown();
      };
    } else {
      stopLockdown();
    }
  }, [phase, attemptId]);

  useEffect(() => {
    setTabSwitches(violationsCount);
  }, [violationsCount]);

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
      let quizData: any = null;
      let isOffline = false;

      if (offlineAssessment) {
        quizData = offlineAssessment;
        isOffline = true;
      } else if (!navigator.onLine) {
        quizData = await localDb.getOfflineAssessmentById(studentId, quizId);
        if (quizData) isOffline = true;
      } else {
        try {
          quizData = await db.getQuizById(quizId);
        } catch (e) {
          quizData = await localDb.getOfflineAssessmentById(studentId, quizId);
          if (quizData) isOffline = true;
          else throw e;
        }
      }

      if (!quizData) throw new Error('Quiz not found');
      if (isOffline) quizData._isOfflineVault = true;

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

      // Check for existing attempt — block if already completed
      try {
        const existingAttempt = await db.getExistingQuizAttempt(studentId, quizId);
        if (existingAttempt) {
          if (existingAttempt.status === 'completed') {
            setBlocked('You have already completed this assessment. Re-taking is not allowed.');
            setQuiz(quizData);
            setLoading(false);
            return;
          }
          // Resume in-progress attempt
          setAttemptId(existingAttempt.id);
        }
      } catch {
        // Non-critical — allow to proceed if check fails
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

      if (quiz?._isOfflineVault === true) {
        const localAttemptId = 'offline_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
        setAttemptId(localAttemptId as any);
        setPhase('in-progress');
        toast.success('Offline assessment started! Stay inside the app.');
        return;
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

      if (quiz._isOfflineVault === true || (typeof attemptId === 'string' && String(attemptId).startsWith('offline_'))) {
        const totalPoints = parseFloat(quiz.total_points) || responses.length;
        const percentage = totalPoints > 0 ? (totalScore / totalPoints) * 100 : 0;

        await localDb.saveOfflineAttempt({
          local_attempt_id: String(attemptId),
          assessment_id: quiz.id,
          student_id: studentId,
          responses,
          score: totalScore,
          percentage,
          tab_switches: tabSwitches,
          status: 'pending_sync',
          completed_at: new Date().toISOString()
        });

        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }

        setResult({ score: totalScore, percentage, totalPoints });
        setPhase('finished');
        toast.success('Offline assessment completed and saved locally! Please sync when online.');
        setIsSubmitting(false);
        return;
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
        <PortalCard className="max-w-md w-full p-6 sm:p-8 text-center space-y-6">
          <div className="w-14 h-14 bg-amber-50 border border-amber-200 rounded-md flex items-center justify-center mx-auto text-amber-600">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-gray-900">Submit Assessment?</h3>
            <p className="text-sm text-gray-500">
              Are you sure you want to finish and submit? You will not be able to edit your answers after confirmation.
            </p>
          </div>
          <div className="flex gap-3 justify-center pt-2">
            <PortalButton variant="secondary" onClick={() => setShowSubmitConfirm(false)}>
              Keep Editing
            </PortalButton>
            <PortalButton
              variant="primary"
              loading={isSubmitting}
              loadingText="Submitting..."
              onClick={() => { setShowSubmitConfirm(false); submitQuiz(); }}
            >
              Confirm & Submit
            </PortalButton>
          </div>
        </PortalCard>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-school-green-200 border-t-school-green-600"></div>
      </div>
    );
  }

  // BLOCKED PAGE (before start / after end)
  if (blocked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <PortalCard className="max-w-lg w-full p-8 text-center space-y-6">
          <div className="w-14 h-14 bg-amber-50 border border-amber-200 rounded-md flex items-center justify-center mx-auto text-amber-600">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-gray-900">{quiz?.title || 'Assessment'}</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{blocked}</p>
          </div>
          <PortalButton variant="secondary" onClick={handleCloseStandalone}>
            Return to Dashboard
          </PortalButton>
        </PortalCard>
      </div>
    );
  }

  // COVER PAGE
  if (phase === 'cover') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <PortalCard className="max-w-2xl w-full p-8 sm:p-10 space-y-8">
          <div className="text-center space-y-2">
            <span className="inline-block px-2.5 py-0.5 rounded-sm text-xs font-semibold bg-school-green-50 text-school-green-700 border border-school-green-200 uppercase tracking-wider">
              {quiz.subject_name || 'General Assessment'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{quiz.title}</h1>
          </div>

          <div className="bg-amber-50/60 border border-amber-200 rounded-md p-6 space-y-4">
            <h3 className="font-semibold text-amber-900 text-sm flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Assessment Instructions
            </h3>
            <div className="text-amber-900/90 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
              {quiz.instructions || "No specific instructions provided. Answer all questions to the best of your ability."}
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-amber-200/80">
              <div>
                <div className="text-[10px] uppercase font-semibold text-amber-700 tracking-wider">Duration</div>
                <div className="font-mono font-bold text-sm text-amber-950 tabular-nums">
                  {quiz.duration_minutes || quiz.time_limit} Minutes
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-semibold text-amber-700 tracking-wider">Total Questions</div>
                <div className="font-mono font-bold text-sm text-amber-950 tabular-nums">
                  {quiz.questions?.length || 0}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs text-gray-500 text-center">
              The assessment runs in locked mode. Screen changes and tab switches are logged.
            </p>
            <PortalButton
              variant="primary"
              className="w-full"
              onClick={handleStartQuiz}
            >
              Start Assessment
            </PortalButton>
            <PortalButton
              variant="secondary"
              className="w-full"
              onClick={handleCloseStandalone}
            >
              Cancel and Return
            </PortalButton>
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
          <div className="max-w-4xl mx-auto p-6 space-y-6">
            <PortalCard className="p-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Answer Review</h2>
                <p className="text-xs text-gray-500 tabular-nums">
                  {result?.score} / {result?.totalPoints} marks ({Math.round(result?.percentage || 0)}%)
                </p>
              </div>
              <PortalButton variant="secondary" onClick={() => setShowAnswerReview(false)}>
                Back to Summary
              </PortalButton>
            </PortalCard>

            {quiz.questions.map((q: any, idx: number) => {
              const studentAnswer = answers[q.id] || '(no answer)';
              const opts = q.options || [];
              const selectedOption = opts.find((o: any) => o.option_text === studentAnswer);
              const correctOption = opts.find((o: any) => o.is_correct);
              const isCorrect = selectedOption?.is_correct || false;
              return (
                <PortalCard
                  key={q.id}
                  className={`p-6 border-l-4 ${isCorrect ? 'border-l-school-green-600' : 'border-l-red-500'}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider tabular-nums">
                      Question {idx + 1}
                    </span>
                    <span className={`text-xs font-bold tabular-nums ${isCorrect ? 'text-school-green-700' : 'text-red-600'}`}>
                      {isCorrect ? `+${q.points || 1} mark` : '0 marks'}
                    </span>
                  </div>
                  <MathText text={q.question_text} className="text-base font-semibold text-gray-900 mb-4" />
                  {q.imageDataUrl && (
                    <div className="mb-4">
                      <img
                        src={q.imageDataUrl}
                        alt="Diagram"
                        className="w-full max-w-md rounded-sm border border-gray-200 cursor-pointer hover:opacity-90"
                        onClick={() => window.open(q.imageDataUrl, '_blank')}
                      />
                    </div>
                  )}
                  {q.diagramDescription && (
                    <div className="mb-4 p-3 bg-amber-50/60 border border-amber-200 rounded-sm text-xs text-amber-900">
                      <span className="font-semibold">Diagram:</span> {q.diagramDescription}
                    </div>
                  )}
                  <div className="space-y-1.5 text-xs pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-500">Your answer:</span>
                      <span className={`font-medium ${isCorrect ? 'text-school-green-800' : 'text-red-700'}`}>
                        {studentAnswer}
                      </span>
                    </div>
                    {!isCorrect && correctOption && (
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-500">Correct answer:</span>
                        <span className="font-medium text-school-green-800">{correctOption.option_text}</span>
                      </div>
                    )}
                  </div>
                </PortalCard>
              );
            })}
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
        <PortalCard className="p-8 sm:p-10 max-w-lg w-full text-center space-y-6">
          {showScore ? (
            <>
              <div className={`w-16 h-16 rounded-md flex items-center justify-center mx-auto border ${
                result?.percentage >= 50
                  ? 'bg-school-green-50 border-school-green-200 text-school-green-700'
                  : 'bg-red-50 border-red-200 text-red-600'
              }`}>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={result?.percentage >= 50 ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} />
                </svg>
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-gray-900">Assessment Completed</h2>
                <p className="text-xs text-gray-500 tabular-nums">
                  You scored {result?.score} out of {result?.totalPoints}
                </p>
                <div className="text-4xl font-extrabold text-school-green-700 tabular-nums py-2">
                  {Math.round(result?.percentage || 0)}%
                </div>
                {tabSwitches > 0 && (
                  <div className="text-[11px] text-red-700 font-semibold uppercase py-1 px-3 bg-red-50 border border-red-200 rounded-sm inline-block tabular-nums">
                    {tabSwitches} security interruption{tabSwitches > 1 ? 's' : ''} logged
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <div className="w-16 h-16 rounded-md flex items-center justify-center mx-auto bg-school-green-50 border border-school-green-200 text-school-green-700">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Submitted Successfully</h2>
              <p className="text-xs text-gray-500">
                Your responses have been saved. Final grades will be visible once published by your course instructor.
              </p>
            </div>
          )}

          {/* Digital Attendance Verification Card */}
          <div className="bg-gray-900 text-white p-5 rounded-md border border-gray-800 space-y-2 text-left">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-school-green-400">Digital Attendance PIN</span>
              <span className="w-2 h-2 rounded-full bg-school-green-400 animate-pulse"></span>
            </div>
            <div className="text-2xl font-bold font-mono tracking-widest text-white py-1.5 border-y border-gray-800 text-center bg-black/40 rounded-sm tabular-nums">
              {`#ASASHS-${((studentId * 137 + (quiz?.id || 1) * 89) % 9000) + 1000}-OK`}
            </div>
            <p className="text-[11px] text-amber-300 leading-relaxed font-medium">
              📦 <strong>Physical Booklet Handover:</strong> Present this Attendance PIN and your Student ID (<strong className="tabular-nums">#{studentId}</strong>) to your invigilator for desk verification.
            </p>
          </div>

          <div className="flex flex-col gap-2.5 pt-2">
            <PortalButton onClick={handleCloseStandalone} variant="secondary" className="w-full">
              Close and Return
            </PortalButton>
            {canReview && (
              <PortalButton onClick={() => setShowAnswerReview(true)} variant="primary" className="w-full">
                Review Questions
              </PortalButton>
            )}
          </div>
        </PortalCard>
      </div>
    );
  }

  // REVIEW PAGE (before final submission)
  if (phase === 'review') {
    const answeredCount = quiz.questions.filter((q: any) => !!answers[q.id]?.trim()).length;

    return (
      <div className="fixed inset-0 z-[100] bg-gray-50 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          <PortalCard className="p-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Review Your Answers</h2>
              <p className="text-xs text-gray-500 tabular-nums">
                {answeredCount} of {quiz.questions.length} questions completed
              </p>
            </div>
            <div className="flex gap-2.5">
              <PortalButton variant="secondary" onClick={() => setPhase('in-progress')}>
                Back to Editing
              </PortalButton>
              <PortalButton
                variant="primary"
                onClick={() => setShowSubmitConfirm(true)}
                loading={isSubmitting}
                loadingText="Submitting..."
              >
                Submit Assessment
              </PortalButton>
            </div>
          </PortalCard>

          {quiz.questions.map((q: any, idx: number) => {
            const answer = answers[q.id] || '';
            const isAnswered = !!answer.trim();
            return (
              <PortalCard
                key={q.id}
                className={`p-6 border-l-4 ${isAnswered ? 'border-l-school-green-600' : 'border-l-gray-300'}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-sm bg-gray-900 text-white flex items-center justify-center text-xs font-bold font-mono tabular-nums">
                      {idx + 1}
                    </span>
                    <span className="text-[10px] font-semibold uppercase text-gray-500 tracking-wider">
                      {q.question_type.replace('_', ' ')}
                    </span>
                    {q.group_id > 0 && (
                      <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded-sm font-semibold">
                        Follow-up
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-gray-400 tabular-nums uppercase">
                    {q.points || 1} {Number(q.points || 1) === 1 ? 'mark' : 'marks'}
                  </span>
                </div>
                <MathText text={q.question_text} className="text-base font-semibold text-gray-900 mb-4" />
                {q.imageDataUrl && (
                  <div className="mb-4">
                    <img
                      src={q.imageDataUrl}
                      alt="Diagram"
                      className="w-full max-w-md rounded-sm border border-gray-200 cursor-pointer hover:opacity-90"
                      onClick={() => window.open(q.imageDataUrl, '_blank')}
                    />
                  </div>
                )}
                {q.diagramDescription && (
                  <div className="mb-4 p-3 bg-amber-50/60 border border-amber-200 rounded-sm text-xs text-amber-900">
                    <span className="font-semibold">Diagram:</span> {q.diagramDescription}
                  </div>
                )}
                {q.question_type === 'multiple_choice' || q.question_type === 'true_false' ? (
                  <div className="flex flex-wrap gap-2">
                    {(q.options || []).map((opt: any) => {
                      const isSelected = answer === opt.option_text;
                      return (
                        <div
                          key={opt.id}
                          className={`px-3 py-1.5 rounded-sm text-xs font-medium border ${
                            isSelected
                              ? 'border-school-green-600 bg-school-green-50 text-school-green-900 font-semibold'
                              : 'border-gray-200 text-gray-600 bg-gray-50/50'
                          }`}
                        >
                          <MathText text={opt.option_text} />
                          {isSelected && <span className="ml-1.5 text-school-green-700 font-bold">✓</span>}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-sm text-sm">
                    {answer ? (
                      <span className="text-gray-900 font-medium">{answer}</span>
                    ) : (
                      <span className="text-gray-400 italic">No answer provided</span>
                    )}
                  </div>
                )}
              </PortalCard>
            );
          })}

          <PortalCard className="p-6 flex justify-between items-center sticky bottom-4">
            <PortalButton variant="secondary" onClick={() => setPhase('in-progress')}>
              Back to Editing
            </PortalButton>
            <PortalButton
              variant="primary"
              onClick={() => setShowSubmitConfirm(true)}
              loading={isSubmitting}
              loadingText="Submitting..."
            >
              Submit Assessment
            </PortalButton>
          </PortalCard>
        </div>
      </div>
    );
  }

  // --- IN-PROGRESS (answering questions) ---
  const isOneByOne = quiz.display_mode === 'one_by_one';

  const renderQuestion = (q: any, idx: number) => (
    <PortalCard key={q.id} className="p-6 sm:p-8 space-y-6 mb-6">
      {(quiz.exam_format === 'theory' || q.question_type === 'theory' || quiz.theory_only === true) && (
        <div className="p-4 bg-purple-900 text-purple-100 rounded-sm border border-purple-800 flex items-start gap-3">
          <div className="text-xl">✍️</div>
          <div>
            <h4 className="font-bold text-white text-xs tracking-wide uppercase">Theory on Paper — Proctor Mode</h4>
            <p className="text-xs text-purple-200 mt-1 leading-relaxed">
              Read questions carefully. Write all solutions and diagrams clearly in the physical answer booklet provided. Submit this session when finished to record your completion time.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-school-green-700 uppercase tracking-wider tabular-nums">
              Question {idx + 1} of {quiz.questions.length}
            </span>
            {q.group_id > 0 && (
              <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded-sm font-semibold">
                Follow-up
              </span>
            )}
          </div>
          <span className="text-xs font-semibold text-gray-400 tabular-nums uppercase">
            {q.points || 1} {Number(q.points || 1) === 1 ? 'mark' : 'marks'}
          </span>
        </div>

        {passageReaderMode ? (
          <div className="bg-amber-50/70 p-5 rounded-sm border border-amber-200">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-amber-800 mb-2">
              📖 High-Contrast Passage Mode
            </div>
            <MathText text={q.question_text} className="text-lg font-serif text-gray-950 leading-relaxed" />
          </div>
        ) : (
          <MathText text={q.question_text} className="text-lg font-semibold text-gray-900 leading-snug" />
        )}

        {(q.imageDataUrl || q.diagram_url) && (
          <div className="mt-3 p-3 rounded-sm bg-gray-50 border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <img
                src={q.imageDataUrl || q.diagram_url}
                alt="Question diagram"
                className="max-h-48 rounded-sm border border-gray-200 cursor-pointer hover:opacity-95"
                onClick={() => window.open(q.imageDataUrl || q.diagram_url, '_blank')}
              />
              <p className="text-[10px] text-gray-400 mt-1">Click image to expand</p>
            </div>
            <button
              onClick={() => setPinnedDiagram(pinnedDiagram === (q.imageDataUrl || q.diagram_url) ? null : (q.imageDataUrl || q.diagram_url))}
              className="min-h-[36px] bg-school-green-50 hover:bg-school-green-100 text-school-green-800 border border-school-green-200 text-xs font-semibold px-3 py-1.5 rounded-sm transition flex items-center gap-1.5 shrink-0"
            >
              <span>📌 {pinnedDiagram === (q.imageDataUrl || q.diagram_url) ? 'Unpin Diagram' : 'Pin to Split-View'}</span>
            </button>
          </div>
        )}
        {q.diagramDescription && (
          <div className="mt-3 p-3 bg-amber-50/60 border border-amber-200 rounded-sm text-xs text-amber-900">
            <span className="font-semibold">Diagram description:</span> {q.diagramDescription}
          </div>
        )}
      </div>

      <div className="space-y-3 pt-4 border-t border-gray-100">
        {q.question_type === 'multiple_choice' || q.question_type === 'true_false' ? (
          <div className="grid grid-cols-1 gap-2.5">
            {(q.options || []).map((option: any) => {
              const isSelected = answers[q.id] === option.option_text;
              return (
                <button
                  key={option.id}
                  onClick={() => setAnswers({ ...answers, [q.id]: option.option_text })}
                  className={`group p-4 rounded-sm border text-left transition-all min-h-[44px] flex items-center ${
                    isSelected
                      ? 'border-school-green-600 bg-school-green-50/60 text-school-green-950 font-medium'
                      : 'border-gray-200 bg-white text-gray-800 hover:border-gray-300 hover:bg-gray-50/50'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border mr-3 flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? 'border-school-green-600 bg-school-green-600'
                      : 'border-gray-400 group-hover:border-gray-500'
                  }`}>
                    {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                  </div>
                  <MathText text={option.option_text} className="text-sm" />
                </button>
              );
            })}
          </div>
        ) : (
          <div>
            <input
              type="text"
              className="w-full min-h-[44px] px-3.5 py-2 bg-white border border-gray-300 rounded-sm focus:border-school-green-600 focus:ring-1 focus:ring-school-green-600 outline-none transition text-sm text-gray-900"
              placeholder="Type your answer here..."
              value={answers[q.id] || ''}
              onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
            />
          </div>
        )}
      </div>
    </PortalCard>
  );

  return (
    <div className="fixed inset-0 z-[100] bg-gray-50 flex flex-col">
      {/* LOCKED HUD */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <span className="bg-school-green-700 text-white px-2.5 py-0.5 rounded-sm font-semibold text-xs uppercase tracking-wider">
            {quiz.subject_name || 'Assessment'}
          </span>
          <h2 className="text-sm font-bold text-gray-900 truncate max-w-[200px] sm:max-w-[320px]">{quiz.title}</h2>
        </div>

        {/* Progress indicator */}
        {isOneByOne && (
          <div className="text-xs text-gray-500 font-mono tabular-nums font-semibold">
            {currentQuestionIdx + 1} / {quiz.questions.length}
          </div>
        )}

        {/* Resource Libraries & Reader Mode Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setShowCalculator(!showCalculator); setShowPeriodicTable(false); }}
            className={`min-h-[36px] px-3 py-1 rounded-sm text-xs font-semibold flex items-center gap-1 transition border ${
              showCalculator
                ? 'bg-amber-500 text-gray-950 border-amber-600'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <span>🖩 Calculator</span>
          </button>
          <button
            onClick={() => { setShowPeriodicTable(!showPeriodicTable); setShowCalculator(false); }}
            className={`min-h-[36px] px-3 py-1 rounded-sm text-xs font-semibold flex items-center gap-1 transition border ${
              showPeriodicTable
                ? 'bg-cyan-500 text-gray-950 border-cyan-600'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <span>🧪 Periodic Table</span>
          </button>
          <button
            onClick={() => setPassageReaderMode(!passageReaderMode)}
            className={`min-h-[36px] px-3 py-1 rounded-sm text-xs font-semibold flex items-center gap-1 transition border ${
              passageReaderMode
                ? 'bg-purple-700 text-white border-purple-800'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <span>📖 Reader</span>
          </button>

          {/* Tabular timer display */}
          <div className={`min-h-[36px] px-3 py-1 rounded-sm font-mono tabular-nums text-sm font-bold flex items-center border ${
            timeLeft < 60
              ? 'bg-red-50 text-red-700 border-red-200 animate-pulse'
              : 'bg-gray-900 text-school-green-400 border-gray-800'
          }`}>
            <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      {/* Linear progress indicator */}
      {isOneByOne && (
        <div className="w-full bg-gray-200 h-1">
          <div
            className="bg-school-green-600 h-1 transition-all duration-300"
            style={{ width: `${((currentQuestionIdx + 1) / quiz.questions.length) * 100}%` }}
          ></div>
        </div>
      )}

      {/* Pinned Diagram Split-View Banner */}
      {pinnedDiagram && (
        <div className="bg-gray-900 text-white p-3 px-6 flex items-center justify-between border-b border-gray-800 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">📌 Pinned Diagram</span>
            <img
              src={pinnedDiagram}
              alt="Pinned"
              className="h-12 rounded-sm border border-gray-700 bg-white cursor-pointer hover:opacity-95"
              onClick={() => window.open(pinnedDiagram, '_blank')}
            />
          </div>
          <button
            onClick={() => setPinnedDiagram(null)}
            className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-sm font-medium border border-gray-700"
          >
            Unpin
          </button>
        </div>
      )}

      {/* Question content - scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 pb-28">
          {isOneByOne ? (
            renderQuestion(quiz.questions[currentQuestionIdx], currentQuestionIdx)
          ) : (
            quiz.questions.map((q: any, idx: number) => renderQuestion(q, idx))
          )}
        </div>
      </div>

      {/* FOOTER ACTIONS - fixed at bottom */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-between items-center shrink-0">
        {isOneByOne ? (
          <PortalButton
            variant="secondary"
            onClick={() => {
              setCurrentQuestionIdx(prev => Math.max(0, prev - 1));
            }}
            disabled={currentQuestionIdx === 0}
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
          >
            Next Question →
          </PortalButton>
        ) : (
          <PortalButton
            variant="primary"
            onClick={() => setPhase('review')}
          >
            Review Answers
          </PortalButton>
        )}
      </div>

      {showCalculator && (
        <div className="fixed bottom-16 right-6 z-50 shadow-lg">
          <ScientificCalculator onClose={() => setShowCalculator(false)} />
        </div>
      )}

      {showPeriodicTable && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6">
          <PeriodicTable onClose={() => setShowPeriodicTable(false)} />
        </div>
      )}
    </div>
  );
}
