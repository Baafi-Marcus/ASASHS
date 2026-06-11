import React, { useState, useEffect } from 'react';
import { StudentProfile } from './StudentProfile';
import { StudentDownloads } from './StudentDownloads';
import { StudentMessages } from './StudentMessages';
import db from '../../../lib/neon';

interface DemoQuestion {
  id: number;
  question_text: string;
  options: { id: number; option_text: string; is_correct: boolean }[];
}

const InlineQuizTaker: React.FC<{ quiz: any; onBack: () => void }> = ({ quiz, onBack }) => {
  const [questions, setQuestions] = useState<DemoQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    db.getQuizById(quiz.id).then((data: any) => {
      if (data?.questions) setQuestions(data.questions);
    });
  }, [quiz.id]);

  const handleAnswer = (questionId: number, optionIdx: number) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [questionId]: optionIdx }));
  };

  const handleSubmit = () => {
    let correct = 0;
    for (const q of questions) {
      const chosen = answers[q.id];
      if (chosen !== undefined && q.options[chosen]?.is_correct) correct++;
    }
    setScore(correct);
    setSubmitted(true);
  };

  if (questions.length === 0) {
    return <div className="text-center py-12 text-gray-500">Loading questions...</div>;
  }

  if (submitted) {
    const total = questions.length;
    const pct = Math.round((score / total) * 100);
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto text-center space-y-4">
        <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${pct >= 50 ? 'bg-green-100' : 'bg-red-100'}`}>
          <span className="text-4xl">{pct >= 50 ? '🎉' : '😅'}</span>
        </div>
        <h2 className="text-2xl font-bold">Quiz Complete!</h2>
        <p className="text-lg">You scored <strong>{score}/{total}</strong> ({pct}%)</p>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div className={`h-3 rounded-full transition-all ${pct >= 50 ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
        </div>
        <div className="text-left space-y-3 mt-6">
          {questions.map((q, i) => {
            const chosen = answers[q.id];
            const isCorrect = chosen !== undefined && q.options[chosen]?.is_correct;
            return (
              <div key={q.id} className={`p-3 rounded-lg border ${isCorrect ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
                <p className="font-medium">{i + 1}. {q.question_text}</p>
                <p className="text-sm mt-1">
                  Your answer: {chosen !== undefined ? q.options[chosen]?.option_text : 'None'} {isCorrect ? '✅' : '❌'}
                </p>
                {!isCorrect && (
                  <p className="text-sm text-green-700">Correct: {q.options.find(o => o.is_correct)?.option_text}</p>
                )}
              </div>
            );
          })}
        </div>
        <button onClick={onBack} className="mt-4 px-6 py-2 bg-school-green-600 text-white rounded-xl font-bold hover:bg-school-green-700">Back to Quizzes</button>
      </div>
    );
  }

  const q = questions[currentIdx];
  if (!q) return null;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <span className="text-sm text-gray-500">Question {currentIdx + 1} of {questions.length}</span>
        <span className="text-sm font-medium text-school-green-600">{Object.keys(answers).length} answered</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div className="h-2 bg-school-green-500 rounded-full transition-all" style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }} />
      </div>
      <h3 className="text-lg font-bold mb-6">{q.question_text}</h3>
      <div className="space-y-3">
        {q.options.map((opt, oi) => (
          <button
            key={oi}
            onClick={() => handleAnswer(q.id, oi)}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
              answers[q.id] === oi ? 'border-school-green-500 bg-school-green-50' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <span className="font-medium">{String.fromCharCode(65 + oi)}. </span>
            {opt.option_text}
          </button>
        ))}
      </div>
      <div className="flex justify-between mt-8">
        <button
          onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
          disabled={currentIdx === 0}
          className="px-6 py-2 bg-gray-100 rounded-xl disabled:opacity-30"
        >
          Previous
        </button>
        {currentIdx < questions.length - 1 ? (
          <button onClick={() => setCurrentIdx(currentIdx + 1)} className="px-6 py-2 bg-school-green-600 text-white rounded-xl font-bold hover:bg-school-green-700">
            Next
          </button>
        ) : (
          <button onClick={handleSubmit} className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700">
            Submit Quiz
          </button>
        )}
      </div>
    </div>
  );
};

const TestStudentView: React.FC<{ activeTab: string; setActiveTab: (t: string) => void; fullName: string }> = ({ activeTab, fullName }) => {
  const [demoQuizzes, setDemoQuizzes] = useState<any[]>([]);
  const [demoExams, setDemoExams] = useState<any[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);

  useEffect(() => {
    db.getQuizzes({}).then((quizzes: any[]) => {
      setDemoQuizzes((quizzes || []).filter((q: any) => q.title?.includes('[DEMO]')));
    }).catch(() => {});
    db.getGeneralExams().then((exams: any[]) => {
      setDemoExams((exams || []).filter((e: any) => e.title?.includes('[DEMO]')));
    }).catch(() => {});
  }, []);

  if (selectedQuiz) {
    return (
      <div className="p-6">
        <InlineQuizTaker quiz={selectedQuiz} onBack={() => setSelectedQuiz(null)} />
      </div>
    );
  }

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
                <p className="text-sm text-gray-500">available in E-Learning</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="text-3xl mb-2">📋</div>
                <h3 className="font-bold text-gray-800">Demo Exams</h3>
                <p className="text-2xl font-black text-school-green-600 mt-2">{demoExams.length}</p>
                <p className="text-sm text-gray-500">available in School Exams</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="text-3xl mb-2">📊</div>
                <h3 className="font-bold text-gray-800">Demo Grades</h3>
                <p className="text-sm text-gray-500 mt-2">Take a quiz or exam to see results</p>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
              <strong>Test Mode:</strong> You are viewing a simulated student experience. Quiz and exam results are visible to you only.
            </div>
          </div>
        );
      case 'profile':
        return <StudentProfile student={{ id: '0', studentId: 'TEST-STU-001', fullName, course: 'Demo Programme', className: 'Demo Class', form: 1 } as any} onLogout={() => {}} />;
      case 'grades':
        return (
          <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-8 text-center">
            <div className="text-5xl mb-4">📈</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Demo Grades</h3>
            <p className="text-gray-500">Take a demo quiz from the E-Learning tab or a demo exam from School Exams to see your results here.</p>
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
      case 'downloads':
        return <StudentDownloads />;
      case 'messages':
        return <StudentMessages />;
      case 'exams':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">Demo School Exams</h2>
            {demoExams.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center text-gray-500 border-2 border-dashed border-gray-300">
                No demo exams available. Ask an admin to seed them.
              </div>
            ) : (
              <div className="grid gap-4">
                {demoExams.map((exam, i) => (
                  <div key={i} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-gray-800">{exam.title}</h3>
                      <p className="text-sm text-gray-500">{exam.subject_name} — {exam.class_name}</p>
                    </div>
                    <button
                      onClick={() => setSelectedQuiz({ id: exam.quiz_id, title: exam.title, subject_name: exam.subject_name })}
                      className="px-4 py-2 bg-school-green-600 text-white rounded-lg font-bold hover:bg-school-green-700"
                      disabled={!exam.quiz_id}
                    >
                      Take Exam
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'voting':
        return (
          <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-8 text-center">
            <div className="text-5xl mb-4">🗳️</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Demo Voting</h3>
            <p className="text-gray-500">Voting is read-only in demo mode. Election results and candidates can be viewed by an admin.</p>
          </div>
        );
      case 'elearning':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">Demo E-Learning Quizzes</h2>
            {demoQuizzes.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center text-gray-500 border-2 border-dashed border-gray-300">
                No demo quizzes available. Ask an admin to seed them.
              </div>
            ) : (
              <div className="grid gap-4">
                {demoQuizzes.map((quiz, i) => (
                  <div key={i} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-gray-800">{quiz.title}</h3>
                      <p className="text-sm text-gray-500">{quiz.subject_name}</p>
                    </div>
                    <button
                      onClick={() => setSelectedQuiz(quiz)}
                      className="px-4 py-2 bg-school-green-600 text-white rounded-lg font-bold hover:bg-school-green-700"
                    >
                      Take Quiz
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
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
