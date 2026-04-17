import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { db } from '../../../lib/neon';
import { PortalCard } from '../../components/PortalCard';
import { PortalButton } from '../../components/PortalButton';

interface QuizRunnerProps {
  studentId: number;
  quizId: number;
  onClose: () => void;
}

export function QuizRunner({ studentId, quizId, onClose }: QuizRunnerProps) {
  const [quiz, setQuiz] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false); // For Cover Page
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [tabSwitches, setTabSwitches] = useState(0);

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  // Cheating Detection: Tab Switch
  useEffect(() => {
    if (!isStarting && !isFinished && attemptId) {
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'hidden') {
          setTabSwitches(prev => {
            const newVal = prev + 1;
            toast.error(`⚠️ WARNING: Tab switch detected! (${newVal}) This incident is being logged. Stay on this page.`, { 
              duration: 5000,
              icon: '🚨' 
            });
            return newVal;
          });
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
  }, [isStarting, isFinished, attemptId]);

  // Timer logic
  useEffect(() => {
    if (!isStarting && timeLeft > 0 && !isFinished) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, isFinished, isStarting]);

  const fetchQuiz = async () => {
    setLoading(true);
    try {
      const quizData = await db.getQuizById(quizId);
      if (!quizData) throw new Error('Quiz not found');
      setQuiz(quizData);
      setIsStarting(true); // Start with cover page
      setLoading(false);
    } catch (error) {
      console.error('Failed to load quiz:', error);
      toast.error('Failed to load quiz');
      onClose();
    }
  };

  const handleStartQuiz = async () => {
    try {
      // 1. Fullscreen
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }

      // 2. Start Attempt in DB
      const newAttemptId = await db.startQuizAttempt(studentId, quizId);
      
      setAttemptId(newAttemptId);
      setTimeLeft(quiz.time_limit * 60);
      setIsStarting(false);
      toast.success('Quiz started! Good luck.');
    } catch (error) {
      console.error('Failed to start quiz attempt:', error);
      toast.error('Failed to start quiz. Please check browser permissions.');
    }
  };

  const handleAutoSubmit = () => {
    if (!isFinished) {
      toast.error('Time is up! Submitting your quiz automatically...', { duration: 5000 });
      submitQuiz();
    }
  };

  const submitQuiz = async () => {
    if (isSubmitting || !quiz || !attemptId) return;
    setIsSubmitting(true);

    try {
      // Exit fullscreen if active
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }

      let totalScore = 0;
      const responses = [];

      for (const question of quiz.questions) {
        const studentAnswer = (answers[question.id] || '').trim();
        let isCorrect = false;
        let pointsEarned = 0;

        if (question.question_type === 'mcq' || question.question_type === 'tf') {
          const selectedOption = question.options.find((o: any) => o.option_text === studentAnswer);
          isCorrect = selectedOption?.is_correct || false;
        } else if (question.question_type === 'fill_in') {
          const correctVariations = question.correct_answers.map((a: any) => a.answer_text.toLowerCase().trim());
          isCorrect = correctVariations.includes(studentAnswer.toLowerCase());
        }

        if (isCorrect) {
          pointsEarned = parseFloat(question.points);
          totalScore += pointsEarned;
        }

        responses.push({
          attempt_id: attemptId,
          question_id: question.id,
          response_text: studentAnswer,
          is_correct: isCorrect,
          points_earned: pointsEarned
        });
      }

      for (const resp of responses) {
        await db.submitQuizResponse(resp);
      }

      const percentage = (totalScore / quiz.total_points) * 100;
      await db.completeQuizAttempt(attemptId, totalScore, percentage, tabSwitches);

      setResult({ score: totalScore, percentage, totalPoints: quiz.total_points });
      setIsFinished(true);
      toast.success('Assessment submitted successfully!');
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      toast.error('Failed to submit quiz');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-school-cream-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-school-green-200 border-t-school-green-600"></div>
      </div>
    );
  }

  // COVER PAGE
  if (isStarting) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <PortalCard className="max-w-2xl w-full shadow-2xl">
          <div className="p-8 space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">{quiz.title}</h1>
              <p className="text-school-green-600 font-bold">{quiz.subject_name} | {quiz.class_name}</p>
            </div>

            <div className="bg-amber-50 border-l-4 border-amber-400 p-6 space-y-4 rounded-r-xl">
              <h3 className="font-bold text-amber-800 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Examination Rules & instructions
              </h3>
              <div className="text-amber-900 text-sm whitespace-pre-wrap leading-relaxed">
                {quiz.instructions || "No specific instructions provided. Good luck!"}
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-amber-200">
                <div>
                  <div className="text-[10px] uppercase font-bold text-amber-700">Time Limit</div>
                  <div className="font-bold">{quiz.time_limit} Minutes</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-amber-700">Total Questions</div>
                  <div className="font-bold">{quiz.questions.length}</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-xs text-gray-500 text-center italic">
                By clicking "Start Assessment", you agree to follow the rules above. The browser will enter fullscreen mode.
              </div>
              <PortalButton 
                className="w-full py-4 text-lg font-bold shadow-lg shadow-school-green-100" 
                onClick={handleStartQuiz}
              >
                Start Assessment
              </PortalButton>
              <button 
                onClick={onClose}
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

  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 animate-in fade-in zoom-in duration-500">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center ${result.percentage >= 50 ? 'bg-school-green-100 text-school-green-600' : 'bg-red-100 text-red-600'}`}>
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d={result.percentage >= 50 ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} />
          </svg>
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Assessment Completed!</h2>
          <p className="text-gray-500">You scored {result.score} out of {result.totalPoints}</p>
          <div className="text-5xl font-black text-school-green-600">{Math.round(result.percentage)}%</div>
          {tabSwitches > 0 && (
             <div className="text-xs text-red-500 font-bold uppercase py-1 px-3 bg-red-50 rounded-full inline-block">
               {tabSwitches} TAB SWITCHES LOGGED
             </div>
          )}
        </div>
        <PortalButton onClick={onClose} variant="secondary">Close and Return</PortalButton>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIdx];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 transition-all">
      {/* LOCKED HUD */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-lg rounded-b-2xl px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center space-x-4">
          <div className="bg-school-green-600 text-white px-3 py-1 rounded-lg font-bold text-sm">
            {quiz.subject_name}
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900 truncate max-w-[200px]">{quiz.title}</h2>
          </div>
        </div>

        {/* QUESTION NAVIGATOR BOX */}
        <div className="flex flex-wrap justify-center gap-1.5 p-2 bg-gray-100 rounded-xl max-w-sm">
          {quiz.questions.map((q: any, idx: number) => {
            const isAnswered = !!answers[q.id];
            const isCurrent = idx === currentQuestionIdx;
            return (
              <button
                key={q.id}
                onClick={() => setCurrentQuestionIdx(idx)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                  isCurrent 
                    ? 'bg-school-green-600 text-white ring-4 ring-school-green-100 shadow-md transform scale-110' 
                    : isAnswered 
                      ? 'bg-school-green-100 text-school-green-700' 
                      : 'bg-white text-gray-400 hover:bg-gray-200'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        <div className={`px-5 py-2 rounded-2xl font-mono text-2xl font-black flex items-center shadow-inner ${timeLeft < 60 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-900 text-school-green-400'}`}>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Progress Line */}
      <div className="w-full bg-gray-200 rounded-full h-1">
        <div 
          className="bg-school-green-600 h-1 rounded-full transition-all duration-500" 
          style={{ width: `${((currentQuestionIdx + 1) / quiz.questions.length) * 100}%` }}
        ></div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <PortalCard className="min-h-[450px] overflow-hidden border-none shadow-xl bg-white flex flex-col">
          <div className="p-8 space-y-8 flex-1">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-school-green-600 uppercase tracking-[0.2em]">Question {currentQuestionIdx + 1} of {quiz.questions.length}</span>
                <span className="text-[11px] font-bold text-gray-300 uppercase">{currentQuestion.points} POINTS</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 leading-tight">
                {currentQuestion.question_text}
              </h3>
            </div>

            <div className="space-y-4 pt-6">
              {currentQuestion.question_type === 'mcq' || currentQuestion.question_type === 'tf' ? (
                <div className="grid grid-cols-1 gap-3">
                  {currentQuestion.options.map((option: any) => (
                    <button
                      key={option.id}
                      onClick={() => setAnswers({ ...answers, [currentQuestion.id]: option.option_text })}
                      className={`group p-5 rounded-2xl border-2 text-left transition-all ${
                        answers[currentQuestion.id] === option.option_text 
                          ? 'border-school-green-600 bg-school-green-50 text-school-green-900 shadow-md' 
                          : 'border-gray-50 bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center transition-colors ${answers[currentQuestion.id] === option.option_text ? 'border-school-green-600 bg-school-green-600' : 'border-gray-300 group-hover:border-gray-400'}`}>
                          {answers[currentQuestion.id] === option.option_text && (
                            <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                          )}
                        </div>
                        <span className="text-lg font-medium">{option.option_text}</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <input 
                    type="text"
                    className="w-full p-6 bg-gray-50 border-2 border-gray-50 rounded-2xl focus:border-school-green-600 focus:bg-white outline-none transition-all text-xl font-medium"
                    placeholder="Type your final answer here..."
                    value={answers[currentQuestion.id] || ''}
                    autoFocus
                    onChange={(e) => setAnswers({ ...answers, [currentQuestion.id]: e.target.value })}
                    onKeyPress={(e) => e.key === 'Enter' && currentQuestionIdx < quiz.questions.length - 1 && setCurrentQuestionIdx(prev => prev + 1)}
                  />
                  <div className="p-4 bg-blue-50 text-blue-700 rounded-xl flex items-start">
                    <svg className="w-4 h-4 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs italic">Grading is flexible for fill-in questions, but ensure your spelling is as accurate as possible for the best score.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </PortalCard>

        {/* FOOTER ACTIONS */}
        <div className="flex justify-between items-center py-4">
          <PortalButton
            variant="secondary"
            onClick={() => {
              setCurrentQuestionIdx(prev => Math.max(0, prev - 1));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            disabled={currentQuestionIdx === 0}
            className="px-8"
          >
            ← Previous
          </PortalButton>
          
          {currentQuestionIdx === quiz.questions.length - 1 ? (
            <PortalButton
              variant="primary"
              onClick={() => {
                if (window.confirm('Are you sure you want to finish and submit your quiz?')) {
                  submitQuiz();
                }
              }}
              disabled={isSubmitting}
              className="px-12 py-4 bg-school-green-700 shadow-xl"
            >
              {isSubmitting ? 'Submitting...' : 'Finish & Submit Assessment'}
            </PortalButton>
          ) : (
            <PortalButton
              variant="primary"
              onClick={() => {
                setCurrentQuestionIdx(prev => prev + 1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-12"
            >
              Next Question →
            </PortalButton>
          )}
        </div>
      </div>
    </div>
  );
}
